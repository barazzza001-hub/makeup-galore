import { JULIET_BEAUTY_TIPS, showJulietToast } from '../components/ToastNotification';

const STORAGE_KEY_PUSH_ENABLED = 'juliet_push_notifications_enabled';
const STORAGE_KEY_REMINDER_TIME = 'juliet_daily_reminder_time';

export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getPushPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

export function isPushEnabledInStorage(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_PUSH_ENABLED) === 'true';
  } catch (e) {
    return false;
  }
}

export function setPushEnabledInStorage(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY_PUSH_ENABLED, enabled ? 'true' : 'false');
  } catch (e) {
    console.error(e);
  }
}

export async function requestPushPermission(): Promise<boolean> {
  if (!isPushSupported()) {
    showJulietToast("Web Notifications are not supported in this browser environment", 'info');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setPushEnabledInStorage(true);
      sendNativeNotification(
        "💋 Juliet's Beauty Circle Connected!",
        "You'll receive daily glow reminders, personalized makeup tips & appointment updates."
      );
      showJulietToast("Push notifications enabled! You'll receive daily beauty reminders ♡", 'success');
      return true;
    } else {
      setPushEnabledInStorage(false);
      showJulietToast("Notification permission was denied.", 'info');
      return false;
    }
  } catch (err) {
    console.error("Failed to request push permission", err);
    return false;
  }
}

export function sendNativeNotification(title: string, body: string) {
  if (!isPushSupported()) return;

  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: '/vanity-pattern.svg',
        badge: '/vanity-pattern.svg',
        tag: 'juliet-beauty-reminder-' + Date.now(),
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (e) {
      console.warn("Could not dispatch native notification", e);
    }
  }
}

// Background re-engagement listener when user switches away from app
let backgroundTimer: NodeJS.Timeout | null = null;

export function initReengagementListener() {
  if (typeof window === 'undefined') return;

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      if (isPushEnabledInStorage() && Notification.permission === 'granted') {
        // Schedule a re-engagement notification after 10 seconds of being away
        if (backgroundTimer) clearTimeout(backgroundTimer);
        backgroundTimer = setTimeout(() => {
          const randomTip = JULIET_BEAUTY_TIPS[Math.floor(Math.random() * JULIET_BEAUTY_TIPS.length)];
          sendNativeNotification(
            "💋 Don't forget your daily glow, darling!",
            `${randomTip.replace("✦ Juliet Tip: ", "")} Tap to open Juliet's Beauty Galore ✨`
          );
        }, 10000);
      }
    } else {
      if (backgroundTimer) {
        clearTimeout(backgroundTimer);
        backgroundTimer = null;
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
}
