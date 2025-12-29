# 🚀 Quick Start: Email OTP Setup

**3-minute setup guide to enable email OTP in your Feed Formulation System**

---

## Step 1: Create .env File (30 seconds)

```bash
# Copy the example file
cp .env.example .env
```

Or manually create `.env` in the project root.

---

## Step 2: Get Gmail App Password (2 minutes)

### Quick Steps:

1. **Go to**: https://myaccount.google.com/security

2. **Enable 2-Step Verification** (if not already enabled)

3. **Go to**: https://myaccount.google.com/apppasswords

4. **Select**:
   - App: "Mail"
   - Device: "Other" → Type "Feed Formulation System"

5. **Click "Generate"**

6. **Copy** the 16-character password (looks like: `abcd efgh ijkl mnop`)

---

## Step 3: Update .env File (30 seconds)

Open `.env` and update:

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your.email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=your.email@gmail.com
EMAIL_FROM_NAME=Feed Formulation System
```

**Replace**:
- `your.email@gmail.com` with your Gmail address
- `abcd efgh ijkl mnop` with your App Password

---

## Step 4: Test Configuration (1 minute)

```bash
python test_email_config.py
```

Enter your email when prompted. You should receive a test OTP email.

✅ **Success**: Email received → Configuration is correct!
❌ **Failed**: No email → Check steps 2 and 3 again

---

## Step 5: Start the Application

```bash
python -m uvicorn main:app --reload
```

**Done!** OTP codes will now be sent to users' email addresses. 🎉

---

## 🐛 Troubleshooting

### Not receiving emails?

**Check spam folder** - Gmail might filter first emails

### "Authentication failed" error?

**Did you use App Password?** (Not your regular Gmail password)

### Still not working?

**Run the test script**:
```bash
python test_email_config.py
```

**Check detailed guide**: [EMAIL_SETUP.md](EMAIL_SETUP.md)

---

## 🎯 What Users Will Experience

### Registration:
1. User fills registration form
2. ✉️ Receives welcome email
3. Can now log in

### Login:
1. User enters username/password
2. ✉️ Receives OTP code via email
3. Enters OTP code
4. Successfully logged in

---

## 📧 Using Other Email Providers?

### Microsoft Outlook
```env
SMTP_SERVER=smtp.office365.com
SMTP_PORT=587
SMTP_USERNAME=your.email@outlook.com
SMTP_PASSWORD=your-password
```

### SendGrid (Production Recommended)
```env
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=SG.your-sendgrid-api-key
```

See [EMAIL_SETUP.md](EMAIL_SETUP.md) for complete guides.

---

## 🔐 Security Reminder

✅ **DO**: Keep `.env` file secure and private
❌ **DON'T**: Commit `.env` to git (already in .gitignore)
✅ **DO**: Use App Passwords for Gmail
❌ **DON'T**: Share your SMTP credentials

---

## 📚 Additional Resources

- **Full Setup Guide**: [EMAIL_SETUP.md](EMAIL_SETUP.md)
- **Implementation Details**: [EMAIL_OTP_IMPLEMENTATION.md](EMAIL_OTP_IMPLEMENTATION.md)
- **Main README**: [README.md](README.md)

---

**Need Help?** Check the troubleshooting section in [EMAIL_SETUP.md](EMAIL_SETUP.md)

**Ready to Go?** Start the server and test login with email OTP! 🚀
