from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

def send_password_reset_email(user):
    """
    Generates a secure, time-sensitive password recovery token and mails it to the user.
    The link points to the frontend React application (/reset-password).
    """
    # Create a unique cryptographic token for the user using Django's default generator
    token = default_token_generator.make_token(user)
    # Safely base64 encode the user's primary key (ID) to identify them in the URL
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    # Construct the link pointing to the React password reset page
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
    # Send the email to the user
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=True,
    )


def send_verification_email(user):
    """
    Generates a secure email verification token and mails it to the newly registered user.
    The link points directly to the Django backend to perform account activation upon click.
    """
    # Generate the cryptographic activation token
    token = default_token_generator.make_token(user)
    # Encode user primary key (ID)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    # Construct the direct backend URL to verify and activate user accounts
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
    # Dispatch email
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=True,
    )
