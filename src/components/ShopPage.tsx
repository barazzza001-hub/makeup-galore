import React, { useState, useEffect } from 'react';
import { ShoppingBag, Sparkles, Heart, Search, Check, ArrowRight, Wand2, Star, X, Calendar } from 'lucide-react';
import { Product, ProductCategory, TabType, CartItem, UserAccount } from '../types';
import { subscribeToProducts } from '../services/productService';
import { BookArtistDashboard } from './BookArtistDashboard';
import { showJulietToast } from './ToastNotification';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';

interface ShopPageProps {
  setActiveTab: (tab: TabType) => void;
  onTryProductInMirror: (product: Product, shadeHex: string) => void;
  currentUser?: UserAccount | null;
  cartItems?: CartItem[];
  onAddToCart?: (product: Product, shade: string) => void;
  onUpdateCartQty?: (id: string, delta: number) => void;
  onRemoveFromCart?: (id: string) => void;
  onClearCart?: () => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  setActiveTab,
  onTryProductInMirror,
  currentUser = null,
  cartItems = [],
  onAddToCart,
  onUpdateCartQty,
  onRemoveFromCart,
  onClearCart,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showBagDrawer, setShowBagDrawer] = useState<boolean>(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [showArtistBookingModal, setShowArtistBookingModal] = useState<boolean>(false);

  // Subscribe to real-time products from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToProducts((realtimeProducts) => {
      setProducts(realtimeProducts);
    });
    return () => unsubscribe();
  }, []);

  const categories = ['All', 'Lips', 'Face', 'Eyes', 'Skincare', 'Brushes & Tools', 'Palettes'];

  const filteredProducts = products.filter((product) => {
    const matchesCat = selectedCategory === 'All' || product.category === selectedCategory || (selectedCategory === 'Lips' && product.category === 'Lipstick') || (selectedCategory === 'Face' && product.category === 'Blush') || (selectedCategory === 'Eyes' && product.category === 'Eyes');
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddToBag = (product: Product, shade: string) => {
    if (onAddToCart) {
      onAddToCart(product, shade);
    }
    showJulietToast(`🛍️ Added ${product.name} (${shade}) to vanity bag!`, 'success');
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPriceKSh = cartItems.reduce((sum, item) => sum + item.product.priceKSh * item.quantity, 0);

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-5">
      {/* Shop Header Banner */}
      <section className="bg-gradient-to-r from-pink-100/90 via-rose-50 to-amber-50/80 rounded-3xl p-5 border border-pink-200/60 shadow-xs relative overflow-hidden">
        <div className="absolute top-2 right-3 text-pink-300 text-xl select-none">✦</div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 text-pink-600 text-xs font-medium mb-2 border border-pink-200 shadow-2xs">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Juliet's Makeup Shelf</span>
        </div>
        <h2 className="font-serif text-xl font-bold text-gray-900 leading-snug">
          Beauty Shelf & Collection 💋
        </h2>
        <p className="text-xs text-gray-600 mt-1 max-w-xs">
          Curated lip satin, glowing highlighters & rose blushes. Prices in Kenyan Shillings (KSh).
        </p>

        {/* Vanity Bag Trigger Button */}
        <button
          onClick={() => setShowBagDrawer(true)}
          className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 bg-white rounded-full text-xs font-semibold text-pink-700 border border-pink-200 shadow-2xs hover:bg-pink-50 transition-colors cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-pink-500" />
          <span>Vanity Bag ({totalCartCount})</span>
          {totalPriceKSh > 0 && (
            <span className="font-bold text-gray-900">· KSh {totalPriceKSh.toLocaleString()}</span>
          )}
        </button>
      </section>

      {/* TOP WIDGET BANNER FOR BOOKING ARTIST */}
      <section className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 p-0.5 rounded-2xl shadow-xs">
        <div className="bg-white rounded-[14px] p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 font-bold text-xs flex items-center justify-center shrink-0">
              💋
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-serif font-bold text-xs text-gray-900">
                  Book Juliet — Pro Artist
                </h4>
                <span className="text-[9px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full font-bold">
                  GLAM SLOTS
                </span>
              </div>
              <p className="text-[10.5px] text-gray-500 leading-tight mt-0.5">
                Bridal, Red Carpet, Shoots & Masterclasses
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowArtistBookingModal(true)}
            className="shrink-0 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-[11px] rounded-xl shadow-2xs hover:opacity-95 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Calendar className="w-3 h-3" />
            <span>Book Slot →</span>
          </button>
        </div>
      </section>

      {/* FULL ARTIST BOOKING MODAL PAGE */}
      {showArtistBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs p-3 sm:p-4 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-4 shadow-2xl relative space-y-3">
            <div className="flex items-center justify-between border-b border-pink-100 pb-2">
              <h3 className="font-serif font-bold text-sm text-gray-900 flex items-center gap-2">
                <span>💋 Reserve a Pro Session with Juliet</span>
              </h3>
              <button
                onClick={() => setShowArtistBookingModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <BookArtistDashboard />
          </div>
        </div>
      )}

      {/* Search & Category Tabs */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lipstick, blush, glow..."
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-pink-100 text-xs text-gray-800 focus:outline-none focus:border-pink-400 shadow-2xs"
          />
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-pink-500 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-pink-100 hover:bg-pink-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onTryOn={(shadeHex) => onTryProductInMirror(product, shadeHex)}
            onAddToBag={(shade) => handleAddToBag(product, shade)}
          />
        ))}
      </div>

      {/* VANITY BAG DRAWER MODAL */}
      <CartDrawer
        isOpen={showBagDrawer}
        onClose={() => setShowBagDrawer(false)}
        cartItems={cartItems}
        onUpdateQuantity={(id, delta) => onUpdateCartQty && onUpdateCartQty(id, delta)}
        onRemoveItem={(id) => onRemoveFromCart && onRemoveFromCart(id)}
        onProceedToCheckout={() => {
          setShowBagDrawer(false);
          setShowCheckoutModal(true);
        }}
      />

      {/* CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cartItems={cartItems}
        currentUser={currentUser}
        onOrderPlaced={() => {
          if (onClearCart) onClearCart();
        }}
      />
    </div>
  );
};

/* Internal Product Card Component */
const ProductCard: React.FC<{
  product: Product;
  onTryOn: (shadeHex: string) => void;
  onAddToBag: (shadeName: string) => void;
}> = ({ product, onTryOn, onAddToBag }) => {
  const [selectedShadeIndex, setSelectedShadeIndex] = useState(0);
  const currentShade = product.shades[selectedShadeIndex] || product.shades[0];

  return (
    <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden shadow-xs hover:border-pink-200 transition-all flex flex-col justify-between">
      <div>
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {product.isBestSeller && (
            <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-pink-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
              BESTSELLER ✦
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-pink-600 font-semibold uppercase tracking-wider">
              {product.category}
            </span>
            <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          <h4 className="font-semibold text-xs text-gray-900 leading-tight">{product.name}</h4>

          <p className="font-bold text-xs text-gray-900">
            KSh {product.priceKSh.toLocaleString()}
          </p>

          {/* Shades Picker */}
          <div className="pt-1 space-y-1">
            <span className="text-[9.5px] text-gray-500 block">
              Shade: <span className="font-semibold text-gray-800">{currentShade?.name}</span>
            </span>
            <div className="flex items-center gap-1.5">
              {product.shades.map((s, idx) => (
                <button
                  key={s.name}
                  onClick={() => setSelectedShadeIndex(idx)}
                  className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                    selectedShadeIndex === idx
                      ? 'border-gray-900 scale-125 shadow-2xs'
                      : 'border-white'
                  }`}
                  style={{ backgroundColor: s.hex }}
                  title={s.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Action Buttons */}
      <div className="p-3 pt-0 space-y-1.5">
        <button
          onClick={() => onTryOn(currentShade.hex)}
          className="w-full py-1.5 bg-pink-50 text-pink-700 border border-pink-200 text-[11px] font-semibold rounded-xl hover:bg-pink-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <Wand2 className="w-3 h-3 text-pink-500" />
          <span>Try On Mirror</span>
        </button>

        <button
          onClick={() => onAddToBag(currentShade.name)}
          className="w-full py-1.5 bg-gray-900 text-white text-[11px] font-semibold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <ShoppingBag className="w-3 h-3" />
          <span>Add to Bag</span>
        </button>
      </div>
    </div>
  );
};

