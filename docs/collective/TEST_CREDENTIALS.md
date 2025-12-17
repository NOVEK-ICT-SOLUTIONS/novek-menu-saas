# Test Credentials

## 🎯 Quick Access

**Admin Account:**
- Email: `admin@novekmenu.com`
- Password: `admin123`
- Role: ADMIN

**Owner Account:**
- Email: `owner@example.com`
- Password: `owner123`
- Role: OWNER

## 🍕 Demo Restaurant

**Restaurant Details:**
- Name: Pizza Palace
- Slug: `pizza-palace`
- Customer Menu URL: `http://localhost:5173/menu/pizza-palace`
- Customization: Red color theme (#dc2626), full contact info, logo, and header image

**Features:**
- 5 Categories: Appetizers, Pizzas, Pasta, Desserts, Drinks
- 3 Menus: Lunch Menu, Dinner Menu, Beverages
- 20+ Menu Items with images and descriptions
- Fully customizable theme and branding

## 🎨 Customization Page

**Where to customize restaurant theme, colors, and images:**
1. Login as owner: `owner@example.com` / `owner123`
2. Navigate to **Settings** in the sidebar
3. Customize:
   - **Contact Info:** Location, email, phone
   - **Brand Colors:** Primary color (buttons/accents), background color
   - **Images:** Logo URL, header image URL
4. Click **Save Changes**
5. Click **Preview Menu** to see live changes

**Features:**
- Live preview on the right side
- Color picker with hex input
- Real-time visual feedback
- Mobile-optimized customer menu

## 📱 Customer Menu Features

**Landing Page (QR Scan):**
- Restaurant logo and name
- Hero background with header image (blurred)
- Action buttons: View Menu, Location, Contact, Feedback
- Contact information footer

**Menu View:**
- Sticky header with branding
- Category filter tabs
- Organized menu items by category
- Custom color scheme
- Mobile-optimized fonts and spacing

## 🔧 Technical Notes
- **Email:** owner@test.com
- **Password:** Test123!@#
- **Role:** OWNER
- **User ID:** cmi0rosrr0000vhdkwmpnt08w

## Admin Account
- **Email:** admin@test.com
- **Password:** Admin123!@#
- **Role:** OWNER (Note: Currently defaults to OWNER, needs manual DB update to ADMIN)
- **User ID:** cmi0rqs4o0009vhdkre48zi28

## Test Data Created
- **Restaurant ID:** cmi0rpiyd0002vhdke614thcb
  - Name: My Test Restaurant
  - Slug: my-test-restaurant

- **Menu ID:** cmi0rps1k0004vhdkqd9nsnrv
  - Name: Dinner Menu
  - Status: Active

- **Category ID:** cmi0rpzzg0006vhdkz0xbvlra
  - Name: Appetizers
  - Sort Order: 1

- **Menu Item ID:** cmi0rqalp0008vhdkpdt6xpka
  - Name: Caesar Salad
  - Description: Fresh romaine lettuce with parmesan and croutons
  - Price: $14.99
  - Available: Yes

## API Base URL
- **Backend:** http://localhost:3000
- **Frontend:** http://localhost:5173 (to be started)

## Quick Test Commands
```powershell
# Login as Owner
$body = @{ email = "owner@test.com"; password = "Test123!@#" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.data.accessToken

# Use token for authenticated requests
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3000/api/restaurants" -Method GET -Headers $headers
```
