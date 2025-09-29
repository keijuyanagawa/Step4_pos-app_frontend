'use client';

import { usePOS } from '@/hooks/usePOS';
import LoginForm from '@/components/LoginForm';
import POSScreen from '@/components/POSScreen';

export default function Home() {
  const pos = usePOS();

  if (!pos.state.isLoggedIn) {
    return (
      <LoginForm
        onLogin={pos.login}
        isLoading={pos.state.isLoading}
        error={pos.state.error}
      />
    );
  }

  return (
    <POSScreen
      posState={pos.state}
      searchProduct={pos.searchProduct}
      addToCart={pos.addToCart}
      updateCartItemQuantity={pos.updateCartItemQuantity}
      removeFromCart={pos.removeFromCart}
      completePurchase={pos.completePurchase}
      getTotals={pos.getTotals}
      logout={pos.logout}
      setError={pos.setError}
    />
  );
}

