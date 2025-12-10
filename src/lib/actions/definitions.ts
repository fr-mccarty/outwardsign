'use server'

import { getDefaultPromptTemplate } from '@/lib/template-utils'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function savePromptTemplate(_template: string) {
  // Custom templates are not supported - this function is deprecated
  throw new Error('Custom prompt templates are not supported')
}

export async function getPromptTemplate(): Promise<string> {
  return getDefaultPromptTemplate()
}