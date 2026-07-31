<script>
  import { signIn } from '../logic/auth.js';
  import { t } from '../logic/i18n.js';
  let { lang = 'fa' } = $props();
  let username = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);
  async function handleLogin(e) {
    e.preventDefault();
    error = '';
    loading = true;
    try {
      const result = await signIn(username, password);
      if (result.error) { error = result.error; loading = false; return; }
      window.location.hash = '#/home';
      window.location.reload();
    } catch (err) {
      loading = false;
      error = t(lang, 'loginFailed');
    }
  }
</script>
<div class="login-page">
  <div class="login-card">
    <div class="login-logo"><span class="logo-icon">◆</span><h1>{t(lang, 'siteTitle')}</h1></div>
    <p class="login-subtitle">{t(lang, 'loginTitle')}</p>
    <form class="login-form" onsubmit={handleLogin}>
      <div class="form-group">
        <label class="form-label" for="login-user">{t(lang, 'username')}</label>
        <input id="login-user" type="text" class="form-input" autocomplete="username" placeholder="root" bind:value={username} required dir="ltr" />
      </div>
      <div class="form-group">
        <label class="form-label" for="login-pass">{t(lang, 'password')}</label>
        <input id="login-pass" type="password" class="form-input" autocomplete="current-password" placeholder="••••••••" bind:value={password} required dir="ltr" />
      </div>
      {#if error}
        <div class="form-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{error}</span>
        </div>
      {/if}
      <button type="submit" class="btn-login" disabled={loading}>
        {#if loading}<span class="spinner"></span>{t(lang, 'loggingIn')}
        {:else}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>{t(lang, 'login')}
        {/if}
      </button>
    </form>
    <p class="login-footer"><a href="#/home">{t(lang, 'backToHome')}</a></p>
  </div>
</div>
<style>
  .login-page { display:flex;align-items:center;justify-content:center;min-height:calc(100vh - var(--header-height) - 100px);padding:2rem 1rem }
  .login-card { width:100%;max-width:400px;background:var(--color-bg-primary);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:2.5rem 2rem;box-shadow:var(--shadow-lg);animation:fadeUp 350ms ease }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .login-logo { display:flex;align-items:center;justify-content:center;gap:0.6rem;margin-bottom:0.3rem }
  .logo-icon { font-size:2.5rem;color:var(--color-accent) }
  .login-logo h1 { font-size:var(--font-size-2xl);color:var(--color-accent);margin:0 }
  .login-subtitle { text-align:center;color:var(--color-text-muted);font-size:var(--font-size-sm);margin-bottom:2rem }
  .form-group { margin-bottom:1.1rem }
  .form-label { display:block;font-size:var(--font-size-sm);font-weight:600;color:var(--color-text-secondary);margin-bottom:0.4rem }
  .form-input { width:100%;padding:0.7rem 0.85rem;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-bg-secondary);color:var(--color-text-primary);font-family:var(--font-body);font-size:var(--font-size-base);transition:border var(--transition-fast),box-shadow var(--transition-fast);outline:none }
  .form-input:focus { border-color:var(--color-accent);box-shadow:0 0 0 3px var(--color-accent-bg) }
  .form-error { display:flex;align-items:flex-start;gap:0.5rem;padding:0.7rem 0.9rem;background:#fef2f2;border:1px solid #fecaca;border-radius:var(--radius-md);color:#dc2626;font-size:var(--font-size-sm);margin-bottom:1.2rem;line-height:1.5 }
  :global([data-theme="dark"]) .form-error { background:#450a0a;border-color:#7f1d1d;color:#fca5a5 }
  .form-error svg { flex-shrink:0;margin-top:1px }
  .btn-login { width:100%;padding:0.8rem;border:none;border-radius:var(--radius-md);background:var(--color-accent);color:var(--color-accent-text);font-family:var(--font-body);font-size:var(--font-size-base);font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.5rem;transition:background var(--transition-fast),transform var(--transition-fast);margin-top:0.3rem }
  .btn-login:hover:not(:disabled) { background:var(--color-accent-dark);transform:translateY(-1px) }
  .btn-login:disabled { opacity:0.65;cursor:not-allowed }
  .spinner { width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.6s linear infinite }
  @keyframes spin { to{transform:rotate(360deg)} }
  .login-footer { text-align:center;margin-top:1.6rem;font-size:var(--font-size-sm) }
  @media (max-width:480px) { .login-card { padding:2rem 1.25rem } }
</style>
