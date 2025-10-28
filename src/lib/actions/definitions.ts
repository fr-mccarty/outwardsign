'use server'

import { getDefaultPromptTemplate } from '@/lib/template-utils'

export async function savePromptTemplate(template: string) {
  // Custom templates are not supported - this function is deprecated
  throw new Error('Custom prompt templates are not supported')
}

export async function getPromptTemplate(): Promise<string> {
  return getDefaultPromptTemplate()
}