import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/Toast';
import api from '../utils/api';
import { pageTransition, staggerContainer, staggerItem, tapPress } from '../utils/animations';

const categories = ['Tools', 'Camping', 'Party', 'Kitchen', 'Electronics', 'Sports'];

const BD_DISTRICTS = [
  'Bagerhat','Bandarban','Barguna','Barishal','Bhola','Bogura','Brahmanbaria',
  'Chandpur','Chapai Nawabganj','Chattogram','Chuadanga',"Cox's Bazar",'Cumilla',
  'Dhaka','Dinajpur','Faridpur','Feni','Gaibandha','Gazipur','Gopalganj',
  'Habiganj','Jamalpur','Jashore','Jhalokati','Jhenaidah','Joypurhat',
  'Khagrachhari','Khulna','Kishoreganj','Kurigram','Kushtia','Lakshmipur',
  'Lalmonirhat','Madaripur','Magura','Manikganj','Meherpur','Moulvibazar',
  'Munshiganj','Mymensingh','Naogaon','Narail','Narayanganj','Narsingdi',
  'Natore','Netrokona','Nilphamari','Noakhali','Pabna','Panchagarh',
  'Patuakhali','Pirojpur','Rajbari','Rajshahi','Rangamati','Rangpur',
  'Satkhira','Shariatpur','Sherpur','Sirajganj','Sunamganj','Sylhet',
  'Tangail','Thakurgaon',
];

function normaliseLocation(loc) {
  if (!loc) return '';
  if (loc.includes(', Bangladesh')) return loc;
  const match = BD_DISTRICTS.find((d) => d.toLowerCase() === loc.trim().toLowerCase());
  return match ? `${match}, Bangladesh` : '';
}

// ── Field wrapper ──────────────────────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div className="form-control">
      <label className="label py-1">
        <span className="label-text font-medium text-sm">
          {label} {required && <span className="text-error">*</span>}
        </span>
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-error text-xs mt-1"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

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
    title: '', description: '', category: 'Tools',
    dailyFee: '', deposit: '', location: '', available: true, images: [],
  });

  useEffect(() => {
    if (!isEditing) return;
    api.get(`/items/${id}`)
      .then((res) => {
        const item = res.data;
        setFormData({
          title: item.title || '', description: item.description || '',
          category: item.category || 'Tools', dailyFee: item.dailyFee ?? '',
          deposit: item.deposit ?? '', location: normaliseLocation(item.location || ''),
          available: item.available ?? true, images: item.images || [],
        });
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Failed to load item';
        setFetchError(msg);
        addToast(msg, 'error');
      })
      .finally(() => setLoading(false));
  }, [id, isEditing, addToast]);

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
      const payload = { ...formData, dailyFee: parseFloat(formData.dailyFee), deposit: parseFloat(formData.deposit) };
      if (isEditing) {
        await api.put(`/items/${id}`, payload);
        addToast('Item updated!', 'success');
      } else {
        await api.post('/items', payload);
        addToast('Item listed!', 'success');
      }
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save item', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-base-200 px-4">
        <div className="text-5xl">😕</div>
        <p className="text-error font-semibold">{fetchError}</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary rounded-full">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen bg-base-200 py-10 px-4"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <motion.button
            whileTap={tapPress}
            onClick={() => navigate('/dashboard')}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="Back"
          >
            ←
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold">{isEditing ? 'Edit Item' : 'List a New Item'}</h1>
            <p className="text-sm text-base-content/50">{isEditing ? 'Update your listing details' : 'Share something with your community'}</p>
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <motion.div variants={staggerItem}>
              <Field label="Title" required error={formErrors.title}>
                <input
                  type="text" name="title" value={formData.title} onChange={handleChange}
                  placeholder="e.g. Bosch Power Drill, Camping Tent, Stand Mixer…"
                  className={`input input-bordered w-full rounded-xl ${formErrors.title ? 'input-error' : ''}`}
                  maxLength={100}
                />
              </Field>
            </motion.div>

            {/* Description */}
            <motion.div variants={staggerItem}>
              <Field label="Description">
                <textarea
                  name="description" value={formData.description} onChange={handleChange}
                  placeholder="Describe the condition, what's included, any usage notes…"
                  className="textarea textarea-bordered w-full rounded-xl resize-none"
                  rows={3} maxLength={1000}
                />
              </Field>
            </motion.div>

            {/* Category + Location */}
            <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Category" required error={formErrors.category}>
                <select name="category" value={formData.category} onChange={handleChange}
                  className={`select select-bordered w-full rounded-xl ${formErrors.category ? 'select-error' : ''}`}>
                  {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </Field>
              <Field label="Location (District)">
                <select name="location" value={formData.location} onChange={handleChange}
                  className="select select-bordered w-full rounded-xl">
                  <option value="">Select a district…</option>
                  {BD_DISTRICTS.map((d) => (
                    <option key={d} value={`${d}, Bangladesh`}>{d}</option>
                  ))}
                </select>
              </Field>
            </motion.div>

            {/* Daily Fee + Deposit */}
            <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Daily Fee (৳)" required error={formErrors.dailyFee}>
                <label className="input input-bordered flex items-center gap-2 rounded-xl">
                  <span className="text-base-content/50 font-medium">৳</span>
                  <input type="number" name="dailyFee" value={formData.dailyFee} onChange={handleChange}
                    placeholder="0.00" step="0.01" min="0"
                    className={`grow bg-transparent outline-none ${formErrors.dailyFee ? 'text-error' : ''}`} />
                </label>
              </Field>
              <Field label="Security Deposit (৳)" required error={formErrors.deposit}>
                <label className="input input-bordered flex items-center gap-2 rounded-xl">
                  <span className="text-base-content/50 font-medium">৳</span>
                  <input type="number" name="deposit" value={formData.deposit} onChange={handleChange}
                    placeholder="0.00" step="0.01" min="0"
                    className={`grow bg-transparent outline-none ${formErrors.deposit ? 'text-error' : ''}`} />
                </label>
              </Field>
            </motion.div>

            {/* Image URLs */}
            <motion.div variants={staggerItem}>
              <Field label="Image URLs">
                <div className="flex gap-2">
                  <input
                    type="text" value={imageInput} onChange={(e) => setImageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                    placeholder="https://example.com/image.jpg"
                    className="input input-bordered flex-1 rounded-xl text-sm"
                  />
                  <motion.button whileTap={tapPress} type="button" onClick={handleAddImage}
                    className="btn btn-outline btn-primary rounded-xl">
                    Add
                  </motion.button>
                </div>
                <AnimatePresence>
                  {formData.images.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 overflow-hidden"
                    >
                      {formData.images.map((url, index) => (
                        <motion.div
                          key={url}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="relative group rounded-xl overflow-hidden border border-base-300/60 aspect-square bg-base-200"
                        >
                          <img src={url} alt={`Image ${index + 1}`} className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.opacity = '0.3'; }} />
                          <button type="button" onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 btn btn-circle btn-xs btn-error opacity-0 group-hover:opacity-100 transition-opacity">
                            ✕
                          </button>
                          {index === 0 && <span className="absolute bottom-1 left-1 badge badge-primary badge-xs">Cover</span>}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Field>
            </motion.div>

            {/* Available toggle */}
            <motion.div variants={staggerItem}>
              <label className="flex items-center gap-4 cursor-pointer p-4 rounded-xl bg-base-200 border border-base-300/60 hover:border-primary/30 transition-colors">
                <input type="checkbox" name="available" checked={formData.available} onChange={handleChange}
                  className="toggle toggle-primary" />
                <div>
                  <p className="font-medium text-sm">Available for borrowing</p>
                  <p className="text-xs text-base-content/50">Toggle off to temporarily hide this listing</p>
                </div>
              </label>
            </motion.div>

            {/* Actions */}
            <motion.div variants={staggerItem} className="flex justify-end gap-3 pt-2 border-t border-base-300/60">
              <motion.button whileTap={tapPress} type="button" onClick={() => navigate('/dashboard')}
                className="btn btn-ghost rounded-xl">
                Cancel
              </motion.button>
              <motion.button whileTap={tapPress} type="submit" disabled={submitting}
                className="btn btn-primary rounded-xl min-w-32">
                {submitting
                  ? <span className="loading loading-spinner loading-sm" />
                  : isEditing ? 'Update Item' : 'List Item'}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
