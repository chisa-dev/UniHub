"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { quizzesService } from './quizzes.service';
import { Quiz, Topic, QuizDifficulty, CreateQuizParams } from './types';
import {
  PiExam,
  PiPlus,
  PiMagnifyingGlass,
  PiBookOpen,
  PiTrophy,
  PiArrowRight,
  PiSpinner,
  PiListChecks,
  PiChartLineUp,
  PiLightbulb,
  PiTimer,
  PiInfo,
  PiArrowsCounterClockwise
} from "react-icons/pi";
import Image from "next/image";

export default function QuizzesPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('medium');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Filtered quizzes
  const filteredQuizzes = recentQuizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.topic_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [topicsData, quizzesData] = await Promise.all([
          quizzesService.getTopics(),
          quizzesService.getQuizzes(1, 10)
        ]);
        
        setTopics(topicsData);
        setRecentQuizzes(quizzesData.quizzes);
      } catch (err) {
        console.error('[LOG quizzes_page] ========= Error loading data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateQuiz = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!title.trim() || !selectedTopic) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      
      const params: CreateQuizParams = {
        title,
        topicId: selectedTopic,
        difficulty,
        numQuestions,
      };
      
      const newQuiz = await quizzesService.createQuiz(params);
      router.push(`/quizzes/${newQuiz.id}`);
    } catch (err) {
      console.error('[LOG quizzes_page] ========= Error creating quiz:', err);
      setError('Failed to create quiz. Please try again.');
      setCreating(false);
    }
  };

  const getDifficultyBadge = (diff: QuizDifficulty) => {
    switch (diff) {
      case 'easy': return <span className="text-xs bg-successColor/20 text-successColor px-2 py-0.5 rounded-full">Easy</span>;
      case 'medium': return <span className="text-xs bg-warningColor/20 text-warningColor px-2 py-0.5 rounded-full">Medium</span>;
      case 'hard': return <span className="text-xs bg-errorColor/20 text-errorColor px-2 py-0.5 rounded-full">Hard</span>;
      default: return <span className="text-xs bg-primaryColor/20 text-primaryColor px-2 py-0.5 rounded-full">{diff}</span>;
    }
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 pb-10 max-w-[1200px] mx-auto">
      {/* Hero Section */}
      <div className="mb-8 bg-white rounded-xl p-6 border border-primaryColor/20">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-3">Test Your Knowledge</h1>
            <p className="text-n300 dark:text-n400 mb-6">
              Create personalized quizzes on any topic and track your learning progress.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => document.getElementById('create-quiz')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-primaryColor text-white py-2.5 px-5 rounded-lg flex items-center gap-2 hover:bg-primaryColor/90 transition-colors"
              >
                <PiPlus className="size-5" />
                Create Quiz
              </button>
              <button 
                className="border border-primaryColor/20 text-primaryColor py-2.5 px-5 rounded-lg flex items-center gap-2 hover:bg-primaryColor/5 transition-colors"
              >
                <PiTrophy className="size-5" />
                My Quizzes
              </button>
            </div>
          </div>
          <div className="w-full md:w-auto flex justify-center">
            <div className="relative w-60 h-60">
              <div className="absolute inset-0 bg-primaryColor/20 rounded-full circle"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <PiExam className="text-primaryColor size-24" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Create Quiz */}
        <div className="lg:col-span-1 space-y-6">
          <div id="create-quiz" className="bg-white rounded-xl border border-primaryColor/20 p-6 sticky top-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <PiPlus className="text-primaryColor size-5" />
                Create Quiz
              </h2>
              <div className="text-xs bg-primaryColor/10 text-primaryColor px-2 py-1 rounded-full">
                AI-powered
              </div>
            </div>
            
            <form onSubmit={handleCreateQuiz} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Quiz Title</label>
                <input
                  type="text"
                  placeholder="Enter a title for your quiz"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-lg border border-primaryColor/30 bg-transparent dark:bg-n700/10 focus:outline-none focus:ring-2 focus:ring-primaryColor/50"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5">Select Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-lg border border-primaryColor/30 bg-transparent dark:bg-n700/10 focus:outline-none focus:ring-2 focus:ring-primaryColor/50 appearance-none"
                  required
                >
                  <option value="">Select a topic</option>
                  {topics.map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as QuizDifficulty)}
                    className="w-full py-2.5 px-4 rounded-lg border border-primaryColor/30 bg-transparent dark:bg-n700/10 focus:outline-none focus:ring-2 focus:ring-primaryColor/50 appearance-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5">Questions</label>
                  <select
                    value={numQuestions.toString()}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                    className="w-full py-2.5 px-4 rounded-lg border border-primaryColor/30 bg-transparent dark:bg-n700/10 focus:outline-none focus:ring-2 focus:ring-primaryColor/50 appearance-none"
                  >
                    <option value="3">3 Questions</option>
                    <option value="5">5 Questions</option>
                    <option value="10">10 Questions</option>
                    <option value="15">15 Questions</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="text-errorColor text-sm p-3 bg-errorColor/10 rounded-lg flex items-start">
                  <PiInfo className="size-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              
              <button 
                type="submit"
                className={`w-full py-3 bg-primaryColor text-white rounded-lg font-medium flex items-center justify-center gap-2 ${
                  creating || !selectedTopic || !title.trim() ? "opacity-70 cursor-not-allowed" : "hover:bg-primaryColor/90 transition-colors"
                }`}
                disabled={creating || !selectedTopic || !title.trim()}
              >
                {creating ? (
                  <>
                    <PiSpinner className="animate-spin size-5" />
                    <span>Generating Quiz...</span>
                  </>
                ) : (
                  <>
                    <PiLightbulb className="size-5" />
                    <span>Generate Quiz</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
        
        {/* Right Column - Quizzes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Quizzes */}
          <div className="bg-white rounded-xl border border-primaryColor/20 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <PiArrowsCounterClockwise className="text-primaryColor size-5" />
                Recent Quizzes
              </h2>
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 py-2 pl-9 pr-4 border border-primaryColor/30 rounded-lg text-sm bg-transparent dark:bg-n700/10 focus:outline-none focus:ring-2 focus:ring-primaryColor/50"
                />
                <PiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-n300 size-4" />
              </div>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="border border-primaryColor/10 p-5 rounded-lg animate-pulse">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="h-5 w-40 bg-primaryColor/10 rounded mb-2"></div>
                        <div className="h-4 w-24 bg-primaryColor/10 rounded mb-3"></div>
                      </div>
                      <div className="h-5 w-16 bg-primaryColor/10 rounded"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 w-20 bg-primaryColor/10 rounded"></div>
                      <div className="h-4 w-20 bg-primaryColor/10 rounded"></div>
                      <div className="h-4 w-20 bg-primaryColor/10 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredQuizzes.length > 0 ? (
              <div className="space-y-4">
                {filteredQuizzes.map((quiz) => (
                  <div 
                    key={quiz.id} 
                    className="border border-primaryColor/20 p-5 rounded-lg hover:border-primaryColor/40 hover:bg-primaryColor/5 cursor-pointer transition-all duration-200 group"
                    onClick={() => router.push(`/quizzes/${quiz.id}`)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-primaryColor transition-colors">{quiz.title}</h3>
                        <p className="text-sm text-n300 dark:text-n400">{quiz.topic_title}</p>
                      </div>
                      {getDifficultyBadge(quiz.difficulty)}
                    </div>
                    <div className="flex flex-wrap justify-between text-sm">
                      <div className="flex items-center mr-4 mb-2 sm:mb-0">
                        <PiBookOpen className="mr-1.5 text-primaryColor size-4" />
                        <span>{quiz.question_count} questions</span>
                      </div>
                      <div className="flex items-center mr-4 mb-2 sm:mb-0">
                        <PiTimer className="mr-1.5 text-primaryColor size-4" />
                        <span>~{Math.ceil(quiz.question_count * 0.5)} min</span>
                      </div>
                      <div className="flex items-center mb-2 sm:mb-0">
                        <PiTrophy className="mr-1.5 text-primaryColor size-4" />
                        <span>{quiz.attempt_count} attempts</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/quizzes/${quiz.id}`);
                        }}
                        className="text-primaryColor font-medium hover:underline flex items-center mt-2 sm:mt-0 sm:ml-auto"
                      >
                        <span>Take Quiz</span>
                        <PiArrowRight className="ml-1 size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-10 border border-dashed border-primaryColor/20 rounded-lg">
                <PiBookOpen className="size-16 mx-auto text-n300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No quizzes found</h3>
                <p className="text-n300 dark:text-n400 mb-6 max-w-md mx-auto">
                  {searchTerm ? 
                    `No quizzes matching "${searchTerm}" were found. Try a different search term.` : 
                    "Create your first quiz to get started with learning."
                  }
                </p>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="bg-primaryColor/10 text-primaryColor py-2 px-4 rounded-lg hover:bg-primaryColor/20 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Features */}
          <div className="bg-white rounded-xl border border-primaryColor/20 p-6">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
              <PiChartLineUp className="text-primaryColor size-5" />
              Features
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-primaryColor/20 rounded-lg hover:border-primaryColor/40 transition-colors">
                <div className="flex items-center gap-3 text-primaryColor font-medium mb-2">
                  <div className="size-8 flex items-center justify-center bg-primaryColor/10 rounded-full">
                    <PiListChecks className="size-4" />
                  </div>
                  <span>AI-Powered Questions</span>
                </div>
                <p className="text-sm text-n300 dark:text-n400">
                  Our AI generates personalized questions based on your selected topic to test your knowledge effectively.
                </p>
              </div>
              
              <div className="p-4 border border-primaryColor/20 rounded-lg hover:border-primaryColor/40 transition-colors">
                <div className="flex items-center gap-3 text-primaryColor font-medium mb-2">
                  <div className="size-8 flex items-center justify-center bg-primaryColor/10 rounded-full">
                    <PiBookOpen className="size-4" />
                  </div>
                  <span>Topic-Based Learning</span>
                </div>
                <p className="text-sm text-n300 dark:text-n400">
                  Create quizzes on specific topics to target your study needs and strengthen your understanding.
                </p>
              </div>
              
              <div className="p-4 border border-primaryColor/20 rounded-lg hover:border-primaryColor/40 transition-colors">
                <div className="flex items-center gap-3 text-primaryColor font-medium mb-2">
                  <div className="size-8 flex items-center justify-center bg-primaryColor/10 rounded-full">
                    <PiTrophy className="size-4" />
                  </div>
                  <span>Performance Tracking</span>
                </div>
                <p className="text-sm text-n300 dark:text-n400">
                  Monitor your quiz scores over time and see your progress as you improve your knowledge.
                </p>
              </div>
              
              <div className="p-4 border border-primaryColor/20 rounded-lg hover:border-primaryColor/40 transition-colors">
                <div className="flex items-center gap-3 text-primaryColor font-medium mb-2">
                  <div className="size-8 flex items-center justify-center bg-primaryColor/10 rounded-full">
                    <PiTimer className="size-4" />
                  </div>
                  <span>Timed Quizzes</span>
                </div>
                <p className="text-sm text-n300 dark:text-n400">
                  Challenge yourself with timed quizzes to improve your speed and recall under pressure.
                </p>
              </div>
            </div>
          </div>
          
          {/* How It Works */}
          <div className="bg-primaryColor/5 rounded-xl border border-primaryColor/20 p-6">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
              <PiInfo className="text-primaryColor size-5" />
              How It Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-primaryColor/20 hover:border-primaryColor/40 transition-colors">
                <div className="size-10 flex items-center justify-center bg-primaryColor/20 text-primaryColor rounded-full mb-4 font-bold">
                  1
                </div>
                <h3 className="font-medium text-lg mb-2">Select a Topic</h3>
                <p className="text-sm text-n300 dark:text-n400">
                  Choose a topic from your created topics or select from our library of knowledge areas.
                </p>
              </div>
              
              <div className="bg-white p-5 rounded-xl border border-primaryColor/20 hover:border-primaryColor/40 transition-colors">
                <div className="size-10 flex items-center justify-center bg-primaryColor/20 text-primaryColor rounded-full mb-4 font-bold">
                  2
                </div>
                <h3 className="font-medium text-lg mb-2">Generate Questions</h3>
                <p className="text-sm text-n300 dark:text-n400">
                  Our AI will create a personalized set of questions based on the topic and difficulty level you select.
                </p>
              </div>
              
              <div className="bg-white p-5 rounded-xl border border-primaryColor/20 hover:border-primaryColor/40 transition-colors">
                <div className="size-10 flex items-center justify-center bg-primaryColor/20 text-primaryColor rounded-full mb-4 font-bold">
                  3
                </div>
                <h3 className="font-medium text-lg mb-2">Take the Quiz</h3>
                <p className="text-sm text-n300 dark:text-n400">
                  Answer the questions, submit your answers, and get immediate feedback on your performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 