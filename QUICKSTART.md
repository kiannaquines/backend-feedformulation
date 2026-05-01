# Quick Start Guide - Ingredients Management

## Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL database
- API Keys: GROQ_API_KEY or GOOGLE_API_KEY

## Setup

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GROQ_API_KEY="your_groq_api_key"
export GOOGLE_API_KEY="your_google_api_key"  # Fallback
export DATABASE_URL="postgresql://user:password@localhost/feedformulation"

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Set API URL (create .env file)
echo "VITE_API_URL=http://localhost:8000" > .env

# Start frontend development server
npm run dev
```

## Access the Application

1. **Backend API**: http://localhost:8000
2. **API Docs**: http://localhost:8000/docs
3. **Frontend**: http://localhost:5173

## First-Time Usage

### 1. Register an Account

Navigate to http://localhost:5173/register
- Enter username, email, password
- Check email for OTP code
- Verify OTP to complete registration

### 2. Login

Navigate to http://localhost:5173/login
- Enter credentials
- Complete OTP verification if required

### 3. Access Ingredients Page

Navigate to http://localhost:5173/ingredients or use the sidebar menu

## Testing the Features

### Test Create Ingredient

1. Click "Add Ingredient" button
2. Fill in test data:
   ```
   Name: Test Corn
   Price: 25.50
   Crude Protein: 8.0
   Crude Fat: 3.5
   Metabolized Energy: 3300
   Calcium: 0.03
   Total Phosphorus: 0.25
   ```
3. Click "Create Ingredient"
4. Verify success toast and table update

### Test AI Suggestions

1. Click "AI Suggest" button
2. Enter requirements:
   ```
   Protein: 18.0
   Energy: 3000
   Calcium: 0.9
   Phosphorus: 0.45
   Top Results: 5
   ```
3. Click "Get AI Suggestions"
4. Review match scores and recommendations

### Test AI Chat

1. Click "AI Chat" button
2. Optionally set context requirements
3. Ask questions like:
   - "What are the best protein sources?"
   - "Which ingredients are cost-effective?"
   - "Recommend ingredients for broiler chicken"
4. Review AI responses

### Test Edit & Delete

1. Click edit icon on any ingredient
2. Modify values
3. Click "Update Ingredient"
4. Click delete icon on any ingredient
5. Confirm deletion

## Troubleshooting

### Backend Issues

**Problem**: Database connection error
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Verify DATABASE_URL
echo $DATABASE_URL
```

**Problem**: AI features not working
```bash
# Check API keys
echo $GROQ_API_KEY
echo $GOOGLE_API_KEY

# Test AI endpoint
curl http://localhost:8000/api/v1/ingredients/ai-status
```

### Frontend Issues

**Problem**: API connection failed
```bash
# Verify backend is running
curl http://localhost:8000/api/v1/ingredients/ai-status

# Check VITE_API_URL
cat frontend/.env
```

**Problem**: TypeScript errors
```bash
cd frontend
npm run typecheck
```

**Problem**: Build fails
```bash
cd frontend
npm install
npm run build
```

## Common Workflows

### Adding Multiple Ingredients

1. Prepare ingredient data in spreadsheet
2. For each ingredient:
   - Click "Add Ingredient"
   - Fill form
   - Submit
3. Use AI suggestions to verify nutritional balance

### Formulating Feed

1. Determine nutrient requirements (e.g., broiler starter)
2. Click "AI Suggest" with requirements
3. Review suggested ingredients
4. Use AI chat to ask specific questions
5. Add selected ingredients to formulation

### Managing Inventory

1. View all ingredients
2. Use search to find specific items
3. Update availability status
4. Edit prices as needed
5. Delete discontinued ingredients

## API Testing

### Using cURL

```bash
# Login to get token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Get all ingredients
curl -X GET http://localhost:8000/api/v1/ingredients/all \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create ingredient
curl -X POST http://localhost:8000/api/v1/ingredients/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Corn",
    "price": 25.50,
    "crude_protein": 8.0,
    "crude_fat": 3.5,
    "crude_fiber": 2.0,
    "metabolized_energy": 3300,
    "calcium": 0.03,
    "total_phosphorus": 0.25,
    "avail_phosphorus": 0.12,
    "lysine": 0.26,
    "methionine": 0.18,
    "m_c": 0.44,
    "is_available": true
  }'

# AI suggestions
curl -X POST http://localhost:8000/api/v1/ingredients/ai-suggest \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "protein_percent": 18.0,
    "energy_me": 3000,
    "calcium_percent": 0.9,
    "phosphorus_percent": 0.45,
    "top_n": 5
  }'
```

### Using Swagger UI

1. Navigate to http://localhost:8000/docs
2. Click "Authorize" button
3. Enter JWT token
4. Test endpoints interactively

## Production Deployment

### Backend

```bash
# Use gunicorn for production
pip install gunicorn

# Run with multiple workers
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend

```bash
# Build for production
npm run build

# Serve with nginx or similar
# Output in: frontend/dist/
```

## Support

For issues or questions:
- Check API documentation: http://localhost:8000/docs
- Review backend logs
- Check browser console for frontend errors
- Verify environment variables

## Next Steps

1. ✅ Complete ingredients management
2. 🔄 Implement nutrient requirements UI
3. 🔄 Build feed formulation calculator
4. 🔄 Add reporting and analytics
5. 🔄 Implement user management

Enjoy using the Ingredients Management System! 🚀
