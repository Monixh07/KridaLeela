import React, { useState } from 'react';
import {
  UserProfile,
  UserSettings,
  UserStats,
  ActivityItem,
  GameRequestItem,
  saveProfile,
  saveSettings,
  addGameRequest,
  addFeedback,
  resetProfile,
  formatTimeAgo,
} from '../utils/storage';
import { StatCard } from '../components/StatCard';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import {
  User,
  Edit3,
  Dices,
  Trophy,
  MessageSquarePlus,
  Bookmark,
  History,
  Award,
  Settings as SettingsIcon,
  Globe,
  HelpCircle,
  Info,
  LogOut,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface ProfilePageProps {
  profile: UserProfile;
  settings: UserSettings;
  stats: UserStats;
  activity: ActivityItem[];
  gameRequests: GameRequestItem[];
  onRefreshData: () => void;
  onNavigateTab: (tab: 'games' | 'stories' | 'profile') => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  settings,
  stats,
  activity,
  gameRequests,
  onRefreshData,
  onNavigateTab,
}) => {
  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showRequestGame, setShowRequestGame] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<GameRequestItem | null>(null);

  // Informational modals for coming soon features
  const [infoModal, setInfoModal] = useState<{ title: string; desc: string } | null>(null);

  // Edit Profile Form State
  const [nameInput, setNameInput] = useState(profile.name);
  const [usernameInput, setUsernameInput] = useState(profile.username);
  const [bioInput, setBioInput] = useState(profile.bio);
  const [editProfileError, setEditProfileError] = useState('');

  // Request Game Form State
  const [reqName, setReqName] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [reqRegion, setReqRegion] = useState('');
  const [reqLang, setReqLang] = useState('Hindi');
  const [reqWhy, setReqWhy] = useState('');
  const [reqRef, setReqRef] = useState('');
  const [reqFormError, setReqFormError] = useState('');
  const [reqSuccess, setReqSuccess] = useState(false);

  // Feedback Form State
  const [feedbackType, setFeedbackType] = useState<'Suggestion' | 'Bug' | 'Game Request' | 'Other'>('Suggestion');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Win rate calculation
  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) + '%'
      : '0%';

  // Handle Edit Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setEditProfileError('Name cannot be empty.');
      return;
    }
    const cleanUsername = usernameInput.trim().replace(/^@+/, '') || 'player';
    const initials = nameInput
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    saveProfile({
      name: nameInput.trim(),
      username: cleanUsername,
      bio: bioInput.trim(),
      avatar: initials || 'GP',
    });

    onRefreshData();
    setShowEditProfile(false);
    setEditProfileError('');
  };

  // Handle Game Request Submit
  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName.trim()) {
      setReqFormError('Game name is required.');
      return;
    }
    if (!reqDesc.trim()) {
      setReqFormError('Please enter a brief description of how the game is played.');
      return;
    }
    if (!reqLang.trim()) {
      setReqFormError('Language is required.');
      return;
    }

    addGameRequest({
      name: reqName.trim(),
      description: reqDesc.trim(),
      region: reqRegion.trim(),
      language: reqLang.trim(),
      why: reqWhy.trim(),
      reference: reqRef.trim(),
    });

    setReqSuccess(true);
    onRefreshData();
    setTimeout(() => {
      setReqSuccess(false);
      setShowRequestGame(false);
      setReqName('');
      setReqDesc('');
      setReqRegion('');
      setReqWhy('');
      setReqRef('');
      setReqFormError('');
    }, 1500);
  };

  // Handle Feedback Submit
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;

    addFeedback({
      type: feedbackType,
      message: feedbackMsg.trim(),
    });

    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackSuccess(false);
      setFeedbackMsg('');
    }, 2000);
  };

  // Handle Profile Reset
  const handleResetProfile = () => {
    resetProfile();
    onRefreshData();
    setShowResetConfirm(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      {/* 1. Profile Header Card */}
      <section className="bg-[#FFFFFF] dark:bg-[#201B17] rounded-2xl border border-[#E6DCD1] dark:border-[#38302A] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF0E6] dark:bg-[#34271F] border-2 border-[#D8C7B4] dark:border-[#4E3D31] text-[#B43B22] dark:text-[#E46B52] font-display text-2xl font-bold flex items-center justify-center shadow-xs">
              {profile.avatar || 'GP'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#28211A] dark:text-[#F0EAE1]">
                {profile.name}
              </h1>
              <p className="text-xs text-[#746659] dark:text-[#A09589]">
                @{profile.username}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-[#8E8073] dark:text-[#9A8D80] mt-1">
                <Calendar className="w-3 h-3" />
                <span>
                  Member since{' '}
                  {new Date(profile.joinedAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => {
              setNameInput(profile.name);
              setUsernameInput(profile.username);
              setBioInput(profile.bio);
              setShowEditProfile(true);
            }}
            variant="outline"
            size="sm"
            className="self-start sm:self-center"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
            Edit Profile
          </Button>
        </div>

        {profile.bio && (
          <p className="mt-4 pt-4 border-t border-[#F0E8DD] dark:border-[#2E2620] text-xs text-[#746659] dark:text-[#B3A596] leading-relaxed">
            {profile.bio}
          </p>
        )}
      </section>

      {/* 2. My Activity (Real stats calculated from localStorage) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6DCD1] dark:border-[#38302A] pb-2">
          <h2 className="text-base font-semibold text-[#28211A] dark:text-[#F0EAE1]">
            My Activity
          </h2>
          <span className="text-xs text-[#746659] dark:text-[#B3A596]">
            Pass & Play Records
          </span>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Games Played"
            value={stats.gamesPlayed}
            icon={<Dices className="w-4 h-4" />}
          />
          <StatCard
            label="Games Won"
            value={stats.gamesWon}
            icon={<Trophy className="w-4 h-4" />}
          />
          <StatCard
            label="Requests"
            value={stats.gamesRequested}
            icon={<MessageSquarePlus className="w-4 h-4" />}
          />
          <StatCard
            label="Win Rate"
            value={winRate}
            icon={<Award className="w-4 h-4" />}
          />
        </div>

        {/* Recent Activity List */}
        <div className="bg-[#FAF7F2] dark:bg-[#1E1916] rounded-xl border border-[#E6DCD1] dark:border-[#38302A] p-4">
          <h3 className="text-xs font-semibold text-[#746659] dark:text-[#B3A596] uppercase tracking-wider mb-3">
            Recent Activity
          </h3>

          {activity.length > 0 ? (
            <div className="divide-y divide-[#E6DCD1] dark:divide-[#38302A]">
              {activity.slice(0, 5).map((item) => (
                <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <p className="font-medium text-[#28211A] dark:text-[#F0EAE1]">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="text-[11px] text-[#746659] dark:text-[#9F9184] mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-[#8E8073] dark:text-[#8E7E70] shrink-0 tabular-nums">
                    {formatTimeAgo(item.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#746659] dark:text-[#9F9184] py-2 text-center">
              No activity yet. Play Chausar or Chenne Mane to get started.
            </p>
          )}
        </div>
      </section>

      {/* 3. Game Request System (Fully Functional) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6DCD1] dark:border-[#38302A] pb-2">
          <div>
            <h2 className="text-base font-semibold text-[#28211A] dark:text-[#F0EAE1]">
              Game Requests
            </h2>
            <p className="text-xs text-[#746659] dark:text-[#B3A596]">
              Know a traditional game from your region? Tell us about it.
            </p>
          </div>
          <Button
            onClick={() => setShowRequestGame(true)}
            variant="primary"
            size="sm"
            className="text-xs shrink-0"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 mr-1.5" />
            Request a Game
          </Button>
        </div>

        {/* My Requests List */}
        {gameRequests.length > 0 ? (
          <div className="space-y-3">
            {gameRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className="bg-[#FFFFFF] dark:bg-[#201B17] rounded-xl border border-[#E6DCD1] dark:border-[#38302A] p-4 hover:border-[#B43B22]/50 transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#28211A] dark:text-[#F0EAE1]">
                      {req.name}
                    </h3>
                    {/* Unboxed metadata line */}
                    <div className="flex items-center gap-2 text-[11px] text-[#746659] dark:text-[#9F9184] mt-1 font-medium">
                      {req.region && <span>{req.region}</span>}
                      {req.region && <span aria-hidden="true">·</span>}
                      <span>{req.language}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{formatTimeAgo(req.createdAt)}</span>
                    </div>
                  </div>
                  {/* Status text */}
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/60">
                    {req.status}
                  </span>
                </div>
                <p className="text-xs text-[#746659] dark:text-[#B3A596] mt-2 line-clamp-2 leading-relaxed">
                  {req.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="You haven't requested a game yet"
            description="Your request helps us discover traditional games worth bringing to KridaLeela."
            icon={<MessageSquarePlus className="w-6 h-6" />}
            action={
              <Button
                onClick={() => setShowRequestGame(true)}
                variant="outline"
                size="sm"
              >
                Request a Traditional Game
              </Button>
            }
          />
        )}
      </section>

      {/* 4. Other Profile Options */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[#28211A] dark:text-[#F0EAE1] border-b border-[#E6DCD1] dark:border-[#38302A] pb-2">
          Other
        </h2>

        <div className="bg-[#FFFFFF] dark:bg-[#201B17] rounded-xl border border-[#E6DCD1] dark:border-[#38302A] divide-y divide-[#E6DCD1] dark:divide-[#38302A] overflow-hidden shadow-xs">
          {/* Saved Games */}
          <button
            onClick={() =>
              setInfoModal({
                title: 'Saved Games',
                desc: 'Saved games will appear here once cloud bookmarks are enabled.',
              })
            }
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#FAF7F2] dark:hover:bg-[#28211A] transition-colors cursor-pointer text-xs"
          >
            <div className="flex items-center gap-3 text-[#28211A] dark:text-[#F0EAE1] font-medium">
              <Bookmark className="w-4 h-4 text-[#746659] dark:text-[#9F9184]" />
              <span>Saved Games</span>
            </div>
            <span className="text-[11px] text-[#746659] dark:text-[#9F9184]">
              0 Saved
            </span>
          </button>

          {/* Recently Played */}
          <button
            onClick={() =>
              setInfoModal({
                title: 'Recently Played',
                desc: stats.gamesPlayed > 0
                  ? `You have played traditional games ${stats.gamesPlayed} time(s).`
                  : 'Recently played games will appear here after you play your first game.',
              })
            }
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#FAF7F2] dark:hover:bg-[#28211A] transition-colors cursor-pointer text-xs"
          >
            <div className="flex items-center gap-3 text-[#28211A] dark:text-[#F0EAE1] font-medium">
              <History className="w-4 h-4 text-[#746659] dark:text-[#9F9184]" />
              <span>Recently Played</span>
            </div>
            <span className="text-[11px] text-[#746659] dark:text-[#9F9184]">
              {stats.gamesPlayed > 0 ? 'Chausar, Chenne Mane' : 'None yet'}
            </span>
          </button>

          {/* Achievements */}
          <button
            onClick={() =>
              setInfoModal({
                title: 'Achievements',
                desc: 'Achievements will appear here as you play and master traditional board games.',
              })
            }
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#FAF7F2] dark:hover:bg-[#28211A] transition-colors cursor-pointer text-xs"
          >
            <div className="flex items-center gap-3 text-[#28211A] dark:text-[#F0EAE1] font-medium">
              <Award className="w-4 h-4 text-[#746659] dark:text-[#9F9184]" />
              <span>Achievements</span>
            </div>
            <span className="text-[11px] text-[#746659] dark:text-[#9F9184]">
              Coming soon
            </span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#FAF7F2] dark:hover:bg-[#28211A] transition-colors cursor-pointer text-xs"
          >
            <div className="flex items-center gap-3 text-[#28211A] dark:text-[#F0EAE1] font-medium">
              <SettingsIcon className="w-4 h-4 text-[#746659] dark:text-[#9F9184]" />
              <span>Settings</span>
            </div>
            <span className="text-[11px] text-[#746659] dark:text-[#9F9184]">
              Theme, Sound, Alerts
            </span>
          </button>

          {/* Language */}
          <button
            onClick={() => setShowLanguage(true)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#FAF7F2] dark:hover:bg-[#28211A] transition-colors cursor-pointer text-xs"
          >
            <div className="flex items-center gap-3 text-[#28211A] dark:text-[#F0EAE1] font-medium">
              <Globe className="w-4 h-4 text-[#746659] dark:text-[#9F9184]" />
              <span>Language</span>
            </div>
            <span className="text-[11px] text-[#746659] dark:text-[#9F9184]">
              English
            </span>
          </button>

          {/* Help & Feedback */}
          <button
            onClick={() => setShowHelp(true)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#FAF7F2] dark:hover:bg-[#28211A] transition-colors cursor-pointer text-xs"
          >
            <div className="flex items-center gap-3 text-[#28211A] dark:text-[#F0EAE1] font-medium">
              <HelpCircle className="w-4 h-4 text-[#746659] dark:text-[#9F9184]" />
              <span>Help & Feedback</span>
            </div>
          </button>

          {/* About KridaLeela */}
          <button
            onClick={() => setShowAbout(true)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#FAF7F2] dark:hover:bg-[#28211A] transition-colors cursor-pointer text-xs"
          >
            <div className="flex items-center gap-3 text-[#28211A] dark:text-[#F0EAE1] font-medium">
              <Info className="w-4 h-4 text-[#746659] dark:text-[#9F9184]" />
              <span>About KridaLeela</span>
            </div>
          </button>

          {/* Reset Local Profile */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer text-xs text-red-700 dark:text-red-400"
          >
            <div className="flex items-center gap-3 font-medium">
              <LogOut className="w-4 h-4" />
              <span>Reset Local Profile</span>
            </div>
          </button>
        </div>
      </section>

      {/* ================================= modals ================================= */}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        title="Edit Profile"
        subtitle="Update your local player details"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {editProfileError && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {editProfileError}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#28211A] dark:text-[#F0EAE1] mb-1">
              Name
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7B7] dark:border-[#3F332B] bg-[#FFFFFF] dark:bg-[#1E1916] text-[#28211A] dark:text-[#F0EAE1] focus:outline-[#B43B22]"
              placeholder="e.g. Ramesh"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#28211A] dark:text-[#F0EAE1] mb-1">
              Username
            </label>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7B7] dark:border-[#3F332B] bg-[#FFFFFF] dark:bg-[#1E1916] text-[#28211A] dark:text-[#F0EAE1] focus:outline-[#B43B22]"
              placeholder="e.g. player_1"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#28211A] dark:text-[#F0EAE1] mb-1">
              Bio
            </label>
            <textarea
              rows={3}
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7B7] dark:border-[#3F332B] bg-[#FFFFFF] dark:bg-[#1E1916] text-[#28211A] dark:text-[#F0EAE1] focus:outline-[#B43B22]"
              placeholder="A few words about you..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={() => setShowEditProfile(false)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Request a Game Modal */}
      <Modal
        isOpen={showRequestGame}
        onClose={() => setShowRequestGame(false)}
        title="Request a Traditional Game"
        subtitle="Help us discover games from your region"
      >
        {reqSuccess ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-[#28211A] dark:text-[#F0EAE1]">
              Game request submitted.
            </h4>
            <p className="text-xs text-[#746659] dark:text-[#B3A596]">
              Your request has been saved to your local requests feed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitRequest} className="space-y-3.5">
            {reqFormError && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {reqFormError}
              </p>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#28211A] dark:text-[#F0EAE1] mb-1">
                Game Name *
              </label>
              <input
                type="text"
                value={reqName}
                onChange={(e) => setReqName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7B7] dark:border-[#3F332B] bg-[#FFFFFF] dark:bg-[#1E1916] text-[#28211A] dark:text-[#F0EAE1] focus:outline-[#B43B22]"
                placeholder="e.g. Pallanguzhi, Ganjifa, Ashtapada, Dayakattai"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#28211A] dark:text-[#F0EAE1] mb-1">
                  Region / State
                </label>
                <input
                  type="text"
                  value={reqRegion}
                  onChange={(e) => setReqRegion(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7B7] dark:border-[#3F332B] bg-[#FFFFFF] dark:bg-[#1E1916] text-[#28211A] dark:text-[#F0EAE1] focus:outline-[#B43B22]"
                  placeholder="e.g. Tamil Nadu, Karnataka, Odisha"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#28211A] dark:text-[#F0EAE1] mb-1">
                  Language *
                </label>
                <input
                  type="text"
                  value={reqLang}
                  onChange={(e) => setReqLang(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7B7] dark:border-[#3F332B] bg-[#FFFFFF] dark:bg-[#1E1916] text-[#28211A] dark:text-[#F0EAE1] focus:outline-[#B43B22]"
                  placeholder="e.g. Tamil, Kannada, Hindi"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#28211A] dark:text-[#F0EAE1] mb-1">
                Short Description *
              </label>
              <textarea
                rows={2}
                value={reqDesc}
                onChange={(e) => setReqDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7B7] dark:border-[#3F332B] bg-[#FFFFFF] dark:bg-[#1E1916] text-[#28211A] dark:text-[#F0EAE1] focus:outline-[#B43B22]"
                placeholder="Board shape, pieces, or core objective..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#28211A] dark:text-[#F0EAE1] mb-1">
                Why would you like to see this game?
              </label>
              <textarea
                rows={2}
                value={reqWhy}
                onChange={(e) => setReqWhy(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7B7] dark:border-[#3F332B] bg-[#FFFFFF] dark:bg-[#1E1916] text-[#28211A] dark:text-[#F0EAE1] focus:outline-[#B43B22]"
                placeholder="Memories, cultural background, or special mechanics..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#28211A] dark:text-[#F0EAE1] mb-1">
                Reference / Source (Optional)
              </label>
              <input
                type="text"
                value={reqRef}
                onChange={(e) => setReqRef(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7B7] dark:border-[#3F332B] bg-[#FFFFFF] dark:bg-[#1E1916] text-[#28211A] dark:text-[#F0EAE1] focus:outline-[#B43B22]"
                placeholder="Book title, regional name, or museum link"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setShowRequestGame(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Submit Request
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* View Request Details Modal */}
      {selectedRequest && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRequest(null)}
          title={selectedRequest.name}
          subtitle={`Status: ${selectedRequest.status} · Submitted ${formatTimeAgo(selectedRequest.createdAt)}`}
        >
          <div className="space-y-3 text-xs text-[#28211A] dark:text-[#F0EAE1]">
            <div className="flex items-center gap-2 text-[#746659] dark:text-[#B3A596]">
              {selectedRequest.region && <span>Region: {selectedRequest.region}</span>}
              {selectedRequest.region && <span>·</span>}
              <span>Language: {selectedRequest.language}</span>
            </div>

            <div>
              <h4 className="font-semibold text-[#746659] dark:text-[#9F9184] mb-0.5">
                Description
              </h4>
              <p className="leading-relaxed">{selectedRequest.description}</p>
            </div>

            {selectedRequest.why && (
              <div>
                <h4 className="font-semibold text-[#746659] dark:text-[#9F9184] mb-0.5">
                  Why you requested this
                </h4>
                <p className="leading-relaxed">{selectedRequest.why}</p>
              </div>
            )}

            {selectedRequest.reference && (
              <div>
                <h4 className="font-semibold text-[#746659] dark:text-[#9F9184] mb-0.5">
                  Reference / Source
                </h4>
                <p className="leading-relaxed">{selectedRequest.reference}</p>
              </div>
            )}

            <div className="pt-3 border-t border-[#E6DCD1] dark:border-[#38302A] flex justify-end">
              <Button
                onClick={() => setSelectedRequest(null)}
                variant="outline"
                size="sm"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Settings"
        subtitle="Preferences stored in your browser"
      >
        <div className="space-y-5 text-xs text-[#28211A] dark:text-[#F0EAE1]">
          {/* Theme */}
          <div>
            <label className="block font-semibold mb-2">Appearance</label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    saveSettings({ theme: t });
                    onRefreshData();
                  }}
                  className={`py-2 px-3 rounded-xl border text-center font-medium capitalize transition-colors cursor-pointer ${
                    settings.theme === t
                      ? 'bg-[#B43B22] text-white border-[#B43B22]'
                      : 'border-[#D5C7B7] dark:border-[#3F332B] hover:bg-[#F2ECE3] dark:hover:bg-[#28211A]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between py-2 border-t border-[#E6DCD1] dark:border-[#38302A]">
            <div>
              <p className="font-semibold">Sound Effects</p>
              <p className="text-[11px] text-[#746659] dark:text-[#B3A596]">
                Percussive dice rolls, move chimes and capture alerts
              </p>
            </div>
            <button
              onClick={() => {
                saveSettings({ sound: !settings.sound });
                onRefreshData();
              }}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.sound ? 'bg-[#B43B22]' : 'bg-[#D5C7B7] dark:bg-[#3F332B]'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                  settings.sound ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Local Notifications Toggle */}
          <div className="flex items-center justify-between py-2 border-t border-[#E6DCD1] dark:border-[#38302A]">
            <div>
              <p className="font-semibold">Game Alerts</p>
              <p className="text-[11px] text-[#746659] dark:text-[#B3A596]">
                Turn switch notices & capture banners
              </p>
            </div>
            <button
              onClick={() => {
                saveSettings({ notifications: !settings.notifications });
                onRefreshData();
              }}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.notifications ? 'bg-[#B43B22]' : 'bg-[#D5C7B7] dark:bg-[#3F332B]'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                  settings.notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              onClick={() => setShowSettings(false)}
              variant="primary"
              size="sm"
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* Language Modal */}
      <Modal
        isOpen={showLanguage}
        onClose={() => setShowLanguage(false)}
        title="Language"
        subtitle="Regional language interface options"
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl border-2 border-[#B43B22] bg-[#FAF0ED] dark:bg-[#2F1B16] flex items-center justify-between">
            <div>
              <p className="font-bold text-[#28211A] dark:text-[#F0EAE1]">
                English
              </p>
              <p className="text-[11px] text-[#746659] dark:text-[#B3A596]">
                Current active language
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-[#B43B22]" />
          </div>

          <div className="pt-2">
            <p className="text-[11px] font-semibold text-[#746659] dark:text-[#9F9184] uppercase tracking-wider mb-2">
              Upcoming Regional Languages
            </p>
            <div className="grid grid-cols-2 gap-2 opacity-60">
              {[
                { name: 'हिन्दी', sub: 'Hindi' },
                { name: 'ಕನ್ನಡ', sub: 'Kannada' },
                { name: 'தமிழ்', sub: 'Tamil' },
                { name: 'తెలుగు', sub: 'Telugu' },
                { name: 'മലയാളം', sub: 'Malayalam' },
                { name: 'বাংলা', sub: 'Bengali' },
                { name: 'मराठी', sub: 'Marathi' },
              ].map((lang) => (
                <div
                  key={lang.sub}
                  className="p-2.5 rounded-lg border border-[#D5C7B7] dark:border-[#382F27] bg-[#F5EFEB] dark:bg-[#1E1916]"
                >
                  <p className="font-medium">{lang.name}</p>
                  <p className="text-[10px] text-[#746659] dark:text-[#A09080]">
                    {lang.sub} (Coming Soon)
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Help & Feedback Modal */}
      <Modal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="Help & Feedback"
        subtitle="Questions, guides, or suggestions"
      >
        <div className="space-y-4 text-xs text-[#28211A] dark:text-[#F0EAE1]">
          {/* Quick FAQ */}
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-[#F5EFEB] dark:bg-[#201B17] border border-[#E6DCD1] dark:border-[#38302A]">
              <h4 className="font-semibold text-[#B43B22] dark:text-[#E46B52]">
                How KridaLeela Works
              </h4>
              <p className="mt-1 text-[#746659] dark:text-[#B3A596] leading-relaxed">
                KridaLeela is designed for 2-player pass-and-play on one device. Your match records and game suggestions are stored locally on your device.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F5EFEB] dark:bg-[#201B17] border border-[#E6DCD1] dark:border-[#38302A]">
              <h4 className="font-semibold text-[#B43B22] dark:text-[#E46B52]">
                How to Play Chausar
              </h4>
              <p className="mt-1 text-[#746659] dark:text-[#B3A596] leading-relaxed">
                Roll the 3 dice, select pieces, and spend your rolls either one by one or combined to guide your pieces home.
              </p>
            </div>
          </div>

          {/* Feedback Form */}
          <div className="pt-2 border-t border-[#E6DCD1] dark:border-[#38302A]">
            <h4 className="font-semibold mb-2">Send Feedback</h4>
            {feedbackSuccess ? (
              <p className="text-emerald-700 dark:text-emerald-400 font-medium py-2">
                Thanks for your feedback!
              </p>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#746659] dark:text-[#A09589] mb-1">
                    Feedback Type
                  </label>
                  <select
                    value={feedbackType}
                    onChange={(e) =>
                      setFeedbackType(
                        e.target.value as 'Suggestion' | 'Bug' | 'Game Request' | 'Other'
                      )
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#D5C7B7] dark:border-[#3F332B] bg-[#FFFFFF] dark:bg-[#1E1916] text-xs"
                  >
                    <option value="Suggestion">Suggestion</option>
                    <option value="Bug">Bug Report</option>
                    <option value="Game Request">Game Suggestion</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#746659] dark:text-[#A09589] mb-1">
                    Message
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackMsg}
                    onChange={(e) => setFeedbackMsg(e.target.value)}
                    placeholder="Your suggestions or observations..."
                    className="w-full px-3 py-2 rounded-xl border border-[#D5C7B7] dark:border-[#3F332B] bg-[#FFFFFF] dark:bg-[#1E1916] text-xs"
                  />
                </div>

                <Button type="submit" variant="primary" size="sm">
                  Submit Feedback
                </Button>
              </form>
            )}
          </div>
        </div>
      </Modal>

      {/* About KridaLeela Modal */}
      <Modal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        title="About KridaLeela"
      >
        <div className="space-y-3 text-xs text-[#746659] dark:text-[#B3A596] leading-relaxed">
          <div className="text-center py-2">
            <span className="font-display text-xl font-bold text-[#B43B22] dark:text-[#E46B52]">
              KRIDALEELA
            </span>
            <p className="italic text-xs text-[#8A7969] mt-0.5">
              "Where India Plays, Tells & Remembers."
            </p>
          </div>

          <p>
            KridaLeela is a digital space dedicated to discovering traditional Indian games and, over time, stories and cultural memories from different regions of India.
          </p>

          <p>
            India possesses a rich heritage of board games, dice traditions, and tabletop pastimes. KridaLeela celebrates these games through accessible, faithful digital experiences that can be played with family and friends on a single device.
          </p>

          <div className="p-3 rounded-xl bg-[#FAF0E6] dark:bg-[#281D17] border border-[#EBD0BD] dark:border-[#4B3023] text-[#7A4E2B] dark:text-[#D99A6E]">
            Traditional games are living heritage. By documenting rules, collecting user suggestions, and recreating games with care, KridaLeela helps preserve and revive cultural play for all generations.
          </div>
        </div>
      </Modal>

      {/* Informational Modal */}
      {infoModal && (
        <Modal
          isOpen={true}
          onClose={() => setInfoModal(null)}
          title={infoModal.title}
        >
          <div className="space-y-4 text-xs text-[#746659] dark:text-[#B3A596]">
            <p className="leading-relaxed">{infoModal.desc}</p>
            <div className="flex justify-end">
              <Button
                onClick={() => setInfoModal(null)}
                variant="outline"
                size="sm"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reset Local Profile Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset Local Profile?"
      >
        <div className="space-y-4 text-xs text-[#746659] dark:text-[#B3A596]">
          <p className="leading-relaxed">
            This will reset your local profile information, activity history, and match statistics back to default guest values.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              onClick={() => setShowResetConfirm(false)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetProfile}
              variant="danger"
              size="sm"
            >
              Confirm Reset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
