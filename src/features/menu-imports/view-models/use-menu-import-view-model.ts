'use client'

import { useRef, useState } from 'react'

import { ApiError } from '@/lib/api-client'

import { useAuthSessionStore } from '@/features/auth/store/auth-session.store'

import { useImportAnotaAiMenu } from '../hooks/use-import-anota-ai-menu'
import type { AnotaAiImportResult } from '../schemas/anota-ai-import.schema'

const MAX_FILE_SIZE = 5 * 1024 * 1024

function validateFile(file: File) {
  if (!file.name.toLowerCase().endsWith('.xlsx')) return 'Selecione um arquivo .xlsx exportado pela Anota AI.'
  if (file.size > MAX_FILE_SIZE) return 'O arquivo deve ter no máximo 5 MB.'
  return null
}

export function useMenuImportViewModel() {
  const session = useAuthSessionStore((state) => state.session)
  const mutation = useImportAnotaAiMenu()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnotaAiImportResult | null>(null)

  function chooseFile(candidate: File | null) {
    setResult(null)
    if (!candidate) {
      setFile(null)
      setError(null)
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    const validationError = validateFile(candidate)
    if (validationError) {
      setFile(null)
      setError(validationError)
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setFile(candidate)
    setError(null)
  }

  async function submit() {
    if (!file) {
      setError('Selecione o arquivo do cardápio para continuar.')
      return
    }
    if (!session) {
      setError('Sua sessão expirou. Entre novamente para importar o cardápio.')
      return
    }

    setError(null)
    setResult(null)
    try {
      const response = await mutation.mutateAsync({ file, accessToken: session.accessToken })
      setResult(response.data)
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : 'Não foi possível importar o cardápio. Tente novamente.')
    }
  }

  return {
    file,
    error,
    result,
    inputRef,
    isImporting: mutation.isPending,
    chooseFile,
    submit
  }
}
