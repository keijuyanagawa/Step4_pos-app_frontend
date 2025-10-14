'use client';

import { useState } from 'react';
import { POSState } from '@/hooks/usePOS';
import { getConfig } from '@/lib/config';
import { ProductResponse, PurchaseResponse, CartItem } from '@/lib/api';
import BarcodeScanner from './BarcodeScanner';

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
  const [showScanner, setShowScanner] = useState(false);
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

  const handleOpenScanner = () => {
    setShowScanner(true);
  };

  const handleBarcodeDetected = async (detectedBarcode: string) => {
    console.log('=== Starting Product Search ===');
    console.log('Barcode value:', detectedBarcode);
    console.log('Barcode length:', detectedBarcode.length);
    console.log('Barcode characters:', detectedBarcode.split('').map((c, i) => `${i}:${c}(${c.charCodeAt(0)})`).join(' '));
    
    try {
      const product = await searchProduct(detectedBarcode);
      if (product) {
        console.log('Product found:', product);
        addToCart(product);
      }
    } catch (error) {
      console.error('Product search error:', error);
      // エラー時にバーコード値を表示
      setError(`商品が見つかりません (バーコード: ${detectedBarcode})`);
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#ffffff' }}>
      {/* ヘッダー */}
      <header 
        className="border-b px-4 py-3 flex justify-between items-center"
        style={{ 
          backgroundColor: '#ffffff',
          borderColor: '#d1d5db'
        }}
      >
        <h1 className="text-xl font-bold text-gray-900">
          担当者: {posState.cashierName}
        </h1>
        <button className="text-gray-600 hover:text-gray-900 text-2xl">
          ⚙️
        </button>
      </header>

      {/* メインコンテンツエリア */}
      <div className="flex-1 overflow-y-auto pb-4">
        {/* 商品検索エリア */}
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">商品検索</h2>
          
          {/* 検索フォーム */}
          <form onSubmit={handleBarcodeSubmit} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="バーコードを入力してEnterキーを押してください"
                style={{ 
                  backgroundColor: '#ffffff',
                  borderColor: '#d1d5db',
                  color: '#111827'
                }}
                className="flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                disabled={posState.isLoading}
              />
              <button
                onClick={handleOpenScanner}
                type="button"
                className="p-3 rounded-lg text-white text-2xl hover:opacity-90"
                style={{ backgroundColor: '#1e40af' }}
                disabled={posState.isLoading}
              >
                📷
              </button>
            </div>
          </form>

          {/* 検索された商品の表示 */}
          {posState.lastScannedProduct && (
            <div 
              className="p-4 rounded-lg flex items-center gap-4 mb-4 border-2"
              style={{ backgroundColor: '#f9fafb', borderColor: '#d1d5db' }}
            >
              <div 
                className="w-20 h-20 rounded-lg flex items-center justify-center text-4xl"
                style={{ backgroundColor: '#e5e7eb' }}
              >
                👕
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{posState.lastScannedProduct.product_name}</h3>
                <p className="text-lg text-gray-700">¥{posState.lastScannedProduct.price_incl_tax.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* エラーメッセージ */}
          {posState.error && (
            <div 
              className="p-3 rounded-lg mb-4 border-2"
              style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5' }}
            >
              <p className="text-red-700 text-sm">エラー: {posState.error}</p>
            </div>
          )}
        </div>

        {/* カートエリア */}
        <div className="px-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">カート</h2>
          
          {posState.cartItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">商品をスキャンしてください</p>
          ) : (
            <div className="space-y-3">
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
      </div>

      {/* 合計と購入ボタン（固定） */}
      {posState.cartItems.length > 0 && (
        <div 
          className="fixed bottom-0 left-0 right-0 border-t-2 p-4"
          style={{ 
            backgroundColor: '#ffffff',
            borderColor: '#d1d5db'
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-gray-900">合計</span>
            <span className="text-2xl font-bold text-gray-900">
              {config.ui_settings.currency}{totals.totalInclTax.toLocaleString()}
            </span>
          </div>
          <button
            onClick={handlePurchase}
            disabled={posState.isLoading}
            className="w-full py-3 rounded-lg text-white font-semibold text-lg hover:opacity-90"
            style={{ backgroundColor: '#1e40af' }}
          >
            {posState.isLoading ? '処理中...' : '購入'}
          </button>
        </div>
      )}

      {/* 購入完了モーダル */}
      {showPurchaseResult && (
        <PurchaseResultModal
          result={showPurchaseResult}
          onClose={closePurchaseResult}
          currency={config.ui_settings.currency}
        />
      )}

      {/* バーコードスキャナーモーダル */}
      <BarcodeScanner
        isOpen={showScanner}
        onDetected={handleBarcodeDetected}
        onClose={() => setShowScanner(false)}
      />
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
    <div 
      className="p-4 rounded-lg flex items-center gap-3 border-2"
      style={{ backgroundColor: '#f9fafb', borderColor: '#d1d5db' }}
    >
      {/* 商品名と単価 */}
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 text-sm mb-1">{item.product_name}</h4>
        <p className="text-xs text-gray-600">
          {currency}{item.unit_price.toLocaleString()}
        </p>
      </div>

      {/* 数量調整ボタン */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(item.barcode, item.quantity - 1)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold hover:opacity-90"
          style={{ backgroundColor: '#1e40af' }}
        >
          -
        </button>
        <span className="w-8 text-center text-gray-900 font-semibold">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.barcode, item.quantity + 1)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold hover:opacity-90"
          style={{ backgroundColor: '#1e40af' }}
        >
          +
        </button>
      </div>

      {/* 合計金額 */}
      <div className="text-right w-20">
        <div className="text-base font-semibold text-gray-900">
          {currency}{item.subtotal_incl_tax.toLocaleString()}
        </div>
      </div>

      {/* 削除ボタン */}
      <button
        onClick={() => onRemove(item.barcode)}
        className="text-gray-500 hover:text-red-600 text-xl"
      >
        🗑️
      </button>
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
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div 
        className="p-8 rounded-lg max-w-md w-full mx-4 border-2"
        style={{ backgroundColor: '#ffffff', borderColor: '#d1d5db' }}
      >
        <div className="text-center">
          {/* チェックアイコン */}
          <div className="flex justify-center mb-4">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#1e40af' }}
            >
              <span className="text-white text-4xl">✓</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-gray-900">購入が完了しました</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-base text-gray-600">
              <span>合計金額（税込）</span>
              <span className="text-gray-900 font-semibold">
                {currency}{result.total_amount_incl_tax?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-base text-gray-600">
              <span>合計金額（税抜）</span>
              <span className="text-gray-900 font-semibold">
                {currency}{result.total_amount_excl_tax?.toLocaleString()}
              </span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg text-white font-semibold text-lg hover:opacity-90"
            style={{ backgroundColor: '#1e40af' }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
