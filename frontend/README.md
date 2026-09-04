# 🎨 Quimora Frontend — Web Application

The frontend client for **Quimora**, built with React 19, Vite, Tailwind CSS v4, and Zustand.

---

## 🚀 Tech Stack & Libraries

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand 5](https://github.com/pmndrs/zustand)
- **Routing**: [React Router 7/8](https://reactrouter.com/)
- **Icons & Animations**: [Lucide React](https://lucide.dev/) & [Motion (Framer Motion)](https://motion.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **HTTP Client**: Axios with centralized interceptors (`axiosClient`)

---

## 📂 Project Structure

```
frontend/src/
├── api/            # Axios instance, baseURL & auth token interceptor
├── assets/         # Static images, logos, and vector assets
├── components/     # Global reusable UI (modals, buttons, banners, inputs)
├── features/       # Modular feature folders (admin, auth, quiz, student, instructor)
│   ├── admin/      # Admin store, tables, stats cards, chart components
│   ├── auth/       # Login, register, OTP verification forms & stores
│   ├── student/    # Quiz player, result breakdown screen
│   └── quiz/       # Quiz creation, question builder
├── layouts/        # Layout wrappers (Navbar, Sidebar, Footer, Role Guards)
├── pages/          # Top-level page views & routes
├── routes/         # React Router index & role authorization guards
├── store/          # Global Zustand stores (useAuthStore, useQuizStore, etc.)
└── utils/          # Formatting helpers & validation functions
```

---

## ⚙️ Local Development Setup

1. Make sure backend API server is running on `http://localhost:5000/api/v1`.
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

---

## 🔑 Key Scripts

- `npm run dev`: Start Vite development server with HMR.
- `npm run build`: Build production assets into `dist/`.
- `npm run lint`: Run ESLint checks.
- `npm run preview`: Locally preview production build.
