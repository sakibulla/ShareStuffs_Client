export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="card bg-base-100 shadow-md overflow-hidden">
          <div className="skeleton h-48 w-full rounded-none"></div>
          <div className="card-body p-4 gap-2">
            <div className="skeleton h-4 w-3/4"></div>
            <div className="skeleton h-3 w-1/2"></div>
            <div className="skeleton h-5 w-1/3 mt-1"></div>
            <div className="skeleton h-3 w-2/5"></div>
            <div className="divider my-1"></div>
            <div className="skeleton h-8 w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
