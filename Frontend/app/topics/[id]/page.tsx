"use client";

import React, { useState } from "react";
import {
  PiAlignLeft,
  PiBookOpen,
  PiFileText,
  PiListChecks,
  PiCaretRight,
  PiPlayCircle,
  PiStar,
  PiStarFill,
  PiChartBar,
  PiPencilLine,
  PiExport
} from "react-icons/pi";
import { useParams } from "next/navigation";

const TopicDetail = () => {
  const params = useParams();
  const { id } = params;
  const [activeTab, setActiveTab] = useState("notes");
  
  // Mock data for topics
  const topicData = {
    "topic1": {
      title: "Mathematics 101",
      description: "Comprehensive notes and materials for introductory mathematics, covering algebra, geometry, and calculus basics.",
      progress: 65,
      starred: true,
      lastStudied: "May 10, 2023",
      timeSpent: "15h 20m",
      notes: [
        { id: 1, title: "Algebra Fundamentals", pages: 5, lastEdited: "May 8, 2023" },
        { id: 2, title: "Geometry Basics", pages: 3, lastEdited: "May 5, 2023" },
        { id: 3, title: "Introduction to Calculus", pages: 7, lastEdited: "May 2, 2023" }
      ],
      quizzes: [
        { id: 1, title: "Algebra Quiz 1", questions: 10, score: 85, date: "May 7, 2023" },
        { id: 2, title: "Geometry Quiz", questions: 8, score: 75, date: "May 4, 2023" }
      ],
      materials: [
        { id: 1, title: "Math Formula Sheet", type: "pdf", size: "1.2 MB" },
        { id: 2, title: "Calculus Cheat Sheet", type: "docx", size: "850 KB" },
        { id: 3, title: "Geometry Diagrams", type: "png", size: "3.5 MB" }
      ]
    },
    "topic2": {
      title: "Computer Science Basics",
      description: "Introduction to programming concepts, algorithms, and data structures for beginners.",
      progress: 45,
      starred: false,
      lastStudied: "May 9, 2023",
      timeSpent: "10h 45m",
      notes: [
        { id: 1, title: "Programming Fundamentals", pages: 8, lastEdited: "May 7, 2023" },
        { id: 2, title: "Data Structures", pages: 6, lastEdited: "May 4, 2023" },
        { id: 3, title: "Algorithms Basics", pages: 5, lastEdited: "May 1, 2023" }
      ],
      quizzes: [
        { id: 1, title: "Programming Concepts Quiz", questions: 12, score: 90, date: "May 8, 2023" },
        { id: 2, title: "Data Structures Quiz", questions: 10, score: 80, date: "May 3, 2023" }
      ],
      materials: [
        { id: 1, title: "Python Cheat Sheet", type: "pdf", size: "1.5 MB" },
        { id: 2, title: "Algorithm Flowcharts", type: "png", size: "2.8 MB" },
        { id: 3, title: "Data Structures Diagrams", type: "pdf", size: "3.2 MB" }
      ]
    },
    "topic3": {
      title: "History of Art",
      description: "Survey of art history from prehistoric times to contemporary movements, including major artists and their works.",
      progress: 30,
      starred: true,
      lastStudied: "May 7, 2023",
      timeSpent: "8h 15m",
      notes: [
        { id: 1, title: "Renaissance Art", pages: 10, lastEdited: "May 6, 2023" },
        { id: 2, title: "Impressionism", pages: 7, lastEdited: "May 3, 2023" },
        { id: 3, title: "Modern Art Movements", pages: 9, lastEdited: "April 30, 2023" }
      ],
      quizzes: [
        { id: 1, title: "Renaissance Artists Quiz", questions: 15, score: 88, date: "May 5, 2023" },
        { id: 2, title: "Art Movements Timeline Quiz", questions: 12, score: 92, date: "May 2, 2023" }
      ],
      materials: [
        { id: 1, title: "Famous Paintings Collection", type: "pdf", size: "8.5 MB" },
        { id: 2, title: "Art History Timeline", type: "pdf", size: "2.1 MB" },
        { id: 3, title: "Artist Biographies", type: "docx", size: "1.9 MB" }
      ]
    },
    "topic4": {
      title: "Physics Fundamentals",
      description: "Study materials for basic physics concepts including mechanics, thermodynamics, and electromagnetism.",
      progress: 55,
      starred: false,
      lastStudied: "May 11, 2023",
      timeSpent: "12h 40m",
      notes: [
        { id: 1, title: "Mechanics Principles", pages: 12, lastEdited: "May 9, 2023" },
        { id: 2, title: "Thermodynamics Basics", pages: 8, lastEdited: "May 6, 2023" },
        { id: 3, title: "Electromagnetism Notes", pages: 10, lastEdited: "May 3, 2023" }
      ],
      quizzes: [
        { id: 1, title: "Mechanics Quiz", questions: 15, score: 78, date: "May 8, 2023" },
        { id: 2, title: "Thermodynamics Quiz", questions: 10, score: 85, date: "May 5, 2023" }
      ],
      materials: [
        { id: 1, title: "Physics Formula Sheet", type: "pdf", size: "1.7 MB" },
        { id: 2, title: "Physics Problem Solutions", type: "docx", size: "2.3 MB" },
        { id: 3, title: "Experiment Diagrams", type: "png", size: "4.2 MB" }
      ]
    }
  };
  
  // Get the current topic data
  const currentTopic = topicData[id as keyof typeof topicData] || topicData.topic1;
  
  // Toggle star status
  const [isStarred, setIsStarred] = useState(currentTopic.starred);
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PiAlignLeft className="text-primaryColor" />
            <span className="text-sm text-n300 dark:text-n400">Topics / </span>
            <span className="text-sm">{currentTopic.title}</span>
          </div>
          <h1 className="text-2xl font-semibold">{currentTopic.title}</h1>
          <p className="text-n300 dark:text-n400 mt-1">{currentTopic.description}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button className="py-2 px-4 border border-primaryColor/30 text-primaryColor rounded-xl hover:bg-primaryColor/5 flex items-center gap-1">
            <PiPencilLine />
            <span>Edit Topic</span>
          </button>
          <button 
            className="py-2 px-4 bg-primaryColor text-white rounded-xl flex items-center gap-1"
            onClick={() => window.location.href = `/assistance?topic=${encodeURIComponent(currentTopic.title)}`}
          >
            <PiPlayCircle />
            <span>Study Now</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20">
            {/* Progress bar */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Progress</h3>
                <span className="text-sm text-n300 dark:text-n400">
                  {currentTopic.progress}% Complete
                </span>
              </div>
              <button onClick={() => setIsStarred(!isStarred)}>
                {isStarred ? (
                  <PiStarFill className="text-warningColor" />
                ) : (
                  <PiStar className="text-n300 hover:text-warningColor" />
                )}
              </button>
            </div>
            <div className="w-full bg-n300/20 rounded-full h-2 mb-4">
              <div 
                className="bg-primaryColor h-2 rounded-full" 
                style={{ width: `${currentTopic.progress}%` }}
              ></div>
            </div>
            
            {/* Tab navigation */}
            <div className="flex border-b border-primaryColor/10 mb-4">
              <button 
                onClick={() => setActiveTab("notes")}
                className={`py-2 px-4 font-medium text-sm border-b-2 ${
                  activeTab === "notes" 
                    ? "border-primaryColor text-primaryColor" 
                    : "border-transparent hover:text-primaryColor"
                }`}
              >
                Notes
              </button>
              <button 
                onClick={() => setActiveTab("quizzes")}
                className={`py-2 px-4 font-medium text-sm border-b-2 ${
                  activeTab === "quizzes" 
                    ? "border-primaryColor text-primaryColor" 
                    : "border-transparent hover:text-primaryColor"
                }`}
              >
                Quizzes
              </button>
              <button 
                onClick={() => setActiveTab("materials")}
                className={`py-2 px-4 font-medium text-sm border-b-2 ${
                  activeTab === "materials" 
                    ? "border-primaryColor text-primaryColor" 
                    : "border-transparent hover:text-primaryColor"
                }`}
              >
                Materials
              </button>
            </div>
            
            {/* Notes tab */}
            {activeTab === "notes" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">My Notes</h3>
                  <button className="text-xs bg-primaryColor text-white py-1 px-3 rounded-lg flex items-center gap-1">
                    <PiPencilLine />
                    <span>New Note</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {currentTopic.notes.map((note) => (
                    <div 
                      key={note.id} 
                      className="p-3 border border-primaryColor/20 rounded-lg hover:border-primaryColor/40 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primaryColor/10 rounded-lg">
                          <PiFileText className="text-primaryColor" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{note.title}</h4>
                          <p className="text-xs text-n300 dark:text-n400">
                            {note.pages} pages • Last edited: {note.lastEdited}
                          </p>
                        </div>
                      </div>
                      <button className="p-1 opacity-0 group-hover:opacity-100 rounded-lg hover:bg-primaryColor/10 transition-opacity">
                        <PiCaretRight className="text-primaryColor" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quizzes tab */}
            {activeTab === "quizzes" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">My Quizzes</h3>
                  <button className="text-xs bg-primaryColor text-white py-1 px-3 rounded-lg flex items-center gap-1">
                    <PiListChecks />
                    <span>New Quiz</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {currentTopic.quizzes.map((quiz) => (
                    <div 
                      key={quiz.id}
                      className="p-3 border border-primaryColor/20 rounded-lg hover:border-primaryColor/40 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primaryColor/10 rounded-lg">
                          <PiListChecks className="text-primaryColor" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{quiz.title}</h4>
                          <p className="text-xs text-n300 dark:text-n400">
                            {quiz.questions} questions • Completed: {quiz.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          quiz.score >= 80 
                            ? "bg-successColor/10 text-successColor" 
                            : quiz.score >= 60 
                              ? "bg-warningColor/10 text-warningColor"
                              : "bg-errorColor/10 text-errorColor"
                        }`}>
                          {quiz.score}%
                        </span>
                        <button className="p-1 opacity-0 group-hover:opacity-100 rounded-lg hover:bg-primaryColor/10 transition-opacity">
                          <PiCaretRight className="text-primaryColor" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Materials tab */}
            {activeTab === "materials" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Study Materials</h3>
                  <button className="text-xs bg-primaryColor text-white py-1 px-3 rounded-lg flex items-center gap-1">
                    <PiExport />
                    <span>Add Material</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {currentTopic.materials.map((material) => (
                    <div 
                      key={material.id}
                      className="p-3 border border-primaryColor/20 rounded-lg hover:border-primaryColor/40 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primaryColor/10 rounded-lg">
                          <PiBookOpen className="text-primaryColor" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{material.title}</h4>
                          <p className="text-xs text-n300 dark:text-n400">
                            {material.type.toUpperCase()} • {material.size}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-primaryColor hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                          Download
                        </button>
                        <button className="p-1 opacity-0 group-hover:opacity-100 rounded-lg hover:bg-primaryColor/10 transition-opacity">
                          <PiCaretRight className="text-primaryColor" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20 mb-6">
            <h3 className="font-medium mb-4">Study Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-n300 dark:text-n400">Last Studied</span>
                <span className="font-medium">{currentTopic.lastStudied}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-n300 dark:text-n400">Time Spent</span>
                <span className="font-medium">{currentTopic.timeSpent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-n300 dark:text-n400">Notes</span>
                <span className="font-medium">{currentTopic.notes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-n300 dark:text-n400">Quizzes</span>
                <span className="font-medium">{currentTopic.quizzes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-n300 dark:text-n400">Materials</span>
                <span className="font-medium">{currentTopic.materials.length}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-primaryColor/10">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <PiChartBar className="text-primaryColor" />
                <span>Progress Chart</span>
              </h3>
              
              {/* Simple placeholder for a chart */}
              <div className="h-36 flex items-end gap-1">
                {[40, 55, 60, 65, 65, 65, 65].map((height, idx) => (
                  <div 
                    key={idx}
                    className="flex-1 bg-primaryColor/20 rounded-t"
                    style={{ height: `${height}%` }}
                  ></div>
                ))}
              </div>
              <div className="mt-1 flex text-xs text-n300 justify-between">
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
                <span>S</span>
              </div>
            </div>
          </div>
          
          <div className="bg-primaryColor/5 p-5 rounded-xl border border-primaryColor/20">
            <h3 className="font-medium mb-3">Recommended Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-n0 border border-primaryColor/20 hover:border-primaryColor/40 text-left">
                <PiListChecks className="text-primaryColor" />
                <span className="text-sm">Take a practice quiz</span>
              </button>
              
              <button className="w-full flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-n0 border border-primaryColor/20 hover:border-primaryColor/40 text-left">
                <PiPlayCircle className="text-primaryColor" />
                <span className="text-sm">Create audio recap</span>
              </button>
              
              <button className="w-full flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-n0 border border-primaryColor/20 hover:border-primaryColor/40 text-left">
                <PiFileText className="text-primaryColor" />
                <span className="text-sm">Review latest notes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicDetail; 