<script>
import { t, getLanguages, addLanguage, removeLanguage, exportLanguage, getAllLanguageData } from '../../logic/i18n.js';
let { lang = 'fa' } = $props();
let languages = $state([]);
let error = $state('');
let confirmDelete = $state(null);

$effect(() => { load() });
function load() { languages = getLanguages(); }

function handleUpload() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.meta || !data.translations) {
        error = lang === 'en' ? 'Invalid format' : 'فرمت نامعتبر';
        return;
      }
      if (!data.meta.code) {
        error = lang === 'en' ? 'Missing language code' : 'کد زبان مشخص نشده';
        return;
      }
      const r = addLanguage(data.meta.code, data.meta, data.translations);
      if (r.error) {
        error = lang === 'en' ? 'Language already exists' : 'این زبان قبلاً اضافه شده';
        return;
      }
      error = '';
      load();
    } catch {
      error = lang === 'en' ? 'Invalid JSON file' : 'فایل JSON نامعتبر';
    }
  };
  input.click();
}

function handleDownload(code) {
  const data = exportLanguage(code);
  if (!data) return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `translations-${code}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function handleDownloadAllBackup() {
  const data = getAllLanguageData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'translations-backup.json';
  a.click();
  URL.revokeObjectURL(url);
}

function handleDelete(code) {
  removeLanguage(code);
  confirmDelete = null;
  load();
}
</script>
<div class="lm">
  <div class="lh">
    <span class="lt2">{t(lang, 'languages')} ({languages.length})</span>
    <button class="lb2" onclick={handleUpload}>{t(lang, 'addLanguage')}</button>
  </div>

  {#if error}
    <div class="le">{error}</div>
  {/if}

  {#if confirmDelete}
    <div class="ldc">
      <span class="ldt">{t(lang, 'confirmDeleteLang')}</span>
      <div class="ldb">
        <button class="ldy" onclick={() => handleDelete(confirmDelete)}>{lang==='en'?'Delete':'حذف'}</button>
        <button class="ldn" onclick={() => confirmDelete = null}>{t(lang, 'cancel')}</button>
      </div>
    </div>
  {/if}

  <div class="llist">
    {#each languages as l}
      <div class="llr">
        <div class="lli">
          <span class="lav">{l.code.toUpperCase()}</span>
          <div class="lid">
            <span class="lun">{l.name || l.code}</span>
            <span class="luc">{l.code} · {l.dir || 'ltr'}</span>
          </div>
        </div>
        <div class="lac">
          <button class="lab" onclick={() => handleDownload(l.code)} title={lang==='en'?'Download':'دانلود'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          {#if l.code !== 'fa' && l.code !== 'en'}
            <button class="lad" onclick={() => confirmDelete = l.code} title={lang==='en'?'Remove':'حذف'}>✕</button>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <button class="lbb" onclick={handleDownloadAllBackup}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    {t(lang, 'downloadBackup')}
  </button>
</div>
<style>
  .lm{display:flex;flex-direction:column;gap:0.6rem}
  .lh{display:flex;align-items:center;justify-content:space-between}
  .lt2{font-weight:600;font-size:var(--font-size-sm);color:var(--color-text-primary)}
  .lb2{padding:0.35rem 0.85rem;border:1px solid var(--color-accent);border-radius:var(--radius-md);
    background:var(--color-accent-bg);color:var(--color-accent);font-size:var(--font-size-xs);font-weight:600;cursor:pointer}
  .lb2:hover{background:var(--color-accent);color:var(--color-accent-text)}
  .le{padding:0.4rem 0.6rem;border-radius:var(--radius-sm);background:#fef2f2;color:#dc2626;font-size:var(--font-size-xs)}
  .ldc{display:flex;flex-direction:column;gap:0.5rem;padding:0.75rem;
    background:#fef2f2;border:1px solid #fecaca;border-radius:var(--radius-md)}
  .ldt{font-size:var(--font-size-sm);color:#dc2626}
  .ldb{display:flex;gap:0.5rem}
  .ldy,.ldn{padding:0.35rem 1rem;border-radius:var(--radius-sm);font-size:var(--font-size-xs);cursor:pointer}
  .ldy{border:none;background:#dc2626;color:#fff}
  .ldn{border:1px solid var(--color-border);background:none;color:var(--color-text-secondary)}
  .llist{display:flex;flex-direction:column;gap:0.3rem}
  .llr{display:flex;align-items:center;justify-content:space-between;padding:0.55rem 0.75rem;
    border:1px solid var(--color-border);border-radius:var(--radius-sm)}
  .lli{display:flex;align-items:center;gap:0.65rem}
  .lav{width:30px;height:30px;border-radius:50%;background:var(--color-accent-bg);color:var(--color-accent);
    display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:700}
  .lid{display:flex;flex-direction:column;gap:0.1rem}
  .lun{font-size:var(--font-size-sm);font-weight:500;color:var(--color-text-primary)}
  .luc{font-size:var(--font-size-xs);color:var(--color-text-muted)}
  .lac{display:flex;gap:0.3rem}
  .lab,.lad{border:none;background:none;color:var(--color-text-muted);cursor:pointer;padding:4px;font-size:var(--font-size-sm)}
  .lab:hover{color:var(--color-accent)}
  .lad:hover{color:var(--color-danger)}
  .lbb{display:flex;align-items:center;justify-content:center;gap:0.4rem;width:100%;padding:0.55rem;
    border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-bg-secondary);
    color:var(--color-text-secondary);font-size:var(--font-size-xs);font-weight:500;cursor:pointer}
  .lbb:hover{background:var(--color-bg-hover);color:var(--color-accent)}
</style>
