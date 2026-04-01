'use client';

// app/auth/register/page.tsx

import { useMemo, useState, useTransition } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, User, Briefcase, Eye, EyeOff } from 'lucide-react';

type Role = 'seeker' | 'recruiter';

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [role, setRole]           = useState<Role>('seeker');
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState('');

 const supabase = useMemo(() => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
), []);

  function handleRegister() {
    if (!fullName || !email || !password) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');

    startTransition(async () => {
      // Step 1: Sign up with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Step 2: Update profile with role + full_name
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ role, full_name: fullName })
          .eq('id', data.user.id);
      }

      // Redirect based on role
      if (role === 'seeker') {
        router.push('/seeker/dashboard');
      } else {
        router.push('/recruiter/dashboard');
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-600 rounded-md">
              <Shield className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-2xl text-slate-900 dark:text-white">
              Job<span className="text-blue-600">Me</span>
            </span>
          </div>
          <p className="text-slate-500 dark:text-zinc-400 text-sm">
            Create your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-sm space-y-5">

          {/* Role Selector */}
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-3">
              I am a...
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRole('seeker')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                  ${role === 'seeker'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                    : 'border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:border-slate-300'
                  }`}
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-semibold">Job Seeker</span>
              </button>
              <button
                onClick={() => setRole('recruiter')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                  ${role === 'recruiter'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                    : 'border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:border-slate-300'
                  }`}
              >
                <Briefcase className="h-5 w-5" />
                <span className="text-sm font-semibold">Recruiter</span>
              </button>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5 block">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500 pr-10"
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            onClick={handleRegister}
            disabled={isPending}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            {isPending ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-zinc-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}