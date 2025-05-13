import { showFormattedDate } from "../../utils/index";

class HomeView {
  getTemplate() {
    return `
      <section class="container">
        <h1>Daftar Cerita</h1>
        <div id="stories-list" class="stories-list"></div>
        <h2>Lokasi Cerita</h2>
        <div id="stories-map" style="height: 400px; margin-top: 1rem; border-radius: 8px; border: 1px solid #ccc;"></div>
        <div class="map-info" style="margin-top: 0.5rem; color: #666;">
          <small>Klik marker untuk melihat detail cerita</small>
        </div>
      </section>
    `;
  }

  showLoading() {
    const storiesContainer = document.querySelector("#stories-list");
    storiesContainer.innerHTML = `
      <div class="loader">Loading stories...</div>
    `;
  }

  showStories(stories) {
    const storiesContainer = document.querySelector("#stories-list");
    if (stories.length === 0) {
      storiesContainer.innerHTML = `
        <div class="empty-state">
          <p>Tidak ada cerita yang ditampilkan.</p>
        </div>
      `;
      return;
    }

    storiesContainer.innerHTML = stories
      .map(
        (story) => `
          <article class="story-item">
            <img src="${story.photoUrl}" alt="Foto oleh ${
          story.name
        }" class="story-img" loading="lazy" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200?text=Foto+Tidak+Tersedia';" />
            <h2>${story.name}</h2>
            <p>${story.description}</p>
            <time datetime="${story.createdAt}">${showFormattedDate(
          story.createdAt,
          "id-ID"
        )}</time>
          </article>
        `
      )
      .join("");
  }

  showError(message) {
    const storiesContainer = document.querySelector("#stories-list");
    storiesContainer.innerHTML = `
      <div class="error-state">
        <p>${message}</p>
      </div>
    `;
  }

  renderMap(stories) {
    try {
      const mapContainer = document.querySelector("#stories-map");
      if (!mapContainer) return;

      // Periksa apakah ada cerita yang memiliki data lokasi
      const storiesWithLocation = stories.filter(
        (story) => story.lat && story.lon
      );

      if (storiesWithLocation.length === 0) {
        mapContainer.innerHTML =
          "<p>Tidak ada cerita dengan lokasi yang tersedia.</p>";
        return;
      }

      // Create map instance
      const map = L.map("stories-map");

      // Set default view to Indonesia
      map.setView([-2.5, 118], 5);

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add markers for stories with location
      const bounds = L.latLngBounds();
      const markers = [];

      storiesWithLocation.forEach((story) => {
        const lat = parseFloat(story.lat);
        const lon = parseFloat(story.lon);

        if (!isNaN(lat) && !isNaN(lon)) {
          const latlng = L.latLng(lat, lon);
          bounds.extend(latlng);

          // L.marker(latlng).addTo(map).bindPopup(`
          //     <b>${story.name}</b><br>
          //     ${story.description.substring(0, 50)}...
          //   `);

          const marker = L.marker(latlng).addTo(map).bindPopup(`
            <div class="popup-content">
              <h3>${story.name}</h3>
              <img src="${
                story.photoUrl
              }" alt="Foto cerita" style="width: 100%; max-height: 150px; object-fit: cover; margin: 5px 0;">
              <p>${story.description.substring(0, 100)}${
            story.description.length > 100 ? "..." : ""
          }</p>
            </div>
          `);
          markers.push(marker);
        }
      });

      // Fit map to bounds if we have markers
      if (bounds.isValid()) {
        map.fitBounds(bounds);

        // Jika hanya ada satu marker, zoom yang lebih tepat
        if (markers.length === 1) {
          map.setView(bounds.getCenter(), 12);
        }
      }

      // Paksa update ukuran map setelah render
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    } catch (error) {
      console.error("Error rendering map:", error);
      document.querySelector("#stories-map").innerHTML =
        "<p>Gagal memuat peta. Silakan muat ulang halaman.</p>";
    }
  }
}

export default HomeView;
