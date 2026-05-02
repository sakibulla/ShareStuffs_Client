import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            const { token, user } = response.data;
            login(user, token);

            // Show success message
            document.querySelector('.toast')?.remove();
            const toast = document.createElement('div');
            toast.innerHTML = `
        <div class="toast toast-top toast-center">
          <div class="alert alert-success">
            <span>Registration successful!</span>
          </div>
        </div>
      `;
            document.body.appendChild(toast);

            navigate('/browse');
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Registration failed';
            document.querySelector('.toast')?.remove();
            const toast = document.createElement('div');
            toast.innerHTML = `
        <div class="toast toast-top toast-center">
          <div class="alert alert-error">
            <span>${errorMsg}</span>
          </div>
        </div>
      `;
            document.body.appendChild(toast);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center px-4 py-12">
            <div className="card bg-base-100 shadow-xl w-full max-w-md">
                <div className="card-body">
                    <h1 className="card-title text-3xl font-bold text-center justify-center mb-2">
                        Create Account
                    </h1>
                    <p className="text-center text-base-content/70 mb-6">
                        Join ShareStuff today
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label">
                                <span className="label-text font-semibold">Full Name</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                            />
                            {errors.name && <span className="text-error text-sm mt-1 block">{errors.name}</span>}
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text font-semibold">Email</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                            />
                            {errors.email && <span className="text-error text-sm mt-1 block">{errors.email}</span>}
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text font-semibold">Password</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                            />
                            {errors.password && <span className="text-error text-sm mt-1 block">{errors.password}</span>}
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text font-semibold">Confirm Password</span>
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className={`input input-bordered w-full ${errors.confirmPassword ? 'input-error' : ''}`}
                            />
                            {errors.confirmPassword && (
                                <span className="text-error text-sm mt-1 block">{errors.confirmPassword}</span>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full mt-6"
                        >
                            {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Create Account'}
                        </button>
                    </form>

                    <div className="divider my-4">OR</div>

                    <button className="btn btn-outline w-full gap-2">
                        <span>🔐</span> Sign up with Google
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-base-content/70">
                            Already have an account?{' '}
                            <Link to="/login" className="link link-primary font-semibold">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
