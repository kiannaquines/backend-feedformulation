// Ingredients management functionality

// Currency helpers
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
    return `${value.toFixed(settings.percentageDecimalPlaces)}%`;
}

let allIngredients = [];
let filteredIngredients = [];
let editingIngredientId = null;

// Filter state
let filters = {
    searchTerm: '',
    priceMin: null,
    priceMax: null,
    proteinMin: null,
    proteinMax: null,
    energyMin: null,
    energyMax: null,
    availability: 'all',
    sortBy: 'name-asc'
};

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
    
    // Toggle filters panel
    const toggleBtn = document.getElementById('toggleFiltersBtn');
    console.log('Toggle button found:', toggleBtn);
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleFiltersPanel);
        console.log('Event listener attached to toggle button');
    } else {
        console.error('toggleFiltersBtn not found in DOM');
    }
    
    // Apply filters button
    document.getElementById('applyFiltersBtn').addEventListener('click', applyFilters);
    
    // Clear filters button
    document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
    
    // Sort change
    document.getElementById('sortBy').addEventListener('change', (e) => {
        filters.sortBy = e.target.value;
        applyFilters();
    });
    
    // Load ingredients
    await loadIngredients();
});

async function loadIngredients() {
    try {
        const data = await API.ingredients.getAll();
        allIngredients = data.ingredients || [];
        applyFilters();
    } catch (error) {
        if (error.status_code === 404) {
            allIngredients = [];
            filteredIngredients = [];
            renderIngredientsTable([]);
        } else {
            showAlert(handleApiError(error, 'Failed to load ingredients'), 'error');
        }
    }
}

function toggleFiltersPanel() {
    console.log('toggleFiltersPanel called');
    const panel = document.getElementById('filtersPanel');
    const arrow = document.getElementById('filterArrow');
    
    console.log('Panel:', panel, 'Arrow:', arrow);
    
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        arrow.style.transform = 'rotate(180deg)';
        console.log('Panel opened');
    } else {
        panel.classList.add('hidden');
        arrow.style.transform = 'rotate(0deg)';
        console.log('Panel closed');
    }
}

function handleSearch(e) {
    filters.searchTerm = e.target.value.toLowerCase();
    applyFilters();
}

function applyFilters() {
    // Get filter values (check if elements exist first)
    const priceMinEl = document.getElementById('priceMin');
    const priceMaxEl = document.getElementById('priceMax');
    const proteinMinEl = document.getElementById('proteinMin');
    const proteinMaxEl = document.getElementById('proteinMax');
    const energyMinEl = document.getElementById('energyMin');
    const energyMaxEl = document.getElementById('energyMax');
    const availabilityEl = document.getElementById('availabilityFilter');
    
    if (priceMinEl) filters.priceMin = parseFloat(priceMinEl.value) || null;
    if (priceMaxEl) filters.priceMax = parseFloat(priceMaxEl.value) || null;
    if (proteinMinEl) filters.proteinMin = parseFloat(proteinMinEl.value) || null;
    if (proteinMaxEl) filters.proteinMax = parseFloat(proteinMaxEl.value) || null;
    if (energyMinEl) filters.energyMin = parseFloat(energyMinEl.value) || null;
    if (energyMaxEl) filters.energyMax = parseFloat(energyMaxEl.value) || null;
    if (availabilityEl) filters.availability = availabilityEl.value;
    
    // Filter ingredients
    filteredIngredients = allIngredients.filter(ing => {
        // Search term filter
        if (filters.searchTerm && !ing.name.toLowerCase().includes(filters.searchTerm)) {
            return false;
        }
        
        // Price range filter
        if (filters.priceMin !== null && ing.price < filters.priceMin) {
            return false;
        }
        if (filters.priceMax !== null && ing.price > filters.priceMax) {
            return false;
        }
        
        // Protein range filter
        if (filters.proteinMin !== null && ing.crude_protein < filters.proteinMin) {
            return false;
        }
        if (filters.proteinMax !== null && ing.crude_protein > filters.proteinMax) {
            return false;
        }
        
        // Energy range filter
        if (filters.energyMin !== null && ing.metabolized_energy < filters.energyMin) {
            return false;
        }
        if (filters.energyMax !== null && ing.metabolized_energy > filters.energyMax) {
            return false;
        }
        
        // Availability filter
        if (filters.availability === 'available' && !ing.is_available) {
            return false;
        }
        if (filters.availability === 'unavailable' && ing.is_available) {
            return false;
        }
        
        return true;
    });
    
    // Sort ingredients
    sortIngredients(filteredIngredients, filters.sortBy);
    
    // Update active filters display
    updateActiveFiltersDisplay();
    
    // Render table
    renderIngredientsTable(filteredIngredients);
}

function sortIngredients(ingredients, sortBy) {
    const [field, direction] = sortBy.split('-');
    
    ingredients.sort((a, b) => {
        let aVal, bVal;
        
        switch(field) {
            case 'name':
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
                break;
            case 'price':
                aVal = a.price;
                bVal = b.price;
                break;
            case 'protein':
                aVal = a.crude_protein;
                bVal = b.crude_protein;
                break;
            case 'energy':
                aVal = a.metabolized_energy;
                bVal = b.metabolized_energy;
                break;
            default:
                return 0;
        }
        
        if (direction === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
}

function updateActiveFiltersDisplay() {
    const activeFilters = [];
    
    if (filters.searchTerm) {
        activeFilters.push({ label: `Search: \"${filters.searchTerm}\"`, clear: () => {
            document.getElementById('searchInput').value = '';
            filters.searchTerm = '';
        }});
    }
    
    if (filters.priceMin !== null || filters.priceMax !== null) {
        const settings = getAppSettings();
        const symbol = CURRENCY_SYMBOLS[settings.currency];
        const min = filters.priceMin !== null ? filters.priceMin : '0';
        const max = filters.priceMax !== null ? filters.priceMax : '∞';
        activeFilters.push({ label: `Price: ${symbol}${min} - ${symbol}${max}`, clear: () => {
            document.getElementById('priceMin').value = '';
            document.getElementById('priceMax').value = '';
            filters.priceMin = null;
            filters.priceMax = null;
        }});
    }
    
    if (filters.proteinMin !== null || filters.proteinMax !== null) {
        const min = filters.proteinMin !== null ? filters.proteinMin : '0';
        const max = filters.proteinMax !== null ? filters.proteinMax : '∞';
        activeFilters.push({ label: `Protein: ${min}% - ${max}%`, clear: () => {
            document.getElementById('proteinMin').value = '';
            document.getElementById('proteinMax').value = '';
            filters.proteinMin = null;
            filters.proteinMax = null;
        }});
    }
    
    if (filters.energyMin !== null || filters.energyMax !== null) {
        const min = filters.energyMin !== null ? filters.energyMin : '0';
        const max = filters.energyMax !== null ? filters.energyMax : '∞';
        activeFilters.push({ label: `Energy: ${min} - ${max}`, clear: () => {
            document.getElementById('energyMin').value = '';
            document.getElementById('energyMax').value = '';
            filters.energyMin = null;
            filters.energyMax = null;
        }});
    }
    
    if (filters.availability !== 'all') {
        activeFilters.push({ label: `Status: ${filters.availability}`, clear: () => {
            document.getElementById('availabilityFilter').value = 'all';
            filters.availability = 'all';
        }});
    }
    
    const container = document.getElementById('activeFiltersContainer');
    const list = document.getElementById('activeFiltersList');
    
    if (activeFilters.length > 0) {
        container.classList.remove('hidden');
        list.innerHTML = activeFilters.map((filter, index) => `
            <span class=\"inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm\">
                ${filter.label}
                <button onclick=\"clearSpecificFilter(${index})\" class=\"hover:bg-blue-200 rounded-full p-0.5\">
                    <svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                        <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M6 18L18 6M6 6l12 12\"></path>
                    </svg>
                </button>
            </span>
        `).join('');
        
        // Store clear functions globally
        window.activeFilterClearFunctions = activeFilters.map(f => f.clear);
    } else {
        container.classList.add('hidden');
    }
}

function clearSpecificFilter(index) {
    if (window.activeFilterClearFunctions && window.activeFilterClearFunctions[index]) {
        window.activeFilterClearFunctions[index]();
        applyFilters();
    }
}

function clearFilters() {
    // Reset all filter inputs
    document.getElementById('searchInput').value = '';
    document.getElementById('priceMin').value = '';
    document.getElementById('priceMax').value = '';
    document.getElementById('proteinMin').value = '';
    document.getElementById('proteinMax').value = '';
    document.getElementById('energyMin').value = '';
    document.getElementById('energyMax').value = '';
    document.getElementById('availabilityFilter').value = 'all';
    document.getElementById('sortBy').value = 'name-asc';
    
    // Reset filter state
    filters = {
        searchTerm: '',
        priceMin: null,
        priceMax: null,
        proteinMin: null,
        proteinMax: null,
        energyMin: null,
        energyMax: null,
        availability: 'all',
        sortBy: 'name-asc'
    };
    
    // Reapply filters (which will show all ingredients)
    applyFilters();
}

function renderIngredientsTable(ingredients) {
    const tbody = document.getElementById('ingredientsTableBody');
    
    if (ingredients.length === 0) {
        const noResultsMessage = filters.searchTerm || filters.priceMin || filters.priceMax || 
                                 filters.proteinMin || filters.proteinMax || filters.energyMin || 
                                 filters.energyMax || filters.availability !== 'all'
            ? 'No ingredients match your search criteria. Try adjusting your filters.'
            : 'No ingredients found. Add your first ingredient to get started.';
        
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    <p>${noResultsMessage}</p>
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
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatCurrency(ing.price)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatPercentage(ing.crude_protein)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${ing.metabolized_energy.toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatPercentage(ing.calcium)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatPercentage(ing.total_phosphorus)}</td>
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
