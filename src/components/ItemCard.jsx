import { Link } from 'react-router-dom';

const categoryEmoji = {
  Tools: '🔧', Camping: '⛺', Party: '🎉',
  Kitchen: '🍳', Electronics: '📱', Sports: '⚽',
};

export default function ItemCard({ item }) {
  const imageUrl = item.images?.[0];
  const emoji = categoryEmoji[item.category] || '📦';
  const itemId = item._id || item.id;
  const ownerName = item.owner?.name || 'Unknown';
  const ownerAvatar = item.owner?.avatar;
  const ownerInitial = ownerName.charAt(0).toUpperCase();

  return (
    <Link
      to={`/items/${itemId}`}
      className="card bg-base-100 border border-base-300/70 shadow-sm card-hover overflow-hidden group text-base-content no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-200 rounded-2xl"
      aria-label={`View details for ${item.title}`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden rounded-t-2xl">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className={`w-full h-full item-placeholder flex items-center justify-center text-5xl ${imageUrl ? 'hidden' : 'flex'}`}>
          {emoji}
        </div>

        {/* Availability dot */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
          item.available
            ? 'bg-success/20 text-success border border-success/30'
            : 'bg-error/20 text-error border border-error/30'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${item.available ? 'bg-success' : 'bg-error'}`} />
          {item.available ? 'Available' : 'Unavailable'}
        </div>

        {/* Category badge */}
        <div className="absolute top-3 right-3 badge badge-primary badge-sm shadow-sm">
          {item.category}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div>
          <h2 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors duration-150">
            {item.title}
          </h2>
          <p className="text-xs text-base-content/50 flex items-center gap-1 mt-0.5">
            <span>📍</span> {item.location || 'Location not set'}
          </p>
        </div>

        {/* Price */}
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
          <span className="btn btn-primary btn-xs rounded-full px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            View →
          </span>
        </div>

        {/* Owner */}
        <div className="flex items-center gap-2 pt-2 border-t border-base-300/50">
          <div className={`avatar flex-shrink-0 ${ownerAvatar ? '' : 'placeholder'}`}>
            {ownerAvatar ? (
              <div className="w-6 rounded-full">
                <img src={ownerAvatar} alt={ownerName} />
              </div>
            ) : (
              <div className="bg-primary/15 text-primary rounded-full w-6">
                <span className="text-xs font-bold">{ownerInitial}</span>
              </div>
            )}
          </div>
          <span className="text-xs text-base-content/50 truncate">{ownerName}</span>
        </div>
      </div>
    </Link>
  );
}
