"""Email utility functions for sending verification and notification emails."""

import logging
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

logger = logging.getLogger(__name__)


def send_verification_email(user):
    """
    Send email verification link to user.

    Args:
        user: CustomUser instance

    Returns:
        tuple: (success: bool, error_message: str or None)
    """
    try:
        # Generate verification token
        token = default_token_generator.make_token(user)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

        # Build verification URL
        verification_url = (
            f"{settings.FRONTEND_URL}/verify-email"
            f"?token={token}&uidb64={uidb64}"
        )

        # Create email content
        subject = "Verify your email address"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background-color: #4F46E5;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }}
                .content {{
                    background-color: #f9fafb;
                    padding: 30px;
                    border-radius: 0 0 8px 8px;
                }}
                .button {{
                    display: inline-block;
                    background-color: #4F46E5;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    margin: 20px 0;
                }}
                .footer {{
                    margin-top: 30px;
                    text-align: center;
                    font-size: 12px;
                    color: #6b7280;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Bible Memorization App</h1>
            </div>
            <div class="content">
                <h2>Welcome!</h2>
                <p>Thank you for registering with Bible Memorization App. Please verify your email address to activate your account.</p>

                <p>Click the button below to verify your email:</p>

                <center>
                    <a href="{verification_url}" class="button">Verify Email Address</a>
                </center>

                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #4F46E5;">{verification_url}</p>

                <p><strong>This link will expire in 24 hours.</strong></p>

                <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 Bible Memorization App. All rights reserved.</p>
            </div>
        </body>
        </html>
        """

        plain_content = f"""
        Welcome to Bible Memorization App!

        Thank you for registering. Please verify your email address to activate your account.

        Click or copy this link to verify your email:
        {verification_url}

        This link will expire in 24 hours.

        If you didn't create an account, you can safely ignore this email.

        © 2025 Bible Memorization App. All rights reserved.
        """

        # Send email via SendGrid
        if not settings.SENDGRID_API_KEY or settings.SENDGRID_API_KEY == 'your_sendgrid_api_key_here':
            logger.warning(f"SendGrid API key not configured. Verification email for {user.email} not sent.")
            logger.info(f"Verification URL (for testing): {verification_url}")
            return (False, "SendGrid API key not configured. Check server logs for verification URL.")

        message = Mail(
            from_email=settings.SENDGRID_FROM_EMAIL,
            to_emails=user.email,
            subject=subject,
            plain_text_content=plain_content,
            html_content=html_content
        )

        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)

        if response.status_code in [200, 201, 202]:
            logger.info(f"Verification email sent successfully to {user.email}")
            return (True, None)
        else:
            logger.error(f"SendGrid returned status {response.status_code} for {user.email}")
            return (False, f"Email service returned status {response.status_code}")

    except Exception as e:
        logger.error(f"Error sending verification email to {user.email}: {str(e)}")
        return (False, str(e))


def send_password_reset_email(user, reset_url):
    """
    Send password reset email to user.

    Args:
        user: CustomUser instance
        reset_url: Password reset URL with token

    Returns:
        tuple: (success: bool, error_message: str or None)
    """
    try:
        subject = "Reset your password"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background-color: #4F46E5;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }}
                .content {{
                    background-color: #f9fafb;
                    padding: 30px;
                    border-radius: 0 0 8px 8px;
                }}
                .button {{
                    display: inline-block;
                    background-color: #4F46E5;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    margin: 20px 0;
                }}
                .footer {{
                    margin-top: 30px;
                    text-align: center;
                    font-size: 12px;
                    color: #6b7280;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Bible Memorization App</h1>
            </div>
            <div class="content">
                <h2>Password Reset Request</h2>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>

                <center>
                    <a href="{reset_url}" class="button">Reset Password</a>
                </center>

                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #4F46E5;">{reset_url}</p>

                <p><strong>This link will expire in 24 hours.</strong></p>

                <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 Bible Memorization App. All rights reserved.</p>
            </div>
        </body>
        </html>
        """

        plain_content = f"""
        Password Reset Request

        We received a request to reset your password for Bible Memorization App.

        Click or copy this link to reset your password:
        {reset_url}

        This link will expire in 24 hours.

        If you didn't request a password reset, you can safely ignore this email.

        © 2025 Bible Memorization App. All rights reserved.
        """

        # Send email via SendGrid
        if not settings.SENDGRID_API_KEY or settings.SENDGRID_API_KEY == 'your_sendgrid_api_key_here':
            logger.warning(f"SendGrid API key not configured. Password reset email for {user.email} not sent.")
            logger.info(f"Password reset URL (for testing): {reset_url}")
            return (False, "SendGrid API key not configured. Check server logs for reset URL.")

        message = Mail(
            from_email=settings.SENDGRID_FROM_EMAIL,
            to_emails=user.email,
            subject=subject,
            plain_text_content=plain_content,
            html_content=html_content
        )

        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)

        if response.status_code in [200, 201, 202]:
            logger.info(f"Password reset email sent successfully to {user.email}")
            return (True, None)
        else:
            logger.error(f"SendGrid returned status {response.status_code} for {user.email}")
            return (False, f"Email service returned status {response.status_code}")

    except Exception as e:
        logger.error(f"Error sending password reset email to {user.email}: {str(e)}")
        return (False, str(e))
