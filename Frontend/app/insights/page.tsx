"use client";

import React, { useState, useEffect } from "react";
import { PiChartLine, PiChartBar, PiChartPie, PiCalendar, PiTrophy, PiBookOpen, PiFileText, PiClock } from "react-icons/pi";
import { getStatistics, StatisticsResponse } from "../notes-materials/statistics.service";
import { format } from "date-fns";

const Insights = () => {
  const [timeframe, setTimeframe] = useState("weekly");
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const data = await getStatistics();
        setStatistics(data);
        console.log('[LOG insights] ========= Statistics data:', data);
      } catch (err) {
        console.error('[LOG insights] ========= Error fetching statistics:', err);
        setError('Failed to load statistics data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatistics();
  }, []);
  
  if (loading) {
    return (
      <div className="w-full max-w-[1070px] mx-auto flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full max-w-[1070px] mx-auto">
        <div className="bg-errorColor/10 text-errorColor p-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }
  
  // Calculate the total study hours based on timeframe
  const calculateStudyHours = () => {
    if (!statistics?.study_hours || statistics.study_hours.length === 0) {
      return 0;
    }
    
    return statistics.summary.total_study_hours;
  };
  
  // Generate weekly study hours data (last 7 days)
  const generateStudyHoursData = () => {
    if (!statistics?.study_hours || statistics.study_hours.length === 0) {
      return [0, 0, 0, 0, 0, 0, 0]; // Default empty data
    }
    
    // Get the last 7 days of data
    const last7Days = Array(7).fill(0);
    const today = new Date();
    
    // Create array of last 7 days (Monday to Sunday)
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayOfWeek = date.getDay();
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday (0) to index 6, Monday (1) to index 0
      
      // Find study session for this date
      const session = statistics.study_hours.find(s => {
        const sessionDate = new Date(s.date);
        return sessionDate.toDateString() === date.toDateString();
      });
      
      if (session) {
        last7Days[dayIndex] = session.hours;
      }
    }
    
    // Convert to percentage heights for display
    const maxHours = Math.max(...last7Days, 1); // Avoid division by zero
    return last7Days.map(hours => Math.round((hours / maxHours) * 100));
  };
  
  // Format topics for pie chart
  const formatTopicsData = () => {
    if (!statistics?.topics_progress || statistics.topics_progress.length === 0) {
      return [
        { title: "No Data", percentage: 100, color: "bg-n300/20" }
      ];
    }
    
    // Use actual topic data
    const colors = ["bg-primaryColor", "bg-secondaryColor", "bg-errorColor", "bg-warningColor"];
    
    return statistics.topics_progress.map((topic, index) => ({
      title: topic.topicTitle,
      percentage: topic.progress,
      color: colors[index % colors.length]
    }));
  };
  
  const topicsData = formatTopicsData();
  const studyHoursData = generateStudyHoursData();
  const totalStudyHours = calculateStudyHours();
  const productivityScore = statistics?.study_hours?.[0]?.productivityScore || 0;
  const productivityChange = statistics?.study_hours?.[0]?.productivityChange || 0;

  return (
    <div className="w-full max-w-[1070px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Learning Insights</h1>
        <p className="text-n300 dark:text-n400">
          Track your learning progress and performance across all topics
        </p>
      </div>

      {/* Timeframe Selector */}
      <div className="mb-6">
        <div className="flex gap-2">
          {["weekly", "monthly", "yearly"].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeframe === period
                  ? "bg-primaryColor text-white"
                  : "bg-n300/10 text-n300 hover:bg-n300/20"
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-primaryColor/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-n300 dark:text-n400">Total Study Hours</p>
              <p className="text-2xl font-bold">{totalStudyHours}h</p>
            </div>
            <PiClock className="text-primaryColor size-8" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-primaryColor/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-n300 dark:text-n400">Topics Studied</p>
              <p className="text-2xl font-bold">{statistics?.summary.total_topics_studied || 0}</p>
            </div>
            <PiBookOpen className="text-secondaryColor size-8" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-primaryColor/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-n300 dark:text-n400">Quizzes Completed</p>
              <p className="text-2xl font-bold">{statistics?.summary.total_quizzes_attempted || 0}</p>
            </div>
            <PiTrophy className="text-warningColor size-8" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-primaryColor/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-n300 dark:text-n400">Notes Read</p>
              <p className="text-2xl font-bold">{statistics?.summary.total_notes_read || 0}</p>
            </div>
            <PiFileText className="text-errorColor size-8" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Study Hours Chart */}
        <div className="bg-white p-4 rounded-xl border border-primaryColor/20">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <PiChartBar className="text-primaryColor" />
            Last 7 Days Study Hours
          </h3>
          <div className="flex items-end justify-between h-32 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
              <div key={day} className="flex flex-col items-center flex-1">
                <div className="w-full bg-primaryColor/10 rounded-t flex items-end justify-center relative h-24">
                  <div
                    className="w-full bg-primaryColor rounded-t transition-all duration-300"
                    style={{ height: `${studyHoursData[index]}%` }}
                  ></div>
                </div>
                <span className="text-xs text-n300 dark:text-n400 mt-1">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Progress Pie Chart */}
        <div className="bg-white p-4 rounded-xl border border-primaryColor/20">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <PiChartPie className="text-primaryColor" />
            Topic Progress Distribution
          </h3>
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              {topicsData.length > 0 && topicsData[0].title !== "No Data" ? (
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 42 42">
                  {/* Background circle */}
                  <circle
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="transparent"
                    stroke="#f3f4f6"
                    strokeWidth="3"
                  />
                  {/* Progress segments */}
                  {topicsData.map((topic, index) => {
                    const previousPercentage = topicsData.slice(0, index).reduce((sum, t) => sum + t.percentage, 0);
                    const circumference = 2 * Math.PI * 15.915;
                    const strokeDasharray = `${(topic.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((previousPercentage / 100) * circumference);
                    
                    const colors = {
                      'bg-primaryColor': '#3B82F6',
                      'bg-secondaryColor': '#10B981', 
                      'bg-errorColor': '#EF4444',
                      'bg-warningColor': '#F59E0B'
                    };
                    
                    const color = colors[topic.color as keyof typeof colors] || '#6B7280';
                    
                    return (
                      <circle
                        key={index}
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke={color}
                        strokeWidth="3"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-500">No Data</span>
                </div>
              )}
            </div>
            <div className="ml-4 space-y-2">
              {topicsData.slice(0, 4).map((topic, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: topic.color === 'bg-primaryColor' ? '#3B82F6' :
                                     topic.color === 'bg-secondaryColor' ? '#10B981' :
                                     topic.color === 'bg-errorColor' ? '#EF4444' :
                                     topic.color === 'bg-warningColor' ? '#F59E0B' : '#6B7280'
                    }}
                  ></div>
                  <span className="text-sm">{topic.title}</span>
                  <span className="text-sm text-n300 dark:text-n400">{topic.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz Performance */}
        <div className="bg-white p-4 rounded-xl border border-primaryColor/20">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <PiTrophy className="text-primaryColor" />
            Quiz Performance
          </h3>
          <div className="space-y-4">
            {statistics?.quiz_progress && statistics.quiz_progress.length > 0 ? (
              statistics.quiz_progress.map((quiz, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{quiz.quizTitle}</div>
                    <div className="text-xs text-n300 dark:text-n400 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <PiCalendar />
                        {quiz.updatedAt ? format(new Date(quiz.updatedAt), 'MMM dd, yyyy') : 'N/A'}
                      </span>
                      <span>Attempts: {quiz.attemptsCount}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-primaryColor">{quiz.bestScore}%</div>
                    <div className="text-xs text-n300 dark:text-n400">Best Score</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-n300 py-8">
                No quiz data available
              </div>
            )}
          </div>
        </div>
        
        {/* Note Progress */}
        <div className="bg-white p-4 rounded-xl border border-primaryColor/20">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <PiFileText className="text-primaryColor" />
            Note Reading Progress
          </h3>
          <div className="space-y-4">
            {statistics?.note_progress && statistics.note_progress.length > 0 ? (
              statistics.note_progress.map((note, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{note.noteTitle}</div>
                    <div className="text-xs text-n300 dark:text-n400 flex items-center gap-1">
                      <PiCalendar />
                      <span>{note.updatedAt ? format(new Date(note.updatedAt), 'MMM dd, yyyy') : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="w-28 flex items-center">
                    <div className="w-full bg-n300/20 rounded-full h-2 mr-2">
                      <div 
                        className="bg-primaryColor h-2 rounded-full" 
                        style={{ width: `${note.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{note.progress}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-n300 py-8">
                No note progress data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Study Sessions */}
      <div className="mt-6">
        <div className="bg-white p-4 rounded-xl border border-primaryColor/20">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <PiClock className="text-primaryColor" />
            All Study Sessions
          </h3>
          <div className="space-y-3">
            {statistics?.study_hours && statistics.study_hours.length > 0 ? (
              statistics.study_hours.map((session, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-n300/5 rounded-lg">
                  <div>
                    <div className="font-medium">{format(new Date(session.date), 'EEEE, MMM dd, yyyy')}</div>
                    <div className="text-sm text-n300 dark:text-n400">
                      Productivity Score: {session.productivityScore}%
                      {session.productivityChange !== 0 && (
                        <span className={`ml-2 ${session.productivityChange > 0 ? 'text-successColor' : 'text-errorColor'}`}>
                          ({session.productivityChange > 0 ? '+' : ''}{session.productivityChange}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-primaryColor">{session.hours}h</div>
                    <div className="text-xs text-n300 dark:text-n400">Study Time</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-n300 py-8">
                No study sessions recorded yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-6">
        <div className="bg-white p-4 rounded-xl border border-primaryColor/20">
          <h3 className="font-medium mb-4">Performance Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primaryColor">{statistics?.summary.avg_topic_progress}%</div>
              <div className="text-sm text-n300 dark:text-n400">Avg Topic Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondaryColor">{statistics?.summary.avg_quiz_progress}%</div>
              <div className="text-sm text-n300 dark:text-n400">Avg Quiz Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warningColor">{statistics?.summary.avg_quiz_score}%</div>
              <div className="text-sm text-n300 dark:text-n400">Avg Quiz Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-errorColor">{statistics?.summary.total_materials}</div>
              <div className="text-sm text-n300 dark:text-n400">Total Materials</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights; 