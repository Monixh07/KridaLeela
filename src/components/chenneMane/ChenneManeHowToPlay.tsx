import React from 'react';

export const ChenneManeHowToPlay: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Select a Pit on Your Side',
      desc: 'Player 1 controls the South row (Pits 1–7) and Player 2 controls the North row (Pits 8–14). On your turn, tap any pit in your row that contains seeds.',
    },
    {
      num: '2',
      title: 'Review Selection & Press [SOW SEEDS]',
      desc: 'The game will highlight your chosen pit and show how many seeds will be scooped. Tap the glowing "SOW SEEDS" button to begin.',
    },
    {
      num: '3',
      title: 'Watch Anti-Clockwise Sowing',
      desc: 'Seeds are dropped one-by-one into consecutive pits anti-clockwise around the oval circuit (East along South row, West along North row).',
    },
    {
      num: '4',
      title: 'Relay When Landing on Seeds',
      desc: 'If your last seed lands in a pit that already holds seeds, you automatically scoop up that pit’s seeds and continue relay sowing uninterrupted!',
    },
    {
      num: '5',
      title: 'Capture When Landing in an Empty Pit',
      desc: 'When your last seed drops into an empty pit, sowing concludes. You harvest and bank all seeds in the NEXT pit plus its opposite pit!',
    },
    {
      num: '6',
      title: 'Win with 29+ Seeds',
      desc: 'Play continues until no legal moves remain. Whoever captures 29 or more of the 56 total seeds wins the harvest!',
    },
  ];

  return (
    <div className="space-y-3.5 text-xs sm:text-sm text-[#28211A] dark:text-[#F0EAE1]">
      <p className="text-xs text-[#746659] dark:text-[#A09589] leading-relaxed">
        Chenne Mane is played with 56 natural crimson Manjadikuru seeds across 14 carved pits. Follow these simple steps to play:
      </p>

      <div className="space-y-2.5">
        {steps.map((s) => (
          <div
            key={`step-${s.num}`}
            className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1916] border border-[#E6DCD1] dark:border-[#38302A]"
          >
            <span className="flex-shrink-0 w-5 h-5 rounded-md bg-[#8C2915] text-white flex items-center justify-center font-bold text-[10px]">
              {s.num}
            </span>
            <div>
              <h4 className="font-semibold text-xs sm:text-sm text-[#28211A] dark:text-[#F0EAE1]">
                {s.title}
              </h4>
              <p className="text-xs text-[#746659] dark:text-[#A09589] mt-0.5 leading-relaxed">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
