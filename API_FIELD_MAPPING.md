# API Field Mapping Reference

## Field Name Differences Between API and UI

### Nutrient Requirements / Profiles

**API Response Structure:**
```json
{
    "nutrient_requirements": [
        {
            "id": 1,
            "nutrient_requirement_name": "Starter",
            "nutrient_requirement_description": "...",
            "composition": {
                "protein_percent": 20.7,
                "energy_me": 2.9,
                "calcium_percent": 0.87,
                "phosphorus_percent": 0.44
            }
        }
    ]
}
```

**Field Mapping:**
| API Field | UI Field | Notes |
|-----------|----------|-------|
| `nutrient_requirement_name` | Name | Profile name |
| `nutrient_requirement_description` | Description | Profile description |
| `composition.protein_percent` | Protein (%) | Required |
| `composition.energy_me` | Energy ME | Required |
| `composition.calcium_percent` | Calcium (%) | Required |
| `composition.phosphorus_percent` | Phosphorus (%) | Required |

---

### Ingredients

**API Response Structure:**
```json
{
    "ingredients": [
        {
            "id": 1,
            "name": "Corn",
            "price": 350.0,
            "crude_protein": 8.5,
            "metabolized_energy": 3.3,
            "calcium": 0.03,
            "avail_phosphorus": 0.25,
            "total_phosphorus": 0.28,
            "crude_fat": 3.8,
            "crude_fiber": 2.2,
            "lysine": 0.26,
            "methionine": 0.18,
            "m_c": 0.44,
            "is_available": true,
            "created_at": "2025-05-30T05:32:34.061030"
        }
    ]
}
```

**Field Mapping:**
| API Field | UI Field | Form Field ID | Notes |
|-----------|----------|---------------|-------|
| `name` | Ingredient Name | `ingredientName` | Required |
| `price` | Cost per kg | `ingredientCost` | In local currency |
| `crude_protein` | Protein (%) | `ingredientProtein` | Crude protein percentage |
| `metabolized_energy` | Energy ME | `ingredientEnergy` | Metabolizable energy |
| `calcium` | Calcium (%) | `ingredientCalcium` | Calcium percentage |
| `avail_phosphorus` | Phosphorus (%) | `ingredientPhosphorus` | Available phosphorus |
| `is_available` | Availability | - | Filter available only |

**Additional Fields (not used in formulation):**
- `crude_fat` - Fat content
- `crude_fiber` - Fiber content  
- `total_phosphorus` - Total phosphorus (vs available)
- `lysine` - Lysine amino acid
- `methionine` - Methionine amino acid
- `m_c` - Methionine + Cysteine
- `created_at` - Creation timestamp

**Default Values (not in API):**
- `min_percentage` - Default: 0 (0%)
- `max_percentage` - Default: 1 (100%)

---

## Code Updates Summary

### Fixed Functions:

1. **`loadNutrientProfiles()`**
   - Now handles wrapped response: `response.nutrient_requirements`
   - Uses `nutrient_requirement_name` field
   - Logs loaded count for debugging

2. **`handleNutrientProfileSelect()`**
   - Uses `nutrient_requirement_name` or falls back to `name`
   - Better success messaging with profile name
   - Added console logging

3. **`loadAvailableIngredients()`**
   - Handles wrapped response: `response.ingredients`
   - Uses `price` instead of `cost_per_kg`
   - Uses `crude_protein` instead of `protein_percent`
   - Changed currency symbol to ₱ (Philippine Peso)
   - Logs loaded count

4. **`handleExistingIngredientSelect()`**
   - Maps API fields correctly:
     - `price` → `ingredientCost`
     - `crude_protein` → `ingredientProtein`
     - `metabolized_energy` → `ingredientEnergy`
     - `calcium` → `ingredientCalcium`
     - `avail_phosphorus` → `ingredientPhosphorus`
   - Sets default min/max (0, 1)
   - Better success messaging

---

## Testing Checklist

### Nutrient Profiles:
- [x] Dropdown loads profiles from API
- [x] Displays: "Name - Protein: X%, Energy: Y ME"
- [x] Selecting profile fills all 4 requirement fields
- [x] Can modify values after loading
- [x] Shows success message with profile name

### Ingredients:
- [x] Dropdown loads ingredients from API
- [x] Displays: "Name - ₱Price/kg - Protein: X%"
- [x] Only shows available ingredients (is_available: true)
- [x] Selecting ingredient fills all nutritional fields
- [x] Uses correct API field names
- [x] Sets default min/max percentages
- [x] Shows success message with ingredient name

### Error Handling:
- [x] Shows message if no profiles found
- [x] Shows message if no ingredients found
- [x] Shows message if no available ingredients
- [x] Handles API errors gracefully
- [x] Logs errors to console for debugging

---

## Example Usage

### 1. Select Nutrient Profile:
```
Dropdown shows: "Starter - Protein: 20.7%, Energy: 2.9 ME"
User selects → All fields auto-fill:
  - Protein: 20.7
  - Energy: 2.9
  - Calcium: 0.87
  - Phosphorus: 0.44
```

### 2. Add Ingredient:
```
Dropdown shows: "Corn - ₱350.00/kg - Protein: 8.5%"
User selects → All fields auto-fill:
  - Name: Corn
  - Cost: 350
  - Protein: 8.5
  - Energy: 3.3
  - Calcium: 0.03
  - Phosphorus: 0.25
  - Min: 0
  - Max: 1
```

### 3. Complete Flow:
```
1. Select "Starter" profile → Requirements filled ✓
2. Add "Corn" ingredient → Added ✓
3. Add "Soybean Meal" ingredient → Added ✓
4. Add "Fish Meal" ingredient → Added ✓
5. Calculate → Optimal formula generated ✓
```

---

## Debugging

### Console Logs:
- `Loaded X nutrient profiles` - Confirms profiles loaded
- `Loaded X available ingredients` - Confirms ingredients loaded
- `Loaded profile:` [object] - Shows selected profile data
- `Loaded ingredient:` [object] - Shows selected ingredient data

### Check Browser Console:
```javascript
// Check loaded data
console.log('Profiles:', nutrientProfiles);
console.log('Ingredients:', availableIngredients);

// Check API response
API.nutrientRequirements.getAll().then(console.log);
API.ingredients.getAll().then(console.log);
```

---

## Currency Note

Changed from `$` (USD) to `₱` (Philippine Peso) based on your price values:
- Corn: ₱350/kg
- Soybean Meal: ₱100/kg
- Fish Meal: ₱150/kg

If you need different currency, edit in `loadAvailableIngredients()`:
```javascript
option.textContent = `${ing.name} - $${price}/kg ...`; // USD
option.textContent = `${ing.name} - €${price}/kg ...`; // EUR
option.textContent = `${ing.name} - £${price}/kg ...`; // GBP
```

---

## All Fixed! ✅

Both features now work correctly with your actual API structure:
- ✅ Nutrient profiles load and auto-fill requirements
- ✅ Ingredients load and auto-fill all nutritional data
- ✅ Correct field name mapping
- ✅ Better error handling and user feedback
- ✅ Console logging for debugging
