import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import api from '../utils/api';

export default function ItemDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalFee, setTotalFee] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchItem();
    }, [id]);

    useEffect(() => {
        calculateTotalFee();
    }, [startDate, endDate, item]);

    const fetchItem = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/items/${id}`);
            setItem(response.data);
        } catch (err) {
            setError('Failed to load item details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalFee = () => {
        if (!startDate || !endDate || !item) {
            setTotalFee(0);
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        if (days > 0) {
            setTotalFee(days * item.dailyFee);
        } else {
            setTotalFee(0);
        }
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            alert('Please select both start and end dates');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/requests', {
                itemId: id,
                startDate,
                endDate,
                totalFee,
            });

            document.querySelector('.toast')?.remove();
            const toast = document.createElement('div');
            toast.innerHTML = `
        <div class="toast toast-top toast-center">
          <div class="alert alert-success">
            <span>Request sent successfully!</span>
          </div>
        </div>
      `;
            document.body.appendChild(toast);

            // Reset form
            setStartDate('');
            setEndDate('');
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to send request';
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
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="min-h-screen bg-base-200 py-8">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="alert alert-error">
                        <span>{error || 'Item not found'}</span>
                    </div>
                    <button onClick={() => navigate('/browse')} className="btn btn-primary mt-4">
                        Back to Browse
                    </button>
                </div>
            </div>
        );
    }

    const imageUrl = item.images?.[0] || 'https://via.placeholder.com/600x400?text=Item+Image';

    return (
        <div className="min-h-screen bg-base-200 py-8">
            <div className="max-w-5xl mx-auto px-4">
                <button onClick={() => navigate('/browse')} className="btn btn-ghost mb-6">
                    ← Back to Browse
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Image and Details */}
                    <div className="lg:col-span-2">
                        <div className="card bg-base-100 shadow-lg overflow-hidden mb-6">
                            <figure className="h-96 bg-gray-200">
                                <img
                                    src={imageUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/600x400?text=Item+Image';
                                    }}
                                />
                            </figure>
                        </div>

                        {/* Item Info */}
                        <div className="card bg-base-100 shadow-md p-6 mb-6">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-4xl font-bold mb-2">{item.title}</h1>
                                    <div className="flex gap-2 items-center">
                                        <div className="badge badge-primary text-base">{item.category}</div>
                                        <span className="text-sm text-base-content/60">
                                            {item.available ? 'Available' : 'Not Available'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="divider"></div>

                            <p className="text-lg text-base-content/70 mb-6">{item.description}</p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-base-200 p-4 rounded-lg">
                                    <p className="text-sm text-base-content/60 mb-1">Daily Fee</p>
                                    <p className="text-3xl font-bold text-success">${item.dailyFee}</p>
                                </div>
                                <div className="bg-base-200 p-4 rounded-lg">
                                    <p className="text-sm text-base-content/60 mb-1">Security Deposit</p>
                                    <p className="text-3xl font-bold">${item.deposit}</p>
                                </div>
                            </div>

                            <div className="bg-base-200 p-4 rounded-lg">
                                <p className="text-sm text-base-content/60 mb-1">Location</p>
                                <p className="text-lg font-semibold">{item.location}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Owner Info and Request Form */}
                    <div className="lg:col-span-1">
                        {/* Owner Card */}
                        <div className="card bg-base-100 shadow-md p-6 mb-6">
                            <h3 className="text-xl font-bold mb-4">Item Owner</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="avatar placeholder">
                                    <div className="bg-primary text-primary-content rounded-full w-12">
                                        <span className="text-lg font-bold">
                                            {item.owner?.name?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-semibold">{item.owner?.name || 'Unknown'}</p>
                                    <StarRating rating={5} count={12} />
                                </div>
                            </div>
                            <button className="btn btn-ghost w-full justify-start text-left">
                                Message Owner
                            </button>
                        </div>

                        {/* Borrow Request Form */}
                        {isAuthenticated ? (
                            <div className="card bg-base-100 shadow-md p-6">
                                <h3 className="text-xl font-bold mb-4">Send Borrow Request</h3>
                                <form onSubmit={handleSubmitRequest} className="space-y-4">
                                    <div>
                                        <label className="label">
                                            <span className="label-text font-semibold">Start Date</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="input input-bordered w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="label">
                                            <span className="label-text font-semibold">End Date</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="input input-bordered w-full"
                                        />
                                    </div>

                                    {totalFee > 0 && (
                                        <div className="bg-base-200 p-4 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">Total Fee:</span>
                                                <span className="text-2xl font-bold text-success">${totalFee}</span>
                                            </div>
                                            <p className="text-xs text-base-content/60 mt-2">
                                                Plus ${item.deposit} security deposit
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting || !item.available}
                                        className="btn btn-primary w-full"
                                    >
                                        {submitting ? (
                                            <span className="loading loading-spinner loading-sm"></span>
                                        ) : (
                                            'Send Request'
                                        )}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="card bg-base-100 shadow-md p-6">
                                <h3 className="text-lg font-bold mb-4">Want to borrow this?</h3>
                                <p className="text-base-content/70 mb-6">
                                    Sign in to your account or create one to send a borrow request.
                                </p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="btn btn-primary w-full mb-2"
                                >
                                    Login to Borrow
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="btn btn-ghost w-full"
                                >
                                    Create Account
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
