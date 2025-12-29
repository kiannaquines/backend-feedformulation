# Feed Formulation System - Frontend

A modern, user-friendly web interface for the Feed Formulation API, designed specifically for farmers and scientists to optimize livestock feed formulations.

## Features

### 🌾 User-Friendly Design
- Clean, intuitive interface with Tailwind CSS
- Responsive design that works on desktop, tablet, and mobile devices
- Accessible color scheme optimized for outdoor viewing
- Clear visual hierarchy and easy navigation

### 🔐 Authentication
- Secure user registration and login
- Two-factor authentication with OTP (when enabled)
- Session management with JWT tokens

### 📊 Dashboard
- Quick overview of ingredients, nutrient profiles, and saved formulations
- Easy access to all main features
- Quick start guide for new users

### 🧪 Feed Formulation Calculator
- Dynamic ingredient selection
- Real-time formulation calculation
- Multiple optimization methods (HiGHS, Revised Simplex, Interior Point)
- Visual results display with cost breakdown
- Nutrient achievement tracking
- Save and export formulations

### 🌽 Ingredient Management
- Add, edit, and delete ingredients
- Comprehensive nutritional data input
- Search and filter functionality
- Availability tracking

### 📋 Nutrient Requirements
- Create custom nutrient profiles for different livestock types
- JSON-based composition management
- Easy-to-read profile cards
- Edit and delete functionality

### 💾 Saved Formulations
- View previously saved formulations
- Access formulation details and results
- Manage your formulation library

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Backend API running on `http://localhost:8000`

### Installation

1. **Start the Backend API**
   ```bash
   cd backend-feedformulation
   python -m uvicorn main:app --reload
   ```

2. **Open the Frontend**
   - Simply open `index.html` in your web browser
   - Or use a local development server:
   ```bash
   cd frontend
   python -m http.server 8080
   ```
   Then navigate to `http://localhost:8080`

### First Time Setup

1. **Register an Account**
   - Open `register.html` or click "Register here" on the login page
   - Fill in your username, email, and password
   - Accept the terms and conditions
   - Click "Create Account"

2. **Login**
   - Enter your username and password
   - If OTP is enabled, enter the verification code
   - You'll be redirected to the dashboard

3. **Add Ingredients**
   - Navigate to "Manage Ingredients"
   - Click "+ Add New Ingredient"
   - Fill in the nutritional information
   - Click "Add Ingredient"

4. **Create Nutrient Profile (Optional)**
   - Navigate to "Nutrient Requirements"
   - Click "+ Add New Profile"
   - Name your profile (e.g., "Broiler Starter")
   - Define the nutritional composition
   - Click "Add Profile"

5. **Create Your First Formulation**
   - Navigate to "Create Formulation"
   - Set nutrient requirements
   - Select ingredients to use
   - Click "Calculate Optimal Formulation"
   - Review results and save if satisfied

## Project Structure

```
frontend/
├── index.html              # Login page
├── register.html           # Registration page
├── dashboard.html          # Main dashboard
├── formulation.html        # Feed formulation calculator
├── ingredients.html        # Ingredient management
├── nutrient-requirements.html  # Nutrient profiles
├── saved-formulations.html # Saved formulations view
├── css/
│   └── styles.css         # Custom CSS styles
└── js/
    ├── api.js             # API client and utilities
    ├── auth.js            # Authentication logic
    ├── dashboard.js       # Dashboard functionality
    ├── formulation.js     # Formulation calculator
    ├── ingredients.js     # Ingredient management
    ├── nutrient-requirements.js  # Nutrient profiles
    └── saved-formulations.js     # Saved formulations
```

## API Configuration

The frontend is configured to connect to the backend API at `http://localhost:8000/api/v1`. To change this:

1. Open `js/api.js`
2. Modify the `API_BASE_URL` constant:
   ```javascript
   const API_BASE_URL = 'http://your-api-url:port/api/v1';
   ```

## Design Principles

### For Farmers 👨‍🌾
- **Simple language**: Technical terms are explained clearly
- **Visual feedback**: Clear success/error messages
- **Step-by-step guidance**: Quick start guide on dashboard
- **Large touch targets**: Easy to use on tablets in the field

### For Scientists 🔬
- **Detailed data**: Comprehensive nutritional information
- **Multiple optimization methods**: Choose the best algorithm
- **Export capabilities**: Print results for reports
- **JSON editing**: Direct access to advanced configurations

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Can't Login
- Ensure the backend API is running
- Check that you're using the correct credentials
- Verify API_BASE_URL in `js/api.js` matches your backend

### OTP Issues
- Check if OTP is enabled in backend configuration
- Ensure the OTP code is entered within the time window

### Formulation Calculation Fails
- Verify all nutrient requirements are filled
- Ensure at least one ingredient is selected
- Check ingredient constraints (min/max percentages)

### CORS Errors
- Ensure backend has CORS properly configured
- Check that `allow_origins` includes your frontend URL

## Contributing

To add new features or fix bugs:

1. Make changes to the relevant HTML/CSS/JS files
2. Test thoroughly in multiple browsers
3. Ensure mobile responsiveness
4. Follow the existing code style

## License

This project is part of the Feed Formulation System. See the main project README for license information.

## Support

For issues or questions:
- Check the backend API documentation
- Review browser console for error messages
- Ensure all required fields are filled correctly

## Future Enhancements

- Offline mode with local storage
- Batch formulation creation
- Advanced reporting and analytics
- Export to PDF/Excel
- Ingredient price tracking
- Historical formulation comparison
- Mobile app version

---

Built with ❤️ for farmers and scientists
