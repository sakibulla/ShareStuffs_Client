import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [request, setRequest] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.get(`/payments/verify?session_id=${sessionId}`);
        if (res.data.paid) {
          setRequest(res.data.request);
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    };

    verify();
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
          <p className="text-base-content/60">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body items-center text-center p-8">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold mb-2">Payment Verification Failed</h1>
            <p className="text-base-content/60 mb-6">
              We couldn't verify your payment. If you were charged, please contact support.
            </p>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 fade-in">
      <div className="card bg-base-100 shadow-xl max-w-md w-full">
        <div className="card-body items-center text-center p-8">
          {/* Success animation */}
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <span className="text-5xl">✅</span>
          </div>

          <h1 className="text-2xl font-bold mb-1">Payment Successful!</h1>
          <p className="text-base-content/60 mb-6">
            Your deposit has been paid. The lender will review your request shortly.
          </p>

          {request && (
            <div className="bg-base-200 rounded-2xl p-4 w-full text-left space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-base-content/60">Item</span>
                <span className="font-semibold">{request.item?.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/60">Lender</span>
                <span className="font-semibold">{request.lender?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/60">Deposit Paid</span>
                <span className="font-semibold text-success">৳{request.depositAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/60">Payment Status</span>
                <span className="badge badge-success badge-sm">Paid</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 w-full">
            <Link to="/dashboard?tab=requests" className="btn btn-primary flex-1">
              View My Requests
            </Link>
            <Link to="/browse" className="btn btn-ghost flex-1">
              Browse More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
