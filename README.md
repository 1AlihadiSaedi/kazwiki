# 🟢 Emerald Wiki — Personal Wiki

Lightweight personal Wiki built with **Svelte + CSS + JavaScript**.  
Emerald theme, Persian (RTL) support, dark/light mode, and **authentication system**.

---

## 📁 Project Structure

```
wiki/
├── index.html
├── package.json
├── vite.config.js
├── svelte.config.js
├── README.md
└── src/
    ├── main.js
    ├── config.js                 # Supabase credentials
    ├── App.svelte
    ├── components/
    │   ├── Header.svelte
    │   ├── Footer.svelte
    │   ├── Sidebar.svelte
    │   ├── WikiPage.svelte
    │   ├── LocalEditor.svelte
    │   ├── LoginPage.svelte      # Admin login
    │   ├── SettingsPage.svelte   # User management
    │   ├── ThemeToggle.svelte
    │   └── LanguageSwitcher.svelte
    ├── logic/
    │   ├── i18n.js
    │   ├── theme.js
    │   ├── wiki.js
    │   ├── auth.js               # Supabase Auth client
    │   └── db.js                 # Supabase DB client
    ├── styles/
    │   ├── variables.css
    │   └── global.css
    └── wiki-content/
        ├── home.fa.md / home.en.md
        └── about.fa.md / about.en.md
```

---

## 🚀 Build & Deploy

```bash
npm install
npm run build
# Upload the dist/ folder to any static hosting
```

The `dist/` folder contains a fully static website — open `index.html` directly or serve with any HTTP server.

---

## 🔐 Authentication Setup (Supabase)

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → create a free project
2. Go to **Settings → API**
3. Copy `Project URL` and `anon public` key
4. Edit `src/config.js`:

```js
export const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOi...';
```

### 2. Create the profiles Table

Run this SQL in the Supabase **SQL Editor**:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  display_name TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything"
  ON profiles FOR ALL TO authenticated
  USING (role = 'admin') WITH CHECK (role = 'admin');

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);
```

### 3. Disable Email Confirmation (optional)

**Authentication → Settings** → turn off **Confirm email**.

### 4. Create Admin User

1. **Authentication → Users** → **Add user**
2. Enter admin email + password
3. In SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
```

Now `npm run build`, open the site, and navigate to `#/login`.

---

## ✏️ Editing Pages

Click the floating pencil button (bottom-left) to open the **Local Editor**:

1. Edit markdown
2. Toggle between **Write** and **Preview** modes
3. Click **Download Markdown**
4. Replace the file in `src/wiki-content/`
5. Rebuild and redeploy

---

## ⚠️ Static Hosting Limitations

| Feature | Status | Note |
|---------|--------|------|
| Server-side saving | ❌ | Rebuild required for content changes |
| Real auth (no backend) | ❌ | Supabase handles auth securely |
| Dynamic search | ⚠️ | Limited to bundled pages |
| Database | ❌ | Supabase provides DB |

---

## 📊 Bundle Size

| Part | Approx. Size |
|------|-------------|
| Svelte + JS | ~23 KB (gzipped) |
| CSS | ~3 KB (gzipped) |
| **Total** | **~26 KB** |

---

## 📄 License

MIT — free for any use.
