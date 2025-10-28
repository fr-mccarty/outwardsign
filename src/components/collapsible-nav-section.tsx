"use client"

import { useState } from "react"
import { LucideIcon, ChevronRight, ChevronDown } from "lucide-react"
import Link from "next/link"
import * as Collapsible from "@radix-ui/react-collapsible"
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
}

export interface CollapsibleNavSectionProps {
  name: string
  icon: LucideIcon
  items: NavItem[]
  defaultOpen?: boolean
}

export function CollapsibleNavSection({ 
  name, 
  icon: Icon, 
  items, 
  defaultOpen = true 
}: CollapsibleNavSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const { isMobile, setOpenMobile } = useSidebar()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarMenuItem>
      <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
        <Collapsible.Trigger asChild>
          <SidebarMenuButton>
            <Icon />
            <span>{name}</span>
            {isOpen ? (
              <ChevronDown className="ml-auto transition-transform" />
            ) : (
              <ChevronRight className="ml-auto transition-transform" />
            )}
          </SidebarMenuButton>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <SidebarMenuSub>
            {items.map((item) => (
              <SidebarMenuSubItem key={item.title}>
                <SidebarMenuSubButton asChild>
                  <Link href={item.url} onClick={handleLinkClick}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </Collapsible.Content>
      </Collapsible.Root>
    </SidebarMenuItem>
  )
}