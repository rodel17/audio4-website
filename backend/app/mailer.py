import logging
import smtplib
from email.message import EmailMessage

from .config import SMTP_FROM, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_STARTTLS, SMTP_USER

log = logging.getLogger(__name__)


def send_mail(to: list[str], subject: str, body: str, reply_to: str = "") -> None:
    """Send a plain-text email. Does nothing (beyond a log line) when SMTP isn't configured."""
    recipients = [t for t in to if t]
    if not recipients:
        return
    if not SMTP_HOST:
        log.info("SMTP not configured; skipped email %r to %s", subject, recipients)
        return
    msg = EmailMessage()
    msg["From"] = SMTP_FROM or SMTP_USER
    msg["To"] = ", ".join(recipients)
    msg["Subject"] = subject
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content(body)
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as smtp:
            if SMTP_STARTTLS:
                smtp.starttls()
            if SMTP_USER:
                smtp.login(SMTP_USER, SMTP_PASSWORD)
            smtp.send_message(msg)
    except (OSError, smtplib.SMTPException):
        log.exception("Failed to send email %r", subject)
