export interface ProductImage {
  id: number;
  src: string;
  thumbnail?: string;
  name?: string;
  alt?: string;
  srcset?: string;
  sizes?: string;
  [key: string]: any;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  link?: string;
  parent?: number;
  count?: number;
  description?: string;
  image?: any;
  [key: string]: any;
}

export interface ProductAttributeTerm {
  id: number;
  name: string;
  slug: string;
  default?: boolean;
  [key: string]: any;
}

export interface ProductAttribute {
  id: number;
  name: string;
  taxonomy: string | null;
  has_variations: boolean;
  terms: ProductAttributeTerm[];
  [key: string]: any;
}

export interface ProductPrices {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_code?: string;
  currency_symbol?: string;
  currency_prefix?: string;
  currency_suffix?: string;
  price_range?: any;
  [key: string]: any;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink?: string;
  sku?: string;
  short_description?: string;
  description?: string;
  on_sale: boolean;
  prices: ProductPrices;
  price_html?: string;
  average_rating?: string;
  review_count?: number;
  images: ProductImage[];
  categories: ProductCategory[];
  attributes: ProductAttribute[];
  is_in_stock: boolean;
  [key: string]: any;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}
