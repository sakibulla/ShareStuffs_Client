import { motion } from 'framer-motion';

/**
 * A single skeleton card that mimics the ItemCard layout.
 * Uses the CSS shimmer animation defined in index.css.
 */
function SkeletonCard() {
  return (
    <div className="bg-base-100 border border-base-300/60 rounded-2xl overflow-hidden shadow-sm">
      {/* Image placeholder */}
      <div className="h-48 skeleton-shimmer" />

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 rounded-full skeleton-shimmer w-3/4" />
          <div className="h-3 rounded-full skeleton-shimmer w-1/2" />
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <div className="h-6 rounded-full skeleton-shimmer w-20" />
            <div className="h-3 rounded-full skeleton-shimmer w-16" />
          </div>
        </div>

        {/* Owner */}
        <div className="flex items-center gap-2 pt-2 border-t border-base-300/50">
          <div className="w-6 h-6 rounded-full skeleton-shimmer flex-shrink-0" />
          <div className="h-3 rounded-full skeleton-shimmer w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * LoadingSkeleton — renders `count` skeleton cards in a staggered fade-in.
 */
export default function LoadingSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3, ease: 'easeOut' }}
        >
          <SkeletonCard />
        </motion.div>
      ))}
    </div>
  );
}
