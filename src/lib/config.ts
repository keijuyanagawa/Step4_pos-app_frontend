import posConfig from '@/config/pos-config.json';

export interface POSConfig {
  store_code: string;
  pos_machine_id: string;
  store_name: string;
  api_endpoints: {
    login: string;
    product_search: string;
    purchase: string;
    health: string;
  };
  ui_settings: {
    auto_logout_minutes: number;
    barcode_scan_timeout_seconds: number;
    currency: string;
    decimal_places: number;
  };
}

export const getConfig = (): POSConfig => {
  return posConfig as POSConfig;
};

export const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

export const buildApiEndpoint = (endpoint: keyof POSConfig['api_endpoints']) => {
  const config = getConfig();
  return `${getApiUrl()}${config.api_endpoints[endpoint]}`;
};
