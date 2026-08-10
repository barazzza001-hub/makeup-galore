import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { PRODUCTS as INITIAL_MOCK_PRODUCTS } from '../data/mockData';

const PRODUCTS_COLLECTION = 'products';

export async function fetchProductsFromFirestore(): Promise<Product[]> {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Seed default products into Firestore
      console.log('Seeding initial products into Firestore...');
      const seeded: Product[] = [];
      for (const p of INITIAL_MOCK_PRODUCTS) {
        const fullProduct: Product = {
          ...p,
          stock: 25,
          isAvailable: true,
          brand: "Juliet's Makeup Galore",
          category: (p.category === 'Lipstick' ? 'Lips' : p.category === 'Blush' ? 'Face' : p.category === 'Eyes' ? 'Eyes' : 'Glow') as any,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await setDoc(doc(db, PRODUCTS_COLLECTION, p.id), fullProduct);
        seeded.push(fullProduct);
      }
      return seeded;
    }

    const products: Product[] = [];
    querySnapshot.forEach((docSnap) => {
      products.push(docSnap.data() as Product);
    });
    return products;
  } catch (err) {
    console.error('Error fetching products from Firestore:', err);
    // Fallback to initial products if offline or permission issue
    return INITIAL_MOCK_PRODUCTS.map((p) => ({
      ...p,
      stock: 20,
      isAvailable: true,
      brand: "Juliet's Makeup Galore",
      category: p.category as any,
    }));
  }
}

export function subscribeToProducts(
  callback: (products: Product[]) => void
): () => void {
  const q = query(collection(db, PRODUCTS_COLLECTION));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        // If empty, trigger seed in background
        fetchProductsFromFirestore().then(callback);
        return;
      }
      const products: Product[] = [];
      snapshot.forEach((docSnap) => {
        products.push(docSnap.data() as Product);
      });
      callback(products);
    },
    (error) => {
      console.warn('Snapshot listener for products error:', error);
    }
  );
}

export async function addProductToFirestore(product: Omit<Product, 'id'>): Promise<Product> {
  const newId = 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const fullProduct: Product = {
    ...product,
    id: newId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await setDoc(doc(db, PRODUCTS_COLLECTION, newId), fullProduct);
  return fullProduct;
}

export async function updateProductInFirestore(
  productId: string,
  updates: Partial<Product>
): Promise<void> {
  const ref = doc(db, PRODUCTS_COLLECTION, productId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
}
