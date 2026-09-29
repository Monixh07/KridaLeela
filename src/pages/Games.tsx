import React, { useState } from 'react';
import { GAMES } from '../data/games';
import { GameCard } from '../components/GameCard';
import { Modal } from '../components/Modal';
import { ChausarHowToPlay } from '../components/chausar/ChausarHowToPlay';
import { ChausarRules } from '../components/chausar/ChausarRules';
import { ChenneManeHowToPlay } from '../components/chenneMane/ChenneManeHowToPlay';
import { ChenneManeRules } from '../components/chenneMane/ChenneManeRules';
import chausarArtImage from '../assets/images/chausar_card_art_1790679757403.jpg';
import chenneArtImage from '../assets/images/chenne_mane_art_1790683571380.jpg';
import { BookOpen, Sparkles, MessageSquarePlus } from 'lucide-react';
import { Button } from '../components/Button';

interface GamesPageProps {
  onStartGame: (gameId: string) => void;
  onRequestGameClick: () => void;
}

export const GamesPage: React.FC<GamesPageProps> = ({
  onStartGame,
  onRequestGameClick,
}) => {
  const [showChausarHowToPlay, setShowChausarHowToPlay] = useState(false);
  const [showChausarRules, setShowChausarRules] = useState(false);
  const [showChenneHowToPlay, setShowChenneHowToPlay] = useState(false);
  const [showChenneRules, setShowChenneRules] = useState(false);

  const chausar = GAMES[0];
  const chenneMane = GAMES[1];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#28211A] dark:text-[#F0EAE1]">
          Games
        </h1>
        <p className="mt-1 text-sm text-[#746659] dark:text-[#B3A596]">
          Play traditional games from India.
        </p>
      </div>

      {/* Featured Game Hero Card */}
      <section>
        <GameCard
          title={chausar.title}
          category={chausar.category}
          players={chausar.players}
          mode={chausar.mode}
          duration={chausar.duration}
          description="An ancient Indian cross-board game of movement, strategy and chance. Roll cowrie shells, navigate your pawns around the cross-shaped board, form Juda pairs, and bring them safely into the central home."
          image={chausarArtImage}
          available={chausar.available}
          featured={true}
          onPlay={() => onStartGame(chausar.id)}
          onHowToPlay={() => setShowChausarHowToPlay(true)}
        />
      </section>

      {/* Available Games Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6DCD1] dark:border-[#38302A] pb-3">
          <h2 className="text-base font-semibold text-[#28211A] dark:text-[#F0EAE1]">
            Available Games
          </h2>
          <span className="text-xs text-[#746659] dark:text-[#B3A596]">
            {GAMES.length} Games Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GameCard
            title={chausar.title}
            category={chausar.category}
            players={chausar.players}
            mode={chausar.mode}
            duration={chausar.duration}
            description={chausar.description}
            image={chausarArtImage}
            available={chausar.available}
            featured={false}
            onPlay={() => onStartGame(chausar.id)}
            onHowToPlay={() => setShowChausarHowToPlay(true)}
          />

          <GameCard
            title={chenneMane.title}
            category={chenneMane.category}
            players={chenneMane.players}
            mode={chenneMane.mode}
            duration={chenneMane.duration}
            description={chenneMane.description}
            image={chenneArtImage}
            available={chenneMane.available}
            featured={false}
            onPlay={() => onStartGame(chenneMane.id)}
            onHowToPlay={() => setShowChenneHowToPlay(true)}
          />
        </div>
      </section>

      {/* Tasteful Empty / Coming-Soon Area */}
      <section className="rounded-2xl border border-dashed border-[#D8CCC0] dark:border-[#38302A] p-6 sm:p-8 bg-[#FAF7F2]/50 dark:bg-[#1C1714]/40 text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-[#F0E8DD] dark:bg-[#2A241F] text-[#B43B22] dark:text-[#E46B52] flex items-center justify-center mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#28211A] dark:text-[#F0EAE1]">
          More games are coming
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-[#746659] dark:text-[#B3A596] max-w-md mx-auto leading-relaxed">
          We are researching and documenting regional board and folk games from across different states of India.
        </p>

        <div className="mt-4 pt-3 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={onRequestGameClick}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <MessageSquarePlus className="w-4 h-4 mr-1.5" />
            Request a Traditional Game
          </Button>
          <Button
            onClick={() => setShowChausarRules(true)}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <BookOpen className="w-4 h-4 mr-1.5" />
            Chausar Rules
          </Button>
          <Button
            onClick={() => setShowChenneRules(true)}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <BookOpen className="w-4 h-4 mr-1.5" />
            Chenne Mane Rules
          </Button>
        </div>
      </section>

      {/* Chausar How to Play Modal */}
      <Modal
        isOpen={showChausarHowToPlay}
        onClose={() => setShowChausarHowToPlay(false)}
        title="How to Play Chausar"
        subtitle="Quick guide to digital pass-and-play"
      >
        <ChausarHowToPlay />
      </Modal>

      {/* Chausar Rules Modal */}
      <Modal
        isOpen={showChausarRules}
        onClose={() => setShowChausarRules(false)}
        title="Chausar Rules"
        subtitle="Traditional ruleset for KRIDALEELA"
      >
        <ChausarRules />
      </Modal>

      {/* Chenne Mane How to Play Modal */}
      <Modal
        isOpen={showChenneHowToPlay}
        onClose={() => setShowChenneHowToPlay(false)}
        title="How to Play Chenne Mane"
        subtitle="Quick guide to pick, relay and capture"
      >
        <ChenneManeHowToPlay />
      </Modal>

      {/* Chenne Mane Rules Modal */}
      <Modal
        isOpen={showChenneRules}
        onClose={() => setShowChenneRules(false)}
        title="Chenne Mane Rules"
        subtitle="Traditional rules of Coastal Karnataka"
      >
        <ChenneManeRules />
      </Modal>
    </div>
  );
};

