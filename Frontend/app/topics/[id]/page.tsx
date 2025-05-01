"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  PiAlignLeft,
  PiBookOpen,
  PiFileText,
  PiListChecks,
  PiCaretRight,
  PiPlayCircle,
  PiStar,
  PiStarFill,
  PiChartBar,
  PiPencilLine,
  PiExport
} from "react-icons/pi";
import { useParams, useRouter } from "next/navigation";
import { Topic, topicsService } from "../topicsService";
import { getStatistics, TopicProgress } from "@/app/notes-materials/statistics.service";
import { authService } from "@/app/auth/authService";
import { getMaterialsByTopic } from "@/app/notes-materials/materials.service";
import { getNotesByTopic, Note, NotesResponse } from "@/app/notes-materials/notes.service";
import { getQuizzesByTopic, Quiz, QuizzesResponse } from "@/app/quizzes/quizzes.service";
import EditTopicDialog from "@/components/modals/EditTopicDialog";
import { API_ENDPOINTS } from '@/config/apiConfig';

// Define interfaces for the API data
interface Material {
  id: string;
  topic_id: string;
  file_name: string;
  uploaded_file: string;
  file_type: 'pdf' | 'image' | 'ppt' | 'docx';
  file_size: number;
  createdAt: string;
  updatedAt: string;
  fileUrl: string;
}

const TopicDetail = () => {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [activeTab, setActiveTab] = useState("notes");
  
  // State for API data
  const [topic, setTopic] = useState<Topic | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isStarred, setIsStarred] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastStudied, setLastStudied] = useState<string>("Not studied yet");
  const [timeSpent, setTimeSpent] = useState<string>("0h 0m");
  
  // State for edit topic dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Function to fetch all topic data - wrapped in useCallback to avoid dependency issues
  const fetchTopicData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      const token = authService.getToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      // Fetch topic details
      const topicData = await topicsService.getTopic(id as string);
      setTopic(topicData);
      
      // Fetch topic statistics to get progress
      const statisticsData = await getStatistics();
      const topicProgress = statisticsData.topics_progress.find(
        (t: TopicProgress) => t.topicId === id
      );
      
      if (topicProgress) {
        setProgress(topicProgress.progress);
        // We don't have starred info in the API, could be implemented later
        setIsStarred(false);
      }
      
      // Fetch notes for the topic
      try {
        const notesResponse = await getNotesByTopic(id as string);
        const notesData = Array.isArray(notesResponse.notes) 
          ? notesResponse.notes 
          : notesResponse.notes ? [notesResponse.notes] : [];
        setNotes(notesData);
      } catch (notesError) {
        console.error('[LOG topic_detail] ========= Error fetching notes:', notesError);
        setNotes([]);
      }
      
      // Fetch quizzes for the topic
      try {
        const quizzesResponse = await getQuizzesByTopic(id as string);
        setQuizzes(quizzesResponse.quizzes || []);
      } catch (quizzesError) {
        console.error('[LOG topic_detail] ========= Error fetching quizzes:', quizzesError);
        setQuizzes([]);
      }
      
      // Fetch materials for the topic
      try {
        const materialsData = await getMaterialsByTopic(id as string);
        setMaterials(materialsData || []);
      } catch (materialsError) {
        console.error('[LOG topic_detail] ========= Error fetching materials:', materialsError);
        setMaterials([]);
      }
      
      // Set last studied and time spent (this would come from statistics in a real app)
      if (topicProgress && topicProgress.progress > 0) {
        setLastStudied(new Date().toLocaleDateString());
        setTimeSpent(`${Math.floor(Math.random() * 10)}h ${Math.floor(Math.random() * 60)}m`);
      }
      
    } catch (error: any) {
      console.error('[LOG topic_detail] ========= Error fetching topic data:', error);
      setError(error.message || 'Failed to load topic data');
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);
  
  // Fetch data on component mount or when id changes
  useEffect(() => {
    fetchTopicData();
  }, [fetchTopicData]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Handle opening the edit topic dialog
  const handleOpenEditDialog = () => {
    setIsEditDialogOpen(true);
  };
  
  // Handle closing the edit topic dialog
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };
  
  // Handle topic updated
  const handleTopicUpdated = () => {
    // Refetch topic data after update
    fetchTopicData();
  };
  
  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primaryColor border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading topic data...</p>
        </div>
      </div>
    );
  }
  
  if (error || !topic) {
    return (
      <div className="container py-8">
        <div className="bg-errorColor/10 text-errorColor p-4 rounded-xl">
          <h2 className="font-semibold mb-2">Error</h2>
          <p>{error || 'Failed to load topic data'}</p>
          <button 
            className="mt-4 px-4 py-2 bg-primaryColor text-white rounded-xl"
            onClick={() => router.push('/topics')}
          >
            Go Back to Topics
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      {/* Edit Topic Dialog */}
      {topic && (
        <EditTopicDialog
          topic={topic}
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          onTopicUpdated={handleTopicUpdated}
        />
      )}
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PiAlignLeft className="text-primaryColor" />
            <span className="text-sm text-n300 dark:text-n400">Topics / </span>
            <span className="text-sm">{topic.title}</span>
          </div>
          <h1 className="text-2xl font-semibold">{topic.title}</h1>
          <p className="text-n300 dark:text-n400 mt-1">{topic.description}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            className="py-2 px-4 border border-primaryColor/30 text-primaryColor rounded-xl hover:bg-primaryColor/5 flex items-center gap-1"
            onClick={handleOpenEditDialog}
          >
            <PiPencilLine />
            <span>Edit Topic</span>
          </button>
          <button 
            className="py-2 px-4 bg-primaryColor text-white rounded-xl flex items-center gap-1"
            onClick={() => router.push(`/assistance?topic=${encodeURIComponent(topic.id)}`)}
          >
            <PiPlayCircle />
            <span>Study Now</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20">
            {/* Progress bar */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Progress</h3>
                <span className="text-sm text-n300 dark:text-n400">
                  {progress}% Complete
                </span>
              </div>
              <button onClick={() => setIsStarred(!isStarred)}>
                {isStarred ? (
                  <PiStarFill className="text-warningColor" />
                ) : (
                  <PiStar className="text-n300 hover:text-warningColor" />
                )}
              </button>
            </div>
            <div className="w-full bg-n300/20 rounded-full h-2 mb-4">
              <div 
                className="bg-primaryColor h-2 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            {/* Tab navigation */}
            <div className="flex border-b border-primaryColor/10 mb-4">
              <button 
                onClick={() => setActiveTab("notes")}
                className={`py-2 px-4 font-medium text-sm border-b-2 ${
                  activeTab === "notes" 
                    ? "border-primaryColor text-primaryColor" 
                    : "border-transparent hover:text-primaryColor"
                }`}
              >
                Notes
              </button>
              <button 
                onClick={() => setActiveTab("quizzes")}
                className={`py-2 px-4 font-medium text-sm border-b-2 ${
                  activeTab === "quizzes" 
                    ? "border-primaryColor text-primaryColor" 
                    : "border-transparent hover:text-primaryColor"
                }`}
              >
                Quizzes
              </button>
              <button 
                onClick={() => setActiveTab("materials")}
                className={`py-2 px-4 font-medium text-sm border-b-2 ${
                  activeTab === "materials" 
                    ? "border-primaryColor text-primaryColor" 
                    : "border-transparent hover:text-primaryColor"
                }`}
              >
                Materials
              </button>
            </div>
            
            {/* Notes tab */}
            {activeTab === "notes" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">My Notes</h3>
                  <button 
                    className="text-xs bg-primaryColor text-white py-1 px-3 rounded-lg flex items-center gap-1"
                    onClick={() => router.push(`/notes-materials?topicId=${id}`)}
                  >
                    <PiPencilLine />
                    <span>New Note</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {notes.length > 0 ? (
                    notes.map((note) => (
                      <div 
                        key={note.id} 
                        className="p-3 border border-primaryColor/20 rounded-lg hover:border-primaryColor/40 flex items-center justify-between group cursor-pointer"
                        onClick={() => router.push(`/notes-materials?noteId=${note.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primaryColor/10 rounded-lg">
                            <PiFileText className="text-primaryColor" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{note.title}</h4>
                            <p className="text-xs text-n300 dark:text-n400">
                              Last edited: {formatDate(note.updated_at)}
                            </p>
                          </div>
                        </div>
                        <button className="p-1 opacity-0 group-hover:opacity-100 rounded-lg hover:bg-primaryColor/10 transition-opacity">
                          <PiCaretRight className="text-primaryColor" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 border border-dashed border-primaryColor/20 rounded-lg">
                      <p className="text-n300 dark:text-n400">No notes yet. Create your first note!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Quizzes tab */}
            {activeTab === "quizzes" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">My Quizzes</h3>
                  <button 
                    className="text-xs bg-primaryColor text-white py-1 px-3 rounded-lg flex items-center gap-1"
                    onClick={() => router.push(`/quizzes/create?topicId=${id}`)}
                  >
                    <PiListChecks />
                    <span>New Quiz</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {quizzes.length > 0 ? (
                    quizzes.map((quiz) => (
                      <div 
                        key={quiz.id}
                        className="p-3 border border-primaryColor/20 rounded-lg hover:border-primaryColor/40 flex items-center justify-between group cursor-pointer"
                        onClick={() => router.push(`/quizzes/${quiz.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primaryColor/10 rounded-lg">
                            <PiListChecks className="text-primaryColor" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{quiz.title}</h4>
                            <p className="text-xs text-n300 dark:text-n400">
                              {quiz.question_count} questions • Created: {formatDate(quiz.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {quiz.attempt_count > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-successColor/10 text-successColor">
                              Attempted
                            </span>
                          )}
                          <button className="p-1 opacity-0 group-hover:opacity-100 rounded-lg hover:bg-primaryColor/10 transition-opacity">
                            <PiCaretRight className="text-primaryColor" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 border border-dashed border-primaryColor/20 rounded-lg">
                      <p className="text-n300 dark:text-n400">No quizzes yet. Create your first quiz!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Materials tab */}
            {activeTab === "materials" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Study Materials</h3>
                  <button 
                    className="text-xs bg-primaryColor text-white py-1 px-3 rounded-lg flex items-center gap-1"
                    onClick={() => router.push(`/notes-materials?topicId=${id}&tab=materials`)}
                  >
                    <PiExport />
                    <span>Add Material</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {materials.length > 0 ? (
                    materials.map((material) => (
                      <div 
                        key={material.id}
                        className="p-3 border border-primaryColor/20 rounded-lg hover:border-primaryColor/40 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primaryColor/10 rounded-lg">
                            <PiBookOpen className="text-primaryColor" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{material.file_name}</h4>
                            <p className="text-xs text-n300 dark:text-n400">
                              {material.file_type?.toUpperCase()} • {formatFileSize(material.file_size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a 
                            href={material.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primaryColor hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Download
                          </a>
                          <button className="p-1 opacity-0 group-hover:opacity-100 rounded-lg hover:bg-primaryColor/10 transition-opacity">
                            <PiCaretRight className="text-primaryColor" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 border border-dashed border-primaryColor/20 rounded-lg">
                      <p className="text-n300 dark:text-n400">No materials yet. Add your first study material!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20 mb-6">
            <h3 className="font-medium mb-4">Study Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-n300 dark:text-n400">Last Studied</span>
                <span className="font-medium">{lastStudied}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-n300 dark:text-n400">Time Spent</span>
                <span className="font-medium">{timeSpent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-n300 dark:text-n400">Notes</span>
                <span className="font-medium">{notes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-n300 dark:text-n400">Quizzes</span>
                <span className="font-medium">{quizzes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-n300 dark:text-n400">Materials</span>
                <span className="font-medium">{materials.length}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-primaryColor/10">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <PiChartBar className="text-primaryColor" />
                <span>Progress Chart</span>
              </h3>
              
              {/* Simple placeholder for a chart */}
              <div className="h-36 flex items-end gap-1">
                {[40, 45, 50, 55, 60, 65, progress].map((height, idx) => (
                  <div 
                    key={idx}
                    className="flex-1 bg-primaryColor/20 rounded-t"
                    style={{ height: `${height}%` }}
                  ></div>
                ))}
              </div>
              <div className="mt-1 flex text-xs text-n300 justify-between">
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
                <span>S</span>
              </div>
            </div>
          </div>
          
          <div className="bg-primaryColor/5 p-5 rounded-xl border border-primaryColor/20">
            <h3 className="font-medium mb-3">Recommended Actions</h3>
            <div className="space-y-2">
              <button 
                className="w-full flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-n0 border border-primaryColor/20 hover:border-primaryColor/40 text-left"
                onClick={() => router.push(`/quizzes/create?topicId=${id}`)}
              >
                <PiListChecks className="text-primaryColor" />
                <span className="text-sm">Take a practice quiz</span>
              </button>
   
              
              <button 
                className="w-full flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-n0 border border-primaryColor/20 hover:border-primaryColor/40 text-left"
                onClick={() => router.push(`/notes-materials?topicId=${id}`)}
              >
                <PiFileText className="text-primaryColor" />
                <span className="text-sm">Create new notes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicDetail; 