import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Undo2,
  Redo2,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  Sun,
  Contrast,
  Sliders,
  Sparkles,
  Download,
  Heart,
  Check,
  Eye,
  Wand2,
  Maximize2
} from 'lucide-react';
import { EditorAdjustments, MakeupOverlay, SavedLook, BeautyPreset } from '../types';
import { BEAUTY_PRESETS } from '../data/mockData';
import { renderAdjustedCanvas } from '../utils/storage';

interface PhotoEditorProps {
  initialImage: string;
  onClose: () => void;
  onSaveLook: (look: Omit<SavedLook, 'id' | 'createdAt'>) => void;
}

const DEFAULT_ADJUSTMENTS: EditorAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  glow: 0,
  clarity: 0,
  rotate: 0,
  flipH: false,
};

export const PhotoEditor: React.FC<PhotoEditorProps> = ({
  initialImage,
  onClose,
  onSaveLook,
}) => {
  const [adjustments, setAdjustments] = useState<EditorAdjustments>(DEFAULT_ADJUSTMENTS);
  const [makeupOverlay, setMakeupOverlay] = useState<MakeupOverlay>({
    lipstickColor: undefined,
    lipstickOpacity: 0,
    blushColor: undefined,
    blushOpacity: 0,
  });

  const [activeTab, setActiveTab] = useState<'presets' | 'adjust' | 'makeup' | 'transform'>('presets');
  const [activeSlider, setActiveSlider] = useState<keyof EditorAdjustments>('brightness');

  // History Stack
  const [history, setHistory] = useState<
    { adjustments: EditorAdjustments; makeup: MakeupOverlay }[]
  >([{ adjustments: DEFAULT_ADJUSTMENTS, makeup: { lipstickColor: undefined, lipstickOpacity: 0, blushColor: undefined, blushOpacity: 0 } }]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Hold to view original state
  const [isHoldingOriginal, setIsHoldingOriginal] = useState(false);

  // Saving state
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveTitle, setSaveTitle] = useState('Juliet Look ♡');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Push state to history stack when changes occur
  const pushHistory = (newAdj: EditorAdjustments, newMakeup: MakeupOverlay) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ adjustments: newAdj, makeup: newMakeup });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setAdjustments(prev.adjustments);
      setMakeupOverlay(prev.makeup);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setAdjustments(next.adjustments);
      setMakeupOverlay(next.makeup);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleReset = () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setMakeupOverlay({ lipstickColor: undefined, lipstickOpacity: 0, blushColor: undefined, blushOpacity: 0 });
    pushHistory(DEFAULT_ADJUSTMENTS, { lipstickColor: undefined, lipstickOpacity: 0, blushColor: undefined, blushOpacity: 0 });
  };

  const applyPreset = (preset: BeautyPreset) => {
    setAdjustments({
      ...preset.adjustments,
      rotate: adjustments.rotate,
      flipH: adjustments.flipH,
    });
    if (preset.makeupOverlay) {
      setMakeupOverlay(preset.makeupOverlay);
    }
    pushHistory(
      {
        ...preset.adjustments,
        rotate: adjustments.rotate,
        flipH: adjustments.flipH,
      },
      preset.makeupOverlay || makeupOverlay
    );
  };

  const handleSliderChange = (key: keyof EditorAdjustments, value: number) => {
    const updated = { ...adjustments, [key]: value };
    setAdjustments(updated);
  };

  const handleSliderCommit = () => {
    pushHistory(adjustments, makeupOverlay);
  };

  const handleRotate = (dir: 'left' | 'right') => {
    const delta = dir === 'left' ? -90 : 90;
    const newAngle = (adjustments.rotate + delta + 360) % 360;
    const updated = { ...adjustments, rotate: newAngle };
    setAdjustments(updated);
    pushHistory(updated, makeupOverlay);
  };

  const handleFlipH = () => {
    const updated = { ...adjustments, flipH: !adjustments.flipH };
    setAdjustments(updated);
    pushHistory(updated, makeupOverlay);
  };

  const handleFinalSave = async () => {
    setIsProcessing(true);
    try {
      const finalDataUrl = await renderAdjustedCanvas(initialImage, adjustments, makeupOverlay);
      onSaveLook({
        image: finalDataUrl,
        title: saveTitle,
        adjustments,
        makeupOverlay,
      });

      setShowSaveModal(false);
      setToastMsg('Saved to your vanity! ♡');
      setTimeout(() => {
        setToastMsg(null);
        onClose();
      }, 1200);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Compute CSS filter string for immediate preview
  const currentAdj = isHoldingOriginal ? DEFAULT_ADJUSTMENTS : adjustments;
  const previewFilter = `brightness(${100 + currentAdj.brightness}%) contrast(${
    100 + currentAdj.contrast
  }%) saturate(${100 + currentAdj.saturation}%) blur(${
    currentAdj.glow > 0 ? (currentAdj.glow / 100) * 1.5 : 0
  }px)`;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col text-white animate-fade-in">
      {/* Top Navigation / Action Bar */}
      <div className="bg-gray-900/90 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-1.5 rounded-full bg-gray-800 text-gray-300 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className={`p-2 rounded-xl border border-gray-700 transition-colors cursor-pointer ${
              historyIndex > 0 ? 'bg-gray-800 text-white hover:bg-gray-700' : 'text-gray-600 border-gray-800'
            }`}
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Redo */}
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className={`p-2 rounded-xl border border-gray-700 transition-colors cursor-pointer ${
              historyIndex < history.length - 1
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'text-gray-600 border-gray-800'
            }`}
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded-xl border border-gray-700 bg-gray-800 text-xs font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            Reset
          </button>

          {/* Save Look Button */}
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold shadow-xs hover:opacity-95 transition-all cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 fill-white" />
            <span>Save Look</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5 animate-bounce">
          <Check className="w-4 h-4" />
          {toastMsg}
        </div>
      )}

      {/* PHOTO PREVIEW STAGE */}
      <div className="flex-1 relative bg-black flex items-center justify-center p-4 overflow-hidden select-none">
        <div
          className="relative max-h-full max-w-full overflow-hidden rounded-2xl shadow-2xl transition-transform duration-300"
          style={{
            transform: `rotate(${currentAdj.rotate}deg) scaleX(${currentAdj.flipH ? -1 : 1})`,
          }}
        >
          <img
            src={initialImage}
            alt="Editing Preview"
            className="max-h-[55vh] object-contain transition-all duration-150"
            style={{
              filter: previewFilter,
            }}
          />

          {/* Live Makeup Color Tint Overlay */}
          {!isHoldingOriginal && makeupOverlay.lipstickColor && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at 50% 72%, ${makeupOverlay.lipstickColor}44 0%, transparent 25%)`,
              }}
            />
          )}

          {isHoldingOriginal && (
            <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-semibold text-amber-300 border border-amber-300/30">
              ORIGINAL PHOTO
            </div>
          )}
        </div>

        {/* Hold To See Original Floating Control */}
        <button
          onMouseDown={() => setIsHoldingOriginal(true)}
          onMouseUp={() => setIsHoldingOriginal(false)}
          onTouchStart={() => setIsHoldingOriginal(true)}
          onTouchEnd={() => setIsHoldingOriginal(false)}
          className="absolute bottom-3 right-4 z-20 bg-gray-900/80 hover:bg-gray-800 backdrop-blur-md border border-gray-700 px-3 py-1.5 rounded-full text-[11px] font-medium text-pink-300 flex items-center gap-1.5 cursor-pointer active:scale-95 select-none"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Hold for Original</span>
        </button>
      </div>

      {/* BOTTOM EDITOR CONTROLS TOOLBAR */}
      <div className="bg-gray-900 border-t border-gray-800 p-4 space-y-3">
        {/* Editor Category Tabs */}
        <div className="flex items-center justify-around border-b border-gray-800 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-1 px-3 font-semibold transition-all cursor-pointer ${
              activeTab === 'presets' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'
            }`}
          >
            Presets
          </button>
          <button
            onClick={() => setActiveTab('adjust')}
            className={`pb-1 px-3 font-semibold transition-all cursor-pointer ${
              activeTab === 'adjust' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'
            }`}
          >
            Adjust
          </button>
          <button
            onClick={() => setActiveTab('makeup')}
            className={`pb-1 px-3 font-semibold transition-all cursor-pointer ${
              activeTab === 'makeup' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'
            }`}
          >
            Virtual Makeup
          </button>
          <button
            onClick={() => setActiveTab('transform')}
            className={`pb-1 px-3 font-semibold transition-all cursor-pointer ${
              activeTab === 'transform' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'
            }`}
          >
            Transform
          </button>
        </div>

        {/* 1. PRESETS TAB */}
        {activeTab === 'presets' && (
          <div className="flex gap-2.5 overflow-x-auto py-2 no-scrollbar">
            {BEAUTY_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="shrink-0 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-2xl p-2.5 text-left transition-all cursor-pointer space-y-1 min-w-[100px]"
              >
                <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs">
                  ✨
                </div>
                <div className="font-semibold text-xs text-white truncate">{preset.name}</div>
                <div className="text-[9px] text-pink-300 opacity-80">{preset.tag}</div>
              </button>
            ))}
          </div>
        )}

        {/* 2. ADJUST TAB (Sliders) */}
        {activeTab === 'adjust' && (
          <div className="space-y-3">
            {/* Slider Selection Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              {[
                { id: 'brightness', label: 'Brightness' },
                { id: 'contrast', label: 'Contrast' },
                { id: 'saturation', label: 'Saturation' },
                { id: 'warmth', label: 'Warmth' },
                { id: 'glow', label: 'Soft Glow' },
                { id: 'clarity', label: 'Clarity' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSlider(item.id as keyof EditorAdjustments)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium shrink-0 cursor-pointer ${
                    activeSlider === item.id
                      ? 'bg-pink-500 text-white font-semibold'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Current Active Slider Control */}
            <div className="space-y-1 bg-gray-800/60 p-3 rounded-2xl border border-gray-700/50">
              <div className="flex justify-between text-xs font-medium text-gray-300">
                <span className="capitalize">{activeSlider}</span>
                <span className="text-pink-400 font-semibold">{adjustments[activeSlider]}</span>
              </div>
              <input
                type="range"
                min={activeSlider === 'glow' ? 0 : activeSlider === 'clarity' ? -50 : -100}
                max={activeSlider === 'glow' ? 100 : activeSlider === 'clarity' ? 50 : 100}
                value={adjustments[activeSlider] as number}
                onChange={(e) => handleSliderChange(activeSlider, Number(e.target.value))}
                onMouseUp={handleSliderCommit}
                onTouchEnd={handleSliderCommit}
                className="w-full accent-pink-500 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 3. VIRTUAL MAKEUP TAB */}
        {activeTab === 'makeup' && (
          <div className="space-y-3 text-xs">
            {/* Lip Tint Picker */}
            <div className="space-y-1.5">
              <span className="text-gray-300 font-medium">Velvet Lip Tint Overlay:</span>
              <div className="flex items-center gap-2">
                {[
                  { name: 'Juliet Pink', hex: '#EC4899' },
                  { name: 'Rose Kiss', hex: '#BE185D' },
                  { name: 'Nairobi Velvet', hex: '#881337' },
                  { name: 'Warm Nude', hex: '#9A3412' },
                  { name: 'Clear Glow', hex: '#FFFFFF' },
                ].map((shade) => (
                  <button
                    key={shade.name}
                    onClick={() => {
                      const newMakeup = {
                        ...makeupOverlay,
                        lipstickColor: shade.hex === '#FFFFFF' ? undefined : shade.hex,
                        lipstickOpacity: shade.hex === '#FFFFFF' ? 0 : 0.45,
                      };
                      setMakeupOverlay(newMakeup);
                      pushHistory(adjustments, newMakeup);
                    }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                      makeupOverlay.lipstickColor === shade.hex ? 'border-pink-400 scale-125' : 'border-gray-700'
                    }`}
                    style={{ backgroundColor: shade.hex }}
                    title={shade.name}
                  />
                ))}
              </div>
            </div>

            {/* Blush Tint Picker */}
            <div className="space-y-1.5 pt-2 border-t border-gray-800">
              <span className="text-gray-300 font-medium">Soft Cheek Blush Overlay:</span>
              <div className="flex items-center gap-2">
                {[
                  { name: 'Peach Bloom', hex: '#FB7185' },
                  { name: 'Rose Petal', hex: '#F472B6' },
                  { name: 'Berry Crush', hex: '#9F1239' },
                ].map((shade) => (
                  <button
                    key={shade.name}
                    onClick={() => {
                      const newMakeup = {
                        ...makeupOverlay,
                        blushColor: shade.hex,
                        blushOpacity: 0.35,
                      };
                      setMakeupOverlay(newMakeup);
                      pushHistory(adjustments, newMakeup);
                    }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                      makeupOverlay.blushColor === shade.hex ? 'border-pink-400 scale-125' : 'border-gray-700'
                    }`}
                    style={{ backgroundColor: shade.hex }}
                    title={shade.name}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. TRANSFORM TAB */}
        {activeTab === 'transform' && (
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleRotate('left')}
              className="py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-2xl flex flex-col items-center justify-center text-xs font-medium gap-1 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-pink-400" />
              <span>Rotate Left</span>
            </button>

            <button
              onClick={() => handleRotate('right')}
              className="py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-2xl flex flex-col items-center justify-center text-xs font-medium gap-1 cursor-pointer"
            >
              <RotateCw className="w-4 h-4 text-pink-400" />
              <span>Rotate Right</span>
            </button>

            <button
              onClick={handleFlipH}
              className="py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-2xl flex flex-col items-center justify-center text-xs font-medium gap-1 cursor-pointer"
            >
              <FlipHorizontal className="w-4 h-4 text-pink-400" />
              <span>Flip Horizontal</span>
            </button>
          </div>
        )}
      </div>

      {/* SAVE LOOK MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 flex items-center justify-center animate-fade-in">
          <div className="bg-white text-gray-900 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-pink-100 pb-2">
              <h3 className="font-serif font-bold text-base flex items-center gap-1.5 text-gray-900">
                <span>Save to Vanity</span>
                <span className="text-pink-500">♡</span>
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Look Title:</label>
              <input
                type="text"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="e.g. Juliet's Soft Glam ♡"
                className="w-full px-3.5 py-2 rounded-xl border border-pink-200 text-xs text-gray-800 focus:outline-none focus:border-pink-500 bg-pink-50/30"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-2xl hover:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleFinalSave}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold rounded-2xl shadow-xs hover:opacity-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Heart className="w-3.5 h-3.5 fill-white" />
                    <span>Save Look</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
