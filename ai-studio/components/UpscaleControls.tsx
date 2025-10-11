import React from 'react';
import { UpscaleFactor } from '../types';
import { UpscaleIcon } from './IconComponents';

interface UpscaleControlsProps {
  factor: UpscaleFactor;
  onFactorChange: (factor: UpscaleFactor) => void;
  enhanceDetails: boolean;
  onEnhanceDetailsChange: (checked: boolean) => void;
  onUpscale: () => void;
  isUpscaling: boolean;
}

const FactorButton: React.FC<{
    onClick: () => void;
    active: boolean;
    children: React.ReactNode;
}> = ({ onClick, active, children }) => (
    <button
        onClick={onClick}
        className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
            active
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-700 text-slate-300 hover:bg-gray-600'
        }`}
    >
        {children}
    </button>
);

const ToggleSwitch: React.FC<{
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <div className={`block w-14 h-8 rounded-full transition-all ${checked ? 'bg-indigo-600' : 'bg-gray-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'transform translate-x-6' : ''}`}></div>
        </div>
    </label>
);

export const UpscaleControls: React.FC<UpscaleControlsProps> = ({
  factor,
  onFactorChange,
  enhanceDetails,
  onEnhanceDetailsChange,
  onUpscale,
  isUpscaling,
}) => {
  return (
    <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded-2xl p-4 shadow-xl space-y-4">
        <h3 className="text-base font-semibold text-slate-100">Upscale Image</h3>
        
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">Resolution</label>
            <div className="flex space-x-2">
                <FactorButton onClick={() => onFactorChange(2)} active={factor === 2}>2x</FactorButton>
                <FactorButton onClick={() => onFactorChange(4)} active={factor === 4}>4x</FactorButton>
                <FactorButton onClick={() => onFactorChange(8)} active={factor === 8}>8x</FactorButton>
            </div>
        </div>

        <div className="space-y-2">
             <ToggleSwitch
                label="Enhance Details"
                checked={enhanceDetails}
                onChange={onEnhanceDetailsChange}
            />
            <p className="text-xs text-slate-500">Adds plausible micro-details for a hyperrealistic result, like Magnific AI.</p>
        </div>

        <button
            onClick={onUpscale}
            disabled={isUpscaling}
            className="w-full mt-2 inline-flex items-center justify-center gap-x-2 rounded-lg bg-indigo-600 px-4 py-3 text-base font-semibold text-white shadow-lg hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
        >
            {isUpscaling ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Upscaling...
                </>
            ) : (
                <>
                    <UpscaleIcon className="w-5 h-5" />
                    Upscale
                </>
            )}
        </button>
    </div>
  );
};
