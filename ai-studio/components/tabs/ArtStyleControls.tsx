import React from 'react';
import { ControlsProps } from '../Controls';
import { ImageDropzone } from '../ImageDropzone';
import { effectsCategories } from '../../effects';

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

const ArtStyleControls: React.FC<ControlsProps> = (props) => {
    const formElementClasses = "mt-1 block w-full bg-slate-900/70 border-slate-700 rounded-lg shadow-sm p-3 focus:ring-cyan-500 focus:border-cyan-500 text-slate-200 placeholder:text-slate-500 transition disabled:opacity-50 disabled:cursor-not-allowed";
    const labelClasses = "block text-sm font-medium text-slate-300";

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
                <h3 className="text-lg font-semibold text-cyan-300">Art Style Reference</h3>
                <div className="grid grid-cols-2 gap-4">
                    <ImageDropzone
                        id="art-reference-image"
                        label="Art Style Reference"
                        onImageDrop={(file) => props.onArtReferenceImageChange(file)}
                        imagePreviewUrl={props.artReferenceImage?.previewUrl}
                        onClear={() => props.onArtReferenceImageChange(null)}
                        onCropRequest={props.onCropArtReferenceImage}
                    />
                    <div className="flex flex-col gap-y-2">
                        <label htmlFor="art-reference-prompt" className={labelClasses}>
                            Style Description
                        </label>
                        <textarea
                            id="art-reference-prompt"
                            rows={4}
                            className={`${formElementClasses} flex-grow`}
                            placeholder={props.isArtDescribeLoading ? "Analyzing style..." : "e.g., vibrant oil painting..."}
                            value={props.artReferencePrompt}
                            onChange={(e) => props.onArtReferencePromptChange(e.target.value)}
                            disabled={props.isArtDescribeLoading}
                        />
                    </div>
                </div>
                 {props.artReferenceImage && (
                    <div>
                    <label htmlFor="integration-analysis" className={labelClasses}>
                        Execution Plan
                    </label>
                    <textarea
                        id="integration-analysis"
                        rows={4}
                        className={formElementClasses}
                        placeholder={props.isIntegrationAnalysisLoading ? "AI is planning the execution..." : "The AI's plan will appear here. You can edit it."}
                        value={props.integrationAnalysis}
                        onChange={(e) => props.onIntegrationAnalysisChange(e.target.value)}
                        disabled={props.isIntegrationAnalysisLoading}
                    />
                    </div>
                )}
                <div className="space-y-4 pt-2">
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Subject Influence: <span className="font-mono text-cyan-300">{props.subjectInfluence}%</span></label>
                        <input 
                            type="range" min="0" max="100" 
                            value={props.subjectInfluence}
                            onChange={(e) => props.onSubjectInfluenceChange(Number(e.target.value))}
                            style={{'--value': props.subjectInfluence} as React.CSSProperties}
                            disabled={!props.artReferenceImage}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Art Style Influence: <span className="font-mono text-cyan-300">{props.artStyleInfluence}%</span></label>
                        <input 
                            type="range" min="0" max="100" 
                            value={props.artStyleInfluence}
                            onChange={(e) => props.onArtStyleInfluenceChange(Number(e.target.value))}
                            style={{'--value': props.artStyleInfluence} as React.CSSProperties}
                            disabled={!props.artReferenceImage}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Creative Surprise: <span className="font-mono text-cyan-300">{props.surprise}%</span></label>
                        <input 
                            type="range" min="0" max="100" 
                            value={props.surprise}
                            onChange={(e) => props.onSurpriseChange(Number(e.target.value))}
                            style={{'--value': props.surprise} as React.CSSProperties}
                            disabled={!props.artReferenceImage}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-white/10">
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-200">Skin & Highlight Match</span>
                                <Switch checked={props.useArtReferenceSkin} onChange={props.onUseArtReferenceSkinChange} disabled={!props.artReferenceImage} />
                            </div>
                            <p className="text-xs text-slate-400 -mt-1">Automatically match the skin texture and highlights from the reference image.</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-x-2">
                              <span className="text-sm font-medium text-slate-200">Match Lighting</span>
                              {props.isLightingAnalysisLoading && <Spinner />}
                            </div>
                            <Switch checked={props.useArtReferenceLighting} onChange={props.onUseArtReferenceLightingChange} disabled={!props.artReferenceImage || props.isLightingAnalysisLoading} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cyan-300">
                    Additional Style Effects
                </h3>
                <div className="pt-2 space-y-4">
                    {props.selectedEffectsByCategory["📢 Graphic Design"] === "Flyer Design" && (
                        <div className="my-4 p-4 rounded-lg border border-violet-800 bg-violet-900/20">
                            <label htmlFor="flyer-text" className="block text-sm font-medium text-violet-300">Flyer Text</label>
                            <textarea id="flyer-text" rows={3}
                                className={formElementClasses}
                                placeholder="Enter text to include in the flyer"
                                value={props.flyerText}
                                onChange={(e) => props.onFlyerTextChange(e.target.value)}
                            />
                        </div>
                    )}
                     {props.selectedEffectsByCategory["📢 Graphic Design"] === "Thumbnail Design" && (
                        <div className="my-4 p-4 rounded-lg border border-violet-800 bg-violet-900/20">
                            <label htmlFor="thumbnail-text" className="block text-sm font-medium text-violet-300">Thumbnail Text</label>
                            <textarea id="thumbnail-text" rows={3}
                                className={formElementClasses}
                                placeholder="Enter text for the thumbnail"
                                value={props.thumbnailText}
                                onChange={(e) => props.onThumbnailTextChange(e.target.value)}
                            />
                        </div>
                    )}

                    {effectsCategories.map((category) => (
                        <div key={category.name}>
                            <label htmlFor={`effect-category-${category.name}`} className="block text-sm font-medium text-slate-300 mb-1">{category.name}:</label>
                            <select 
                              id={`effect-category-${category.name}`}
                              value={props.selectedEffectsByCategory[category.name] || 'None'}
                              onChange={(e) => props.onSelectedEffectChange(category.name, e.target.value)}
                              className={formElementClasses}
                            >
                                <option value="None">None</option>
                                {category.effects.map(effect => (
                                    <option key={effect} value={effect}>{effect}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ArtStyleControls;
