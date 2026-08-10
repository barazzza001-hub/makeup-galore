import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  RefreshCw,
  Sparkles,
  Zap,
  Image as ImageIcon,
  Heart,
  Sliders,
  Check,
  X,
  FlipHorizontal,
  AlertCircle,
  Download,
  Trash2,
  Wand2,
  Eye,
  Scan
} from 'lucide-react';
import { BEAUTY_PRESETS } from '../data/mockData';
import { SavedLook, BeautyPreset, TabType, Product } from '../types';
import { SavedLookCard } from './SavedLookCard';
import { SkinScanModal } from './SkinScanModal';
import { renderAdjustedCanvas } from '../utils/storage';

interface BeautyMirrorProps {
  onOpenEditor: (imageDataUrl: string) => void;
  savedLooks: SavedLook[];
  onSaveLook: (look: Omit<SavedLook, 'id' | 'createdAt'>) => void;
  onDeleteSavedLook: (id: string) => void;
  initialPresetId?: string;
  initialLipColor?: string;
  onAddToCart?: (product: Product) => void;
  setActiveTab?: (tab: TabType) => void;
}

export const BeautyMirror: React.FC<BeautyMirrorProps> = ({
  onOpenEditor,
  savedLooks,
  onSaveLook,
  onDeleteSavedLook,
  initialPresetId,
  initialLipColor,
  onAddToCart,
  setActiveTab,
}) => {
  const [subTab, setSubTab] = useState<'camera' | 'saved'>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [ringLight, setRingLight] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Selected live filters
  const [selectedPreset, setSelectedPreset] = useState<BeautyPreset>(
    BEAUTY_PRESETS.find((p) => p.id === initialPresetId) || BEAUTY_PRESETS[0]
  );
  const [selectedLipColor, setSelectedLipColor] = useState<string | null>(
    initialLipColor || '#EC4899'
  );

  // Captured state & Skin Scan modal
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [showSkinScanModal, setShowSkinScanModal] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize or restart camera
  const startCamera = async () => {
    setIsCameraLoading(true);
    setCameraError(null);

    // Stop existing stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by this browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      let msg = 'Could not access camera. Please allow camera permissions.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied. Please allow camera access in browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera device found on this device.';
      }
      setCameraError(msg);
    } finally {
      setIsCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (subTab === 'camera' && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [subTab, facingMode, capturedImage]);

  // Capture frame from video
  const handleCapture = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply mirror flip if enabled
    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.95);

    // Process adjustments & preset overlay
    try {
      const finalAdjusted = await renderAdjustedCanvas(
        rawDataUrl,
        selectedPreset.adjustments,
        {
          lipstickColor: selectedLipColor || selectedPreset.makeupOverlay?.lipstickColor,
          lipstickOpacity: selectedLipColor ? 0.45 : selectedPreset.makeupOverlay?.lipstickOpacity,
          blushColor: selectedPreset.makeupOverlay?.blushColor,
          blushOpacity: selectedPreset.makeupOverlay?.blushOpacity,
          glowIntensity: selectedPreset.makeupOverlay?.glowIntensity,
        }
      );
      setCapturedImage(finalAdjusted);
    } catch (e) {
      setCapturedImage(rawDataUrl);
    }
  };

  // Handle Photo Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onOpenEditor(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCapturedLook = () => {
    if (!capturedImage) return;
    onSaveLook({
      image: capturedImage,
      title: `${selectedPreset.name} Look ♡`,
      presetApplied: selectedPreset.name,
      adjustments: selectedPreset.adjustments,
    });
    setSaveSuccessMsg('Saved to your vanity! ♡');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Sub Tabs: BEAUTY MIRROR vs SAVED LOOKS */}
      <div className="bg-pink-50/80 p-1 rounded-2xl border border-pink-200/60 flex items-center shadow-2xs">
        <button
          onClick={() => {
            setSubTab('camera');
            setCapturedImage(null);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            subTab === 'camera'
              ? 'bg-white text-pink-600 shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Beauty Camera 💋</span>
        </button>

        <button
          onClick={() => setSubTab('saved')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            subTab === 'saved'
              ? 'bg-white text-pink-600 shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Heart className="w-4 h-4 fill-pink-500/20 text-pink-500" />
          <span>Saved Looks ({savedLooks.length})</span>
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs font-medium flex items-center justify-between shadow-xs animate-fade-in">
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            {saveSuccessMsg}
          </span>
          <button
            onClick={() => setSubTab('saved')}
            className="text-[11px] underline font-semibold text-emerald-700"
          >
            View in Vanity →
          </button>
        </div>
      )}

      {/* CAMERA TAB */}
      {subTab === 'camera' && (
        <div className="space-y-4">
          {/* Captured Photo Screen */}
          {capturedImage ? (
            <div className="bg-white rounded-3xl p-4 border border-pink-200 shadow-md space-y-4">
              <div className="relative overflow-hidden rounded-2xl bg-black aspect-3/4 shadow-inner">
                <img
                  src={capturedImage}
                  alt="Captured Selfie"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{selectedPreset.name}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={() => setShowSkinScanModal(true)}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white font-bold text-xs rounded-2xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Scan className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>✨ Analyze Skin with Gemini Skin Scan</span>
                </button>

                <button
                  onClick={() => onOpenEditor(capturedImage)}
                  className="w-full py-2.5 bg-pink-50 border border-pink-200 text-pink-700 font-semibold text-xs rounded-2xl hover:bg-pink-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wand2 className="w-4 h-4 text-pink-500" />
                  <span>Edit This Photo</span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={handleSaveCapturedLook}
                    className="py-2 bg-pink-50/60 border border-pink-200 text-pink-700 font-medium text-xs rounded-2xl hover:bg-pink-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                    <span>Save Photo</span>
                  </button>

                  <button
                    onClick={() => setCapturedImage(null)}
                    className="py-2 bg-gray-100 border border-gray-200 text-gray-700 font-medium text-xs rounded-2xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake Photo</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Live Camera Viewfinder */
            <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-lg border-2 border-pink-200 aspect-3/4 flex items-center justify-center">
              {/* Ring Light Overlay simulation */}
              {ringLight && (
                <div className="absolute inset-0 pointer-events-none rounded-3xl border-[16px] border-amber-100/40 blur-md z-20" />
              )}

              {/* Live Video */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isMirrored ? 'scale-x-[-1]' : ''
                }`}
                style={{
                  filter: `brightness(${100 + selectedPreset.adjustments.brightness}%) contrast(${
                    100 + selectedPreset.adjustments.contrast
                  }%) saturate(${100 + selectedPreset.adjustments.saturation}%)`,
                }}
              />

              {/* Live Virtual Makeup Color Tint Overlay */}
              {selectedLipColor && (
                <div
                  className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at 50% 72%, ${selectedLipColor}33 0%, transparent 25%)`,
                  }}
                />
              )}

              {/* Top Camera Controls Overlay */}
              <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between">
                <button
                  onClick={() => setIsMirrored(!isMirrored)}
                  className={`p-2.5 rounded-full backdrop-blur-md text-white text-xs font-medium transition-all cursor-pointer ${
                    isMirrored ? 'bg-pink-500/80 shadow-xs' : 'bg-black/50 hover:bg-black/70'
                  }`}
                  title="Toggle Mirror"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>

                <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{selectedPreset.name}</span>
                </div>

                <button
                  onClick={() => setRingLight(!ringLight)}
                  className={`p-2.5 rounded-full backdrop-blur-md text-white text-xs font-medium transition-all cursor-pointer ${
                    ringLight ? 'bg-amber-500/90 shadow-xs' : 'bg-black/50 hover:bg-black/70'
                  }`}
                  title="Toggle Ring Light Glow"
                >
                  <Zap className="w-4 h-4" />
                </button>
              </div>

              {/* Loading State */}
              {isCameraLoading && (
                <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white space-y-3 z-40">
                  <div className="w-10 h-10 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-medium text-pink-200">Starting Beauty Mirror...</p>
                </div>
              )}

              {/* Error State */}
              {cameraError && (
                <div className="absolute inset-0 bg-gray-900/95 p-6 flex flex-col items-center justify-center text-center text-white space-y-3 z-40">
                  <AlertCircle className="w-10 h-10 text-rose-400" />
                  <p className="text-xs text-rose-200">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-pink-500 text-white rounded-full text-xs font-semibold hover:bg-pink-600 transition-colors cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Bottom Capture Bar Overlay */}
              <div className="absolute bottom-4 left-0 right-0 z-30 px-6 flex items-center justify-between">
                {/* Import Photo Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-pink-600 transition-colors shadow-md cursor-pointer"
                  title="Import Photo"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                {/* Shutter Capture Button */}
                <button
                  onClick={handleCapture}
                  className="w-16 h-16 rounded-full bg-white p-1 shadow-xl hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 border-2 border-white flex items-center justify-center text-white">
                    <div className="w-4 h-4 bg-white rounded-full animate-ping opacity-75" />
                  </div>
                </button>

                {/* Flip Camera */}
                <button
                  onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
                  className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-pink-600 transition-colors shadow-md cursor-pointer"
                  title="Flip Camera"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Preset Looks Selector & Skin Scan Trigger */}
          {!capturedImage && (
            <div className="space-y-3 bg-white p-4 rounded-3xl border border-pink-100 shadow-xs">
              {/* Prominent Quick Skin Scan Banner */}
              <button
                onClick={async () => {
                  await handleCapture();
                  setShowSkinScanModal(true);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white font-bold text-xs rounded-2xl shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Scan className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>✨ Instant AI Skin Scan & Product Prescriptions</span>
              </button>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-serif font-bold text-gray-900 flex items-center gap-1">
                  <span>Preset Beauty Filters</span>
                  <span className="text-pink-500 text-xs">✦</span>
                </span>
                <span className="text-[10px] text-pink-600 font-medium">Swipe to choose</span>
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                {BEAUTY_PRESETS.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset)}
                      className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-medium transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-500 shadow-xs scale-105'
                          : 'bg-pink-50/60 text-gray-700 border-pink-100 hover:bg-pink-100/60'
                      }`}
                    >
                      <span>{preset.name}</span>
                      <span className="text-[9px] block opacity-85">{preset.tag}</span>
                    </button>
                  );
                })}
              </div>

              {/* Lip Shade Quick Selector */}
              <div className="pt-2 border-t border-pink-100 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">Virtual Lip Tint:</span>
                <div className="flex items-center gap-2">
                  {[
                    { name: 'Juliet Pink', hex: '#EC4899' },
                    { name: 'Rose Kiss', hex: '#BE185D' },
                    { name: 'Nairobi Velvet', hex: '#881337' },
                    { name: 'Warm Nude', hex: '#9A3412' },
                  ].map((shade) => (
                    <button
                      key={shade.name}
                      onClick={() =>
                        setSelectedLipColor(selectedLipColor === shade.hex ? null : shade.hex)
                      }
                      className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                        selectedLipColor === shade.hex ? 'border-gray-900 scale-125 shadow-xs' : 'border-white'
                      }`}
                      style={{ backgroundColor: shade.hex }}
                      title={shade.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SAVED LOOKS TAB */}
      {subTab === 'saved' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-gray-900">Your Vanity Collection</h3>
            <span className="text-xs text-pink-600 font-medium">{savedLooks.length} looks saved</span>
          </div>

          {savedLooks.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-pink-100 text-center space-y-3 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-500 mx-auto flex items-center justify-center text-2xl">
                💋
              </div>
              <h4 className="font-serif font-bold text-base text-gray-900">Your looks will live here</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Save your favorite makeup creations and come back to them anytime ♡
              </p>
              <button
                onClick={() => setSubTab('camera')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-xs font-semibold shadow-xs hover:opacity-95 transition-all cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Snap Your First Look</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              {savedLooks.map((look) => (
                <SavedLookCard
                  key={look.id}
                  look={look}
                  onOpenEditor={onOpenEditor}
                  onDelete={onDeleteSavedLook}
                />
              ))}
            </div>
          )}
        </div>
      )}
      {/* Skin Scan Modal */}
      <SkinScanModal
        imageDataUrl={capturedImage}
        isOpen={showSkinScanModal}
        onClose={() => setShowSkinScanModal(false)}
        onRetake={() => {
          setShowSkinScanModal(false);
          setCapturedImage(null);
        }}
        onAddToCart={(product) => {
          if (onAddToCart) onAddToCart(product);
        }}
        setActiveTab={(tab) => {
          if (setActiveTab) setActiveTab(tab);
        }}
      />
    </div>
  );
};
