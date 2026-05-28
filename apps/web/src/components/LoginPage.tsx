import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, Globe, Calendar as CalendarIcon, KeyRound } from 'lucide-react';
import { cn } from '../lib/utils';
import { SeoHead } from './SeoHead';

import { signInWithPopup, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

// Icons for the login providers
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 21 21">
    <path fill="#f35325" d="M0 0h10v10H0z" />
    <path fill="#81bc06" d="M11 0h10v10H11z" />
    <path fill="#05a6f0" d="M0 11h10v10H0z" />
    <path fill="#ffba08" d="M11 11h10v10H11z" />
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<'google' | 'microsoft' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (provider: 'google' | 'microsoft') => {
    try {
      setIsLoading(provider);
      setError(null);
      if (!auth) {
        throw new Error('Firebase Auth is not initialized');
      }

      if (provider === 'google') {
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        if (token) {
          const m = await import('../services/googleCalendarService');
          m.setGoogleAccessToken(token);
        }
      } else {
        const { microsoftProvider } = await import('../lib/firebase');
        const result = await signInWithPopup(auth, microsoftProvider);
        const credential = OAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        if (token) {
          const m = await import('../services/microsoftCalendarService');
          m.setMicrosoftAccessToken(token);
        }
      }
      navigate('/calendar');
    } catch (err: any) {
      console.error(`Error signing in with ${provider}:`, err);
      if (err.code === 'auth/unauthorized-domain') {
        const hostname = window.location.hostname;
        setError(`Configuration Error: This domain (${hostname}) is not authorized in Firebase.`);
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-50 selection:bg-stone-900 selection:text-white dark:bg-stone-950">
      <SeoHead
        title="Sign In | Eventio"
        description="Sign in to your Eventio account to track, sync, and organize your favorite tech events."
      />

      {/* Decorative Background Elements */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-500/5 animate-pulse-subtle" />
        <div className="absolute -right-40 -bottom-40 h-[600px] w-[600px] rounded-full bg-rose-500/10 blur-[120px] dark:bg-rose-500/5 animate-pulse-subtle delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,.02)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent)] bg-[size:40px_40px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.02)_1px,transparent_1px)]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-sm font-bold text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Go Back
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-[2.5rem] border border-white/50 bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:border-stone-800/50 dark:bg-stone-900/70 sm:p-12"
        >
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-stone-900 to-stone-700 text-white shadow-lg dark:from-white dark:to-stone-200 dark:text-stone-900">
              <KeyRound className="h-8 w-8" />
            </div>
            <h1 className="font-sans text-3xl font-black tracking-tight text-stone-900 dark:text-white">
              Welcome Back
            </h1>
            <p className="mt-3 text-sm font-medium leading-relaxed text-stone-500 dark:text-stone-400">
              Sign in to sync events to your personal calendar, track your registrations, and curate your bookmarks.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-xs font-bold text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"
              >
                {error}
              </motion.div>
            )}

            <button
              onClick={() => handleSignIn('google')}
              disabled={isLoading !== null}
              className="group relative flex w-full items-center justify-center rounded-2xl border border-stone-200 bg-white px-6 py-4 text-sm font-bold text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-750"
            >
              {isLoading === 'google' ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-stone-800 dark:border-stone-600 dark:border-t-stone-200" />
              ) : (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )}
            </button>

            <button
              onClick={() => handleSignIn('microsoft')}
              disabled={isLoading !== null}
              className="group relative flex w-full items-center justify-center rounded-2xl border border-stone-200 bg-white px-6 py-4 text-sm font-bold text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-750"
            >
              {isLoading === 'microsoft' ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-stone-800 dark:border-stone-600 dark:border-t-stone-200" />
              ) : (
                <>
                  <MicrosoftIcon />
                  Continue with Microsoft
                </>
              )}
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-stone-200 dark:border-stone-800">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-xs font-bold text-stone-500 dark:text-stone-400">
                <Sparkles className="h-4 w-4 text-amber-500" /> 
                Curate your personal hackathon roadmap
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-stone-500 dark:text-stone-400">
                <CalendarIcon className="h-4 w-4 text-blue-500" /> 
                1-click sync to your native calendar app
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-stone-500 dark:text-stone-400">
                <Globe className="h-4 w-4 text-emerald-500" /> 
                Access events across 41 tech categories
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
