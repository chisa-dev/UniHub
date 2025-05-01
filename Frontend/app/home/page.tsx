"use client";

import React, { useEffect, useState } from "react";
import { PiMagnifyingGlass } from "react-icons/pi";
import { topicsService, Topic } from "@/app/topics/topicsService";
import { format } from 'date-fns';

const Home = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading state
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch topics from the API only on client side
  useEffect(() => {
    if (!isClient) return;

    const fetchTopics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await topicsService.getTopics();
        setTopics(response.topics);
      } catch (err) {
        console.error("[LOG home] ========= Error fetching topics:", err);
        setError(err instanceof Error ? err.message : "Failed to load topics");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopics();
  }, [isClient]);

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

  // Prepare a placeholder for server-side rendering
  const recentlyAccessedItems = isClient 
    ? [1, 2, 3].map((item) => (
        <div
          key={item}
          className="bg-white dark:bg-n0 p-4 rounded-xl border border-primaryColor/20 hover:border-primaryColor/50 transition duration-300"
        >
          <h3 className="font-medium mb-2">Study Set {item}</h3>
          <p className="text-sm text-n300 dark:text-n400 mb-3">
            Last accessed: {isClient ? new Date().toLocaleDateString() : ''}
          </p>
          <div className="flex justify-between">
            <span className="text-xs bg-primaryColor/10 text-primaryColor px-2 py-1 rounded-full">
              {item * 10} cards
            </span>
            <span className="text-xs">Progress: {item * 20}%</span>
          </div>
        </div>
      ))
    : Array(3).fill(0).map((_, index) => (
        <div key={index} className="bg-white dark:bg-n0 p-4 rounded-xl border border-primaryColor/20 animate-pulse">
          <div className="h-5 bg-gray-200 rounded mb-2 w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded mb-3 w-full"></div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      ));

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
        {recentlyAccessedItems}
      </div>

      <h2 className="text-xl font-semibold mb-4">Suggested for You</h2>
      {!isClient || isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, index) => (
            <div key={index} className="bg-white dark:bg-n0 p-4 rounded-xl border border-primaryColor/20 animate-pulse">
              <div className="h-5 bg-gray-200 rounded mb-2 w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded mb-3 w-full"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded mt-3 w-1/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-errorColor py-8">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.length > 0 ? (
            topics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white dark:bg-n0 p-4 rounded-xl border border-primaryColor/20 hover:border-primaryColor/50 transition duration-300"
              >
                <h3 className="font-medium mb-2">{topic.title}</h3>
                <p className="text-sm text-n300 dark:text-n400 mb-3 line-clamp-2">
                  {topic.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-n400">
                    By {topic.creator_name}
                  </span>
                  <span className="text-xs text-n400">
                    {formatDate(topic.created_at)}
                  </span>
                </div>
                <button className="mt-3 text-sm text-primaryColor hover:underline">
                  Start Learning
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-4">No topics available</div>
          )}
        </div>
      )}
      
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