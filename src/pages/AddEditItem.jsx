import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../components/Toast';
import api from '../utils/api';

const categories = ['Tools', 'Camping', 'Party', 'Kitchen', 'Electronics', 'Sports'];

export default function AddEditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [imageInput, setImageInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Tools',
    dailyFee: '',
    deposit: '',
    location: '',
    available: true,
    images: [],
  });

  useEffect(() => {
    if (!isEditing) return;
    api.get(`/items/${id}`)
      .then((res) => {
        const item = res.data;
        setFormData({
          title: item.title || '',
          description: item.description || '',
          category: item.category || 'Tools',
          dailyFee: item.dailyFee ?? '',
          deposit: item.deposit ?? '',
          location: item.location || '',
          available: item.available ?? true,
          images: item.images || [],
        });
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.message || 'Failed to load item';
        setFetchError(msg);
        addToast(msg, 'error');
      })
      .finally(() => setLoading(false));
  }, [id, isEditing, addToast, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAddImage = () => {
    const url = imageInput.trim();
    if (!url) return;
    try { new URL(url); } catch { addToast('Please enter a valid URL', 'error'); return; }
    if (formData.images.includes(url)) { addToast('URL already added', 'error'); return; }
    setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
    setImageInput('');
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.dailyFee || parseFloat(formData.dailyFee) <= 0) errors.dailyFee = 'Daily fee must be greater than 0';
    if (!formData.deposit || parseFloat(formData.deposit) <= 0) errors.deposit = 'Deposit must be greater than 0';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        dailyFee: parseFloat(formData.dailyFee),
        deposit: parseFloat(formData.deposit),
      };
      if (isEditing) {
        await api.put(`/items/${id}`, payload);
        addToast('Item updated successfully!', 'success');
      } else {
        await api.post('/items', payload);
        addToast('Item added successfully!', 'success');
      }
      navigate('/dashboard');
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to save item', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-error text-lg font-semibold">Error: {fetchError}</p>
        <p className="text-base-content/60 text-sm">Item ID: {id}</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="btn btn-ghost btn-sm btn-circle">
            ←
          </button>
          <h1 className="text-2xl font-bold">{isEditing ? 'Edit Item' : 'Add New Item'}</h1>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Title *</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Item title"
                  className={`input input-bordered w-full ${formErrors.title ? 'input-error' : ''}`}
                />
                {formErrors.title && <span className="text-error text-sm mt-1">{formErrors.title}</span>}
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Description</span></label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your item"
                  className="textarea textarea-bordered w-full"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Category *</span></label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`select select-bordered w-full ${formErrors.category ? 'select-error' : ''}`}
                  >
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                {/* Location */}
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Location</span></label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Item location"
                    className="input input-bordered w-full"
                  />
                </div>

                {/* Daily Fee */}
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Daily Fee (৳) *</span></label>
                  <input
                    type="number"
                    name="dailyFee"
                    value={formData.dailyFee}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`input input-bordered w-full ${formErrors.dailyFee ? 'input-error' : ''}`}
                  />
                  {formErrors.dailyFee && <span className="text-error text-sm mt-1">{formErrors.dailyFee}</span>}
                </div>

                {/* Deposit */}
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Deposit (৳) *</span></label>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`input input-bordered w-full ${formErrors.deposit ? 'input-error' : ''}`}
                  />
                  {formErrors.deposit && <span className="text-error text-sm mt-1">{formErrors.deposit}</span>}
                </div>
              </div>

              {/* Image URLs */}
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Image URLs</span></label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                    placeholder="https://example.com/image.jpg"
                    className="input input-bordered flex-1"
                  />
                  <button type="button" onClick={handleAddImage} className="btn btn-outline btn-primary">
                    Add
                  </button>
                </div>

                {/* Preview grid */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group rounded-xl overflow-hidden border border-base-300 aspect-square bg-base-200">
                        <img
                          src={url}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = ''; e.target.parentElement.classList.add('img-error'); }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 btn btn-circle btn-xs btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 badge badge-primary badge-xs">Cover</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available toggle */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleChange}
                    className="toggle toggle-primary"
                  />
                  <span className="label-text font-medium">Available for borrowing</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting && <span className="loading loading-spinner loading-sm"></span>}
                  {isEditing ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
