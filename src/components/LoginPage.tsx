import { useState } from 'react';
import { Smartphone, Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setNotice(null);
    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) {
          setError(
            signInError.message === 'Invalid login credentials'
              ? 'Invalid email or password. Please try again.'
              : signInError.message
          );
        }
        // On success, the onAuthStateChange listener in App renders the app.
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) {
          setError(signUpError.message);
        } else if (data.session) {
          // Auto-confirmed — listener takes over.
        } else {
          setNotice('Account created. Check your email to confirm your address, then sign in.');
          setMode('signin');
        }
      }
    } catch {
      setError('Unable to reach the authentication service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-accent to-success flex items-center justify-center shadow-lg mb-4">
            <Smartphone className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight brand-gradient-text text-center">
            AKK MOBILE
          </h1>
          <p className="text-secondary text-sm mt-1 text-center text-pretty">
            Enterprise Suite {'\u2014'} secure sign in
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl border border-border p-6 sm:p-8">
          <h2 className="text-heading text-lg mb-1">
            {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="text-secondary text-sm mb-6">
            {mode === 'signin'
              ? 'Enter your work email and password.'
              : 'Use your work email to get started.'}
          </p>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-danger/40 bg-danger/10 text-danger text-sm px-4 py-3"
            >
              {error}
            </div>
          )}
          {notice && (
            <div
              role="status"
              className="mb-4 rounded-xl border border-success/40 bg-success/10 text-success text-sm px-4 py-3"
            >
              {notice}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-label">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full h-11 rounded-xl bg-elevated border border-border text-foreground placeholder:text-subtle pl-10 pr-4 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-label">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signin' ? 'Your password' : 'At least 6 characters'}
                  className="w-full h-11 rounded-xl bg-elevated border border-border text-foreground placeholder:text-subtle pl-10 pr-11 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-foreground transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  {mode === 'signin' ? 'Signing in…' : 'Creating account…'}
                </>
              ) : mode === 'signin' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
                setNotice(null);
              }}
              className="text-primary hover:underline text-sm font-semibold"
            >
              {mode === 'signin'
                ? "Don't have an account? Create one"
                : 'Already have an account? Sign in'}
            </button>
            <div className="flex items-center gap-1.5 text-subtle text-xs">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Protected by Supabase Auth</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
