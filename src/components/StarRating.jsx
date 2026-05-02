export default function StarRating({ rating = 5, count = 1 }) {
    return (
        <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <span
                        key={i}
                        className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
                    >
                        ★
                    </span>
                ))}
            </div>
            <span className="text-sm text-base-content/60">({count})</span>
        </div>
    );
}
