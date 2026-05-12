import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { getSocket } from '../utils/socket';

// ── Icons ──────────────────────────────────────────────────────────────────
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223 3.677 3.677 0 00-.001 0z" clipRule="evenodd" />
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

// ── Mobile drawer animation variants ──────────────────────────────────────
const drawerVariants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: { duration: 0.22, ease: 'easeIn' },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const navLinkVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.25, ease: 'easeOut' },
  }),
};

export default function Navbar({ theme, onToggleTheme }) {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [navigate]);

  // Fetch unread message count
  useEffect(() => {
    if (!isAuthenticated) { setUnreadCount(0); return; }

    const fetchUnread = async () => {
      try {
        const res = await api.get('/messages/unread-count');
        setUnreadCount(res.data.count || 0);
      } catch { /* non-critical */ }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);

    const socket = getSocket();
    const handleNewMessage = (msg) => {
      if (msg.sender?._id !== user?._id) setUnreadCount((p) => p + 1);
    };
    if (socket) socket.on('new_message', handleNewMessage);

    return () => {
      clearInterval(interval);
      if (socket) socket.off('new_message', handleNewMessage);
    };
  }, [isAuthenticated, user?._id]);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/browse', label: 'Browse' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      {/* ── Main Navbar ─────────────────────────────────────────────────── */}
      <nav className="navbar sticky top-0 z-50 navbar-blur shadow-sm border-b border-base-300/50 px-3 sm:px-6 h-16">
        {/* Logo */}
        <div className="navbar-start">
          {/* Hamburger — mobile only */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(true)}
            className="btn btn-ghost btn-sm btn-circle md:hidden mr-1"
            aria-label="Open menu"
          >
            <MenuIcon />
          </motion.button>

          <Link to="/" className="flex items-center gap-2 group">
            <motion.span
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="text-xl select-none"
            >
              🔄
            </motion.span>
            <span className="brand-gradient-text font-extrabold text-xl tracking-tight">
              ShareStuff
            </span>
          </Link>
        </div>

        {/* Desktop nav links */}
        <div className="navbar-center hidden md:flex">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `relative px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? 'text-primary'
                        : 'text-base-content/70 hover:text-base-content hover:bg-base-200'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {/* Animated underline for active link */}
                      {isActive && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute bottom-1 left-4 right-4 h-0.5 rounded-full bg-primary"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Right side actions */}
        <div className="navbar-end gap-1.5">
          {/* Theme toggle */}
          <motion.button
            whileTap={{ scale: 0.85, rotate: 15 }}
            onClick={onToggleTheme}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {/* Messages icon */}
          {isAuthenticated && (
            <motion.div whileTap={{ scale: 0.9 }}>
              <Link
                to="/messages"
                onClick={() => setUnreadCount(0)}
                className="btn btn-ghost btn-sm btn-circle indicator"
                aria-label="Messages"
              >
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="indicator-item badge badge-primary badge-xs font-bold"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
                <ChatIcon />
              </Link>
            </motion.div>
          )}

          {/* Auth buttons / avatar */}
          {isAuthenticated ? (
            <div className="dropdown dropdown-end">
              <motion.label
                whileTap={{ scale: 0.92 }}
                tabIndex={0}
                className="btn btn-ghost btn-circle avatar cursor-pointer"
              >
                {user?.avatar ? (
                  <div className="rounded-full w-9 ring-2 ring-primary/30 ring-offset-2 ring-offset-base-100 overflow-hidden">
                    <img src={user.avatar} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-full w-9 flex items-center justify-center">
                    <span className="text-sm font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  </div>
                )}
              </motion.label>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-2xl w-56 border border-base-300/60 mt-2"
              >
                <li className="px-3 py-2 pointer-events-none">
                  <span className="text-xs text-base-content/40 font-normal block">Signed in as</span>
                  <span className="text-sm font-semibold text-base-content truncate block">{user?.name}</span>
                </li>
                <div className="divider my-1" />
                <li><Link to="/dashboard" className="rounded-xl gap-2">📦 Dashboard</Link></li>
                <li>
                  <Link to="/messages" className="rounded-xl gap-2" onClick={() => setUnreadCount(0)}>
                    💬 Messages
                    {unreadCount > 0 && (
                      <span className="badge badge-primary badge-sm ml-auto">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    )}
                  </Link>
                </li>
                <li><Link to="/dashboard?tab=profile" className="rounded-xl gap-2">👤 Profile</Link></li>
                <div className="divider my-1" />
                <li>
                  <button onClick={handleLogout} className="rounded-xl text-error gap-2">
                    🚪 Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <motion.div whileTap={{ scale: 0.95 }}>
                <Link to="/login" className="btn btn-ghost btn-sm rounded-xl hidden sm:flex">
                  Login
                </Link>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm rounded-full px-5 shadow-md shadow-primary/20"
                >
                  Get Started
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </nav>

      {/* ── Mobile Drawer ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm md:hidden"
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 left-0 z-[100] h-full w-72 bg-base-100 border-r border-base-300/60 flex flex-col p-6 md:hidden shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                  <span className="text-xl">🔄</span>
                  <span className="brand-gradient-text font-extrabold text-xl">ShareStuff</span>
                </Link>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <CloseIcon />
                </motion.button>
              </div>

              {/* Theme toggle */}
              <button
                onClick={onToggleTheme}
                className="btn btn-outline btn-sm justify-start gap-2 mb-4 rounded-xl"
              >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>

              {/* Nav links */}
              <nav className="flex flex-col gap-1 flex-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    custom={i}
                    variants={navLinkVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <NavLink
                      to={link.to}
                      end={link.to === '/'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}

                {isAuthenticated && (
                  <>
                    <div className="divider my-1" />
                    {[
                      { to: '/dashboard', label: '📦 Dashboard' },
                      { to: '/messages', label: '💬 Messages', badge: unreadCount },
                      { to: '/dashboard?tab=profile', label: '👤 Profile' },
                    ].map((link, i) => (
                      <motion.div
                        key={link.to}
                        custom={navLinks.length + i}
                        variants={navLinkVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <Link
                          to={link.to}
                          onClick={() => { setMobileOpen(false); if (link.badge) setUnreadCount(0); }}
                          className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors duration-150"
                        >
                          {link.label}
                          {link.badge > 0 && (
                            <span className="badge badge-primary badge-sm">{link.badge > 9 ? '9+' : link.badge}</span>
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </>
                )}
              </nav>

              {/* Footer actions */}
              <div className="mt-auto pt-4 border-t border-base-300/60">
                {isAuthenticated ? (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLogout}
                    className="btn btn-error btn-outline btn-block rounded-xl"
                  >
                    🚪 Logout
                  </motion.button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="btn btn-ghost btn-block rounded-xl"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="btn btn-primary btn-block rounded-full"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
