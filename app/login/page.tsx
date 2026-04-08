'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextRoute = searchParams.get('next') || '/card';
  const isAdminFlow = nextRoute === '/admin';

  const [mode, setMode] = useState<Mode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace(nextRoute);
      }
    }

    void checkSession();
  }, [supabase, router, nextRoute]);

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    router.replace(nextRoute);
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setMessage('');

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setErrorMsg('Full name is required');
      setLoading(false);
      return;
    }

    if (!cleanEmail) {
      setErrorMsg('Email is required');
      setLoading(false);
      return;
    }

    if (password.trim().length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
        },
      },
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (data.session) {
      router.replace('/card');
      return;
    }

    setMessage('Account created successfully. You can now sign in.');
    setMode('signin');
    setPassword('');
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <div className="brand-wordmark">Macanudas</div>
        <div className="tagline">Fan Card Access</div>
      </header>

      <div className="stripe" />

      <section className="panel">
        <div className="panel-title">
          {isAdminFlow ? (
            <>
              Cashier <span>Access</span>
            </>
          ) : mode === 'signup' ? (
            <>
              Create your <span>fan card account</span>
            </>
          ) : (
            <>
              Access your <span>fan card</span>
            </>
          )}
        </div>

        <form onSubmit={mode === 'signup' && !isAdminFlow ? handleSignUp : handleSignIn}>
          {!isAdminFlow && mode === 'signup' && (
            <div className="field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder={
                isAdminFlow ? 'info@macanudasempanadas.com' : 'you@email.com'
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button className="btn btn-red" type="submit" disabled={loading}>
            {loading
              ? mode === 'signup' && !isAdminFlow
                ? 'Creating account...'
                : 'Signing in...'
              : mode === 'signup' && !isAdminFlow
              ? 'Create account'
              : 'Sign in'}
          </button>
        </form>
      </section>

      {message ? <div className="status success">{message}</div> : null}
      {errorMsg ? <div className="status error">{errorMsg}</div> : null}

      {!isAdminFlow && (
        <>
          <section className="panel center">
            <div className="small muted" style={{ marginBottom: '10px' }}>
              {mode === 'signin'
                ? "Don't have an account yet?"
                : 'Already have an account?'}
            </div>

            <button
              className="btn btn-outline"
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setMessage('');
                setErrorMsg('');
                setPassword('');
              }}
            >
              {mode === 'signin' ? 'Create account' : 'Back to sign in'}
            </button>
          </section>

          <section className="panel center">
            <div className="small muted" style={{ marginBottom: '10px' }}>
              Cashier or admin?
            </div>
            <a className="btn btn-outline" href="/login?next=/admin">
              Cashier access
            </a>
          </section>
        </>
      )}

      <div className="footer-note">
        Macanudas Empanadas · Loyalty Program
      </div>
    </main>
  );
}