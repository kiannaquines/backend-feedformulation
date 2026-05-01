# Admin Dashboard - Feed Formulation System

## Overview

The admin dashboard provides a comprehensive interface for managing all aspects of the Feed Formulation System, including users, ingredients, nutrient requirements, and formulations.

## Features Implemented

### 1. **Dynamic Data Loading**
- Real-time data fetching from backend API endpoints
- Loading states with animated spinners
- Error handling with toast notifications
- Automatic data refresh capabilities

### 2. **Pagination System**
- Customizable items per page (10, 25, 50, 100)
- Page navigation with Previous/Next buttons
- Shows current page and total pages
- Displays item range ("Showing X to Y of Z items")
- Resets to page 1 when changing tabs or filters

### 3. **Advanced Filtering**
- **Search**: Real-time search across multiple fields
  - Users: Search by username or email
  - Ingredients: Search by name
  - Requirements: Search by name or description
- **Status Filter**: Filter by active/inactive status
  - Ingredients: Available/Unavailable
  - Users: Active/Inactive
- Filters persist until tab change

### 4. **Tab-Based Navigation**
- URL-based tab state (`?tab=ingredients`)
- 5 main sections:
  - **Users**: User account management
  - **Ingredients**: Feed ingredient management
  - **Requirements**: Nutrient requirements management
  - **Formulations**: Feed formulation history
  - **Settings**: System configuration

### 5. **API Integration**

#### Endpoints Covered:

**Ingredients API**
- `GET /ingredients/all` - Fetch all ingredients
- `GET /ingredients/{id}` - Get specific ingredient
- `POST /ingredients/create` - Create new ingredient
- `PUT /ingredients/update/{id}` - Update ingredient
- `DELETE /ingredients/delete/{id}` - Delete ingredient
- `POST /ingredients/ai-suggest` - AI-powered suggestions
- `GET /ingredients/ai-status` - Check AI service status

**Nutrient Requirements API**
- `GET /nutrient-requirements/all` - Fetch all requirements
- `POST /nutrient-requirements/create` - Create requirement
- `PUT /nutrient-requirements/update/{id}` - Update requirement
- `DELETE /nutrient-requirements/delete/{id}` - Delete requirement

**Feed Formulation API**
- `POST /feed/formulate` - Create feed formulation

**Authentication API**
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### 6. **Statistics Dashboard**
- Total users count with active users
- Total ingredients with availability status
- Total nutrient requirements
- Auto-updates based on loaded data

### 7. **Interactive UI Components**
- Toast notifications for all operations
- Confirmation dialogs for delete operations
- Responsive tables with sortable columns
- Badge indicators for status
- Icon-based action buttons
- Loading states for async operations

## File Structure

```
frontend/
├── src/
│   ├── app/
│   │   └── admin/
│   │       └── page.tsx           # Main admin dashboard component
│   ├── lib/
│   │   └── api.ts                 # API client and endpoint functions
│   ├── hooks/
│   │   └── use-toast.ts           # Toast notification hook
│   └── components/
│       └── app-sidebar.tsx        # Updated sidebar navigation
└── .env.example                   # Environment variables template
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
VITE_API_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Backend Setup

Ensure the backend is running on port 8000:

```bash
cd backend
uvicorn main:app --reload
```

## Usage Guide

### Accessing the Admin Dashboard

Navigate to: `http://localhost:5173/admin`

### Tab Navigation

- Click tabs or use sidebar links
- URL updates automatically: `/admin?tab=ingredients`
- Direct linking supported

### Managing Ingredients

1. Click "Ingredients" tab
2. Click "Refresh" to load from API
3. Use search box to filter by name
4. Use status dropdown to filter by availability
5. Click edit/delete icons for actions
6. "Add Ingredient" button for creation (coming soon)

### Pagination Controls

- Select items per page from dropdown (10-100)
- Use Previous/Next buttons to navigate pages
- View current page number and total pages
- See item range at bottom of tables

### Filtering Data

**Search:**
- Type in search box for real-time filtering
- Searches across multiple fields
- Case-insensitive

**Status Filter:**
- Select "All Status", "Active", or "Inactive"
- Filters applied immediately
- Resets on tab change

### Delete Operations

1. Click trash icon next to item
2. Confirm deletion in dialog
3. Item removed from database
4. List automatically refreshes
5. Toast notification confirms deletion

## API Authentication

The system uses JWT token authentication:

```typescript
// Store token after login
localStorage.setItem("access_token", token)

// Token automatically included in API requests
const token = localStorage.getItem("access_token")
```

## Error Handling

All API operations include comprehensive error handling:

- Network errors
- Authentication failures
- Validation errors
- Server errors

Errors are displayed via toast notifications with descriptive messages.

## Future Enhancements

- [ ] User creation and editing forms
- [ ] Ingredient creation and editing forms
- [ ] Nutrient requirement creation and editing
- [ ] Formulation history viewer
- [ ] Bulk operations (delete, update)
- [ ] Export data to CSV/Excel
- [ ] Advanced sorting options
- [ ] Batch import functionality
- [ ] Activity logs and audit trail
- [ ] User role management
- [ ] Real-time updates via WebSocket

## Keyboard Shortcuts

- `Tab` - Navigate between form fields
- `Enter` - Submit forms
- `Esc` - Close dialogs
- `Ctrl/Cmd + F` - Focus search box

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers supported

## Performance Optimizations

- Pagination reduces DOM elements
- Debounced search input
- Lazy loading of tab content
- Memoized filter functions
- Optimized re-renders with React hooks

## Troubleshooting

### Data not loading

1. Check backend is running
2. Verify API_URL in .env
3. Check browser console for errors
4. Verify JWT token is valid

### Toast notifications not showing

1. Ensure GooeyToaster is in App.tsx
2. Check useToast hook is imported
3. Verify goey-toast package is installed

### Pagination not working

1. Check data array is not empty
2. Verify itemsPerPage state
3. Check currentPage is within valid range

## Contributing

When adding new features:

1. Follow existing code patterns
2. Add TypeScript interfaces
3. Include error handling
4. Add toast notifications
5. Update this README
6. Test pagination and filters

## License

MIT License - Feed Formulation System
