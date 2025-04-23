import Image from "next/image";
import React, { useEffect, useState } from "react";
import fav from "@/public/images/favicon.png";
import {
  PiAlignLeft,
  PiCaretDown,
  PiCaretUp,
  PiArrowUUpLeft,
  PiMagnifyingGlass,
  PiHouseLine,
  PiRobot,
  PiCalendar,
  PiChartLine,
  PiExam,
  PiChalkboardTeacher,
  PiSpeakerHigh,
  PiNote,
  PiGear,
  PiQuestion,
  PiDotsThreeBold,
} from "react-icons/pi";
import Link from "next/link";
import { useMainModal } from "@/stores/modal";
import { usePathname } from "next/navigation";

type MainSidebarProps = {
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
};

function MainSidebar({ showSidebar, setShowSidebar }: MainSidebarProps) {
  const { modalOpen } = useMainModal();
  const pathname = usePathname();
  const [showTopics, setShowTopics] = useState(false);
  
  // Mock data for started topics
  const startedTopics = [
    { id: "topic1", title: "Mathematics 101" },
    { id: "topic2", title: "Computer Science Basics" },
    { id: "topic3", title: "History of Art" },
    { id: "topic4", title: "Physics Fundamentals" },
  ];
  
  useEffect(() => {
    if (window.innerWidth > 992) {
      setShowSidebar(true);
    }
  }, [setShowSidebar]);

  // Check if a link is active
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  // Navigation items
  const navItems = [
    { 
      path: "/home", 
      name: "Home", 
      icon: <PiHouseLine size={20} className="text-primaryColor" /> 
    },
    { 
      path: "/assistance", 
      name: "Assistance", 
      icon: <PiRobot size={20} className="text-primaryColor" /> 
    },
    { 
      path: "/calendar", 
      name: "Calendar", 
      icon: <PiCalendar size={20} className="text-primaryColor" /> 
    },
    { 
      path: "/insights", 
      name: "Insights", 
      icon: <PiChartLine size={20} className="text-primaryColor" /> 
    },
    { 
      path: "/tests-quizfetch", 
      name: "Tests & QuizFetch", 
      icon: <PiExam size={20} className="text-primaryColor" /> 
    },
    { 
      path: "/tutor-me", 
      name: "Tutor Me", 
      icon: <PiChalkboardTeacher size={20} className="text-primaryColor" /> 
    },
    { 
      path: "/audio-recap", 
      name: "Audio Recap", 
      icon: <PiSpeakerHigh size={20} className="text-primaryColor" /> 
    },
    { 
      path: "/notes-materials", 
      name: "Notes and Materials", 
      icon: <PiNote size={20} className="text-primaryColor" /> 
    },
  ];

  return (
    <div
      className={`w-[312px] bg-white dark:bg-n0 border-r border-primaryColor/20 h-dvh overflow-hidden duration-500 max-lg:absolute z-40 top-0 left-0 ${
        showSidebar
          ? "visible opacity-100"
          : "max-lg:invisible max-lg:opacity-0 ml-[-312px]"
      }`}
    >
      <div
        className={`p-5 bg-primaryColor/5 overflow-auto h-full flex flex-col justify-between`}
      >
        <div className="">
          <div className="flex justify-between items-center">
            <div className="flex justify-start items-center gap-1.5">
              <Image src={fav} alt="UniHub Logo" />
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
                className="bg-white p-2 rounded-full flex justify-center items-center border border-primaryColor/20 dark:bg-n0"
              >
                <PiArrowUUpLeft />
              </button>
            </div>
          </div>
          
          {/* Started Topics Dropdown */}
          <div className="mt-6">
            <button 
              onClick={() => setShowTopics(!showTopics)}
              className="flex w-full justify-between items-center py-3 px-6 hover:text-primaryColor hover:bg-primaryColor/10 rounded-xl duration-500"
            >
              <span className="flex items-center gap-2 font-medium">
                <PiAlignLeft size={20} className="text-primaryColor" />
                <span className="text-sm">Started Topics/Sets</span>
              </span>
              {showTopics ? (
                <PiCaretUp className="text-primaryColor" />
              ) : (
                <PiCaretDown className="text-primaryColor" />
              )}
            </button>
            
            {/* Dropdown Content */}
            <div className={`overflow-hidden transition-all duration-300 ${showTopics ? 'max-h-60' : 'max-h-0'}`}>
              {startedTopics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.id}`}
                  className={`flex items-center gap-2 py-2.5 pl-12 pr-6 text-sm hover:text-primaryColor hover:bg-primaryColor/10 rounded-xl duration-500 ${
                    isActive(`/topics/${topic.id}`) ? 'bg-primaryColor/10 text-primaryColor' : ''
                  }`}
                >
                  {topic.title}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Main Navigation */}
          <div className="flex flex-col gap-1 mt-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 py-3 px-6 rounded-xl duration-500 ${
                  isActive(item.path)
                    ? 'bg-primaryColor/10 text-primaryColor'
                    : 'hover:text-primaryColor hover:bg-primaryColor/10'
                }`}
              >
                {item.icon}
                <span className="text-sm">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="">
          <div className="flex flex-col gap-1 justify-start items-start pb-2 ">
            <button
              className="w-full flex justify-between items-center py-3 px-6 hover:text-primaryColor hover:bg-primaryColor/10 rounded-xl duration-500"
              onClick={() => modalOpen("Support Modal")}
            >
              <span className="flex justify-center items-center gap-2 ">
                <PiQuestion size={20} className="text-primaryColor" />
                <span className="text-sm">Help</span>
              </span>
              <span className="block size-1 rounded-full bg-successColor"></span>
            </button>
            <button
              className="w-full flex justify-between items-center py-3 px-6 hover:text-primaryColor hover:bg-primaryColor/10 rounded-xl duration-500"
              onClick={() => modalOpen("Settings")}
            >
              <span className="flex justify-center items-center gap-2 ">
                <PiGear size={20} className="text-primaryColor" />
                <span className="text-sm">Settings</span>
              </span>
              <span className="block size-1 rounded-full bg-successColor"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainSidebar;
