import React, { useEffect, useState } from 'react';
import { Sun, Moon, Check } from 'lucide-react';

export type AppTheme = 'light' | 'dark';

interface ThemeSwitcherProps {
  variant?: 'inline' | 'compact';
  onThemeChanged?: (themeName: string) => void;
}

export const applyAppTheme = (theme: AppTheme) => {
  document.documentElement.classList.remove('theme-light', 'theme-dark');
  document.body.classList.remove('theme-light', 'theme-dark');

  document.documentElement.classList.add(`theme-${theme}`);
  document.body.classList.add(`theme-${theme}`);

  localStorage.setItem('juliet_app_theme', theme);
};

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'inline',
  onThemeChanged,
}) => {
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('juliet_app_theme');

    if (saved === 'dark' || saved === 'light') {
      return saved;
    }

    return 'light';
  });

  useEffect(() => {
    applyAppTheme(currentTheme);
  }, [currentTheme]);

  const handleSelectTheme = (theme: AppTheme) => {
    setCurrentTheme(theme);
    applyAppTheme(theme);

    if (onThemeChanged) {
      onThemeChanged(theme === 'dark' ? 'Dark Mode' : 'Light Mode');
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1 rounded-full border border-pink-200 bg-white/90 p-1 shadow-sm">
        <button
          type="button"
          onClick={() => handleSelectTheme('light')}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
            currentTheme === 'light'
              ? 'bg-pink-500 text-white shadow-sm'
              : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
          }`}
        >
          <Sun className="h-3.5 w-3.5" />
          Light
        </button>

        <button
          type="button"
          onClick={() => handleSelectTheme('dark')}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
            currentTheme === 'dark'
              ? 'bg-pink-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
          }`}
        >
          <Moon className="h-3.5 w-3.5" />
          Dark
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-3xl border border-pink-100 bg-white/90 p-4 shadow-sm backdrop-blur-md">
      <div>
        <h3 className="font-serif text-sm font-bold text-gray-900">
          Appearance
        </h3>

        <p className="mt-1 text-[11px] text-gray-500">
          Choose the look of your Makeup Galore beauty desk.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSelectTheme('light')}
          className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all ${
            currentTheme === 'light'
              ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-300/40'
              : 'border-gray-200 bg-white hover:border-pink-300'
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                <Sun className="h-4 w-4" />
              </div>

              <span className="text-xs font-bold text-gray-900">
                Light
              </span>
            </div>

            {currentTheme === 'light' && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-white">
                <Check className="h-3 w-3" />
              </div>
            )}
          </div>

          <div className="h-10 rounded-xl bg-[#FFFBF5]">
            <div className="h-full rounded-xl bg-pink-100/40" />
          </div>

          <p className="mt-2 text-[10px] text-gray-500">
            Pinky white beauty desk
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleSelectTheme('dark')}
          className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all ${
            currentTheme === 'dark'
              ? 'border-pink-500 bg-[#3A2025] ring-2 ring-pink-400/40'
              : 'border-gray-300 bg-[#2A181C] hover:border-pink-400'
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5A3038] text-pink-200">
                <Moon className="h-4 w-4" />
              </div>

              <span className="text-xs font-bold text-pink-50">
                Dark
              </span>
            </div>

            {currentTheme === 'dark' && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-white">
                <Check className="h-3 w-3" />
              </div>
            )}
          </div>

          <div className="h-10 rounded-xl bg-[#2A181C]">
            <div className="h-full rounded-xl bg-[#5A3038]/70" />
          </div>

          <p className="mt-2 text-[10px] text-pink-100/70">
            Chocolate pink beauty desk
          </p>
        </button>
      </div>
    </div>
  );
};