import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.priceKSh * item.quantity, 0);
  const deliveryFee = cartItems.length > 0 ? 250 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-sm h-full flex flex-col shadow-2xl border-l border-pink-100">
        {/* Header */}
        <div className="p-4 border-b border-pink-100 flex items-center justify-between bg-gradient-to-r from-pink-50 to-rose-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-gray-900">
                Your Vanity Bag
              </h3>
              <p className="text-[10px] text-pink-600">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)} items selected
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

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-300 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-gray-500">
                Your vanity bag is currently empty ♡
              </p>
              <p className="text-[11px] text-pink-500">
                Explore Juliet's Makeup Galore collection to discover your new holy grail!
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-pink-100 shadow-2xs"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs text-gray-900 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-[10px] text-gray-500">
                    Shade: <span className="font-bold text-pink-600">{item.selectedShade}</span>
                  </p>
                  <p className="text-xs font-bold text-gray-900 mt-1">
                    KSh {item.product.priceKSh.toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between gap-2">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-gray-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5 bg-pink-50 rounded-lg p-0.5 border border-pink-200/60">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="p-1 text-gray-600 hover:text-pink-600 rounded cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold px-1">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="p-1 text-gray-600 hover:text-pink-600 rounded cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-pink-100 bg-white space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>KSh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Express Nairobi Shipping</span>
                <span>KSh {deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-gray-900 pt-1 border-t border-pink-100">
                <span>Total</span>
                <span className="text-pink-600">KSh {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="w-full py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-bold text-xs rounded-2xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
