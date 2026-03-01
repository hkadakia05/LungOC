import { useRef, useState } from "react";
import { Upload, X, FileIcon, Scan } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface UploadedFile {
  name: string;
  size: number;
  preview?: string;
}

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  uploadedFile: UploadedFile | null;
  onFileRemove: () => void;
}

export function FileUpload({ onFileUpload, uploadedFile, onFileRemove }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.size > 200 * 1024 * 1024) {
      alert("File size exceeds 200MB limit");
      return;
    }
    
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a JPG, PNG, or JPEG file");
      return;
    }
    
    onFileUpload(file);
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024).toFixed(1) + "KB";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
          <Scan className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-blue-900 text-lg font-semibold">Upload CT Scan</h3>
          <p className="text-blue-500 text-sm">Drag & drop or browse files</p>
        </div>
      </div>
      
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-10 transition-all ${
          isDragging
            ? "border-blue-500 bg-blue-50 scale-[1.02]"
            : "border-blue-200 bg-gradient-to-br from-blue-50/50 to-white hover:border-blue-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-blue-100 rounded-full opacity-50 blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-20 h-20 bg-purple-100 rounded-full opacity-50 blur-xl"></div>
        
        <div className="relative flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-lg">
            <Upload className="w-10 h-10 text-blue-600" />
          </div>
          
          <div>
            <p className="text-blue-900 text-base font-semibold mb-1">Drop your CT scan here</p>
            <p className="text-blue-500 text-sm">or click to browse files</p>
            <p className="text-blue-400 text-xs mt-2">Maximum file size: 200MB • JPG, PNG, JPEG</p>
          </div>
          
          <Button
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md mt-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Browse Files
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png"
          onChange={handleFileSelect}
        />
      </div>

      {/* Uploaded File Display */}
      {uploadedFile && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-5 flex items-center gap-4 border-2 border-green-200 shadow-sm">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            <FileIcon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-blue-900 text-sm font-semibold">File uploaded successfully!</p>
            </div>
            <p className="text-blue-700 text-sm">{uploadedFile.name}</p>
            <p className="text-blue-500 text-xs">{formatFileSize(uploadedFile.size)}</p>
          </div>
          <button
            onClick={onFileRemove}
            className="text-blue-400 hover:text-red-500 transition-colors p-2 hover:bg-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {/* CT Scan Example Image */}
      {!uploadedFile && (
        <div className="mt-4">
          <p className="text-blue-700 text-sm font-medium mb-3">📋 Example CT Scan:</p>
          <div className="relative rounded-xl overflow-hidden border-2 border-blue-200 shadow-sm">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1584555684040-bad07f46a21f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdW5nJTIweHJheSUyMG1lZGljYWwlMjBzY2FufGVufDF8fHx8MTc3MjM5ODIyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Example CT Scan"
              className="w-full h-40 object-cover"
            />
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-blue-700">
              Sample Image
            </div>
          </div>
        </div>
      )}
    </div>
  );
}