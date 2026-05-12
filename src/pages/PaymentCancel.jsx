import { useSearchParams, Link } from 'react-router-dom';

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('request_id');

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 fade-in">
      <div className="card bg-base-100 shadow-xl max-w-md w-full">
        <div className="card-body items-center text-center p-8">
          <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mb-4">
            <span className="text-5xl">⚠️</span>
          </div>

          <h1 className="text-2xl font-bold mb-1">Payment Cancelled</h1>
          <p className="text-base-content/60 mb-6">
            You cancelled the payment. Your borrow request was created but the deposit hasn't been paid yet.
            You can pay from your dashboard.
          </p>

          <div className="bg-base-200 rounded-2xl p-4 w-full text-left mb-6">
            <p className="text-sm text-base-content/60">
              💡 <strong>Tip:</strong> The lender may not accept your request until the deposit is paid.
              Go to <strong>My Requests</strong> in your dashboard to complete the payment.
            </p>
          </div>

          <div className="flex gap-3 w-full">
            <Link to="/dashboard?tab=requests" className="btn btn-primary flex-1">
              My Requests
            </Link>
            <Link to="/browse" className="btn btn-ghost flex-1">
              Browse Items
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
