export interface EffectCategory {
  name: string;
  effects: string[];
}

export const effectsCategories: EffectCategory[] = [
  {
    name: "🎨 Digital / Painting Styles",
    effects: [
      "Smudge Painting",
      "Oil Painting",
      "Watercolor",
      "Acrylic Painting",
      "Gouache",
      "Ink Wash (Sumi-e)",
      "Pastel Drawing",
      "Charcoal Sketch",
      "Pencil / Graphite",
      "Digital Airbrush",
      "Matte Painting",
    ],
  },
  {
    name: "🖌 Illustration & Cartoon Styles",
    effects: [
        "Vector Art",
        "Flat Illustration",
        "Minimalist Illustration",
        "Cartoon / Comic Book",
        "Anime / Manga",
        "Chibi Style",
        "Line Art / Ink Drawing",
        "Pop Art (Warhol)",
        "Doodle Art",
    ],
  },
  {
      name: "🌌 Abstract & Conceptual Styles",
      effects: [
        "Surrealism",
        "Cubism",
        "Expressionism",
        "Impressionism",
        "Futurism",
        "Minimalism",
        "Geometric Abstraction",
        "Collage Art",
      ],
  },
  {
      name: "🖼 Texture & Mixed Styles",
      effects: [
        "Mosaic / Stained Glass",
        "Low Poly Art",
        "Pixel Art",
        "3D Render Style",
        "Claymation",
        "Graffiti / Spray Paint",
        "Glitch Art",
        "Neon / Cyberpunk",
        "Vaporwave / Retrowave",
      ],
  },
  {
    name: "📷 Photography & Cinematic Styles",
    effects: [
      "Cinematic",
      "Film Noir",
      "Documentary",
      "Portrait Studio",
      "Analog Film",
    ],
  },
  {
    name: "📢 Graphic Design",
    effects: [
        "Flyer Design",
        "Thumbnail Design",
    ]
  }
];