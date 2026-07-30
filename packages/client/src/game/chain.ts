import { cellAt, cellsEqual, isAdjacent, type CellPos, type Grid } from "./grid";

export type ChainStepResult =
  | { kind: "append"; chain: CellPos[] }
  | { kind: "backtrack"; chain: CellPos[] }
  | { kind: "loop" }
  | { kind: "ignore" };

/**
 * Advances a drag chain given a newly hovered cell. `loop` fires when the
 * candidate matches a chain member earlier than the immediately-previous one
 * (a true revisit, not the one-step backtrack used to shrink the chain).
 */
export function stepChain(grid: Grid, chain: CellPos[], candidate: CellPos): ChainStepResult {
  if (chain.length === 0) return { kind: "ignore" };

  const chainColor = cellAt(grid, chain[0])?.color;
  const candidateCell = cellAt(grid, candidate);
  if (!candidateCell || candidateCell.color !== chainColor) return { kind: "ignore" };

  const last = chain[chain.length - 1];
  if (cellsEqual(candidate, last)) return { kind: "ignore" };
  if (!isAdjacent(candidate, last)) return { kind: "ignore" };

  if (chain.length >= 2 && cellsEqual(candidate, chain[chain.length - 2])) {
    return { kind: "backtrack", chain: chain.slice(0, -1) };
  }

  if (chain.some((c) => cellsEqual(c, candidate))) {
    return { kind: "loop" };
  }

  return { kind: "append", chain: [...chain, candidate] };
}
