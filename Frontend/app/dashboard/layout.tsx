"use client";
import Header from "@/components/Header";
import MainSidebar from "@/components/MainSidebar";
import MainModal from "@/components/modals/MainModal";
import GradientBackground from "@/components/ui/GradientBackground";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/app/auth/authService";

export function WithLayoutLayout({ children }: { children: React.ReactNode }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      // Redirect to login page if not authenticated
      router.push("/auth/login");
      return;
    }

    // If the user is at the root of with-layout, redirect to home
    if (pathname === "/dashboard") {
      router.push("/home");
    }
  }, [isClient, pathname, router]);

  // Don't render anything during authentication check to prevent flash of content
  if (isClient && !authService.isAuthenticated()) {
    return null;
  }

  return (
    <div className="text-n500 relative z-10 h-dvh dark:text-n30">
      <GradientBackground />
      <div className="flex justify-start items-start h-full">
        <MainSidebar
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
        />
        <div className="flex-1 flex flex-col gap-3 justify-between items-start h-full pb-3 relative z-20 overflow-y-auto no-scrollbar w-full">
          <div className="w-full px-4 sm:px-6 md:px-8">
            <Header showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
          </div>
          <div className="w-full flex-1 overflow-y-auto no-scrollbar">
            {children}
          </div>
        </div>
      </div>

      {/* Modal */}
      <MainModal />
    </div>
  );
}

// Default export
export default WithLayoutLayout;
