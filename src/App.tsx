import React, { useState, useEffect } from 'react';
import { TabType, SavedLook, JournalEntry, Product, CartItem, UserAccount } from './types';
import {
  getSavedLooks,
  saveLook,
  deleteSavedLook,
  getJournalEntries,
  saveJournalEntry,
  deleteJournalEntry,
} from './utils/storage';
import { INITIAL_JOURNAL_ENTRIES } from './data/mockData';
import { HeaderBar } from './components/HeaderBar';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './components/HomePage';
import { BeautyMirror } from './components/BeautyMirror';
import { PhotoEditor } from './components/PhotoEditor';
import { ShopPage } from './components/ShopPage';
import { ProfilePage } from './components/ProfilePage';
import { EditVideoModal } from './components/EditVideoModal';
import { JulietChatModal } from './components/JulietChatModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer, showJulietToast } from './components/ToastNotification';
import { initReengagementListener } from './utils/pushNotifications';
import { subscribeToAuth } from './services/authService';
import { syncLocalLooksToFirestore, fetchUserSavedLooksFromFirestore, saveLookToFirestore, deleteLookFromFirestore } from './services/savedLooksService';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Global Shopping Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Active Photo Editor Modal
  const [editingImage, setEditingImage] = useState<string | null>(null);

  // Active Video Studio Modal
  const [showVideoStudio, setShowVideoStudio] = useState<boolean>(false);

  // Active Juliet AI Chat Modal
  const [showJulietChat, setShowJulietChat] = useState<boolean>(false);

  // Mirror Pre-selection
  const [mirrorPresetId, setMirrorPresetId] = useState<string | undefined>(undefined);
  const [mirrorLipColor, setMirrorLipColor] = useState<string | undefined>(undefined);

  // Listen for Auth changes & Sync Firestore saved looks
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        // Sync local looks with Firestore
        const localLooks = getSavedLooks();
        const firestoreLooks = await syncLocalLooksToFirestore(user.uid, localLooks);
        if (firestoreLooks && firestoreLooks.length > 0) {
          setSavedLooks(firestoreLooks);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Initialize local data on mount
  useEffect(() => {
    initReengagementListener();

    const looks = getSavedLooks();
    setSavedLooks(looks);

    const journal = getJournalEntries();
    if (journal.length === 0) {
      INITIAL_JOURNAL_ENTRIES.forEach((entry) => saveJournalEntry(entry));
      setJournalEntries(getJournalEntries());
    } else {
      setJournalEntries(journal);
    }
  }, []);

  // Shopping Cart Handlers
  const handleAddToCart = (product: Product, shade: string) => {
    const itemId = `${product.id}-${shade}`;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: itemId, product, selectedShade: shade, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    showJulietToast('Item removed from vanity bag', 'info');
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Save Look Handler
  const handleSaveLook = async (lookData: Omit<SavedLook, 'id' | 'createdAt'>) => {
    const created = saveLook(lookData);
    if (currentUser) {
      await saveLookToFirestore(currentUser.uid, lookData);
      const updatedFirestoreLooks = await fetchUserSavedLooksFromFirestore(currentUser.uid);
      setSavedLooks(updatedFirestoreLooks);
    } else {
      setSavedLooks(getSavedLooks());
    }
    showJulietToast("💋 Look saved to your vanity collection!", "success");
  };

  // Delete Saved Look Handler
  const handleDeleteSavedLook = async (id: string) => {
    if (currentUser) {
      await deleteLookFromFirestore(id);
      const updatedFirestoreLooks = await fetchUserSavedLooksFromFirestore(currentUser.uid);
      setSavedLooks(updatedFirestoreLooks);
    } else {
      const updated = deleteSavedLook(id);
      setSavedLooks(updated);
    }
    showJulietToast("Look removed from your vanity", "info");
  };

  // Journal Handlers
  const handleAddJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    saveJournalEntry(entry);
    setJournalEntries(getJournalEntries());
    showJulietToast("✨ Saved to your beauty journal!", "success");
  };

  const handleDeleteJournalEntry = (id: string) => {
    const updated = deleteJournalEntry(id);
    setJournalEntries(updated);
    showJulietToast("Journal entry removed", "info");
  };

  // Photo Import Handler (for Home or Header)
  const handleImportPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditingImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Shop "Try On" Handler
  const handleTryProductInMirror = (product: Product, shadeHex: string) => {
    if (product.category === 'Lips' || product.category === 'Lipstick') {
      setMirrorLipColor(shadeHex);
    } else if (product.category === 'Face' || product.category === 'Blush') {
      setMirrorPresetId('pink-glow');
    } else if (product.category === 'Glow') {
      setMirrorPresetId('nairobi-glow');
    }
    setActiveTab('mirror');
  };

  // Video Studio "Try in Mirror" Handler
  const handleOpenMirrorWithFilter = (filterName: string) => {
    if (filterName === 'pink') setMirrorPresetId('pink-glow');
    if (filterName === 'golden') setMirrorPresetId('nairobi-glow');
    if (filterName === 'soft') setMirrorPresetId('soft-glam');
    if (filterName === 'vintage') setMirrorPresetId('evening');
    setActiveTab('mirror');
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-900 font-sans selection:bg-pink-100 selection:text-pink-700 antialiased">
      {/* Soft Toast Notification System */}
      <ToastContainer />

      {/* Header Bar */}
      <HeaderBar
        onOpenMirror={() => setActiveTab('mirror')}
        onOpenJulietChat={() => setShowJulietChat(true)}
        savedCount={savedLooks.length}
      />

      {/* Main View Router */}
      <main className="min-h-[calc(100vh-120px)]">
        {activeTab === 'home' && (
          <HomePage
            setActiveTab={setActiveTab}
            onImportPhoto={handleImportPhoto}
            onOpenVideoStudio={() => setShowVideoStudio(true)}
          />
        )}

        {activeTab === 'mirror' && (
          <BeautyMirror
            onOpenEditor={(img) => setEditingImage(img)}
            savedLooks={savedLooks}
            onSaveLook={handleSaveLook}
            onDeleteSavedLook={handleDeleteSavedLook}
            initialPresetId={mirrorPresetId}
            initialLipColor={mirrorLipColor}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'shop' && (
          <ShopPage
            setActiveTab={setActiveTab}
            onTryProductInMirror={handleTryProductInMirror}
            currentUser={currentUser}
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            onRemoveFromCart={handleRemoveFromCart}
            onClearCart={handleClearCart}
          />
        )}

        {activeTab === 'me' && (
          <ProfilePage
            savedLooks={savedLooks}
            journalEntries={journalEntries}
            onOpenEditor={(img) => setEditingImage(img)}
            onDeleteSavedLook={handleDeleteSavedLook}
            onAddJournalEntry={handleAddJournalEntry}
            onDeleteJournalEntry={handleDeleteJournalEntry}
            setActiveTab={setActiveTab}
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Juliet AI Beauty Assistant Chat Modal */}
      <JulietChatModal
        isOpen={showJulietChat}
        onClose={() => setShowJulietChat(false)}
        setActiveTab={setActiveTab}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(userAccount) => setCurrentUser(userAccount)}
      />

      {/* Photo Editor Modal */}
      {editingImage && (
        <PhotoEditor
          initialImage={editingImage}
          onClose={() => setEditingImage(null)}
          onSaveLook={handleSaveLook}
        />
      )}

      {/* Edit Video Studio Modal */}
      {showVideoStudio && (
        <EditVideoModal
          onClose={() => setShowVideoStudio(false)}
          onOpenMirrorWithFilter={handleOpenMirrorWithFilter}
        />
      )}

      {/* Persistent Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

