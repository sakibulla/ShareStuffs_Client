import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerItem } from '../utils/animations';

const categoryEmoji = {
  Tools: '🔧', Camping: '⛺', Party: '🎉',
  Kitchen: '🍳', Electronics: '📱', Sports: '⚽',
};

/**
 * ItemCard — animated listing card with hover lift + image zoom.
 * Uses staggerItem variant so parent staggerContainer drives the entrance.
 */
export default function ItemCard({ item }) {
  const imageUrl = item.images?.[0];
  const emoji = categoryEmoji[item.category] || '📦';
  const itemId = item._id || item.id;
  const ownerName = item.owner?.name || 'Unknown';
  const ownerAvatar = item.owner?.avatar;
  const ownerInitial = ownerName.charAt(0).toUpperCase();

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -5, transition: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] } }}
      className="group"
    >
      <Link
        to={`/items/${itemId}`}
        className="block bg-base-100 border border-base-300/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-base-content/8 transition-shadow duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-200"
        aria-label={`View details for ${item.title}`}
      >
        {/* ── Image ─────────────────────────────────────────────────────── */}
        <div className="relative h-48 overflow-hidden bg-base-200">
          {imageUrl ? (
            <motion.img
              src={imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Emoji fallback */}
          <div
            className={`w-full h-full item-placeholder items-center justify-center text-5xl ${imageUrl ? 'hidden' : 'flex'}`}
          >
            {emoji}
          </div>

          {/* Availability badge */}
          <div
            className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
              item.available
                ? 'bg-success/15 text-success border border-success/25'
                : 'bg-error/15 text-error border border-error/25'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                item.available ? 'bg-success animate-pulse' : 'bg-error'
              }`}
            />
            {item.available ? 'Available' : 'Unavailable'}
          </div>

          {/* Category badge */}
          <div className="absolute top-3 right-3 badge badge-primary badge-sm shadow-sm">
            {item.category}
          </div>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <div className="p-4 space-y-3">
          {/* Title + location */}
          <div>
            <h2 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors duration-150">
              {item.title}
            </h2>
            <p className="text-xs text-base-content/50 flex items-center gap-1 mt-0.5">
              <span>📍</span>
              <span className="truncate">{item.location || 'Location not set'}</span>
            </p>
          </div>

          {/* Price + CTA */}
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-primary font-bold text-xl">৳{item.dailyFee}</span>
                <span className="text-xs text-base-content/50">/day</span>
              </div>
              {item.deposit > 0 && (
                <p className="text-xs text-base-content/40">+ ৳{item.deposit} deposit</p>
              )}
            </div>
            <motion.span
              initial={{ opacity: 0, x: 4 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="btn btn-primary btn-xs rounded-full px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              View →
            </motion.span>
          </div>

          {/* Owner */}
          <div className="flex items-center gap-2 pt-2 border-t border-base-300/50">
            <div className="flex-shrink-0">
              {ownerAvatar ? (
                <img
                  src={ownerAvatar}
                  alt={ownerName}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                  <span className="text-xs font-bold">{ownerInitial}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-base-content/50 truncate">{ownerName}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
