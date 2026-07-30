#!/bin/bash
set -e

echo "🟢 Emerald Wiki — Build Script"
echo "==============================="
echo ""

# 1. Check for .env
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "⚠️  No .env file found. Creating one from .env.example..."
    cp .env.example .env
  else
    echo "❌ No .env or .env.example found!"
    exit 1
  fi
  echo ""
  echo "✏️  EDIT .env with your Supabase credentials:"
  echo ""
  echo "   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co"
  echo "   VITE_SUPABASE_ANON_KEY=eyJhbGciOi..."
  echo ""
  echo "   Then run:  ./build.sh"
  exit 1
fi

# 2. Validate .env is not placeholders
URL=$(grep VITE_SUPABASE_URL .env | cut -d '=' -f2)
if [ "$URL" = "https://xxxxxxxxxxxx.supabase.co" ] || [ -z "$URL" ]; then
  echo "❌ SUPABASE_URL is still a placeholder in .env"
  echo "   Edit .env and set your real Supabase URL + anon key."
  exit 1
fi

# 3. Install & build
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building..."
npm run build

echo ""
echo "✅ Build complete!"
echo "   Output: dist/"
echo "   Preview: npm run preview"
echo ""
echo "📤 Deploy: upload the dist/ folder to any static host."
