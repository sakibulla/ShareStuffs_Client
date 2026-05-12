import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../utils/api';
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Handle redirect result when user comes back from Google
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result) return; // no redirect in progress
        const user = result.user;
        const idToken = await user.getIdToken();
        const response = await api.post('/auth/firebase-login', {
          name: user.displayName,
          email: user.email,
          firebaseUID: user.uid,
          avatar: user.photoURL,
          idToken,
        });
        const { token, user: userData } = response.data;
        login(userData, token);
        addToast('Login successful!', 'success');
        navigate('/browse');
      })
      .catch((error) => {
        if (error.code !== 'auth/no-current-user') {
          console.error('Redirect result error:', error);
          addToast(error.response?.data?.message || 'Google login failed', 'error');
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email: formData.email, password: formData.password });
      const { token, user } = response.data;
      login(user, token);
      addToast('Login successful!', 'success');
      navigate('/browse');
    } catch (error) {
      addToast(error.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
      // Page will redirect to Google — result handled in useEffect above
    } catch (error) {
      console.error('Google login error:', error);
      addToast('Google login failed', 'error');
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
          <p className="text-xl text-primary-content/80 mb-10">Borrow. Lend. Connect.</p>
          <div className="space-y-4 text-left">
            {[
              'Browse hundreds of items nearby',
              'Save money by borrowing instead of buying',
              'Build trust in your community',
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
          <h1 className="text-3xl font-bold mb-1">Welcome back 👋</h1>
          <p className="text-base-content/60 mb-8">Sign in to your ShareStuff account</p>

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn btn-outline w-full gap-2 mb-4 transition-all duration-200 active:scale-95"
          >
            <span className="font-bold text-blue-500">G</span>
            Sign in with Google
          </button>

          <div className="divider text-base-content/40 text-sm">or continue with email</div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block mt-2 transition-all duration-200 active:scale-95"
            >
              {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-base-content/60 mt-6 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="link link-primary font-semibold">
              Join ShareStuff
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
