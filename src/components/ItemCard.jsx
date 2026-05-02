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

  return (
    <div className="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
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
          className={`w-full h-full bg-gradient-to-br from-emerald-100 to-green-200 flex items-center justify-center text-5xl ${imageUrl ? 'hidden' : 'flex'}`}
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
        <h2 className="font-semibold text-base line-clamp-1">{item.title}</h2>
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
          <div className="flex items-center gap-1.5">
            <div className="avatar placeholder">
              <div className="bg-primary/20 text-primary rounded-full w-6 h-6">
                <span className="text-xs font-bold">{item.owner?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
            </div>
            <span className="text-xs text-base-content/70 truncate max-w-[80px]">{item.owner?.name || 'Unknown'}</span>
          </div>
          <Link
            to={`/items/${item._id}`}
            className="btn btn-primary btn-xs rounded-full transition-all duration-200 active:scale-95"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
