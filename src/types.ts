export interface SavedLook {
  id: string;
  userId?: string;
  image: string; // Base64 data URL
  originalImage?: string; // Original base64
  title: string;
  createdAt: number;
  presetApplied?: string;
  adjustments?: EditorAdjustments;
  makeupOverlay?: MakeupOverlay;
  notes?: string;
}

export interface EditorAdjustments {
  brightness: number; // -100 to 100 (default 0)
  contrast: number;   // -100 to 100 (default 0)
  saturation: number; // -100 to 100 (default 0)
  warmth: number;     // -100 to 100 (default 0)
  glow: number;       // 0 to 100 (default 0)
  clarity: number;    // -50 to 50 (default 0)
  rotate: number;     // 0, 90, 180, 270 degrees
  flipH: boolean;     // horizontal flip
}

export interface MakeupOverlay {
  lipstickColor?: string; // hex code or rgba
  lipstickOpacity?: number; // 0 to 1
  blushColor?: string;
  blushOpacity?: number;
  eyeshadowColor?: string;
  glowIntensity?: number;
}

export interface BeautyPreset {
  id: string;
  name: string;
  description: string;
  tag: string;
  adjustments: EditorAdjustments;
  makeupOverlay?: MakeupOverlay;
  thumbnailUrl?: string;
}

export type ProductCategory = 'Lips' | 'Face' | 'Eyes' | 'Skincare' | 'Brushes & Tools' | 'Palettes' | 'Lipstick' | 'Blush' | 'Glow';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  priceKSh: number;
  rating: number;
  reviewsCount: number;
  image: string;
  images?: string[];
  description: string;
  shades: { name: string; hex: string }[];
  isBestSeller?: boolean;
  stock?: number;
  isAvailable?: boolean;
  brand?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface CartItem {
  id: string; // product.id + '-' + shade
  product: Product;
  selectedShade: string;
  quantity: number;
}

export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PACKED' | 'OUT FOR DELIVERY' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  productId: string;
  productName: string;
  shade: string;
  priceKSh: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
}

export type UserRole = 'customer' | 'admin';

export interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  beautyName: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  skinType?: string;
  favoriteShade?: string;
  phone?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface BusinessSettings {
  businessName: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  physicalLocation: string;
  deliveryInfo: string;
  updatedAt?: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: '✨ Feeling Glam' | '🌸 Fresh & Natural' | '💄 Bold & Confident' | '☁️ Soft & Dreamy';
  productsUsed?: string[];
}

export interface BeautyTip {
  id: string;
  category: string;
  title: string;
  tip: string;
  author: string;
  recommendedProduct?: string;
  icon: string;
}

export interface ArtistService {
  id: string;
  name: string;
  duration: string;
  priceKSh: number;
  tagline: string;
  description: string;
  image: string;
  badge?: string;
}

export interface ArtistBooking {
  id: string;
  serviceId: string;
  serviceName: string;
  priceKSh: number;
  date: string;
  timeSlot: string;
  clientName: string;
  clientPhone: string;
  locationType: 'Studio' | 'On-Location';
  notes?: string;
  status: 'Confirmed' | 'Pending';
  createdAt: number;
}

export type TabType = 'home' | 'mirror' | 'shop' | 'me';

