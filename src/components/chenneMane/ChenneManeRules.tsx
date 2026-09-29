import React from 'react';

export const ChenneManeRules: React.FC = () => {
  const rules = [
    {
      num: '1',
      heading: '14 Pits Total (7 Per Player)',
      body: 'The traditional board has two parallel rows of 7 pits each (14 pits total). Player 1 owns the South row (Pits 1–7) and Player 2 owns the North row (Pits 8–14). You may only initiate a move by picking seeds from your own row.',
    },
    {
      num: '2',
      heading: '4 Seeds Per Pit to Start (56 Total)',
      body: 'Every pit begins with exactly 4 seeds (Manjadikuru or tamarind seeds), totaling 56 seeds on the board. All captured seeds are placed into the player’s personal bank.',
    },
    {
      num: '3',
      heading: 'Anti-Clockwise Sowing Circuit',
      body: 'On your turn, pick up all seeds from one of your pits and sow them one-by-one anti-clockwise: moving East (left-to-right) across the South row, turning North, and moving West (right-to-left) across the North row.',
    },
    {
      num: '4',
      heading: 'Relay & Empty Pit Capture (Saada)',
      body: 'If your last seed lands in a pit containing seeds, scoop them all up and continue relay sowing. If your last seed lands in an EMPTY pit, sowing stops immediately! You capture all seeds from the very NEXT pit, PLUS all seeds from the OPPOSITE pit across the board.',
    },
    {
      num: '5',
      heading: 'Winning Condition: Most Seeds Captured',
      body: 'The game ends when all seeds are harvested or no legal moves remain. The player with the highest seed count in their bank (more than 28 seeds) wins the harvest match.',
    },
  ];

  return (
    <div className="space-y-3.5 text-xs sm:text-sm text-[#28211A] dark:text-[#F0EAE1]">
      <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-xs text-[#28211A] dark:text-[#F0EAE1] leading-relaxed">
        <span className="font-bold text-amber-700 dark:text-amber-300">
          Cultural Heritage:
        </span>{' '}
        Chenne Mane (ಚೆನ್ನೆ ಮಣೆ) is an ancient strategy game of Coastal Karnataka,
        Tulu Nadu, and Kodagu. Known as <em>Ali Guli Mane</em> in inland Karnataka
        and <em>Pallanguzhi</em> in Tamil Nadu.
      </div>

      <div className="space-y-2.5">
        {rules.map((r) => (
          <div
            key={`rule-${r.num}`}
            className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1916] border border-[#E6DCD1] dark:border-[#38302A]"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-md bg-[#8C2915] text-white flex items-center justify-center font-bold text-[10px]">
                {r.num}
              </span>
              <h4 className="font-semibold text-xs sm:text-sm text-[#28211A] dark:text-[#F0EAE1]">
                {r.heading}
              </h4>
            </div>
            <p className="text-xs text-[#746659] dark:text-[#A09589] leading-relaxed pl-7">
              {r.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
