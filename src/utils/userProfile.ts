export interface UserProfile {
  name: string;
  beautyName: string;
  avatarUrl?: string; // Base64 image data URL stored locally
  bio?: string;
  skinType?: string;
  favoriteShade?: string;
}

const STORAGE_KEY_USER_PROFILE = 'juliet_user_profile_v1';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Beauty',
  beautyName: "Juliet's Makeup Desk",
  avatarUrl: '',
  bio: 'Passionate about glowy skin, nude lip combos, and effortless daily beauty ♡',
  skinType: 'Combination Glow',
  favoriteShade: 'Nairobi Red',
};

export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_PROFILE);
    if (!raw) return DEFAULT_USER_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_USER_PROFILE,
      ...parsed,
    };
  } catch (e) {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(updates: Partial<UserProfile>): UserProfile {
  const current = getUserProfile();
  const updated: UserProfile = {
    ...current,
    ...updates,
  };

  try {
    localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(updated));
    // Dispatch custom event so app components update reactively
    window.dispatchEvent(new CustomEvent('juliet-user-profile-updated', { detail: updated }));
  } catch (e) {
    console.error('Failed to save user profile to localStorage', e);
  }

  return updated;
}
