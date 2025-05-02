"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  PiNote, 
  PiSpeakerHigh,
  PiVideoCameraFill,
  PiCheck,
  PiArrowRight,
  PiListChecks,
  PiChatCircleText,
  PiClockCountdown,
  PiFileText,
  PiSpinnerGap
} from "react-icons/pi";
import Select from "react-select";
import ComingSoonModal from "./ComingSoonModal";
import { getAllTopics, getAllNotes, createNoteWithRAG } from "./noteSummaryService";
import { Topic, Note } from "./noteSummaryService";
import toast from "react-hot-toast";

const NoteSummarization = () => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>("written");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedTopicTitle, setSelectedTopicTitle] = useState<string>("");
  const [mediaLength, setMediaLength] = useState<string>("5 minutes");
  const [goals, setGoals] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [topics, setTopics] = useState<{value: string, label: string}[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState<boolean>(false);
  const [comingSoonFeatureType, setComingSoonFeatureType] = useState<string>("");
  
  // Fetch topics and recent notes on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch topics
        const topicsData = await getAllTopics();
        const formattedTopics = topicsData.map(topic => ({
          value: topic.id,
          label: topic.title
        }));
        setTopics(formattedTopics);
        
        // Fetch recent notes
        const notesData = await getAllNotes(1, 3);
        setRecentNotes(notesData.notes);
      } catch (error) {
        console.error('[LOG note_summary] ========= Error fetching initial data:', error);
        toast.error('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Types of summaries
  const summaryTypes = [
    { id: "written", name: "Written Note", icon: <PiNote size={24} /> },
    { id: "audio", name: "Audio Explanation", icon: <PiSpeakerHigh size={24} /> },
    { id: "video", name: "Video Animation", icon: <PiVideoCameraFill size={24} /> },
  ];
  
  // Handle type selection
  const handleTypeSelect = (type: string) => {
    if (type === "audio" || type === "video") {
      setComingSoonFeatureType(type);
      setIsComingSoonModalOpen(true);
    } else {
      setSelectedType(type);
    }
  };
  
  // Handle topic change
  const handleTopicChange = (option: any) => {
    if (option) {
      setSelectedTopic(option.value);
      setSelectedTopicTitle(option.label);
    } else {
      setSelectedTopic("");
      setSelectedTopicTitle("");
    }
  };
  
  // Create summary
  const handleCreateSummary = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for your note');
      return;
    }
    
    if (!goals.trim()) {
      toast.error('Please enter your goals for this summary');
      return;
    }
    
    setIsCreating(true);
    
    try {
      const noteData = {
        title: title,
        userGoal: goals,
        topicId: selectedTopic || null,
        isPrivate: true
      };
      
      const response = await createNoteWithRAG(noteData);
      
      toast.success('Note created successfully!');
      router.push(`/note-summary/note/${response.note.id}`);
    } catch (error) {
      console.error('[LOG note_summary] ========= Error creating note:', error);
      toast.error('Failed to create note. Please try again later.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full max-w-[1070px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <PiFileText className="text-primaryColor" />
          Note Summarization
        </h1>
        <button 
          onClick={() => router.push('/notes-materials')}
          className="bg-primaryColor text-white py-2 px-4 rounded-xl flex items-center gap-1">
          <PiFileText />
          <span>My Notes</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white p-5 rounded-xl border border-primaryColor/20 mb-6">
            <h3 className="font-medium mb-5">Create Summary</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Select Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {summaryTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeSelect(type.id)}
                      className={`flex items-center gap-2 p-3 rounded-xl border ${
                        selectedType === type.id
                          ? "border-primaryColor bg-primaryColor/5 text-primaryColor"
                          : "border-primaryColor/20 hover:border-primaryColor/40"
                      }`}
                    >
                      <span className="text-primaryColor">{type.icon}</span>
                      <span className="text-sm">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your note"
                  className="w-full py-2 px-4 rounded-xl border border-primaryColor/30 focus:outline-none focus:ring-2 focus:ring-primaryColor bg-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Topic</label>
                  <Select
                    options={topics}
                    placeholder="Choose a topic..."
                    onChange={handleTopicChange}
                    isLoading={isLoading}
                    isClearable
                    className="rounded-xl"
                    classNames={{
                      control: () => "border border-primaryColor/30 rounded-xl bg-transparent py-1.5 px-3",
                      menu: () => "bg-white shadow-lg rounded-lg",
                      option: ({ isFocused, isSelected }) =>
                        `${
                          isSelected
                            ? "bg-primaryColor/20 text-n700 dark:text-white"
                            : ""
                        } ${
                          isFocused ? "bg-primaryColor/10 text-n700 dark:text-white" : ""
                        } text-sm py-2`,
                    }}
                  />
                </div>
                
                {(selectedType === "video" || selectedType === "audio") && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {selectedType === "video" ? "Video Length" : "Audio Length"}
                    </label>
                    <select 
                      value={mediaLength}
                      onChange={(e) => setMediaLength(e.target.value)}
                      className="w-full py-2 px-4 rounded-xl border border-primaryColor/30 focus:outline-none focus:ring-2 focus:ring-primaryColor bg-transparent"
                    >
                      <option value="3 minutes">3 minutes</option>
                      <option value="5 minutes">5 minutes</option>
                      <option value="10 minutes">10 minutes</option>
                      <option value="15 minutes">15 minutes</option>
                      <option value="20 minutes">20 minutes</option>
                    </select>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Session Goals</label>
                <textarea
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="What would you like to cover in this summary? Any specific concepts or questions to address?"
                  rows={4}
                  className="w-full py-2 px-4 rounded-xl border border-primaryColor/30 focus:outline-none focus:ring-2 focus:ring-primaryColor bg-transparent resize-none"
                ></textarea>
              </div>
              
              <div className="flex justify-between items-center text-sm border-t border-primaryColor/10 pt-4 mt-6">
                <span className="text-n300 dark:text-n400">Generating note might take some time.</span>
                <button 
                  onClick={handleCreateSummary}
                  disabled={isCreating || !title.trim() || !goals.trim()}
                  className={`py-2 px-6 bg-primaryColor text-white rounded-xl font-medium flex items-center gap-2 ${
                    isCreating || !title.trim() || !goals.trim() ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isCreating ? (
                    <>
                      <PiSpinnerGap className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <span>Create Summary</span>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-primaryColor/5 p-5 rounded-xl border border-primaryColor/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Features</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-primaryColor/20">
                <div className="mb-3 text-primaryColor">
                  <PiNote size={24} />
                </div>
                <h4 className="font-medium mb-1">Written Notes</h4>
                <p className="text-sm text-n300 dark:text-n400">
                  Concise text summaries with key concepts, examples, and explanations.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-primaryColor/20">
                <div className="mb-3 text-primaryColor">
                  <PiSpeakerHigh size={24} />
                </div>
                <h4 className="font-medium mb-1">Audio Explanations</h4>
                <p className="text-sm text-n300 dark:text-n400">
                  Listen to detailed explanations for on-the-go learning.
                </p>
                <span className="inline-block mt-2 text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-primaryColor/20">
                <div className="mb-3 text-primaryColor">
                  <PiVideoCameraFill size={24} />
                </div>
                <h4 className="font-medium mb-1">Video Animations</h4>
                <p className="text-sm text-n300 dark:text-n400">
                  Visual learning with animated explanations of complex concepts.
                </p>
                <span className="inline-block mt-2 text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white p-5 rounded-xl border border-primaryColor/20 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Recent Summaries</h3>
              {!isLoading && (
                <span className="text-xs bg-primaryColor/10 text-primaryColor px-2 py-1 rounded-full">
                  {recentNotes.length} Created
                </span>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <PiSpinnerGap className="animate-spin text-primaryColor" size={24} />
              </div>
            ) : recentNotes.length > 0 ? (
              <div className="space-y-4">
                {recentNotes.map((note) => (
                  <div 
                    key={note.id} 
                    className="border border-primaryColor/20 rounded-xl p-4 bg-primaryColor/5 cursor-pointer hover:border-primaryColor/40 transition-colors"
                    onClick={() => router.push(`/note-summary/note/${note.id}`)}
                  >
                    <div className="flex items-center gap-2 text-primaryColor font-medium mb-2">
                      <PiNote />
                      <span className="truncate">{note.title}</span>
                    </div>
                    <div className="text-sm text-n300 dark:text-n400 mb-3">
                      {note.date} • {note.topic || "Uncategorized"}
                    </div>
                    <div className="flex justify-end">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); 
                          router.push(`/note-summary/note/${note.id}`)
                        }} 
                        className="text-xs text-primaryColor hover:underline flex items-center gap-1"
                      >
                        View Summary <PiArrowRight />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-primaryColor/20 rounded-xl">
                <p className="text-n300 dark:text-n400 mb-2">No summaries created yet</p>
                <p className="text-sm">Create your first summary to see it here!</p>
              </div>
            )}
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-primaryColor/20">
            <h3 className="font-medium mb-4">Popular Topics</h3>
            
            <div className="space-y-3">
              {!isLoading ? (
                topics.slice(0, 4).map((topic, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 border border-primaryColor/10 rounded-lg hover:bg-primaryColor/5 cursor-pointer"
                    onClick={() => handleTopicChange(topic)}
                  >
                    <span className="text-sm">{topic.label}</span>
                    <span className="text-xs bg-primaryColor/10 text-primaryColor px-2 py-0.5 rounded-full">
                      {Math.floor(Math.random() * 20) + 1} summaries
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center py-6">
                  <PiSpinnerGap className="animate-spin text-primaryColor" size={24} />
                </div>
              )}
              
              {!isLoading && topics.length > 0 && (
                <button 
                  onClick={() => router.push('/topics')}
                  className="w-full text-sm text-primaryColor py-2 border border-primaryColor/20 rounded-lg mt-2 hover:bg-primaryColor/5"
                >
                  View All Topics
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Coming Soon Modal */}
      <ComingSoonModal 
        isOpen={isComingSoonModalOpen}
        onClose={() => setIsComingSoonModalOpen(false)}
        featureType={comingSoonFeatureType}
      />
    </div>
  );
};

export default NoteSummarization; 