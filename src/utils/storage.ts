export interface UserProfile {
  name: string;
  username: string;
  bio: string;
  avatar: string;
  language: string;
  joinedAt: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  sound: boolean;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesRequested: number;
  gamesCompleted: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'game_played' | 'game_won' | 'game_requested' | 'profile_updated';
  timestamp: number;
}

export interface GameRequestItem {
  id: string;
  name: string;
  description: string;
  region: string;
  language: string;
  why: string;
  reference?: string;
  status: 'Submitted' | 'Under Review' | 'Planned' | 'In Development';
  createdAt: number;
}

export interface FeedbackItem {
  id: string;
  type: 'Suggestion' | 'Bug' | 'Game Request' | 'Other';
  message: string;
  createdAt: number;
}

const STORAGE_KEYS = {
  PROFILE: 'kridaleela_profile',
  SETTINGS: 'kridaleela_settings',
  STATS: 'kridaleela_stats',
  ACTIVITY: 'kridaleela_activity',
  GAME_REQUESTS: 'kridaleela_game_requests',
  FEEDBACK: 'kridaleela_feedback',
  SAVED_GAMES: 'kridaleela_saved_games',
  RECENT_GAMES: 'kridaleela_recent_games',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Guest Player',
  username: 'guest',
  bio: 'Exploring traditional Indian games and cultural pastimes.',
  avatar: 'GP',
  language: 'English',
  joinedAt: new Date().toISOString(),
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  language: 'English',
  notifications: true,
  sound: true,
};

const DEFAULT_STATS: UserStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  gamesRequested: 0,
  gamesCompleted: 0,
};

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

function safeSetItem(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function getProfile(): UserProfile {
  return safeGetItem<UserProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
}

export function saveProfile(profile: Partial<UserProfile>): UserProfile {
  const current = getProfile();
  const updated = { ...current, ...profile };
  safeSetItem(STORAGE_KEYS.PROFILE, updated);
  addActivity({
    title: 'Profile updated',
    type: 'profile_updated',
  });
  return updated;
}

export function resetProfile(): void {
  safeSetItem(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  safeSetItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  safeSetItem(STORAGE_KEYS.STATS, DEFAULT_STATS);
  safeSetItem(STORAGE_KEYS.ACTIVITY, []);
  safeSetItem(STORAGE_KEYS.GAME_REQUESTS, []);
  safeSetItem(STORAGE_KEYS.FEEDBACK, []);
  safeSetItem(STORAGE_KEYS.SAVED_GAMES, []);
  safeSetItem(STORAGE_KEYS.RECENT_GAMES, []);
}

export function getSettings(): UserSettings {
  return safeGetItem<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings: Partial<UserSettings>): UserSettings {
  const current = getSettings();
  const updated = { ...current, ...settings };
  safeSetItem(STORAGE_KEYS.SETTINGS, updated);
  
  // Apply theme class to document
  applyTheme(updated.theme);
  return updated;
}

export function applyTheme(theme: 'light' | 'dark' | 'system'): void {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // system
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}

export function getStats(): UserStats {
  return safeGetItem<UserStats>(STORAGE_KEYS.STATS, DEFAULT_STATS);
}

export function recordGameFinished(
  winnerName: string,
  isPlayer1Winner: boolean,
  gameTitle = 'Chausar'
): UserStats {
  const stats = getStats();
  const updated: UserStats = {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: isPlayer1Winner ? stats.gamesWon + 1 : stats.gamesWon,
    gamesCompleted: stats.gamesCompleted + 1,
  };
  safeSetItem(STORAGE_KEYS.STATS, updated);

  addActivity({
    title: `Completed a game of ${gameTitle}`,
    subtitle: `${winnerName} won the match`,
    type: isPlayer1Winner ? 'game_won' : 'game_played',
  });

  return updated;
}

export function getActivity(): ActivityItem[] {
  return safeGetItem<ActivityItem[]>(STORAGE_KEYS.ACTIVITY, []);
}

export function addActivity(entry: Omit<ActivityItem, 'id' | 'timestamp'>): void {
  const list = getActivity();
  const item: ActivityItem = {
    ...entry,
    id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: Date.now(),
  };
  const updated = [item, ...list].slice(0, 30);
  safeSetItem(STORAGE_KEYS.ACTIVITY, updated);
}

export function getGameRequests(): GameRequestItem[] {
  return safeGetItem<GameRequestItem[]>(STORAGE_KEYS.GAME_REQUESTS, []);
}

export function addGameRequest(req: Omit<GameRequestItem, 'id' | 'status' | 'createdAt'>): GameRequestItem {
  const list = getGameRequests();
  const item: GameRequestItem = {
    ...req,
    id: 'req_' + Date.now(),
    status: 'Submitted',
    createdAt: Date.now(),
  };
  const updated = [item, ...list];
  safeSetItem(STORAGE_KEYS.GAME_REQUESTS, updated);

  // Update stats
  const stats = getStats();
  safeSetItem(STORAGE_KEYS.STATS, {
    ...stats,
    gamesRequested: stats.gamesRequested + 1,
  });

  // Add activity
  addActivity({
    title: `Requested game: ${req.name}`,
    subtitle: `${req.region ? req.region + ' · ' : ''}${req.language}`,
    type: 'game_requested',
  });

  return item;
}

export function getFeedback(): FeedbackItem[] {
  return safeGetItem<FeedbackItem[]>(STORAGE_KEYS.FEEDBACK, []);
}

export function addFeedback(item: Omit<FeedbackItem, 'id' | 'createdAt'>): FeedbackItem {
  const list = getFeedback();
  const newItem: FeedbackItem = {
    ...item,
    id: 'fb_' + Date.now(),
    createdAt: Date.now(),
  };
  safeSetItem(STORAGE_KEYS.FEEDBACK, [newItem, ...list]);
  return newItem;
}

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diffSec = Math.floor((now - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  return new Date(timestamp).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
  });
}
