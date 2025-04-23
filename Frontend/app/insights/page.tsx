"use client";

import React, { useState } from "react";
import { PiChartLine, PiChartBar, PiChartPie, PiCalendar } from "react-icons/pi";

const Insights = () => {
  const [timeframe, setTimeframe] = useState("weekly");
  
  // In a real implementation, we'd use a charting library like Chart.js, Recharts, etc.
  // This is just a visual placeholder to simulate charts
  
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
          <p className="text-3xl font-bold mb-1">18.5</p>
          <p className="text-sm text-n300 dark:text-n400">Hours this week</p>
          <div className="mt-4 h-20 flex items-end gap-1">
            {[40, 65, 45, 80, 60, 30, 50].map((height, idx) => (
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
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primaryColor"></div>
              <span className="text-sm">Math</span>
            </div>
            <div className="text-right">40%</div>
            
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondaryColor"></div>
              <span className="text-sm">Science</span>
            </div>
            <div className="text-right">25%</div>
            
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-errorColor"></div>
              <span className="text-sm">History</span>
            </div>
            <div className="text-right">20%</div>
            
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warningColor"></div>
              <span className="text-sm">English</span>
            </div>
            <div className="text-right">15%</div>
          </div>
          <div className="h-[100px] w-[100px] mx-auto my-4 rounded-full border-8 border-primaryColor relative overflow-hidden">
            <div className="absolute inset-0 bg-secondaryColor origin-bottom-left rotate-[90deg]"></div>
            <div className="absolute inset-0 bg-errorColor origin-bottom-left rotate-[135deg]"></div>
            <div className="absolute inset-0 bg-warningColor origin-bottom-left rotate-[162deg]"></div>
            <div className="absolute inset-0 bg-white dark:bg-n0 rounded-full m-3"></div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-n0 p-4 rounded-xl border border-primaryColor/20">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Productivity Score</h3>
            <PiChartLine className="text-primaryColor" />
          </div>
          <p className="text-3xl font-bold mb-1">82<span className="text-lg">/100</span></p>
          <p className="text-sm text-successColor">+5% from last week</p>
          <div className="w-full bg-n300/20 rounded-full h-3 mt-4">
            <div 
              className="bg-primaryColor h-3 rounded-full" 
              style={{ width: '82%' }}
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
            {[
              { topic: "Math Calculus", score: 92, date: "May 15, 2023" },
              { topic: "Cell Biology", score: 78, date: "May 12, 2023" },
              { topic: "World History", score: 85, date: "May 10, 2023" },
              { topic: "Literature Review", score: 90, date: "May 8, 2023" }
            ].map((quiz, idx) => (
              <div key={idx} className="flex items-center">
                <div className="flex-1">
                  <div className="font-medium">{quiz.topic}</div>
                  <div className="text-xs text-n300 dark:text-n400 flex items-center gap-1">
                    <PiCalendar />
                    <span>{quiz.date}</span>
                  </div>
                </div>
                <div className="w-28 flex items-center">
                  <div className="w-full bg-n300/20 rounded-full h-2 mr-2">
                    <div 
                      className="bg-primaryColor h-2 rounded-full" 
                      style={{ width: `${quiz.score}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{quiz.score}%</span>
                </div>
              </div>
            ))}
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