"""Utilities for sending payment-related emails."""

import logging
from typing import Optional

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone


logger = logging.getLogger(__name__)

ADMIN_EMAIL = "excmhsian@gmail.com"

def _get_from_email() -> str:
    """Return a sensible from email address with fallbacks."""
    for attr in ("DEFAULT_FROM_EMAIL", "EMAIL_HOST_USER"):
        value = getattr(settings, attr, None)
        if value:
            return value
    return "no-reply@rbmbians.com"


def send_email(payment) -> bool:
    """Send a notification email for a newly created payment.

    Returns True on success, False otherwise. Any exception is logged and
    swallowed so payment creation flow can proceed without interruption.
    """

    if payment is None:
        return False

    user = getattr(payment, "user", None)
    payment_type = getattr(payment, "payment_type", "").lower()

    if payment_type == "registration":
        subject = "New Registration Payment Received"
    elif payment_type == "donation":
        subject = "New Donation Payment Received"
    else:
        subject = "New Payment Received"

    user_name = getattr(user, "name", "Unknown") if user else "Unknown"
    user_phone = getattr(user, "phone", "Unknown") if user else "Unknown"
    user_batch = getattr(user, "batch", "Unknown") if user else "Unknown"

    created_at = getattr(payment, "created_at", None)
    created_at_str = (
        timezone.localtime(created_at).strftime("%Y-%m-%d %H:%M:%S %Z")
        if created_at
        else "Unknown"
    )

    body = (
        "New payment has been recorded at RBHS Reunion.\n\n"
        "User Details:\n"
        f"- Name: {user_name}\n"
        f"- Phone: {user_phone}\n"
        f"- Batch: {user_batch}\n\n"
        "Payment Details:\n"
        f"- Type: {payment.payment_type}\n"
        f"- Amount: {payment.amount}\n"
        f"- Method: {payment.method}\n"
        f"- Transaction ID: {payment.transaction_id}\n"
        f"- Approved: {payment.payment_approved}\n"
        f"- Created At: {created_at_str}\n"
    )

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=_get_from_email(),
            recipient_list=[ADMIN_EMAIL],
            fail_silently=False,
        )
        return True
    except Exception:
        logger.exception(
            "Failed to send payment notification email for payment id=%s",
            getattr(payment, "id", None),
        )
        return False

