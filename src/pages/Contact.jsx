import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition, staggerContainer, staggerItem, fadeUp, tapPress } from '../utils/animations';

const faqs = [
  { q: 'How do I list an item?', a: 'Sign up, go to your Dashboard, and click "New Item". Fill in the details, set your daily fee and deposit, and publish.' },
  { q: 'Is my payment secure?', a: 'Yes. All payments are processed through Stripe, a PCI-DSS compliant payment provider. We never store your card details.' },
  { q: 'What if an item is damaged?', a: 'The deposit system protects lenders. If an item is returned damaged, the deposit covers the cost.' },
  { q: 'Can I message a lender before borrowing?', a: 'Absolutely. Use the "Message Lender" button on any item page or from your Dashboard to chat before committing.' },
  { q: 'How do I cancel a request?', a: 'Contact the lender via messages to coordinate. Cancellation policies are agreed between borrower and lender directly.' },
  { q: 'Is ShareStuff available outside Dhaka?', a: 'We currently operate in 12 cities across Bangladesh and are expanding rapidly. Check the map on the home page for coverage.' },
];

const contactMethods = [
  { emoji: '📧', label: 'Email',  value: 'hello@sharestuff.app',          href: 'mailto:hello@sharestuff.app' },
  { emoji: '📞', label: 'Phone',  value: '+880 1700-000000',               href: 'tel:+8801700000000' },
  { emoji: '📍', label: 'Office', value: 'Gulshan-2, Dhaka 1212',          href: null },
  { emoji: '🕐', label: 'Hours',  value: 'Sun – Thu, 9 AM – 6 PM BST',    href: null },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit">

      {/* Hero */}
      <section className="hero-surface py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold border border-primary/20 mb-6"
          >
            💬 We'd love to hear from you
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold mb-4"
          >
            Get in <span className="brand-gradient-text">Touch</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base-content/60 text-base sm:text-lg"
          >
            Have a question, feedback, or just want to say hi? We typically respond within one business day.
          </motion.p>
        </div>
      </section>

      {/* Contact cards */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="bg-base-100 py-14 px-4"
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactMethods.map((m) => (
            <motion.div
              key={m.label}
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-base-200 border border-base-300/60 rounded-2xl p-5 text-center hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-2">{m.emoji}</div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{m.label}</p>
              {m.href ? (
                <a href={m.href} className="text-sm font-medium hover:text-primary transition-colors break-all">{m.value}</a>
              ) : (
                <p className="text-sm text-base-content/65">{m.value}</p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Form + FAQ */}
      <section className="bg-base-200 py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Send us a message</h2>
            <p className="text-base-content/55 mb-8 text-sm">Fill in the form and we'll get back to you shortly.</p>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-success/10 border border-success/30 rounded-2xl p-8 text-center space-y-3"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="text-5xl"
                  >
                    ✅
                  </motion.div>
                  <h3 className="text-xl font-bold text-success">Message sent!</h3>
                  <p className="text-base-content/60 text-sm">
                    Thanks for reaching out. We'll reply to <strong>{form.email}</strong> within one business day.
                  </p>
                  <motion.button
                    whileTap={tapPress}
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                    className="btn btn-outline btn-sm rounded-full mt-2"
                  >
                    Send another message
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label py-1"><span className="label-text font-medium text-sm">Your Name</span></label>
                      <input type="text" name="name" value={form.name} onChange={handleChange} required
                        placeholder="Aryan Hossain" className="input input-bordered w-full rounded-xl" />
                    </div>
                    <div className="form-control">
                      <label className="label py-1"><span className="label-text font-medium text-sm">Email Address</span></label>
                      <input type="email" name="email" value={form.email} onChange={handleChange} required
                        placeholder="you@example.com" className="input input-bordered w-full rounded-xl" />
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label py-1"><span className="label-text font-medium text-sm">Subject</span></label>
                    <select name="subject" value={form.subject} onChange={handleChange} required
                      className="select select-bordered w-full rounded-xl">
                      <option value="" disabled>Select a topic…</option>
                      {['General Inquiry','Report a Problem','Payment Issue','Account Help','Partnership','Other'].map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label py-1"><span className="label-text font-medium text-sm">Message</span></label>
                    <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
                      placeholder="Tell us how we can help…"
                      className="textarea textarea-bordered w-full rounded-xl resize-none" />
                  </div>
                  <motion.button whileTap={tapPress} type="submit" className="btn btn-primary btn-block rounded-xl h-12">
                    Send Message →
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Frequently Asked</h2>
            <p className="text-base-content/55 mb-8 text-sm">Quick answers to common questions.</p>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-base-100 border border-base-300/60 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold hover:bg-base-200/50 transition-colors"
                    aria-expanded={openFaq === i}
                  >
                    <span>{faq.q}</span>
                    <motion.span
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-base-content/40 flex-shrink-0 ml-3"
                    >
                      ▾
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-4 text-sm text-base-content/65 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-base-200 py-10 px-4 border-t border-base-300/60">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xl">🔄</span>
            <span className="brand-gradient-text font-extrabold text-xl">ShareStuff</span>
          </div>
          <p className="text-base-content/55 text-sm">A peer-to-peer lending platform that brings communities together.</p>
          <p className="text-xs text-base-content/35 mt-4">© 2025 ShareStuff. All rights reserved.</p>
        </div>
      </footer>
    </motion.div>
  );
}
