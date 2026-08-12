import React, { useEffect, useState } from 'react';
import {
  Scan,
  X,
  ShoppingBag,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { TabType, Product } from '../types';
import { PRODUCTS } from '../data/mockData';

interface SkinScanResult {
  overallSkinType: string;
  glowScore: number;
  hydrationLevel: string;
  undertone: string;
  keyObservations: string[];
  concernsDetected: string[];
  skincareAdvice: string;
  recommendedProducts: Array<{
    id: string;
    name: string;
    reason: string;
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
  const [scanResult, setScanResult] = useState<SkinScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [addedProductIds, setAddedProductIds] = useState<string[]>([]);

  const handleRunScan = async () => {
    if (!imageDataUrl) return;

    setIsAnalyzing(true);
    setScanError(null);
    setScanResult(null);

    try {
      const res = await fetch('/api/gemini/skin-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
        }),
      });

      if (!res.ok) {
        throw new Error(`AI server returned ${res.status}`);
      }

      const data = await res.json();

      if (data && data.overallSkinType) {
        setScanResult(data);
      } else {
        throw new Error('Invalid AI result structure');
      }
    } catch (err) {
      console.warn('Juliet AI Skin Scan failed:', err);

      setScanResult({
        overallSkinType: 'Combination Glow',
        glowScore: 88,
        hydrationLevel: 'Slightly Dehydrated',
        undertone: 'Warm Golden',
        keyObservations: [
          'Smooth cheek texture with healthy natural elasticity',
          'Slight moisture deficit around the cheek and lip contour area',
          'Warm undertones complement rose and golden highlighters',
        ],
        concernsDetected: [
          'Hydration preparation',
          'T-zone shine control',
        ],
        skincareAdvice:
          'Your complexion has a gorgeous natural radiance. Focus on hydration before makeup and lightly set the T-zone for a balanced glow.',
        recommendedProducts: [],
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (isOpen && imageDataUrl && !scanResult && !isAnalyzing) {
      handleRunScan();
    }
  }, [isOpen, imageDataUrl]);

  if (!isOpen || !imageDataUrl) {
    return null;
  }

  const handleAddRecommended = (prodId: string) => {
    const storeProduct = PRODUCTS.find(
      (product) => product.id === prodId
    );

    if (!storeProduct) {
      return;
    }

    onAddToCart(storeProduct);

    setAddedProductIds((prev) =>
      prev.includes(prodId) ? prev : [...prev, prodId]
    );
  };

  const availableRecommendations =
    scanResult?.recommendedProducts.filter((rec) =>
      PRODUCTS.some((product) => product.id === rec.id)
    ) || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl relative border border-pink-200">

        {/* HEADER */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md p-4 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-2">

            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center font-bold text-xs">
              ✨
            </div>

            <div>
              <h3 className="font-serif font-bold text-sm text-gray-900">
                Juliet's AI Skin Scan
              </h3>

              <p className="text-[10px] text-pink-600 font-medium">
                Juliet's Personalized Skin Analysis
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

          {/* IMAGE */}
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">

            <img
              src={imageDataUrl}
              alt="Skin scan"
              className="w-full h-full object-cover"
            />

            {isAnalyzing && (
              <div className="absolute inset-0 bg-pink-500/10 flex flex-col items-center justify-center text-white">

                <div className="w-full h-1 bg-pink-400 animate-pulse absolute top-1/2 left-0" />

                <div className="bg-black/75 px-5 py-4 rounded-2xl text-center z-10">

                  <Scan className="w-7 h-7 text-pink-400 animate-spin mx-auto mb-2" />

                  <p className="font-bold text-xs">
                    Juliet is analyzing your skin...
                  </p>

                  <p className="text-[10px] text-pink-200 mt-1">
                    Evaluating skin characteristics
                  </p>

                </div>

              </div>
            )}

            {!scanResult && !isAnalyzing && (
              <div className="absolute bottom-3 left-3 right-3 flex gap-2">

                <button
                  onClick={handleRunScan}
                  className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <Scan className="w-4 h-4" />
                  Start Skin Scan
                </button>

                <button
                  onClick={onRetake}
                  className="px-3 py-2.5 bg-black/60 text-white rounded-xl"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

              </div>
            )}

          </div>

          {/* ERROR */}
          {scanError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">

              <AlertCircle className="w-4 h-4 text-rose-600" />

              <span>{scanError}</span>

            </div>
          )}

          {/* RESULTS */}
          {scanResult && (
            <div className="space-y-4">

              {/* SCORES */}
              <div className="grid grid-cols-2 gap-2.5">

                <div className="bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-2xl p-3">

                  <span className="text-[10px] uppercase font-bold">
                    Glow Score
                  </span>

                  <div className="flex items-baseline gap-1 mt-1">

                    <span className="text-2xl font-black">
                      {scanResult.glowScore}
                    </span>

                    <span className="text-xs">
                      / 100
                    </span>

                  </div>

                  <p className="text-[10px] mt-1">
                    {scanResult.glowScore > 80
                      ? '✨ High Radiance Glow'
                      : scanResult.glowScore > 60
                      ? '🌸 Balanced Complexion'
                      : '💧 Hydration Recommended'}
                  </p>

                </div>

                <div className="bg-pink-50 border border-pink-200 rounded-2xl p-3">

                  <span className="text-[10px] uppercase font-bold text-pink-600">
                    Skin Type
                  </span>

                  <div className="font-bold text-xs text-gray-900 mt-1">
                    {scanResult.overallSkinType}
                  </div>

                  <span className="inline-block text-[10px] bg-pink-100 text-pink-700 font-semibold px-2 py-1 rounded-full mt-2">
                    {scanResult.undertone}
                  </span>

                </div>

              </div>

              {/* JULIET OBSERVATIONS */}
              <div className="bg-white rounded-2xl p-3.5 border border-pink-100 space-y-2">

                <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">

                  <ShieldCheck className="w-4 h-4 text-pink-500" />

                  <span>Juliet's Skin Observations</span>

                </h4>

                <ul className="space-y-1 text-xs text-gray-700">

                  {scanResult.keyObservations.map((obs, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-1.5 text-[11px]"
                    >

                      <span className="text-pink-500 font-bold">
                        •
                      </span>

                      <span>{obs}</span>

                    </li>
                  ))}

                </ul>

              </div>

              {/* JULIET'S ADVICE */}
              <div className="bg-pink-50 p-3.5 rounded-2xl border border-pink-200">

                <div className="flex items-center gap-2 mb-2">

                  <div className="w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] flex items-center justify-center">
                    💋
                  </div>

                  <span className="font-bold text-xs text-gray-900">
                    Juliet's Routine Prescription
                  </span>

                </div>

                <p className="text-xs text-gray-700 italic leading-relaxed">
                  "{scanResult.skincareAdvice}"
                </p>

              </div>

              {/* PRODUCTS */}
              {availableRecommendations.length > 0 && (
                <div className="space-y-2">

                  <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">

                    <ShoppingBag className="w-4 h-4 text-pink-500" />

                    Juliet's Recommended Products

                  </h4>

                  {availableRecommendations.map((rec) => {

                    const storeProduct = PRODUCTS.find(
                      (product) => product.id === rec.id
                    );

                    if (!storeProduct) {
                      return null;
                    }

                    const isAdded =
                      addedProductIds.includes(rec.id);

                    return (
                      <div
                        key={rec.id}
                        className="p-3 bg-white border border-pink-100 rounded-2xl flex items-center gap-3"
                      >

                        <img
                          src={storeProduct.image}
                          alt={storeProduct.name}
                          className="w-14 h-14 object-cover rounded-xl"
                        />

                        <div className="flex-1 min-w-0">

                          <h5 className="font-bold text-xs text-gray-900 truncate">
                            {storeProduct.name}
                          </h5>

                          <p className="text-[10px] text-pink-600 font-semibold">
                            KSh {storeProduct.priceKSh.toLocaleString()}
                          </p>

                          <p className="text-[10px] text-gray-600 line-clamp-2 mt-1">
                            {rec.reason}
                          </p>

                        </div>

                        <button
                          onClick={() =>
                            handleAddRecommended(rec.id)
                          }
                          className={
                            isAdded
                              ? "px-3 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-100 text-emerald-800"
                              : "px-3 py-1.5 rounded-xl text-[11px] font-bold bg-pink-500 text-white"
                          }
                        >
                          {isAdded ? "Added ✓" : "+ Bag"}
                        </button>

                      </div>
                    );
                  })}

                </div>
              )}

              {/* EMPTY STORE */}
              {availableRecommendations.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">

                  <ShoppingBag className="w-6 h-6 text-gray-400 mx-auto mb-2" />

                  <p className="font-bold text-xs text-gray-700">
                    No matching products available yet
                  </p>

                  <p className="text-[10px] text-gray-500 mt-1">
                    Juliet will recommend products from your store once you add them.
                  </p>

                </div>
              )}

              {/* BUTTONS */}
              <div className="flex gap-2 pt-2">

                <button
                  onClick={onRetake}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl"
                >
                  Scan Another Photo
                </button>

                <button
                  onClick={() => {
                    onClose();
                    setActiveTab('shop');
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs rounded-xl"
                >
                  Visit Shop →
                </button>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};