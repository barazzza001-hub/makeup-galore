import React, { useEffect, useState } from 'react';
import { Moon, Sun, Check } from 'lucide-react';

export type AppTheme = 'light' | 'dark';

interface ThemeSwitcherProps {
  variant?: 'inline' | 'compact';
  onThemeChanged?: (themeName: string) => void;
}

export const applyAppTheme = (theme: AppTheme) => {
  const root = document.documentElement;
  const body = document.body;

  root.classList.remove('dark');
  body.classList.remove('dark');

  if (theme === 'dark') {
    root.classList.add('dark');
    body.classList.add('dark');
  }

  localStorage.setItem('juliet_app_theme', theme);
};

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'inline',
  onThemeChanged,
}) => {
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('juliet_app_theme');

    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    applyAppTheme(currentTheme);
  }, [currentTheme]);

  const handleSelectTheme = (theme: AppTheme) => {
    setCurrentTheme(theme);
    applyAppTheme(theme);

    if (onThemeChanged) {
      onThemeChanged(
        theme === 'dark'
          ? 'Chocolate Blush'
          : 'Pink Vanity'
      );
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1 bg-white/90 dark:bg-[#342124]/90 border border-pink-200 dark:border-[#5b3840] p-1 rounded-full shadow-sm">
        <button
          onClick={() => handleSelectTheme('light')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            currentTheme === 'light'
              ? 'bg-pink-500 text-white'
              : 'text-gray-600 dark:text-pink-100 hover:bg-pink-100 dark:hover:bg-[#42282e]'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          Light
        </button>

        <button
          onClick={() => handleSelectTheme('dark')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            currentTheme === 'dark'
              ? 'bg-pink-500 text-white'
              : 'text-gray-600 dark:text-pink-100 hover:bg-pink-100 dark:hover:bg-[#42282e]'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          Dark
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/90 dark:bg-[#342124]/95 backdrop-blur-md rounded-3xl p-4 border border-pink-100 dark:border-[#5b3840] shadow-sm space-y-3">

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-sm text-gray-900 dark:text-pink-50">
            Vanity Theme
          </h3>

          <p className="text-[10px] text-gray-500 dark:text-pink-200 mt-0.5">
            Choose your makeup desk mood
          </p>
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-wider text-pink-500 bg-pink-50 dark:bg-[#42282e] px-2 py-1 rounded-full border border-pink-200/60 dark:border-[#5b3840]">
          Theme
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">

        {/* LIGHT */}

        <button
          onClick={() => handleSelectTheme('light')}
          className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer min-h-[105px] ${
            currentTheme === 'light'
              ? 'border-pink-500 ring-2 ring-pink-400/30 bg-pink-50'
              : 'border-gray-200 hover:border-pink-200 bg-white'
          }`}
        >

          <div className="absolute inset-0 bg-gradient-to-br from-white via-pink-50 to-pink-100 opacity-80" />

          <div className="relative z-10">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-1.5">

                <Sun className="w-4 h-4 text-pink-500" />

                <span className="font-bold text-xs text-gray-900">
                  Light
                </span>

              </div>

              {currentTheme === 'light' && (
                <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

            </div>

            <p className="text-[10px] text-gray-600 mt-3">
              Pink & white vanity
            </p>

          </div>

        </button>


        {/* DARK */}

        <button
          onClick={() => handleSelectTheme('dark')}
          className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer min-h-[105px] ${
            currentTheme === 'dark'
              ? 'border-pink-400 ring-2 ring-pink-400/30'
              : 'border-[#5b3840] hover:border-pink-400'
          }`}
        >

          <div className="absolute inset-0 bg-gradient-to-br from-[#24171a] via-[#342124] to-[#5b3840]" />

          <div className="relative z-10">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-1.5">

                <Moon className="w-4 h-4 text-pink-300" />

                <span className="font-bold text-xs text-pink-50">
                  Dark
                </span>

              </div>

              {currentTheme === 'dark' && (
                <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

            </div>

            <p className="text-[10px] text-pink-200 mt-3">
              Chocolate & blush
            </p>

          </div>

        </button>

      </div>
    </div>
  );
};