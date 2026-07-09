/** Graph model + traversal frame generators (BFS, DFS, topological sort). */
export interface GNode { id: number; x: number; y: number; }
export interface GEdge { u: number; v: number; w?: number; }
export interface Graph { nodes: GNode[]; edges: GEdge[]; directed: boolean; }

export interface GraphFrame {
  visited: number[];
  frontier: number[]; // queue (BFS) or stack (DFS) contents
  current?: number;
  activeEdge?: [number, number];
  order: number[]; // visitation / topo order so far
  status: string;
  done?: boolean;
}

export function adjacency(g: Graph): Map<number, number[]> {
  const adj = new Map<number, number[]>();
  g.nodes.forEach((n) => adj.set(n.id, []));
  for (const e of g.edges) {
    adj.get(e.u)?.push(e.v);
    if (!g.directed) adj.get(e.v)?.push(e.u);
  }
  for (const [, list] of adj) list.sort((a, b) => a - b);
  return adj;
}

export function bfs(g: Graph, start: number): GraphFrame[] {
  const adj = adjacency(g);
  const visited: number[] = [];
  const order: number[] = [];
  const queue: number[] = [start];
  const inQueue = new Set([start]);
  const frames: GraphFrame[] = [{ visited: [], frontier: [...queue], order: [], status: `BFS from ${start}: enqueue the start node.` }];
  while (queue.length) {
    const curr = queue.shift()!;
    inQueue.delete(curr);
    if (visited.includes(curr)) continue;
    visited.push(curr); order.push(curr);
    frames.push({ visited: [...visited], frontier: [...queue], current: curr, order: [...order], status: `Dequeue ${curr}, mark visited.` });
    for (const nb of adj.get(curr) ?? []) {
      if (!visited.includes(nb) && !inQueue.has(nb)) {
        queue.push(nb); inQueue.add(nb);
        frames.push({ visited: [...visited], frontier: [...queue], current: curr, activeEdge: [curr, nb], order: [...order], status: `Neighbour ${nb} unvisited → enqueue.` });
      }
    }
  }
  frames.push({ visited: [...visited], frontier: [], order: [...order], status: `BFS complete. Order: ${order.join(' → ')}.`, done: true });
  return frames;
}

export function dfs(g: Graph, start: number): GraphFrame[] {
  const adj = adjacency(g);
  const visited: number[] = [];
  const order: number[] = [];
  const stack: number[] = [start];
  const frames: GraphFrame[] = [{ visited: [], frontier: [...stack], order: [], status: `DFS from ${start}: push the start node.` }];
  while (stack.length) {
    const curr = stack.pop()!;
    if (visited.includes(curr)) {
      frames.push({ visited: [...visited], frontier: [...stack], order: [...order], status: `Pop ${curr} — already visited, skip.` });
      continue;
    }
    visited.push(curr); order.push(curr);
    frames.push({ visited: [...visited], frontier: [...stack], current: curr, order: [...order], status: `Pop ${curr}, mark visited.` });
    const nbs = [...(adj.get(curr) ?? [])].reverse(); // reverse so smallest is explored first
    for (const nb of nbs) {
      if (!visited.includes(nb)) {
        stack.push(nb);
        frames.push({ visited: [...visited], frontier: [...stack], current: curr, activeEdge: [curr, nb], order: [...order], status: `Push unvisited neighbour ${nb}.` });
      }
    }
  }
  frames.push({ visited: [...visited], frontier: [], order: [...order], status: `DFS complete. Order: ${order.join(' → ')}.`, done: true });
  return frames;
}

export function topoSort(g: Graph): GraphFrame[] {
  // Kahn's algorithm (BFS-based on in-degree). Requires a directed graph.
  const adj = adjacency({ ...g, directed: true });
  const indeg = new Map<number, number>();
  g.nodes.forEach((n) => indeg.set(n.id, 0));
  for (const e of g.edges) indeg.set(e.v, (indeg.get(e.v) ?? 0) + 1);
  const queue = g.nodes.filter((n) => (indeg.get(n.id) ?? 0) === 0).map((n) => n.id).sort((a, b) => a - b);
  const order: number[] = [];
  const frames: GraphFrame[] = [{ visited: [], frontier: [...queue], order: [], status: `Kahn's algorithm: enqueue all in-degree-0 nodes (${queue.join(', ') || 'none'}).` }];
  while (queue.length) {
    const curr = queue.shift()!;
    order.push(curr);
    frames.push({ visited: [...order], frontier: [...queue], current: curr, order: [...order], status: `Output ${curr}; remove its outgoing edges.` });
    for (const nb of adj.get(curr) ?? []) {
      indeg.set(nb, (indeg.get(nb) ?? 0) - 1);
      if (indeg.get(nb) === 0) {
        queue.push(nb);
        frames.push({ visited: [...order], frontier: [...queue], current: curr, activeEdge: [curr, nb], order: [...order], status: `${nb} now has in-degree 0 → enqueue.` });
      }
    }
  }
  const done = order.length === g.nodes.length;
  frames.push({ visited: [...order], frontier: [], order: [...order], status: done ? `Topological order: ${order.join(' → ')}.` : 'A cycle exists — no valid topological order (not all nodes reached in-degree 0).', done: true });
  return frames;
}

export function sampleGraph(directed = false): Graph {
  // A tidy 6-node graph laid out on a 100×100 canvas.
  return {
    directed,
    nodes: [
      { id: 0, x: 18, y: 22 }, { id: 1, x: 50, y: 14 }, { id: 2, x: 82, y: 26 },
      { id: 3, x: 24, y: 72 }, { id: 4, x: 56, y: 78 }, { id: 5, x: 86, y: 66 },
    ],
    edges: [
      { u: 0, v: 1 }, { u: 0, v: 3 }, { u: 1, v: 2 }, { u: 1, v: 4 },
      { u: 2, v: 5 }, { u: 3, v: 4 }, { u: 4, v: 5 },
    ],
  };
}
