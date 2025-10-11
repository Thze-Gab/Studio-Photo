import React from 'react';
import { ControlsProps } from '../Controls';
import { LIGHTING_STYLES } from '../../types';
import { lightingStyleDetails } from '../../lightingStyles';

const LightingControls: React.FC<ControlsProps> = (props) => {
    return (
        <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-cyan-300">Lighting Setup</h3>
            {props.useArtReferenceLighting ? (
                 <p className="text-sm text-violet-300 bg-violet-900/30 p-3 rounded-lg border border-violet-800">
                    Lighting is being automatically controlled by your Art Style reference image. Uncheck "Match Lighting" in the Art Style tab for manual control.
                </p>
            ) : (
                <p className="text-sm text-slate-400">Choose a professional lighting configuration to define the mood and shadows of your scene.</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {LIGHTING_STYLES.map(style => (
                    <button 
                        key={style}
                        onClick={() => props.onLightingStyleChange(style)}
                        disabled={props.useArtReferenceLighting}
                        className={`p-4 text-left rounded-lg border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                            props.lightingStyle === style
                            ? 'bg-violet-600/20 border-violet-500 ring-2 ring-violet-500'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-400/50'
                        }`}
                    >
                        <p className="font-semibold text-slate-100">{style}</p>
                        <p className="text-xs text-slate-400 mt-1">{lightingStyleDetails[style].description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LightingControls;
