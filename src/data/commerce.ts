import data from './commerce.json'

/** Real catalog/price facts per storefront, produced by scripts/store-commerce.mjs from the store's
 *  public Shopify endpoints (/meta.json, /products.json, /collections.json). No conversion rate,
 *  revenue or AOV lives here — those are not measured for these stores. */
export interface CommerceProductType {
  type: string
  count: number
}

export interface StoreCommerceLive {
  status: 'live'
  fetchedAt: string
  shopName: string | null
  currency: string | null
  country: string | null
  shipsToCount: number | null
  products: number
  collections: number | null
  priceMin: number | null
  priceMax: number | null
  onSaleShare: number | null // 0–1, share of variants with a real compare-at markdown
  variantsPerProduct: number | null
  productTypes: CommerceProductType[]
}

export interface StoreCommerceUnavailable {
  status: 'protected' | 'unreachable'
  fetchedAt: string
  note?: string
}

export type StoreCommerce = StoreCommerceLive | StoreCommerceUnavailable

export const commerce: Record<string, StoreCommerce> = data as Record<string, StoreCommerce>

export const isLiveCommerce = (c: StoreCommerce | undefined): c is StoreCommerceLive => !!c && c.status === 'live'
