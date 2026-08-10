import React from 'react';
import { Home, Camera, ShoppingBag, User } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home' as TabType, label: 'HOME', icon: Home },
    { id: 'mirror' as TabType, label: 'BEAUTY MIRROR', icon: Camera, badge: '✨' },
    { id: 'shop' as TabType, label: 'SHOP', icon: ShoppingBag },
    { id: 'me' as TabType, label: 'ME', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-pink-100 pb-safe">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-pink-600 bg-pink-50/80 font-semibold scale-105'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-1.5'}`} />
                {tab.badge && !isActive && (
                  <span className="absolute -top-1 -right-2 text-[9px] bg-pink-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-wider mt-1 uppercase font-medium">
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-pink-500 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
