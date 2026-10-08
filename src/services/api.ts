import { Product, ProductCategory } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../data/mockData';

const BASE_URL = '/api-json/wc/store/v1';
const REMOTE_URL = 'https://www.teniszruha.hu/api-json/wc/store/v1';

let _isLiveConnected = false;
export function isLiveConnectedToStore(): boolean {
  return _isLiveConnected;
}

async function fetchWithFallback<T>(endpoint: string, timeoutMs = 4500): Promise<T | null> {
  const isDev = Boolean(typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV);
  const targets = isDev
    ? [`${BASE_URL}${endpoint}`, `${REMOTE_URL}${endpoint}`]
    : [`${REMOTE_URL}${endpoint}`, `${BASE_URL}${endpoint}`];

  for (const url of targets) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          _isLiveConnected = true;
          return data as T;
        }
      }
    } catch {
      // Continue to next endpoint candidate
    }
  }
  return null;
}

export async function fetchProducts(options?: {
  category?: number;
  search?: string;
  perPage?: number;
}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (options?.perPage) params.append('per_page', options.perPage.toString());
  if (options?.category) params.append('category', options.category.toString());
  if (options?.search) params.append('search', options.search);

  const endpoint = `/products?${params.toString()}`;
  const liveData = await fetchWithFallback<Product[]>(endpoint);
  if (liveData) {
    return liveData;
  }

  // Fallback to local embedded dataset
  let filtered = [...INITIAL_PRODUCTS];
  if (options?.category) {
    filtered = filtered.filter(p => p.categories.some(c => c.id === options.category));
  }
  if (options?.search) {
    const query = options.search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.categories.some(c => c.name.toLowerCase().includes(query)) ||
      p.attributes.some(a => a.terms.some(t => t.name.toLowerCase().includes(query)))
    );
  }
  return filtered;
}

export async function fetchCategories(): Promise<ProductCategory[]> {
  const liveCategories = await fetchWithFallback<ProductCategory[]>('/products/categories?per_page=50');
  if (liveCategories) {
    return liveCategories;
  }
  return INITIAL_CATEGORIES;
}

export function formatPrice(priceStr: string | number): string {
  const num = typeof priceStr === 'string' ? parseInt(priceStr, 10) : priceStr;
  if (isNaN(num)) return '0 Ft';
  return new Intl.NumberFormat('hu-HU').format(num) + ' Ft';
}
