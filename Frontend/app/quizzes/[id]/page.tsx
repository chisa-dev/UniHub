'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { quizzesService } from '../quizzes.service';
import { QuizWithQuestions, QuizQuestion, QuizAnswers, QuizAttemptResult } from '../types';
import { 
  PiExam, 
  PiArrowLeft, 
  PiArrowRight, 
  PiClock, 
  PiBookOpen, 
  PiTrophy, 
  PiSpinner, 
  PiCheckCircle, 
  PiXCircle,
  PiInfo,
  PiTimer,
  PiLightbulb,
  PiBrain,
  PiCheck,
  PiX,
  PiGraduationCap,
  PiWarningCircle,
  PiHourglassHigh,
  PiArrowsCounterClockwise,
  PiListChecks
} from "react-icons/pi";

export default function QuizDetailsPage({ params }: { params: { id: string } }) {
  const quizId = params.id;
  
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Quiz taking state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<QuizAnswers>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  
  // Timer state
  const [timeSpent, setTimeSpent] = useState<number>(0);
  
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const data = await quizzesService.getQuizById(quizId);
        setQuiz(data);
      } catch (err) {
        console.error('[LOG quiz_details] ========= Error loading quiz:', err);
        setError('Failed to load quiz. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);
  
  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (quizStarted && !quizCompleted) {
      timer = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizStarted, quizCompleted]);
  
  const handleStartQuiz = () => {
    setQuizStarted(true);
    setTimeSpent(0);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
  };
  
  const handleSelectAnswer = (questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };
  
  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };
  
  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    
    const questionIds = quiz.questions.map(q => q.id);
    const isAllAnswered = questionIds.every(id => selectedAnswers[id]);
    
    if (!isAllAnswered) {
      const confirmed = window.confirm('You have unanswered questions. Are you sure you want to submit?');
      if (!confirmed) return;
    }
    
    try {
      setSubmitting(true);
      const response = await quizzesService.submitQuizAttempt(quiz.id, selectedAnswers);
      setResult(response);
      setQuizCompleted(true);
    } catch (err) {
      console.error('[LOG quiz_details] ========= Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-successColor/20 text-successColor';
      case 'medium': return 'bg-warningColor/20 text-warningColor';
      case 'hard': return 'bg-errorColor/20 text-errorColor';
      default: return 'bg-primaryColor/20 text-primaryColor';
    }
  };
  
  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <PiLightbulb className="size-4 mr-1.5" />;
      case 'medium': return <PiBrain className="size-4 mr-1.5" />;
      case 'hard': return <PiGraduationCap className="size-4 mr-1.5" />;
      default: return <PiInfo className="size-4 mr-1.5" />;
    }
  };
  
  const getCurrentQuestion = (): QuizQuestion | null => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) return null;
    return quiz.questions[currentQuestionIndex];
  };
  
  if (loading) {
    return (
      <div className="px-4 sm:px-6 md:px-8 pb-10 max-w-[1200px] mx-auto">
        <div className="mb-8 flex items-center gap-2">
          <button className="p-2 border border-primaryColor/20 rounded-lg flex items-center justify-center opacity-50">
            <PiArrowLeft className="size-4" />
          </button>
          <div className="h-8 w-32 bg-primaryColor/10 animate-pulse rounded-lg"></div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-primaryColor/20 animate-pulse">
          <div className="h-8 w-3/4 bg-primaryColor/10 rounded-lg mb-4"></div>
          <div className="h-4 w-1/2 bg-primaryColor/10 rounded-lg mb-6"></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 w-full bg-primaryColor/10 rounded-lg"></div>
            ))}
          </div>
          
          <div className="h-24 w-full bg-primaryColor/10 rounded-lg mb-6"></div>
          
          <div className="space-y-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 w-full bg-primaryColor/10 rounded-lg"></div>
            ))}
          </div>
          
          <div className="h-12 w-full bg-primaryColor/10 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  if (error || !quiz) {
    return (
      <div className="px-4 sm:px-6 md:px-8 pb-10 max-w-[1200px] mx-auto">
        <div className="mb-8">
          <button 
            onClick={() => router.push('/quizzes')}
            className="py-2.5 px-4 border border-primaryColor/20 rounded-lg flex items-center gap-2 hover:bg-primaryColor/5 transition-colors"
          >
            <PiArrowLeft className="size-4" />
            <span>Back to Quizzes</span>
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-primaryColor/20">
          <div className="flex items-center gap-3 mb-6 text-errorColor">
            <PiWarningCircle className="size-8" />
            <h2 className="text-xl font-semibold">Error Loading Quiz</h2>
          </div>
          
          <p className="text-n300 dark:text-n400 mb-4">
            We encountered a problem while loading this quiz.
          </p>
          
          <div className="p-4 bg-errorColor/10 border border-errorColor/20 rounded-lg mb-6">
            <p className="text-errorColor text-sm">{error || 'Failed to load quiz. Please try again.'}</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="py-2.5 px-6 bg-primaryColor text-white rounded-lg hover:bg-primaryColor/90 transition-colors flex items-center gap-2"
            >
              <PiArrowsCounterClockwise className="size-4" />
              <span>Try Again</span>
            </button>
            
            <button 
              onClick={() => router.push('/quizzes')}
              className="py-2.5 px-6 border border-primaryColor/20 text-primaryColor rounded-lg hover:bg-primaryColor/5 transition-colors"
            >
              Return to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Quiz completed - show results
  if (quizCompleted && result) {
    const correctPercentage = (result.correctAnswers / result.totalQuestions) * 100;
    const isPassing = correctPercentage >= 70;
    
    return (
      <div className="px-4 sm:px-6 md:px-8 pb-10 max-w-[1200px] mx-auto">
        <div className="mb-8">
          <button 
            onClick={() => router.push('/quizzes')}
            className="py-2.5 px-4 border border-primaryColor/20 rounded-lg flex items-center gap-2 hover:bg-primaryColor/5 transition-colors"
          >
            <PiArrowLeft className="size-4" />
            <span>Back to Quizzes</span>
          </button>
        </div>
        
        <div className="bg-white rounded-xl border border-primaryColor/20 overflow-hidden">
          <div className={`py-5 px-6 border-b ${isPassing ? 'bg-successColor/10 border-successColor/20' : 'bg-errorColor/10 border-errorColor/20'}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {isPassing ? (
                  <div className="size-10 rounded-full bg-successColor/20 flex items-center justify-center">
                    <PiCheckCircle className="size-6 text-successColor" />
                  </div>
                ) : (
                  <div className="size-10 rounded-full bg-errorColor/20 flex items-center justify-center">
                    <PiXCircle className="size-6 text-errorColor" />
                  </div>
                )}
                
                <div>
                  <h1 className="text-xl font-semibold">
                    {isPassing ? 'Quiz Completed Successfully' : 'Quiz Completed'}
                  </h1>
                  <p className="text-sm text-n300 dark:text-n400">
                    {quiz.topic_title} • {formatTime(timeSpent)} total time
                  </p>
                </div>
              </div>
              
              <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                isPassing ? 'bg-successColor/20 text-successColor' : 'bg-errorColor/20 text-errorColor'
              }`}>
                {isPassing ? 'Passed' : 'Failed'}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-8 text-center">
              <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
              <p className="text-n300 dark:text-n400 mb-6 max-w-md mx-auto">
                Here are your results for this quiz. You can review your performance below.
              </p>
              
              <div className="inline-block relative mb-2">
                <div className="size-40 sm:size-48 rounded-full flex items-center justify-center bg-n30 dark:bg-n700">
                  <div className={`size-32 sm:size-40 rounded-full flex flex-col items-center justify-center ${
                    isPassing ? 'bg-successColor/10' : 'bg-errorColor/10'
                  }`}>
                    <div className={`text-4xl sm:text-5xl font-bold ${
                      isPassing ? 'text-successColor' : 'text-errorColor'
                    }`}>
                      {correctPercentage.toFixed(0)}%
                    </div>
                    <div className="text-sm mt-1">Score</div>
                  </div>
                </div>
                
                <div className="absolute top-0 left-0 w-full h-full">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      className={`${isPassing ? 'text-successColor/40' : 'text-errorColor/40'}`}
                      strokeDasharray={`calc(${correctPercentage} * 2.83) 283`}
                    />
                  </svg>
                </div>
              </div>
              
              <div className={`text-xl font-semibold ${isPassing ? 'text-successColor' : 'text-errorColor'}`}>
                {result.correctAnswers} of {result.totalQuestions} correct
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className={`p-4 rounded-lg border ${isPassing ? 'border-successColor/30 bg-successColor/5' : 'border-primaryColor/20'}`}>
                <div className="text-sm text-n300 dark:text-n400 mb-1">Correct Answers</div>
                <div className="font-medium flex items-center text-successColor">
                  <PiCheck className="size-4 mr-2" />
                  {result.correctAnswers} questions
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border ${!isPassing ? 'border-errorColor/30 bg-errorColor/5' : 'border-primaryColor/20'}`}>
                <div className="text-sm text-n300 dark:text-n400 mb-1">Incorrect Answers</div>
                <div className="font-medium flex items-center text-errorColor">
                  <PiX className="size-4 mr-2" />
                  {result.totalQuestions - result.correctAnswers} questions
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-primaryColor/20">
                <div className="text-sm text-n300 dark:text-n400 mb-1">Time Taken</div>
                <div className="font-medium flex items-center text-primaryColor">
                  <PiClock className="size-4 mr-2" />
                  {formatTime(timeSpent)}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="py-2.5 px-6 border border-primaryColor/20 text-primaryColor rounded-lg hover:bg-primaryColor/5 transition-colors flex-1 flex items-center justify-center gap-2"
                onClick={() => router.push('/quizzes')}
              >
                <PiArrowLeft className="size-4" />
                <span>Back to Quizzes</span>
              </button>
              
              <button 
                className="py-2.5 px-6 bg-primaryColor text-white rounded-lg hover:bg-primaryColor/90 transition-colors flex-1 flex items-center justify-center gap-2"
                onClick={() => {
                  setQuizCompleted(false);
                  setQuizStarted(false);
                  setResult(null);
                }}
              >
                <PiArrowsCounterClockwise className="size-4" />
                <span>Take Again</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Quiz not started
  if (!quizStarted) {
    return (
      <div className="px-4 sm:px-6 md:px-8 pb-10 max-w-[1200px] mx-auto">
        <div className="mb-8">
          <button 
            onClick={() => router.push('/quizzes')}
            className="py-2.5 px-4 border border-primaryColor/20 rounded-lg flex items-center gap-2 hover:bg-primaryColor/5 transition-colors"
          >
            <PiArrowLeft className="size-4" />
            <span>Back to Quizzes</span>
          </button>
        </div>
        
        <div className="bg-white rounded-xl border border-primaryColor/20 overflow-hidden">
          <div className="py-5 px-6 border-b border-primaryColor/10 bg-primaryColor/5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primaryColor/20 flex items-center justify-center">
                  <PiExam className="size-6 text-primaryColor" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">{quiz.title}</h1>
                  <p className="text-sm text-n300 dark:text-n400">
                    {quiz.topic_title}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getDifficultyColor(quiz.difficulty)}`}>
                  {getDifficultyIcon(quiz.difficulty)}
                  {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              {quiz.description && (
                <div className="bg-primaryColor/5 p-4 rounded-lg mb-6">
                  <p className="text-n500 dark:text-n100">{quiz.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg border border-primaryColor/20 bg-white">
                  <div className="text-sm text-n300 dark:text-n400 mb-1">Topic</div>
                  <div className="font-medium flex items-center text-primaryColor">
                    <PiBookOpen className="size-4 mr-2" />
                    {quiz.topic_title}
                  </div>
                </div>
                
                <div className="p-4 rounded-lg border border-primaryColor/20 bg-white">
                  <div className="text-sm text-n300 dark:text-n400 mb-1">Questions</div>
                  <div className="font-medium flex items-center text-primaryColor">
                    <PiListChecks className="size-4 mr-2" />
                    {quiz.question_count} questions
                  </div>
                </div>
                
                <div className="p-4 rounded-lg border border-primaryColor/20 bg-white">
                  <div className="text-sm text-n300 dark:text-n400 mb-1">Attempts</div>
                  <div className="font-medium flex items-center text-primaryColor">
                    <PiTrophy className="size-4 mr-2" />
                    {quiz.attempt_count} attempts
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-lg border border-primaryColor/20 mb-8">
                <h3 className="flex items-center gap-2 font-semibold text-primaryColor mb-4">
                  <PiInfo className="size-5" />
                  <span>Quiz Instructions</span>
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="size-5 rounded-full bg-primaryColor/10 flex-shrink-0 flex items-center justify-center mt-0.5 text-primaryColor text-xs font-bold">1</div>
                    <span>This quiz contains {quiz.question_count} multiple-choice questions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="size-5 rounded-full bg-primaryColor/10 flex-shrink-0 flex items-center justify-center mt-0.5 text-primaryColor text-xs font-bold">2</div>
                    <span>Select the best answer for each question.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="size-5 rounded-full bg-primaryColor/10 flex-shrink-0 flex items-center justify-center mt-0.5 text-primaryColor text-xs font-bold">3</div>
                    <span>You can navigate between questions using the previous and next buttons.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="size-5 rounded-full bg-primaryColor/10 flex-shrink-0 flex items-center justify-center mt-0.5 text-primaryColor text-xs font-bold">4</div>
                    <span>You can review and change your answers before final submission.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="size-5 rounded-full bg-primaryColor/10 flex-shrink-0 flex items-center justify-center mt-0.5 text-primaryColor text-xs font-bold">5</div>
                    <span>Once you submit, you'll see your score and correct answers.</span>
                  </li>
                </ul>
              </div>
              
              <div className="text-center">
                <button 
                  className="py-3 px-8 bg-primaryColor text-white rounded-lg font-medium hover:bg-primaryColor/90 transition-colors inline-flex items-center gap-2"
                  onClick={handleStartQuiz}
                >
                  <PiTimer className="size-5" />
                  <span>Start Quiz</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Taking the quiz
  const currentQuestion = getCurrentQuestion();
  
  if (!currentQuestion) {
    return (
      <div className="px-4 sm:px-6 md:px-8 pb-10 max-w-[1200px] mx-auto">
        <div className="mb-8">
          <button 
            onClick={() => router.push('/quizzes')}
            className="py-2.5 px-4 border border-primaryColor/20 rounded-lg flex items-center gap-2 hover:bg-primaryColor/5 transition-colors"
          >
            <PiArrowLeft className="size-4" />
            <span>Back to Quizzes</span>
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-primaryColor/20">
          <div className="flex items-center gap-3 mb-6 text-errorColor">
            <PiWarningCircle className="size-8" />
            <h2 className="text-xl font-semibold">Error Loading Questions</h2>
          </div>
          
          <p className="text-n300 dark:text-n400 mb-4">
            No questions were found for this quiz. Please try another quiz or contact support.
          </p>
          
          <button 
            onClick={() => router.push('/quizzes')}
            className="py-2.5 px-6 bg-primaryColor text-white rounded-lg hover:bg-primaryColor/90 transition-colors flex items-center gap-2"
          >
            <PiArrowLeft className="size-4" />
            <span>Return to Quizzes</span>
          </button>
        </div>
      </div>
    );
  }
  
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const hasAnsweredCurrent = !!selectedAnswers[currentQuestion.id];
  
  return (
    <div className="px-4 sm:px-6 md:px-8 pb-10 max-w-[1200px] mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={() => {
            if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
              router.push('/quizzes');
            }
          }}
          className="py-2.5 px-4 border border-primaryColor/20 rounded-lg flex items-center gap-2 hover:bg-primaryColor/5 transition-colors"
        >
          <PiArrowLeft className="size-4" />
          <span>Exit Quiz</span>
        </button>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${getDifficultyColor(quiz.difficulty)}`}>
            {getDifficultyIcon(quiz.difficulty)}
            <span className="font-medium text-sm">{quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}</span>
          </div>
          <div className="flex items-center bg-primaryColor/10 px-3 py-1.5 rounded-lg text-primaryColor">
            <PiClock className="size-4 mr-1.5" />
            <span className="font-medium text-sm">{formatTime(timeSpent)}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-primaryColor/20 overflow-hidden">
        <div className="py-5 px-6 border-b border-primaryColor/10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{quiz.title}</h2>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
              <span>{Math.round(progress)}% completed</span>
            </div>
            <div className="w-full h-2 bg-primaryColor/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primaryColor transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-8">
            <div className="text-lg font-medium p-4 bg-primaryColor/5 rounded-lg mb-6 border border-primaryColor/10">
              {currentQuestion.question}
            </div>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div 
                  key={index} 
                  onClick={() => handleSelectAnswer(currentQuestion.id, option)}
                  className={`p-4 border rounded-lg flex items-center gap-3 cursor-pointer transition-all ${
                    selectedAnswers[currentQuestion.id] === option
                      ? 'border-primaryColor bg-primaryColor/5 text-primaryColor shadow-sm'
                      : 'border-primaryColor/20 hover:border-primaryColor/40 hover:bg-primaryColor/5'
                  }`}
                >
                  <div className={`size-5 rounded-full flex items-center justify-center ${
                    selectedAnswers[currentQuestion.id] === option
                      ? 'bg-primaryColor text-white'
                      : 'border border-n300 dark:border-n500'
                  }`}>
                    {selectedAnswers[currentQuestion.id] === option && <div className="size-2 bg-white rounded-full"></div>}
                  </div>
                  <span>{option}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between">
            <button 
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className={`py-2.5 px-6 border rounded-lg flex items-center gap-2 ${
                currentQuestionIndex === 0 
                  ? 'opacity-50 cursor-not-allowed border-n300/30 text-n300' 
                  : 'border-primaryColor/20 text-primaryColor hover:bg-primaryColor/5 transition-colors'
              }`}
            >
              <PiArrowLeft className="size-4" />
              <span>Previous</span>
            </button>
            
            {isLastQuestion ? (
              <button 
                onClick={handleSubmitQuiz}
                disabled={submitting || Object.keys(selectedAnswers).length === 0}
                className={`py-2.5 px-6 bg-primaryColor text-white rounded-lg flex items-center gap-2 ${
                  submitting || Object.keys(selectedAnswers).length === 0 
                    ? 'opacity-70 cursor-not-allowed' 
                    : 'hover:bg-primaryColor/90 transition-colors'
                }`}
              >
                {submitting ? (
                  <>
                    <PiSpinner className="size-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Quiz</span>
                  </>
                )}
              </button>
            ) : (
              <button 
                onClick={handleNextQuestion}
                disabled={!hasAnsweredCurrent}
                className={`py-2.5 px-6 bg-primaryColor text-white rounded-lg flex items-center gap-2 ${
                  !hasAnsweredCurrent 
                    ? 'opacity-70 cursor-not-allowed' 
                    : 'hover:bg-primaryColor/90 transition-colors'
                }`}
              >
                <span>Next</span>
                <PiArrowRight className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 