# ShareStuff Frontend - Quick Reference

## 📦 Files Created

### Core Application Files
| File | Purpose |
|------|---------|
| `src/App.jsx` | Main app component with React Router setup |
| `src/main.jsx` | React entry point (already configured) |
| `index.html` | HTML template with Emerald theme |

### Context & Utils
| File | Purpose |
|------|---------|
| `src/context/AuthContext.jsx` | Auth state management (login, logout, user data) |
| `src/utils/api.js` | Axios instance with JWT interceptor |

### Components (Reusable)
| File | Purpose |
|------|---------|
| `src/components/Navbar.jsx` | Top navigation with auth-aware links |
| `src/components/ItemCard.jsx` | Reusable item display card |
| `src/components/ProtectedRoute.jsx` | Route guard for authenticated pages |
| `src/components/LoadingSkeleton.jsx` | Skeleton UI while loading |
| `src/components/StarRating.jsx` | Read-only star rating display |

### Pages
| File | Route | Purpose |
|------|-------|---------|
| `src/pages/Home.jsx` | `/` | Landing page with hero & categories |
| `src/pages/Register.jsx` | `/register` | User registration |
| `src/pages/Login.jsx` | `/login` | User login |
| `src/pages/Browse.jsx` | `/browse` | Search & browse items |
| `src/pages/ItemDetail.jsx` | `/items/:id` | Item details & borrow request |
| `src/pages/Dashboard.jsx` | `/dashboard` | Protected dashboard (My Listings, Requests) |

### Documentation
| File | Content |
|------|---------|
| `FRONTEND_README.md` | Complete feature documentation & setup guide |
| `IMPLEMENTATION_GUIDE.md` | Technical details & development patterns |
| `QUICK_REFERENCE.md` | This file - file listing & quick commands |

---

## 🚀 Quick Start

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run dev
# → Open http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔑 Key Endpoints

All require header: `Authorization: Bearer <token>`

```
Auth:
  POST   /auth/register        → { token, user }
  POST   /auth/login           → { token, user }

Items:
  GET    /items                → Browse all items
  GET    /items/:id            → Item details
  GET    /items/my             → User's listings
  POST   /items                → Create item
  PUT    /items/:id            → Update item
  DELETE /items/:id            → Delete item

Requests:
  POST   /requests             → Create borrow request
  GET    /requests/mine        → User's requests
  GET    /requests/lender      → Incoming requests
  PUT    /requests/:id         → Accept/Reject request
```

---

## 🎨 Theme & Styling

- **Theme**: Emerald (DaisyUI)
- **CSS Framework**: Tailwind CSS 4 with DaisyUI 5
- **Responsive**: Mobile-first, fully responsive
- **Components**: All DaisyUI components (btn, card, input, badge, etc.)

---

## 🔐 Authentication Flow

```
1. User enters email/password
   ↓
2. POST /auth/login → Get JWT token
   ↓
3. Save token to localStorage
   ↓
4. Axios automatically adds token to all requests
   ↓
5. Token auto-refreshed on page reload from localStorage
   ↓
6. On logout: Clear localStorage + redirect to home
   ↓
7. On 401 error: Auto-logout + redirect to login
```

---

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px (md: prefix)
- **Desktop**: > 1024px (lg: prefix)

Example layouts:
- Browse grid: 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)
- Category showcase: 2 cols (mobile) → 6 cols (desktop)

---

## 🧩 Component Dependencies

```
App.jsx
├── AuthProvider (wrapper)
│   ├── Navbar
│   │   └── useAuth() → Auth status
│   └── Routes
│       ├── Home
│       ├── Register
│       ├── Login
│       ├── Browse
│       │   └── ItemCard[]
│       │   └── LoadingSkeleton
│       ├── ItemDetail
│       │   └── StarRating
│       └── Dashboard (ProtectedRoute)
│           └── Modal form (ItemCard-like)

api.js
└── axios instance with JWT interceptor

AuthContext.jsx
└── useAuth() hook for all components
```

---

## 🐛 Debugging Checklist

- [ ] Token in localStorage: `localStorage.getItem('token')`
- [ ] User data: `JSON.parse(localStorage.getItem('user'))`
- [ ] API requests in Network tab
- [ ] Authorization header: `Authorization: Bearer ...`
- [ ] React DevTools extension installed
- [ ] Check browser console for errors

---

## ✨ Features Summary

✅ User registration & login with JWT
✅ Browse items with search & filters
✅ View item details
✅ Submit borrow requests with date picker
✅ Manage your listings (add, edit, delete)
✅ Track borrow requests (as borrower)
✅ Manage incoming requests (as lender)
✅ Accept/reject requests
✅ Protected routes (auto-redirect to login)
✅ Loading states with skeletons
✅ Error handling with toasts
✅ Fully responsive design
✅ Emerald theme (green, professional)

---

## 📋 Form Validation

| Form | Required Fields | Validation |
|------|-----------------|-----------|
| Register | Name, Email, Password | Password 6+ chars, match confirm |
| Login | Email, Password | Basic format check |
| Add Item | Title, Category | Title non-empty, category selected |
| Edit Item | Title, Category, Fees | Fees must be > 0 |
| Borrow Request | Start Date, End Date | Dates required, calculates total fee |

---

## 🔄 State Management

**React Context** (Global):
- Current user data
- JWT token
- Authentication status

**useState** (Local):
- Form inputs
- Loading states
- Modal visibility
- Active tabs
- Filter selections

**localStorage**:
- JWT token (persists across sessions)
- User data (persists across sessions)

---

## 📞 Support

For implementation details, see: `IMPLEMENTATION_GUIDE.md`
For API reference, see: `FRONTEND_README.md`

---

## 🎯 Frontend Ready! ✅

The frontend is complete and ready to connect to your backend API at `http://localhost:5000/api`.

Make sure your backend implements all endpoints listed above with proper JWT authentication and error handling.
