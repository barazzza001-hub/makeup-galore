import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BusinessSettings } from '../types';

const SETTINGS_COLLECTION = 'businessSettings';
const DEFAULT_DOC_ID = 'default';

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: 'JULIET_MAKEUP_GALORE💋',
  phone: '0798153264',
  whatsapp: '+254798153264',
  email: 'julietmakeupgalorebookings@gmail.com',
  website: '',
  instagram: '@julietmakeupgalore',
  tiktok: '@julietmakeupgalore',
  facebook: '',
  physicalLocation: '',
  deliveryInfo: '',
};

export async function fetchBusinessSettings(): Promise<BusinessSettings> {
  try {
    const ref = doc(db, SETTINGS_COLLECTION, DEFAULT_DOC_ID);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return {
        ...DEFAULT_BUSINESS_SETTINGS,
        ...(snap.data() as BusinessSettings),
      };
    }

    await setDoc(ref, {
      ...DEFAULT_BUSINESS_SETTINGS,
      updatedAt: Date.now(),
    });

    return DEFAULT_BUSINESS_SETTINGS;
  } catch (e) {
    console.warn('Using default business settings fallback:', e);
    return DEFAULT_BUSINESS_SETTINGS;
  }
}

export async function updateBusinessSettings(
  updates: Partial<BusinessSettings>
): Promise<BusinessSettings> {
  const current = await fetchBusinessSettings();

  const updated: BusinessSettings = {
    ...current,
    ...updates,
    updatedAt: Date.now(),
  };

  const ref = doc(db, SETTINGS_COLLECTION, DEFAULT_DOC_ID);

  await setDoc(ref, updated, { merge: true });

  return updated;
}