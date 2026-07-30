/**
 * wiki.js – Wiki engine: Markdown parser + page loader
 * Loads all .md files at build time via wikiContentPlugin (virtual module).
 */

import pageModules from 'virtual:wiki-content';
const pages = pageModules;

export function getPageIndex() {
  const index = [];
  for (const [filePath, content] of Object.entries(pages)) {
    if (!content) continue;
    const fileName = filePath.split('/').pop();
    const base = fileName.replace(/\.md$/, '');
    const parts = base.split('.');
    const lang = parts.pop();
    const slug = parts.join('.');
    const match = content.match(/^#\s+(.+)$/m);
    const title = match ? match[1].trim() : slug;
    index.push({ slug, lang, title, path: filePath });
  }
  return index;
}

export function getPageContent(slug, lang) {
  const targetPath = `/src/wiki-content/${slug}.${lang}.md`;
  if (pages[targetPath]) return pages[targetPath];
  const fallbackPath = `/src/wiki-content/${slug}.fa.md`;
  if (pages[fallbackPath]) return pages[fallbackPath];
  return null;
}

export function parseMarkdown(md) {
  if (!md) return '';
  let html = md;
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    const escaped = escapeHtml(code.trim());
    const langAttr = lang ? ` data-lang="${lang}"` : '';
    return `<pre${langAttr}><code>${escaped}</code></pre>`;
  });
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^(---|\*\*\*|___)\s*$/gm, '<hr>');
  html = html.replace(/^&gt;\s?(.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<oli>$1</oli>');
  html = html.replace(/((?:<oli>.*<\/oli>\n?)+)/g, '<ol>$1</ol>');
  html = html.replace(/<\/?oli>/g, (tag) => tag.replace('oli', 'li'));
  html = html.replace(/^\|(.+)\|$/gm, (_match, cells) => {
    const cellArray = cells.split('|').map((c) => c.trim());
    return '<tr>' + cellArray.map((c) => `<td>${c}</td>`).join('') + '</tr>';
  });
  html = html.replace(/((?:<tr>.*<\/tr>\n?)+)/g, '<table>$1</table>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/  \n/g, '<br>');
  html = html.replace(/\n\n+/g, '</p><p>');
  html = '<p>' + html + '</p>';
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p>(<\/(?:h[1-6]|ul|ol|pre|table|hr|blockquote)>)/g, '$1');
  html = html.replace(/(<(?:h[1-6]|ul|ol|pre|table|hr|blockquote)[^>]*>)<\/p>/g, '$1');
  html = html.replace(/\n/g, '');
  return html;
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function getAllSlugs() {
  const index = getPageIndex();
  const slugs = {};
  for (const page of index) {
    if (!slugs[page.slug]) slugs[page.slug] = { slug: page.slug, titles: {} };
    slugs[page.slug].titles[page.lang] = page.title;
  }
  return Object.values(slugs);
}
