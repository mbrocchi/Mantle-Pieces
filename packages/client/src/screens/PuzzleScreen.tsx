import { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { PUZZLE_SIZE, type GemColor } from "shared";
import { createRandomGrid, type CellPos, type Grid } from "../game/grid";
import { stepChain } from "../game/chain";
import { clearAndRefill } from "../game/gravity";
import { generateStage, type PuzzleStage } from "../game/objectives";
import { gemGradient, gemHex } from "../game/gemStyle";
import { PuzzleCanvasOverlay, type PuzzleCanvasHandle } from "../components/PuzzleCanvasOverlay";
import { playChainTone, playLoopBonusTone, unlockAudio } from "../audio/toneSynth";
import { useWalletStore } from "../state/walletStore";
import { wsClient } from "../lib/wsClient";
import { getPuzzleProgress } from "../lib/apiClient";

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

  const [grid, setGrid] = useState<Grid | null>(null);
  const [chain, setChain] = useState<CellPos[]>([]);
  const [dragging, setDragging] = useState(false);
  const walletBalance = useWalletStore((s) => s.balance);
  const [stage, setStage] = useState<PuzzleStage | null>(null);
  const [movesUsed, setMovesUsed] = useState(0);
  const [showForfeitConfirm, setShowForfeitConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPuzzleProgress().then(({ progress }) => {
      if (cancelled) return;
      if (progress) {
        setStage({ levelNumber: progress.levelNumber, movesLimit: progress.movesLimit, objectives: progress.objectives });
        setMovesUsed(progress.movesUsed);
        setGrid(progress.grid);
      } else {
        setStage(generateStage(1));
        setGrid(createRandomGrid());
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

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

  function withObjectiveProgress(objectives: PuzzleStage["objectives"], color: GemColor, count: number) {
    return objectives.map((o) => (o.color === color ? { ...o, cleared: Math.min(o.target, o.cleared + count) } : o));
  }

  function persistProgress(nextGrid: Grid, nextStage: PuzzleStage, nextMovesUsed: number) {
    wsClient.send({
      type: "puzzle:save_progress",
      levelNumber: nextStage.levelNumber,
      movesLimit: nextStage.movesLimit,
      movesUsed: nextMovesUsed,
      objectives: nextStage.objectives,
      grid: nextGrid,
    });
  }

  function advanceStage() {
    if (!stage) return;
    const nextStage = generateStage(stage.levelNumber + 1);
    const nextGrid = createRandomGrid();
    setStage(nextStage);
    setMovesUsed(0);
    setGrid(nextGrid);
    setChain([]);
    persistProgress(nextGrid, nextStage, 0);
  }

  function retryStage() {
    if (!stage) return;
    const nextStage = generateStage(stage.levelNumber);
    const nextGrid = createRandomGrid();
    setStage(nextStage);
    setMovesUsed(0);
    setGrid(nextGrid);
    setChain([]);
    persistProgress(nextGrid, nextStage, 0);
  }

  useEffect(() => {
    if (!stage) return;
    const allDone = stage.objectives.every((o) => o.cleared >= o.target);
    const outOfMoves = movesUsed >= stage.movesLimit;
    if (allDone) {
      const timeout = setTimeout(advanceStage, 900);
      return () => clearTimeout(timeout);
    }
    if (outOfMoves) {
      const timeout = setTimeout(retryStage, 500);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, movesUsed]);

  function endDrag() {
    setDragging(false);
    canvasHandleRef.current?.setLine(null, null);
  }

  function commitChain(finalChain: CellPos[]) {
    if (!grid || !stage) return;
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
    const nextGrid = clearAndRefill(grid, ids);
    const nextStage = { ...stage, objectives: withObjectiveProgress(stage.objectives, color, finalChain.length) };
    const nextMovesUsed = movesUsed + 1;
    setGrid(nextGrid);
    setStage(nextStage);
    setMovesUsed(nextMovesUsed);
    setChain([]);
    persistProgress(nextGrid, nextStage, nextMovesUsed);
  }

  function handleLoopClose(color: GemColor, pos: { x: number; y: number }) {
    if (!grid || !stage) return;
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

    const nextGrid = clearAndRefill(grid, idsToClear);
    const nextStage = { ...stage, objectives: withObjectiveProgress(stage.objectives, color, clearedCount) };
    const nextMovesUsed = movesUsed + 1;
    setGrid(nextGrid);
    onTokensEarned(Math.max(1, Math.floor(clearedCount / 3)), "loop_bonus");
    setStage(nextStage);
    setMovesUsed(nextMovesUsed);
    setChain([]);
    endDrag();
    persistProgress(nextGrid, nextStage, nextMovesUsed);
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (!grid) return;
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
    if (!dragging || !grid) return;
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

  if (!grid || !stage) {
    return (
      <div className="app-screen bg-gradient-to-b from-navy/70 to-black/85 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading your puzzle...</p>
      </div>
    );
  }

  return (
    <div className="app-screen bg-gradient-to-b from-navy/70 to-black/85 flex flex-col">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
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
          <div
            key={o.color}
            className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 shadow-lg shadow-black/40"
          >
            <span className={`w-3 h-3 rounded-full ${DOT_COLOR_CLASS[o.color]}`} />
            <span className="text-white text-xs font-semibold">
              {Math.min(o.cleared, o.target)}/{o.target}
            </span>
          </div>
        ))}
      </div>

      <div className="px-4 pb-2 flex justify-center">
        <button onClick={() => setShowForfeitConfirm(true)} className="text-gray-400 text-xs underline">
          Stuck? Forfeit Level
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-4">
        <motion.div
          ref={boardRef}
          animate={shakeControls}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-full aspect-square rounded-2xl ring-2 ring-gold shadow-[0_0_24px_4px_rgba(212,175,55,0.5),0_10px_28px_rgba(0,0,0,0.55)] bg-black/40 touch-none select-none"
        >
          <AnimatePresence initial={false}>
            {grid.flatMap((column, col) =>
              column.map((cell, row) => {
                const isActive = chainKeys.has(cellKey({ col, row }));
                const hex = gemHex(cell.color);
                return (
                  <motion.div
                    key={cell.id}
                    data-col={col}
                    data-row={row}
                    initial={{ y: "-140%", scale: 1, opacity: 1, rotate: 0 }}
                    animate={{ y: `${row * 100}%`, scale: 1, opacity: 1, rotate: 0 }}
                    exit={{
                      scale: [1, 1.35, 0],
                      opacity: [1, 1, 0],
                      rotate: 90,
                      transition: { duration: 0.32, times: [0, 0.35, 1], ease: "easeIn" },
                    }}
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
                      className="w-full h-full rounded-full transition-all duration-150"
                      style={{
                        background: gemGradient(cell.color),
                        boxShadow: isActive
                          ? `0 0 0 3px ${hex}, 0 0 16px 4px ${hex}, 0 0 28px 8px ${hex}99`
                          : "inset 0 -3px 6px rgba(0,0,0,0.35)",
                        transform: isActive ? "scale(1.18)" : "scale(1)",
                      }}
                    />
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
          <PuzzleCanvasOverlay ref={canvasHandleRef} />
        </motion.div>
      </div>

      <AnimatePresence>
        {showForfeitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              className="bg-navy-light rounded-2xl border-2 border-gold w-full max-w-sm p-5"
            >
              <p className="text-gold font-bold text-sm tracking-wide mb-2 text-center">FORFEIT LEVEL?</p>
              <p className="text-gray-300 text-xs text-center mb-4">
                This gives up your current progress on level {stage.levelNumber} and deals you a fresh board.
              </p>
              <button
                onClick={() => {
                  retryStage();
                  setShowForfeitConfirm(false);
                }}
                className="w-full bg-red-600/90 text-white font-bold rounded-xl px-4 py-3 transition-transform active:scale-95"
              >
                Forfeit &amp; Start Again
              </button>
              <button
                onClick={() => setShowForfeitConfirm(false)}
                className="w-full text-gray-400 text-xs underline mt-3"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
