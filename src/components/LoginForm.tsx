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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-md w-full space-y-8">
        {/* タイトル */}
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">
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
                  backgroundColor: '#ffffff',
                  borderColor: '#d1d5db',
                  color: '#111827'
                }}
                className="appearance-none relative block w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-base"
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
                  backgroundColor: '#ffffff',
                  borderColor: '#d1d5db',
                  color: '#111827'
                }}
                className="appearance-none relative block w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-base"
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
              className="rounded-lg p-4 flex items-center gap-3 border-2"
              style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5' }}
            >
              <span className="text-red-600 text-xl">⚠</span>
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* ログインボタン */}
          <div>
            <button
              type="submit"
              disabled={isLoading || !cashierCode.trim() || !password.trim()}
              style={{ 
                backgroundColor: '#1e40af'
              }}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



