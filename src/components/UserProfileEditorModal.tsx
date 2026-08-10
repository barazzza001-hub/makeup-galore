import React, { useState, useRef } from 'react';
import { User, Camera, Sparkles, X, Check, Heart, Shield, Trash2 } from 'lucide-react';
import { UserProfile, getUserProfile, saveUserProfile } from '../utils/userProfile';
import { showJulietToast } from './ToastNotification';

interface UserProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: UserProfile) => void;
}

export const UserProfileEditorModal: React.FC<UserProfileEditorModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState<UserProfile>(getUserProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showJulietToast("Image size must be under 5MB, darling", "info");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setProfile((prev) => ({ ...prev, avatarUrl: result }));
      showJulietToast("Private avatar updated! ♡", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setProfile((prev) => ({ ...prev, avatarUrl: '' }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveUserProfile(profile);
    if (onProfileUpdated) onProfileUpdated(updated);
    showJulietToast(`Welcome, ${updated.name}! Your beauty desk is personalized ♡`, "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl border border-pink-100 max-h-[90vh] overflow-y-auto space-y-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pink-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-sm">
              <Sparkles className="w-4 h-4 text-pink-500" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-gray-900 leading-tight">
                Personalize Your Vanity
              </h3>
              <p className="text-[10px] text-pink-600 font-medium">
                Set your private profile picture, name & beauty desk title
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* PRIVATE AVATAR UPLOAD SECTION */}
          <div className="flex flex-col items-center justify-center space-y-2 bg-pink-50/50 p-4 rounded-2xl border border-pink-100/80">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full border-2 border-pink-300 shadow-md overflow-hidden bg-white flex items-center justify-center text-pink-300">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-pink-300" />
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 bg-pink-600 text-white rounded-full shadow-md hover:bg-pink-700 transition-all active:scale-95 cursor-pointer"
                title="Upload Private Profile Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              className="hidden"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-pink-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Upload Profile Photo</span>
              </button>

              {profile.avatarUrl && (
                <>
                  <span className="text-gray-300">·</span>
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-[11px] font-semibold text-rose-500 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-white/80 px-2.5 py-1 rounded-full border border-pink-200/50">
              <Shield className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>100% Private to your browser — never uploaded externally</span>
            </div>
          </div>

          {/* NAME FIELD */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-800">
              Your Name <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="e.g. Juliet or Sophia"
              className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none text-xs bg-white text-gray-900 font-medium"
            />
            <p className="text-[10px] text-gray-400">
              Used for personalized greetings like "Hi, {profile.name || 'Beautiful'}!"
            </p>
          </div>

          {/* BEAUTY NAME / DESK TITLE FIELD */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-800">
              Your Personal Beauty Name / Desk Title <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              required
              value={profile.beautyName}
              onChange={(e) => setProfile({ ...profile, beautyName: e.target.value })}
              placeholder="e.g. Sophia's Beauty Studio or Juliet's Makeup Desk"
              className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none text-xs bg-white text-gray-900 font-medium"
            />
            <p className="text-[10px] text-gray-400">
              Appears as the main banner title on your Home screen and header
            </p>
          </div>

          {/* BIO / MOTTO */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-800">
              Beauty Bio / Tagline
            </label>
            <input
              type="text"
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="e.g. Lip gloss lover & dewy skin addict ♡"
              className="w-full px-3.5 py-2 rounded-xl border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none text-xs bg-white text-gray-900"
            />
          </div>

          {/* EXTRA DETAILS: SKIN TYPE & FAVORITE SHADE */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-gray-700">Skin Type</label>
              <select
                value={profile.skinType || 'Combination Glow'}
                onChange={(e) => setProfile({ ...profile, skinType: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-pink-200 text-xs bg-white text-gray-800 outline-none"
              >
                <option value="Combination Glow">Combination Glow</option>
                <option value="Normal Radiance">Normal Radiance</option>
                <option value="Dry Dewy">Dry Dewy</option>
                <option value="Oily Velvet">Oily Velvet</option>
                <option value="Sensitive Soft">Sensitive Soft</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-gray-700">Signature Shade</label>
              <input
                type="text"
                value={profile.favoriteShade || ''}
                onChange={(e) => setProfile({ ...profile, favoriteShade: e.target.value })}
                placeholder="e.g. Nairobi Red"
                className="w-full px-2.5 py-2 rounded-xl border border-pink-200 text-xs bg-white text-gray-800 outline-none"
              />
            </div>
          </div>

          {/* SAVE BUTTON */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-bold text-xs rounded-2xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save Personal Beauty Vanity</span>
          </button>
        </form>
      </div>
    </div>
  );
};
