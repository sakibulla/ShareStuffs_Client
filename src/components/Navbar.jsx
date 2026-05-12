import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { getSocket } from '../utils/socket';

export default function Navbar({ theme, onToggleTheme }) {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    const fetchUnread = async () => {
      try {
        const res = await api.get('/messages/unread-count');
        setUnreadCount(res.data.count || 0);
      } catch {
        // non-critical
      }
    };

    fetchUnread();

    // Poll every 30 seconds as a fallback
    const interval = setInterval(fetchUnread, 30000);

    // Also update via socket when a new message arrives
    const socket = getSocket();
    const handleNewMessage = (msg) => {
      if (msg.sender?._id !== user?._id) {
        setUnreadCount((prev) => prev + 1);
      }
    };
    if (socket) socket.on('new_message', handleNewMessage);

    return () => {
      clearInterval(interval);
      if (socket) socket.off('new_message', handleNewMessage);
    };
  }, [isAuthenticated, user?._id]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/browse', label: 'Browse Items' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      {/* Drawer for mobile */}
      <div className="drawer">
        <input id="mobile-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          {/* Navbar */}
          <nav className="navbar sticky top-0 z-50 bg-base-100/85 backdrop-blur-xl shadow-sm border-b border-base-300">
            <div className="navbar-start">
              {/* Hamburger - mobile only */}
              <label htmlFor="mobile-drawer" className="btn btn-ghost md:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
              </label>
              {/* Logo */}
              <Link to="/" className="btn btn-ghost normal-case text-xl font-bold gap-1">
                <span>🔄</span>
                <span className="brand-gradient-text">
                  ShareStuff
                </span>
              </Link>
            </div>

            {/* Desktop nav links */}
            <div className="navbar-center hidden md:flex">
              <ul className="menu menu-horizontal px-1 gap-1">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      end={link.to === '/'}
                      className={({ isActive }) =>
                        `btn btn-ghost btn-sm rounded-lg transition-all duration-200 ${
                          isActive ? 'text-primary font-semibold underline underline-offset-4' : ''
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right side */}
            <div className="navbar-end gap-2">
              <button
                type="button"
                onClick={onToggleTheme}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                <span className="text-base">{theme === 'dark' ? '☀️' : '🌙'}</span>
              </button>

              {/* Messages icon — only when logged in */}
              {isAuthenticated && (
                <Link
                  to="/messages"
                  className="btn btn-ghost btn-sm btn-circle indicator"
                  aria-label="Messages"
                  title="Messages"
                  onClick={() => setUnreadCount(0)}
                >
                  {unreadCount > 0 && (
                    <span className="indicator-item badge badge-primary badge-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223 3.677 3.677 0 00-.001 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              )}

              {isAuthenticated ? (
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className={`btn btn-ghost btn-circle avatar ${user?.avatar ? '' : 'placeholder'}`}>
                    {user?.avatar ? (
                      <div className="rounded-full w-9 ring ring-primary/20 ring-offset-2 ring-offset-base-100">
                        <img src={user.avatar} alt={user?.name || 'User'} />
                      </div>
                    ) : (
                      <div className="bg-primary text-primary-content rounded-full w-9">
                        <span className="text-sm font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                      </div>
                    )}
                  </label>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-2xl w-52 border border-base-300 mt-2">
                    <li className="menu-title px-3 py-2">
                      <span className="text-xs text-base-content/50 font-normal">Signed in as</span>
                      <span className="text-sm font-semibold text-base-content truncate">{user?.name}</span>
                    </li>
                    <div className="divider my-0"></div>
                    <li>
                      <Link to="/dashboard" className="transition-all duration-200">
                        📦 Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link to="/messages" className="transition-all duration-200" onClick={() => setUnreadCount(0)}>
                        💬 Messages
                        {unreadCount > 0 && (
                          <span className="badge badge-primary badge-sm ml-auto">{unreadCount > 9 ? '9+' : unreadCount}</span>
                        )}
                      </Link>
                    </li>
                    <li>
                      <Link to="/dashboard?tab=profile" className="transition-all duration-200">
                        👤 Profile
                      </Link>
                    </li>
                    <li>
                      <button onClick={handleLogout} className="text-error transition-all duration-200">
                        🚪 Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn btn-ghost btn-sm transition-all duration-200 active:scale-95">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm rounded-full transition-all duration-200 active:scale-95">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>

        {/* Mobile drawer sidebar */}
        <div className="drawer-side z-[100]">
          <label htmlFor="mobile-drawer" className="drawer-overlay"></label>
          <div className="bg-base-100 min-h-full w-72 p-6 flex flex-col gap-4 border-r border-base-300">
            <Link to="/" className="text-xl font-bold flex items-center gap-2 mb-4">
              <span>🔄</span>
              <span className="brand-gradient-text">
                ShareStuff
              </span>
            </Link>
            <button
              type="button"
              onClick={onToggleTheme}
              className="btn btn-outline btn-sm justify-start"
            >
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            <ul className="menu gap-1 p-0">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `rounded-xl transition-all duration-200 ${isActive ? 'bg-primary/10 text-primary font-semibold' : ''}`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
              {isAuthenticated && (
                <>
                  <li>
                    <Link to="/dashboard" className="rounded-xl transition-all duration-200">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/messages" className="rounded-xl transition-all duration-200" onClick={() => setUnreadCount(0)}>
                      💬 Messages
                      {unreadCount > 0 && (
                        <span className="badge badge-primary badge-sm ml-auto">{unreadCount > 9 ? '9+' : unreadCount}</span>
                      )}
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard?tab=profile" className="rounded-xl transition-all duration-200">
                      👤 Profile
                    </Link>
                  </li>
                </>
              )}
            </ul>
            <div className="mt-auto">
              {isAuthenticated ? (
                <button onClick={handleLogout} className="btn btn-error btn-outline btn-block">
                  Logout
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" className="btn btn-ghost btn-block">Login</Link>
                  <Link to="/register" className="btn btn-primary btn-block rounded-full">Get Started</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
