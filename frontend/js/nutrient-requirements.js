// Nutrient Requirements management functionality

let allRequirements = [];
let editingRequirementId = null;

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    
    // Add requirement button
    document.getElementById('addRequirementBtn').addEventListener('click', () => {
        editingRequirementId = null;
        document.getElementById('modalTitle').textContent = 'Add Nutrient Profile';
        document.getElementById('submitBtnText').textContent = 'Add Profile';
        document.getElementById('requirementForm').reset();
        
        // Set default composition template
        document.getElementById('composition').value = JSON.stringify({
            protein_percent: 18.0,
            energy_me: 3.0,
            calcium_percent: 0.9,
            phosphorus_percent: 0.45
        }, null, 2);
        
        document.getElementById('requirementModal').classList.remove('hidden');
    });
    
    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', () => {
        document.getElementById('requirementModal').classList.add('hidden');
        document.getElementById('requirementForm').reset();
        editingRequirementId = null;
    });
    
    // Close details button
    document.getElementById('closeDetails').addEventListener('click', () => {
        document.getElementById('detailsModal').classList.add('hidden');
    });
    
    // Form submit
    document.getElementById('requirementForm').addEventListener('submit', handleFormSubmit);
    
    // Load requirements
    await loadRequirements();
});

async function loadRequirements() {
    try {
        const data = await API.nutrientRequirements.getAll();
        allRequirements = data.nutrient_requirements || [];
        renderRequirementsGrid(allRequirements);
    } catch (error) {
        allRequirements = [];
        renderRequirementsGrid([]);
    }
}

function renderRequirementsGrid(requirements) {
    const grid = document.getElementById('requirementsGrid');
    
    if (requirements.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <p class="text-gray-500">No nutrient profiles found. Add your first profile to get started.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = requirements.map(req => {
        const composition = typeof req.composition === 'string' ? JSON.parse(req.composition) : req.composition;
        
        return `
            <div class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-200">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-lg font-bold text-gray-900">${req.nutrient_requirement_name}</h3>
                    <div class="flex space-x-2">
                        <button 
                            onclick="viewDetails(${req.id})"
                            class="text-blue-600 hover:text-blue-800"
                            title="View Details"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                ${req.nutrient_requirement_description ? `
                    <p class="text-sm text-gray-600 mb-4">${req.nutrient_requirement_description}</p>
                ` : ''}
                
                <div class="space-y-2 text-sm">
                    ${composition.protein_percent !== undefined ? `
                        <div class="flex justify-between">
                            <span class="text-gray-600">Protein:</span>
                            <span class="font-semibold">${composition.protein_percent}%</span>
                        </div>
                    ` : ''}
                    ${composition.energy_me !== undefined ? `
                        <div class="flex justify-between">
                            <span class="text-gray-600">Energy ME:</span>
                            <span class="font-semibold">${composition.energy_me} Mcal/kg</span>
                        </div>
                    ` : ''}
                    ${composition.calcium_percent !== undefined ? `
                        <div class="flex justify-between">
                            <span class="text-gray-600">Calcium:</span>
                            <span class="font-semibold">${composition.calcium_percent}%</span>
                        </div>
                    ` : ''}
                    ${composition.phosphorus_percent !== undefined ? `
                        <div class="flex justify-between">
                            <span class="text-gray-600">Phosphorus:</span>
                            <span class="font-semibold">${composition.phosphorus_percent}%</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
                    <button 
                        onclick="editRequirement(${req.id})"
                        class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        Edit
                    </button>
                    <button 
                        onclick="deleteRequirement(${req.id}, '${req.nutrient_requirement_name.replace(/'/g, "\\'")}')"
                        class="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const compositionText = document.getElementById('composition').value;
    let composition;
    
    try {
        composition = JSON.parse(compositionText);
    } catch (error) {
        showAlert('Invalid JSON format in composition field', 'error');
        return;
    }
    
    const requirementData = {
        nutrient_requirement_name: document.getElementById('nutrient_requirement_name').value,
        nutrient_requirement_description: document.getElementById('nutrient_requirement_description').value,
        composition: composition
    };
    
    try {
        if (editingRequirementId) {
            await API.nutrientRequirements.update(editingRequirementId, requirementData);
            showAlert('Nutrient profile updated successfully!', 'success');
        } else {
            await API.nutrientRequirements.create(requirementData);
            showAlert('Nutrient profile added successfully!', 'success');
        }
        
        document.getElementById('requirementModal').classList.add('hidden');
        document.getElementById('requirementForm').reset();
        editingRequirementId = null;
        
        await loadRequirements();
        
    } catch (error) {
        showAlert(handleApiError(error, 'Failed to save nutrient profile'), 'error');
    }
}

async function editRequirement(id) {
    const requirement = allRequirements.find(r => r.id === id);
    if (!requirement) return;
    
    editingRequirementId = id;
    document.getElementById('modalTitle').textContent = 'Edit Nutrient Profile';
    document.getElementById('submitBtnText').textContent = 'Update Profile';
    
    document.getElementById('nutrient_requirement_name').value = requirement.nutrient_requirement_name;
    document.getElementById('nutrient_requirement_description').value = requirement.nutrient_requirement_description || '';
    
    const composition = typeof requirement.composition === 'string' ? JSON.parse(requirement.composition) : requirement.composition;
    document.getElementById('composition').value = JSON.stringify(composition, null, 2);
    
    document.getElementById('requirementModal').classList.remove('hidden');
}

async function deleteRequirement(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        await API.nutrientRequirements.delete(id);
        showAlert('Nutrient profile deleted successfully!', 'success');
        await loadRequirements();
    } catch (error) {
        showAlert(handleApiError(error, 'Failed to delete nutrient profile'), 'error');
    }
}

function viewDetails(id) {
    const requirement = allRequirements.find(r => r.id === id);
    if (!requirement) return;
    
    const composition = typeof requirement.composition === 'string' ? JSON.parse(requirement.composition) : requirement.composition;
    
    document.getElementById('detailsTitle').textContent = requirement.nutrient_requirement_name;
    document.getElementById('detailsContent').innerHTML = `
        <div class="space-y-6">
            ${requirement.nutrient_requirement_description ? `
                <div>
                    <h4 class="font-semibold text-gray-900 mb-2">Description</h4>
                    <p class="text-gray-600">${requirement.nutrient_requirement_description}</p>
                </div>
            ` : ''}
            
            <div>
                <h4 class="font-semibold text-gray-900 mb-3">Nutritional Composition</h4>
                <div class="bg-gray-50 rounded-lg p-4">
                    <pre class="text-sm overflow-x-auto">${JSON.stringify(composition, null, 2)}</pre>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                ${Object.entries(composition).map(([key, value]) => `
                    <div class="bg-blue-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                        <p class="text-2xl font-bold text-blue-600">${value}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('detailsModal').classList.remove('hidden');
}
