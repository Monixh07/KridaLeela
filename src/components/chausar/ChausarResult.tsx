import React, { useEffect } from 'react';
import { Player } from '../../utils/chausarLogic';
import { Button } from '../Button';
import { Trophy } from 'lucide-react';
import { sound } from '../../utils/audio';

interface ChausarResultProps {
  winner: Player;
  onPlayAgain: () => void;
  onBackToGames: () => void;
}

export const ChausarResult: React.FC<ChausarResultProps> = ({
  winner,
  onPlayAgain,
  onBackToGames,
}) => {
  useEffect(() => {
    sound.playVictory();
  }, []);

  const isP1 = winner.id === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-[#FAF7F2] dark:bg-[#1E1916] rounded-2xl border border-[#E6DCD1] dark:border-[#38302A] p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
        <div
          className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
            isP1
              ? 'bg-[#FBECE8] text-[#B43B22] dark:bg-[#3B1E17] dark:text-[#E46B52]'
              : 'bg-[#EBF5F1] text-[#1E4D3E] dark:bg-[#153429] dark:text-[#52B496]'
          }`}
        >
          <Trophy className="w-8 h-8" />
        </div>

        <h3 className="font-display text-2xl font-bold text-[#28211A] dark:text-[#F0EAE1]">
          {winner.name} Wins!
        </h3>

        <p className="mt-1.5 text-xs text-[#746659] dark:text-[#B3A596]">
          All four pieces safely reached Central Home ("Char-Koni").
        </p>

        <div className="mt-4 p-3 rounded-xl bg-[#F5EFEB] dark:bg-[#26201B] border border-[#E6DCD1] dark:border-[#38302A] text-xs text-[#746659] dark:text-[#B3A596]">
          Statistics recorded to your personal profile.
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <Button onClick={onPlayAgain} variant="primary" fullWidth size="lg">
            Play Again
          </Button>
          <Button onClick={onBackToGames} variant="secondary" fullWidth size="md">
            Back to Games
          </Button>
        </div>
      </div>
    </div>
  );
};
