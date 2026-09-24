import { apiRequest } from '@/lib/api-client'

import {
  modifierOptionSchema,
  productModifierGroupResponseSchema,
  productModifierGroupsResponseSchema,
  type ModifierOption,
  type ProductModifierGroup,
} from '../schemas/product-modifier-group.schema'

export function getProductModifierGroups(productId: string, accessToken: string) {
  return apiRequest(
    `/api/menu/products/${productId}/modifier-groups`,
    productModifierGroupsResponseSchema,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )
}

export function getModifierGroups(accessToken: string) {
  return apiRequest('/api/menu/modifier-groups', productModifierGroupsResponseSchema, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export function linkModifierGroupToProduct(
  productId: string,
  modifierGroupId: string,
  accessToken: string,
) {
  return apiRequest(
    `/api/menu/products/${productId}/modifier-groups`,
    productModifierGroupsResponseSchema,
    {
      method: 'POST',
      body: JSON.stringify({ modifierGroupId }),
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )
}

export function unlinkModifierGroupFromProduct(
  productId: string,
  modifierGroupId: string,
  accessToken: string,
) {
  return apiRequest(
    `/api/menu/products/${productId}/modifier-groups/${modifierGroupId}`,
    productModifierGroupsResponseSchema,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )
}

export function updateProductModifierGroup(
  id: string,
  input: Partial<Pick<ProductModifierGroup, 'displayOrder' | 'minSelections' | 'maxSelections'>>,
  accessToken: string,
) {
  return apiRequest(`/api/menu/modifier-groups/${id}`, productModifierGroupResponseSchema, {
    method: 'PATCH',
    body: JSON.stringify(input),
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export function reorderProductModifierGroups(groups: ProductModifierGroup[], accessToken: string) {
  return Promise.all(
    groups.map((group, displayOrder) =>
      updateProductModifierGroup(group.id, { displayOrder }, accessToken),
    ),
  )
}

export function reorderModifierOptions(
  groupId: string,
  options: ModifierOption[],
  accessToken: string,
) {
  return apiRequest(
    `/api/menu/modifier-groups/${groupId}/options`,
    z.object({ success: z.literal(true), data: z.array(modifierOptionSchema) }),
    {
      method: 'PATCH',
      body: JSON.stringify({
        data: options.map((option, displayOrder) => ({ id: option.id, displayOrder })),
      }),
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )
}
import { z } from 'zod'
