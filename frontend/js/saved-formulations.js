// Saved Formulations functionality

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    
    // Close details button
    const closeDetailsBtn = document.getElementById('closeDetails');
    if (closeDetailsBtn) {
        closeDetailsBtn.addEventListener('click', () => {
            document.getElementById('detailsModal').classList.add('hidden');
        });
    }
    
    // Note: The backend doesn't have an endpoint to retrieve saved formulations
    // This is a placeholder implementation
    displayNoFormulations();
});

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

// Placeholder function for when API endpoint is available
function renderFormulations(formulations) {
    const grid = document.getElementById('formulationsGrid');
    
    if (formulations.length === 0) {
        displayNoFormulations();
        return;
    }
    
    grid.innerHTML = formulations.map(formulation => `
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
                ${formulation.payload && formulation.payload.summary ? `
                    <div class="flex justify-between">
                        <span class="text-gray-600">Cost per kg:</span>
                        <span class="font-semibold text-green-600">$${formulation.payload.summary.cost_per_kg.toFixed(4)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Ingredients:</span>
                        <span class="font-semibold">${formulation.payload.summary.active_ingredients_count}</span>
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
                    onclick="deleteFormulation(${formulation.id}, '${formulation.formulation_name.replace(/'/g, "\\'")}')"
                    class="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

function viewFormulationDetails(id) {
    // Placeholder - implement when API endpoint is available
    showAlert('View details functionality coming soon', 'info');
}

function deleteFormulation(id, name) {
    // Placeholder - implement when API endpoint is available
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
        showAlert('Delete functionality coming soon', 'info');
    }
}
