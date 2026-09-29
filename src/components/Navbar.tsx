import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { UserProfile } from '../utils/storage';

interface NavbarProps {
  currentTab: 'games' | 'stories' | 'profile';
  activeSubpage: string | null;
  profile: UserProfile;
  onNavigateTab: (tab: 'games' | 'stories' | 'profile') => void;
  onBack?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  activeSubpage,
  profile,
  onNavigateTab,
  onBack,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 dark:bg-[#151210]/90 backdrop-blur-md border-b border-[#E6DCD1] dark:border-[#332A24] transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Zone 1: Left Brand or Back Button */}
        <div className="flex items-center gap-3">
          {activeSubpage ? (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#746659] hover:text-[#28211A] dark:text-[#B3A596] dark:hover:text-[#F0EAE1] p-1.5 -ml-1.5 rounded-lg hover:bg-[#F2ECE3] dark:hover:bg-[#2A241F] transition-colors"
              aria-label="Back to main section"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigateTab('games')}
              className="flex items-center gap-2 group text-left cursor-pointer"
            >
              <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#B43B22] dark:text-[#E46B52] group-hover:opacity-90">
                KRIDALEELA
              </span>
            </button>
          )}
        </div>

        {/* Zone 2: Desktop Nav Links (Clean unboxed typography) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => onNavigateTab('games')}
            className={`transition-colors cursor-pointer ${
              currentTab === 'games' && !activeSubpage
                ? 'text-[#B43B22] dark:text-[#E46B52] font-semibold'
                : 'text-[#746659] dark:text-[#B3A596] hover:text-[#28211A] dark:hover:text-[#F0EAE1]'
            }`}
          >
            Games
          </button>
          <button
            onClick={() => onNavigateTab('stories')}
            className={`transition-colors cursor-pointer ${
              currentTab === 'stories' && !activeSubpage
                ? 'text-[#B43B22] dark:text-[#E46B52] font-semibold'
                : 'text-[#746659] dark:text-[#B3A596] hover:text-[#28211A] dark:hover:text-[#F0EAE1]'
            }`}
          >
            Stories
          </button>
          <button
            onClick={() => onNavigateTab('profile')}
            className={`transition-colors cursor-pointer ${
              currentTab === 'profile' && !activeSubpage
                ? 'text-[#B43B22] dark:text-[#E46B52] font-semibold'
                : 'text-[#746659] dark:text-[#B3A596] hover:text-[#28211A] dark:hover:text-[#F0EAE1]'
            }`}
          >
            Profile
          </button>
        </nav>

        {/* Zone 3: Right Action (Avatar Button) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('profile')}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-[#F0E8DD] dark:hover:bg-[#28211A] transition-colors cursor-pointer"
            aria-label="User Profile"
          >
            <div className="w-8 h-8 rounded-full bg-[#E8DDD0] dark:bg-[#342B24] border border-[#D5C7B7] dark:border-[#4B3E34] text-[#B43B22] dark:text-[#E46B52] font-semibold text-xs flex items-center justify-center">
              {profile.avatar || 'GP'}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
