import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/browse', label: 'Browse Items' },
  ];

  return (
    <>
      {/* Drawer for mobile */}
      <div className="drawer">
        <input id="mobile-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          {/* Navbar */}
          <nav className="navbar sticky top-0 z-50 bg-base-100/80 backdrop-blur-md shadow-sm border-b border-base-200">
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
                <span className="bg-gradient-to-r from-green-600 to-emerald-400 bg-clip-text text-transparent">
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
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-2xl w-52 border border-base-200 mt-2">
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
          <div className="bg-base-100 min-h-full w-72 p-6 flex flex-col gap-4">
            <Link to="/" className="text-xl font-bold flex items-center gap-2 mb-4">
              <span>🔄</span>
              <span className="bg-gradient-to-r from-green-600 to-emerald-400 bg-clip-text text-transparent">
                ShareStuff
              </span>
            </Link>
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
                    <Link to="/dashboard?tab=profile" className="rounded-xl transition-all duration-200">
                      Profile
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
