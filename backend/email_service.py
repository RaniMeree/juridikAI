"""
Email service for sending emails via SendGrid
"""
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@juridikai.com")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8081")


def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    """
    Send password reset email with reset link
    
    Args:
        to_email: Recipient email address
        reset_token: Password reset token
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    if not SENDGRID_API_KEY:
        print("⚠️ SENDGRID_API_KEY not set. Email not sent.")
        print(f"Reset token for {to_email}: {reset_token}")
        print(f"Reset link: {FRONTEND_URL}/reset-password?token={reset_token}")
        return False
    
    try:
        reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
        
        message = Mail(
            from_email=Email(FROM_EMAIL, "Juridik AI"),
            to_emails=To(to_email),
            subject="Reset Your Password - Juridik AI",
            html_content=f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #4F46E5;">Reset Your Password</h2>
                        <p>Hello,</p>
                        <p>We received a request to reset your password for your Juridik AI account.</p>
                        <p>Click the button below to reset your password:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{reset_link}" 
                               style="background-color: #4F46E5; 
                                      color: white; 
                                      padding: 12px 30px; 
                                      text-decoration: none; 
                                      border-radius: 8px;
                                      display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #4F46E5;">{reset_link}</p>
                        <p style="margin-top: 30px; color: #666; font-size: 14px;">
                            This link will expire in 1 hour for security reasons.
                        </p>
                        <p style="color: #666; font-size: 14px;">
                            If you didn't request a password reset, you can safely ignore this email.
                        </p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="color: #999; font-size: 12px;">
                            © 2026 Juridik AI. All rights reserved.
                        </p>
                    </div>
                </body>
            </html>
            """
        )
        
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        
        print(f"✅ Password reset email sent to {to_email}")
        return response.status_code in [200, 201, 202]
        
    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {str(e)}")
        return False
