import React from "react";
import { PiList, PiUploadSimple } from "react-icons/pi";
import UserModal from "./header/UserModal";
import { useMainModal } from "@/stores/modal";
import UpgradeModal from "./header/UpgradeModal";
import ThemeSwitch from "./ThemeSwitch";
import { usePathname } from "next/navigation";

type HeaderProps = {
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
};

function Header({ showSidebar, setShowSidebar }: HeaderProps) {
  const { modalOpen } = useMainModal();
  const path = usePathname();

  return (
    <div className="px-6 py-3 flex justify-between items-center w-full sticky top-0 left-0 right-0 bg-white z-30 dark:bg-n0">
      <div className="flex justify-start items-center gap-2">
        <button
          className={`${showSidebar ? "hidden" : ""}`}
          onClick={() => setShowSidebar(true)}
        >
          <PiList className="text-2xl" />
        </button>
        <UpgradeModal />
      </div>
      <div className="flex justify-start items-center gap-2 sm:gap-4 ">
        <ThemeSwitch />
        {path.includes("chat") && (
          <button
            onClick={() => modalOpen("Share Public Link")}
            className="flex justify-center items-center gap-2 py-2  px-2 sm:px-4 rounded-full border border-primaryColor text-primaryColor"
          >
            <PiUploadSimple />
            <span className="text-xs font-medium max-[400px]:hidden">
              Share
            </span>
          </button>
        )}
        {path === "/custom-bots" && (
          <button
            onClick={() => modalOpen("Create New Bot")}
            className="flex justify-center items-center gap-2 py-2  px-2 sm:px-4 rounded-full border border-primaryColor text-primaryColor"
          >
            <PiUploadSimple />
            <span className="text-xs font-medium max-[400px]:hidden">
              Create New
            </span>
          </button>
        )}

        <UserModal />
      </div>
    </div>
  );
}

export default Header;
