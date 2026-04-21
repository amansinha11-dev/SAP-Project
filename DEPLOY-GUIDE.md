# Deployment Guide - Pharmacy Hub

## Frontend (Vercel/Netlify)
**Root dir:** `pharmacy-hub-main/`
- **Vercel:** vercel.json (SPA rewrites ready). Build: `npm run build`, Output: `dist`
- **Netlify:** netlify.toml (SPA redirects ready). Build: `npm run build`, Publish: `dist`

**Steps:**
1. `cd pharmacy-hub-main`
2. `npm install`
3. `npm run build`
4. Drag `dist/` to deploy or connect repo.

**API:** Update `src/services/api.ts` baseURL to backend URL (e.g. `https://your-render.onrender.com/api`).

## Backend (Render)
**Root dir:** `pharmacy-billing/backend/`
- Java 20, Maven
- Build: `mvn clean package -DskipTests`
- Start: `java -jar target/pharmacy-billing-0.0.1-SNAPSHOT.jar`
- Files added: Procfile, application-prod.properties (H2 in-mem DB, port=${PORT})

**Render.com Steps:**
1. New Web Service → Build/Deploy from repo (upload zip or Git).
2. **Runtime:** Docker
3. **Build Command:** `mvn clean package -DskipTests`
4. **Start Command:** `java -jar target/*.jar`
5. **Env Vars (optional):** DB_URL (PostgreSQL URL), PORT=10000 (default ok).

**Test Backend:** Visit `/actuator/health`.

## Production Notes
- Frontend proxy no; CORS `*` in backend.
- No external DB needed (H2 embedded).
- Login: admin (mock) or backend JWT.

URLs ready for update in frontend after backend deploy.

