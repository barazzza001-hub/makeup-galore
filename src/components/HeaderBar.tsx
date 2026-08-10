import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Palette, X, User } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { getUserProfile, UserProfile } from '../utils/userProfile';

interface HeaderBarProps {
  onOpenMirror?: () => void;
  onOpenJulietChat?: () => void;
  savedCount?: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onOpenMirror,
  onOpenJulietChat,
  savedCount = 0,
}) => {
  const [showThemePopover, setShowThemePopover] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>(getUserProfile);

  useEffect(() => {
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<UserProfile>;
      if (customEvent.detail) {
        setProfile(customEvent.detail);
      }
    };
    window.addEventListener('juliet-user-profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('juliet-user-profile-updated', handleProfileUpdate);
  }, []);

  const handleThemeChanged = (themeName: string) => {
    setToastMsg(`Switched to ${themeName} Background 💋`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-pink-100 px-4 py-2.5 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-8 h-8 rounded-full object-cover border border-pink-300 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-400 via-rose-300 to-pink-200 flex items-center justify-center text-white shadow-xs shrink-0">
                <span className="text-sm select-none">💋</span>
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-serif font-bold text-sm tracking-tight text-gray-900 leading-none truncate max-w-[130px]">
                {profile.name ? `${profile.name.toUpperCase()}'S` : "JULIET'S"}
              </h1>
              <span className="text-[9px] font-bold tracking-wider text-pink-600 uppercase block truncate max-w-[140px]">
                {profile.beautyName ? profile.beautyName : 'MAKEUP GALORE'} <span className="text-rose-400">♡</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 relative">
            <button
              onClick={() => setShowThemePopover((prev) => !prev)}
              className={`p-1.5 border rounded-full transition-colors cursor-pointer shadow-2xs active:scale-95 ${
                showThemePopover
                  ? 'bg-pink-600 text-white border-pink-600'
                  : 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100'
              }`}
              title="Change Background Theme Pattern"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenJulietChat}
              className="flex items-center gap-1.5 bg-pink-50 border border-pink-200 text-pink-700 text-xs font-semibold px-2.5 py-1.5 rounded-full hover:bg-pink-100 transition-colors cursor-pointer shadow-2xs"
            >
              <span>Ask Juliet 💋</span>
            </button>

            <button
              onClick={onOpenMirror}
              className="flex items-center gap-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-full shadow-2xs hover:opacity-95 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mirror</span>
            </button>
          </div>
        </div>
      </header>

      {/* Theme Popover Modal Overlay */}
      {showThemePopover && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 px-4 bg-black/20 backdrop-blur-xs animate-fade-in" onClick={() => setShowThemePopover(false)}>
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-4 shadow-2xl border border-pink-200 relative space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1 border-b border-pink-100">
              <span className="text-xs font-serif font-bold text-gray-900 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-pink-600" />
                <span>Select Background Theme Pattern</span>
              </span>
              <button
                onClick={() => setShowThemePopover(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ThemeSwitcher
              variant="inline"
              onThemeChanged={(name) => {
                handleThemeChanged(name);
                setShowThemePopover(false);
              }}
            />
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-pink-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-pink-300 animate-fade-in pointer-events-none">
          {toastMsg}
        </div>
      )}
    </>
  );
};


