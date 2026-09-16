'use client'

import { useMutation } from '@tanstack/react-query'

import { importAnotaAiMenu } from '../api/anota-ai-import.api'

export function useImportAnotaAiMenu() {
  return useMutation({
    mutationFn: ({ file, accessToken }: { file: File, accessToken: string }) => importAnotaAiMenu(file, accessToken)
  })
}
