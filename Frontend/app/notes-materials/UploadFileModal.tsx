import React, { useState, useRef, ChangeEvent } from 'react';
import { PiX, PiUpload, PiFilePdf, PiFileDoc, PiFileCsv, PiImage } from 'react-icons/pi';
import { uploadMaterial } from './materials.service';
import { TopicProgress } from './statistics.service';

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  topics: TopicProgress[];
  onUploadSuccess: () => void;
}

const UploadFileModal: React.FC<UploadFileModalProps> = ({ 
  isOpen, 
  onClose, 
  topics,
  onUploadSuccess 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleTopicChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedTopicId(e.target.value);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    if (!selectedTopicId) {
      setError('Please select a topic');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Check if user is logged in
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!token) {
        setError('You must be logged in to upload files');
        setIsUploading(false);
        return;
      }
      
      await uploadMaterial(selectedFile, selectedTopicId);
      onUploadSuccess();
      onClose();
    } catch (error) {
      console.error('[LOG upload_modal] ========= Error uploading file:', error);
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = () => {
    const fileType = selectedFile?.type || '';

    if (fileType.includes('pdf')) return <PiFilePdf className="text-errorColor" size={24} />;
    if (fileType.includes('doc')) return <PiFileDoc className="text-primaryColor" size={24} />;
    if (fileType.includes('image')) return <PiImage className="text-secondaryColor" size={24} />;
    if (fileType.includes('csv') || fileType.includes('excel') || fileType.includes('spreadsheet')) 
      return <PiFileCsv className="text-successColor" size={24} />;

    return <PiFilePdf className="text-n300" size={24} />;
  };

  const formatFileSize = (sizeInBytes: number) => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-n0 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload New Material</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-n300/10 rounded-full"
          >
            <PiX size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-errorColor/10 border border-errorColor/20 text-errorColor rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Topic</label>
          <select
            value={selectedTopicId}
            onChange={handleTopicChange}
            className="w-full py-2 px-3 border border-primaryColor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor bg-transparent"
            disabled={isUploading}
          >
            <option value="">Select a topic</option>
            {topics.map(topic => (
              <option key={topic.topicId} value={topic.topicId}>
                {topic.topicTitle}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              selectedFile ? 'border-primaryColor/50 bg-primaryColor/5' : 'border-n300/30 hover:border-primaryColor/30'
            }`}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="mb-2">{getFileIcon()}</div>
                <p className="font-medium mb-1 break-all">{selectedFile.name}</p>
                <p className="text-sm text-n300">{formatFileSize(selectedFile.size)}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="p-3 rounded-full bg-primaryColor/10 mb-2">
                  <PiUpload className="text-primaryColor" size={24} />
                </div>
                <p className="font-medium mb-1">Upload File</p>
                <p className="text-sm text-n300">Click to browse or drag and drop</p>
                <p className="text-xs text-n300 mt-2">Supported formats: PDF, Images, Word, PowerPoint</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
              disabled={isUploading}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="py-2 px-4 border border-primaryColor/30 text-primaryColor rounded-xl hover:bg-primaryColor/5"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="py-2 px-4 bg-primaryColor text-white rounded-xl flex items-center gap-1 disabled:opacity-50"
            disabled={isUploading || !selectedFile || !selectedTopicId}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadFileModal; 