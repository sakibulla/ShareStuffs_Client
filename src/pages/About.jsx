import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { pageTransition, staggerContainer, staggerItem, fadeUp, tapPress } from '../utils/animations';

const team = [
  { name: 'Aryan Hossain',  role: 'Co-Founder & CEO',    emoji: '👨‍💼', bio: 'Passionate about building sustainable communities through technology.' },
  { name: 'Nadia Islam',    role: 'Co-Founder & CTO',    emoji: '👩‍💻', bio: 'Full-stack engineer with a love for clean, accessible product design.' },
  { name: 'Rafiq Ahmed',    role: 'Head of Community',   emoji: '🤝',  bio: 'Connects lenders and borrowers, ensuring every interaction is trustworthy.' },
  { name: 'Sadia Karim',    role: 'Product Designer',    emoji: '🎨',  bio: 'Crafts intuitive experiences that make sharing feel effortless.' },
];

const values = [
  { emoji: '🌱', title: 'Sustainability', desc: 'Every borrowed item is one less thing manufactured. Sharing is the most sustainable form of consumption.' },
  { emoji: '🤝', title: 'Community',      desc: 'We connect neighbors, build trust, and turn strangers into a network of people who look out for each other.' },
  { emoji: '🔒', title: 'Trust & Safety', desc: 'Verified profiles, secure payments, and a review system ensure every transaction is safe for both sides.' },
  { emoji: '💡', title: 'Accessibility',  desc: "Expensive tools and equipment shouldn't be out of reach. We make access affordable for everyone." },
];

const milestones = [
  { year: '2022', event: 'ShareStuff founded in Dhaka with a vision to reduce waste through peer-to-peer lending.' },
  { year: '2023', event: 'Reached 100 active lenders and launched secure Stripe-powered deposit payments.' },
  { year: '2024', event: 'Expanded to 12 cities, added real-time messaging, and crossed 1,200 successful borrows.' },
  { year: '2025', event: 'Launched mobile-optimised experience and introduced category-based discovery.' },
];

const stats = [
  { value: '500+',   label: 'Items Listed',        desc: 'And growing every day' },
  { value: '200+',   label: 'Active Lenders',      desc: 'Trusted community members' },
  { value: '1,200+', label: 'Successful Borrows',  desc: 'Happy transactions' },
  { value: '12',     label: 'Cities Covered',      desc: 'Across the country' },
];

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

export default function About() {
  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit">

      {/* Hero */}
      <section className="hero-surface py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-block bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold border border-primary/20 mb-6"
          >
            🌍 Our Story
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5"
          >
            We believe in the power of{' '}
            <span className="brand-gradient-text">sharing</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="text-base-content/60 text-lg max-w-2xl mx-auto mb-8"
          >
            ShareStuff was born from a simple idea — most things we own sit unused 90% of the time.
            What if your neighbors could use them instead?
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <motion.div whileTap={tapPress}><Link to="/browse" className="btn btn-primary btn-lg rounded-full px-8">Start Browsing</Link></motion.div>
            <motion.div whileTap={tapPress}><Link to="/contact" className="btn btn-outline btn-lg rounded-full px-8">Get in Touch</Link></motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <AnimatedSection className="py-10 px-4" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <motion.div key={s.label} variants={staggerItem} className="text-white">
              <div className="text-3xl sm:text-4xl font-extrabold">{s.value}</div>
              <div className="text-white/80 text-sm font-medium mt-1">{s.label}</div>
              <div className="text-white/55 text-xs mt-0.5">{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* Mission */}
      <AnimatedSection className="bg-base-100 py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={staggerItem} className="space-y-5">
            <p className="text-primary font-semibold text-xs uppercase tracking-widest">Our Mission</p>
            <h2 className="text-3xl sm:text-4xl font-bold leading-snug">Reduce waste. Build community. Save money.</h2>
            <p className="text-base-content/60 leading-relaxed text-sm">
              The average power drill is used for just 12–15 minutes in its entire lifetime. Yet millions of drills sit in garages
              collecting dust while neighbors buy new ones. ShareStuff flips that model — turning idle assets into shared resources
              that benefit everyone.
            </p>
            <p className="text-base-content/60 leading-relaxed text-sm">
              We're not just a rental platform. We're a movement toward a circular economy where access matters more than ownership.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 gap-4">
            {values.map((v) => (
              <motion.div
                key={v.title}
                variants={staggerItem}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-base-200 border border-base-300/60 rounded-2xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{v.emoji}</div>
                <h3 className="font-bold mb-1 text-sm">{v.title}</h3>
                <p className="text-xs text-base-content/60 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Timeline */}
      <AnimatedSection className="bg-base-200 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Our Journey</h2>
            <div className="w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto" />
          </motion.div>
          <div className="space-y-6">
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                variants={staggerItem}
                className="flex gap-5 items-start"
              >
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  {i < milestones.length - 1 && <div className="w-0.5 h-10 bg-primary/20 mt-1" />}
                </div>
                <div className="pb-6">
                  <p className="text-primary font-bold text-sm mb-1">{m.year}</p>
                  <p className="text-base-content/65 text-sm leading-relaxed">{m.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Team */}
      <AnimatedSection className="bg-base-100 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Meet the Team</h2>
            <div className="w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-4" />
            <p className="text-base-content/55 max-w-md mx-auto text-sm">A small, passionate team on a mission to make sharing the default.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <motion.div
                key={member.name}
                variants={staggerItem}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-base-200 border border-base-300/60 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl mx-auto mb-4 border-2 border-primary/15">
                  {member.emoji}
                </div>
                <h3 className="font-bold">{member.name}</h3>
                <p className="text-primary text-xs font-semibold mt-1 mb-2">{member.role}</p>
                <p className="text-base-content/55 text-xs leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center space-y-6"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to join the community?</h2>
          <p className="text-white/75 text-base">Start lending what you don't use, or borrow what you need — it only takes a minute.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.div whileTap={tapPress}>
              <Link to="/register" className="btn btn-lg rounded-full font-bold bg-white text-primary border-0 shadow-lg">Get Started Free</Link>
            </motion.div>
            <motion.div whileTap={tapPress}>
              <Link to="/browse" className="btn btn-lg rounded-full bg-white/15 text-white border border-white/30 hover:bg-white/25">Browse Items</Link>
            </motion.div>
          </div>
        </motion.div>
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
