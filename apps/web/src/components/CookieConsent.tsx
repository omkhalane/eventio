import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, X } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookie-consent');
      if (!consent) {
        setTimeout(() => setIsVisible(true), 2000);
      }
    } catch (e) {
      console.warn('LocalStorage blocked:', e);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem('cookie-consent', 'accepted');
    } catch (e) {
      console.warn('LocalStorage blocked:', e);
    }
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-[90vw] max-w-xl"
        >
          <div className="bg-foreground text-background dark:bg-white dark:text-black p-6 rounded-[2rem] shadow-2xl flex flex-col sm:flex-row items-center gap-6">
            <div className="w-12 h-12 bg-background/10 rounded-full flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-60">Privacy Policy</p>
              <p className="text-sm font-black leading-tight">
                We use cookies to enhance your experience and secure your data.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={accept}
                className="px-6 py-3 bg-background text-foreground dark:bg-black dark:text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all"
              >
                Accept
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-3 hover:bg-background/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
