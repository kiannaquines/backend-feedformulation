// Ingredients management functionality

let allIngredients = [];
let editingIngredientId = null;

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    
    // Add ingredient button
    document.getElementById('addIngredientBtn').addEventListener('click', () => {
        editingIngredientId = null;
        document.getElementById('modalTitle').textContent = 'Add New Ingredient';
        document.getElementById('submitBtnText').textContent = 'Add Ingredient';
        document.getElementById('ingredientForm').reset();
        document.getElementById('is_available').checked = true;
        document.getElementById('ingredientModal').classList.remove('hidden');
    });
    
    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', () => {
        document.getElementById('ingredientModal').classList.add('hidden');
        document.getElementById('ingredientForm').reset();
        editingIngredientId = null;
    });
    
    // Form submit
    document.getElementById('ingredientForm').addEventListener('submit', handleFormSubmit);
    
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Load ingredients
    await loadIngredients();
});

async function loadIngredients() {
    try {
        const data = await API.ingredients.getAll();
        allIngredients = data.ingredients || [];
        renderIngredientsTable(allIngredients);
    } catch (error) {
        if (error.status_code === 404) {
            allIngredients = [];
            renderIngredientsTable([]);
        } else {
            showAlert(handleApiError(error, 'Failed to load ingredients'), 'error');
        }
    }
}

function renderIngredientsTable(ingredients) {
    const tbody = document.getElementById('ingredientsTableBody');
    
    if (ingredients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    <p>No ingredients found. Add your first ingredient to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = ingredients.map(ing => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="text-sm font-medium text-gray-900">${ing.name}</div>
                    ${!ing.is_available ? '<span class="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Unavailable</span>' : ''}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${ing.price.toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${ing.crude_protein.toFixed(1)}%</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${ing.metabolized_energy.toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${ing.calcium.toFixed(2)}%</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${ing.total_phosphorus.toFixed(2)}%</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                    onclick="editIngredient(${ing.id})"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                >
                    Edit
                </button>
                <button 
                    onclick="deleteIngredient(${ing.id}, '${ing.name}')"
                    class="text-red-600 hover:text-red-900"
                >
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allIngredients.filter(ing => 
        ing.name.toLowerCase().includes(searchTerm)
    );
    renderIngredientsTable(filtered);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const ingredientData = {
        name: document.getElementById('name').value,
        price: parseFloat(document.getElementById('price').value),
        crude_protein: parseFloat(document.getElementById('crude_protein').value),
        crude_fat: parseFloat(document.getElementById('crude_fat').value),
        crude_fiber: parseFloat(document.getElementById('crude_fiber').value),
        metabolized_energy: parseFloat(document.getElementById('metabolized_energy').value),
        calcium: parseFloat(document.getElementById('calcium').value),
        total_phosphorus: parseFloat(document.getElementById('total_phosphorus').value),
        avail_phosphorus: parseFloat(document.getElementById('avail_phosphorus').value),
        lysine: parseFloat(document.getElementById('lysine').value),
        methionine: parseFloat(document.getElementById('methionine').value),
        m_c: parseFloat(document.getElementById('m_c').value),
        is_available: document.getElementById('is_available').checked
    };
    
    try {
        if (editingIngredientId) {
            await API.ingredients.update(editingIngredientId, ingredientData);
            showAlert('Ingredient updated successfully!', 'success');
        } else {
            await API.ingredients.create(ingredientData);
            showAlert('Ingredient added successfully!', 'success');
        }
        
        document.getElementById('ingredientModal').classList.add('hidden');
        document.getElementById('ingredientForm').reset();
        editingIngredientId = null;
        
        await loadIngredients();
        
    } catch (error) {
        showAlert(handleApiError(error, 'Failed to save ingredient'), 'error');
    }
}

async function editIngredient(id) {
    try {
        const ingredient = await API.ingredients.getById(id);
        
        editingIngredientId = id;
        document.getElementById('modalTitle').textContent = 'Edit Ingredient';
        document.getElementById('submitBtnText').textContent = 'Update Ingredient';
        
        document.getElementById('ingredientId').value = ingredient.id;
        document.getElementById('name').value = ingredient.name;
        document.getElementById('price').value = ingredient.price;
        document.getElementById('crude_protein').value = ingredient.crude_protein;
        document.getElementById('crude_fat').value = ingredient.crude_fat;
        document.getElementById('crude_fiber').value = ingredient.crude_fiber;
        document.getElementById('metabolized_energy').value = ingredient.metabolized_energy;
        document.getElementById('calcium').value = ingredient.calcium;
        document.getElementById('total_phosphorus').value = ingredient.total_phosphorus;
        document.getElementById('avail_phosphorus').value = ingredient.avail_phosphorus;
        document.getElementById('lysine').value = ingredient.lysine;
        document.getElementById('methionine').value = ingredient.methionine;
        document.getElementById('m_c').value = ingredient.m_c;
        document.getElementById('is_available').checked = ingredient.is_available;
        
        document.getElementById('ingredientModal').classList.remove('hidden');
        
    } catch (error) {
        showAlert(handleApiError(error, 'Failed to load ingredient'), 'error');
    }
}

async function deleteIngredient(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        await API.ingredients.delete(id);
        showAlert('Ingredient deleted successfully!', 'success');
        await loadIngredients();
    } catch (error) {
        showAlert(handleApiError(error, 'Failed to delete ingredient'), 'error');
    }
}
