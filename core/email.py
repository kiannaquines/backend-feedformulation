import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from .config import (
    SMTP_SERVER,
    SMTP_PORT,
    SMTP_USERNAME,
    SMTP_PASSWORD,
    EMAIL_FROM,
    EMAIL_FROM_NAME
)


def send_otp_email(recipient_email: str, otp_code: str, username: str) -> bool:
    """
    Send OTP code to user's email address
    
    Args:
        recipient_email: User's email address
        otp_code: The OTP code to send
        username: User's username for personalization
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = "Your Feed Formulation System Login Code"
        message["From"] = f"{EMAIL_FROM_NAME} <{EMAIL_FROM}>"
        message["To"] = recipient_email

        # Create HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background-color: #2d5f3f;
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background-color: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .otp-code {{
                    background-color: #2d5f3f;
                    color: white;
                    font-size: 32px;
                    font-weight: bold;
                    padding: 20px;
                    text-align: center;
                    border-radius: 8px;
                    letter-spacing: 8px;
                    margin: 20px 0;
                }}
                .warning {{
                    background-color: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                }}
                .footer {{
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                    margin-top: 20px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌾 Feed Formulation System</h1>
                </div>
                <div class="content">
                    <h2>Hello, {username}!</h2>
                    <p>You recently requested to log in to your Feed Formulation System account. Use the verification code below to complete your login:</p>
                    
                    <div class="otp-code">{otp_code}</div>
                    
                    <p><strong>This code will expire in 10 minutes.</strong></p>
                    
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong>
                        <ul>
                            <li>Never share this code with anyone</li>
                            <li>Our team will never ask for your verification code</li>
                            <li>If you didn't request this code, please ignore this email and secure your account</li>
                        </ul>
                    </div>
                    
                    <p>If you're having trouble logging in, please contact our support team.</p>
                    
                    <p>Best regards,<br>
                    <strong>Feed Formulation System Team</strong></p>
                </div>
                <div class="footer">
                    <p>This is an automated message, please do not reply to this email.</p>
                    <p>&copy; 2025 Feed Formulation System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        # Create plain text alternative
        text_content = f"""
        Feed Formulation System - Login Verification
        
        Hello, {username}!
        
        You recently requested to log in to your Feed Formulation System account.
        
        Your verification code is: {otp_code}
        
        This code will expire in 10 minutes.
        
        SECURITY NOTICE:
        - Never share this code with anyone
        - Our team will never ask for your verification code
        - If you didn't request this code, please ignore this email
        
        Best regards,
        Feed Formulation System Team
        
        ---
        This is an automated message, please do not reply to this email.
        """

        # Attach both versions
        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        message.attach(part1)
        message.attach(part2)

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(message)
        
        return True
    
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False


def send_welcome_email(recipient_email: str, username: str) -> bool:
    """
    Send welcome email to newly registered users
    
    Args:
        recipient_email: User's email address
        username: User's username
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = "Welcome to Feed Formulation System!"
        message["From"] = f"{EMAIL_FROM_NAME} <{EMAIL_FROM}>"
        message["To"] = recipient_email

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background-color: #2d5f3f;
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background-color: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .feature {{
                    background-color: white;
                    padding: 15px;
                    margin: 10px 0;
                    border-left: 4px solid #2d5f3f;
                    border-radius: 4px;
                }}
                .footer {{
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                    margin-top: 20px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌾 Welcome to Feed Formulation System!</h1>
                </div>
                <div class="content">
                    <h2>Hello, {username}!</h2>
                    <p>Thank you for registering with the Feed Formulation System. We're excited to have you on board!</p>
                    
                    <h3>What you can do:</h3>
                    
                    <div class="feature">
                        <strong>📊 Optimize Feed Formulations</strong>
                        <p>Use our advanced linear programming algorithms to create cost-effective feed mixes that meet precise nutritional requirements.</p>
                    </div>
                    
                    <div class="feature">
                        <strong>🌾 Manage Ingredients</strong>
                        <p>Build and maintain your ingredient library with detailed nutritional profiles and real-time pricing.</p>
                    </div>
                    
                    <div class="feature">
                        <strong>📈 Track Performance</strong>
                        <p>Save and compare formulations to find the best solutions for your livestock needs.</p>
                    </div>
                    
                    <p>Ready to get started? Log in to your account and explore all the features!</p>
                    
                    <p>If you have any questions, our support team is here to help.</p>
                    
                    <p>Best regards,<br>
                    <strong>Feed Formulation System Team</strong></p>
                </div>
                <div class="footer">
                    <p>&copy; 2025 Feed Formulation System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Welcome to Feed Formulation System!
        
        Hello, {username}!
        
        Thank you for registering with the Feed Formulation System. We're excited to have you on board!
        
        What you can do:
        
        • Optimize Feed Formulations - Use our advanced algorithms to create cost-effective feed mixes
        • Manage Ingredients - Build your ingredient library with detailed nutritional profiles
        • Track Performance - Save and compare formulations
        
        Ready to get started? Log in to your account and explore all the features!
        
        Best regards,
        Feed Formulation System Team
        """

        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        message.attach(part1)
        message.attach(part2)

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(message)
        
        return True
    
    except Exception as e:
        print(f"Error sending welcome email: {str(e)}")
        return False
