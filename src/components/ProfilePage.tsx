import React from 'react';
import {
  Phone,
  MessageCircle,
  Mail,
  Instagram,
  Music2,
  Sparkles,
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const businessName = 'JULIET_MAKEUP_GALORE💋';
  const phone = '0798153264';
  const whatsapp = '254798153264';
  const email = 'julietmakeupgalorebookings@gmail.com';
  const instagram = 'julietmakeupgalore';
  const tiktok = 'julietmakeupgalore';

  return (
    <section className="space-y-3">
      <div className="px-1">
        <h3 className="font-serif text-base font-bold text-gray-900 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span>CONTACT JULIET</span>
        </h3>

        <p className="text-[10px] text-gray-500 font-medium ml-5">
          Book your glam, ask a question or follow the beauty desk ♡
        </p>
      </div>

      <div className="bg-gradient-to-b from-pink-50 via-white to-rose-50 rounded-3xl p-4 border border-pink-100 shadow-xs space-y-3">

        <div className="text-center pb-2">
          <h4 className="font-serif text-lg font-bold text-gray-900">
            {businessName}
          </h4>

          <p className="text-[10px] text-pink-600 font-semibold uppercase tracking-wider mt-1">
            Beauty • Makeup • Glam
          </p>
        </div>

        <a
          href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
            'Hi Juliet Makeup Galore💋, I would like to make a booking/inquiry.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 w-full bg-green-50 border border-green-200 text-green-700 rounded-2xl px-4 py-3 hover:bg-green-100 active:scale-[0.98] transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4" />
          </div>

          <div className="text-left flex-1">
            <p className="text-xs font-bold">WhatsApp</p>
            <p className="text-[10px] text-green-600">
              +254 798 153 264
            </p>
          </div>

          <span className="text-[10px] font-bold">
            CHAT →
          </span>
        </a>

        <a
          href={`tel:${phone}`}
          className="flex items-center gap-3 w-full bg-pink-50 border border-pink-200 text-pink-700 rounded-2xl px-4 py-3 hover:bg-pink-100 active:scale-[0.98] transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-pink-500 text-white flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4" />
          </div>

          <div className="text-left flex-1">
            <p className="text-xs font-bold">Call Juliet</p>
            <p className="text-[10px] text-pink-600">
              {phone}
            </p>
          </div>

          <span className="text-[10px] font-bold">
            CALL →
          </span>
        </a>

        <a
          href={`mailto:${email}`}
          className="flex items-center gap-3 w-full bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 hover:bg-rose-100 active:scale-[0.98] transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" />
          </div>

          <div className="text-left flex-1 min-w-0">
            <p className="text-xs font-bold">Email Bookings</p>
            <p className="text-[10px] text-rose-600 truncate">
              {email}
            </p>
          </div>

          <span className="text-[10px] font-bold shrink-0">
            EMAIL →
          </span>
        </a>

        <div className="grid grid-cols-2 gap-2 pt-1">

          <a
            href={`https://www.instagram.com/${instagram}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-white border border-pink-200 text-pink-700 rounded-2xl py-3 hover:bg-pink-50 active:scale-[0.98] transition-all"
          >
            <Instagram className="w-4 h-4" />
            <span className="text-[10px] font-bold">
              Instagram
            </span>
          </a>

          <a
            href={`https://www.tiktok.com/@${tiktok}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 rounded-2xl py-3 hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            <Music2 className="w-4 h-4" />
            <span className="text-[10px] font-bold">
              TikTok
            </span>
          </a>
        </div>

        <div className="pt-1">
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
              'Hi Juliet Makeup Galore💋! I would like to book a makeup service. Please let me know the available dates and services.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl text-xs font-bold shadow-md hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>BOOK YOUR GLAM 💋</span>
          </a>
        </div>

        <p className="text-center text-[9px] text-gray-400 pt-1">
          Juliet Makeup Galore • Nairobi, Kenya
        </p>
      </div>
    </section>
  );
};