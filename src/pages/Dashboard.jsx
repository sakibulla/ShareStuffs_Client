import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('listings');
  const [myItems, setMyItems] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestFilter, setRequestFilter] = useState('All');

  const loadData = useCallback(async () => {
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

  useEffect(() => { loadData(); }, [loadData]);

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
        <aside className="hidden md:flex flex-col w-64 bg-base-100 border-r border-base-200 min-h-screen p-4 sticky top-16 self-start">
          <div className="flex items-center gap-3 p-3 mb-4">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-12">
                <span className="text-lg font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
            </div>
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
                onClick={() => setActiveTab(item.key)}
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
                onClick={() => setActiveTab(item.key)}
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
                              <tr key={item._id} className="hover:bg-base-50 transition-colors">
                                <td>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-green-200 flex items-center justify-center text-lg flex-shrink-0">
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
                                    <button onClick={() => navigate(`/items/${item._id}/edit`)} className="btn btn-xs btn-outline btn-primary">Edit</button>
                                    <button onClick={() => handleDeleteItem(item._id)} className="btn btn-xs btn-outline btn-error">Delete</button>
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
                          <div key={item._id} className="card bg-base-100 shadow-sm border border-base-200 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">{item.title}</h3>
                              <div className={`badge badge-sm ${item.available ? 'badge-success' : 'badge-error'}`}>
                                {item.available ? 'Available' : 'Unavailable'}
                              </div>
                            </div>
                            <p className="text-sm text-base-content/60 mb-3">{item.category} · ৳{item.dailyFee}/day</p>
                            <div className="flex gap-2">
                              <button onClick={() => navigate(`/items/${item._id}/edit`)} className="btn btn-xs btn-outline btn-primary flex-1">Edit</button>
                              <button onClick={() => handleDeleteItem(item._id)} className="btn btn-xs btn-outline btn-error flex-1">Delete</button>
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
                        <div key={req._id} className="card bg-base-100 shadow-sm border border-base-200">
                          <div className="card-body p-4 flex-row items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-green-200 flex items-center justify-center text-2xl flex-shrink-0">📦</div>
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
                      <button onClick={() => setActiveTab('listings')} className="btn btn-primary rounded-full">Go to My Listings</button>
                    )
                  ) : (
                    <div className="space-y-3">
                      {filteredIncoming.map((req) => (
                        <div key={req._id} className="card bg-base-100 shadow-sm border border-base-200">
                          <div className="card-body p-4 flex-row items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-green-200 flex items-center justify-center text-2xl flex-shrink-0">📦</div>
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
                <div>
                  <h2 className="text-2xl font-bold mb-6">Profile</h2>
                  <div className="card bg-base-100 shadow-sm border border-base-200 max-w-md">
                    <div className="card-body p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content rounded-full w-16">
                            <span className="text-2xl font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{user?.name}</h3>
                          <p className="text-base-content/60">{user?.email}</p>
                        </div>
                      </div>
                      <div className="divider"></div>
                      <p className="text-sm text-base-content/50 text-center">Profile editing coming soon</p>
                    </div>
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
