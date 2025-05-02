import React from 'react';
import { PiX, PiClock, PiWarningCircle } from 'react-icons/pi';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureType: string;
}

const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ isOpen, onClose, featureType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl p-6 relative animate-fade-in">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-n300 dark:text-n400 hover:text-n700 dark:hover:text-white"
        >
          <PiX size={24} />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
            <PiClock className="text-yellow-600 dark:text-yellow-400 text-3xl" />
          </div>
          
          <h3 className="text-xl font-semibold mb-2">Feature Coming Soon</h3>
          <p className="text-n400 dark:text-n300 mb-6">
            {featureType === "audio" 
              ? "Audio explanation generation is not yet available. We're working hard to bring this feature to you soon!"
              : "Video animation generation is not yet available. We're working hard to bring this feature to you soon!"}
          </p>
          
          <div className="bg-primaryColor/10 p-4 rounded-lg w-full mb-6">
            <div className="flex items-start gap-3">
              <PiWarningCircle className="text-primaryColor text-xl flex-shrink-0 mt-0.5" />
              <p className="text-sm text-left text-n500 dark:text-n300">
                Currently, we only support the written note generation. Please select the "Written Note" option to create a summary.
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="py-2 px-6 bg-primaryColor text-white rounded-xl font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonModal; 