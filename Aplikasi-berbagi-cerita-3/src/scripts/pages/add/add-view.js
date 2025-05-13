class AddStoryView {
  getTemplate() {
    return `
        <section class="container">
          <h1>Tambah Cerita Baru</h1>
          <form id="story-form">
            <label for="description">Deskripsi:</label>
            <textarea id="description" name="description" required></textarea>
  
            <div id="camera-container" style="margin-bottom: 1rem;">
              <label for="photo">Ambil Gambar:</label>
              <div id="camera-fallback" style="display: none;">
                <input type="file" id="file-input" accept="image/*" capture="environment">
                <p class="note">Kamera tidak tersedia. Silakan unggah foto.</p>
              </div>
              <video id="camera" autoplay style="display: none;"></video>
              <canvas id="snapshot" hidden></canvas>
              <button type="button" id="take-photo" style="margin-top: 1rem;">Ambil Foto</button>
              <div id="preview-container" style="margin-top: 10px; display: none;">
                <img id="preview" style="max-width: 100%; max-height: 300px;" />
              </div>
            </div>

            <label for="map">Lokasi Cerita (Opsional):</label>
            <div class="map-info" style="margin-bottom: 1rem; color: #666;">
              <small>Klik pada peta untuk menentukan lokasi cerita</small>
            </div>
            <input type="hidden" id="lat" name="lat" />
            <input type="hidden" id="lon" name="lon" />
            <div id="map" style="height: 300px; margin: 1rem 0;"></div>
  
            <button type="submit">Kirim Cerita</button>
          </form>
        </section>
      `;
  }

  async initCamera() {
    const cameraEl = document.getElementById("camera");
    const cameraFallbackEl = document.getElementById("camera-fallback");
    const fileInput = document.getElementById("file-input");
    const takePhotoBtn = document.getElementById("take-photo");
    const previewContainer = document.getElementById("preview-container");
    const preview = document.getElementById("preview");

    // Check if mediaDevices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log("Browser tidak mendukung API mediaDevices.");
      cameraEl.style.display = "none";
      cameraFallbackEl.style.display = "block";

      // Set up file input as fallback
      fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            preview.src = e.target.result;
            previewContainer.style.display = "block";
            takePhotoBtn.textContent = "Ganti Foto";
            this._photoData = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      });

      // No stream to return in fallback mode
      return null;
    }

    try {
      cameraEl.style.display = "block";
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      return stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
      cameraEl.style.display = "none";
      cameraFallbackEl.style.display = "block";

      // Set up file input as fallback when camera access failed
      fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            preview.src = e.target.result;
            previewContainer.style.display = "block";
            takePhotoBtn.textContent = "Ganti Foto";
            this._photoData = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      });

      return null;
    }
  }

  initMap() {
    try {
      // Instance map
      const map = L.map("map").setView([-2.5, 118], 5);

      // Title layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Paksa update ukuran map setelah mount
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      return map;
    } catch (error) {
      console.error("Error initializing map:", error);
      document.getElementById("map").innerHTML =
        "<p>Tidak dapat memuat peta. Silakan coba lagi nanti.</p>";
      return null;
    }
  }

  handleMapClick(map, latInput, lonInput) {
    if (!map) return;

    // Buat custom icon untuk marker
    const customIcon = L.icon({
      iconUrl:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzODQgNTEyIj48IS0tIUZvbnQgQXdlc29tZSBGcmVlIDYuNS4xIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlL2ZyZWUgQ29weXJpZ2h0IDIwMjQgRm9udGljb25zLCBJbmMuLS0+PHBhdGggZmlsbD0iI2Q5NzcwNiIgZD0iTTIxNS43IDQ5OS4yQzI2Ny4yIDQzNSAzODQgMjc5LjQgMzg0IDE5MkMzODQgODYgMjk4IDAgMTkyIDBTMCA4NiAwIDE5MmMwIDg3LjQgMTE2LjggMjQzIDIxNi4zIDMwNy4yYzUuOCA0LjAgMTMuNiA0LjAgMTkuNCAwek0xOTIgMTI4YTY0IDY0IDAgMSAxIDAgMTI4IDY0IDY0IDAgMSAxIDAtMTI4eiIvPjwvc3ZnPg==",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    let marker = null;
    map.on("click", function (e) {
      latInput.value = e.latlng.lat;
      lonInput.value = e.latlng.lng;

      if (marker) map.removeLayer(marker);
      marker = L.marker(e.latlng, { icon: customIcon }).addTo(map);

      marker.bindPopup("Lokasi cerita dipilih").openPopup();
    });

    // Jika sudah ada koordinat yang tersimpan, tampilkan marker
    if (latInput.value && lonInput.value) {
      const lat = parseFloat(latInput.value);
      const lon = parseFloat(lonInput.value);
      if (!isNaN(lat) && !isNaN(lon)) {
        marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
        marker.bindPopup("Lokasi cerita dipilih").openPopup();
        map.setView([lat, lon], 13);
      }
    }
  }

  capturePhoto(video, canvas) {
    const previewContainer = document.getElementById("preview-container");
    const preview = document.getElementById("preview");

    if (!video || video.style.display === "none") {
      // Return stored photo data from file input if camera is not used
      return this._photoData;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.hidden = false;

    const dataUrl = canvas.toDataURL("image/jpeg");

    // Show preview
    preview.src = dataUrl;
    previewContainer.style.display = "block";

    return dataUrl;
  }

  showLoading() {
    const submitBtn = document.querySelector(
      "#story-form button[type='submit']"
    );
    submitBtn.disabled = true;
    submitBtn.textContent = "Mengirim...";
  }

  hideLoading() {
    const submitBtn = document.querySelector(
      "#story-form button[type='submit']"
    );
    submitBtn.disabled = false;
    submitBtn.textContent = "Kirim Cerita";
  }

  showSuccessMessage(message) {
    alert(message || "Cerita berhasil dikirim!");
  }

  showErrorMessage(message) {
    alert(message || "Gagal mengirim cerita");
  }
}

export default AddStoryView;
