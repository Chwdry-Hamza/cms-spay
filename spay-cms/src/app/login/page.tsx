'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuth } from '@/lib/auth-context';
import { apiErrorMessage } from '@/lib/api';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-surface-deepest"><Loader2 className="size-6 animate-spin text-cyan-300" /></div>}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, user, ready } = useAuth();
  const [email, setEmail] = React.useState('admin@spay.finance');
  const [password, setPassword] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Already logged in? bounce.
  React.useEffect(() => {
    if (ready && user) {
      const next = params.get('next') || '/';
      router.replace(next);
    }
  }, [ready, user, router, params]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email.trim(), password);
      const next = params.get('next') || '/';
      router.replace(next);
    } catch (err) {
      setError(apiErrorMessage(err));
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-deepest relative overflow-hidden px-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-400/[0.08] blur-[120px] animate-spay-hero-glow" />
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-50 spay-grid-bg" />

      <div className="relative w-full max-w-md -translate-y-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/spayLogo.jpeg"
            alt="Spay"
            className="size-20 rounded-spay-md object-contain"
          />
        </div>

        {/* Card */}
        <form
          onSubmit={submit}
          className="rounded-spay-lg border border-line bg-surface-raised/60 backdrop-blur-xl shadow-spay-3 p-8 space-y-6"
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-1.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              className="mt-1.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="rounded-spay-md border border-danger/30 bg-danger/[0.06] px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? <><Loader2 className="animate-spin" /> Signing in…</> : <>Sign in <ArrowRight /></>}
          </Button>
        </form>
      </div>
    </div>
  );
}
