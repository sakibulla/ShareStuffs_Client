import { Link } from 'react-router-dom';

const categoryEmoji = {
  Tools: '🔧',
  Camping: '⛺',
  Party: '🎉',
  Kitchen: '🍳',
  Electronics: '📱',
  Sports: '⚽',
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
      className="card bg-base-100 border border-base-300 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group text-base-content no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-200"
      aria-label={`View details for ${item.title}`}
    >
      {/* Image area */}
      <div className="relative h-48 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div
          className={`w-full h-full item-placeholder flex items-center justify-center text-5xl ${imageUrl ? 'hidden' : 'flex'}`}
        >
          {emoji}
        </div>
        {/* Category badge */}
        <div className="badge badge-primary absolute top-2 right-2 shadow-sm">
          {item.category}
        </div>
      </div>

      {/* Card body */}
      <div className="card-body p-4">
        <h2 className="font-semibold text-base line-clamp-1 transition-colors group-hover:text-primary">{item.title}</h2>
        <p className="text-xs text-base-content/60 flex items-center gap-1">
          <span>📍</span> {item.location || 'Location not set'}
        </p>

        {/* Pricing */}
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-primary font-bold text-lg">৳{item.dailyFee}</span>
          <span className="text-sm text-base-content/60">/day</span>
        </div>
        <p className="text-xs text-base-content/50">Deposit: ৳{item.deposit}</p>

        <div className="divider my-1"></div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <div className={`avatar flex-shrink-0 ${ownerAvatar ? '' : 'placeholder'}`}>
              {ownerAvatar ? (
                <div className="w-7 rounded-full ring ring-primary/20 ring-offset-1 ring-offset-base-100">
                  <img src={ownerAvatar} alt={ownerName} />
                </div>
              ) : (
                <div className="bg-primary/20 text-primary rounded-full w-7">
                  <span className="text-xs font-bold">{ownerInitial}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-base-content/70 truncate max-w-[90px]">{ownerName}</span>
          </div>
          <span className="btn btn-primary btn-xs rounded-full transition-all duration-200 active:scale-95 group-hover:btn-secondary">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}
