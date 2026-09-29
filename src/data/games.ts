export interface GameItem {
  id: string;
  title: string;
  category: string;
  players: string;
  mode: string;
  duration: string;
  origin: string;
  description: string;
  available: boolean;
  image?: string;
}

export const GAMES: GameItem[] = [
  {
    id: 'chausar',
    title: 'Chausar',
    category: 'Traditional Board Game',
    players: '2',
    mode: 'Pass & Play',
    duration: '10–15 min',
    origin: 'Ancient India',
    description: 'An ancient Indian cross-board game of movement, strategy and cowrie throws. Form Juda pairs, navigate the arms anti-clockwise, and race all four pawns home to Charkoni.',
    available: true,
  },
  {
    id: 'chenne-mane',
    title: 'Chenne Mane',
    category: 'Traditional Mancala Game',
    players: '2',
    mode: 'Pass & Play',
    duration: '10–12 min',
    origin: 'Karnataka / Tulu Nadu',
    description: 'A traditional 2×7 pit wooden mancala game. Pick up seeds, sow anti-clockwise in chains, trigger the Saada stop to capture opposite pits, and harvest the most seeds.',
    available: true,
  },
];
