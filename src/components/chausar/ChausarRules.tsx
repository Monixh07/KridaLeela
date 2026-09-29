import React from 'react';

export const ChausarRules: React.FC = () => {
  const rules = [
    {
      heading: 'Objective',
      body: 'Navigate all 4 of your pawns anti-clockwise around the edge lanes of the cross board and bring them safely into the central Charkoni (home).',
    },
    {
      heading: 'Cowrie Shells',
      body: 'Six cowrie shells are thrown. Open mouth counts as 1 point; closed back counts as 0 points. Scores: 1 to 5 points. A roll of 6 is 6 + Extra Throw. A roll of 0 (all closed) is 12 + Extra Throw.',
    },
    {
      heading: 'Movement',
      body: 'Pawns travel anti-clockwise along the outer perimeter edge lanes. A player moves any one valid pawn by the number rolled. No pawn may overshoot the central Charkoni.',
    },
    {
      heading: 'The Juda Pair',
      body: 'When two of your pawns land on the same block, they form a Juda pair. A Juda pair moves together only on even numbers (2, 4, 6, 12). Moving a pawn individually breaks the Juda.',
    },
    {
      heading: 'Capturing',
      body: 'If your pawn lands on an opponent’s single pawn on a non-safe square, the opponent’s pawn is captured and sent back to Charkoni/base. Single pawns cannot capture Juda pairs; only a Juda can capture another Juda. Capture does NOT grant an extra throw.',
    },
    {
      heading: 'Safe Squares (Cheere)',
      body: 'A player’s home stretch and starting squares marked with floral motifs are safe from captures.',
    },
    {
      heading: 'Winning',
      body: 'Pawns enter their home stretch and must land on Charkoni by exact throw. The first player to bring all 4 pawns home wins.',
    },
  ];

  return (
    <div className="space-y-4 text-[#28211A] dark:text-[#F0EAE1]">
      <div className="space-y-3">
        {rules.map((r) => (
          <div
            key={r.heading}
            className="pb-3 border-b border-[#E6DCD1] dark:border-[#38302A] last:border-none last:pb-0"
          >
            <h4 className="text-sm font-semibold text-[#B43B22] dark:text-[#E46B52]">
              {r.heading}
            </h4>
            <p className="text-xs text-[#746659] dark:text-[#B3A596] mt-1 leading-relaxed">
              {r.body}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-2 text-[11px] text-[#746659] dark:text-[#A09589] border-t border-[#E6DCD1] dark:border-[#38302A]">
        Chausar has been played in different forms across India, and rules vary by region. KRIDALEELA presents a simplified digital ruleset inspired by documented Chausar traditions.
      </div>
    </div>
  );
};

