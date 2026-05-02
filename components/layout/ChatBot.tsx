'use client';

// components/layout/ChatBot.tsx

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Briefcase,
  FileText,
  HelpCircle,
  TrendingUp,
  Cpu,
  Terminal as TerminalIcon,
  Sparkles
} from "lucide-react";

type Message = {
  role: "user" | "model";
  parts: { text: string }[];
};

const QUICK_SUGGESTIONS = [
  { icon: Briefcase, text: "Search Job Registry" },
  { icon: FileText, text: "Resume Optimization" },
  { icon: TrendingUp, text: "Market Trends" },
  { icon: HelpCircle, text: "Platform Guide" },
];

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text?: string) {
    const messageText = text ?? input;
    if (!messageText.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      parts: [{ text: messageText }],
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, history: messages }),
      });
      const data = await res.json();
      setMessages([
        ...updatedMessages,
        { role: "model", parts: [{ text: data.reply }] },
      ]);
    } catch {
      setMessages([
        ...updatedMessages,
        {
          role: "model",
          parts: [{ text: "CRITICAL_ERROR: Uplink failed. Re-establish connection." }],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-slate-950 dark:bg-blue-600 text-white rounded-sm w-14 h-14 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-110 active:scale-95 transition-all duration-300 border border-white/10"
      >
        {open ? <X size={20} /> : <TerminalIcon size={20} />}
        {!open && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] h-[580px] bg-white dark:bg-zinc-950 rounded-sm shadow-2xl flex flex-col border border-slate-200 dark:border-zinc-800 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Neural Header */}
          <div className="bg-slate-900 dark:bg-zinc-900 p-4 border-b border-white/5 flex items-center gap-3 shrink-0">
            <div className="relative">
               <div className="bg-blue-600 rounded-sm p-2">
                 <Cpu size={18} className="text-white" />
               </div>
               <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div className="flex-1">
              <p className="font-black text-[10px] text-blue-500 uppercase tracking-[0.2em]">Neural_Link v1.0</p>
              <p className="font-bold text-sm text-white tracking-tight">JobMe Assistant</p>
            </div>
            <div className="flex items-center gap-2">
               <div className="h-4 w-[1px] bg-white/10" />
               <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                 <X size={16} />
               </button>
            </div>
          </div>

          {/* Diagnostic Feed (Messages) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#fcfcfd] dark:bg-zinc-950 custom-scrollbar">
            {messages.length === 0 && (
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="bg-slate-900 dark:bg-blue-600 rounded-sm p-1.5 shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-sm shadow-sm text-xs font-medium leading-relaxed text-slate-700 dark:text-zinc-300">
                      Uplink established. I am your JobMe interface. 
                      How can I assist your career trajectory today?
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {QUICK_SUGGESTIONS.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(s.text)}
                          className="flex items-center justify-between group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-3 py-2 rounded-sm hover:border-blue-500 transition-all text-left"
                        >
                          <div className="flex items-center gap-2">
                            <s.icon size={12} className="text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white">
                              {s.text}
                            </span>
                          </div>
                          <Sparkles size={10} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`rounded-sm p-1.5 shrink-0 ${msg.role === "user" ? "bg-slate-200 dark:bg-zinc-800" : "bg-slate-950 dark:bg-blue-600"}`}>
                  {msg.role === "user" ? <User size={14} className="text-slate-600" /> : <Bot size={14} className="text-white" />}
                </div>
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-sm text-xs font-medium shadow-sm border ${
                    msg.role === "user" 
                    ? "bg-blue-600 text-white border-blue-500" 
                    : "bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-800"
                  }`}
                >
                  {msg.parts[0].text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="bg-slate-950 dark:bg-blue-600 rounded-sm p-1.5 shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="flex items-center gap-1.5 px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-sm">
                  <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                  <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse [animation-delay:200ms]" />
                  <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse [animation-delay:400ms]" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] ml-2 text-slate-400">Processing...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Terminal Input */}
          <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="System command..."
                  disabled={loading}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-sm px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 disabled:opacity-50"
                />
                <div className="absolute right-3 top-2.5 opacity-20 pointer-events-none">
                   <TerminalIcon size={14} />
                </div>
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="bg-slate-950 dark:bg-blue-600 text-white px-4 rounded-sm hover:bg-blue-700 disabled:opacity-40 transition-all active:scale-95"
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-[8px] font-mono text-center text-slate-400 uppercase tracking-widest">
              End-to-End Encrypted Session
            </p>
          </div>
        </div>
      )}
    </>
  );
}