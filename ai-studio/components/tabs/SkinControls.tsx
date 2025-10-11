import React from 'react';
import { ControlsProps } from '../Controls';
import { skinTextureDescriptions, skinHighlightDescriptions } from '../../skinDescriptions';
import { SkinTexture, HighlightStyle, HighlightIntensity, SKIN_TEXTURES, HIGHLIGHT_STYLES, HIGHLIGHT_INTENSITIES } from '../../types';

const SkinControls: React.FC<ControlsProps> = (props) => {
    const formElementClasses = "mt-1 block w-full bg-slate-900/70 border-slate-700 rounded-lg shadow-sm p-3 focus:ring-cyan-500 focus:border-cyan-500 text-slate-200 placeholder:text-slate-500 transition disabled:opacity-50 disabled:cursor-not-allowed";
    const labelClasses = "block text-sm font-medium text-slate-300";

    return (
        <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-cyan-300">Skin Enhancer</h3>
            
            {props.useArtReferenceSkin ? (
                <p className="text-sm text-violet-300 bg-violet-900/30 p-3 rounded-lg border border-violet-800">
                    Skin texture and highlights are being automatically controlled by your Art Style reference image. Uncheck "Skin & Highlight Match" in the Art Style tab for manual control.
                </p>
            ) : (
                <p className="text-sm text-slate-400">Refine the subject's skin texture and highlights for a professional finish.</p>
            )}

            <div className="space-y-4">
                <div>
                    <label htmlFor="skin-texture" className={labelClasses}>Skin Texture / Retouching</label>
                    <select id="skin-texture" value={props.skinTexture} onChange={(e) => props.onSkinTextureChange(e.target.value as SkinTexture)} className={formElementClasses} disabled={props.useArtReferenceSkin}>
                        {SKIN_TEXTURES.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">{skinTextureDescriptions[props.skinTexture]}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="highlight-style" className={labelClasses}>Highlight Style</label>
                        <select id="highlight-style" value={props.highlightStyle} onChange={(e) => props.onHighlightStyleChange(e.target.value as HighlightStyle)} className={formElementClasses} disabled={props.useArtReferenceSkin}>
                            {HIGHLIGHT_STYLES.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">{skinHighlightDescriptions[props.highlightStyle]}</p>
                    </div>
                    <div>
                        <label htmlFor="highlight-intensity" className={labelClasses}>Highlight Intensity</label>
                        <select id="highlight-intensity" value={props.highlightIntensity} onChange={(e) => props.onHighlightIntensityChange(e.target.value as HighlightIntensity)} className={formElementClasses} disabled={props.useArtReferenceSkin || props.highlightStyle === 'None'}>
                            {HIGHLIGHT_INTENSITIES.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkinControls;
