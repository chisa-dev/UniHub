"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';
import { PiPaperPlaneRight, PiLightning, PiSparkle } from "react-icons/pi";
import TopicHeader from "@/components/assistance/TopicHeader";
import ChatMessage from "@/components/assistance/ChatMessage";
import TypingAnimation from "@/components/ui/TypingAnimation";
import AssistanceBackground from "@/components/ui/AssistanceBackground";
import { Message, ChatContext } from "./types";
import { assistanceService } from "./assistanceService";
import { topicsService } from "../topics/topicsService";
import Image from "next/image";
import logo from "@/public/images/favicon.png";

const Assistance = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicId = searchParams.get("topic");
  
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState({ title: "", description: "", filesCount: 0 });
  const [hasTopicSelected, setHasTopicSelected] = useState(false);
  
  const [chatContext, setChatContext] = useState<ChatContext>({
    topicId: "",
    topicTitle: "",
    messageHistory: []
  });
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Fetch topic details if topicId is provided
  useEffect(() => {
    const initialize = async () => {
      if (topicId) {
        try {
          const topicData = await topicsService.getTopic(topicId);
          const filesCount = await assistanceService.getTopicFilesCount(topicId);
          
          // Update the topic information
          setTopic({
            title: topicData.title,
            description: topicData.description,
            filesCount: filesCount
          });
          
          setHasTopicSelected(true);
          
          // Initialize chat context with topic-specific greeting
          setChatContext({
            topicId: topicId,
            topicTitle: topicData.title,
            messageHistory: [
              {
                id: uuidv4(),
                role: "assistant",
                content: `Hello! I'm your AI study assistant for the topic "${topicData.title}". How can I help you today?`,
                timestamp: new Date()
              }
            ]
          });
        } catch (error) {
          console.error("[LOG assistance] ========= Error fetching topic details:", error);
          setError("Failed to load topic information");
        }
      } else {
        // No topic selected, initialize with a general greeting
        setChatContext({
          topicId: "",
          topicTitle: "",
          messageHistory: [
            {
              id: uuidv4(),
              role: "assistant",
              content: "Hello! I'm your AI study assistant. You can ask me anything, or select a topic to focus our conversation.",
              timestamp: new Date()
            }
          ]
        });
      }
      
      setIsFetching(false);
    };
    
    initialize();
  }, [topicId]);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);
  
  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatContext.messageHistory]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: message,
      timestamp: new Date()
    };
    
    setChatContext(prev => ({
      ...prev,
      messageHistory: [...prev.messageHistory, userMessage]
    }));
    
    setMessage("");
    setIsLoading(true);
    
    try {
      // Format previous messages for API
      const previousMessages = chatContext.messageHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Send message to API
      const response = await assistanceService.sendMessage({
        message: userMessage.content,
        context: {
          topicId: topicId || "",
          previousMessages: previousMessages
        }
      });
      
      // Add assistant response to chat
      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: response.message,
        timestamp: response.timestamp
      };
      
      setChatContext(prev => ({
        ...prev,
        messageHistory: [...prev.messageHistory, assistantMessage]
      }));
      
    } catch (error) {
      console.error("[LOG assistance] ========= Error sending message:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "I'm sorry, but I encountered an error processing your request. Please try again later.",
        timestamp: new Date()
      };
      
      setChatContext(prev => ({
        ...prev,
        messageHistory: [...prev.messageHistory, errorMessage]
      }));
      
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };
  
  // Redirect to topics page to select a topic
  const handleSelectTopic = () => {
    router.push('/topics?from=assistance');
  };
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-3 bg-primaryColor text-white px-4 py-2 rounded"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <AssistanceBackground />
      <div className="flex flex-col h-full flex-1 overflow-hidden w-full z-20 pt-4 px-4 sm:px-6 md:px-8 max-w-[1200px] mx-auto">
        {/* Topic Header - Only show if a topic is selected */}
        {hasTopicSelected && (
          <TopicHeader 
            title={topic.title} 
            filesCount={topic.filesCount}
            description={topic.description}
          />
        )}
        
        {/* Chat Container */}
        <div 
          className={`overflow-auto w-full flex-1 ${!hasTopicSelected ? 'pt-4' : ''}`} 
          ref={chatContainerRef}
        >
          <div className="pb-6 flex-grow w-full max-w-[1070px] mx-auto">
            {/* Topic Selection - Only show if no topic is selected */}
            {!hasTopicSelected && !isFetching && (
              <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20 shadow-md mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-primaryColor/10">
                    <Image src={logo} alt="UniHub Logo" width={24} height={24} />
                  </div>
                  <h2 className="font-medium">Welcome to UniHub AI Assistant</h2>
                </div>
                <p className="text-sm text-n300 mb-4">
                  You can chat with me about anything, or select a specific topic to focus our conversation.
                </p>
                <button 
                  onClick={handleSelectTopic}
                  className="flex items-center gap-2 py-2 px-4 bg-primaryColor text-white rounded-lg text-sm"
                >
                  <PiLightning />
                  <span>Select a Topic</span>
                </button>
              </div>
            )}
            
            <div className="flex gap-3 relative z-20 w-full flex-col">
              {isFetching ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ) : (
                chatContext.messageHistory.map((msg, index) => (
                  <div className="flex flex-col gap-3" key={msg.id}>
                    <ChatMessage 
                      message={msg} 
                      isGreeting={index === 0} 
                      animated={msg.role === 'assistant'}
                    />
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start items-start gap-1 sm:gap-3 w-full max-w-[90%]">
                  <div className="w-6 h-6"></div>
                  <div className="flex flex-col justify-start items-start gap-3 flex-1">
                    <div className="text-sm bg-primaryColor/5 py-3 px-5 border border-primaryColor/20 rounded-lg">
                      <TypingAnimation />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="w-full max-w-[1070px] mx-auto pt-2 pb-4">
          <form
            onSubmit={handleSendMessage}
            className="relative w-full"
          >
            <div className="w-full bg-white dark:bg-n0 rounded-xl shadow-md border border-primaryColor/20 backdrop-blur-sm p-2">
              <textarea
                ref={textareaRef}
                className="w-full outline-none p-3 bg-transparent resize-none overflow-hidden min-h-[48px] max-h-[200px] text-sm"
                placeholder="Message UniHub..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isLoading || isFetching}
              />
              
              <div className="flex justify-between items-center px-3">
                <div className="text-xs text-n300">
                  <span className="flex items-center gap-1">
                    <PiSparkle className="text-primaryColor" />
                    Powered by UniHub AI
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={!message.trim() || isLoading || isFetching}
                  className={`p-2 rounded-full flex items-center justify-center transition-colors ${
                    message.trim() && !isLoading && !isFetching
                      ? 'bg-gradient-to-r from-primaryColor to-secondaryColor text-white shadow-sm' 
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
    </div>
  );
};

export default Assistance; 