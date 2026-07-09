/** Highlights the current section in the table of contents as you scroll. */
export function initScrollSpy() {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.toc-list a'));
  if (!links.length) return;
  const byId = new Map<string, HTMLAnchorElement>();
  links.forEach((l) => {
    const id = decodeURIComponent(l.getAttribute('href')!.slice(1));
    byId.set(id, l);
  });
  const headings = Array.from(document.querySelectorAll<HTMLElement>('.prose h2, .prose h3')).filter((h) => byId.has(h.id));

  const observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.remove('active'));
          byId.get(e.target.id)?.classList.add('active');
        }
      }
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
  );
  headings.forEach((h) => observer.observe(h));
}
