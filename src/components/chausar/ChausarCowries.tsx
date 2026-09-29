import React, { useState } from 'react';
import { CowrieShell } from '../../utils/chausarLogic';
import { Button } from '../Button';
import { sound } from '../../utils/audio';

interface ChausarCowriesProps {
  cowries: CowrieShell[];
  score: number | null;
  isExtraThrow: boolean;
  canThrow: boolean;
  disabled?: boolean;
  onThrow: () => void;
}

export const ChausarCowries: React.FC<ChausarCowriesProps> = ({
  cowries,
  score,
  isExtraThrow,
  canThrow,
  disabled = false,
  onThrow,
}) => {
  const [isThrowing, setIsThrowing] = useState(false);

  const handleThrowClick = () => {
    if (!canThrow || isThrowing || disabled) return;
    setIsThrowing(true);
    sound.playDiceRoll();

    setTimeout(() => {
      onThrow();
      setIsThrowing(false);
    }, 500);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {/* Cowries Shell Tray */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-[#F5EFEB] dark:bg-[#1E1915] rounded-xl border border-[#E6DCD1] dark:border-[#38302A] min-h-[56px]">
        {cowries.map((shell, index) => (
          <div
            key={`cowrie-shell-${shell.id}`}
            title={shell.isOpen ? 'Mouth open (1 pt)' : 'Back closed (0 pt)'}
            className={`w-6 sm:w-8 h-8 sm:h-10 rounded-full flex items-center justify-center border transition-all duration-200 select-none shadow-xs ${
              shell.isOpen
                ? 'bg-gradient-to-b from-[#FFFDF9] via-[#FAF3E6] to-[#EAE0CE] border-[#C9B9A6] text-[#7A5B35]'
                : 'bg-gradient-to-b from-[#EFEAE2] to-[#DFD6C8] border-[#BDB09E] opacity-75'
            } ${isThrowing ? 'rotate-12 scale-90' : ''}`}
          >
            {shell.isOpen ? (
              // Open Cowrie Mouth (aperture with central ridge)
              <div className="w-1.5 sm:w-2 h-5 sm:h-6 rounded-full bg-[#3D2C1E] flex items-center justify-center p-[1px]">
                <div className="w-0.5 h-full bg-[#FAF3E6]/60 rounded-full" />
              </div>
            ) : (
              // Closed Back (smooth porcelain hump)
              <div className="w-2.5 sm:w-3.5 h-4 sm:h-5 rounded-full bg-gradient-to-b from-[#FAF7F2] to-[#C8BEAF] opacity-80" />
            )}
            <span className="sr-only">
              Shell {index + 1}: {shell.isOpen ? 'Open (1)' : 'Closed (0)'}
            </span>
          </div>
        ))}

        {/* Score Readout Badge */}
        {score !== null && !isThrowing && (
          <div className="ml-2 pl-2 border-l border-[#D5C7B7] dark:border-[#3E3228] flex flex-col items-start leading-tight">
            <span className="text-[9px] uppercase tracking-wider text-[#746659] dark:text-[#A09080] font-semibold">
              Score
            </span>
            <span className="font-display text-xl sm:text-2xl font-bold text-[#B43B22] dark:text-[#E46B52] tabular-nums">
              {score}
            </span>
          </div>
        )}
      </div>

      {/* Throw Control & Doublet indicator */}
      <div className="flex items-center gap-2">
        {canThrow && (
          <Button
            onClick={handleThrowClick}
            disabled={!canThrow || isThrowing || disabled}
            size="sm"
            className="px-4 py-1.5 min-h-[38px] font-semibold shadow-xs text-xs"
          >
            {isThrowing ? 'Throwing Cowries...' : 'Throw Cowries'}
          </Button>
        )}

        {isExtraThrow && !isThrowing && (
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/60 animate-pulse">
            {score === 6 ? '6 — Extra Throw' : '12 — Extra Throw'}
          </span>
        )}
      </div>
    </div>
  );
};
