import React, { useState, lazy, Suspense } from 'react';
import { 
  ImageFile, BackgroundMode, SubjectMode, LightingStyle,
  PerspectiveDistance, PerspectiveAngle, PerspectivePOV, PerspectiveMovement, PerspectiveLens,
  SkinTexture, HighlightStyle, HighlightIntensity,
  Aperture, ShutterSpeed, ISO, FocusMode, LensType, ShootingMode,
} from '../types';
import {
  SparklesIcon,
  UserIcon,
  LayersIcon,
  PaintBrushIcon,
  CameraIcon,
  LightbulbIcon,
  FaceSmileIcon,
} from './IconComponents';

// Lazy load the tab panels to split code and improve initial load time.
const SubjectControls = lazy(() => import('./tabs/SubjectControls'));
const CompositionControls = lazy(() => import('./tabs/CompositionControls'));
const ArtStyleControls = lazy(() => import('./tabs/ArtStyleControls'));
const SkinControls = lazy(() => import('./tabs/SkinControls'));
const LightingControls = lazy(() => import('./tabs/LightingControls'));
const CameraControls = lazy(() => import('./tabs/CameraControls'));

export interface ControlsProps {
  // Subject
  subjectMode: SubjectMode;
  onSubjectModeChange: (mode: SubjectMode) => void;
  sourceImage: ImageFile | null;
  onSourceImageChange: (file: File | null) => void;
  onCropSourceImage?: () => void;
  multipleSubjectsImage: ImageFile | null;
  onMultipleSubjectsImageChange: (file: File | null) => void;
  onCropMultipleSubjectsImage?: () => void;
  subjectPrompt: string;
  onSubjectPromptChange: (prompt: string) => void;
  isDescribeLoading: boolean;
  onRequestDescription: () => void;
  faceReferenceImage: ImageFile | null;
  onFaceReferenceImageChange: (file: File | null) => void;
  onCropFaceReferenceImage?: () => void;
  useArtReferenceActionForSubject: boolean;
  onUseArtReferenceActionForSubjectChange: (use: boolean) => void;
  isActionAnalysisLoading: boolean;
    
  // Composition
  dressImage: ImageFile | null;
  onDressImageChange: (file: File | null) => void;
  onCropDressImage?: () => void;
  dressPrompt: string;
  onDressPromptChange: (prompt: string) => void;
  objectImage: ImageFile | null;
  onObjectImageChange: (file: File | null) => void;
  onCropObjectImage?: () => void;
  backgroundImage: ImageFile | null;
  onBackgroundImageChange: (file: File | null) => void;
  onCropBackgroundImage?: () => void;
  backgroundPrompt: string;
  onBackgroundPromptChange: (prompt: string) => void;
  backgroundMode: BackgroundMode;
  onBackgroundModeChange: (mode: BackgroundMode) => void;

  // Art Style
  artReferenceImage: ImageFile | null;
  onArtReferenceImageChange: (file: File | null) => void;
  onCropArtReferenceImage?: () => void;
  artReferencePrompt: string;
  onArtReferencePromptChange: (prompt: string) => void;
  isArtDescribeLoading: boolean;
  integrationAnalysis: string;
  onIntegrationAnalysisChange: (text: string) => void;
  isIntegrationAnalysisLoading: boolean;
  artStyleInfluence: number;
  onArtStyleInfluenceChange: (value: number) => void;
  subjectInfluence: number;
  onSubjectInfluenceChange: (value: number) => void;
  surprise: number;
  onSurpriseChange: (value: number) => void;
  selectedEffectsByCategory: Record<string, string>;
  onSelectedEffectChange: (category: string, effect: string) => void;
  useArtReferenceLighting: boolean;
  onUseArtReferenceLightingChange: (use: boolean) => void;
  isLightingAnalysisLoading: boolean;
  useArtReferenceSkin: boolean;
  onUseArtReferenceSkinChange: (use: boolean) => void;
  flyerText: string;
  onFlyerTextChange: (text: string) => void;
  thumbnailText: string;
  onThumbnailTextChange: (text: string) => void;
  
  // Skin
  skinTexture: SkinTexture;
  onSkinTextureChange: (value: SkinTexture) => void;
  highlightStyle: HighlightStyle;
  onHighlightStyleChange: (value: HighlightStyle) => void;
  highlightIntensity: HighlightIntensity;
  onHighlightIntensityChange: (value: HighlightIntensity) => void;
  
  // Lighting
  lightingStyle: LightingStyle;
  onLightingStyleChange: (style: LightingStyle) => void;

  // Camera
  perspectiveDistance: PerspectiveDistance;
  onPerspectiveDistanceChange: (value: PerspectiveDistance) => void;
  perspectiveAngle: PerspectiveAngle;
  onPerspectiveAngleChange: (value: PerspectiveAngle) => void;
  perspectivePOV: PerspectivePOV;
  onPerspectivePOVChange: (value: PerspectivePOV) => void;
  perspectiveMovement: PerspectiveMovement;
  onPerspectiveMovementChange: (value: PerspectiveMovement) => void;
  perspectiveLens: PerspectiveLens;
  onPerspectiveLensChange: (value: PerspectiveLens) => void;
  onRandomizePerspective: () => void;
  aperture: Aperture;
  onApertureChange: (value: Aperture) => void;
  shutterSpeed: ShutterSpeed;
  onShutterSpeedChange: (value: ShutterSpeed) => void;
  iso: ISO;
  onISOChange: (value: ISO) => void;
  focusMode: FocusMode;
  onFocusModeChange: (value: FocusMode) => void;
  manualFocusSubject: string;
  onManualFocusSubjectChange: (value: string) => void;
  exposure: number;
  onExposureChange: (value: number) => void;
  lensType: LensType;
  onLensTypeChange: (value: LensType) => void;
  shootingMode: ShootingMode;
  onShootingModeChange: (value: ShootingMode) => void;
  lightingTemperature: number;
  onLightingTemperatureChange: (value: number) => void;

  // Generation & Settings
  isGenerating: boolean;
  onGenerate: () => void;
}

const TabContentLoader = () => (
    <div className="flex items-center justify-center p-10">
        <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);


export const Controls: React.FC<ControlsProps> = (props) => {
  const [activeTab, setActiveTab] = useState('Camera');
    
  const tabs = [
    { name: 'Subject(s)', icon: UserIcon },
    { name: 'Composition', icon: LayersIcon },
    { name: 'Art Style', icon: PaintBrushIcon },
    { name: 'Skin', icon: FaceSmileIcon },
    { name: 'Lighting', icon: LightbulbIcon },
    { name: 'Camera', icon: CameraIcon },
  ];
  
  const renderActiveTab = () => {
    switch(activeTab) {
      case 'Subject(s)': return <SubjectControls {...props} />;
      case 'Composition': return <CompositionControls {...props} />;
      case 'Art Style': return <ArtStyleControls {...props} />;
      case 'Skin': return <SkinControls {...props} />;
      case 'Lighting': return <LightingControls {...props} />;
      case 'Camera': return <CameraControls {...props} />;
      default: return null;
    }
  }

  return (
    <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
            <nav className="flex space-x-2 px-2" aria-label="Tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`group inline-flex items-center gap-x-2 py-3 px-3 text-sm font-medium rounded-t-lg transition-all border-b-2 ${
                            activeTab === tab.name
                                ? 'border-cyan-400 text-cyan-300'
                                : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                        aria-current={activeTab === tab.name ? 'page' : undefined}
                    >
                       <tab.icon className="w-5 h-5" />
                       {tab.name}
                    </button>
                ))}
            </nav>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-6 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl rounded-tl-none">
            <Suspense fallback={<TabContentLoader />}>
                {renderActiveTab()}
            </Suspense>
        </div>
        
        <div className="flex-shrink-0 mt-4 p-4 bg-slate-950/40 backdrop-blur-xl rounded-2xl border border-white/10">
             <div className="w-full">
                <button
                    onClick={props.onGenerate}
                    disabled={props.isGenerating || (!props.sourceImage && !props.multipleSubjectsImage)}
                    className="w-full h-full inline-flex items-center justify-center gap-x-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-3 text-lg font-semibold text-white shadow-lg hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 transition-all duration-300 disabled:bg-slate-700 disabled:from-slate-700 disabled:to-slate-600 disabled:cursor-not-allowed disabled:text-slate-400 disabled:shadow-none hover:shadow-cyan-400/50"
                >
                    {props.isGenerating ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-6 h-6" />
                            Generate Masterpiece
                        </>
                    )}
                </button>
            </div>
        </div>
    </div>
  );
};
