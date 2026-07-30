import { makeCell, type Grid } from "./grid";

/** Removes the given cell ids, compacts survivors downward, and top-fills with fresh cells. */
export function clearAndRefill(grid: Grid, idsToClear: Set<string>): Grid {
  return grid.map((column) => {
    const survivors = column.filter((cell) => !idsToClear.has(cell.id));
    const removedCount = column.length - survivors.length;
    const newCells = Array.from({ length: removedCount }, () => makeCell());
    return [...newCells, ...survivors];
  });
}
