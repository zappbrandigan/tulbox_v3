import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-4xl font-bold mb-2">404 — Page Not Found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
          Sorry, the page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-5 py-3 shadow"
        >
          Return to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
