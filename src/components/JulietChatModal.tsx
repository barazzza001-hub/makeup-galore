import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, MessageCircle, ShoppingBag, User, Bot, RefreshCw } from 'lucide-react';
import { TabType } from '../types';
import { PRODUCTS } from '../data/mockData';

interface JulietChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: TabType) => void;
}

interface ChatMessage {
  id: string;
  sender: 'juliet' | 'user';
  text: string;
  timestamp: string;
}

export const JulietChatModal: React.FC<JulietChatModalProps> = ({
  isOpen,
  onClose,
  setActiveTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'juliet',
      text: "Hujambo! I'm Juliet, your AI Beauty & Glam Consultant. Ask me anything about skin prep, shade matching, everyday glam routines, or booking a pro session with me! ✨",
      timestamp: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "✨ Best skin prep before foundation?",
    "💄 Which lip shade for warm undertones?",
    "🌸 How to make blush stay all day in humidity?",
    "📅 How do I book a bridal session with Juliet?",
  ];

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation history for API
      const historyPayload = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: historyPayload,
          message: query,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to reach Juliet API');
      }

      const data = await res.json();
      const julietMsg: ChatMessage = {
        id: 'juliet_' + Date.now(),
        sender: 'juliet',
        text: data.reply || "I'm so glad you asked! How else can I help you sparkle today? ♡",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, julietMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'juliet',
          text: "Pole sana! I'm having a small connection hiccup. Please try asking again in a moment ♡",
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md h-[90vh] sm:h-[650px] flex flex-col justify-between shadow-2xl overflow-hidden relative border border-pink-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 p-4 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-bold text-sm shadow-2xs">
              💋
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif font-bold text-sm leading-tight">Juliet</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[10.5px] text-pink-100 font-medium">
                AI Beauty & Glam Companion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-pink-50/40 via-white to-pink-50/20">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'juliet' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white shrink-0 flex items-center justify-center text-xs shadow-2xs font-bold">
                  💋
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-tr-xs font-medium'
                    : 'bg-white border border-pink-100 text-gray-800 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Detect Product Recommendations */}
                {msg.sender === 'juliet' && (
                  <div className="mt-2 pt-2 border-t border-pink-100 flex flex-wrap gap-1.5">
                    {PRODUCTS.filter((p) => msg.text.toLowerCase().includes(p.name.toLowerCase())).map(
                      (product) => (
                        <button
                          key={product.id}
                          onClick={() => {
                            onClose();
                            setActiveTab('shop');
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-pink-50 text-[10px] font-bold text-pink-700 hover:bg-pink-100 border border-pink-200 transition-colors cursor-pointer"
                        >
                          <ShoppingBag className="w-3 h-3 text-pink-500" />
                          <span>View {product.name} (KSh {product.priceKSh.toLocaleString()})</span>
                        </button>
                      )
                    )}
                  </div>
                )}

                <span
                  className={`text-[9px] mt-1 block text-right font-medium ${
                    msg.sender === 'user' ? 'text-pink-100' : 'text-gray-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 shrink-0 flex items-center justify-center text-xs font-bold">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-gray-500 text-xs">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white shrink-0 flex items-center justify-center text-xs font-bold animate-pulse">
                💋
              </div>
              <div className="bg-white border border-pink-100 p-2.5 rounded-2xl rounded-tl-xs shadow-2xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-[10px] font-medium text-pink-600 ml-1">Juliet is typing...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-white border-t border-pink-100 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="shrink-0 px-2.5 py-1 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-200 text-[10px] font-bold text-pink-700 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-pink-100 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask Juliet about makeup, skin or products..."
            className="flex-1 bg-pink-50/60 border border-pink-200 rounded-2xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-pink-500 font-medium"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="w-10 h-10 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center justify-center disabled:opacity-50 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
