class AddStoryView {
  #form;
  #descriptionInput;
  #fileInput;
  #takePhotoBtn;
  #latInput;
  #lonInput;
  #video;
  #canvas;
  #previewContainer;
  #previewImage;
  #mapContainer;

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

  bindElements() {
    this.#form = document.getElementById("story-form");
    this.#descriptionInput = document.getElementById("description");
    this.#fileInput = document.getElementById("file-input");
    this.#takePhotoBtn = document.getElementById("take-photo");
    this.#latInput = document.getElementById("lat");
    this.#lonInput = document.getElementById("lon");
    this.#video = document.getElementById("camera");
    this.#canvas = document.getElementById("snapshot");
    this.#previewContainer = document.getElementById("preview-container");
    this.#previewImage = document.getElementById("preview");
    this.#mapContainer = document.getElementById("map");
  }

  getStoryData() {
    this.bindElements();
    return {
      description: this.#descriptionInput.value,
      lat: this.#latInput.value || null,
      lon: this.#lonInput.value || null,
      photo: this.#previewImage.src // data URL
    };
  }

  bindSubmitHandler(handler) {
    this.bindElements();
    this.#form.addEventListener("submit", (e) => {
      e.preventDefault();
      handler();
    });
  }

  async initCamera(onCameraReady, onFileSelected) {
    this.bindElements();
    const cameraFallbackEl = document.getElementById("camera-fallback");

    // Check if mediaDevices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.#video.style.display = "none";
      cameraFallbackEl.style.display = "block";
      this.#fileInput.addEventListener("change", onFileSelected);
      return null;
    }

    try {
      this.#video.style.display = "block";
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.#video.srcObject = stream;
      
      this.#takePhotoBtn.addEventListener("click", onCameraReady);
      this.#fileInput.addEventListener("change", onFileSelected);

      return stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
      this.#video.style.display = "none";
      cameraFallbackEl.style.display = "block";
      this.#fileInput.addEventListener("change", onFileSelected);
      return null;
    }
  }

  initMap(onMapClick) {
    this.bindElements();
    try {
      const map = L.map("map").setView([-2.5, 118], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
      
      map.on("click", (e) => onMapClick(e.latlng));
      
      return map;
    } catch (error) {
      console.error("Error initializing map:", error);
      this.#mapContainer.innerHTML = "<p>Tidak dapat memuat peta. Silakan coba lagi nanti.</p>";
      return null;
    }
  }

  capturePhoto() {
    this.bindElements();
    this.#canvas.width = this.#video.videoWidth;
    this.#canvas.height = this.#video.videoHeight;
    this.#canvas.getContext("2d").drawImage(this.#video, 0, 0);
    const dataUrl = this.#canvas.toDataURL("image/jpeg");

    this.#previewImage.src = dataUrl;
    this.#previewContainer.style.display = "block";
    this.#takePhotoBtn.textContent = "Ganti Foto";

    return dataUrl;
  }

  handleFileSelection(event) {
    this.bindElements();
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.#previewImage.src = e.target.result;
        this.#previewContainer.style.display = "block";
        this.#takePhotoBtn.textContent = "Ganti Foto";
      };
      reader.readAsDataURL(file);
      return e.target.result;
    }
    return null;
  }

  updateMarker(map, latlng) {
    // Remove existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add new marker
    L.marker(latlng).addTo(map);

    // Update input values
    this.#latInput.value = latlng.lat;
    this.#lonInput.value = latlng.lng;
  }

  showLoading() {
    const submitBtn = this.#form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Mengirim...";
  }

  hideLoading() {
    const submitBtn = this.#form.querySelector("button[type='submit']");
    submitBtn.disabled = false;
    submitBtn.textContent = "Kirim Cerita";
  }

  showSuccessMessage(message) {
    alert(message || "Cerita berhasil dikirim!");
  }

  showErrorMessage(message) {
    alert(message || "Gagal mengirim cerita");
  }

  redirectToHome() {
    window.location.hash = "/";
  }
}

export default AddStoryView;
