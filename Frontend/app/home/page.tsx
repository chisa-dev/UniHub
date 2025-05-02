"use client";

import React, { useEffect, useState } from "react";
import { 
  PiMagnifyingGlass, 
  PiGraduationCap, 
  PiBookOpen, 
  PiExam, 
  PiArrowRight, 
  PiTrophy, 
  PiCalendarCheck, 
  PiClock,
  PiSpinnerGap
} from "react-icons/pi";
import { topicsService, Topic } from "@/app/topics/topicsService";
import { quizzesService } from "@/app/quizzes/quizzes.service";
import { Quiz } from "@/app/quizzes/types";
import { getStatistics, StatisticsResponse } from "@/app/notes-materials/statistics.service";
import useCalendarEvents, { CalendarEvent } from "@/hooks/useCalendarEvents";
import { format, parseISO, isBefore, isToday, addDays, differenceInDays } from 'date-fns';
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [quizzesLoading, setQuizzesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Statistics state
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Calendar events
  const { events: calendarEvents, isLoading: eventsLoading } = useCalendarEvents();
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch topics from the API only on client side
  useEffect(() => {
    if (!isClient) return;

    const fetchTopics = async () => {
      try {
        setTopicsLoading(true);
        setError(null);
        const response = await topicsService.getTopics();
        setTopics(response.topics);
      } catch (err) {
        console.error("[LOG home] ========= Error fetching topics:", err);
        setError(err instanceof Error ? err.message : "Failed to load topics");
      } finally {
        setTopicsLoading(false);
      }
    };
    
    fetchTopics();
  }, [isClient]);
  
  // Fetch recent quizzes
  useEffect(() => {
    if (!isClient) return;
    
    const fetchRecentQuizzes = async () => {
      try {
        setQuizzesLoading(true);
        const response = await quizzesService.getQuizzes(1, 3);
        setRecentQuizzes(response.quizzes);
      } catch (err) {
        console.error("[LOG home] ========= Error fetching quizzes:", err);
      } finally {
        setQuizzesLoading(false);
      }
    };
    
    fetchRecentQuizzes();
  }, [isClient]);
  
  // Fetch statistics
  useEffect(() => {
    if (!isClient) return;
    
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const data = await getStatistics();
        setStatistics(data);
      } catch (err) {
        console.error("[LOG home] ========= Error fetching statistics:", err);
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchStats();
  }, [isClient]);
  
  // Process calendar events to get upcoming deadlines
  useEffect(() => {
    if (!isClient || eventsLoading) return;
    
    // Get events that are upcoming (happening today or in the future)
    const now = new Date();
    const upcoming = calendarEvents
      .filter(event => {
        const eventDate = parseISO(event.start_time);
        return isToday(eventDate) || isBefore(now, eventDate);
      })
      .sort((a, b) => {
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      })
      .slice(0, 3); // Get top 3 upcoming events
    
    setUpcomingEvents(upcoming);
  }, [isClient, calendarEvents, eventsLoading]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!isClient) return '';
    
    try {
      // Try to use date-fns if available
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      // Fallback to basic date formatting
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch {
        return 'Invalid date';
      }
    }
  };
  
  // Format event time from calendar events
  const formatEventTime = (dateString: string) => {
    try {
      const eventDate = parseISO(dateString);
      
      if (isToday(eventDate)) {
        return `Today, ${format(eventDate, 'h:mm a')}`;
      }
      
      const daysUntil = differenceInDays(eventDate, new Date());
      if (daysUntil === 1) {
        return `Tomorrow, ${format(eventDate, 'h:mm a')}`;
      }
      
      if (daysUntil < 7) {
        return `In ${daysUntil} days`;
      }
      
      return format(eventDate, 'MMM d, h:mm a');
    } catch (e) {
      console.error("[LOG home] ========= Error formatting event time:", e);
      return dateString;
    }
  };
  
  // Get the urgency level of an event
  const getEventUrgency = (dateString: string) => {
    try {
      const eventDate = parseISO(dateString);
      const now = new Date();
      
      if (isToday(eventDate)) {
        return "Urgent";
      }
      
      if (isBefore(eventDate, addDays(now, 3))) {
        return "Important";
      }
      
      return "Planned";
    } catch (e) {
      return "Planned";
    }
  };
  
  // Get urgency color class
  const getUrgencyColorClass = (urgency: string) => {
    switch (urgency) {
      case "Urgent": return "bg-errorColor/10 text-errorColor";
      case "Important": return "bg-warningColor/10 text-warningColor";
      default: return "bg-primaryColor/10 text-primaryColor";
    }
  };
  
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <span className="text-xs bg-successColor/20 text-successColor px-2 py-0.5 rounded-full">Easy</span>;
      case 'medium': return <span className="text-xs bg-warningColor/20 text-warningColor px-2 py-0.5 rounded-full">Medium</span>;
      case 'hard': return <span className="text-xs bg-errorColor/20 text-errorColor px-2 py-0.5 rounded-full">Hard</span>;
      default: return <span className="text-xs bg-primaryColor/20 text-primaryColor px-2 py-0.5 rounded-full">{difficulty}</span>;
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to a search results page or filter in-place
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 pb-10 max-w-[1200px] mx-auto">
      <div className="max-w-2xl mx-auto mb-10">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search for study materials, notes, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 px-5 pl-12 text-sm rounded-xl border border-primaryColor/30 bg-white focus:outline-none focus:ring-2 focus:ring-primaryColor"
          />
          <PiMagnifyingGlass className="absolute left-4 top-3.5 text-lg text-primaryColor" />
          <button type="submit" className="absolute right-3 top-2.5 bg-primaryColor/10 text-primaryColor px-3 py-1 rounded-lg text-sm hover:bg-primaryColor/20 transition-colors">
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <PiExam className="text-primaryColor size-5" />
                <span>Recent Quizzes</span>
              </h2>
              <button 
                onClick={() => router.push('/quizzes')}
                className="text-primaryColor text-sm flex items-center gap-1 hover:underline"
              >
                <span>View All</span>
                <PiArrowRight className="size-4" />
              </button>
            </div>
            
            {!isClient || quizzesLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, index) => (
                  <div key={index} className="bg-white p-5 rounded-xl border border-primaryColor/20 animate-pulse">
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
                    </div>
                  </div>
                ))}
              </div>
            ) : recentQuizzes.length > 0 ? (
              <div className="space-y-4">
                {recentQuizzes.map((quiz) => (
                  <div 
                    key={quiz.id} 
                    className="bg-white p-5 rounded-xl border border-primaryColor/20 hover:border-primaryColor/40 hover:bg-primaryColor/5 cursor-pointer transition-all duration-200 group"
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
                        <PiClock className="mr-1.5 text-primaryColor size-4" />
                        <span>~{Math.ceil(quiz.question_count * 0.5)} min</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/quizzes/${quiz.id}`);
                        }}
                        className="text-primaryColor font-medium hover:underline flex items-center ml-auto"
                      >
                        <span>Take Quiz</span>
                        <PiArrowRight className="ml-1 size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-white rounded-xl border border-dashed border-primaryColor/20">
                <PiExam className="mx-auto size-12 text-primaryColor/50 mb-3" />
                <h3 className="font-medium mb-2">No quizzes available</h3>
                <p className="text-sm text-n300 dark:text-n400 mb-4">Create your first quiz to test your knowledge</p>
                <button 
                  onClick={() => router.push('/quizzes')}
                  className="px-4 py-2 bg-primaryColor text-white rounded-lg hover:bg-primaryColor/90 transition-colors"
                >
                  Create Quiz
                </button>
              </div>
            )}
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <PiGraduationCap className="text-primaryColor size-5" />
                <span>Recent Topics</span>
              </h2>
              <button 
                onClick={() => router.push('/topics')}
                className="text-primaryColor text-sm flex items-center gap-1 hover:underline"
              >
                <span>View All</span>
                <PiArrowRight className="size-4" />
              </button>
            </div>
            
            {!isClient || topicsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array(4).fill(0).map((_, index) => (
                  <div key={index} className="bg-white p-5 rounded-xl border border-primaryColor/20 animate-pulse">
                    <div className="h-5 bg-primaryColor/10 rounded mb-2 w-2/3"></div>
                    <div className="h-12 bg-primaryColor/10 rounded mb-3 w-full"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-primaryColor/10 rounded w-1/4"></div>
                      <div className="h-4 bg-primaryColor/10 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center p-8 bg-white rounded-xl border border-primaryColor/20 text-errorColor">
                {error}
              </div>
            ) : topics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topics.slice(0, 4).map((topic) => (
                  <div
                    key={topic.id}
                    className="bg-white p-5 rounded-xl border border-primaryColor/20 hover:border-primaryColor/40 hover:bg-primaryColor/5 cursor-pointer transition-all duration-200 group"
                    onClick={() => router.push(`/topics/${topic.id}`)}
                  >
                    <h3 className="font-semibold mb-2 group-hover:text-primaryColor transition-colors">{topic.title}</h3>
                    <p className="text-sm text-n300 dark:text-n400 mb-3 line-clamp-2">
                      {topic.description || "Explore this topic to learn more about it."}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-n400 flex items-center">
                        <PiBookOpen className="mr-1.5 size-3.5" />
                        {topic.creator_name || "Anonymous"}
                      </span>
                      <span className="text-xs text-n400">
                        {formatDate(topic.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-white rounded-xl border border-dashed border-primaryColor/20">
                <PiGraduationCap className="mx-auto size-12 text-primaryColor/50 mb-3" />
                <h3 className="font-medium mb-2">No topics available</h3>
                <p className="text-sm text-n300 dark:text-n400 mb-4">Create topics to organize your learning</p>
                <button 
                  onClick={() => router.push('/topics')}
                  className="px-4 py-2 bg-primaryColor text-white rounded-lg hover:bg-primaryColor/90 transition-colors"
                >
                  Create Topic
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-primaryColor/20">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PiTrophy className="text-primaryColor size-5" />
              <span>Study Progress</span>
            </h2>
            
            {!isClient || statsLoading ? (
              <div className="flex justify-center py-8">
                <PiSpinnerGap className="animate-spin text-primaryColor size-6" />
              </div>
            ) : statistics ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span>Quizzes Completed</span>
                    <span className="font-medium">{statistics.summary.total_quizzes_attempted}/
                      {statistics.quiz_progress?.length || statistics.summary.total_quizzes_attempted}</span>
                  </div>
                  <div className="w-full h-2 bg-primaryColor/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primaryColor" 
                      style={{ 
                        width: statistics.quiz_progress?.length 
                          ? `${(statistics.summary.total_quizzes_attempted / statistics.quiz_progress.length) * 100}%` 
                          : "0%" 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span>Topics Mastered</span>
                    <span className="font-medium">
                      {statistics.topics_progress?.filter(t => t.progress >= 75).length || 0}/
                      {statistics.topics_progress?.length || 0}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-primaryColor/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-successColor" 
                      style={{ 
                        width: statistics.topics_progress?.length 
                          ? `${(statistics.topics_progress.filter(t => t.progress >= 75).length / statistics.topics_progress.length) * 100}%` 
                          : "0%" 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span>Study Hours</span>
                    <span className="font-medium">{statistics.summary.total_study_hours}h</span>
                  </div>
                  <div className="w-full h-2 bg-primaryColor/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-warningColor" 
                      style={{ 
                        width: statistics.summary.total_study_hours > 0 
                          ? `${Math.min((statistics.summary.total_study_hours / 20) * 100, 100)}%` 
                          : "0%" 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span>Quizzes Completed</span>
                    <span className="font-medium">0/0</span>
                  </div>
                  <div className="w-full h-2 bg-primaryColor/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primaryColor" style={{ width: "0%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span>Topics Mastered</span>
                    <span className="font-medium">0/0</span>
                  </div>
                  <div className="w-full h-2 bg-primaryColor/10 rounded-full overflow-hidden">
                    <div className="h-full bg-successColor" style={{ width: "0%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span>Study Hours</span>
                    <span className="font-medium">0h</span>
                  </div>
                  <div className="w-full h-2 bg-primaryColor/10 rounded-full overflow-hidden">
                    <div className="h-full bg-warningColor" style={{ width: "0%" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => router.push('/insights')}
              className="w-full mt-4 py-2 text-center text-primaryColor border border-primaryColor/20 rounded-lg hover:bg-primaryColor/5 transition-colors text-sm"
            >
              View Detailed Analytics
            </button>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-primaryColor/20">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PiCalendarCheck className="text-primaryColor size-5" />
              <span>Upcoming Deadlines</span>
            </h2>
            
            {!isClient || eventsLoading ? (
              <div className="flex justify-center py-8">
                <PiSpinnerGap className="animate-spin text-primaryColor size-6" />
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const urgency = getEventUrgency(event.start_time);
                  return (
                    <div 
                      key={event.id}
                      className="p-3 border border-primaryColor/20 rounded-lg hover:border-primaryColor/40 transition-colors cursor-pointer"
                      onClick={() => router.push('/calendar')}
                    >
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-xs flex items-center text-n300 dark:text-n400">
                          <PiClock className="mr-1 size-3.5" />
                          {formatEventTime(event.start_time)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 ${getUrgencyColorClass(urgency)} rounded-full`}>
                          {urgency}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-n300 dark:text-n400 mb-3">No upcoming deadlines</p>
                <button 
                  onClick={() => router.push('/calendar')}
                  className="px-4 py-2 bg-primaryColor text-white rounded-lg text-sm"
                >
                  Create Event
                </button>
              </div>
            )}
            
            <button 
              onClick={() => router.push('/calendar')}
              className="w-full mt-4 py-2 text-center text-primaryColor border border-primaryColor/20 rounded-lg hover:bg-primaryColor/5 transition-colors text-sm"
            >
              View Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 