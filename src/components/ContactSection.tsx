import React from 'react';
import {
  MessageCircle,
  Phone,
  Mail,
  Instagram,
  Send,
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const businessName = 'JULIET_MAKEUP_GALORE💋';

  const phone = '0798153264';
  const whatsapp = '+254798153264';
  const email = 'julietmakeupgalorebookings@gmail.com';
  const instagram = 'julietmakeupgalore';
  const tiktok = 'julietmakeupgalore';

  const whatsappLink = 'https://wa.me/254798153264';
  const phoneLink = 'tel:0798153264';
  const emailLink = 'mailto:julietmakeupgalorebookings@gmail.com';
  const instagramLink = 'https://instagram.com/julietmakeupgalore';
  const tiktokLink = 'https://tiktok.com/@julietmakeupgalore';

  return (
    <section className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="px-5 pt-5 pb-3 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-pink-500 font-bold">
          Contact & Bookings
        </p>

        <h3 className="font-serif text-xl font-bold text-gray-900 mt-1">
          {businessName}
        </h3>

        <p className="text-xs text-gray-500 mt-1">
          Beauty bookings, makeup services & enquiries 💋
        </p>
      </div>

      {/* CONTACT CARDS */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
        {/* WHATSAPP */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 transition-all hover:bg-emerald-50 hover:shadow-sm active:scale-[0.98]"
        >
          <div className="flex items-start justify-between gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-600" />

            <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-600">
              WhatsApp
            </span>
          </div>

          <p className="mt-3 text-sm font-bold text-gray-900">
            WhatsApp Chat
          </p>

          <p className="mt-1 text-[11px] text-emerald-700 break-all">
            {whatsapp}
          </p>
        </a>

        {/* PHONE */}
        <a
          href={phoneLink}
          className="group rounded-2xl border border-pink-200 bg-pink-50/70 p-4 transition-all hover:bg-pink-50 hover:shadow-sm active:scale-[0.98]"
        >
          <div className="flex items-start justify-between gap-2">
            <Phone className="w-5 h-5 text-pink-600" />

            <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase text-pink-600">
              Call Us
            </span>
          </div>

          <p className="mt-3 text-sm font-bold text-gray-900">
            Phone Care
          </p>

          <p className="mt-1 text-[11px] text-pink-700">
            {phone}
          </p>
        </a>
      </div>

      {/* EMAIL */}
      <div className="px-4 pb-4">
        <a
          href={emailLink}
          className="flex items-center gap-3 rounded-2xl border border-pink-100 bg-white px-4 py-3 transition-all hover:bg-pink-50 active:scale-[0.99]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100">
            <Mail className="w-4 h-4 text-pink-600" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Email
            </p>

            <p className="text-xs font-semibold text-gray-800 break-all">
              {email}
            </p>
          </div>
        </a>
      </div>

      {/* SOCIAL MEDIA */}
      <div className="border-t border-pink-100 px-4 py-4">
        <p className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">
          Follow {businessName}
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* INSTAGRAM */}
          <a
            href={instagramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-pink-50 px-3 py-2.5 text-xs font-bold text-gray-700 transition-all hover:bg-pink-100 active:scale-[0.98]"
          >
            <Instagram className="w-4 h-4 text-pink-600" />

            <span className="truncate">
              @{instagram}
            </span>
          </a>

          {/* TIKTOK */}
          <a
            href={tiktokLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-xs font-bold text-gray-700 transition-all hover:bg-gray-100 active:scale-[0.98]"
          >
            <Send className="w-4 h-4 text-gray-800" />

            <span className="truncate">
              @{tiktok}
            </span>
          </a>
        </div>
      </div>

      {/* QUICK BOOKING */}
      <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 border-t border-pink-100 px-5 py-4 text-center">
        <p className="text-xs font-semibold text-gray-700">
          Ready for your glam? 💋
        </p>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:opacity-95 active:scale-95"
        >
          <MessageCircle className="w-4 h-4" />
          Book via WhatsApp
        </a>
      </div>
    </section>
  );
};