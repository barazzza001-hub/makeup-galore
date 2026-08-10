# Juliet's Makeup Galore 💄✨

A girl's digital makeup desk, interactive beauty mirror, virtual vanity, photo editor, and e-commerce beauty store built with React, TypeScript, Tailwind CSS, Express, and Firebase.

---

## 🌟 Overview & Features

**Juliet's Makeup Galore** combines virtual beauty studio tools with an integrated e-commerce shop:

- 🪞 **Virtual Vanity & Beauty Mirror**: Real-time camera feed with interactive virtual makeup application, color customizers, lip, eye, and cheek adjustments.
- 📸 **Photo Editor & Look Capture**: Snapshot tools, beauty filters, lighting presets, sticker layers, and saved makeup look cards.
- 💄 **E-Commerce Beauty Store**: Full product catalog, category filtering, search, cart management, price calculation, and order checkout.
- 👤 **Account & Order History**: User profile dashboard, order tracking, address saved details, and synced saved looks.
- ⚡ **Admin Dashboard**: Manage shop catalog, create/edit/delete products with custom attributes, stock counts, and configure store settings in real time.
- 🔒 **Firebase Authentication & Firestore Persistence**: Dynamic sync for users, orders, saved looks, and product catalog with Firestore security rules.
- 🤖 **AI Studio Integration**: Server-side Gemini AI service endpoints prepared for smart beauty recommendation engines, shade matching, and look analysis.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion / Framer Motion
- **Backend & Server**: Node.js, Express, `tsx`, `esbuild`
- **Database & Auth**: Firebase Auth, Google Firestore (`firebase-blueprint.json`, `firestore.rules`)
- **AI Integration**: Google Gen AI SDK (`@google/genai`)
- **Build Tooling**: Vite 6, TypeScript

---

## 🚀 Getting Started locally in Cursor

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- `npm` or `bun`

### 2. Installation & Setup
1. Clone or extract this project folder into your local environment.
2. Open the directory in **Cursor** or VS Code:
   ```bash
   cd juliets-makeup-galore
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### 3. Environment Variables
Create a `.env` file in the project root based on `.env.example`:

```env
# Gemini API Key (Required for AI Features)
GEMINI_API_KEY="your_gemini_api_key_here"

# Application URL
APP_URL="http://localhost:3000"

# Firebase Client Configuration (if using custom Firebase Project)
VITE_FIREBASE_API_KEY="your_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_project_id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
```

### 4. Running the Application
To run the development server (runs full-stack Express server with Vite middleware on port 3000):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
.
├── src/
│   ├── components/       # UI Components (Vanity, Shop, Cart, Admin, Modals, Profile)
│   ├── services/         # Firebase & AI Service Layer (Auth, Products, Orders, Business, AI)
│   ├── lib/              # Firebase configuration & initialization
│   ├── App.tsx           # Main application router & global state provider
│   ├── main.tsx          # Entry point
│   └── types.ts          # Shared TypeScript models & interfaces
├── firebase-blueprint.json # Firestore database schema declaration
├── firestore.rules       # Firestore security rules
├── server.ts             # Express server with Vite middleware integration
├── package.json          # Dependency specifications and build scripts
└── README.md             # Project documentation
```

---

## 🗺️ 12-Phase Local Development & Production Roadmap

This project is prepared for export to **Cursor** as the foundation for a full production web and mobile application.

- **Phase 1**: Establish GitHub repository source of truth and setup local CI/CD environment.
- **Phase 2**: Full Firebase project provisioning (Firestore indexes, Storage bucket for look snapshots & product images).
- **Phase 3**: Connect live Stripe or PayPal payment gateway inside `CheckoutModal.tsx` and server-side payment verification endpoints.
- **Phase 4**: Expand server-side Gemini AI features (`aiService.ts`) for shade matching, AR face-landmark detection, and custom look generation.
- **Phase 5**: Real-time stock reservation and automated inventory tracking upon checkout completion.
- **Phase 6**: Customer reviews, rating star system, and UGC look sharing gallery.
- **Phase 7**: Transactional email notification service (SendGrid/Resend) for order confirmations and tracking updates.
- **Phase 8**: Performance optimization, image compression, image lazy-loading, and responsive layout fine-tuning across mobile devices.
- **Phase 9**: Comprehensive unit and end-to-end automated test suite (Vitest + Playwright).
- **Phase 10**: Custom domain configuration, SSL setup, and Cloud Run / Vercel production deployment pipeline.
- **Phase 11**: Analytics integration (Google Analytics 4 / PostHog) and SEO metadata optimization.
- **Phase 12**: Mobile application packaging (Capacitor or React Native webview shell) for iOS App Store and Google Play deployment.

---

## 📜 License
Private Application - All rights reserved by **Juliet's Makeup Galore**.
