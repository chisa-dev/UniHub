"use client";

import React, { useState } from "react";
import {
  PiSpeakerHigh,
  PiPlay,
  PiPause,
  PiUpload,
  PiTextAUnderline,
  PiDownload,
  PiMicrophone,
  PiSlidersHorizontal,
  PiWaveform,
  PiClockCountdown,
  PiListChecks,
  PiFolder
} from "react-icons/pi";

const AudioRecap = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Mock audio recaps
  const audioRecaps = [
    {
      id: 1,
      title: "Biology Chapter 5 - Cell Structure",
      date: "May 12, 2023",
      duration: "5:32",
      source: "PDF Upload"
    },
    {
      id: 2,
      title: "History Notes - French Revolution",
      date: "May 8, 2023",
      duration: "7:15",
      source: "Text Input"
    },
    {
      id: 3,
      title: "Calculus - Integration Methods",
      date: "May 3, 2023",
      duration: "8:45",
      source: "PDF Upload"
    }
  ];

  return (
    <div className="w-full max-w-[1070px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <PiSpeakerHigh className="text-primaryColor" />
          Audio Recap
        </h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20 mb-6">
            <h3 className="font-medium mb-4">Create New Audio Recap</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Enter a title for your audio recap"
                  className="w-full py-2 px-4 rounded-xl border border-primaryColor/30 focus:outline-none focus:ring-2 focus:ring-primaryColor bg-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Content Source</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button className="p-4 border border-primaryColor/30 rounded-xl flex flex-col items-center gap-2 hover:bg-primaryColor/5">
                    <PiUpload size={24} className="text-primaryColor" />
                    <span className="font-medium">Upload Document</span>
                    <span className="text-xs text-center text-n300 dark:text-n400">
                      PDF, DOCX, or TXT (Max 10MB)
                    </span>
                  </button>
                  
                  <button className="p-4 border border-primaryColor/30 rounded-xl flex flex-col items-center gap-2 hover:bg-primaryColor/5">
                    <PiTextAUnderline size={24} className="text-primaryColor" />
                    <span className="font-medium">Text Input</span>
                    <span className="text-xs text-center text-n300 dark:text-n400">
                      Enter or paste text to convert
                    </span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Voice and Settings</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-n300 dark:text-n400 mb-1">Voice Type</label>
                    <select className="w-full py-2 px-4 rounded-xl border border-primaryColor/30 focus:outline-none focus:ring-2 focus:ring-primaryColor bg-transparent">
                      <option>Female (Default)</option>
                      <option>Male</option>
                      <option>Neutral</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-n300 dark:text-n400 mb-1">Reading Speed</label>
                    <select className="w-full py-2 px-4 rounded-xl border border-primaryColor/30 focus:outline-none focus:ring-2 focus:ring-primaryColor bg-transparent">
                      <option>0.75x (Slow)</option>
                      <option selected>1.0x (Normal)</option>
                      <option>1.25x (Fast)</option>
                      <option>1.5x (Very Fast)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1">
                  <PiSlidersHorizontal />
                  <span>Advanced Options</span>
                </label>
                <div className="space-y-3 p-3 border border-primaryColor/20 rounded-xl bg-primaryColor/5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Include Key Term Definitions</span>
                    <div className="relative inline-block w-10 align-middle select-none">
                      <input 
                        type="checkbox" 
                        name="toggle" 
                        id="toggle1" 
                        className="opacity-0 absolute h-0 w-0" 
                        checked 
                      />
                      <label 
                        htmlFor="toggle1" 
                        className="block overflow-hidden h-6 rounded-full bg-n300 cursor-pointer"
                      >
                        <span className="dot block h-6 w-6 rounded-full bg-white transform translate-x-4"></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Add Chapter Markers</span>
                    <div className="relative inline-block w-10 align-middle select-none">
                      <input 
                        type="checkbox" 
                        name="toggle" 
                        id="toggle2" 
                        className="opacity-0 absolute h-0 w-0" 
                      />
                      <label 
                        htmlFor="toggle2" 
                        className="block overflow-hidden h-6 rounded-full bg-n300 cursor-pointer"
                      >
                        <span className="dot block h-6 w-6 rounded-full bg-white transform"></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Include Quiz Questions</span>
                    <div className="relative inline-block w-10 align-middle select-none">
                      <input 
                        type="checkbox" 
                        name="toggle" 
                        id="toggle3" 
                        className="opacity-0 absolute h-0 w-0" 
                      />
                      <label 
                        htmlFor="toggle3" 
                        className="block overflow-hidden h-6 rounded-full bg-n300 cursor-pointer"
                      >
                        <span className="dot block h-6 w-6 rounded-full bg-white transform"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="w-full py-3 bg-primaryColor text-white rounded-xl font-medium">
                Generate Audio Recap
              </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-medium">Current Audio</h3>
              <span className="text-xs bg-primaryColor/10 text-primaryColor px-2 py-1 rounded-full">
                Preview
              </span>
            </div>
            
            <div className="rounded-xl border border-primaryColor/20 bg-primaryColor/5 p-4 mb-4">
              <div className="mb-3">
                <h4 className="font-medium">The Cell Structure and Function</h4>
                <p className="text-xs text-n300 dark:text-n400">Biology Recap • 5:32</p>
              </div>
              
              <div className="h-16 mb-3 bg-n0 dark:bg-n700 rounded overflow-hidden relative">
                {/* This would be the waveform visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <PiWaveform size={36} className="text-primaryColor/50" />
                </div>
                <div className="h-full w-1/3 bg-primaryColor/20 absolute left-0 top-0"></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs">1:45</span>
                <div className="flex items-center gap-3">
                  <button className="p-2 hover:bg-primaryColor/10 rounded-full">
                    <PiSlidersHorizontal className="text-primaryColor" />
                  </button>
                  <button 
                    className="p-3 bg-primaryColor text-white rounded-full"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <PiPause size={20} /> : <PiPlay size={20} />}
                  </button>
                  <button className="p-2 hover:bg-primaryColor/10 rounded-full">
                    <PiDownload className="text-primaryColor" />
                  </button>
                </div>
                <span className="text-xs">5:32</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-n0 p-3 rounded-xl border border-primaryColor/20">
                <div className="flex items-center gap-2 mb-2">
                  <PiMicrophone className="text-primaryColor" />
                  <h4 className="font-medium text-sm">Voice Quality</h4>
                </div>
                <p className="text-xs text-n300 dark:text-n400">
                  High-quality natural voice synthesis for clear, engaging audio.
                </p>
              </div>
              
              <div className="bg-white dark:bg-n0 p-3 rounded-xl border border-primaryColor/20">
                <div className="flex items-center gap-2 mb-2">
                  <PiClockCountdown className="text-primaryColor" />
                  <h4 className="font-medium text-sm">Time-Saving</h4>
                </div>
                <p className="text-xs text-n300 dark:text-n400">
                  Convert any document or text into audio in seconds.
                </p>
              </div>
              
              <div className="bg-white dark:bg-n0 p-3 rounded-xl border border-primaryColor/20">
                <div className="flex items-center gap-2 mb-2">
                  <PiListChecks className="text-primaryColor" />
                  <h4 className="font-medium text-sm">Comprehensive</h4>
                </div>
                <p className="text-xs text-n300 dark:text-n400">
                  Includes key terms, definitions, and important concepts.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">My Audio Library</h3>
              <button className="text-xs text-primaryColor hover:underline flex items-center gap-1">
                <PiFolder size={12} />
                <span>Manage</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {audioRecaps.map((audio) => (
                <div 
                  key={audio.id} 
                  className="p-3 border border-primaryColor/20 rounded-lg hover:border-primaryColor/40 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm">{audio.title}</h4>
                    <button className="p-1 hover:bg-primaryColor/10 rounded-full">
                      <PiPlay size={14} className="text-primaryColor" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-xs text-n300 dark:text-n400">
                    <span>{audio.date}</span>
                    <span>{audio.duration}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs bg-primaryColor/10 text-primaryColor px-2 py-0.5 rounded-full">
                      {audio.source}
                    </span>
                    <button className="text-xs text-primaryColor hover:underline">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 py-2 border border-primaryColor/30 text-primaryColor rounded-xl hover:bg-primaryColor/5 text-sm">
              View All Recaps
            </button>
          </div>
          
          <div className="bg-primaryColor/5 p-5 rounded-xl border border-primaryColor/20">
            <h3 className="font-medium mb-3">Tips for Better Audio</h3>
            
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <div className="mt-1 min-w-4 h-4 bg-primaryColor rounded-full flex items-center justify-center text-white text-xs">1</div>
                <span>Keep uploaded documents under 10 pages for the best quality and detail.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 min-w-4 h-4 bg-primaryColor rounded-full flex items-center justify-center text-white text-xs">2</div>
                <span>Use the advanced settings to customize your audio experience.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 min-w-4 h-4 bg-primaryColor rounded-full flex items-center justify-center text-white text-xs">3</div>
                <span>For text input, use clear language and organize with headings.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 min-w-4 h-4 bg-primaryColor rounded-full flex items-center justify-center text-white text-xs">4</div>
                <span>Use slower speeds for complex topics to improve retention.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioRecap; 