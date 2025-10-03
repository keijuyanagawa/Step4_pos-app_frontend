import { buildApiEndpoint } from './config';

// データ型定義
export interface LoginRequest {
  cashier_code: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  cashier_name?: string;
  token?: string;
}

export interface ProductResponse {
  barcode: string;
  product_name: string;
  unit_price: number;
  tax_code: string;
  tax_rate: number;
  price_incl_tax: number;
}

export interface CartItem {
  barcode: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  tax_code: string;
  tax_rate: number;
  subtotal_excl_tax: number;
  tax_amount: number;
  subtotal_incl_tax: number;
}

export interface PurchaseRequest {
  store_code: string;
  pos_machine_id: string;
  cashier_code: string;
  cart_items: CartItem[];
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  transaction_id?: string;
  total_amount_excl_tax?: number;
  total_tax_amount?: number;
  total_amount_incl_tax?: number;
}

// API関数
export class POSApi {
  static async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(buildApiEndpoint('login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    return response.json();
  }

  static async searchProduct(barcode: string): Promise<ProductResponse> {
    const response = await fetch(`${buildApiEndpoint('product_search')}/${barcode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('商品がマスタ未登録です');
      }
      throw new Error(`Product search failed: ${response.status}`);
    }

    return response.json();
  }

  static async purchase(request: PurchaseRequest): Promise<PurchaseResponse> {
    const response = await fetch(buildApiEndpoint('purchase'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Purchase failed: ${response.status}`);
    }

    return response.json();
  }

  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(buildApiEndpoint('health'), {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    return response.json();
  }
}



