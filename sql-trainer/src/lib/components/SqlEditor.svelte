<script lang="ts">
  let {
    value = $bindable(''),
    onrun,
    disabled = false,
    rows = 8
  }: {
    value?: string;
    onrun?: () => void;
    disabled?: boolean;
    rows?: number;
  } = $props();

  function keydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) onrun?.();
    }
  }
</script>

<div class="editor panel">
  <textarea
    bind:value
    onkeydown={keydown}
    {rows}
    {disabled}
    spellcheck="false"
    placeholder="-- Write SQL here, e.g.  SELECT * FROM employees LIMIT 10;   (Ctrl+Enter to run)"
  ></textarea>
</div>

<style>
  .editor {
    overflow: hidden;
  }
  textarea {
    display: block;
    width: 100%;
    border: none;
    resize: vertical;
    background: transparent;
    color: var(--text);
    font-family: var(--mono);
    font-size: 0.88rem;
    line-height: 1.55;
    padding: 0.75rem 0.9rem;
    min-height: 6rem;
  }
  textarea:focus {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
    border-radius: 10px;
  }
</style>
