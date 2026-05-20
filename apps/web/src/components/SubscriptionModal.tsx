import { Bell, Check, Mail, ShieldCheck, X, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect } from 'react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: (subscribed: boolean) => void;
  userEmail?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  userEmail: _userEmail,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-background/60 absolute inset-0 backdrop-blur-xl"
            onClick={() => onClose(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-card border-border relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border shadow-2xl"
          >
            {/* Header Art */}
            <div className="from-primary/10 via-primary/5 relative h-32 overflow-hidden bg-linear-to-br to-transparent">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Mail className="h-32 w-32 translate-x-8 -translate-y-8 rotate-12" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pt-8">
                <div className="bg-foreground flex h-20 w-20 items-center justify-center rounded-3xl shadow-2xl">
                  <Zap className="text-background h-10 w-10" fill="currentColor" />
                </div>
              </div>
            </div>

            <div className="p-10 pt-8 text-center">
              <h2 className="mb-3 text-3xl font-black tracking-tight">Stay in the Loop</h2>
              <p className="text-muted-foreground mb-8 font-medium">
                Join our community to receive updates on new features, upcoming global contests, and
                official announcements.
              </p>

              <div className="mb-10 space-y-4 text-left">
                <div className="bg-muted/30 border-border/50 flex items-start gap-4 rounded-2xl border p-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                    <Check className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Weekly Newsletter</h4>
                    <p className="text-muted-foreground text-xs">
                      The best events delivered to your inbox every Monday.
                    </p>
                  </div>
                </div>

                <div className="bg-muted/30 border-border/50 flex items-start gap-4 rounded-2xl border p-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                    <Bell className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Community Updates</h4>
                    <p className="text-muted-foreground text-xs">
                      Be the first to know about official community communication.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => onClose(true)}
                  className="bg-foreground text-background shadow-foreground/10 w-full rounded-2xl py-5 text-sm font-black tracking-widest uppercase shadow-xl transition-all hover:scale-[1.02] active:scale-98"
                >
                  Yes, subscribe me
                </button>
                <button
                  onClick={() => onClose(false)}
                  className="text-muted-foreground hover:text-foreground w-full py-4 text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  Maybe later
                </button>
              </div>

              <div className="border-border/50 mt-8 flex items-center justify-center gap-2 border-t pt-6 opacity-50">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold tracking-widest uppercase">
                  No spam, just quality updates
                </span>
              </div>
            </div>

            <button
              onClick={() => onClose(false)}
              className="hover:bg-muted absolute top-6 right-6 rounded-full p-2 transition-colors"
            >
              <X className="text-muted-foreground h-5 w-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
