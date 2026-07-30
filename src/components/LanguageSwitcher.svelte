<script>
  /**
   * LanguageSwitcher.svelte – Toggle between Persian (RTL) and English (LTR)
   */
  import { getLanguages, getDirection } from '../logic/i18n.js';

  let { lang = 'fa', onLanguageChange } = $props();

  const languages = getLanguages();
  const currentLang = $derived(languages.find((l) => l.code === lang) || languages[0]);
  const nextLang = $derived(languages.find((l) => l.code !== lang) || languages[0]);

  function switchLang() {
    if (onLanguageChange) {
      onLanguageChange(nextLang.code);
    }
  }
</script>

<button
  class="lang-switch"
  onclick={switchLang}
  title={nextLang.label}
  aria-label={nextLang.label}
>
  <span class="lang-code">{nextLang.code.toUpperCase()}</span>
</button>

<style>
  .lang-switch {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg-secondary);
    cursor: pointer;
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
    font-size: var(--font-size-xs);
    font-weight: 700;
    transition: all var(--transition-fast);
  }

  .lang-switch:hover {
    background: var(--color-bg-hover);
    color: var(--color-accent);
  }

  .lang-code {
    line-height: 1;
  }
</style>