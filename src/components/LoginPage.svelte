<script>
  /**
   * LoginPage.svelte – Admin login page
   * Uses Supabase Auth via custom lightweight client.
   */
  import { signIn } from '../logic/auth.js';
  import { t } from '../logic/i18n.js';

  let { lang = 'fa' } = $props();

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  /** Handle login form submission */
  async function handleLogin(e) {
    e.preventDefault();
    error = '';
    loading = true;

    const result = await signIn(email, password);
    loading = false;

    if (result.error) {
      error = result.error;
      return;
    }

    // Login successful — reload so App picks up the session
    window.location.hash = '#/home';
    window.location.reload();
  }
</script>

<div class="login-page">
  <div class="login-card">
    <!-- Logo -->
    <div class="login-logo">
      <span class="logo-icon">◆</span>
      <h1>{t(lang, 'siteTitle')}</h1>
    </div>

    <p class="login-subtitle">{t(lang, 'loginTitle')}</p>

    <form class="login-form" onsubmit={handleLogin}>
      <!-- Email -->
      <div class="form-group">
        <label class="form-label" for="login-email">
          {t(lang, 'email')}
        </label>
        <input
          id="login-email"
          type="email"
          class="form-input"
          placeholder="admin@example.com"
          value={email}
          oninput={(e) => email = e.target.value}
          required
          autocomplete="email"
          dir="ltr"
        />
      </div>

      <!-- Password -->
      <div class="form-group">
        <label class="form-label" for="login-password">
          {t(lang, 'password')}
        </label>
        <input
          id="login-password"
          type="password"
          class="form-input"
          placeholder="••••••••"
          value={password}
          oninput={(e) => password = e.target.value}
          required
          autocomplete="current-password"
          dir="ltr"
        />
      </div>

      <!-- Error -->
      {#if error}
        <div class="form-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{error}</span>
        </div>
      {/if}

      <!-- Submit -->
      <button type="submit" class="btn-login" disabled={loading}>
        {#if loading}
          <span class="spinner"></span>
          {t(lang, 'loggingIn')}
        {:else}
          {t(lang, 'login')}
        {/if}
      </button>
    </form>

    <p class="login-footer">
      <a href="#/home">{t(lang, 'backToHome')}</a>
    </p>
  </div>
</div>

<style>
  .login-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 70vh;
    padding: 2rem;
  }

  .login-card {
    width: 100%;
    max-width: 400px;
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 2.5rem 2rem;
    box-shadow: var(--shadow-md);
    animation: fadeUp 300ms ease;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .login-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .logo-icon {
    font-size: 2rem;
    color: var(--color-accent);
  }

  .login-logo h1 {
    font-size: var(--font-size-2xl);
    color: var(--color-accent);
    margin: 0;
  }

  .login-subtitle {
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    margin-bottom: 2rem;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-label {
    display: block;
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text-secondary);
    margin-bottom: 0.4rem;
  }

  .form-input {
    width: 100%;
    padding: 0.65rem 0.85rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
    font-family: var(--font-body);
    font-size: var(--font-size-base);
    transition: border var(--transition-fast), box-shadow var(--transition-fast);
    outline: none;
  }

  .form-input:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px var(--color-accent-bg);
  }

  .form-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 0.85rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: var(--radius-md);
    color: #dc2626;
    font-size: var(--font-size-sm);
    margin-bottom: 1rem;
  }

  [data-theme="dark"] .form-error {
    background: #450a0a;
    border-color: #7f1d1d;
    color: #fca5a5;
  }

  .btn-login {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: var(--radius-md);
    background: var(--color-accent);
    color: var(--color-accent-text);
    font-family: var(--font-body);
    font-size: var(--font-size-base);
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: background var(--transition-fast);
  }

  .btn-login:hover:not(:disabled) {
    background: var(--color-accent-dark);
  }

  .btn-login:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .login-footer {
    text-align: center;
    margin-top: 1.5rem;
    font-size: var(--font-size-sm);
  }

  @media (max-width: 480px) {
    .login-card {
      padding: 1.5rem 1.25rem;
    }
  }
</style>