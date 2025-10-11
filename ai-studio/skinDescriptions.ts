import { SkinTexture, HighlightStyle } from "./types";

export const skinTextureDescriptions: Record<SkinTexture, string> = {
    'None': 'Default AI-generated skin texture.',
    'Smooth': 'Creates a very smooth, airbrushed look, minimizing all pores and imperfections.',
    'Soft Matte': 'Provides a non-shiny, velvety finish, similar to makeup foundation.',
    'Natural Pores': 'Renders realistic skin with visible, fine pores and slight imperfections.',
    'Rough': 'Adds texture for a more rugged or weathered appearance.',
    'Hyper-detailed': 'Exaggerates every detail, including wrinkles, pores, and hairs for a very sharp look.',
    'Plastic': 'Gives the skin a synthetic, doll-like, or mannequin appearance.',
    'Painterly': 'Applies visible brushstroke textures, as if the skin were painted.',
    'Professional Dodge & Burn': 'Applies advanced retouching to enhance contours by selectively lightening (dodging) and darkening (burning) areas.',
    'Professional Frequency Separation': 'A high-end technique that separates skin texture from color/tone, allowing for flawless smoothing while preserving natural detail.',
};

export const skinHighlightDescriptions: Record<HighlightStyle, string> = {
    'None': 'No specific highlight style.',
    'Soft Diffused': 'Creates soft, broad highlights, like light through a softbox.',
    'Glossy': 'Simulates a shiny, moisturized look with defined but blended highlights.',
    'Wet': 'Mimics the appearance of water on skin, with sharp, bright specular highlights.',
    'Matte': 'Almost no highlights, absorbing light for a flat, non-reflective surface.',
    'Hard Specular': 'Produces very sharp, small, and intense highlights, like direct sunlight.',
};
