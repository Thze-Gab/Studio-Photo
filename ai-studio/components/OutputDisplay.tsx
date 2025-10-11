import React, { useState } from 'react';
import { GeminiOutput } from '../types';
import { DownloadIcon, SparklesIcon, WandIcon, PaintBrushIcon, UndoIcon, RedoIcon, FaceSwapIcon, CameraRotateIcon, XIcon } from './IconComponents';
import { LoadingIndicator } from './LoadingIndicator';

interface OutputDisplayProps {
  isLoading: boolean;
  output: GeminiOutput | null;
  error: string | null;
  onDownload: () => void;
  onCreateFromOutput: () => void;
  onImageClick: () => void;
  onEdit: () => void;
  onFaceSwap: () => void;
  onGoBack: () => void;
  onGoForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  reperspectivePrompt: string;
  onReperspectivePromptChange: (prompt: string) => void;
  onReperspective: () => void;
  isReperspectiving: boolean;
}

const Placeholder: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-4">
    <div className="bg-white/5 rounded-full p-4 border border-white/10">
        <SparklesIcon className="w-12 h-12 text-cyan-400/50" />
    </div>
    <p className="mt-4 text-lg font-semibold text-slate-300">Your masterpiece awaits</p>
    <p className="mt-1 text-sm text-slate-400">Configure the settings and click generate to see the result here.</p>
  </div>
);


export const OutputDisplay: React.FC<OutputDisplayProps> = ({
  isLoading,
  output,
  error,
  onDownload,
  onCreateFromOutput,
  onImageClick,
  onEdit,
  onFaceSwap,
  onGoBack,
  onGoForward,
  canGoBack,
  canGoForward,
  reperspectivePrompt,
  onReperspectivePromptChange,
  onReperspective,
  isReperspectiving,
}) => {
  const [isReperspectiveOpen, setIsReperspectiveOpen] = useState(false);

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 aspect-[4/5] sm:aspect-square w-full rounded-2xl shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
      {isLoading ? (
        <LoadingIndicator />
      ) : error ? (
        <div className="p-8 text-center">
          <h3 className="text-lg font-semibold text-red-400">An Error Occurred</h3>
          <p className="mt-2 text-sm text-red-300 bg-red-900/50 p-3 rounded-lg border border-red-800">{error}</p>
        </div>
      ) : output?.imageUrl ? (
        <>
          <img
            src={output.imageUrl}
            alt="Generated studio"
            className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
            onClick={onImageClick}
            title="Click to view larger"
          />
           {isReperspectiveOpen && (
            <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-md p-3 border-t border-white/10 flex flex-col gap-2 animate-slide-up">
              <div className="flex justify-between items-center">
                <label htmlFor="reperspective-prompt" className="text-sm font-semibold text-slate-200">
                  Scene Manipulation
                </label>
                 <button onClick={() => setIsReperspectiveOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                    <XIcon className="w-4 h-4" />
                </button>
              </div>
              <textarea
                id="reperspective-prompt"
                value={reperspectivePrompt}
                onChange={(e) => onReperspectivePromptChange(e.target.value)}
                placeholder="e.g., Recreate this scene from a low angle, looking up."
                rows={3}
                className="w-full bg-slate-900/70 border-slate-700 rounded-lg shadow-sm p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500 text-slate-200"
                disabled={isReperspectiving}
              />
              <button
                onClick={onReperspective}
                disabled={isReperspectiving || !reperspectivePrompt.trim()}
                className="w-full inline-flex items-center justify-center gap-x-2 rounded-md bg-gradient-to-r from-violet-600 to-cyan-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:from-slate-700 disabled:to-slate-600 disabled:cursor-not-allowed"
              >
                {isReperspectiving ? 'Generating...' : 'Regenerate'}
              </button>
            </div>
           )}

          <div className="absolute bottom-4 right-4 flex items-center gap-x-2">
            {canGoBack && (
                <button
                    onClick={onGoBack}
                    title="Go back to previous image (Undo)"
                    className="inline-flex items-center justify-center rounded-full bg-slate-950/60 backdrop-blur-md p-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-900/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 transition-all hover:scale-105"
                >
                    <UndoIcon className="w-5 h-5" />
                </button>
            )}
            {canGoForward && (
                <button
                    onClick={onGoForward}
                    title="Go forward to next image (Redo)"
                    className="inline-flex items-center justify-center rounded-full bg-slate-950/60 backdrop-blur-md p-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-900/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 transition-all hover:scale-105"
                >
                    <RedoIcon className="w-5 h-5" />
                </button>
            )}
            <button
                onClick={() => setIsReperspectiveOpen(prev => !prev)}
                title="Change scene perspective"
                className="inline-flex items-center gap-x-2 rounded-full bg-slate-950/60 backdrop-blur-md pl-3 pr-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-900/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 transition-all hover:scale-105"
            >
                <CameraRotateIcon className="w-5 h-5" />
                Reperspective
            </button>
            <button
                onClick={onFaceSwap}
                title="Swap face with a reference image"
                className="inline-flex items-center gap-x-2 rounded-full bg-slate-950/60 backdrop-blur-md pl-3 pr-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-900/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 transition-all hover:scale-105"
            >
                <FaceSwapIcon className="w-5 h-5" />
                Swap Face
            </button>
             <button
              onClick={onEdit}
              title="Edit image with In-painting"
              className="inline-flex items-center gap-x-2 rounded-full bg-slate-950/60 backdrop-blur-md pl-3 pr-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-900/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 transition-all hover:scale-105"
            >
              <PaintBrushIcon className="w-5 h-5" />
              Edit
            </button>
             <button
              onClick={onCreateFromOutput}
              title="Use this image as the next subject"
              className="inline-flex items-center gap-x-2 rounded-full bg-slate-950/60 backdrop-blur-md pl-3 pr-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-900/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 transition-all hover:scale-105"
            >
              <WandIcon className="w-5 h-5" />
              Use
            </button>
            <button
              onClick={onDownload}
              className="inline-flex items-center gap-x-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 transition-all hover:scale-105 hover:shadow-cyan-400/50"
            >
              <DownloadIcon className="w-5 h-5" />
            </button>
          </div>
        </>
      ) : (
        <Placeholder />
      )}
    </div>
  );
};