'use client';

import { useState } from 'react';
import { getConfig } from '@/lib/config';

interface LoginFormProps {
  onLogin: (cashierCode: string, password: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export default function LoginForm({ onLogin, isLoading, error }: LoginFormProps) {
  const [cashierCode, setCashierCode] = useState('');
  const [password, setPassword] = useState('');
  const config = getConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cashierCode.trim() && password.trim()) {
      await onLogin(cashierCode.trim(), password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {config.store_name}
          </h1>
          <h2 className="mt-2 text-center text-lg text-gray-600">
            POSシステム
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            レジ担当者ログイン
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="cashier-code" className="sr-only">
                レジ担当者コード
              </label>
              <input
                id="cashier-code"
                name="cashier-code"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="レジ担当者コード"
                value={cashierCode}
                onChange={(e) => setCashierCode(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || !cashierCode.trim() || !password.trim()}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <div className="text-xs text-gray-400">
            <p>店舗: {config.store_code}</p>
            <p>POS機: {config.pos_machine_id}</p>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <p>テスト用ログイン情報:</p>
            <p>担当者コード: TEST001</p>
            <p>パスワード: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

