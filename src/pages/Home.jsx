import { Link } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import api from '../utils/api';
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  pageTransition,
  tapPress,
} from '../utils/animations';

const ItemMap = lazy(() => import('../components/ItemMap'));

// ── Static data ────────────────────────────────────────────────────────────
const categories = [
  { name: 'Tools',       emoji: '🔧', count: '120+' },
  { name: 'Camping',     emoji: '⛺', count: '85+'  },
  { name: 'Party',       emoji: '🎉', count: '60+'  },
  { name: 'Kitchen',     emoji: '🍳', count: '95+'  },
  { name: 'Electronics', emoji: '📱', count: '110+' },
  { name: 'Sports',      emoji: '⚽', count: '75+'  },
];

const steps = [
  { num: 1, emoji: '📸', title: 'List Your Item',    description: 'Take a photo and describe what you want to lend. Set your daily fee and deposit.' },
  { num: 2, emoji: '🔍', title: 'Browse & Request',  description: 'Find what you need nearby. Send a borrow request with your preferred dates.' },
  { num: 3, emoji: '🤝', title: 'Connect & Share',   description: 'Meet your neighbor, exchange the item, and build community trust.' },
];

const testimonials = [
  {
    name: 'Tanvir Rahman', role: 'Borrower · Dhaka', emoji: '👨‍🔧', rating: 5,
    quote: 'I needed a power drill for one afternoon. Instead of buying one for ৳3,000, I borrowed it for ৳150. ShareStuff is a no-brainer.',
  },
  {
    name: 'Sumaiya Akter', role: 'Lender · Chittagong', emoji: '👩‍🍳', rating: 5,
    quote: 'My stand mixer was sitting unused for months. Now it earns me ৳500 a week. The deposit system makes me feel completely safe.',
  },
  {
    name: 'Mehedi Hasan', role: 'Borrower & Lender · Sylhet', emoji: '🧑‍💼', rating: 5,
    quote: 'I borrow camping gear every summer and lend my projector year-round. The messaging feature makes coordination super easy.',
  },
];

const whyUs = [
  { emoji: '🔒', title: 'Secure Deposits',   desc: 'Stripe-powered payments protect both lenders and borrowers on every transaction.' },
  { emoji: '⭐', title: 'Verified Reviews',   desc: 'A two-way review system builds trust so you always know who you\'re dealing with.' },
  { emoji: '💬', title: 'Real-time Chat',     desc: 'Message lenders and borrowers instantly before and during a rental.' },
  { emoji: '📍', title: 'Local Discovery',    desc: 'Find items near you on an interactive map. No shipping, no waiting.' },
  { emoji: '📱', title: 'Mobile Friendly',    desc: 'Fully responsive design — manage your listings from any device, anywhere.' },
  { emoji: '🌱', title: 'Eco Impact',         desc: 'Every borrow reduces manufacturing demand. Track your positive environmental footprint.' },
];

const stats = [
  { value: '500+',   label: 'Items Listed' },
  { value: '200+',   label: 'Active Lenders' },
  { value: '1,200+', label: 'Happy Borrowers' },
  { value: '12',     label: 'Cities' },
];

// ── Reusable section header ────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <motion.div variants={fadeUp} className="text-center mb-12 md:mb-16">
      {eyebrow && (
        <p className="text-primary font-semibold text-xs uppercase tracking-widest mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl sm:text-4xl font-bold mb-3">{title}</h2>
      <div className="w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto" />
      {subtitle && (
        <p className="text-base-content/55 mt-4 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

// ── Animated section wrapper — triggers animation when scrolled into view ──
function AnimatedSection({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ── Star row ───────────────────────────────────────────────────────────────
function StarRow({ count = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-warning text-sm">★</span>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function Home() {
  const { isAuthenticated } = useAuth();
  const [featuredItems, setFeaturedItems] = useState([]);
  const heroRef = useRef(null);

  useEffect(() => {
    api.get('/items', { params: { limit: 3 } })
      .then((res) => setFeaturedItems((res.data || []).slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden min-h-[92vh] flex items-center px-4 py-28"
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: `
              radial-gradient(ellipse 70% 55% at 15% 25%, color-mix(in oklch, var(--color-primary) 18%, transparent), transparent),
              radial-gradient(ellipse 55% 45% at 85% 75%, color-mix(in oklch, var(--color-secondary) 14%, transparent), transparent),
              var(--color-base-100)
            `,
          }}
        />

        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(var(--color-base-content) 1px, transparent 1px), linear-gradient(90deg, var(--color-base-content) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="max-w-5xl mx-auto w-full text-center">
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-5 py-2 text-sm font-semibold border border-primary/20 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
              Peer-to-peer lending for your neighborhood
            </span>
          </motion.div>

          {/* Headline — each line staggers in */}
          <div className="space-y-1 mb-8">
            {[
              { text: 'Why buy', gradient: false },
              { text: 'when you can', gradient: false },
              { text: 'borrow?', gradient: true },
            ].map((line, i) => (
              <motion.h1
                key={line.text}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className={`block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-[1.05] tracking-tight ${
                  line.gradient ? 'brand-gradient-text' : 'text-base-content'
                }`}
              >
                {line.text}
              </motion.h1>
            ))}
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.58 }}
            className="text-base-content/55 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-10"
          >
            Borrow what you need from neighbors. Lend what you don't use and earn.
            No middlemen, no waste — just community.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <motion.div whileTap={tapPress} whileHover={{ scale: 1.03 }}>
              <Link
                to="/browse"
                className="btn btn-primary btn-lg rounded-full px-10 shadow-xl shadow-primary/25 text-base"
              >
                Browse Items
              </Link>
            </motion.div>
            <motion.div whileTap={tapPress} whileHover={{ scale: 1.03 }}>
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="btn btn-outline btn-lg rounded-full px-10 text-base"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Start for Free'}
              </Link>
            </motion.div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.85 }}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            <div className="flex items-center gap-2 text-sm text-base-content/50">
              <div className="flex -space-x-2">
                {['🧑', '👩', '👨', '🧑‍💼', '👩‍🔧'].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-primary/10 border-2 border-base-100 flex items-center justify-center text-sm">
                    {e}
                  </div>
                ))}
              </div>
              <span><strong className="text-base-content">1,200+</strong> happy members</span>
            </div>
            <div className="w-px h-5 bg-base-300 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-sm text-base-content/50">
              <span className="text-warning">★★★★★</span>
              <span><strong className="text-base-content">4.9</strong> avg. rating</span>
            </div>
            <div className="w-px h-5 bg-base-300 hidden sm:block" />
            <div className="text-sm text-base-content/50">
              <strong className="text-base-content">500+</strong> items available now
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-base-content/30"
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-px h-8 bg-gradient-to-b from-base-content/30 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <AnimatedSection
        className="py-10 px-4"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} variants={staggerItem} className="text-white">
                <div className="text-3xl sm:text-4xl font-extrabold">{stat.value}</div>
                <div className="text-white/70 text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <AnimatedSection className="bg-base-100 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader eyebrow="Simple Process" title="How ShareStuff Works" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {steps.map((step, idx) => (
              <motion.div
                key={step.num}
                variants={staggerItem}
                className="relative"
              >
                <div className="bg-base-100 border border-base-300/60 rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-shadow duration-300 h-full">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl mx-auto mb-5">
                    {step.emoji}
                  </div>
                  <div className="badge badge-primary badge-sm mb-3">Step {step.num}</div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-base-content/60 text-sm leading-relaxed">{step.description}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 z-10 w-6 h-6 items-center justify-center text-base-content/25 text-lg">
                    →
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── CATEGORIES ────────────────────────────────────────────────────── */}
      <AnimatedSection className="bg-base-200 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader eyebrow="What's Available" title="Browse by Category" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <motion.div key={cat.name} variants={staggerItem}>
                <motion.div whileTap={tapPress} whileHover={{ scale: 1.05 }}>
                  <Link
                    to={`/browse?category=${cat.name}`}
                    className="block bg-base-100 rounded-2xl p-4 text-center border border-base-300/60 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-200">
                      {cat.emoji}
                    </div>
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors duration-150">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-base-content/50 mt-0.5">{cat.count} items</p>
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── WHY SHARESTUFF ────────────────────────────────────────────────── */}
      <AnimatedSection className="bg-base-100 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            eyebrow="Why Us"
            title="Everything you need to share safely"
            subtitle="We've built every feature with trust, safety, and simplicity in mind."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyUs.map((item) => (
              <motion.div
                key={item.title}
                variants={staggerItem}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="flex gap-4 p-5 rounded-2xl bg-base-200 border border-base-300/60 hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                  {item.emoji}
                </div>
                <div>
                  <h3 className="font-bold mb-1 text-sm">{item.title}</h3>
                  <p className="text-sm text-base-content/60 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── FEATURED ITEMS ────────────────────────────────────────────────── */}
      {featuredItems.length > 0 && (
        <AnimatedSection className="bg-base-200 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div variants={fadeUp} className="flex items-center justify-between mb-10">
              <div>
                <p className="text-primary font-semibold text-xs uppercase tracking-widest mb-1">Fresh Listings</p>
                <h2 className="text-3xl sm:text-4xl font-bold">Recently Listed</h2>
                <div className="w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mt-2" />
              </div>
              <motion.div whileTap={tapPress}>
                <Link to="/browse" className="btn btn-outline btn-sm rounded-full">
                  View All →
                </Link>
              </motion.div>
            </motion.div>

            {/* Stagger grid */}
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {featuredItems.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </motion.div>
          </div>
        </AnimatedSection>
      )}

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <AnimatedSection className="bg-base-100 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader eyebrow="Community Love" title="What our members say" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={staggerItem}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-base-200 border border-base-300/60 rounded-2xl p-6 space-y-4 hover:shadow-lg transition-shadow duration-300"
              >
                <StarRow count={t.rating} />
                <p className="text-base-content/70 text-sm leading-relaxed italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-base-300/60">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                    {t.emoji}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-base-content/50">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── MAP SECTION ───────────────────────────────────────────────────── */}
      <AnimatedSection className="bg-base-200 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            eyebrow="Explore"
            title="Items Near You"
            subtitle="Explore items available to borrow across the community. Click any pin to see details."
          />
          <motion.div variants={fadeUp}>
            <Suspense
              fallback={
                <div className="w-full rounded-2xl bg-base-300 flex items-center justify-center gap-3" style={{ height: 480 }}>
                  <span className="loading loading-spinner loading-lg text-primary" />
                  <span className="text-base-content/60">Loading map…</span>
                </div>
              }
            >
              <ItemMap />
            </Suspense>
            <p className="text-center text-xs text-base-content/40 mt-3">
              Map data ©{' '}
              <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">
                OpenStreetMap
              </a>{' '}
              contributors
            </p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl overflow-hidden relative"
            style={{
              background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary) 55%, var(--color-accent))`,
            }}
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-1/2 translate-x-1/4 bg-white" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 translate-y-1/2 -translate-x-1/4 bg-white" />

            <div className="relative z-10 py-16 px-8 text-center text-white space-y-5">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">
                Ready to start sharing?
              </h2>
              <p className="text-white/80 text-base sm:text-lg max-w-md mx-auto">
                Join thousands of neighbors already saving money and reducing waste together.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <motion.div whileTap={tapPress} whileHover={{ scale: 1.03 }}>
                  <Link
                    to={isAuthenticated ? '/dashboard' : '/register'}
                    className="btn btn-lg rounded-full bg-white text-primary hover:bg-white/90 border-0 shadow-lg font-bold"
                  >
                    {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
                  </Link>
                </motion.div>
                <motion.div whileTap={tapPress} whileHover={{ scale: 1.03 }}>
                  <Link
                    to="/browse"
                    className="btn btn-lg rounded-full bg-white/10 text-white border border-white/30 hover:bg-white/20"
                  >
                    Browse Items
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-base-200 py-12 px-4 border-t border-base-300/60 mt-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🔄</span>
                <span className="brand-gradient-text font-extrabold text-xl">ShareStuff</span>
              </div>
              <p className="text-base-content/60 text-sm leading-relaxed">
                A peer-to-peer lending platform that brings communities together through the power of sharing.
              </p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">Quick Links</p>
              <ul className="space-y-2 text-sm text-base-content/60">
                {[
                  { to: '/browse', label: 'Browse Items' },
                  { to: '/about', label: 'About Us' },
                  { to: '/contact', label: 'Contact' },
                  { to: '/register', label: 'Get Started' },
                ].map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="hover:text-primary transition-colors duration-150">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">Contact</p>
              <ul className="space-y-2 text-sm text-base-content/60">
                <li>📧 hello@sharestuff.app</li>
                <li>📞 +880 1700-000000</li>
                <li>📍 Gulshan-2, Dhaka 1212</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-base-300/60 pt-6 text-center">
            <p className="text-xs text-base-content/40">
              © 2025 ShareStuff. All rights reserved. Built with ❤️ for communities.
            </p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
