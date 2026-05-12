import { Link } from 'react-router-dom';

const team = [
  { name: 'Aryan Hossain', role: 'Co-Founder & CEO', emoji: '👨‍💼', bio: 'Passionate about building sustainable communities through technology.' },
  { name: 'Nadia Islam', role: 'Co-Founder & CTO', emoji: '👩‍💻', bio: 'Full-stack engineer with a love for clean, accessible product design.' },
  { name: 'Rafiq Ahmed', role: 'Head of Community', emoji: '🤝', bio: 'Connects lenders and borrowers, ensuring every interaction is trustworthy.' },
  { name: 'Sadia Karim', role: 'Product Designer', emoji: '🎨', bio: 'Crafts intuitive experiences that make sharing feel effortless.' },
];

const values = [
  { emoji: '🌱', title: 'Sustainability', desc: 'Every borrowed item is one less thing manufactured. We believe sharing is the most sustainable form of consumption.' },
  { emoji: '🤝', title: 'Community', desc: 'We connect neighbors, build trust, and turn strangers into a network of people who look out for each other.' },
  { emoji: '🔒', title: 'Trust & Safety', desc: 'Verified profiles, secure payments, and a review system ensure every transaction is safe for both sides.' },
  { emoji: '💡', title: 'Accessibility', desc: 'Expensive tools and equipment shouldn\'t be out of reach. We make access affordable for everyone.' },
];

const milestones = [
  { year: '2022', event: 'ShareStuff founded in Dhaka with a vision to reduce waste through peer-to-peer lending.' },
  { year: '2023', event: 'Reached 100 active lenders and launched secure Stripe-powered deposit payments.' },
  { year: '2024', event: 'Expanded to 12 cities, added real-time messaging, and crossed 1,200 successful borrows.' },
  { year: '2025', event: 'Launched mobile-optimised experience and introduced category-based discovery.' },
];

export default function About() {
  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="hero-surface py-24 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-block bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-medium border border-primary/15">
            🌍 Our Story
          </span>
          <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
            We believe in the power of{' '}
            <span className="brand-gradient-text">sharing</span>
          </h1>
          <p className="text-base-content/60 text-lg max-w-2xl mx-auto">
            ShareStuff was born from a simple idea — most things we own sit unused 90% of the time.
            What if your neighbors could use them instead?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/browse" className="btn btn-primary btn-lg rounded-full">
              Start Browsing
            </Link>
            <Link to="/contact" className="btn btn-outline btn-lg rounded-full">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4" style={{
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
      }}>
        <div className="max-w-5xl mx-auto">
          <div className="stats stats-vertical sm:stats-horizontal w-full bg-transparent shadow-none">
            {[
              { title: 'Items Listed', value: '500+', desc: 'And growing every day' },
              { title: 'Active Lenders', value: '200+', desc: 'Trusted community members' },
              { title: 'Successful Borrows', value: '1,200+', desc: 'Happy transactions' },
              { title: 'Cities Covered', value: '12', desc: 'Across the country' },
            ].map((s) => (
              <div key={s.title} className="stat" style={{ color: 'white' }}>
                <div className="stat-title" style={{ color: 'rgba(255,255,255,0.7)' }}>{s.title}</div>
                <div className="stat-value" style={{ color: 'white' }}>{s.value}</div>
                <div className="stat-desc" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-base-100 py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Mission</span>
            <h2 className="text-4xl font-bold leading-snug">
              Reduce waste. Build community. Save money.
            </h2>
            <p className="text-base-content/60 leading-relaxed">
              The average power drill is used for just 12–15 minutes in its entire lifetime. Yet millions of drills sit in garages
              collecting dust while neighbors buy new ones. ShareStuff flips that model — turning idle assets into shared resources
              that benefit everyone.
            </p>
            <p className="text-base-content/60 leading-relaxed">
              We're not just a rental platform. We're a movement toward a circular economy where access matters more than ownership.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {values.map((v) => (
              <div key={v.title} className="card bg-base-200 border border-base-300 p-5 hover:shadow-md hover:scale-105 transition-all duration-200">
                <div className="text-3xl mb-3">{v.emoji}</div>
                <h3 className="font-bold mb-1">{v.title}</h3>
                <p className="text-xs text-base-content/60 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-base-200 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-3">Our Journey</h2>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto"></div>
          </div>
          <ul className="timeline timeline-snap-icon timeline-compact timeline-vertical">
            {milestones.map((m, i) => (
              <li key={m.year}>
                {i > 0 && <hr className="bg-primary/30" />}
                <div className="timeline-middle">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content text-xs font-bold">
                    {i + 1}
                  </div>
                </div>
                <div className={`${i % 2 === 0 ? 'timeline-start md:text-end' : 'timeline-end'} mb-10`}>
                  <time className="font-mono text-sm text-primary font-bold">{m.year}</time>
                  <p className="text-base-content/70 text-sm mt-1 max-w-xs">{m.event}</p>
                </div>
                {i < milestones.length - 1 && <hr className="bg-primary/30" />}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Team */}
      <section className="bg-base-100 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-3">Meet the Team</h2>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto mb-4"></div>
            <p className="text-base-content/60 max-w-md mx-auto">
              A small, passionate team on a mission to make sharing the default.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="card bg-base-200 border border-base-300 text-center hover:shadow-lg hover:scale-105 transition-all duration-200">
                <div className="card-body p-6 items-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl mb-3 border-2 border-primary/20">
                    {member.emoji}
                  </div>
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-primary text-xs font-semibold mb-2">{member.role}</p>
                  <p className="text-base-content/60 text-xs leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4" style={{
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
      }}>
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold" style={{ color: 'white' }}>Ready to join the community?</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)' }} className="text-lg">
            Start lending what you don't use, or borrow what you need — it only takes a minute.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn btn-lg rounded-full font-bold transition-all duration-200 active:scale-95"
              style={{ background: 'white', color: 'var(--color-primary)', border: 'none' }}>
              Get Started Free
            </Link>
            <Link to="/browse" className="btn btn-lg rounded-full transition-all duration-200 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
              Browse Items
            </Link>
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
