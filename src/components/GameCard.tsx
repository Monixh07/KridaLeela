import React from 'react';
import { Button } from './Button';
import { Users, Timer, Sparkles } from 'lucide-react';

interface GameCardProps {
  title: string;
  category: string;
  players: string;
  mode: string;
  duration?: string;
  description: string;
  image?: string;
  available: boolean;
  featured?: boolean;
  onPlay: () => void;
  onHowToPlay?: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  title,
  category,
  players,
  mode,
  duration = '10–15 min',
  description,
  image,
  available,
  featured = false,
  onPlay,
  onHowToPlay,
}) => {
  return (
    <div
      className={`rounded-2xl border border-[#E6DCD1] dark:border-[#38302A] bg-[#FFFFFF] dark:bg-[#201B17] overflow-hidden transition-all duration-200 hover:shadow-md ${
        featured ? 'md:grid md:grid-cols-12 md:gap-6' : ''
      }`}
    >
      {/* Visual illustration slot */}
      <div className={`relative ${featured ? 'md:col-span-5 h-56 md:h-auto' : 'h-48'} overflow-hidden bg-[#F2ECE3] dark:bg-[#2A241F]`}>
        {image ? (
          <img
            src={image}
            alt={`${title} Board Game`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-radial from-[#F5EFEB] to-[#EAE0D4] dark:from-[#26201B] dark:to-[#181513]">
            <div className="w-16 h-16 rounded-xl bg-[#FAF7F2] dark:bg-[#302620] border border-[#E0D4C5] dark:border-[#42372E] flex items-center justify-center text-[#B43B22] mb-3">
              <Sparkles className="w-8 h-8" />
            </div>
            <span className="font-display text-xl text-[#28211A] dark:text-[#F0EAE1]">
              {title}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-5 sm:p-6 flex flex-col justify-between ${featured ? 'md:col-span-7' : ''}`}>
        <div>
          {/* Metadata line with typographic separators (Zero-Pill discipline) */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#746659] dark:text-[#B3A596] mb-2 font-medium">
            <span>{category}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 inline" /> {players} Players
            </span>
            <span aria-hidden="true">·</span>
            <span>{mode}</span>
            {duration && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5 inline" /> {duration}
                </span>
              </>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#28211A] dark:text-[#F0EAE1]">
            {title}
          </h3>

          <p className="mt-2 text-sm text-[#746659] dark:text-[#B3A596] leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action buttons */}
        <div className="mt-6 pt-4 border-t border-[#F0E8DD] dark:border-[#2F2722] flex flex-wrap items-center gap-3">
          {available ? (
            <>
              <Button onClick={onPlay} variant="primary">
                Play {title}
              </Button>
              {onHowToPlay && (
                <Button onClick={onHowToPlay} variant="secondary">
                  How to Play
                </Button>
              )}
            </>
          ) : (
            <Button disabled variant="secondary">
              Coming Soon
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
