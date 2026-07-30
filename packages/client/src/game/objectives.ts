import { GEM_COLORS, type GemColor, type PuzzleObjective } from "shared";

function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export interface PuzzleStage {
  levelNumber: number;
  movesLimit: number;
  objectives: PuzzleObjective[];
}

export function generateStage(levelNumber: number): PuzzleStage {
  const colorCount = Math.random() < 0.5 ? 2 : 3;
  const colors: GemColor[] = shuffle(GEM_COLORS).slice(0, colorCount);
  const objectives: PuzzleObjective[] = colors.map((color) => ({
    color,
    target: randomInt(8, 20),
    cleared: 0,
  }));
  const movesLimit = Math.round(objectives.reduce((sum, o) => sum + o.target, 0) * 0.9);
  return { levelNumber, movesLimit, objectives };
}
