import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Heart, Bell, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'tip' | 'info' | 'reminder';

export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
  title?: string;
  duration?: number;
}

export const JULIET_BEAUTY_TIPS = [
  "✦ Juliet Tip: Apply liquid highlighter before foundation for an effortless glow from within ♡",
  "✦ Juliet Tip: Blot lip liner gently with your finger to create a soft, blurred petal pout ✨",
  "✦ Juliet Tip: Set your concealer with a tiny sweep of translucent powder to avoid fine-line creasing ♡",
  "✦ Juliet Tip: Spray setting mist onto your makeup sponge before dabbing on blush for 12hr vibrancy 💋",
  "✦ Juliet Tip: Hydrate lips with lip oil 5 minutes before applying matte lipstick for a flawless satin finish ✨",
];

// Custom Event helper to emit toast from anywhere
export function showJulietToast(message: string, type: ToastType = 'success', title?: string) {
  const event = new CustomEvent('juliet-toast-event', {
    detail: {
      id: 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      message,
      type,
      title,
      duration: type === 'tip' ? 4500 : 3500,
    },
  });
  window.dispatchEvent(event);
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ToastItem>;
      if (customEvent.detail) {
        setToasts((prev) => [customEvent.detail, ...prev.slice(0, 2)]);
      }
    };

    window.addEventListener('juliet-toast-event', handleToastEvent);
    return () => {
      window.removeEventListener('juliet-toast-event', handleToastEvent);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-14 left-0 right-0 z-50 pointer-events-none flex flex-col items-center px-4 gap-2">
      {toasts.map((toast) => (
        <ToastBanner key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

interface ToastBannerProps {
  toast: ToastItem;
  onDismiss: () => void;
}

const ToastBanner: React.FC<ToastBannerProps> = ({ toast, onDismiss }) => {
  const { message, type = 'success', title, duration = 3500 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const getIcon = () => {
    switch (type) {
      case 'tip':
        return <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />;
      case 'reminder':
        return <Bell className="w-4 h-4 text-pink-200 shrink-0" />;
      case 'info':
        return <Info className="w-4 h-4 text-pink-200 shrink-0" />;
      case 'success':
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />;
    }
  };

  const getBgStyle = () => {
    switch (type) {
      case 'tip':
        return 'bg-gradient-to-r from-purple-900/95 via-pink-900/95 to-rose-900/95 border-pink-400/40 text-pink-50';
      case 'reminder':
        return 'bg-gradient-to-r from-pink-800/95 via-rose-800/95 to-pink-900/95 border-pink-300/40 text-pink-50';
      case 'info':
        return 'bg-gray-900/95 border-pink-400/30 text-pink-100';
      case 'success':
      default:
        return 'bg-gradient-to-r from-pink-600/95 to-rose-600/95 border-pink-300/50 text-white';
    }
  };

  return (
    <div
      className={`pointer-events-auto w-full max-w-sm rounded-2xl p-3 shadow-xl border backdrop-blur-md flex items-center justify-between gap-2.5 transition-all animate-slide-down ${getBgStyle()}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1.5 rounded-full bg-white/10 shrink-0">{getIcon()}</div>
        <div className="min-w-0 flex-1">
          {title && (
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-pink-200 leading-tight">
              {title}
            </h4>
          )}
          <p className="text-xs font-medium leading-snug break-words">
            {message}
          </p>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
