"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { PiRobot, PiCopy, PiCheck } from "react-icons/pi";
import logo from "@/public/images/favicon.png";
import { formatDistanceToNow } from 'date-fns';
import { Message } from "@/app/assistance/types";
import TextAnimation from "@/components/ui/TextAnimation";
import TypingAnimation from "@/components/ui/TypingAnimation";

interface ChatMessageProps {
  message: Message;
  isGreeting?: boolean;
  animated?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isGreeting = false,
  animated = true 
}) => {
  const [copied, setCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  
  // Format the timestamp
  const formattedTime = message.timestamp 
    ? formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })
    : '2 min ago';
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Skip animation for user messages
  useEffect(() => {
    if (message.role === "user") {
      setIsAnimating(false);
    }
  }, [message.role]);
  
  if (message.role === "user") {
    return (
      <div className="flex flex-col justify-end items-end gap-3">
        <p className="text-xs text-n100">{formattedTime}</p>
        <div className="text-sm bg-infoColor/10 py-3 px-5 border border-infoColor/20 rounded-xl shadow-sm">
          <p>{message.content}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex justify-start items-start gap-1 sm:gap-3 w-full max-w-[90%]">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primaryColor to-secondaryColor flex items-center justify-center">
        <Image src={logo} alt="UniHub Logo" width={20} height={20} className="object-cover" />
      </div>
      <div className="flex flex-col justify-start items-start gap-3 flex-1">
        <p className="text-xs text-n100">UniHub, {formattedTime}</p>
        <div className="text-sm bg-gradient-to-r from-primaryColor/5 to-transparent py-3 px-5 border border-primaryColor/20 rounded-xl shadow-sm w-full sm:max-w-[90%]">
          <div className="flex items-center gap-2 mb-1">
            <PiRobot className="text-primaryColor" />
            <span className="text-xs font-medium">AI Assistant</span>
          </div>
          {isAnimating && animated ? (
            <p>
              <TextAnimation 
                text={message.content} 
                speed={15} 
                onComplete={() => setIsAnimating(false)} 
              />
            </p>
          ) : (
            <p>{message.content}</p>
          )}
        </div>
        {!isGreeting && !isAnimating && (
          <div className="flex justify-end items-center gap-2">
            <button onClick={handleCopy} className="cursor-pointer hover:text-primaryColor transition-colors p-1 rounded-full hover:bg-primaryColor/10">
              {copied ? <PiCheck className="text-green-500" /> : <PiCopy />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage; 