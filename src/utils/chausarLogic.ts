/**
 * Chausar Game Logic
 *
 * Rules:
 * - 2 Players (Player 1: Terracotta, Player 2: Temple Green)
 * - 4 pawns each
 * - Traditional cross-shaped board with 4 arms around central home ("Charkoni")
 * - 6 Cowrie shells:
 *     1 open = 1
 *     2 open = 2
 *     3 open = 3
 *     4 open = 4
 *     5 open = 5
 *     6 open = 6 + extra throw
 *     0 open (all closed) = 12 + extra throw
 * - Anti-clockwise movement around 32 outer edge cells into 3-step home stretch into Charkoni (step 36)
 * - Juda mechanic:
 *     Two pawns of same player on same square form a Juda.
 *     Juda moves together only on even numbers (2, 4, 6, 12).
 *     Moving one pawn separately breaks the Juda.
 *     Single pawn CANNOT capture a Juda.
 *     Only a Juda can capture another Juda.
 * - Capture: Landing on opponent's single pawn returns it to Charkoni.
 *   Capture does NOT give an extra turn.
 * - Safe squares: Home stretch + starting cells (0 and 16).
 * - Exact throw to reach Charkoni (step 36).
 */

export interface Piece {
  id: number;
  playerId: 0 | 1;
  stepsTaken: number; // 0 = Base/Start, 1..32 = track, 33..35 = home stretch, 36 = Charkoni
}

export interface CowrieShell {
  id: number;
  isOpen: boolean; // true = mouth/open (1), false = back/closed (0)
}

export interface CowrieRollResult {
  shells: CowrieShell[];
  openCount: number;
  score: number;
  isExtraThrow: boolean;
}

export interface Player {
  id: 0 | 1;
  name: string;
  colorName: string;
  colorHex: string;
  bgHex: string;
  startTrackIndex: number;
  pieces: Piece[];
}

export type GamePhase = 'setup' | 'rolling' | 'moving' | 'game_over';

export interface MoveOption {
  pieceIds: number[]; // single piece or two pieces for a Juda
  moveAmount: number;
  targetSteps: number;
  isJudaMove: boolean;
  capturesOpponent: boolean;
}

export interface ChausarState {
  currentPlayerId: 0 | 1;
  players: [Player, Player];
  cowries: CowrieShell[];
  currentScore: number | null;
  isExtraThrow: boolean;
  phase: GamePhase;
  selectedPieceId: number | null;
  lastNotice: string | null;
  winner: Player | null;
  turnCount: number;
}

export const TOTAL_STEPS_TO_HOME = 36;
export const OUTER_TRACK_LENGTH = 32;

// Safe track indexes where pieces cannot be captured (Cheere / starting squares)
export const SAFE_TRACK_INDEXES = [0, 16];

/**
 * 32 outer track cells arranged in continuous anti-clockwise perimeter loop on 11x11 grid
 */
export const OUTER_TRACK_COORDS: { [index: number]: [number, number] } = {
  // South arm going up col 4
  0: [10, 4],
  1: [9, 4],
  2: [8, 4],
  3: [7, 4],

  // West arm going left row 6
  4: [6, 3],
  5: [6, 2],
  6: [6, 1],
  7: [6, 0],

  // West arm going right row 4
  8: [4, 0],
  9: [4, 1],
  10: [4, 2],
  11: [4, 3],

  // North arm going up col 4
  12: [3, 4],
  13: [2, 4],
  14: [1, 4],
  15: [0, 4],

  // North arm going down col 6
  16: [0, 6],
  17: [1, 6],
  18: [2, 6],
  19: [3, 6],

  // East arm going right row 4
  20: [4, 7],
  21: [4, 8],
  22: [4, 9],
  23: [4, 10],

  // East arm going left row 6
  24: [6, 10],
  25: [6, 9],
  26: [6, 8],
  27: [6, 7],

  // South arm going down col 6
  28: [7, 6],
  29: [8, 6],
  30: [9, 6],
  31: [10, 6],
};

// Home stretches (Col 5 for South and North)
export const SOUTH_HOME_STRETCH: { [step: number]: [number, number] } = {
  1: [10, 5],
  2: [9, 5],
  3: [8, 5],
};

export const NORTH_HOME_STRETCH: { [step: number]: [number, number] } = {
  1: [0, 5],
  2: [1, 5],
  3: [2, 5],
};

export const CENTER_HOME_COORD: [number, number] = [5, 5];

/**
 * Maps player and stepsTaken to [row, col] on board.
 */
export function getCellForStep(playerId: 0 | 1, stepsTaken: number): [number, number] | null {
  if (stepsTaken <= 0) return null;
  if (stepsTaken <= OUTER_TRACK_LENGTH) {
    const startTrack = playerId === 0 ? 0 : 16;
    const trackIndex = (startTrack + stepsTaken - 1) % OUTER_TRACK_LENGTH;
    return OUTER_TRACK_COORDS[trackIndex];
  }
  if (stepsTaken < TOTAL_STEPS_TO_HOME) {
    const stretchStep = stepsTaken - OUTER_TRACK_LENGTH;
    return playerId === 0 ? SOUTH_HOME_STRETCH[stretchStep] : NORTH_HOME_STRETCH[stretchStep];
  }
  return CENTER_HOME_COORD;
}

/**
 * Throw 6 cowrie shells and calculate score:
 * 1..5 mouths up = 1..5
 * 6 mouths up = 6 + extra throw
 * 0 mouths up = 12 + extra throw
 */
export function throwCowries(): CowrieRollResult {
  const shells: CowrieShell[] = Array.from({ length: 6 }).map((_, id) => ({
    id,
    isOpen: Math.random() < 0.5,
  }));

  const openCount = shells.filter((s) => s.isOpen).length;

  let score = openCount;
  let isExtraThrow = false;

  if (openCount === 0) {
    score = 12;
    isExtraThrow = true;
  } else if (openCount === 6) {
    score = 6;
    isExtraThrow = true;
  }

  return { shells, openCount, score, isExtraThrow };
}

/**
 * Detects if a piece is part of a Juda (two pieces of same player at same step, steps > 0 and < 36)
 */
export function getJudaPartner(piece: Piece, player: Player): Piece | null {
  if (piece.stepsTaken <= 0 || piece.stepsTaken >= TOTAL_STEPS_TO_HOME) return null;
  const partner = player.pieces.find(
    (p) => p.id !== piece.id && p.stepsTaken === piece.stepsTaken
  );
  return partner || null;
}

/**
 * Checks if a destination track index is safe
 */
export function isSafeCell(trackIndex: number): boolean {
  return SAFE_TRACK_INDEXES.includes(trackIndex);
}

/**
 * Generates valid move options for a selected piece given current score.
 * Handles single moves and Juda pair moves (if score is even).
 */
export function getValidMovesForPiece(
  piece: Piece,
  player: Player,
  opponent: Player,
  score: number | null
): MoveOption[] {
  if (score === null || piece.stepsTaken >= TOTAL_STEPS_TO_HOME) return [];

  const targetSteps = piece.stepsTaken + score;
  if (targetSteps > TOTAL_STEPS_TO_HOME) return []; // no overshoot

  const options: MoveOption[] = [];
  const judaPartner = getJudaPartner(piece, player);

  // Check capture condition for single move
  let capturesSingle = false;
  if (targetSteps <= OUTER_TRACK_LENGTH) {
    const destTrack = (player.startTrackIndex + targetSteps - 1) % OUTER_TRACK_LENGTH;
    if (!isSafeCell(destTrack)) {
      // Find opponent pieces at this track
      const oppPiecesAtDest = opponent.pieces.filter((op) => {
        if (op.stepsTaken <= 0 || op.stepsTaken > OUTER_TRACK_LENGTH) return false;
        const oppTrack = (opponent.startTrackIndex + op.stepsTaken - 1) % OUTER_TRACK_LENGTH;
        return oppTrack === destTrack;
      });

      // Single pawn can only capture single opposing pawn (cannot capture a Juda)
      if (oppPiecesAtDest.length === 1) {
        capturesSingle = true;
      }
    }
  }

  // 1. Move this pawn individually (if it was in a Juda, this breaks the Juda)
  options.push({
    pieceIds: [piece.id],
    moveAmount: score,
    targetSteps,
    isJudaMove: false,
    capturesOpponent: capturesSingle,
  });

  // 2. If part of a Juda and score is EVEN (2, 4, 6, 12), can move as a Juda pair
  if (judaPartner && score % 2 === 0) {
    let capturesJuda = false;
    if (targetSteps <= OUTER_TRACK_LENGTH) {
      const destTrack = (player.startTrackIndex + targetSteps - 1) % OUTER_TRACK_LENGTH;
      if (!isSafeCell(destTrack)) {
        const oppPiecesAtDest = opponent.pieces.filter((op) => {
          if (op.stepsTaken <= 0 || op.stepsTaken > OUTER_TRACK_LENGTH) return false;
          const oppTrack = (opponent.startTrackIndex + op.stepsTaken - 1) % OUTER_TRACK_LENGTH;
          return oppTrack === destTrack;
        });

        // A Juda can capture single pawn OR another Juda
        if (oppPiecesAtDest.length > 0) {
          capturesJuda = true;
        }
      }
    }

    options.push({
      pieceIds: [piece.id, judaPartner.id],
      moveAmount: score,
      targetSteps,
      isJudaMove: true,
      capturesOpponent: capturesJuda,
    });
  }

  return options;
}

/**
 * Checks if current player has ANY legal moves with current score
 */
export function hasAnyValidMoves(
  player: Player,
  opponent: Player,
  score: number | null
): boolean {
  if (score === null) return false;
  return player.pieces.some((p) => getValidMovesForPiece(p, player, opponent, score).length > 0);
}

/**
 * Check if a piece can move with current score
 */
export function isPieceMovable(
  piece: Piece,
  player: Player,
  opponent: Player,
  score: number | null,
  phase: GamePhase
): boolean {
  if (phase !== 'moving' || score === null) return false;
  if (piece.playerId !== player.id) return false;
  return getValidMovesForPiece(piece, player, opponent, score).length > 0;
}

/**
 * Apply chosen move to state
 */
export function applyMove(
  state: ChausarState,
  move: MoveOption
): {
  nextState: ChausarState;
  capturedCount: number;
  gameWon: boolean;
} {
  const currentP = state.players[state.currentPlayerId];
  const opponentP = state.players[state.currentPlayerId === 0 ? 1 : 0];

  let capturedCount = 0;
  let notice: string | null = null;

  // Move the moving piece(s)
  const updatedCurrentPieces = currentP.pieces.map((p) => {
    if (move.pieceIds.includes(p.id)) {
      return { ...p, stepsTaken: move.targetSteps };
    }
    return p;
  });

  // Check captures
  let updatedOpponentPieces = opponentP.pieces;
  if (move.targetSteps <= OUTER_TRACK_LENGTH) {
    const destTrack = (currentP.startTrackIndex + move.targetSteps - 1) % OUTER_TRACK_LENGTH;

    if (!isSafeCell(destTrack)) {
      const oppPiecesAtDest = opponentP.pieces.filter((op) => {
        if (op.stepsTaken <= 0 || op.stepsTaken > OUTER_TRACK_LENGTH) return false;
        const oppTrack = (opponentP.startTrackIndex + op.stepsTaken - 1) % OUTER_TRACK_LENGTH;
        return oppTrack === destTrack;
      });

      const isOpponentJuda = oppPiecesAtDest.length >= 2;

      if (isOpponentJuda) {
        // Can only capture opponent Juda if this is a Juda move
        if (move.isJudaMove) {
          capturedCount = oppPiecesAtDest.length;
          notice = `Juda captured! 2 opposing pawns returned to Charkoni.`;
          updatedOpponentPieces = opponentP.pieces.map((op) => {
            if (oppPiecesAtDest.some((p) => p.id === op.id)) {
              return { ...op, stepsTaken: 0 };
            }
            return op;
          });
        }
      } else if (oppPiecesAtDest.length === 1) {
        // Single opponent pawn captured
        capturedCount = 1;
        notice = `Pawn captured! Opponent pawn returned to Charkoni.`;
        updatedOpponentPieces = opponentP.pieces.map((op) => {
          if (op.id === oppPiecesAtDest[0].id) {
            return { ...op, stepsTaken: 0 };
          }
          return op;
        });
      }
    }
  }

  // Check win condition (all 4 pawns at step 36)
  const isWinner = updatedCurrentPieces.every((p) => p.stepsTaken === TOTAL_STEPS_TO_HOME);

  const updatedCurrentPlayer: Player = {
    ...currentP,
    pieces: updatedCurrentPieces,
  };

  const updatedOpponentPlayer: Player = {
    ...opponentP,
    pieces: updatedOpponentPieces,
  };

  const newPlayers: [Player, Player] =
    state.currentPlayerId === 0
      ? [updatedCurrentPlayer, updatedOpponentPlayer]
      : [updatedOpponentPlayer, updatedCurrentPlayer];

  if (isWinner) {
    return {
      nextState: {
        ...state,
        players: newPlayers,
        phase: 'game_over',
        selectedPieceId: null,
        winner: updatedCurrentPlayer,
        lastNotice: `${updatedCurrentPlayer.name} wins! All four pawns reached Charkoni.`,
      },
      capturedCount,
      gameWon: true,
    };
  }

  // Determine turn flow:
  // If this roll was a doublet/grace (6 or 12), the SAME player rolls again!
  // Otherwise, turn switches to next player continuously with NO popup.
  if (state.isExtraThrow) {
    return {
      nextState: {
        ...state,
        players: newPlayers,
        currentScore: null,
        isExtraThrow: false,
        phase: 'rolling',
        selectedPieceId: null,
        lastNotice: notice || `${currentP.name} rolled a doublet — Extra throw!`,
      },
      capturedCount,
      gameWon: false,
    };
  }

  // Switch to next player continuously
  const nextPlayerId = state.currentPlayerId === 0 ? 1 : 0;
  return {
    nextState: {
      ...state,
      players: newPlayers,
      currentPlayerId: nextPlayerId,
      currentScore: null,
      isExtraThrow: false,
      phase: 'rolling',
      selectedPieceId: null,
      lastNotice: notice,
      turnCount: state.currentPlayerId === 1 ? state.turnCount + 1 : state.turnCount,
    },
    capturedCount,
    gameWon: false,
  };
}

/**
 * Creates initial Chausar state with configurable player names
 */
export function createInitialState(player1Name = 'Player 1', player2Name = 'Player 2'): ChausarState {
  const p1Pieces: Piece[] = [0, 1, 2, 3].map((id) => ({
    id,
    playerId: 0,
    stepsTaken: 0,
  }));

  const p2Pieces: Piece[] = [0, 1, 2, 3].map((id) => ({
    id,
    playerId: 1,
    stepsTaken: 0,
  }));

  const player1: Player = {
    id: 0,
    name: player1Name.trim() || 'Player 1',
    colorName: 'Terracotta',
    colorHex: '#B43B22',
    bgHex: '#FBF0ED',
    startTrackIndex: 0,
    pieces: p1Pieces,
  };

  const player2: Player = {
    id: 1,
    name: player2Name.trim() || 'Player 2',
    colorName: 'Temple Green',
    colorHex: '#1E4D3E',
    bgHex: '#ECF4F1',
    startTrackIndex: 16,
    pieces: p2Pieces,
  };

  return {
    currentPlayerId: 0,
    players: [player1, player2],
    cowries: Array.from({ length: 6 }).map((_, id) => ({ id, isOpen: true })),
    currentScore: null,
    isExtraThrow: false,
    phase: 'setup',
    selectedPieceId: null,
    lastNotice: null,
    winner: null,
    turnCount: 1,
  };
}
