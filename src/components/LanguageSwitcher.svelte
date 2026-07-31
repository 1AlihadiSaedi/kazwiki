<script>
  import { getLanguages } from '../logic/i18n.js';

  let { lang = 'fa' } = $props();

  const languages = getLanguages();
  const nextLang = $derived(languages.find((l) => l.code !== lang) || languages[0]);

  function switchLang() {
    const hash = window.location.hash.slice(1) || '/home';
    const [path, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString || '');
    params.set('lang', nextLang.code);
    window.location.hash = `#${path}?${params.toString()}`;
  }
</script>

<button class="lang-switch" onclick={switchLang} title={nextLang.label} aria-label={nextLang.label}>
  <span class="lang-code">{nextLang.code.toUpperCase()}</span>
</button>

<style>
  .lang-switch {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px;
    border: 1px solid var(--color-border); border-radius: var(--radius-md);
    background: var(--color-bg-secondary); cursor: pointer;
    color: var(--color-text-secondary);
    font-family: var(--font-mono); font-size: var(--font-size-xs); font-weight: 700;
    transition: all var(--transition-fast);
  }
  .lang-switch:hover { background: var(--color-bg-hover); color: var(--color-accent); }
  .lang-code { line-height: 1; }
</style>