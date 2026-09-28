# 🎨 Quimora — Frontend Client

The React 19 client web application for **Quimora**, built with Vite 8, Tailwind CSS v4, and Zustand.

> 📌 **Main Documentation:** For overall project architecture, setup, design rules, and roadmap, refer to the root [README.md](file:///d:/quimora/README.md) and [docs/](file:///d:/quimora/docs/).

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run Vite dev server with HMR
npm run dev

# Build production bundle
npm run build
```

---

## 📂 Project Structure

```
frontend/src/
├── api/        # Axios client instance & Bearer auth interceptors
├── components/ # Reusable UI components & modals
├── features/   # Modular feature modules (admin, auth, quiz, student, instructor)
├── layouts/    # Navbar, Sidebar, Footer, and Guard layouts
├── pages/      # Route page views
├── routes/     # React Router setup & RBAC route protection
├── store/      # Global Zustand stores (auth, quiz, admin)
└── utils/      # Formatting helpers & validation functions
```

---

## 📚 Related Documentation

- **System Architecture**: [`docs/ARCHITECTURE.md`](file:///d:/quimora/docs/ARCHITECTURE.md)
- **Product Spec**: [`docs/PRODUCT_SPEC.md`](file:///d:/quimora/docs/PRODUCT_SPEC.md)
- **V3 Plan**: [`docs/V3_PLAN.md`](file:///d:/quimora/docs/V3_PLAN.md)
