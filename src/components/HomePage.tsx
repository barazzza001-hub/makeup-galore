import React, { useState, useEffect } from 'react';
import { Sparkles, Camera, Image as ImageIcon, Video, ShoppingBag, Heart, ArrowRight, Wand2, Bell, ChevronLeft, ChevronRight, Lightbulb, User, Settings2 } from 'lucide-react';
import { TabType } from '../types';
import { BEAUTY_TIPS } from '../data/mockData';
import { getUserProfile, UserProfile } from '../utils/userProfile';
import { UserProfileEditorModal } from './UserProfileEditorModal';

interface HomePageProps {
  setActiveTab: (tab: TabType) => void;
  onImportPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenVideoStudio: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setActiveTab,
  onImportPhoto,
  onOpenVideoStudio,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile>(getUserProfile);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);

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

  // Calculate daily tip index based on current date
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
  const initialTipIdx = dayOfYear % BEAUTY_TIPS.length;

  const [currentTipIdx, setCurrentTipIdx] = useState<number>(initialTipIdx);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  const activeTip = BEAUTY_TIPS[currentTipIdx] || BEAUTY_TIPS[0];

  const handleNextTip = () => {
    setCurrentTipIdx((prev) => (prev + 1) % BEAUTY_TIPS.length);
  };

  const handlePrevTip = () => {
    setCurrentTipIdx((prev) => (prev - 1 + BEAUTY_TIPS.length) % BEAUTY_TIPS.length);
  };

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-5">
      {/* Hidden File Input for Direct Edit Photo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onImportPhoto}
        className="hidden"
      />

      {/* DAILY BEAUTY TIP NOTIFICATION CARD */}
      {!isDismissed && (
        <section className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 p-0.5 rounded-3xl shadow-md transition-all duration-300">
          <div className="bg-white rounded-[22px] p-4 relative overflow-hidden">
            {/* Background Accent Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100/60 rounded-full blur-2xl -z-0" />

            {/* Header / Meta Row */}
            <div className="relative z-10 flex items-center justify-between pb-2 border-b border-pink-100/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs shadow-2xs">
                  <Lightbulb className="w-4 h-4 fill-pink-500 text-pink-500" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600 block">
                    Daily Beauty Tip ✦ Rotates Daily
                  </span>
                  <span className="text-[11px] font-bold text-gray-800">
                    {activeTip.icon} {activeTip.title}
                  </span>
                </div>
              </div>

              {/* Prev / Next Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevTip}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-pink-50 transition-colors cursor-pointer"
                  title="Previous Tip"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-semibold text-pink-600 px-1">
                  {currentTipIdx + 1}/{BEAUTY_TIPS.length}
                </span>
                <button
                  onClick={handleNextTip}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-pink-50 transition-colors cursor-pointer"
                  title="Next Tip"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tip Body */}
            <div className="relative z-10 pt-2.5 space-y-2">
              <p className="text-xs text-gray-700 leading-relaxed font-normal">
                "{activeTip.tip}"
              </p>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-pink-600 font-medium italic">
                  — {activeTip.author}
                </span>

                <button
                  onClick={() => setActiveTab('shop')}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3 h-3 text-pink-500" />
                  <span>Shop Recommendation</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-pink-100/90 via-rose-50/50 to-white p-5 border border-pink-200/60 shadow-xs space-y-4">
        <div className="absolute top-3 right-3 text-pink-300 select-none animate-bounce">
          ✦
        </div>
        <div className="absolute bottom-2 right-6 text-pink-200 text-2xl select-none">
          ♡
        </div>

        {/* Personalized User Greeting Header Banner */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5">
            <div className="relative group cursor-pointer" onClick={() => setIsEditProfileOpen(true)}>
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-pink-400 shadow-xs"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-400 to-rose-300 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-pink-600 text-white p-0.5 rounded-full shadow-2xs">
                <Camera className="w-2.5 h-2.5" />
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                <span>Hi, {profile.name}! 👋</span>
              </span>
              <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-pink-600 block">
                {profile.beautyName}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="flex items-center gap-1 text-[10.5px] font-bold text-pink-700 bg-white hover:bg-pink-50 border border-pink-200 px-2.5 py-1.5 rounded-full shadow-2xs transition-all cursor-pointer active:scale-95"
            title="Edit profile photo, name & beauty desk title"
          >
            <Settings2 className="w-3 h-3 text-pink-500" />
            <span>Personalize</span>
          </button>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900 leading-tight mb-1">
            Your beauty, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-amber-600">
              your space. ♡
            </span>
          </h2>

          <p className="text-gray-600 text-xs leading-relaxed max-w-xs mb-3">
            Welcome to {profile.beautyName}. Explore virtual beauty looks, snap studio selfies, refine photos, and curate your personal makeup shelf.
          </p>
        </div>

        {/* Large BEAUTY MIRROR Feature Card */}
        <div 
          onClick={() => setActiveTab('mirror')}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 p-5 text-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-[0.98]"
        >
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs font-medium text-pink-100">
                <Wand2 className="w-3.5 h-3.5 text-amber-200" />
                <span>FEATURED EXPERIENCE</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                BEAUTY MIRROR 💋
              </h3>
              <p className="text-[11px] text-pink-100/90 max-w-[200px]">
                Live camera with instant filter presets, lip tints, and photo capture.
              </p>
            </div>
            
            <div className="w-11 h-11 rounded-full bg-white text-pink-600 flex items-center justify-center shadow-md group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
        </div>
      </section>

      {/* "Your Vanity" Quick Actions Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-serif text-base font-bold text-gray-900 flex items-center gap-1.5">
            <span>Your Vanity</span>
            <span className="text-pink-400 text-sm">✦</span>
          </h3>
          <span className="text-[11px] text-gray-400 font-medium">Quick Tools</span>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {/* 1. Beauty Camera */}
          <button
            onClick={() => setActiveTab('mirror')}
            className="group flex flex-col justify-between p-4 bg-white rounded-2xl border border-pink-100 shadow-xs hover:border-pink-300 hover:shadow-sm transition-all duration-200 text-left cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-3 group-hover:bg-pink-500 group-hover:text-white transition-colors">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900 group-hover:text-pink-600 transition-colors">
                Beauty Camera
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Open live selfie mirror
              </p>
            </div>
          </button>

          {/* 2. Edit Photo */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="group flex flex-col justify-between p-4 bg-white rounded-2xl border border-pink-100 shadow-xs hover:border-pink-300 hover:shadow-sm transition-all duration-200 text-left cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900 group-hover:text-rose-600 transition-colors">
                Edit Photo
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Import & enhance photos
              </p>
            </div>
          </button>

          {/* 3. Edit Video */}
          <button
            onClick={onOpenVideoStudio}
            className="group flex flex-col justify-between p-4 bg-white rounded-2xl border border-pink-100 shadow-xs hover:border-pink-300 hover:shadow-sm transition-all duration-200 text-left cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-gray-900 group-hover:text-purple-600 transition-colors">
                  Edit Video
                </h4>
                <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Apply video filter presets
              </p>
            </div>
          </button>

          {/* 4. Makeup Shelf */}
          <button
            onClick={() => setActiveTab('shop')}
            className="group flex flex-col justify-between p-4 bg-white rounded-2xl border border-pink-100 shadow-xs hover:border-pink-300 hover:shadow-sm transition-all duration-200 text-left cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900 group-hover:text-amber-600 transition-colors">
                Makeup Shelf
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Explore products in KSh
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Pretty Girl Beauty Quote Banner */}
      <section className="bg-gradient-to-r from-amber-50/80 via-pink-50/80 to-rose-50/80 rounded-2xl p-4 border border-pink-200/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-pink-500 shadow-xs shrink-0 text-base">
          💋
        </div>
        <div className="space-y-0.5">
          <p className="font-serif italic text-xs text-gray-800 font-medium">
            "Beauty begins the moment you decide to be yourself."
          </p>
          <span className="text-[10px] text-pink-600 font-semibold tracking-wide block">
            — Juliet's Daily Affirmation ♡
          </span>
        </div>
      </section>

      {/* Quick Beauty Tips Showcase */}
      <section className="bg-white rounded-2xl p-4 border border-pink-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-pink-600 flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
            Pretty Girl Routine
          </span>
          <span className="text-[10px] bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full font-medium">
            Vanity Guide
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
          <div className="p-2.5 rounded-xl bg-pink-50/50 border border-pink-100">
            <span className="text-base block mb-1">✨</span>
            <span className="font-medium text-gray-800 block">1. Prep Skin</span>
            <span className="text-[9px] text-gray-500">Hydrate & Prime</span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100">
            <span className="text-base block mb-1">💄</span>
            <span className="font-medium text-gray-800 block">2. Mirror Try-On</span>
            <span className="text-[9px] text-gray-500">Pick lip & blush</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100">
            <span className="text-base block mb-1">📸</span>
            <span className="font-medium text-gray-800 block">3. Save Look</span>
            <span className="text-[9px] text-gray-500">Add to Vanity</span>
          </div>
        </div>
      </section>

      {/* User Profile & Beauty Desk Title Personalization Modal */}
      <UserProfileEditorModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onProfileUpdated={(updated) => setProfile(updated)}
      />
    </div>
  );
};
