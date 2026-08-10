import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, User, Heart, Shield, CheckCircle2 } from 'lucide-react';
import { signUpWithEmail, loginWithEmail } from '../services/authService';
import { showJulietToast } from './ToastNotification';
import { UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [beautyName, setBeautyName] = useState("Juliet's Makeup Desk");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please enter an email and password');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        const account = await signUpWithEmail(
          email,
          password,
          displayName.trim() || 'Beauty',
          beautyName.trim() || "Juliet's Makeup Desk"
        );
        showJulietToast(`Welcome to Juliet's Beauty Circle, ${account.displayName}! ♡`, 'success');
        onAuthSuccess(account);
        onClose();
      } else {
        const account = await loginWithEmail(email, password);
        showJulietToast(`Welcome back, ${account.displayName}! ♡`, 'success');
        onAuthSuccess(account);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-pink-100 relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pink-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-pink-500" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-gray-900 leading-tight">
                {mode === 'login' ? 'Customer Sign In' : 'Create Beauty Account'}
              </h3>
              <p className="text-[10px] text-pink-600 font-medium">
                Juliet's Makeup Galore Account
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">Display Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name (e.g. Juliet)"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-pink-200 text-xs text-gray-900 focus:border-pink-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">Beauty Desk Title</label>
                <input
                  type="text"
                  value={beautyName}
                  onChange={(e) => setBeautyName(e.target.value)}
                  placeholder="e.g. Juliet's Makeup Desk"
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs text-gray-900 focus:border-pink-500 outline-none"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-gray-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-pink-200 text-xs text-gray-900 focus:border-pink-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-gray-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-pink-200 text-xs text-gray-900 focus:border-pink-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-bold text-xs rounded-2xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Heart className="w-4 h-4 fill-white text-white" />
            <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In to My Vanity' : 'Create My Account'}</span>
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center pt-2 border-t border-pink-100">
          <p className="text-xs text-gray-600">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode(mode === 'login' ? 'signup' : 'login');
              }}
              className="ml-1 font-bold text-pink-600 hover:underline cursor-pointer"
            >
              {mode === 'login' ? 'Create one now' : 'Sign In'}
            </button>
          </p>
        </div>

        <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 pt-1">
          <Shield className="w-3 h-3 text-emerald-500" />
          <span>Secured with Firebase Authentication</span>
        </div>
      </div>
    </div>
  );
};
