/**
 * wiki.js – Wiki engine: Markdown parser + page loader
 *
 * Loads all .md files at build time via Vite's import.meta.glob.
 * Parses Markdown to HTML with a lightweight custom parser.
 * No external Markdown library dependency – keeps bundle tiny.
 */

// Build-time: load all markdown files as raw strings
const pageModules = import.meta.glob('/src/wiki-content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/**
 * Build a page index from loaded markdown files.
 * Returns array of { slug, lang, title, path }
 */
export function getPageIndex() {
  const pages = [];

  for (const [filePath, content] of Object.entries(pageModules)) {
    const fileName = filePath.split('/').pop();              // "home.fa.md"
    const base = fileName.replace(/\.md$/, '');              // "home.fa"
    const parts = base.split('.');
    const lang = parts.pop();                                // "fa"
    const slug = parts.join('.');                            // "home"

    // Extract title from first H1 in markdown
    const match = content.match(/^#\s+(.+)$/m);
    const title = match ? match[1].trim() : slug;

    pages.push({ slug, lang, title, path: filePath });
  }

  return pages;
}

/**
 * Get raw markdown content for a specific slug + language.
 * Falls back to Persian if the requested language is not available.
 */
export function getPageContent(slug, lang) {
  const targetPath = `/src/wiki-content/${slug}.${lang}.md`;
  if (pageModules[targetPath]) return pageModules[targetPath];

  // Fallback to Persian
  const fallbackPath = `/src/wiki-content/${slug}.fa.md`;
  if (pageModules[fallbackPath]) return pageModules[fallbackPath];

  return null;
}

/**
 * Simple Markdown → HTML converter.
 * Handles common wiki formatting without heavy dependencies.
 */
export function parseMarkdown(md) {
  if (!md) return '';

  let html = md;

  // ---- Block-level: fenced code blocks (must run before inline) ----
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    const escaped = escapeHtml(code.trim());
    const langAttr = lang ? ` data-lang="${lang}"` : '';
    return `<pre${langAttr}><code>${escaped}</code></pre>`;
  });

  // ---- Block-level: headings ----
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // ---- Block-level: horizontal rule ----
  html = html.replace(/^(---|\*\*\*|___)\s*$/gm, '<hr>');

  // ---- Block-level: blockquote (lines starting with >) ----
  html = html.replace(/^&gt;\s?(.+)$/gm, '<blockquote>$1</blockquote>');

  // ---- Block-level: unordered lists ----
  html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // ---- Block-level: ordered lists ----
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<oli>$1</oli>');
  html = html.replace(/((?:<oli>.*<\/oli>\n?)+)/g, '<ol>$1</ol>');
  html = html.replace(/<\/?oli>/g, (tag) => tag.replace('oli', 'li'));

  // ---- Block-level: tables ----
  // Match table rows: | cell | cell |
  html = html.replace(/^\|(.+)\|$/gm, (_match, cells) => {
    const cellArray = cells.split('|').map((c) => c.trim());
    return '<tr>' + cellArray.map((c) => `<td>${c}</td>`).join('') + '</tr>';
  });
  html = html.replace(/((?:<tr>.*<\/tr>\n?)+)/g, '<table>$1</table>');

  // ---- Inline: images (must run before links) ----
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // ---- Inline: links ----
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // ---- Inline: bold + italic (3-char first) ----
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');

  // ---- Inline: bold ----
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // ---- Inline: italic ----
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // ---- Inline: strikethrough ----
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // ---- Inline: inline code ----
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // ---- Inline: line breaks ----
  html = html.replace(/  \n/g, '<br>');

  // ---- Paragraphs: wrap remaining text blocks ----
  html = html.replace(/\n\n+/g, '</p><p>');
  html = '<p>' + html + '</p>';

  // ---- Cleanup: remove empty paragraphs ----
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p>(<\/(?:h[1-6]|ul|ol|pre|table|hr|blockquote)>)/g, '$1');
  html = html.replace(/(<(?:h[1-6]|ul|ol|pre|table|hr|blockquote)[^>]*>)<\/p>/g, '$1');

  // ---- Cleanup: extra newlines ----
  html = html.replace(/\n/g, '');

  return html;
}

/** Escape HTML special characters */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Get all unique page slugs (across all languages).
 * Returns array of { slug, titles: { fa, en } }
 */
export function getAllSlugs() {
  const index = getPageIndex();
  const slugs = {};

  for (const page of index) {
    if (!slugs[page.slug]) {
      slugs[page.slug] = { slug: page.slug, titles: {} };
    }
    slugs[page.slug].titles[page.lang] = page.title;
  }

  return Object.values(slugs);
}