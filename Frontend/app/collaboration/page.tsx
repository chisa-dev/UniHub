"use client";
import React, { useState } from "react";
import {
  PiPlus,
  PiLink,
  PiBookmark,
  PiExam,
  PiChatCircle,
  PiHeart,
  PiHeartFill,
  PiShare,
  PiClock,
  PiUser,
  PiMagnifyingGlass,
} from "react-icons/pi";

// Mock data for shared content
const mockSharedContent = [
  {
    id: "1",
    type: "topic",
    title: "Advanced React Patterns and Best Practices",
    description: "Comprehensive guide covering advanced React patterns including render props, compound components, and custom hooks.",
    url: "http://localhost:3001/topics/44b416d6-ba07-49ed-b784-2ddc8cc30e15",
    author: {
      name: "Sarah Johnson",
      avatar: "SJ",
    },
    timestamp: "2 hours ago",
    likes: 24,
    comments: 8,
    isLiked: false,
    tags: ["React", "JavaScript", "Frontend"],
  },
  {
    id: "2",
    type: "quiz",
    title: "JavaScript ES6+ Features Quiz",
    description: "Test your knowledge of modern JavaScript features including arrow functions, destructuring, and async/await.",
    url: "http://localhost:3001/quizzes/quiz-123",
    author: {
      name: "Mike Chen",
      avatar: "MC",
    },
    timestamp: "4 hours ago",
    likes: 18,
    comments: 12,
    isLiked: true,
    tags: ["JavaScript", "ES6", "Quiz"],
  },
  {
    id: "3",
    type: "topic",
    title: "Database Design Fundamentals",
    description: "Learn the principles of good database design, normalization, and relationship modeling.",
    url: "http://localhost:3001/topics/database-design-101",
    author: {
      name: "Alex Rivera",
      avatar: "AR",
    },
    timestamp: "1 day ago",
    likes: 31,
    comments: 15,
    isLiked: false,
    tags: ["Database", "SQL", "Design"],
  },
  {
    id: "4",
    type: "quiz",
    title: "CSS Grid and Flexbox Mastery",
    description: "Challenge yourself with advanced CSS layout techniques and responsive design patterns.",
    url: "http://localhost:3001/quizzes/css-layout-quiz",
    author: {
      name: "Emma Davis",
      avatar: "ED",
    },
    timestamp: "2 days ago",
    likes: 27,
    comments: 6,
    isLiked: true,
    tags: ["CSS", "Layout", "Responsive"],
  },
];

type ContentType = "all" | "topic" | "quiz";
type SortType = "recent" | "popular" | "comments";

export default function CollaborationPage() {
  const [sharedContent, setSharedContent] = useState(mockSharedContent);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<ContentType>("all");
  const [sortBy, setSortBy] = useState<SortType>("recent");
  const [shareUrl, setShareUrl] = useState("");
  const [shareTitle, setShareTitle] = useState("");
  const [shareDescription, setShareDescription] = useState("");

  // Filter and sort content
  const filteredContent = sharedContent
    .filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === "all" || item.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.likes - a.likes;
        case "comments":
          return b.comments - a.comments;
        case "recent":
        default:
          return 0; // Keep original order for recent
      }
    });

  const handleLike = (id: string) => {
    setSharedContent(prev => prev.map(item => 
      item.id === id 
        ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 }
        : item
    ));
  };

  const handleShare = () => {
    if (!shareUrl.trim()) return;
    
    // Create new shared content item
    const newItem = {
      id: Date.now().toString(),
      type: shareUrl.includes("/topics/") ? "topic" as const : "quiz" as const,
      title: shareTitle || "Shared Content",
      description: shareDescription || "Check out this amazing content!",
      url: shareUrl,
      author: {
        name: "You",
        avatar: "YU",
      },
      timestamp: "Just now",
      likes: 0,
      comments: 0,
      isLiked: false,
      tags: [],
    };

    setSharedContent(prev => [newItem, ...prev]);
    setShowShareModal(false);
    setShareUrl("");
    setShareTitle("");
    setShareDescription("");
  };

  const getTypeIcon = (type: string) => {
    return type === "topic" ? (
      <PiBookmark className="text-blue-500" size={16} />
    ) : (
      <PiExam className="text-green-500" size={16} />
    );
  };

  const getTypeColor = (type: string) => {
    return type === "topic" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Collaboration Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share and discover amazing topics and quizzes with the community
          </p>
        </div>

        {/* Action Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <PiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as ContentType)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="topic">Topics</option>
                  <option value="quiz">Quizzes</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortType)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="recent">Recent</option>
                  <option value="popular">Most Liked</option>
                  <option value="comments">Most Discussed</option>
                </select>
              </div>
            </div>

            {/* Share Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              <PiPlus size={18} />
              Share Content
            </button>
          </div>
        </div>

        {/* Content Feed */}
        <div className="space-y-4">
          {filteredContent.length === 0 ? (
            <div className="text-center py-12">
              <PiChatCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No content found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? "Try adjusting your search terms" : "Be the first to share something!"}
              </p>
            </div>
          ) : (
            filteredContent.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {item.author.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.author.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <PiClock size={14} />
                        {item.timestamp}
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                    {getTypeIcon(item.type)}
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </div>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {item.description}
                  </p>
                  
                  {/* URL Link */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200"
                  >
                    <PiLink size={16} />
                    View Content
                  </a>

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {item.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleLike(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-200 ${
                      item.isLiked
                        ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {item.isLiked ? <PiHeartFill size={16} /> : <PiHeart size={16} />}
                    {item.likes}
                  </button>
                  
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors duration-200">
                    <PiChatCircle size={16} />
                    {item.comments}
                  </button>
                  
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors duration-200">
                    <PiShare size={16} />
                    Share
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Share Content
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content URL *
                </label>
                <input
                  type="url"
                  placeholder="http://localhost:3001/topics/..."
                  value={shareUrl}
                  onChange={(e) => setShareUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title (optional)
                </label>
                <input
                  type="text"
                  placeholder="Give your content a title..."
                  value={shareTitle}
                  onChange={(e) => setShareTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  placeholder="Tell others why this content is worth checking out..."
                  value={shareDescription}
                  onChange={(e) => setShareDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={!shareUrl.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 