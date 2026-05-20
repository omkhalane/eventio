import React from 'react';
import { motion } from 'motion/react';

export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dimensions = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }[size];
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
      className={`flex items-center justify-center ${dimensions}`}
    >
      <svg
        className="text-primary-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4v4m0 8v4m8-8h-4m-8 0H4m15.364-7.364l-2.828 2.828M6.464 17.536l-2.828 2.828"
        />
      </svg>
    </motion.div>
  );
}
