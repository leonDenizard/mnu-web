'use client'

import { useMutation } from '@tanstack/react-query'

import { createWebOnboarding } from '../api/onboarding.api'

export function useCreateWebOnboarding() {
  return useMutation({ mutationFn: createWebOnboarding })
}
