import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Sparkles, ChevronLeft, ChevronRight, CheckCircle2, X, Star, CalendarCheck, Globe, ExternalLink } from 'lucide-react';
import { ArtistService, ArtistBooking } from '../types';
import { ARTIST_SERVICES } from '../data/mockData';
import { getArtistBookings, saveArtistBooking, cancelArtistBooking } from '../utils/storage';

export const BookArtistDashboard: React.FC = () => {
  const [selectedService, setSelectedService] = useState<ArtistService | null>(null);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [bookings, setBookings] = useState<ArtistBooking[]>([]);
  const [showMyBookings, setShowMyBookings] = useState<boolean>(false);

  // Form State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('11:30 AM');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [locationType, setLocationType] = useState<'Studio' | 'On-Location'>('Studio');
  const [notes, setNotes] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Carousel index for swiping
  const [activeServiceIdx, setActiveServiceIdx] = useState<number>(0);

  useEffect(() => {
    setBookings(getArtistBookings());
    // Pre-set tomorrow's date format
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const availableSlots = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:30 PM'];

  const handleOpenBooking = (service: ArtistService) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !clientName || !clientPhone) {
      alert('Please fill in your name and phone number to confirm slot.');
      return;
    }

    const newBooking = saveArtistBooking({
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      priceKSh: selectedService.priceKSh,
      date: selectedDate,
      timeSlot: selectedSlot,
      clientName,
      clientPhone,
      locationType,
      notes,
    });

    setBookings(getArtistBookings());
    setShowBookingModal(false);
    setToastMsg(`✨ Slot Confirmed for ${selectedService.name} on ${selectedDate} at ${selectedSlot}!`);
    setTimeout(() => setToastMsg(null), 3500);

    // Reset form
    setNotes('');
  };

  const handleCancelBooking = (id: string) => {
    const updated = cancelArtistBooking(id);
    setBookings(updated);
  };

  return (
    <section className="bg-gradient-to-b from-pink-500/10 via-rose-50/60 to-white rounded-3xl p-4 border border-pink-200/80 shadow-xs space-y-3 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-2 right-2 text-pink-300 text-lg select-none">✦</div>

      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            💋
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h3 className="font-serif font-bold text-sm text-gray-900">
                Book Juliet — Studio & Glam
              </h3>
              <span className="text-[9px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full font-bold">
                PRO ARTIST
              </span>
            </div>
            <p className="text-[10px] text-gray-500">
              Nairobi Head Makeup Artist · Swipe & Book Your Slot
            </p>
          </div>
        </div>

        {bookings.length > 0 && (
          <button
            onClick={() => setShowMyBookings(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-pink-200 rounded-full text-[10px] font-bold text-pink-700 shadow-2xs hover:bg-pink-50 transition-colors cursor-pointer"
          >
            <CalendarCheck className="w-3 h-3 text-pink-500" />
            <span>My Slots ({bookings.length})</span>
          </button>
        )}
      </div>

      {/* Official Artist Website & Portfolio Link Banner */}
      <div className="flex items-center justify-between bg-white/90 backdrop-blur-xs px-3 py-2 rounded-2xl border border-pink-200/80 shadow-2xs">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-gray-900 block leading-tight text-[11px]">julietmakeup.co.ke</span>
            <span className="text-[9.5px] text-gray-500">Official Portfolio & Bridal Lookbook</span>
          </div>
        </div>
        <a
          href="https://julietmakeup.co.ke"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-[10.5px] px-3 py-1 rounded-full shadow-2xs transition-all active:scale-95 cursor-pointer"
        >
          <span>Visit Site</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {toastMsg && (
        <div className="bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* SWIPEABLE SERVICES DASHBOARD */}
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar snap-x snap-mandatory">
          {ARTIST_SERVICES.map((service, idx) => (
            <div
              key={service.id}
              className="shrink-0 w-[240px] snap-center bg-white rounded-2xl border border-pink-100 p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                {/* Service Image Header */}
                <div className="relative h-24 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                  {service.badge && (
                    <span className="absolute top-1.5 left-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[8.5px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                      {service.badge}
                    </span>
                  )}
                  <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{service.duration}</span>
                  </div>
                </div>

                {/* Service Details */}
                <div>
                  <h4 className="font-bold text-xs text-gray-900 leading-tight">
                    {service.name}
                  </h4>
                  <p className="text-[10px] text-pink-600 font-medium mt-0.5">
                    {service.tagline}
                  </p>
                  <p className="text-[10.5px] font-extrabold text-gray-900 mt-1">
                    KSh {service.priceKSh.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleOpenBooking(service)}
                className="mt-2.5 w-full py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
              >
                <Calendar className="w-3 h-3" />
                <span>Book Slot</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* BOOKING MODAL */}
      {showBookingModal && selectedService && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs p-4 flex items-end sm:items-center justify-center animate-fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs">
                  💋
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-gray-900">
                    Book Juliet's Studio
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-pink-600 font-semibold">
                      {selectedService.name} · KSh {selectedService.priceKSh.toLocaleString()}
                    </p>
                    <a
                      href="https://julietmakeup.co.ke"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9.5px] text-pink-600 hover:underline flex items-center gap-0.5 font-bold"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowBookingModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleConfirmBooking} className="space-y-3 text-xs">
              {/* Select Date */}
              <div className="space-y-1">
                <label className="font-bold text-gray-800 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-pink-500" />
                  <span>Select Preferred Date:</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 bg-pink-50/50 rounded-xl border border-pink-200 text-xs font-semibold focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              {/* Time Slots */}
              <div className="space-y-1">
                <label className="font-bold text-gray-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-pink-500" />
                  <span>Select Time Slot:</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {availableSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                        selectedSlot === slot
                          ? 'bg-pink-500 text-white border-pink-500 shadow-2xs'
                          : 'bg-white text-gray-700 border-pink-100 hover:bg-pink-50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Preference */}
              <div className="space-y-1">
                <label className="font-bold text-gray-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-pink-500" />
                  <span>Session Location:</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLocationType('Studio')}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      locationType === 'Studio'
                        ? 'bg-pink-50 border-pink-500 text-pink-700 font-bold'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    <span className="block text-[11px]">📍 Studio Session</span>
                    <span className="text-[9px] text-gray-500 font-normal">Kilimani, Nairobi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocationType('On-Location')}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      locationType === 'On-Location'
                        ? 'bg-pink-50 border-pink-500 text-pink-700 font-bold'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    <span className="block text-[11px]">🚗 On-Location</span>
                    <span className="text-[9px] text-gray-500 font-normal">Your Hotel / Venue</span>
                  </button>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-2 pt-1 border-t border-pink-100">
                <div>
                  <label className="font-bold text-gray-800 block mb-0.5">Your Full Name:</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Juliet Wambui"
                    className="w-full p-2 bg-pink-50/50 rounded-xl border border-pink-200 text-xs focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-0.5">Phone / WhatsApp Number:</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="e.g. +254 712 345 678"
                    className="w-full p-2 bg-pink-50/50 rounded-xl border border-pink-200 text-xs focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-0.5">Notes / Special Requests (Optional):</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Preferred lip shades, skin allergies, or event theme..."
                    className="w-full p-2 bg-pink-50/50 rounded-xl border border-pink-200 text-xs focus:outline-none focus:border-pink-500 h-16 resize-none"
                  />
                </div>
              </div>

              {/* Confirm Button */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-bold text-xs rounded-2xl shadow-md hover:opacity-95 transition-all cursor-pointer"
              >
                Confirm Booking (KSh {selectedService.priceKSh.toLocaleString()})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MY BOOKED SLOTS DRAWER */}
      {showMyBookings && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs p-4 flex items-end sm:items-center justify-center animate-fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full max-h-[80vh] flex flex-col justify-between shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-pink-100 pb-2.5">
              <h3 className="font-serif font-bold text-base text-gray-900 flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-pink-500" />
                <span>Your Confirmed Artist Slots</span>
              </h3>
              <button
                onClick={() => setShowMyBookings(false)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="py-8 text-center space-y-1 text-gray-500 text-xs">
                <p className="font-semibold text-gray-800">No active bookings yet ♡</p>
                <p className="text-[11px]">Swipe through Juliet's services above to reserve your slot.</p>
              </div>
            ) : (
              <div className="space-y-2.5 overflow-y-auto max-h-[50vh] pr-1">
                {bookings.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] bg-pink-500 text-white font-bold px-1.5 py-0.5 rounded-full uppercase">
                          {item.status} ✦
                        </span>
                        <h4 className="font-bold text-gray-900 text-xs mt-1">{item.serviceName}</h4>
                      </div>
                      <span className="font-extrabold text-pink-600">
                        KSh {item.priceKSh.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-[10.5px] text-gray-600 space-y-0.5">
                      <p>🗓️ <strong>Date & Time:</strong> {item.date} at {item.timeSlot}</p>
                      <p>📍 <strong>Location:</strong> {item.locationType === 'Studio' ? "Juliet's Studio (Kilimani, Nairobi)" : 'Client On-Location'}</p>
                      <p>👤 <strong>Client:</strong> {item.clientName} ({item.clientPhone})</p>
                    </div>

                    <button
                      onClick={() => handleCancelBooking(item.id)}
                      className="text-[10px] text-rose-600 font-semibold underline hover:text-rose-800 cursor-pointer pt-1 block"
                    >
                      Cancel Booking
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowMyBookings(false)}
              className="w-full py-2.5 bg-gray-900 text-white font-semibold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
