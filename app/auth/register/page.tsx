'use client';

// app/auth/register/page.tsx

import { useMemo, useState, useTransition } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, User, Briefcase, Eye, EyeOff, ChevronRight, Loader2, Fingerprint } from 'lucide-react';

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
      setError('Required: all protocol fields must be populated.');
      return;
    }
    if (password.length < 6) {
      setError('Security breach: password requires 6+ characters.');
      return;
    }
    setError('');

    startTransition(async () => {
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

      if (data.user) {
        await supabase
          .from('profiles')
          .update({ role, full_name: fullName })
          .eq('id', data.user.id);
      }

      if (role === 'seeker') {
        router.push('/seeker/dashboard');
      } else {
        router.push('/recruiter/dashboard');
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd] dark:bg-zinc-950 p-6 selection:bg-blue-100 dark:selection:bg-blue-900/30">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-[440px] relative">

        {/* Logo Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded shadow-sm mb-6">
            <div className="p-1.5 bg-slate-900 dark:bg-blue-600 rounded-sm">
              <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-black text-lg tracking-tighter text-slate-900 dark:text-white uppercase">
              Job<span className="text-blue-600">Me</span> <span className="text-slate-400 font-medium ml-1">Enroll</span>
            </span>
          </div>
          <h1 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.3em]">
            Identity Provisioning
          </h1>
        </div>

        {/* Enrollment Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-sm overflow-hidden">
          
          <div className="h-1 w-full bg-slate-100 dark:bg-zinc-800">
            {isPending && <div className="h-full bg-blue-600 animate-[loading_1.5s_infinite]" style={{width: '30%'}} />}
          </div>

          <div className="p-8 space-y-8">
            
            {/* Role Registry */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Fingerprint size={12} className="text-blue-600" />
                <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                  Account Classification
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'seeker', label: 'Talent/Seeker', icon: User },
                  { id: 'recruiter', label: 'Entity/Recruiter', icon: Briefcase }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setRole(item.id as Role)}
                    className={`flex items-center justify-center gap-2 p-3 border rounded-sm transition-all
                      ${role === item.id
                        ? 'bg-slate-900 dark:bg-blue-600 border-slate-900 dark:border-blue-500 text-white shadow-md'
                        : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-600 hover:border-slate-300'
                      }`}
                  >
                    <item.icon size={14} className={role === item.id ? 'text-blue-300' : 'text-slate-300'} />
                    <span className="text-[11px] font-black uppercase tracking-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Credential Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Legal Designation (Name)</label>
                <input
                  type="text"
                  placeholder="e.g. MORGAN FREEMAN"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-xs font-bold focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 rounded-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Digital Address (Email)</label>
                <input
                  type="email"
                  placeholder="user@network.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-xs font-bold focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 rounded-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Access Key (Password)</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 6 units"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-xs font-bold focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 rounded-sm pr-10"
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
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase leading-tight tracking-tight">
                  Registry Error: {error}
                </p>
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={isPending}
              className="group w-full py-4 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 flex items-center justify-center gap-2 rounded-sm"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Commit Records <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-200 dark:border-zinc-800 text-center">
            <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-tighter">
              Existing Record?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline ml-1 font-black">
                Auth Channel
              </Link>
            </p>
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="mt-8 flex justify-between items-center px-2 opacity-30">
           <div className="h-[1px] flex-1 bg-slate-200 dark:bg-zinc-800" />
           <span className="text-[9px] font-mono text-slate-400 px-4 tabular-nums">DATA_ENCRYPTION_ACTIVE_2048</span>
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