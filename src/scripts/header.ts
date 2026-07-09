/**
 * Header interactivity: theme toggle, mobile drawer, and the Pagefind search
 * modal (lazy-loaded on first open so it never blocks initial paint).
 */
export function setupHeader() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  // --- Theme toggle -------------------------------------------------------
  const themeBtn = document.getElementById('theme-toggle');
  themeBtn?.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    const theme = isDark ? 'dark' : 'light';
    try {
      localStorage.setItem('theme', theme);
    } catch {}
    themeBtn.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
  });

  // --- Mobile drawer ------------------------------------------------------
  const navToggle = document.getElementById('nav-toggle');
  const drawer = document.getElementById('mobile-drawer');
  navToggle?.addEventListener('click', () => {
    const open = drawer?.hasAttribute('hidden');
    if (open) drawer?.removeAttribute('hidden');
    else drawer?.setAttribute('hidden', '');
    navToggle.setAttribute('aria-expanded', String(!!open));
  });

  // --- Search modal (Pagefind) -------------------------------------------
  const modal = document.getElementById('search-modal') as HTMLDialogElement | null;
  const openBtn = document.getElementById('search-open');
  const closeBtn = document.getElementById('search-close');
  let pagefindLoaded = false;

  async function loadPagefind() {
    if (pagefindLoaded) return;
    pagefindLoaded = true;
    // Inject stylesheet.
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = `${base}/pagefind/pagefind-ui.css`;
    document.head.appendChild(css);
    try {
      // @ts-ignore – built by Pagefind at deploy time; absent during `astro dev`.
      const module = await import(/* @vite-ignore */ `${base}/pagefind/pagefind-ui.js`);
      const PagefindUI = module.PagefindUI || (window as any).PagefindUI;
      new PagefindUI({
        element: '#pagefind-search',
        showSubResults: true,
        showImages: false,
        resetStyles: false,
      });
    } catch {
      const el = document.getElementById('pagefind-search');
      if (el)
        el.innerHTML =
          '<p style="color:var(--text-soft)">Search index builds during deployment — run <code>npm run build</code> then <code>npm run preview</code> to try it locally.</p>';
    }
  }

  function openSearch() {
    loadPagefind();
    modal?.showModal();
    setTimeout(() => modal?.querySelector('input')?.focus(), 60);
  }
  openBtn?.addEventListener('click', openSearch);
  closeBtn?.addEventListener('click', () => modal?.close());
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });

  // --- Global keyboard shortcut: "/" opens search ------------------------
  document.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable;
    if (e.key === '/' && !typing && !modal?.open) {
      e.preventDefault();
      openSearch();
    }
  });
}
