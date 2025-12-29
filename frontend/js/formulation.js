// Feed Formulation functionality

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

let selectedIngredients = [];
let lastCalculationResult = null;
let availableIngredients = []; // Store all ingredients from database
let nutrientProfiles = []; // Store all nutrient profiles from database

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadAvailableIngredients(); // Load ingredients on page load
    loadNutrientProfiles(); // Load nutrient profiles on page load
    
    // Nutrient profile selection
    document.getElementById('nutrientProfileSelect').addEventListener('change', handleNutrientProfileSelect);
    
    // Add ingredient button
    document.getElementById('addIngredientBtn').addEventListener('click', () => {
        document.getElementById('ingredientModal').classList.remove('hidden');
    });
    
    // Cancel ingredient button
    document.getElementById('cancelIngredient').addEventListener('click', () => {
        document.getElementById('ingredientModal').classList.add('hidden');
        document.getElementById('ingredientForm').reset();
        document.getElementById('existingIngredientSelect').value = '';
    });
    
    // Existing ingredient selection
    document.getElementById('existingIngredientSelect').addEventListener('change', handleExistingIngredientSelect);
    
    // Include toggle label update
    document.getElementById('ingredientIncluded').addEventListener('change', (e) => {
        document.getElementById('includeLabel').textContent = e.target.checked ? 'Included' : 'Excluded';
    });
    
    // Ingredient form submit
    document.getElementById('ingredientForm').addEventListener('submit', handleAddIngredient);
    
    // Calculate button
    document.getElementById('calculateBtn').addEventListener('click', handleCalculateFormulation);
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', handleReset);
    
    // Suggest ingredients button
    document.getElementById('suggestIngredientsBtn').addEventListener('click', handleSuggestIngredients);
    
    // Close suggestions button
    document.getElementById('closeSuggestionsBtn').addEventListener('click', () => {
        document.getElementById('suggestionsPanel').classList.add('hidden');
    });
    
    // Cancel save button
    const cancelSaveBtn = document.getElementById('cancelSave');
    if (cancelSaveBtn) {
        cancelSaveBtn.addEventListener('click', () => {
            document.getElementById('saveModal').classList.add('hidden');
            document.getElementById('saveForm').reset();
        });
    }
    
    // Save form submit
    const saveForm = document.getElementById('saveForm');
    if (saveForm) {
        saveForm.addEventListener('submit', handleSaveFormulation);
    }
    
    // Chat functionality
    const toggleChatBtn = document.getElementById('toggleChatBtn');
    const chatPanel = document.getElementById('chatPanel');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');
    
    if (toggleChatBtn && chatMessages && chatInput && sendChatBtn) {
        let chatVisible = true;
        
        toggleChatBtn.addEventListener('click', () => {
            chatVisible = !chatVisible;
            if (chatVisible) {
                chatMessages.classList.remove('hidden');
                chatInput.parentElement.classList.remove('hidden');
                toggleChatBtn.textContent = 'Hide';
            } else {
                chatMessages.classList.add('hidden');
                chatInput.parentElement.classList.add('hidden');
                toggleChatBtn.textContent = 'Show';
            }
        });
        
        sendChatBtn.addEventListener('click', handleChatMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleChatMessage();
            }
        });
    }
    
    // AI Status Check
    const testAiBtn = document.getElementById('testAiBtn');
    if (testAiBtn) {
        testAiBtn.addEventListener('click', checkAIStatus);
    }
    
    // Check AI status on page load
    checkAIStatus();
});

async function loadNutrientProfiles() {
    try {
        const response = await API.nutrientRequirements.getAll();
        // Handle both direct array and wrapped response
        nutrientProfiles = response.nutrient_requirements || response;
        
        // Populate the select dropdown
        const select = document.getElementById('nutrientProfileSelect');
        select.innerHTML = '<option value="">-- Select a nutrient profile or enter manually below --</option>';
        
        if (nutrientProfiles.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No profiles found. Create one in Nutrient Requirements page.';
            option.disabled = true;
            select.appendChild(option);
        } else {
            nutrientProfiles.forEach(profile => {
                const option = document.createElement('option');
                option.value = profile.id;
                
                // Parse composition if it's a string
                const comp = typeof profile.composition === 'string' 
                    ? JSON.parse(profile.composition) 
                    : profile.composition;
                
                // Use correct field name: nutrient_requirement_name
                const name = profile.nutrient_requirement_name || profile.name;
                option.textContent = `${name} - Protein: ${comp.protein_percent}%, Energy: ${comp.energy_me} ME`;
                select.appendChild(option);
            });
            
            console.log(`Loaded ${nutrientProfiles.length} nutrient profiles`);
        }
        
    } catch (error) {
        console.error('Failed to load nutrient profiles:', error);
        showAlert('Failed to load nutrient profiles. You can still enter manually.', 'warning');
    }
}

function handleNutrientProfileSelect(e) {
    const selectedId = e.target.value;
    
    if (!selectedId) {
        return;
    }
    
    const profile = nutrientProfiles.find(p => p.id == selectedId);
    
    if (profile) {
        // Parse composition if it's a string
        const comp = typeof profile.composition === 'string' 
            ? JSON.parse(profile.composition) 
            : profile.composition;
        
        // Pre-fill nutrient requirement fields
        document.getElementById('proteinRequirement').value = comp.protein_percent || '';
        document.getElementById('energyRequirement').value = comp.energy_me || '';
        document.getElementById('calciumRequirement').value = comp.calcium_percent || '';
        document.getElementById('phosphorusRequirement').value = comp.phosphorus_percent || '';
        
        const name = profile.nutrient_requirement_name || profile.name;
        showAlert(`✓ Loaded "${name}" profile. You can modify values if needed.`, 'success');
        
        console.log('Loaded profile:', profile);
    } else {
        showAlert('Profile not found. Please try again.', 'error');
    }
}

async function loadAvailableIngredients() {
    try {
        const response = await API.ingredients.getAll();
        // Handle both direct array and wrapped response
        const ingredients = response.ingredients || response;
        availableIngredients = ingredients;
        
        // Populate the select dropdown
        const select = document.getElementById('existingIngredientSelect');
        select.innerHTML = '<option value="">-- Select an ingredient to auto-fill data --</option>';
        
        if (ingredients.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No ingredients found. Add ingredients first in Manage Ingredients page.';
            option.disabled = true;
            select.appendChild(option);
            showAlert('No ingredients found in database. Please add ingredients first.', 'info');
        } else {
            // Filter only available ingredients
            const availableOnly = ingredients.filter(ing => ing.is_available !== false);
            
            if (availableOnly.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No available ingredients. Please mark ingredients as available.';
                option.disabled = true;
                select.appendChild(option);
            } else {
                availableOnly.forEach(ing => {
                    const option = document.createElement('option');
                    option.value = ing.id;
                    // Use correct field names: price (not cost_per_kg), crude_protein (not protein_percent)
                    const price = parseFloat(ing.price || 0).toFixed(2);
                    const protein = parseFloat(ing.crude_protein || 0).toFixed(1);
                    option.textContent = `${ing.name} - ${formatCurrency(parseFloat(ing.price || 0))}/kg - Protein: ${protein}%`;
                    select.appendChild(option);
                });
                
                console.log(`Loaded ${availableOnly.length} available ingredients`);
            }
        }
        
    } catch (error) {
        console.error('Failed to load ingredients:', error);
        showAlert('Failed to load ingredients from database. You can still enter manually.', 'error');
        
        // Show error details in console for debugging
        if (error.message) {
            console.error('Error details:', error.message);
        }
    }
}

function handleExistingIngredientSelect(e) {
    const selectedId = e.target.value;
    
    if (!selectedId) {
        // Clear the form if no ingredient selected
        document.getElementById('ingredientForm').reset();
        return;
    }
    
    const ingredient = availableIngredients.find(ing => ing.id == selectedId);
    
    if (ingredient) {
        // Map API field names to form fields
        // API uses: price, crude_protein, metabolized_energy, calcium, avail_phosphorus
        // Form uses: cost, protein, energy, calcium, phosphorus
        
        document.getElementById('ingredientName').value = ingredient.name || '';
        document.getElementById('ingredientCost').value = parseFloat(ingredient.price) || 0;
        document.getElementById('ingredientProtein').value = parseFloat(ingredient.crude_protein) || 0;
        document.getElementById('ingredientEnergy').value = parseFloat(ingredient.metabolized_energy) || 0;
        document.getElementById('ingredientCalcium').value = parseFloat(ingredient.calcium) || 0;
        document.getElementById('ingredientPhosphorus').value = parseFloat(ingredient.avail_phosphorus || ingredient.total_phosphorus) || 0;
        
        // Set default min/max if not in API (these fields don't exist in your API)
        document.getElementById('ingredientMin').value = 0;
        document.getElementById('ingredientMax').value = 1;
        
        // Show success feedback
        showAlert(`✓ Loaded "${ingredient.name}" from database. Modify values if needed before adding.`, 'success');
        
        // Log for debugging
        console.log('Loaded ingredient:', ingredient);
    } else {
        showAlert('Ingredient not found. Please try again.', 'error');
    }
}

function handleAddIngredient(e) {
    e.preventDefault();
    
    const ingredientName = document.getElementById('ingredientName').value.trim();
    
    // Check if ingredient already added
    if (selectedIngredients.some(ing => ing.name.toLowerCase() === ingredientName.toLowerCase())) {
        showAlert(`${ingredientName} is already added to this formulation!`, 'warning');
        return;
    }
    
    const ingredient = {
        name: ingredientName,
        cost_per_kg: parseFloat(document.getElementById('ingredientCost').value),
        protein_percent: parseFloat(document.getElementById('ingredientProtein').value) || 0,
        energy_me: parseFloat(document.getElementById('ingredientEnergy').value) || 0,
        calcium_percent: parseFloat(document.getElementById('ingredientCalcium').value) || 0,
        phosphorus_percent: parseFloat(document.getElementById('ingredientPhosphorus').value) || 0,
        min_percentage: parseFloat(document.getElementById('ingredientMin').value) || 0,
        max_percentage: parseFloat(document.getElementById('ingredientMax').value) || 1,
        included: document.getElementById('ingredientIncluded').checked // Read from toggle
    };
    
    selectedIngredients.push(ingredient);
    renderIngredientsList();
    
    document.getElementById('ingredientModal').classList.add('hidden');
    document.getElementById('ingredientForm').reset();
    document.getElementById('existingIngredientSelect').value = '';
    document.getElementById('ingredientIncluded').checked = true;
    document.getElementById('includeLabel').textContent = 'Included';
    showAlert(`${ingredientName} added successfully!`, 'success');
}

function renderIngredientsList() {
    const container = document.getElementById('ingredientsList');
    
    if (selectedIngredients.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                <p class="font-medium">No ingredients added yet</p>
                <p class="text-sm mt-1">Click "Add Ingredient" to select from your library or enter manually</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mb-4">
            <p class="text-sm text-blue-800">
                <strong>${selectedIngredients.length} ingredient(s)</strong> selected for optimization
            </p>
        </div>
    ` + selectedIngredients.map((ing, index) => `
        <div class="border border-gray-200 rounded-lg p-4 hover:border-farm-green transition-colors ${ing.included ? '' : 'opacity-50 bg-gray-50'}">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" ${ing.included ? 'checked' : ''} onchange="toggleIngredient(${index})" class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            <span class="ml-2 text-xs font-medium ${ing.included ? 'text-green-600' : 'text-gray-500'}">${ing.included ? 'Included' : 'Excluded'}</span>
                        </label>
                        <h4 class="font-bold text-gray-900 text-lg">${ing.name}</h4>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-sm">
                        <div>
                            <span class="text-gray-500">Cost:</span>
                            <span class="font-semibold ml-1">$${ing.cost_per_kg.toFixed(2)}/kg</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Protein:</span>
                            <span class="font-semibold ml-1">${ing.protein_percent}%</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Energy:</span>
                            <span class="font-semibold ml-1">${ing.energy_me} ME</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Calcium:</span>
                            <span class="font-semibold ml-1">${ing.calcium_percent}%</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Phosphorus:</span>
                            <span class="font-semibold ml-1">${ing.phosphorus_percent}%</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Range:</span>
                            <span class="font-semibold ml-1">${(ing.min_percentage * 100).toFixed(0)}-${(ing.max_percentage * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
                <button 
                    onclick="removeIngredient(${index})"
                    class="ml-4 text-red-500 hover:text-red-700 transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function toggleIngredient(index) {
    selectedIngredients[index].included = !selectedIngredients[index].included;
    renderIngredientsList();
    const ingredientName = selectedIngredients[index].name;
    const status = selectedIngredients[index].included ? 'included' : 'excluded';
    showAlert(`${ingredientName} ${status} from formulation`, 'info');
}

function removeIngredient(index) {
    selectedIngredients.splice(index, 1);
    renderIngredientsList();
    showAlert('Ingredient removed', 'info');
}

async function handleCalculateFormulation() {
    // Validate inputs
    const proteinReq = parseFloat(document.getElementById('proteinRequirement').value);
    const energyReq = parseFloat(document.getElementById('energyRequirement').value);
    const calciumReq = parseFloat(document.getElementById('calciumRequirement').value);
    const phosphorusReq = parseFloat(document.getElementById('phosphorusRequirement').value);
    
    if (!proteinReq || !energyReq || !calciumReq || !phosphorusReq) {
        showAlert('Please fill in all nutrient requirements', 'error');
        return;
    }
    
    if (selectedIngredients.length === 0) {
        showAlert('Please add at least one ingredient', 'error');
        return;
    }
    
    // Filter only included ingredients
    const includedIngredients = selectedIngredients.filter(ing => ing.included);
    
    if (includedIngredients.length === 0) {
        showAlert('Please include at least one ingredient for calculation', 'error');
        return;
    }
    
    const calculateBtn = document.getElementById('calculateBtn');
    const optimizationMethod = document.getElementById('optimizationMethod').value;
    
    try {
        calculateBtn.disabled = true;
        calculateBtn.textContent = 'Calculating...';
        
        const formulationData = {
            ingredients: includedIngredients,
            nutrient_requirements: {
                protein_percent: proteinReq,
                energy_me: energyReq,
                calcium_percent: calciumReq,
                phosphorus_percent: phosphorusReq
            },
            optimization_method: optimizationMethod
        };
        
        const result = await API.formulation.calculate(formulationData);
        lastCalculationResult = result;
        
        displayResults(result);
        
    } catch (error) {
        showAlert(handleApiError(error, 'Failed to calculate formulation'), 'error');
    } finally {
        calculateBtn.disabled = false;
        calculateBtn.textContent = 'Calculate Optimal Formulation';
    }
}

function displayResults(result) {
    const resultsContent = document.getElementById('resultsContent');
    
    if (result.status === 'failure') {
        resultsContent.innerHTML = `
            <div class="text-center text-red-600">
                <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h4 class="text-lg font-bold mb-2">No Solution Found</h4>
                <p class="text-sm text-gray-600 mb-4">${result.detail}</p>
                ${result.error_details ? `
                    <div class="text-left bg-red-50 rounded-lg p-4 text-xs">
                        <p class="font-semibold mb-2">Possible causes:</p>
                        <ul class="list-disc pl-5 space-y-1">
                            ${result.error_details.possible_causes.map(cause => `<li>${cause}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
        return;
    }
    
    // Success result
    const summary = result.summary;
    const composition = result.ingredient_composition;
    const nutrients = result.nutrient_achievement;
    
    resultsContent.innerHTML = `
        <div class="space-y-6">
            <!-- Cost Summary -->
            <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white text-center">
                <p class="text-sm opacity-90 mb-1">Total Cost per kg</p>
                <p class="text-4xl font-bold">${formatCurrency(summary.cost_per_kg)}</p>
            </div>
            
            <!-- Ingredient Composition -->
            <div>
                <h4 class="font-bold text-gray-900 mb-3">Ingredient Mix</h4>
                <div class="space-y-2">
                    ${composition.filter(ing => ing.included).map(ing => `
                        <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span class="text-sm font-medium">${ing.name}</span>
                            <div class="text-right">
                                <span class="font-bold text-green-600">${formatPercentage(ing.percentage)}%</span>
                                <span class="text-xs text-gray-500 ml-2">${formatCurrency(ing.cost_contribution)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Nutrient Achievement -->
            <div>
                <h4 class="font-bold text-gray-900 mb-3">Nutrient Levels</h4>
                <div class="space-y-3 text-sm">
                    ${Object.entries(nutrients).map(([key, value]) => {
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
            
            <!-- Action Buttons -->
            <div class="space-y-2 pt-4">
                <button 
                    onclick="openSaveModal()"
                    class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                    Save Formulation
                </button>
                <button 
                    onclick="printResults()"
                    class="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                    Print Results
                </button>
            </div>
        </div>
    `;
}

function openSaveModal() {
    if (!lastCalculationResult) {
        showAlert('No formulation to save', 'error');
        return;
    }
    document.getElementById('saveModal').classList.remove('hidden');
}

async function handleSaveFormulation(e) {
    e.preventDefault();
    
    if (!lastCalculationResult) {
        showAlert('No formulation to save', 'error');
        return;
    }
    
    const name = document.getElementById('formulationName').value;
    const description = document.getElementById('formulationDescription').value;
    const user = getUserInfo();
    
    if (!user) {
        showAlert('User not authenticated', 'error');
        return;
    }
    
    try {
        await API.formulation.save(name, description, user.id, lastCalculationResult);
        
        showAlert('Formulation saved successfully!', 'success');
        document.getElementById('saveModal').classList.add('hidden');
        document.getElementById('saveForm').reset();
        
    } catch (error) {
        showAlert(handleApiError(error, 'Failed to save formulation'), 'error');
    }
}

function printResults() {
    window.print();
}

async function handleSuggestIngredients() {
    try {
        // Get current nutrient requirements
        const protein = parseFloat(document.getElementById('proteinRequirement').value) || 0;
        const energy = parseFloat(document.getElementById('energyRequirement').value) || 0;
        const calcium = parseFloat(document.getElementById('calciumRequirement').value) || 0;
        const phosphorus = parseFloat(document.getElementById('phosphorusRequirement').value) || 0;
        
        // Validate requirements
        if (protein === 0 && energy === 0 && calcium === 0 && phosphorus === 0) {
            showAlert('Please enter at least one nutrient requirement to get AI suggestions', 'warning');
            return;
        }
        
        // Show loading state
        const suggestBtn = document.getElementById('suggestIngredientsBtn');
        const originalText = suggestBtn.innerHTML;
        suggestBtn.disabled = true;
        suggestBtn.innerHTML = `
            <svg class="animate-spin h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Analyzing...
        `;
        
        // Prepare excluded ingredient names
        const excludedNames = selectedIngredients.map(ing => ing.name);
        
        // Call AI suggestion endpoint
        const suggestions = await API.ingredients.aiSuggest({
            protein_percent: protein,
            energy_me: energy,
            calcium_percent: calcium,
            phosphorus_percent: phosphorus,
            excluded_ingredient_names: excludedNames,
            top_n: 5
        });
        
        // Restore button
        suggestBtn.disabled = false;
        suggestBtn.innerHTML = originalText;
        
        if (!suggestions || suggestions.length === 0) {
            showAlert('No suitable ingredient suggestions found. Try adjusting your requirements.', 'info');
            return;
        }
        
        // Display AI suggestions
        displayAISuggestions(suggestions);
        
    } catch (error) {
        // Restore button on error
        const suggestBtn = document.getElementById('suggestIngredientsBtn');
        suggestBtn.disabled = false;
        suggestBtn.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            Get Suggestions
        `;
        showAlert(handleApiError(error, 'Failed to generate AI suggestions'), 'error');
    }
}

function displayAISuggestions(suggestions) {
    const panel = document.getElementById('suggestionsPanel');
    const content = document.getElementById('suggestionsContent');
    
    content.innerHTML = suggestions.map((item) => {
        const matchScore = Math.round(item.match_score);
        const barColor = matchScore >= 70 ? 'bg-green-500' : matchScore >= 50 ? 'bg-yellow-500' : 'bg-blue-500';
        const badgeColor = matchScore >= 70 ? 'bg-green-100 text-green-800' : matchScore >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800';
        
        return `
            <div class="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <h4 class="font-bold text-gray-900 text-lg">${item.ingredient_name}</h4>
                            <span class="text-xs px-3 py-1 rounded-full font-semibold ${badgeColor}">
                                ${matchScore}% Match
                            </span>
                        </div>
                        
                        <!-- Match Score Bar -->
                        <div class="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div class="${barColor} h-2 rounded-full transition-all duration-500" style="width: ${matchScore}%"></div>
                        </div>
                        
                        <!-- AI Reasons -->
                        <div class="flex flex-wrap gap-2 mb-3">
                            ${item.reasons.map(reason => `
                                <span class="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    ${reason}
                                </span>
                            `).join('')}
                        </div>
                        
                        ${item.ai_insight ? `
                        <!-- AI Insight -->
                        <div class="mb-3 p-2 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400 rounded-r-lg">
                            <div class="flex items-start gap-2">
                                <svg class="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                                </svg>
                                <div>
                                    <span class="text-xs font-semibold text-purple-700">AI Insight:</span>
                                    <p class="text-xs text-purple-800 italic">${item.ai_insight}</p>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                        
                        <!-- Nutritional Details -->
                        <div class="grid grid-cols-2 gap-2 text-xs text-gray-700 bg-gray-50 p-3 rounded-lg">
                            <div class="flex items-center gap-2">
                                <span class="font-semibold">Protein:</span>
                                <span>${item.nutritional_info.protein.toFixed(1)}%</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-semibold">Energy:</span>
                                <span>${item.nutritional_info.energy.toFixed(2)} ME</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-semibold">Calcium:</span>
                                <span>${item.nutritional_info.calcium.toFixed(2)}%</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-semibold">Phosphorus:</span>
                                <span>${item.nutritional_info.phosphorus.toFixed(2)}%</span>
                            </div>
                            <div class="flex items-center gap-2 col-span-2">
                                <span class="font-semibold">Cost:</span>
                                <span class="text-green-600 font-bold">${formatCurrency(item.nutritional_info.price)}/kg</span>
                            </div>
                        </div>
                        
                        <!-- Detailed Scores -->
                        <details class="mt-2">
                            <summary class="text-xs text-gray-600 cursor-pointer hover:text-gray-900">View detailed scores</summary>
                            <div class="mt-2 text-xs space-y-1 text-gray-600">
                                <div class="flex justify-between">
                                    <span>Protein Match:</span>
                                    <span class="font-semibold">${item.detailed_scores.protein_match.toFixed(1)}%</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Energy Match:</span>
                                    <span class="font-semibold">${item.detailed_scores.energy_match.toFixed(1)}%</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Calcium Match:</span>
                                    <span class="font-semibold">${item.detailed_scores.calcium_match.toFixed(1)}%</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Phosphorus Match:</span>
                                    <span class="font-semibold">${item.detailed_scores.phosphorus_match.toFixed(1)}%</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Cost Efficiency:</span>
                                    <span class="font-semibold">${item.detailed_scores.cost_efficiency.toFixed(1)}%</span>
                                </div>
                            </div>
                        </details>
                    </div>
                    
                    <!-- Add Button -->
                    <button 
                        onclick="addSuggestedIngredient(${item.ingredient_id}, '${item.ingredient_name.replace(/'/g, "\\'")}')"
                        class="flex-shrink-0 bg-farm-green text-white px-4 py-2.5 rounded-lg hover:bg-farm-accent transition-colors text-sm font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Add
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    panel.classList.remove('hidden');
    
    // Scroll to suggestions
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function addSuggestedIngredient(ingredientId, ingredientName) {
    try {
        const ingredient = await API.ingredients.getById(ingredientId);
        
        // Add to selected ingredients with default constraints
        const newIngredient = {
            name: ingredient.name,
            cost_per_kg: ingredient.price,
            protein_percent: ingredient.crude_protein,
            energy_me: ingredient.metabolized_energy,
            calcium_percent: ingredient.calcium,
            phosphorus_percent: ingredient.total_phosphorus,
            min_percentage: 0,
            max_percentage: 1,
            included: true
        };
        
        selectedIngredients.push(newIngredient);
        renderIngredientsList();
        
        showAlert(`${ingredient.name} added to formulation!`, 'success');
        
        // Refresh suggestions to remove added ingredient
        await handleSuggestIngredients();
        
    } catch (error) {
        showAlert(handleApiError(error, 'Failed to add ingredient'), 'error');
    }
}

function handleReset() {
    if (confirm('Are you sure you want to reset all fields and clear selections?')) {
        // Clear nutrient requirements
        document.getElementById('proteinRequirement').value = '';
        document.getElementById('energyRequirement').value = '';
        document.getElementById('calciumRequirement').value = '';
        document.getElementById('phosphorusRequirement').value = '';
        
        // Clear nutrient profile selection
        document.getElementById('nutrientProfileSelect').value = '';
        
        // Clear selected ingredients
        selectedIngredients = [];
        lastCalculationResult = null;
        renderIngredientsList();
        
        // Reset results panel
        document.getElementById('resultsContent').innerHTML = `
            <div class="text-center text-gray-500 py-12">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p>Fill in the requirements and select ingredients to calculate the optimal formulation</p>
            </div>
        `;
        
        // Reset optimization method to default
        document.getElementById('optimizationMethod').value = 'highs';
        
        showAlert('Form reset successfully - Ready to create new formulation', 'info');
    }
}

// Chat Assistant Functions
async function handleChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addChatMessage(message, 'user');
    chatInput.value = '';
    
    // Show loading indicator
    const loadingId = addChatMessage('Thinking...', 'ai', true);
    
    try {
        // Get current nutrient requirements
        const protein_percent = parseFloat(document.getElementById('proteinPercent').value) || null;
        const energy_me = parseFloat(document.getElementById('energyME').value) || null;
        const calcium_percent = parseFloat(document.getElementById('calciumPercent').value) || null;
        const phosphorus_percent = parseFloat(document.getElementById('phosphorusPercent').value) || null;
        
        // Get selected ingredient names
        const selected_ingredient_names = selectedIngredients.map(ing => ing.name);
        
        // Call AI chat endpoint
        const response = await API.ingredients.aiChat({
            message: message,
            protein_percent: protein_percent,
            energy_me: energy_me,
            calcium_percent: calcium_percent,
            phosphorus_percent: phosphorus_percent,
            selected_ingredient_names: selected_ingredient_names
        });
        
        // Remove loading message
        removeChatMessage(loadingId);
        
        // Add AI response
        addChatMessage(response.response, 'ai');
        
        // Handle actions
        if (response.action === 'add_ingredient' && response.ingredient_name) {
            // Find the ingredient in available ingredients
            const ingredient = availableIngredients.find(
                ing => ing.name.toLowerCase() === response.ingredient_name.toLowerCase()
            );
            
            if (ingredient) {
                // Check if already added
                const alreadyAdded = selectedIngredients.some(
                    ing => ing.name.toLowerCase() === ingredient.name.toLowerCase()
                );
                
                if (!alreadyAdded) {
                    // Add the ingredient
                    const newIngredient = {
                        ...ingredient,
                        min_percentage: 0,
                        max_percentage: 1,
                        included: true
                    };
                    
                    selectedIngredients.push(newIngredient);
                    renderIngredientsList();
                    
                    // Show success message in chat
                    addChatMessage(
                        `✅ ${ingredient.name} has been added to your formulation! ${response.reasoning || ''}`,
                        'system'
                    );
                    
                    showAlert(`${ingredient.name} added successfully!`, 'success');
                } else {
                    addChatMessage(
                        `ℹ️ ${ingredient.name} is already in your formulation.`,
                        'system'
                    );
                }
            } else {
                addChatMessage(
                    `❌ Sorry, I couldn't find "${response.ingredient_name}" in the database.`,
                    'system'
                );
            }
        }
        
    } catch (error) {
        removeChatMessage(loadingId);
        addChatMessage('Sorry, I encountered an error. Please try again.', 'ai');
        showAlert(handleApiError(error, 'Failed to process chat message'), 'error');
    }
}

function addChatMessage(text, type, isLoading = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageId = `msg-${Date.now()}`;
    
    const messageDiv = document.createElement('div');
    messageDiv.id = messageId;
    messageDiv.className = 'flex items-start gap-2';
    
    if (type === 'user') {
        messageDiv.innerHTML = `
            <div class="flex-1"></div>
            <div class="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg px-4 py-2 max-w-[85%]">
                <p class="text-sm">${text}</p>
            </div>
            <div class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                U
            </div>
        `;
    } else if (type === 'ai') {
        messageDiv.innerHTML = `
            <div class="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                AI
            </div>
            <div class="bg-gray-100 rounded-lg px-4 py-2 max-w-[85%]">
                <p class="text-sm text-gray-800">${isLoading ? '<span class="inline-block animate-pulse">Thinking...</span>' : text}</p>
            </div>
        `;
    } else if (type === 'system') {
        messageDiv.innerHTML = `
            <div class="flex-1 mx-auto">
                <div class="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center">
                    <p class="text-sm text-green-800">${text}</p>
                </div>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageId;
}

function removeChatMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
        message.remove();
    }
}

// AI Status Check Functions
async function checkAIStatus() {
    const statusDot = document.getElementById('aiStatusDot');
    const statusText = document.getElementById('aiStatusText');
    const testBtn = document.getElementById('testAiBtn');
    
    if (!statusDot || !statusText) return;
    
    // Show loading state
    statusDot.className = 'w-3 h-3 rounded-full bg-gray-400 animate-pulse';
    statusText.textContent = 'Testing...';
    if (testBtn) testBtn.disabled = true;
    
    try {
        const status = await API.ingredients.aiStatus();
        
        if (status.api_available) {
            // Success - Green indicator
            statusDot.className = 'w-3 h-3 rounded-full bg-green-400 animate-pulse';
            statusText.textContent = `AI Online (${status.model_name})`;
            statusText.title = `${status.message}\nTest: ${status.test_response}`;
        } else {
            // Error - Red indicator
            statusDot.className = 'w-3 h-3 rounded-full bg-red-400';
            statusText.textContent = 'AI Offline';
            statusText.title = status.message;
            console.error('AI Status Error:', status.message);
        }
    } catch (error) {
        // Connection error - Red indicator
        statusDot.className = 'w-3 h-3 rounded-full bg-red-400';
        statusText.textContent = 'AI Error';
        statusText.title = 'Failed to check AI status';
        console.error('Failed to check AI status:', error);
    } finally {
        if (testBtn) testBtn.disabled = false;
    }
}
