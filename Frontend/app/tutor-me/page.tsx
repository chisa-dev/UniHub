"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  PiNote, 
  PiSpeakerHigh,
  PiVideoCameraFill,
  PiCheck,
  PiArrowRight,
  PiListChecks,
  PiChatCircleText,
  PiClockCountdown,
  PiFileText
} from "react-icons/pi";
import { Topic } from "../topics/topicsService";
import Select from "react-select";

const NoteSummarization = () => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [mediaLength, setMediaLength] = useState<string>("5 minutes");
  const [goals, setGoals] = useState<string>("");
  const [topics, setTopics] = useState<{value: string, label: string}[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Mock topics for dropdown
  useEffect(() => {
    // In a real scenario, we would fetch this from topicsService
    setTopics([
      { value: "calculus", label: "Calculus" },
      { value: "linear-algebra", label: "Linear Algebra" },
      { value: "quantum-physics", label: "Quantum Physics" },
      { value: "organic-chemistry", label: "Organic Chemistry" },
      { value: "data-structures", label: "Data Structures" },
      { value: "machine-learning", label: "Machine Learning" },
    ]);
  }, []);
  
  // Types of summaries
  const summaryTypes = [
    { id: "written", name: "Written Note", icon: <PiNote size={24} /> },
    { id: "audio", name: "Audio Explanation", icon: <PiSpeakerHigh size={24} /> },
    { id: "video", name: "Video Animation", icon: <PiVideoCameraFill size={24} /> },
  ];
  
  // Mock past summaries
  const pastSummaries = [
    { 
      id: "1", 
      topic: "Calculus - Derivatives", 
      type: "Written Note",
      date: "May 10, 2023",
      summary: "Comprehensive explanation of derivative rules including power rule, product rule, and chain rule."
    },
    { 
      id: "2", 
      topic: "Python Programming", 
      type: "Video Animation",
      date: "May 5, 2023",
      summary: "Visual explanation of object-oriented programming concepts and inheritance in Python."
    },
    { 
      id: "3", 
      topic: "Renaissance Period", 
      type: "Audio Explanation",
      date: "April 28, 2023",
      summary: "Audio overview of key figures and their contributions during the Renaissance."
    }
  ];

  const handleCreateSummary = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to the appropriate detail page based on type
      if (selectedType === "written") {
        router.push("/tutor-me/note/1");
      } else if (selectedType === "video") {
        router.push("/tutor-me/video/2");
      } else if (selectedType === "audio") {
        router.push("/tutor-me/audio/3");
      }
    }, 2000);
  };

  // Get the appropriate icon for a summary type
  const getSummaryTypeIcon = (type: string) => {
    switch(type) {
      case "Written Note": return <PiNote />;
      case "Audio Explanation": return <PiSpeakerHigh />;
      case "Video Animation": return <PiVideoCameraFill />;
      default: return <PiNote />;
    }
  };

  // Navigate to the appropriate detail page based on type
  const navigateToSummary = (type: string, id: string) => {
    if (type === "Written Note") {
      router.push(`/tutor-me/note/${id}`);
    } else if (type === "Video Animation") {
      router.push(`/tutor-me/video/${id}`);
    } else if (type === "Audio Explanation") {
      router.push(`/tutor-me/audio/${id}`);
    }
  };

  return (
    <div className="w-full max-w-[1070px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <PiFileText className="text-primaryColor" />
          Note Summarization
        </h1>
        <button className="bg-primaryColor text-white py-2 px-4 rounded-xl flex items-center gap-1">
          <PiFileText />
          <span>My Summaries</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20 mb-6">
            <h3 className="font-medium mb-5">Create Summary</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Select Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {summaryTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`flex items-center gap-2 p-3 rounded-xl border ${
                        selectedType === type.id
                          ? "border-primaryColor bg-primaryColor/5 text-primaryColor"
                          : "border-primaryColor/20 hover:border-primaryColor/40"
                      }`}
                    >
                      <span className="text-primaryColor">{type.icon}</span>
                      <span className="text-sm">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Topic</label>
                  <Select
                    options={topics}
                    placeholder="Choose a topic..."
                    onChange={(option) => setSelectedTopic(option?.value || "")}
                    className="rounded-xl"
                    classNames={{
                      control: () => "border border-primaryColor/30 rounded-xl bg-transparent py-1.5 px-3",
                      menu: () => "bg-white dark:bg-n0 shadow-lg rounded-lg",
                      option: ({ isFocused, isSelected }) =>
                        `${
                          isSelected
                            ? "bg-primaryColor/20 text-n700 dark:text-white"
                            : ""
                        } ${
                          isFocused ? "bg-primaryColor/10 text-n700 dark:text-white" : ""
                        } text-sm py-2`,
                    }}
                  />
                </div>
                
                {(selectedType === "video" || selectedType === "audio") && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {selectedType === "video" ? "Video Length" : "Audio Length"}
                    </label>
                    <select 
                      value={mediaLength}
                      onChange={(e) => setMediaLength(e.target.value)}
                      className="w-full py-2 px-4 rounded-xl border border-primaryColor/30 focus:outline-none focus:ring-2 focus:ring-primaryColor bg-transparent"
                    >
                      <option value="3 minutes">3 minutes</option>
                      <option value="5 minutes">5 minutes</option>
                      <option value="10 minutes">10 minutes</option>
                      <option value="15 minutes">15 minutes</option>
                      <option value="20 minutes">20 minutes</option>
                    </select>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Session Goals</label>
                <textarea
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="What would you like to cover in this summary? Any specific concepts or questions to address?"
                  rows={4}
                  className="w-full py-2 px-4 rounded-xl border border-primaryColor/30 focus:outline-none focus:ring-2 focus:ring-primaryColor bg-transparent resize-none"
                ></textarea>
              </div>
              
              <div className="flex justify-between items-center text-sm border-t border-primaryColor/10 pt-4 mt-6">
                <span className="text-n300 dark:text-n400">Generating note might take some time.</span>
                <button 
                  onClick={handleCreateSummary}
                  disabled={isLoading || !selectedType}
                  className={`py-2 px-6 bg-primaryColor text-white rounded-xl font-medium ${
                    isLoading || !selectedType ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Generating..." : "Create Summary"}
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-primaryColor/5 p-5 rounded-xl border border-primaryColor/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Features</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-n0 p-4 rounded-xl border border-primaryColor/20">
                <div className="mb-3 text-primaryColor">
                  <PiNote size={24} />
                </div>
                <h4 className="font-medium mb-1">Written Notes</h4>
                <p className="text-sm text-n300 dark:text-n400">
                  Concise text summaries with key concepts, examples, and explanations.
                </p>
              </div>
              
              <div className="bg-white dark:bg-n0 p-4 rounded-xl border border-primaryColor/20">
                <div className="mb-3 text-primaryColor">
                  <PiSpeakerHigh size={24} />
                </div>
                <h4 className="font-medium mb-1">Audio Explanations</h4>
                <p className="text-sm text-n300 dark:text-n400">
                  Listen to detailed explanations for on-the-go learning.
                </p>
              </div>
              
              <div className="bg-white dark:bg-n0 p-4 rounded-xl border border-primaryColor/20">
                <div className="mb-3 text-primaryColor">
                  <PiVideoCameraFill size={24} />
                </div>
                <h4 className="font-medium mb-1">Video Animations</h4>
                <p className="text-sm text-n300 dark:text-n400">
                  Visual learning with animated explanations of complex concepts.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Recent Summaries</h3>
              <span className="text-xs bg-primaryColor/10 text-primaryColor px-2 py-1 rounded-full">
                3 Created
              </span>
            </div>
            
            <div className="border border-primaryColor/20 rounded-xl p-4 bg-primaryColor/5 mb-4">
              <div className="flex items-center gap-2 text-primaryColor font-medium mb-2">
                <PiNote />
                <span>Calculus - Derivatives</span>
              </div>
              <div className="text-sm text-n300 dark:text-n400 mb-3">
                May 10, 2023 • Written Note
              </div>
              <p className="text-xs text-n300 dark:text-n400 mb-3 line-clamp-2">
                Comprehensive explanation of derivative rules including power rule, product rule, and chain rule.
              </p>
              <div className="flex justify-end">
                <button 
                  onClick={() => router.push("/tutor-me/note/1")} 
                  className="text-xs text-primaryColor hover:underline"
                >
                  View Summary
                </button>
              </div>
            </div>
            
            <div className="border border-primaryColor/20 rounded-xl p-4 bg-primaryColor/5 mb-4">
              <div className="flex items-center gap-2 text-primaryColor font-medium mb-2">
                <PiVideoCameraFill />
                <span>Python Programming</span>
              </div>
              <div className="text-sm text-n300 dark:text-n400 mb-3">
                May 5, 2023 • Video Animation
              </div>
              <p className="text-xs text-n300 dark:text-n400 mb-3 line-clamp-2">
                Visual explanation of object-oriented programming concepts and inheritance in Python.
              </p>
              <div className="flex justify-end">
                <button 
                  onClick={() => router.push("/tutor-me/video/2")} 
                  className="text-xs text-primaryColor hover:underline"
                >
                  View Summary
                </button>
              </div>
            </div>

            <div className="border border-primaryColor/20 rounded-xl p-4 bg-primaryColor/5">
              <div className="flex items-center gap-2 text-primaryColor font-medium mb-2">
                <PiSpeakerHigh />
                <span>Renaissance Period</span>
              </div>
              <div className="text-sm text-n300 dark:text-n400 mb-3">
                April 28, 2023 • Audio Explanation
              </div>
              <p className="text-xs text-n300 dark:text-n400 mb-3 line-clamp-2">
                Audio overview of key figures and their contributions during the Renaissance.
              </p>
              <div className="flex justify-end">
                <button 
                  onClick={() => router.push("/tutor-me/audio/3")} 
                  className="text-xs text-primaryColor hover:underline"
                >
                  View Summary
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20">
            <h3 className="font-medium mb-4">Popular Topics</h3>
            
            <div className="space-y-3">
              {topics.slice(0, 4).map((topic, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 border border-primaryColor/10 rounded-lg hover:bg-primaryColor/5 cursor-pointer"
                  onClick={() => setSelectedTopic(topic.value)}
                >
                  <span className="text-sm">{topic.label}</span>
                  <span className="text-xs bg-primaryColor/10 text-primaryColor px-2 py-0.5 rounded-full">
                    {Math.floor(Math.random() * 20) + 1} summaries
                  </span>
                </div>
              ))}
              
              <button className="w-full text-sm text-primaryColor py-2 border border-primaryColor/20 rounded-lg mt-2 hover:bg-primaryColor/5">
                View All Topics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteSummarization; 