import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Sparkles, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  isPushSupported,
  getPushPermission,
  isPushEnabledInStorage,
  setPushEnabledInStorage,
  requestPushPermission,
  sendNativeNotification,
} from '../utils/pushNotifications';
import { showJulietToast, JULIET_BEAUTY_TIPS } from './ToastNotification';

export const NotificationSettingsCard: React.FC = () => {
  const [supported, setSupported] = useState<boolean>(true);
  const [permission, setPermission] = useState<string>('default');
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  useEffect(() => {
    const isSupp = isPushSupported();
    setSupported(isSupp);
    setPermission(getPushPermission());
    setIsEnabled(isPushEnabledInStorage() && getPushPermission() === 'granted');
  }, []);

  const handleToggle = async () => {
    if (!isEnabled) {
      const granted = await requestPushPermission();
      setPermission(getPushPermission());
      setIsEnabled(granted);
    } else {
      setPushEnabledInStorage(false);
      setIsEnabled(false);
      showJulietToast("Push reminders paused. You can re-enable anytime ♡", 'info');
    }
  };

  const handleSendTestPush = () => {
    if (permission !== 'granted') {
      requestPushPermission();
      return;
    }
    const randomTip = JULIET_BEAUTY_TIPS[Math.floor(Math.random() * JULIET_BEAUTY_TIPS.length)];
    sendNativeNotification(
      "💋 Juliet's Beauty Alert!",
      randomTip.replace("✦ Juliet Tip: ", "Juliet says: ")
    );
    showJulietToast("Test push notification dispatched to your device! 🔔", 'success');
  };

  const handleTriggerToastTip = () => {
    const randomTip = JULIET_BEAUTY_TIPS[Math.floor(Math.random() * JULIET_BEAUTY_TIPS.length)];
    showJulietToast(randomTip, 'tip', 'JULIET BEAUTY TIP');
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 border border-pink-100 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-gray-900 leading-tight">
              Re-engagement & Beauty Reminders
            </h3>
            <p className="text-[10px] text-gray-500">
              Stay connected with daily glow tips & appointment reminders
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
            isEnabled ? 'bg-pink-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
              isEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Permission Status Banner */}
      <div className="flex items-center justify-between bg-pink-50/60 p-2.5 rounded-2xl border border-pink-100 text-xs">
        <div className="flex items-center gap-1.5">
          {permission === 'granted' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          <span className="text-[11px] font-medium text-gray-700">
            {permission === 'granted'
              ? 'Web Push Notifications Active'
              : 'Web Notifications Not Allowed'}
          </span>
        </div>
        {permission !== 'granted' && (
          <button
            onClick={requestPushPermission}
            className="text-[10.5px] font-bold text-pink-600 hover:underline cursor-pointer"
          >
            Enable Now
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={handleSendTestPush}
          className="py-2 px-3 bg-pink-50 hover:bg-pink-100/80 border border-pink-200/80 text-pink-700 font-bold text-[11px] rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Test Push Alert</span>
        </button>

        <button
          onClick={handleTriggerToastTip}
          className="py-2 px-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-[11px] rounded-2xl flex items-center justify-center gap-1.5 shadow-2xs hover:opacity-95 transition-all cursor-pointer active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>Trigger Soft Tip</span>
        </button>
      </div>
    </div>
  );
};
