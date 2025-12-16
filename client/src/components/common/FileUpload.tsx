import React, { useState, useCallback, useRef } from 'react';
import clsx from 'clsx';
import { FaUpload, FaTimes, FaFileAudio, FaImage } from 'react-icons/fa';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  preview?: string | null; // For image previews
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileChange,
  accept = '*',
  maxSizeMB = 5,
  preview,
  error,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileValidation = useCallback((file: File) => {
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      return `File size exceeds ${maxSizeMB}MB limit.`;
    }
    if (accept !== '*' && !accept.split(',').some(type => file.type.startsWith(type.trim().replace(/\/\*$/, '')))) {
      return `Invalid file type. Accepted types: ${accept}.`;
    }
    return null;
  }, [accept, maxSizeMB]);

  const handleFile = useCallback((file: File) => {
    const validationError = handleFileValidation(file);
    if (validationError) {
      onFileChange(null);
      setSelectedFile(null);
      // You might want to display this error via a toast or prop
      console.error(validationError);
      return;
    }
    setSelectedFile(file);
    onFileChange(file);
  }, [handleFileValidation, onFileChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    onFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = ''; // Clear the input field
    }
  }, [onFileChange]);

  const isImage = selectedFile?.type.startsWith('image/') || (preview && !preview.startsWith('blob:'));
  const isAudio = selectedFile?.type.startsWith('audio/');

  return (
    <div className="space-y-3">
      <div
        className={clsx(
          "glass-card p-6 rounded-lg border-2 border-dashed transition-colors duration-200",
          dragActive ? "border-lime-accent" : "border-white/20",
          error ? "border-red-500" : ""
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          {selectedFile ? (
            <div className="flex items-center gap-3 text-gray-300">
              {isImage && <FaImage className="text-lime-accent" size={24} />}
              {isAudio && <FaFileAudio className="text-lime-accent" size={24} />}
              {!isImage && !isAudio && <FaUpload className="text-lime-accent" size={24} />}
              <span>{selectedFile.name}</span>
              <Button variant="icon" onClick={handleRemoveFile} className="text-red-400 hover:text-red-500">
                <FaTimes />
              </Button>
            </div>
          ) : (
            <>
              <FaUpload className="text-lime-accent text-4xl" />
              <p className="text-gray-300">Drag & drop your file here, or</p>
              <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
                Browse Files
              </Button>
            </>
          )}
        </div>
      </div>

      {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}

      {(preview && !selectedFile) && ( // Show preview if available and no new file selected
        <div className="mt-4">
          <p className="text-gray-400 text-sm mb-2">Current File:</p>
          <img src={preview} alt="File Preview" className="max-w-full h-32 object-contain rounded-md border border-white/10" />
        </div>
      )}

      {selectedFile && isImage && preview && ( // Show preview for newly selected image
        <div className="mt-4">
          <p className="text-gray-400 text-sm mb-2">Preview:</p>
          <img src={URL.createObjectURL(selectedFile)} alt="File Preview" className="max-w-full h-32 object-contain rounded-md border border-white/10" />
        </div>
      )}
    </div>
  );
};

export default FileUpload;