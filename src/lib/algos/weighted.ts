/** Weighted-graph models + frame generators: Kruskal, Prim, Dijkstra, Bellman-Ford. */
export interface WNode { id: number; x: number; y: number; }
export interface WEdge { u: number; v: number; w: number; }
export interface WGraph { nodes: WNode[]; edges: WEdge[]; directed: boolean; }

export interface WFrame {
  edges: { u: number; v: number; w: number; cls: string }[];
  nodes: Record<number, { cls: string; label?: string }>;
  status: string;
  side?: string;
  done?: boolean;
}

export function wSample(): WGraph {
  return {
    directed: false,
    nodes: [
      { id: 0, x: 15, y: 25 }, { id: 1, x: 50, y: 15 }, { id: 2, x: 85, y: 28 },
      { id: 3, x: 22, y: 75 }, { id: 4, x: 55, y: 72 }, { id: 5, x: 88, y: 68 },
    ],
    edges: [
      { u: 0, v: 1, w: 4 }, { u: 0, v: 3, w: 3 }, { u: 1, v: 2, w: 5 }, { u: 1, v: 4, w: 2 },
      { u: 2, v: 5, w: 6 }, { u: 3, v: 4, w: 7 }, { u: 4, v: 5, w: 1 }, { u: 1, v: 3, w: 6 },
    ],
  };
}

export function bfSample(): WGraph {
  return {
    directed: true,
    nodes: [
      { id: 0, x: 12, y: 50 }, { id: 1, x: 40, y: 20 }, { id: 2, x: 40, y: 80 },
      { id: 3, x: 72, y: 25 }, { id: 4, x: 72, y: 75 },
    ],
    edges: [
      { u: 0, v: 1, w: 6 }, { u: 0, v: 2, w: 7 }, { u: 1, v: 2, w: 8 }, { u: 1, v: 3, w: 5 },
      { u: 1, v: 4, w: -4 }, { u: 2, v: 3, w: -3 }, { u: 2, v: 4, w: 9 }, { u: 3, v: 1, w: -2 },
      { u: 4, v: 0, w: 2 }, { u: 4, v: 3, w: 7 },
    ],
  };
}

const baseEdges = (g: WGraph, cls = '') => g.edges.map((e) => ({ ...e, w: e.w, cls }));

// ---------------------------------------------------------------- Kruskal ---
export function kruskal(g: WGraph): WFrame[] {
  const parent = g.nodes.map((n) => n.id);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const sorted = [...g.edges].sort((a, b) => a.w - b.w);
  const chosen = new Set<string>();
  const frames: WFrame[] = [];
  const key = (e: WEdge) => `${e.u}-${e.v}`;
  let total = 0;
  frames.push({ edges: baseEdges(g), nodes: {}, status: `Kruskal: sort edges by weight, add the lightest that doesn't form a cycle.`, side: `Sorted: ${sorted.map((e) => e.w).join(', ')}` });
  for (const e of sorted) {
    const ecls = (extra: string) => g.edges.map((x) => ({ ...x, cls: chosen.has(key(x)) ? 'tree' : x === e ? extra : '' }));
    frames.push({ edges: ecls('active'), nodes: {}, status: `Consider edge ${e.u}–${e.v} (w=${e.w}).`, side: `MST weight so far: ${total}` });
    if (find(e.u) !== find(e.v)) {
      parent[find(e.u)] = find(e.v);
      chosen.add(key(e)); total += e.w;
      frames.push({ edges: g.edges.map((x) => ({ ...x, cls: chosen.has(key(x)) ? 'tree' : '' })), nodes: {}, status: `Endpoints in different components → add to MST.`, side: `MST weight so far: ${total}` });
    } else {
      frames.push({ edges: ecls('rejected'), nodes: {}, status: `Same component → would form a cycle, reject.`, side: `MST weight so far: ${total}` });
    }
  }
  frames.push({ edges: g.edges.map((x) => ({ ...x, cls: chosen.has(key(x)) ? 'tree' : '' })), nodes: {}, status: `MST complete. Total weight = ${total}.`, side: `MST weight: ${total}`, done: true });
  return frames;
}

// ------------------------------------------------------------------- Prim ---
export function prim(g: WGraph, start = 0): WFrame[] {
  const inTree = new Set<number>([start]);
  const chosen: WEdge[] = [];
  const frames: WFrame[] = [];
  let total = 0;
  const nodeMap = () => Object.fromEntries(g.nodes.map((n) => [n.id, { cls: inTree.has(n.id) ? 'visited' : '' }]));
  frames.push({ edges: baseEdges(g), nodes: nodeMap(), status: `Prim from ${start}: grow the tree by the cheapest edge leaving it.` });
  while (inTree.size < g.nodes.length) {
    // candidate edges crossing the cut
    const cands = g.edges.filter((e) => (inTree.has(e.u) !== inTree.has(e.v)));
    if (!cands.length) break;
    const best = cands.reduce((a, b) => (b.w < a.w ? b : a));
    const setChosen = (extra: string, be: WEdge | null) => g.edges.map((x) => ({ ...x, cls: chosen.includes(x) ? 'tree' : x === be ? extra : (inTree.has(x.u) !== inTree.has(x.v)) ? 'candidate' : '' }));
    frames.push({ edges: setChosen('active', best), nodes: nodeMap(), status: `Cheapest crossing edge: ${best.u}–${best.v} (w=${best.w}).`, side: `Tree weight: ${total}` });
    chosen.push(best); total += best.w;
    inTree.add(inTree.has(best.u) ? best.v : best.u);
    frames.push({ edges: g.edges.map((x) => ({ ...x, cls: chosen.includes(x) ? 'tree' : '' })), nodes: nodeMap(), status: `Add ${best.u}–${best.v}; node ${inTree.has(best.u) ? best.v : best.u} joins the tree.`, side: `Tree weight: ${total}` });
  }
  frames.push({ edges: g.edges.map((x) => ({ ...x, cls: chosen.includes(x) ? 'tree' : '' })), nodes: nodeMap(), status: `MST complete. Total weight = ${total}.`, side: `MST weight: ${total}`, done: true });
  return frames;
}

// --------------------------------------------------------------- Dijkstra ---
export function dijkstra(g: WGraph, start = 0): WFrame[] {
  const INF = Infinity;
  const dist: Record<number, number> = {};
  const done = new Set<number>();
  g.nodes.forEach((n) => (dist[n.id] = INF));
  dist[start] = 0;
  const adj = new Map<number, { to: number; w: number }[]>();
  g.nodes.forEach((n) => adj.set(n.id, []));
  for (const e of g.edges) { adj.get(e.u)!.push({ to: e.v, w: e.w }); if (!g.directed) adj.get(e.v)!.push({ to: e.u, w: e.w }); }
  const frames: WFrame[] = [];
  const label = (id: number) => (dist[id] === INF ? '∞' : String(dist[id]));
  const nodeMap = (cur?: number, relax?: number) => Object.fromEntries(g.nodes.map((n) => [n.id, { cls: n.id === cur ? 'current' : done.has(n.id) ? 'visited' : n.id === relax ? 'frontier' : '', label: label(n.id) }]));
  frames.push({ edges: baseEdges(g), nodes: nodeMap(), status: `Dijkstra from ${start}: all distances ∞ except the source (0).` });
  while (done.size < g.nodes.length) {
    let u = -1, best = INF;
    for (const n of g.nodes) if (!done.has(n.id) && dist[n.id] < best) { best = dist[n.id]; u = n.id; }
    if (u === -1) break;
    done.add(u);
    frames.push({ edges: baseEdges(g), nodes: nodeMap(u), status: `Pick nearest unsettled node ${u} (dist ${label(u)}); settle it.` });
    for (const { to, w } of adj.get(u)!) {
      if (done.has(to)) continue;
      const nd = dist[u] + w;
      const eActive = g.edges.map((e) => ({ ...e, cls: (e.u === u && e.v === to) || (!g.directed && e.v === u && e.u === to) ? 'active' : '' }));
      if (nd < dist[to]) {
        dist[to] = nd;
        frames.push({ edges: eActive, nodes: nodeMap(u, to), status: `Relax ${u}→${to}: ${label(u)}+${w} = ${nd} < old → update.` });
      } else {
        frames.push({ edges: eActive, nodes: nodeMap(u, to), status: `Edge ${u}→${to}: ${dist[u]}+${w} ≥ ${label(to)} → no update.` });
      }
    }
  }
  frames.push({ edges: baseEdges(g), nodes: nodeMap(), status: `Done. Shortest distances from ${start} shown on each node.`, done: true });
  return frames;
}

// ------------------------------------------------------------ Bellman-Ford ---
export function bellmanFord(g: WGraph, start = 0): WFrame[] {
  const INF = Infinity;
  const dist: Record<number, number> = {};
  g.nodes.forEach((n) => (dist[n.id] = INF));
  dist[start] = 0;
  const frames: WFrame[] = [];
  const label = (id: number) => (dist[id] === INF ? '∞' : String(dist[id]));
  const nodeMap = (relax?: [number, number]) => Object.fromEntries(g.nodes.map((n) => [n.id, { cls: relax && n.id === relax[1] ? 'frontier' : relax && n.id === relax[0] ? 'current' : '', label: label(n.id) }]));
  frames.push({ edges: baseEdges(g), nodes: nodeMap(), status: `Bellman-Ford from ${start}: relax every edge, |V|−1 = ${g.nodes.length - 1} rounds.` });
  for (let round = 1; round < g.nodes.length; round++) {
    let changed = false;
    frames.push({ edges: baseEdges(g), nodes: nodeMap(), status: `— Round ${round} of ${g.nodes.length - 1} —` });
    for (const e of g.edges) {
      const eActive = g.edges.map((x) => ({ ...x, cls: x === e ? 'active' : '' }));
      if (dist[e.u] !== INF && dist[e.u] + e.w < dist[e.v]) {
        dist[e.v] = dist[e.u] + e.w; changed = true;
        frames.push({ edges: eActive, nodes: nodeMap([e.u, e.v]), status: `Relax ${e.u}→${e.v} (w=${e.w}): update dist[${e.v}] = ${label(e.v)}.` });
      }
    }
    if (!changed) { frames.push({ edges: baseEdges(g), nodes: nodeMap(), status: `No changes in round ${round} → distances stable, stop early.` }); break; }
  }
  frames.push({ edges: baseEdges(g), nodes: nodeMap(), status: `Done. Shortest distances (handles negative edges).`, done: true });
  return frames;
}
