#!/bin/bash

# Azure App Service環境変数設定
export PORT=${PORT:-8080}
export NODE_ENV=production
export HOSTNAME="0.0.0.0"

# ログ出力
echo "Starting Next.js application..."
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# 依存関係のインストール（念のため）
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci --production
fi

# ビルドが存在しない場合はビルド
if [ ! -d ".next" ]; then
    echo "Building application..."
    npm run build
fi

# Next.jsアプリケーションを起動
echo "Starting Next.js application on port $PORT"
exec node server.js
