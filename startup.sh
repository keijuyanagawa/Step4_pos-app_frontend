#!/bin/bash

# Azure App Service環境変数設定
export PORT=${PORT:-8080}
export NODE_ENV=production

# Next.jsアプリケーションを起動
echo "Starting Next.js application on port $PORT"
npx next start -p $PORT
