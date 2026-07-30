import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { GemColor } from "shared";

export interface PuzzleCanvasHandle {
  setLine: (points: { x: number; y: number }[] | null, color: GemColor | null) => void;
  burst: (x: number, y: number, color: GemColor) => void;
  shockwave: (x: number, y: number, color: GemColor) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  life: number;
}

const COLOR_HEX: Record<GemColor, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  purple: "#a855f7",
};

export const PuzzleCanvasOverlay = forwardRef<PuzzleCanvasHandle, object>(function PuzzleCanvasOverlay(
  _props,
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<{ points: { x: number; y: number }[]; color: string } | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);

  useImperativeHandle(ref, () => ({
    setLine(points, color) {
      lineRef.current = points && color ? { points, color: COLOR_HEX[color] } : null;
    },
    burst(x, y, color) {
      const hex = COLOR_HEX[color];
      for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 2.8;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 26 + Math.random() * 10,
          color: hex,
        });
      }
    },
    shockwave(x, y, color) {
      shockwavesRef.current.push({ x, y, radius: 4, maxRadius: 320, color: COLOR_HEX[color], life: 0 });
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;
    let rafId = 0;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = parent.clientWidth * dpr;
      canvas!.height = parent.clientHeight * dpr;
      canvas!.style.width = `${parent.clientWidth}px`;
      canvas!.style.height = `${parent.clientHeight}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    function frame() {
      if (!running) return;
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      ctx!.clearRect(0, 0, w, h);

      shockwavesRef.current = shockwavesRef.current.filter((sw) => {
        sw.life += 1;
        sw.radius += (sw.maxRadius - sw.radius) * 0.18;
        const alpha = Math.max(0, 1 - sw.life / 26);
        if (alpha <= 0) return false;
        ctx!.beginPath();
        ctx!.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx!.strokeStyle = sw.color;
        ctx!.globalAlpha = alpha * 0.85;
        ctx!.lineWidth = 6;
        ctx!.shadowColor = sw.color;
        ctx!.shadowBlur = 24;
        ctx!.stroke();
        ctx!.globalAlpha = 1;
        ctx!.shadowBlur = 0;
        return sw.life < 26;
      });

      particlesRef.current = particlesRef.current.filter((p) => {
        p.life += 1;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        if (alpha <= 0) return false;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = alpha;
        ctx!.fill();
        ctx!.globalAlpha = 1;
        return true;
      });

      const line = lineRef.current;
      if (line && line.points.length > 0) {
        ctx!.lineJoin = "round";
        ctx!.lineCap = "round";
        ctx!.lineWidth = 14;
        ctx!.strokeStyle = "rgba(255,255,255,0.95)";
        ctx!.shadowColor = line.color;
        ctx!.shadowBlur = 22;
        ctx!.beginPath();
        line.points.forEach((pt, i) => (i === 0 ? ctx!.moveTo(pt.x, pt.y) : ctx!.lineTo(pt.x, pt.y)));
        ctx!.stroke();
        ctx!.shadowBlur = 0;
        ctx!.fillStyle = "white";
        line.points.forEach((pt) => {
          ctx!.beginPath();
          ctx!.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
          ctx!.fill();
        });
      }

      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
});
