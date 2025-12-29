# Email OTP Configuration Guide

This guide will help you set up email delivery for OTP (One-Time Password) codes in the Feed Formulation System.

## Overview

The system now sends OTP codes to users' email addresses instead of displaying them in the API response. This provides:
- **Better security**: OTP codes are not exposed in API responses
- **Professional experience**: Users receive nicely formatted HTML emails
- **Real-world authentication**: Mimics standard two-factor authentication systems

## Quick Setup

### 1. Create a `.env` File

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

### 2. Configure Email Settings

Edit the `.env` file with your email credentials:

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Feed Formulation System
```

## Email Provider Setup Guides

### Gmail (Recommended for Testing)

1. **Enable 2-Step Verification**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable "2-Step Verification" if not already enabled

2. **Generate App Password**
   - Visit [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app
   - Select "Other" as the device and name it "Feed Formulation System"
   - Click "Generate"
   - Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

3. **Update `.env` File**
   ```env
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your.email@gmail.com
   SMTP_PASSWORD=abcd efgh ijkl mnop  # The app password
   EMAIL_FROM=your.email@gmail.com
   EMAIL_FROM_NAME=Feed Formulation System
   ```

### Microsoft Outlook / Office 365

1. **Update `.env` File**
   ```env
   SMTP_SERVER=smtp.office365.com
   SMTP_PORT=587
   SMTP_USERNAME=your.email@outlook.com
   SMTP_PASSWORD=your-password
   EMAIL_FROM=your.email@outlook.com
   EMAIL_FROM_NAME=Feed Formulation System
   ```

2. **Note**: If you have 2FA enabled, you may need to generate an app-specific password

### Yahoo Mail

1. **Generate App Password**
   - Go to Yahoo Account Security
   - Enable 2-Step Verification
   - Generate an app password for "Mail"

2. **Update `.env` File**
   ```env
   SMTP_SERVER=smtp.mail.yahoo.com
   SMTP_PORT=587
   SMTP_USERNAME=your.email@yahoo.com
   SMTP_PASSWORD=your-app-password
   EMAIL_FROM=your.email@yahoo.com
   EMAIL_FROM_NAME=Feed Formulation System
   ```

### SendGrid (Production Recommended)

SendGrid is a professional email service ideal for production environments.

1. **Create SendGrid Account**
   - Sign up at [SendGrid](https://sendgrid.com/)
   - Free tier: 100 emails/day

2. **Create API Key**
   - Navigate to Settings > API Keys
   - Create a new API key with "Mail Send" permissions
   - Copy the API key

3. **Update `.env` File**
   ```env
   SMTP_SERVER=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USERNAME=apikey  # Literally the word "apikey"
   SMTP_PASSWORD=SG.your-sendgrid-api-key
   EMAIL_FROM=your-verified-sender@yourdomain.com
   EMAIL_FROM_NAME=Feed Formulation System
   ```

4. **Verify Sender Identity**
   - Go to Settings > Sender Authentication
   - Verify your email address or domain

### Amazon SES (Enterprise Solution)

1. **Set Up SES**
   - Create AWS account and navigate to SES
   - Verify email addresses or domain
   - Request production access (starts in sandbox mode)

2. **Get SMTP Credentials**
   - Navigate to SMTP Settings in SES console
   - Create SMTP credentials
   - Note the server name and port

3. **Update `.env` File**
   ```env
   SMTP_SERVER=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_USERNAME=your-ses-smtp-username
   SMTP_PASSWORD=your-ses-smtp-password
   EMAIL_FROM=verified-email@yourdomain.com
   EMAIL_FROM_NAME=Feed Formulation System
   ```

## Email Templates

The system includes two email templates:

### 1. OTP Verification Email
Sent when users log in (if OTP is enabled):
- Professional HTML design with your brand colors
- Large, easy-to-read OTP code
- Security warnings
- 10-minute expiration notice

### 2. Welcome Email
Sent when new users register:
- Welcome message
- Feature highlights
- Getting started information

## Testing Email Configuration

### Test Script

Create a test file `test_email.py`:

```python
from core.email import send_otp_email, send_welcome_email

# Test OTP email
otp_result = send_otp_email(
    recipient_email="test@example.com",
    otp_code="123456",
    username="TestUser"
)
print(f"OTP Email sent: {otp_result}")

# Test welcome email
welcome_result = send_welcome_email(
    recipient_email="test@example.com",
    username="TestUser"
)
print(f"Welcome Email sent: {welcome_result}")
```

Run the test:
```bash
python test_email.py
```

### Testing with the Application

1. Start the backend:
   ```bash
   python -m uvicorn main:app --reload
   ```

2. Register a new user with a real email address

3. Try to log in - you should receive the OTP via email

4. Check your spam folder if you don't see the email

## Troubleshooting

### Common Issues

#### 1. "Authentication failed" error

**Problem**: SMTP credentials are incorrect

**Solutions**:
- Double-check username and password in `.env`
- For Gmail: Ensure you're using an App Password, not your regular password
- Verify 2-Step Verification is enabled

#### 2. "Connection refused" error

**Problem**: SMTP server or port is incorrect

**Solutions**:
- Verify SMTP_SERVER and SMTP_PORT values
- Check if your firewall blocks outgoing port 587
- Try port 465 (SSL) instead of 587 (TLS)

#### 3. Emails go to spam

**Problem**: Email provider flags messages as spam

**Solutions**:
- Use a verified domain with SendGrid or SES
- Add SPF and DKIM records to your domain
- Start with low volume and gradually increase
- Avoid spam trigger words in email content

#### 4. "535 Authentication failed" (Gmail)

**Problem**: Using regular password instead of App Password

**Solution**:
- Generate an App Password from Google Account settings
- Use the 16-character app password in `.env`

#### 5. Email not received

**Checklist**:
- [ ] Check spam/junk folder
- [ ] Verify email address is correct in database
- [ ] Check backend logs for error messages
- [ ] Test with test_email.py script
- [ ] Verify SMTP settings in `.env`

### Debug Mode

To see detailed error messages, check the backend terminal output. The email functions print errors to console.

## Security Best Practices

### 1. Never Commit `.env` File

Add to `.gitignore`:
```
.env
*.env
```

### 2. Use App-Specific Passwords

Never use your main email password. Always create app-specific passwords.

### 3. Production Environment

For production:
- Use professional email service (SendGrid, SES, Mailgun)
- Set up proper domain authentication (SPF, DKIM, DMARC)
- Monitor email delivery rates
- Implement rate limiting
- Use environment variables in deployment (not .env files)

### 4. Rotate Credentials

Regularly rotate email credentials, especially if:
- Team members leave
- Credentials are exposed
- Suspicious activity is detected

## Production Deployment

### Environment Variables

Set these in your production environment (Heroku, AWS, etc.):

```bash
# Heroku example
heroku config:set SMTP_SERVER=smtp.sendgrid.net
heroku config:set SMTP_PORT=587
heroku config:set SMTP_USERNAME=apikey
heroku config:set SMTP_PASSWORD=SG.your-key
heroku config:set EMAIL_FROM=noreply@yourdomain.com
heroku config:set EMAIL_FROM_NAME="Feed Formulation System"
```

### Monitoring

Monitor email delivery:
- Track send success/failure rates
- Set up alerts for delivery issues
- Monitor spam complaints
- Track open rates (optional)

## Advanced Configuration

### Custom Email Templates

Edit templates in `core/email.py`:

```python
def send_otp_email(recipient_email: str, otp_code: str, username: str) -> bool:
    # Modify html_content and text_content
    html_content = f"""
    <!-- Your custom HTML here -->
    """
```

### Multiple Email Providers

Implement fallback logic:

```python
def send_email_with_fallback(recipient, subject, content):
    providers = [
        {'smtp': 'smtp.sendgrid.net', 'port': 587, ...},
        {'smtp': 'smtp.gmail.com', 'port': 587, ...}
    ]
    
    for provider in providers:
        try:
            # Attempt send
            return True
        except:
            continue
    return False
```

## Support

If you encounter issues:

1. Check backend logs for error messages
2. Verify all `.env` variables are set correctly
3. Test with `test_email.py` script
4. Review this documentation's troubleshooting section
5. Check email provider's documentation

## Summary

✅ **Setup Steps:**
1. Copy `.env.example` to `.env`
2. Configure email credentials
3. Restart backend server
4. Test with registration/login

✅ **What Changed:**
- OTP codes are now emailed (not shown in API)
- Welcome emails sent on registration
- Professional HTML email templates
- Better security and user experience

✅ **Production Ready:**
- Use SendGrid or Amazon SES
- Set environment variables properly
- Monitor email delivery
- Implement rate limiting
