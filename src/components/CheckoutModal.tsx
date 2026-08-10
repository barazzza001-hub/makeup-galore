import React, { useState } from 'react';
import { X, ShoppingBag, Truck, CheckCircle2, ShieldCheck, MapPin, Phone, Mail, User } from 'lucide-react';
import { CartItem, Order, UserAccount } from '../types';
import { createOrderInFirestore } from '../services/orderService';
import { showJulietToast } from './ToastNotification';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currentUser: UserAccount | null;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currentUser,
  onOrderPlaced,
}) => {
  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState('Nairobi, Kenya');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.priceKSh * item.quantity, 0);
  const deliveryFee = 250; // Standard Nairobi Express Delivery Fee
  const total = subtotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartItems.length) return;

    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      showJulietToast('Please fill in your name, phone number, and delivery address', 'info');
      return;
    }

    setLoading(true);

    try {
      const orderItems = cartItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        shade: item.selectedShade,
        priceKSh: item.product.priceKSh,
        quantity: item.quantity,
        image: item.product.image,
      }));

      const order = await createOrderInFirestore({
        customerId: currentUser?.uid || 'guest_' + Date.now(),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || 'customer@julietsmakeupgalore.co.ke',
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        deliveryInstructions: deliveryInstructions.trim(),
        items: orderItems,
        subtotal,
        deliveryFee,
        total,
        currency: 'KSh',
      });

      setCompletedOrder(order);
      onOrderPlaced(order);
      showJulietToast(`✨ Order #${order.id} placed successfully!`, 'success');
    } catch (err: any) {
      console.error(err);
      showJulietToast('Failed to place order. Please try again.', 'info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl border border-pink-100 relative space-y-4 max-h-[90vh] overflow-y-auto">
        {completedOrder ? (
          /* Order Placed Success Screen */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="font-serif font-bold text-xl text-gray-900">
                Order Received! 🎉
              </h3>
              <p className="text-xs text-pink-600 font-bold uppercase tracking-wider mt-1">
                Order ID: #{completedOrder.id}
              </p>
            </div>

            <div className="bg-pink-50/70 p-4 rounded-2xl border border-pink-100 text-left text-xs space-y-2">
              <div className="flex justify-between font-bold text-gray-900 border-b border-pink-200 pb-2">
                <span>Total Paid / Payable:</span>
                <span className="text-pink-600">KSh {completedOrder.total.toLocaleString()}</span>
              </div>
              <p className="text-gray-700">
                <span className="font-bold">Deliver to:</span> {completedOrder.customerName} ({completedOrder.customerPhone})
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Address:</span> {completedOrder.deliveryAddress}
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                <Truck className="w-4 h-4" />
                <span>Status: {completedOrder.status} — Our team is preparing your dispatch!</span>
              </div>
            </div>

            <button
              onClick={() => {
                setCompletedOrder(null);
                onClose();
              }}
              className="w-full py-3 bg-pink-600 text-white font-bold text-xs rounded-2xl shadow-md hover:bg-pink-700 transition-all cursor-pointer"
            >
              Continue Shopping ♡
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <>
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-gray-900 leading-tight">
                    Checkout & Delivery
                  </h3>
                  <p className="text-[10px] text-pink-600 font-medium">
                    Juliet's Beauty Store Express Delivery
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order Items Summary */}
            <div className="bg-pink-50/50 p-3 rounded-2xl border border-pink-100 space-y-2">
              <h4 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">
                Order Items ({cartItems.length})
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-pink-100">
                    <div className="flex items-center gap-2">
                      <img src={item.product.image} alt={item.product.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <p className="font-semibold text-gray-900 leading-tight">{item.product.name}</p>
                        <p className="text-[10px] text-gray-500">Shade: {item.selectedShade} x {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-pink-600">KSh {(item.product.priceKSh * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-pink-200/80 text-xs space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>KSh {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee (Nairobi Express):</span>
                  <span>KSh {deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-gray-900 pt-1 border-t border-pink-200">
                  <span>Total Amount:</span>
                  <span className="text-pink-600">KSh {total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Customer Information Form */}
            <form onSubmit={handleSubmitOrder} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Juliet Wanjiku"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-pink-200 text-xs text-gray-900 focus:border-pink-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+254 7..."
                      className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-pink-200 text-xs text-gray-900 focus:border-pink-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-pink-200 text-xs text-gray-900 focus:border-pink-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">Delivery Address / Estate *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. Apartment 4B, Kilimani, Nairobi"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-pink-200 text-xs text-gray-900 focus:border-pink-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">Special Delivery Instructions</label>
                <input
                  type="text"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. Call upon arrival or leave with security"
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs text-gray-900 focus:border-pink-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-bold text-xs rounded-2xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>{loading ? 'Submitting Order...' : `Confirm & Place Order (KSh ${total.toLocaleString()})`}</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
