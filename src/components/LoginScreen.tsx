import { useState } from 'react';
import type { AuthError } from '@supabase/supabase-js';

interface Props {
  onSignIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
}

export function LoginScreen({ onSignIn }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await onSignIn(email, password);
    setSubmitting(false);
    if (error) setError(error.message);
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white dark:bg-stone-950">
      <div className="h-1 w-full shrink-0 bg-gradient-to-r from-brand-gold via-brand-500 to-brand-700" style={{ position: 'fixed', top: 0 }} />
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-stone-200 p-6 dark:border-stone-800">
        <h1 className="mb-4 text-lg font-semibold text-stone-900 dark:text-stone-100">Shop Production Dashboard</h1>
        <label htmlFor="login-email" className="mb-1 block text-xs text-stone-500 dark:text-stone-400">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded border border-stone-300 bg-white px-2 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-900"
        />
        <label htmlFor="login-password" className="mb-1 block text-xs text-stone-500 dark:text-stone-400">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded border border-stone-300 bg-white px-2 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-900"
        />
        {error && <div className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
