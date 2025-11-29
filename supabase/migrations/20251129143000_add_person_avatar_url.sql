-- Migration: Add avatar_url column to people table and setup storage bucket RLS policies
-- Date: 2025-11-29
-- Description: Adds profile photo capability for person records

-- ============================================================================
-- 1. ADD avatar_url COLUMN TO PEOPLE TABLE
-- ============================================================================

ALTER TABLE people
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN people.avatar_url IS 'Storage path to profile photo in person-avatars bucket (e.g., parish_id/person_id.jpg)';

-- ============================================================================
-- 2. STORAGE BUCKET RLS POLICIES
-- Note: The bucket "person-avatars" must be created manually via Supabase Dashboard
-- or CLI: supabase storage buckets create person-avatars --private
-- ============================================================================

-- SELECT Policy: Parish members can view their parish person avatars
CREATE POLICY "Parish members can view their parish person avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'person-avatars'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
  )
);

-- INSERT Policy: Parish members can upload avatars for their parish
CREATE POLICY "Parish members can upload avatars for their parish"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'person-avatars'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
  )
);

-- UPDATE Policy: Parish members can update avatars for their parish
CREATE POLICY "Parish members can update avatars for their parish"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'person-avatars'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
  )
);

-- DELETE Policy: Parish members can delete avatars for their parish
CREATE POLICY "Parish members can delete avatars for their parish"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'person-avatars'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
  )
);
