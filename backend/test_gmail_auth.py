"""
Quick Gmail Connection Test
This script checks if your Gmail credentials are working
"""

import smtplib
from core.config import SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD

print("=" * 60)
print("Gmail Authentication Test")
print("=" * 60)
print()

print("Current Configuration:")
print(f"  SMTP Server: {SMTP_SERVER}")
print(f"  SMTP Port: {SMTP_PORT}")
print(f"  Username: {SMTP_USERNAME}")
print(f"  Password: {'*' * (len(SMTP_PASSWORD) - 4)}{SMTP_PASSWORD[-4:]}")
print()

print("Testing connection...")
print()

try:
    # Connect to server
    print("1. Connecting to Gmail SMTP server...")
    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    print("   ✅ Connected")
    
    # Start TLS
    print("2. Starting TLS encryption...")
    server.starttls()
    print("   ✅ TLS enabled")
    
    # Login
    print("3. Authenticating with Gmail...")
    server.login(SMTP_USERNAME, SMTP_PASSWORD)
    print("   ✅ Authentication successful!")
    
    # Close connection
    server.quit()
    
    print()
    print("=" * 60)
    print("✅ SUCCESS! Your Gmail credentials are working correctly!")
    print("=" * 60)
    print()
    print("You can now:")
    print("1. Start the backend: python -m uvicorn main:app --reload")
    print("2. Test OTP emails: python test_email_config.py")
    print()
    
except smtplib.SMTPAuthenticationError as e:
    print("   ❌ Authentication FAILED")
    print()
    print("=" * 60)
    print("❌ ERROR: Gmail rejected your credentials")
    print("=" * 60)
    print()
    print(f"Error details: {e}")
    print()
    print("🔧 FIX THIS:")
    print()
    print("Your password is likely NOT an App Password.")
    print()
    print("STEPS TO FIX:")
    print("1. Go to: https://myaccount.google.com/security")
    print("2. Enable '2-Step Verification' (required!)")
    print("3. Go to: https://myaccount.google.com/apppasswords")
    print("4. Generate a NEW App Password for 'Mail'")
    print("5. Copy the 16-character password (e.g., 'abcd efgh ijkl mnop')")
    print("6. Update your .env file with this password")
    print("7. Run this test again")
    print()
    print("📖 Full guide: See GMAIL_TROUBLESHOOTING.md")
    print()
    
except Exception as e:
    print(f"   ❌ Connection failed: {e}")
    print()
    print("=" * 60)
    print("❌ ERROR: Could not connect to Gmail")
    print("=" * 60)
    print()
    print(f"Error: {e}")
    print()
    print("COMMON CAUSES:")
    print("• Firewall blocking port 587")
    print("• Incorrect SMTP server (should be: smtp.gmail.com)")
    print("• Incorrect port (should be: 587)")
    print("• No internet connection")
    print()
    print("Check your .env file and try again.")
    print()
