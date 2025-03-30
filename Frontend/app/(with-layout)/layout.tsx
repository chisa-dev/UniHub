"use client";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MainSidebar from "@/components/MainSidebar";
import MainModal from "@/components/modals/MainModal";
import GradientBackground from "@/components/ui/GradientBackground";
import { useChatHandler } from "@/stores/chatList";
import React, { useEffect, useState } from "react";

function Layout({ children }: { children: React.ReactNode }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const { updateChatList } = useChatHandler();

  useEffect(() => {
    updateChatList();
  }, []);

  return (
    <div className="text-n500 bg-white relative z-10 h-dvh overflow-hidden dark:bg-n0 dark:text-n30">
      <GradientBackground />
      <div className="flex justify-start items-start h-full ">
        <MainSidebar
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
        />
        <div className="flex-1 flex flex-col gap-3 justify-between items-center h-full pb-3 relative z-20">
          <Header showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
          {children}
          <Footer />
        </div>
      </div>

      {/* Modal */}
      <MainModal />
    </div>
  );
}

export default Layout;
