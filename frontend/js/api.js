// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('access_token');
}

// Helper function to get user info
function getUserInfo() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Helper function to check if user is authenticated
function isAuthenticated() {
    return !!getAuthToken();
}

// Helper function to handle API errors
function handleApiError(error, defaultMessage = 'An error occurred') {
    console.error('API Error:', error);
    if (error.detail) {
        return typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail);
    }
    return defaultMessage;
}

// Show alert message
function showAlert(message, type = 'success') {
    const alertDiv = document.getElementById('alertMessage');
    if (!alertDiv) return;

    const colors = {
        success: 'bg-green-100 border-green-500 text-green-700',
        error: 'bg-red-100 border-red-500 text-red-700',
        warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
        info: 'bg-blue-100 border-blue-500 text-blue-700'
    };

    alertDiv.className = `${colors[type]} border-l-4 p-4 rounded mb-4`;
    alertDiv.innerHTML = `
        <div class="flex items-center justify-between">
            <p>${message}</p>
            <button onclick="this.parentElement.parentElement.classList.add('hidden')" class="text-gray-500 hover:text-gray-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    alertDiv.classList.remove('hidden');

    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertDiv.classList.add('hidden');
    }, 5000);
}

// API Client
const API = {
    // Authentication endpoints
    auth: {
        register: async (username, email, password) => {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw error;
            }
            
            return response.json();
        },

        login: async (username, password) => {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw error;
            }
            
            return response.json();
        },

        verifyOtp: async (sessionToken, otpCode) => {
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    session_token: sessionToken, 
                    otp_code: otpCode 
                }),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw error;
            }
            
            return response.json();
        },

        logout: () => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            localStorage.removeItem('session_token');
            window.location.href = 'index.html';
        }
    },

    // Ingredients endpoints
    ingredients: {
        getAll: async () => {
            const response = await fetch(`${API_BASE_URL}/ingredients/all`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw error;
            }
            
            return response.json();
        },

        getById: async (id) => {
            const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw error;
            }
            
            return response.json();
        },

        create: async (ingredientData) => {
            const response = await fetch(`${API_BASE_URL}/ingredients/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ingredientData),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw error;
            }
            
            return response.json();
        },

        update: async (id, ingredientData) => {
            const response = await fetch(`${API_BASE_URL}/ingredients/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ingredientData),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw error;
            }
            
            return response.json();
        },

        delete: async (id) => {
            const response = await fetch(`${API_BASE_URL}/ingredients/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw error;
            }
            
            return response.json();
        }
    },

    // Feed formulation endpoints
    formulation: {
        calculate: async (formulationData) => {
            const response = await fetch(`${API_BASE_URL}/feed/formulate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formulationData),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw error;
            }
            
            return response.json();
        },

        save: async (formulationName, formulationDescription, userId, payload) => {
            const response = await fetch(`${API_BASE_URL}/feed/formulation/save`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    formulation_name: formulationName,
                    formulation_description: formulationDescription,
                    user_id: userId,
                    payload: payload
                }),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw error;
            }
            
            return response.json();
        }
    },

    // Nutrient requirements endpoints
    nutrientRequirements: {
        getAll: async () => {
            const response = await fetch(`${API_BASE_URL}/nutrient-requirements/all`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw error;
            }
            
            return response.json();
        },

        create: async (requirementData) => {
            const response = await fetch(`${API_BASE_URL}/nutrient-requirements/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requirementData),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw error;
            }
            
            return response.json();
        },

        update: async (id, requirementData) => {
            const response = await fetch(`${API_BASE_URL}/nutrient-requrments/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requirementData),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw error;
            }
            
            return response.json();
        },

        delete: async (id) => {
            const response = await fetch(`${API_BASE_URL}/nutrient-requrments/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw error;
            }
            
            return response.json();
        }
    }
};

// Check authentication on protected pages
function checkAuth() {
    if (!isAuthenticated() && !window.location.pathname.includes('index.html') && !window.location.pathname.includes('register.html')) {
        window.location.href = 'index.html';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const publicPages = ['index.html', 'register.html', '/'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (!publicPages.includes(currentPage) && !isAuthenticated()) {
        window.location.href = 'index.html';
    }
});
