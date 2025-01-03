"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import LoginPage from "@/app/_login/page";

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    if(window.location.pathname !== "/") {
      const router = useRouter();
      router.push("/");
    }
    return <LoginPage />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header
          className="bg-[#f7f7f7] dark:bg-[#0a0a0a] flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 sticky top-0"
        >
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 z-50" />
          </div>
          <div className="w-[1.5rem] h-[3rem] bg-transparent rounded-tl-full absolute left-0 -bottom-12 shadow-[0_-25px_0px_0px] shadow-[#f7f7f7] dark:shadow-[#0a0a0a]"></div>
        </header>
        <div className="h-full border-l border-r border-gray-200 dark:border-gray-950 rounded-tl-3xl shadow-2xl shadow-gray-500/50">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AuthenticatedLayout;