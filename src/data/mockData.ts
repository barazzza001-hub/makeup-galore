import { Product, BeautyTip, BeautyPreset, ArtistService } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'prod_001',
    name: 'Hydrating Primer Serum',
    category: 'Skincare',
    priceKSh: 1200,
    rating: 4.8,
    reviewsCount: 24,
    image: '/images/hydrating-primer.jpg',
    images: ['/images/hydrating-primer.jpg'],
    description:
      'A lightweight hydrating primer serum that helps prepare the skin for smooth makeup application.',
    shades: [{ name: 'Universal', hex: '#F3D5C0' }],
    isBestSeller: true,
    stock: 20,
    isAvailable: true,
    brand: "Juliet's Beauty",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'prod_002',
    name: 'Nairobi Glow Liquid Highlighter',
    category: 'Glow',
    priceKSh: 1500,
    rating: 4.9,
    reviewsCount: 31,
    image: '/images/nairobi-glow-highlighter.jpg',
    images: ['/images/nairobi-glow-highlighter.jpg'],
    description:
      'A radiant liquid highlighter designed to give the cheekbones a beautiful golden glow.',
    shades: [
      { name: 'Golden Glow', hex: '#D9A441' },
      { name: 'Rose Glow', hex: '#D8898F' },
    ],
    isBestSeller: true,
    stock: 15,
    isAvailable: true,
    brand: "Juliet's Beauty",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'prod_003',
    name: 'Matte Finish Setting Powder',
    category: 'Face',
    priceKSh: 1000,
    rating: 4.7,
    reviewsCount: 18,
    image: '/images/matte-setting-powder.jpg',
    images: ['/images/matte-setting-powder.jpg'],
    description:
      'A lightweight setting powder designed to reduce excess shine while keeping makeup looking fresh.',
    shades: [{ name: 'Translucent', hex: '#E8D8C8' }],
    stock: 25,
    isAvailable: true,
    brand: "Juliet's Beauty",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export const BEAUTY_TIPS: BeautyTip[] = [
  {
    id: 'tip_001',
    category: 'Skincare',
    title: 'Prep Before You Glow',
    tip: 'Start with clean, moisturized skin before applying makeup.',
    author: "Juliet's Beauty",
    recommendedProduct: 'prod_001',
    icon: '✨',
  },
  {
    id: 'tip_002',
    category: 'Glow',
    title: 'Make Your Glow Look Natural',
    tip: 'Apply liquid highlighter to the high points of your cheekbones for a soft natural glow.',
    author: "Juliet's Beauty",
    recommendedProduct: 'prod_002',
    icon: '💋',
  },
  {
    id: 'tip_003',
    category: 'Makeup',
    title: 'Control T-Zone Shine',
    tip: 'Use a small amount of setting powder around the forehead, nose and chin.',
    author: "Juliet's Beauty",
    recommendedProduct: 'prod_003',
    icon: '🌸',
  },
];

export const BEAUTY_PRESETS: BeautyPreset[] = [
  {
    id: 'preset_001',
    name: 'Soft Glow',
    description: 'A soft, natural Juliet glow.',
    tag: 'Natural',
    adjustments: {
      brightness: 5,
      contrast: 3,
      saturation: 5,
      warmth: 5,
      glow: 15,
      clarity: 3,
      rotate: 0,
      flipH: false,
    },
    makeupOverlay: {
      glowIntensity: 15,
    },
  },
  {
    id: 'preset_002',
    name: 'Rosy Kiss',
    description: 'A soft rosy beauty look.',
    tag: 'Rosy',
    adjustments: {
      brightness: 3,
      contrast: 2,
      saturation: 8,
      warmth: 2,
      glow: 12,
      clarity: 2,
      rotate: 0,
      flipH: false,
    },
    makeupOverlay: {
      lipstickColor: '#C96F83',
      lipstickOpacity: 0.35,
      blushColor: '#E58B9B',
      blushOpacity: 0.3,
      glowIntensity: 12,
    },
  },
  {
    id: 'preset_003',
    name: 'Golden Glam',
    description: 'Warm golden tones for a glam finish.',
    tag: 'Glam',
    adjustments: {
      brightness: 6,
      contrast: 5,
      saturation: 10,
      warmth: 12,
      glow: 20,
      clarity: 4,
      rotate: 0,
      flipH: false,
    },
    makeupOverlay: {
      eyeshadowColor: '#C9954A',
      glowIntensity: 20,
    },
  },
];

export const ARTIST_SERVICES: ArtistService[] = [
  {
    id: 'service_001',
    name: 'Bridal Glam & Touchup',
    duration: '3 hours',
    priceKSh: 8500,
    tagline: 'Your perfect bridal glow.',
    description:
      'Complete bridal makeup with professional skin preparation and touch-ups.',
    image: '/images/bridal-glam.jpg',
    badge: 'Popular',
  },
  {
    id: 'service_002',
    name: 'Evening & Red Carpet Glam',
    duration: '2 hours',
    priceKSh: 5000,
    tagline: 'Glamorous and camera ready.',
    description:
      'A polished makeup look for events, parties and special occasions.',
    image: '/images/evening-glam.jpg',
    badge: 'Glam',
  },
  {
    id: 'service_003',
    name: 'Editorial & Studio Photoshoot',
    duration: '2.5 hours',
    priceKSh: 6500,
    tagline: 'Make every frame count.',
    description:
      'Professional makeup designed specifically for photography and studio lighting.',
    image: '/images/editorial-makeup.jpg',
    badge: 'Creative',
  },
  {
    id: 'service_004',
    name: '1-on-1 Personal Beauty Masterclass',
    duration: '2 hours',
    priceKSh: 4000,
    tagline: 'Learn your own face.',
    description:
      'A personalized makeup lesson teaching you techniques suited to your features.',
    image: '/images/beauty-masterclass.jpg',
    badge: 'Learn',
  },
];
export const INITIAL_JOURNAL_ENTRIES = [];