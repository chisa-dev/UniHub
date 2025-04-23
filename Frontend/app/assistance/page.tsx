"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { PiRobot, PiPaperPlaneRight, PiPaperclip, PiCopy, PiPencilSimpleLine } from "react-icons/pi";
import logo from "@/public/images/favicon.png";

const Assistance = () => {
  const [message, setMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Mock conversation
  const conversation = useMemo(() => [
    { 
      id: 1, 
      sender: "ai", 
      content: "Hello! I'm your AI study assistant. How can I help you today?" 
    },
    { 
      id: 2, 
      sender: "user", 
      content: "Can you help me understand the concept of photosynthesis?" 
    },
    { 
      id: 3, 
      sender: "ai", 
      content: "Of course! Photosynthesis is the process by which plants, algae, and certain bacteria convert light energy into chemical energy. The process primarily takes place in the chloroplasts of plant cells, specifically in structures called thylakoids. During photosynthesis, plants take in carbon dioxide (CO2) from the air and water (H2O) from the soil, and using energy from sunlight, convert these ingredients into glucose (C6H12O6) and oxygen (O2). The basic equation for photosynthesis is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2. Would you like me to explain any specific part of this process in more detail?" 
    }
  ], []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Handle sending message logic would go here
      setMessage("");
    }
  };

  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  return (
    <div className="flex flex-col gap-4 h-full flex-1 overflow-auto w-full z-20">
      <div className="overflow-auto w-full flex-1" ref={chatContainerRef}>
        <div className="pb-6 flex-grow w-full max-w-[1070px] mx-auto">
          <div className="flex gap-3 relative z-20 w-full flex-col">
            {conversation.map((msg) => (
              <div className="flex flex-col gap-3" key={msg.id}>
                {msg.sender === "user" ? (
                  // User messages
                  <div className="flex flex-col justify-end items-end gap-3">
                    <p className="text-xs text-n100">3 min ago</p>
                    <div className="text-sm bg-infoColor/5 py-3 px-5 border border-infoColor/20 rounded-lg">
                      <p>{msg.content}</p>
                    </div>
                    <div className="flex justify-end items-center gap-2 cursor-pointer">
                      <PiPencilSimpleLine />
                      <PiCopy />
                    </div>
                  </div>
                ) : (
                  // AI messages
                  <div className="flex justify-start items-start gap-1 sm:gap-3 w-full max-w-[90%]">
                    <Image src={logo} alt="UniHub Logo" className="max-sm:size-5 object-cover" />
                    <div className="flex flex-col justify-start items-start gap-3 flex-1">
                      <p className="text-xs text-n100">UniHub, 2 min ago</p>
                      <div className="text-sm bg-primaryColor/5 py-3 px-5 border border-primaryColor/20 rounded-lg w-full sm:max-w-[90%]">
                        <div className="flex items-center gap-2 mb-1">
                          <PiRobot className="text-primaryColor" />
                          <span className="text-xs font-medium">AI Assistant</span>
                        </div>
                        <p>{msg.content}</p>
                      </div>
                      <div className="flex justify-end items-center gap-2 cursor-pointer">
                        <PiCopy />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="w-full max-w-[1070px] mx-auto">
        <form
          onSubmit={handleSendMessage}
          className="w-full bg-primaryColor/5 p-2 lg:p-4 rounded-xl border border-primaryColor/20"
        >
          <div className="w-full bg-white rounded-lg max-lg:text-sm block dark:bg-n0">
            <input
              className="w-full outline-none p-4 bg-transparent"
              placeholder="Message UniHub..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="flex justify-start items-center gap-3">
              <button 
                type="button"
                className="flex justify-center items-center gap-2 py-2 px-2 sm:px-4 rounded-full border border-secondaryColor/20 bg-secondaryColor/5"
              >
                <span className="text-xs font-medium max-sm:hidden">Upload Image</span>
              </button>
            </div>
            <div className="flex justify-end items-center gap-3">
              <button 
                type="button"
                className="bg-white p-2 rounded-full flex justify-center items-center border border-primaryColor/20 dark:bg-n0"
              >
                <PiPaperclip />
              </button>
              <button
                type="submit"
                disabled={!message.trim()}
                className={`p-2 rounded-full ${
                  message.trim() 
                    ? 'bg-primaryColor text-white' 
                    : 'bg-primaryColor/20 text-primaryColor/50'
                }`}
              >
                <PiPaperPlaneRight />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Assistance; 