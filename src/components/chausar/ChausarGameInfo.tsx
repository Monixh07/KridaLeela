import React from 'react';
import { ChausarState } from '../../utils/chausarLogic';

interface ChausarGameInfoProps {
  gameState: ChausarState;
}

export const ChausarGameInfo: React.FC<ChausarGameInfoProps> = ({ gameState }) => {
  const p1 = gameState.players[0];
  const p2 = gameState.players[1];

  const p1HomeCount = p1.pieces.filter((p) => p.stepsTaken === 36).length;
  const p2HomeCount = p2.pieces.filter((p) => p.stepsTaken === 36).length;

  const currentP = gameState.players[gameState.currentPlayerId];

  return (
    <div className="w-full bg-[#FAF7F2] dark:bg-[#1E1916] rounded-xl border border-[#E6DCD1] dark:border-[#38302A] p-3 shadow-xs">
      <div className="grid grid-cols-2 gap-3 divide-x divide-[#E6DCD1] dark:divide-[#38302A]">
        {/* Player 1 summary */}
        <div
          className={`px-2 flex flex-col justify-between transition-colors ${
            gameState.currentPlayerId === 0
              ? 'font-semibold text-[#B43B22] dark:text-[#E46B52]'
              : 'text-[#746659] dark:text-[#A09589]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider">
              {p1.name} {gameState.currentPlayerId === 0 && '· Turn'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5" title={`${p1HomeCount} of 4 pieces home`}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <span
                key={`p1-pip-${idx}`}
                className={`w-3 h-3 rounded-full border transition-all ${
                  idx < p1HomeCount
                    ? 'bg-[#B43B22] border-[#8A2510]'
                    : 'bg-transparent border-[#B43B22]/40'
                }`}
              />
            ))}
            <span className="text-[11px] ml-1 text-[#746659] dark:text-[#A09589] tabular-nums">
              {p1HomeCount}/4
            </span>
          </div>
        </div>

        {/* Player 2 summary */}
        <div
          className={`pl-4 pr-2 flex flex-col justify-between transition-colors ${
            gameState.currentPlayerId === 1
              ? 'font-semibold text-[#1E4D3E] dark:text-[#52B496]'
              : 'text-[#746659] dark:text-[#A09589]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider">
              {p2.name} {gameState.currentPlayerId === 1 && '· Turn'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5" title={`${p2HomeCount} of 4 pieces home`}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <span
                key={`p2-pip-${idx}`}
                className={`w-3 h-3 rounded-full border transition-all ${
                  idx < p2HomeCount
                    ? 'bg-[#1E4D3E] border-[#13352A]'
                    : 'bg-transparent border-[#1E4D3E]/40'
                }`}
              />
            ))}
            <span className="text-[11px] ml-1 text-[#746659] dark:text-[#A09589] tabular-nums">
              {p2HomeCount}/4
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
