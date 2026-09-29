/**
 * Chenne Mane Game Logic
 *
 * Traditional Mancala game from Karnataka / Tulu Nadu (also known as Ali Guli Mane / Pallanguzhi)
 *
 * Board Configuration:
 * - 2 rows of 7 pits = 14 pits total
 * - Player 1 controls pits 0..6 (South / Near row, left-to-right)
 * - Player 2 controls pits 7..13 (North / Far row, right-to-left)
 * - 4 seeds per pit at start = 56 seeds total
 * - 2 Storage Banks (Mane / Pera) for captured seeds
 *
 * Sowing & Relay (Saada) Mechanics:
 * - Current player selects any pit on their side containing 1 or more seeds.
 * - Seeds are picked up and sown one-by-one anti-clockwise:
 *     0 -> 1 -> 2 -> ... -> 6 -> 7 -> 8 -> ... -> 13 -> 0
 * - Continuous Relay: If the last seed drops into an occupied pit,
 *   the player scoops up all seeds in that pit and continues sowing.
 * - Capture (Saada): When the last seed drops into an EMPTY pit:
 *   - Sowing stops.
 *   - The player captures all seeds from the NEXT pit ((lastPit + 1) % 14)
 *     AND the opposite pit of that next pit!
 *   - If the next pit is empty, no seeds are captured.
 *   - Turn ends, passing to the other player.
 *
 * Game End:
 * - When all pits are empty or the current player has no seeds to play.
 * - Winner is the player with the highest number of banked seeds (> 28 seeds).
 */

export interface ChennePlayer {
  id: 0 | 1;
  name: string;
  sideName: string;
  colorHex: string;
  bank: number;
  pits: number[]; // Pit indices owned by this player
}

export interface ChenneState {
  pits: number[]; // Array of 14 pit counts (0..6 = Player 1, 7..13 = Player 2)
  player1: ChennePlayer;
  player2: ChennePlayer;
  currentPlayerId: 0 | 1;
  phase: 'setup' | 'playing' | 'animating' | 'game_over';
  turnCount: number;
  lastAction: string | null;
  winner: ChennePlayer | null;
  isTie: boolean;
}

export const TOTAL_PITS = 14;
export const SEEDS_PER_PIT = 4;
export const TOTAL_SEEDS = TOTAL_PITS * SEEDS_PER_PIT; // 56 seeds

export const P1_PITS = [0, 1, 2, 3, 4, 5, 6];
export const P2_PITS = [7, 8, 9, 10, 11, 12, 13];

/**
 * Returns the opposite pit index on the board:
 * 0 <-> 13
 * 1 <-> 12
 * 2 <-> 11
 * 3 <-> 10
 * 4 <-> 9
 * 5 <-> 8
 * 6 <-> 7
 */
export function getOppositePit(pitIndex: number): number {
  return 13 - pitIndex;
}

/**
 * Check if a pit belongs to the given player
 */
export function isPlayerPit(pitIndex: number, playerId: 0 | 1): boolean {
  if (playerId === 0) {
    return pitIndex >= 0 && pitIndex <= 6;
  }
  return pitIndex >= 7 && pitIndex <= 13;
}

/**
 * Creates initial game state
 */
export function createInitialChenneState(
  player1Name = 'Player 1',
  player2Name = 'Player 2'
): ChenneState {
  const p1: ChennePlayer = {
    id: 0,
    name: player1Name.trim() || 'Player 1',
    sideName: 'South Row',
    colorHex: '#B43B22',
    bank: 0,
    pits: [...P1_PITS],
  };

  const p2: ChennePlayer = {
    id: 1,
    name: player2Name.trim() || 'Player 2',
    sideName: 'North Row',
    colorHex: '#1E4D3E',
    bank: 0,
    pits: [...P2_PITS],
  };

  return {
    pits: Array.from({ length: TOTAL_PITS }).map(() => SEEDS_PER_PIT),
    player1: p1,
    player2: p2,
    currentPlayerId: 0,
    phase: 'setup',
    turnCount: 1,
    lastAction: null,
    winner: null,
    isTie: false,
  };
}

/**
 * Checks if a player has any playable pits (seeds > 0 on their side)
 */
export function canPlayerMove(state: ChenneState, playerId: 0 | 1): boolean {
  const pits = playerId === 0 ? P1_PITS : P2_PITS;
  return pits.some((p) => state.pits[p] > 0);
}

/**
 * Sowing animation step event
 */
export interface SowingStep {
  type: 'pickup' | 'sow' | 'capture' | 'end';
  pitIndex: number;
  seedsInHand: number;
  pitsSnapshot: number[];
  capturedSeeds?: number;
  message?: string;
}

/**
 * Computes the complete move simulation and animation steps for picking a pit.
 */
export function simulateMove(
  state: ChenneState,
  startPit: number
): {
  steps: SowingStep[];
  nextState: ChenneState;
  capturedSeedsTotal: number;
} {
  const currentP = state.currentPlayerId === 0 ? state.player1 : state.player2;
  const opponentP = state.currentPlayerId === 0 ? state.player2 : state.player1;

  const pits = [...state.pits];
  const steps: SowingStep[] = [];
  let p1Bank = state.player1.bank;
  let p2Bank = state.player2.bank;
  let capturedTotal = 0;

  let currentPit = startPit;
  let inHand = pits[currentPit];
  pits[currentPit] = 0;

  steps.push({
    type: 'pickup',
    pitIndex: currentPit,
    seedsInHand: inHand,
    pitsSnapshot: [...pits],
    message: `${currentP.name} picked ${inHand} seeds from Pit ${currentPit + 1}`,
  });

  // Continuous relay loop
  while (inHand > 0) {
    // Sow 1 seed into next pit anti-clockwise
    currentPit = (currentPit + 1) % TOTAL_PITS;
    pits[currentPit] += 1;
    inHand -= 1;

    steps.push({
      type: 'sow',
      pitIndex: currentPit,
      seedsInHand: inHand,
      pitsSnapshot: [...pits],
    });

    // If hands became empty, check where last seed landed
    if (inHand === 0) {
      if (pits[currentPit] > 1) {
        // Landed in an occupied pit -> RELAY! Pick up all seeds and continue
        inHand = pits[currentPit];
        pits[currentPit] = 0;

        steps.push({
          type: 'pickup',
          pitIndex: currentPit,
          seedsInHand: inHand,
          pitsSnapshot: [...pits],
          message: `Landed in occupied pit. Relaying with ${inHand} seeds!`,
        });
      } else {
        // Landed in an EMPTY pit (now contains exactly 1) -> SAADA / CAPTURE!
        const nextPit = (currentPit + 1) % TOTAL_PITS;
        const oppositeOfNext = getOppositePit(nextPit);

        let capturedThisTurn = 0;

        // Capture from next pit
        if (pits[nextPit] > 0) {
          capturedThisTurn += pits[nextPit];
          pits[nextPit] = 0;
        }

        // Capture from opposite of next pit
        if (pits[oppositeOfNext] > 0) {
          capturedThisTurn += pits[oppositeOfNext];
          pits[oppositeOfNext] = 0;
        }

        if (capturedThisTurn > 0) {
          capturedTotal += capturedThisTurn;
          if (state.currentPlayerId === 0) {
            p1Bank += capturedThisTurn;
          } else {
            p2Bank += capturedThisTurn;
          }

          steps.push({
            type: 'capture',
            pitIndex: nextPit,
            seedsInHand: 0,
            pitsSnapshot: [...pits],
            capturedSeeds: capturedThisTurn,
            message: `Empty pit landed! Captured ${capturedThisTurn} seeds!`,
          });
        } else {
          steps.push({
            type: 'end',
            pitIndex: currentPit,
            seedsInHand: 0,
            pitsSnapshot: [...pits],
            message: `Landed in empty pit. Turn ended.`,
          });
        }
        break; // Turn ended
      }
    }
  }

  // Update players
  const updatedP1: ChennePlayer = { ...state.player1, bank: p1Bank };
  const updatedP2: ChennePlayer = { ...state.player2, bank: p2Bank };

  // Check Game Over conditions:
  // 1. All pits on board empty
  const totalRemainingSeeds = pits.reduce((sum, n) => sum + n, 0);

  const nextPlayerId: 0 | 1 = state.currentPlayerId === 0 ? 1 : 0;
  const tempState: ChenneState = {
    ...state,
    pits,
    player1: updatedP1,
    player2: updatedP2,
    currentPlayerId: nextPlayerId,
  };

  const nextCanMove = canPlayerMove(tempState, nextPlayerId);
  const currentCanMove = canPlayerMove(tempState, state.currentPlayerId);

  let isGameOver = false;
  let winner: ChennePlayer | null = null;
  let isTie = false;
  let finalP1Bank = p1Bank;
  let finalP2Bank = p2Bank;

  if (totalRemainingSeeds === 0 || (!nextCanMove && !currentCanMove)) {
    isGameOver = true;
    // Collect any remaining seeds on respective sides
    for (const p of P1_PITS) {
      finalP1Bank += pits[p];
      pits[p] = 0;
    }
    for (const p of P2_PITS) {
      finalP2Bank += pits[p];
      pits[p] = 0;
    }

    updatedP1.bank = finalP1Bank;
    updatedP2.bank = finalP2Bank;

    if (finalP1Bank > finalP2Bank) {
      winner = updatedP1;
    } else if (finalP2Bank > finalP1Bank) {
      winner = updatedP2;
    } else {
      isTie = true;
    }
  } else if (!nextCanMove && currentCanMove) {
    // Next player has no seeds, so turn stays with current player!
    tempState.currentPlayerId = state.currentPlayerId;
  }

  const nextState: ChenneState = {
    ...tempState,
    pits,
    player1: updatedP1,
    player2: updatedP2,
    currentPlayerId: isGameOver
      ? state.currentPlayerId
      : !nextCanMove
      ? state.currentPlayerId
      : nextPlayerId,
    phase: isGameOver ? 'game_over' : 'playing',
    turnCount:
      state.currentPlayerId === 1 ? state.turnCount + 1 : state.turnCount,
    lastAction:
      capturedTotal > 0
        ? `${currentP.name} captured ${capturedTotal} seeds!`
        : `${currentP.name} sowed seeds.`,
    winner,
    isTie,
  };

  return { steps, nextState, capturedSeedsTotal: capturedTotal };
}
