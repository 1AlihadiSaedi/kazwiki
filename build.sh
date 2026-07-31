#!/bin/bash
set -e

echo "🟢 Emerald Wiki — Build Script"
echo "==============================="
echo ""

# 1. Check for config.js (pre-build config)
if [ ! -f config.js ]; then
  if [ -f config.example.js ]; then
    echo "⚠️  config.js not found. Creating from config.example.js..."
    cp config.example.js config.js
  else
    echo "❌ No config.js or config.example.js found!"
    exit 1
  fi
  echo ""
  echo "✏️  EDIT config.js with your admin credentials and site settings:"
  echo ""
  echo "   admin.email    → your admin email"
  echo "   admin.password → your admin password (hashed at build)"
  echo ""
  echo "   Then run:  ./build.sh"
  exit 1
fi

# 2. Check for .env (optional — only needed for Supabase)
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "ℹ️  .env created from .env.example (optional — Supabase only)"
  fi
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
echo ""
echo "🔐 Login:  #/login  →  email & password from config.js"
