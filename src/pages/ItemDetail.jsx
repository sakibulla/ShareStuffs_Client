import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import StarRating from '../components/StarRating';
import api from '../utils/api';

const categoryEmoji = {
  Tools: '🔧', Camping: '⛺', Party: '🎉', Kitchen: '🍳', Electronics: '📱', Sports: '⚽',
};

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');

  // Today's date in YYYY-MM-DD format for the min attribute
  const today = new Date().toISOString().split('T')[0];
  const [endDate, setEndDate] = useState('');
  const [totalFee, setTotalFee] = useState(0);
  const [days, setDays] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [ownerReviews, setOwnerReviews] = useState([]);

  useEffect(() => { fetchItem(); }, [id]);

  useEffect(() => {
    if (!item?.owner?._id) return;
    api.get(`/reviews/user/${item.owner._id}`)
      .then((res) => setOwnerReviews(res.data || []))
      .catch(() => {});
  }, [item?.owner?._id]);

  useEffect(() => {
    if (!startDate || !endDate || !item) { setTotalFee(0); setDays(0); return; }
    const d = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    if (d > 0) { setDays(d); setTotalFee(d * item.dailyFee); }
    else { setDays(0); setTotalFee(0); }
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

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) { addToast('Please select both start and end dates', 'error'); return; }

    setSubmitting(true);
    try {
      // 1. Create the borrow request
      const requestRes = await api.post('/requests', { itemId: id, startDate, endDate, totalFee });
      const newRequest = requestRes.data;

      // 2. If there's a deposit, redirect to Stripe Checkout
      if (item.deposit > 0) {
        addToast('Redirecting to payment...', 'info');
        const sessionRes = await api.post('/payments/create-checkout-session', {
          requestId: newRequest._id,
        });
        // Redirect to Stripe hosted checkout page
        window.location.href = sessionRes.data.url;
      } else {
        addToast('Request sent successfully!', 'success');
        setStartDate('');
        setEndDate('');
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to send request', 'error');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-base-200 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="alert alert-error mb-4"><span>{error || 'Item not found'}</span></div>
          <button onClick={() => navigate('/browse')} className="btn btn-primary">Back to Browse</button>
        </div>
      </div>
    );
  }

  const imageUrl = item.images?.[0];
  const emoji = categoryEmoji[item.category] || '📦';
  const ownerName = item.owner?.name || 'Unknown';
  const ownerAvatar = item.owner?.avatar;
  const ownerInitial = ownerName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4 fade-in">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm breadcrumbs mb-6 text-base-content/60">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/browse">Browse</Link></li>
            <li className="text-base-content">{item.title}</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="card bg-base-100 shadow-md overflow-hidden">
              <div className="h-80 lg:h-96 relative overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div
                  className={`w-full h-full item-placeholder items-center justify-center text-8xl ${imageUrl ? 'hidden' : 'flex'}`}
                >
                  {emoji}
                </div>
              </div>
            </div>

            {/* Item info */}
            <div className="card bg-base-100 shadow-md p-6">
              <div className="flex flex-wrap items-start gap-3 mb-4">
                <div className="badge badge-primary">{item.category}</div>
                <div className={`badge ${item.available ? 'badge-success' : 'badge-error'}`}>
                  {item.available ? '✓ Available' : '✗ Unavailable'}
                </div>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">{item.title}</h1>
              <StarRating rating={item.owner?.rating || 0} count={item.owner?.totalReviews || 0} />

              <div className="divider"></div>

              <p className="text-base-content/70 leading-relaxed mb-6">{item.description}</p>

              <div className="flex items-center gap-2 text-base-content/60">
                <span>📍</span>
                <span>{item.location || 'Location not set'}</span>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Price card + request form */}
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-primary">৳{item.dailyFee}</span>
                  <span className="text-base-content/60">/day</span>
                </div>
                <p className="text-sm text-base-content/50 mb-4">Deposit: ৳{item.deposit}</p>

                <div className="divider my-2"></div>

                {isAuthenticated ? (
                  <form onSubmit={handleSubmitRequest} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="form-control">
                        <label className="label py-1"><span className="label-text text-xs font-medium">Start Date</span></label>
                        <input
                          type="date"
                          value={startDate}
                          min={today}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="input input-bordered input-sm w-full focus:ring-2 ring-primary/30 transition-all duration-200"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label py-1"><span className="label-text text-xs font-medium">End Date</span></label>
                        <input
                          type="date"
                          value={endDate}
                          min={startDate || today}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="input input-bordered input-sm w-full focus:ring-2 ring-primary/30 transition-all duration-200"
                        />
                      </div>
                    </div>

                    {totalFee > 0 && (
                      <div className="bg-base-200 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between text-base-content/70">
                          <span>৳{item.dailyFee} × {days} day{days !== 1 ? 's' : ''}</span>
                          <span>৳{totalFee}</span>
                        </div>
                        <div className="flex justify-between text-base-content/70">
                          <span>Security deposit</span>
                          <span>৳{item.deposit}</span>
                        </div>
                        <div className="divider my-1"></div>
                        <div className="flex justify-between font-bold text-base">
                          <span>Total</span>
                          <span className="text-primary">৳{totalFee + item.deposit}</span>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting || !item.available}
                      className="btn btn-primary btn-block btn-lg transition-all duration-200 active:scale-95"
                    >
                      {submitting
                        ? <span className="loading loading-spinner loading-sm"></span>
                        : item.deposit > 0
                          ? `Request & Pay Deposit ৳${item.deposit}`
                          : 'Send Borrow Request'}
                    </button>
                    {!item.available && (
                      <p className="text-center text-sm text-error">This item is currently unavailable</p>
                    )}
                  </form>
                ) : (
                  <div className="space-y-3">
                    <p className="text-base-content/70 text-sm">Sign in to send a borrow request.</p>
                    <button onClick={() => navigate('/login')} className="btn btn-primary btn-block transition-all duration-200 active:scale-95">
                      Login to Borrow
                    </button>
                    <button onClick={() => navigate('/register')} className="btn btn-ghost btn-block transition-all duration-200 active:scale-95">
                      Create Account
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Owner card */}
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-5">
                <h3 className="font-semibold text-sm text-base-content/60 mb-3">LISTED BY</h3>
                <div className="flex items-center gap-3">
                  <div className={`avatar ${ownerAvatar ? '' : 'placeholder'}`}>
                    {ownerAvatar ? (
                      <div className="w-12 rounded-full ring ring-primary/20 ring-offset-2 ring-offset-base-100">
                        <img src={ownerAvatar} alt={ownerName} />
                      </div>
                    ) : (
                      <div className="bg-primary text-primary-content rounded-full w-12">
                        <span className="text-lg font-bold">{ownerInitial}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{ownerName}</p>
                    <StarRating rating={item.owner?.rating || 0} count={item.owner?.totalReviews || 0} />
                    <p className="text-xs text-base-content/50 mt-0.5">Member since {new Date(item.owner?.createdAt || Date.now()).getFullYear()}</p>
                  </div>
                </div>
                {/* Message lender button — only for other users */}
                {isAuthenticated && item.owner?._id !== user?._id && (
                  <button
                    onClick={() => navigate(`/messages?with=${item.owner._id}`)}
                    className="btn btn-outline btn-sm btn-block mt-4 gap-2"
                  >
                    💬 Message Lender
                  </button>
                )}
              </div>
            </div>

            {/* Owner reviews */}
            {ownerReviews.length > 0 && (
              <div className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body p-5">
                  <h3 className="font-semibold text-sm text-base-content/60 mb-3">
                    REVIEWS ({ownerReviews.length})
                  </h3>
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {ownerReviews.map((review) => (
                      <div key={review._id} className="border-b border-base-200 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="avatar placeholder">
                            <div className="bg-primary/20 text-primary rounded-full w-7">
                              <span className="text-xs font-bold">
                                {review.reviewer?.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          </div>
                          <span className="text-sm font-medium">{review.reviewer?.name}</span>
                          <StarRating rating={review.rating} />
                        </div>
                        {review.comment && (
                          <p className="text-sm text-base-content/70 ml-9">{review.comment}</p>
                        )}
                        <p className="text-xs text-base-content/40 ml-9 mt-1">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
