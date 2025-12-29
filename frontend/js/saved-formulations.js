// Saved Formulations functionality

// Currency helper functions
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

function getAppSettings() {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : {
        currency: 'PHP',
        currencyDecimalPlaces: 2,
        percentageDecimalPlaces: 4
    };
}

function formatCurrency(amount) {
    const settings = getAppSettings();
    const symbol = CURRENCY_SYMBOLS[settings.currency];
    return `${symbol}${amount.toFixed(settings.currencyDecimalPlaces)}`;
}

function formatPercentage(value) {
    const settings = getAppSettings();
    return value.toFixed(settings.percentageDecimalPlaces);
}

let allFormulations = [];

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, checking authentication...');
    
    // Check authentication first
    const token = getAuthToken();
    if (!token) {
        console.log('No auth token found, redirecting to login');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Auth token found:', token.substring(0, 20) + '...');
    
    // Close details button
    const closeDetailsBtn = document.getElementById('closeDetails');
    if (closeDetailsBtn) {
        closeDetailsBtn.addEventListener('click', () => {
            document.getElementById('detailsModal').classList.add('hidden');
        });
    }
    
    // Load formulations
    console.log('Starting to load formulations...');
    await loadFormulations();
});

async function loadFormulations() {
    const grid = document.getElementById('formulationsGrid');
    
    try {
        console.log('Calling API.formulation.getAll()...');
        const formulations = await API.formulation.getAll();
        allFormulations = formulations;
        
        console.log('Loaded formulations:', formulations);
        console.log('Number of formulations:', formulations ? formulations.length : 0);
        
        if (!formulations || formulations.length === 0) {
            console.log('No formulations found, displaying empty state');
            displayNoFormulations();
        } else {
            console.log('Rendering formulations...');
            renderFormulations(formulations);
        }
    } catch (error) {
        console.error('Failed to load formulations:', error);
        console.error('Error details:', error.message, error.stack);
        showAlert(handleApiError(error, 'Failed to load saved formulations'), 'error');
        displayNoFormulations();
    }
}

function displayNoFormulations() {
    const grid = document.getElementById('formulationsGrid');
    grid.innerHTML = `
        <div class="col-span-full text-center py-12">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p class="text-gray-500 mb-4">No saved formulations yet.</p>
            <p class="text-sm text-gray-400 mb-6">Create and save your first feed formulation to see it here.</p>
            <a 
                href="formulation.html"
                class="inline-block bg-farm-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-farm-accent transition-colors"
            >
                Create Your First Formulation
            </a>
        </div>
    `;
}

function renderFormulations(formulations) {
    const grid = document.getElementById('formulationsGrid');
    
    if (formulations.length === 0) {
        displayNoFormulations();
        return;
    }
    
    grid.innerHTML = formulations.map(formulation => {
        const payload = typeof formulation.payload === 'string' 
            ? JSON.parse(formulation.payload) 
            : formulation.payload;
        
        return `
            <div class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-200">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-lg font-bold text-gray-900">${formulation.formulation_name}</h3>
                    <span class="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        Saved
                    </span>
                </div>
                
                ${formulation.formulation_description ? `
                    <p class="text-sm text-gray-600 mb-4">${formulation.formulation_description}</p>
                ` : ''}
                
                <div class="space-y-2 text-sm mb-4">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Date Created:</span>
                        <span class="font-semibold">${new Date(formulation.created_at).toLocaleDateString()}</span>
                    </div>
                    ${payload && payload.summary ? `
                        <div class="flex justify-between">
                            <span class="text-gray-600">Cost per kg:</span>
                            <span class="font-semibold text-green-600">${formatCurrency(payload.summary.cost_per_kg)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Ingredients:</span>
                            <span class="font-semibold">${payload.summary.active_ingredients_count}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="pt-4 border-t border-gray-200 flex space-x-2">
                    <button 
                        onclick="viewFormulationDetails(${formulation.id})"
                        class="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                        View Details
                    </button>
                    <button 
                        onclick="deleteFormulation(${formulation.id}, '${(formulation.formulation_name || 'Unnamed').replace(/'/g, "\\\\'")}')"
                        class="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function viewFormulationDetails(id) {
    const formulation = allFormulations.find(f => f.id === id);
    
    if (!formulation) {
        showAlert('Formulation not found', 'error');
        return;
    }
    
    // Handle payload - it can be already parsed object or JSON string
    let payload;
    try {
        if (typeof formulation.payload === 'string') {
            payload = JSON.parse(formulation.payload);
        } else {
            payload = formulation.payload;
        }
    } catch (e) {
        console.error('Error parsing payload:', e);
        showAlert('Error loading formulation details', 'error');
        return;
    }
    
    const modal = document.getElementById('detailsModal');
    const content = document.getElementById('detailsContent');
    
    let detailsHtml = `
        <div class="space-y-6">
            <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">${formulation.formulation_name || 'Unnamed Formulation'}</h3>
                ${formulation.formulation_description ? `
                    <p class="text-gray-600">${formulation.formulation_description}</p>
                ` : ''}
                ${formulation.created_at ? `
                    <p class="text-sm text-gray-500 mt-2">Created: ${new Date(formulation.created_at).toLocaleString()}</p>
                ` : ''}
            </div>
    `;
    
    if (payload) {
        // Summary section
        if (payload.summary) {
            detailsHtml += `
                <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white text-center">
                    <p class="text-sm opacity-90 mb-1">Total Cost per kg</p>
                    <p class="text-4xl font-bold">${formatCurrency(payload.summary.cost_per_kg)}</p>
                    <p class="text-sm opacity-90 mt-2">${payload.summary.active_ingredients_count} Active Ingredients</p>
                </div>
            `;
        }
        
        // Ingredient composition - show all ingredients
        if (payload.ingredient_composition) {
            const allIngredients = payload.ingredient_composition;
            
            detailsHtml += `
                <div>
                    <h4 class="font-bold text-gray-900 mb-3">All Ingredients (${allIngredients.length} total)</h4>
                    <div class="space-y-2">
                        ${allIngredients.map(ing => {
                            const isActive = ing.included && ing.percentage > 0;
                            return `
                                <div class="flex justify-between items-center p-3 ${isActive ? 'bg-green-50 border-l-4 border-green-500' : 'bg-gray-50 border-l-4 border-gray-300'} rounded">
                                    <div class="flex items-center space-x-2">
                                        ${isActive ? `
                                            <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                            </svg>
                                        ` : `
                                            <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                                            </svg>
                                        `}
                                        <span class="text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}">${ing.name}</span>
                                    </div>
                                    <div class="text-right">
                                        <span class="font-bold ${isActive ? 'text-green-600' : 'text-gray-400'}">${formatPercentage(ing.percentage)}%</span>
                                        ${isActive ? `
                                            <span class="text-xs text-gray-500 ml-2">${formatCurrency(ing.cost_contribution)}</span>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }
        
        // Nutrient achievement
        if (payload.nutrient_achievement) {
            detailsHtml += `
                <div>
                    <h4 class="font-bold text-gray-900 mb-3">Nutrient Levels</h4>
                    <div class="space-y-3 text-sm">
                        ${Object.entries(payload.nutrient_achievement).map(([key, value]) => {
                            const label = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                            const percentage = ((value.achieved / value.required) * 100).toFixed(1);
                            return `
                                <div>
                                    <div class="flex justify-between mb-1">
                                        <span class="font-medium">${label}</span>
                                        <span>${formatPercentage(value.achieved)} / ${formatPercentage(value.required)}</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-2">
                                        <div class="bg-green-500 h-2 rounded-full" style="width: ${Math.min(percentage, 100)}%"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }
        
        // Optimization details
        if (payload.optimization_details) {
            detailsHtml += `
                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-bold text-gray-900 mb-2">Optimization Details</h4>
                    <div class="text-sm space-y-1">
                        ${payload.optimization_details.solver_status ? `
                            <p><span class="text-gray-600">Status:</span> <span class="font-medium text-green-600">${payload.optimization_details.solver_status}</span></p>
                        ` : ''}
                        ${payload.optimization_details.iterations ? `
                            <p><span class="text-gray-600">Iterations:</span> <span class="font-medium">${payload.optimization_details.iterations}</span></p>
                        ` : ''}
                    </div>
                </div>
            `;
        }
    } else {
        detailsHtml += '<p class="text-gray-500">No detailed data available for this formulation.</p>';
    }
    
    detailsHtml += '</div>';
    
    content.innerHTML = detailsHtml;
    modal.classList.remove('hidden');
}

async function deleteFormulation(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?\n\nThis action cannot be undone.`)) {
        return;
    }
    
    try {
        await API.formulation.delete(id);
        showAlert(`"${name}" has been deleted successfully`, 'success');
        
        // Reload formulations
        await loadFormulations();
    } catch (error) {
        console.error('Failed to delete formulation:', error);
        showAlert(handleApiError(error, 'Failed to delete formulation'), 'error');
    }
}
