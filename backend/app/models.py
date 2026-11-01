from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Text
)

from .database import Base


# ============================================================
# USER
# ============================================================

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    full_name = Column(
        String(120),
        nullable=False
    )

    email = Column(
        String(190),
        unique=True,
        index=True,
        nullable=False
    )

    phone = Column(
        String(30),
        nullable=True
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    role = Column(
        String(30),
        default="teacher"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ============================================================
# PASSWORD OTP
# ============================================================

class PasswordOTP(Base):
    __tablename__ = "password_otps"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    email = Column(
        String(190),
        nullable=False,
        index=True
    )

    otp = Column(
        String(10),
        nullable=False
    )

    otp_hash = Column(
        String(255),
        nullable=False
    )

    expires_at = Column(
        DateTime,
        nullable=False
    )

    used = Column(
        Integer,
        default=0,
        nullable=False
    )

    attempts = Column(
        Integer,
        default=0,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ============================================================
# STUDENT
# ============================================================

class Student(Base):
    __tablename__ = "students"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    student_id = Column(
        String(50),
        unique=True,
        index=True,
        nullable=False
    )

    name = Column(
        String(120),
        nullable=False
    )

    age = Column(
        Integer,
        nullable=False
    )

    gender = Column(
        String(30),
        nullable=True
    )

    attendance = Column(
        Float,
        nullable=False
    )

    previous_marks = Column(
        Float,
        nullable=False
    )

    first_generation = Column(
        Integer,
        default=0
    )

    backlogs = Column(
        Integer,
        default=0
    )

    financial_difficulty = Column(
        Integer,
        default=0
    )

    family_income = Column(
        Float,
        nullable=True
    )

    family_size = Column(
        Integer,
        nullable=True
    )

    parent_education = Column(
        String(100),
        nullable=True
    )

    phone = Column(
        String(30),
        nullable=True
    )

    risk_score = Column(
        Float,
        nullable=True
    )

    risk_level = Column(
        String(30),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


# ============================================================
# INTERVENTION
# ============================================================

class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    student_id = Column(
        Integer,
        nullable=False
    )

    intervention_type = Column(
        String(100),
        nullable=False
    )

    assigned_to = Column(
        String(120),
        nullable=True
    )

    status = Column(
        String(30),
        default="Active"
    )

    notes = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ============================================================
# SMS LOG
# ============================================================

class SMSLog(Base):
    __tablename__ = "sms_logs"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    recipient = Column(
        String(50),
        nullable=False
    )

    message = Column(
        Text,
        nullable=False
    )

    status = Column(
        String(50),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )