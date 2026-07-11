/**
 * Highlighter pen — select text on any page, pick a colour, and it's saved.
 *
 * Highlights are anchored by character offsets into the *stable* text of the
 * page's <main> element. Dynamic/interactive regions (visualizer islands,
 * header/footer, form controls, injected copy buttons) are excluded from the
 * offset stream so anchors stay valid across reloads even as those regions
 * hydrate or change. Highlights persist in localStorage keyed by pathname and
 * are re-applied on load.
 */

type Tool = null | 'yellow' | 'green' | 'pink' | 'blue' | 'eraser';
interface Hl { id: string; start: number; end: number; color: string }

// Subtrees whose text must NOT be counted (unstable or non-content).
const EXCLUDE =
  'astro-island, svg, canvas, .site-header, .site-footer, #hl-toolbar, script, style, .copy-btn, select, input, textarea, button, [data-hl-skip]';

function getRoot(): HTMLElement | null {
  return document.getElementById('main');
}
function storageKey(): string {
  return 'hl:' + location.pathname.replace(/\/+$/, '');
}
function load(): Hl[] {
  try { return JSON.parse(localStorage.getItem(storageKey()) || '[]'); } catch { return []; }
}
function saveList(list: Hl[]): void {
  try { localStorage.setItem(storageKey(), JSON.stringify(list)); } catch {}
}
function uid(): string {
  return 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** Ordered stable text nodes under the root (excluded subtrees skipped). */
function collectTextNodes(root: HTMLElement): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const t = n as Text;
      if (!t.nodeValue) return NodeFilter.FILTER_REJECT;
      const p = t.parentElement;
      if (!p || p.closest(EXCLUDE)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = walker.nextNode())) nodes.push(n as Text);
  return nodes;
}

/** Map a DOM boundary point to a global character offset in the stable stream. */
function pointToOffset(root: HTMLElement, container: Node, off: number): number | null {
  const nodes = collectTextNodes(root);
  let total = 0;
  for (const n of nodes) {
    if (n === container) return total + off;
    total += n.nodeValue!.length;
  }
  // Element container fallback: approximate to the start of the point.
  let pr: Range;
  try { pr = document.createRange(); pr.setStart(container, off); pr.collapse(true); } catch { return null; }
  total = 0;
  for (const n of nodes) {
    try {
      if (pr.comparePoint(n, 0) === 1) return total; // node starts after the point
    } catch { /* different roots */ }
    total += n.nodeValue!.length;
  }
  return total;
}

/** Wrap the [start,end) character range in <mark> elements. */
function applyRange(root: HTMLElement, start: number, end: number, color: string, id: string): void {
  const nodes = collectTextNodes(root);
  const jobs: { n: Text; s: number; e: number }[] = [];
  let pos = 0;
  for (const n of nodes) {
    const len = n.nodeValue!.length;
    const ns = pos, ne = pos + len;
    if (ne > start && ns < end) {
      const s = Math.max(start, ns) - ns;
      const e = Math.min(end, ne) - ns;
      if (e > s && !(n.parentElement && n.parentElement.closest('.hl'))) jobs.push({ n, s, e });
    }
    pos = ne;
    if (ns >= end) break;
  }
  for (const { n, s, e } of jobs) {
    n.splitText(e);
    const target = s > 0 ? n.splitText(s) : n;
    const mark = document.createElement('mark');
    mark.className = 'hl hl-' + color;
    mark.dataset.hlId = id;
    target.parentNode!.insertBefore(mark, target);
    mark.appendChild(target);
  }
}

/** Remove all highlight <mark>s, restoring clean text. */
function clearMarks(root: HTMLElement): void {
  root.querySelectorAll('mark.hl').forEach((m) => {
    const p = m.parentNode!;
    while (m.firstChild) p.insertBefore(m.firstChild, m);
    p.removeChild(m);
  });
  root.normalize();
}

let onCountChange: (n: number) => void = () => {};

function renderAll(): void {
  const root = getRoot();
  if (!root) return;
  clearMarks(root);
  const list = load().slice().sort((a, b) => a.start - b.start);
  for (const h of list) {
    try { applyRange(root, h.start, h.end, h.color, h.id); } catch {}
  }
  onCountChange(list.length);
}

export function setupHighlighter(): void {
  const root = getRoot();
  const toolbar = document.getElementById('hl-toolbar');
  if (!root || !toolbar) return;

  const fab = document.getElementById('hl-fab')!;
  const menu = document.getElementById('hl-menu')!;
  const countEl = document.getElementById('hl-count');
  const hint = document.getElementById('hl-hint')!;
  let active: Tool = null;

  onCountChange = (n) => { if (countEl) countEl.textContent = String(n); };

  function setActive(tool: Tool) {
    active = tool;
    toolbar.querySelectorAll('.hl-color, .hl-tool').forEach((b) =>
      b.classList.toggle('sel', (b as HTMLElement).dataset.tool === tool || (b as HTMLElement).dataset.color === tool)
    );
    const armed = active !== null;
    toolbar.classList.toggle('armed', armed);
    document.body.classList.toggle('hl-erasing', active === 'eraser');
    hint.textContent = active === 'eraser' ? 'Click a highlight to erase it' : armed ? 'Select text to highlight' : '';
    fab.setAttribute('aria-pressed', String(armed));
  }

  fab.addEventListener('click', () => {
    const open = menu.hasAttribute('hidden');
    if (open) menu.removeAttribute('hidden'); else menu.setAttribute('hidden', '');
    fab.setAttribute('aria-expanded', String(open));
  });

  toolbar.querySelectorAll('.hl-color').forEach((btn) => {
    btn.addEventListener('click', () => {
      const c = (btn as HTMLElement).dataset.color as Tool;
      setActive(active === c ? null : c);
    });
  });
  document.getElementById('hl-eraser')?.addEventListener('click', () => setActive(active === 'eraser' ? null : 'eraser'));
  document.getElementById('hl-clear')?.addEventListener('click', () => {
    if (!load().length) return;
    if (confirm('Remove all highlights on this page?')) { saveList([]); renderAll(); }
  });

  // Apply a highlight when text is selected while a colour is armed.
  function onSelect() {
    if (!active || active === 'eraser') return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!root!.contains(range.commonAncestorContainer)) return;
    if ((range.startContainer.parentElement || range.startContainer as Element as any)?.closest?.(EXCLUDE)) return;
    const a = pointToOffset(root!, range.startContainer, range.startOffset);
    const b = pointToOffset(root!, range.endContainer, range.endOffset);
    if (a == null || b == null || a === b) return;
    const list = load();
    list.push({ id: uid(), start: Math.min(a, b), end: Math.max(a, b), color: active });
    saveList(list);
    sel.removeAllRanges();
    renderAll();
  }
  document.addEventListener('mouseup', () => setTimeout(onSelect, 0));
  document.addEventListener('touchend', () => setTimeout(onSelect, 0));

  // Eraser: click a highlight to remove it.
  root.addEventListener('click', (e) => {
    const mark = (e.target as HTMLElement).closest('.hl') as HTMLElement | null;
    if (!mark || active !== 'eraser') return;
    const id = mark.dataset.hlId;
    saveList(load().filter((h) => h.id !== id));
    renderAll();
  });

  // Close the menu when clicking elsewhere.
  document.addEventListener('click', (e) => {
    if (!toolbar.contains(e.target as Node)) { menu.setAttribute('hidden', ''); fab.setAttribute('aria-expanded', 'false'); }
  });

  renderAll();
}
