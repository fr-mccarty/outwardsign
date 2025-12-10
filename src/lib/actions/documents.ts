'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { requireEditSharedResources } from '@/lib/auth/permissions'
import type { Document } from '@/lib/types'

// Allowed file types for documents
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif'
]

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * Upload a document to Supabase Storage and create database record
 *
 * Note: This function expects to be called from a client component that handles File objects.
 * Server actions can accept File objects in Next.js 15+.
 */
export async function uploadDocument(
  file: File,
  parishId?: string
): Promise<Document> {
  const selectedParishId = parishId || await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error(
      `File type ${file.type} is not allowed. Allowed types: PDF, Word, Excel, PowerPoint, plain text, and images.`
    )
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of 10MB`
    )
  }

  // Generate unique document ID
  const documentId = crypto.randomUUID()

  // Create file path: {parish_id}/{document_id}/{filename}
  const filePath = `${selectedParishId}/${documentId}/${file.name}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('event-documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    console.error('Error uploading document to storage:', uploadError)
    throw new Error(`Failed to upload document: ${uploadError.message}`)
  }

  // Insert document record into database
  const { data: document, error: dbError } = await supabase
    .from('documents')
    .insert([
      {
        id: documentId,
        parish_id: selectedParishId,
        file_path: filePath,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size
      }
    ])
    .select()
    .single()

  if (dbError) {
    console.error('Error creating document record:', dbError)
    // Try to clean up uploaded file
    await supabase.storage
      .from('event-documents')
      .remove([filePath])
    throw new Error('Failed to create document record')
  }

  return document
}

/**
 * Get a signed URL for downloading a document
 * Signed URLs expire after 60 minutes
 */
export async function getDocumentSignedUrl(documentId: string): Promise<string> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Fetch document record
  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Document not found')
    }
    console.error('Error fetching document:', error)
    throw new Error('Failed to fetch document')
  }

  // Get signed URL from Supabase Storage (expires in 60 minutes)
  const { data: signedUrlData, error: urlError } = await supabase.storage
    .from('event-documents')
    .createSignedUrl(document.file_path, 3600) // 3600 seconds = 60 minutes

  if (urlError) {
    console.error('Error creating signed URL:', urlError)
    throw new Error('Failed to create download URL')
  }

  if (!signedUrlData?.signedUrl) {
    throw new Error('Failed to generate signed URL')
  }

  return signedUrlData.signedUrl
}

/**
 * Delete a document from storage and database
 *
 * Note: This will NOT automatically update events that reference this document.
 * Field values in events will contain an invalid document ID after deletion.
 */
export async function deleteDocument(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  // Fetch document to get file_path
  const { data: document, error: fetchError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      throw new Error('Document not found')
    }
    console.error('Error fetching document:', fetchError)
    throw new Error('Failed to fetch document')
  }

  // Delete from Supabase Storage
  const { error: storageError } = await supabase.storage
    .from('event-documents')
    .remove([document.file_path])

  if (storageError) {
    console.error('Error deleting document from storage:', storageError)
    // Continue with database deletion even if storage deletion fails
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('parish_id', selectedParishId)

  if (dbError) {
    console.error('Error deleting document from database:', dbError)
    throw new Error('Failed to delete document')
  }
}

/**
 * Get document metadata by ID
 */
export async function getDocument(id: string): Promise<Document | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching document:', error)
    throw new Error('Failed to fetch document')
  }

  return data
}
