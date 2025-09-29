'use client';

import { useState } from 'react';
import { POSState, usePOS } from '@/hooks/usePOS';
import { getConfig } from '@/lib/config';
import { ProductResponse, PurchaseResponse, CartItem } from '@/lib/api';

interface POSScreenProps {
  posState: POSState;
  searchProduct: (barcode: string) => Promise<ProductResponse | null>;
  addToCart: (product: ProductResponse, quantity?: number) => void;
  updateCartItemQuantity: (barcode: string, quantity: number) => void;
  removeFromCart: (barcode: string) => void;
  completePurchase: () => Promise<PurchaseResponse | null>;
  getTotals: () => { totalExclTax: number; totalTax: number; totalInclTax: number; itemCount: number };
  logout: () => void;
  setError: (error: string | null) => void;
}

export default function POSScreen({
  posState,
  searchProduct,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  completePurchase,
  getTotals,
  logout,
  setError
}: POSScreenProps) {
  const [barcode, setBarcode] = useState('');
  const [showPurchaseResult, setShowPurchaseResult] = useState<PurchaseResponse | null>(null);
  const config = getConfig();
  const totals = getTotals();

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    const product = await searchProduct(barcode.trim());
    if (product) {
      addToCart(product);
      setBarcode('');
    }
  };

  const handlePurchase = async () => {
    const result = await completePurchase();
    if (result) {
      setShowPurchaseResult(result);
    }
  };

  const closePurchaseResult = () => {
    setShowPurchaseResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{config.store_name}</h1>
            <p className="text-sm text-gray-500">
              担当者: {posState.cashierName} | POS機: {config.pos_machine_id}
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ログアウト
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* 左側: 商品スキャン・検索エリア */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">商品スキャン</h2>
            
            <form onSubmit={handleBarcodeSubmit} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="バーコードを入力してください"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={posState.isLoading}
                />
                <button
                  type="submit"
                  disabled={posState.isLoading || !barcode.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {posState.isLoading ? '検索中...' : '検索'}
                </button>
              </div>
            </form>

            {/* カメラスキャンボタン（将来実装予定） */}
            <button
              className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
              disabled
            >
              📷 カメラでスキャン（準備中）
            </button>

            {/* エラーメッセージ */}
            {posState.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{posState.error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-red-600 hover:text-red-800 text-xs"
                >
                  ✕ 閉じる
                </button>
              </div>
            )}

            {/* 最後にスキャンした商品 */}
            {posState.lastScannedProduct && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-semibold text-green-800">商品が見つかりました</h3>
                <p className="text-green-700">{posState.lastScannedProduct.product_name}</p>
                <p className="text-green-600">
                  {config.ui_settings.currency}{posState.lastScannedProduct.price_incl_tax.toLocaleString()}
                  （税込）
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 右側: カート・会計エリア */}
        <div className="w-96 bg-white shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">購入リスト</h2>
          
          {/* カート商品一覧 */}
          <div className="mb-6 max-h-96 overflow-y-auto">
            {posState.cartItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">商品をスキャンしてください</p>
            ) : (
              <div className="space-y-2">
                {posState.cartItems.map((item) => (
                  <CartItemRow
                    key={item.barcode}
                    item={item}
                    onUpdateQuantity={updateCartItemQuantity}
                    onRemove={removeFromCart}
                    currency={config.ui_settings.currency}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 合計金額 */}
          {posState.cartItems.length > 0 && (
            <>
              <div className="border-t pt-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>小計（税抜）:</span>
                  <span>{config.ui_settings.currency}{totals.totalExclTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>消費税:</span>
                  <span>{config.ui_settings.currency}{totals.totalTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>合計:</span>
                  <span>{config.ui_settings.currency}{totals.totalInclTax.toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-500">
                  商品数: {totals.itemCount}点
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={posState.isLoading}
                className="w-full py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-semibold"
              >
                {posState.isLoading ? '処理中...' : '購入'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 購入完了モーダル */}
      {showPurchaseResult && (
        <PurchaseResultModal
          result={showPurchaseResult}
          onClose={closePurchaseResult}
          currency={config.ui_settings.currency}
        />
      )}
    </div>
  );
}

// カートアイテム行コンポーネント
function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
  currency
}: {
  item: CartItem;
  onUpdateQuantity: (barcode: string, quantity: number) => void;
  onRemove: (barcode: string) => void;
  currency: string;
}) {
  return (
    <div className="p-3 border border-gray-200 rounded-md">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-sm">{item.product_name}</h4>
        <button
          onClick={() => onRemove(item.barcode)}
          className="text-red-500 hover:text-red-700 text-xs"
        >
          削除
        </button>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.barcode, item.quantity - 1)}
            className="w-6 h-6 bg-gray-200 rounded text-xs hover:bg-gray-300"
          >
            -
          </button>
          <span className="w-8 text-center text-sm">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.barcode, item.quantity + 1)}
            className="w-6 h-6 bg-gray-200 rounded text-xs hover:bg-gray-300"
          >
            +
          </button>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-medium">
            {currency}{item.subtotal_incl_tax.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            @{currency}{item.unit_price.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

// 購入完了モーダル
function PurchaseResultModal({
  result,
  onClose,
  currency
}: {
  result: PurchaseResponse;
  onClose: () => void;
  currency: string;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-4 text-green-600">購入完了</h2>
          
          <div className="space-y-2 mb-6">
            <p className="text-lg">
              <span className="font-semibold">合計金額（税込）:</span><br />
              <span className="text-2xl font-bold text-green-600">
                {currency}{result.total_amount_incl_tax?.toLocaleString()}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              税抜: {currency}{result.total_amount_excl_tax?.toLocaleString()}<br />
              消費税: {currency}{result.total_tax_amount?.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              取引ID: {result.transaction_id}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
