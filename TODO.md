# Vercel Deployment Fix TODO

## Completed:
- [x] Created `pharmacy-hub-main/vercel.json` with SPA rewrites for React Router (/* -> /index.html)
- [x] Created `pharmacy-hub-main/public/404.html` fallback redirect

## Next Steps:
1. cd pharmacy-hub-main
2. bun install (or npm install)
3. bun run build (or npm run build)
4. Deploy the `dist/` folder to Vercel https://sap-project-sepia.vercel.app/
   - Or connect GitHub repo to Vercel, set framework=Vite, build= `npm run build`, output=dist
5. Test: Visit root -> should load app (redirects to /dashboard client-side), refresh works.

Note: App uses mock API (localStorage). Backend not deployed. Update api.ts baseURL if backend hosted.

