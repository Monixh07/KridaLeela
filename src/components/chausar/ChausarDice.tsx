import React, { useState } from 'react';
import { Button } from '../Button';
import { Dices } from 'lucide-react';
import { sound } from '../../utils/audio';

export interface Die {
  id: number;
  value: number;
  used: boolean;
}

interface ChausarDiceProps {
  dice: Die[];
  phase: 'rolling' | 'moving' | 'turn_ended' | 'game_over';
  onRoll: () => void;
  canRoll: boolean;
  disabled?: boolean;
}

export const ChausarDice: React.FC<ChausarDiceProps> = ({
  dice,
  phase,
  onRoll,
  canRoll,
  disabled = false,
}) => {
  const [isRolling, setIsRolling] = useState(false);

  const handleRollClick = () => {
    if (!canRoll || isRolling || disabled) return;
    setIsRolling(true);
    sound.playDiceRoll();

    // 400ms roll animation
    setTimeout(() => {
      onRoll();
      setIsRolling(false);
    }, 420);
  };

  const renderDieFace = (val: number, used: boolean) => {
    return (
      <div
        className={`w-9 sm:w-11 h-13 sm:h-15 rounded-lg flex flex-col items-center justify-between py-1.5 px-1 border transition-all duration-150 select-none ${
          used
            ? 'opacity-35 bg-[#E6DDD3] dark:bg-[#2B231D] border-dashed border-[#B8AA9B] dark:border-[#4A3D34]'
            : 'bg-gradient-to-b from-[#FFFDF9] via-[#FAF4E8] to-[#EFE2CE] dark:from-[#352D26] dark:via-[#2E2620] dark:to-[#221B16] border-[#D0BFAC] dark:border-[#4F4136] shadow-xs'
        } ${isRolling ? 'rotate-6 scale-95' : ''}`}
      >
        <span className="text-[8px] font-mono tracking-wider text-[#8A7969] dark:text-[#A09080] uppercase">
          PASA
        </span>

        <span
          className={`font-display text-xl sm:text-2xl font-bold tabular-nums leading-none ${
            used
              ? 'line-through text-[#8A7969] dark:text-[#7A6C5F]'
              : 'text-[#B43B22] dark:text-[#E26045]'
          }`}
        >
          {val}
        </span>

        <span
          className={`text-[8px] uppercase tracking-wider font-semibold leading-none ${
            used ? 'text-[#8A7969]' : 'text-emerald-700 dark:text-emerald-400'
          }`}
        >
          {used ? 'Used' : 'Ready'}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {/* 3 Long dice */}
      <div className="flex items-center gap-2 p-1.5 bg-[#F5EFEB] dark:bg-[#1E1915] rounded-xl border border-[#E6DCD1] dark:border-[#38302A]">
        {dice.map((d, index) => (
          <div key={`pasa-die-${d.id}`} className="relative">
            {renderDieFace(d.value, d.used)}
            <span className="sr-only">
              Die {index + 1}: value {d.value}, {d.used ? 'used' : 'available'}
            </span>
          </div>
        ))}
      </div>

      {/* Roll Action Button */}
      {phase === 'rolling' && (
        <Button
          onClick={handleRollClick}
          disabled={!canRoll || isRolling || disabled}
          size="sm"
          className="shadow-xs min-h-[42px] px-4 font-semibold"
        >
          <Dices className={`w-4 h-4 mr-1.5 ${isRolling ? 'animate-spin' : ''}`} />
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </Button>
      )}
    </div>
  );
};
