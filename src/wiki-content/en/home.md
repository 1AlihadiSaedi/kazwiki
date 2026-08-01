# Welcome to Emerald Wiki

A **lightweight personal Wiki** built with Svelte.

## Features

- **Blazing fast** — Tiny bundle size, instant loading
- **Emerald theme** — Modern design with dark/light mode
- **Persian + English** — Full RTL and LTR support
- **Responsive** — Works great on mobile, tablet, and desktop
- **Static hosting** — No server or database required

## How to Use

1. Use the sidebar to navigate between pages.
2. Press `FA`/`EN` in the header to switch languages.
3. Click the moon/sun icon to toggle dark mode.

## Editing Pages

Click the floating pencil button to open the local editor.
You can download your changes as a Markdown file.

## Limitations

Since the site is fully static, there are some limitations:

- **Local authentication** — Login with username and password is done locally (SHA-256), not via an external server
- **Local saving** — Changes are saved to disk via the local API server (port 5174)
- **Client-side search** — Search only works within loaded pages, not across the entire site

## Markdown Format

This wiki supports standard **Markdown**:

### Headings

`# H1`, `## H2`, `### H3`

### Text styling

- **Bold** with `**text**`
- *Italic* with `*text*`
- ~~Strikethrough~~ with `~~text~~`

### Links & Images

- `[link text](https://example.com)`
- `![alt text](image.png)`

### Lists

- Unordered item
- Another item

1. Ordered item
2. Another item

### Blockquote

> This is a blockquote.

### Code

Inline `code` and code blocks with triple backticks:

```
function hello() {
  return "Hello World";
}
```

### Tables

| Key | Value |
|-----|-------|
| foo | bar   |
