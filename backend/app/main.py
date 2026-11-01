from datetime import datetime, timedelta
import secrets

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import (
    User,
    PasswordOTP,
    Student,
    Intervention,
    SMSLog
)

from .security import (
    hash_password,
    verify_password,
    token,
    decode,
    create_access_token
)

from .services import send_otp_email
from .services_sms import send_sms
from .ml import predict_dropout


# ============================================================
# DATABASE
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="Dropout Risk Prediction API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


bearer = HTTPBearer()


# ============================================================
# AUTHENTICATION
# ============================================================

def current(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db)
):
    try:
        payload = decode(creds.credentials)

        uid = int(payload["sub"])

    except (
        JWTError,
        ValueError,
        KeyError,
        TypeError
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user = db.get(User, uid)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


# ============================================================
# PYDANTIC MODELS
# ============================================================

class Signup(BaseModel):
    full_name: str
    email: EmailStr
    phone: str | None = None
    password: str = Field(min_length=8)
    role: str = "teacher"


class Login(BaseModel):
    email: EmailStr
    password: str


class EmailOnly(BaseModel):
    email: EmailStr


class OTP(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)


class Reset(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=8)


class StudentIn(BaseModel):
    student_id: str
    name: str
    age: int
    gender: str | None = None
    attendance: float = Field(ge=0, le=100)
    previous_marks: float = Field(ge=0, le=100)
    first_generation: int = Field(ge=0, le=1)
    backlogs: int = Field(ge=0)
    financial_difficulty: int = Field(ge=0, le=1)
    family_income: float = 0
    family_size: int = 1
    parent_education: str | None = None
    phone: str | None = None


class PredictionRequest(BaseModel):
    attendance: float = Field(..., ge=0, le=100)
    previous_marks: float = Field(..., ge=0, le=100)
    first_generation: int = Field(..., ge=0, le=1)
    backlogs: int = Field(..., ge=0)
    financial_difficulty: int = Field(..., ge=0, le=1)
    family_income: float = Field(..., ge=0)
    family_size: int = Field(..., ge=1)


class InterventionIn(BaseModel):
    student_id: int
    intervention_type: str
    assigned_to: str | None = None
    notes: str | None = None


class SMSIn(BaseModel):
    phone: str = Field(min_length=8, max_length=16)
    message: str = Field(min_length=1, max_length=1500)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Dropout Risk Prediction API is running"
    }


# ============================================================
# SIGNUP
# ============================================================

@app.post("/api/auth/signup")
def signup(
    x: Signup,
    db: Session = Depends(get_db)
):

    email = x.email.lower().strip()

    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user = User(
        full_name=x.full_name,
        email=email,
        phone=x.phone,
        password_hash=hash_password(x.password),
        role=x.role
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to create account"
        )

    return {
        "success": True,
        "message": "Account created successfully"
    }


# ============================================================
# LOGIN
# ============================================================

@app.post("/api/auth/login")
def login(
    x: Login,
    db: Session = Depends(get_db)
):

    email = x.email.lower().strip()

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        x.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # IMPORTANT:
    # Generate JWT using create_access_token.
    # Do NOT use token(user.id).
    access_token = create_access_token({
        "sub": str(user.id)
    })

    return {
        "success": True,
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        }
    }


# ============================================================
# GET LATEST OTP
# ============================================================

def get_otp(
    email: str,
    db: Session
):

    return db.query(PasswordOTP).filter(
        PasswordOTP.email == email.lower(),
        PasswordOTP.used == False
    ).order_by(
        PasswordOTP.created_at.desc()
    ).first()


# ============================================================
# FORGOT PASSWORD
# ============================================================

@app.post("/api/auth/forgot-password")
def forgot(
    x: EmailOnly,
    db: Session = Depends(get_db)
):

    email = x.email.lower().strip()

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        return {
            "message": "If the email is registered, an OTP has been sent."
        }

    # Invalidate old OTPs
    old_otps = db.query(PasswordOTP).filter(
        PasswordOTP.user_id == user.id,
        PasswordOTP.used == False
    ).all()

    for old_otp in old_otps:
        old_otp.used = True

    # Generate new OTP
    otp = f"{secrets.randbelow(1000000):06d}"

    otp_hash = hash_password(otp)

    expires_at = (
        datetime.utcnow()
        + timedelta(minutes=10)
    )

    record = PasswordOTP(
        user_id=user.id,
        email=user.email,
        otp=otp,
        otp_hash=otp_hash,
        expires_at=expires_at,
        used=False,
        attempts=0
    )

    try:
        db.add(record)
        db.commit()
        db.refresh(record)

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )

    # Send OTP email
    try:
        send_otp_email(
            user.email,
            otp
        )

    except Exception as e:

        db.delete(record)
        db.commit()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to send OTP email: {str(e)}"
        )

    return {
        "success": True,
        "message": "OTP sent to your registered email address."
    }


# ============================================================
# VERIFY OTP
# ============================================================

@app.post("/api/auth/verify-otp")
def verify_otp(
    x: OTP,
    db: Session = Depends(get_db)
):

    email = x.email.lower().strip()

    record = get_otp(
        email,
        db
    )

    if not record:
        raise HTTPException(
            status_code=400,
            detail="OTP expired or not found"
        )

    # Check expiration
    if record.expires_at < datetime.utcnow():

        record.used = True
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="OTP expired"
        )

    # Check attempts
    if record.attempts >= 5:

        record.used = True
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Too many OTP attempts"
        )

    # Increase attempt count
    record.attempts += 1

    # Verify OTP
    valid = verify_password(
        x.otp,
        record.otp_hash
    )

    if not valid:

        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    db.commit()

    return {
        "success": True,
        "message": "OTP verified successfully"
    }


# ============================================================
# RESET PASSWORD
# ============================================================

@app.post("/api/auth/reset-password")
def reset_password(
    x: Reset,
    db: Session = Depends(get_db)
):

    email = x.email.lower().strip()

    user = db.query(User).filter(
        User.email == email
    ).first()

    record = get_otp(
        email,
        db
    )

    if not user or not record:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset request"
        )

    # Check expiration
    if record.expires_at < datetime.utcnow():

        record.used = True
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="OTP expired"
        )

    # Check attempts
    if record.attempts >= 5:

        record.used = True
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Too many OTP attempts"
        )

    # Verify OTP
    if not verify_password(
        x.otp,
        record.otp_hash
    ):

        record.attempts += 1
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    # Change password
    user.password_hash = hash_password(
        x.new_password
    )

    # OTP cannot be reused
    record.used = True

    try:
        db.commit()

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to reset password"
        )

    return {
        "success": True,
        "message": "Password reset successfully"
    }


# ============================================================
# DASHBOARD
# ============================================================

@app.get("/api/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    user=Depends(current)
):

    total = db.query(Student).count()

    high = db.query(Student).filter(
        Student.risk_level == "High"
    ).count()

    medium = db.query(Student).filter(
        Student.risk_level == "Medium"
    ).count()

    low = db.query(Student).filter(
        Student.risk_level == "Low"
    ).count()

    return {
        "total_students": total,

        "high_risk": high,

        "medium_risk": medium,

        "low_risk": low,

        "high_percentage": (
            round(high / total * 100, 2)
            if total else 0
        ),

        "medium_percentage": (
            round(medium / total * 100, 2)
            if total else 0
        ),

        "low_percentage": (
            round(low / total * 100, 2)
            if total else 0
        )
    }


# ============================================================
# GET STUDENTS
# ============================================================

@app.get("/api/students")
def students(
    db: Session = Depends(get_db)
):

    student_list = db.query(Student).order_by(
        Student.id.desc()
    ).all()

    return [
        {
            "id": student.id,
            "student_id": student.student_id,
            "name": student.name,
            "age": student.age,
            "gender": student.gender,
            "attendance": student.attendance,
            "previous_marks": student.previous_marks,
            "first_generation": student.first_generation,
            "backlogs": student.backlogs,
            "financial_difficulty": student.financial_difficulty,
            "family_income": student.family_income,
            "family_size": student.family_size,
            "parent_education": student.parent_education,
            "phone": student.phone,
            "risk_score": student.risk_score,
            "risk_level": student.risk_level
        }
        for student in student_list
    ]


# ============================================================
# ADD STUDENT
# ============================================================

@app.post("/api/students")
def add_student(
    x: StudentIn,
    db: Session = Depends(get_db),
    user=Depends(current)
):

    existing_student = db.query(Student).filter(
        Student.student_id == x.student_id
    ).first()

    if existing_student:

        raise HTTPException(
            status_code=400,
            detail="Student ID already exists"
        )

    data = x.model_dump()

    # ========================================================
    # ML PREDICTION
    # ========================================================

    result = predict_dropout(
        attendance=data["attendance"],
        previous_marks=data["previous_marks"],
        first_generation=data["first_generation"],
        backlogs=data["backlogs"],
        financial_difficulty=data["financial_difficulty"],
        family_income=data["family_income"],
        family_size=data["family_size"]
    )

    risk_score = result["risk_percentage"]

    risk_level = result["risk_level"].replace(
        " Risk",
        ""
    )

    # ========================================================
    # CREATE STUDENT
    # ========================================================

    student = Student(
        **data,
        risk_score=risk_score,
        risk_level=risk_level
    )

    try:

        db.add(student)
        db.commit()
        db.refresh(student)

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to save student: {str(e)}"
        )

    return {
        "success": True,
        "message": "Student saved successfully",
        "student_id": student.id,
        "risk": result
    }


# ============================================================
# DELETE STUDENT
# ============================================================

@app.delete("/api/students/{student_id}")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    user=Depends(current)
):

    # Find the student by database primary-key ID
    student = db.get(
        Student,
        student_id
    )

    if not student:

        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    try:

        # Remove interventions first
        db.query(Intervention).filter(
            Intervention.student_id == student.id
        ).delete(
            synchronize_session=False
        )

        # Remove student
        db.delete(student)
        db.commit()

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete student: {str(e)}"
        )

    return {
        "success": True,
        "message": "Student deleted successfully",
        "student_id": student_id
    }


# ============================================================
# DROPOUT RISK PREDICTION
# ============================================================

@app.post("/api/predict")
def predict_risk(
    data: PredictionRequest,
    user=Depends(current)
):

    result = predict_dropout(
        attendance=data.attendance,
        previous_marks=data.previous_marks,
        first_generation=data.first_generation,
        backlogs=data.backlogs,
        financial_difficulty=data.financial_difficulty,
        family_income=data.family_income,
        family_size=data.family_size
    )

    return result


# ============================================================
# INTERVENTIONS
# ============================================================

@app.get("/api/interventions")
def interventions(
    db: Session = Depends(get_db),
    user=Depends(current)
):

    intervention_list = db.query(
        Intervention
    ).order_by(
        Intervention.id.desc()
    ).all()

    return [
        {
            column.name: getattr(
                intervention,
                column.name
            )
            for column in Intervention.__table__.columns
        }
        for intervention in intervention_list
    ]


@app.post("/api/interventions")
def add_intervention(
    x: InterventionIn,
    db: Session = Depends(get_db),
    user=Depends(current)
):

    if not db.get(
        Student,
        x.student_id
    ):

        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    intervention = Intervention(
        **x.model_dump()
    )

    try:

        db.add(intervention)
        db.commit()
        db.refresh(intervention)

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to create intervention: {str(e)}"
        )

    return {
        "success": True,
        "message": "Intervention created"
    }


# ============================================================
# SMS
# ============================================================

@app.post("/api/sms")
def sms(
    x: SMSIn,
    db: Session = Depends(get_db),
    user=Depends(current)
):
    phone = x.phone.strip()
    message = x.message.strip()

    if not phone or not message:
        raise HTTPException(
            status_code=400,
            detail="Phone number and message are required."
        )

    try:
        # Send the SMS through the configured provider.
        result = send_sms(phone, message)
        status = result.get("status", "queued")

    except (ValueError, RuntimeError) as exc:
        # Record failed attempts without exposing credentials.
        try:
            db.add(SMSLog(
                recipient=phone,
                message=message,
                status="failed"
            ))
            db.commit()
        except Exception:
            db.rollback()

        raise HTTPException(
            status_code=502,
            detail=str(exc)
        ) from exc

    except Exception as exc:
        try:
            db.add(SMSLog(
                recipient=phone,
                message=message,
                status="failed"
            ))
            db.commit()
        except Exception:
            db.rollback()

        raise HTTPException(
            status_code=502,
            detail="The SMS provider could not process the request. Check the backend logs and gateway configuration."
        ) from exc

    # Provider accepted the request; now save it in the SMS history.
    try:
        db.add(SMSLog(
            recipient=phone,
            message=message,
            status=status
        ))
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="The SMS provider accepted the request, but the database log could not be saved."
        ) from exc

    return result


# ============================================================
# SMS LOGS
# ============================================================

@app.get("/api/sms/logs")
def sms_logs(
    db: Session = Depends(get_db),
    user=Depends(current)
):

    logs = db.query(
        SMSLog
    ).order_by(
        SMSLog.id.desc()
    ).limit(100).all()

    return [
        {
            column.name: getattr(
                log,
                column.name
            )
            for column in SMSLog.__table__.columns
        }
        for log in logs
    ]


# ============================================================
# REPORT SUMMARY
# ============================================================

@app.get("/api/reports/summary")
def report(
    db: Session = Depends(get_db),
    user=Depends(current)
):

    return {

        "students": db.query(
            Student
        ).count(),

        "high": db.query(
            Student
        ).filter(
            Student.risk_level == "High"
        ).count(),

        "medium": db.query(
            Student
        ).filter(
            Student.risk_level == "Medium"
        ).count(),

        "low": db.query(
            Student
        ).filter(
            Student.risk_level == "Low"
        ).count(),

        "interventions": db.query(
            Intervention
        ).count()
    }