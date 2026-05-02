'use client';

import { useMemo, useState, useTransition } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Eye, EyeOff, Lock, Mail, ChevronRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  function handleLogin() {
    if (!email || !password) {
      setError('Required: valid credentials for access.');
      return;
    }
    setError('');

    startTransition(async () => {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const role = profile?.role;
      router.refresh();

      if (role === 'admin') {
        router.push('/dashboard/users');
      } else if (role === 'recruiter') {
        router.push('/recruiter/dashboard');
      } else {
        router.push('/seeker/dashboard');
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd] dark:bg-zinc-950 p-6 selection:bg-blue-100 dark:selection:bg-blue-900/30">
      
      {/* Structural Background Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-[400px] relative">

        {/* Logo Section */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded shadow-sm mb-6">
            <div className="p-1.5 bg-slate-900 dark:bg-blue-600 rounded-sm">
              <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-black text-lg tracking-tighter text-slate-900 dark:text-white uppercase">
              Job<span className="text-blue-600">Me</span> <span className="text-slate-400 font-medium ml-1">Auth</span>
            </span>
          </div>
          <h1 className="text-sm font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
            System Authentication
          </h1>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden rounded-sm">
          
          {/* Status Bar */}
          <div className="h-1 w-full bg-slate-100 dark:bg-zinc-800">
            {isPending && <div className="h-full bg-blue-600 animate-[loading_1.5s_infinite]" style={{width: '30%'}} />}
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                    Identity (Email)
                  </label>
                  <Mail size={12} className="text-slate-300 dark:text-zinc-600" />
                </div>
                <input
                  type="email"
                  placeholder="admin@jobme.core"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-xs font-bold focus:border-blue-500 focus:ring-0 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-zinc-700 rounded-sm"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                    Security Token
                  </label>
                  <Lock size={12} className="text-slate-300 dark:text-zinc-600" />
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-xs font-bold focus:border-blue-500 focus:ring-0 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-zinc-700 rounded-sm"
                  />
                  <button
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 leading-tight uppercase tabular-nums">
                  Error: {error}
                </span>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={isPending}
              className="group w-full py-4 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 flex items-center justify-center gap-2 rounded-sm"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Initiate Session <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-200 dark:border-zinc-800 text-center">
            <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-tighter">
              Unregistered entity?{' '}
              <Link href="/auth/register" className="text-blue-600 hover:underline ml-1">
                Establish Identity
              </Link>
            </p>
          </div>
        </div>
        
        {/* Decorative System Footer */}
        <div className="mt-8 flex justify-between items-center px-2 opacity-50">
           <div className="h-[1px] flex-1 bg-slate-200 dark:bg-zinc-800" />
           <span className="text-[9px] font-mono text-slate-400 px-4">SECURE_CHANNEL_v3.2</span>
           <div className="h-[1px] flex-1 bg-slate-200 dark:bg-zinc-800" />
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}