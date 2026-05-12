import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { pageTransition, tapPress } from '../utils/animations';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('loading');
  const [request, setRequest] = useState(null);

  useEffect(() => {
    if (!sessionId) { setStatus('error'); return; }
    api.get(`/payments/verify?session_id=${sessionId}`)
      .then((res) => { if (res.data.paid) { setRequest(res.data.request); setStatus('success'); } else setStatus('error'); })
      .catch(() => setStatus('error'));
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center space-y-4">
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="text-base-content/55 text-sm">Confirming your payment…</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <motion.div variants={pageTransition} initial="hidden" animate="visible"
        className="min-h-screen flex items-center justify-center bg-base-200 px-4">
        <div className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
          <p className="text-base-content/60 text-sm mb-6">
            We couldn't verify your payment. If you were charged, please contact support.
          </p>
          <div className="flex gap-3">
            <Link to="/dashboard?tab=requests" className="btn btn-primary flex-1 rounded-xl">My Requests</Link>
            <Link to="/browse" className="btn btn-ghost flex-1 rounded-xl">Browse Items</Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible"
      className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm max-w-md w-full p-8 text-center">
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-5"
        >
          <span className="text-4xl">✅</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h1 className="text-2xl font-bold mb-1">Payment Successful!</h1>
          <p className="text-base-content/60 text-sm mb-6">
            Your deposit has been paid. The lender will review your request shortly.
          </p>
        </motion.div>

        {request && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-base-200 rounded-xl p-4 text-left space-y-2 mb-6"
          >
            {[
              { label: 'Item',           value: request.item?.title },
              { label: 'Lender',         value: request.lender?.name },
              { label: 'Deposit Paid',   value: `৳${request.depositAmount}`, className: 'text-success font-bold' },
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-base-content/55">{row.label}</span>
                <span className={row.className || 'font-semibold'}>{row.value}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm">
              <span className="text-base-content/55">Status</span>
              <span className="badge badge-success badge-sm">Paid</span>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="flex gap-3"
        >
          <motion.div whileTap={tapPress} className="flex-1">
            <Link to="/dashboard?tab=requests" className="btn btn-primary btn-block rounded-xl">View My Requests</Link>
          </motion.div>
          <motion.div whileTap={tapPress} className="flex-1">
            <Link to="/browse" className="btn btn-ghost btn-block rounded-xl">Browse More</Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
