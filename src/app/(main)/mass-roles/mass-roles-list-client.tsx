"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MassRole } from "@/lib/types"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, CheckCircle2, XCircle } from "lucide-react"
import { canAccessModule, type UserParishRole } from "@/lib/auth/permissions-client"

interface MassRolesListClientProps {
  massRoles: MassRole[]
  userParish: UserParishRole
}

export function MassRolesListClient({ massRoles, userParish }: MassRolesListClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const canManageRoles = canAccessModule(userParish, "masses")

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    // Update URL with search param
    const params = new URLSearchParams()
    if (value) params.set("search", value)
    router.push(`/mass-roles${value ? `?${params.toString()}` : ""}`)
  }

  const handleCardClick = (id: string) => {
    router.push(`/mass-roles/${id}`)
  }

  return (
    <PageContainer
      title="Mass Roles"
      description="Define liturgical roles for Mass celebrations"
      actions={
        canManageRoles ? (
          <Link href="/mass-roles/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Mass Role
            </Button>
          </Link>
        ) : undefined
      }
    >
      {/* Search Bar */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search mass roles..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Mass Roles List */}
      {massRoles.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="text-muted-foreground">
              {searchQuery ? (
                <>No mass roles found matching &quot;{searchQuery}&quot;</>
              ) : (
                <>No mass roles defined yet</>
              )}
            </div>
            {!searchQuery && canManageRoles && (
              <Link href="/mass-roles/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Mass Role
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {massRoles.map((role) => (
            <Card
              key={role.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handleCardClick(role.id)}
              data-testid={`mass-role-card-${role.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{role.name}</h3>
                  <Badge variant={role.is_active ? "default" : "secondary"} className="ml-2">
                    {role.is_active ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </div>
                {role.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {role.description}
                  </p>
                )}
                {role.display_order !== null && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Display Order: {role.display_order}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
