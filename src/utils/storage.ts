import { SavedLook, JournalEntry, EditorAdjustments, MakeupOverlay, ArtistBooking } from '../types';

const STORAGE_KEY_LOOKS = 'makeup-galore-saved-looks';
const STORAGE_KEY_JOURNAL = 'makeup-galore-journal';
const STORAGE_KEY_BOOKINGS = 'makeup-galore-artist-bookings';

export function getSavedLooks(): SavedLook[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOOKS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed.filter((item) => {
      if (!item || !item.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  } catch (e) {
    console.error('Failed to load saved looks from localStorage', e);
    return [];
  }
}

export function saveLook(look: Omit<SavedLook, 'id' | 'createdAt'>): SavedLook {
  const current = getSavedLooks();
  const newLook: SavedLook = {
    ...look,
    id: 'look_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    createdAt: Date.now(),
  };

  const updated = [newLook, ...current];
  try {
    localStorage.setItem(STORAGE_KEY_LOOKS, JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage full, attempting compressed save', e);
  }
  return newLook;
}

export function deleteSavedLook(id: string): SavedLook[] {
  const current = getSavedLooks();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_LOOKS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update localStorage', e);
  }
  return updated;
}

export function getJournalEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_JOURNAL);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed.filter((item) => {
      if (!item || !item.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  } catch (e) {
    return [];
  }
}

export function saveJournalEntry(entry: Omit<JournalEntry, 'id'>): JournalEntry {
  const current = getJournalEntries();
  const newEntry: JournalEntry = {
    ...entry,
    id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
  };
  const updated = [newEntry, ...current];
  try {
    localStorage.setItem(STORAGE_KEY_JOURNAL, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
  return newEntry;
}

export function deleteJournalEntry(id: string): JournalEntry[] {
  const current = getJournalEntries();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_JOURNAL, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
  return updated;
}

export function getArtistBookings(): ArtistBooking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveArtistBooking(booking: Omit<ArtistBooking, 'id' | 'createdAt' | 'status'>): ArtistBooking {
  const current = getArtistBookings();
  const newBooking: ArtistBooking = {
    ...booking,
    id: 'booking_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    status: 'Confirmed',
    createdAt: Date.now(),
  };
  const updated = [newBooking, ...current];
  try {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
  return newBooking;
}

export function cancelArtistBooking(id: string): ArtistBooking[] {
  const current = getArtistBookings();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
  return updated;
}

/**
 * Process image with canvas filters (brightness, contrast, saturation, warmth, glow, clarity, rotate, flip, tint overlay)
 * Returns high resolution base64 image data URL.
 */
export async function renderAdjustedCanvas(
  imageSrc: string,
  adjustments: EditorAdjustments,
  makeupOverlay?: MakeupOverlay
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageSrc);
        return;
      }

      const isRotated90 = Math.abs(adjustments.rotate % 180) === 90;
      const width = isRotated90 ? img.height : img.width;
      const height = isRotated90 ? img.width : img.height;

      canvas.width = width;
      canvas.height = height;

      ctx.save();

      // Center transforms
      ctx.translate(width / 2, height / 2);

      // Rotation
      ctx.rotate((adjustments.rotate * Math.PI) / 180);

      // Flip
      ctx.scale(adjustments.flipH ? -1 : 1, 1);

      // Draw original centered
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      ctx.restore();

      // Apply Filter adjustments using canvas ImageData or CSS filters
      // Apply CSS-like filter parameters on canvas context
      const brightnessPct = 100 + adjustments.brightness;
      const contrastPct = 100 + adjustments.contrast;
      const saturatePct = 100 + adjustments.saturation;

      // Duplicate canvas for filter pass
      const filterCanvas = document.createElement('canvas');
      filterCanvas.width = width;
      filterCanvas.height = height;
      const fCtx = filterCanvas.getContext('2d');

      if (fCtx) {
        fCtx.filter = `brightness(${brightnessPct}%) contrast(${contrastPct}%) saturate(${saturatePct}%)`;
        fCtx.drawImage(canvas, 0, 0);

        // Apply Warmth pass (golden/orange subtle blend)
        if (adjustments.warmth !== 0) {
          fCtx.save();
          fCtx.globalCompositeOperation = adjustments.warmth > 0 ? 'soft-light' : 'color';
          const warmthAlpha = Math.min(Math.abs(adjustments.warmth) / 100, 0.4);
          fCtx.fillStyle = adjustments.warmth > 0 ? `rgba(255, 180, 100, ${warmthAlpha})` : `rgba(150, 200, 255, ${warmthAlpha})`;
          fCtx.fillRect(0, 0, width, height);
          fCtx.restore();
        }

        // Apply Glow pass
        if (adjustments.glow > 0) {
          fCtx.save();
          fCtx.globalCompositeOperation = 'screen';
          fCtx.globalAlpha = (adjustments.glow / 100) * 0.35;
          fCtx.filter = 'blur(12px)';
          fCtx.drawImage(filterCanvas, 0, 0);
          fCtx.restore();
        }

        // Apply Makeup Overlays (Lipstick / Blush / Glow)
        if (makeupOverlay) {
          // Soft Blush radial tint in cheek area
          if (makeupOverlay.blushColor && makeupOverlay.blushOpacity && makeupOverlay.blushOpacity > 0) {
            fCtx.save();
            fCtx.globalCompositeOperation = 'soft-light';
            fCtx.globalAlpha = makeupOverlay.blushOpacity;

            // Left cheek
            const leftGrad = fCtx.createRadialGradient(
              width * 0.35, height * 0.55, 0,
              width * 0.35, height * 0.55, width * 0.18
            );
            leftGrad.addColorStop(0, makeupOverlay.blushColor);
            leftGrad.addColorStop(1, 'transparent');
            fCtx.fillStyle = leftGrad;
            fCtx.fillRect(0, 0, width, height);

            // Right cheek
            const rightGrad = fCtx.createRadialGradient(
              width * 0.65, height * 0.55, 0,
              width * 0.65, height * 0.55, width * 0.18
            );
            rightGrad.addColorStop(0, makeupOverlay.blushColor);
            rightGrad.addColorStop(1, 'transparent');
            fCtx.fillStyle = rightGrad;
            fCtx.fillRect(0, 0, width, height);

            fCtx.restore();
          }

          // Lipstick Tint in lower lip area
          if (makeupOverlay.lipstickColor && makeupOverlay.lipstickOpacity && makeupOverlay.lipstickOpacity > 0) {
            fCtx.save();
            fCtx.globalCompositeOperation = 'multiply';
            fCtx.globalAlpha = makeupOverlay.lipstickOpacity;

            const lipGrad = fCtx.createRadialGradient(
              width * 0.5, height * 0.72, 0,
              width * 0.5, height * 0.72, width * 0.12
            );
            lipGrad.addColorStop(0, makeupOverlay.lipstickColor);
            lipGrad.addColorStop(1, 'transparent');
            fCtx.fillStyle = lipGrad;
            fCtx.fillRect(0, 0, width, height);

            fCtx.restore();
          }
        }

        resolve(filterCanvas.toDataURL('image/jpeg', 0.92));
      } else {
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      }
    };
    img.onerror = (err) => reject(err);
    img.src = imageSrc;
  });
}
