import { apiRequest } from '@/lib/api-client'

import { categoriesResponseSchema, categoryResponseSchema, type CategoryInput } from '../schemas/category.schema'

export function getCategories(accessToken: string) {
  return apiRequest('/api/menu/categories?limit=50', categoriesResponseSchema, { headers: { Authorization: `Bearer ${accessToken}` } })
}

export function createCategory(input: CategoryInput, accessToken: string) {
  return apiRequest('/api/menu/categories', categoryResponseSchema, { method: 'POST', body: JSON.stringify(input), headers: { Authorization: `Bearer ${accessToken}` } })
}

export function updateCategory(id: string, input: CategoryInput, accessToken: string) {
  return apiRequest(`/api/menu/categories/${id}`, categoryResponseSchema, { method: 'PATCH', body: JSON.stringify(input), headers: { Authorization: `Bearer ${accessToken}` } })
}

export function deleteCategory(id: string, accessToken: string) {
  return apiRequest(`/api/menu/categories/${id}`, categoryResponseSchema, { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } })
}
