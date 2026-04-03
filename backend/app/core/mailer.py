import smtplib
from email.message import EmailMessage

from app.core.config import settings


def send_otp_email(to_email: str, otp_code: str) -> bool:
    if not settings.smtp_host or not settings.smtp_from_email:
        return False

    message = EmailMessage()
    message["Subject"] = "OmniScript Password Reset OTP"
    message["From"] = settings.smtp_from_email
    message["To"] = to_email
    message.set_content(
        "Your OmniScript verification code is: "
        f"{otp_code}\n\n"
        f"This code will expire in {settings.otp_expire_minutes} minutes."
    )

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as smtp:
        smtp.starttls()
        if settings.smtp_username and settings.smtp_password:
            smtp.login(settings.smtp_username, settings.smtp_password)
        smtp.send_message(message)

    return True
