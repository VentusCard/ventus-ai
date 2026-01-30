// Optimized image assets with multiple resolutions and WebP support
export interface ImageAsset {
  id: string;
  alt: string;
  placeholder: string; // Base64 data URL for instant loading
  thumbnail: {
    webp: string;
    fallback: string;
    width: 120;
    height: 80;
  };
  medium: {
    webp: string;
    fallback: string;
    width: 800;
    height: 600;
  };
  full: {
    webp: string;
    fallback: string;
    width: 1920;
    height: 1080;
  };
}

// Tiny base64 placeholder (10x6 pixels, ~100 bytes each)
const createPlaceholder = (color: string) => 
  `data:image/svg+xml;base64,${btoa(`<svg width="10" height="6" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${color}"/></svg>`)}`;

export const optimizedGalleryImages: ImageAsset[] = [
  {
    id: "winter-sports",
    alt: "Winter Sports Excellence",
    placeholder: createPlaceholder("#1e293b"),
    thumbnail: {
      webp: "/lovable-uploads/308245bb-cfe2-442c-afaa-dbd6e3844dcc.png?auto=format&fit=crop&w=120&h=80&q=70&fm=webp",
      fallback: "/lovable-uploads/308245bb-cfe2-442c-afaa-dbd6e3844dcc.png?auto=format&fit=crop&w=120&h=80&q=80",
      width: 120,
      height: 80,
    },
    medium: {
      webp: "/lovable-uploads/308245bb-cfe2-442c-afaa-dbd6e3844dcc.png?auto=format&fit=crop&w=800&h=600&q=80&fm=webp",
      fallback: "/lovable-uploads/308245bb-cfe2-442c-afaa-dbd6e3844dcc.png?auto=format&fit=crop&w=800&h=600&q=85",
      width: 800,
      height: 600,
    },
    full: {
      webp: "/lovable-uploads/308245bb-cfe2-442c-afaa-dbd6e3844dcc.png?auto=format&w=1920&q=85&fm=webp",
      fallback: "/lovable-uploads/308245bb-cfe2-442c-afaa-dbd6e3844dcc.png?auto=format&w=1920&q=90",
      width: 1920,
      height: 1080,
    },
  },
  {
    id: "fitness-training",
    alt: "Fitness & Training",
    placeholder: createPlaceholder("#374151"),
    thumbnail: {
      webp: "/lovable-uploads/dfc26975-7c35-4b78-a434-d5d1196d940e.png?auto=format&fit=crop&w=120&h=80&q=70&fm=webp",
      fallback: "/lovable-uploads/dfc26975-7c35-4b78-a434-d5d1196d940e.png?auto=format&fit=crop&w=120&h=80&q=80",
      width: 120,
      height: 80,
    },
    medium: {
      webp: "/lovable-uploads/dfc26975-7c35-4b78-a434-d5d1196d940e.png?auto=format&fit=crop&w=800&h=600&q=80&fm=webp",
      fallback: "/lovable-uploads/dfc26975-7c35-4b78-a434-d5d1196d940e.png?auto=format&fit=crop&w=800&h=600&q=85",
      width: 800,
      height: 600,
    },
    full: {
      webp: "/lovable-uploads/dfc26975-7c35-4b78-a434-d5d1196d940e.png?auto=format&w=1920&q=85&fm=webp",
      fallback: "/lovable-uploads/dfc26975-7c35-4b78-a434-d5d1196d940e.png?auto=format&w=1920&q=90",
      width: 1920,
      height: 1080,
    },
  },
  {
    id: "mindfulness-meditation",
    alt: "Mindfulness & Meditation",
    placeholder: createPlaceholder("#4b5563"),
    thumbnail: {
      webp: "/lovable-uploads/9e3031ef-4e09-481b-9088-5c8d03bc173e.png?auto=format&fit=crop&w=120&h=80&q=70&fm=webp",
      fallback: "/lovable-uploads/9e3031ef-4e09-481b-9088-5c8d03bc173e.png?auto=format&fit=crop&w=120&h=80&q=80",
      width: 120,
      height: 80,
    },
    medium: {
      webp: "/lovable-uploads/9e3031ef-4e09-481b-9088-5c8d03bc173e.png?auto=format&fit=crop&w=800&h=600&q=80&fm=webp",
      fallback: "/lovable-uploads/9e3031ef-4e09-481b-9088-5c8d03bc173e.png?auto=format&fit=crop&w=800&h=600&q=85",
      width: 800,
      height: 600,
    },
    full: {
      webp: "/lovable-uploads/9e3031ef-4e09-481b-9088-5c8d03bc173e.png?auto=format&w=1920&q=85&fm=webp",
      fallback: "/lovable-uploads/9e3031ef-4e09-481b-9088-5c8d03bc173e.png?auto=format&w=1920&q=90",
      width: 1920,
      height: 1080,
    },
  },
  {
    id: "strength-training",
    alt: "Strength Training",
    placeholder: createPlaceholder("#6b7280"),
    thumbnail: {
      webp: "/lovable-uploads/bd88f7d0-9d63-42ae-b399-ca287fe69f2d.png?auto=format&fit=crop&w=120&h=80&q=70&fm=webp",
      fallback: "/lovable-uploads/bd88f7d0-9d63-42ae-b399-ca287fe69f2d.png?auto=format&fit=crop&w=120&h=80&q=80",
      width: 120,
      height: 80,
    },
    medium: {
      webp: "/lovable-uploads/bd88f7d0-9d63-42ae-b399-ca287fe69f2d.png?auto=format&fit=crop&w=800&h=600&q=80&fm=webp",
      fallback: "/lovable-uploads/bd88f7d0-9d63-42ae-b399-ca287fe69f2d.png?auto=format&fit=crop&w=800&h=600&q=85",
      width: 800,
      height: 600,
    },
    full: {
      webp: "/lovable-uploads/bd88f7d0-9d63-42ae-b399-ca287fe69f2d.png?auto=format&w=1920&q=85&fm=webp",
      fallback: "/lovable-uploads/bd88f7d0-9d63-42ae-b399-ca287fe69f2d.png?auto=format&w=1920&q=90",
      width: 1920,
      height: 1080,
    },
  },
  {
    id: "indoor-sports",
    alt: "Indoor Sports",
    placeholder: createPlaceholder("#9ca3af"),
    thumbnail: {
      webp: "/lovable-uploads/c36d4997-fcd2-471f-8ad4-1e1e19735d28.png?auto=format&fit=crop&w=120&h=80&q=70&fm=webp",
      fallback: "/lovable-uploads/c36d4997-fcd2-471f-8ad4-1e1e19735d28.png?auto=format&fit=crop&w=120&h=80&q=80",
      width: 120,
      height: 80,
    },
    medium: {
      webp: "/lovable-uploads/c36d4997-fcd2-471f-8ad4-1e1e19735d28.png?auto=format&fit=crop&w=800&h=600&q=80&fm=webp",
      fallback: "/lovable-uploads/c36d4997-fcd2-471f-8ad4-1e1e19735d28.png?auto=format&fit=crop&w=800&h=600&q=85",
      width: 800,
      height: 600,
    },
    full: {
      webp: "/lovable-uploads/c36d4997-fcd2-471f-8ad4-1e1e19735d28.png?auto=format&w=1920&q=85&fm=webp",
      fallback: "/lovable-uploads/c36d4997-fcd2-471f-8ad4-1e1e19735d28.png?auto=format&w=1920&q=90",
      width: 1920,
      height: 1080,
    },
  },
  // ... keeping the pattern shorter for implementation, but adding remaining images
];

// Helper function to get the appropriate image size based on viewport
export const getOptimalImageSize = (viewportWidth: number): 'thumbnail' | 'medium' | 'full' => {
  if (viewportWidth <= 768) return 'medium';
  if (viewportWidth <= 1200) return 'medium';
  return 'full';
};

// Generate remaining optimized images from the original gallery data
const originalImages = [
  { url: "/lovable-uploads/b6d8372c-d707-4e56-9f22-6d0d8e36d81a.png", alt: "Boxing & Combat Sports", id: "boxing-combat" },
  { url: "/lovable-uploads/a8585ce9-7a38-4abb-bfc0-5abe90ea24ae.png", alt: "Creative Wellness", id: "creative-wellness" },
  { url: "/lovable-uploads/573d1a6d-e0db-49ed-9065-124d596cd1ea.png", alt: "Luxury Relaxation", id: "luxury-relaxation" },
  { url: "/lovable-uploads/48325a89-81c9-4e12-a77e-7618f5dbc09d.png", alt: "Dynamic Movement", id: "dynamic-movement" },
  { url: "/lovable-uploads/1dd4830d-149d-44eb-a09f-90cec046e4cd.png", alt: "Modern Lifestyle", id: "modern-lifestyle" },
  { url: "/lovable-uploads/7feaf840-e363-4606-80e0-74ec8a23ed13.png", alt: "Skincare & Wellness", id: "skincare-wellness" },
  { url: "/lovable-uploads/ca73b416-a839-47ab-a78a-ba26dd709c9e.png", alt: "Pet Lifestyle", id: "pet-lifestyle" },
  { url: "/lovable-uploads/0e40a993-7c21-4ef2-94b6-b3eaac407470.png", alt: "Pet Fashion", id: "pet-fashion" },
  { url: "/lovable-uploads/027ba132-359e-469e-8d35-9b41a5c5388c.png", alt: "Rest & Recovery", id: "rest-recovery" },
  { url: "/lovable-uploads/5ec9b4c5-1202-416f-a433-340601f2807e.png", alt: "Social & Active", id: "social-active" },
  { url: "/lovable-uploads/1d0057ad-92c0-458d-a474-6efe94e5a8b6.png", alt: "Lifestyle & Dining", id: "lifestyle-dining" },
  { url: "/lovable-uploads/cb753400-56c0-442b-b830-7dcfecb7d63c.png", alt: "Artisanal & Crafted", id: "artisanal-crafted" },
];

// Auto-generate optimized versions for remaining images
originalImages.forEach((img, index) => {
  const colors = ["#1e293b", "#374151", "#4b5563", "#6b7280", "#9ca3af", "#d1d5db"];
  optimizedGalleryImages.push({
    id: img.id,
    alt: img.alt,
    placeholder: createPlaceholder(colors[index % colors.length]),
    thumbnail: {
      webp: `${img.url}?auto=format&fit=crop&w=120&h=80&q=70&fm=webp`,
      fallback: `${img.url}?auto=format&fit=crop&w=120&h=80&q=80`,
      width: 120,
      height: 80,
    },
    medium: {
      webp: `${img.url}?auto=format&fit=crop&w=800&h=600&q=80&fm=webp`,
      fallback: `${img.url}?auto=format&fit=crop&w=800&h=600&q=85`,
      width: 800,
      height: 600,
    },
    full: {
      webp: `${img.url}?auto=format&w=1920&q=85&fm=webp`,
      fallback: `${img.url}?auto=format&w=1920&q=90`,
      width: 1920,
      height: 1080,
    },
  });
});
