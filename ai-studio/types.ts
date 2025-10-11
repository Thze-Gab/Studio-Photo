

export interface ImageFile {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

export interface GeminiOutput {
  imageUrl: string | null;
  text: string | null;
}

export type SubjectMode = 'single' | 'multiple';

export type BackgroundMode = 'describe' | 'upload' | 'random';

export type CropTarget = 'source' | 'dress' | 'background' | 'art' | 'face' | 'object' | 'multipleSubjects';

export type UpscaleFactor = 2 | 4 | 8;

// Lighting Style Options
export const LIGHTING_STYLES = [
  'None',
  'Three-Point Lighting',
  'Rembrandt Lighting',
  'Split Lighting',
  'Loop Lighting',
  'Butterfly Lighting',
  'High-Key Lighting',
  'Low-Key Lighting',
  'Motivated Lighting',
  'Natural / Ambient Lighting',
] as const;
export type LightingStyle = typeof LIGHTING_STYLES[number];

// Skin Texture Options
export const SKIN_TEXTURES = [
  'None',
  'Smooth',
  'Soft Matte',
  'Natural Pores',
  'Rough',
  'Hyper-detailed',
  'Plastic',
  'Painterly',
  'Professional Dodge & Burn',
  'Professional Frequency Separation',
] as const;
export type SkinTexture = typeof SKIN_TEXTURES[number];

// Highlight Style Options
export const HIGHLIGHT_STYLES = [
  'None',
  'Soft Diffused',
  'Glossy',
  'Wet',
  'Matte',
  'Hard Specular',
] as const;
export type HighlightStyle = typeof HIGHLIGHT_STYLES[number];

// Highlight Intensity Options
export const HIGHLIGHT_INTENSITIES = [
  'None',
  'Low',
  'Medium',
  'High',
  'Extreme',
] as const;
export type HighlightIntensity = typeof HIGHLIGHT_INTENSITIES[number];


// Perspective Options V2 - Categorized for better UX
export const PERSPECTIVE_DISTANCE = [
  'None',
  'Extreme Close-Up (ECU)',
  'Close-Up (CU)',
  'Medium Close-Up (MCU)',
  'Medium Shot (MS)',
  'Medium Long Shot (MLS)',
  'Full Shot (FS)',
  'Long Shot (LS)',
  'Extreme Long Shot (ELS)',
  'Establishing Shot',
] as const;
export type PerspectiveDistance = typeof PERSPECTIVE_DISTANCE[number];

export const PERSPECTIVE_ANGLE = [
  'None',
  'Eye-Level',
  'High Angle (looking down)',
  'Low Angle (looking up)',
  'Bird’s-Eye View (directly overhead)',
  'Worm’s-Eye View (from the ground)',
  'Dutch Angle / Tilted',
] as const;
export type PerspectiveAngle = typeof PERSPECTIVE_ANGLE[number];

export const PERSPECTIVE_POV = [
    'None',
    'Over-the-Shoulder (OTS)',
    'Point of View (POV)',
    'Two-Shot (two subjects)',
    'Insert Shot (detail)',
] as const;
export type PerspectivePOV = typeof PERSPECTIVE_POV[number];

export const PERSPECTIVE_MOVEMENT = [
    'None',
    'Tracking / Dolly Shot (following)',
    'Close Tracking Shot',
    'Pan (horizontal sweep)',
    'Tilt (vertical sweep)',
    'Zoom In/Out',
    'Dolly Zoom (Vertigo effect)',
    'Crane Shot (dramatic vertical)',
    'Handheld Shot (shaky)',
    '360° Wrap-around',
] as const;
export type PerspectiveMovement = typeof PERSPECTIVE_MOVEMENT[number];

export const PERSPECTIVE_LENS = [
  'None',
  'Fisheye Lens (distorted)',
  'Split-screen View',
  'Reflections (mirror, water, glass)',
  'Through an Object (keyhole, window)',
  'Silhouette Shot',
  'Rack Focus (shifting focus)',
  'Drone-style Top-down',
  'Macro Shot (extreme detail)',
] as const;
export type PerspectiveLens = typeof PERSPECTIVE_LENS[number];

// Advanced Camera Settings
export const APERTURE_VALUES = ['None', 'f/1.4', 'f/1.8', 'f/2.8', 'f/4', 'f/5.6', 'f/8', 'f/11', 'f/16'] as const;
export type Aperture = typeof APERTURE_VALUES[number];

export const SHUTTER_SPEED_VALUES = ['None', '1/1000s', '1/500s', '1/250s', '1/125s', '1/60s', '1/30s', '1/15s', '1s'] as const;
export type ShutterSpeed = typeof SHUTTER_SPEED_VALUES[number];

export const ISO_VALUES = ['None', '100', '200', '400', '800', '1600', '3200', '6400'] as const;
export type ISO = typeof ISO_VALUES[number];

export const LENS_TYPES = ['None', '14mm (Ultra-Wide)', '35mm (Wide/Street)', '50mm (Standard/Natural)', '85mm (Portrait)', '135mm (Telephoto)'] as const;
export type LensType = typeof LENS_TYPES[number];

export const SHOOTING_MODES = ['None', 'Portrait', 'Landscape', 'Macro', 'Street Photography', 'Studio Shot'] as const;
export type ShootingMode = typeof SHOOTING_MODES[number];

export const FOCUS_MODES = ['Auto', 'Subject\'s Eyes', 'Subject\'s Face', 'Main Object', 'Background', 'Manual'] as const;
export type FocusMode = typeof FOCUS_MODES[number];

export interface ArtReferenceAnalysis {
    styleDescription: string;
    integrationPlan: string;
    lightingStyle: LightingStyle;
    actionPrompt: string;
}
