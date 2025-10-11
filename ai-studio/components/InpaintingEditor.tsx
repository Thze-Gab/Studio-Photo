import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ImageFile } from '../types';
import { XIcon, WandIcon } from './IconComponents';

interface InpaintingEditorProps {
  isOpen: boolean;
  imageFile: ImageFile | null;
  onClose: () => void;
  onInpaint: (mask: ImageFile, prompt: string) => void;
  isGenerating: boolean;
}

const BrushIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
);

const InpaintingEditor: React.FC<InpaintingEditorProps> = ({
  isOpen,
  imageFile,
  onClose,
  onInpaint,
  isGenerating,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [prompt, setPrompt] = useState('');

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !imageFile) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageFile.previewUrl;
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      
      const maskCanvas = maskCanvasRef.current;
      if (maskCanvas) {
          maskCanvas.width = img.naturalWidth;
          maskCanvas.height = img.naturalHeight;
      }
    };
  }, [imageFile]);

  useEffect(() => {
    if (isOpen) {
      drawImage();
      clearMask();
    }
  }, [isOpen, drawImage]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const maskCtx = maskCanvasRef.current?.getContext('2d');
    maskCtx?.beginPath();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getMousePos(e);

    const maskCtx = maskCanvasRef.current?.getContext('2d');
    if (maskCtx) {
        maskCtx.lineTo(x, y);
        maskCtx.strokeStyle = `rgba(0, 255, 247, 0.7)`; // Semi-transparent cyan
        maskCtx.lineWidth = brushSize;
        maskCtx.lineCap = 'round';
        maskCtx.lineJoin = 'round';
        maskCtx.stroke();
        maskCtx.beginPath();
        maskCtx.moveTo(x, y);
    }
    
    // Also draw on the visible canvas
    const visibleCtx = canvasRef.current?.getContext('2d');
    if(visibleCtx) {
        visibleCtx.lineTo(x, y);
        visibleCtx.strokeStyle = `rgba(0, 255, 247, 0.7)`;
        visibleCtx.lineWidth = brushSize;
        visibleCtx.lineCap = 'round';
        visibleCtx.lineJoin = 'round';
        visibleCtx.stroke();
        visibleCtx.beginPath();
        visibleCtx.moveTo(x,y);
    }
  };
  
  const clearMask = () => {
    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas?.getContext('2d');
    if (maskCanvas && maskCtx) {
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    }
    // Redraw original image on visible canvas
    drawImage();
  };

  const handleRegenerate = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas || !prompt.trim()) {
        alert("Please draw a mask and enter a prompt.");
        return;
    }

    // Create a new canvas to generate the final black and white mask
    const finalMaskCanvas = document.createElement('canvas');
    finalMaskCanvas.width = maskCanvas.width;
    finalMaskCanvas.height = maskCanvas.height;
    const finalMaskCtx = finalMaskCanvas.getContext('2d');
    if (!finalMaskCtx) return;

    // Black background
    finalMaskCtx.fillStyle = 'black';
    finalMaskCtx.fillRect(0, 0, finalMaskCanvas.width, finalMaskCanvas.height);
    
    // Draw the mask in white
    finalMaskCtx.drawImage(maskCanvas, 0, 0);
    finalMaskCtx.globalCompositeOperation = 'source-in';
    finalMaskCtx.fillStyle = 'white';
    finalMaskCtx.fillRect(0, 0, finalMaskCanvas.width, finalMaskCanvas.height);


    const dataUrl = finalMaskCanvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];
    
    const maskFile: ImageFile = {
        base64,
        mimeType: 'image/png',
        previewUrl: dataUrl,
    };
    
    onInpaint(maskFile, prompt);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-slate-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-100">In-painting Editor</h2>
          <button
            onClick={onClose}
            className="bg-white/10 rounded-full p-2 text-slate-300 hover:bg-white/20 hover:text-white"
            aria-label="Close editor"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-grow flex flex-col lg:flex-row gap-4 p-4 overflow-y-auto">
            {/* Canvas */}
            <div className="flex-grow flex items-center justify-center bg-black/30 rounded-lg overflow-auto p-2">
                 <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onMouseMove={draw}
                    className="max-w-full max-h-full object-contain cursor-crosshair"
                />
                <canvas ref={maskCanvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-y-4">
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <label htmlFor="brush-size" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                        <BrushIcon className="w-5 h-5"/>
                        Brush Size: <span className="font-mono text-cyan-300">{brushSize}px</span>
                    </label>
                    <input
                        id="brush-size"
                        type="range"
                        min="5"
                        max="150"
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                </div>
                 <button 
                    onClick={clearMask}
                    className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-white/10 text-slate-200 hover:bg-white/20 transition-all"
                 >
                    Clear Mask
                </button>

                <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex-grow flex flex-col">
                    <label htmlFor="inpaint-prompt" className="block text-sm font-medium text-slate-300 mb-2">
                        Describe your change
                    </label>
                     <textarea
                        id="inpaint-prompt"
                        rows={4}
                        className="flex-grow w-full bg-slate-900/70 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder:text-slate-500"
                        placeholder="e.g., Change to a red dress, add sunglasses..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isGenerating}
                    />
                </div>
                
                <button
                    onClick={handleRegenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full mt-auto inline-flex items-center justify-center gap-x-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-3 text-lg font-semibold text-white shadow-lg hover:opacity-90 transition-all duration-300 disabled:from-slate-700 disabled:to-slate-600 disabled:cursor-not-allowed disabled:text-slate-400 disabled:shadow-none hover:shadow-cyan-400/50"
                >
                    {isGenerating ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Regenerating...
                        </>
                    ) : (
                        <>
                            <WandIcon className="w-6 h-6" />
                            Regenerate
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InpaintingEditor;