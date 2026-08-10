import React, { useState, useRef, useEffect } from 'react';
import { X, Video, Play, Pause, Sparkles, Check, Download, Wand2 } from 'lucide-react';

interface EditVideoModalProps {
  onClose: () => void;
  onOpenMirrorWithFilter: (presetName: string) => void;
}

export const EditVideoModal: React.FC<EditVideoModalProps> = ({
  onClose,
  onOpenMirrorWithFilter,
}) => {
  const [activeFilter, setActiveFilter] = useState<'pink' | 'golden' | 'soft' | 'vintage'>('pink');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const filterStyles = {
    pink: 'brightness-105 contrast-105 saturate-125 sepia-[0.15] hue-rotate-330',
    golden: 'brightness-110 contrast-110 saturate-130 sepia-[0.35]',
    soft: 'brightness-110 contrast-95 saturate-90 blur-[0.4px]',
    vintage: 'brightness-95 contrast-120 saturate-80 sepia-[0.4]',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md p-4 flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-pink-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-gray-900">Beauty Video Studio</h3>
              <span className="text-[10px] text-purple-600 font-medium">Real-time Video Filter Studio</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Canvas Stage */}
        <div className="relative aspect-3/4 rounded-2xl bg-gray-900 overflow-hidden shadow-inner flex items-center justify-center">
          {/* Simulated Video Loop or Camera Feed */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className={`w-full h-full object-cover transition-all duration-300 ${filterStyles[activeFilter]}`}
            src="https://assets.mixkit.co/videos/preview/mixkit-woman-applying-makeup-in-front-of-a-mirror-40280-large.mp4"
          />

          {/* Recording Timer Badge */}
          {isRecording && (
            <div className="absolute top-3 left-3 bg-rose-600 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 animate-pulse shadow-md">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span>REC 00:0{recordingSeconds}s</span>
            </div>
          )}

          {/* Play/Pause overlay button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-black transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>

        {/* Video Filter Presets */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-gray-800">Select Video Filter Preset:</span>
          <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
            {[
              { id: 'pink', name: 'Pink Glow ♡' },
              { id: 'golden', name: 'Nairobi Sun' },
              { id: 'soft', name: 'Soft Focus' },
              { id: 'vintage', name: 'Vintage Chic' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`p-2 rounded-xl border transition-all cursor-pointer font-medium ${
                  activeFilter === f.id
                    ? 'bg-purple-500 text-white border-purple-500 font-bold shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-pink-50'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`py-2.5 font-semibold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>{isRecording ? 'Stop Recording' : 'Record Video'}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenMirrorWithFilter(activeFilter);
            }}
            className="py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-xs rounded-2xl shadow-xs hover:opacity-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Try in Mirror</span>
          </button>
        </div>
      </div>
    </div>
  );
};
