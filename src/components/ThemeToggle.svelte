<script>
  /**
   * ThemeToggle.svelte – Dark / Light mode toggle button
   */
  import { getTheme, setTheme } from '../logic/theme.js';
  import { t } from '../logic/i18n.js';

  let { lang = 'fa' } = $props();

  let theme = $state(getTheme());

  function toggle() {
    theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(theme);
  }
</script>

<button
  class="theme-toggle"
  onclick={toggle}
  aria-label={t(lang, 'theme')}
  title={theme === 'dark' ? t(lang, 'light') : t(lang, 'dark')}
>
  {#if theme === 'dark'}
    <!-- Sun icon -->
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toggle-icon">
      <circle cx="12" cy="12" r="5"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  {:else}
    <!-- Moon icon -->
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toggle-icon">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  {/if}
</button>

<style>
  .theme-toggle {
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
    transition: all var(--transition-fast);
  }

  .theme-toggle:hover {
    background: var(--color-bg-hover);
    color: var(--color-accent);
  }

  .toggle-icon {
    width: 18px;
    height: 18px;
  }
</style>