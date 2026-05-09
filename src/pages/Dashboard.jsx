import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../utils/api';

const statusBadge = (status) => {
  const map = { pending: 'badge-warning', accepted: 'badge-success', rejected: 'badge-error', returned: 'badge-neutral' };
  return map[status] || 'badge-ghost';
};

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
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const loadData = useCallback(async () => {
    if (activeTab === 'profile') return;
    setLoading(true);
    try {
      if (activeTab === 'listings') {
        const res = await api.get('/items/my');
        setMyItems(res.data || []);
      } else if (activeTab === 'requests') {
        const res = await api.get('/requests/mine');
        setMyRequests(res.data || []);
      } else if (activeTab === 'incoming') {
        const res = await api.get('/requests/lender');
        setIncomingRequests(res.data || []);
      }
    } catch {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, addToast]);

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
                    {['All', 'Pending', 'Accepted', 'Rejected'].map((f) => (
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
                            <div className="flex flex-col items-end gap-1">
                              <div className={`badge ${statusBadge(req.status)}`}>{req.status}</div>
                              <span className="text-sm font-semibold text-primary">৳{req.totalFee}</span>
                            </div>
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
                    {['All', 'Pending', 'Accepted', 'Rejected'].map((f) => (
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
                              <span className="text-sm font-semibold text-primary">৳{req.totalFee}</span>
                              {req.status === 'pending' && (
                                <div className="flex gap-1">
                                  <button onClick={() => handleRequestAction(req._id, 'accepted')} className="btn btn-success btn-xs">Accept</button>
                                  <button onClick={() => handleRequestAction(req._id, 'rejected')} className="btn btn-error btn-outline btn-xs">Reject</button>
                                </div>
                              )}
                            </div>
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
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
