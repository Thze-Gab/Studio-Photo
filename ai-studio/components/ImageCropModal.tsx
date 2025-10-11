import React, { useState, useRef, useEffect, useCallback } from 'react';
import { XIcon } from './IconComponents';

interface ImageCropModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
  onConfirm: (croppedDataUrl: string) => void;
}

type ResizeHandle = 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'move';

// Helper component for corner resize handles
const CornerHandle: React.FC<{
    position: string;
    onDragStart: (e: React.MouseEvent | React.TouchEvent) => void;
}> = ({ position, onDragStart }) => (
    <div
        className={`absolute w-5 h-5 -m-2.5 z-20 ${position}`}
        style={{ touchAction: 'none' }}
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
    >
        <div className="w-full h-full bg-violet-500 rounded-full border-2 border-slate-950 ring-1 ring-white/75 hover:scale-125 transition-transform" />
    </div>
);

// Helper component for side resize handles
const SideHandle: React.FC<{
    position: string;
    onDragStart: (e: React.MouseEvent | React.TouchEvent) => void;
}> = ({ position, onDragStart }) => (
     <div
        className={`absolute z-20 ${position}`}
        style={{ touchAction: 'none' }}
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
    >
        <div className="w-full h-full bg-violet-500 rounded-md border-2 border-slate-950 ring-1 ring-white/75 hover:scale-125 transition-transform" />
    </div>
);


const ImageCropModal: React.FC<ImageCropModalProps> = ({ isOpen, imageUrl, onClose, onConfirm }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 }); // In percentage
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 });

  const getClientPos = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, handle: ResizeHandle) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveHandle(handle);
    const pos = getClientPos(e);
    setDragStart({ x: pos.x, y: pos.y, cropX: crop.x, cropY: crop.y, cropW: crop.width, cropH: crop.height });
  };

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!activeHandle || !imageRef.current) return;
    
    e.preventDefault();
    const pos = getClientPos(e);
    const { width: imgWidth, height: imgHeight } = imageRef.current.getBoundingClientRect();
    
    const dx = (pos.x - dragStart.x) / imgWidth;
    const dy = (pos.y - dragStart.y) / imgHeight;
    
    let { cropX, cropY, cropW, cropH } = dragStart;
    
    let newX = cropX;
    let newY = cropY;
    let newW = cropW;
    let newH = cropH;

    const minSize = 0.1; // 10% minimum crop size

    if (activeHandle.includes('left')) {
        const cappedDx = Math.min(dx, cropW - minSize);
        newX = cropX + cappedDx;
        newW = cropW - cappedDx;
    }
    if (activeHandle.includes('right')) {
        const cappedDx = Math.max(dx, -(cropW - minSize));
        newW = cropW + cappedDx;
    }
    if (activeHandle.includes('top')) {
        const cappedDy = Math.min(dy, cropH - minSize);
        newY = cropY + cappedDy;
        newH = cropH - cappedDy;
    }
    if (activeHandle.includes('bottom')) {
        const cappedDy = Math.max(dy, -(cropH - minSize));
        newH = cropH + cappedDy;
    }
    if (activeHandle === 'move') {
        newX = cropX + dx;
        newY = cropY + dy;
    }

    // Boundary checks
    if (newX < 0) { newX = 0; }
    if (newY < 0) { newY = 0; }
    if (newX + newW > 1) { newX = 1 - newW; }
    if (newY + newH > 1) { newY = 1 - newH; }

    setCrop({ x: newX, y: newY, width: newW, height: newH });
  }, [activeHandle, dragStart]);


  const handleDragEnd = useCallback(() => {
    setActiveHandle(null);
  }, []);

  useEffect(() => {
    const options = { passive: false };
    if (isOpen && activeHandle) {
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchmove', handleDragMove, options);
        window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove, options as EventListenerOptions);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isOpen, activeHandle, handleDragMove, handleDragEnd]);
  
  const handleConfirm = () => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas) return;
    
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const pixelCrop = {
        x: crop.x * image.width * scaleX,
        y: crop.y * image.height * scaleY,
        width: crop.width * image.width * scaleX,
        height: crop.height * image.height * scaleY,
    };

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );
        onConfirm(canvas.toDataURL('image/png'));
    }
  };

  useEffect(() => {
    if(isOpen) {
        // Reset crop on open
        setCrop({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
    }
  }, [isOpen]);

  if (!isOpen || !imageUrl) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10">
        <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-100">Crop Image</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><XIcon className="w-6 h-6" /></button>
        </div>

        <div className="flex-grow p-4 flex items-center justify-center overflow-hidden">
          <div className="relative select-none" style={{ touchAction: 'none' }}>
            <img ref={imageRef} src={imageUrl} alt="Crop preview" className="max-w-full max-h-[70vh] object-contain" />
            <div 
                className="absolute top-0 left-0 w-full h-full cursor-move"
                onMouseDown={(e) => handleDragStart(e, 'move')}
                onTouchStart={(e) => handleDragStart(e, 'move')}
            >
              <div 
                className="absolute border-2 border-white/50"
                style={{
                  left: `${crop.x * 100}%`,
                  top: `${crop.y * 100}%`,
                  width: `${crop.width * 100}%`,
                  height: `${crop.height * 100}%`,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
                }}
              >
                {/* Rule of thirds grid */}
                <div className="absolute top-0 left-1/3 w-px h-full bg-white/30"></div>
                <div className="absolute top-0 left-2/3 w-px h-full bg-white/30"></div>
                <div className="absolute top-1/3 left-0 w-full h-px bg-white/30"></div>
                <div className="absolute top-2/3 left-0 w-full h-px bg-white/30"></div>

                {/* Resize Handles */}
                <CornerHandle position="top-0 left-0 cursor-nwse-resize" onDragStart={(e) => handleDragStart(e, 'top-left')} />
                <CornerHandle position="top-0 right-0 cursor-nesw-resize" onDragStart={(e) => handleDragStart(e, 'top-right')} />
                <CornerHandle position="bottom-0 left-0 cursor-nesw-resize" onDragStart={(e) => handleDragStart(e, 'bottom-left')} />
                <CornerHandle position="bottom-0 right-0 cursor-nwse-resize" onDragStart={(e) => handleDragStart(e, 'bottom-right')} />

                <SideHandle position="top-[-4px] left-1/2 -translate-x-1/2 w-10 h-2 cursor-ns-resize" onDragStart={(e) => handleDragStart(e, 'top')} />
                <SideHandle position="bottom-[-4px] left-1/2 -translate-x-1/2 w-10 h-2 cursor-ns-resize" onDragStart={(e) => handleDragStart(e, 'bottom')} />
                <SideHandle position="top-1/2 left-[-4px] -translate-y-1/2 w-2 h-10 cursor-ew-resize" onDragStart={(e) => handleDragStart(e, 'left')} />
                <SideHandle position="top-1/2 right-[-4px] -translate-y-1/2 w-2 h-10 cursor-ew-resize" onDragStart={(e) => handleDragStart(e, 'right')} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 p-4 border-t border-white/10 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg bg-white/10 text-slate-200 hover:bg-white/20 transition-all">Cancel</button>
          <button onClick={handleConfirm} className="px-6 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:opacity-90 transition-all">Confirm</button>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageCropModal;