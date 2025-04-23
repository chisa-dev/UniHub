"use client";

import React, { useState } from "react";
import {
  PiNote,
  PiFolderOpen,
  PiPlus,
  PiUpload,
  PiMagnifyingGlass,
  PiDotsThreeVertical,
  PiDownload,
  PiShareFat,
  PiTrash,
  PiFilePdf,
  PiFileDoc,
  PiFileCsv,
  PiImage,
  PiFileText,
  PiTag,
  PiFolder,
  PiBookOpen,
  PiClock
} from "react-icons/pi";

const NotesMaterials = () => {
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState("grid");
  
  // Mock folders data
  const folders = [
    { id: "all", name: "All Files", count: 24 },
    { id: "recent", name: "Recent", count: 8 },
    { id: "math", name: "Mathematics", count: 5 },
    { id: "science", name: "Science", count: 7 },
    { id: "history", name: "History", count: 4 },
    { id: "english", name: "English", count: 3 },
    { id: "cs", name: "Computer Science", count: 5 }
  ];
  
  // Mock files data
  const files = [
    {
      id: 1,
      name: "Calculus Notes",
      type: "pdf",
      size: "2.4 MB",
      modified: "May 10, 2023",
      folder: "math",
      icon: <PiFilePdf className="text-errorColor" />
    },
    {
      id: 2,
      name: "Biology Chapter 5",
      type: "docx",
      size: "1.8 MB",
      modified: "May 8, 2023",
      folder: "science",
      icon: <PiFileDoc className="text-primaryColor" />
    },
    {
      id: 3,
      name: "World History Timeline",
      type: "xlsx",
      size: "925 KB",
      modified: "May 5, 2023",
      folder: "history",
      icon: <PiFileCsv className="text-successColor" />
    },
    {
      id: 4,
      name: "Chemistry Lab Report",
      type: "pdf",
      size: "3.2 MB",
      modified: "May 3, 2023",
      folder: "science",
      icon: <PiFilePdf className="text-errorColor" />
    },
    {
      id: 5,
      name: "Literature Essay",
      type: "docx",
      size: "780 KB",
      modified: "April 29, 2023",
      folder: "english",
      icon: <PiFileDoc className="text-primaryColor" />
    },
    {
      id: 6,
      name: "Physics Diagrams",
      type: "png",
      size: "4.1 MB",
      modified: "April 25, 2023",
      folder: "science",
      icon: <PiImage className="text-secondaryColor" />
    },
    {
      id: 7,
      name: "Programming Notes",
      type: "txt",
      size: "120 KB",
      modified: "April 22, 2023",
      folder: "cs",
      icon: <PiFileText className="text-n300" />
    },
    {
      id: 8,
      name: "Algebra Study Guide",
      type: "pdf",
      size: "1.5 MB",
      modified: "April 20, 2023",
      folder: "math",
      icon: <PiFilePdf className="text-errorColor" />
    }
  ];
  
  // Filter files based on selected folder and search query
  const filteredFiles = files.filter(file => {
    const matchesFolder = selectedFolder === "all" || file.folder === selectedFolder;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });
  
  // Files for "Recent" folder
  const recentFiles = selectedFolder === "recent" 
    ? files.slice(0, 3) 
    : filteredFiles;

  return (
    <div className="w-full max-w-[1070px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <PiNote className="text-primaryColor" />
          Notes & Materials
        </h1>
        
        <div className="flex gap-2">
          <button className="py-2 px-4 border border-primaryColor/30 text-primaryColor rounded-xl hover:bg-primaryColor/5 flex items-center gap-1">
            <PiFolderOpen />
            <span>New Folder</span>
          </button>
          <button className="bg-primaryColor text-white py-2 px-4 rounded-xl flex items-center gap-1">
            <PiPlus />
            <span>Add File</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Folders</h3>
              <button className="text-primaryColor p-1 rounded hover:bg-primaryColor/10">
                <PiPlus />
              </button>
            </div>
            
            <div className="space-y-1">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left ${
                    selectedFolder === folder.id
                      ? "bg-primaryColor/10 text-primaryColor"
                      : "hover:bg-primaryColor/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <PiFolder size={18} />
                    <span>{folder.name}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-n300/10">{folder.count}</span>
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-5 border-t border-primaryColor/10">
              <h4 className="text-sm font-medium mb-3">Storage</h4>
              <div className="w-full bg-n300/20 rounded-full h-2 mb-1">
                <div className="bg-primaryColor h-2 rounded-full" style={{ width: "45%" }}></div>
              </div>
              <div className="flex justify-between text-xs text-n300 dark:text-n400">
                <span>4.5 GB used</span>
                <span>10 GB total</span>
              </div>
            </div>
          </div>
          
          <div className="bg-primaryColor/5 p-5 rounded-xl border border-primaryColor/20">
            <h3 className="font-medium mb-4">Quick Actions</h3>
            
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-n0 border border-primaryColor/20 hover:border-primaryColor/40">
                <PiUpload className="text-primaryColor" />
                <span className="text-sm">Upload File</span>
              </button>
              
              <button className="w-full flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-n0 border border-primaryColor/20 hover:border-primaryColor/40">
                <PiNote className="text-primaryColor" />
                <span className="text-sm">Create Note</span>
              </button>
              
              <button className="w-full flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-n0 border border-primaryColor/20 hover:border-primaryColor/40">
                <PiTag className="text-primaryColor" />
                <span className="text-sm">Manage Tags</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20 mb-6">
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
              <span className="text-primaryColor">{folders.find(f => f.id === selectedFolder)?.name}</span>
            </div>
            
            {/* Grid view */}
            {selectedView === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentFiles.map((file) => (
                  <div 
                    key={file.id}
                    className="p-4 border border-primaryColor/20 rounded-xl hover:border-primaryColor/40 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-n300/10 rounded-lg">{file.icon}</div>
                        <div>
                          <h4 className="font-medium text-sm line-clamp-1">{file.name}</h4>
                          <p className="text-xs text-n300 dark:text-n400">
                            {file.type.toUpperCase()} • {file.size}
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-primaryColor/10 rounded transition-opacity">
                          <PiDotsThreeVertical />
                        </button>
                        {/* Dropdown menu would go here in a real implementation */}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-primaryColor/10 flex items-center justify-between text-xs text-n300 dark:text-n400">
                      <span className="flex items-center gap-1">
                        <PiClock size={12} />
                        {file.modified}
                      </span>
                      <div className="flex gap-2">
                        <button className="hover:text-primaryColor">
                          <PiDownload size={14} />
                        </button>
                        <button className="hover:text-primaryColor">
                          <PiShareFat size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* List view */}
            {selectedView === "list" && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-primaryColor/10">
                      <th className="py-2 px-4 text-left font-medium text-sm">Name</th>
                      <th className="py-2 px-4 text-left font-medium text-sm">Type</th>
                      <th className="py-2 px-4 text-left font-medium text-sm">Size</th>
                      <th className="py-2 px-4 text-left font-medium text-sm">Modified</th>
                      <th className="py-2 px-4 text-left font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentFiles.map((file) => (
                      <tr key={file.id} className="border-b border-primaryColor/10 hover:bg-primaryColor/5">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {file.icon}
                            <span className="text-sm">{file.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-n300 dark:text-n400">
                          {file.type.toUpperCase()}
                        </td>
                        <td className="py-3 px-4 text-sm text-n300 dark:text-n400">
                          {file.size}
                        </td>
                        <td className="py-3 px-4 text-sm text-n300 dark:text-n400">
                          {file.modified}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-primaryColor/10 rounded text-primaryColor">
                              <PiDownload size={16} />
                            </button>
                            <button className="p-1 hover:bg-primaryColor/10 rounded text-primaryColor">
                              <PiShareFat size={16} />
                            </button>
                            <button className="p-1 hover:bg-errorColor/10 rounded text-errorColor">
                              <PiTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {recentFiles.length === 0 && (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-primaryColor/10 mb-3">
                  <PiFolderOpen size={24} className="text-primaryColor" />
                </div>
                <h3 className="font-medium mb-1">No files found</h3>
                <p className="text-sm text-n300 dark:text-n400">
                  Upload files or create a new note to get started
                </p>
                <button className="mt-4 py-2 px-4 bg-primaryColor text-white rounded-lg">
                  Upload Files
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Recent Activity</h3>
                <button className="text-xs text-primaryColor hover:underline">View All</button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primaryColor/10">
                    <PiUpload className="text-primaryColor" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Uploaded Chemistry Notes</div>
                    <p className="text-xs text-n300 dark:text-n400">1 hour ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondaryColor/10">
                    <PiNote className="text-secondaryColor" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Created New Study Guide</div>
                    <p className="text-xs text-n300 dark:text-n400">3 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-warningColor/10">
                    <PiShareFat className="text-warningColor" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Shared Physics Diagrams</div>
                    <p className="text-xs text-n300 dark:text-n400">Yesterday</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Quick Study Materials</h3>
                <button className="text-xs text-primaryColor hover:underline">View All</button>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 border border-primaryColor/20 rounded-lg hover:border-primaryColor/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PiBookOpen className="text-primaryColor" />
                    <span className="text-sm font-medium">Math Formula Sheet</span>
                  </div>
                  <button className="text-xs text-primaryColor hover:underline">Open</button>
                </div>
                
                <div className="p-3 border border-primaryColor/20 rounded-lg hover:border-primaryColor/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PiBookOpen className="text-primaryColor" />
                    <span className="text-sm font-medium">Chemistry Periodic Table</span>
                  </div>
                  <button className="text-xs text-primaryColor hover:underline">Open</button>
                </div>
                
                <div className="p-3 border border-primaryColor/20 rounded-lg hover:border-primaryColor/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PiBookOpen className="text-primaryColor" />
                    <span className="text-sm font-medium">Language Conjugation Guide</span>
                  </div>
                  <button className="text-xs text-primaryColor hover:underline">Open</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesMaterials; 