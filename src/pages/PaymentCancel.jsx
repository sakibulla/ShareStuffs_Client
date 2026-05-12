import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageTransition, tapPress } from '../utils/animations';

export default function PaymentCancel() {
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen flex items-center justify-center bg-base-200 px-4"
    >
      <div className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm max-w-md w-full p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-warning/15 flex items-center justify-center mx-auto mb-5"
        >
          <span className="text-4xl">⚠️</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-2xl font-bold mb-1">Payment Cancelled</h1>
          <p className="text-base-content/60 text-sm mb-6">
            You cancelled the payment. Your borrow request was created but the deposit hasn't been paid yet.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-warning/10 border border-warning/25 rounded-xl p-4 text-left mb-6"
        >
          <p className="text-sm text-base-content/65 leading-relaxed">
            💡 <strong>Tip:</strong> The lender may not accept your request until the deposit is paid.
            Go to <strong>My Requests</strong> in your dashboard to complete the payment.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3"
        >
          <motion.div whileTap={tapPress} className="flex-1">
            <Link to="/dashboard?tab=requests" className="btn btn-primary btn-block rounded-xl">My Requests</Link>
          </motion.div>
          <motion.div whileTap={tapPress} className="flex-1">
            <Link to="/browse" className="btn btn-ghost btn-block rounded-xl">Browse Items</Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
