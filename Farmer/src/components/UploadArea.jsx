import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, Camera } from 'lucide-react';
import { Button } from './ui/button';

export function UploadArea({ onFileSelect }) {
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      onFileSelect(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 hover:border-[#8FA31E] hover:scale-105"
        style={{ 
          borderColor: '#C6D870',
          backgroundColor: '#E1E9C9'
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center space-y-6">
          <div className="flex space-x-4">
            <div className="p-4 rounded-full" style={{ backgroundColor: '#CADCAE' }}>
              <Upload className="w-8 h-8 text-[#8FA31E]" />
            </div>
            <div className="p-4 rounded-full" style={{ backgroundColor: '#CADCAE' }}>
              <ImageIcon className="w-8 h-8 text-[#8FA31E]" />
            </div>
            <div className="p-4 rounded-full" style={{ backgroundColor: '#CADCAE' }}>
              <Camera className="w-8 h-8 text-[#8FA31E]" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl text-[#8FA31E]">Upload Plant Leaf Image</h3>
            <p className="text-gray-600">
              Drag and drop your image here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG, and other image formats
            </p>
          </div>
          
          <Button 
            className="px-8 py-3 rounded-full transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: '#8FA31E',
              color: 'white'
            }}
          >
            Choose File
          </Button>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 rounded-xl" style={{ backgroundColor: '#E1E9C9' }}>
          <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C6D870' }}>
            <span className="text-[#8FA31E]">1</span>
          </div>
          <h4 className="text-[#8FA31E] mb-2">Upload Image</h4>
          <p className="text-sm text-gray-600">Take a clear photo of the affected leaf</p>
        </div>
        
        <div className="text-center p-6 rounded-xl" style={{ backgroundColor: '#E1E9C9' }}>
          <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C6D870' }}>
            <span className="text-[#8FA31E]">2</span>
          </div>
          <h4 className="text-[#8FA31E] mb-2">AI Analysis</h4>
          <p className="text-sm text-gray-600">Our system analyzes the image for diseases</p>
        </div>
        
        <div className="text-center p-6 rounded-xl" style={{ backgroundColor: '#E1E9C9' }}>
          <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C6D870' }}>
            <span className="text-[#8FA31E]">3</span>
          </div>
          <h4 className="text-[#8FA31E] mb-2">Get Results</h4>
          <p className="text-sm text-gray-600">Receive diagnosis and treatment advice</p>
        </div>
      </div>
    </div>
  );
}
