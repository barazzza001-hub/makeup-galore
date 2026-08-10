import React, { useState, useRef } from 'react';
import { Download, Trash2, Wand2, Eye, X, Calendar, Heart, ArrowLeft } from 'lucide-react';
import { SavedLook } from '../types';

interface SavedLookCardProps {
  look: SavedLook;
  onOpenEditor: (imageSrc: string) => void;
  onDelete: (id: string) => void;
}

export const SavedLookCard: React.FC<SavedLookCardProps> = ({
  look,
  onOpenEditor,
  onDelete,
}) => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const formattedDate = new Date(look.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = look.image;
    link.download = `juliet-makeup-look-${look.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchStartX.current = clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging.current || touchStartX.current === null) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - touchStartX.current;

    // Only allow left swipe (deltaX < 0), up to -100px
    if (deltaX < 0) {
      setOffsetX(Math.max(deltaX, -100));
    } else if (offsetX < 0) {
      // Swiping back right
      setOffsetX(Math.min(0, offsetX + deltaX));
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    touchStartX.current = null;

    // If swiped far enough left (> 60px), snap to open delete button (-75px)
    if (offsetX < -60) {
      setOffsetX(-75);
    } else {
      setOffsetX(0);
    }
  };

  const triggerDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(look.id);
    }, 250);
  };

  return (
    <>
      {/* Wrapper container for swipe-behind action */}
      <div
        className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
          isDeleting ? 'opacity-0 scale-90 max-h-0' : 'opacity-100 max-h-[350px]'
        }`}
      >
        {/* Underneath Delete Action Layer (Revealed on Swipe Left) */}
        <div className="absolute inset-0 bg-gradient-to-l from-rose-600 to-rose-500 rounded-2xl flex items-center justify-end pr-4 text-white">
          <button
            onClick={triggerDelete}
            className="flex flex-col items-center justify-center gap-1 font-bold text-[10px] text-white active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-white" />
            </div>
            <span>Delete</span>
          </button>
        </div>

        {/* Foreground Swipable Card */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          style={{ transform: `translateX(${offsetX}px)` }}
          className={`group relative bg-white rounded-2xl border border-pink-100 shadow-xs hover:border-pink-200 hover:shadow-md transition-transform duration-150 ease-out flex flex-col select-none ${
            offsetX !== 0 ? 'touch-pan-y' : ''
          }`}
        >
          {/* Swipe Left Hint Tag */}
          <div className="absolute top-2 left-2 z-10 bg-black/40 backdrop-blur-xs text-white text-[8.5px] px-1.5 py-0.5 rounded-md font-medium opacity-70 group-hover:opacity-100 pointer-events-none">
            👈 Swipe
          </div>

          {/* Thumbnail Preview */}
          <div
            className="relative aspect-3/4 overflow-hidden bg-gray-100 cursor-pointer"
            onClick={() => {
              if (offsetX === 0) setShowPreviewModal(true);
              else setOffsetX(0);
            }}
          >
            <img
              src={look.image}
              alt={look.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              draggable={false}
            />
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-[9px] px-2 py-0.5 rounded-full font-medium">
              {formattedDate}
            </div>
          </div>

          {/* Info & Actions Bar */}
          <div className="p-3 space-y-2 flex-1 flex flex-col justify-between bg-white">
            <div>
              <h4 className="font-semibold text-xs text-gray-900 truncate">{look.title}</h4>
              {look.presetApplied && (
                <span className="text-[10px] text-pink-600 font-medium block">
                  ✦ {look.presetApplied}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-pink-50 text-gray-500">
              <button
                onClick={() => onOpenEditor(look.image)}
                className="p-1.5 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors cursor-pointer"
                title="Edit Photo"
              >
                <Wand2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleDownload}
                className="p-1.5 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors cursor-pointer"
                title="Download Image"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={triggerDelete}
                className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                title="Delete Look"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Resolution Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 flex items-center justify-center animate-fade-in">
          <div className="relative bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-2">
              <h3 className="font-serif font-bold text-sm text-gray-900">{look.title}</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl aspect-3/4 bg-black">
              <img src={look.image} alt={look.title} className="w-full h-full object-cover" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  onOpenEditor(look.image);
                }}
                className="py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-xs rounded-xl shadow-xs hover:opacity-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Edit Photo</span>
              </button>

              <button
                onClick={handleDownload}
                className="py-2.5 bg-pink-50 border border-pink-200 text-pink-700 font-semibold text-xs rounded-xl hover:bg-pink-100 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

