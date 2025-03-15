"use client"

import { Building2, FileSpreadsheet, GalleryVerticalEnd, LayoutDashboard } from "lucide-react"
import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  teams: [
    {
      name: "GetRFQ",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navItems: [
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
      title: "Companies",
      url: "/companies",
      icon: Building2,
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navItems} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
