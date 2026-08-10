import React, { useState, useEffect } from 'react';
import {
  Heart,
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  X,
  Camera,
  Check,
  User,
  Wand2,
  Settings2,
  Shield,
  LogOut,
  LogIn,
  ShoppingBag,
  ShieldCheck,
} from 'lucide-react';
import { SavedLook, JournalEntry, TabType, UserAccount } from '../types';
import { SavedLookCard } from './SavedLookCard';
import { ThemeSwitcher } from './ThemeSwitcher';
import { NotificationSettingsCard } from './NotificationSettingsCard';
import { getUserProfile, UserProfile } from '../utils/userProfile';
import { UserProfileEditorModal } from './UserProfileEditorModal';
import { MyOrdersSection } from './MyOrdersSection';
import { ContactSection } from './ContactSection';
import { AdminDashboard } from './AdminDashboard';
import { logoutUser } from '../services/authService';
import { showJulietToast } from './ToastNotification';

interface ProfilePageProps {
  savedLooks: SavedLook[];
  journalEntries: JournalEntry[];
  onOpenEditor: (imageSrc: string) => void;
  onDeleteSavedLook: (id: string) => void;
  onAddJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  onDeleteJournalEntry: (id: string) => void;
  setActiveTab: (tab: TabType) => void;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  savedLooks,
  journalEntries,
  onOpenEditor,
  onDeleteSavedLook,
  onAddJournalEntry,
  onDeleteJournalEntry,
  setActiveTab,
  currentUser = null,
  onOpenAuthModal,
}) => {
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [journalMood, setJournalMood] = useState<JournalEntry['mood']>('✨ Feeling Glam');

  const [profile, setProfile] = useState<UserProfile>(getUserProfile);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

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

  const handleLogout = async () => {
    await logoutUser();
    showJulietToast('Signed out of your vanity account', 'info');
  };

  const handleCreateJournalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalTitle.trim() || !journalContent.trim()) return;

    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    onAddJournalEntry({
      date: dateStr,
      title: journalTitle,
      content: journalContent,
      mood: journalMood,
    });

    setJournalTitle('');
    setJournalContent('');
    setShowJournalModal(false);
  };

  const displayName = currentUser?.displayName || profile.name;
  const beautyDeskName = currentUser?.beautyName || profile.beautyName;

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-6">
      {/* Profile Header Card */}
      <section className="bg-gradient-to-b from-pink-100/90 via-rose-50 to-white rounded-3xl p-5 border border-pink-200/60 shadow-xs relative overflow-hidden text-center space-y-3">
        <div className="absolute top-2 right-4 text-pink-300 text-lg">✦</div>
        <div className="absolute top-2 left-4 text-pink-200 text-lg">♡</div>

        {/* Profile Avatar with Camera upload trigger */}
        <div className="relative inline-block group">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-400 via-rose-300 to-amber-200 p-1 mx-auto shadow-md overflow-hidden">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-3xl select-none text-pink-400 font-bold">
                <User className="w-9 h-9" />
              </div>
            )}
          </div>

          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="absolute bottom-0 right-0 p-1.5 bg-pink-600 text-white rounded-full shadow-md hover:bg-pink-700 transition-all active:scale-95 cursor-pointer"
            title="Upload or Change Private Profile Picture"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-bold text-gray-900">
            Hi, {displayName}! <span className="text-pink-500">♡</span>
          </h2>
          <p className="text-xs font-bold text-pink-600 uppercase tracking-wider">
            {beautyDeskName}
          </p>

          {currentUser ? (
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center justify-center gap-1">
              <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />
              <span>Signed In as {currentUser.email} ({currentUser.role})</span>
            </p>
          ) : (
            <p className="text-[11px] text-gray-500">
              Sign in to sync your saved looks, track orders, and join the circle.
            </p>
          )}

          <div className="flex items-center justify-center gap-2 pt-1">
            {profile.skinType && (
              <span className="text-[10px] font-semibold bg-pink-100/80 text-pink-700 px-2.5 py-0.5 rounded-full border border-pink-200">
                ✨ {profile.skinType}
              </span>
            )}
            {profile.favoriteShade && (
              <span className="text-[10px] font-semibold bg-rose-100/80 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200">
                💄 {profile.favoriteShade}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls: Sign In / Out & Admin Portal */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          {currentUser ? (
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold px-3 py-1.5 rounded-full shadow-2xs transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md hover:opacity-95 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Create Account</span>
            </button>
          )}

          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="inline-flex items-center gap-1 bg-white border border-pink-300 text-pink-700 hover:bg-pink-50 text-xs font-bold px-3 py-1.5 rounded-full shadow-2xs transition-all cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-pink-500" />
            <span>Edit Profile</span>
          </button>

          {/* Admin Portal Button */}
          <button
            onClick={() => setIsAdminDashboardOpen(true)}
            className="inline-flex items-center gap-1 bg-gray-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md transition-all cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="pt-2 flex items-center justify-around border-t border-pink-100 text-xs text-gray-600">
          <div>
            <span className="font-bold text-base text-gray-900 block">{savedLooks.length}</span>
            <span className="text-[10px] text-gray-500">Saved Looks</span>
          </div>
          <div className="w-px h-6 bg-pink-100" />
          <div>
            <span className="font-bold text-base text-gray-900 block">{journalEntries.length}</span>
            <span className="text-[10px] text-gray-500">Journal Notes</span>
          </div>
        </div>
      </section>

      {/* MY ORDERS SECTION */}
      {currentUser && <MyOrdersSection customerId={currentUser.uid} />}

      {/* CONTACT JULIET SECTION */}
      <ContactSection />

      {/* Re-engagement & Beauty Notification Reminders */}
      <NotificationSettingsCard />

      {/* Theme Switcher Widget */}
      <ThemeSwitcher variant="inline" />

      {/* MY SAVED LOOKS SECTION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="font-serif text-base font-bold text-gray-900 flex items-center gap-1.5">
              <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
              <span>MY SAVED LOOKS</span>
            </h3>
            {savedLooks.length > 0 && (
              <p className="text-[10px] text-pink-500 font-medium ml-5">
                👈 Swipe left on any card to delete
              </p>
            )}
          </div>
          <span className="text-xs text-pink-600 font-medium">{savedLooks.length} items</span>
        </div>

        {savedLooks.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-pink-100 text-center space-y-2 shadow-xs">
            <p className="text-xs font-semibold text-gray-800">Your looks will live here ♡</p>
            <p className="text-[11px] text-gray-500">
              Save your favorite makeup creations from the Beauty Mirror and come back anytime.
            </p>
            <button
              onClick={() => setActiveTab('mirror')}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-xs font-semibold shadow-2xs hover:opacity-95 transition-all cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Open Beauty Mirror</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {savedLooks.map((look) => (
              <SavedLookCard
                key={look.id}
                look={look}
                onOpenEditor={onOpenEditor}
                onDelete={onDeleteSavedLook}
              />
            ))}
          </div>
        )}
      </section>

      {/* BEAUTY JOURNAL SECTION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="font-serif text-base font-bold text-gray-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-pink-500" />
              <span>BEAUTY JOURNAL</span>
            </h3>
            <p className="text-[10px] text-gray-500 font-medium">Your space, your story ♡</p>
          </div>

          <button
            onClick={() => setShowJournalModal(true)}
            className="flex items-center gap-1 bg-pink-50 border border-pink-200 text-pink-700 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-pink-100 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>

        {journalEntries.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 border border-pink-100 text-center text-xs text-gray-500 shadow-xs">
            No journal entries yet. Tap 'New Note' to record your daily makeup routine or skincare story.
          </div>
        ) : (
          <div className="space-y-3">
            {journalEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-2xl p-4 border border-pink-100 shadow-xs space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold bg-pink-50 text-pink-600 px-2.5 py-0.5 rounded-full border border-pink-100">
                    {entry.mood}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-medium">{entry.date}</span>
                    <button
                      onClick={() => onDeleteJournalEntry(entry.id)}
                      className="text-gray-300 hover:text-rose-500 transition-colors p-0.5 cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-serif font-bold text-sm text-gray-900">{entry.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{entry.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* NEW JOURNAL ENTRY MODAL */}
      {showJournalModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md p-4 flex items-center justify-center animate-fade-in">
          <form
            onSubmit={handleCreateJournalEntry}
            className="bg-white text-gray-900 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-pink-100 pb-2">
              <h3 className="font-serif font-bold text-base flex items-center gap-1.5 text-gray-900">
                <BookOpen className="w-4 h-4 text-pink-500" />
                <span>Beauty Journal Note</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowJournalModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-gray-700 block mb-1">Title:</label>
                <input
                  type="text"
                  required
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  placeholder="e.g. Morning Soft Glam Combo"
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 text-xs focus:outline-none focus:border-pink-500 bg-pink-50/20"
                />
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-1">Mood / Vibe:</label>
                <select
                  value={journalMood}
                  onChange={(e) => setJournalMood(e.target.value as JournalEntry['mood'])}
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 text-xs focus:outline-none focus:border-pink-500 bg-white"
                >
                  <option value="✨ Feeling Glam">✨ Feeling Glam</option>
                  <option value="🌸 Fresh & Natural">🌸 Fresh & Natural</option>
                  <option value="💄 Bold & Confident">💄 Bold & Confident</option>
                  <option value="☁️ Soft & Dreamy">☁️ Soft & Dreamy</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-1">Journal Note:</label>
                <textarea
                  required
                  rows={3}
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  placeholder="Write your beauty thoughts, product combos, or skincare routine..."
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 text-xs focus:outline-none focus:border-pink-500 bg-pink-50/20"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowJournalModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-2xl hover:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold rounded-2xl shadow-xs hover:opacity-95 cursor-pointer"
              >
                Save Note ♡
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Profile & Beauty Title Modal */}
      <UserProfileEditorModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onProfileUpdated={(updated) => setProfile(updated)}
      />

      {/* Admin Dashboard Portal */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
};

