// Currency configuration
const CURRENCY_SYMBOLS = {
    PHP: '₱',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    INR: '₹',
    AUD: 'A$',
    CAD: 'C$',
    SGD: 'S$',
    MYR: 'RM',
    THB: '฿',
    IDR: 'Rp',
    VND: '₫'
};

const DEFAULT_SETTINGS = {
    currency: 'PHP',
    currencyDecimalPlaces: 2,
    percentageDecimalPlaces: 4
};

// Load settings on page load
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    updatePreview();
    
    // Event listeners
    document.getElementById('currencySelect').addEventListener('change', updatePreview);
    document.getElementById('currencyDecimalPlaces').addEventListener('change', updatePreview);
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('resetSettingsBtn').addEventListener('click', resetSettings);
});

function loadSettings() {
    const settings = getSettings();
    
    document.getElementById('currencySelect').value = settings.currency;
    document.getElementById('currencyDecimalPlaces').value = settings.currencyDecimalPlaces;
    document.getElementById('percentageDecimalPlaces').value = settings.percentageDecimalPlaces;
}

function getSettings() {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
}

function updatePreview() {
    const currency = document.getElementById('currencySelect').value;
    const decimalPlaces = parseInt(document.getElementById('currencyDecimalPlaces').value);
    const symbol = CURRENCY_SYMBOLS[currency];
    
    const sampleAmount = 1234.5678;
    const formatted = `${symbol}${sampleAmount.toFixed(decimalPlaces)}`;
    
    document.getElementById('previewAmount').textContent = formatted;
}

function saveSettings() {
    const settings = {
        currency: document.getElementById('currencySelect').value,
        currencyDecimalPlaces: parseInt(document.getElementById('currencyDecimalPlaces').value),
        percentageDecimalPlaces: parseInt(document.getElementById('percentageDecimalPlaces').value)
    };
    
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    showAlert('Settings saved successfully!', 'success');
    
    // Update preview
    updatePreview();
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        localStorage.removeItem('appSettings');
        loadSettings();
        updatePreview();
        showAlert('Settings reset to defaults', 'success');
    }
}

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    
    const alertColors = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };
    
    const iconPaths = {
        success: 'M5 13l4 4L19 7',
        error: 'M6 18L18 6M6 6l12 12',
        info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    
    const alert = document.createElement('div');
    alert.className = `${alertColors[type]} border rounded-lg p-4 shadow-lg flex items-center min-w-[300px] animate-slide-in`;
    alert.innerHTML = `
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPaths[type]}"></path>
        </svg>
        <span>${message}</span>
    `;
    
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transform = 'translateX(100%)';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

// Export function for use in other pages
function getCurrencySymbol() {
    const settings = getSettings();
    return CURRENCY_SYMBOLS[settings.currency];
}

function formatCurrency(amount) {
    const settings = getSettings();
    const symbol = CURRENCY_SYMBOLS[settings.currency];
    return `${symbol}${amount.toFixed(settings.currencyDecimalPlaces)}`;
}

function formatPercentage(value) {
    const settings = getSettings();
    return `${value.toFixed(settings.percentageDecimalPlaces)}%`;
}

// Make functions available globally
window.getCurrencySymbol = getCurrencySymbol;
window.formatCurrency = formatCurrency;
window.formatPercentage = formatPercentage;
window.getSettings = getSettings;
