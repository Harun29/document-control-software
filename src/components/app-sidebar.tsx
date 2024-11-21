"use client";

import * as React from "react";
import { BookOpen, History, Settings2, User2, Users2 } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { useRef, useState, useEffect } from "react";
import CreateUserCard from "@/components/create-user-card";
import CreateOrgCard from "@/components/create-org-card";

// Sample Data
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
    },
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
          action: "createOrg",
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
          action: "createUser",
        },
        {
          title: "Manage users",
          url: "#",
        },
      ],
    },
    {
      title: "History",
      url: "#",
      icon: History,
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
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [createUser, setCreateUser] = useState(false);
  const [createOrg, setCreateOrg] = useState(false);
  const createOrgRef = useRef<HTMLDivElement | null>(null);
  const createUserRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: MouseEvent) => {
    const clickedOutsideUser =
      createUserRef.current &&
      !createUserRef.current.contains(event.target as Node);
    const clickedOutsideOrg =
      createOrgRef.current &&
      !createOrgRef.current.contains(event.target as Node);

    if (clickedOutsideUser) setCreateUser(false);
    if (clickedOutsideOrg) setCreateOrg(false);
  };

  useEffect(() => {
    if (createUser || createOrg) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [createUser, createOrg]);

  const handleNavAction = (action: string) => {
    if (action === "createUser") setCreateUser(true);
    if (action === "createOrg") setCreateOrg(true);
  };

  const navItems = data.navMain.map((item) => ({
    ...item,
    items: item.items?.map((subItem) => ({
      ...subItem,
      action: subItem.title.toLowerCase().includes("user")
        ? "createUser"
        : subItem.title.toLowerCase().includes("organization")
        ? "createOrg"
        : undefined,
    })),
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} onAction={handleNavAction} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
      {createUser && <CreateUserCard ref={createUserRef} />}
      {createOrg && <CreateOrgCard ref={createOrgRef} />}
    </Sidebar>
  );
}

