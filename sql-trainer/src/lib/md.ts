// Tiny formatter for lesson body text (our own trusted content — escaped first).
// Supports: paragraphs, **bold**, `code`, - bullet lists.

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

export function renderMd(src: string): string {
  const blocks = src.trim().split(/\n\s*\n/);
  return blocks
    .map((block) => {
      const lines = block.split('\n');
      if (lines.every((l) => l.trim().startsWith('- '))) {
        const items = lines.map((l) => `<li>${inline(escapeHtml(l.trim().slice(2)))}</li>`).join('');
        return `<ul>${items}</ul>`;
      }
      return `<p>${inline(escapeHtml(block))}</p>`;
    })
    .join('');
}
