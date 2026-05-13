#!/bin/bash

# Debug startup script
echo "╔════════════════════════════════════════════════════════╗"
echo "║          🔧 EVENTIO - Debug Startup Mode              ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

echo "📋 System Check:"
echo "   ✓ Node version: $(node -v)"
echo "   ✓ pnpm version: $(pnpm -v)"
echo "   ✓ Working directory: $(pwd)"
echo ""

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile 2>&1 | tail -5
echo ""

echo "🔨 Building packages..."
pnpm build 2>&1 | grep -E "(✓|✗|ERR)" | tail -10
echo ""

echo "🚀 Starting development server..."
echo "   Frontend: http://localhost:5173"
echo "   API: http://localhost:3000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

pnpm dev
