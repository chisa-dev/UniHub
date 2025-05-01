"use client";
import React, { useState, useEffect } from "react";
import InputFieldSecond from "@/components/ui/InputFieldSecond";
import TextArea from "@/components/ui/TextArea";
import SmallButtons from "@/components/ui/buttons/SmallButtons";
import Alert from "@/components/ui/Alert";
import { topicsService } from "@/app/topics/topicsService";
import ToggleSwitch from "../ui/ToggleSwitch";
import { Topic } from "@/app/topics/topicsService";

interface EditTopicModalProps {
  topic: Topic;
  onClose: () => void;
  onTopicUpdated: () => void;
}

function EditTopicModal({ topic, onClose, onTopicUpdated }: EditTopicModalProps) {
  const [formData, setFormData] = useState({
    title: topic.title,
    description: topic.description,
    isPublic: topic.is_public === 1
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleToggleChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isPublic: checked }));
  };
  
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleUpdateTopic = async () => {
    if (!isClient) return;
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await topicsService.updateTopic(topic.id, formData);
      
      setAlert({
        message: "Topic updated successfully!",
        type: 'success'
      });
      
      // Notify parent component that a topic was updated
      onTopicUpdated();
      
      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error("[LOG edit_topic] ========= Error updating topic:", error);
      setAlert({
        message: error instanceof Error ? error.message : "Failed to update topic",
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Display loading state while the component is being hydrated
  if (!isClient) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-medium mb-4">Edit Topic</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded-xl"></div>
          <div className="h-20 bg-gray-200 rounded-xl"></div>
          <div className="h-8 bg-gray-200 rounded-xl w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      
      <h2 className="text-xl font-medium mb-4">Edit Topic</h2>
      
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <InputFieldSecond
            className="col-span-12"
            placeholder="Enter topic title"
            title="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            error={errors.title}
          />
        </div>
        
        <div className="col-span-12">
          <TextArea
            className="col-span-12"
            placeholder="Enter topic description"
            title="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            error={errors.description}
          />
        </div>
        
        <div className="col-span-12 flex items-center justify-between">
          <span className="text-sm font-medium">Make Topic Public</span>
          <ToggleSwitch 
            isChecked={formData.isPublic}
            onChange={handleToggleChange}
          />
        </div>
      </div>
      
      <div className="flex justify-start items-center gap-2 pt-5 text-xs">
        <SmallButtons 
          name={isLoading ? "Updating..." : "Update Topic"} 
          fn={handleUpdateTopic}
          disabled={isLoading}
        />
        <SmallButtons name="Cancel" secondary={true} fn={onClose} />
      </div>
    </div>
  );
}

export default EditTopicModal; 