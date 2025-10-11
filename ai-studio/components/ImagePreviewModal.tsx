import React from 'react';
import { XIcon } from './IconComponents';

interface ImagePreviewModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen || !imageUrl) {
    return null;
  }

  // Handle keyboard events for accessibility
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full transform transition-transform duration-300 ease-in-out scale-95"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image container
        style={isOpen ? { transform: 'scale(1)', opacity: 1 } : { transform: 'scale(0.95)', opacity: 0 }}
      >
        <img src={imageUrl} alt="Generated image preview" className="object-contain w-full h-full max-h-[90vh] rounded-lg shadow-2xl" />
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-slate-800 rounded-full p-2 text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 border border-white/10"
          aria-label="Close image preview"
        >
          <XIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ImagePreviewModal;