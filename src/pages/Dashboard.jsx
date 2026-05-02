import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Dashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('listings');
    const [myItems, setMyItems] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Tools',
        dailyFee: '',
        deposit: '',
        location: '',
        available: true,
    });
    const [formErrors, setFormErrors] = useState({});

    const categories = ['Tools', 'Camping', 'Party', 'Kitchen', 'Electronics', 'Sports'];

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'listings') {
                const response = await api.get('/items/my');
                setMyItems(response.data || []);
            } else if (activeTab === 'requests') {
                const response = await api.get('/requests/mine');
                setMyRequests(response.data || []);
            } else if (activeTab === 'incoming') {
                const response = await api.get('/requests/lender');
                setIncomingRequests(response.data || []);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            alert('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = 'Title is required';
        if (!formData.category) errors.category = 'Category is required';
        if (!formData.dailyFee || parseFloat(formData.dailyFee) <= 0) {
            errors.dailyFee = 'Daily fee must be greater than 0';
        }
        if (!formData.deposit || parseFloat(formData.deposit) <= 0) {
            errors.deposit = 'Deposit must be greater than 0';
        }
        return errors;
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        const errors = validateForm();

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            const payload = {
                ...formData,
                dailyFee: parseFloat(formData.dailyFee),
                deposit: parseFloat(formData.deposit),
            };

            if (editingItem) {
                await api.put(`/items/${editingItem.id}`, payload);
            } else {
                await api.post('/items', payload);
            }

            setShowModal(false);
            setEditingItem(null);
            setFormData({
                title: '',
                description: '',
                category: 'Tools',
                dailyFee: '',
                deposit: '',
                location: '',
                available: true,
            });

            document.querySelector('.toast')?.remove();
            const toast = document.createElement('div');
            toast.innerHTML = `
        <div class="toast toast-top toast-center">
          <div class="alert alert-success">
            <span>${editingItem ? 'Item updated' : 'Item added'} successfully!</span>
          </div>
        </div>
      `;
            document.body.appendChild(toast);

            loadData();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to save item';
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
        }
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description,
            category: item.category,
            dailyFee: item.dailyFee,
            deposit: item.deposit,
            location: item.location,
            available: item.available,
        });
        setShowModal(true);
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await api.delete(`/items/${itemId}`);
                document.querySelector('.toast')?.remove();
                const toast = document.createElement('div');
                toast.innerHTML = `
          <div class="toast toast-top toast-center">
            <div class="alert alert-success">
              <span>Item deleted successfully!</span>
            </div>
          </div>
        `;
                document.body.appendChild(toast);
                loadData();
            } catch (error) {
                alert('Failed to delete item');
            }
        }
    };

    const handleRequestAction = async (requestId, action) => {
        try {
            await api.put(`/requests/${requestId}`, { status: action });
            document.querySelector('.toast')?.remove();
            const toast = document.createElement('div');
            toast.innerHTML = `
        <div class="toast toast-top toast-center">
          <div class="alert alert-success">
            <span>Request ${action}ed!</span>
          </div>
        </div>
      `;
            document.body.appendChild(toast);
            loadData();
        } catch (error) {
            alert('Failed to update request');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData({
            title: '',
            description: '',
            category: 'Tools',
            dailyFee: '',
            deposit: '',
            location: '',
            available: true,
        });
        setFormErrors({});
    };

    return (
        <div className="min-h-screen bg-base-200 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

                {/* Welcome Message */}
                <div className="card bg-gradient-to-r from-primary to-primary/80 text-primary-content shadow-lg mb-8 p-6">
                    <h2 className="text-2xl font-bold">Welcome back, {user?.name}!</h2>
                    <p className="opacity-90">Manage your items and borrow requests</p>
                </div>

                {/* Tabs */}
                <div className="tabs tabs-bordered mb-8 bg-base-100 rounded-lg shadow-md">
                    <button
                        className={`tab ${activeTab === 'listings' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('listings')}
                    >
                        My Listings
                    </button>
                    <button
                        className={`tab ${activeTab === 'requests' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        My Requests
                    </button>
                    <button
                        className={`tab ${activeTab === 'incoming' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('incoming')}
                    >
                        Incoming Requests
                    </button>
                </div>

                {/* Tab Content */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : (
                    <>
                        {/* My Listings Tab */}
                        {activeTab === 'listings' && (
                            <div>
                                <button
                                    onClick={() => {
                                        handleCloseModal();
                                        setShowModal(true);
                                    }}
                                    className="btn btn-primary mb-6"
                                >
                                    + Add New Item
                                </button>

                                {myItems.length === 0 ? (
                                    <div className="card bg-base-100 shadow-md p-12 text-center">
                                        <p className="text-2xl text-base-content/60 mb-4">No items listed yet</p>
                                        <p className="text-base-content/50">Start sharing your items to earn money!</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto bg-base-100 rounded-lg shadow-md">
                                        <table className="table w-full">
                                            <thead>
                                                <tr className="bg-base-200">
                                                    <th>Title</th>
                                                    <th>Category</th>
                                                    <th>Daily Fee</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {myItems.map((item) => (
                                                    <tr key={item.id} className="hover:bg-base-200">
                                                        <td className="font-semibold">{item.title}</td>
                                                        <td>{item.category}</td>
                                                        <td>${item.dailyFee}</td>
                                                        <td>
                                                            <div
                                                                className={`badge ${item.available ? 'badge-success' : 'badge-error'
                                                                    }`}
                                                            >
                                                                {item.available ? 'Available' : 'Not Available'}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <button
                                                                onClick={() => handleEditItem(item)}
                                                                className="btn btn-xs btn-primary mr-2"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteItem(item.id)}
                                                                className="btn btn-xs btn-error"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* My Requests Tab */}
                        {activeTab === 'requests' && (
                            <div>
                                {myRequests.length === 0 ? (
                                    <div className="card bg-base-100 shadow-md p-12 text-center">
                                        <p className="text-2xl text-base-content/60 mb-4">No requests yet</p>
                                        <p className="text-base-content/50">Browse items and send requests to lenders</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto bg-base-100 rounded-lg shadow-md">
                                        <table className="table w-full">
                                            <thead>
                                                <tr className="bg-base-200">
                                                    <th>Item</th>
                                                    <th>Lender</th>
                                                    <th>Dates</th>
                                                    <th>Total Fee</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {myRequests.map((req) => (
                                                    <tr key={req.id} className="hover:bg-base-200">
                                                        <td className="font-semibold">{req.item?.title}</td>
                                                        <td>{req.lender?.name}</td>
                                                        <td className="text-sm">
                                                            {new Date(req.startDate).toLocaleDateString()} -{' '}
                                                            {new Date(req.endDate).toLocaleDateString()}
                                                        </td>
                                                        <td>${req.totalFee}</td>
                                                        <td>
                                                            <div
                                                                className={`badge ${req.status === 'accepted'
                                                                    ? 'badge-success'
                                                                    : req.status === 'rejected'
                                                                        ? 'badge-error'
                                                                        : 'badge-warning'
                                                                    }`}
                                                            >
                                                                {req.status}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Incoming Requests Tab */}
                        {activeTab === 'incoming' && (
                            <div>
                                {incomingRequests.length === 0 ? (
                                    <div className="card bg-base-100 shadow-md p-12 text-center">
                                        <p className="text-2xl text-base-content/60 mb-4">No incoming requests</p>
                                        <p className="text-base-content/50">List items to receive borrow requests</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto bg-base-100 rounded-lg shadow-md">
                                        <table className="table w-full">
                                            <thead>
                                                <tr className="bg-base-200">
                                                    <th>Borrower</th>
                                                    <th>Item</th>
                                                    <th>Dates</th>
                                                    <th>Total Fee</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {incomingRequests.map((req) => (
                                                    <tr key={req.id} className="hover:bg-base-200">
                                                        <td className="font-semibold">{req.borrower?.name}</td>
                                                        <td>{req.item?.title}</td>
                                                        <td className="text-sm">
                                                            {new Date(req.startDate).toLocaleDateString()} -{' '}
                                                            {new Date(req.endDate).toLocaleDateString()}
                                                        </td>
                                                        <td>${req.totalFee}</td>
                                                        <td>
                                                            <div
                                                                className={`badge ${req.status === 'accepted'
                                                                    ? 'badge-success'
                                                                    : req.status === 'rejected'
                                                                        ? 'badge-error'
                                                                        : 'badge-warning'
                                                                    }`}
                                                            >
                                                                {req.status}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {req.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleRequestAction(req.id, 'accepted')}
                                                                        className="btn btn-xs btn-success mr-2"
                                                                    >
                                                                        Accept
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRequestAction(req.id, 'rejected')}
                                                                        className="btn btn-xs btn-error"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add/Edit Item Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="card bg-base-100 shadow-xl w-full max-w-md">
                        <div className="card-body">
                            <h2 className="card-title">
                                {editingItem ? 'Edit Item' : 'Add New Item'}
                            </h2>

                            <form onSubmit={handleSubmitForm} className="space-y-4 mt-4">
                                <div>
                                    <label className="label">
                                        <span className="label-text font-semibold">Title *</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleFormChange}
                                        placeholder="Item title"
                                        className={`input input-bordered w-full ${formErrors.title ? 'input-error' : ''
                                            }`}
                                    />
                                    {formErrors.title && (
                                        <span className="text-error text-sm">{formErrors.title}</span>
                                    )}
                                </div>

                                <div>
                                    <label className="label">
                                        <span className="label-text font-semibold">Description</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleFormChange}
                                        placeholder="Describe your item"
                                        className="textarea textarea-bordered w-full"
                                        rows="3"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="label">
                                        <span className="label-text font-semibold">Category *</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleFormChange}
                                        className={`select select-bordered w-full ${formErrors.category ? 'select-error' : ''
                                            }`}
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.category && (
                                        <span className="text-error text-sm">{formErrors.category}</span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">
                                            <span className="label-text font-semibold">Daily Fee *</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="dailyFee"
                                            value={formData.dailyFee}
                                            onChange={handleFormChange}
                                            placeholder="0.00"
                                            step="0.01"
                                            className={`input input-bordered w-full ${formErrors.dailyFee ? 'input-error' : ''
                                                }`}
                                        />
                                        {formErrors.dailyFee && (
                                            <span className="text-error text-sm">{formErrors.dailyFee}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label className="label">
                                            <span className="label-text font-semibold">Deposit *</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="deposit"
                                            value={formData.deposit}
                                            onChange={handleFormChange}
                                            placeholder="0.00"
                                            step="0.01"
                                            className={`input input-bordered w-full ${formErrors.deposit ? 'input-error' : ''
                                                }`}
                                        />
                                        {formErrors.deposit && (
                                            <span className="text-error text-sm">{formErrors.deposit}</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="label">
                                        <span className="label-text font-semibold">Location</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleFormChange}
                                        placeholder="Item location"
                                        className="input input-bordered w-full"
                                    />
                                </div>

                                <div>
                                    <label className="label cursor-pointer">
                                        <span className="label-text font-semibold">Available for borrowing</span>
                                        <input
                                            type="checkbox"
                                            name="available"
                                            checked={formData.available}
                                            onChange={handleFormChange}
                                            className="checkbox"
                                        />
                                    </label>
                                </div>

                                <div className="card-actions justify-between mt-6">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="btn btn-ghost"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingItem ? 'Update Item' : 'Add Item'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
