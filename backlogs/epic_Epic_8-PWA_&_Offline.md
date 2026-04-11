## Epic 8 — PWA & Offline

*Package the app for home-screen installation and verified offline use. Depends on Epic 7 (complete app build).*

- [ ] **8.1** Create `public/manifest.json`: set `name`, `short_name`, `display: "standalone"`, `orientation: "any"`, `start_url: "/"`, `background_color`, `theme_color`, and icon references
- [ ] **8.2** Create or source PWA icons: `public/icons/icon-192.png` and `public/icons/icon-512.png` (simple wordmark or glyph); reference them in `manifest.json`
- [ ] **8.3** Verify `vite-plugin-pwa` injects the `<link rel="manifest">` tag and registers the service worker in the production build
- [ ] **8.4** Verify the Workbox precache list in the built service worker covers all JS, CSS, HTML, and icon assets
- [ ] **8.5** Test offline behaviour: load the app, disable network, hard-refresh — confirm the app loads from cache and renders fully
- [ ] **8.6** Test **install to home screen** on iOS Safari (Add to Home Screen) and Android Chrome (install prompt); confirm the app launches in standalone mode with no browser chrome
