import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import ItemDetail from './pages/ItemDetail';
import Dashboard from './pages/Dashboard';
import AddEditItem from './pages/AddEditItem';

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const savedTheme = window.localStorage.getItem('sharestuff-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('sharestuff-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="flex flex-col min-h-screen bg-base-200 text-base-content">
            <Navbar theme={theme} onToggleTheme={toggleTheme} />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/browse" element={<Browse />} />
                <Route
                  path="/items/new"
                  element={
                    <ProtectedRoute>
                      <AddEditItem />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/items/:id/edit"
                  element={
                    <ProtectedRoute>
                      <AddEditItem />
                    </ProtectedRoute>
                  }
                />
                <Route path="/items/:id" element={<ItemDetail />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
