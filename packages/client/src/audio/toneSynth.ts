let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

/** Must be called from a user-gesture handler (pointerdown) before any tone can play. */
export function unlockAudio(): void {
  const ctx = getCtx();
  if (ctx.state === "suspended") ctx.resume();
}

function playTone(freq: number, duration: number, gainValue: number, type: OscillatorType = "sine") {
  const ctx = getCtx();
  if (ctx.state !== "running") return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(gainValue, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

/** Pitch scales up per node added to the current drag chain. */
export function playChainTone(chainIndex: number): void {
  const baseFreq = 220;
  const freq = baseFreq * Math.pow(2, Math.min(chainIndex, 24) / 12);
  playTone(freq, 0.16, 0.12);
}

export function playLoopBonusTone(): void {
  const ctx = getCtx();
  if (ctx.state !== "running") return;
  [440, 554, 659, 880].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, 0.15, "triangle"), i * 60);
  });
}
