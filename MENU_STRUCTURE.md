# Menu Structure - Complete Guide

## THE PERMANENT SOLUTION

**Categories are NO LONGER managed separately.** They are created automatically when you add menu items.

---

## How It Works

### 1. **Menus** (Collections)
Think of menus as **collections** or **contexts** for serving food:
- "Lunch Menu" - served from 11 AM - 3 PM
- "Dinner Menu" - served from 5 PM - 10 PM
- "Beverages" - available all day
- "Kids Menu" - special items for children

**How to manage:**
- Go to **Dashboard** → Click your restaurant → **Menus** button
- Click "New Menu" to create a collection
- Make menus Active/Inactive to control visibility

---

### 2. **Categories** (Food Types)
Categories are **types of food** that help organize items:
- Appetizers
- Pizzas
- Burgers
- Desserts
- Drinks

**How to create categories:**
Categories are created **automatically** when adding menu items:

1. Go to a menu → Click "Manage Items"
2. Click "New Item"
3. In the form, find the **"Category"** dropdown
4. **Type a new category name** (e.g., "Pizzas")
5. Press Enter or select from existing categories
6. Fill in the rest of the item details
7. Click "Create Item"

**The category is created instantly!** No separate management needed.

---

### 3. **Menu Items** (Actual Food)
Menu items are the **actual food** customers can order:
- Margherita Pizza ($12.99)
- Caesar Salad ($8.50)
- Chocolate Cake ($6.00)

Each item belongs to:
- ✅ **ONE Menu** (e.g., "Dinner Menu")
- ✅ **ONE Category** (e.g., "Pizzas")

**How to add items:**
1. Navigate to **Restaurants** → Select restaurant → **Menus**
2. Click **"Manage Items"** on any menu
3. Click **"New Item"**
4. Fill in:
   - Name: "Margherita Pizza"
   - Description: "Classic Italian pizza with tomato and mozzarella"
   - Category: Type "Pizzas" or select existing
   - Image URL: (optional) https://example.com/pizza.jpg
   - Price: 12.99
   - Available: Toggle on/off
5. Click **"Create Item"**

---

## Example Structure

```
Restaurant: "Pizza Palace"
├── Menus
│   ├── Lunch Menu (Active)
│   │   ├── Appetizers
│   │   │   ├── Garlic Bread ($4.99)
│   │   │   └── Bruschetta ($5.99)
│   │   ├── Pizzas
│   │   │   ├── Margherita ($10.99)
│   │   │   └── Pepperoni ($11.99)
│   │   └── Drinks
│   │       └── Soda ($1.99)
│   │
│   ├── Dinner Menu (Active)
│   │   ├── Appetizers
│   │   │   ├── Mozzarella Sticks ($6.99)
│   │   │   └── Caesar Salad ($7.99)
│   │   ├── Pizzas
│   │   │   ├── Supreme Pizza ($14.99)
│   │   │   └── Hawaiian Pizza ($13.99)
│   │   ├── Pasta
│   │   │   ├── Carbonara ($12.99)
│   │   │   └── Bolognese ($11.99)
│   │   └── Desserts
│   │       └── Tiramisu ($6.99)
│   │
│   └── Beverages (Active)
│       └── Drinks
│           ├── Coca-Cola ($1.99)
│           ├── Orange Juice ($2.99)
│           └── Coffee ($2.50)
```

---

## Customer Experience

When customers scan the QR code:

1. **Landing Page** appears with:
   - Restaurant logo and name
   - "View Menu" button
   - Contact information

2. **Menu Selection** - Customer sees menu tabs:
   ```
   [Lunch Menu] [Dinner Menu] [Beverages]
   ```

3. **Category Filters** - Within selected menu:
   ```
   [All] [Appetizers] [Pizzas] [Pasta] [Desserts]
   ```

4. **Items Display** - Shows items grouped by category with:
   - Image (if provided)
   - Name
   - Description
   - Price
   - Category badge

---

## Why This Structure?

### ❌ OLD WAY (Confusing):
- Separate "Categories" page
- Categories managed independently
- Extra navigation steps
- Duplicate data

### ✅ NEW WAY (Simple):
- Categories created when adding items
- Everything in one place
- Natural workflow
- Less clicking

---

## Common Scenarios

### Scenario 1: "I want to add a new Pizza"
1. Go to "Dinner Menu" → Manage Items
2. Click "New Item"
3. Type category: "Pizzas" (auto-creates if doesn't exist)
4. Add pizza details
5. Done!

### Scenario 2: "I want to hide lunch items after 3 PM"
1. Go to Menus page
2. Toggle "Lunch Menu" to Inactive
3. Customers won't see lunch items anymore

### Scenario 3: "I want to add a seasonal category"
1. Add a new item
2. Type category: "Holiday Specials"
3. Category created automatically!

---

## API Endpoints (Technical)

```
GET    /api/menus/restaurant/:restaurantId        # List all menus
POST   /api/menus/restaurant/:restaurantId        # Create menu
GET    /api/menus/:menuId/items                   # List menu items
POST   /api/menus/:menuId/items                   # Create item (auto-creates category)
GET    /api/categories/restaurant/:restaurantId   # List categories (used in dropdown)
```

---

## Best Practices

1. **Menu Names**: Use time-based or context-based names
   - ✅ "Breakfast", "Lunch", "Dinner", "Late Night"
   - ❌ "Menu 1", "Menu 2"

2. **Category Names**: Use simple food types
   - ✅ "Appetizers", "Main Course", "Desserts"
   - ❌ "Category A", "Mixed Items"

3. **Active/Inactive**: Use this to control availability
   - Deactivate seasonal menus
   - Hide out-of-stock items

4. **Images**: Use high-quality URLs
   - Recommended: 800x600px or higher
   - Services: Unsplash, Cloudinary, ImgBB

---

## Troubleshooting

**Q: Where is the "Manage Categories" button?**  
A: There isn't one! Categories are created when adding items.

**Q: Why are there multiple API calls when I visit menus?**  
A: Fixed! Query keys are now properly cached. You should see one call per page.

**Q: Customer menu shows all categories, not just for active menus?**  
A: Fixed! Menu selection now filters categories within the selected menu.

**Q: Can I delete a category?**  
A: Categories are automatically cleaned up when no items reference them (handled by backend).

---

## Migration Notes

If you had the old "CategoriesPage":
- ✅ Removed from routes
- ✅ "Manage Categories" button removed
- ✅ Category creation moved to item form
- ✅ Existing categories still work

---

This is the **PERMANENT SOLUTION**. No more band-aids or temporary fixes!
