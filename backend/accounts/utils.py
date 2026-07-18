from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

def send_password_reset_email(user):
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
    
    subject = "Reset your password for RentalHub"
    message = f"""
Hello {user.username},

We received a request to reset your password. You can do so by clicking the link below:
{reset_link}

This link is valid for a limited time. If you did not request this, please ignore this email.

Thanks,
RentalHub Team
"""
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )


def send_verification_email(user):
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    verification_link = f"http://localhost:8000/api/accounts/verify-email/?uid={uid}&token={token}"
    
    subject = "Verify your email for RentalHub"
    message = f"""
Hello {user.username},

Please verify your email address by clicking the link below:
{verification_link}

If you did not register for an account, please ignore this email.

Thanks,
RentalHub Team
"""
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
