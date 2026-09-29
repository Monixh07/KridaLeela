import React from 'react';
import { Piece } from '../../utils/chausarLogic';

interface ChausarPieceProps {
  piece: Piece;
  playerColorHex: string;
  isCurrentPlayer: boolean;
  isMovable: boolean;
  isSelected: boolean;
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isAnimating?: boolean;
  isJuda?: boolean;
}

export const ChausarPiece: React.FC<ChausarPieceProps> = ({
  piece,
  isMovable,
  isSelected,
  onClick,
  size = 'md',
  isAnimating = false,
  isJuda = false,
}) => {
  const isP1 = piece.playerId === 0;

  const sizeClasses = {
    xs: 'w-4 h-4 text-[8px]',
    sm: 'w-5 sm:w-6 h-5 sm:h-6 text-[10px]',
    md: 'w-7 h-7 text-xs',
    lg: 'w-8 h-8 text-xs',
  };

  const bgStyle = isP1
    ? 'bg-gradient-to-br from-[#D94F32] via-[#B43B22] to-[#7E2412] text-white shadow-xs'
    : 'bg-gradient-to-br from-[#2E7A62] via-[#1E4D3E] to-[#113127] text-white shadow-xs';

  return (
    <button
      type="button"
      onClick={isMovable || isSelected ? onClick : undefined}
      disabled={!isMovable && !isSelected}
      aria-label={`Player ${piece.playerId + 1} piece ${piece.id + 1}, ${
        piece.stepsTaken === 36
          ? 'Home'
          : piece.stepsTaken === 0
          ? 'at Base'
          : `Step ${piece.stepsTaken}`
      } ${isJuda ? '(Juda Pair)' : ''}`}
      className={`relative inline-flex items-center justify-center rounded-full font-bold select-none transition-all duration-150 border border-white/40 ${
        sizeClasses[size]
      } ${bgStyle} ${
        isMovable
          ? 'cursor-pointer ring-2 ring-amber-400 ring-offset-1 hover:scale-110 active:scale-95 animate-pulse z-20'
          : 'cursor-default'
      } ${
        isSelected
          ? 'ring-2 ring-amber-500 ring-offset-1 ring-offset-white dark:ring-offset-black scale-110 shadow-md z-30'
          : ''
      } ${isAnimating ? 'scale-115 ring-2 ring-amber-300 z-40' : ''}`}
    >
      <span className="font-mono leading-none tracking-tight">
        {piece.id + 1}
      </span>
      {isJuda && (
        <span
          title="Juda Pair (moves on even numbers)"
          className="absolute -top-1.5 -right-1.5 px-0.5 bg-amber-400 text-amber-950 font-black text-[7px] leading-tight rounded-xs border border-amber-600 shadow-2xs z-30 pointer-events-none"
        >
          JUDA
        </span>
      )}
    </button>
  );
};
