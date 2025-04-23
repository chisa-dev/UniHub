"use client";

import React, { useState } from "react";
import {
  PiExam,
  PiPlus,
  PiFileText,
  PiUpload,
  PiTextAUnderline,
  PiListChecks,
  PiChats,
  PiQuestion,
  PiCheck
} from "react-icons/pi";

const TestsQuizFetch = () => {
  const [quizType, setQuizType] = useState("multiple-choice");
  const [prompt, setPrompt] = useState("");
  const [showExample, setShowExample] = useState(false);
  
  // Mock quiz example data
  const exampleQuiz = {
    topic: "Cell Biology",
    questions: [
      {
        id: 1,
        question: "Which of the following organelles is responsible for cellular respiration?",
        options: [
          { id: "a", text: "Ribosomes" },
          { id: "b", text: "Mitochondria" },
          { id: "c", text: "Endoplasmic Reticulum" },
          { id: "d", text: "Golgi Apparatus" }
        ],
        correctAnswer: "b",
        explanation: "Mitochondria are known as the powerhouse of the cell and are responsible for producing ATP through cellular respiration."
      },
      {
        id: 2,
        question: "What is the function of the cell membrane?",
        options: [
          { id: "a", text: "Store genetic information" },
          { id: "b", text: "Produce proteins" },
          { id: "c", text: "Control what enters and exits the cell" },
          { id: "d", text: "Digest cellular waste" }
        ],
        correctAnswer: "c",
        explanation: "The cell membrane, also called the plasma membrane, controls what substances can enter and exit the cell, maintaining homeostasis."
      },
      {
        id: 3,
        question: "Which structure is NOT found in both prokaryotic and eukaryotic cells?",
        options: [
          { id: "a", text: "Cell membrane" },
          { id: "b", text: "Nucleus" },
          { id: "c", text: "Ribosomes" },
          { id: "d", text: "Cytoplasm" }
        ],
        correctAnswer: "b",
        explanation: "Prokaryotic cells do not have a nucleus or membrane-bound organelles, while eukaryotic cells do have a nucleus to house genetic material."
      }
    ]
  };

  return (
    <div className="w-full max-w-[1070px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <PiExam className="text-primaryColor" />
          Tests & QuizFetch
        </h1>
        <button className="bg-primaryColor text-white py-2 px-4 rounded-xl flex items-center gap-1">
          <PiPlus />
          <span>Create Quiz</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20 mb-4">
            <h3 className="font-medium mb-4">Quiz Types</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setQuizType("multiple-choice")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left ${
                  quizType === "multiple-choice" 
                    ? "bg-primaryColor/10 text-primaryColor border border-primaryColor/30" 
                    : "hover:bg-primaryColor/5 border border-transparent"
                }`}
              >
                <PiListChecks size={20} />
                <div>
                  <div className="font-medium">Multiple Choice</div>
                  <div className="text-xs text-n300 dark:text-n400">Questions with several options</div>
                </div>
              </button>
              
              <button 
                onClick={() => setQuizType("true-false")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left ${
                  quizType === "true-false" 
                    ? "bg-primaryColor/10 text-primaryColor border border-primaryColor/30" 
                    : "hover:bg-primaryColor/5 border border-transparent"
                }`}
              >
                <PiCheck size={20} />
                <div>
                  <div className="font-medium">True/False</div>
                  <div className="text-xs text-n300 dark:text-n400">Simple true or false statements</div>
                </div>
              </button>
              
              <button 
                onClick={() => setQuizType("short-answer")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left ${
                  quizType === "short-answer" 
                    ? "bg-primaryColor/10 text-primaryColor border border-primaryColor/30" 
                    : "hover:bg-primaryColor/5 border border-transparent"
                }`}
              >
                <PiTextAUnderline size={20} />
                <div>
                  <div className="font-medium">Short Answer</div>
                  <div className="text-xs text-n300 dark:text-n400">Brief written responses</div>
                </div>
              </button>
              
              <button 
                onClick={() => setQuizType("flashcards")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left ${
                  quizType === "flashcards" 
                    ? "bg-primaryColor/10 text-primaryColor border border-primaryColor/30" 
                    : "hover:bg-primaryColor/5 border border-transparent"
                }`}
              >
                <PiFileText size={20} />
                <div>
                  <div className="font-medium">Flashcards</div>
                  <div className="text-xs text-n300 dark:text-n400">Two-sided cards for memorization</div>
                </div>
              </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20">
            <h3 className="font-medium mb-4">Recent Quizzes</h3>
            <div className="space-y-3">
              {["Biology Basics", "World History: Renaissance", "Math: Calculus I"].map((quiz, idx) => (
                <div key={idx} className="p-3 border border-primaryColor/10 rounded-lg hover:border-primaryColor/30 cursor-pointer">
                  <div className="font-medium">{quiz}</div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-n300 dark:text-n400">10 questions</span>
                    <span className="text-xs bg-successColor/10 text-successColor px-2 py-0.5 rounded-full">
                      85% Score
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20 mb-6">
            <h3 className="font-medium mb-4">Create a New Quiz</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Topic or Subject</label>
                <input 
                  type="text" 
                  placeholder="Enter a topic (e.g., Cell Biology, World War II, etc.)"
                  className="w-full py-2 px-4 rounded-xl border border-primaryColor/30 focus:outline-none focus:ring-2 focus:ring-primaryColor bg-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Quiz Content Source</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button className="p-4 border border-primaryColor/30 rounded-xl flex flex-col items-center gap-2 hover:bg-primaryColor/5">
                    <PiUpload size={24} className="text-primaryColor" />
                    <span className="font-medium">Upload Document</span>
                    <span className="text-xs text-center text-n300 dark:text-n400">PDF, DOCX, or TXT</span>
                  </button>
                  
                  <button className="p-4 border border-primaryColor/30 rounded-xl flex flex-col items-center gap-2 hover:bg-primaryColor/5">
                    <PiChats size={24} className="text-primaryColor" />
                    <span className="font-medium">Text Input</span>
                    <span className="text-xs text-center text-n300 dark:text-n400">Enter or paste text</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Custom Prompt or Instructions (Optional)</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Add specific instructions for the quiz (e.g., focus on specific concepts, include diagrams, etc.)"
                  rows={3}
                  className="w-full py-2 px-4 rounded-xl border border-primaryColor/30 focus:outline-none focus:ring-2 focus:ring-primaryColor bg-transparent resize-none"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Number of Questions</label>
                  <select className="w-full py-2 px-4 rounded-xl border border-primaryColor/30 focus:outline-none focus:ring-2 focus:ring-primaryColor bg-transparent">
                    <option>5</option>
                    <option>10</option>
                    <option>15</option>
                    <option>20</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty Level</label>
                  <select className="w-full py-2 px-4 rounded-xl border border-primaryColor/30 focus:outline-none focus:ring-2 focus:ring-primaryColor bg-transparent">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                    <option>Mixed</option>
                  </select>
                </div>
              </div>
              
              <button className="w-full py-3 bg-primaryColor text-white rounded-xl font-medium">
                Generate Quiz
              </button>
            </div>
          </div>
          
          <div className="bg-primaryColor/5 p-4 rounded-xl border border-primaryColor/20">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Example Quiz Preview</h3>
              <button 
                onClick={() => setShowExample(!showExample)}
                className="text-sm text-primaryColor hover:underline"
              >
                {showExample ? "Hide" : "Show"} Example
              </button>
            </div>
            
            {showExample && (
              <div className="mt-4 space-y-6">
                <div className="text-center mb-4">
                  <h4 className="text-xl font-bold">{exampleQuiz.topic} Quiz</h4>
                  <p className="text-sm text-n300 dark:text-n400">3 Multiple Choice Questions</p>
                </div>
                
                {exampleQuiz.questions.map((q) => (
                  <div key={q.id} className="bg-white dark:bg-n0 p-4 rounded-xl border border-primaryColor/20">
                    <div className="flex items-start gap-2 mb-3">
                      <PiQuestion className="text-primaryColor mt-1 flex-shrink-0" />
                      <span className="font-medium">{q.question}</span>
                    </div>
                    
                    <div className="space-y-2 ml-6 mb-4">
                      {q.options.map((option) => (
                        <div 
                          key={option.id}
                          className={`p-2 border rounded-lg flex items-center gap-2 ${
                            option.id === q.correctAnswer
                              ? "border-successColor/30 bg-successColor/5"
                              : "border-primaryColor/20 hover:border-primaryColor/40"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            option.id === q.correctAnswer
                              ? "bg-successColor text-white"
                              : "border border-n300"
                          }`}>
                            {option.id === q.correctAnswer && <PiCheck size={12} />}
                          </div>
                          <span>{option.text}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="ml-6 p-3 bg-primaryColor/5 rounded-lg border border-primaryColor/20">
                      <div className="font-medium mb-1">Explanation:</div>
                      <p className="text-sm">{q.explanation}</p>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between">
                  <button className="py-2 px-4 border border-primaryColor/30 text-primaryColor rounded-xl hover:bg-primaryColor/5">
                    Save Quiz
                  </button>
                  <button className="py-2 px-4 bg-primaryColor text-white rounded-xl">
                    Take Another Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestsQuizFetch; 