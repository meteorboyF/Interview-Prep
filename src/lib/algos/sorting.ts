/**
 * Frame generators for the sorting visualizers. Each returns an array of
 * immutable snapshots the Player steps through. The algorithms mirror the
 * reviewed course code exactly (same comparisons/swaps), just instrumented.
 */
export interface SortFrame {
  array: number[];
  compare?: number[];
  swap?: number[];
  sorted?: number[];
  key?: number;
  pivot?: number;
  range?: [number, number];
  status: string;
  done?: boolean;
}

const snap = (a: number[], extra: Partial<SortFrame>, status: string): SortFrame => ({
  array: [...a],
  status,
  ...extra,
});

export function selectionSort(input: number[]): SortFrame[] {
  const a = [...input];
  const n = a.length;
  const frames: SortFrame[] = [snap(a, { sorted: [] }, 'Start: find the minimum of the unsorted part each pass.')];
  const sorted: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    frames.push(snap(a, { sorted: [...sorted], compare: [minIdx], key: i }, `Pass ${i + 1}: assume index ${i} holds the minimum.`));
    for (let j = i + 1; j < n; j++) {
      frames.push(snap(a, { sorted: [...sorted], compare: [minIdx, j], key: i }, `Compare a[${j}]=${a[j]} against current min a[${minIdx}]=${a[minIdx]}.`));
      if (a[j] < a[minIdx]) {
        minIdx = j;
        frames.push(snap(a, { sorted: [...sorted], compare: [minIdx], key: i }, `New minimum: a[${minIdx}]=${a[minIdx]}.`));
      }
    }
    if (minIdx !== i) {
      frames.push(snap(a, { sorted: [...sorted], swap: [i, minIdx] }, `Swap a[${i}] and a[${minIdx}].`));
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
    }
    sorted.push(i);
    frames.push(snap(a, { sorted: [...sorted] }, `Index ${i} is now locked in sorted position.`));
  }
  sorted.push(n - 1);
  frames.push(snap(a, { sorted }, 'Array fully sorted.', ));
  frames[frames.length - 1].done = true;
  return frames;
}

export function bubbleSort(input: number[]): SortFrame[] {
  const a = [...input];
  const n = a.length;
  const frames: SortFrame[] = [snap(a, { sorted: [] }, 'Start: bubble the largest element to the end each pass.')];
  const sorted: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      frames.push(snap(a, { sorted: [...sorted], compare: [j, j + 1] }, `Compare a[${j}]=${a[j]} and a[${j + 1}]=${a[j + 1]}.`));
      if (a[j] > a[j + 1]) {
        frames.push(snap(a, { sorted: [...sorted], swap: [j, j + 1] }, `a[${j}] > a[${j + 1}] → swap.`));
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
    }
    sorted.unshift(n - 1 - i);
    frames.push(snap(a, { sorted: [...sorted] }, `Largest of this pass parked at index ${n - 1 - i}.`));
    if (!swapped) {
      frames.push(snap(a, { sorted: Array.from({ length: n }, (_, k) => k) }, 'No swaps this pass — already sorted, early exit.'));
      break;
    }
  }
  const last = frames[frames.length - 1];
  last.sorted = Array.from({ length: n }, (_, k) => k);
  last.done = true;
  last.status = 'Array fully sorted.';
  return frames;
}

export function insertionSort(input: number[]): SortFrame[] {
  const a = [...input];
  const n = a.length;
  const frames: SortFrame[] = [snap(a, { sorted: [0] }, 'Start: the first element is a sorted sublist of size 1.')];
  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    frames.push(snap(a, { sorted: Array.from({ length: i }, (_, k) => k), key: i }, `Take key = a[${i}] = ${key}; insert into the sorted left part.`));
    while (j >= 0 && a[j] > key) {
      frames.push(snap(a, { sorted: Array.from({ length: i }, (_, k) => k), compare: [j], key: i }, `a[${j}]=${a[j]} > key=${key} → shift right.`));
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
    frames.push(snap(a, { sorted: Array.from({ length: i + 1 }, (_, k) => k) }, `Insert key ${key} at index ${j + 1}.`));
  }
  frames.push(snap(a, { sorted: Array.from({ length: n }, (_, k) => k) }, 'Array fully sorted.'));
  frames[frames.length - 1].done = true;
  return frames;
}

export function mergeSort(input: number[]): SortFrame[] {
  const a = [...input];
  const n = a.length;
  const frames: SortFrame[] = [snap(a, {}, 'Start: recursively split, then merge sorted halves.')];
  function merge(lo: number, mid: number, hi: number) {
    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    let i = 0, j = 0, k = lo;
    frames.push(snap(a, { range: [lo, hi] }, `Merge subarrays [${lo}…${mid}] and [${mid + 1}…${hi}].`));
    while (i < left.length && j < right.length) {
      frames.push(snap(a, { range: [lo, hi], compare: [lo + i, mid + 1 + j] }, `Compare ${left[i]} and ${right[j]}.`));
      if (left[i] <= right[j]) a[k++] = left[i++];
      else a[k++] = right[j++];
      frames.push(snap(a, { range: [lo, hi] }, `Place ${a[k - 1]} at index ${k - 1}.`));
    }
    while (i < left.length) { a[k++] = left[i++]; frames.push(snap(a, { range: [lo, hi] }, `Copy remaining ${a[k - 1]}.`)); }
    while (j < right.length) { a[k++] = right[j++]; frames.push(snap(a, { range: [lo, hi] }, `Copy remaining ${a[k - 1]}.`)); }
  }
  function sort(lo: number, hi: number) {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    frames.push(snap(a, { range: [lo, hi] }, `Split [${lo}…${hi}] at ${mid}.`));
    sort(lo, mid);
    sort(mid + 1, hi);
    merge(lo, mid, hi);
  }
  sort(0, n - 1);
  frames.push(snap(a, { sorted: Array.from({ length: n }, (_, k) => k) }, 'Array fully sorted.'));
  frames[frames.length - 1].done = true;
  return frames;
}

export function quickSort(input: number[]): SortFrame[] {
  const a = [...input];
  const n = a.length;
  const frames: SortFrame[] = [snap(a, {}, 'Start: partition around a pivot (last element), then recurse.')];
  const sorted: number[] = [];
  function partition(lo: number, hi: number): number {
    const pivot = a[hi];
    frames.push(snap(a, { range: [lo, hi], pivot: hi, sorted: [...sorted] }, `Pivot = a[${hi}] = ${pivot}.`));
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      frames.push(snap(a, { range: [lo, hi], pivot: hi, compare: [j], sorted: [...sorted] }, `Is a[${j}]=${a[j]} < pivot ${pivot}?`));
      if (a[j] < pivot) {
        i++;
        if (i !== j) frames.push(snap(a, { range: [lo, hi], pivot: hi, swap: [i, j], sorted: [...sorted] }, `Yes → swap a[${i}] and a[${j}].`));
        [a[i], a[j]] = [a[j], a[i]];
      }
    }
    frames.push(snap(a, { range: [lo, hi], swap: [i + 1, hi], sorted: [...sorted] }, `Place pivot at index ${i + 1}.`));
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    sorted.push(i + 1);
    frames.push(snap(a, { sorted: [...sorted] }, `Pivot ${pivot} is now in its final position ${i + 1}.`));
    return i + 1;
  }
  function sort(lo: number, hi: number) {
    if (lo > hi) return;
    if (lo === hi) { if (!sorted.includes(lo)) sorted.push(lo); return; }
    const p = partition(lo, hi);
    sort(lo, p - 1);
    sort(p + 1, hi);
  }
  sort(0, n - 1);
  frames.push(snap(a, { sorted: Array.from({ length: n }, (_, k) => k) }, 'Array fully sorted.'));
  frames[frames.length - 1].done = true;
  return frames;
}

export const SORTERS: Record<string, { fn: (a: number[]) => SortFrame[]; best: string; avg: string; worst: string; space: string; stable: string }> = {
  selection: { fn: selectionSort, best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: 'No' },
  bubble: { fn: bubbleSort, best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: 'Yes' },
  insertion: { fn: insertionSort, best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: 'Yes' },
  merge: { fn: mergeSort, best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: 'Yes' },
  quick: { fn: quickSort, best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stable: 'No' },
};
