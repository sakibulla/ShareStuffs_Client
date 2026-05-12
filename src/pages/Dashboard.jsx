import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import StarRating from '../components/StarRating';
import api from '../utils/api';
import SensorPanel from '../components/SensorPanel';

const statusBadge = (status) => {
  const map = { pending: 'badge-warning', accepted: 'badge-success', rejected: 'badge-error', returned: 'badge-neutral' };
  return map[status] || 'badge-ghost';
};

const paymentBadge = (paymentStatus) =>
  paymentStatus === 'paid' ? 'badge-success' : 'badge-warning';

const emptyState = (emoji, heading, sub, action) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="text-7xl mb-4">{emoji}</div>
    <h3 className="text-2xl font-bold mb-2">{heading}</h3>
    <p className="text-base-content/60 mb-6">{sub}</p>
    {action}
  </div>
);

const userInitial = (name) => name?.charAt(0)?.toUpperCase() || 'U';

const ProfileAvatar = ({ user, size = 'w-12', textSize = 'text-lg' }) => (
  <div className={`avatar ${user?.avatar ? '' : 'placeholder'}`}>
    {user?.avatar ? (
      <div className={`${size} rounded-full ring ring-primary/20 ring-offset-2 ring-offset-base-100`}>
        <img src={user.avatar} alt={user?.name || 'User'} />
      </div>
    ) : (
      <div className={`bg-primary text-primary-content rounded-full ${size}`}>
        <span className={`${textSize} font-bold`}>{userInitial(user?.name)}</span>
      </div>
    )}
  </div>
);

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
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  // Review state
  const [reviewedRequestIds, setReviewedRequestIds] = useState(new Set());
  const [reviewModal, setReviewModal] = useState(null); // { requestId, revieweeId, revieweeName, role }
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
      // Load payment history, received reviews, and fresh user data for profile tab
      try {
        const [paymentRes, reviewRes, meRes] = await Promise.all([
          api.get('/payments/history'),
          api.get(`/reviews/user/${user._id}`),
          api.get('/auth/me'),
        ]);
        setPaymentHistory(paymentRes.data.paymentHistory || []);
        setTotalEarned(paymentRes.data.totalEarned || 0);
        setMyReceivedReviews(reviewRes.data || []);
        // Sync the latest rating/totalReviews/etc into auth context
        if (meRes.data?.user) updateUser(meRes.data.user);
      } catch {
        // non-critical
      }
      return;
    }
    setLoading(true);
    try {
      if (activeTab === 'listings') {
        const res = await api.get('/items/my');
        setMyItems(res.data || []);
      } else if (activeTab === 'requests') {
        const res = await api.get('/requests/mine');
        setMyRequests(res.data || []);
        // Load which requests this user has already reviewed
        const reviewed = await api.get('/reviews/mine');
        setReviewedRequestIds(new Set(reviewed.data));
      } else if (activeTab === 'incoming') {
        const res = await api.get('/requests/lender');
        setIncomingRequests(res.data || []);
        const reviewed = await api.get('/reviews/mine');
        setReviewedRequestIds(new Set(reviewed.data));
      }
    } catch {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, addToast, updateUser, user._id]);

  useEffect(() => {
    Promise.resolve().then(loadData);
  }, [loadData]);

  useEffect(() => {
    const loadProfileStats = async () => {
      if (activeTab !== 'profile' || myItems.length > 0) return;
      try {
        const res = await api.get('/items/my');
        setMyItems(res.data || []);
      } catch {
        // Keep profile editing available even if listing stats cannot load.
      }
    };

    loadProfileStats();
  }, [activeTab, myItems.length]);

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/items/${itemId}`);
      addToast('Item deleted successfully!', 'success');
      loadData();
    } catch {
      addToast('Failed to delete item', 'error');
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      await api.put(`/requests/${requestId}`, { status: action });
      addToast(`Request ${action}!`, 'success');
      loadData();
    } catch {
      addToast('Failed to update request', 'error');
    }
  };

  const handlePayDeposit = async (requestId) => {
    setPayingRequestId(requestId);
    try {
      const res = await api.post('/payments/create-checkout-session', { requestId });
      window.location.href = res.data.url;
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to initiate payment', 'error');
      setPayingRequestId(null);
    }
  };

  const openReviewModal = (req, revieweeId, revieweeName) => {
    setReviewModal({ requestId: req._id, revieweeId, revieweeName });
    setReviewRating(0);
    setReviewComment('');
  };

  const closeReviewModal = () => {
    setReviewModal(null);
    setReviewRating(0);
    setReviewComment('');
  };

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
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleTabChange = (tab) => {
    setSearchParams(tab === 'listings' ? {} : { tab });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Please choose an image file', 'error');
      return;
    }
    if (file.size > 1024 * 1024) {
      addToast('Profile picture must be under 1 MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfileForm((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      addToast('Name is required', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        name: profileForm.name,
        phone: profileForm.phone,
        location: profileForm.location,
        bio: profileForm.bio,
        avatar: profileForm.avatar,
      });
      updateUser(res.data.user);
      addToast('Profile updated successfully!', 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const navItems = [
    { key: 'listings', emoji: '📦', label: 'My Listings' },
    { key: 'requests', emoji: '📋', label: 'My Requests' },
    { key: 'incoming', emoji: '📬', label: 'Incoming Requests' },
    { key: 'profile', emoji: '👤', label: 'Profile' },
  ];

  const filteredRequests = requestFilter === 'All'
    ? myRequests
    : myRequests.filter((r) => r.status === requestFilter.toLowerCase());

  const filteredIncoming = requestFilter === 'All'
    ? incomingRequests
    : incomingRequests.filter((r) => r.status === requestFilter.toLowerCase());

  return (
    <div className="min-h-screen bg-base-200 fade-in">
      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-base-100 border-r border-base-300 min-h-screen p-4 sticky top-16 self-start">
          <div className="flex items-center gap-3 p-3 mb-4">
            <ProfileAvatar user={user} />
            <div className="min-w-0">
              <p className="font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-base-content/50 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="divider my-0 mb-2"></div>
          <nav className="flex flex-col gap-1 flex-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleTabChange(item.key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                  activeTab === item.key ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200 text-base-content'
                }`}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-4">
            <button
              onClick={() => { logout(); window.location.href = '/'; }}
              className="btn btn-ghost btn-block text-error justify-start gap-2"
            >
              🚪 Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0">
          {/* Mobile tab bar */}
          <div className="flex md:hidden gap-1 mb-6 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleTabChange(item.key)}
                className={`btn btn-sm flex-shrink-0 rounded-full transition-all duration-200 ${
                  activeTab === item.key ? 'btn-primary' : 'btn-ghost'
                }`}
              >
                {item.emoji} {item.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <>
              {/* My Listings */}
              {activeTab === 'listings' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">My Listings</h2>
                    <button
                      onClick={() => navigate('/items/new')}
                      className="btn btn-primary btn-sm rounded-full gap-1"
                    >
                      + Add New Item
                    </button>
                  </div>

                  {myItems.length === 0 ? (
                    emptyState('📭', 'No items listed yet', 'Start sharing your items to earn money!',
                      <button onClick={() => navigate('/items/new')} className="btn btn-primary rounded-full">
                        List Your First Item
                      </button>
                    )
                  ) : (
                    <>
                      {/* Desktop table */}
                      <div className="hidden md:block overflow-x-auto bg-base-100 rounded-2xl shadow-sm">
                        <table className="table w-full">
                          <thead>
                            <tr className="bg-base-200">
                              <th>Item</th><th>Category</th><th>Daily Fee</th><th>Status</th><th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {myItems.map((item) => (
                              <tr
                                key={item._id}
                                onClick={() => navigate(`/items/${item._id}`)}
                                onKeyDown={(e) => {
                                  if (e.currentTarget !== e.target) return;
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    navigate(`/items/${item._id}`);
                                  }
                                }}
                                tabIndex={0}
                                className="hover:bg-base-200 transition-colors cursor-pointer focus:outline-none focus-visible:bg-base-200"
                              >
                                <td>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg item-placeholder flex items-center justify-center text-lg flex-shrink-0">
                                      {item.images?.[0]
                                        ? <img src={item.images[0]} className="w-full h-full object-cover rounded-lg" alt="" />
                                        : '📦'}
                                    </div>
                                    <span className="font-semibold">{item.title}</span>
                                  </div>
                                </td>
                                <td className="text-base-content/70">{item.category}</td>
                                <td className="font-semibold text-primary">৳{item.dailyFee}</td>
                                <td>
                                  <div className={`badge ${item.available ? 'badge-success' : 'badge-error'}`}>
                                    {item.available ? 'Available' : 'Unavailable'}
                                  </div>
                                </td>
                                <td>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/items/${item._id}/edit`);
                                      }}
                                      className="btn btn-xs btn-outline btn-primary"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteItem(item._id);
                                      }}
                                      className="btn btn-xs btn-outline btn-error"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile cards */}
                      <div className="md:hidden space-y-3">
                        {myItems.map((item) => (
                          <div
                            key={item._id}
                            onClick={() => navigate(`/items/${item._id}`)}
                            onKeyDown={(e) => {
                              if (e.currentTarget !== e.target) return;
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                navigate(`/items/${item._id}`);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                            className="card bg-base-100 shadow-sm border border-base-300 p-4 cursor-pointer transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-200"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">{item.title}</h3>
                              <div className={`badge badge-sm ${item.available ? 'badge-success' : 'badge-error'}`}>
                                {item.available ? 'Available' : 'Unavailable'}
                              </div>
                            </div>
                            <p className="text-sm text-base-content/60 mb-3">{item.category} · ৳{item.dailyFee}/day</p>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/items/${item._id}/edit`);
                                }}
                                className="btn btn-xs btn-outline btn-primary flex-1"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteItem(item._id);
                                }}
                                className="btn btn-xs btn-outline btn-error flex-1"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* My Requests */}
              {activeTab === 'requests' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">My Requests</h2>
                  <div className="flex gap-2 mb-6 flex-wrap">
                    {['All', 'Pending', 'Accepted', 'Rejected', 'Returned'].map((f) => (
                      <button key={f} onClick={() => setRequestFilter(f)}
                        className={`btn btn-sm rounded-full ${requestFilter === f ? 'btn-primary' : 'btn-ghost'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                  {filteredRequests.length === 0 ? (
                    emptyState('📋', 'Nothing here yet', 'Browse items and send requests to lenders',
                      <a href="/browse" className="btn btn-primary rounded-full">Browse Items</a>
                    )
                  ) : (
                    <div className="space-y-3">
                      {filteredRequests.map((req) => (
                        <div key={req._id} className="card bg-base-100 shadow-sm border border-base-300">
                          <div className="card-body p-4 flex-row items-center gap-4">
                            <div className="w-14 h-14 rounded-xl item-placeholder flex items-center justify-center text-2xl flex-shrink-0">📦</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{req.item?.title}</p>
                              <p className="text-sm text-base-content/60">Lender: {req.lender?.name}</p>
                              <p className="text-xs text-base-content/50">
                                {new Date(req.startDate).toLocaleDateString()} – {new Date(req.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className={`badge ${statusBadge(req.status)}`}>{req.status}</div>
                              <div className={`badge badge-sm ${paymentBadge(req.paymentStatus)}`}>
                                {req.paymentStatus === 'paid' ? '💳 Paid' : '⏳ Unpaid'}
                              </div>
                              <span className="text-sm font-semibold text-primary">৳{req.totalFee}</span>
                              {req.paymentStatus !== 'paid' && req.depositAmount > 0 && (
                                <button
                                  onClick={() => handlePayDeposit(req._id)}
                                  disabled={payingRequestId === req._id}
                                  className="btn btn-xs btn-primary"
                                >
                                  {payingRequestId === req._id
                                    ? <span className="loading loading-spinner loading-xs"></span>
                                    : `Pay Deposit ৳${req.depositAmount}`}
                                </button>
                              )}
                              {req.lender?._id && (
                                <Link
                                  to={`/messages?with=${req.lender._id}&requestId=${req._id}`}
                                  className="btn btn-xs btn-outline gap-1"
                                >
                                  💬 Message Lender
                                </Link>
                              )}
                              {req.status === 'returned' && !reviewedRequestIds.has(req._id) && (
                                <button
                                  onClick={() => openReviewModal(req, req.lender?._id, req.lender?.name)}
                                  className="btn btn-xs btn-outline btn-warning"
                                >
                                  ⭐ Review Lender
                                </button>
                              )}
                              {req.status === 'returned' && reviewedRequestIds.has(req._id) && (
                                <span className="text-xs text-success">✓ Reviewed</span>
                              )}
                            </div>
                          </div>
                          {/* Sensor panel — borrower sees item condition */}
                          <div className="px-4 pb-4">
                            <SensorPanel request={req} isLender={false} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Incoming Requests */}
              {activeTab === 'incoming' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Incoming Requests</h2>
                  <div className="flex gap-2 mb-6 flex-wrap">
                    {['All', 'Pending', 'Accepted', 'Rejected', 'Returned'].map((f) => (
                      <button key={f} onClick={() => setRequestFilter(f)}
                        className={`btn btn-sm rounded-full ${requestFilter === f ? 'btn-primary' : 'btn-ghost'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                  {filteredIncoming.length === 0 ? (
                    emptyState('📬', 'No incoming requests', 'List items to receive borrow requests',
                      <button onClick={() => handleTabChange('listings')} className="btn btn-primary rounded-full">Go to My Listings</button>
                    )
                  ) : (
                    <div className="space-y-3">
                      {filteredIncoming.map((req) => (
                        <div key={req._id} className="card bg-base-100 shadow-sm border border-base-300">
                          <div className="card-body p-4 flex-row items-center gap-4">
                            <div className="w-14 h-14 rounded-xl item-placeholder flex items-center justify-center text-2xl flex-shrink-0">📦</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{req.item?.title}</p>
                              <p className="text-sm text-base-content/60">Borrower: {req.borrower?.name}</p>
                              <p className="text-xs text-base-content/50">
                                {new Date(req.startDate).toLocaleDateString()} – {new Date(req.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className={`badge ${statusBadge(req.status)}`}>{req.status}</div>
                              <div className={`badge badge-sm ${paymentBadge(req.paymentStatus)}`}>
                                {req.paymentStatus === 'paid' ? '💳 Paid' : '⏳ Unpaid'}
                              </div>
                              <span className="text-sm font-semibold text-primary">৳{req.totalFee}</span>
                              {req.status === 'pending' && (
                                <div className="flex gap-1">
                                  <button onClick={() => handleRequestAction(req._id, 'accepted')} className="btn btn-success btn-xs">Accept</button>
                                  <button onClick={() => handleRequestAction(req._id, 'rejected')} className="btn btn-error btn-outline btn-xs">Reject</button>
                                </div>
                              )}
                              {req.status === 'accepted' && (
                                <button
                                  onClick={() => handleRequestAction(req._id, 'returned')}
                                  className="btn btn-xs btn-neutral"
                                >
                                  Mark Returned
                                </button>
                              )}
                              {req.borrower?._id && (
                                <Link
                                  to={`/messages?with=${req.borrower._id}&requestId=${req._id}`}
                                  className="btn btn-xs btn-outline gap-1"
                                >
                                  💬 Message Borrower
                                </Link>
                              )}
                              {req.status === 'returned' && !reviewedRequestIds.has(req._id) && (
                                <button
                                  onClick={() => openReviewModal(req, req.borrower?._id, req.borrower?.name)}
                                  className="btn btn-xs btn-outline btn-warning"
                                >
                                  ⭐ Review Borrower
                                </button>
                              )}
                              {req.status === 'returned' && reviewedRequestIds.has(req._id) && (
                                <span className="text-xs text-success">✓ Reviewed</span>
                              )}
                            </div>
                          </div>
                          {/* Sensor panel — lender manages sensor for this rental */}
                          <div className="px-4 pb-4">
                            <SensorPanel request={req} isLender={true} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Profile */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-primary mb-1">Account settings</p>
                      <h2 className="text-2xl font-bold">Profile</h2>
                      <p className="text-base-content/60 mt-1">Keep your public lending profile polished and trustworthy.</p>
                    </div>
                    <div className="badge badge-success badge-outline w-fit">Verified account</div>
                  </div>

                  <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-start">
                    <section className="card bg-base-100 shadow-sm border border-base-300">
                      <div className="card-body p-6 items-center text-center">
                        <div className={`avatar ${profileForm.avatar ? '' : 'placeholder'} mb-2`}>
                          {profileForm.avatar ? (
                            <div className="w-32 rounded-full ring ring-primary/20 ring-offset-4 ring-offset-base-100">
                              <img src={profileForm.avatar} alt={profileForm.name || 'Profile preview'} />
                            </div>
                          ) : (
                            <div className="bg-primary text-primary-content rounded-full w-32">
                              <span className="text-4xl font-bold">{userInitial(profileForm.name)}</span>
                            </div>
                          )}
                        </div>
                        <h3 className="text-xl font-bold">{profileForm.name || user?.name}</h3>
                        <p className="text-sm text-base-content/60 break-all">{user?.email}</p>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarSelect}
                          className="hidden"
                        />
                        <div className="grid grid-cols-2 gap-2 w-full mt-4">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="btn btn-primary btn-sm"
                          >
                            Upload Photo
                          </button>
                          <button
                            type="button"
                            onClick={() => setProfileForm((prev) => ({ ...prev, avatar: '' }))}
                            className="btn btn-outline btn-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-xs text-base-content/50 mt-2">JPG, PNG, or WEBP up to 1 MB.</p>

                        <div className="divider"></div>
                        <div className="grid grid-cols-3 gap-3 w-full">
                          <div className="rounded-xl bg-base-200 p-3">
                            <p className="text-lg font-bold">{myItems.length}</p>
                            <p className="text-xs text-base-content/60">Listings</p>
                          </div>
                          <div className="rounded-xl bg-base-200 p-3">
                            <p className="text-lg font-bold">{user?.rating || 0}</p>
                            <p className="text-xs text-base-content/60">Rating</p>
                          </div>
                          <div className="rounded-xl bg-base-200 p-3">
                            <p className="text-lg font-bold">{user?.totalReviews || 0}</p>
                            <p className="text-xs text-base-content/60">Reviews</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <form onSubmit={handleProfileSubmit} className="card bg-base-100 shadow-sm border border-base-300">
                      <div className="card-body p-6">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div>
                            <h3 className="text-xl font-bold">Personal information</h3>
                            <p className="text-sm text-base-content/60">This information helps borrowers and lenders recognize you.</p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Full name</span></label>
                            <input
                              type="text"
                              name="name"
                              value={profileForm.name}
                              onChange={handleProfileChange}
                              className="input input-bordered w-full focus:ring-2 ring-primary/30"
                              placeholder="Your full name"
                              maxLength={80}
                            />
                          </div>
                          <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Email</span></label>
                            <input
                              type="email"
                              value={user?.email || ''}
                              className="input input-bordered w-full bg-base-200 text-base-content/70"
                              disabled
                            />
                          </div>
                          <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Phone</span></label>
                            <input
                              type="tel"
                              name="phone"
                              value={profileForm.phone}
                              onChange={handleProfileChange}
                              className="input input-bordered w-full focus:ring-2 ring-primary/30"
                              placeholder="+880 1XXX XXXXXX"
                              maxLength={30}
                            />
                          </div>
                          <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Location</span></label>
                            <input
                              type="text"
                              name="location"
                              value={profileForm.location}
                              onChange={handleProfileChange}
                              className="input input-bordered w-full focus:ring-2 ring-primary/30"
                              placeholder="City or neighborhood"
                              maxLength={80}
                            />
                          </div>
                        </div>

                        <div className="form-control mt-4">
                          <label className="label">
                            <span className="label-text font-medium">Bio</span>
                            <span className="label-text-alt text-base-content/50">{profileForm.bio.length}/280</span>
                          </label>
                          <textarea
                            name="bio"
                            value={profileForm.bio}
                            onChange={handleProfileChange}
                            className="textarea textarea-bordered min-h-32 focus:ring-2 ring-primary/30"
                            placeholder="Share what you lend, what you borrow, or how people can coordinate with you."
                            maxLength={280}
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
                          <p className="text-sm text-base-content/50">Changes update your profile across ShareStuff immediately.</p>
                          <button type="submit" disabled={savingProfile} className="btn btn-primary min-w-36">
                            {savingProfile ? <span className="loading loading-spinner loading-sm"></span> : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Earnings & Payment History */}
                  <div className="card bg-base-100 shadow-sm border border-base-300">                    <div className="card-body p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">Earnings & Payments</h3>
                          <p className="text-sm text-base-content/60">Deposits received from borrowers</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-success">৳{totalEarned.toFixed(2)}</p>
                          <p className="text-xs text-base-content/50">Total earned</p>
                        </div>
                      </div>

                      {paymentHistory.length === 0 ? (
                        <div className="text-center py-10 text-base-content/50">
                          <div className="text-4xl mb-2">💳</div>
                          <p>No payment history yet</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="table table-sm w-full">
                            <thead>
                              <tr className="bg-base-200">
                                <th>Item</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...paymentHistory].reverse().map((p, i) => (
                                <tr key={i} className="hover:bg-base-200">
                                  <td className="font-medium">{p.itemTitle}</td>
                                  <td>
                                    <span className={`badge badge-sm ${p.type === 'received' ? 'badge-success' : 'badge-info'}`}>
                                      {p.type === 'received' ? '⬇ Received' : '⬆ Paid'}
                                    </span>
                                  </td>
                                  <td className={`font-semibold ${p.type === 'received' ? 'text-success' : 'text-info'}`}>
                                    {p.type === 'received' ? '+' : '-'}৳{p.amount}
                                  </td>
                                  <td className="text-base-content/60 text-xs">
                                    {new Date(p.paidAt).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* My Reviews */}
                  <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">My Reviews</h3>
                          <p className="text-sm text-base-content/60">What others say about you</p>
                        </div>
                        {myReceivedReviews.length > 0 && (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-warning">
                              {'★'.repeat(Math.round(user?.rating || 0))}{'☆'.repeat(5 - Math.round(user?.rating || 0))}
                            </p>
                            <p className="text-xs text-base-content/50">
                              {Number(user?.rating || 0).toFixed(1)} avg · {myReceivedReviews.length} review{myReceivedReviews.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        )}
                      </div>

                      {myReceivedReviews.length === 0 ? (
                        <div className="text-center py-10 text-base-content/50">
                          <div className="text-4xl mb-2">⭐</div>
                          <p>No reviews yet</p>
                          <p className="text-xs mt-1">Complete a borrow/lend to receive your first review</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {myReceivedReviews.map((review) => (
                            <div key={review._id} className="flex gap-3 border-b border-base-200 pb-4 last:border-0 last:pb-0">
                              <div className="avatar placeholder flex-shrink-0">
                                <div className="bg-primary/20 text-primary rounded-full w-10">
                                  <span className="text-sm font-bold">
                                    {review.reviewer?.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className="font-semibold text-sm">{review.reviewer?.name}</span>
                                  <span className="text-xs text-base-content/40">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex gap-0.5 my-1">
                                  {[1,2,3,4,5].map((s) => (
                                    <span key={s} className={s <= review.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                                  ))}
                                </div>
                                {review.comment && (
                                  <p className="text-sm text-base-content/70">{review.comment}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Review Modal ── */}
      {reviewModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <button
              onClick={closeReviewModal}
              className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
            >✕</button>

            <h3 className="font-bold text-lg mb-1">Leave a Review</h3>
            <p className="text-base-content/60 text-sm mb-5">
              How was your experience with <strong>{reviewModal.revieweeName}</strong>?
            </p>

            <div className="flex justify-center mb-4">
              <StarRating interactive value={reviewRating} onChange={setReviewRating} />
            </div>
            {reviewRating > 0 && (
              <p className="text-center text-sm text-base-content/60 mb-4">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewRating]}
              </p>
            )}

            <div className="form-control mb-5">
              <label className="label">
                <span className="label-text font-medium">Comment <span className="text-base-content/40">(optional)</span></span>
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="textarea textarea-bordered min-h-24 focus:ring-2 ring-primary/30"
                placeholder="Share details about your experience..."
                maxLength={500}
              />
              <label className="label">
                <span className="label-text-alt text-base-content/40">{reviewComment.length}/500</span>
              </label>
            </div>

            <div className="modal-action mt-0">
              <button onClick={closeReviewModal} className="btn btn-ghost">Cancel</button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || !reviewRating}
                className="btn btn-primary"
              >
                {submittingReview
                  ? <span className="loading loading-spinner loading-sm"></span>
                  : 'Submit Review'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeReviewModal}></div>
        </div>
      )}
    </div>
  );
}
