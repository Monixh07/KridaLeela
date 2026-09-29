import React from 'react';
import {
  ChenneState,
  isPlayerPit,
  getOppositePit,
} from '../../utils/chenneManeLogic';

interface ChenneManeBoardProps {
  gameState: ChenneState;
  selectedPitIndex: number | null;
  activePitIndex: number | null;
  landingPitIndex?: number | null;
  capturedPitIndices: number[];
  capturedSeedsCount?: number | null;
  isSowing: boolean;
  seedsInHand?: number;
  onSelectPit: (pitIndex: number) => void;
  disabled?: boolean;
}

export const ChenneManeBoard: React.FC<ChenneManeBoardProps> = ({
  gameState,
  selectedPitIndex,
  activePitIndex,
  landingPitIndex,
  capturedPitIndices,
  capturedSeedsCount,
  isSowing,
  seedsInHand = 0,
  onSelectPit,
  disabled = false,
}) => {
  const isP1Turn = gameState.currentPlayerId === 0;

  // Calculate next pit for selected pit preview
  const previewNextPit =
    selectedPitIndex !== null ? (selectedPitIndex + 1) % 14 : null;

  // Render small seed beads inside pit (Manjadikuru crimson seeds)
  const renderSeedBeads = (count: number, isBeingSown: boolean) => {
    if (count === 0 && !isBeingSown) {
      return (
        <div className="h-3.5 sm:h-4 flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]/60" />
        </div>
      );
    }

    // Show up to 5 small seed beads cleanly
    const displayCount = Math.min(count, 5);
    return (
      <div className="h-3.5 sm:h-4 flex items-center justify-center gap-0.5 max-w-[48px] mx-auto pointer-events-none relative">
        {Array.from({ length: displayCount }).map((_, i) => (
          <span
            key={`seed-bead-${i}`}
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-br from-[#FF5722] via-[#D32F2F] to-[#880E4F] border border-[#FFAB91]/70 shadow-2xs transform rotate-6 transition-all duration-200"
          />
        ))}
        {count > 5 && (
          <span className="text-[8px] font-bold text-amber-300 leading-none ml-0.5">
            +
          </span>
        )}

        {/* Animated Falling Seed Bead when actively receiving a drop */}
        {isBeingSown && (
          <span className="absolute -top-3 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-[#D32F2F] border-2 border-white shadow-md animate-seed-drop z-30" />
        )}
      </div>
    );
  };

  // Render a single pit cup
  const renderPit = (
    pitIndex: number,
    pitDisplayNum: number,
    isP1Row: boolean
  ) => {
    const seedCount = gameState.pits[pitIndex];
    const isOwnedByCurrent = isPlayerPit(pitIndex, gameState.currentPlayerId);
    const isPlayable =
      !disabled &&
      !isSowing &&
      gameState.phase === 'playing' &&
      isOwnedByCurrent &&
      seedCount > 0;

    const isSelected = selectedPitIndex === pitIndex;
    const isNextFromSelected =
      selectedPitIndex !== null && previewNextPit === pitIndex;
    const isActiveSowing = activePitIndex === pitIndex;
    const isCaptured = capturedPitIndices.includes(pitIndex);
    const isLandingStop = landingPitIndex === pitIndex;

    return (
      <button
        key={`pit-btn-${pitIndex}`}
        type="button"
        disabled={!isPlayable && !isSelected}
        onClick={() => onSelectPit(pitIndex)}
        className={`relative flex flex-col items-center justify-between p-1 sm:p-1.5 rounded-xl sm:rounded-2xl transition-all duration-200 min-h-[62px] sm:min-h-[76px] w-full select-none ${
          isSelected
            ? 'cursor-pointer ring-4 ring-amber-400 bg-gradient-to-b from-[#6D4C41] via-[#5D4037] to-[#4E342E] -translate-y-1.5 shadow-xl scale-102 z-10'
            : isPlayable
            ? 'cursor-pointer hover:-translate-y-0.5 active:scale-95 ring-2 ring-amber-400/80 hover:ring-amber-300 bg-gradient-to-b from-[#553C35] via-[#48332C] to-[#3A2823] shadow-md'
            : isNextFromSelected
            ? 'bg-gradient-to-b from-[#4A352D] to-[#38261F] ring-1.5 ring-amber-300/40 border border-amber-400/30'
            : 'bg-gradient-to-b from-[#3E2A23] via-[#33221C] to-[#281A15] cursor-default opacity-90'
        } ${
          isActiveSowing
            ? 'ring-4 ring-amber-300 bg-gradient-to-b from-[#7A5649] via-[#634236] to-[#4E342E] scale-105 shadow-2xl z-20 animate-cup-ripple'
            : ''
        } ${
          isCaptured
            ? 'ring-4 ring-emerald-400 bg-gradient-to-b from-emerald-950 via-emerald-900 to-[#1F3327] animate-harvest-pulse z-20'
            : ''
        } ${
          isLandingStop && !isCaptured
            ? 'ring-2 ring-amber-300/70 border-dashed border-amber-300'
            : ''
        } border border-[#6D4C41]/50 shadow-inner`}
        title={`Pit ${pitDisplayNum}: ${seedCount} seeds`}
      >
        {/* Floating Capture Badge on Harvested Pits */}
        {isCaptured && capturedSeedsCount && capturedSeedsCount > 0 && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-stone-950 font-extrabold text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full shadow-lg whitespace-nowrap animate-float-badge z-30 flex items-center gap-0.5">
            <span>🌾 Harvested!</span>
          </div>
        )}

        {/* Selected Pit Tag */}
        {isSelected && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-stone-950 font-extrabold text-[7px] sm:text-[8px] px-1.5 py-0.5 rounded-full shadow-md whitespace-nowrap z-20">
            SELECTED
          </div>
        )}

        {/* Dropping Seed Indicator Badge */}
        {isActiveSowing && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-300 text-stone-950 font-extrabold text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full shadow-md whitespace-nowrap z-30 animate-pulse">
            +1 SEED
          </div>
        )}

        {/* Next Pit Indicator during Selection Preview */}
        {isNextFromSelected && !isSowing && (
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-amber-300 font-bold text-[7px] uppercase tracking-wider bg-stone-900/90 px-1 rounded border border-amber-400/40">
            Next Pit
          </div>
        )}

        {/* Pit Number and Status marker */}
        <div className="w-full flex items-center justify-between px-1 pointer-events-none">
          <span
            className={`text-[8px] sm:text-[9px] font-mono leading-none ${
              isOwnedByCurrent
                ? isP1Turn
                  ? 'text-[#FFCCBC] font-bold'
                  : 'text-[#C8E6C9] font-bold'
                : 'text-[#BCAAA4]/60'
            }`}
          >
            {pitDisplayNum}
          </span>

          {/* Direction indicator arrow */}
          <span className="text-[8px] text-[#A1887F]/60">
            {isP1Row ? '►' : '◄'}
          </span>
        </div>

        {/* Recessed Bowl Well */}
        <div className="relative w-full flex-1 flex flex-col items-center justify-center my-0.5 rounded-lg sm:rounded-xl bg-[#1C120D] shadow-[inset_0_2px_5px_rgba(0,0,0,0.85)] border border-[#4E342E]/70 px-0.5 py-0.5">
          {/* Seed objects representation */}
          {renderSeedBeads(seedCount, isActiveSowing)}

          {/* Seed count number with pop effect when receiving a seed */}
          <span
            className={`font-display text-xs sm:text-base font-bold tabular-nums leading-tight mt-0.5 transition-transform ${
              isActiveSowing
                ? 'scale-125 text-amber-200 font-extrabold'
                : isSelected
                ? 'text-amber-300 scale-110'
                : seedCount > 0
                ? 'text-[#FFF8E1]'
                : 'text-[#6D4C41]/50'
            }`}
          >
            {seedCount}
          </span>
        </div>

        {/* Bottom subtle indicator */}
        <span
          className={`text-[7px] sm:text-[8px] leading-none pointer-events-none ${
            isActiveSowing
              ? 'text-amber-200 font-bold'
              : isSelected
              ? 'text-amber-300 font-bold'
              : isCaptured
              ? 'text-emerald-300 font-bold'
              : 'text-[#D7CCC8]/60'
          }`}
        >
          {isActiveSowing
            ? 'Receiving...'
            : isSelected
            ? `${seedCount} seeds`
            : isCaptured
            ? 'Captured!'
            : seedCount === 1
            ? '1 seed'
            : `${seedCount} seeds`}
        </span>
      </button>
    );
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Sowing In-Hand HUD (Visually tracks seeds remaining in hand during sowing) */}
      {isSowing && (
        <div className="w-full max-w-3xl mb-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/80 via-[#2E1A11] to-amber-950/80 border border-amber-500/40 shadow-md flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-base leading-none">✋</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-200">
                Seeds in Hand:
              </span>
              <span className="font-display text-sm font-bold text-amber-300 tabular-nums px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                {seedsInHand}
              </span>
            </div>
            {/* Visual beads representation of seeds in hand */}
            <div className="hidden xs:flex items-center gap-1 ml-1">
              {Array.from({ length: Math.min(seedsInHand, 8) }).map((_, i) => (
                <span
                  key={`inhand-bead-${i}`}
                  className="w-2 h-2 rounded-full bg-gradient-to-br from-[#FF5722] to-[#B71C1C] border border-amber-300/80 shadow-xs"
                />
              ))}
              {seedsInHand > 8 && (
                <span className="text-[10px] text-amber-300 font-bold">+</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-amber-300 font-medium animate-pulse">
            <span>Dropping one-by-one</span>
            <span className="text-xs">↺</span>
          </div>
        </div>
      )}

      {/* Traditional Carved Teak Wooden Board (Wide Horizontal 2x7 Layout) */}
      <div className="w-full max-w-3xl bg-gradient-to-b from-[#442B21] via-[#352017] to-[#25150F] rounded-2xl sm:rounded-3xl p-2 sm:p-3.5 shadow-xl border-2 sm:border-3 border-[#6D4C41]">
        {/* PLAYER 2 ROW HEADER */}
        <div
          className={`flex items-center justify-between px-2 sm:px-3 py-1 mb-1.5 rounded-xl transition-all duration-200 ${
            !isP1Turn
              ? 'bg-emerald-950/60 border border-emerald-500/50 shadow-xs'
              : 'bg-[#2A1A13]/60 border border-[#4E342E]/50'
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                !isP1Turn ? 'bg-emerald-400 animate-pulse' : 'bg-stone-600'
              }`}
            />
            <span
              className={`text-[11px] sm:text-xs font-bold uppercase tracking-wide ${
                !isP1Turn ? 'text-emerald-300' : 'text-[#D7CCC8]'
              }`}
            >
              {gameState.player2.name}
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#A1887F]">·</span>
            <span className="text-[9px] sm:text-[10px] text-[#BCAAA4]">
              {!isP1Turn ? 'Active Row (North)' : 'Opponent Row'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
            <span className="text-[#A1887F]">Captured:</span>
            <span className="font-display font-bold text-emerald-300 tabular-nums">
              {gameState.player2.bank}
            </span>
            <span className="text-[9px] text-[#A1887F]">seeds</span>
          </div>
        </div>

        {/* TOP ROW: PLAYER 2 PITS (Pits 13 down to 7: Left-to-Right anti-clockwise) */}
        <div className="relative">
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {[13, 12, 11, 10, 9, 8, 7].map((pitIdx) =>
              renderPit(pitIdx, pitIdx + 1, false)
            )}
          </div>
        </div>

        {/* MIDDLE DIVIDER: SOWING DIRECTION (Anti-Clockwise Circuit) */}
        <div className="my-1.5 sm:my-2 px-2 py-1 rounded-xl bg-[#1F130D] border border-[#4E342E]/80 flex items-center justify-between text-[9px] sm:text-[11px] select-none">
          {/* Top row flow indicator (Flows West / Left) */}
          <div className="flex items-center gap-1 text-emerald-400 font-semibold">
            <span>◄◄◄</span>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider hidden xs:inline">
              Sow Left
            </span>
          </div>

          {/* Central label */}
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-200/90 text-[8px] sm:text-[10px]">
            <span className="text-amber-400">↺</span>
            <span>Anti-Clockwise Sowing Circuit</span>
            <span className="text-amber-400">↻</span>
          </div>

          {/* Bottom row flow indicator (Flows East / Right) */}
          <div className="flex items-center gap-1 text-amber-400 font-semibold">
            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider hidden xs:inline">
              Sow Right
            </span>
            <span>►►►</span>
          </div>
        </div>

        {/* BOTTOM ROW: PLAYER 1 PITS (Pits 0 to 6: Left-to-Right anti-clockwise) */}
        <div className="relative">
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((pitIdx) =>
              renderPit(pitIdx, pitIdx + 1, true)
            )}
          </div>
        </div>

        {/* PLAYER 1 ROW HEADER */}
        <div
          className={`flex items-center justify-between px-2 sm:px-3 py-1 mt-1.5 rounded-xl transition-all duration-200 ${
            isP1Turn
              ? 'bg-amber-950/60 border border-amber-500/50 shadow-xs'
              : 'bg-[#2A1A13]/60 border border-[#4E342E]/50'
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isP1Turn ? 'bg-amber-400 animate-pulse' : 'bg-stone-600'
              }`}
            />
            <span
              className={`text-[11px] sm:text-xs font-bold uppercase tracking-wide ${
                isP1Turn ? 'text-amber-300' : 'text-[#D7CCC8]'
              }`}
            >
              {gameState.player1.name}
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#A1887F]">·</span>
            <span className="text-[9px] sm:text-[10px] text-[#BCAAA4]">
              {isP1Turn ? 'Active Row (South)' : 'Opponent Row'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
            <span className="text-[#A1887F]">Captured:</span>
            <span className="font-display font-bold text-amber-300 tabular-nums">
              {gameState.player1.bank}
            </span>
            <span className="text-[9px] text-[#A1887F]">seeds</span>
          </div>
        </div>
      </div>
    </div>
  );
};
