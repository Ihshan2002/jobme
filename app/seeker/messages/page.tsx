'use client';

import { useMemo, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Inbox, Circle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  created_at: string;
}

export default function SeekerMessagesPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Fetch Error:", error);
        toast.error(`Error loading messages: ${error.message}. Please check RLS policies!`);
      } else {
        setNotifications(data || []);
      }
      setLoading(false);
    }
    load();
  }, [router, supabase]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update notification status');
    } else {
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd] dark:bg-zinc-950">
        <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-6 h-14 flex items-center">
        <div className="max-w-4xl mx-auto w-full flex items-center gap-4">
          <button
            onClick={() => router.push('/seeker/dashboard')}
            className="p-1.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-zinc-800 mx-1" />
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-purple-600" />
            <span className="font-bold text-xs uppercase tracking-widest text-slate-900 dark:text-white">
              Applicant <span className="text-purple-600">Inbox</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            Notifications
          </h1>
          <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
            Total count: {notifications.length} Notification{notifications.length !== 1 ? 's' : ''}
          </p>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded border border-dashed border-slate-300 dark:border-zinc-800 p-16 text-center shadow-sm">
            <Inbox className="h-10 w-10 text-slate-200 dark:text-zinc-700 mx-auto mb-4" />
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Your inbox is empty</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) markAsRead(notif.id);
                }}
                className={`group cursor-pointer bg-white dark:bg-zinc-900 border ${notif.read ? 'border-slate-200 dark:border-zinc-800' : 'border-purple-300 dark:border-purple-900/50 shadow-md shadow-purple-500/5'} p-5 rounded hover:border-purple-500/50 transition-all`}
              >
                <div className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    {notif.read ? (
                      <CheckCircle2 size={18} className="text-slate-300 dark:text-zinc-700" />
                    ) : (
                      <Circle fill="currentColor" size={18} className="text-purple-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`text-sm ${notif.read ? 'font-bold text-slate-700 dark:text-zinc-300' : 'font-black text-slate-900 dark:text-white'} tracking-tight`}>
                        {notif.title}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest whitespace-nowrap ml-4">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${notif.read ? 'text-slate-500 dark:text-zinc-500' : 'text-slate-600 dark:text-zinc-400 font-medium'}`}>
                      {notif.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
