'use client';

import { useState, useCallback } from 'react';
import { POSApi, CartItem, ProductResponse } from '@/lib/api';
import { getConfig } from '@/lib/config';

export interface POSState {
  // 認証状態
  isLoggedIn: boolean;
  cashierCode: string;
  cashierName: string;
  token: string;
  
  // カート状態
  cartItems: CartItem[];
  
  // UI状態
  isLoading: boolean;
  error: string | null;
  
  // 商品検索状態
  lastScannedProduct: ProductResponse | null;
}

export const usePOS = () => {
  const [state, setState] = useState<POSState>({
    isLoggedIn: false,
    cashierCode: '',
    cashierName: '',
    token: '',
    cartItems: [],
    isLoading: false,
    error: null,
    lastScannedProduct: null,
  });

  const config = getConfig();

  // エラー設定
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // ローディング設定
  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  // ログイン
  const login = useCallback(async (cashierCode: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await POSApi.login({ cashier_code: cashierCode, password });
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          isLoggedIn: true,
          cashierCode,
          cashierName: response.cashier_name || '',
          token: response.token || '',
        }));
        return true;
      } else {
        setError(response.message);
        return false;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ログインエラーが発生しました');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // ログアウト
  const logout = useCallback(() => {
    setState({
      isLoggedIn: false,
      cashierCode: '',
      cashierName: '',
      token: '',
      cartItems: [],
      isLoading: false,
      error: null,
      lastScannedProduct: null,
    });
  }, []);

  // 商品検索
  const searchProduct = useCallback(async (barcode: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const product = await POSApi.searchProduct(barcode);
      setState(prev => ({ ...prev, lastScannedProduct: product }));
      return product;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '商品検索エラーが発生しました';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // カートに商品追加
  const addToCart = useCallback((product: ProductResponse, quantity: number = 1) => {
    setState(prev => {
      const existingItemIndex = prev.cartItems.findIndex(item => item.barcode === product.barcode);
      
      if (existingItemIndex >= 0) {
        // 既存商品の数量を増加
        const updatedItems = [...prev.cartItems];
        const existingItem = updatedItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          subtotal_excl_tax: product.unit_price * newQuantity,
          tax_amount: Math.floor(product.unit_price * newQuantity * product.tax_rate),
          subtotal_incl_tax: product.unit_price * newQuantity + Math.floor(product.unit_price * newQuantity * product.tax_rate),
        };
        
        return { ...prev, cartItems: updatedItems };
      } else {
        // 新規商品追加
        const newItem: CartItem = {
          barcode: product.barcode,
          product_name: product.product_name,
          unit_price: product.unit_price,
          quantity,
          tax_code: product.tax_code,
          tax_rate: product.tax_rate,
          subtotal_excl_tax: product.unit_price * quantity,
          tax_amount: Math.floor(product.unit_price * quantity * product.tax_rate),
          subtotal_incl_tax: product.unit_price * quantity + Math.floor(product.unit_price * quantity * product.tax_rate),
        };
        
        return { ...prev, cartItems: [...prev.cartItems, newItem] };
      }
    });
  }, []);

  // カート商品数量更新
  const updateCartItemQuantity = useCallback((barcode: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(barcode);
      return;
    }
    
    setState(prev => {
      const updatedItems = prev.cartItems.map(item => {
        if (item.barcode === barcode) {
          return {
            ...item,
            quantity,
            subtotal_excl_tax: item.unit_price * quantity,
            tax_amount: Math.floor(item.unit_price * quantity * item.tax_rate),
            subtotal_incl_tax: item.unit_price * quantity + Math.floor(item.unit_price * quantity * item.tax_rate),
          };
        }
        return item;
      });
      
      return { ...prev, cartItems: updatedItems };
    });
  }, []);

  // カートから商品削除
  const removeFromCart = useCallback((barcode: string) => {
    setState(prev => ({
      ...prev,
      cartItems: prev.cartItems.filter(item => item.barcode !== barcode)
    }));
  }, []);

  // カートクリア
  const clearCart = useCallback(() => {
    setState(prev => ({ ...prev, cartItems: [] }));
  }, []);

  // 購入確定
  const completePurchase = useCallback(async () => {
    if (state.cartItems.length === 0) {
      setError('カートが空です');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await POSApi.purchase({
        store_code: config.store_code,
        pos_machine_id: config.pos_machine_id,
        cashier_code: state.cashierCode,
        cart_items: state.cartItems,
      });
      
      if (response.success) {
        clearCart();
        return response;
      } else {
        setError(response.message);
        return null;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '購入処理エラーが発生しました');
      return null;
    } finally {
      setLoading(false);
    }
  }, [state.cartItems, state.cashierCode, config, clearCart, setLoading, setError]);

  // 合計金額計算
  const getTotals = useCallback(() => {
    const totalExclTax = state.cartItems.reduce((sum, item) => sum + item.subtotal_excl_tax, 0);
    const totalTax = state.cartItems.reduce((sum, item) => sum + item.tax_amount, 0);
    const totalInclTax = state.cartItems.reduce((sum, item) => sum + item.subtotal_incl_tax, 0);
    
    return {
      totalExclTax,
      totalTax,
      totalInclTax,
      itemCount: state.cartItems.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [state.cartItems]);

  return {
    state,
    login,
    logout,
    searchProduct,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    completePurchase,
    getTotals,
    setError,
  };
};



