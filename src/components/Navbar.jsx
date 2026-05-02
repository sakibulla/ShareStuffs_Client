import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="navbar bg-base-100 shadow-md sticky top-0 z-50">
            <div className="navbar-start">
                <div className="dropdown">
                    <label tabIndex={0} className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </label>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/browse">Browse Items</Link></li>
                        <li><Link to="/">How It Works</Link></li>
                    </ul>
                </div>
                <Link to="/" className="btn btn-ghost normal-case text-xl font-bold text-primary">
                    ShareStuff 🔄
                </Link>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 gap-2">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/browse">Browse Items</Link></li>
                    <li><a href="#how-it-works">How It Works</a></li>
                </ul>
            </div>
            <div className="navbar-end gap-2">
                {isAuthenticated ? (
                    <>
                        <Link to="/dashboard" className="btn btn-sm btn-primary">
                            Dashboard
                        </Link>
                        <button onClick={handleLogout} className="btn btn-sm btn-ghost">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn btn-sm btn-ghost">
                            Login
                        </Link>
                        <Link to="/register" className="btn btn-sm btn-primary">
                            Register
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
