# ShareStuff - Peer-to-Peer Item Lending Platform Frontend

A modern, fully-responsive React application built with Vite, Tailwind CSS, and DaisyUI components. This frontend enables users to list items, browse available items, and manage peer-to-peer lending transactions.

## 🚀 Tech Stack

- **React 19** - UI library
- **Vite** - Fast build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS 4** - Utility-first CSS framework
- **DaisyUI 5** - Component library for Tailwind
- **Axios** - HTTP client for API calls
- **Emerald Theme** - DaisyUI theme (community-focused green palette)

## 📁 Project Structure

```
src/
├── context/
│   └── AuthContext.jsx          # Auth state management
├── components/
│   ├── Navbar.jsx               # Navigation bar with auth status
│   ├── ItemCard.jsx             # Reusable item card component
│   ├── ProtectedRoute.jsx       # Route guard for authenticated pages
│   ├── LoadingSkeleton.jsx      # Loading placeholder skeleton
│   └── StarRating.jsx           # Display-only star rating
├── pages/
│   ├── Home.jsx                 # Landing page with hero, how-it-works, categories
│   ├── Login.jsx                # Login form page
│   ├── Register.jsx             # Registration form page
│   ├── Browse.jsx               # Item browsing with search & filters
│   ├── ItemDetail.jsx           # Single item detail & borrow request
│   └── Dashboard.jsx            # User dashboard (protected)
│       ├── My Listings tab      # Manage your items
│       ├── My Requests tab      # Track your borrow requests
│       └── Incoming Requests    # Manage lending requests
├── utils/
│   └── api.js                   # Axios instance with JWT interceptor
├── App.jsx                      # Main app with all routes
├── main.jsx                     # React DOM entry point
└── index.css                    # Tailwind & DaisyUI imports
```

## 🎨 Pages & Features

### 1. **Home Page** (`/`)
- Hero section with headline and CTA buttons
- 3-step "How It Works" section
- Category showcase grid (Tools, Camping, Party, Kitchen, Electronics, Sports)
- Footer with branding
- Responsive design optimized for all devices

### 2. **Register Page** (`/register`)
- Form with Name, Email, Password, Confirm Password fields
- Client-side validation (6+ chars, password match)
- POST `/api/auth/register` API call
- Saves JWT token to localStorage
- Redirects to browse on success
- Google Sign-In button (placeholder)
- Link to login page

### 3. **Login Page** (`/login`)
- Email & Password form
- POST `/api/auth/login` API call
- Saves JWT token and redirects to browse
- Google Sign-In button (placeholder)
- Link to register page

### 4. **Browse Page** (`/browse`)
- Search bar to filter by keyword
- Category filter buttons (All, Tools, Camping, Party, Kitchen, Electronics, Sports)
- Grid layout (3 columns desktop, responsive mobile)
- Item cards showing image, title, category, fees, owner info, "View Details" button
- GET `/api/items?category=x&search=y`
- Loading skeleton animation
- Empty state message

### 5. **Item Detail Page** (`/items/:id`)
- Full-size item image
- Item info: title, category badge, description
- Pricing: daily fee and deposit clearly displayed
- Owner info card with avatar, name, rating
- **If logged in**: Borrow request form with:
  - Start & end date pickers
  - Auto-calculated total fee display
  - "Send Request" button → POST `/api/requests`
- **If not logged in**: "Login to Borrow" and "Create Account" buttons
- GET `/api/items/:id` API call

### 6. **Dashboard** (`/dashboard`) - Protected Route
Three tabs for managing items and requests:

#### a. **My Listings Tab**
- "Add New Item" button opens modal
- Table of your items with Edit/Delete buttons
- Modal form with fields: Title, Description, Category (dropdown), Daily Fee, Deposit, Location, Available toggle
- Client-side validation (title & category required)
- GET `/api/items/my`, POST `/api/items`, PUT `/api/items/:id`, DELETE `/api/items/:id`

#### b. **My Requests Tab**
- Table showing requests you've sent as a borrower
- Columns: Item, Lender, Dates, Total Fee, Status badge
- Status colors: warning (pending), success (accepted), error (rejected)
- GET `/api/requests/mine`

#### c. **Incoming Requests Tab**
- Table of requests others sent for your items
- Columns: Borrower, Item, Dates, Total Fee, Status, Actions
- Accept/Reject buttons for pending requests
- PUT `/api/requests/:id` with status update
- GET `/api/requests/lender`

## 🔐 Authentication

- JWT token stored in localStorage
- Axios request interceptor automatically adds Bearer token to all requests
- Response interceptor handles 401 errors (expired token) by clearing storage and redirecting to login
- Protected routes use `<ProtectedRoute>` wrapper
- Auth state managed via React Context API

## 🎯 API Integration

Base URL: `http://localhost:5000/api`

All requests include JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints Used:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /items` - Browse items (with query params: category, search)
- `GET /items/:id` - Get item details
- `GET /items/my` - User's listed items
- `POST /items` - Add new item
- `PUT /items/:id` - Update item
- `DELETE /items/:id` - Delete item
- `POST /requests` - Create borrow request
- `GET /requests/mine` - User's borrow requests
- `GET /requests/lender` - Incoming borrow requests
- `PUT /requests/:id` - Accept/Reject request

## 🎨 DaisyUI Components Used

- `navbar` - Top navigation bar
- `card` - Content containers
- `btn` - Buttons (primary, ghost, outline variants)
- `input` - Text inputs
- `textarea` - Text areas
- `select` - Dropdowns
- `badge` - Category/status badges
- `avatar` - User avatars with placeholder
- `modal` - Dialogs (custom div-based implementation)
- `table` - Data tables
- `tabs` - Tab navigation
- `alert` - Success/error messages
- `skeleton` - Loading placeholders
- `drawer` - Mobile nav drawer (in Navbar)
- `divider` - Visual separators
- `join` - Grouped form elements
- `dropdown` - Dropdown menus
- `loading` - Loading spinner

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
- Dev server runs on `http://localhost:5173`
- Vite provides hot module replacement (HMR)

### Build
```bash
npm run build
```
- Outputs optimized production build to `dist/`

### Preview Built Version
```bash
npm run preview
```

## 📱 Responsive Design

- **Mobile First** approach
- Fully responsive grid layouts:
  - Browse: 1 column mobile → 2 columns tablet → 3 columns desktop
  - Category cards: 2 columns mobile → 6 columns desktop
- Responsive tables that adapt to smaller screens
- Mobile-optimized Navbar with hamburger menu drawer

## 🛡️ Validation

### Client-Side
- **Register**: All fields required, password 6+ chars, password match
- **Login**: Email & password required
- **Item Form**: Title & category required, fees > 0
- **Date Picker**: Start and end dates required for borrow requests

### Form Types
- All forms use controlled components with useState
- No HTML form tags - custom onClick handlers on divs/buttons
- Real-time error clearing on input change

## 💬 Toast Notifications

Success and error messages displayed via toast alerts:
- Success: green background
- Error: red background
- Auto-positioned top-center
- Auto-dismiss after 3-4 seconds

## 🎨 Theme

DaisyUI theme: **Emerald**
- Primary Color: Green (friendly, community-focused)
- Secondary Color: Complements primary
- Full color palette automatically applied to all components

## 📝 Key Features

✅ Complete user authentication (Register/Login)
✅ Browse items with search and category filters
✅ View item details and submit borrow requests
✅ Manage your listings (CRUD operations)
✅ Track your borrow requests and their status
✅ Accept/reject incoming borrow requests
✅ JWT-based API security
✅ Protected routes with redirect to login
✅ Loading states with skeleton animations
✅ Error handling with user-friendly messages
✅ Fully responsive mobile-first design
✅ Accessibility-friendly DaisyUI components

## 🔄 Data Flow

1. User registers/logs in → JWT token saved to localStorage
2. Navbar displays Dashboard/Logout if authenticated
3. Browse page fetches items from API with filters
4. Click item → View details, see owner info, submit borrow request
5. Dashboard shows user's listings, borrow requests, and incoming requests
6. Edit/delete items or accept/reject requests from dashboard

## 🛠️ Future Enhancements

- Image upload for items
- Real Google Sign-In integration
- Messaging system between users
- Reviews and ratings system
- Payment integration
- Email notifications
- Advanced search with price range filters
- Map-based location search
- Social sharing features
