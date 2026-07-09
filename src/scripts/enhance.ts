/** Progressive enhancement for rendered markdown: copy buttons on code blocks. */
export function initCodeCopy(root: ParentNode = document) {
  const blocks = root.querySelectorAll<HTMLPreElement>('.prose pre');
  blocks.forEach((pre) => {
    if (pre.dataset.copyReady) return;
    pre.dataset.copyReady = '1';
    pre.style.position = 'relative';

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    btn.innerHTML = 'Copy';

    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.innerText ?? pre.innerText;
      try {
        await navigator.clipboard.writeText(code);
        btn.innerHTML = 'Copied!';
        btn.classList.add('copied');
      } catch {
        btn.innerHTML = 'Failed';
      }
      setTimeout(() => {
        btn.innerHTML = 'Copy';
        btn.classList.remove('copied');
      }, 1600);
    });

    pre.appendChild(btn);
  });
}
