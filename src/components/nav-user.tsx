"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  Dot,
  LogOut,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"
import { useEffect, useRef, useState } from "react"
import Notifications from "./notifications"

export function NavUser({
  user,
}: {
  user: {
    firstName: string
    lastName: string
    email: string
    org: string
    orgName: string
    role: string
  }
}) {
  const { isMobile } = useSidebar()
  const {logout} = useAuth();
  const [notifications, setNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const {usersUnreadNotifs} = useAuth();

  const handleClickOutside = (event: MouseEvent) => {
    const clickedOutsideNotifications =
      notificationsRef.current &&
      !notificationsRef.current.contains(event.target as Node);

    if (clickedOutsideNotifications) setNotifications(false);
  };

    useEffect(() => {
      if (notifications) {
        document.addEventListener("mousedown", handleClickOutside);
      } else {
        document.removeEventListener("mousedown", handleClickOutside);
      }
  
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [notifications]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.firstName} alt={user.firstName} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.firstName}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              {usersUnreadNotifs > 0 ? 
                <Dot className="!w-14 !h-14 translate-x-4 text-blue-600" />
              :
              <ChevronsUpDown className="ml-auto size-4" />
              }
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.firstName} alt={user.firstName} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.firstName}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setNotifications(true)}>
                <Bell />
                Notifications
                {usersUnreadNotifs > 0 &&
                <Dot className="!w-14 !h-14 text-blue-600 absolute end-0" />
              }
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                <LogOut />
                Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      {notifications && <Notifications ref={notificationsRef}/>}
    </SidebarMenu>

  )
}
