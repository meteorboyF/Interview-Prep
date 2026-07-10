/**
 * Waveform generators for the electronics visualizers (rectifiers, clippers,
 * clampers) plus the diode I-V characteristic. Each waveform is sampled over two
 * input periods; a Player then reveals it point-by-point like a scope sweep.
 */
export interface Sample { t: number; vin: number; vout: number; on: boolean; }
export interface WaveFrame { reveal: number; status: string; done?: boolean; }

const N = 160; // samples across the window
const PERIODS = 2;

/** Base input: a sine wave of peak Vm over PERIODS periods. */
function inputSamples(Vm: number): { t: number; vin: number }[] {
  const out: { t: number; vin: number }[] = [];
  for (let i = 0; i < N; i++) {
    const t = (i / (N - 1)) * PERIODS; // periods
    out.push({ t, vin: Vm * Math.sin(2 * Math.PI * t) });
  }
  return out;
}

// ------------------------------------------------------------- Rectifiers ---
export function rectifier(mode: 'half' | 'full' | 'filtered', Vm: number, drop = 0.7, tau = 0.35): Sample[] {
  const base = inputSamples(Vm);
  const out: Sample[] = [];
  let vc = 0; // capacitor voltage for the filtered mode
  const dt = PERIODS / (N - 1);
  for (const { t, vin } of base) {
    let rect: number;
    let on: boolean;
    if (mode === 'half') {
      on = vin > drop;
      rect = on ? vin - drop : 0;
    } else {
      // full-wave bridge: both half-cycles pass (two diode drops)
      const mag = Math.abs(vin);
      on = mag > drop;
      rect = on ? mag - drop : 0;
    }
    let vout = rect;
    if (mode === 'filtered') {
      // ideal: capacitor charges instantly to the rectified peak, then
      // discharges through the load (RC) until the next peak tops it up.
      if (rect >= vc) vc = rect;
      else vc = vc * Math.exp(-dt / tau);
      vout = vc;
      on = rect >= vc - 1e-9;
    }
    out.push({ t, vin, vout, on });
  }
  return out;
}

// ---------------------------------------------------------------- Clippers ---
export function clipper(type: 'positive' | 'negative' | 'both', Vm: number, posLevel: number, negLevel: number): Sample[] {
  return inputSamples(Vm).map(({ t, vin }) => {
    let vout = vin;
    let on = false;
    if (type === 'positive' || type === 'both') {
      if (vout > posLevel) { vout = posLevel; on = true; }
    }
    if (type === 'negative' || type === 'both') {
      if (vout < negLevel) { vout = negLevel; on = true; }
    }
    return { t, vin, vout, on };
  });
}

// ---------------------------------------------------------------- Clampers ---
export function clamper(type: 'positive' | 'negative', Vm: number, bias: number): Sample[] {
  const base = inputSamples(Vm);
  // Positive clamper shifts the whole wave up so its minimum sits at `bias`.
  // Negative clamper shifts it down so its maximum sits at `bias`.
  const vinMin = Math.min(...base.map((s) => s.vin));
  const vinMax = Math.max(...base.map((s) => s.vin));
  const shift = type === 'positive' ? bias - vinMin : bias - vinMax;
  return base.map(({ t, vin }) => ({ t, vin, vout: vin + shift, on: false }));
}

/** Turn samples into progressive reveal frames with a per-point status. */
export function revealFrames(samples: Sample[], statusFn: (s: Sample, i: number) => string): WaveFrame[] {
  const frames: WaveFrame[] = samples.map((s, i) => ({ reveal: i, status: statusFn(s, i) }));
  if (frames.length) { frames[frames.length - 1].done = true; }
  return frames;
}

// ------------------------------------------------------- Diode I-V curve ---
/** Shockley-ish diode current (mA) for an applied voltage, clipped for display. */
export function diodeCurrent(v: number, Vknee = 0.7, Vbr = -6): number {
  if (v >= 0) {
    // exponential turn-on, scaled to look like a real forward curve
    const i = 0.02 * (Math.exp(v / 0.1) - 1);
    return Math.min(i, 12); // mA, clamp for the display
  }
  // reverse: tiny leakage until breakdown, then steep
  if (v <= Vbr) return -Math.min(12, 0.02 * (Math.exp((Vbr - v) / 0.15)));
  return -0.02; // small reverse leakage
}

export function diodeCurve(Vbr = -6): { v: number; i: number }[] {
  const pts: { v: number; i: number }[] = [];
  for (let v = Vbr - 1.5; v <= 1.0; v += 0.02) pts.push({ v, i: diodeCurrent(v, 0.7, Vbr) });
  return pts;
}
