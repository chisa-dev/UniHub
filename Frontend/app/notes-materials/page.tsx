"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  PiNote,
  PiFolderOpen,
  PiPlus,
  PiUpload,
  PiMagnifyingGlass,
  PiDownload,
  PiTrash,
  PiFolder,
  PiBookOpen,
  PiClock
} from "react-icons/pi";
import { getStatistics, TopicProgress } from "./statistics.service";
import { getAllMaterials, getMaterialsByTopic, Material, deleteMaterial, deleteAllMaterialsByTopic } from "./materials.service";
import { formatFileSize, getFormattedDate, getFileIconComponent, getFileIconColorClass } from "./utils";
import UploadFileModal from "./UploadFileModal";
import ConfirmDialog from "./ConfirmDialog";
import Alert from "@/components/ui/Alert";

const NotesMaterials = () => {
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState("grid");
  const [topics, setTopics] = useState<TopicProgress[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Delete material confirm dialog state
  const [isDeleteMaterialDialogOpen, setIsDeleteMaterialDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Delete all materials by topic confirm dialog state
  const [isDeleteAllMaterialsDialogOpen, setIsDeleteAllMaterialsDialogOpen] = useState(false);
  const [topicToDeleteFrom, setTopicToDeleteFrom] = useState<TopicProgress | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  
  // Alert state
  const [alert, setAlert] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  
  // Extract fetching topics into a separate function
  const fetchTopics = useCallback(async () => {
    try {
      // Fetch topics statistics
      const statisticsData = await getStatistics();
      setTopics(statisticsData.topics_progress);
    } catch (error) {
      console.error('[LOG notes_materials] ========= Error fetching topics:', error);
      setError('Failed to load topics. Please try again later.');
    }
  }, []);
  
  // Fetch topics and materials
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch topics
        await fetchTopics();
        
        // Fetch all materials initially
        const materialsData = await getAllMaterials();
        setMaterials(materialsData);
      } catch (error) {
        console.error('[LOG notes_materials] ========= Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [fetchTopics]);
  
  // Filter materials when folder selection changes
  useEffect(() => {
    const fetchMaterialsByTopic = async () => {
      if (selectedFolder === 'all') {
        // Fetch all materials
        try {
          const materialsData = await getAllMaterials();
          setMaterials(materialsData);
        } catch (error) {
          console.error('[LOG notes_materials] ========= Error fetching all materials:', error);
          setError('Failed to load materials.');
        }
      } else {
        // Fetch materials by topic
        try {
          const materialsData = await getMaterialsByTopic(selectedFolder);
          setMaterials(materialsData);
        } catch (error) {
          console.error('[LOG notes_materials] ========= Error fetching materials by topic:', error);
          setError('Failed to load materials for the selected topic.');
        }
      }
    };
    
    fetchMaterialsByTopic();
  }, [selectedFolder]);
  
  // Handle refresh after upload or delete
  const handleRefreshData = async () => {
    try {
      if (selectedFolder === 'all') {
        const materialsData = await getAllMaterials();
        setMaterials(materialsData);
      } else {
        const materialsData = await getMaterialsByTopic(selectedFolder);
        setMaterials(materialsData);
      }
      
      // Refresh topic counts
      await fetchTopics();
      
      // Show success alert
      setAlert({
        message: "Materials updated successfully",
        type: "success"
      });
    } catch (error) {
      console.error('[LOG notes_materials] ========= Error refreshing data:', error);
      setAlert({
        message: "Failed to refresh materials",
        type: "error"
      });
    }
  };
  
  // Handler for opening delete material confirmation dialog
  const handleDeleteMaterialClick = (material: Material) => {
    setMaterialToDelete(material);
    setIsDeleteMaterialDialogOpen(true);
  };
  
  // Handler for opening delete all materials confirmation dialog
  const handleDeleteAllMaterialsClick = (topic: TopicProgress) => {
    setTopicToDeleteFrom(topic);
    setIsDeleteAllMaterialsDialogOpen(true);
  };
  
  // Handler for deleting a single material
  const handleDeleteMaterial = async () => {
    if (!materialToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteMaterial(materialToDelete.id);
      
      // Close dialog and refresh data
      setIsDeleteMaterialDialogOpen(false);
      await handleRefreshData();
      
      // Show success alert
      setAlert({
        message: `"${materialToDelete.file_name}" deleted successfully`,
        type: "success"
      });
    } catch (error) {
      console.error('[LOG notes_materials] ========= Error deleting material:', error);
      setAlert({
        message: "Failed to delete material",
        type: "error"
      });
    } finally {
      setIsDeleting(false);
      setMaterialToDelete(null);
    }
  };
  
  // Handler for deleting all materials in a topic
  const handleDeleteAllMaterials = async () => {
    if (!topicToDeleteFrom) return;
    
    setIsDeletingAll(true);
    try {
      await deleteAllMaterialsByTopic(topicToDeleteFrom.topicId);
      
      // Close dialog and refresh data
      setIsDeleteAllMaterialsDialogOpen(false);
      await handleRefreshData();
      
      // Show success alert
      setAlert({
        message: `All materials in "${topicToDeleteFrom.topicTitle}" deleted successfully`,
        type: "success"
      });
    } catch (error) {
      console.error('[LOG notes_materials] ========= Error deleting all materials:', error);
      setAlert({
        message: "Failed to delete materials",
        type: "error"
      });
    } finally {
      setIsDeletingAll(false);
      setTopicToDeleteFrom(null);
    }
  };
  
  // Filter materials based on search query
  const filteredMaterials = materials.filter(material => 
    material.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get file icon component
  const getFileIcon = (fileType: string) => {
    const IconComponent = getFileIconComponent(fileType);
    const colorClass = getFileIconColorClass(fileType);
    return <IconComponent className={colorClass} />;
  };

  return (
    <div className="w-full max-w-[1070px] mx-auto">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <PiNote className="text-primaryColor" />
          Files & Materials
        </h1>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-primaryColor text-white py-2 px-4 rounded-xl flex items-center gap-1"
          >
            <PiPlus />
            <span>Add File</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-5 rounded-xl border border-primaryColor/20 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Topics</h3>
            </div>
            
            <div className="space-y-1">
              <div
                key="all-files"
                className={`relative group ${
                  selectedFolder === "all"
                    ? "bg-primaryColor/10 text-primaryColor"
                    : "hover:bg-primaryColor/5"
                } rounded-lg flex items-center justify-between p-3`}
              >
                <div 
                  onClick={() => setSelectedFolder("all")}
                  className="flex-1 flex items-center gap-2 cursor-pointer"
                >
                  <PiFolder size={18} />
                  <span>All Files</span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-n300/10">
                    {topics.reduce((sum, topic) => sum + topic.materialsCount, 0)}
                  </span>
                </div>
              </div>
              
              {topics.map((topic) => (
                <div 
                  key={topic.topicId} 
                  className={`relative group ${
                    selectedFolder === topic.topicId
                      ? "bg-primaryColor/10 text-primaryColor"
                      : "hover:bg-primaryColor/5"
                  } rounded-lg flex items-center justify-between p-3`}
                >
                  <div 
                    onClick={() => setSelectedFolder(topic.topicId)}
                    className="flex-1 flex items-center gap-2 cursor-pointer"
                  >
                    <PiFolder size={18} />
                    <span>{topic.topicTitle}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-n300/10">
                      {topic.materialsCount}
                    </span>
                    
                    {/* Delete button that appears on hover */}
                    {topic.materialsCount > 0 && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAllMaterialsClick(topic);
                        }}
                        className="p-1.5 bg-errorColor/10 text-errorColor rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-errorColor/20"
                        aria-label={`Delete all materials in ${topic.topicTitle}`}
                      >
                        <PiTrash size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-5 border-t border-primaryColor/10">
              <h4 className="text-sm font-medium mb-3">Storage</h4>
              <div className="w-full bg-n300/20 rounded-full h-2 mb-1">
                <div className="bg-primaryColor h-2 rounded-full" style={{ width: "5%" }}></div>
              </div>
              <div className="flex justify-between text-xs text-n300 dark:text-n400">
                <span>0.1 GB used</span>
                <span>Unlimited total</span>
              </div>
            </div>
          </div>
          
          <div className="bg-primaryColor/5 p-5 rounded-xl border border-primaryColor/20">
            <h3 className="font-medium mb-4">Quick Actions</h3>
            
            <div className="space-y-2">
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full flex items-center gap-2 p-3 rounded-lg bg-white border border-primaryColor/20 hover:border-primaryColor/40"
              >
                <PiUpload className="text-primaryColor" />
                <span className="text-sm">Upload File</span>
              </button>
              
              <button className="w-full flex items-center gap-2 p-3 rounded-lg bg-white border border-primaryColor/20 hover:border-primaryColor/40">
                <PiNote className="text-primaryColor" />
                <span className="text-sm">Create Note</span>
              </button>
              
              <button className="w-full flex items-center gap-2 p-3 rounded-lg bg-white border border-primaryColor/20 hover:border-primaryColor/40">
                <PiBookOpen className="text-primaryColor" />
                <span className="text-sm">Study Materials</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <div className="bg-white p-5 rounded-xl border border-primaryColor/20 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="relative flex-1 max-w-lg">
                <input
                  type="text"
                  placeholder="Search files and notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 px-4 pl-10 rounded-xl border border-primaryColor/30 focus:outline-none focus:ring-2 focus:ring-primaryColor bg-transparent"
                />
                <PiMagnifyingGlass className="absolute left-3 top-2.5 text-primaryColor" />
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedView("grid")}
                  className={`p-2 rounded-lg ${selectedView === "grid" ? "bg-primaryColor/10 text-primaryColor" : ""}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                  </svg>
                </button>
                <button 
                  onClick={() => setSelectedView("list")}
                  className={`p-2 rounded-lg ${selectedView === "list" ? "bg-primaryColor/10 text-primaryColor" : ""}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Current folder path */}
            <div className="flex items-center gap-1 text-sm mb-4">
              <span className="text-n300 dark:text-n400">Files</span>
              <span className="text-n300 dark:text-n400">/</span>
              <span className="text-primaryColor">
                {selectedFolder === "all" 
                  ? "All Files" 
                  : topics.find(t => t.topicId === selectedFolder)?.topicTitle || "Unknown Topic"}
              </span>
            </div>
            
            {/* Loading state */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primaryColor"></div>
              </div>
            )}
            
            {/* Error state */}
            {error && !isLoading && (
              <div className="text-center py-8">
                <div className="text-errorColor mb-2">{error}</div>
                <button 
                  onClick={() => window.location.reload()}
                  className="py-2 px-4 bg-primaryColor text-white rounded-lg"
                >
                  Retry
                </button>
              </div>
            )}
            
            {/* Grid view */}
            {!isLoading && !error && selectedView === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMaterials.length > 0 ? (
                  filteredMaterials.map((material) => (
                    <div 
                      key={material.id}
                      className="p-4 border border-primaryColor/20 rounded-xl hover:border-primaryColor/40 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-n300/10 rounded-lg">
                            {getFileIcon(material.file_type)}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm line-clamp-1">{material.file_name}</h4>
                            <p className="text-xs text-n300 dark:text-n400">
                              {material.file_type.toUpperCase()} • {formatFileSize(material.file_size)}
                            </p>
                          </div>
                        </div>
                        <div className="relative">
                          <button 
                            onClick={() => handleDeleteMaterialClick(material)}
                            className="p-1 text-errorColor bg-errorColor/10 rounded opacity-0 group-hover:opacity-100 hover:bg-errorColor/20 transition-opacity"
                          >
                            <PiTrash size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-primaryColor/10 flex items-center justify-between text-xs text-n300 dark:text-n400">
                        <span className="flex items-center gap-1">
                          <PiClock size={12} />
                          {getFormattedDate(material.createdAt)}
                        </span>
                        <div className="flex gap-2">
                          <a 
                            href={material.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-primaryColor"
                          >
                            <PiDownload size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8">
                    <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-primaryColor/10 mb-3">
                      <PiFolderOpen size={24} className="text-primaryColor" />
                    </div>
                    <h3 className="font-medium mb-1">No files found</h3>
                    <p className="text-sm text-n300 dark:text-n400">
                      {searchQuery 
                        ? "No files match your search criteria" 
                        : "Upload files to this topic to get started"}
                    </p>
                    <button 
                      onClick={() => setIsUploadModalOpen(true)}
                      className="mt-4 py-2 px-4 bg-primaryColor text-white rounded-lg"
                    >
                      Upload Files
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* List view */}
            {!isLoading && !error && selectedView === "list" && (
              <div className="overflow-x-auto">
                {filteredMaterials.length > 0 ? (
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-primaryColor/10">
                        <th className="py-2 px-4 text-left font-medium text-sm">Name</th>
                        <th className="py-2 px-4 text-left font-medium text-sm">Type</th>
                        <th className="py-2 px-4 text-left font-medium text-sm">Size</th>
                        <th className="py-2 px-4 text-left font-medium text-sm">Date</th>
                        <th className="py-2 px-4 text-left font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMaterials.map((material) => (
                        <tr key={material.id} className="border-b border-primaryColor/10 hover:bg-primaryColor/5">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getFileIcon(material.file_type)}
                              <span className="text-sm">{material.file_name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-n300 dark:text-n400">
                            {material.file_type.toUpperCase()}
                          </td>
                          <td className="py-3 px-4 text-sm text-n300 dark:text-n400">
                            {formatFileSize(material.file_size)}
                          </td>
                          <td className="py-3 px-4 text-sm text-n300 dark:text-n400">
                            {getFormattedDate(material.createdAt)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <a 
                                href={material.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-1 hover:bg-primaryColor/10 rounded text-primaryColor"
                              >
                                <PiDownload size={16} />
                              </a>
                              <button 
                                onClick={() => handleDeleteMaterialClick(material)}
                                className="p-1 hover:bg-errorColor/10 rounded text-errorColor"
                              >
                                <PiTrash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-primaryColor/10 mb-3">
                      <PiFolderOpen size={24} className="text-primaryColor" />
                    </div>
                    <h3 className="font-medium mb-1">No files found</h3>
                    <p className="text-sm text-n300 dark:text-n400">
                      {searchQuery 
                        ? "No files match your search criteria" 
                        : "Upload files to this topic to get started"}
                    </p>
                    <button 
                      onClick={() => setIsUploadModalOpen(true)}
                      className="mt-4 py-2 px-4 bg-primaryColor text-white rounded-lg"
                    >
                      Upload Files
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-primaryColor/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Recent Activity</h3>
                <a href="#" className="text-xs text-primaryColor hover:underline">View All</a>
              </div>
              
              <div className="space-y-3">
                {materials.slice(0, 3).map((material, index) => (
                  <div key={material.id} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primaryColor/10">
                      <PiUpload className="text-primaryColor" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Uploaded {material.file_name}</div>
                      <p className="text-xs text-n300 dark:text-n400">{getFormattedDate(material.createdAt)}</p>
                    </div>
                  </div>
                ))}
                
                {materials.length === 0 && (
                  <div className="text-center py-4 text-n300">
                    No recent activity
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-primaryColor/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Quick Study Materials</h3>
                <a href="#" className="text-xs text-primaryColor hover:underline">View All</a>
              </div>
              
              <div className="space-y-3">
                {materials.filter(m => m.file_type === 'pdf').slice(0, 3).map((material) => (
                  <div key={material.id} className="p-3 border border-primaryColor/20 rounded-lg hover:border-primaryColor/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PiBookOpen className="text-primaryColor" />
                      <span className="text-sm font-medium">{material.file_name}</span>
                    </div>
                    <a 
                      href={material.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-primaryColor hover:underline"
                    >
                      Open
                    </a>
                  </div>
                ))}
                
                {materials.filter(m => m.file_type === 'pdf').length === 0 && (
                  <div className="text-center py-4 text-n300">
                    No study materials available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Upload File Modal */}
      {isUploadModalOpen && (
        <UploadFileModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          topics={topics}
          onUploadSuccess={handleRefreshData}
        />
      )}
      
      {/* Delete Material Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteMaterialDialogOpen}
        title="Delete Material"
        message={`Are you sure you want to delete "${materialToDelete?.file_name}"? This action cannot be undone.`}
        confirmButtonText="Delete"
        onConfirm={handleDeleteMaterial}
        onCancel={() => {
          setIsDeleteMaterialDialogOpen(false);
          setMaterialToDelete(null);
        }}
        isLoading={isDeleting}
      />
      
      {/* Delete All Materials Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteAllMaterialsDialogOpen}
        title="Delete All Materials"
        message={`Are you sure you want to delete all materials from "${topicToDeleteFrom?.topicTitle}"? This action cannot be undone.`}
        confirmButtonText="Delete All"
        onConfirm={handleDeleteAllMaterials}
        onCancel={() => {
          setIsDeleteAllMaterialsDialogOpen(false);
          setTopicToDeleteFrom(null);
        }}
        isLoading={isDeletingAll}
      />
    </div>
  );
};

export default NotesMaterials; 