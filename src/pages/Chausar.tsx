import React, { useState, useEffect, useRef } from 'react';
import {
  applyMove,
  ChausarState,
  createInitialState,
  getValidMovesForPiece,
  hasAnyValidMoves,
  isPieceMovable,
  MoveOption,
  throwCowries,
} from '../utils/chausarLogic';
import { ChausarBoard } from '../components/chausar/ChausarBoard';
import { ChausarCowries } from '../components/chausar/ChausarCowries';
import { ChausarRules } from '../components/chausar/ChausarRules';
import { ChausarHowToPlay } from '../components/chausar/ChausarHowToPlay';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { recordGameFinished } from '../utils/storage';
import { sound } from '../utils/audio';
import { RotateCcw, HelpCircle, BookOpen, AlertCircle, Trophy, Users } from 'lucide-react';

interface ChausarPageProps {
  onBackToGames: () => void;
}

export const ChausarPage: React.FC<ChausarPageProps> = ({ onBackToGames }) => {
  // Player Setup form state
  const [player1Input, setPlayer1Input] = useState('');
  const [player2Input, setPlayer2Input] = useState('');

  const [gameState, setGameState] = useState<ChausarState>(() => createInitialState());
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingPiece, setAnimatingPiece] = useState<{
    pieceId: number;
    playerId: 0 | 1;
    step: number;
  } | null>(null);

  // Modals
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const currentP = gameState.players[gameState.currentPlayerId];
  const opponentP = gameState.players[gameState.currentPlayerId === 0 ? 1 : 0];

  const animIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (animIntervalRef.current) {
        clearInterval(animIntervalRef.current);
      }
    };
  }, []);

  // Notice auto-dismiss
  useEffect(() => {
    if (noticeMessage) {
      const timer = setTimeout(() => setNoticeMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [noticeMessage]);

  // Handle Setup Game Start
  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    const p1 = player1Input.trim() || 'Player 1';
    const p2 = player2Input.trim() || 'Player 2';
    const newState = createInitialState(p1, p2);
    newState.phase = 'rolling';
    setGameState(newState);
  };

  // Compute valid moves for currently selected piece
  const selectedPiece =
    gameState.selectedPieceId !== null
      ? currentP.pieces.find((p) => p.id === gameState.selectedPieceId)
      : null;

  const validMovesForSelected: MoveOption[] =
    selectedPiece && gameState.phase === 'moving' && !isAnimating
      ? getValidMovesForPiece(selectedPiece, currentP, opponentP, gameState.currentScore)
      : [];

  // Check if player has ANY moves with the current score
  const anyMovesAvailable =
    gameState.phase === 'moving'
      ? hasAnyValidMoves(currentP, opponentP, gameState.currentScore)
      : true;

  // Handle Cowries Throw
  const handleThrowCowries = () => {
    if (gameState.phase !== 'rolling' || isAnimating) return;

    const roll = throwCowries();
    const movesExist = hasAnyValidMoves(currentP, opponentP, roll.score);

    setGameState((prev) => ({
      ...prev,
      cowries: roll.shells,
      currentScore: roll.score,
      isExtraThrow: roll.isExtraThrow,
      phase: movesExist ? 'moving' : 'rolling',
      selectedPieceId: null,
      lastNotice: roll.isExtraThrow ? `${currentP.name} rolled ${roll.score} — Extra Throw!` : null,
    }));

    if (!movesExist) {
      if (roll.isExtraThrow) {
        setNoticeMessage(`Rolled ${roll.score} (No valid moves). Extra throw granted!`);
      } else {
        setNoticeMessage(`Rolled ${roll.score} (No valid moves). Passing turn.`);
        // Continuous turn switch after brief notice
        setTimeout(() => {
          setGameState((prev) => {
            const nextP = prev.currentPlayerId === 0 ? 1 : 0;
            return {
              ...prev,
              currentPlayerId: nextP,
              currentScore: null,
              isExtraThrow: false,
              phase: 'rolling',
              selectedPieceId: null,
              turnCount: prev.currentPlayerId === 1 ? prev.turnCount + 1 : prev.turnCount,
            };
          });
        }, 1200);
      }
    }
  };

  // Handle Piece Selection
  const handleSelectPiece = (pieceId: number) => {
    if (gameState.phase !== 'moving' || isAnimating) return;

    const piece = currentP.pieces.find((p) => p.id === pieceId);
    if (!piece) return;

    if (piece.stepsTaken === 36) {
      setNoticeMessage('This pawn has already reached Charkoni.');
      return;
    }

    const movable = isPieceMovable(
      piece,
      currentP,
      opponentP,
      gameState.currentScore,
      gameState.phase
    );

    if (!movable) {
      setNoticeMessage('That pawn cannot make this move. Choose another pawn.');
      return;
    }

    setGameState((prev) => ({
      ...prev,
      selectedPieceId: pieceId,
    }));
  };

  // Finalize move state
  const finalizeMove = (move: MoveOption) => {
    const { nextState, capturedCount, gameWon } = applyMove(gameState, move);

    if (capturedCount > 0) {
      sound.playCapture();
      setNoticeMessage(`Pawn captured! Opponent returned to Charkoni.`);
    }

    if (gameWon && nextState.winner) {
      const isP1 = nextState.winner.id === 0;
      recordGameFinished(nextState.winner.name, isP1);
    }

    setGameState(nextState);
  };

  // Apply move with smooth cell transitions
  const handleApplyMove = (move: MoveOption) => {
    if (gameState.selectedPieceId === null || gameState.phase !== 'moving' || isAnimating) return;

    const piece = currentP.pieces.find((p) => p.id === gameState.selectedPieceId);
    if (!piece) return;

    setIsAnimating(true);
    const startStep = piece.stepsTaken;
    const targetStep = move.targetSteps;
    const pId = currentP.id;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      finalizeMove(move);
      setIsAnimating(false);
      return;
    }

    const steps: number[] = [];
    for (let s = startStep + 1; s <= targetStep; s++) {
      steps.push(s);
    }

    let stepIdx = 0;
    animIntervalRef.current = setInterval(() => {
      if (stepIdx < steps.length) {
        const curr = steps[stepIdx];
        setAnimatingPiece({ pieceId: piece.id, playerId: pId, step: curr });
        sound.playPieceMove();
        stepIdx++;
      } else {
        if (animIntervalRef.current) {
          clearInterval(animIntervalRef.current);
          animIntervalRef.current = null;
        }
        setAnimatingPiece(null);
        finalizeMove(move);
        setIsAnimating(false);
      }
    }, 100);
  };

  // Manual pass turn
  const handlePassTurn = () => {
    if (isAnimating) return;
    setGameState((prev) => {
      const nextP = prev.currentPlayerId === 0 ? 1 : 0;
      return {
        ...prev,
        currentPlayerId: nextP,
        currentScore: null,
        isExtraThrow: false,
        phase: 'rolling',
        selectedPieceId: null,
        turnCount: prev.currentPlayerId === 1 ? prev.turnCount + 1 : prev.turnCount,
      };
    });
  };

  // Restart / New Game
  const handleConfirmNewGame = () => {
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      animIntervalRef.current = null;
    }
    setIsAnimating(false);
    setAnimatingPiece(null);
    setGameState(createInitialState(player1Input, player2Input));
    setShowNewGameModal(false);
    setNoticeMessage(null);
  };

  const p1HomeCount = gameState.players[0].pieces.filter((p) => p.stepsTaken === 36).length;
  const p2HomeCount = gameState.players[1].pieces.filter((p) => p.stepsTaken === 36).length;

  // 1. SETUP SCREEN BEFORE GAME BEGINS
  if (gameState.phase === 'setup') {
    return (
      <div id="chausar-game-container" className="max-w-md mx-auto py-6 px-4">
        <div className="bg-[#FAF7F2] dark:bg-[#1E1916] rounded-2xl border border-[#E6DCD1] dark:border-[#38302A] p-6 shadow-sm text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#B43B22] dark:text-[#E46B52]">
            Traditional Board Game
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#28211A] dark:text-[#F0EAE1] mt-1">
            CHAUSAR
          </h1>
          <p className="text-xs text-[#746659] dark:text-[#B3A596] mt-1">
            2 Player Pass & Play · 6 Cowrie Shells
          </p>

          <form onSubmit={handleStartGame} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-[#28211A] dark:text-[#F0EAE1] mb-1">
                Player 1 (Terracotta)
              </label>
              <input
                type="text"
                value={player1Input}
                onChange={(e) => setPlayer1Input(e.target.value)}
                placeholder="Player 1"
                maxLength={18}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7B7] dark:border-[#3F332B] bg-white dark:bg-[#151210] text-[#28211A] dark:text-[#F0EAE1] focus:outline-[#B43B22]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#28211A] dark:text-[#F0EAE1] mb-1">
                Player 2 (Temple Green)
              </label>
              <input
                type="text"
                value={player2Input}
                onChange={(e) => setPlayer2Input(e.target.value)}
                placeholder="Player 2"
                maxLength={18}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7B7] dark:border-[#3F332B] bg-white dark:bg-[#151210] text-[#28211A] dark:text-[#F0EAE1] focus:outline-[#B43B22]"
              />
            </div>

            <Button type="submit" variant="primary" fullWidth size="lg" className="mt-2">
              Start Game
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#E6DCD1] dark:border-[#38302A] flex justify-center gap-4 text-xs text-[#746659] dark:text-[#B3A596]">
            <button
              onClick={() => setShowHowToPlayModal(true)}
              className="hover:text-[#B43B22] underline underline-offset-2"
            >
              How to Play
            </button>
            <button
              onClick={() => setShowRulesModal(true)}
              className="hover:text-[#B43B22] underline underline-offset-2"
            >
              Rules
            </button>
          </div>
        </div>

        {/* Rules & How to Play Modals */}
        <Modal
          isOpen={showRulesModal}
          onClose={() => setShowRulesModal(false)}
          title="Chausar Rules"
          subtitle="Traditional digital ruleset"
        >
          <ChausarRules />
        </Modal>

        <Modal
          isOpen={showHowToPlayModal}
          onClose={() => setShowHowToPlayModal(false)}
          title="How to Play Chausar"
          subtitle="Quick guide to digital pass-and-play"
        >
          <ChausarHowToPlay />
        </Modal>
      </div>
    );
  }

  // 2. MAIN ACTIVE GAMEPLAY SCREEN (Responsive, vertically constrained)
  return (
    <div
      id="chausar-game-container"
      className="w-full max-w-4xl mx-auto px-1 sm:px-3 py-1 select-none flex flex-col justify-start"
    >
      {/* Compact Top Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#E6DCD1] dark:border-[#38302A] pb-1.5 mb-1.5">
        <div className="flex items-center gap-2">
          <span className="font-display text-base sm:text-lg font-bold text-[#28211A] dark:text-[#F0EAE1] leading-none">
            Chausar
          </span>
          <span className="text-[11px] text-[#746659] dark:text-[#B3A596]">
            Turn {gameState.turnCount}
          </span>
        </div>

        <div className="flex items-center gap-1">
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
            <span>New</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Board + Controls side-by-side on desktop, compact vertical stack on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-4 items-center">
        {/* Left: The Chausar Cross Board */}
        <div className="md:col-span-7 flex flex-col items-center justify-center">
          <ChausarBoard
            gameState={gameState}
            validMovesForSelected={validMovesForSelected}
            animatingPiece={animatingPiece}
            onSelectPiece={handleSelectPiece}
            onApplyMoveOption={handleApplyMove}
          />
        </div>

        {/* Right: HUD, Cowries, Turn, Actions */}
        <div className="md:col-span-5 flex flex-col justify-center space-y-2">
          {/* Turn HUD & Status */}
          <div className="bg-[#FAF7F2] dark:bg-[#1E1916] rounded-xl border border-[#E6DCD1] dark:border-[#38302A] p-2 shadow-2xs">
            {/* Player Home Counts */}
            <div className="grid grid-cols-2 gap-2 divide-x divide-[#E6DCD1] dark:divide-[#38302A] pb-1.5 mb-1.5 border-b border-[#E6DCD1] dark:border-[#38302A] text-xs">
              <div
                className={`px-1 flex items-center justify-between ${
                  gameState.currentPlayerId === 0
                    ? 'font-bold text-[#B43B22] dark:text-[#E46B52]'
                    : 'text-[#746659] dark:text-[#A09589]'
                }`}
              >
                <span className="truncate max-w-[90px]">{gameState.players[0].name}</span>
                <span className="tabular-nums font-semibold">{p1HomeCount}/4</span>
              </div>
              <div
                className={`pl-2 flex items-center justify-between ${
                  gameState.currentPlayerId === 1
                    ? 'font-bold text-[#1E4D3E] dark:text-[#52B496]'
                    : 'text-[#746659] dark:text-[#A09589]'
                }`}
              >
                <span className="truncate max-w-[90px]">{gameState.players[1].name}</span>
                <span className="tabular-nums font-semibold">{p2HomeCount}/4</span>
              </div>
            </div>

            {/* Continuous Turn Indicator (No popup, uses actual player name!) */}
            <div
              className={`px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-semibold transition-colors ${
                gameState.currentPlayerId === 0
                  ? 'bg-[#FBF0ED] text-[#8C2915] dark:bg-[#2F1914] dark:text-[#F09C89]'
                  : 'bg-[#ECF4F1] text-[#133C30] dark:bg-[#152A22] dark:text-[#84CBB4]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    gameState.currentPlayerId === 0 ? 'bg-[#B43B22]' : 'bg-[#1E4D3E]'
                  }`}
                />
                <span className="uppercase tracking-wide">{currentP.name}'s Turn:</span>
                <span className="font-normal opacity-90">
                  {isAnimating
                    ? 'Moving...'
                    : gameState.phase === 'rolling'
                    ? 'Roll cowries'
                    : gameState.selectedPieceId === null
                    ? 'Select pawn'
                    : 'Choose move'}
                </span>
              </div>

              {gameState.phase === 'moving' && !anyMovesAvailable && !isAnimating && (
                <button
                  onClick={handlePassTurn}
                  className="px-2 py-0.5 rounded bg-white/80 dark:bg-black/40 text-[10px] font-bold hover:bg-white transition-colors"
                >
                  Pass Turn
                </button>
              )}
            </div>
          </div>

          {/* Feedback & Notice Banner */}
          {noticeMessage && (
            <div className="px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-1.5 animate-in fade-in duration-150">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{noticeMessage}</span>
            </div>
          )}

          {/* Cowrie Throw & Move Tray */}
          <div className="bg-[#FAF7F2] dark:bg-[#1E1916] rounded-xl border border-[#E6DCD1] dark:border-[#38302A] p-2 space-y-2">
            <ChausarCowries
              cowries={gameState.cowries}
              score={gameState.currentScore}
              isExtraThrow={gameState.isExtraThrow}
              canThrow={gameState.phase === 'rolling' && !isAnimating}
              disabled={isAnimating}
              onThrow={handleThrowCowries}
            />

            {/* Move options when pawn is selected */}
            {gameState.phase === 'moving' && !isAnimating && (
              <div className="pt-1.5 border-t border-[#E6DCD1] dark:border-[#38302A]">
                {selectedPiece ? (
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#746659] dark:text-[#B3A596] mb-1">
                      <span>
                        Pawn #{selectedPiece.id + 1} (
                        {selectedPiece.stepsTaken === 0
                          ? 'at Base'
                          : `Step ${selectedPiece.stepsTaken}/36`}
                        )
                      </span>
                      {validMovesForSelected.length > 0 && (
                        <span>Tap button or highlighted cell</span>
                      )}
                    </div>

                    {validMovesForSelected.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {validMovesForSelected.map((opt, i) => (
                          <button
                            key={`move-opt-${opt.targetSteps}-${opt.moveAmount}-${i}`}
                            onClick={() => handleApplyMove(opt)}
                            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#2A231E] border border-[#D5C7B7] dark:border-[#4B3E34] hover:border-[#B43B22] text-xs font-semibold text-[#28211A] dark:text-[#F0EAE1] flex items-center gap-1 shadow-2xs hover:shadow-xs cursor-pointer transition-all active:scale-95"
                          >
                            <span className="text-amber-700 dark:text-amber-400 font-bold tabular-nums">
                              +{opt.moveAmount}
                            </span>
                            {opt.isJudaMove && (
                              <span className="text-[9px] bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-200 px-1 rounded font-bold">
                                JUDA
                              </span>
                            )}
                            <span className="text-[10px] text-[#746659] dark:text-[#9F9184]">
                              (to {opt.targetSteps === 36 ? 'Charkoni' : `step ${opt.targetSteps}`})
                            </span>
                            {opt.capturesOpponent && (
                              <span className="text-[9px] text-red-600 dark:text-red-400 font-bold ml-0.5">
                                ⚔ Capture
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#8A7969] italic">
                        No valid moves for Pawn #{selectedPiece.id + 1}. Try another pawn.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-1 text-[11px] text-[#746659] dark:text-[#B3A596]">
                    Select any highlighted pawn to move.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Cultural Link */}
          <div className="text-center pt-0.5">
            <button
              onClick={() => setShowAboutModal(true)}
              className="text-[10px] text-[#746659] dark:text-[#9F9184] hover:text-[#B43B22] transition-colors underline underline-offset-2 cursor-pointer"
            >
              About Chausar & Cowries Heritage
            </button>
          </div>
        </div>
      </div>

      {/* Win Display (Embedded, no annoying popup) */}
      {gameState.phase === 'game_over' && gameState.winner && (
        <div className="mt-3 p-4 bg-[#FAF7F2] dark:bg-[#1E1916] rounded-xl border-2 border-[#B43B22] text-center shadow-md animate-in fade-in zoom-in-95">
          <Trophy className="w-8 h-8 mx-auto text-[#B43B22] dark:text-[#E46B52] mb-1" />
          <h2 className="font-display text-xl font-bold text-[#28211A] dark:text-[#F0EAE1]">
            {gameState.winner.name.toUpperCase()} WINS!
          </h2>
          <p className="text-xs text-[#746659] dark:text-[#B3A596] mt-0.5">
            All four pawns safely reached Charkoni.
          </p>
          <div className="mt-3 flex justify-center gap-3">
            <Button onClick={handleConfirmNewGame} variant="primary" size="sm">
              Play Again
            </Button>
            <Button onClick={onBackToGames} variant="outline" size="sm">
              Back to Games
            </Button>
          </div>
        </div>
      )}

      {/* New Game Confirmation Modal */}
      <Modal
        isOpen={showNewGameModal}
        onClose={() => setShowNewGameModal(false)}
        title="Start a new game?"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#746659] dark:text-[#B3A596] leading-relaxed">
            The current game board will be reset. Your profile statistics will remain preserved.
          </p>
          <div className="flex items-center gap-3">
            <Button onClick={handleConfirmNewGame} variant="primary" fullWidth size="sm">
              New Game
            </Button>
            <Button
              onClick={() => setShowNewGameModal(false)}
              variant="outline"
              fullWidth
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rules Modal */}
      <Modal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        title="Chausar Rules"
        subtitle="Traditional cowrie & Juda ruleset"
      >
        <ChausarRules />
      </Modal>

      {/* How to Play Modal */}
      <Modal
        isOpen={showHowToPlayModal}
        onClose={() => setShowHowToPlayModal(false)}
        title="How to Play Chausar"
        subtitle="Cowries, Juda pairs and Charkoni"
      >
        <ChausarHowToPlay />
      </Modal>

      {/* About Chausar Modal */}
      <Modal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        title="About Chausar"
        subtitle="Heritage & Origins"
      >
        <div className="space-y-2.5 text-xs text-[#746659] dark:text-[#B3A596] leading-relaxed">
          <p>
            Chausar is an ancient Indian cross-board game associated with the Chaupar and Pachisi family of games. References to games played on cruciform cloth boards date back centuries across classical Indian literature and sculpture.
          </p>
          <p>
            Traditionally played with six cowrie shells and conical pawns, Chausar features the unique <strong>Juda</strong> mechanic: two pawns of the same player pairing together for mutual protection, moving only on even values (2, 4, 6, 12).
          </p>
          <div className="p-2.5 rounded-lg bg-[#FAF0E6] dark:bg-[#281D17] border border-[#EBD0BD] dark:border-[#4B3023] text-[#7A4E2B] dark:text-[#D99A6E]">
            Chausar has been played in different forms across India, and rules vary by region. KRIDALEELA presents a simplified traditional-style digital ruleset based on documented traditions.
          </div>
        </div>
      </Modal>
    </div>
  );
};
