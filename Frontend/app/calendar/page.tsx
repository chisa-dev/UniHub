"use client";

import React, { useState } from "react";
import { PiCalendar, PiPlus, PiCaretLeft, PiCaretRight } from "react-icons/pi";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Mock events data
  const events = [
    {
      id: 1,
      title: "Study Session: Biology",
      date: new Date(currentYear, currentMonth, 10),
      time: "2:00 PM - 4:00 PM",
      category: "study",
      color: "bg-primaryColor"
    },
    {
      id: 2,
      title: "Math Quiz",
      date: new Date(currentYear, currentMonth, 15),
      time: "9:00 AM - 10:30 AM",
      category: "quiz",
      color: "bg-errorColor"
    },
    {
      id: 3,
      title: "Group Project Meeting",
      date: new Date(currentYear, currentMonth, 22),
      time: "3:00 PM - 5:00 PM",
      category: "meeting",
      color: "bg-secondaryColor"
    }
  ];

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for first day of month (0 = Sunday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  
  // Create calendar grid
  const days = [];
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];
  
  // Previous month days
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`prev-${i}`} className="p-2 text-n300/50 text-sm"></div>);
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = events.filter(event => 
      event.date.getDate() === day && 
      event.date.getMonth() === currentMonth && 
      event.date.getFullYear() === currentYear
    );
    
    days.push(
      <div 
        key={`day-${day}`} 
        className={`p-2 border border-primaryColor/10 min-h-[100px] ${
          new Date().getDate() === day && 
          new Date().getMonth() === currentMonth && 
          new Date().getFullYear() === currentYear 
            ? 'bg-primaryColor/5 border-primaryColor' 
            : ''
        }`}
      >
        <div className="flex justify-between items-center">
          <span className="font-medium">{day}</span>
          {dayEvents.length > 0 && (
            <span className="text-xs bg-primaryColor/10 text-primaryColor px-1.5 py-0.5 rounded-full">
              {dayEvents.length}
            </span>
          )}
        </div>
        <div className="mt-1">
          {dayEvents.map(event => (
            <div 
              key={event.id}
              className={`text-xs p-1 mb-1 rounded truncate text-white ${event.color}`}
            >
              {event.title}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Handle month navigation
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="w-full max-w-[1070px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <PiCalendar className="text-primaryColor" />
          Calendar
        </h1>
        <button className="bg-primaryColor text-white py-2 px-4 rounded-xl flex items-center gap-1">
          <PiPlus />
          <span>New Event</span>
        </button>
      </div>
      
      <div className="bg-white dark:bg-n0 rounded-xl border border-primaryColor/20 p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4 items-center">
            <button onClick={goToPreviousMonth} className="p-2 hover:bg-primaryColor/10 rounded-full">
              <PiCaretLeft />
            </button>
            <h2 className="text-xl font-medium">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <button onClick={goToNextMonth} className="p-2 hover:bg-primaryColor/10 rounded-full">
              <PiCaretRight />
            </button>
          </div>
          
          <div className="flex gap-2">
            <button className="text-sm px-3 py-1 rounded-xl bg-primaryColor text-white">Month</button>
            <button className="text-sm px-3 py-1 rounded-xl text-n300 hover:bg-primaryColor/10">Week</button>
            <button className="text-sm px-3 py-1 rounded-xl text-n300 hover:bg-primaryColor/10">Day</button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="p-2 font-medium text-center">{day}</div>
          ))}
          {days}
        </div>
      </div>
      
      <div className="bg-white dark:bg-n0 rounded-xl border border-primaryColor/20 p-4">
        <h3 className="font-medium mb-3">Upcoming Events</h3>
        <div className="space-y-2">
          {events.map(event => (
            <div key={event.id} className="flex items-center gap-3 p-2 border-b border-primaryColor/10">
              <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
              <div>
                <div className="font-medium">{event.title}</div>
                <div className="text-xs text-n300 dark:text-n400">
                  {event.date.toLocaleDateString()} · {event.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar; 