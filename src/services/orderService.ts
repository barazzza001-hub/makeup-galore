import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus } from '../types';

const ORDERS_COLLECTION = 'orders';

export async function createOrderInFirestore(
  orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<Order> {
  const orderId = 'JMG-' + Math.floor(100000 + Math.random() * 900000);
  const now = Date.now();

  const fullOrder: Order = {
    ...orderData,
    id: orderId,
    status: 'NEW',
    currency: 'KSh',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, ORDERS_COLLECTION, orderId), fullOrder);

  // Trigger optional order notification hook (email/WhatsApp integration point)
  triggerOrderNotificationHook(fullOrder);

  return fullOrder;
}

export async function fetchUserOrders(customerId: string): Promise<Order[]> {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('customerId', '==', customerId)
    );
    const snap = await getDocs(q);
    const orders: Order[] = [];
    snap.forEach((d) => orders.push(d.data() as Order));
    // Sort descending by date
    return orders.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    return [];
  }
}

export function subscribeToAllOrders(
  callback: (orders: Order[]) => void
): () => void {
  const q = query(collection(db, ORDERS_COLLECTION));
  return onSnapshot(
    q,
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((d) => orders.push(d.data() as Order));
      orders.sort((a, b) => b.createdAt - a.createdAt);
      callback(orders);
    },
    (error) => {
      console.warn('Snapshot error for all orders:', error);
    }
  );
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<void> {
  const ref = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(ref, {
    status: newStatus,
    updatedAt: Date.now(),
  });
}

/**
 * Service hook interface for future Email / WhatsApp / SMS notifications
 */
function triggerOrderNotificationHook(order: Order) {
  console.log('Order created notification hook triggered:', {
    orderId: order.id,
    customer: order.customerName,
    phone: order.customerPhone,
    total: order.total,
  });
}
