import React, { useEffect, useState } from 'react';
import { Phone, MessageCircle, Mail, MapPin, Globe, Instagram, Truck, Sparkles, Send } from 'lucide-react';
import { BusinessSettings } from '../types';
import { fetchBusinessSettings } from '../services/businessService';

export const ContactSection: React.FC = () => {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    fetchBusinessSettings().then(setSettings);
  }, []);

  if (!settings) return null;

  const whatsappClean = settings.whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 border border-pink-100 shadow-xs space-y-3.5">
      <div className="flex items-center gap-2 border-b border-pink-100 pb-2">
        <div className="w-8 h-8 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-pink-500" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-sm text-gray-900 leading-tight">
            Contact {settings.businessName}
          </h3>
          <p className="text-[10px] text-gray-500">
            Beauty consultations, wholesale orders & customer care
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* WhatsApp Direct */}
        <a
          href={`https://wa.me/${whatsappClean}?text=Hello%20Juliet!%20I%20have%20an%20inquiry%20about%20a%20makeup%20product%20♡`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 flex flex-col justify-between transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <MessageCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-600 bg-white/80 px-1.5 py-0.5 rounded-md">
              Instant
            </span>
          </div>
          <div className="mt-2">
            <span className="font-bold text-[11px] block">WhatsApp Chat</span>
            <span className="text-[10px] text-emerald-700">{settings.whatsapp}</span>
          </div>
        </a>

        {/* Phone Direct */}
        <a
          href={`tel:${settings.phone}`}
          className="p-3 rounded-2xl bg-pink-50 hover:bg-pink-100/80 border border-pink-200 text-pink-900 flex flex-col justify-between transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <Phone className="w-4 h-4 text-pink-600 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-pink-600 bg-white/80 px-1.5 py-0.5 rounded-md">
              Call Us
            </span>
          </div>
          <div className="mt-2">
            <span className="font-bold text-[11px] block">Phone Care</span>
            <span className="text-[10px] text-pink-700">{settings.phone}</span>
          </div>
        </a>
      </div>

      {/* Details List */}
      <div className="bg-pink-50/40 p-3 rounded-2xl border border-pink-100 text-xs space-y-2">
        <div className="flex items-start gap-2 text-gray-700">
          <MapPin className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-gray-900 block">Physical Studio Location</span>
            <span className="text-[11px]">{settings.physicalLocation}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-gray-700 pt-1 border-t border-pink-100">
          <Truck className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-gray-900 block">Delivery Policy</span>
            <span className="text-[11px] leading-relaxed">{settings.deliveryInfo}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-700 pt-1 border-t border-pink-100">
          <Mail className="w-4 h-4 text-pink-500 shrink-0" />
          <span className="font-medium">{settings.email}</span>
        </div>
      </div>

      {/* Social Links */}
      <div className="flex items-center justify-around pt-1 text-[11px] font-bold text-gray-600 border-t border-pink-100">
        <span className="flex items-center gap-1">
          <Instagram className="w-3.5 h-3.5 text-pink-600" />
          <span>{settings.instagram}</span>
        </span>
        <span className="text-pink-300">·</span>
        <span className="flex items-center gap-1">
          <Send className="w-3.5 h-3.5 text-pink-600" />
          <span>{settings.tiktok}</span>
        </span>
      </div>
    </div>
  );
};
