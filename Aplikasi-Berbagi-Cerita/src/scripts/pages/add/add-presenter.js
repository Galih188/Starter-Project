class AddStoryPresenter {
  #model;
  #view;
  #stream;
  #map;
  #photoData;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
    this.#stream = null;
    this.#map = null;
    this.#photoData = null;
  }

  async init() {
    try {
      // Initialize camera
      this.#stream = await this.#view.initCamera(
        () => this.#handlePhotoCapture(), 
        (event) => this.#handleFileSelection(event)
      );

      // Initialize map
      this.#map = this.#view.initMap((latlng) => this.#handleMapClick(latlng));

      // Bind form submission
      this.#view.bindSubmitHandler(() => this.#handleSubmit());
    } catch (error) {
      console.error("Error initializing add story page:", error);
      this.#view.showErrorMessage("Gagal menginisialisasi halaman. Silakan coba lagi.");
    }
  }

  #handlePhotoCapture() {
    this.#photoData = this.#view.capturePhoto();
  }

  #handleFileSelection(event) {
    this.#photoData = this.#view.handleFileSelection(event);
  }

  #handleMapClick(latlng) {
    if (this.#map) {
      this.#view.updateMarker(this.#map, latlng);
    }
  }

  async #handleSubmit() {
    try {
      this.#view.showLoading();

      // Get story data from view
      const storyData = this.#view.getStoryData();

      // Validate photo
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
        description: storyData.description,
        photo: photoFile,
        lat: storyData.lat,
        lon: storyData.lon,
      });

      // Show success message and redirect
      this.#view.showSuccessMessage(result.message);
      this.#view.redirectToHome();
    } catch (error) {
      this.#view.showErrorMessage(error.message);
    } finally {
      this.#view.hideLoading();

      // Stop camera stream if it exists
      if (this.#stream) {
        this.#stream.getTracks().forEach((track) => track.stop());
      }
    }
  }
}

export default AddStoryPresenter;
