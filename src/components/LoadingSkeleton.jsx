export default function LoadingSkeleton({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="card bg-base-100 shadow-md">
                    <div className="skeleton h-48 w-full"></div>
                    <div className="card-body">
                        <div className="skeleton h-4 w-3/4"></div>
                        <div className="skeleton h-3 w-1/2"></div>
                        <div className="divider my-2"></div>
                        <div className="skeleton h-3 w-full"></div>
                        <div className="skeleton h-3 w-5/6"></div>
                        <div className="skeleton h-10 w-full mt-4"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
