# Quimora — Production Deployment Guide

This guide details step-by-step instructions for deploying the Quimora Full-Stack application (Node.js/Express Backend on Render, Vite/React Frontend on Vercel, MongoDB Atlas Database).

---

## 🏗️ Architecture Summary

```
+-------------------+      HTTPS / REST      +-------------------+
|  Vercel Frontend  | ---------------------> |   Render Backend  |
| (React 19 + Vite) | <--------------------- | (Node.js Express) |
+-------------------+                        +---------+---------+
                                                       |
                                            MongoDB    |
                                           Protocol    v
                                             +------------------+
                                             |  MongoDB Atlas   |
                                             +------------------+
```

---

## 1️⃣ Database Setup (MongoDB Atlas)

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Cluster and Database named `quimora`.
3. In **Network Access**, add `0.0.0.0/0` to allow backend access from Render service IPs.
4. Create a Database User with read/write access.
5. Save your connection string format:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/quimora?retryWrites=true&w=majority`

---

## 2️⃣ Backend Deployment (Render)

1. Log in to [Render Dashboard](https://dashboard.render.com/) and create a new **Web Service**.
2. Connect your GitHub repository `quimoraLabs/quimora`.
3. Set configuration parameters:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node api/server.js`
   - **Environment:** `Node`
4. Environment Variables:
   - `PORT` = `3000` (or leave default assigned by Render)
   - `NODE_ENV` = `production`
   - `MONGO_URI` = `<Your MongoDB Atlas Connection String>`
   - `MONGO_URI_TEST` = `<Your MongoDB Atlas Test Connection String>`
   - `JWT_SECRET` = `<Strong Random Secret Key>`
   - `GROQ_API_KEY` = `<Your Groq API Key>`
   - `IMAGEKIT_PUBLIC_KEY` = `<ImageKit Public Key>`
   - `IMAGEKIT_PRIVATE_KEY` = `<ImageKit Private Key>`
   - `IMAGEKIT_URL_ENDPOINT` = `<ImageKit URL Endpoint>`

---

## 3️⃣ Frontend Deployment (Vercel)

1. Log in to [Vercel](https://vercel.com/) and import project `quimoraLabs/quimora`.
2. Set configuration parameters:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Environment Variables:
   - `VITE_API_URL` = `https://<your-render-backend-url>.onrender.com/api/v1`

---

## 4️⃣ Environment Verification & Smoke Test

1. Visit your Vercel deployment URL.
2. Register an Admin / Instructor account.
3. Test creating a Quiz, adding questions, starting a student attempt, and submitting answers.
4. Verify HTTP security headers, CORS response headers, and rate limiting behavior on `/login` and `/verify-otp`.
