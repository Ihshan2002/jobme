"use client";

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
} from "lucide-react";

type Message = {
  role: "user" | "model";
  parts: { text: string }[];
};

const QUICK_SUGGESTIONS = [
  { icon: Briefcase, text: "Find latest jobs" },
  { icon: FileText, text: "Resume tips" },
  { icon: TrendingUp, text: "Interview tips" },
  { icon: HelpCircle, text: "How to apply?" },
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
          parts: [{ text: "Something went wrong. Try again!" }],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl hover:bg-blue-700 hover:scale-110 transition-all duration-200"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30" />
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] h-[520px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-zinc-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center gap-3 shrink-0">
            <div className="bg-white/20 rounded-full p-2">
              <Bot size={18} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">JobMe Assistant</p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <p className="text-xs text-blue-100">Powered by Gemini AI</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 dark:bg-zinc-950">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="bg-blue-600 rounded-full p-1.5 mt-0.5 shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-white dark:bg-zinc-800 rounded-2xl rounded-tl-none px-3 py-2 shadow-sm text-sm text-slate-700 dark:text-zinc-300 max-w-[80%]">
                    Hi! I&apos;m your JobMe Assistant. I can help you find jobs,
                    improve your resume, and prepare for interviews!
                  </div>
                </div>
                <div className="ml-8 grid grid-cols-2 gap-2">
                  {QUICK_SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s.text)}
                      className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 border border-blue-100 dark:border-zinc-700 text-blue-600 dark:text-blue-400 text-xs px-2 py-1.5 rounded-xl hover:bg-blue-50 transition-all text-left shadow-sm"
                    >
                      <s.icon size={12} />
                      {s.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "model" && (
                  <div className="bg-blue-600 rounded-full p-1.5 shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm shadow-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 rounded-bl-none"}`}
                >
                  {msg.parts[0].text}
                </div>
                {msg.role === "user" && (
                  <div className="bg-slate-200 dark:bg-zinc-700 rounded-full p-1.5 shrink-0">
                    <User size={14} className="text-slate-600" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-end gap-2">
                <div className="bg-blue-600 rounded-full p-1.5 shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-white dark:bg-zinc-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex gap-2 items-center shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              disabled={loading}
              className="flex-1 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-all hover:scale-105"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
