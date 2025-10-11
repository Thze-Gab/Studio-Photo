import React from 'react';
import { ControlsProps } from '../Controls';
import { SubjectMode } from '../../types';
import { ImageDropzone } from '../ImageDropzone';
import { SparklesIcon } from '../IconComponents';

const Spinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const Switch: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-950 ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        } ${
            checked ? 'bg-cyan-500' : 'bg-slate-700'
        }`}
        disabled={disabled}
    >
        <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                checked ? 'translate-x-5' : 'translate-x-0'
            }`}
        />
    </button>
);

const SubjectControls: React.FC<ControlsProps> = (props) => {
    const formElementClasses = "mt-1 block w-full bg-slate-900/70 border-slate-700 rounded-lg shadow-sm p-3 focus:ring-cyan-500 focus:border-cyan-500 text-slate-200 placeholder:text-slate-500 transition disabled:opacity-50 disabled:cursor-not-allowed";
    const labelClasses = "block text-sm font-medium text-slate-300";

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <div className="flex space-x-2">
                    {(['single', 'multiple'] as SubjectMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => props.onSubjectModeChange(mode)}
                            className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                                props.subjectMode === mode
                                ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg'
                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                            }`}
                        >
                            {mode === 'single' ? 'Single Subject' : 'Multiple Subjects'}
                        </button>
                    ))}
                </div>
            </div>

            {props.subjectMode === 'single' ? (
                <div className="space-y-4 animate-fade-in pt-4 border-t border-white/10">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ImageDropzone
                            id="source-image"
                            label="Subject Photo"
                            onImageDrop={props.onSourceImageChange}
                            imagePreviewUrl={props.sourceImage?.previewUrl}
                            onClear={() => props.onSourceImageChange(null)}
                            onCropRequest={props.onCropSourceImage}
                        />
                         <ImageDropzone
                            id="face-reference-image"
                            label="Face Reference (Optional)"
                            onImageDrop={props.onFaceReferenceImageChange}
                            imagePreviewUrl={props.faceReferenceImage?.previewUrl}
                            onClear={() => props.onFaceReferenceImageChange(null)}
                            onCropRequest={props.onCropFaceReferenceImage}
                        />
                    </div>
                </div>
            ) : (
                 <div className="space-y-4 animate-fade-in pt-4 border-t border-white/10">
                     <ImageDropzone
                        id="multiple-subjects-image"
                        label="Multiple Subjects Photo"
                        onImageDrop={props.onMultipleSubjectsImageChange}
                        imagePreviewUrl={props.multipleSubjectsImage?.previewUrl}
                        onClear={() => props.onMultipleSubjectsImageChange(null)}
                        onCropRequest={props.onCropMultipleSubjectsImage}
                    />
                </div>
            )}
            
            <div>
                <div className="flex justify-between items-center">
                    <label htmlFor="subject-prompt" className={labelClasses}>
                        Subject / Scene Description
                    </label>
                    <button
                        type="button"
                        onClick={props.onRequestDescription}
                        disabled={!props.sourceImage && !props.multipleSubjectsImage || props.isDescribeLoading}
                        className="inline-flex items-center gap-x-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-slate-200 shadow-sm hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Generate description from photo"
                    >
                        <SparklesIcon className="w-4 h-4 text-cyan-300" />
                        {props.isDescribeLoading ? 'Analyzing...' : 'Auto-describe'}
                    </button>
                </div>
                <textarea
                    id="subject-prompt"
                    rows={3}
                    className={formElementClasses}
                    placeholder={props.isDescribeLoading ? "Analyzing image..." : "Type a description or click 'Auto-describe'"}
                    value={props.subjectPrompt}
                    onChange={(e) => props.onSubjectPromptChange(e.target.value)}
                    disabled={props.isDescribeLoading}
                />
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-x-3">
                        <span className="text-sm font-medium text-slate-200">Art Style Action</span>
                         {props.isActionAnalysisLoading && <Spinner/>}
                    </div>
                   <Switch 
                        checked={props.useArtReferenceActionForSubject} 
                        onChange={props.onUseArtReferenceActionForSubjectChange} 
                        disabled={!props.artReferenceImage || props.isActionAnalysisLoading} 
                    />
                </div>
                 <p className="text-xs text-slate-400 mt-2">
                    Replaces the subject's prompt with a detailed action from the Art Style image.
                </p>
            </div>
        </div>
    );
};

export default SubjectControls;
