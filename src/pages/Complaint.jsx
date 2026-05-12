import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../components/Toast';
import { pageTransition, tapPress } from '../utils/animations';

export default function Complaint() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    description: '',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { value: 'general', label: 'General Issue' },
    { value: 'payment', label: 'Payment Issue' },
    { value: 'item', label: 'Item Issue' },
    { value: 'user', label: 'User Behavior' },
    { value: 'other', label: 'Other' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      addToast('Please enter a subject', 'error');
      return;
    }
    if (!formData.description.trim()) {
      addToast('Please enter a description', 'error');
      return;
    }
    if (!formData.email.trim()) {
      addToast('Please enter your email', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // TODO: Replace with actual API call when backend is ready
      // await api.post('/complaints', formData);
      
      // For now, just show success message
      addToast('Complaint submitted successfully! We will review it shortly.', 'success');
      setFormData({
        subject: '',
        category: 'general',
        description: '',
        email: '',
      });
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit complaint', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen bg-base-200 py-8 px-4"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Submit a Complaint</h1>
          <p className="text-base-content/60">
            We take your feedback seriously. Please tell us about any issues you've experienced.
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm p-6 md:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-medium">Email Address</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="input input-bordered rounded-xl text-sm"
              />
            </div>

            {/* Subject */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-medium">Subject</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief subject of your complaint"
                maxLength={100}
                className="input input-bordered rounded-xl text-sm"
              />
              <label className="label py-1">
                <span className="label-text-alt text-base-content/40 text-xs">{formData.subject.length}/100</span>
              </label>
            </div>

            {/* Category */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-medium">Category</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="select select-bordered rounded-xl text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-medium">Description</span>
                <span className="label-text-alt text-base-content/40 text-xs">{formData.description.length}/1000</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Please provide detailed information about your complaint..."
                maxLength={1000}
                className="textarea textarea-bordered rounded-xl text-sm min-h-32"
              />
            </div>

            {/* Info box */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-info/10 border border-info/30 rounded-xl p-4"
            >
              <p className="text-sm text-info-content/80">
                <span className="font-semibold">ℹ️ Note:</span> Our support team will review your complaint and respond within 24-48 hours.
              </p>
            </motion.div>

            {/* Submit button */}
            <div className="flex gap-3 pt-4">
              <motion.button
                whileTap={tapPress}
                type="submit"
                disabled={submitting}
                className="btn btn-primary rounded-xl flex-1"
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Submitting...
                  </>
                ) : (
                  '📤 Submit Complaint'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: 'How long does it take to resolve a complaint?',
                a: 'Our support team typically responds within 24-48 hours. Resolution time depends on the nature of the complaint.',
              },
              {
                q: 'Will I be notified about the status of my complaint?',
                a: 'Yes, we will send updates to the email address you provide in the complaint form.',
              },
              {
                q: 'Can I submit a complaint anonymously?',
                a: 'We require an email address to follow up with you, but we keep your information confidential.',
              },
              {
                q: 'What types of complaints can I submit?',
                a: 'You can report payment issues, item problems, user behavior concerns, or any other issues you encounter.',
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="collapse collapse-arrow bg-base-100 border border-base-300/60 rounded-xl"
              >
                <input type="checkbox" />
                <div className="collapse-title font-semibold text-sm">{faq.q}</div>
                <div className="collapse-content">
                  <p className="text-sm text-base-content/70">{faq.a}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
