"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAvatarUrls } from "@/hooks/use-avatar-urls";
import { cn } from "@/lib/utils";

interface PersonAvatarData {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url?: string | null;
}

interface PersonAvatarGroupProps {
  people: PersonAvatarData[];
  type: "single" | "couple" | "group";
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Display avatars for a person, couple, or group with overlapping layout and tooltips
 *
 * @param people - Array of person objects
 * @param type - Display type: 'single' (1 avatar), 'couple' (2 side by side), 'group' (overlapping)
 * @param maxDisplay - Maximum number of avatars to show for groups (default 3)
 * @param size - Avatar size: 'sm' (8x8), 'md' (10x10), 'lg' (12x12) - default 'md'
 * @param className - Additional CSS classes
 *
 * @example
 * // Single person
 * <PersonAvatarGroup people={[person]} type="single" />
 *
 * // Couple
 * <PersonAvatarGroup people={[bride, groom]} type="couple" />
 *
 * // Group
 * <PersonAvatarGroup people={members} type="group" maxDisplay={3} />
 */
export function PersonAvatarGroup({
  people,
  type,
  maxDisplay = 3,
  size = "md",
  className,
}: PersonAvatarGroupProps) {
  const avatarUrls = useAvatarUrls(people);

  // Get initials from person name
  const getInitials = (person: PersonAvatarData) => {
    const first = person.first_name?.charAt(0) || "";
    const last = person.last_name?.charAt(0) || "";
    return (first + last).toUpperCase() || "?";
  };

  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  // Single person avatar
  if (type === "single" && people.length > 0) {
    const person = people[0];
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar className={cn(sizeClasses[size], className)}>
              <AvatarImage src={avatarUrls[person.id]} alt={person.full_name} />
              <AvatarFallback>{getInitials(person)}</AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p>{person.full_name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Couple avatars (side by side) - each with individual tooltip
  if (type === "couple" && people.length >= 2) {
    const [person1, person2] = people;

    return (
      <TooltipProvider>
        <div className={cn("flex items-center gap-2", className)}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className={sizeClasses[size]}>
                <AvatarImage
                  src={avatarUrls[person1.id]}
                  alt={person1.full_name}
                />
                <AvatarFallback>{getInitials(person1)}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{person1.full_name}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className={sizeClasses[size]}>
                <AvatarImage
                  src={avatarUrls[person2.id]}
                  alt={person2.full_name}
                />
                <AvatarFallback>{getInitials(person2)}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{person2.full_name}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  // Group avatars (overlapping)
  if (type === "group" && people.length > 0) {
    const displayCount = Math.min(people.length, maxDisplay);
    const visiblePeople = people.slice(0, displayCount);
    const remainingCount = people.length - displayCount;

    // Generate tooltip text
    const tooltipText =
      people.length <= 5
        ? people.map((p) => p.full_name).join(", ")
        : `${people.length} people`;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center", className)}>
              <div className="flex -space-x-2">
                {visiblePeople.map((person, index) => (
                  <Avatar
                    key={person.id}
                    className={cn(
                      sizeClasses[size],
                      "border-2 border-card",
                      index === 0 && "z-10",
                      index === 1 && "z-9",
                      index === 2 && "z-8"
                    )}
                  >
                    <AvatarImage
                      src={avatarUrls[person.id]}
                      alt={person.full_name}
                    />
                    <AvatarFallback>{getInitials(person)}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {remainingCount > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  +{remainingCount} more
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Fallback for empty or invalid data
  return null;
}
