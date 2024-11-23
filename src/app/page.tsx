"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Page() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log("User is logged in: ", user);
      router.replace("/home"); 
    } else {
      router.replace("/"); 
    }
  }, [user, router]);

  return null;} 
