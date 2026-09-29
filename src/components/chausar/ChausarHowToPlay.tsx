import React from 'react';

export const ChausarHowToPlay: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Throw the six cowrie shells',
      desc: 'Each turn, throw the six cowrie shells. Open mouth counts as 1. A throw of 6 or 12 grants an extra throw.',
    },
    {
      num: '2',
      title: 'Select a highlighted pawn',
      desc: 'Tap any valid pawn on the board or in your base to see its destination.',
    },
    {
      num: '3',
      title: 'Form & Move Juda Pairs',
      desc: 'When two of your pawns occupy the same block, they form a Juda. Juda pairs move together on even numbers (2, 4, 6, 12) and cannot be captured by single pawns.',
    },
    {
      num: '4',
      title: 'Capture opposing pawns',
      desc: 'Landing exactly on an opponent’s single pawn captures it back to Charkoni. Captures do not grant extra throws.',
    },
    {
      num: '5',
      title: 'Navigate Anti-Clockwise',
      desc: 'Pawns move anti-clockwise along the edge lanes of the cross board towards your home arm.',
    },
    {
      num: '6',
      title: 'Enter Charkoni (Home)',
      desc: 'Bring all four pawns into the central Charkoni by exact throw to win the match.',
    },
  ];

  return (
    <div className="space-y-4 text-[#28211A] dark:text-[#F0EAE1]">
      <div className="grid gap-3">
        {steps.map((s) => (
          <div
            key={s.num}
            className="flex items-start gap-3 p-3 rounded-xl bg-[#F5EFEB] dark:bg-[#201B17] border border-[#E6DCD1] dark:border-[#38302A]"
          >
            <span className="w-6 h-6 rounded-full bg-[#B43B22] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {s.num}
            </span>
            <div>
              <h4 className="text-sm font-semibold">{s.title}</h4>
              <p className="text-xs text-[#746659] dark:text-[#B3A596] mt-0.5 leading-relaxed">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-[#FAF0E6] dark:bg-[#281D17] border border-[#EBD0BD] dark:border-[#4B3023] text-xs text-[#7A4E2B] dark:text-[#D99A6E]">
        <p className="font-medium">Cultural Note</p>
        <p className="mt-0.5 leading-relaxed">
          Chausar has regional variations across India. KRIDALEELA uses this simplified rule set for smooth, engaging digital pass-and-play.
        </p>
      </div>
    </div>
  );
};
