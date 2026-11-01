import os,smtplib,secrets
from email.message import EmailMessage
from dotenv import load_dotenv
load_dotenv()
def send_otp_email(to,otp):
    host=os.getenv('SMTP_HOST'); user=os.getenv('SMTP_USER'); password=os.getenv('SMTP_PASSWORD'); sender=os.getenv('SMTP_FROM',user)
    if not host or not user or not password: raise RuntimeError('SMTP is not configured in backend/.env')
    m=EmailMessage(); m['Subject']='Dropout Risk Prediction - Password Reset OTP'; m['From']=sender; m['To']=to
    m.set_content(f'Your password reset OTP is {otp}. It is valid for 10 minutes. If you did not request this, ignore this email.')
    with smtplib.SMTP(host,int(os.getenv('SMTP_PORT','587')),timeout=20) as s: s.starttls(); s.login(user,password); s.send_message(m)
def send_sms(phone,message):
    sid=os.getenv('TWILIO_ACCOUNT_SID'); token=os.getenv('TWILIO_AUTH_TOKEN'); frm=os.getenv('TWILIO_PHONE_NUMBER')
    if not all([sid,token,frm]): return {'status':'not_configured','message':'Twilio is not configured'}
    from twilio.rest import Client
    r=Client(sid,token).messages.create(body=message,from_=frm,to=phone)
    return {'status':'sent','sid':r.sid}
