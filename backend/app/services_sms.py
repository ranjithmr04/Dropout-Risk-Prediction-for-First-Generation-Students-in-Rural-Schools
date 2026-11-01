
import os
import re

from dotenv import load_dotenv
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

load_dotenv()


def send_sms(phone: str, message: str) -> dict:
    phone = (phone or "").strip()
    message = (message or "").strip()

    # International phone format, e.g. +919876543210
    if not re.fullmatch(r"\+[1-9]\d{7,14}", phone):
        raise ValueError(
            "Enter a valid international phone number, "
            "for example +919876543210."
        )

    if not message:
        raise ValueError("Message cannot be empty.")

    if len(message) > 1500:
        raise ValueError("Message must be 1500 characters or fewer.")

    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
    sender = os.getenv("TWILIO_PHONE_NUMBER", "").strip()

    if not account_sid or not auth_token or not sender:
        raise RuntimeError(
            "SMS gateway is not configured. Check backend/.env."
        )

    try:
        client = Client(account_sid, auth_token)

        result = client.messages.create(
            to=phone,
            from_=sender,
            body=message,
        )

        return {
            "success": True,
            "status": result.status or "queued",
            "message": "SMS request accepted by the provider.",
            "provider_message_id": result.sid,
            "recipient": phone,
        }

    except TwilioRestException as exc:
        raise RuntimeError(
            f"Twilio error {exc.code or 'unknown'}: {exc.msg}"
        ) from exc
