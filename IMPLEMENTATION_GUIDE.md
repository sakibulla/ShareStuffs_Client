# ShareStuff Frontend - Implementation Guide

## Overview
This document provides technical details about the ShareStuff frontend implementation, component architecture, and API integration patterns.

## Component Architecture

### AuthContext.jsx
**Purpose**: Centralized authentication state management
- Stores: `user`, `token`, `isAuthenticated`, `loading`
- Methods:
  - `login(userData, authToken)` - Save user and token to state + localStorage
  - `logout()` - Clear auth state and localStorage
  - `useAuth()` - Custom hook to access auth context anywhere

**Key Features**:
```javascript
// Auto-recover from localStorage on mount
useEffect(() => {
  const savedToken = localStorage.getItem('token');
  if (savedToken) {
    setToken(savedToken);
    setUser(JSON.parse(localStorage.getItem('user')));
  }
}, []);
```

### api.js (Utils)
**Purpose**: Axios instance with JWT interceptor
- Base URL: `http://localhost:5000/api`
- Request interceptor adds `Authorization: Bearer <token>` header
- Response interceptor handles 401 errors by clearing token and redirecting to login

**Request Flow**:
```
User Action → API Call (with token) → Response with data
                                   ↓
                        401? → Clear localStorage → Redirect /login
```

### Navbar.jsx
**Purpose**: Navigation and authentication display
- Conditional rendering based on `isAuthenticated`
- Links: Home, Browse, How It Works
- Mobile drawer for responsive design
- Logo with app branding
- Dynamic auth buttons (Login/Register or Dashboard/Logout)

### ItemCard.jsx
**Purpose**: Reusable item display component
- Props: `item` (object with id, title, category, dailyFee, deposit, owner, etc.)
- Features:
  - Image placeholder with error handling
  - Category badge
  - Pricing display
  - Owner info with avatar and star rating
  - Link to item detail page

### ProtectedRoute.jsx
**Purpose**: Route guard for authenticated pages
- Checks `isAuthenticated` from AuthContext
- Redirects to `/login` if not authenticated
- Shows loading spinner while checking auth state
- Used for `/dashboard` route

### LoadingSkeleton.jsx
**Purpose**: Skeleton UI while loading
- Accepts `count` prop (default 6)
- Displays placeholder cards matching ItemCard layout
- Provides visual feedback during API calls

### StarRating.jsx
**Purpose**: Display-only star rating component
- Props: `rating` (1-5), `count` (number of reviews)
- Shows filled/empty stars based on rating
- Displays review count beside stars

## Page Components

### Home.jsx
**Structure**:
1. Hero section with CTA buttons
2. How It Works (3 steps)
3. Category showcase grid
4. Footer

**Key Logic**:
- Conditional CTA button: If logged in → Dashboard, else → Register
- Category cards are Links to `/browse?category=CategoryName`

### Register.jsx
**Validation Flow**:
```
User Input → Validate form → API POST /auth/register
                              ↓
                    Response {token, user}
                              ↓
                    login(user, token)
                              ↓
                    Redirect /browse
```

**Validation Rules**:
- Name: Required, non-empty
- Email: Required, format validation (HTML5)
- Password: Required, min 6 characters
- Confirm Password: Must match password field

**Error Handling**:
```javascript
try {
  // API call
} catch (error) {
  // Display toast with error.response?.data?.message
}
```

### Login.jsx
**Similar to Register** but with only Email and Password fields

### Browse.jsx
**Features**:
- Search bar + category filters (buttons)
- Query params: `?search=...&category=...`
- Fetches items from `GET /api/items` with query params
- Grid layout with LoadingSkeleton during fetch
- Empty state message if no items found

**Search Flow**:
```
User types → Form submit → Update searchParams
                              ↓
                        useEffect trigger
                              ↓
                    Fetch new items
```

### ItemDetail.jsx
**Two-column layout**:
- Left: Image, title, category, description, pricing, location
- Right: Owner card, Borrow request form OR Login prompt

**Borrow Request Logic**:
```
User selects dates → Auto-calculate days × dailyFee
                  → Display total fee
                  → Click "Send Request"
                  → POST /api/requests
                  → Show success toast
                  → Reset form
```

### Dashboard.jsx
**Tabs Structure**:

#### My Listings Tab
- Button to open Add/Edit Item modal
- Table with: Title, Category, Daily Fee, Status, Actions (Edit/Delete)
- Modal form with validation
- POST `/api/items` (new) or PUT `/api/items/:id` (edit)
- DELETE `/api/items/:id`

**Modal Form Fields**:
```javascript
{
  title: '',           // Required
  description: '',
  category: 'Tools',   // Required, dropdown
  dailyFee: '',        // Required, > 0
  deposit: '',         // Required, > 0
  location: '',
  available: true      // Checkbox
}
```

#### My Requests Tab
- Read-only table of user's borrow requests
- Shows: Item, Lender, Dates, Total Fee, Status
- GET `/api/requests/mine`

#### Incoming Requests Tab
- Table of requests for user's items
- Shows: Borrower, Item, Dates, Total Fee, Status
- Accept/Reject buttons for pending requests
- GET `/api/requests/lender`
- PUT `/api/requests/:id` with `{status: 'accepted'|'rejected'}`

## Form Patterns

All forms follow the same pattern:

```javascript
const [formData, setFormData] = useState({...});
const [errors, setErrors] = useState({});

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({...prev, [name]: value}));
  if (errors[name]) setErrors(prev => ({...prev, [name]: ''}));
};

const validateForm = () => {
  const newErrors = {};
  // Validation logic
  return newErrors;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const newErrors = validateForm();
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  
  try {
    const response = await api.post('/endpoint', formData);
    // Success handling
    showToast('Success!', 'success');
  } catch (error) {
    showToast(error.response?.data?.message || 'Error', 'error');
  }
};
```

## Toast Notification Pattern

```javascript
// Create and display toast
const toast = document.createElement('div');
toast.innerHTML = `
  <div class="toast toast-top toast-center">
    <div class="alert alert-${type}">
      <span>${message}</span>
    </div>
  </div>
`;
document.body.appendChild(toast);

// Auto-remove after 3 seconds (DaisyUI handles this)
```

## Error Handling Strategy

**API Errors**:
- Network errors: Display "Failed to load..."
- 401 Unauthorized: Auto-logout and redirect to login (via interceptor)
- 400 Bad Request: Display error.response.data.message
- 500 Server Error: Display generic error message

**Form Validation Errors**:
- Real-time error clearing on input change
- Display errors below input fields
- Submit button disabled until errors resolved

## State Management

### Local State (useState)
- Used for: Form data, UI state (modals, tabs, loading)
- Scope: Individual component

### Context State (AuthContext)
- Used for: User data, authentication token, login status
- Scope: Application-wide (all components via useAuth hook)

### localStorage
- Stores: JWT token, user data
- Used for: Persistence across page refreshes/browser sessions
- Cleared on: Logout or token expiration (401)

## Routing Structure

```
/ (Home)
├── /login (Login)
├── /register (Register)
├── /browse (Browse Items)
├── /items/:id (Item Detail)
└── /dashboard (Protected - My Items & Requests)
```

**Protected Routes**:
- Require authentication to access
- Redirect to `/login` if not authenticated
- Use `<ProtectedRoute>` wrapper component

## CSS Styling

**Tailwind + DaisyUI**:
- No custom CSS classes (utility-first approach)
- DaisyUI components for consistency
- Theme: Emerald (green, community-focused)
- Responsive breakpoints: `md:` (768px), `lg:` (1024px)

**Common Patterns**:
```jsx
// Buttons
<button className="btn btn-primary">
<button className="btn btn-ghost">
<button className="btn btn-outline">

// Cards
<div className="card bg-base-100 shadow-md">

// Inputs
<input className={`input input-bordered ${errors.field ? 'input-error' : ''}`} />

// Badge status
<div className={`badge ${condition ? 'badge-success' : 'badge-error'}`}>
```

## Performance Considerations

1. **Code Splitting**: Each page is a separate component (lazy loading by default with Router)
2. **Loading States**: Skeleton UI prevents layout shift
3. **API Caching**: No explicit caching (could be added for browse page)
4. **Image Optimization**: Placeholder images used to prevent broken images
5. **Form Efficiency**: Controlled components minimize re-renders

## Security Best Practices

1. **JWT Storage**: Token stored in localStorage (vulnerable to XSS but acceptable for this scope)
2. **CORS**: API calls made to localhost:5000 (backend handles CORS)
3. **Input Validation**: Client-side validation (server-side is primary defense)
4. **No Sensitive Data**: Only user name and id stored locally
5. **Token Expiration**: Handled by response interceptor

## Debugging Tips

### Check Authentication
```javascript
const { user, token, isAuthenticated } = useAuth();
console.log({ user, token, isAuthenticated });
```

### Check API Calls
- Open Network tab in DevTools
- Look for requests to `http://localhost:5000/api/*`
- Check request headers for Authorization header
- Check response status and body

### Check LocalStorage
```javascript
console.log(localStorage.getItem('token'));
console.log(JSON.parse(localStorage.getItem('user')));
```

## Adding New Features

### Add New Page
1. Create `src/pages/NewPage.jsx`
2. Add route in `App.jsx`: `<Route path="/path" element={<NewPage />} />`
3. Add link in Navbar if needed
4. Import in App.jsx

### Add Protected Route
1. Wrap component in `<ProtectedRoute>`
2. Route will auto-redirect to login if not authenticated

### Add New API Call
1. Use `api` instance from `utils/api.js`
2. Token automatically added to headers
3. Handle 401 errors (interceptor handles it)

### Add New Form
1. Follow form pattern (useState, handleChange, validateForm, handleSubmit)
2. Use controlled components
3. Show error messages below inputs
4. Display toast on success/error
5. Disable submit button while submitting

## Testing Checklist

- [ ] Registration with valid/invalid data
- [ ] Login with correct/incorrect credentials
- [ ] Token persistence across page reload
- [ ] Logout clears token
- [ ] Browse page filters work
- [ ] Item detail shows correct info
- [ ] Borrow request form calculates total correctly
- [ ] Dashboard tabs switch correctly
- [ ] Add/edit/delete items works
- [ ] Accept/reject requests works
- [ ] Protected route redirects to login when not authenticated
- [ ] Responsive design on mobile/tablet/desktop
