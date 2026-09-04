# 🚀 Production Deployment Rules & Best Practices Checklist

Ye guide Full-Stack Web Applications (React + Vite + Express + Vercel + Render) ko production par deploy karte waqt hone wali common errors, security rules, aur configuration standards ke liye hai.

---

## 1. 🔤 File System & Case Sensitivity (Import Errors)

### The Rule
Windows file system case-insensitive hota hai (`websiteRoutes.jsx` aur `WebsiteRoutes.jsx` same mante hain), lekin **Linux / Vercel / Netlify / Render case-sensitive** hote hain.

### Checklist & Best Practices
- [ ] **Exact Casing Match**: Ensure karein ki import path `import { WebsiteRoutes } from "./WebsiteRoutes";` aur disk par filename `WebsiteRoutes.jsx` ka casing **100% exact match** kare.
- [ ] **File Naming Standards**:
  - React Components / Pages / Route Shells: `PascalCase` (e.g., `AppRouter.jsx`, `ProtectedRoutes.jsx`).
  - Helper functions / utilities / API services: `camelCase` (e.g., `roleMapper.js`, `axiosClient.js`).

---

## 2. ⚡ Frontend Build & Deployment (Vite + Vercel)

### The Rule
Vite React apps build hone par static files **`dist/`** folder mein generate karte hain (jabki Create React App `build/` use karta hai). SPA (Single Page Application) mein page refresh par 404 error na aaye uske liye URL rewrite ki zarurat hoti hai.

### Checklist & Best Practices
- [ ] **Output Directory Setting**:
  - Vercel Project Settings ya `vercel.json` mein `outputDirectory` hamesha **`dist`** hona chahiye (agar root se subfolder build ho raha ho to `frontend/dist`).
- [ ] **SPA Routing (`vercel.json`)**:
  - Client-side routing (React Router) ke liye `vercel.json` create karein:
    ```json
    {
      "outputDirectory": "dist",
      "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
      ]
    }
    ```
- [ ] **Environment Variables**:
  - Vite variables hamesha **`VITE_`** prefix se start hone chahiye (e.g., `VITE_API_URL=https://quimora.onrender.com/api/v1`).
  - Code mein access karne ke liye `import.meta.env.VITE_API_URL` use karein.

---

## 3. 🔒 Backend CORS & Security Rules (Express + Render)

### The Rule
Cross-Origin Requests (`https://quimora-rho.vercel.app` ➔ `https://quimora.onrender.com`) ko browsers tabhi allow karte hain jab server proper CORS headers return kare. `credentials: true` (cookies/tokens) hone par `Access-Control-Allow-Origin: *` allow nahi hota, specific domain hona zaruri hai.

### Checklist & Best Practices
- [ ] **Whitelisted Domains**:
  - Allowed Origins ki explicit list rakhein:
    ```javascript
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://quimora-rho.vercel.app"
    ];
    ```
- [ ] **Dynamic & Secure Origin Reflection**:
  - Agar request incoming origin whitelist ya authorized domain patterns (`.vercel.app`, `.onrender.com`) se match hoti hai, to wohi exact origin set karein.
- [ ] **Preflight (`OPTIONS`) Request Handling**:
  - HTTP `OPTIONS` requests ko bina crash ya block hue immediately status `200 OK` return karein.
- [ ] **Allowed Headers & Methods**:
  - Custom headers (`Authorization`, `Cache-Control`, `Pragma`, `Expires`, `Content-Type`) ko `Access-Control-Allow-Headers` mein allow karein.
- [ ] **Reference Express CORS Middleware**:
  ```javascript
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const isAllowed =
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      origin.endsWith(".onrender.com");

    if (isAllowed && origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Cache-Control, Pragma, Expires, X-Requested-With"
    );

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    next();
  });
  ```

---

## 4. ☁️ Render Deployment & Server Verification

### Checklist & Best Practices
- [ ] **Build & Start Commands**:
  - Backend Root Directory set hone par:
    - Build Command: `npm install`
    - Start Command: `node api/server.js`
- [ ] **Render Free Tier Warm-up / Build Delays**:
  - Render free instance push ke baad **3 to 7 minutes** leta hai deploy hone mein.
  - Deployment force karne ke liye: Render Dashboard ➔ **Manual Deploy** ➔ **Clear build cache & deploy**.
- [ ] **Environment Variables on Render**:
  - Render Dashboard mein Secrets / Environment Variables verify karein (`MONGO_URI`, `JWT_SECRET`, `PORT`, `NODE_ENV=production`).

---

## 5. 🛠️ Pre-Deployment Run Checklist (Before `git push`)

1. Local production build test karein:
   ```bash
   cd frontend
   npm run build
   ```
2. Git status check karein casing ya missing files ke liye:
   ```bash
   git status
   ```
3. Commit aur Push:
   ```bash
   git add .
   git commit -m "feat/fix: production ready changes"
   git push
   ```
