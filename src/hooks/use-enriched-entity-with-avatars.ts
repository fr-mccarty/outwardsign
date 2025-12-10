"use client"

import { useMemo } from 'react'
import { useAvatarUrls } from './use-avatar-urls'

interface PersonWithAvatar {
  id: string
  avatar_url?: string | null
  [key: string]: any
}

/**
 * Hook to enrich an entity with signed avatar URLs for use in content builders
 *
 * This hook:
 * 1. Extracts people from the entity who have avatars
 * 2. Fetches signed URLs for those avatars using useAvatarUrls
 * 3. Returns a copy of the entity with avatar_url fields replaced with signed URLs
 *
 * @param entity - The entity to enrich (e.g., wedding, funeral, baptism)
 * @param getPeopleFromEntity - Function to extract array of people with avatars from entity
 * @param enrichEntity - Function to create enriched copy of entity with signed URLs
 * @returns Enriched entity with signed avatar URLs
 *
 * @example
 * // For Weddings
 * const enrichedWedding = useEnrichedEntityWithAvatars(
 *   wedding,
 *   (w) => [w.bride, w.groom].filter(Boolean) as PersonWithAvatar[],
 *   (w, avatarUrls) => ({
 *     ...w,
 *     bride: w.bride && w.bride.id && avatarUrls[w.bride.id] ? {
 *       ...w.bride,
 *       avatar_url: avatarUrls[w.bride.id]
 *     } : w.bride,
 *     groom: w.groom && w.groom.id && avatarUrls[w.groom.id] ? {
 *       ...w.groom,
 *       avatar_url: avatarUrls[w.groom.id]
 *     } : w.groom,
 *   })
 * )
 */
export function useEnrichedEntityWithAvatars<TEntity>(
  entity: TEntity,
  getPeopleFromEntity: (entity: TEntity) => PersonWithAvatar[],
  enrichEntity: (entity: TEntity, avatarUrls: Record<string, string>) => TEntity
): TEntity {
  // Extract people with avatars from entity
  const people = useMemo(
    () => getPeopleFromEntity(entity),
    [entity, getPeopleFromEntity]
  )

  // Fetch signed URLs for avatars
  const avatarUrls = useAvatarUrls(people)

  // Return enriched entity with signed URLs
  const enrichedEntity = useMemo(
    () => enrichEntity(entity, avatarUrls),
    [entity, avatarUrls, enrichEntity]
  )

  return enrichedEntity
}
