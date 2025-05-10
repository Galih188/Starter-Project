class AddStoryView {
  getTemplate() {
    return `
        <section class="container">
          <h1>Tambah Cerita Baru</h1>
          <form id="story-form">
            <label for="description">Deskripsi:</label>
            <textarea id="description" name="description" required></textarea>
  
            <div id="camera-container">
              <label for="photo">Ambil Gambar:</label>
              <div id="camera-fallback" style="display: none;">
                <input type="file" id="file-input" accept="image/*" capture="environment">
                <p class="note">Kamera tidak tersedia. Silakan unggah foto.</p>
              </div>
              <video id="camera" autoplay style="display: none;"></video>
              <canvas id="snapshot" hidden></canvas>
              <button type="button" id="take-photo">Ambil Foto</button>
              <div id="preview-container" style="margin-top: 10px; display: none;">
                <img id="preview" style="max-width: 100%; max-height: 300px;" />
              </div>
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
      const map = L.map("map").setView([-2.5, 118], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        map
      );
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

    let marker = null;
    map.on("click", function (e) {
      latInput.value = e.latlng.lat;
      lonInput.value = e.latlng.lng;

      if (marker) map.removeLayer(marker);
      marker = L.marker(e.latlng).addTo(map);
    });
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
