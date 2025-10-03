'use client';

import { useState } from 'react';

interface LoginFormProps {
  onLogin: (cashierCode: string, password: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export default function LoginForm({ onLogin, isLoading, error }: LoginFormProps) {
  const [cashierCode, setCashierCode] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cashierCode.trim() && password.trim()) {
      await onLogin(cashierCode.trim(), password);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#1a1d29' }}>
      {/* メインコンテンツエリア */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* タイトル */}
          <div>
            <h1 className="text-center text-3xl font-bold text-white">
              ログイン
            </h1>
          </div>
          
          {/* ログインフォーム */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* コード入力 */}
              <div>
                <input
                  id="cashier-code"
                  name="cashier-code"
                  type="text"
                  required
                  style={{ 
                    backgroundColor: '#252936',
                    borderColor: '#3f4557',
                    color: '#9ca3af'
                  }}
                  className="appearance-none relative block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base"
                  placeholder="コード"
                  value={cashierCode}
                  onChange={(e) => setCashierCode(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* パスワード入力 */}
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  style={{ 
                    backgroundColor: '#252936',
                    borderColor: '#3f4557',
                    color: '#9ca3af'
                  }}
                  className="appearance-none relative block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base"
                  placeholder="パスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div 
                className="rounded-lg p-4 flex items-center gap-3"
                style={{ backgroundColor: '#7f1d1d' }}
              >
                <span className="text-red-300 text-xl">⚠</span>
                <div className="text-sm text-red-200">{error}</div>
              </div>
            )}

            {/* ログインボタン */}
            <div>
              <button
                type="submit"
                disabled={isLoading || !cashierCode.trim() || !password.trim()}
                style={{ 
                  backgroundColor: isLoading || !cashierCode.trim() || !password.trim() ? '#1e40af' : '#2563eb'
                }}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 底部ナビゲーションバー */}
      <div 
        className="border-t"
        style={{ 
          backgroundColor: '#252936',
          borderColor: '#3f4557'
        }}
      >
        <div className="flex justify-around items-center py-3">
          <button className="flex flex-col items-center gap-1 px-4 py-2">
            <span className="text-2xl" style={{ color: '#6b7280' }}>🏠</span>
            <span className="text-xs" style={{ color: '#6b7280' }}>ホーム</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 py-2">
            <span className="text-2xl" style={{ color: '#6b7280' }}>🔍</span>
            <span className="text-xs" style={{ color: '#6b7280' }}>商品検索</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 py-2">
            <span className="text-2xl" style={{ color: '#6b7280' }}>💰</span>
            <span className="text-xs" style={{ color: '#6b7280' }}>売上</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 py-2">
            <span className="text-2xl" style={{ color: '#2563eb' }}>⚙️</span>
            <span className="text-xs" style={{ color: '#2563eb' }}>設定</span>
          </button>
        </div>
      </div>
    </div>
  );
}



