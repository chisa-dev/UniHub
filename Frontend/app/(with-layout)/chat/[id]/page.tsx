"use client";
import React, { useEffect, useRef, useState } from "react";
import MyReply from "@/components/chatComponents/MyReply";
import ChatBox from "@/components/ChatBox";
import { usePathname } from "next/navigation";
import BotReply from "@/components/chatComponents/BotReply";
import { Chat, useChatHandler } from "@/stores/chatList";

function CustomChat() {
  const [scroll, setScroll] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { chatList, userQuery } = useChatHandler();
  const path = usePathname();
  const [currentChat, setCurrentChat] = useState<Chat>();

  const chatId = path.split("/chat/")[1];

  useEffect(() => {
    const currentChatList = chatList.find(({ id }: { id: string }) => {
      return id === chatId;
    });
    setCurrentChat(currentChatList);
  }, [chatList, path, chatId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [userQuery, scroll]);

  return (
    <div className=" flex flex-col gap-4 h-full flex-1 overflow-auto w-full z-20 ">
      <div className="overflow-auto w-full flex-1" ref={chatContainerRef}>
        <div className={`pb-6  flex-grow  w-full max-w-[1070px] mx-auto `}>
          <div className="flex gap-3 px-6 relative z-20  w-full flex-col ">
            {currentChat &&
              currentChat.messages.map((item, idx) => {
                return (
                  <div className="flex flex-col gap-3" key={idx}>
                    {item.isUser && typeof item.text === "string" && (
                      <MyReply replyText={item.text} replyTime="3 min ago" />
                    )}

                    <BotReply
                      replyType={typeof item.text === "string" ? item.text : ""}
                      setScroll={setScroll}
                      isAnimation={userQuery === item.text}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <ChatBox />
    </div>
  );
}

export default CustomChat;
