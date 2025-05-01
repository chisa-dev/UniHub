"use client";

import React, { useState } from "react";
import { 
  PiChalkboardTeacher, 
  PiCalendarPlus, 
  PiClockCountdown, 
  PiBookOpen, 
  PiListChecks, 
  PiChatCircleText,
  PiArrowRight,
  PiCheck
} from "react-icons/pi";

const TutorMe = () => {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [sessionDuration, setSessionDuration] = useState("45 minutes");
  
  // Mock available topics
  const availableTopics = [
    { id: "math", name: "Mathematics", icon: "📐" },
    { id: "science", name: "Science", icon: "🧪" },
    { id: "history", name: "History", icon: "📜" },
    { id: "language", name: "Languages", icon: "🗣️" },
    { id: "programming", name: "Computer Science", icon: "💻" },
  ];
  
  // Mock past sessions
  const pastSessions = [
    { 
      id: 1, 
      topic: "Calculus - Derivatives", 
      date: "May 10, 2023", 
      duration: "45 minutes",
      notes: "Covered the power rule, product rule, and chain rule for derivatives."
    },
    { 
      id: 2, 
      topic: "Python Programming", 
      date: "May 5, 2023", 
      duration: "60 minutes",
      notes: "Reviewed object-oriented programming concepts and inheritance."
    },
    { 
      id: 3, 
      topic: "World History - Renaissance", 
      date: "April 28, 2023", 
      duration: "30 minutes",
      notes: "Discussed key figures of the Renaissance period and their contributions."
    }
  ];

  return (
    <div className="w-full max-w-[1070px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <PiChalkboardTeacher className="text-primaryColor" />
          Tutor Me & Note Summerization
        </h1>
        <button className="bg-primaryColor text-white py-2 px-4 rounded-xl flex items-center gap-1">
          <PiCalendarPlus />
          <span>Schedule Session</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20 mb-6">
            <h3 className="font-medium mb-5">Create a New Tutoring Session</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Select a Subject</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {availableTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className={`flex flex-col items-center p-3 rounded-xl border ${
                        selectedTopic === topic.id
                          ? "border-primaryColor bg-primaryColor/5 text-primaryColor"
                          : "border-primaryColor/20 hover:border-primaryColor/40"
                      }`}
                    >
                      <span className="text-2xl mb-1">{topic.icon}</span>
                      <span className="text-sm text-center">{topic.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Specific Topic</label>
                  <input
                    type="text"
                    placeholder="E.g., Calculus, Photosynthesis, etc."
                    className="w-full py-2 px-4 rounded-xl border border-primaryColor/30 focus:outline-none focus:ring-2 focus:ring-primaryColor bg-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Session Duration</label>
                  <select 
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(e.target.value)}
                    className="w-full py-2 px-4 rounded-xl border border-primaryColor/30 focus:outline-none focus:ring-2 focus:ring-primaryColor bg-transparent"
                  >
                    <option value="15 minutes">15 minutes</option>
                    <option value="30 minutes">30 minutes</option>
                    <option value="45 minutes">45 minutes</option>
                    <option value="60 minutes">60 minutes</option>
                    <option value="90 minutes">90 minutes</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Session Goals</label>
                <textarea
                  placeholder="What would you like to achieve in this session? Any specific questions or concepts to cover?"
                  rows={3}
                  className="w-full py-2 px-4 rounded-xl border border-primaryColor/30 focus:outline-none focus:ring-2 focus:ring-primaryColor bg-transparent resize-none"
                ></textarea>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium">Resources (Optional)</label>
                
                <div className="flex items-center border border-primaryColor/30 rounded-xl p-3">
                  <input
                    type="text"
                    placeholder="Add links to study materials or documents..."
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                  />
                  <button className="text-primaryColor hover:bg-primaryColor/10 p-1 rounded">
                    <PiArrowRight />
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button className="text-xs border border-primaryColor/30 text-primaryColor px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-primaryColor/5">
                    <PiBookOpen />
                    <span>Upload Material</span>
                  </button>
                  <button className="text-xs border border-primaryColor/30 text-primaryColor px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-primaryColor/5">
                    <PiListChecks />
                    <span>From My Notes</span>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Date</label>
                  <input
                    type="date"
                    className="w-full py-2 px-4 rounded-xl border border-primaryColor/30 focus:outline-none focus:ring-2 focus:ring-primaryColor bg-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Time</label>
                  <input
                    type="time"
                    className="w-full py-2 px-4 rounded-xl border border-primaryColor/30 focus:outline-none focus:ring-2 focus:ring-primaryColor bg-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm border-t border-primaryColor/10 pt-4 mt-6">
                <span className="text-n300 dark:text-n400">You&apos;ll receive a notification when your session is confirmed.</span>
                <button className="py-2 px-6 bg-primaryColor text-white rounded-xl font-medium">
                  Create Session
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
                  <PiChatCircleText size={24} />
                </div>
                <h4 className="font-medium mb-1">Interactive Learning</h4>
                <p className="text-sm text-n300 dark:text-n400">
                  Real-time chat, whiteboard, and document sharing capabilities.
                </p>
              </div>
              
              <div className="bg-white dark:bg-n0 p-4 rounded-xl border border-primaryColor/20">
                <div className="mb-3 text-primaryColor">
                  <PiClockCountdown size={24} />
                </div>
                <h4 className="font-medium mb-1">Flexible Scheduling</h4>
                <p className="text-sm text-n300 dark:text-n400">
                  Choose session lengths and times that work best for you.
                </p>
              </div>
              
              <div className="bg-white dark:bg-n0 p-4 rounded-xl border border-primaryColor/20">
                <div className="mb-3 text-primaryColor">
                  <PiListChecks size={24} />
                </div>
                <h4 className="font-medium mb-1">Session Materials</h4>
                <p className="text-sm text-n300 dark:text-n400">
                  Access all notes and resources after your session ends.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Upcoming Sessions</h3>
              <span className="text-xs bg-primaryColor/10 text-primaryColor px-2 py-1 rounded-full">
                1 Scheduled
              </span>
            </div>
            
            <div className="border border-primaryColor/20 rounded-xl p-4 bg-primaryColor/5">
              <div className="flex items-center gap-2 text-primaryColor font-medium mb-2">
                <PiCalendarPlus />
                <span>Advanced Algebra</span>
              </div>
              <div className="text-sm text-n300 dark:text-n400 mb-3">
                May 15, 2023 • 2:00 PM - 3:00 PM
              </div>
              <div className="flex justify-between">
                <span className="text-xs bg-successColor/10 text-successColor px-2 py-1 rounded-full flex items-center gap-1">
                  <PiCheck size={12} />
                  <span>Confirmed</span>
                </span>
                <button className="text-xs text-primaryColor hover:underline">
                  View Details
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20">
            <h3 className="font-medium mb-4">Past Sessions</h3>
            
            <div className="space-y-4">
              {pastSessions.map((session) => (
                <div key={session.id} className="border-b border-primaryColor/10 pb-4 last:border-0 last:pb-0">
                  <div className="font-medium mb-1">{session.topic}</div>
                  <div className="flex justify-between text-xs text-n300 dark:text-n400 mb-2">
                    <span>{session.date}</span>
                    <span>{session.duration}</span>
                  </div>
                  <div className="text-sm">{session.notes}</div>
                  <div className="mt-2 flex gap-2">
                    <button className="text-xs text-primaryColor hover:underline">
                      View Notes
                    </button>
                    <button className="text-xs text-primaryColor hover:underline">
                      Schedule Follow-up
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorMe; 