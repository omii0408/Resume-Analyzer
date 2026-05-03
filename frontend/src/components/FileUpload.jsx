import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

const FileUpload = ({ file, setFile }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (newFile) => {
    if (
      newFile.type === 'application/pdf' ||
      newFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      setFile(newFile);
    } else {
      alert('Only PDF and DOCX files are allowed.');
    }
  };

  const removeFile = () => {
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Upload Resume (PDF or DOCX)
      </label>
      
      {!file ? (
        <div className="relative group">
          <div className={`absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl blur transition-opacity duration-500 ${isDragActive ? 'opacity-60' : 'opacity-0 group-hover:opacity-30'}`}></div>
          <div
            className={`relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
              isDragActive 
                ? 'border-primary-400 bg-primary-500/10 dark:bg-primary-500/20 scale-[1.02]' 
                : 'border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:border-primary-400/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleChange}
            />
            
            <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${isDragActive ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50 animate-bounce' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 group-hover:text-primary-500'}`}>
              <UploadCloud className="w-8 h-8" />
            </div>
            
            <p className="text-base text-gray-700 dark:text-gray-300 text-center font-medium">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 font-bold">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">PDF or DOCX (up to 5MB)</p>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative flex items-center justify-between p-5 border border-green-500/30 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center space-x-4 overflow-hidden">
              <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shrink-0 shadow-inner">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors text-gray-500"
              title="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
