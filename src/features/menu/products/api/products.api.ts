import { apiRequest } from '@/lib/api-client'

import { productResponseSchema, productsResponseSchema, type ProductInput } from '../schemas/product.schema'

export function getProducts(categoryId: string, accessToken: string) {
  return apiRequest(`/api/menu/products/${categoryId}?limit=50`, productsResponseSchema, { headers: { Authorization: `Bearer ${accessToken}` } })
}

export function createProduct(input: ProductInput, accessToken: string) {
  return apiRequest('/api/menu/products', productResponseSchema, { method: 'POST', body: JSON.stringify(input), headers: { Authorization: `Bearer ${accessToken}` } })
}

export function deleteProduct(id: string, accessToken: string) {
  return apiRequest(`/api/menu/products/${id}`, productResponseSchema, { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } })
}
