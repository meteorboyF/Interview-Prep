/**
 * B-tree (CLRS proactive-split insertion, minimum degree t=2 → max 3 keys/node)
 * with frame generators for insert and search. This demonstrates the balanced
 * multiway search and node-splitting that database B+ tree indexes rely on.
 */
export interface BTNode { id: number; keys: number[]; children: BTNode[]; }
export interface LNode { id: number; keys: number[]; x: number; y: number; }
export interface LEdge { from: [number, number]; to: [number, number]; }
export interface BTFrame {
  nodes: LNode[];
  edges: LEdge[];
  active?: number;
  hiKey?: { node: number; key: number };
  found?: boolean;
  status: string;
  done?: boolean;
}

const T = 2; // minimum degree → max keys = 2T-1 = 3
let idc = 1;
const newNode = (): BTNode => ({ id: idc++, keys: [], children: [] });
const isLeaf = (n: BTNode) => n.children.length === 0;
const clone = (n: BTNode): BTNode => ({ id: n.id, keys: [...n.keys], children: n.children.map(clone) });

export function buildBTree(vals: number[]): BTNode {
  let root = newNode();
  for (const v of vals) root = insertWithFrames(root, v).root;
  return root;
}

/** Layout: leaves get sequential x, internal nodes centre over their children. */
export function layout(root: BTNode): { nodes: LNode[]; edges: LEdge[] } {
  const nodes: LNode[] = [];
  const edges: LEdge[] = [];
  const pos = new Map<number, [number, number]>();
  let leafX = 0;
  let maxDepth = 0;
  function place(n: BTNode, depth: number): number {
    maxDepth = Math.max(maxDepth, depth);
    let x: number;
    if (isLeaf(n)) x = leafX++;
    else {
      const xs = n.children.map((c) => place(c, depth + 1));
      x = (xs[0] + xs[xs.length - 1]) / 2;
    }
    pos.set(n.id, [x, depth]);
    return x;
  }
  place(root, 0);
  const maxX = Math.max(1, leafX - 1);
  const gapY = maxDepth > 0 ? 80 / maxDepth : 40;
  function emit(n: BTNode) {
    const [rx, d] = pos.get(n.id)!;
    const x = 10 + (rx / maxX) * 80;
    const y = 12 + d * gapY;
    pos.set(n.id, [x, y]);
    nodes.push({ id: n.id, keys: n.keys, x, y });
    n.children.forEach(emit);
  }
  emit(root);
  function edge(n: BTNode) {
    const p = pos.get(n.id)!;
    for (const c of n.children) { edges.push({ from: p, to: pos.get(c.id)! }); edge(c); }
  }
  edge(root);
  return { nodes, edges };
}

function frameOf(root: BTNode, extra: Partial<BTFrame>, status: string): BTFrame {
  const { nodes, edges } = layout(root);
  return { nodes, edges, status, ...extra };
}

function splitChild(parent: BTNode, i: number) {
  const y = parent.children[i];
  const z = newNode();
  z.keys = y.keys.splice(T); // keys after the median
  const median = y.keys.splice(T - 1, 1)[0];
  if (!isLeaf(y)) z.children = y.children.splice(T);
  parent.keys.splice(i, 0, median);
  parent.children.splice(i + 1, 0, z);
}

// The layout snapshots always need the true root; track it while descending.
let currentRoot: BTNode | null = null;

export function insertWithFrames(root: BTNode, k: number): { root: BTNode; frames: BTFrame[] } {
  const frames: BTFrame[] = [];
  if (root.keys.length === 2 * T - 1) {
    const s = newNode();
    s.children.push(root);
    currentRoot = s;
    frames.push(frameOf(s, { active: root.id }, `Root is full → split it (the tree grows one level taller).`));
    splitChild(s, 0);
    frames.push(frameOf(s, {}, `Median key promoted to a new root.`));
    root = s;
  }
  currentRoot = root;
  insertNonFull(root, k, frames);
  frames.push(frameOf(root, { done: true }, `Inserted ${k}. The tree stays balanced.`));
  return { root, frames };
}

function insertNonFull(n: BTNode, k: number, frames: BTFrame[]) {
  if (isLeaf(n)) {
    let i = n.keys.length - 1;
    while (i >= 0 && k < n.keys[i]) i--;
    n.keys.splice(i + 1, 0, k);
    return;
  }
  let i = n.keys.length - 1;
  while (i >= 0 && k < n.keys[i]) i--;
  i++;
  frames.push(frameOf(currentRoot!, { active: n.children[i].id }, `Descend into the child that will hold ${k}.`));
  if (n.children[i].keys.length === 2 * T - 1) {
    splitChild(n, i);
    frames.push(frameOf(currentRoot!, { active: n.id }, `Child was full → split it before descending (proactive split).`));
    if (k > n.keys[i]) i++;
  }
  insertNonFull(n.children[i], k, frames);
}

export function searchFrames(root: BTNode, k: number): BTFrame[] {
  const frames: BTFrame[] = [];
  let n: BTNode | null = root;
  while (n) {
    let i = 0;
    while (i < n.keys.length && k > n.keys[i]) i++;
    if (i < n.keys.length && n.keys[i] === k) {
      frames.push(frameOf(root, { active: n.id, hiKey: { node: n.id, key: k }, found: true, done: true }, `Found ${k}! B-tree search is O(log n) with few disk reads.`));
      return frames;
    }
    if (isLeaf(n)) {
      frames.push(frameOf(root, { active: n.id, done: true }, `${k} not found — reached a leaf.`));
      return frames;
    }
    frames.push(frameOf(root, { active: n.id }, `Scan node keys [${n.keys.join(', ')}] → follow child ${i} (keys ${i === 0 ? '<' : 'between'} ${n.keys[i] ?? '∞'}).`));
    n = n.children[i];
  }
  return frames;
}
