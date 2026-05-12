/**
 * StarRating — display-only or interactive.
 *
 * Display mode (default):  <StarRating rating={4.5} count={12} />
 * Interactive mode:        <StarRating interactive value={3} onChange={setRating} />
 */
export default function StarRating({ rating = 0, count, interactive = false, value = 0, onChange }) {
  const display = interactive ? value : rating;

  if (interactive) {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className="text-2xl transition-transform hover:scale-110 focus:outline-none"
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            <span className={star <= value ? 'text-yellow-400' : 'text-gray-300'}>★</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= Math.round(display) ? 'text-yellow-400' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
      </div>
      {count !== undefined && (
        <span className="text-sm text-base-content/60">
          {display > 0 ? `${Number(display).toFixed(1)} ` : ''}({count})
        </span>
      )}
    </div>
  );
}
