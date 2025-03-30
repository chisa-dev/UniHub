import Image from "next/image";
import React, { useEffect, useState } from "react";
import fav from "@/public/images/favicon.png";
import {
  PiAlignLeft,
  PiArchive,
  PiArrowUUpLeft,
  PiCaretDown,
  PiCaretUp,
  PiChatTeardropText,
  PiDeviceMobileCamera,
  PiDiamondsFour,
  PiDotsThreeBold,
  PiGear,
  PiMagnifyingGlass,
  PiPaintBucket,
  PiPencilLine,
  PiQuestion,
  PiRobot,
  PiShareFat,
  PiTrash,
} from "react-icons/pi";
import Link from "next/link";
import { useMainModal } from "@/stores/modal";
import { useChatHandler } from "@/stores/chatList";

type MainSidebarProps = {
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
};
function MainSidebar({ showSidebar, setShowSidebar }: MainSidebarProps) {
  const [showMoreButton, setShowMoreButton] = useState(NaN);
  const { modalOpen } = useMainModal();
  const { chatList } = useChatHandler();
  const [showAllRecentChats, setShowAllRecentChats] = useState(false);
  useEffect(() => {
    if (window.innerWidth > 992) {
      setShowSidebar(true);
    }
  }, []);

  return (
    <div
      className={`w-[312px] bg-white dark:bg-n0 border-r border-primaryColor/20  h-dvh overflow-hidden duration-500 max-lg:absolute  z-40  top-0  left-0   ${
        showSidebar
          ? "  visible opacity-100 "
          : "max-lg:invisible max-lg:opacity-0 ml-[-312px]"
      }`}
    >
      <div
        className={` p-5 bg-primaryColor/5  overflow-auto h-full flex flex-col justify-between `}
      >
        <div className="">
          <div className="flex justify-between items-center">
            <div className="flex justify-start items-center gap-1.5">
              <Image src={fav} alt="" />
              <span className="text-2xl font-semibold text-n700 dark:text-n30">
                UniHub
              </span>
            </div>
            <div className="flex justify-start items-center gap-2">
              <button
                onClick={() => modalOpen("Search")}
                className="bg-white p-2 rounded-full flex justify-center items-center border border-primaryColor/20 dark:bg-n0"
              >
                <PiMagnifyingGlass />
              </button>
              <button
                onClick={() => setShowSidebar(false)}
                className="bg-white p-2 rounded-full flex justify-center items-center border border-primaryColor/20  dark:bg-n0"
              >
                <PiArrowUUpLeft />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1 justify-start items-start pt-5 lg:pt-12 pb-5">
            <Link
              href={"/new-chat"}
              className="flex justify-center py-3 px-6 items-center gap-2 text-white bg-primaryColor rounded-xl"
            >
              <PiChatTeardropText size={20} />
              <span className="text-sm font-medium">New Chat</span>
            </Link>
            <Link
              href={"/ai-generator"}
              className="flex justify-center py-3 px-6 items-center gap-2 hover:text-primaryColor hover:bg-primaryColor/10 rounded-xl duration-500 "
            >
              <PiRobot size={20} className="text-primaryColor" />
              <span className="text-sm ">AI Generator</span>
            </Link>
            <Link
              href={"/explore"}
              className="flex justify-center py-3 px-6 items-center gap-2 hover:text-primaryColor hover:bg-primaryColor/10 rounded-xl duration-500 "
            >
              <PiDiamondsFour size={20} className="text-primaryColor" />
              <span className="text-sm ">Explore UniHub</span>
            </Link>
          </div>
        </div>

        <div className="pb-5 flex-1 flex flex-col justify-start items-start w-full ">
          <p className="text-xs font-semibold text-n700 dark:text-n30">
            Recent
          </p>
          <div className="flex flex-col gap-1 w-full">
            <div className="flex flex-col gap-1 justify-start items-start w-full ">
              {chatList
                .slice(0, showAllRecentChats ? chatList.length : 6)
                .map(({ id, title }, idx) => (
                  <div
                    className="flex justify-between items-center gap-2 hover:text-primaryColor hover:bg-primaryColor/10 rounded-xl duration-500 py-3 px-6 relative w-full"
                    key={id}
                  >
                    <Link
                      href={`/chat/${id}`}
                      className="flex justify-center items-center gap-2  "
                    >
                      <PiAlignLeft size={20} className="text-primaryColor" />
                      <span className="text-sm ">
                        {title.split("").slice(0, 20).join("")}
                      </span>
                    </Link>
                    <button
                      onClick={() =>
                        setShowMoreButton(idx === showMoreButton ? NaN : idx)
                      }
                    >
                      <PiDotsThreeBold className="text-xl" />
                    </button>
                    <ul
                      className={`absolute top-9  right-0 bg-white dark:bg-n0 border border-primaryColor/30 p-3 rounded-xl flex flex-col gap-1 justify-start items-start text-sm duration-300 z-40 text-n500 dark:text-n30 ${
                        showMoreButton === idx
                          ? "visible translate-y-0 opacity-100 "
                          : "invisible translate-y-2 opacity-0"
                      }`}
                    >
                      <li className="flex justify-start items-center gap-1 py-2 px-3 rounded-lg border border-transparent hover:border-primaryColor/30  hover:bg-primaryColor/5 duration-300 cursor-pointer w-full">
                        <PiPencilLine />
                        <span>Rename</span>
                      </li>
                      <li className="flex justify-start items-center gap-1 py-2 px-3 rounded-lg border border-transparent hover:border-primaryColor/30  hover:bg-primaryColor/5 duration-300 cursor-pointer w-full">
                        <PiShareFat />
                        <span>Share</span>
                      </li>
                      <li className="flex justify-start items-center gap-1 py-2 px-3 rounded-lg border border-transparent hover:border-primaryColor/30  hover:bg-primaryColor/5 duration-300 cursor-pointer w-full">
                        <PiArchive />
                        <span>Archive</span>
                      </li>
                      <li className="flex justify-start items-center gap-1 py-2 px-3 rounded-lg border border-transparent hover:border-errorColor/30  hover:bg-errorColor/5 duration-300 cursor-pointer text-errorColor w-full">
                        <PiTrash />
                        <span>Delete</span>
                      </li>
                    </ul>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setShowAllRecentChats((prev) => !prev)}
              className="flex justify-start items-center gap-2 py-3 px-6 hover:text-primaryColor hover:bg-primaryColor/10 rounded-xl duration-500 w-full"
            >
              {showAllRecentChats ? (
                <PiCaretUp className="text-xl text-primaryColor" />
              ) : (
                <PiCaretDown className="text-xl text-primaryColor" />
              )}
              <span className="text-sm font-medium">
                {showAllRecentChats ? "Less" : "More"}
              </span>
            </button>
          </div>
        </div>

        <div className="">
          <div className="flex flex-col gap-1 justify-start items-start pb-2 ">
            <button
              className="w-full flex justify-between items-center py-3 px-6 hover:text-primaryColor hover:bg-primaryColor/10 rounded-xl duration-500"
              onClick={() => modalOpen("Support Modal")}
            >
              <span className="flex justify-center  items-center gap-2 ">
                <PiQuestion size={20} className="text-primaryColor" />
                <span className="text-sm">Support</span>
              </span>
              <span className="block size-1 rounded-full bg-successColor"></span>
            </button>
            <Link
              href={"/custom-bots"}
              className="flex justify-start py-3 px-6 items-center gap-2 hover:text-primaryColor hover:bg-primaryColor/10 rounded-xl duration-500 w-full "
            >
              <PiPaintBucket size={20} className="text-primaryColor" />
              <span className="text-sm ">Custom Bots</span>
            </Link>
            <button
              className="w-full flex justify-between items-center py-3 px-6 hover:text-primaryColor hover:bg-primaryColor/10 rounded-xl duration-500"
              onClick={() => modalOpen("Settings")}
            >
              <span className="flex justify-center  items-center gap-2 ">
                <PiGear size={20} className="text-primaryColor" />
                <span className="text-sm ">Settings</span>
              </span>
              <span className="block size-1 rounded-full bg-successColor"></span>
            </button>
          </div>

          <div className="flex justify-between items-center rounded-xl py-3 px-6 bg-primaryColor/5 border border-primaryColor/30">
            <button className="flex justify-center  items-center gap-2 font-medium   text-primaryColor ">
              <PiDeviceMobileCamera size={20} className="" />
              <span className="text-sm ">Get App</span>
            </button>

            <span className="px-3 py-1 rounded-full border bg-secondaryColor/5   border-secondaryColor/30 text-secondaryColor text-xs">
              New
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainSidebar;
