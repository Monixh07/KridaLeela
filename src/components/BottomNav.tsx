import React from 'react';
import { Gamepad2, BookOpen, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'games' | 'stories' | 'profile';
  onNavigateTab: (tab: 'games' | 'stories' | 'profile') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onNavigateTab,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 dark:bg-[#151210]/95 backdrop-blur-md border-t border-[#E6DCD1] dark:border-[#332A24] px-4 h-15 flex items-center justify-around">
      <button
        onClick={() => onNavigateTab('games')}
        className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] cursor-pointer transition-colors ${
          currentTab === 'games'
            ? 'text-[#B43B22] dark:text-[#E46B52]'
            : 'text-[#746659] dark:text-[#8E7E70] hover:text-[#28211A]'
        }`}
        aria-label="Games"
      >
        <Gamepad2 className="w-5 h-5" />
        <span className="text-[11px] font-medium mt-1">Games</span>
      </button>

      <button
        onClick={() => onNavigateTab('stories')}
        className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] cursor-pointer transition-colors ${
          currentTab === 'stories'
            ? 'text-[#B43B22] dark:text-[#E46B52]'
            : 'text-[#746659] dark:text-[#8E7E70] hover:text-[#28211A]'
        }`}
        aria-label="Stories"
      >
        <BookOpen className="w-5 h-5" />
        <span className="text-[11px] font-medium mt-1">Stories</span>
      </button>

      <button
        onClick={() => onNavigateTab('profile')}
        className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] cursor-pointer transition-colors ${
          currentTab === 'profile'
            ? 'text-[#B43B22] dark:text-[#E46B52]'
            : 'text-[#746659] dark:text-[#8E7E70] hover:text-[#28211A]'
        }`}
        aria-label="Profile"
      >
        <User className="w-5 h-5" />
        <span className="text-[11px] font-medium mt-1">Profile</span>
      </button>
    </nav>
  );
};
