// CSS imports
import "../styles/styles.css";
import "../styles/responsive.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
window.L = L; // agar bisa dipakai di class halaman

import App from "./pages/app";
import { registerServiceWorker } from "./utils/service-worker-registration";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  // Register service worker first
  try {
    await registerServiceWorker();
    console.log("Service worker registered successfully");
  } catch (error) {
    console.error("Failed to register service worker:", error);
  }

  // for demonstration purpose-only
  console.log("Berhasil mendaftarkan service worker.");

  // Then render the app
  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });
});
