"use client"

import {
  PlusCircleIcon,
  Settings,
  User2,
  UserPlus2,
  Users2,
} from "lucide-react";
import {IconCard} from "../components/icon-card";

export default function Home() {
  return (
    <div>
      <div>
        <div className="flex justify-center">
          <IconCard bgColor="#1BE7FF" icon={User2} label="Manage users" />
          <IconCard bgColor="#6EEB83" icon={UserPlus2} label="Create users" />
          <IconCard bgColor="#E4FF1A" icon={Users2} label="Manage organizations" />
          <IconCard bgColor="#FFB800" icon={PlusCircleIcon} label="Add organizations" />
          <IconCard bgColor="#FF5714" icon={Settings} label="Settings" />
        </div>
        <div className="history"></div>
      </div>
    </div>
  );
}
