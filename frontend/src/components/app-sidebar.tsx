"use client"

import { Building2, FileSpreadsheet, LayoutDashboard, Plane } from "lucide-react"
import * as React from "react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar"

// Export the navItems so we can use them in the layout
export const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "RFQs",
    url: "/rfq",
    icon: FileSpreadsheet,
  },
  {
    title: "Company Profile",
    url: "/company",
    icon: Building2,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Plane className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
            TenderPilot
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
