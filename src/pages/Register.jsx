import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../utils/api';

async function firebaseGoogleLogin(auth, provider) {
  try {
    return await signInWithPopup(auth, provider);
  } catch (err) {
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw err;
  }
}

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Handle the result when Firebase redirects back to this page
  useEffect(() => {
    setLoading(true);
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result) return;
        await handleFirebaseUser(result.user);
      })
      .catch((err) => {
        if (err?.code !== 'auth/no-current-user') {
          console.error('Redirect result error:', err);
          addToast('Google login failed. Please try again.', 'error');
        }
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFirebaseUser = async (firebaseUser) => {
    const idToken = await firebaseUser.getIdToken();
    const response = await api.post('/auth/firebase-login', {
      name: firebaseUser.displayName,
      email: firebaseUser.email,
      firebaseUID: firebaseUser.uid,
      avatar: firebaseUser.photoURL,
      idToken,
    });
    const { token, user: userData } = response.data;
    login(userData, token);
    addToast('Account created!', 'success');
    navigate('/browse');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      const { token, user } = response.data;
      login(user, token);
      addToast('Registration successful!', 'success');
      navigate('/browse');
    } catch (error) {
      addToast(error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await firebaseGoogleLogin(auth, googleProvider);
      if (result) {
        await handleFirebaseUser(result.user);
      }
    } catch (error) {
      console.error('Google login error:', error);
      addToast(error.response?.data?.message || error.message || 'Google login failed', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex fade-in">
      {/* Left panel - desktop only */}
      <div className="hidden lg:flex lg:w-1/2 brand-panel relative overflow-hidden flex-col items-center justify-center p-12 text-primary-content">
        <div className="absolute inset-x-12 top-16 h-px bg-primary-content/25"></div>
        <div className="absolute inset-x-12 bottom-16 h-px bg-primary-content/15"></div>
        <div className="relative z-10 text-center">
          <div className="text-5xl font-bold mb-4 flex items-center gap-3 justify-center">
            <span>🔄</span> ShareStuff
          </div>
          <p className="text-xl text-primary-content/80 mb-10">Join thousands of sharers today</p>
          <div className="space-y-4 text-left">
            {[
              'List items and earn extra income',
              'Borrow what you need, when you need it',
              'Reduce waste and help the environment',
            ].map((point) => (
              <div key={point} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-content/20 flex items-center justify-center text-sm font-bold">✓</span>
                <span className="text-primary-content/90">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-base-100 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-1">Join ShareStuff 🎉</h1>
          <p className="text-base-content/60 mb-8">Create your free account today</p>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn btn-outline w-full gap-2 mb-4 transition-all duration-200 active:scale-95"
          >
            {loading
              ? <span className="loading loading-spinner loading-sm" />
              : <span className="font-bold text-blue-500">G</span>
            }
            Sign in with Google
          </button>

          <div className="divider text-base-content/40 text-sm">or continue with email</div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Full Name</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`input input-bordered w-full focus:ring-2 ring-primary/30 transition-all duration-200 ${errors.name ? 'input-error' : ''}`}
              />
              {errors.name && <span className="text-error text-sm mt-1">{errors.name}</span>}
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Email</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`input input-bordered w-full focus:ring-2 ring-primary/30 transition-all duration-200 ${errors.email ? 'input-error' : ''}`}
              />
              {errors.email && <span className="text-error text-sm mt-1">{errors.email}</span>}
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Password</span></label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`input input-bordered w-full focus:ring-2 ring-primary/30 transition-all duration-200 ${errors.password ? 'input-error' : ''}`}
              />
              {errors.password && <span className="text-error text-sm mt-1">{errors.password}</span>}
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Confirm Password</span></label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`input input-bordered w-full focus:ring-2 ring-primary/30 transition-all duration-200 ${errors.confirmPassword ? 'input-error' : ''}`}
              />
              {errors.confirmPassword && <span className="text-error text-sm mt-1">{errors.confirmPassword}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block mt-2 transition-all duration-200 active:scale-95"
            >
              {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-base-content/60 mt-6 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="link link-primary font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
