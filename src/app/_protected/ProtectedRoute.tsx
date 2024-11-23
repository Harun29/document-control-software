"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/loading";
import { useRouter } from "next/router";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loading progress={0} />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}