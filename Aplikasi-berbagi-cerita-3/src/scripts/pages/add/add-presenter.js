class AddStoryPresenter {
  #model;
  #view;
  #stream;
  #photoData;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
    this.#stream = null;
    this.#photoData = null;
  }

  async init() {
    try {
      const video = document.getElementById("camera");
      const canvas = document.getElementById("snapshot");
      const takePhotoBtn = document.getElementById("take-photo");
      const latInput = document.getElementById("lat");
      const lonInput = document.getElementById("lon");
      const form = document.getElementById("story-form");
      const fileInput = document.getElementById("file-input");

      // Initialize camera or fallback
      this.#stream = await this.#view.initCamera();

      // Only set video source if stream is available
      if (this.#stream && video) {
        video.srcObject = this.#stream;
      }

      // Setup photo capture
      takePhotoBtn.addEventListener("click", () => {
        this.#photoData = this.#view.capturePhoto(video, canvas);
      });

      // For file input fallback
      if (fileInput) {
        fileInput.addEventListener("change", (e) => {
          if (e.target.files && e.target.files[0]) {
            // View will handle the preview in initCamera
            takePhotoBtn.textContent = "Foto Sudah Dipilih";
          }
        });
      }

      // Initialize map
      const map = this.#view.initMap();
      if (map) {
        this.#view.handleMapClick(map, latInput, lonInput);

        // Paksa update ukuran map setelah mount
        setTimeout(() => {
          map.invalidateSize();

          // Cek apakah ada koordinat yang sudah tersimpan
          if (latInput.value && lonInput.value) {
            try {
              const lat = parseFloat(latInput.value);
              const lon = parseFloat(lonInput.value);
              if (!isNaN(lat) && !isNaN(lon)) {
                // Tambahkan marker dan set view
                const marker = L.marker([lat, lon]).addTo(map);
                marker.bindPopup("Lokasi cerita dipilih").openPopup();
                map.setView([lat, lon], 13);
              }
            } catch (error) {
              console.error("Error setting initial marker:", error);
            }
          }
        }, 200);
      }

      // Setup form submission
      form.addEventListener("submit", (e) => this.#handleSubmit(e));
    } catch (error) {
      console.error("Error initializing add story page:", error);
      this.#view.showErrorMessage(
        "Gagal menginisialisasi halaman. Silakan coba lagi."
      );
    }
  }

  async #handleSubmit(e) {
    e.preventDefault();

    try {
      this.#view.showLoading();

      const description = document.getElementById("description").value;
      const lat = document.getElementById("lat").value || null;
      const lon = document.getElementById("lon").value || null;
      const fileInput = document.getElementById("file-input");

      // Get photo from camera or file input
      if (!this.#photoData && fileInput && fileInput.files.length > 0) {
        // Handle file input directly
        const file = fileInput.files[0];
        this.#photoData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      }

      if (!this.#photoData) {
        throw new Error("Silakan ambil foto atau pilih file terlebih dahulu");
      }

      // Convert data URL to File object
      const photoBlob = await fetch(this.#photoData).then((res) => res.blob());
      const photoFile = new File([photoBlob], "photo.jpg", {
        type: "image/jpeg",
      });

      // Submit story
      const result = await this.#model.postStory({
        description,
        photo: photoFile,
        lat: lat,
        lon: lon,
      });

      this.#view.showSuccessMessage(result.message);

      // Matikan kamera sebelum pindah halaman
      this.cleanup();

      // Redirect to home page
      window.location.hash = "/";
    } catch (error) {
      this.#view.showErrorMessage(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }

  // Metode baru untuk membersihkan resource kamera saat pengguna meninggalkan halaman
  cleanup() {
    if (this.#stream) {
      this.#stream.getTracks().forEach((track) => track.stop());
      this.#stream = null;
      console.log("Camera stream stopped");
    }
  }
}

export default AddStoryPresenter;
