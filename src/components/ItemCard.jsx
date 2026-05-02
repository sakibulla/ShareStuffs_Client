import { Link } from 'react-router-dom';

export default function ItemCard({ item }) {
    const imageUrl = item.images?.[0] || 'https://via.placeholder.com/300x200?text=Item+Image';

    return (
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow h-full">
            <figure className="h-48 bg-gray-200 overflow-hidden">
                <img
                    src={imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Item+Image';
                    }}
                />
            </figure>
            <div className="card-body p-4">
                <div className="flex items-start justify-between gap-2">
                    <h2 className="card-title text-lg line-clamp-2">{item.title}</h2>
                    <div className="badge badge-primary">{item.category}</div>
                </div>

                <p className="text-sm text-base-content/60 line-clamp-2">{item.description}</p>

                <div className="divider my-2"></div>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="font-semibold">Daily Fee:</span>
                        <span className="text-success font-bold">${item.dailyFee}/day</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold">Deposit:</span>
                        <span>${item.deposit}</span>
                    </div>
                </div>

                <div className="divider my-2"></div>

                <div className="flex items-center gap-2 mb-3">
                    <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-8">
                            <span className="text-xs font-bold">{item.owner?.name?.charAt(0) || 'U'}</span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.owner?.name || 'Unknown'}</p>
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className="text-yellow-400">★</span>
                            ))}
                        </div>
                    </div>
                </div>

                <Link to={`/items/${item._id}`} className="btn btn-primary btn-sm w-full">
                    View Details
                </Link>
            </div>
        </div>
    );
}
