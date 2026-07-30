import { useRef, useEffect, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { PUZZLE_SIZE, type GemColor } from "shared";
import { createRandomGrid, type CellPos, type Grid } from "../game/grid";
import { stepChain } from "../game/chain";
import { clearAndRefill } from "../game/gravity";
import { generateStage, type PuzzleStage } from "../game/objectives";
import { gemGradient } from "../game/gemStyle";
import { PuzzleCanvasOverlay, type PuzzleCanvasHandle } from "../components/PuzzleCanvasOverlay";
import { playChainTone, playLoopBonusTone, unlockAudio } from "../audio/toneSynth";
import { useWalletStore } from "../state/walletStore";
import { wsClient } from "../lib/wsClient";

const DOT_COLOR_CLASS: Record<GemColor, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  orange: "bg-orange-500",
  purple: "bg-purple-500",
};

function cellKey(pos: CellPos) {
  return `${pos.col},${pos.row}`;
}

export function PuzzleScreen() {
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasHandleRef = useRef<PuzzleCanvasHandle>(null);
  const shakeControls = useAnimationControls();

  const [grid, setGrid] = useState<Grid>(() => createRandomGrid());
  const [chain, setChain] = useState<CellPos[]>([]);
  const [dragging, setDragging] = useState(false);
  const walletBalance = useWalletStore((s) => s.balance);
  const [stage, setStage] = useState<PuzzleStage>(() => generateStage(1));
  const [movesUsed, setMovesUsed] = useState(0);

  const chainKeys = new Set(chain.map(cellKey));

  function cellCenterPx(pos: CellPos): { x: number; y: number } {
    const el = boardRef.current;
    if (!el) return { x: 0, y: 0 };
    return {
      x: ((pos.col + 0.5) / PUZZLE_SIZE) * el.clientWidth,
      y: ((pos.row + 0.5) / PUZZLE_SIZE) * el.clientHeight,
    };
  }

  function boardRelativePx(clientX: number, clientY: number) {
    const el = boardRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function onTokensEarned(amount: number, reason: "loop_bonus") {
    wsClient.send({ type: "puzzle:tokens_earned", amount, reason });
  }

  function updateObjectives(color: GemColor, count: number) {
    setStage((prev) => ({
      ...prev,
      objectives: prev.objectives.map((o) =>
        o.color === color ? { ...o, cleared: Math.min(o.target, o.cleared + count) } : o
      ),
    }));
  }

  function advanceStage() {
    const nextLevel = stage.levelNumber + 1;
    setStage(generateStage(nextLevel));
    setMovesUsed(0);
    setGrid(createRandomGrid());
    setChain([]);
  }

  useEffect(() => {
    const allDone = stage.objectives.every((o) => o.cleared >= o.target);
    const outOfMoves = movesUsed >= stage.movesLimit;
    if (allDone || outOfMoves) {
      const timeout = setTimeout(advanceStage, allDone ? 900 : 500);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.objectives, movesUsed]);

  function endDrag() {
    setDragging(false);
    canvasHandleRef.current?.setLine(null, null);
  }

  function commitChain(finalChain: CellPos[]) {
    if (finalChain.length < 2) {
      setChain([]);
      return;
    }
    const color = grid[finalChain[0].col][finalChain[0].row].color;
    const ids = new Set(finalChain.map((pos) => grid[pos.col][pos.row].id));
    finalChain.forEach((pos) => {
      const c = cellCenterPx(pos);
      canvasHandleRef.current?.burst(c.x, c.y, color);
    });
    setGrid((g) => clearAndRefill(g, ids));
    updateObjectives(color, finalChain.length);
    setMovesUsed((m) => m + 1);
    setChain([]);
  }

  function handleLoopClose(color: GemColor, pos: { x: number; y: number }) {
    const idsToClear = new Set<string>();
    grid.forEach((column) => column.forEach((cell) => cell.color === color && idsToClear.add(cell.id)));
    const clearedCount = idsToClear.size;

    canvasHandleRef.current?.shockwave(pos.x, pos.y, color);
    shakeControls.start({
      x: [0, -10, 9, -7, 6, -3, 0],
      y: [0, 6, -6, 4, -3, 2, 0],
      transition: { duration: 0.42 },
    });
    playLoopBonusTone();

    setGrid((g) => clearAndRefill(g, idsToClear));
    onTokensEarned(Math.max(1, Math.floor(clearedCount / 3)), "loop_bonus");
    updateObjectives(color, clearedCount);
    setMovesUsed((m) => m + 1);
    setChain([]);
    endDrag();
  }

  function handlePointerDown(e: React.PointerEvent) {
    unlockAudio();
    const targetEl = (e.target as HTMLElement).closest("[data-col]") as HTMLElement | null;
    if (!targetEl) return;
    const col = Number(targetEl.dataset.col);
    const row = Number(targetEl.dataset.row);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setChain([{ col, row }]);
    setDragging(true);
    const color = grid[col][row].color;
    canvasHandleRef.current?.setLine([cellCenterPx({ col, row })], color);
    playChainTone(0);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const pos = boardRelativePx(e.clientX, e.clientY);
    const targetEl = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-col]") as HTMLElement | null;

    let currentChain = chain;
    if (targetEl) {
      const col = Number(targetEl.dataset.col);
      const row = Number(targetEl.dataset.row);
      const result = stepChain(grid, chain, { col, row });
      if (result.kind === "append") {
        currentChain = result.chain;
        setChain(currentChain);
        playChainTone(currentChain.length - 1);
      } else if (result.kind === "backtrack") {
        currentChain = result.chain;
        setChain(currentChain);
      } else if (result.kind === "loop") {
        const color = grid[chain[0].col][chain[0].row].color;
        handleLoopClose(color, pos);
        return;
      }
    }

    if (currentChain.length === 0) return;
    const color = grid[currentChain[0].col][currentChain[0].row].color;
    const points = currentChain.map(cellCenterPx);
    points.push(pos);
    canvasHandleRef.current?.setLine(points, color);
  }

  function handlePointerUp() {
    if (!dragging) return;
    endDrag();
    commitChain(chain);
  }

  return (
    <div className="app-screen bg-gradient-to-b from-navy to-black flex flex-col">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between text-white">
        <div className="text-center">
          <div className="text-[10px] text-gray-400 font-bold">LEVEL</div>
          <div className="font-bold">{stage.levelNumber}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-gray-400 font-bold">MOVES</div>
          <div className="font-bold">{Math.max(0, stage.movesLimit - movesUsed)}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-gray-400 font-bold">DIG TOKENS</div>
          <div className="font-bold text-gold">{walletBalance}</div>
        </div>
      </div>

      <div className="px-4 pb-3 flex items-center justify-center gap-4">
        {stage.objectives.map((o) => (
          <div key={o.color} className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1">
            <span className={`w-3 h-3 rounded-full ${DOT_COLOR_CLASS[o.color]}`} />
            <span className="text-white text-xs font-semibold">
              {Math.min(o.cleared, o.target)}/{o.target}
            </span>
          </div>
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-4">
        <motion.div
          ref={boardRef}
          animate={shakeControls}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-full aspect-square rounded-2xl ring-2 ring-gold shadow-[0_0_24px_4px_rgba(212,175,55,0.5)] bg-black/40 touch-none select-none"
        >
          {grid.map((column, col) =>
            column.map((cell, row) => {
              const isActive = chainKeys.has(cellKey({ col, row }));
              return (
                <motion.div
                  key={cell.id}
                  data-col={col}
                  data-row={row}
                  initial={{ y: "-140%" }}
                  animate={{ y: `${row * 100}%` }}
                  transition={{ type: "spring", stiffness: 320, damping: 28, delay: row * 0.02 }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: `${(col / PUZZLE_SIZE) * 100}%`,
                    width: `${100 / PUZZLE_SIZE}%`,
                    height: `${100 / PUZZLE_SIZE}%`,
                  }}
                  className="p-1"
                >
                  <div
                    className="w-full h-full rounded-full transition-transform"
                    style={{
                      background: gemGradient(cell.color),
                      boxShadow: isActive
                        ? "0 0 0 3px rgba(255,255,255,0.9), 0 0 14px 2px rgba(255,255,255,0.6)"
                        : "inset 0 -3px 6px rgba(0,0,0,0.35)",
                      transform: isActive ? "scale(1.08)" : "scale(1)",
                    }}
                  />
                </motion.div>
              );
            })
          )}
          <PuzzleCanvasOverlay ref={canvasHandleRef} />
        </motion.div>
      </div>
    </div>
  );
}
