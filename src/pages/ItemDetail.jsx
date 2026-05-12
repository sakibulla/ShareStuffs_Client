import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import StarRating from '../components/StarRating';
import api from '../utils/api';
import { pageTransition, staggerContainer, staggerItem, fadeUp, tapPress } from '../utils/animations';

const categoryEmoji = {
  Tools: '🔧', Camping: '⛺', Party: '🎉', Kitchen: '🍳', Electronics: '📱', Sports: '⚽',
};

// ── Loading skeleton for item detail ──────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="h-4 w-48 rounded-full skeleton-shimmer mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-80 lg:h-96 rounded-2xl skeleton-shimmer" />
            <div className="bg-base-100 rounded-2xl p-6 space-y-4">
              <div className="h-6 w-3/4 rounded-full skeleton-shimmer" />
              <div className="h-4 w-full rounded-full skeleton-shimmer" />
              <div className="h-4 w-5/6 rounded-full skeleton-shimmer" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-64 rounded-2xl skeleton-shimmer" />
            <div className="h-32 rounded-2xl skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalFee, setTotalFee] = useState(0);
  const [days, setDays] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [ownerReviews, setOwnerReviews] = useState([]);

  const today = new Date().toISOString().split('T')[0];

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
      const res = await api.get(`/items/${id}`);
      setItem(res.data);
    } catch {
      setError('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) { addToast('Please select both start and end dates', 'error'); return; }
    setSubmitting(true);
    try {
      const requestRes = await api.post('/requests', { itemId: id, startDate, endDate, totalFee });
      if (item.deposit > 0) {
        addToast('Redirecting to payment…', 'info');
        const sessionRes = await api.post('/payments/create-checkout-session', { requestId: requestRes.data._id });
        window.location.href = sessionRes.data.url;
      } else {
        addToast('Request sent successfully!', 'success');
        setStartDate('');
        setEndDate('');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send request', 'error');
      setSubmitting(false);
    }
  };

  if (loading) return <DetailSkeleton />;

  if (error || !item) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">Item not found</h2>
          <p className="text-base-content/60 mb-6">{error || 'This item may have been removed.'}</p>
          <button onClick={() => navigate('/browse')} className="btn btn-primary rounded-full px-8">
            Back to Browse
          </button>
        </motion.div>
      </div>
    );
  }

  const imageUrl = item.images?.[0];
  const emoji = categoryEmoji[item.category] || '📦';
  const ownerName = item.owner?.name || 'Unknown';
  const ownerAvatar = item.owner?.avatar;
  const ownerInitial = ownerName.charAt(0).toUpperCase();

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen bg-base-200 py-8 px-4"
    >
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <motion.div variants={fadeUp} className="text-sm breadcrumbs mb-6 text-base-content/50">
          <ul>
            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><Link to="/browse" className="hover:text-primary transition-colors">Browse</Link></li>
            <li className="text-base-content font-medium">{item.title}</li>
          </ul>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left column ─────────────────────────────────────────────── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 space-y-6"
          >
            {/* Image */}
            <motion.div
              variants={staggerItem}
              className="bg-base-100 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="h-72 sm:h-80 lg:h-96 relative overflow-hidden">
                {imageUrl ? (
                  <motion.img
                    src={imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full item-placeholder items-center justify-center text-8xl ${imageUrl ? 'hidden' : 'flex'}`}>
                  {emoji}
                </div>
              </div>
            </motion.div>

            {/* Item info */}
            <motion.div variants={staggerItem} className="bg-base-100 rounded-2xl shadow-sm p-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="badge badge-primary">{item.category}</span>
                <span className={`badge ${item.available ? 'badge-success' : 'badge-error'}`}>
                  {item.available ? '✓ Available' : '✗ Unavailable'}
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold mb-2">{item.title}</h1>
              <StarRating rating={item.owner?.rating || 0} count={item.owner?.totalReviews || 0} />

              <div className="divider" />

              <p className="text-base-content/70 leading-relaxed mb-5 text-sm sm:text-base">
                {item.description}
              </p>

              <div className="flex items-center gap-2 text-base-content/55 text-sm">
                <span>📍</span>
                <span>{item.location || 'Location not set'}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right column ────────────────────────────────────────────── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {/* Price + request form */}
            <motion.div
              variants={staggerItem}
              className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-primary">৳{item.dailyFee}</span>
                  <span className="text-base-content/55 text-sm">/day</span>
                </div>
                {item.deposit > 0 && (
                  <p className="text-sm text-base-content/45 mb-4">+ ৳{item.deposit} refundable deposit</p>
                )}

                <div className="divider my-3" />

                {isAuthenticated ? (
                  <form onSubmit={handleSubmitRequest} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-xs font-medium">Start Date</span>
                        </label>
                        <input
                          type="date" value={startDate} min={today}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="input input-bordered input-sm w-full rounded-xl"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-xs font-medium">End Date</span>
                        </label>
                        <input
                          type="date" value={endDate} min={startDate || today}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="input input-bordered input-sm w-full rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Fee breakdown */}
                    <AnimatePresence>
                      {totalFee > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="bg-base-200 rounded-xl p-4 space-y-2 text-sm overflow-hidden"
                        >
                          <div className="flex justify-between text-base-content/65">
                            <span>৳{item.dailyFee} × {days} day{days !== 1 ? 's' : ''}</span>
                            <span>৳{totalFee}</span>
                          </div>
                          {item.deposit > 0 && (
                            <div className="flex justify-between text-base-content/65">
                              <span>Security deposit</span>
                              <span>৳{item.deposit}</span>
                            </div>
                          )}
                          <div className="divider my-1" />
                          <div className="flex justify-between font-bold text-base">
                            <span>Total</span>
                            <span className="text-primary">৳{totalFee + item.deposit}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      whileTap={tapPress}
                      type="submit"
                      disabled={submitting || !item.available}
                      className="btn btn-primary btn-block rounded-xl h-12"
                    >
                      {submitting ? (
                        <span className="loading loading-spinner loading-sm" />
                      ) : item.deposit > 0 ? (
                        `Request & Pay Deposit ৳${item.deposit}`
                      ) : (
                        'Send Borrow Request'
                      )}
                    </motion.button>

                    {!item.available && (
                      <p className="text-center text-sm text-error">This item is currently unavailable</p>
                    )}
                  </form>
                ) : (
                  <div className="space-y-3">
                    <p className="text-base-content/65 text-sm">Sign in to send a borrow request.</p>
                    <motion.button
                      whileTap={tapPress}
                      onClick={() => navigate('/login')}
                      className="btn btn-primary btn-block rounded-xl"
                    >
                      Login to Borrow
                    </motion.button>
                    <motion.button
                      whileTap={tapPress}
                      onClick={() => navigate('/register')}
                      className="btn btn-ghost btn-block rounded-xl"
                    >
                      Create Account
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Owner card */}
            <motion.div
              variants={staggerItem}
              className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm p-5"
            >
              <h3 className="text-xs font-semibold text-base-content/45 uppercase tracking-wider mb-3">
                Listed By
              </h3>
              <div className="flex items-center gap-3">
                {ownerAvatar ? (
                  <img
                    src={ownerAvatar}
                    alt={ownerName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20 ring-offset-2 ring-offset-base-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center font-bold text-lg">
                    {ownerInitial}
                  </div>
                )}
                <div>
                  <p className="font-semibold">{ownerName}</p>
                  <StarRating rating={item.owner?.rating || 0} count={item.owner?.totalReviews || 0} />
                  <p className="text-xs text-base-content/45 mt-0.5">
                    Member since {new Date(item.owner?.createdAt || Date.now()).getFullYear()}
                  </p>
                </div>
              </div>

              {isAuthenticated && item.owner?._id !== user?._id && (
                <motion.button
                  whileTap={tapPress}
                  onClick={() => navigate(`/messages?with=${item.owner._id}`)}
                  className="btn btn-outline btn-sm btn-block mt-4 rounded-xl gap-2"
                >
                  💬 Message Lender
                </motion.button>
              )}
            </motion.div>

            {/* Reviews */}
            {ownerReviews.length > 0 && (
              <motion.div
                variants={staggerItem}
                className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm p-5"
              >
                <h3 className="text-xs font-semibold text-base-content/45 uppercase tracking-wider mb-3">
                  Reviews ({ownerReviews.length})
                </h3>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {ownerReviews.map((review) => (
                    <div key={review._id} className="border-b border-base-200 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {review.reviewer?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-sm font-medium">{review.reviewer?.name}</span>
                        <StarRating rating={review.rating} />
                      </div>
                      {review.comment && (
                        <p className="text-sm text-base-content/65 ml-9">{review.comment}</p>
                      )}
                      <p className="text-xs text-base-content/35 ml-9 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
