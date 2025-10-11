import React, { useState, useCallback, useRef, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { OutputDisplay } from './components/OutputDisplay';
import { 
  ImageFile, GeminiOutput, BackgroundMode, CropTarget, SubjectMode,
  PerspectiveDistance, PerspectiveAngle, PerspectivePOV, PerspectiveMovement, PerspectiveLens,
  PERSPECTIVE_DISTANCE, PERSPECTIVE_ANGLE, PERSPECTIVE_POV, PERSPECTIVE_MOVEMENT, PERSPECTIVE_LENS,
  LightingStyle, ArtReferenceAnalysis, SkinTexture, HighlightStyle, HighlightIntensity,
  Aperture, ShutterSpeed, ISO, FocusMode, LensType, ShootingMode
} from './types';
import { generateStudioPhoto, describeImage, inpaintImage, swapFace, manipulateScene, analyzeArtReference } from './services/geminiService';

const ImagePreviewModal = lazy(() => import('./components/ImagePreviewModal'));
const InpaintingEditor = lazy(() => import('./components/InpaintingEditor'));
const ImageCropModal = lazy(() => import('./components/ImageCropModal'));


const MAX_DIMENSION = 1024;

/**
 * A fallback component to display while lazy-loaded modals are being fetched.
 */
const ModalLoader = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out">
        <svg className="animate-spin h-12 w-12 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);


/**
 * Resizes an image file if its dimensions exceed a maximum value, preventing overly large API requests.
 * @param file The original image file from user input.
 * @returns A promise that resolves to an ImageFile object with base64 data and a preview URL.
 */
const resizeImage = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const { width, height } = img;
        
        if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
          // No resizing needed, just format the output.
          const base64 = (img.src as string).split(',')[1];
          resolve({
            base64,
            mimeType: file.type,
            previewUrl: img.src,
          });
          return;
        }

        let newWidth, newHeight;
        if (width > height) {
          newWidth = MAX_DIMENSION;
          newHeight = (height * MAX_DIMENSION) / width;
        } else {
          newHeight = MAX_DIMENSION;
          newWidth = (width * MAX_DIMENSION) / height;
        }

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context for image resizing.'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Use a default of 'image/jpeg' if the file type is unusual.
        const mimeType = file.type.startsWith('image/') ? file.type : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, 0.9); // 0.9 quality for JPEGs
        const base64 = dataUrl.split(',')[1];

        resolve({
          base64,
          mimeType,
          previewUrl: dataUrl,
        });
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};


function App() {
  const faceSwapInputRef = useRef<HTMLInputElement>(null);

  // State for images
  const [sourceImage, setSourceImage] = useState<ImageFile | null>(null);
  const [multipleSubjectsImage, setMultipleSubjectsImage] = useState<ImageFile | null>(null);
  const [faceReferenceImage, setFaceReferenceImage] = useState<ImageFile | null>(null);
  const [dressImage, setDressImage] = useState<ImageFile | null>(null);
  const [objectImage, setObjectImage] = useState<ImageFile | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<ImageFile | null>(null);
  const [artReferenceImage, setArtReferenceImage] = useState<ImageFile | null>(null);

  // State for prompts
  const [subjectPrompt, setSubjectPrompt] = useState<string>('');
  const [canonicalSubjectPrompt, setCanonicalSubjectPrompt] = useState<string>('');
  const [dressPrompt, setDressPrompt] = useState<string>('');
  const [backgroundPrompt, setBackgroundPrompt] = useState<string>('');
  const [artReferencePrompt, setArtReferencePrompt] = useState<string>('');
  const [integrationAnalysis, setIntegrationAnalysis] = useState<string>('');
  const [flyerText, setFlyerText] = useState<string>('');
  const [thumbnailText, setThumbnailText] = useState<string>('');
  const [selectedEffectsByCategory, setSelectedEffectsByCategory] = useState<Record<string, string>>({});
  const [artStyleInfluence, setArtStyleInfluence] = useState<number>(75);
  const [subjectInfluence, setSubjectInfluence] = useState<number>(75);
  const [surprise, setSurprise] = useState<number>(25);
  const [reperspectivePrompt, setReperspectivePrompt] = useState<string>('');

  // State for controls and UI
  const [subjectMode, setSubjectMode] = useState<SubjectMode>('single');
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('describe');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDescribeLoading, setIsDescribeLoading] = useState<boolean>(false);
  const [isArtAnalysisLoading, setIsArtAnalysisLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // State for Lighting
  const [lightingStyle, setLightingStyle] = useState<LightingStyle>('None');
  
  // State for Skin
  const [skinTexture, setSkinTexture] = useState<SkinTexture>('None');
  const [highlightStyle, setHighlightStyle] = useState<HighlightStyle>('None');
  const [highlightIntensity, setHighlightIntensity] = useState<HighlightIntensity>('None');

  // State for Perspective
  const [perspectiveDistance, setPerspectiveDistance] = useState<PerspectiveDistance>('None');
  const [perspectiveAngle, setPerspectiveAngle] = useState<PerspectiveAngle>('None');
  const [perspectivePOV, setPerspectivePOV] = useState<PerspectivePOV>('None');
  const [perspectiveMovement, setPerspectiveMovement] = useState<PerspectiveMovement>('None');
  const [perspectiveLens, setPerspectiveLens] = useState<PerspectiveLens>('None');
  
  // State for Advanced Camera
  const [aperture, setAperture] = useState<Aperture>('None');
  const [shutterSpeed, setShutterSpeed] = useState<ShutterSpeed>('None');
  const [iso, setISO] = useState<ISO>('None');
  const [focusMode, setFocusMode] = useState<FocusMode>('Auto');
  const [manualFocusSubject, setManualFocusSubject] = useState<string>('');
  const [exposure, setExposure] = useState<number>(0);
  const [lensType, setLensType] = useState<LensType>('None');
  const [shootingMode, setShootingMode] = useState<ShootingMode>('None');
  const [lightingTemperature, setLightingTemperature] = useState<number>(5500);

  // State for Art Reference controls
  const [artReferenceAnalysis, setArtReferenceAnalysis] = useState<ArtReferenceAnalysis | null>(null);
  const [useArtReferenceLighting, setUseArtReferenceLighting] = useState<boolean>(false);
  const [useArtReferenceSkin, setUseArtReferenceSkin] = useState<boolean>(false);
  const [useArtReferenceActionForSubject, setUseArtReferenceActionForSubject] = useState<boolean>(false);

  // State for In-painting
  const [isInpaintingEditorOpen, setIsInpaintingEditorOpen] = useState(false);
  const [imageForInpainting, setImageForInpainting] = useState<ImageFile | null>(null);

  // State for Cropping
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<{ file: ImageFile; type: CropTarget; } | null>(null);
  
  // State for Face Swapping & Reperspective
  const [isSwappingFace, setIsSwappingFace] = useState<boolean>(false);
  const [isReperspectiving, setIsReperspectiving] = useState<boolean>(false);
  
  // State for History (Undo/Redo)
  const [history, setHistory] = useState<GeminiOutput[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const currentOutput = history[historyIndex] ?? null;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  
  const dataUrlToImageFile = (dataUrl: string): ImageFile | null => {
      const dataUrlParts = dataUrl.split(',');
      const mimeTypePart = dataUrlParts[0].match(/:(.*?);/);
      if (!mimeTypePart || !dataUrlParts[1]) {
          setError("Failed to process the generated image for reuse.");
          return null;
      }
      return {
          base64: dataUrlParts[1],
          mimeType: mimeTypePart[1],
          previewUrl: dataUrl,
      };
  }
  
  const updateHistory = (newOutput: GeminiOutput) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newOutput);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (canUndo) {
        setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (canRedo) {
        setHistoryIndex(historyIndex + 1);
    }
  };
  
  const handleImageFileChange = async (file: File | null, setter: React.Dispatch<React.SetStateAction<ImageFile | null>>) => {
    if (file) {
      try {
        const imageFile = await resizeImage(file);
        setter(imageFile);
      } catch (err) {
        setError('Failed to process image file. It might be corrupted or in an unsupported format.');
        console.error(err);
      }
    } else {
      setter(null);
    }
  };
  
  const handleDescribeSourceImage = useCallback(async (image: ImageFile) => {
    if (!image) return;
    setIsDescribeLoading(true);
    setError(null);
    try {
      const description = await describeImage(image);
      setSubjectPrompt(description);
      setCanonicalSubjectPrompt(description); // Save the canonical description
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to describe image.');
    } finally {
      setIsDescribeLoading(false);
    }
  }, []);

  const handleRequestDescription = useCallback(() => {
    const imageToDescribe = subjectMode === 'single' ? sourceImage : multipleSubjectsImage;
    if (imageToDescribe) {
        handleDescribeSourceImage(imageToDescribe);
    }
  }, [subjectMode, sourceImage, multipleSubjectsImage, handleDescribeSourceImage]);

  const handleSourceImageChange = async (file: File | null) => {
    if(file){
        try {
            const imageFile = await resizeImage(file);
            setSourceImage(imageFile);
            // Clear old description when new image is uploaded to encourage fresh analysis
            setSubjectPrompt('');
            setCanonicalSubjectPrompt('');
        } catch (err) {
            setError('Failed to process source image file. It might be corrupted or in an unsupported format.');
        }
    } else {
        setSourceImage(null);
        setSubjectPrompt('');
        setCanonicalSubjectPrompt('');
    }
  };

  const handleMultipleSubjectsImageChange = async (file: File | null) => {
    if(file){
        try {
            const imageFile = await resizeImage(file);
            setMultipleSubjectsImage(imageFile);
            setSubjectPrompt('');
            setCanonicalSubjectPrompt('');
        } catch (err) {
            setError('Failed to process multiple subjects image file. It might be corrupted or in an unsupported format.');
        }
    } else {
        setMultipleSubjectsImage(null);
        setSubjectPrompt('');
        setCanonicalSubjectPrompt('');
    }
  };

  const handleSubjectModeChange = (mode: SubjectMode) => {
    setSubjectMode(mode);
    setSubjectPrompt('');
    setCanonicalSubjectPrompt('');
    if (mode === 'single') {
      setMultipleSubjectsImage(null);
    } else {
      setSourceImage(null);
      setFaceReferenceImage(null);
    }
  };
  
  const handleArtReferenceImageChange = async (file: File | null) => {
    const currentSource = subjectMode === 'single' ? sourceImage : multipleSubjectsImage;
    if(file && currentSource) {
        try {
            const imageFile = await resizeImage(file);
            setArtReferenceImage(imageFile);
            
            // Clear old data and set loading state
            setArtReferencePrompt('');
            setIntegrationAnalysis('');
            setArtReferenceAnalysis(null);
            setIsArtAnalysisLoading(true);
            setError(null);

            const analysisResult = await analyzeArtReference(currentSource, imageFile);

            // Update all related states at once
            setArtReferenceAnalysis(analysisResult);
            setArtReferencePrompt(analysisResult.styleDescription);
            setIntegrationAnalysis(analysisResult.integrationPlan);

            // If toggles are already on, apply the new values immediately
            if (useArtReferenceLighting) {
                setLightingStyle(analysisResult.lightingStyle);
            }
            if (useArtReferenceActionForSubject) {
                setSubjectPrompt(analysisResult.actionPrompt);
            }

        } catch(err) {
             const message = err instanceof Error ? err.message : 'Failed to process or analyze the art reference image.';
             setError(message);
             // Also clear the image on error to prevent inconsistent state
             setArtReferenceImage(null);
        } finally {
            setIsArtAnalysisLoading(false);
        }
    } else {
        setArtReferenceImage(null);
        setArtReferencePrompt('');
        setIntegrationAnalysis('');
        setArtReferenceAnalysis(null);
        if(!currentSource) {
            // Give user helpful feedback
            setError('Please upload a Subject photo before adding an Art Style reference.')
        }
    }
  }

  const handleSelectedEffectChange = (categoryName: string, effect: string) => {
    setSelectedEffectsByCategory(prev => {
      const next = { ...prev };
      if (effect === 'None') {
        delete next[categoryName];
      } else {
        next[categoryName] = effect;
      }
      return next;
    });
  };

  const handleRandomizePerspective = () => {
    setPerspectiveDistance(PERSPECTIVE_DISTANCE[Math.floor(Math.random() * PERSPECTIVE_DISTANCE.length)]);
    setPerspectiveAngle(PERSPECTIVE_ANGLE[Math.floor(Math.random() * PERSPECTIVE_ANGLE.length)]);
    setPerspectivePOV(PERSPECTIVE_POV[Math.floor(Math.random() * PERSPECTIVE_POV.length)]);
    setPerspectiveMovement(PERSPECTIVE_MOVEMENT[Math.floor(Math.random() * PERSPECTIVE_MOVEMENT.length)]);
    setPerspectiveLens(PERSPECTIVE_LENS[Math.floor(Math.random() * PERSPECTIVE_LENS.length)]);
  };

  const handleUseArtReferenceLightingChange = (checked: boolean) => {
    setUseArtReferenceLighting(checked);
    if (checked && artReferenceAnalysis) {
        setLightingStyle(artReferenceAnalysis.lightingStyle);
    } else {
        // Revert to 'None' when unchecked, so it's a clear toggle
        setLightingStyle('None'); 
    }
  };

  const handleUseArtReferenceActionChange = (checked: boolean) => {
    setUseArtReferenceActionForSubject(checked);
    if (checked && artReferenceAnalysis) {
        setSubjectPrompt(artReferenceAnalysis.actionPrompt);
    } else if (!checked) {
        setSubjectPrompt(canonicalSubjectPrompt);
    }
  };


  const handleGenerate = async () => {
    const currentSourceImage = subjectMode === 'single' ? sourceImage : multipleSubjectsImage;
    if (!currentSourceImage) {
      setError(`Please upload a ${subjectMode === 'single' ? 'subject' : 'multiple subjects'} image.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generateStudioPhoto({
        sourceImage: currentSourceImage,
        subjectMode,
        subjectPrompt,
        faceReferenceImage,
        dressImage,
        dressPrompt,
        objectImage,
        backgroundImage,
        backgroundPrompt,
        backgroundMode,
        stylePrompt: Object.values(selectedEffectsByCategory).filter(Boolean).join(' & '),
        artReferenceImage,
        artReferencePrompt,
        artStyleInfluence,
        subjectInfluence,
        surprise,
        integrationAnalysis,
        lightingStyle,
        perspectiveDistance,
        perspectiveAngle,
        perspectivePOV,
        perspectiveMovement,
        perspectiveLens,
        useArtReferenceLighting,
        useArtReferenceSkin,
        flyerText,
        thumbnailText,
        skinTexture,
        highlightStyle,
        highlightIntensity,
        aperture,
        shutterSpeed,
        iso,
        focusMode,
        manualFocusSubject,
        exposure,
        lensType,
        shootingMode,
        lightingTemperature,
      });
      updateHistory(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during generation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (currentOutput?.imageUrl) {
      const link = document.createElement('a');
      link.href = currentOutput.imageUrl;
      link.download = `studio-photo-${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCreateFromOutput = () => {
    if (currentOutput?.imageUrl) {
        const newSource = dataUrlToImageFile(currentOutput.imageUrl);
        if(newSource) {
            setSourceImage(newSource);
            setSubjectMode('single');
            setMultipleSubjectsImage(null);
            // Don't clear face reference
            setDressImage(null);
            setDressPrompt('');
            setObjectImage(null);
            setBackgroundImage(null);
            setBackgroundPrompt('');
            setArtReferenceImage(null);
            setArtReferencePrompt('');
            setIntegrationAnalysis('');
            setUseArtReferenceLighting(false);
            setUseArtReferenceSkin(false);
            setUseArtReferenceActionForSubject(false);
            setSelectedEffectsByCategory({});
            setHistory([]);
            setHistoryIndex(-1);
            setSkinTexture('None');
            setHighlightStyle('None');
            setHighlightIntensity('None');
            // Reset camera settings
            setAperture('None');
            setShutterSpeed('None');
            setISO('None');
            setFocusMode('Auto');
            setManualFocusSubject('');
            setExposure(0);
            setLensType('None');
            setShootingMode('None');
            setLightingTemperature(5500);
            // Clear old prompt to encourage fresh analysis
            setSubjectPrompt('');
            setCanonicalSubjectPrompt('');
        }
    }
  };

  const handleEditRequest = () => {
    if (currentOutput?.imageUrl) {
      const imageToEdit = dataUrlToImageFile(currentOutput.imageUrl);
      if (imageToEdit) {
        setImageForInpainting(imageToEdit);
        setIsInpaintingEditorOpen(true);
      }
    }
  };

  const handleInpaint = async (mask: ImageFile, prompt: string) => {
    if (!imageForInpainting) return;
    setIsLoading(true);
    setIsInpaintingEditorOpen(false);
    setError(null);
    try {
      const result = await inpaintImage({
        sourceImage: imageForInpainting,
        maskImage: mask,
        prompt: prompt,
      });
      updateHistory(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during in-painting.');
    } finally {
      setIsLoading(false);
      setImageForInpainting(null);
    }
  };

  const handleCropRequest = (type: CropTarget) => {
    let fileToCrop: ImageFile | null = null;
    switch (type) {
      case 'source': fileToCrop = sourceImage; break;
      case 'multipleSubjects': fileToCrop = multipleSubjectsImage; break;
      case 'face': fileToCrop = faceReferenceImage; break;
      case 'dress': fileToCrop = dressImage; break;
      case 'object': fileToCrop = objectImage; break;
      case 'background': fileToCrop = backgroundImage; break;
      case 'art': fileToCrop = artReferenceImage; break;
    }
    if (fileToCrop) {
      setImageToCrop({ file: fileToCrop, type });
      setIsCropModalOpen(true);
    }
  };

  const handleConfirmCrop = (croppedDataUrl: string) => {
    if (imageToCrop) {
      const croppedImageFile = dataUrlToImageFile(croppedDataUrl);
      if (croppedImageFile) {
        switch (imageToCrop.type) {
          case 'source': 
            setSourceImage(croppedImageFile); 
            // Don't auto-describe after crop; let user decide.
            setSubjectPrompt('');
            setCanonicalSubjectPrompt('');
            break;
          case 'multipleSubjects':
            setMultipleSubjectsImage(croppedImageFile);
            setSubjectPrompt('');
            setCanonicalSubjectPrompt('');
            break;
          case 'face': setFaceReferenceImage(croppedImageFile); break;
          case 'dress': setDressImage(croppedImageFile); break;
          case 'object': setObjectImage(croppedImageFile); break;
          case 'background': setBackgroundImage(croppedImageFile); break;
          case 'art': 
            // After cropping art ref, we must re-analyze it
            handleArtReferenceImageChange(null); // Clear first to reset state
            // This is a bit of a hack, we need a file object.
            fetch(croppedDataUrl).then(res => res.blob()).then(blob => {
                const file = new File([blob], "cropped_art.png", { type: "image/png" });
                handleArtReferenceImageChange(file);
            });
            break;
        }
      }
    }
    setIsCropModalOpen(false);
    setImageToCrop(null);
  };
  
  const performFaceSwap = async (faceRef: ImageFile) => {
      if (!currentOutput?.imageUrl) {
        setError('A generated image is required for face swap.');
        return;
      }

      const targetImage = dataUrlToImageFile(currentOutput.imageUrl);
      if (!targetImage) {
        setError('Could not process the current image for face swap.');
        return;
      }
      
      setIsSwappingFace(true);
      setError(null);
      
      try {
        const result = await swapFace({
            targetImage: targetImage,
            faceSourceImage: faceRef,
        });
        updateHistory(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during face swap.');
      } finally {
        setIsSwappingFace(false);
      }
  };
  
  const handleFaceSwapRequest = () => {
    if (subjectMode === 'multiple') {
      setError('Face Swap is only available in Single Subject mode.');
      return;
    }
    if (faceReferenceImage) {
        performFaceSwap(faceReferenceImage);
    } else {
        faceSwapInputRef.current?.click();
    }
  };
  
  const handleFaceSwapFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        try {
            const imageFile = await resizeImage(file);
            setFaceReferenceImage(imageFile); // Also set it in state so it can be re-used
            performFaceSwap(imageFile);
        } catch(err) {
            setError('Failed to process face reference image file.');
        }
    }
    // Reset input value to allow selecting the same file again
    if(event.target) event.target.value = '';
  };

  const handleReperspective = async () => {
    if (!currentOutput?.imageUrl || !reperspectivePrompt.trim()) {
        setError('Please provide a prompt to manipulate the scene.');
        return;
    }
    const imageToManipulate = dataUrlToImageFile(currentOutput.imageUrl);
    if (!imageToManipulate) return;

    setIsReperspectiving(true);
    setError(null);
    try {
        const result = await manipulateScene({
            sourceImage: imageToManipulate,
            prompt: reperspectivePrompt,
        });
        updateHistory(result);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during scene manipulation.');
    } finally {
        setIsReperspectiving(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-200">
      <input 
        type="file" 
        ref={faceSwapInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFaceSwapFileSelected}
      />
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col space-y-4">
            <Controls
              // Subject
              subjectMode={subjectMode}
              onSubjectModeChange={handleSubjectModeChange}
              sourceImage={sourceImage}
              onSourceImageChange={handleSourceImageChange}
              onCropSourceImage={() => handleCropRequest('source')}
              multipleSubjectsImage={multipleSubjectsImage}
              onMultipleSubjectsImageChange={handleMultipleSubjectsImageChange}
              onCropMultipleSubjectsImage={() => handleCropRequest('multipleSubjects')}
              subjectPrompt={subjectPrompt}
              onSubjectPromptChange={setSubjectPrompt}
              isDescribeLoading={isDescribeLoading}
              onRequestDescription={handleRequestDescription}
              faceReferenceImage={faceReferenceImage}
              onFaceReferenceImageChange={(file) => handleImageFileChange(file, setFaceReferenceImage)}
              onCropFaceReferenceImage={() => handleCropRequest('face')}
              useArtReferenceActionForSubject={useArtReferenceActionForSubject}
              onUseArtReferenceActionForSubjectChange={handleUseArtReferenceActionChange}
              isActionAnalysisLoading={isArtAnalysisLoading}
                            
              // Composition
              dressImage={dressImage}
              onDressImageChange={(file) => handleImageFileChange(file, setDressImage)}
              onCropDressImage={() => handleCropRequest('dress')}
              dressPrompt={dressPrompt}
              onDressPromptChange={setDressPrompt}
              objectImage={objectImage}
              onObjectImageChange={(file) => handleImageFileChange(file, setObjectImage)}
              onCropObjectImage={() => handleCropRequest('object')}
              backgroundImage={backgroundImage}
              onBackgroundImageChange={(file) => handleImageFileChange(file, setBackgroundImage)}
              onCropBackgroundImage={() => handleCropRequest('background')}
              backgroundPrompt={backgroundPrompt}
              onBackgroundPromptChange={setBackgroundPrompt}
              backgroundMode={backgroundMode}
              onBackgroundModeChange={setBackgroundMode}
              
              // Art Style
              artReferenceImage={artReferenceImage}
              onArtReferenceImageChange={handleArtReferenceImageChange}
              onCropArtReferenceImage={() => handleCropRequest('art')}
              artReferencePrompt={artReferencePrompt}
              onArtReferencePromptChange={setArtReferencePrompt}
              isArtDescribeLoading={isArtAnalysisLoading}
              integrationAnalysis={integrationAnalysis}
              onIntegrationAnalysisChange={setIntegrationAnalysis}
              isIntegrationAnalysisLoading={isArtAnalysisLoading}
              artStyleInfluence={artStyleInfluence}
              onArtStyleInfluenceChange={setArtStyleInfluence}
              subjectInfluence={subjectInfluence}
              onSubjectInfluenceChange={setSubjectInfluence}
              surprise={surprise}
              onSurpriseChange={setSurprise}
              selectedEffectsByCategory={selectedEffectsByCategory}
              onSelectedEffectChange={handleSelectedEffectChange}
              useArtReferenceLighting={useArtReferenceLighting}
              onUseArtReferenceLightingChange={handleUseArtReferenceLightingChange}
              isLightingAnalysisLoading={isArtAnalysisLoading}
              useArtReferenceSkin={useArtReferenceSkin}
              onUseArtReferenceSkinChange={setUseArtReferenceSkin}
              flyerText={flyerText}
              onFlyerTextChange={setFlyerText}
              thumbnailText={thumbnailText}
              onThumbnailTextChange={setThumbnailText}

              // Skin
              skinTexture={skinTexture}
              onSkinTextureChange={setSkinTexture}
              highlightStyle={highlightStyle}
              onHighlightStyleChange={setHighlightStyle}
              highlightIntensity={highlightIntensity}
              onHighlightIntensityChange={setHighlightIntensity}

              // Lighting
              lightingStyle={lightingStyle}
              onLightingStyleChange={setLightingStyle}

              // Camera
              perspectiveDistance={perspectiveDistance}
              onPerspectiveDistanceChange={setPerspectiveDistance}
              perspectiveAngle={perspectiveAngle}
              onPerspectiveAngleChange={setPerspectiveAngle}
              perspectivePOV={perspectivePOV}
              onPerspectivePOVChange={setPerspectivePOV}
              perspectiveMovement={perspectiveMovement}
              onPerspectiveMovementChange={setPerspectiveMovement}
              perspectiveLens={perspectiveLens}
              onPerspectiveLensChange={setPerspectiveLens}
              onRandomizePerspective={handleRandomizePerspective}
              aperture={aperture}
              onApertureChange={setAperture}
              shutterSpeed={shutterSpeed}
              onShutterSpeedChange={setShutterSpeed}
              iso={iso}
              onISOChange={setISO}
              focusMode={focusMode}
              onFocusModeChange={setFocusMode}
              manualFocusSubject={manualFocusSubject}
              onManualFocusSubjectChange={setManualFocusSubject}
              exposure={exposure}
              onExposureChange={setExposure}
              lensType={lensType}
              onLensTypeChange={setLensType}
              shootingMode={shootingMode}
              onShootingModeChange={setShootingMode}
              lightingTemperature={lightingTemperature}
              onLightingTemperatureChange={setLightingTemperature}

              // Settings & Generation
              isGenerating={isLoading}
              onGenerate={handleGenerate}
            />
          </div>
          <div className="flex flex-col space-y-4">
            <OutputDisplay
              isLoading={isLoading || isSwappingFace || isReperspectiving}
              output={currentOutput}
              error={error}
              onDownload={handleDownload}
              onCreateFromOutput={handleCreateFromOutput}
              onImageClick={() => setIsPreviewOpen(true)}
              onEdit={handleEditRequest}
              onFaceSwap={handleFaceSwapRequest}
              onGoBack={handleUndo}
              onGoForward={handleRedo}
              canGoBack={canUndo}
              canGoForward={canRedo}
              reperspectivePrompt={reperspectivePrompt}
              onReperspectivePromptChange={setReperspectivePrompt}
              onReperspective={handleReperspective}
              isReperspectiving={isReperspectiving}
            />
          </div>
        </div>
      </main>
      <Suspense fallback={<ModalLoader />}>
        {isPreviewOpen && (
          <ImagePreviewModal
            isOpen={isPreviewOpen}
            imageUrl={currentOutput?.imageUrl ?? null}
            onClose={() => setIsPreviewOpen(false)}
          />
        )}
        {isInpaintingEditorOpen && (
          <InpaintingEditor
            isOpen={isInpaintingEditorOpen}
            imageFile={imageForInpainting}
            onClose={() => setIsInpaintingEditorOpen(false)}
            onInpaint={handleInpaint}
            isGenerating={isLoading}
          />
        )}
        {isCropModalOpen && (
          <ImageCropModal
            isOpen={isCropModalOpen}
            imageUrl={imageToCrop?.file.previewUrl ?? null}
            onClose={() => setIsCropModalOpen(false)}
            onConfirm={handleConfirmCrop}
          />
        )}
      </Suspense>
    </div>
  );
}

export default App;
