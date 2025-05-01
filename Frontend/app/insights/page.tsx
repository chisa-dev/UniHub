"use client";

import React, { useState, useEffect } from "react";
import { PiChartLine, PiChartBar, PiChartPie, PiCalendar } from "react-icons/pi";
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
    
    // For demonstration, we'll just use the total from the summary
    return statistics.summary.total_study_hours;
  };
  
  // Generate weekly study hours data
  const generateStudyHoursData = () => {
    if (!statistics?.study_hours || statistics.study_hours.length === 0) {
      return [0, 0, 0, 0, 0, 0, 0]; // Default empty data
    }
    
    // Map study hours to days of the week
    // In a real implementation, you would map actual data for each day
    const dailyHours = Array(7).fill(0);
    
    statistics.study_hours.forEach(session => {
      const day = new Date(session.date).getDay();
      dailyHours[day] = session.hours;
    });
    
    // Convert to percentage heights for display
    const maxHours = Math.max(...dailyHours, 1); // Avoid division by zero
    return dailyHours.map(hours => Math.round((hours / maxHours) * 100));
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <PiChartLine className="text-primaryColor" />
          Insights
        </h1>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setTimeframe("daily")}
            className={`px-3 py-1.5 text-sm rounded-xl ${
              timeframe === "daily" 
                ? "bg-primaryColor text-white" 
                : "hover:bg-primaryColor/10"
            }`}
          >
            Daily
          </button>
          <button 
            onClick={() => setTimeframe("weekly")}
            className={`px-3 py-1.5 text-sm rounded-xl ${
              timeframe === "weekly" 
                ? "bg-primaryColor text-white" 
                : "hover:bg-primaryColor/10"
            }`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setTimeframe("monthly")}
            className={`px-3 py-1.5 text-sm rounded-xl ${
              timeframe === "monthly" 
                ? "bg-primaryColor text-white" 
                : "hover:bg-primaryColor/10"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-n0 p-4 rounded-xl border border-primaryColor/20">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Study Hours</h3>
            <PiChartBar className="text-primaryColor" />
          </div>
          <p className="text-3xl font-bold mb-1">{totalStudyHours}</p>
          <p className="text-sm text-n300 dark:text-n400">
            Hours {timeframe === "daily" ? "today" : timeframe === "weekly" ? "this week" : "this month"}
          </p>
          <div className="mt-4 h-20 flex items-end gap-1">
            {studyHoursData.map((height, idx) => (
              <div 
                key={idx}
                className="flex-1 bg-primaryColor/20 rounded-t"
                style={{ height: `${height}%` }}
              ></div>
            ))}
          </div>
          <div className="mt-1 flex text-xs text-n300 justify-between">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-n0 p-4 rounded-xl border border-primaryColor/20">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Topics Studied</h3>
            <PiChartPie className="text-primaryColor" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {topicsData.map((topic, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${topic.color}`}></div>
                  <span className="text-sm">{topic.title}</span>
                </div>
                <div className="text-right">{topic.percentage}%</div>
              </React.Fragment>
            ))}
          </div>
          <div className="h-[100px] w-[100px] mx-auto my-4 rounded-full border-8 border-primaryColor relative overflow-hidden">
            {topicsData.length > 1 ? (
              topicsData.map((topic, idx) => {
                // Simple pie chart segments calculation
                const previousTopicsPercentage = topicsData
                  .slice(0, idx)
                  .reduce((acc, t) => acc + t.percentage, 0);
                const startAngle = (previousTopicsPercentage / 100) * 360;
                const angleWidth = (topic.percentage / 100) * 360;
                
                return (
                  <div 
                    key={idx}
                    className={`absolute inset-0 ${topic.color} origin-bottom-left`}
                    style={{ transform: `rotate(${startAngle}deg)` }}
                  ></div>
                );
              })
            ) : (
              <div className={`absolute inset-0 ${topicsData[0].color}`}></div>
            )}
            <div className="absolute inset-0 bg-white dark:bg-n0 rounded-full m-3"></div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-n0 p-4 rounded-xl border border-primaryColor/20">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Productivity Score</h3>
            <PiChartLine className="text-primaryColor" />
          </div>
          <p className="text-3xl font-bold mb-1">{productivityScore}<span className="text-lg">/100</span></p>
          <p className={`text-sm ${productivityChange >= 0 ? 'text-successColor' : 'text-errorColor'}`}>
            {productivityChange >= 0 ? '+' : ''}{productivityChange}% from last {timeframe === "daily" ? "day" : timeframe === "weekly" ? "week" : "month"}
          </p>
          <div className="w-full bg-n300/20 rounded-full h-3 mt-4">
            <div 
              className="bg-primaryColor h-3 rounded-full" 
              style={{ width: `${productivityScore}%` }}
            ></div>
          </div>
          <div className="mt-3 text-xs grid grid-cols-4 text-n300">
            <span>0</span>
            <span className="text-center">25</span>
            <span className="text-center">50</span>
            <span className="text-center">75</span>
            <span className="text-right">100</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-n0 p-4 rounded-xl border border-primaryColor/20">
          <h3 className="font-medium mb-4">Quiz Performance</h3>
          <div className="space-y-4">
            {statistics?.quiz_progress && statistics.quiz_progress.length > 0 ? (
              statistics.quiz_progress.map((quiz, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="flex-1">
                    <div className="font-medium">{quiz.quizTitle}</div>
                    <div className="text-xs text-n300 dark:text-n400 flex items-center gap-1">
                      <PiCalendar />
                      <span>{quiz.updatedAt ? format(new Date(quiz.updatedAt), 'MMM dd, yyyy') : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="w-28 flex items-center">
                    <div className="w-full bg-n300/20 rounded-full h-2 mr-2">
                      <div 
                        className="bg-primaryColor h-2 rounded-full" 
                        style={{ width: `${quiz.bestScore}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{quiz.bestScore}%</span>
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
        
        <div className="bg-white dark:bg-n0 p-4 rounded-xl border border-primaryColor/20">
          <h3 className="font-medium mb-4">Study Consistency</h3>
          <div className="grid grid-cols-7 gap-1">
            {[
              "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ].map(month => (
              <div key={month} className="text-xs text-center pb-1">{month}</div>
            ))}
            {Array.from({ length: 63 }).map((_, idx) => {
              // Generate random activity levels for the demonstration
              // In a real implementation, this would use actual study data
              const randomLevel = Math.floor(Math.random() * 4);
              let bgColor = "bg-n300/10";
              if (randomLevel === 1) bgColor = "bg-primaryColor/30";
              if (randomLevel === 2) bgColor = "bg-primaryColor/60";
              if (randomLevel === 3) bgColor = "bg-primaryColor";
              
              return (
                <div 
                  key={idx} 
                  className={`w-4 h-4 rounded-sm ${bgColor}`}
                  title="1.5 hours studied"
                ></div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-n300/10"></div>
              <span>None</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-primaryColor/30"></div>
              <span>&lt; 1hr</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-primaryColor/60"></div>
              <span>1-3hrs</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-primaryColor"></div>
              <span>&gt; 3hrs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights; 