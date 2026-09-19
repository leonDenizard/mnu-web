import { apiRequest } from '@/lib/api-client'

import { productResponseSchema, productsResponseSchema, type Product, type ProductInput, type ProductUpdateInput } from '../schemas/product.schema'

export function getProducts(categoryId: string, accessToken: string) {
  return apiRequest(`/api/menu/products/${categoryId}?limit=50`, productsResponseSchema, { headers: { Authorization: `Bearer ${accessToken}` } })
}

export function createProduct(input: ProductInput, accessToken: string) {
  return apiRequest('/api/menu/products', productResponseSchema, { method: 'POST', body: JSON.stringify(input), headers: { Authorization: `Bearer ${accessToken}` } })
}

export function deleteProduct(id: string, accessToken: string) {
  return apiRequest(`/api/menu/products/${id}`, productResponseSchema, { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } })
}

export function updateProduct(id: string, input: ProductUpdateInput, accessToken: string) {
  return apiRequest(`/api/menu/products/${id}`, productResponseSchema, { method: 'PATCH', body: JSON.stringify(input), headers: { Authorization: `Bearer ${accessToken}` } })
}

export function reorderProducts(products: Product[], accessToken: string) {
  return Promise.all(products.map((product, displayOrder) => updateProduct(product.id, {
    name: product.name,
    price: product.price ?? 0,
    categoryId: product.categoryId,
    active: product.active,
    displayOrder,
    ...(product.description ? { description: product.description } : {}),
    ...(product.image ? { image: product.image } : {}),
    ...(product.promotionalPrice !== null ? { promotionalPrice: product.promotionalPrice ?? undefined } : {}),
  }, accessToken)))
}
