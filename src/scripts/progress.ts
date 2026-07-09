/** LocalStorage-backed progress tracking for topic completion. */
const KEY = 'dsa-prep-progress';

export function getProgress(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function setDone(slug: string, done: boolean) {
  const p = getProgress();
  if (done) p[slug] = true;
  else delete p[slug];
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}

/** Topic-list page: render check states + progress bar. */
export function initTopicListProgress() {
  const summary = document.getElementById('progress-summary');
  const total = Number(summary?.dataset.total || 0);
  const fill = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');
  const rows = Array.from(document.querySelectorAll<HTMLElement>('.topic-row[data-slug]'));

  function render() {
    const p = getProgress();
    let done = 0;
    for (const row of rows) {
      const slug = row.dataset.slug!;
      if (p[slug]) {
        row.classList.add('done');
        done++;
      } else {
        row.classList.remove('done');
      }
    }
    if (fill) fill.style.width = total ? `${(done / total) * 100}%` : '0';
    if (label) label.textContent = `${done} of ${total} topics complete`;
  }

  render();
  document.getElementById('reset-progress')?.addEventListener('click', () => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    render();
  });
  window.addEventListener('storage', render);
}

/** Topic detail page: wire the "mark complete" toggle. */
export function initTopicToggle(slug: string) {
  const btn = document.getElementById('mark-done') as HTMLButtonElement | null;
  if (!btn) return;
  function render() {
    const done = !!getProgress()[slug];
    btn!.classList.toggle('done', done);
    btn!.setAttribute('aria-pressed', String(done));
    btn!.querySelector('.label')!.textContent = done ? 'Completed' : 'Mark as complete';
  }
  btn.addEventListener('click', () => {
    setDone(slug, !getProgress()[slug]);
    render();
  });
  render();
}
