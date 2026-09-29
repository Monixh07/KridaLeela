import React, { useState, useEffect, useCallback } from 'react';
import {
  getProfile,
  getSettings,
  getStats,
  getActivity,
  getGameRequests,
  applyTheme,
  UserProfile,
  UserSettings,
  UserStats,
  ActivityItem,
  GameRequestItem,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { GamesPage } from './pages/Games';
import { ChausarPage } from './pages/Chausar';
import { ChenneManePage } from './pages/ChenneMane';
import { StoriesPage } from './pages/Stories';
import { ProfilePage } from './pages/Profile';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'games' | 'stories' | 'profile'>('games');
  const [activeGame, setActiveGame] = useState<string | null>(null);

  // Local storage state
  const [profile, setProfile] = useState<UserProfile>(() => getProfile());
  const [settings, setSettings] = useState<UserSettings>(() => getSettings());
  const [stats, setStats] = useState<UserStats>(() => getStats());
  const [activity, setActivity] = useState<ActivityItem[]>(() => getActivity());
  const [gameRequests, setGameRequests] = useState<GameRequestItem[]>(() => getGameRequests());

  // Refresh data from storage
  const refreshStorageData = useCallback(() => {
    setProfile(getProfile());
    setSettings(getSettings());
    setStats(getStats());
    setActivity(getActivity());
    setGameRequests(getGameRequests());
  }, []);

  // Initialize theme
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  // Handle browser back button state synchronization
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state) {
        if (e.state.game) {
          setActiveGame(e.state.game);
        } else {
          setActiveGame(null);
        }
        if (e.state.tab) {
          setCurrentTab(e.state.tab);
        }
      } else {
        setActiveGame(null);
        setCurrentTab('games');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation handlers with clean browser history sync
  const handleNavigateTab = (tab: 'games' | 'stories' | 'profile') => {
    setActiveGame(null);
    setCurrentTab(tab);
    window.history.pushState({ tab, game: null }, '', `/#${tab}`);
    refreshStorageData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartGame = (gameId: string) => {
    setActiveGame(gameId);
    window.history.pushState({ tab: 'games', game: gameId }, '', `/#games/${gameId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToGames = () => {
    setActiveGame(null);
    window.history.pushState({ tab: 'games', game: null }, '', '/#games');
    refreshStorageData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] dark:bg-[#151210] text-[#28211A] dark:text-[#F0EAE1] transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        activeSubpage={
          activeGame === 'chausar'
            ? 'Chausar'
            : activeGame === 'chenne-mane'
            ? 'Chenne Mane'
            : null
        }
        profile={profile}
        onNavigateTab={handleNavigateTab}
        onBack={activeGame ? handleBackToGames : undefined}
      />

      {/* Main Content Viewport */}
      <main
        className={`flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 ${
          activeGame ? 'pt-2 sm:pt-4 pb-4' : 'pt-6 pb-20 md:pb-12'
        }`}
      >
        {activeGame === 'chausar' ? (
          <ChausarPage onBackToGames={handleBackToGames} />
        ) : activeGame === 'chenne-mane' ? (
          <ChenneManePage onBackToGames={handleBackToGames} />
        ) : currentTab === 'games' ? (
          <GamesPage
            onStartGame={handleStartGame}
            onRequestGameClick={() => handleNavigateTab('profile')}
          />
        ) : currentTab === 'stories' ? (
          <StoriesPage />
        ) : (
          <ProfilePage
            profile={profile}
            settings={settings}
            stats={stats}
            activity={activity}
            gameRequests={gameRequests}
            onRefreshData={refreshStorageData}
            onNavigateTab={handleNavigateTab}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      {!activeGame && (
        <BottomNav currentTab={currentTab} onNavigateTab={handleNavigateTab} />
      )}
    </div>
  );
}
