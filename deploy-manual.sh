#!/bin/bash

# 手動デプロイ用スクリプト
# 使用方法: ./deploy-manual.sh

echo "🚀 Next.js アプリケーションの手動デプロイを開始します..."

# 環境変数の確認
if [ -z "$AZURE_WEBAPP_NAME" ]; then
    echo "❌ AZURE_WEBAPP_NAME環境変数が設定されていません"
    echo "例: export AZURE_WEBAPP_NAME='app-002-gen10-step3-1-node-oshima36'"
    exit 1
fi

# 依存関係のインストール
echo "📦 依存関係をインストール中..."
npm ci

# アプリケーションのビルド
echo "🔨 アプリケーションをビルド中..."
npm run build

# デプロイ用のZIPファイル作成
echo "📦 デプロイパッケージを作成中..."
zip -r deploy-package.zip . -x "node_modules/*" ".git/*" "*.log" "deploy-package.zip"

echo "✅ デプロイパッケージが作成されました: deploy-package.zip"
echo ""
echo "📋 次の手順を実行してください:"
echo "1. Azure Portal → App Service → Deployment Center"
echo "2. 'ZIP Deploy' または 'FTP' を選択"
echo "3. deploy-package.zip をアップロード"
echo ""
echo "または、Azure CLIを使用する場合:"
echo "az webapp deployment source config-zip --resource-group <resource-group> --name $AZURE_WEBAPP_NAME --src deploy-package.zip"
