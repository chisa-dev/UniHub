"use client";

import React from "react";
import { PiMagnifyingGlass } from "react-icons/pi";

const Home = () => {
  return (
    <div className="w-full max-w-[1070px] mx-auto">
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for study materials, notes, or topics..."
            className="w-full py-3 px-5 pl-12 text-sm rounded-xl border border-primaryColor/30 bg-white dark:bg-n0 focus:outline-none focus:ring-2 focus:ring-primaryColor"
          />
          <PiMagnifyingGlass className="absolute left-4 top-3.5 text-lg text-primaryColor" />
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Recently Accessed</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-white dark:bg-n0 p-4 rounded-xl border border-primaryColor/20 hover:border-primaryColor/50 transition duration-300"
          >
            <h3 className="font-medium mb-2">Study Set {item}</h3>
            <p className="text-sm text-n300 dark:text-n400 mb-3">
              Last accessed: {new Date().toLocaleDateString()}
            </p>
            <div className="flex justify-between">
              <span className="text-xs bg-primaryColor/10 text-primaryColor px-2 py-1 rounded-full">
                {item * 10} cards
              </span>
              <span className="text-xs">Progress: {item * 20}%</span>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">Suggested for You</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-white dark:bg-n0 p-4 rounded-xl border border-primaryColor/20 hover:border-primaryColor/50 transition duration-300"
          >
            <h3 className="font-medium mb-2">Recommended Topic {item}</h3>
            <p className="text-sm text-n300 dark:text-n400 mb-3">
              Based on your recent activity
            </p>
            <button className="text-sm text-primaryColor hover:underline">
              Start Learning
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-10 p-4 bg-primaryColor/5 rounded-xl border border-primaryColor/20">
        <h3 className="font-medium mb-2">Upcoming Deadlines</h3>
        <ul className="space-y-2">
          <li className="flex justify-between items-center text-sm">
            <span>Math Quiz</span>
            <span className="text-errorColor">Tomorrow</span>
          </li>
          <li className="flex justify-between items-center text-sm">
            <span>Physics Project</span>
            <span>In 3 days</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Home; 