# 🔧 Gmail Authentication Error - TROUBLESHOOTING GUIDE

## ❌ Error You're Seeing

```
Error sending email: (535, b'5.7.8 Username and Password not accepted')
```

## 🎯 Quick Fix (90% of cases)

The password `qgqyazhpihmlhimx` is likely **NOT** an App Password. Here's how to fix it:

### Step 1: Enable 2-Step Verification

1. Go to: https://myaccount.google.com/security
2. Find "2-Step Verification" 
3. Click and follow the setup wizard
4. ⚠️ **This MUST be enabled first!**

### Step 2: Generate a Real App Password

1. Go to: https://myaccount.google.com/apppasswords
2. You'll see a page titled "App passwords"
3. Select:
   - **App**: Mail
   - **Device**: Other (custom name) → Type "Feed System"
4. Click **Generate**
5. Copy the **16-character password** (format: `xxxx xxxx xxxx xxxx`)
   - Example: `abcd efgh ijkl mnop`
   - It will have spaces, remove them or keep them

### Step 3: Update Your .env File

**Create a NEW file called `.env` (not `.env.example`)**:

```bash
# In PowerShell
Copy-Item .env.example .env
```

Then edit `.env` with the App Password:

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=kjgnaquines@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # ← Your NEW App Password here
EMAIL_FROM=kjgnaquines@gmail.com
EMAIL_FROM_NAME=Feed Formulation System
```

### Step 4: Test Again

```bash
python test_email_config.py
```

---

## 🔍 Why This Happens

### Common Causes:

1. **Using Regular Gmail Password** ❌
   - Your Gmail login password won't work
   - You MUST use an App Password

2. **2-Step Verification Not Enabled** ❌
   - App Passwords only work with 2-Step Verification
   - Enable it first!

3. **Typo in App Password** ❌
   - Double-check you copied the correct password
   - Try generating a new one

4. **Wrong Username** ❌
   - Must be your full Gmail address: `kjgnaquines@gmail.com`

---

## 📋 Complete Setup Checklist

- [ ] 2-Step Verification is **ENABLED**
- [ ] Generated **NEW** App Password (not regular password)
- [ ] Created `.env` file (separate from `.env.example`)
- [ ] Copied App Password to `.env` (not `.env.example`)
- [ ] Restarted the backend server
- [ ] Tested with `python test_email_config.py`

---

## 🧪 Test Your Setup

### Method 1: Use Test Script

```bash
python test_email_config.py
```

Enter your email and check if you receive the test OTP.

### Method 2: Quick Python Test

```python
# test_gmail.py
import smtplib

server = smtplib.SMTP('smtp.gmail.com', 587)
server.starttls()
try:
    server.login('kjgnaquines@gmail.com', 'your-app-password-here')
    print("✅ Authentication successful!")
except Exception as e:
    print(f"❌ Authentication failed: {e}")
server.quit()
```

Run: `python test_gmail.py`

---

## 🔄 Alternative: Use SendGrid (Easier!)

If Gmail is giving you trouble, try SendGrid (free tier: 100 emails/day):

### 1. Sign up at SendGrid
https://signup.sendgrid.com/

### 2. Create API Key
- Settings → API Keys → Create API Key
- Choose "Full Access" or "Mail Send"
- Copy the API key (starts with `SG.`)

### 3. Update .env

```env
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=SG.your-api-key-here
EMAIL_FROM=kjgnaquines@gmail.com
EMAIL_FROM_NAME=Feed Formulation System
```

### 4. Verify Sender
- Settings → Sender Authentication → Verify Single Sender
- Verify your email address

---

## 🆘 Still Not Working?

### Check These:

1. **Is 2-Step Verification ON?**
   ```
   https://myaccount.google.com/security
   ```

2. **Generated NEW App Password?**
   ```
   https://myaccount.google.com/apppasswords
   ```

3. **Using `.env` not `.env.example`?**
   ```bash
   ls -la .env  # Should exist
   ```

4. **Restarted the server?**
   ```bash
   # Stop server (Ctrl+C)
   python -m uvicorn main:app --reload
   ```

5. **No typos in email/password?**
   - Username: `kjgnaquines@gmail.com` ✅
   - Password: 16 characters from App Passwords ✅

---

## 📸 Screenshot Guide

### What App Password Page Looks Like:

After going to https://myaccount.google.com/apppasswords, you should see:

```
┌─────────────────────────────────────┐
│  App passwords                       │
├─────────────────────────────────────┤
│                                      │
│  Select the app and device           │
│  you want to generate the app        │
│  password for.                       │
│                                      │
│  Select app:  [Mail ▼]              │
│  Select device: [Other ▼]           │
│                                      │
│  [ Generate ]                        │
│                                      │
└─────────────────────────────────────┘
```

After clicking Generate:

```
┌─────────────────────────────────────┐
│  Your app password for your device   │
├─────────────────────────────────────┤
│                                      │
│    abcd efgh ijkl mnop              │
│                                      │
│  Copy this password                  │
│  [ Done ]                            │
│                                      │
└─────────────────────────────────────┘
```

**Copy that password and use it in `.env`**

---

## ✅ Working Configuration Example

This is what a working `.env` should look like:

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=kjgnaquines@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=kjgnaquines@gmail.com
EMAIL_FROM_NAME=Feed Formulation System
```

Replace `abcd efgh ijkl mnop` with your actual App Password.

---

## 🎯 Summary

**The Issue**: `qgqyazhpihmlhimx` is not a valid Gmail App Password

**The Fix**: 
1. Enable 2-Step Verification
2. Generate App Password at https://myaccount.google.com/apppasswords
3. Copy the 16-character password
4. Put it in `.env` (not `.env.example`)
5. Restart server and test

**Still stuck?** Try SendGrid instead (easier setup, more reliable).

---

**Need immediate help?** Run this to see your current configuration:

```bash
python -c "from core.config import *; print(f'User: {SMTP_USERNAME}'); print(f'Pass: {SMTP_PASSWORD[:4]}...')"
```

This will show what the app is actually reading from your environment.
