// Dashboard

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import StarRating from '../components/StarRating';
import api from '../utils/api';
import SensorPanel from '../components/SensorPanel';
import { pageTransition, staggerContainer, staggerItem, scaleIn, tapPress } from '../utils/animations';

// ── Helpers ────────────────────────────────────────────────────────────────
const statusBadge = (status) => {
  const map = { pending: 'badge-warning', accepted: 'badge-success', rejected: 'badge-error', delivered: 'badge-info', returned: 'badge-neutral' };
  return map[status] || 'badge-ghost';
};
const paymentBadge = (ps) => ps === 'paid' ? 'badge-success' : 'badge-warning';
const userInitial = (name) => name?.charAt(0)?.toUpperCase() || 'U';

// ── Animated empty state ───────────────────────────────────────────────────
function EmptyState({ emoji, heading, sub, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="text-7xl mb-5"
      >
        {emoji}
      </motion.div>
      <h3 className="text-2xl font-bold mb-2">{heading}</h3>
      <p className="text-base-content/60 mb-6 max-w-xs text-sm">{sub}</p>
      {action}
    </motion.div>
  );
}

// ── Avatar component ───────────────────────────────────────────────────────
function ProfileAvatar({ user, size = 'w-12', textSize = 'text-lg' }) {
  return user?.avatar ? (
    <img
      src={user.avatar}
      alt={user?.name || 'User'}
      className={`${size} rounded-full object-cover ring-2 ring-primary/20 ring-offset-2 ring-offset-base-100`}
    />
  ) : (
    <div className={`${size} rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center font-bold ${textSize} flex-shrink-0`}>
      {userInitial(user?.name)}
    </div>
  );
}

// ── Request card — shared between My Requests and Incoming ────────────────
function RequestCard({ req, isLender, reviewedRequestIds, onAction, onPayDeposit, payingId, onReview, onRefund, refundingId }) {
  const person = isLender ? req.borrower : req.lender;
  const personLabel = isLender ? 'Borrower' : 'Lender';
  const messageLink = isLender
    ? `/messages?with=${req.borrower?._id}&requestId=${req._id}`
    : `/messages?with=${req.lender?._id}&requestId=${req._id}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Item thumbnail */}
        <div className="w-14 h-14 rounded-xl item-placeholder flex items-center justify-center text-2xl flex-shrink-0">
          {req.item?.images?.[0]
            ? <img src={req.item.images[0]} className="w-full h-full object-cover rounded-xl" alt="" />
            : '📦'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{req.item?.title}</p>
          <p className="text-sm text-base-content/60">{personLabel}: <span className="font-medium">{person?.name}</span></p>
          <p className="text-xs text-base-content/45 mt-0.5">
            {new Date(req.startDate).toLocaleDateString()} – {new Date(req.endDate).toLocaleDateString()}
          </p>
          {/* Show late return penalty if applicable */}
          {req.latePenalty > 0 && (
            <p className="text-xs text-error font-semibold mt-1">
              ⚠️ Late penalty: ৳{req.latePenalty} ({req.daysLate} day{req.daysLate !== 1 ? 's' : ''} late)
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          <span className={`badge badge-sm ${statusBadge(req.status)} capitalize`}>{req.status}</span>
          <span className={`badge badge-sm ${req.paymentStatus === 'refunded' ? 'badge-info' : paymentBadge(req.paymentStatus)}`}>
            {req.paymentStatus === 'paid' ? '💳 Paid' : req.paymentStatus === 'refunded' ? '↩️ Refunded' : '⏳ Unpaid'}
          </span>
          <span className="text-sm font-bold text-primary">৳{req.totalFee}</span>

          {/* Lender actions */}
          {isLender && req.status === 'pending' && (
            <div className="flex gap-1.5">
              <motion.button whileTap={tapPress} onClick={() => onAction(req._id, 'accepted')} className="btn btn-success btn-xs rounded-lg">Accept</motion.button>
              <motion.button whileTap={tapPress} onClick={() => onAction(req._id, 'rejected')} className="btn btn-error btn-outline btn-xs rounded-lg">Reject</motion.button>
            </div>
          )}
          {isLender && req.status === 'accepted' && (
            <motion.button whileTap={tapPress} onClick={() => onAction(req._id, 'delivered')} className="btn btn-info btn-xs rounded-lg">
              Mark Delivered
            </motion.button>
          )}
          {isLender && req.status === 'delivered' && (
            <motion.button whileTap={tapPress} onClick={() => onAction(req._id, 'returned')} className="btn btn-neutral btn-xs rounded-lg">
              Mark Returned
            </motion.button>
          )}

          {/* Lender: refund button (if payment was made) */}
          {isLender && req.paymentStatus === 'paid' && req.status === 'pending' && (
            <motion.button
              whileTap={tapPress}
              onClick={() => onRefund(req._id)}
              disabled={refundingId === req._id}
              className="btn btn-warning btn-xs rounded-lg"
            >
              {refundingId === req._id
                ? <span className="loading loading-spinner loading-xs" />
                : '↩️ Refund'}
            </motion.button>
          )}

          {/* Borrower: pay full amount */}
          {!isLender && req.paymentStatus !== 'paid' && req.totalFee > 0 && (
            <motion.button
              whileTap={tapPress}
              onClick={() => onPayDeposit(req._id)}
              disabled={payingId === req._id}
              className="btn btn-primary btn-xs rounded-lg"
            >
              {payingId === req._id
                ? <span className="loading loading-spinner loading-xs" />
                : `Pay ৳${req.totalFee}`}
            </motion.button>
          )}

          {/* Message */}
          {person?._id && (
            <Link to={messageLink} className="btn btn-outline btn-xs rounded-lg gap-1">
              💬 Message
            </Link>
          )}

          {/* Review */}
          {req.status === 'returned' && !reviewedRequestIds.has(req._id) && (
            <motion.button
              whileTap={tapPress}
              onClick={() => onReview(req, isLender ? req.borrower?._id : req.lender?._id, isLender ? req.borrower?.name : req.lender?.name)}
              className="btn btn-warning btn-outline btn-xs rounded-lg"
            >
              ⭐ Review
            </motion.button>
          )}
          {req.status === 'returned' && reviewedRequestIds.has(req._id) && (
            <span className="text-xs text-success font-medium">✓ Reviewed</span>
          )}
        </div>
      </div>

      {/* Sensor panel */}
      <div className="px-4 pb-4">
        <SensorPanel request={req} isLender={isLender} />
      </div>
    </motion.div>
  );
}

// ── Review Modal ───────────────────────────────────────────────────────────
function ReviewModal({ modal, rating, comment, submitting, onRatingChange, onCommentChange, onSubmit, onClose }) {
  return (
    <AnimatePresence>
      {modal && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            key="modal"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md p-6 relative border border-base-300/60">
              <button
                onClick={onClose}
                className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
                aria-label="Close"
              >✕</button>

              <h3 className="font-bold text-xl mb-1">Leave a Review</h3>
              <p className="text-base-content/55 text-sm mb-6">
                How was your experience with <strong>{modal.revieweeName}</strong>?
              </p>

              <div className="flex justify-center mb-3">
                <StarRating interactive value={rating} onChange={onRatingChange} />
              </div>
              <AnimatePresence>
                {rating > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-sm text-primary font-medium mb-5"
                  >
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="form-control mb-5">
                <label className="label py-1">
                  <span className="label-text font-medium text-sm">Comment <span className="text-base-content/40">(optional)</span></span>
                  <span className="label-text-alt text-base-content/40">{comment.length}/500</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => onCommentChange(e.target.value)}
                  className="textarea textarea-bordered rounded-xl min-h-24"
                  placeholder="Share details about your experience..."
                  maxLength={500}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button onClick={onClose} className="btn btn-ghost rounded-xl">Cancel</button>
                <motion.button
                  whileTap={tapPress}
                  onClick={onSubmit}
                  disabled={submitting || !rating}
                  className="btn btn-primary rounded-xl min-w-32"
                >
                  {submitting ? <span className="loading loading-spinner loading-sm" /> : 'Submit Review'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Main Dashboard component ───────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  const requestedTab = searchParams.get('tab');
  const activeTab = ['listings', 'requests', 'incoming', 'profile'].includes(requestedTab) ? requestedTab : 'listings';

  const [myItems, setMyItems] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [requestFilter, setRequestFilter] = useState('All');
  const [payingRequestId, setPayingRequestId] = useState(null);
  const [refundingRequestId, setRefundingRequestId] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [reviewedRequestIds, setReviewedRequestIds] = useState(new Set());
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [myReceivedReviews, setMyReceivedReviews] = useState([]);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const loadData = useCallback(async () => {
    if (activeTab === 'profile') {
      try {
        const [paymentRes, reviewRes, meRes] = await Promise.all([
          api.get('/payments/history'),
          api.get(`/reviews/user/${user._id}`),
          api.get('/auth/me'),
        ]);
        setPaymentHistory(paymentRes.data.paymentHistory || []);
        setTotalEarned(paymentRes.data.totalEarned || 0);
        setMyReceivedReviews(reviewRes.data || []);
        if (meRes.data?.user) updateUser(meRes.data.user);
      } catch { /* non-critical */ }
      return;
    }
    setLoading(true);
    try {
      if (activeTab === 'listings') {
        const res = await api.get('/items/my');
        setMyItems(res.data || []);
      } else if (activeTab === 'requests') {
        const [reqRes, reviewedRes] = await Promise.all([api.get('/requests/mine'), api.get('/reviews/mine')]);
        setMyRequests(reqRes.data || []);
        setReviewedRequestIds(new Set(reviewedRes.data));
      } else if (activeTab === 'incoming') {
        const [reqRes, reviewedRes] = await Promise.all([api.get('/requests/lender'), api.get('/reviews/mine')]);
        setIncomingRequests(reqRes.data || []);
        setReviewedRequestIds(new Set(reviewedRes.data));
      }
    } catch {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, addToast, updateUser, user._id]);

  useEffect(() => { Promise.resolve().then(loadData); }, [loadData]);

  useEffect(() => {
    if (activeTab !== 'profile' || myItems.length > 0) return;
    api.get('/items/my').then((r) => setMyItems(r.data || [])).catch(() => {});
  }, [activeTab, myItems.length]);

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/items/${itemId}`);
      addToast('Item deleted!', 'success');
      loadData();
    } catch { addToast('Failed to delete item', 'error'); }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      await api.put(`/requests/${requestId}`, { status: action });
      addToast(`Request ${action}!`, 'success');
      loadData();
    } catch { addToast('Failed to update request', 'error'); }
  };

  const handlePayDeposit = async (requestId) => {
    setPayingRequestId(requestId);
    try {
      const res = await api.post('/payments/create-checkout-session', { requestId });
      window.location.href = res.data.url;
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to initiate payment', 'error');
      setPayingRequestId(null);
    }
  };

  const handleRefund = async (requestId) => {
    setRefundingRequestId(requestId);
    try {
      await api.post('/payments/refund', { 
        requestId, 
        reason: 'Request rejected by lender' 
      });
      addToast('Payment refunded successfully!', 'success');
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to refund payment', 'error');
    } finally {
      setRefundingRequestId(null);
    }
  };

  const openReviewModal = (req, revieweeId, revieweeName) => {
    setReviewModal({ requestId: req._id, revieweeId, revieweeName });
    setReviewRating(0);
    setReviewComment('');
  };

  const closeReviewModal = () => { setReviewModal(null); setReviewRating(0); setReviewComment(''); };

  const handleSubmitReview = async () => {
    if (!reviewRating) { addToast('Please select a star rating', 'error'); return; }
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        revieweeId: reviewModal.revieweeId,
        requestId: reviewModal.requestId,
        rating: reviewRating,
        comment: reviewComment,
      });
      addToast('Review submitted!', 'success');
      setReviewedRequestIds((prev) => new Set([...prev, reviewModal.requestId]));
      closeReviewModal();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally { setSubmittingReview(false); }
  };

  const handleTabChange = (tab) => setSearchParams(tab === 'listings' ? {} : { tab });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { addToast('Please choose an image file', 'error'); return; }
    if (file.size > 1024 * 1024) { addToast('Profile picture must be under 1 MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => setProfileForm((prev) => ({ ...prev, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) { addToast('Name is required', 'error'); return; }
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        name: profileForm.name, phone: profileForm.phone,
        location: profileForm.location, bio: profileForm.bio, avatar: profileForm.avatar,
      });
      updateUser(res.data.user);
      addToast('Profile updated!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally { setSavingProfile(false); }
  };

  const navItems = [
    { key: 'listings', emoji: '📦', label: 'My Listings' },
    { key: 'requests', emoji: '📋', label: 'My Requests' },
    { key: 'incoming', emoji: '📬', label: 'Incoming' },
    { key: 'profile',  emoji: '👤', label: 'Profile' },
  ];

  const filteredRequests = requestFilter === 'All' ? myRequests : myRequests.filter((r) => r.status === requestFilter.toLowerCase());
  const filteredIncoming = requestFilter === 'All' ? incomingRequests : incomingRequests.filter((r) => r.status === requestFilter.toLowerCase());

  const filterBtns = ['All', 'Pending', 'Accepted', 'Rejected', 'Delivered', 'Returned'];

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen bg-base-200"
    >
      <div className="max-w-7xl mx-auto flex">

        {/* ── Sidebar (desktop) ──────────────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-60 bg-base-100 border-r border-base-300/60 min-h-screen p-4 sticky top-16 self-start">
          {/* User info */}
          <div className="flex items-center gap-3 p-2 mb-4">
            <ProfileAvatar user={user} size="w-10" textSize="text-base" />
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-xs text-base-content/45 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="divider my-0 mb-3" />

          {/* Nav items */}
          <nav className="flex flex-col gap-1 flex-1">
            {navItems.map((item) => (
              <motion.button
                key={item.key}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleTabChange(item.key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-colors duration-150 ${
                  activeTab === item.key
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
                }`}
              >
                <span className="text-base">{item.emoji}</span>
                <span>{item.label}</span>
                {/* Active indicator dot */}
                {activeTab === item.key && (
                  <motion.span
                    layoutId="sidebar-dot"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>

          <div className="mt-auto pt-4 border-t border-base-300/60">
            <button
              onClick={() => { logout(); window.location.href = '/'; }}
              className="btn btn-ghost btn-block text-error justify-start gap-2 rounded-xl text-sm"
            >
              🚪 Logout
            </button>
          </div>
        </aside>

        {/* ── Main content ───────────────────────────────────────────────── */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0">

          {/* Mobile tab bar */}
          <div className="flex md:hidden gap-1.5 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
            {navItems.map((item) => (
              <motion.button
                key={item.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTabChange(item.key)}
                className={`btn btn-sm flex-shrink-0 rounded-full gap-1.5 transition-all duration-200 ${
                  activeTab === item.key ? 'btn-primary shadow-md shadow-primary/20' : 'btn-ghost border border-base-300/60'
                }`}
              >
                {item.emoji} {item.label}
              </motion.button>
            ))}
          </div>

          {/* Loading spinner */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="spinner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32 gap-4"
              >
                <span className="loading loading-spinner loading-lg text-primary" />
                <p className="text-base-content/45 text-sm">Loading…</p>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >

                {/* ── MY LISTINGS ─────────────────────────────────────── */}
                {activeTab === 'listings' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold">My Listings</h2>
                        <p className="text-sm text-base-content/50 mt-0.5">{myItems.length} item{myItems.length !== 1 ? 's' : ''} listed</p>
                      </div>
                      <motion.button
                        whileTap={tapPress}
                        onClick={() => navigate('/items/new')}
                        className="btn btn-primary btn-sm rounded-full gap-1.5 shadow-md shadow-primary/20"
                      >
                        + New Item
                      </motion.button>
                    </div>

                    {myItems.length === 0 ? (
                      <EmptyState
                        emoji="📭"
                        heading="No items listed yet"
                        sub="Start sharing your items with the community and earn money."
                        action={
                          <motion.button whileTap={tapPress} onClick={() => navigate('/items/new')} className="btn btn-primary rounded-full px-8">
                            List Your First Item
                          </motion.button>
                        }
                      />
                    ) : (
                      <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto bg-base-100 rounded-2xl shadow-sm border border-base-300/60">
                          <table className="table w-full">
                            <thead>
                              <tr className="bg-base-200/80 text-xs uppercase tracking-wider text-base-content/50">
                                <th className="rounded-tl-2xl">Item</th>
                                <th>Category</th>
                                <th>Daily Fee</th>
                                <th>Status</th>
                                <th className="rounded-tr-2xl">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {myItems.map((item, i) => (
                                <motion.tr
                                  key={item._id}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.04 }}
                                  onClick={() => navigate(`/items/${item._id}`)}
                                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/items/${item._id}`); } }}
                                  tabIndex={0}
                                  className="hover:bg-base-200/60 transition-colors cursor-pointer focus:outline-none focus-visible:bg-base-200"
                                >
                                  <td>
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl item-placeholder flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                                        {item.images?.[0]
                                          ? <img src={item.images[0]} className="w-full h-full object-cover" alt="" />
                                          : '📦'}
                                      </div>
                                      <span className="font-semibold text-sm">{item.title}</span>
                                    </div>
                                  </td>
                                  <td className="text-base-content/60 text-sm">{item.category}</td>
                                  <td className="font-bold text-primary text-sm">৳{item.dailyFee}</td>
                                  <td>
                                    <span className={`badge badge-sm ${item.available ? 'badge-success' : 'badge-error'}`}>
                                      {item.available ? 'Available' : 'Unavailable'}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="flex gap-2">
                                      <button onClick={(e) => { e.stopPropagation(); navigate(`/items/${item._id}/edit`); }} className="btn btn-xs btn-outline btn-primary rounded-lg">Edit</button>
                                      <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(item._id); }} className="btn btn-xs btn-outline btn-error rounded-lg">Delete</button>
                                    </div>
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden space-y-3">
                          {myItems.map((item, i) => (
                            <motion.div
                              key={item._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              onClick={() => navigate(`/items/${item._id}`)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/items/${item._id}`); }}
                              className="bg-base-100 border border-base-300/60 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-sm">{item.title}</h3>
                                <span className={`badge badge-sm ${item.available ? 'badge-success' : 'badge-error'}`}>
                                  {item.available ? 'Available' : 'Unavailable'}
                                </span>
                              </div>
                              <p className="text-xs text-base-content/55 mb-3">{item.category} · ৳{item.dailyFee}/day</p>
                              <div className="flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); navigate(`/items/${item._id}/edit`); }} className="btn btn-xs btn-outline btn-primary flex-1 rounded-lg">Edit</button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(item._id); }} className="btn btn-xs btn-outline btn-error flex-1 rounded-lg">Delete</button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ── MY REQUESTS ─────────────────────────────────────── */}
                {activeTab === 'requests' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-1">My Requests</h2>
                    <p className="text-sm text-base-content/50 mb-5">Items you've requested to borrow</p>
                    <div className="flex gap-2 mb-6 flex-wrap">
                      {filterBtns.map((f) => (
                        <motion.button key={f} whileTap={tapPress} onClick={() => setRequestFilter(f)}
                          className={`btn btn-sm rounded-full ${requestFilter === f ? 'btn-primary shadow-md shadow-primary/20' : 'btn-ghost border border-base-300/60'}`}>
                          {f}
                        </motion.button>
                      ))}
                    </div>
                    {filteredRequests.length === 0 ? (
                      <EmptyState emoji="📋" heading="Nothing here yet" sub="Browse items and send requests to lenders."
                        action={<Link to="/browse" className="btn btn-primary rounded-full px-8">Browse Items</Link>} />
                    ) : (
                      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
                        {filteredRequests.map((req) => (
                          <RequestCard key={req._id} req={req} isLender={false}
                            reviewedRequestIds={reviewedRequestIds}
                            onAction={handleRequestAction}
                            onPayDeposit={handlePayDeposit}
                            payingId={payingRequestId}
                            onReview={openReviewModal}
                            onRefund={handleRefund}
                            refundingId={refundingRequestId} />
                        ))}
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ── INCOMING REQUESTS ───────────────────────────────── */}
                {activeTab === 'incoming' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Incoming Requests</h2>
                    <p className="text-sm text-base-content/50 mb-5">Borrow requests for your listed items</p>
                    <div className="flex gap-2 mb-6 flex-wrap">
                      {filterBtns.map((f) => (
                        <motion.button key={f} whileTap={tapPress} onClick={() => setRequestFilter(f)}
                          className={`btn btn-sm rounded-full ${requestFilter === f ? 'btn-primary shadow-md shadow-primary/20' : 'btn-ghost border border-base-300/60'}`}>
                          {f}
                        </motion.button>
                      ))}
                    </div>
                    {filteredIncoming.length === 0 ? (
                      <EmptyState emoji="📬" heading="No incoming requests" sub="List items to start receiving borrow requests."
                        action={<button onClick={() => handleTabChange('listings')} className="btn btn-primary rounded-full px-8">Go to My Listings</button>} />
                    ) : (
                      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
                        {filteredIncoming.map((req) => (
                          <RequestCard key={req._id} req={req} isLender={true}
                            reviewedRequestIds={reviewedRequestIds}
                            onAction={handleRequestAction}
                            onPayDeposit={handlePayDeposit}
                            payingId={payingRequestId}
                            onReview={openReviewModal}
                            onRefund={handleRefund}
                            refundingId={refundingRequestId} />
                        ))}
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ── PROFILE ─────────────────────────────────────────── */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Account Settings</p>
                      <h2 className="text-2xl font-bold">Profile</h2>
                      <p className="text-sm text-base-content/50 mt-1">Keep your public lending profile polished and trustworthy.</p>
                    </div>

                    <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
                      {/* Avatar card */}
                      <motion.section
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm p-6 flex flex-col items-center text-center"
                      >
                        <div className="relative mb-4">
                          {profileForm.avatar ? (
                            <img src={profileForm.avatar} alt="Profile" className="w-28 h-28 rounded-full object-cover ring-4 ring-primary/20 ring-offset-4 ring-offset-base-100" />
                          ) : (
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center text-4xl font-bold ring-4 ring-primary/20 ring-offset-4 ring-offset-base-100">
                              {userInitial(profileForm.name)}
                            </div>
                          )}
                          <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-success border-2 border-base-100" title="Verified" />
                        </div>

                        <h3 className="text-lg font-bold">{profileForm.name || user?.name}</h3>
                        <p className="text-xs text-base-content/50 break-all mb-4">{user?.email}</p>

                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
                        <div className="grid grid-cols-2 gap-2 w-full mb-2">
                          <motion.button whileTap={tapPress} type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-primary btn-sm rounded-xl">
                            Upload Photo
                          </motion.button>
                          <motion.button whileTap={tapPress} type="button" onClick={() => setProfileForm((p) => ({ ...p, avatar: '' }))} className="btn btn-outline btn-sm rounded-xl">
                            Remove
                          </motion.button>
                        </div>
                        <p className="text-xs text-base-content/40 mb-5">JPG, PNG or WEBP · max 1 MB</p>

                        <div className="divider my-0 w-full" />
                        <div className="grid grid-cols-3 gap-3 w-full mt-4">
                          {[
                            { value: myItems.length, label: 'Listings' },
                            { value: Number(user?.rating || 0).toFixed(1), label: 'Rating' },
                            { value: user?.totalReviews || 0, label: 'Reviews' },
                          ].map((stat) => (
                            <div key={stat.label} className="rounded-xl bg-base-200 p-3">
                              <p className="text-lg font-bold">{stat.value}</p>
                              <p className="text-xs text-base-content/55">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      </motion.section>

                      {/* Edit form */}
                      <motion.form
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.08 }}
                        onSubmit={handleProfileSubmit}
                        className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm p-6"
                      >
                        <h3 className="text-lg font-bold mb-1">Personal Information</h3>
                        <p className="text-sm text-base-content/50 mb-5">This information helps borrowers and lenders recognize you.</p>

                        <div className="grid md:grid-cols-2 gap-4">
                          {[
                            { name: 'name',     label: 'Full Name', type: 'text',  placeholder: 'Your full name',     maxLength: 80 },
                            { name: 'phone',    label: 'Phone',     type: 'tel',   placeholder: '+880 1XXX XXXXXX',   maxLength: 30 },
                            { name: 'location', label: 'Location',  type: 'text',  placeholder: 'City or neighborhood', maxLength: 80 },
                          ].map((field) => (
                            <div key={field.name} className="form-control">
                              <label className="label py-1"><span className="label-text font-medium text-sm">{field.label}</span></label>
                              <input
                                type={field.type} name={field.name} value={profileForm[field.name]}
                                onChange={handleProfileChange} placeholder={field.placeholder} maxLength={field.maxLength}
                                className="input input-bordered w-full rounded-xl text-sm"
                              />
                            </div>
                          ))}
                          <div className="form-control">
                            <label className="label py-1"><span className="label-text font-medium text-sm">Email</span></label>
                            <input type="email" value={user?.email || ''} disabled className="input input-bordered w-full rounded-xl text-sm bg-base-200 text-base-content/50" />
                          </div>
                        </div>

                        <div className="form-control mt-4">
                          <label className="label py-1">
                            <span className="label-text font-medium text-sm">Bio</span>
                            <span className="label-text-alt text-base-content/40 text-xs">{profileForm.bio.length}/280</span>
                          </label>
                          <textarea
                            name="bio" value={profileForm.bio} onChange={handleProfileChange}
                            className="textarea textarea-bordered rounded-xl min-h-28 text-sm"
                            placeholder="Share what you lend, what you borrow, or how people can coordinate with you."
                            maxLength={280}
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-4 border-t border-base-300/60">
                          <p className="text-xs text-base-content/40">Changes update your profile immediately.</p>
                          <motion.button whileTap={tapPress} type="submit" disabled={savingProfile} className="btn btn-primary rounded-xl min-w-36">
                            {savingProfile ? <span className="loading loading-spinner loading-sm" /> : 'Save Changes'}
                          </motion.button>
                        </div>
                      </motion.form>
                    </div>

                    {/* Earnings */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.12 }}
                      className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm p-6"
                    >
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="text-lg font-bold">Earnings & Payments</h3>
                          <p className="text-sm text-base-content/50">Deposits received from borrowers</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-success">৳{totalEarned.toFixed(2)}</p>
                          <p className="text-xs text-base-content/45">Total earned</p>
                        </div>
                      </div>
                      {paymentHistory.length === 0 ? (
                        <div className="text-center py-10 text-base-content/40">
                          <div className="text-4xl mb-2">💳</div>
                          <p className="text-sm">No payment history yet</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="table table-sm w-full">
                            <thead>
                              <tr className="bg-base-200/80 text-xs uppercase tracking-wider text-base-content/45">
                                <th>Item</th><th>Type</th><th>Amount</th><th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...paymentHistory].reverse().map((p, i) => (
                                <tr key={i} className="hover:bg-base-200/50 transition-colors">
                                  <td className="font-medium text-sm">{p.itemTitle}</td>
                                  <td>
                                    <span className={`badge badge-sm ${p.type === 'received' ? 'badge-success' : 'badge-info'}`}>
                                      {p.type === 'received' ? '⬇ Received' : '⬆ Paid'}
                                    </span>
                                  </td>
                                  <td className={`font-bold text-sm ${p.type === 'received' ? 'text-success' : 'text-info'}`}>
                                    {p.type === 'received' ? '+' : '-'}৳{p.amount}
                                  </td>
                                  <td className="text-xs text-base-content/45">{new Date(p.paidAt).toLocaleDateString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </motion.div>

                    {/* Reviews received */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.16 }}
                      className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm p-6"
                    >
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="text-lg font-bold">My Reviews</h3>
                          <p className="text-sm text-base-content/50">What others say about you</p>
                        </div>
                        {myReceivedReviews.length > 0 && (
                          <div className="text-right">
                            <p className="text-xl font-bold text-warning">
                              {'★'.repeat(Math.round(user?.rating || 0))}
                              <span className="text-base-300">{'★'.repeat(5 - Math.round(user?.rating || 0))}</span>
                            </p>
                            <p className="text-xs text-base-content/45">
                              {Number(user?.rating || 0).toFixed(1)} avg · {myReceivedReviews.length} review{myReceivedReviews.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        )}
                      </div>
                      {myReceivedReviews.length === 0 ? (
                        <div className="text-center py-10 text-base-content/40">
                          <div className="text-4xl mb-2">⭐</div>
                          <p className="text-sm">No reviews yet</p>
                          <p className="text-xs mt-1">Complete a borrow or lend to receive your first review</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {myReceivedReviews.map((review, i) => (
                            <motion.div
                              key={review._id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex gap-3 border-b border-base-200 pb-4 last:border-0 last:pb-0"
                            >
                              <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                                {review.reviewer?.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className="font-semibold text-sm">{review.reviewer?.name}</span>
                                  <span className="text-xs text-base-content/40">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex gap-0.5 my-1">
                                  {[1,2,3,4,5].map((s) => (
                                    <span key={s} className={`text-sm ${s <= review.rating ? 'text-warning' : 'text-base-300'}`}>★</span>
                                  ))}
                                </div>
                                {review.comment && <p className="text-sm text-base-content/65">{review.comment}</p>}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ── Review Modal ──────────────────────────────────────────────────── */}
      <ReviewModal
        modal={reviewModal}
        rating={reviewRating}
        comment={reviewComment}
        submitting={submittingReview}
        onRatingChange={setReviewRating}
        onCommentChange={setReviewComment}
        onSubmit={handleSubmitReview}
        onClose={closeReviewModal}
      />
    </motion.div>
  );
}
