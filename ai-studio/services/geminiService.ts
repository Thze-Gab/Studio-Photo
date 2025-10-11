// @google/genai is required for Gemini API calls
// NOTE: The @google/genai module is now dynamically imported to improve initial load time.
import { 
  ImageFile, GeminiOutput, BackgroundMode, SubjectMode,
  PerspectiveDistance, PerspectiveAngle, PerspectivePOV, PerspectiveMovement, PerspectiveLens,
  LightingStyle, LIGHTING_STYLES,
  ArtReferenceAnalysis,
  SkinTexture, HighlightStyle, HighlightIntensity,
  Aperture, ShutterSpeed, ISO, FocusMode, LensType, ShootingMode
} from '../types';

let aiAndModulePromise: Promise<{
    ai: any; // GoogleGenAI instance
    Modality: any;
    Type: any;
}> | null = null;

/**
 * Lazily initializes and returns the AI client and related enums.
 * This function uses a singleton promise to ensure the module is imported
 * and the client is initialized only once.
 */
function getAiClientAndEnums() {
    if (aiAndModulePromise) {
        return aiAndModulePromise;
    }
    
    aiAndModulePromise = (async () => {
        // Dynamically import the @google/genai module
        const genAI = await import('@google/genai');
        
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable is not set. Please configure it in your environment.");
        }
        
        try {
            const ai = new genAI.GoogleGenAI({ apiKey: process.env.API_KEY });
            return { ai, Modality: genAI.Modality, Type: genAI.Type };
        } catch (e) {
            console.error("Failed to initialize GoogleGenAI", e);
            throw new Error(`Failed to initialize AI service. Details: ${e instanceof Error ? e.message : String(e)}`);
        }
    })();
    
    return aiAndModulePromise;
}

// --- START OF REQUEST QUEUE LOGIC ---
// A simple queue to process API calls one at a time to avoid rate-limiting issues.
const requestQueue: (() => void)[] = [];
let isProcessing = false;

function processQueue() {
    if (isProcessing || requestQueue.length === 0) {
        return;
    }
    isProcessing = true;
    const nextTask = requestQueue.shift();
    if (nextTask) {
        nextTask();
    }
}

/**
 * Enqueues an API call to be executed sequentially, preventing concurrent requests.
 * @param apiCall The async function to call.
 * @returns A promise that resolves with the result of the API call.
 */
function enqueue<T>(apiCall: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const task = async () => {
            try {
                const result = await apiCall();
                resolve(result);
            } catch (error) {
                reject(error);
            } finally {
                isProcessing = false;
                // A small delay between requests can further help avoid rate limits.
                setTimeout(processQueue, 1000); 
            }
        };
        requestQueue.push(task);
        processQueue();
    });
}
// --- END OF REQUEST QUEUE LOGIC ---


/**
 * A utility function to automatically retry an API call with exponential backoff.
 * This is crucial for handling rate-limiting errors (429).
 * @param apiCall The async function to call.
 * @param maxRetries The maximum number of retries.
 * @param initialDelay The initial delay in milliseconds.
 * @param backoffFactor The factor by which the delay increases.
 * @returns The result of the successful API call.
 */
async function withRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries = 5,
  initialDelay = 3000, // 3 seconds
  backoffFactor = 2
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (e) {
      lastError = e as Error;
      let isRateLimitError = false;

      if (e instanceof Error) {
        // The SDK might throw an error with a message that is a JSON string.
        try {
          // Find the JSON part within the error message.
          const jsonMatch = e.message.match(/{.*}/);
          if (jsonMatch) {
            const errorBody = JSON.parse(jsonMatch[0]);
            if (errorBody.error && (errorBody.error.code === 429 || errorBody.error.status === 'RESOURCE_EXHAUSTED')) {
              isRateLimitError = true;
            }
          }
        } catch (jsonError) {
          // Not a JSON message, fallback to string check.
        }

        // Fallback check if JSON parsing fails or isn't conclusive.
        if (!isRateLimitError && (e.message.includes('429') || e.message.includes('RESOURCE_EXHAUSTED') || e.message.includes('rate limit'))) {
          isRateLimitError = true;
        }
      }

      if (isRateLimitError) {
        if (attempt === maxRetries - 1) {
          // Last attempt failed, throw a more user-friendly error.
          throw new Error(`The AI service is temporarily unavailable due to high demand. Please try again in a few moments. (Rate limit exceeded)`);
        }
        const jitter = Math.random() * 1000; // Add some randomness to avoid thundering herd
        const delay = initialDelay * (backoffFactor ** attempt) + jitter;
        console.warn(`Rate limit exceeded. Retrying in ${Math.round(delay)}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Not a rate limit error, re-throw immediately.
        throw e;
      }
    }
  }

  // This should not be reachable, but as a safeguard.
  throw lastError || new Error('An unknown error occurred after multiple retries.');
}


/**
 * Converts an ImageFile object to a Part object for the Gemini API.
 * @param file The image file to convert.
 * @returns A Part object containing the image data.
 */
function fileToGenerativePart(file: ImageFile): any { // `Part` type is not available statically
  return {
    inlineData: {
      data: file.base64,
      mimeType: file.mimeType,
    },
  };
}

interface GenerateStudioPhotoParams {
  sourceImage: ImageFile;
  subjectMode: SubjectMode;
  subjectPrompt: string;
  faceReferenceImage: ImageFile | null;
  dressImage: ImageFile | null;
  dressPrompt: string;
  objectImage: ImageFile | null;
  backgroundImage: ImageFile | null;
  backgroundPrompt: string;
  backgroundMode: BackgroundMode;
  stylePrompt: string;
  artReferenceImage: ImageFile | null;
  artReferencePrompt: string;
  artStyleInfluence: number;
  subjectInfluence: number;
  surprise: number;
  integrationAnalysis: string;
  lightingStyle: LightingStyle;
  perspectiveDistance: PerspectiveDistance;
  perspectiveAngle: PerspectiveAngle;
  perspectivePOV: PerspectivePOV;
  perspectiveMovement: PerspectiveMovement;
  perspectiveLens: PerspectiveLens;
  useArtReferenceLighting: boolean;
  useArtReferenceSkin: boolean;
  flyerText: string;
  thumbnailText: string;
  skinTexture: SkinTexture;
  highlightStyle: HighlightStyle;
  highlightIntensity: HighlightIntensity;
  aperture: Aperture;
  shutterSpeed: ShutterSpeed;
  iso: ISO;
  focusMode: FocusMode;
  manualFocusSubject: string;
  exposure: number;
  lensType: LensType;
  shootingMode: ShootingMode;
  lightingTemperature: number;
}

/**
 * Generates a studio photo using the Gemini API based on a source image and multiple optional inputs.
 * This function handles complex image editing by constructing a detailed, multi-part prompt.
 * @returns A promise that resolves to a GeminiOutput object containing the new image URL and text.
 */
export async function generateStudioPhoto({
  sourceImage,
  subjectMode,
  subjectPrompt,
  faceReferenceImage,
  dressImage,
  dressPrompt,
  objectImage,
  backgroundImage,
  backgroundPrompt,
  backgroundMode,
  stylePrompt,
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
}: GenerateStudioPhotoParams): Promise<GeminiOutput> {
  try {
    const { ai: aiClient, Modality } = await getAiClientAndEnums();
    const model = 'gemini-2.5-flash-image';
    const parts: any[] = [];

    const isFlyerDesign = stylePrompt.includes("Flyer Design");
    const isThumbnailDesign = stylePrompt.includes("Thumbnail Design");

    if (isFlyerDesign) {
        let instructions = `You are an expert graphic designer creating a professional promotional flyer.
- **Primary Task:** Your main goal is to create a visually appealing flyer.
- **Subject Integration:** The provided image contains the main subject(s). You MUST perfectly preserve their identity and creatively integrate them into the flyer design.
- **Text Content:** The flyer MUST include the following text. Find a creative and legible way to display it: "${flyerText}".
- **Style:** The overall style should be professional, modern, and eye-catching.
- **Output:** The final image MUST be a cohesive, high-quality flyer. This is a critical instruction.`;
        parts.push({ text: instructions });
        parts.push(fileToGenerativePart(sourceImage));
    } else if (isThumbnailDesign) {
        let instructions = `You are a professional YouTube thumbnail designer. Your goal is to create a compelling, high-energy, clickable thumbnail.
- **Primary Task:** Create an engaging thumbnail that grabs attention.
- **Subject Integration:** The provided image is the main subject(s). You MUST preserve their identity and make them the focal point of the thumbnail.
- **Text Content:** The thumbnail MUST include this text, making it bold, readable, and exciting: "${thumbnailText}".
- **Style:** The design should be eye-catching, high-contrast, and follow modern social media trends.
- **Output:** The final image must be a high-quality thumbnail. This is a critical instruction.`;
        parts.push({ text: instructions });
        parts.push(fileToGenerativePart(sourceImage));
    } else {
        const instructionSet: string[] = [];
        const subjectNoun = subjectMode === 'single' ? 'person' : 'person(s)';
        const subjectNounPlural = subjectMode === 'single' ? 'subject' : 'subjects';

        // Add master prompt
        instructionSet.push(`You are an expert AI photo editor and virtual photographer. Your goal is to create a single, high-quality image based on a set of input images and text instructions. You will be provided with images labeled like [Subject], [Art Style], etc. You must use these labels to understand which image to use for which purpose.`);

        // --- INSTRUCTION BUILDING ---
        
        // 1. Subject and Face
        const subjectInstructions = [
            `\n**1. SUBJECT & IDENTITY (PARAMOUNT PRIORITY)**`,
            `- The ${subjectNoun} in the [Subject] image is/are your primary subject.`,
            artReferenceImage ? `- **CRITICAL - SUBJECT INFLUENCE ${subjectInfluence}/100:** You MUST retain the subject's identity. A value of 100 requires a perfect, photorealistic match to the original ${subjectNoun}. A lower value allows for more artistic interpretation of their features to better match the art style, while still ensuring the ${subjectNoun} is/are recognizable. This is your most important instruction.` : `- **CRITICAL:** You MUST perfectly preserve their facial features, structure, and identity. The final image must be unmistakably the same ${subjectNoun}.`,
            subjectPrompt ? `- Apply these modifications to the ${subjectNounPlural}, while maintaining their identity: "${subjectPrompt}".` : null,
            faceReferenceImage ? `- **CRITICAL FACE OVERRIDE:** The [Face Reference] image provides the definitive likeness of the subject. Use this image to ensure the face is a perfect match, overriding the face from the [Subject] image if necessary.` : null,
        ].filter(Boolean).join('\n');
        instructionSet.push(subjectInstructions);
        
        // 2. Art Style
        if (artReferenceImage) {
            const artStylePrompts: string[] = [];
            artStylePrompts.push(
                `\n**2. ART STYLE APPLICATION**`,
                `- Analyze the [Art Style] image. Your task is to re-imagine the subject(s) in this distinct artistic style.`,
                artReferencePrompt ? `- The style is described as: "${artReferencePrompt}".` : '',
                `- **Style Influence:** Apply the reference style with an influence level of **${artStyleInfluence}/100**. A value of 100 means a complete transformation into the reference style, while still preserving the subject's recognizable identity.`,
                `- **Creative Freedom (Surprise):** You have a creative freedom level of **${surprise}/100**. A value of 0 means strict adherence to instructions; 100 grants maximum artistic liberty.`,
                integrationAnalysis ? `- **Execution Plan:** Follow this user-approved plan: "${integrationAnalysis}"` : ''
            );
            
            if (useArtReferenceSkin) {
                artStylePrompts.push(`- **CRITICAL - SKIN & HIGHLIGHT MATCH:** Analyze the skin texture and highlights on the person in the [Art Style] image. Apply this exact skin finish to the main subject(s), but **you MUST preserve the subject's original skin tone and color**. This is a texture/finish matching instruction only.`);
            }
            if (useArtReferenceLighting) {
                artStylePrompts.push(`- **CRITICAL - LIGHTING MATCH:** Apply the lighting from the [Art Style] image (color, shadows, direction) perfectly to the subject(s).`);
            }

            artStylePrompts.push(`- **IMPORTANT:** DO NOT simply copy or output the [Art Style] image. The final image must be a **new creation** that **fuses** the subject(s) from the [Subject] image with the style of the [Art Style] image.`);
            
            instructionSet.push(artStylePrompts.filter(Boolean).join('\n'));
        }

        // 3. Composition (Outfit, Object, Background)
        const compoInstructions: string[] = [];
        if (dressImage) {
            compoInstructions.push(`\n**Outfit:**\n- From the [Outfit] image, you must extract **ONLY THE CLOTHING/OUTFIT**.\n- **STRICTLY IGNORE EVERYTHING ELSE** in the [Outfit] image: the person, the background, the pose, accessories, etc. Your only focus is the **GARMENT** itself.\n- Apply this extracted outfit naturally onto the main subject(s).`);
            if (dressPrompt) compoInstructions.push(`- Apply these modifications to the outfit: "${dressPrompt}".`);
        }
        if (objectImage) {
            compoInstructions.push(`\n**Object:**\n- From the [Object] image, identify any non-clothing objects and incorporate them naturally into the scene with the subject(s).`);
        }
        if (backgroundMode === 'upload' && backgroundImage) {
            compoInstructions.push(`\n**Background:**\n- Use the [Background] image as the new background.`);
            if(backgroundPrompt) compoInstructions.push(`- Apply these modifications to the background: "${backgroundPrompt}".`);
        } else if (backgroundMode === 'describe' && backgroundPrompt) {
            compoInstructions.push(`\n**Background:**\n- Create a new background based on this description: "${backgroundPrompt}".`);
        } else if (backgroundMode === 'random') {
            compoInstructions.push(`\n**Background:**\n- Generate a random, photorealistic, professional studio background that complements the subject(s).`);
        }
        if (compoInstructions.length > 0) {
            instructionSet.push(`\n**3. COMPOSITION & SCENE**` + compoInstructions.join('\n'));
        }

        // 4. Final Touches
        const finalTouches: string[] = [];
        if (lightingStyle && lightingStyle !== 'None' && !useArtReferenceLighting) {
            finalTouches.push(`- **CRITICAL LIGHTING:** Apply a professional "${lightingStyle}" lighting setup to the entire scene. This must define the mood and shadows.`);
        }
        
        if (!useArtReferenceSkin) {
            if (skinTexture === 'Professional Dodge & Burn') {
                finalTouches.push(`- **SKIN RETOUCHING:** Apply a professional 'dodge and burn' retouching technique to the subject's skin to enhance contours, add depth, and create a sculpted, high-end look.`);
            } else if (skinTexture === 'Professional Frequency Separation') {
                finalTouches.push(`- **SKIN RETOUCHING:** Apply a professional 'frequency separation' retouching technique. This involves separating skin texture from color/tone to perfectly smooth blemishes and transitions while preserving hyper-realistic skin texture.`);
            } else if (skinTexture && skinTexture !== 'None') {
                finalTouches.push(`- **SKIN TEXTURE:** Render the subject's skin with a "${skinTexture}" texture. Ensure it looks natural and maintains the original skin tone under consistent lighting.`);
            }
            if (highlightStyle && highlightStyle !== 'None' && highlightIntensity && highlightIntensity !== 'None') {
                finalTouches.push(`- **SKIN HIGHLIGHTS:** Apply "${highlightStyle}" highlights to the skin at a "${highlightIntensity}" intensity.`);
            }
        }
        
        if (stylePrompt) {
             finalTouches.push(`- **ADDITIONAL EFFECTS:** Render the final image incorporating this style: "${stylePrompt}".`);
        }
        if (finalTouches.length > 0) {
             instructionSet.push(`\n**4. FINAL STYLIZATION**\n` + finalTouches.join('\n'));
        }
        
        // 5. Camera Settings
        const cameraDetails: string[] = [];
        if (shootingMode && shootingMode !== 'None') cameraDetails.push(`Shooting Style: ${shootingMode}`);
        if (lensType && lensType !== 'None') cameraDetails.push(`Lens: ${lensType}`);
        if (perspectiveDistance && perspectiveDistance !== 'None') cameraDetails.push(`Framing/Distance: ${perspectiveDistance}`);
        if (perspectiveAngle && perspectiveAngle !== 'None') cameraDetails.push(`Angle/Tilt: ${perspectiveAngle}`);
        if (perspectivePOV && perspectivePOV !== 'None') cameraDetails.push(`Point of View: ${perspectivePOV}`);
        if (perspectiveMovement && perspectiveMovement !== 'None') cameraDetails.push(`Camera Movement: ${perspectiveMovement}`);
        if (perspectiveLens && perspectiveLens !== 'None') cameraDetails.push(`Lens/Creative Style: ${perspectiveLens}`);
        if (aperture && aperture !== 'None') cameraDetails.push(`Aperture: ${aperture} (a low f-number like f/1.8 creates a very blurry background; a high f-number like f/16 keeps everything in focus)`);
        if (shutterSpeed && shutterSpeed !== 'None') cameraDetails.push(`Shutter Speed: ${shutterSpeed} (a slow speed like 1s can create motion blur; a fast speed like 1/1000s freezes action)`);
        if (iso && iso !== 'None') cameraDetails.push(`ISO: ${iso} (a high ISO like 6400 introduces noticeable film grain; a low ISO like 100 is clean)`);
        
        let tempDesc = 'neutral daylight';
        if (lightingTemperature < 4000) tempDesc = 'warm, tungsten-like';
        else if (lightingTemperature > 6500) tempDesc = 'cool, overcast-like';
        cameraDetails.push(`Color Temperature: ${lightingTemperature}K (${tempDesc} light)`);

        if (focusMode === 'Manual' && manualFocusSubject) {
            cameraDetails.push(`Focus: Manually set the sharpest point of focus on "${manualFocusSubject}"`);
        } else if (focusMode !== 'Auto' && focusMode !== 'Manual') {
            cameraDetails.push(`Focus: Set the sharpest point of focus on the ${focusMode.toLowerCase()}`);
        }

        if (exposure !== 0) {
            cameraDetails.push(`Exposure Compensation: ${exposure > 0 ? '+' : ''}${exposure.toFixed(1)} EV (${exposure > 0 ? 'brighter' : 'darker'} image)`);
        }

        if (cameraDetails.length > 0) {
             instructionSet.push(`\n**5. CAMERA & LENS SETTINGS**\n- **CRITICAL:** Simulate a professional camera with these settings: ${cameraDetails.join('; ')}.`);
        }

        // 6. Final Output Requirements
        instructionSet.push(`\n**FINAL OUTPUT REQUIREMENTS**\n- Combine all elements into a single, cohesive, high-quality image, prioritizing the subject's identity above all.`);
        
        // --- ASSEMBLE PARTS ---
        parts.push({ text: instructionSet.join('\n') });
        
        parts.push({ text: "This is the [Subject] image:" });
        parts.push(fileToGenerativePart(sourceImage));
        if (faceReferenceImage) {
            parts.push({ text: "This is the [Face Reference] image:" });
            parts.push(fileToGenerativePart(faceReferenceImage));
        }
        if (artReferenceImage) {
            parts.push({ text: "This is the [Art Style] image:" });
            parts.push(fileToGenerativePart(artReferenceImage));
        }
        if (dressImage) {
            parts.push({ text: "This is the [Outfit] image:" });
            parts.push(fileToGenerativePart(dressImage));
        }
        if (objectImage) {
            parts.push({ text: "This is the [Object] image:" });
            parts.push(fileToGenerativePart(objectImage));
        }
        if (backgroundMode === 'upload' && backgroundImage) {
            parts.push({ text: "This is the [Background] image:" });
            parts.push(fileToGenerativePart(backgroundImage));
        }
    }

    const apiCall = () => aiClient.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const response: any = await enqueue(() => withRetry<any>(apiCall));
    
    const firstCandidate = response.candidates?.[0];

    if (!firstCandidate) {
        throw new Error("The AI returned an empty response, which may be due to a content policy violation or a server error.");
    }
    
    if (firstCandidate.finishReason && !['STOP', 'MAX_TOKENS'].includes(firstCandidate.finishReason)) {
      if (['SAFETY', 'IMAGE_SAFETY'].includes(firstCandidate.finishReason)) {
        const blockedRatings = firstCandidate.safetyRatings?.filter((r: any) => r.blocked).map((r: any) => r.category.replace('HARM_CATEGORY_', ''));
        const reason = `Request blocked for safety reasons: ${blockedRatings?.join(', ') || 'unspecified'}. This can sometimes happen with portraits. Try using a different reference image or adjusting your text prompts.`;
        throw new Error(reason);
      }
      throw new Error(`Generation stopped for an unexpected reason: ${firstCandidate.finishReason}.`);
    }

    const output: GeminiOutput = { imageUrl: null, text: null };

    if (firstCandidate.content?.parts) {
      for (const part of firstCandidate.content.parts) {
        if (part.inlineData) {
          output.imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          output.text = (output.text || "") + part.text;
        }
      }
    }

    if (!output.imageUrl) {
      throw new Error("The AI did not return an image. This can happen with unusual prompts. Please try again with a different prompt.");
    }

    return output;

  } catch (e) {
    console.error("Error generating studio photo:", e);
    throw new Error(`An error occurred while communicating with the AI. Details: ${e instanceof Error ? e.message : String(e)}`);
  }
}


interface InpaintImageParams {
  sourceImage: ImageFile;
  maskImage: ImageFile;
  prompt: string;
}
/**
 * Regenerates a specific area of an image using a mask and a text prompt.
 * @returns A promise that resolves to a GeminiOutput object with the edited image.
 */
export async function inpaintImage({ sourceImage, maskImage, prompt }: InpaintImageParams): Promise<GeminiOutput> {
  try {
    const { ai: aiClient, Modality } = await getAiClientAndEnums();
    const model = 'gemini-2.5-flash-image';
    
    const parts: any[] = [
      { text: `You are an expert AI photo editor. The user has provided an image, a mask, and a prompt. Your task is to regenerate ONLY the masked area of the image based on the prompt: "${prompt}". The masked area is indicated in the second image. The rest of the image must remain unchanged. Seamlessly blend the new content with the existing image.`},
      fileToGenerativePart(sourceImage),
      fileToGenerativePart(maskImage),
    ];
    
    const apiCall = () => aiClient.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const response: any = await enqueue(() => withRetry<any>(apiCall));

    const firstCandidate = response.candidates?.[0];
    if (!firstCandidate) {
        throw new Error("The AI returned an empty response, which may be due to a content policy violation or a server error.");
    }
    
    if (firstCandidate.finishReason && !['STOP', 'MAX_TOKENS'].includes(firstCandidate.finishReason)) {
      if (['SAFETY', 'IMAGE_SAFETY'].includes(firstCandidate.finishReason)) {
        const blockedRatings = firstCandidate.safetyRatings?.filter((r: any) => r.blocked).map((r: any) => r.category.replace('HARM_CATEGORY_', ''));
        const reason = `In-painting request blocked for safety reasons: ${blockedRatings?.join(', ') || 'unspecified'}. This can sometimes happen with portraits. Try using a different reference image or adjusting your text prompts.`;
        throw new Error(reason);
      }
      throw new Error(`In-painting stopped for an unexpected reason: ${firstCandidate.finishReason}.`);
    }

    const output: GeminiOutput = { imageUrl: null, text: null };

    if (firstCandidate.content?.parts) {
      for (const part of firstCandidate.content.parts) {
        if (part.inlineData) {
          output.imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          output.text = part.text;
        }
      }
    }

    if (!output.imageUrl) {
      throw new Error("The AI did not return an image for in-painting. Please try again.");
    }

    return output;
  } catch (e) {
    console.error("Error during in-painting:", e);
    throw new Error(`An error occurred during in-painting. Details: ${e instanceof Error ? e.message : String(e)}`);
  }
}

/**
 * Generates a textual description of an image using the Gemini API.
 * @param image The image to describe.
 * @returns A promise that resolves to a string containing the image description.
 */
export async function describeImage(image: ImageFile): Promise<string> {
    try {
        const { ai: aiClient } = await getAiClientAndEnums();
        const model = 'gemini-2.5-flash';
        const apiCall = () => aiClient.models.generateContent({
            model,
            contents: {
                parts: [
                    { text: 'Briefly describe the person or people in this photo in one short sentence, focusing on key visual features for an AI editor. For example: "A young woman with blonde hair smiling." or "A group of friends posing for a photo."' },
                    fileToGenerativePart(image),
                ],
            },
        });

        const response: any = await enqueue(() => withRetry<any>(apiCall));

        const firstCandidate = response.candidates?.[0];
        if (firstCandidate?.finishReason && firstCandidate.finishReason !== 'STOP') {
            if (['SAFETY', 'IMAGE_SAFETY'].includes(firstCandidate.finishReason)) {
                const blockedRatings = firstCandidate.safetyRatings?.filter((r: any) => r.blocked).map((r: any) => r.category.replace('HARM_CATEGORY_', ''));
                const reason = `Image description blocked for safety reasons: ${blockedRatings?.join(', ') || 'unspecified'}. Please use a different image.`;
                throw new Error(reason);
            }
        }

        return response.text;
    } catch (e) {
        console.error("Error describing image:", e);
        throw new Error(`Failed to generate image description. Details: ${e instanceof Error ? e.message : String(e)}`);
    }
}

/**
 * Performs a comprehensive analysis of an art reference image in relation to a subject image.
 * This single call fetches style description, integration plan, lighting style, and an action prompt.
 * @param sourceImage The image of the main subject.
 * @param artReferenceImage The image providing the art style.
 * @returns A promise that resolves to an ArtReferenceAnalysis object.
 */
export async function analyzeArtReference(sourceImage: ImageFile, artReferenceImage: ImageFile): Promise<ArtReferenceAnalysis> {
    try {
        const { ai: aiClient, Type } = await getAiClientAndEnums();
        const model = 'gemini-2.5-flash';
        
        const styleList = LIGHTING_STYLES.filter(s => s !== 'None').join('", "');

        const prompt = `You are an expert AI artist and prompt engineer analyzing two images: a [SUBJECT IMAGE] and an [ART STYLE IMAGE].
Your task is to provide a complete analysis in a single JSON response.

1.  **Analyze Art Style**: In one concise sentence, describe the artistic style of the [ART STYLE IMAGE]. Focus on medium, technique, mood, and color palette.
2.  **Create Integration Plan**: In one or two concise sentences, describe your creative plan to integrate the subject person(s) into the art reference's style, maintaining the subject's identity.
3.  **Identify Lighting Style**: Analyze the lighting in the [ART STYLE IMAGE]. Classify it into ONE of the following categories: "${styleList}". If no specific style fits, choose the closest one.
4.  **Generate Action Prompt**:
    a. First, analyze the [ART STYLE IMAGE] and identify the primary action, pose, and emotion of the person.
    b. Then, write a new, single, detailed, and evocative sentence describing the person/people from the [SUBJECT IMAGE] performing that exact action, pose, and emotion.

Provide your response strictly in the requested JSON format, with no extra text or explanations.`;

        const apiCall = () => aiClient.models.generateContent({
            model,
            contents: {
                parts: [
                    { text: prompt },
                    { text: "This is the [SUBJECT IMAGE]:" },
                    fileToGenerativePart(sourceImage),
                    { text: "This is the [ART STYLE IMAGE]:" },
                    fileToGenerativePart(artReferenceImage),
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        styleDescription: {
                            type: Type.STRING,
                            description: "A concise description of the art style.",
                        },
                        integrationPlan: {
                            type: Type.STRING,
                            description: "The plan to integrate the subject into the art style.",
                        },
                        lightingStyle: {
                            type: Type.STRING,
                            description: `The identified lighting style. Must be one of: ${styleList}`,
                        },
                        actionPrompt: {
                            type: Type.STRING,
                            description: "The generated prompt describing the subject performing the reference action.",
                        },
                    },
                    propertyOrdering: ["styleDescription", "integrationPlan", "lightingStyle", "actionPrompt"],
                },
            },
        });

        const response: any = await enqueue(() => withRetry<any>(apiCall));
        
        const jsonStr = response.text.trim();
        const result: ArtReferenceAnalysis = JSON.parse(jsonStr);

        // Validate the lighting style just in case the model hallucinates
        if (!(LIGHTING_STYLES as readonly string[]).includes(result.lightingStyle)) {
            console.warn(`AI returned an invalid lighting style: "${result.lightingStyle}". Falling back to 'None'.`);
            result.lightingStyle = 'None';
        }

        return result;

    } catch (e) {
        console.error("Error during comprehensive art reference analysis:", e);
        throw new Error(`Failed to analyze art reference. Details: ${e instanceof Error ? e.message : String(e)}`);
    }
}

/**
 * Replaces the face in a target image with a face from a source image, preserving the target's style.
 * @returns A promise that resolves to a GeminiOutput object with the face-swapped image.
 */
export async function swapFace({
  targetImage,
  faceSourceImage,
}: {
  targetImage: ImageFile;
  faceSourceImage: ImageFile;
}): Promise<GeminiOutput> {
  try {
    const { ai: aiClient, Modality } = await getAiClientAndEnums();
    const model = 'gemini-2.5-flash-image';
    const prompt = `You are a world-class AI digital artist specializing in hyperrealistic and style-consistent portrait recreation. Your work is for artistic and creative purposes only.

**Your Mission:**
Artistically blend the facial identity from the **FACE SOURCE IMAGE** onto the subject in the **TARGET IMAGE**.

**TARGET IMAGE (First Image):** This is the main image with the style, lighting, and composition that MUST be preserved.
**FACE SOURCE IMAGE (Second Image):** This image provides the facial identity (features, structure, expression) that you must transfer.

**Critical Directives (Non-negotiable):**
1.  **Identity Preservation (Highest Priority):** The final portrait must be UNMISTAKABLY recognizable as the person from the FACE SOURCE IMAGE.
2.  **Artistic Style Matching:** The recreated face MUST perfectly adopt the complete artistic style of the TARGET IMAGE. This includes:
    - **Lighting:** Match the direction, color, and intensity of the light and shadows.
    - **Color Grading:** Apply the exact same color palette and tone.
    - **Texture:** Replicate any textures present, such as skin texture, paint strokes, film grain, or digital artifacts.
    - **Effects:** If the TARGET IMAGE is a painting, cartoon, sketch, etc., the new face MUST be rendered in that same style.
3.  **Seamless Integration:** The new face must blend FLAWLESSLY with the head, hair, and neck of the subject in the TARGET IMAGE. There should be no visible seams or artifacts.

Do not alter the background, clothing, or body of the TARGET IMAGE. Your only task is this high-fidelity, style-aware portrait recreation.`;

    const parts: any[] = [
      { text: prompt },
      fileToGenerativePart(targetImage),
      fileToGenerativePart(faceSourceImage),
    ];

    const apiCall = () => aiClient.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const response: any = await enqueue(() => withRetry<any>(apiCall));

    const firstCandidate = response.candidates?.[0];
    if (!firstCandidate) {
      throw new Error("The AI returned an empty response, which may be due to a content policy violation or a server error.");
    }
    
    if (firstCandidate.finishReason && !['STOP', 'MAX_TOKENS'].includes(firstCandidate.finishReason)) {
      if (['SAFETY', 'IMAGE_SAFETY'].includes(firstCandidate.finishReason)) {
        const blockedRatings = firstCandidate.safetyRatings?.filter((r: any) => r.blocked).map((r: any) => r.category.replace('HARM_CATEGORY_', ''));
        const reason = `Face swap request blocked for safety reasons: ${blockedRatings?.join(', ') || 'unspecified'}. This can sometimes happen with portraits. Try using a different reference image.`;
        throw new Error(reason);
      }
      throw new Error(`Face swap stopped for an unexpected reason: ${firstCandidate.finishReason}.`);
    }

    const output: GeminiOutput = { imageUrl: null, text: null };

    if (firstCandidate.content?.parts) {
      for (const part of firstCandidate.content.parts) {
        if (part.inlineData) {
          output.imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          output.text = (output.text || "") + part.text;
        }
      }
    }

    if (!output.imageUrl) {
      throw new Error("The AI did not return an image for the face swap. Please try again.");
    }

    return output;
  } catch (e) {
    console.error("Error during face swap:", e);
    throw new Error(`An error occurred while swapping the face. Details: ${e instanceof Error ? e.message : String(e)}`);
  }
}

/**
 * Re-renders a source image from a new perspective based on a text prompt.
 * @returns A promise that resolves to a GeminiOutput object with the new image.
 */
export async function manipulateScene({
  sourceImage,
  prompt,
}: {
  sourceImage: ImageFile;
  prompt: string;
}): Promise<GeminiOutput> {
  try {
    const { ai: aiClient, Modality } = await getAiClientAndEnums();
    const model = 'gemini-2.5-flash-image';
    const instructions = `You are an expert AI cinematographer. Your task is to re-render the provided image from a new camera perspective as described by the user.

**Source Image:** The first image is the original scene.
**User Prompt:** "${prompt}"

**CRITICAL INSTRUCTIONS:**
1.  **Recreate the Scene:** You must recreate the *exact same scene* from the source image. This includes all subjects, objects, clothing, and the environment.
2.  **Change Perspective ONLY:** The only change you are allowed to make is the camera's position, angle, or viewpoint as specified in the user's prompt.
3.  **Maintain Consistency:** Preserve the original image's lighting, color palette, mood, and artistic style. The new image should feel like it was taken moments apart from the original, just from a different spot.
4.  **Execute the Prompt:** Religiously follow the user's prompt to define the new perspective.
5.  **Output:** Produce a single, high-quality image that fulfills these requirements.`;
    
    const parts: any[] = [
      { text: instructions },
      fileToGenerativePart(sourceImage),
    ];

    const apiCall = () => aiClient.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const response: any = await enqueue(() => withRetry<any>(apiCall));
    
    const firstCandidate = response.candidates?.[0];
    if (!firstCandidate) {
      throw new Error("The AI returned an empty response, possibly due to a content policy violation.");
    }
    
    if (firstCandidate.finishReason && !['STOP', 'MAX_TOKENS'].includes(firstCandidate.finishReason)) {
      if (['SAFETY', 'IMAGE_SAFETY'].includes(firstCandidate.finishReason)) {
        const blockedRatings = firstCandidate.safetyRatings?.filter((r: any) => r.blocked).map((r: any) => r.category.replace('HARM_CATEGORY_', ''));
        const reason = `Request blocked for safety reasons: ${blockedRatings?.join(', ') || 'unspecified'}. Please adjust your prompt or use a different image.`;
        throw new Error(reason);
      }
      throw new Error(`Generation stopped unexpectedly: ${firstCandidate.finishReason}.`);
    }

    const output: GeminiOutput = { imageUrl: null, text: null };
    if (firstCandidate.content?.parts) {
      for (const part of firstCandidate.content.parts) {
        if (part.inlineData) {
          output.imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          output.text = part.text;
        }
      }
    }

    if (!output.imageUrl) {
      throw new Error("The AI did not return an image for scene manipulation.");
    }

    return output;
  } catch (e) {
    console.error("Error during scene manipulation:", e);
    throw new Error(`An error occurred during scene manipulation. Details: ${e instanceof Error ? e.message : String(e)}`);
  }
}
