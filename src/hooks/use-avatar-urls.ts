"use client";

import { useState, useEffect } from "react";
import { getPersonAvatarSignedUrls } from "@/lib/actions/people";

interface PersonWithAvatar {
  id: string;
  avatar_url?: string | null;
}

/**
 * Hook to fetch signed URLs for person avatars
 *
 * @param people - Array of person objects with avatar_url property
 * @returns Record mapping person.id to signed URL
 *
 * @example
 * const avatarUrls = useAvatarUrls([person1, person2]);
 * <Avatar src={avatarUrls[person.id]} />
 */
export function useAvatarUrls(people: PersonWithAvatar[]) {
  const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchAvatarUrls() {
      // Extract all avatar_url paths from people
      const paths = people
        .filter((p) => p.avatar_url)
        .map((p) => p.avatar_url as string);

      if (paths.length === 0) return;

      try {
        // Call server action to get signed URLs
        const urls = await getPersonAvatarSignedUrls(paths);

        // Map from storage path back to person id
        const urlsByPersonId: Record<string, string> = {};
        people.forEach((person) => {
          if (person.avatar_url && urls[person.avatar_url]) {
            urlsByPersonId[person.id] = urls[person.avatar_url];
          }
        });

        setAvatarUrls(urlsByPersonId);
      } catch (error) {
        console.error("Failed to fetch avatar URLs:", error);
      }
    }

    fetchAvatarUrls();
  }, [people]);

  return avatarUrls;
}
