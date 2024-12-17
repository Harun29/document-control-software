"use client";

import {
  PlusCircleIcon,
  Settings,
  User2,
  UserPlus2,
  Users2,
} from "lucide-react";
import { IconCard } from "../components/icon-card";
import { useRef, useState, useEffect } from "react";
import CreateUserCard from "@/components/create-user-card";
import CreateOrgCard from "@/components/create-org-card";
import { useAuth } from "@/context/AuthContext";


export default function Home() {
  const [createUser, setCreateUser] = useState(false);
  const [createOrg, setCreateOrg] = useState(false);
  const createOrgRef = useRef<HTMLDivElement | null>(null);
  const createUserRef = useRef<HTMLDivElement | null>(null);
  const {isAdmin} = useAuth();

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

  useEffect(() => {
    console.log("isAdmin", isAdmin)
  }, [isAdmin])


  return (
      <div className="h-full">
        <div>
          <div className="flex justify-center">
            <IconCard
              bgColor="#1BE7FF"
              icon={User2}
              label="Manage users"
              href="/users"
            />
            <div onClick={() => setCreateUser(!createUser)}>
              <IconCard
                bgColor="#6EEB83"
                icon={UserPlus2}
                label="Create users"
                href="#"
              />
            </div>
            <IconCard
              
              bgColor="#E4FF1A"
              icon={Users2}
              label="Manage organizations"
              href="/orgs"
            />
            <div onClick={() => setCreateOrg(!createOrg)}>
              <IconCard
                bgColor="#FFB800"
                icon={PlusCircleIcon}
                label="Add organizations"
                href="#"
              />
            </div>
            <IconCard
              bgColor="#FF5714"
              icon={Settings}
              label="Settings"
              href="/settings"
            />
          </div>
          <div className="history"></div>
        </div>
        {createUser && <CreateUserCard ref={createUserRef} />}
        {createOrg && <CreateOrgCard ref={createOrgRef} />}
      </div>
  );
}
