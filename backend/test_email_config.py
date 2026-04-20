"""
Email Configuration Test Script

This script tests your email configuration by sending a test OTP email.
Run this before starting the application to verify your email settings are correct.
"""

import sys
from core.email import send_otp_email, send_welcome_email
from core.config import SMTP_USERNAME, EMAIL_FROM

def test_email_configuration():
    print("=" * 60)
    print("Feed Formulation System - Email Configuration Test")
    print("=" * 60)
    print()
    
    # Get recipient email
    print("This script will send a test email to verify your configuration.")
    recipient = input("Enter your email address to receive test email: ").strip()
    
    if not recipient or '@' not in recipient:
        print("❌ Invalid email address!")
        return False
    
    print()
    print(f"Current SMTP Configuration:")
    print(f"  SMTP Username: {SMTP_USERNAME}")
    print(f"  Email From: {EMAIL_FROM}")
    print()
    
    # Test OTP email
    print("📧 Sending test OTP email...")
    test_otp = "123456"
    test_username = "TestUser"
    
    try:
        result = send_otp_email(
            recipient_email=recipient,
            otp_code=test_otp,
            username=test_username
        )
        
        if result:
            print("✅ OTP email sent successfully!")
            print()
            print("Please check your inbox (and spam folder) for:")
            print(f"  Subject: Your Feed Formulation System Login Code")
            print(f"  Test OTP Code: {test_otp}")
            print()
            
            # Ask if user wants to test welcome email too
            test_welcome = input("Do you want to test the welcome email too? (y/n): ").strip().lower()
            
            if test_welcome == 'y':
                print()
                print("📧 Sending test welcome email...")
                welcome_result = send_welcome_email(
                    recipient_email=recipient,
                    username=test_username
                )
                
                if welcome_result:
                    print("✅ Welcome email sent successfully!")
                    print()
                    print("Please check your inbox for:")
                    print(f"  Subject: Welcome to Feed Formulation System!")
                else:
                    print("❌ Failed to send welcome email")
                    return False
            
            print()
            print("=" * 60)
            print("✅ Email configuration test completed successfully!")
            print("=" * 60)
            print()
            print("Your email is configured correctly and ready to use.")
            print("You can now start the application with:")
            print("  python -m uvicorn main:app --reload")
            print()
            return True
            
        else:
            print("❌ Failed to send email!")
            print()
            print("Troubleshooting steps:")
            print("1. Check your .env file has correct SMTP credentials")
            print("2. For Gmail: Use an App Password, not your regular password")
            print("3. Verify 2-Step Verification is enabled (for Gmail)")
            print("4. Check if your firewall blocks port 587")
            print("5. Review EMAIL_SETUP.md for detailed configuration")
            print()
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print()
        print("Common solutions:")
        print("1. Check SMTP_USERNAME and SMTP_PASSWORD in .env")
        print("2. Verify SMTP_SERVER and SMTP_PORT are correct")
        print("3. Ensure 2-Step Verification is enabled (Gmail)")
        print("4. Generate an App Password (for Gmail)")
        print()
        print("See EMAIL_SETUP.md for detailed setup instructions.")
        print()
        return False

if __name__ == "__main__":
    success = test_email_configuration()
    sys.exit(0 if success else 1)
