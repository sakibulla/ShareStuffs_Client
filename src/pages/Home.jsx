import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import api from '../utils/api';

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
      {/* Hero Section */}
      <section className="min-h-screen hero-surface flex items-center px-4 py-20">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="space-y-6">
            <span className="inline-block bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-medium border border-primary/15">
              🌱 Sustainable Sharing Community
            </span>
            <h1 className="text-5xl lg:text-6xl leading-tight">
              Borrow from neighbors,{' '}
              <span className="font-extrabold text-primary">Lend what you don't use</span>
            </h1>
            <p className="text-base-content/60 text-lg max-w-md">
              Join a community of sharing. Save money, reduce waste, and make new connections right in your neighborhood.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/browse" className="btn btn-primary btn-lg rounded-full transition-all duration-200 active:scale-95">
                Browse Items
              </Link>
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="btn btn-outline btn-lg rounded-full transition-all duration-200 active:scale-95"
              >
                List an Item
              </Link>
            </div>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 pt-2">
              {[
                { icon: '📦', label: '500+ Items' },
                { icon: '👥', label: '200+ Lenders' },
                { icon: '🔒', label: '100% Secure' },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-1.5 text-sm text-base-content/60">
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Floating card mockup */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="card bg-base-100 shadow-2xl border border-base-300 w-72 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="h-44 item-placeholder flex items-center justify-center text-6xl rounded-t-xl">
                🔧
              </div>
              <div className="card-body p-4">
                <h3 className="font-semibold">Power Drill Set</h3>
                <p className="text-xs text-base-content/60">📍 Dhaka, Gulshan</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-primary font-bold">৳150<span className="text-xs text-base-content/50">/day</span></span>
                  <span className="badge badge-success badge-sm">Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-neutral text-neutral-content py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="stats stats-vertical sm:stats-horizontal w-full bg-transparent shadow-none">
            {[
              { title: 'Total Items', value: '500+', desc: 'Listed and available' },
              { title: 'Active Lenders', value: '200+', desc: 'Trusted community members' },
              { title: 'Happy Borrowers', value: '1,200+', desc: 'Successful borrows' },
              { title: 'Cities', value: '12', desc: 'Across the country' },
            ].map((stat) => (
              <div key={stat.title} className="stat text-neutral-content">
                <div className="stat-title text-neutral-content/70">{stat.title}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-desc text-neutral-content/60">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-base-100 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
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

      {/* Categories */}
      <section className="bg-base-200 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
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

      {/* Featured Items */}
      {featuredItems.length > 0 && (
        <section className="bg-base-100 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-4xl font-bold">Recently Listed</h2>
                <div className="w-16 h-1 bg-primary rounded-full mt-2"></div>
              </div>
              <Link to="/browse" className="text-primary font-semibold hover:underline transition-all duration-200">
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

      {/* Footer */}
      <footer className="bg-base-200 py-10 px-4 border-t border-base-300">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <span>🔄</span>
            <span className="brand-gradient-text">ShareStuff</span>
          </div>
          <p className="text-base-content/60 text-sm">A peer-to-peer lending platform that brings communities together.</p>
          <p className="text-xs text-base-content/40 mt-4">© 2024 ShareStuff. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
