// CSS imports
import "../styles/styles.css";
import "../styles/responsive.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
window.L = L; // agar bisa dipakai di class halaman

import App from "./pages/app";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });
  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });
});
