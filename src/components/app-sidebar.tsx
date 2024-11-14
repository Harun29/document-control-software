"use client"

import * as React from "react"
import {
  BookOpen,
  History,
  Settings2,
  User2,
  Users2,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Harun",
    email: "harun@dcs.ba",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "DCS",
      logo: "dcs-logo.png",
      plan: "Administrator",
    }
  ],
  navMain: [
    {
      title: "Organizations",
      url: "#",
      icon: Users2,
      isActive: true,
      items: [
        {
          title: "Create organization",
          url: "#",
        },
        {
          title: "Manage organizations",
          url: "#",
        },
      ],
    },
    {
      title: "Users",
      url: "#",
      icon: User2,
      items: [
        {
          title: "Create user",
          url: "#",
        },
        {
          title: "Manage users",
          url: "#",
        }
      ],
    },
    {
      title: "History",
      url: "#",
      icon: History
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        }
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2
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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
