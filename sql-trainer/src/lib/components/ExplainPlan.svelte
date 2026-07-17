<script lang="ts">
  import type { StatementResult } from '../db/databaseWorker';

  let { result }: { result: StatementResult } = $props();

  // EXPLAIN QUERY PLAN rows: (id, parent, notused, detail)
  interface Node {
    id: number;
    detail: string;
    children: Node[];
  }

  const tree = $derived.by(() => {
    const nodes = new Map<number, Node>();
    const roots: Node[] = [];
    for (const row of result.rows) {
      const [id, parent, , detail] = row as [number, number, number, string];
      const node: Node = { id, detail, children: [] };
      nodes.set(id, node);
      const p = nodes.get(parent);
      if (p) p.children.push(node);
      else roots.push(node);
    }
    return roots;
  });

  function classify(detail: string): { label: string; cls: string } {
    if (/USING INDEX|USING COVERING INDEX/i.test(detail)) return { label: 'INDEX SEARCH', cls: 'good' };
    if (/USING INTEGER PRIMARY KEY/i.test(detail)) return { label: 'PK LOOKUP', cls: 'good' };
    if (/^SCAN/i.test(detail)) return { label: 'FULL TABLE SCAN', cls: 'bad' };
    if (/^SEARCH/i.test(detail)) return { label: 'SEARCH', cls: 'good' };
    if (/USE TEMP B-TREE/i.test(detail)) return { label: 'TEMP B-TREE (sort)', cls: 'warn' };
    if (/SCALAR SUBQUERY|CORRELATED/i.test(detail)) return { label: 'SUBQUERY', cls: 'warn' };
    if (/CO-ROUTINE|MATERIALIZE/i.test(detail)) return { label: 'CTE / DERIVED', cls: 'neutral' };
    if (/COMPOUND/i.test(detail)) return { label: 'SET OPERATION', cls: 'neutral' };
    return { label: 'STEP', cls: 'neutral' };
  }
</script>

{#snippet nodeView(node: { id: number; detail: string; children: any[] }, depth: number)}
  <div class="node" style={`margin-left:${depth * 1.4}rem`}>
    <span class="tag {classify(node.detail).cls}">{classify(node.detail).label}</span>
    <code>{node.detail}</code>
  </div>
  {#each node.children as child}
    {@render nodeView(child, depth + 1)}
  {/each}
{/snippet}

<div class="plan panel">
  <div class="head">
    SQLite execution plan <span class="muted">(EXPLAIN QUERY PLAN — MySQL's EXPLAIN output differs; concepts transfer, details don't)</span>
  </div>
  {#each tree as root}
    {@render nodeView(root, 0)}
  {/each}
</div>

<style>
  .plan {
    padding: 0.7rem 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .head {
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 0.2rem;
  }
  .node {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    font-size: 0.83rem;
  }
  .tag {
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.08rem 0.45rem;
    border-radius: 999px;
    white-space: nowrap;
  }
  .tag.good { background: var(--good-soft); color: var(--good); }
  .tag.bad { background: var(--bad-soft); color: var(--bad); }
  .tag.warn { background: var(--warn-soft); color: var(--warn); }
  .tag.neutral { background: var(--panel-2); color: var(--muted); }
  code {
    background: transparent;
    border: none;
    padding: 0;
  }
</style>
