// Dashboard functionality

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    
    // Display user name
    const user = getUserInfo();
    if (user) {
        document.getElementById('userName').textContent = user.username;
    }
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            API.auth.logout();
        }
    });
    
    // Load dashboard statistics
    await loadDashboardStats();
});

async function loadDashboardStats() {
    try {
        // Load ingredients count
        try {
            const ingredientsData = await API.ingredients.getAll();
            const ingredientsCount = ingredientsData.ingredients ? ingredientsData.ingredients.length : 0;
            document.getElementById('totalIngredients').textContent = ingredientsCount;
        } catch (error) {
            console.error('Error loading ingredients:', error);
            document.getElementById('totalIngredients').textContent = '0';
        }
        
        // Load nutrient requirements count
        try {
            const nutrientsData = await API.nutrientRequirements.getAll();
            const nutrientsCount = nutrientsData.nutrient_requirements ? nutrientsData.nutrient_requirements.length : 0;
            document.getElementById('totalNutrients').textContent = nutrientsCount;
        } catch (error) {
            console.error('Error loading nutrient requirements:', error);
            document.getElementById('totalNutrients').textContent = '0';
        }
        
        // Note: Saved formulations endpoint is not available in the provided routes
        // Setting it to 0 for now
        document.getElementById('totalFormulations').textContent = '0';
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}
