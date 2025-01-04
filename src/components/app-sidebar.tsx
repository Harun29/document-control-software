"use client";

import * as React from "react";
import { BookOpen, History, Home, Settings2, User2, Users2 } from "lucide-react";
import { FileTextIcon } from "lucide-react";
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
import { useAuth } from "@/context/AuthContext";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [createUser, setCreateUser] = useState(false);
  const [createOrg, setCreateOrg] = useState(false);
  const createOrgRef = useRef<HTMLDivElement | null>(null);
  const createUserRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();
  const {isAdmin} = useAuth();
  const {isEditor} = useAuth();

  const data = {
    teams: [
      {
        name: "DCS",
        logo: "/dcs-logo.png",
      },
    ],
    navMain: [
      {
        title: "Home",
        url: "/",
        icon: Home,
      },
      ...(isAdmin ? [{ 
        title: "Departmentss",
        icon: Users2,
        isActive: true,
        items: [
          {
            title: "Create departments",
            action: "createOrg",
          },
          {
            title: "Manage departments",
            url: "/orgs",
          },
        ],
      }] : []),
      ...(isAdmin ? [{
        title: "Users",
        icon: User2,
        items: [
          {
            title: "Create user",
            action: "createUser",
          },
          {
            title: "Manage users",
            url: "/users",
          },
        ],
      }] : []),
      ...((isEditor || isAdmin) ? [
        {
        title: "Documents",
        icon: FileTextIcon,
        items:[
          {
            title: "Manage documents",
            url: "/docs",
          },
          {
            title: "Add document",
            url: "/docs/create",
          },
          {
            title: "Document requests",
            url: "/docs/requests",
          }
        ]
        }
      ]:[{
        title: "Documents",
        icon: FileTextIcon,
        items:[
          {
            title: "Add documents",
            url: "/docs/create",
          },
          {
            title: "View documents",
            url: "/docs",
          }
        ]
      }]),
      {
        title: "History",
        url: "/history",
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
    if (action === "createUser") {
      setCreateUser(true);
    } else if (action === "createOrg") {
      setCreateOrg(true);
    } else {
      console.log("Action not implemented");
    }
  };

  const navItems = data.navMain.map((item) => ({
    ...item,
    items: item.items?.map((subItem) => ({
      ...subItem,
      action: subItem.title.toLowerCase().includes("user")
        ? "createUser"
        : subItem.title.toLowerCase().includes("department")
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
        <NavUser user={{
          firstName: user?.userInfo?.firstName ?? "",
          lastName: user?.userInfo?.lastName ?? "",
          email: user?.userInfo?.email ?? "",
          org: user?.userInfo?.org ?? "",
          orgName: user?.userInfo?.orgName ?? "",
          role: user?.userInfo?.role ?? ""
        }} />
      </SidebarFooter>
      <SidebarRail />
      {createUser && <CreateUserCard ref={createUserRef} />}
      {createOrg && <CreateOrgCard ref={createOrgRef} />}
    </Sidebar>
  );
}

