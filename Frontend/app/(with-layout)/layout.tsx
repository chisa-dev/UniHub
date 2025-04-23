"use client";
import Header from "@/components/Header";
import MainSidebar from "@/components/MainSidebar";
import MainModal from "@/components/modals/MainModal";
import GradientBackground from "@/components/ui/GradientBackground";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function WithLayoutLayout({ children }: { children: React.ReactNode }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If the user is at the root of with-layout, redirect to home
    if (pathname === "/(with-layout)") {
      router.push("/home");
    }
  }, [pathname, router]);

  return (
    <div className="text-n500 bg-white relative z-10 h-dvh dark:bg-n0 dark:text-n30">
      <GradientBackground />
      <div className="flex justify-start items-start h-full">
        <MainSidebar
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
        />
        <div className="flex-1 flex flex-col gap-3 justify-between items-start h-full pb-3 relative z-20 px-4 sm:px-6 md:px-8 overflow-y-auto no-scrollbar w-full">
          <Header showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
          <div className="w-full max-w-[1070px] mx-auto flex-1 overflow-y-auto no-scrollbar">
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
