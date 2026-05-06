import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Bell, Check, X, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: (subscribed: boolean) => void;
  userEmail?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, userEmail }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/60 backdrop-blur-xl"
            onClick={() => onClose(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-[2.5rem] overflow-hidden"
          >
            {/* Header Art */}
            <div className="h-32 bg-linear-to-br from-primary/10 via-primary/5 to-transparent relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Mail className="w-32 h-32 rotate-12 translate-x-8 -translate-y-8" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pt-8">
                <div className="w-20 h-20 bg-foreground rounded-3xl flex items-center justify-center shadow-2xl">
                  <Zap className="w-10 h-10 text-background" fill="currentColor" />
                </div>
              </div>
            </div>

            <div className="p-10 pt-8 text-center">
              <h2 className="text-3xl font-black tracking-tight mb-3">Stay in the Loop</h2>
              <p className="text-muted-foreground font-medium mb-8">
                Join our community to receive updates on new features, upcoming global contests, and official announcements.
              </p>

              <div className="space-y-4 mb-10 text-left">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Weekly Newsletter</h4>
                    <p className="text-xs text-muted-foreground">The best events delivered to your inbox every Monday.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Community Updates</h4>
                    <p className="text-xs text-muted-foreground">Be the first to know about official community communication.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => onClose(true)}
                  className="w-full bg-foreground text-background dark:bg-white dark:text-black py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-98 transition-all shadow-xl shadow-foreground/10"
                >
                  Yes, subscribe me
                </button>
                <button
                  onClick={() => onClose(false)}
                  className="w-full py-4 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
                >
                  Maybe later
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-center gap-2 opacity-50">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">No spam, just quality updates</span>
              </div>
            </div>

            <button 
              onClick={() => onClose(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
