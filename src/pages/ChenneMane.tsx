import React, { useState, useEffect, useRef } from 'react';
import {
  ChenneState,
  createInitialChenneState,
  simulateMove,
  getOppositePit,
  isPlayerPit,
} from '../utils/chenneManeLogic';
import { ChenneManeBoard } from '../components/chenneMane/ChenneManeBoard';
import { ChenneManeRules } from '../components/chenneMane/ChenneManeRules';
import { ChenneManeHowToPlay } from '../components/chenneMane/ChenneManeHowToPlay';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { recordGameFinished } from '../utils/storage';
import { sound } from '../utils/audio';
import {
  RotateCcw,
  HelpCircle,
  BookOpen,
  Trophy,
  Play,
  Gauge,
  Sparkles,
} from 'lucide-react';

interface ChenneManePageProps {
  onBackToGames: () => void;
}

export const ChenneManePage: React.FC<ChenneManePageProps> = ({ onBackToGames }) => {
  // Setup inputs
  const [player1Input, setPlayer1Input] = useState('');
  const [player2Input, setPlayer2Input] = useState('');

  const [gameState, setGameState] = useState<ChenneState>(() =>
    createInitialChenneState()
  );

  // Speed preference: defaults to 'slow' for clear, observable sowing
  const [animSpeed, setAnimSpeed] = useState<'slow' | 'fast'>('slow');

  // Selection & Animation states
  const [selectedPitIndex, setSelectedPitIndex] = useState<number | null>(null);
  const [isSowing, setIsSowing] = useState(false);
  const [activePitIndex, setActivePitIndex] = useState<number | null>(null);
  const [landingPitIndex, setLandingPitIndex] = useState<number | null>(null);
  const [seedsInHand, setSeedsInHand] = useState(0);
  const [capturedPitIndices, setCapturedPitIndices] = useState<number[]>([]);
  const [capturedSeedsCount, setCapturedSeedsCount] = useState<number | null>(null);
  const [sowingMessage, setSowingMessage] = useState<string | null>(null);
  const [captureToast, setCaptureToast] = useState<{
    text: string;
    seeds: number;
    player: string;
  } | null>(null);

  const [contextGuidance, setContextGuidance] = useState<string>(
    'Select a pit from your row to begin.'
  );

  // Modals
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);

  const animationIdRef = useRef<number>(0);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sleep helper for sequence-based animation pausing
  const sleep = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    return () => {
      animationIdRef.current++;
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Update contextual guidance whenever turn changes or state resets
  useEffect(() => {
    if (gameState.phase === 'playing' && !isSowing && selectedPitIndex === null) {
      const currentP =
        gameState.currentPlayerId === 0 ? gameState.player1 : gameState.player2;
      setContextGuidance(
        `Select a pit from your row (${currentP.sideName}) to begin.`
      );
    }
  }, [gameState.currentPlayerId, gameState.phase, isSowing, selectedPitIndex]);

  // Handle Setup Start
  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    const p1 = player1Input.trim() || 'Player 1';
    const p2 = player2Input.trim() || 'Player 2';
    const newState = createInitialChenneState(p1, p2);
    newState.phase = 'playing';
    setGameState(newState);
    setSelectedPitIndex(null);
    setContextGuidance(
      `Select a pit from your row (${newState.player1.sideName}) to begin.`
    );
  };

  // Step 1: User taps a pit on their side
  const handleSelectPit = (pitIndex: number) => {
    if (gameState.phase !== 'playing' || isSowing) return;

    const isOwned = isPlayerPit(pitIndex, gameState.currentPlayerId);
    const seedCount = gameState.pits[pitIndex];

    if (!isOwned || seedCount <= 0) return;

    // Toggle selection if tapped again, or select this pit
    if (selectedPitIndex === pitIndex) {
      handleStartSowing();
      return;
    }

    setSelectedPitIndex(pitIndex);
    sound.playPieceMove();
    setContextGuidance(
      `${seedCount} seeds selected from Pit ${pitIndex + 1}. Press SOW SEEDS to begin.`
    );
  };

  // Step 2: User confirms by pressing [SOW SEEDS] - Sequence-based sowing animation with sleep function
  const handleStartSowing = async () => {
    if (
      selectedPitIndex === null ||
      isSowing ||
      gameState.phase !== 'playing'
    ) {
      return;
    }

    const startPit = selectedPitIndex;
    const { steps, nextState, capturedSeedsTotal } = simulateMove(
      gameState,
      startPit
    );

    setIsSowing(true);
    setSelectedPitIndex(null);
    setLandingPitIndex(null);
    setCapturedPitIndices([]);
    setCapturedSeedsCount(null);
    setGameState((prev) => ({ ...prev, phase: 'animating' }));

    const currentAnimId = ++animationIdRef.current;

    try {
      // Sequence-based sowing animation: iterates through each step, pausing with sleep()
      for (let i = 0; i < steps.length; i++) {
        if (animationIdRef.current !== currentAnimId) return;

        const step = steps[i];

        // Visually highlight the current pit index receiving a seed / action
        setActivePitIndex(step.pitIndex);
        setSeedsInHand(step.seedsInHand);

        if (step.type === 'pickup') {
          sound.playPieceMove();
          const pitNum = step.pitIndex + 1;
          setSowingMessage(`Scooped ${step.seedsInHand} seeds from Pit ${pitNum}`);
          setContextGuidance(
            `Picking up all seeds from Pit ${pitNum} into hand (${step.seedsInHand} seeds)...`
          );

          // Update pits snapshot
          setGameState((prev) => ({
            ...prev,
            pits: step.pitsSnapshot,
          }));

          // Pause between pickup action
          await sleep(400);
        } else if (step.type === 'sow') {
          sound.playPieceMove();
          const pitNum = step.pitIndex + 1;
          setSowingMessage(
            `Dropping seed in Pit ${pitNum} · ${step.seedsInHand} in hand`
          );
          setContextGuidance(
            `Sowing anti-clockwise: Depositing 1 seed into Pit ${pitNum} (${step.seedsInHand} remaining in hand)`
          );

          // Update intermediate pit snapshot so new seed count and seed drop animation are rendered immediately
          setGameState((prev) => ({
            ...prev,
            pits: step.pitsSnapshot,
          }));

          // Pause for 400ms between each seed deposit to visually highlight the current pit index receiving a seed
          await sleep(400);
        } else if (step.type === 'capture') {
          sound.playCapture();
          const opp = getOppositePit(step.pitIndex);
          setLandingPitIndex(step.pitIndex);
          setCapturedPitIndices([step.pitIndex, opp]);
          setCapturedSeedsCount(step.capturedSeeds || 0);

          const currentPName =
            gameState.currentPlayerId === 0
              ? gameState.player1.name
              : gameState.player2.name;

          setSowingMessage(
            `🌾 Captured ${step.capturedSeeds} seeds! Banking from Pit ${step.pitIndex + 1} & Pit ${opp + 1}`
          );
          setContextGuidance(
            `Empty cup landing! Harvested ${step.capturedSeeds} seeds from Pit ${step.pitIndex + 1} & Pit ${opp + 1}!`
          );

          // Show non-blocking toast banner
          setCaptureToast({
            text: `Harvested ${step.capturedSeeds} seeds from Pit ${step.pitIndex + 1} and Pit ${opp + 1}!`,
            seeds: step.capturedSeeds || 0,
            player: currentPName,
          });

          if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
          toastTimeoutRef.current = setTimeout(() => {
            setCaptureToast(null);
          }, 3200);

          setGameState((prev) => ({
            ...prev,
            pits: step.pitsSnapshot,
            player1: {
              ...prev.player1,
              bank:
                prev.currentPlayerId === 0
                  ? prev.player1.bank + (step.capturedSeeds || 0)
                  : prev.player1.bank,
            },
            player2: {
              ...prev.player2,
              bank:
                prev.currentPlayerId === 1
                  ? prev.player2.bank + (step.capturedSeeds || 0)
                  : prev.player2.bank,
            },
          }));

          await sleep(800);
        } else if (step.type === 'end') {
          setLandingPitIndex(step.pitIndex);
          setSowingMessage('Sowing completed in empty pit.');
          setContextGuidance(
            'Last seed landed in an empty cup with no capture. Turn concludes.'
          );
          await sleep(400);
        }
      }

      if (animationIdRef.current !== currentAnimId) return;

      // Sowing sequence completed
      setIsSowing(false);
      setActivePitIndex(null);
      setLandingPitIndex(null);
      setCapturedPitIndices([]);
      setCapturedSeedsCount(null);
      setSeedsInHand(0);
      setSowingMessage(null);
      setGameState(nextState);

      if (nextState.phase === 'game_over') {
        sound.playVictory();
        const isP1 = nextState.winner?.id === 0;
        const winnerName = nextState.winner ? nextState.winner.name : 'Tie';
        recordGameFinished(winnerName, isP1, 'Chenne Mane');
        setContextGuidance(
          nextState.isTie
            ? 'Harvest complete: It is an exact tie (28–28)!'
            : `Harvest complete: ${winnerName} Wins!`
        );
      } else if (capturedSeedsTotal > 0) {
        const nextPName =
          nextState.currentPlayerId === 0
            ? nextState.player1.name
            : nextState.player2.name;
        setContextGuidance(
          `Harvested ${capturedSeedsTotal} seeds! ${nextPName}'s turn.`
        );
      } else {
        const nextPName =
          nextState.currentPlayerId === 0
            ? nextState.player1.name
            : nextState.player2.name;
        setContextGuidance(
          `Sowing ended in empty pit. ${nextPName}'s turn.`
        );
      }
    } catch (err) {
      console.error('Error in sowing animation sequence:', err);
      setIsSowing(false);
      setGameState(nextState);
    }
  };

  // Restart Game
  const handleConfirmNewGame = () => {
    animationIdRef.current++;
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setIsSowing(false);
    setSelectedPitIndex(null);
    setActivePitIndex(null);
    setLandingPitIndex(null);
    setCapturedPitIndices([]);
    setCapturedSeedsCount(null);
    setSeedsInHand(0);
    setSowingMessage(null);
    setCaptureToast(null);
    const p1 = player1Input.trim() || 'Player 1';
    const p2 = player2Input.trim() || 'Player 2';
    const fresh = createInitialChenneState(p1, p2);
    fresh.phase = 'playing';
    setGameState(fresh);
    setContextGuidance(
      `Select a pit from your row (${fresh.player1.sideName}) to begin.`
    );
    setShowNewGameModal(false);
  };

  const currentP =
    gameState.currentPlayerId === 0 ? gameState.player1 : gameState.player2;

  // 1. SETUP SCREEN BEFORE GAME BEGINS
  if (gameState.phase === 'setup') {
    return (
      <div id="chennemane-game-container" className="max-w-md mx-auto py-4 px-4 select-none">
        <div className="bg-[#FAF7F2] dark:bg-[#1E1916] rounded-2xl border border-[#E6DCD1] dark:border-[#38302A] p-5 sm:p-6 shadow-sm text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C2915] dark:text-[#E46B52]">
            Traditional Mancala of Coastal Karnataka
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#28211A] dark:text-[#F0EAE1] mt-0.5">
            CHENNE MANE
          </h1>
          <p className="text-xs text-[#746659] dark:text-[#B3A596] mt-1">
            2 Player Game · 14 Pits · 56 Manjadikuru Seeds
          </p>

          <form onSubmit={handleStartGame} className="mt-5 space-y-3.5 text-left">
            <div>
              <label className="block text-xs font-semibold text-[#28211A] dark:text-[#F0EAE1] mb-1">
                Player 1 (South Row)
              </label>
              <input
                type="text"
                value={player1Input}
                onChange={(e) => setPlayer1Input(e.target.value)}
                placeholder="Player 1"
                maxLength={18}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7B7] dark:border-[#3F332B] bg-white dark:bg-[#151210] text-[#28211A] dark:text-[#F0EAE1] focus:outline-[#8C2915]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#28211A] dark:text-[#F0EAE1] mb-1">
                Player 2 (North Row)
              </label>
              <input
                type="text"
                value={player2Input}
                onChange={(e) => setPlayer2Input(e.target.value)}
                placeholder="Player 2"
                maxLength={18}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7B7] dark:border-[#3F332B] bg-white dark:bg-[#151210] text-[#28211A] dark:text-[#F0EAE1] focus:outline-[#8C2915]"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              className="mt-2 py-2.5 font-bold"
            >
              Start Game
            </Button>
          </form>

          <div className="mt-4 pt-3 border-t border-[#E6DCD1] dark:border-[#38302A] flex justify-center gap-4 text-xs text-[#746659] dark:text-[#B3A596]">
            <button
              onClick={() => setShowHowToPlayModal(true)}
              className="hover:text-[#8C2915] underline underline-offset-2 cursor-pointer"
            >
              How to Play
            </button>
            <button
              onClick={() => setShowRulesModal(true)}
              className="hover:text-[#8C2915] underline underline-offset-2 cursor-pointer"
            >
              Rules
            </button>
          </div>
        </div>

        {/* Modals */}
        <Modal
          isOpen={showRulesModal}
          onClose={() => setShowRulesModal(false)}
          title="Chenne Mane Rules"
          subtitle="Traditional rules of Coastal Karnataka"
        >
          <ChenneManeRules />
        </Modal>

        <Modal
          isOpen={showHowToPlayModal}
          onClose={() => setShowHowToPlayModal(false)}
          title="How to Play Chenne Mane"
          subtitle="Quick guide to pick, relay and capture"
        >
          <ChenneManeHowToPlay />
        </Modal>
      </div>
    );
  }

  // 2. MAIN ACTIVE PLAYABLE SCREEN (Landscape-first, Vertically Constrained)
  return (
    <div
      id="chennemane-game-container"
      className="w-full max-w-3xl mx-auto px-1.5 sm:px-3 py-1 sm:py-2 select-none flex flex-col justify-start"
    >
      {/* Top Header: Title & Action Controls */}
      <div className="flex items-center justify-between gap-2 border-b border-[#E6DCD1] dark:border-[#38302A] pb-1.5 mb-1.5">
        <div className="flex items-center gap-2">
          <span className="font-display text-base sm:text-lg font-bold text-[#28211A] dark:text-[#F0EAE1] leading-none">
            Chenne Mane
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#746659] dark:text-[#B3A596]">
            Round {gameState.turnCount}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Speed Toggle: Clear/Slow vs Fast */}
          <button
            type="button"
            onClick={() =>
              setAnimSpeed((prev) => (prev === 'slow' ? 'fast' : 'slow'))
            }
            className={`text-[11px] px-2 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
              animSpeed === 'slow'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300 font-semibold'
                : 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300'
            }`}
            title="Toggle Sowing Animation Speed"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>{animSpeed === 'slow' ? '🐢 Slow' : '🐇 Fast'}</span>
          </button>

          <Button
            onClick={() => setShowHowToPlayModal(true)}
            variant="ghost"
            size="sm"
            className="text-[11px] px-2 py-1 min-h-[30px]"
            title="How to Play"
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Help</span>
          </Button>
          <Button
            onClick={() => setShowRulesModal(true)}
            variant="ghost"
            size="sm"
            className="text-[11px] px-2 py-1 min-h-[30px]"
            title="Rules"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Rules</span>
          </Button>
          <Button
            onClick={() => setShowNewGameModal(true)}
            variant="outline"
            size="sm"
            className="text-[11px] px-2 py-1 min-h-[30px]"
            title="Restart Match"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            <span>Restart</span>
          </Button>
        </div>
      </div>

      {/* COMPACT PLAYER STATUS AREA (Section 7) */}
      <div className="mb-2 bg-[#FAF7F2] dark:bg-[#1E1916] rounded-xl border border-[#E6DCD1] dark:border-[#38302A] p-2 sm:p-2.5 shadow-xs">
        <div className="grid grid-cols-3 items-center gap-1 sm:gap-2">
          {/* Player 2 (North) */}
          <div
            className={`px-2 py-1 rounded-lg text-left transition-all ${
              gameState.currentPlayerId === 1
                ? 'bg-emerald-500/15 border border-emerald-500/40 ring-1 ring-emerald-500/20 shadow-xs'
                : 'opacity-80'
            }`}
          >
            <div className="text-[9px] uppercase tracking-wider text-[#746659] dark:text-[#A09589] font-medium truncate">
              {gameState.player2.name} (North)
            </div>
            <div className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
              {gameState.player2.bank}{' '}
              <span className="text-[9px] font-normal text-stone-500">
                captured
              </span>
            </div>
          </div>

          {/* Current Turn Indicator (Seamless, No Popups) */}
          <div className="text-center px-1">
            <div
              className={`inline-flex flex-col items-center justify-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg transition-colors ${
                gameState.currentPlayerId === 0
                  ? 'bg-[#8C2915]/10 text-[#8C2915] dark:text-[#FF8A65]'
                  : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    gameState.currentPlayerId === 0
                      ? 'bg-[#8C2915] animate-ping'
                      : 'bg-emerald-500 animate-ping'
                  }`}
                />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide">
                  {currentP.name}'s Turn
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] opacity-75">
                {currentP.sideName}
              </span>
            </div>
          </div>

          {/* Player 1 (South) */}
          <div
            className={`px-2 py-1 rounded-lg text-right transition-all ${
              gameState.currentPlayerId === 0
                ? 'bg-[#8C2915]/15 border border-[#8C2915]/40 ring-1 ring-[#8C2915]/20 shadow-xs'
                : 'opacity-80'
            }`}
          >
            <div className="text-[9px] uppercase tracking-wider text-[#746659] dark:text-[#A09589] font-medium truncate">
              {gameState.player1.name} (South)
            </div>
            <div className="text-xs sm:text-sm font-bold text-[#8C2915] dark:text-[#FF8A65] tabular-nums">
              {gameState.player1.bank}{' '}
              <span className="text-[9px] font-normal text-stone-500">
                captured
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* NON-BLOCKING CAPTURE FEEDBACK TOAST BANNER */}
      {captureToast && (
        <div className="mb-2 py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-950 via-[#132A1C] to-emerald-950 border-2 border-emerald-400 text-emerald-200 text-xs shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-base">🌾</span>
            <span className="font-semibold text-emerald-100">
              {captureToast.player} captured +{captureToast.seeds} seeds!
            </span>
          </div>
          <span className="text-[10px] text-emerald-300 font-medium">
            Added to bank
          </span>
        </div>
      )}

      {/* MAIN LANDSCAPE BOARD (Section 1 & 3) */}
      <div className="w-full flex justify-center">
        <ChenneManeBoard
          gameState={gameState}
          selectedPitIndex={selectedPitIndex}
          activePitIndex={activePitIndex}
          landingPitIndex={landingPitIndex}
          capturedPitIndices={capturedPitIndices}
          capturedSeedsCount={capturedSeedsCount}
          isSowing={isSowing}
          seedsInHand={seedsInHand}
          onSelectPit={handleSelectPit}
          disabled={gameState.phase === 'game_over'}
        />
      </div>

      {/* SELECTED PIT ACTION BAR (Visual cues for selection & clear action) */}
      {selectedPitIndex !== null && !isSowing && gameState.phase === 'playing' && (
        <div className="mt-2 p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-[#3E2723] via-[#2D1B13] to-[#3E2723] border-2 border-amber-400 shadow-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-amber-200 font-display font-bold text-base shadow-inner">
              {gameState.pits[selectedPitIndex]}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-amber-200">
                  {gameState.pits[selectedPitIndex]} seeds selected
                </span>
                <span className="text-[10px] text-amber-300/80">· Pit {selectedPitIndex + 1}</span>
              </div>
              <p className="text-[10px] text-[#D7CCC8]/80">
                Will sow 1 seed per pit anti-clockwise
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedPitIndex(null)}
              className="px-2.5 py-1 text-xs text-[#D7CCC8]/80 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStartSowing}
              className="px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-bold text-xs sm:text-sm rounded-lg shadow-md transition-all transform active:scale-95 flex items-center gap-1.5 cursor-pointer ring-2 ring-amber-300"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>SOW SEEDS</span>
            </button>
          </div>
        </div>
      )}

      {/* SOWING ANIMATION STATUS OR BEGINNER GUIDANCE (Section 5, 6, 8) */}
      <div className="mt-2 py-1.5 px-3 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1916] border border-[#E6DCD1] dark:border-[#38302A] text-center text-xs flex items-center justify-center gap-2 min-h-[34px]">
        {sowingMessage ? (
          <span className="font-semibold text-amber-700 dark:text-amber-300 animate-pulse flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            {sowingMessage}
          </span>
        ) : (
          <span className="text-[#5D4037] dark:text-[#D7CCC8] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{contextGuidance}</span>
          </span>
        )}
      </div>

      {/* GAME OVER SCREEN (Section 7) */}
      <Modal
        isOpen={gameState.phase === 'game_over'}
        onClose={() => {}}
        title="Harvest Complete"
        subtitle="Final Seed Counts"
      >
        <div className="text-center py-3 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-300 shadow-inner">
            <Trophy className="w-7 h-7" />
          </div>

          <div>
            <h3 className="font-display text-2xl font-bold text-[#28211A] dark:text-[#F0EAE1]">
              {gameState.isTie
                ? 'It is an Exact Tie!'
                : `${gameState.winner?.name.toUpperCase()} WINS!`}
            </h3>
            <p className="text-xs text-[#746659] dark:text-[#A09589] mt-1">
              Match concluded in {gameState.turnCount} rounds
            </p>
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1916] border border-[#E6DCD1] dark:border-[#38302A] text-left">
            <div className="p-2">
              <span className="text-[11px] font-semibold text-[#8C2915] dark:text-[#E46B52]">
                {gameState.player1.name} (South)
              </span>
              <p className="font-display text-2xl font-bold text-[#28211A] dark:text-[#F0EAE1] mt-0.5">
                {gameState.player1.bank}{' '}
                <span className="text-xs font-normal text-[#746659]">seeds</span>
              </p>
            </div>
            <div className="p-2 border-l border-[#E6DCD1] dark:border-[#38302A]">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                {gameState.player2.name} (North)
              </span>
              <p className="font-display text-2xl font-bold text-[#28211A] dark:text-[#F0EAE1] mt-0.5">
                {gameState.player2.bank}{' '}
                <span className="text-xs font-normal text-[#746659]">seeds</span>
              </p>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              onClick={handleConfirmNewGame}
              variant="primary"
              fullWidth
              size="lg"
            >
              Play Again
            </Button>
            <Button
              onClick={onBackToGames}
              variant="outline"
              fullWidth
              size="lg"
            >
              Back to Games
            </Button>
          </div>
        </div>
      </Modal>

      {/* Restart Confirmation Modal */}
      <Modal
        isOpen={showNewGameModal}
        onClose={() => setShowNewGameModal(false)}
        title="Start New Game?"
        subtitle="Current match progress will be lost."
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-[#746659] dark:text-[#A09589]">
            Are you sure you want to restart this Chenne Mane match?
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => setShowNewGameModal(false)}
              variant="ghost"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmNewGame}
              variant="primary"
              size="sm"
            >
              Restart
            </Button>
          </div>
        </div>
      </Modal>

      {/* Help & Rules Modals */}
      <Modal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        title="Chenne Mane Rules"
        subtitle="Traditional rules of Coastal Karnataka"
      >
        <ChenneManeRules />
      </Modal>

      <Modal
        isOpen={showHowToPlayModal}
        onClose={() => setShowHowToPlayModal(false)}
        title="How to Play Chenne Mane"
        subtitle="Quick guide to pick, relay and capture"
      >
        <ChenneManeHowToPlay />
      </Modal>
    </div>
  );
};
