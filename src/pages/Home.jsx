import { Link } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import api from '../utils/api';

const ItemMap = lazy(() => import('../components/ItemMap'));

const categories = [
  { name: 'Tools', emoji: '🔧', count: '120+' },
  { name: 'Camping', emoji: '⛺', count: '85+' },
  { name: 'Party', emoji: '🎉', count: '60+' },
  { name: 'Kitchen', emoji: '🍳', count: '95+' },
  { name: 'Electronics', emoji: '📱', count: '110+' },
  { name: 'Sports', emoji: '⚽', count: '75+' },
];

const steps = [
  { num: 1, emoji: '📸', title: 'List Your Item', description: 'Take a photo and describe what you want to lend. Set your daily fee and deposit.' },
  { num: 2, emoji: '🔍', title: 'Browse & Request', description: 'Find what you need nearby. Send a borrow request with your preferred dates.' },
  { num: 3, emoji: '🤝', title: 'Connect & Share', description: 'Meet your neighbor, exchange the item, and build community trust.' },
];

const testimonials = [
  {
    name: 'Tanvir Rahman',
    role: 'Borrower · Dhaka',
    emoji: '👨‍🔧',
    quote: 'I needed a power drill for one afternoon. Instead of buying one for ৳3,000, I borrowed it for ৳150. ShareStuff is a no-brainer.',
    rating: 5,
  },
  {
    name: 'Sumaiya Akter',
    role: 'Lender · Chittagong',
    emoji: '👩‍🍳',
    quote: 'My stand mixer was sitting unused for months. Now it earns me ৳500 a week. The deposit system makes me feel completely safe.',
    rating: 5,
  },
  {
    name: 'Mehedi Hasan',
    role: 'Borrower & Lender · Sylhet',
    emoji: '🧑‍💼',
    quote: 'I borrow camping gear every summer and lend my projector year-round. The messaging feature makes coordination super easy.',
    rating: 5,
  },
];

const whyUs = [
  { emoji: '🔒', title: 'Secure Deposits', desc: 'Stripe-powered payments protect both lenders and borrowers on every transaction.' },
  { emoji: '⭐', title: 'Verified Reviews', desc: 'A two-way review system builds trust so you always know who you\'re dealing with.' },
  { emoji: '💬', title: 'Real-time Chat', desc: 'Message lenders and borrowers instantly before and during a rental.' },
  { emoji: '📍', title: 'Local Discovery', desc: 'Find items near you on an interactive map. No shipping, no waiting.' },
  { emoji: '📱', title: 'Mobile Friendly', desc: 'Fully responsive design — manage your listings from any device, anywhere.' },
  { emoji: '🌱', title: 'Eco Impact', desc: 'Every borrow reduces manufacturing demand. Track your positive environmental footprint.' },
];

function StarRow({ count = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-warning text-sm">★</span>
      ))}
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [featuredItems, setFeaturedItems] = useState([]);

  useEffect(() => {
    api.get('/items', { params: { limit: 3 } })
      .then((res) => setFeaturedItems((res.data || []).slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div className="fade-in">

      {/* ── HERO BANNER ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center px-4 py-28">
        {/* Background */}
        <div className="absolute inset-0 -z-10" style={{
          background: `
            radial-gradient(ellipse 70% 55% at 15% 25%, color-mix(in oklch, var(--color-primary) 20%, transparent), transparent),
            radial-gradient(ellipse 55% 45% at 85% 75%, color-mix(in oklch, var(--color-secondary) 16%, transparent), transparent),
            var(--color-base-100)
          `,
        }} />

        {/* Soft glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-[120px] opacity-20 -z-10 pointer-events-none"
          style={{ background: 'var(--color-primary)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-[100px] opacity-15 -z-10 pointer-events-none"
          style={{ background: 'var(--color-secondary)' }} />

        {/* Grid texture overlay */}
        <div className="absolute inset-0 -z-10 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(var(--color-base-content) 1px, transparent 1px), linear-gradient(90deg, var(--color-base-content) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }} />

        <div className="max-w-5xl mx-auto w-full text-center space-y-8">
          {/* Pill badge */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-5 py-2 text-sm font-semibold border border-primary/20 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
              Peer-to-peer lending for your neighborhood
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold leading-[1.05] tracking-tight">
            <span className="block text-base-content">Share more.</span>
            <span className="block brand-gradient-text">Own less.</span>
            <span className="block text-base-content">Live better.</span>
          </h1>

          {/* Sub */}
          <p className="text-base-content/55 text-xl max-w-xl mx-auto leading-relaxed">
            Borrow what you need from neighbors. Lend what you don't use and earn.
            No middlemen, no waste — just community.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              to="/browse"
              className="btn btn-primary btn-lg rounded-full px-10 shadow-xl shadow-primary/30 transition-all duration-200 active:scale-95 text-base"
            >
              Browse Items
            </Link>
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="btn btn-outline btn-lg rounded-full px-10 transition-all duration-200 active:scale-95 text-base"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start for Free'}
            </Link>
          </div>

          {/* Social proof strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6">
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
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-base-content/30">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-base-content/30 to-transparent" />
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────────────────── */}
      <section className="py-8 px-4" style={{
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
      }}>
        <div className="max-w-5xl mx-auto">
          <div className="stats stats-vertical sm:stats-horizontal w-full bg-transparent shadow-none">
            {[
              { title: 'Total Items', value: '500+', desc: 'Listed and available' },
              { title: 'Active Lenders', value: '200+', desc: 'Trusted community members' },
              { title: 'Happy Borrowers', value: '1,200+', desc: 'Successful borrows' },
              { title: 'Cities', value: '12', desc: 'Across the country' },
            ].map((stat) => (
              <div key={stat.title} className="stat" style={{ color: 'white' }}>
                <div className="stat-title" style={{ color: 'rgba(255,255,255,0.7)' }}>{stat.title}</div>
                <div className="stat-value" style={{ color: 'white' }}>{stat.value}</div>
                <div className="stat-desc" style={{ color: 'rgba(255,255,255,0.6)' }}>{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-base-100 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Simple Process</p>
            <h2 className="text-4xl font-bold mb-3">How ShareStuff Works</h2>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {steps.map((step, idx) => (
              <div key={step.num} className="flex flex-col items-center text-center relative">
                <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 w-full p-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl mx-auto mb-4">
                    {step.emoji}
                  </div>
                  <div className="badge badge-primary badge-sm mb-3">Step {step.num}</div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-base-content/60 text-sm">{step.description}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 text-2xl text-base-content/30 z-10">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────────────────────────── */}
      <section className="bg-base-200 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">What's Available</p>
            <h2 className="text-4xl font-bold mb-3">Browse by Category</h2>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/browse?category=${cat.name}`}
                className="card bg-base-100 hover:bg-primary hover:text-primary-content cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                <div className="card-body items-center text-center p-4">
                  <div className="text-4xl mb-1">{cat.emoji}</div>
                  <h3 className="font-semibold text-sm">{cat.name}</h3>
                  <p className="text-xs opacity-60">{cat.count} items</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY SHARESTUFF ──────────────────────────────────────────────────── */}
      <section className="bg-base-100 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Why Us</p>
            <h2 className="text-4xl font-bold mb-3">Everything you need to share safely</h2>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto mb-4"></div>
            <p className="text-base-content/60 max-w-md mx-auto">
              We've built every feature with trust, safety, and simplicity in mind.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyUs.map((item) => (
              <div key={item.title} className="flex gap-4 p-5 rounded-2xl bg-base-200 border border-base-300 hover:shadow-md hover:scale-[1.02] transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                  {item.emoji}
                </div>
                <div>
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-base-content/60 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ITEMS ──────────────────────────────────────────────────── */}
      {featuredItems.length > 0 && (
        <section className="bg-base-200 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-1">Fresh Listings</p>
                <h2 className="text-4xl font-bold">Recently Listed</h2>
                <div className="w-16 h-1 bg-primary rounded-full mt-2"></div>
              </div>
              <Link to="/browse" className="btn btn-outline btn-sm rounded-full transition-all duration-200">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
      <section className="bg-base-100 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Community Love</p>
            <h2 className="text-4xl font-bold mb-3">What our members say</h2>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card bg-base-200 border border-base-300 hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                <div className="card-body p-6 space-y-4">
                  <StarRow count={t.rating} />
                  <p className="text-base-content/70 text-sm leading-relaxed italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-base-300">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                      {t.emoji}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-base-content/50">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAP SECTION ─────────────────────────────────────────────────────── */}
      <section className="bg-base-200 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Explore</p>
            <h2 className="text-4xl font-bold mb-3">Items Near You</h2>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto mb-4"></div>
            <p className="text-base-content/60 max-w-md mx-auto">
              Explore items available to borrow across the community. Click any pin to see details.
            </p>
          </div>
          <Suspense
            fallback={
              <div className="w-full rounded-2xl bg-base-300 flex items-center justify-center gap-3" style={{ height: 480 }}>
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <span className="text-base-content/60">Loading map…</span>
              </div>
            }
          >
            <ItemMap />
          </Suspense>
          <p className="text-center text-xs text-base-content/40 mt-3">
            Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">OpenStreetMap</a> contributors
          </p>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────────── */}
      <section className="px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl overflow-hidden relative"
            style={{
              background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary) 55%, var(--color-accent))`,
            }}
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-1/2 translate-x-1/4"
              style={{ background: 'white' }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 translate-y-1/2 -translate-x-1/4"
              style={{ background: 'white' }} />

            <div className="relative z-10 py-16 px-8 text-center text-white space-y-5">
              <h2 className="text-4xl lg:text-5xl font-extrabold">
                Ready to start sharing?
              </h2>
              <p className="text-white/80 text-lg max-w-md mx-auto">
                Join thousands of neighbors already saving money and reducing waste together.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link
                  to={isAuthenticated ? '/dashboard' : '/register'}
                  className="btn btn-lg rounded-full bg-white text-primary hover:bg-white/90 border-0 shadow-lg font-bold transition-all duration-200 active:scale-95"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
                </Link>
                <Link
                  to="/browse"
                  className="btn btn-lg rounded-full bg-white/10 text-white border border-white/30 hover:bg-white/20 transition-all duration-200 active:scale-95"
                >
                  Browse Items
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-base-200 py-12 px-4 border-t border-base-300 mt-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="text-xl font-bold flex items-center gap-2 mb-3">
                <span>🔄</span>
                <span className="brand-gradient-text">ShareStuff</span>
              </div>
              <p className="text-base-content/60 text-sm leading-relaxed">
                A peer-to-peer lending platform that brings communities together through the power of sharing.
              </p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">Quick Links</p>
              <ul className="space-y-2 text-sm text-base-content/60">
                <li><Link to="/browse" className="hover:text-primary transition-colors">Browse Items</Link></li>
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">Get Started</Link></li>
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
          <div className="border-t border-base-300 pt-6 text-center">
            <p className="text-xs text-base-content/40">© 2025 ShareStuff. All rights reserved. Built with ❤️ for communities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
