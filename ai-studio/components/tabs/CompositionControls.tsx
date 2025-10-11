import React from 'react';
import { ControlsProps } from '../Controls';
import { ImageDropzone } from '../ImageDropzone';
import { BackgroundMode } from '../../types';

const CompositionControls: React.FC<ControlsProps> = (props) => {
    const formElementClasses = "mt-1 block w-full bg-slate-900/70 border-slate-700 rounded-lg shadow-sm p-3 focus:ring-cyan-500 focus:border-cyan-500 text-slate-200 placeholder:text-slate-500 transition disabled:opacity-50 disabled:cursor-not-allowed";
    const labelClasses = "block text-sm font-medium text-slate-300";

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h3 className="text-lg font-semibold text-cyan-300">Outfit & Objects</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <ImageDropzone
                        id="dress-image"
                        label="Outfit Photo (Optional)"
                        onImageDrop={(file) => props.onDressImageChange(file)}
                        imagePreviewUrl={props.dressImage?.previewUrl}
                        onClear={() => props.onDressImageChange(null)}
                        onCropRequest={props.onCropDressImage}
                    />
                     <ImageDropzone
                        id="object-image"
                        label="Object Photo (Optional)"
                        onImageDrop={(file) => props.onObjectImageChange(file)}
                        imagePreviewUrl={props.objectImage?.previewUrl}
                        onClear={() => props.onObjectImageChange(null)}
                        onCropRequest={props.onCropObjectImage}
                    />
                </div>
                 <div className="mt-4">
                    <label htmlFor="dress-prompt" className={labelClasses}>
                        Outfit Description
                    </label>
                    <textarea
                        id="dress-prompt"
                        rows={3}
                        className={formElementClasses}
                        placeholder="e.g., A stylish red dress, change to leather jacket..."
                        value={props.dressPrompt}
                        onChange={(e) => props.onDressPromptChange(e.target.value)}
                    />
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-cyan-300">Background</h3>
                <div className="flex space-x-2 my-4">
                    {(['describe', 'upload', 'random'] as BackgroundMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => props.onBackgroundModeChange(mode)}
                            className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                                props.backgroundMode === mode
                                ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg'
                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                            }`}
                        >
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </button>
                    ))}
                </div>
                {props.backgroundMode === 'upload' && (
                    <ImageDropzone
                        id="background-image"
                        label="Background Photo"
                        onImageDrop={(file) => props.onBackgroundImageChange(file)}
                        imagePreviewUrl={props.backgroundImage?.previewUrl}
                        onClear={() => props.onBackgroundImageChange(null)}
                        onCropRequest={props.onCropBackgroundImage}
                    />
                )}
                <div className={props.backgroundMode === 'describe' ? 'mt-0' : 'mt-4'}>
                    <label htmlFor="background-prompt" className={labelClasses}>
                    Background Description
                    </label>
                    <textarea
                        id="background-prompt"
                        rows={3}
                        className={formElementClasses}
                        placeholder={props.backgroundMode === 'random' ? "A random background will be generated" : "e.g., A professional photo studio with soft lighting..."}
                        value={props.backgroundPrompt}
                        onChange={(e) => props.onBackgroundPromptChange(e.target.value)}
                        disabled={props.backgroundMode === 'random'}
                    />
                </div>
            </div>
        </div>
    );
};

export default CompositionControls;
