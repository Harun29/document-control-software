"use client";

import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  // useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { MoonIcon, SunIcon } from "lucide-react";
import { useState } from "react";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: string;
  }[];
}) {
  // const { isMobile } = useSidebar()
  // const [activeTeam, setActiveTeam] = React.useState(teams[0])
  const { user } = useAuth();
  const [theme, setTheme] = useState("light");

  const handleThemeChange = () => {
    if (!document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-background data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg  text-sidebar-primary-foreground">
                <Image width={50} height={50} src={teams[0].logo} alt="logo" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{teams[0].name}</span>
                <span className="truncate text-xs">{user?.userInfo?.role}</span>
              </div>
              <div>
                {theme === "light" && (
                  <MoonIcon
                    size={24}
                    strokeWidth={1}
                    onClick={handleThemeChange}
                    className="transition-transform transform hover:scale-125 duration-300 ease-in-out"
                  />
                )}
                {theme === "dark" && (
                  <SunIcon
                    size={24}
                    strokeWidth={1}
                    onClick={handleThemeChange}
                    className="transition-transform transform hover:scale-125 duration-300 ease-in-out"
                  />
                )}
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
