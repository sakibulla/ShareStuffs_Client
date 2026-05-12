import { useState } from 'react';

const faqs = [
  { q: 'How do I list an item?', a: 'Sign up, go to your Dashboard, and click "Add New Item". Fill in the details, set your daily fee and deposit, and publish.' },
  { q: 'Is my payment secure?', a: 'Yes. All payments are processed through Stripe, a PCI-DSS compliant payment provider. We never store your card details.' },
  { q: 'What if an item is damaged?', a: 'The deposit system protects lenders. If an item is returned damaged, the lender can raise a dispute and the deposit covers the cost.' },
  { q: 'Can I message a lender before borrowing?', a: 'Absolutely. Use the "Message Lender" button on any item page or from your Dashboard to chat before committing to a request.' },
  { q: 'How do I cancel a request?', a: 'Contact the lender via messages to coordinate. Cancellation policies are agreed between borrower and lender directly.' },
  { q: 'Is ShareStuff available outside Dhaka?', a: 'We currently operate in 12 cities across Bangladesh and are expanding rapidly. Check the map on the home page for coverage.' },
];

const contactMethods = [
  { emoji: '📧', label: 'Email', value: 'hello@sharestuff.app', href: 'mailto:hello@sharestuff.app' },
  { emoji: '📞', label: 'Phone', value: '+880 1700-000000', href: 'tel:+8801700000000' },
  { emoji: '📍', label: 'Office', value: 'Gulshan-2, Dhaka 1212, Bangladesh', href: null },
  { emoji: '🕐', label: 'Hours', value: 'Sun – Thu, 9 AM – 6 PM BST', href: null },
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
    // In a real app this would POST to an API endpoint
    setSubmitted(true);
  };

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="hero-surface py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <span className="inline-block bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-medium border border-primary/15">
            💬 We'd love to hear from you
          </span>
          <h1 className="text-5xl font-extrabold leading-tight">
            Get in <span className="brand-gradient-text">Touch</span>
          </h1>
          <p className="text-base-content/60 text-lg">
            Have a question, feedback, or just want to say hi? Our team typically responds within one business day.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="bg-base-100 py-14 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactMethods.map((m) => (
            <div key={m.label} className="card bg-base-200 border border-base-300 hover:shadow-md hover:scale-105 transition-all duration-200">
              <div className="card-body p-5 items-center text-center">
                <div className="text-3xl mb-2">{m.emoji}</div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{m.label}</p>
                {m.href ? (
                  <a href={m.href} className="text-sm font-medium hover:text-primary transition-colors break-all">
                    {m.value}
                  </a>
                ) : (
                  <p className="text-sm text-base-content/70">{m.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Form + FAQ */}
      <section className="bg-base-200 py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact form */}
          <div>
            <h2 className="text-3xl font-bold mb-2">Send us a message</h2>
            <p className="text-base-content/60 mb-8 text-sm">Fill in the form and we'll get back to you shortly.</p>

            {submitted ? (
              <div className="card bg-success/10 border border-success/30 p-8 text-center space-y-3">
                <div className="text-5xl">✅</div>
                <h3 className="text-xl font-bold text-success">Message sent!</h3>
                <p className="text-base-content/60 text-sm">
                  Thanks for reaching out. We'll reply to <strong>{form.email}</strong> within one business day.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="btn btn-outline btn-sm rounded-full mt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label py-1"><span className="label-text font-medium">Your Name</span></label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Aryan Hossain"
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1"><span className="label-text font-medium">Email Address</span></label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label py-1"><span className="label-text font-medium">Subject</span></label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className="select select-bordered w-full"
                  >
                    <option value="" disabled>Select a topic…</option>
                    <option>General Inquiry</option>
                    <option>Report a Problem</option>
                    <option>Payment Issue</option>
                    <option>Account Help</option>
                    <option>Partnership</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label py-1"><span className="label-text font-medium">Message</span></label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell us how we can help…"
                    className="textarea textarea-bordered w-full resize-none"
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block rounded-full">
                  Send Message →
                </button>
              </form>
            )}
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-bold mb-2">Frequently Asked</h2>
            <p className="text-base-content/60 mb-8 text-sm">Quick answers to common questions.</p>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
                  <input
                    type="radio"
                    name="faq-accordion"
                    checked={openFaq === i}
                    onChange={() => setOpenFaq(openFaq === i ? null : i)}
                  />
                  <div
                    className="collapse-title font-semibold text-sm pr-8 cursor-pointer"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    {faq.q}
                  </div>
                  <div className="collapse-content">
                    <p className="text-base-content/60 text-sm leading-relaxed pt-1">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="bg-base-100 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Find Us</h2>
            <p className="text-base-content/60 text-sm">Our headquarters in Gulshan, Dhaka.</p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-base-300 shadow-sm bg-base-200 h-64 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="text-5xl">📍</div>
              <p className="font-semibold">Gulshan-2, Dhaka 1212</p>
              <p className="text-sm text-base-content/50">Bangladesh</p>
              <a
                href="https://maps.google.com/?q=Gulshan+2+Dhaka"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-sm rounded-full mt-2"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-base-200 py-10 px-4 border-t border-base-300">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <span>🔄</span>
            <span className="brand-gradient-text">ShareStuff</span>
          </div>
          <p className="text-base-content/60 text-sm">A peer-to-peer lending platform that brings communities together.</p>
          <p className="text-xs text-base-content/40 mt-4">© 2025 ShareStuff. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
