/** Binary search tree with frame generators for insert/search/delete + traversals. */
export interface BNode { id: number; val: number; left: BNode | null; right: BNode | null; }
export interface LayoutNode { id: number; val: number; x: number; y: number; }
export interface LayoutEdge { from: [number, number]; to: [number, number]; }
export interface BSTFrame {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  active?: number;
  path: number[];
  visited: number[];
  found?: boolean;
  status: string;
  done?: boolean;
}

let idc = 1;
export function makeNode(val: number): BNode { return { id: idc++, val, left: null, right: null }; }

export function insertNode(root: BNode | null, val: number): BNode {
  if (!root) return makeNode(val);
  if (val < root.val) root.left = insertNode(root.left, val);
  else if (val > root.val) root.right = insertNode(root.right, val);
  return root;
}

export function buildBST(vals: number[]): BNode | null {
  let root: BNode | null = null;
  for (const v of vals) root = insertNode(root, v);
  return root;
}

/** Assign x by in-order index and y by depth, then return a flat layout. */
export function layout(root: BNode | null): { nodes: LayoutNode[]; edges: LayoutEdge[]; pos: Map<number, [number, number]> } {
  const nodes: LayoutNode[] = [];
  const pos = new Map<number, [number, number]>();
  let col = 0;
  const maxDepth = height(root);
  const gapY = maxDepth > 1 ? 84 / maxDepth : 42;
  function walk(n: BNode | null, depth: number) {
    if (!n) return;
    walk(n.left, depth + 1);
    const x = col++;
    const y = 10 + depth * gapY;
    pos.set(n.id, [x, y]);
    nodes.push({ id: n.id, val: n.val, x, y });
    walk(n.right, depth + 1);
  }
  walk(root, 0);
  // normalise x into 8..92 range
  const cols = Math.max(1, col - 1);
  for (const n of nodes) {
    const nx = 8 + (n.x / (cols || 1)) * 84;
    pos.set(n.id, [nx, n.y]);
    n.x = nx;
  }
  const edges: LayoutEdge[] = [];
  function edgeWalk(n: BNode | null) {
    if (!n) return;
    const p = pos.get(n.id)!;
    if (n.left) { edges.push({ from: p, to: pos.get(n.left.id)! }); edgeWalk(n.left); }
    if (n.right) { edges.push({ from: p, to: pos.get(n.right.id)! }); edgeWalk(n.right); }
  }
  edgeWalk(root);
  return { nodes, edges, pos };
}

function height(n: BNode | null): number { return n ? 1 + Math.max(height(n.left), height(n.right)) : 0; }
function clone(n: BNode | null): BNode | null { return n ? { id: n.id, val: n.val, left: clone(n.left), right: clone(n.right) } : null; }

function frameOf(root: BNode | null, extra: Partial<BSTFrame>, status: string): BSTFrame {
  const { nodes, edges } = layout(root);
  return { nodes, edges, path: [], visited: [], status, ...extra };
}

export function insertFrames(root: BNode | null, val: number): { frames: BSTFrame[]; root: BNode | null } {
  const frames: BSTFrame[] = [];
  const path: number[] = [];
  if (!root) {
    const nr = makeNode(val);
    frames.push(frameOf(nr, { active: nr.id, path: [nr.id] }, `Tree empty → ${val} becomes the root.`));
    frames[frames.length - 1].done = true;
    return { frames, root: nr };
  }
  let cur: BNode | null = root;
  while (cur) {
    path.push(cur.id);
    frames.push(frameOf(root, { active: cur.id, path: [...path] }, `Compare ${val} with ${cur.val}: ${val < cur.val ? 'go left' : val > cur.val ? 'go right' : 'already present'}.`));
    if (val === cur.val) { frames[frames.length - 1].done = true; frames[frames.length - 1].status = `${val} already in the tree — no duplicates inserted.`; return { frames, root }; }
    cur = val < cur.val ? cur.left : cur.right;
  }
  const newRoot = clone(root)!;
  insertNode(newRoot, val);
  const inserted = findNode(newRoot, val);
  frames.push(frameOf(newRoot, { active: inserted?.id, path: [...path, inserted!.id], visited: [inserted!.id] }, `Reached an empty spot → insert ${val} as a leaf.`));
  frames[frames.length - 1].done = true;
  return { frames, root: newRoot };
}

export function searchFrames(root: BNode | null, val: number): BSTFrame[] {
  const frames: BSTFrame[] = [];
  const path: number[] = [];
  let cur = root;
  while (cur) {
    path.push(cur.id);
    if (val === cur.val) {
      frames.push(frameOf(root, { active: cur.id, path: [...path], visited: [cur.id], found: true }, `Found ${val}! O(h) — h = tree height.`));
      frames[frames.length - 1].done = true;
      return frames;
    }
    frames.push(frameOf(root, { active: cur.id, path: [...path] }, `Compare ${val} with ${cur.val}: go ${val < cur.val ? 'left' : 'right'}.`));
    cur = val < cur.val ? cur.left : cur.right;
  }
  frames.push(frameOf(root, { path: [...path], status: '' } as any, `${val} not found — fell off the tree.`));
  frames[frames.length - 1].done = true;
  return frames;
}

export function traversalFrames(root: BNode | null, kind: 'in' | 'pre' | 'post' | 'level'): BSTFrame[] {
  const frames: BSTFrame[] = [];
  const order: number[] = [];
  const names = { in: 'In-order (L, Root, R)', pre: 'Pre-order (Root, L, R)', post: 'Post-order (L, R, Root)', level: 'Level-order (BFS)' };
  frames.push(frameOf(root, {}, `${names[kind]} traversal.`));
  const visit = (n: BNode) => {
    order.push(n.id);
    frames.push(frameOf(root, { active: n.id, visited: [...order] }, `Visit ${n.val}. Sequence: ${order.map((id) => findById(root, id)!.val).join(', ')}.`));
  };
  if (kind === 'level') {
    const q: BNode[] = root ? [root] : [];
    while (q.length) { const n = q.shift()!; visit(n); if (n.left) q.push(n.left); if (n.right) q.push(n.right); }
  } else {
    const rec = (n: BNode | null) => {
      if (!n) return;
      if (kind === 'pre') visit(n);
      rec(n.left);
      if (kind === 'in') visit(n);
      rec(n.right);
      if (kind === 'post') visit(n);
    };
    rec(root);
  }
  const last = frames[frames.length - 1];
  last.done = true;
  return frames;
}

function findNode(n: BNode | null, val: number): BNode | null { return !n ? null : n.val === val ? n : findNode(val < n.val ? n.left : n.right, val); }
function findById(n: BNode | null, id: number): BNode | null { if (!n) return null; if (n.id === id) return n; return findById(n.left, id) || findById(n.right, id); }

export function deleteFrames(root: BNode | null, val: number): { frames: BSTFrame[]; root: BNode | null } {
  const frames: BSTFrame[] = [];
  const path: number[] = [];
  let cur = root;
  while (cur && cur.val !== val) {
    path.push(cur.id);
    frames.push(frameOf(root, { active: cur.id, path: [...path] }, `Locate ${val}: compare with ${cur.val}, go ${val < cur.val ? 'left' : 'right'}.`));
    cur = val < cur.val ? cur.left : cur.right;
  }
  if (!cur) {
    frames.push(frameOf(root, { path }, `${val} not in tree — nothing to delete.`));
    frames[frames.length - 1].done = true;
    return { frames, root };
  }
  path.push(cur.id);
  const kids = (cur.left ? 1 : 0) + (cur.right ? 1 : 0);
  frames.push(frameOf(root, { active: cur.id, path: [...path], found: true }, `Found ${val} (${kids === 0 ? 'leaf' : kids === 1 ? 'one child' : 'two children'} case).`));
  const newRoot = clone(root);
  const removed = removeNode(newRoot, val);
  frames.push(frameOf(removed, {}, kids === 2 ? `Two children → replace with in-order successor, then delete it.` : `Removed ${val}; relink child pointer.`));
  frames[frames.length - 1].done = true;
  return { frames, root: removed };
}

function removeNode(n: BNode | null, val: number): BNode | null {
  if (!n) return null;
  if (val < n.val) n.left = removeNode(n.left, val);
  else if (val > n.val) n.right = removeNode(n.right, val);
  else {
    if (!n.left) return n.right;
    if (!n.right) return n.left;
    let succ = n.right; while (succ.left) succ = succ.left;
    n.val = succ.val; n.id = succ.id; // adopt successor identity for stable layout
    n.right = removeNode(n.right, succ.val);
  }
  return n;
}
