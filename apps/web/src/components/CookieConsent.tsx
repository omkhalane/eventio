import { Shield, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';

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
          className="fixed bottom-8 left-1/2 z-[200] w-[90vw] max-w-xl -translate-x-1/2"
        >
          <div className="bg-foreground text-background flex flex-col items-center gap-6 rounded-[2rem] p-6 shadow-2xl sm:flex-row">
            <div className="bg-background/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
              <Shield className="h-6 w-6" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="mb-1 text-xs font-bold tracking-widest uppercase opacity-60">
                Privacy Policy
              </p>
              <p className="text-sm leading-tight font-black">
                We use cookies to enhance your experience and secure your data.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={accept}
                className="bg-background text-foreground rounded-full px-6 py-3 text-[10px] font-black tracking-[0.2em] uppercase transition-all hover:opacity-90"
              >
                Accept
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="hover:bg-background/10 rounded-full p-3 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
