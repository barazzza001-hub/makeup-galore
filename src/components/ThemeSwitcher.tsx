import React, { useState, useEffect } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';

export type BgTheme = 'cream' | 'rose';

interface ThemeOption {
  id: BgTheme;
  name: string;
  description: string;
  bgColor: string;
  patternSrc: string;
  borderColor: string;
  accentColor: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'cream',
    name: 'Warm Cream',
    description: 'Soft cream canvas with delicate rose doodle line art',
    bgColor: '#FFFBF5',
    patternSrc: '/vanity-pattern.svg',
    borderColor: 'border-amber-200',
    accentColor: 'text-amber-700',
  },
  {
    id: 'rose',
    name: 'Rose Pink',
    description: 'Rich blush rose canvas with vibrant magenta vanity doodles',
    bgColor: '#FCE7F3',
    patternSrc: '/vanity-pattern-pink.svg',
    borderColor: 'border-pink-300',
    accentColor: 'text-pink-700',
  },
];

export const applyThemeToBody = (theme: BgTheme) => {
  document.body.classList.remove('theme-cream-doodle', 'theme-rose-doodle');
  if (theme === 'rose') {
    document.body.classList.add('theme-rose-doodle');
  } else {
    document.body.classList.add('theme-cream-doodle');
  }
};

interface ThemeSwitcherProps {
  variant?: 'inline' | 'compact';
  onThemeChanged?: (themeName: string) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'inline',
  onThemeChanged,
}) => {
  const [currentTheme, setCurrentTheme] = useState<BgTheme>(() => {
    return (localStorage.getItem('juliet_bg_theme') as BgTheme) || 'cream';
  });

  useEffect(() => {
    applyThemeToBody(currentTheme);
    localStorage.setItem('juliet_bg_theme', currentTheme);
  }, [currentTheme]);

  const handleSelectTheme = (themeId: BgTheme) => {
    setCurrentTheme(themeId);
    applyThemeToBody(themeId);
    localStorage.setItem('juliet_bg_theme', themeId);
    if (onThemeChanged) {
      const option = THEME_OPTIONS.find((t) => t.id === themeId);
      onThemeChanged(option ? option.name : themeId);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1 bg-pink-50/90 border border-pink-200/80 p-0.5 rounded-full shadow-2xs">
        {THEME_OPTIONS.map((theme) => {
          const isActive = currentTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => handleSelectTheme(theme.id)}
              className={`px-2 py-1 rounded-full text-[10.5px] font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
                  : 'text-gray-600 hover:text-pink-600 hover:bg-pink-100/50'
              }`}
              title={`Switch to ${theme.name} background pattern`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block shadow-2xs"
                style={{ backgroundColor: theme.bgColor }}
              />
              <span>{theme.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 border border-pink-100 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-pink-600" />
          <h3 className="font-serif font-bold text-sm text-gray-900">
            Vanity Background Pattern
          </h3>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200/60">
          Persistent Theme
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {THEME_OPTIONS.map((theme) => {
          const isActive = currentTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => handleSelectTheme(theme.id)}
              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer flex flex-col justify-between min-h-[92px] active:scale-98 ${
                isActive
                  ? 'border-pink-500 ring-2 ring-pink-400/30 bg-pink-50/40 shadow-xs'
                  : 'border-gray-200 hover:border-pink-200 bg-white'
              }`}
            >
              {/* Background preview thumbnail box */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundColor: theme.bgColor,
                  backgroundImage: `url(${theme.patternSrc})`,
                  backgroundSize: '120px 120px',
                  backgroundRepeat: 'repeat',
                }}
              />

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs inline-block"
                    style={{ backgroundColor: theme.bgColor }}
                  />
                  <span className="font-bold text-xs text-gray-900">{theme.name}</span>
                </div>

                {isActive && (
                  <div className="w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-2xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              <p className="relative z-10 text-[10px] text-gray-500 leading-tight pt-2">
                {theme.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
