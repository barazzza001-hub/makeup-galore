import React, { useEffect, useState } from 'react';
import {
  Scan,
  X,
  ShoppingBag,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Camera,
  CheckCircle2,
  Info,
  Sparkles,
  Droplets,
  Sun,
  CircleDot,
} from 'lucide-react';
import { TabType, Product } from '../types';
import { PRODUCTS } from '../data/mockData';

interface SkinScanResult {
  imageQuality: {
    usable: boolean;
    score: number;
    issues: string[];
    guidance: string;
  };

  analysisConfidence: string;
  overallSkinType: string;

  radianceScore: number;
  hydrationAppearanceScore: number;
  textureEvennessScore: number;
  complexionEvennessScore: number;
  oilBalanceScore: number;

  glowScore: number;

  hydrationLevel: string;
  undertone: string;

  keyObservations: string[];
  concernsDetected: string[];

  skincareAdvice: string;

  recommendedProducts: Array<{
    productType: string;
    category: string;
    reason: string;
    availableInShop: boolean;
    shopProductId: string | null;
    shopProductName: string | null;
  }>;
}

interface SkinScanModalProps {
  imageDataUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRetake: () => void;
  onAddToCart: (product: Product) => void;
  setActiveTab: (tab: TabType) => void;
}

export const SkinScanModal: React.FC<SkinScanModalProps> = ({
  imageDataUrl,
  isOpen,
  onClose,
  onRetake,
  onAddToCart,
  setActiveTab,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] =
    useState<SkinScanResult | null>(null);
  const [scanError, setScanError] =
    useState<string | null>(null);
  const [addedProductIds, setAddedProductIds] =
    useState<string[]>([]);

  /*
  |--------------------------------------------------------------------------
  | REAL SHOP INVENTORY
  |--------------------------------------------------------------------------
  */

  const getShopProducts = () => {
    return PRODUCTS.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category || '',
      description: product.description || '',
      priceKSh: product.priceKSh,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | RUN AI SCAN
  |--------------------------------------------------------------------------
  */

  const handleRunScan = async () => {
    if (!imageDataUrl) {
      setScanError(
        'No scan image is available. Please take another photo.'
      );
      return;
    }

    setIsAnalyzing(true);
    setScanError(null);
    setScanResult(null);

    try {
      const shopProducts = getShopProducts();

      const res = await fetch('/api/gemini/skin-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          mimeType: 'image/jpeg',
          shopProducts,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error ||
            `AI server returned ${res.status}`
        );
      }

      if (
        !data ||
        typeof data.overallSkinType !== 'string' ||
        typeof data.glowScore !== 'number' ||
        typeof data.hydrationLevel !== 'string' ||
        typeof data.undertone !== 'string' ||
        !data.imageQuality ||
        !Array.isArray(data.keyObservations) ||
        !Array.isArray(data.concernsDetected) ||
        !Array.isArray(data.recommendedProducts)
      ) {
        throw new Error(
          'The AI returned an incomplete scan result.'
        );
      }

      setScanResult(data);
    } catch (err) {
      console.error(
        "Juliet AI Skin Scan failed:",
        err
      );

      setScanError(
        err instanceof Error
          ? err.message
          : 'Juliet could not complete the skin scan.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RESET WHEN IMAGE CHANGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setScanResult(null);
    setScanError(null);
    setAddedProductIds([]);
  }, [imageDataUrl]);

  /*
  |--------------------------------------------------------------------------
  | AUTOMATICALLY SCAN NEW PHOTO
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      isOpen &&
      imageDataUrl &&
      !scanResult &&
      !isAnalyzing &&
      !scanError
    ) {
      handleRunScan();
    }
  }, [isOpen, imageDataUrl]);

  if (!isOpen || !imageDataUrl) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | ADD REAL SHOP PRODUCT
  |--------------------------------------------------------------------------
  */

  const handleAddRecommended = (productId: string) => {
    const storeProduct = PRODUCTS.find(
      (product) => product.id === productId
    );

    if (!storeProduct) {
      return;
    }

    onAddToCart(storeProduct);

    setAddedProductIds((prev) =>
      prev.includes(productId)
        ? prev
        : [...prev, productId]
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SCORE LABELS
  |--------------------------------------------------------------------------
  */

  const getGlowLabel = (score: number) => {
    if (score >= 85) return '✨ High natural radiance';
    if (score >= 70) return '🌸 Healthy-looking glow';
    if (score >= 55) return '💗 Balanced radiance';
    return '💧 Your skin may benefit from extra care';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Balanced';
    return 'Needs attention';
  };

  /*
  |--------------------------------------------------------------------------
  | PHOTO INSTRUCTIONS
  |--------------------------------------------------------------------------
  */

  const PhotoInstructions = () => (
    <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4">

      <div className="flex items-start gap-3">

        <div className="w-9 h-9 rounded-full bg-pink-500 text-white flex items-center justify-center flex-shrink-0">
          <Camera className="w-4 h-4" />
        </div>

        <div>
          <h4 className="font-bold text-sm text-gray-900">
            For your best skin scan
          </h4>

          <p className="text-[11px] text-gray-600 mt-1">
            Juliet works best with a clear, natural photo.
          </p>
        </div>

      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">

        <div className="bg-white rounded-xl p-2.5 flex items-start gap-2">
          <Sun className="w-4 h-4 text-pink-500 flex-shrink-0" />
          <span className="text-[10px] text-gray-700">
            Use bright, even light
          </span>
        </div>

        <div className="bg-white rounded-xl p-2.5 flex items-start gap-2">
          <Camera className="w-4 h-4 text-pink-500 flex-shrink-0" />
          <span className="text-[10px] text-gray-700">
            Face the camera directly
          </span>
        </div>

        <div className="bg-white rounded-xl p-2.5 flex items-start gap-2">
          <CircleDot className="w-4 h-4 text-pink-500 flex-shrink-0" />
          <span className="text-[10px] text-gray-700">
            Keep your face centered
          </span>
        </div>

        <div className="bg-white rounded-xl p-2.5 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-pink-500 flex-shrink-0" />
          <span className="text-[10px] text-gray-700">
            Avoid beauty filters
          </span>
        </div>

      </div>

      <p className="text-[10px] text-gray-500 mt-3 text-center">
        Avoid strong colored lighting or heavy makeup during the scan.
      </p>

    </div>
  );

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">

      <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl relative border border-pink-200">

        {/* HEADER */}

        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md p-4 border-b border-pink-100 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center">
              ✨
            </div>

            <div>
              <h3 className="font-serif font-bold text-sm text-gray-900">
                Juliet's AI Skin Scan
              </h3>

              <p className="text-[10px] text-pink-600 font-medium">
                Your personalized skin snapshot
              </p>
            </div>

          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-pink-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

        <div className="p-4 space-y-4">

          {/* PHOTO */}

          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">

            <img
              src={imageDataUrl}
              alt="Skin scan"
              className="w-full h-full object-cover"
            />

            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-white">

                <div className="absolute top-1/2 left-0 w-full h-1 bg-pink-400 animate-pulse" />

                <div className="bg-black/85 px-6 py-5 rounded-2xl text-center z-10">

                  <Scan className="w-8 h-8 text-pink-400 animate-spin mx-auto mb-2" />

                  <p className="font-bold text-sm">
                    Juliet is analyzing your skin...
                  </p>

                  <p className="text-[10px] text-pink-200 mt-1">
                    Looking at visible skin characteristics
                  </p>

                </div>

              </div>
            )}

          </div>

          {/* PHOTO TIPS */}

          {!scanResult && !isAnalyzing && !scanError && (
            <PhotoInstructions />
          )}

          {/* ERROR */}

          {scanError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">

              <div className="flex items-start gap-2">

                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />

                <div className="flex-1">

                  <p className="font-bold text-xs text-rose-900">
                    Skin scan couldn't be completed
                  </p>

                  <p className="text-[11px] mt-1 leading-relaxed text-rose-800">
                    {scanError}
                  </p>

                </div>

              </div>

              <div className="flex gap-2 mt-3">

                <button
                  onClick={handleRunScan}
                  disabled={isAnalyzing}
                  className="flex-1 py-2.5 bg-pink-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>

                <button
                  onClick={onRetake}
                  className="flex-1 py-2.5 bg-white border border-rose-200 text-rose-700 font-bold text-xs rounded-xl"
                >
                  New Photo
                </button>

              </div>

            </div>
          )}

          {/* RESULTS */}

          {scanResult && (
            <div className="space-y-4">

              {/* BAD PHOTO */}

              {!scanResult.imageQuality.usable ? (

                <div className="space-y-3">

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">

                    <div className="flex items-start gap-3">

                      <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Camera className="w-5 h-5 text-amber-600" />
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-amber-900">
                          Let's take a clearer photo
                        </h4>

                        <p className="text-[11px] text-amber-800 mt-1">
                          Juliet couldn't reliably read the visible skin characteristics in this photo.
                        </p>
                      </div>

                    </div>

                    {scanResult.imageQuality.issues?.length > 0 && (
                      <div className="mt-3 space-y-1.5">

                        {scanResult.imageQuality.issues.map(
                          (issue, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 text-[11px] text-amber-800"
                            >
                              <span className="font-bold">
                                •
                              </span>
                              <span>{issue}</span>
                            </div>
                          )
                        )}

                      </div>
                    )}

                    <div className="mt-3 bg-white/80 rounded-xl p-3">

                      <p className="text-[10px] font-bold text-amber-900 uppercase">
                        Juliet's tip
                      </p>

                      <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                        {scanResult.imageQuality.guidance}
                      </p>

                    </div>

                  </div>

                  <PhotoInstructions />

                  <button
                    onClick={onRetake}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Take a Better Photo
                  </button>

                </div>

              ) : (

                <>

                  {/* SNAPSHOT HEADER */}

                  <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl p-5 text-white">

                    <div className="flex items-center gap-2 mb-1">

                      <Sparkles className="w-4 h-4" />

                      <span className="text-[10px] uppercase tracking-wider font-bold">
                        Juliet's Skin Analysis
                      </span>

                    </div>

                    <h2 className="text-2xl font-serif font-bold">
                      Your Skin Snapshot
                    </h2>

                    <p className="text-[10px] text-pink-100 mt-1">
                      A visual cosmetic estimate based on your captured photo.
                    </p>

                  </div>

                  {/* MAIN SCORE */}

                  <div className="bg-white border border-pink-100 rounded-3xl p-4">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-[10px] uppercase tracking-wide font-bold text-pink-600">
                          Glow Score
                        </p>

                        <div className="flex items-baseline gap-1 mt-1">

                          <span className="text-4xl font-black text-gray-900">
                            {scanResult.glowScore}
                          </span>

                          <span className="text-sm text-gray-400">
                            /100
                          </span>

                        </div>

                        <p className="text-[11px] font-semibold text-gray-600 mt-1">
                          {getGlowLabel(scanResult.glowScore)}
                        </p>

                      </div>

                      <div className="w-20 h-20 rounded-full border-8 border-pink-100 flex items-center justify-center">

                        <div className="text-center">

                          <span className="block text-lg font-black text-pink-500">
                            {scanResult.glowScore}
                          </span>

                          <span className="block text-[8px] text-gray-400 uppercase">
                            glow
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* SKIN SNAPSHOT CARDS */}

                  <div className="grid grid-cols-2 gap-2.5">

                    <div className="bg-pink-50 border border-pink-200 rounded-2xl p-3">

                      <p className="text-[9px] uppercase tracking-wide font-bold text-pink-600">
                        Skin Type
                      </p>

                      <p className="text-sm font-bold text-gray-900 mt-1">
                        {scanResult.overallSkinType}
                      </p>

                    </div>

                    <div className="bg-pink-50 border border-pink-200 rounded-2xl p-3">

                      <p className="text-[9px] uppercase tracking-wide font-bold text-pink-600">
                        Undertone
                      </p>

                      <p className="text-sm font-bold text-gray-900 mt-1">
                        {scanResult.undertone}
                      </p>

                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3">

                      <div className="flex items-center gap-1">

                        <Droplets className="w-3.5 h-3.5 text-blue-500" />

                        <p className="text-[9px] uppercase tracking-wide font-bold text-blue-600">
                          Hydration
                        </p>

                      </div>

                      <p className="text-xs font-bold text-gray-900 mt-1">
                        {scanResult.hydrationLevel}
                      </p>

                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3">

                      <p className="text-[9px] uppercase tracking-wide font-bold text-gray-500">
                        Confidence
                      </p>

                      <p className="text-xs font-bold text-gray-900 mt-1">
                        {scanResult.analysisConfidence}
                      </p>

                    </div>

                  </div>

                  {/* VISUAL COMPONENTS */}

                  <div className="bg-white border border-pink-100 rounded-2xl p-4">

                    <div className="flex items-center justify-between mb-3">

                      <h4 className="font-bold text-xs text-gray-900">
                        Your Skin Breakdown
                      </h4>

                      <span className="text-[9px] text-gray-400">
                        Visual estimates
                      </span>

                    </div>

                    <div className="space-y-3">

                      {[
                        {
                          label: 'Radiance',
                          value: scanResult.radianceScore,
                        },
                        {
                          label: 'Hydration appearance',
                          value: scanResult.hydrationAppearanceScore,
                        },
                        {
                          label: 'Texture evenness',
                          value: scanResult.textureEvennessScore,
                        },
                        {
                          label: 'Complexion evenness',
                          value: scanResult.complexionEvennessScore,
                        },
                        {
                          label: 'Oil balance',
                          value: scanResult.oilBalanceScore,
                        },
                      ].map((item) => (

                        <div key={item.label}>

                          <div className="flex justify-between mb-1">

                            <span className="text-[10px] font-medium text-gray-600">
                              {item.label}
                            </span>

                            <span className="text-[10px] font-bold text-gray-800">
                              {item.value}
                            </span>

                          </div>

                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

                            <div
                              className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full"
                              style={{
                                width: `${Math.max(
                                  0,
                                  Math.min(100, item.value)
                                )}%`,
                              }}
                            />

                          </div>

                        </div>

                      ))}

                    </div>

                  </div>

                  {/* PHOTO QUALITY */}

                  <div className="flex items-center justify-between bg-pink-50 border border-pink-100 rounded-xl px-3 py-2.5">

                    <div className="flex items-center gap-2">

                      <CheckCircle2 className="w-4 h-4 text-pink-500" />

                      <span className="text-[10px] font-semibold text-gray-700">
                        Photo quality
                      </span>

                    </div>

                    <span className="text-[10px] font-bold text-pink-600">
                      {scanResult.imageQuality.score}/100
                    </span>

                  </div>

                  {/* OBSERVATIONS */}

                  <div className="bg-white border border-pink-100 rounded-2xl p-4">

                    <h4 className="font-bold text-xs text-gray-900 flex items-center gap-2 mb-3">

                      <ShieldCheck className="w-4 h-4 text-pink-500" />

                      Juliet noticed

                    </h4>

                    <div className="space-y-2">

                      {scanResult.keyObservations.map(
                        (obs, index) => (

                          <div
                            key={index}
                            className="flex items-start gap-2.5"
                          >

                            <span className="w-5 h-5 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                              {index + 1}
                            </span>

                            <p className="text-[11px] text-gray-700 leading-relaxed">
                              {obs}
                            </p>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                  {/* AREAS TO FOCUS */}

                  {scanResult.concernsDetected.length > 0 && (

                    <div className="bg-white border border-pink-100 rounded-2xl p-4">

                      <h4 className="font-bold text-xs text-gray-900 mb-3">
                        Areas to focus on
                      </h4>

                      <div className="flex flex-wrap gap-1.5">

                        {scanResult.concernsDetected.map(
                          (concern, index) => (

                            <span
                              key={index}
                              className="text-[10px] bg-pink-50 border border-pink-100 text-pink-700 px-2.5 py-1.5 rounded-full font-medium"
                            >
                              {concern}
                            </span>

                          )
                        )}

                      </div>

                    </div>

                  )}

                  {/* JULIET ADVICE */}

                  <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4">

                    <div className="flex items-center gap-2 mb-2">

                      <div className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs">
                        💋
                      </div>

                      <div>

                        <p className="font-bold text-xs text-gray-900">
                          Juliet's Beauty Advice
                        </p>

                        <p className="text-[9px] text-pink-600">
                          Personalized from your scan
                        </p>

                      </div>

                    </div>

                    <p className="text-xs text-gray-700 italic leading-relaxed">
                      "{scanResult.skincareAdvice}"
                    </p>

                  </div>

                  {/* PRODUCTS */}

                  <div className="space-y-3">

                    <div className="flex items-center justify-between">

                      <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">

                        <ShoppingBag className="w-4 h-4 text-pink-500" />

                        What your skin may benefit from

                      </h4>

                    </div>

                    {scanResult.recommendedProducts.length > 0 ? (

                      scanResult.recommendedProducts.map(
                        (rec, index) => {

                          const available =
                            rec.availableInShop === true &&
                            !!rec.shopProductId;

                          const storeProduct =
                            available
                              ? PRODUCTS.find(
                                  (product) =>
                                    product.id ===
                                    rec.shopProductId
                                )
                              : null;

                          const isAdded =
                            storeProduct
                              ? addedProductIds.includes(
                                  storeProduct.id
                                )
                              : false;

                          return (
                            <div
                              key={`${rec.productType}-${index}`}
                              className="bg-white border border-pink-100 rounded-2xl p-3.5"
                            >

                              <div className="flex items-start gap-3">

                                {storeProduct ? (

                                  <img
                                    src={storeProduct.image}
                                    alt={storeProduct.name}
                                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                                  />

                                ) : (

                                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                                    <ShoppingBag className="w-5 h-5 text-gray-400" />
                                  </div>

                                )}

                                <div className="flex-1 min-w-0">

                                  <div className="flex items-start justify-between gap-2">

                                    <div className="min-w-0">

                                      <h5 className="font-bold text-xs text-gray-900">
                                        {available &&
                                        rec.shopProductName
                                          ? rec.shopProductName
                                          : rec.productType}
                                      </h5>

                                      <p className="text-[10px] text-gray-500 mt-0.5">
                                        {rec.category}
                                      </p>

                                    </div>

                                    {available ? (

                                      <span className="flex-shrink-0 text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                        ✓ Available in shop
                                      </span>

                                    ) : (

                                      <span className="flex-shrink-0 text-[9px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                        Not in shop
                                      </span>

                                    )}

                                  </div>

                                  {storeProduct && (
                                    <p className="text-[10px] text-pink-600 font-bold mt-1">
                                      KSh{' '}
                                      {storeProduct.priceKSh.toLocaleString()}
                                    </p>
                                  )}

                                </div>

                              </div>

                              <div className="mt-3 bg-gray-50 rounded-xl p-2.5">

                                <p className="text-[10px] text-gray-600 leading-relaxed">
                                  {rec.reason}
                                </p>

                              </div>

                              {storeProduct && (

                                <button
                                  onClick={() =>
                                    handleAddRecommended(
                                      storeProduct.id
                                    )
                                  }
                                  className={
                                    isAdded
                                      ? "w-full mt-3 py-2.5 rounded-xl text-[11px] font-bold bg-emerald-100 text-emerald-800"
                                      : "w-full mt-3 py-2.5 rounded-xl text-[11px] font-bold bg-pink-500 text-white hover:bg-pink-600 transition-colors"
                                  }
                                >
                                  {isAdded
                                    ? "Added to Bag ✓"
                                    : "+ Add to Bag"}
                                </button>

                              )}

                            </div>
                          );
                        }
                      )

                    ) : (

                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">

                        <ShoppingBag className="w-6 h-6 text-gray-400 mx-auto mb-2" />

                        <p className="font-bold text-xs text-gray-700">
                          No specific product recommendation
                        </p>

                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                          Juliet focused on your visible skin characteristics
                          rather than recommending something without enough evidence.
                        </p>

                      </div>

                    )}

                  </div>

                  {/* CONFIDENCE NOTE */}

                  <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">

                    <Info className="w-4 h-4 text-gray-500 flex-shrink-0" />

                    <p className="text-[10px] text-gray-600 leading-relaxed">
                      <strong>About this scan:</strong>{' '}
                      Juliet's analysis is a visual cosmetic estimate from
                      your photograph. It is not a medical diagnosis.
                    </p>

                  </div>

                  {/* ACTIONS */}

                  <div className="flex gap-2 pt-1">

                    <button
                      onClick={onRetake}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Scan Again
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        setActiveTab('shop');
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs rounded-xl hover:opacity-95 transition-opacity"
                    >
                      Visit Shop →
                    </button>

                  </div>

                </>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};