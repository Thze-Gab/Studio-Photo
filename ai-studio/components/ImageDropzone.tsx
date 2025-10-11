import React, { useState, useCallback, DragEvent } from 'react';
import { UploadIcon, XIcon, CropIcon } from './IconComponents';

interface ImageDropzoneProps {
  onImageDrop: (file: File) => void;
  imagePreviewUrl?: string | null;
  label: string;
  id: string;
  onClear?: () => void;
  onCropRequest?: () => void;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onImageDrop,
  imagePreviewUrl,
  label,
  id,
  onClear,
  onCropRequest
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragEnter = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onImageDrop(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageDrop(files[0]);
    }
  };
  
  const handleClearClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClear) {
      onClear();
    }
  };

  const handleCropClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCropRequest) {
      onCropRequest();
    }
  };


  return (
    <div className="relative aspect-square w-full">
      <label
        htmlFor={id}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
          ${isDraggingOver ? 'border-cyan-400 bg-cyan-900/30' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400/50'}`}
      >
        {imagePreviewUrl ? (
          <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <UploadIcon className="w-12 h-12 text-slate-600 mb-2" />
            <p className="font-semibold text-slate-300">{label}</p>
            <p className="text-xs text-slate-400">or click to browse</p>
          </div>
        )}
        <input id={id} type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
      </label>
      {imagePreviewUrl && (
        <div className="absolute top-2 right-2 flex items-center gap-x-2">
          {onCropRequest && (
            <button
              onClick={handleCropClick}
              className="bg-slate-950/60 backdrop-blur-md rounded-full p-1.5 text-slate-300 hover:bg-slate-900/80 hover:text-white transition-all"
              aria-label="Crop image"
            >
              <CropIcon className="w-4 h-4" />
            </button>
          )}
          {onClear && (
            <button
              onClick={handleClearClick}
              className="bg-slate-950/60 backdrop-blur-md rounded-full p-1.5 text-slate-300 hover:bg-slate-900/80 hover:text-white transition-all"
              aria-label="Clear image"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};