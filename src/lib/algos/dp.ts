/** DP table frame generators: 0/1 knapsack, LCS, matrix-chain multiplication. */
export interface DPFrame {
  table: (number | string | null)[][];
  active?: [number, number];
  refs?: [number, number][];
  path?: [number, number][];
  status: string;
  note?: string;
  done?: boolean;
}

export function knapsack01(weights: number[], values: number[], W: number): { frames: DPFrame[]; rowLabels: string[]; colLabels: string[] } {
  const n = weights.length;
  const t: (number | null)[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(null));
  const frames: DPFrame[] = [];
  for (let w = 0; w <= W; w++) t[0][w] = 0;
  for (let i = 0; i <= n; i++) t[i][0] = 0;
  frames.push({ table: t.map((r) => [...r]), status: `Base case: 0 items or capacity 0 ⇒ value 0 (row 0 and column 0).` });
  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= W; w++) {
      const wt = weights[i - 1], val = values[i - 1];
      if (wt <= w) {
        const take = val + (t[i - 1][w - wt] as number);
        const skip = t[i - 1][w] as number;
        t[i][w] = Math.max(take, skip);
        frames.push({
          table: t.map((r) => [...r]), active: [i, w], refs: [[i - 1, w], [i - 1, w - wt]],
          status: `Item ${i} (w=${wt}, v=${val}) fits in ${w}: max(skip ${skip}, take ${val}+${t[i - 1][w - wt]}=${take}) = ${t[i][w]}.`,
        });
      } else {
        t[i][w] = t[i - 1][w];
        frames.push({
          table: t.map((r) => [...r]), active: [i, w], refs: [[i - 1, w]],
          status: `Item ${i} (w=${wt}) too heavy for ${w} → copy above: ${t[i][w]}.`,
        });
      }
    }
  }
  frames.push({ table: t.map((r) => [...r]), active: [n, W], status: `Answer = table[${n}][${W}] = ${t[n][W]} (max value).`, done: true });
  const rowLabels = ['∅', ...weights.map((w, i) => `i${i + 1}(w${w},v${values[i]})`)];
  const colLabels = Array.from({ length: W + 1 }, (_, i) => String(i));
  return { frames, rowLabels, colLabels };
}

export function lcs(X: string, Y: string): { frames: DPFrame[]; rowLabels: string[]; colLabels: string[] } {
  const m = X.length, n = Y.length;
  const t: (number | null)[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null));
  const frames: DPFrame[] = [];
  for (let i = 0; i <= m; i++) t[i][0] = 0;
  for (let j = 0; j <= n; j++) t[0][j] = 0;
  frames.push({ table: t.map((r) => [...r]), status: `Base case: empty prefix ⇒ LCS length 0 (first row & column).` });
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (X[i - 1] === Y[j - 1]) {
        t[i][j] = (t[i - 1][j - 1] as number) + 1;
        frames.push({ table: t.map((r) => [...r]), active: [i, j], refs: [[i - 1, j - 1]], status: `'${X[i - 1]}' = '${Y[j - 1]}' → diagonal + 1 = ${t[i][j]}.` });
      } else {
        t[i][j] = Math.max(t[i - 1][j] as number, t[i][j - 1] as number);
        frames.push({ table: t.map((r) => [...r]), active: [i, j], refs: [[i - 1, j], [i, j - 1]], status: `'${X[i - 1]}' ≠ '${Y[j - 1]}' → max(up ${t[i - 1][j]}, left ${t[i][j - 1]}) = ${t[i][j]}.` });
      }
    }
  }
  // traceback
  const path: [number, number][] = [];
  let i = m, j = n; const seq: string[] = [];
  while (i > 0 && j > 0) {
    if (X[i - 1] === Y[j - 1]) { path.push([i, j]); seq.unshift(X[i - 1]); i--; j--; }
    else if ((t[i - 1][j] as number) >= (t[i][j - 1] as number)) i--;
    else j--;
  }
  frames.push({ table: t.map((r) => [...r]), active: [m, n], path, status: `LCS length = ${t[m][n]}. One LCS: "${seq.join('')}" (green traceback).`, done: true });
  const rowLabels = ['∅', ...X.split('')];
  const colLabels = ['∅', ...Y.split('')];
  return { frames, rowLabels, colLabels };
}

export function matrixChain(p: number[]): { frames: DPFrame[]; labels: string[] } {
  const n = p.length - 1; // matrices A1..An
  const m: (number | null)[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(null));
  const frames: DPFrame[] = [];
  for (let i = 1; i <= n; i++) m[i][i] = 0;
  frames.push({ table: view(m, n), status: `A single matrix costs 0 to multiply (diagonal = 0). Dimensions p = [${p.join(', ')}].` });
  for (let L = 2; L <= n; L++) {
    for (let i = 1; i <= n - L + 1; i++) {
      const j = i + L - 1;
      let best = Infinity, bestK = i;
      for (let k = i; k < j; k++) {
        const cost = (m[i][k] as number) + (m[k + 1][j] as number) + p[i - 1] * p[k] * p[j];
        if (cost < best) { best = cost; bestK = k; }
      }
      m[i][j] = best;
      // active/refs in display (0-indexed) coordinates for the DP table view
      frames.push({ table: view(m, n), active: [i - 1, j - 1], refs: [[i - 1, bestK - 1], [bestK, j - 1]], status: `m[${i}][${j}] (chain length ${L}): best split at k=${bestK} ⇒ cost ${best}.` });
    }
  }
  frames.push({ table: view(m, n), active: [0, n - 1], status: `Minimum multiplications = m[1][${n}] = ${m[1][n]}.`, done: true });
  const labels = Array.from({ length: n }, (_, i) => `A${i + 1}`);
  return { frames, labels };
}

function view(m: (number | null)[][], n: number): (number | string | null)[][] {
  // return the 1..n sub-grid, blanking the lower triangle for display
  const out: (number | string | null)[][] = [];
  for (let i = 1; i <= n; i++) {
    const row: (number | string | null)[] = [];
    for (let j = 1; j <= n; j++) row.push(j < i ? '' : m[i][j]);
    out.push(row);
  }
  return out;
}
