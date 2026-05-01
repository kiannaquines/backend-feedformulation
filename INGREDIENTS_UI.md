# Ingredients Management UI

A comprehensive React-based ingredients management interface with AI-powered features for feed formulation.

## 🎯 Features

### Core CRUD Operations
- ✅ **Create Ingredients** - Add new ingredients with complete nutritional profiles
- ✅ **Read/List Ingredients** - View all ingredients in a sortable, searchable table
- ✅ **Update Ingredients** - Edit existing ingredient data
- ✅ **Delete Ingredients** - Remove ingredients with confirmation dialog

### AI-Powered Features
- 🤖 **AI Suggestions** - Get intelligent ingredient recommendations based on nutrient requirements
  - Protein percentage matching
  - Energy (ME) optimization
  - Calcium and phosphorus balance
  - Cost efficiency analysis
  - Detailed scoring breakdown
  
- 💬 **AI Chat Assistant** - Conversational interface for ingredient queries
  - Natural language questions
  - Real-time recommendations
  - Context-aware responses
  - Feed formulation advice

## 🏗️ Architecture

### Frontend Structure
```
frontend/src/
├── app/
│   └── ingredients/
│       └── page.tsx          # Main ingredients management page
├── components/
│   └── ui/
│       └── dialog.tsx        # Dialog component for modals
└── lib/
    └── api.ts                # API integration with backend
```

### Key Components

#### Ingredients Page (`/ingredients/page.tsx`)
Main component with:
- Table view with search and filtering
- Create/Edit dialogs with form validation
- AI suggestions panel with scoring
- AI chat interface
- Real-time status indicators

#### Dialog Component (`/components/ui/dialog.tsx`)
Reusable modal component based on Radix UI:
- Accessible by default
- Keyboard navigation
- Focus trap
- Backdrop click handling

## 📡 API Integration

### Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/ingredients/all` | GET | Fetch all ingredients |
| `/api/v1/ingredients/create` | POST | Create new ingredient |
| `/api/v1/ingredients/update/{id}` | PUT | Update ingredient |
| `/api/v1/ingredients/delete/{id}` | DELETE | Delete ingredient |
| `/api/v1/ingredients/ai-suggest` | POST | Get AI suggestions |
| `/api/v1/ingredients/ai-chat` | POST | Chat with AI assistant |
| `/api/v1/ingredients/ai-status` | GET | Check AI availability |

### API Request Examples

#### Create Ingredient
```typescript
const data = {
  name: "Corn",
  price: 25.50,
  crude_protein: 8.0,
  crude_fat: 3.5,
  crude_fiber: 2.0,
  metabolized_energy: 3300,
  calcium: 0.03,
  total_phosphorus: 0.25,
  avail_phosphorus: 0.12,
  lysine: 0.26,
  methionine: 0.18,
  m_c: 0.44,
  is_available: true
}

await ingredientsApi.create(data, token)
```

#### AI Suggestions
```typescript
const requirements = {
  protein_percent: 18.0,
  energy_me: 3000,
  calcium_percent: 0.9,
  phosphorus_percent: 0.45,
  top_n: 5,
  excluded_ingredient_names: []
}

const suggestions = await ingredientsApi.aiSuggest(requirements, token)
```

#### AI Chat
```typescript
const chatRequest = {
  message: "What ingredients are high in protein?",
  protein_percent: 18.0,
  energy_me: 3000,
  calcium_percent: 0.9,
  phosphorus_percent: 0.45,
  selected_ingredient_names: ["Corn", "Soybean Meal"]
}

const response = await ingredientsApi.aiChat(chatRequest, token)
```

## 🎨 UI Components

### Main Table
- Responsive design with horizontal scroll
- Search bar for filtering
- Status badges (Available/Unavailable)
- Action buttons for edit/delete

### Create/Edit Forms
- Comprehensive input fields for all nutrient values
- Form validation
- Number inputs with step controls
- Checkbox for availability status
- Cancel/Submit buttons

### AI Suggestions Panel
- Nutrient requirement inputs
- Top N results selector
- Match score display
- Detailed scoring breakdown
- Reason explanations
- AI insights

### AI Chat Interface
- Message history
- Real-time responses
- Context inputs (nutrient requirements)
- Loading indicators
- Timestamp display

## 🔧 Usage

### Starting the Application

1. **Backend**:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload
```

2. **Frontend**:
```bash
cd frontend
npm run dev
```

3. **Access**: Navigate to `http://localhost:5173/ingredients`

### Creating an Ingredient

1. Click "Add Ingredient" button
2. Fill in the form:
   - **Required**: Name, Price
   - **Optional**: All nutritional values
3. Check "Ingredient is available" if applicable
4. Click "Create Ingredient"

### Getting AI Suggestions

1. Click "AI Suggest" button
2. Enter nutrient requirements:
   - Protein percentage
   - Energy (ME)
   - Calcium percentage
   - Phosphorus percentage
3. Select number of results (1-10)
4. Click "Get AI Suggestions"
5. Review:
   - Match scores
   - Reason explanations
   - Nutritional breakdown
   - Cost efficiency scores
   - AI insights

### Using AI Chat

1. Click "AI Chat" button
2. Optionally set context:
   - Protein requirement
   - Energy requirement
   - Calcium requirement
   - Phosphorus requirement
3. Type your question
4. Press Enter or click "Send"
5. View AI response

## 🔐 Authentication

All endpoints require JWT authentication. The token is automatically included in requests when logged in.

## 🎯 AI Features Details

### Scoring Algorithm

The AI suggestions use a weighted scoring system:
- **Protein Match**: 30%
- **Energy Match**: 30%
- **Calcium Match**: 15%
- **Phosphorus Match**: 15%
- **Cost Efficiency**: 10%

### AI Providers

The system supports multiple AI providers with fallback:
1. **Primary**: Groq (llama-3.3-70b-versatile)
2. **Fallback**: Google Gemini (gemini-1.5-flash)
3. **Last Resort**: Rule-based suggestions

### AI Status Indicator

- Green badge with provider name when AI is available
- Automatically checks AI status on page load
- Shows provider (Groq/Gemini) when available

## 📱 Responsive Design

- Mobile-friendly dialogs
- Responsive table with horizontal scroll
- Touch-friendly buttons and inputs
- Adaptive layouts for different screen sizes

## 🔄 State Management

### Loading States
- Table loading spinner
- AI suggestion loading
- Chat loading indicators
- Form submission states

### Error Handling
- Toast notifications for errors
- Inline form validation
- API error messages
- Network error handling

## 🎨 Styling

Built with:
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Pre-built components
- **Radix UI** - Accessible primitives
- **Tabler Icons** - Icon library

## 🚀 Performance

- Optimized re-renders with React hooks
- Lazy loading for dialogs
- Efficient state updates
- Debounced search (if implemented)

## 📝 Type Safety

Fully typed with TypeScript:
- Interface definitions for all data models
- Type-safe API calls
- Props validation
- Form data typing

## 🧪 Testing

To test the implementation:

1. **Create Test**: Add a new ingredient
2. **Read Test**: View all ingredients
3. **Update Test**: Edit an existing ingredient
4. **Delete Test**: Remove an ingredient
5. **AI Test**: Get suggestions with sample requirements
6. **Chat Test**: Ask questions in AI chat

## 🔮 Future Enhancements

- [ ] Bulk ingredient import (CSV/Excel)
- [ ] Ingredient categories/tags
- [ ] Advanced filtering and sorting
- [ ] Export functionality
- [ ] Ingredient comparison tool
- [ ] Nutritional charts and visualizations
- [ ] Price history tracking
- [ ] Supplier management

## 📄 License

Part of the Feed Formulation System - See main project for license details.
