<script>
  /**
   * Footer.svelte – Simple site footer
   */
  import { t } from '../logic/i18n.js';

  let { lang = 'fa' } = $props();
</script>

<footer class="footer">
  <div class="footer-inner">
    <p class="footer-text">{t(lang, 'footerText')}</p>
  </div>
</footer>

<style>
  .footer {
    background: var(--color-bg-primary);
    border-top: 1px solid var(--color-border);
    margin-top: auto;
    padding: 1rem;
    transition: background var(--transition-normal), border var(--transition-normal);
  }

  .footer-inner {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
  }

  .footer-text {
    color: var(--color-text-muted);
    font-size: var(--font-size-xs);
    margin: 0;
  }
</style>