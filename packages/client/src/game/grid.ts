import { GEM_COLORS, PUZZLE_SIZE, type GemColor } from "shared";

export interface Cell {
  id: string;
  color: GemColor;
}

/** Column-major: grid[col] is that column's cells, top (row 0) to bottom. */
export type Grid = Cell[][];

export interface CellPos {
  col: number;
  row: number;
}

function randomColor(): GemColor {
  return GEM_COLORS[Math.floor(Math.random() * GEM_COLORS.length)];
}

function makeCell(): Cell {
  return { id: crypto.randomUUID(), color: randomColor() };
}

export function createRandomGrid(size: number = PUZZLE_SIZE): Grid {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => makeCell()));
}

export function cellAt(grid: Grid, pos: CellPos): Cell | undefined {
  return grid[pos.col]?.[pos.row];
}

export function cellsEqual(a: CellPos, b: CellPos): boolean {
  return a.col === b.col && a.row === b.row;
}

export function isAdjacent(a: CellPos, b: CellPos): boolean {
  const dCol = Math.abs(a.col - b.col);
  const dRow = Math.abs(a.row - b.row);
  return dCol + dRow === 1;
}

export { makeCell };
