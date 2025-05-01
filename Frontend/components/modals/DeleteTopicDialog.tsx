"use client";
import React, { useState, useEffect } from "react";
import SmallButtons from "@/components/ui/buttons/SmallButtons";
import Alert from "@/components/ui/Alert";
import { topicsService } from "@/app/topics/topicsService";

interface DeleteTopicDialogProps {
  topicId: string;
  topicTitle: string;
  onClose: () => void;
  onDelete: () => void;
}

function DeleteTopicDialog({ 
  topicId, 
  topicTitle, 
  onClose, 
  onDelete 
}: DeleteTopicDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleDeleteTopic = async () => {
    if (!isClient) return;
    setIsLoading(true);
    
    try {
      await topicsService.deleteTopic(topicId);
      
      setAlert({
        message: "Topic deleted successfully!",
        type: 'success'
      });
      
      // Notify parent component
      onDelete();
      
      // Close the dialog after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error("[LOG delete_topic] ========= Error deleting topic:", error);
      setAlert({
        message: error instanceof Error ? error.message : "Failed to delete topic",
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Display a loading state while the component is being hydrated
  if (!isClient) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-medium mb-3">Delete Topic</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-5 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      
      <h2 className="text-lg font-medium mb-3">Delete Topic</h2>
      
      <p className="mb-6">
        Are you sure you want to delete the topic &quot;{topicTitle}&quot;? This action cannot be undone.
      </p>
      
      <div className="flex justify-end items-center gap-2 text-xs">
        <SmallButtons 
          name="Cancel" 
          secondary={true} 
          fn={onClose} 
        />
        <SmallButtons 
          name={isLoading ? "Deleting..." : "Delete"} 
          fn={handleDeleteTopic}
          disabled={isLoading}
          className="bg-errorColor hover:bg-errorColor/80"
        />
      </div>
    </div>
  );
}

export default DeleteTopicDialog; 