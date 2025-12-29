// Feed Formulation functionality

let selectedIngredients = [];
let lastCalculationResult = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Add ingredient button
    document.getElementById('addIngredientBtn').addEventListener('click', () => {
        document.getElementById('ingredientModal').classList.remove('hidden');
    });
    
    // Cancel ingredient button
    document.getElementById('cancelIngredient').addEventListener('click', () => {
        document.getElementById('ingredientModal').classList.add('hidden');
        document.getElementById('ingredientForm').reset();
    });
    
    // Ingredient form submit
    document.getElementById('ingredientForm').addEventListener('submit', handleAddIngredient);
    
    // Calculate button
    document.getElementById('calculateBtn').addEventListener('click', handleCalculateFormulation);
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', handleReset);
    
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
});

function handleAddIngredient(e) {
    e.preventDefault();
    
    const ingredient = {
        name: document.getElementById('ingredientName').value,
        cost_per_kg: parseFloat(document.getElementById('ingredientCost').value),
        protein_percent: parseFloat(document.getElementById('ingredientProtein').value) || 0,
        energy_me: parseFloat(document.getElementById('ingredientEnergy').value) || 0,
        calcium_percent: parseFloat(document.getElementById('ingredientCalcium').value) || 0,
        phosphorus_percent: parseFloat(document.getElementById('ingredientPhosphorus').value) || 0,
        min_percentage: parseFloat(document.getElementById('ingredientMin').value) || 0,
        max_percentage: parseFloat(document.getElementById('ingredientMax').value) || 1
    };
    
    selectedIngredients.push(ingredient);
    renderIngredientsList();
    
    document.getElementById('ingredientModal').classList.add('hidden');
    document.getElementById('ingredientForm').reset();
    showAlert('Ingredient added successfully!', 'success');
}

function renderIngredientsList() {
    const container = document.getElementById('ingredientsList');
    
    if (selectedIngredients.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                <p>No ingredients added yet. Click "Add Ingredient" to get started.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = selectedIngredients.map((ing, index) => `
        <div class="border border-gray-200 rounded-lg p-4 hover:border-farm-green transition-colors">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h4 class="font-bold text-gray-900 text-lg">${ing.name}</h4>
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
    
    const calculateBtn = document.getElementById('calculateBtn');
    const optimizationMethod = document.getElementById('optimizationMethod').value;
    
    try {
        calculateBtn.disabled = true;
        calculateBtn.textContent = 'Calculating...';
        
        const formulationData = {
            ingredients: selectedIngredients,
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
                <p class="text-4xl font-bold">$${summary.cost_per_kg.toFixed(4)}</p>
            </div>
            
            <!-- Ingredient Composition -->
            <div>
                <h4 class="font-bold text-gray-900 mb-3">Ingredient Mix</h4>
                <div class="space-y-2">
                    ${composition.filter(ing => ing.included).map(ing => `
                        <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span class="text-sm font-medium">${ing.name}</span>
                            <div class="text-right">
                                <span class="font-bold text-green-600">${ing.percentage.toFixed(2)}%</span>
                                <span class="text-xs text-gray-500 ml-2">$${ing.cost_contribution.toFixed(4)}</span>
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
                                    <span>${value.achieved.toFixed(2)} / ${value.required.toFixed(2)}</span>
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

function handleReset() {
    if (confirm('Are you sure you want to reset all fields?')) {
        document.getElementById('proteinRequirement').value = '';
        document.getElementById('energyRequirement').value = '';
        document.getElementById('calciumRequirement').value = '';
        document.getElementById('phosphorusRequirement').value = '';
        selectedIngredients = [];
        lastCalculationResult = null;
        renderIngredientsList();
        document.getElementById('resultsContent').innerHTML = `
            <div class="text-center text-gray-500 py-12">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p>Fill in the requirements and select ingredients to calculate the optimal formulation</p>
            </div>
        `;
        showAlert('Form reset successfully', 'info');
    }
}
