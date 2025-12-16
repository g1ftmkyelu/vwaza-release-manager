import { useState, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface UseFileUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;

}

const useFileUpload = (options?: UseFileUploadOptions) => {
  const [isUploading, setIsUploading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File, endpoint: string, fieldName: string = 'file') => {
    setIsUploading(true);

    setError(null);
    setFileUrl(null);

    const formData = new FormData();
    formData.append(fieldName, file);

    try {
      const response = await api.post<{ url: string }>(endpoint, formData);
      setFileUrl(response.data.url);
      options?.onSuccess?.(response.data.url);
      toast.success('File uploaded successfully!');
      return response.data.url;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'File upload failed.';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [options]);

  return {
    uploadFile,
    isUploading,
    error,
    fileUrl,
  };
};

export default useFileUpload;