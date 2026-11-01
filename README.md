# Dropout Risk Prediction for First-Generation Students in Rural Schools

## Stack
React + FastAPI + MySQL + Scikit-learn + Email OTP + Twilio SMS.

## 1. MySQL
Create the database:

CREATE DATABASE dropout_risk_db;

Tables are created automatically by FastAPI.

## 2. Backend
Copy backend/.env.example to backend/.env and set your MySQL password.

For password reset email, use Gmail SMTP with a Gmail App Password. Do NOT use your normal Gmail password.

Windows:

cd backend
python -m venv venv
venv\\Scripts\\activate
pip install -r requirements.txt
python train_model.py
uvicorn app.main:app --reload

API: http://127.0.0.1:8000
Swagger: http://127.0.0.1:8000/docs

## 3. Frontend
Open another terminal:

cd frontend
npm install
npm run dev

Open http://localhost:5173

## 4. Password reset
Forgot Password -> registered email -> 6-digit OTP -> verify -> new password.
The OTP is stored hashed in MySQL and expires after 10 minutes. The actual OTP is sent by SMTP to the user's registered email.

## 5. SMS
Twilio is included. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER to .env when you are ready. Without those values, the system returns not_configured instead of pretending the SMS was sent.
