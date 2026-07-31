#!/bin/bash
set -e

echo "🟢 Emerald Wiki — Build"
echo "======================="
echo ""

echo "📦 Installing..."
npm install

echo ""
echo "🔨 Building..."
npm run build

echo ""
echo "✅ Done!  Output: dist/"
echo "🔐 Login:  #/login  →  root@root.com  /  RootRootRoot"
