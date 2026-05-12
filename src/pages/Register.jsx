import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../utils/api';
import { pageTransition, staggerContainer, staggerItem, tapPress } from '../utils/animations';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

const perks = [
  'List items and earn extra income',
  'Borrow what you need, when you need it',
  'Reduce waste and help the environment',
];

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      login(res.data.user, res.data.token);
      addToast('Account created! Welcome to ShareStuff 🎉', 'success');
      navigate('/browse');
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await api.post('/auth/firebase-login', {
        name: result.user.displayName,
        email: result.user.email,
        firebaseUID: result.user.uid,
        avatar: result.user.photoURL,
        idToken,
      });
      login(res.data.user, res.data.token);
      addToast('Account created!', 'success');
      navigate('/browse');
    } catch (err) {
      if (err.code === 'auth/popup-blocked') {
        addToast('Popup blocked — allow popups for this site and try again.', 'error');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        addToast(err.response?.data?.message || err.message || 'Google login failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen flex"
    >
      {/* ── Left brand panel ──────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 brand-panel relative overflow-hidden flex-col items-center justify-center p-12 text-primary-content">
        <div className="absolute inset-x-12 top-16 h-px bg-primary-content/20" />
        <div className="absolute inset-x-12 bottom-16 h-px bg-primary-content/10" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center"
        >
          <motion.div variants={staggerItem} className="text-5xl font-extrabold mb-3 flex items-center gap-3 justify-center">
            <span>🔄</span> ShareStuff
          </motion.div>
          <motion.p variants={staggerItem} className="text-xl text-primary-content/75 mb-10">
            Join thousands of sharers today
          </motion.p>
          <div className="space-y-4 text-left">
            {perks.map((perk) => (
              <motion.div key={perk} variants={staggerItem} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-content/20 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  ✓
                </span>
                <span className="text-primary-content/85 text-sm">{perk}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right form panel ──────────────────────────────────────────────── */}
      <div className="flex-1 bg-base-100 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <motion.div variants={staggerItem}>
            <h1 className="text-3xl font-bold mb-1">Join ShareStuff 🎉</h1>
            <p className="text-base-content/55 mb-8 text-sm">Create your free account today</p>
          </motion.div>

          {/* Google button */}
          <motion.div variants={staggerItem}>
            <motion.button
              whileTap={tapPress}
              onClick={handleGoogleLogin}
              disabled={loading}
              className="btn btn-outline w-full gap-3 mb-2 rounded-xl h-12 text-sm font-medium"
            >
              {loading ? <span className="loading loading-spinner loading-sm" /> : <GoogleIcon />}
              Continue with Google
            </motion.button>
            <p className="text-xs text-base-content/35 text-center mb-5">
              If a popup doesn't appear, allow popups for this site in your browser settings.
            </p>
          </motion.div>

          <motion.div variants={staggerItem} className="divider text-base-content/35 text-xs">
            or continue with email
          </motion.div>

          {/* Form */}
          <motion.form variants={staggerItem} onSubmit={handleSubmit} className="space-y-4 mt-4">
            {[
              { name: 'name',            label: 'Full Name',        type: 'text',     placeholder: 'John Doe',        autoComplete: 'name' },
              { name: 'email',           label: 'Email',            type: 'email',    placeholder: 'you@example.com', autoComplete: 'email' },
              { name: 'password',        label: 'Password',         type: 'password', placeholder: '••••••••',        autoComplete: 'new-password' },
              { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••',        autoComplete: 'new-password' },
            ].map((field) => (
              <div key={field.name} className="form-control">
                <label className="label py-1">
                  <span className="label-text font-medium text-sm">{field.label}</span>
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  className={`input input-bordered w-full rounded-xl ${errors[field.name] ? 'input-error' : ''}`}
                />
                {errors[field.name] && (
                  <motion.span
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-error text-xs mt-1"
                  >
                    {errors[field.name]}
                  </motion.span>
                )}
              </div>
            ))}

            <motion.button
              whileTap={tapPress}
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block rounded-xl mt-2 h-12"
            >
              {loading ? <span className="loading loading-spinner loading-sm" /> : 'Create Account'}
            </motion.button>
          </motion.form>

          <motion.p variants={staggerItem} className="text-center text-base-content/55 mt-6 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="link link-primary font-semibold">
              Login here
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
