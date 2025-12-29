// Authentication handling for login and registration pages

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    if (isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // OTP form handler
    const otpForm = document.getElementById('otpForm');
    if (otpForm) {
        otpForm.addEventListener('submit', handleOtpVerification);
    }

    // Cancel OTP button
    const cancelOtpBtn = document.getElementById('cancelOtp');
    if (cancelOtpBtn) {
        cancelOtpBtn.addEventListener('click', () => {
            document.getElementById('otpModal').classList.add('hidden');
            localStorage.removeItem('session_token');
        });
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginButton = document.getElementById('loginButton');
    
    try {
        loginButton.disabled = true;
        loginButton.textContent = 'Signing in...';
        
        const result = await API.auth.login(username, password);
        
        // Check if OTP is enabled
        if (result.session_token) {
            // OTP is enabled, show OTP modal
            localStorage.setItem('session_token', result.session_token);
            document.getElementById('otpModal').classList.remove('hidden');
            
            // Show message that OTP was sent to email
            showAlert('OTP has been sent to your email address. Please check your inbox.', 'info');
        } else {
            // OTP is disabled, directly login
            localStorage.setItem('access_token', result.access_token);
            localStorage.setItem('user', JSON.stringify(result.user));
            
            showAlert('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }
        
    } catch (error) {
        showAlert(handleApiError(error, 'Login failed. Please check your credentials.'), 'error');
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = 'Sign In';
    }
}

async function handleOtpVerification(e) {
    e.preventDefault();
    
    const otpCode = document.getElementById('otpCode').value;
    const sessionToken = localStorage.getItem('session_token');
    
    if (!sessionToken) {
        showAlert('Session expired. Please login again.', 'error');
        document.getElementById('otpModal').classList.add('hidden');
        return;
    }
    
    try {
        const result = await API.auth.verifyOtp(sessionToken, otpCode);
        
        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.removeItem('session_token');
        
        const otpAlertMessage = document.getElementById('otpAlertMessage');
        otpAlertMessage.className = 'bg-green-100 border-green-500 text-green-700 border-l-4 p-4 rounded';
        otpAlertMessage.textContent = 'OTP verified successfully! Redirecting...';
        otpAlertMessage.classList.remove('hidden');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        const otpAlertMessage = document.getElementById('otpAlertMessage');
        otpAlertMessage.className = 'bg-red-100 border-red-500 text-red-700 border-l-4 p-4 rounded';
        otpAlertMessage.textContent = handleApiError(error, 'Invalid OTP code. Please try again.');
        otpAlertMessage.classList.remove('hidden');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsChecked = document.getElementById('terms').checked;
    const registerButton = document.getElementById('registerButton');
    
    // Validation
    if (!termsChecked) {
        showAlert('Please accept the terms and conditions.', 'warning');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match.', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long.', 'error');
        return;
    }
    
    try {
        registerButton.disabled = true;
        registerButton.textContent = 'Creating Account...';
        
        const result = await API.auth.register(username, email, password);
        
        showAlert('Account created successfully! Redirecting to login...', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        showAlert(handleApiError(error, 'Registration failed. Please try again.'), 'error');
    } finally {
        registerButton.disabled = false;
        registerButton.textContent = 'Create Account';
    }
}
