import { useDropzone } from "react-dropzone";
import { useCallback, useState, useEffect } from "react";
import { uploadApi } from "../../../services/api";

interface DropzoneComponentProps {
  onImageUpload?: (imageUrl: string, file?: File) => void;
  value?: string;
  onChange?: (value: string) => void;
  multiple?: boolean;
}

const DropzoneComponent = ({ onImageUpload, value, onChange, multiple = false }: DropzoneComponentProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [complete, setComplete] = useState<boolean[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const result = await uploadApi.uploadImage(file);
      return result.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      // Fallback to base64 if upload fails
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const onDrop = useCallback(async (accepted: File[]) => {
    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      
      for (const file of accepted) {
        const imageUrl = await uploadImage(file);
        uploadedUrls.push(imageUrl);
        if (onImageUpload) {
          onImageUpload(imageUrl, file);
        }
      }

      setFiles(accepted);
      setPreviews(accepted.map(file => URL.createObjectURL(file)));
      setComplete(Array(accepted.length).fill(false));

      // Update form with the first image URL (or all if multiple is true)
      if (uploadedUrls.length > 0) {
        const imageUrl = multiple ? uploadedUrls.join(',') : uploadedUrls[0];
        if (onChange) {
          onChange(imageUrl);
        }
      }

      setTimeout(() => {
        setComplete(Array(accepted.length).fill(true));
      }, 1200);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  }, [onImageUpload, onChange, multiple]);

  useEffect(() => {
    return () => previews.forEach(url => URL.revokeObjectURL(url));
  }, [previews]);

  // Clear dropzone when value becomes empty
  useEffect(() => {
    if (!value && files.length > 0) {
      setFiles([]);
      setPreviews([]);
      setComplete([]);
    }
  }, [value, files.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept: { "image/*": [] },
  });

  return (
    <div className="p-6 border-dashed border rounded-xl">
      {/* Show preview from value if no files are selected */}
      {value && files.length === 0 && (
        <div className="mb-4 flex flex-col items-center">
          <img src={value} alt="Current logo" className="h-24 object-cover rounded mb-1" />
          <p className="text-xs text-gray-500 break-all">Current logo</p>
        </div>
      )}
      <div {...getRootProps()} className="cursor-pointer p-10 bg-gray-100 rounded-xl text-center">
        <input {...getInputProps()} />
        <p>{isDragActive ? "📥 Drop now!" : "📁 Drag and drop or click to upload"}</p>
        {isUploading && <p className="text-sm text-blue-600 mt-2">Uploading...</p>}
      </div>
      {files.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.map((file, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-2 rounded shadow">
              <img src={previews[idx]} alt="preview" className="h-24 object-cover rounded mb-1" />
              <p className="text-xs truncate">{file.name}</p>
              <div className="w-full bg-gray-200 h-1.5 rounded-full">
                <div className={`h-1.5 rounded-full transition-all duration-700 ${complete[idx] ? "w-full bg-green-500" : "w-2/5 bg-yellow-400"}`} />
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Show value as text if not already shown as image */}
      {value && files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Current image URL:</p>
          <p className="text-xs text-gray-500 break-all">{value}</p>
        </div>
      )}
    </div>
  );
};

export default DropzoneComponent;