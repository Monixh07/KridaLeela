import React from 'react';
import {
  ChausarState,
  getCellForStep,
  getJudaPartner,
  isPieceMovable,
  MoveOption,
  Piece,
} from '../../utils/chausarLogic';
import { ChausarPiece } from './ChausarPiece';

interface AnimatingPieceState {
  pieceId: number;
  playerId: 0 | 1;
  step: number;
}

interface ChausarBoardProps {
  gameState: ChausarState;
  validMovesForSelected: MoveOption[];
  animatingPiece?: AnimatingPieceState | null;
  onSelectPiece: (pieceId: number) => void;
  onApplyMoveOption?: (move: MoveOption) => void;
}

export const ChausarBoard: React.FC<ChausarBoardProps> = ({
  gameState,
  validMovesForSelected,
  animatingPiece = null,
  onSelectPiece,
  onApplyMoveOption,
}) => {
  const currentP = gameState.players[gameState.currentPlayerId];
  const opponentP = gameState.players[gameState.currentPlayerId === 0 ? 1 : 0];

  // Pieces in Base
  const p1BasePieces = gameState.players[0].pieces.filter((p) => {
    if (animatingPiece && animatingPiece.playerId === 0 && animatingPiece.pieceId === p.id) {
      return false; // currently animating on track
    }
    return p.stepsTaken === 0;
  });

  const p2BasePieces = gameState.players[1].pieces.filter((p) => {
    if (animatingPiece && animatingPiece.playerId === 1 && animatingPiece.pieceId === p.id) {
      return false; // currently animating on track
    }
    return p.stepsTaken === 0;
  });

  // Pieces in Central Home (step 36)
  const p1HomePieces = gameState.players[0].pieces.filter((p) => {
    if (animatingPiece && animatingPiece.playerId === 0 && animatingPiece.pieceId === p.id) {
      return animatingPiece.step === 36;
    }
    return p.stepsTaken === 36;
  });

  const p2HomePieces = gameState.players[1].pieces.filter((p) => {
    if (animatingPiece && animatingPiece.playerId === 1 && animatingPiece.pieceId === p.id) {
      return animatingPiece.step === 36;
    }
    return p.stepsTaken === 36;
  });

  // Find pieces occupying an active board cell [row, col]
  const getPiecesAtCell = (row: number, col: number): { piece: Piece; isAnimating: boolean }[] => {
    const list: { piece: Piece; isAnimating: boolean }[] = [];

    // Check currently animating piece
    if (animatingPiece) {
      const animCell = getCellForStep(animatingPiece.playerId, animatingPiece.step);
      if (animCell && animCell[0] === row && animCell[1] === col) {
        const p = gameState.players[animatingPiece.playerId].pieces.find(
          (piece) => piece.id === animatingPiece.pieceId
        );
        if (p) {
          list.push({ piece: p, isAnimating: true });
        }
      }
    }

    // Check all pieces of both players
    gameState.players.forEach((player) => {
      player.pieces.forEach((piece) => {
        // If this piece is currently animating, its visual position is handled above
        if (
          animatingPiece &&
          animatingPiece.playerId === piece.playerId &&
          animatingPiece.pieceId === piece.id
        ) {
          return;
        }

        if (piece.stepsTaken > 0 && piece.stepsTaken < 36) {
          const cell = getCellForStep(piece.playerId, piece.stepsTaken);
          if (cell && cell[0] === row && cell[1] === col) {
            list.push({ piece, isAnimating: false });
          }
        }
      });
    });

    return list;
  };

  // Check if cell is a valid move destination for the selected piece
  const getMoveOptionForCell = (row: number, col: number): MoveOption | null => {
    if (gameState.selectedPieceId === null || animatingPiece) return null;

    for (const opt of validMovesForSelected) {
      const destCell = getCellForStep(currentP.id, opt.targetSteps);
      if (destCell && destCell[0] === row && destCell[1] === col) {
        return opt;
      }
    }
    return null;
  };

  // Check if center home is valid destination
  const moveToCenterOption = validMovesForSelected.find((opt) => opt.targetSteps === 36);
  const canMoveToCenterHome = !animatingPiece && Boolean(moveToCenterOption);

  // Check cell membership in Cross
  const isCellInCrossArm = (r: number, c: number): boolean => {
    if (r >= 4 && r <= 6 && c >= 4 && c <= 6) return true; // Center
    if (r <= 3 && c >= 4 && c <= 6) return true; // North
    if (r >= 7 && c >= 4 && c <= 6) return true; // South
    if (r >= 4 && r <= 6 && c <= 3) return true; // West
    if (r >= 4 && r <= 6 && c >= 7) return true; // East
    return false;
  };

  return (
    <div className="w-full flex justify-center items-center select-none">
      <div className="relative w-full max-w-[min(90vw,360px)] aspect-square p-1.5 sm:p-2 bg-[#2D2118] rounded-2xl shadow-lg border-3 sm:border-4 border-[#4A392A]">
        {/* 11x11 Grid Board */}
        <div className="w-full h-full bg-[#FAF5EE] dark:bg-[#1E1815] rounded-xl overflow-hidden grid grid-cols-11 grid-rows-11 gap-[1px] p-0.5 border border-[#D5C6B6] dark:border-[#3E322A]">
          {Array.from({ length: 11 }).flatMap((_, r) =>
            Array.from({ length: 11 }).map((_, c) => {
              // 1. Center Square 3x3
              if (r >= 4 && r <= 6 && c >= 4 && c <= 6) {
                // (5,5) Central Home (Charkoni)
                if (r === 5 && c === 5) {
                  return (
                    <div
                      key={`charkoni-${r}-${c}`}
                      onClick={() => {
                        if (canMoveToCenterHome && moveToCenterOption && onApplyMoveOption) {
                          onApplyMoveOption(moveToCenterOption);
                        }
                      }}
                      className={`relative flex flex-col items-center justify-center rounded-sm border border-[#C88A2C] transition-all ${
                        canMoveToCenterHome
                          ? 'bg-amber-100 dark:bg-amber-950/70 ring-2 ring-amber-500 cursor-pointer animate-pulse z-20'
                          : 'bg-radial from-[#FFF2D4] to-[#E8D4A8] dark:from-[#3D2E1A] dark:to-[#2A1E11]'
                      }`}
                    >
                      <span className="text-[7px] sm:text-[8px] font-bold text-[#8A5A14] dark:text-[#DFB567] tracking-tight leading-none">
                        CHARKONI
                      </span>
                      <div className="flex flex-wrap items-center justify-center gap-0.5 mt-0.5">
                        {p1HomePieces.map((p) => (
                          <span
                            key={`p1-home-${p.id}`}
                            className="w-2 h-2 rounded-full bg-[#B43B22] border border-white"
                            title="Player 1 Piece Home"
                          />
                        ))}
                        {p2HomePieces.map((p) => (
                          <span
                            key={`p2-home-${p.id}`}
                            className="w-2 h-2 rounded-full bg-[#1E4D3E] border border-white"
                            title="Player 2 Piece Home"
                          />
                        ))}
                      </div>
                    </div>
                  );
                }

                // Inner courtyard corners
                return (
                  <div
                    key={`courtyard-${r}-${c}`}
                    className="bg-[#F8EFE0] dark:bg-[#2C2117] flex items-center justify-center border border-[#DECDBB] dark:border-[#3D3025]"
                  >
                    <span className="text-[7px] text-[#A68F78] opacity-50">✕</span>
                  </div>
                );
              }

              // 2. Cross Arms (Playable Path & Home Stretches)
              if (isCellInCrossArm(r, c)) {
                const piecesHere = getPiecesAtCell(r, c);
                const moveOption = getMoveOptionForCell(r, c);

                const isP1Start = r === 10 && c === 4;
                const isP2Start = r === 0 && c === 6;
                const isSouthHomeStretch = c === 5 && r >= 8;
                const isNorthHomeStretch = c === 5 && r <= 2;

                let cellBg = 'bg-[#FAF6F0] dark:bg-[#221C18]';
                if (isSouthHomeStretch) cellBg = 'bg-[#FBECE8] dark:bg-[#341F1A]';
                if (isNorthHomeStretch) cellBg = 'bg-[#EDF5F2] dark:bg-[#1A2E26]';
                if (isP1Start) cellBg = 'bg-[#FBE4DD] dark:bg-[#43231B]';
                if (isP2Start) cellBg = 'bg-[#E0EFEA] dark:bg-[#18392E]';

                return (
                  <div
                    key={`arm-${r}-${c}`}
                    onClick={() => {
                      if (moveOption && onApplyMoveOption) {
                        onApplyMoveOption(moveOption);
                      }
                    }}
                    className={`relative flex items-center justify-center rounded-[2px] border border-[#E2D5C7] dark:border-[#3B3029] transition-colors ${cellBg} ${
                      moveOption
                        ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-900/40 cursor-pointer animate-pulse z-20'
                        : ''
                    }`}
                  >
                    {/* Safe square marker (Cheere) */}
                    {(isP1Start || isP2Start) && (
                      <span
                        title="Safe Square (Cheere)"
                        className="absolute inset-0 flex items-center justify-center text-[8px] text-[#B43B22] dark:text-[#E46B52] opacity-40 font-mono select-none pointer-events-none"
                      >
                        ❖
                      </span>
                    )}

                    {/* Pieces occupying this cell */}
                    <div className="flex items-center justify-center -space-x-1 sm:-space-x-1.5 z-10">
                      {piecesHere.map(({ piece, isAnimating }) => {
                        const isOwner = piece.playerId === gameState.currentPlayerId;
                        const isMovable =
                          !isAnimating &&
                          isPieceMovable(
                            piece,
                            currentP,
                            opponentP,
                            gameState.currentScore,
                            gameState.phase
                          );
                        const isSelected =
                          isOwner && gameState.selectedPieceId === piece.id;

                        const isJuda = Boolean(
                          getJudaPartner(piece, gameState.players[piece.playerId])
                        );

                        return (
                          <ChausarPiece
                            key={`p${piece.playerId}-${piece.id}`}
                            piece={piece}
                            playerColorHex={
                              gameState.players[piece.playerId].colorHex
                            }
                            isCurrentPlayer={isOwner}
                            isMovable={isMovable}
                            isSelected={isSelected}
                            isAnimating={isAnimating}
                            isJuda={isJuda}
                            onClick={() => {
                              if (isMovable || isSelected) {
                                onSelectPiece(piece.id);
                              }
                            }}
                            size="sm"
                          />
                        );
                      })}
                    </div>

                    {/* Move distance badge */}
                    {moveOption && (
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] font-bold px-1 rounded-full shadow-xs z-20 pointer-events-none">
                        +{moveOption.moveAmount}
                      </span>
                    )}
                  </div>
                );
              }

              // 3. Corner Quadrants (Player Bases)
              // Player 1 Base: Bottom-Left (Rows 8..10, Cols 0..2)
              if (r >= 8 && r <= 10 && c >= 0 && c <= 2) {
                if (r === 9 && c === 1) {
                  return (
                    <div
                      key={`p1base-active-${r}-${c}`}
                      className="col-span-1 row-span-1 flex flex-col items-center justify-center p-0.5 bg-[#FAF0ED] dark:bg-[#2C1914] rounded-md border border-[#E9C6BC] dark:border-[#4E241A]"
                    >
                      <span className="text-[7px] font-bold text-[#B43B22] dark:text-[#E46B52] leading-none mb-0.5 truncate max-w-[50px]">
                        {gameState.players[0].name.toUpperCase()}
                      </span>
                      <div className="flex flex-wrap items-center justify-center gap-0.5">
                        {p1BasePieces.map((piece) => {
                          const isMovable =
                            isPieceMovable(
                              piece,
                              currentP,
                              opponentP,
                              gameState.currentScore,
                              gameState.phase
                            ) && !animatingPiece;
                          const isSelected =
                            gameState.currentPlayerId === 0 &&
                            gameState.selectedPieceId === piece.id;

                          return (
                            <ChausarPiece
                              key={`p1-base-${piece.id}`}
                              piece={piece}
                              playerColorHex={gameState.players[0].colorHex}
                              isCurrentPlayer={gameState.currentPlayerId === 0}
                              isMovable={isMovable}
                              isSelected={isSelected}
                              onClick={() => {
                                if (isMovable || isSelected) {
                                  onSelectPiece(piece.id);
                                }
                              }}
                              size="xs"
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={`p1base-pad-${r}-${c}`}
                    className="bg-[#2D2118]/5 dark:bg-[#151210]/40"
                    aria-hidden="true"
                  />
                );
              }

              // Player 2 Base: Top-Right (Rows 0..2, Cols 8..10)
              if (r >= 0 && r <= 2 && c >= 8 && c <= 10) {
                if (r === 1 && c === 9) {
                  return (
                    <div
                      key={`p2base-active-${r}-${c}`}
                      className="col-span-1 row-span-1 flex flex-col items-center justify-center p-0.5 bg-[#ECF4F1] dark:bg-[#162721] rounded-md border border-[#C5DDD4] dark:border-[#244237]"
                    >
                      <span className="text-[7px] font-bold text-[#1E4D3E] dark:text-[#52B496] leading-none mb-0.5 truncate max-w-[50px]">
                        {gameState.players[1].name.toUpperCase()}
                      </span>
                      <div className="flex flex-wrap items-center justify-center gap-0.5">
                        {p2BasePieces.map((piece) => {
                          const isMovable =
                            isPieceMovable(
                              piece,
                              currentP,
                              opponentP,
                              gameState.currentScore,
                              gameState.phase
                            ) && !animatingPiece;
                          const isSelected =
                            gameState.currentPlayerId === 1 &&
                            gameState.selectedPieceId === piece.id;

                          return (
                            <ChausarPiece
                              key={`p2-base-${piece.id}`}
                              piece={piece}
                              playerColorHex={gameState.players[1].colorHex}
                              isCurrentPlayer={gameState.currentPlayerId === 1}
                              isMovable={isMovable}
                              isSelected={isSelected}
                              onClick={() => {
                                if (isMovable || isSelected) {
                                  onSelectPiece(piece.id);
                                }
                              }}
                              size="xs"
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={`p2base-pad-${r}-${c}`}
                    className="bg-[#2D2118]/5 dark:bg-[#151210]/40"
                    aria-hidden="true"
                  />
                );
              }

              // Other empty corner quadrants (Top-Left & Bottom-Right)
              return (
                <div
                  key={`corner-empty-${r}-${c}`}
                  className="bg-[#2D2118]/5 dark:bg-[#151210]/30 flex items-center justify-center"
                  aria-hidden="true"
                >
                  {((r === 1 && c === 1) || (r === 9 && c === 9)) && (
                    <span className="text-[8px] text-[#A68F78] opacity-25">❖</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

