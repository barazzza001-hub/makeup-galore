import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, Package } from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { addProductToFirestore, updateProductInFirestore } from '../services/productService';
import { showJulietToast } from './ToastNotification';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSaveSuccess: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSaveSuccess,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Lips');
  const [priceKSh, setPriceKSh] = useState<number>(1500);
  const [stock, setStock] = useState<number>(20);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [shades, setShades] = useState<{ name: string; hex: string }[]>([
    { name: 'Nairobi Red', hex: '#BE123C' },
    { name: 'Nude Velvet', hex: '#C2410C' },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setPriceKSh(productToEdit.priceKSh);
      setStock(productToEdit.stock ?? 20);
      setIsAvailable(productToEdit.isAvailable ?? true);
      setImage(productToEdit.image);
      setDescription(productToEdit.description);
      setShades(productToEdit.shades || []);
    } else {
      setName('');
      setCategory('Lips');
      setPriceKSh(1800);
      setStock(25);
      setIsAvailable(true);
      setImage('https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80');
      setDescription('');
      setShades([{ name: 'Velvet Rose', hex: '#E11D48' }]);
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddShade = () => {
    setShades((prev) => [...prev, { name: 'New Shade', hex: '#DB2777' }]);
  };

  const handleRemoveShade = (idx: number) => {
    setShades((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleShadeChange = (idx: number, field: 'name' | 'hex', val: string) => {
    setShades((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !image.trim()) {
      showJulietToast('Product name and image URL are required', 'info');
      return;
    }

    setLoading(true);

    try {
      if (productToEdit) {
        await updateProductInFirestore(productToEdit.id, {
          name: name.trim(),
          category,
          priceKSh: Number(priceKSh),
          stock: Number(stock),
          isAvailable,
          image: image.trim(),
          description: description.trim(),
          shades,
          brand: "Juliet's Makeup Galore",
        });
        showJulietToast('Product updated successfully! ✨', 'success');
      } else {
        await addProductToFirestore({
          name: name.trim(),
          category,
          priceKSh: Number(priceKSh),
          stock: Number(stock),
          isAvailable,
          image: image.trim(),
          description: description.trim(),
          shades,
          rating: 4.9,
          reviewsCount: 1,
          brand: "Juliet's Makeup Galore",
        });
        showJulietToast('New product added to inventory! 🛍️', 'success');
      }

      onSaveSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      showJulietToast('Error saving product to Firestore', 'info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl border border-pink-100 relative space-y-3 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-pink-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-gray-900 leading-tight">
                {productToEdit ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="text-[10px] text-pink-600 font-medium">
                Juliet's Firestore Inventory Management
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

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-gray-700">Product Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Silk Glow Liquid Highlighter"
              className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs focus:border-pink-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block font-bold text-gray-700">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-2.5 py-2 rounded-xl border border-pink-200 text-xs bg-white focus:border-pink-500 outline-none"
              >
                <option value="Lips">Lips</option>
                <option value="Face">Face</option>
                <option value="Eyes">Eyes</option>
                <option value="Skincare">Skincare</option>
                <option value="Brushes & Tools">Brushes & Tools</option>
                <option value="Palettes">Palettes</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-gray-700">Price (KSh) *</label>
              <input
                type="number"
                required
                value={priceKSh}
                onChange={(e) => setPriceKSh(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs focus:border-pink-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block font-bold text-gray-700">Stock Quantity *</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs focus:border-pink-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-gray-700">Availability Status</label>
              <select
                value={isAvailable ? 'true' : 'false'}
                onChange={(e) => setIsAvailable(e.target.value === 'true')}
                className="w-full px-2.5 py-2 rounded-xl border border-pink-200 text-xs bg-white outline-none"
              >
                <option value="true">Available / In Stock</option>
                <option value="false">Sold Out / Hidden</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-gray-700">Image URL *</label>
            <input
              type="text"
              required
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs focus:border-pink-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-gray-700">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product formula details..."
              className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs focus:border-pink-500 outline-none"
            />
          </div>

          {/* Shades List Editor */}
          <div className="space-y-2 bg-pink-50/50 p-3 rounded-2xl border border-pink-100">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-800">Shades ({shades.length})</label>
              <button
                type="button"
                onClick={handleAddShade}
                className="text-[11px] font-bold text-pink-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Shade</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {shades.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-pink-100">
                  <input
                    type="color"
                    value={s.hex}
                    onChange={(e) => handleShadeChange(idx, 'hex', e.target.value)}
                    className="w-6 h-6 rounded-md cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={s.name}
                    onChange={(e) => handleShadeChange(idx, 'name', e.target.value)}
                    className="flex-1 px-2 py-1 border border-pink-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveShade(idx)}
                    className="text-gray-400 hover:text-rose-500 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-bold text-xs rounded-2xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{loading ? 'Saving to Firestore...' : productToEdit ? 'Save Changes' : 'Create Product'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
