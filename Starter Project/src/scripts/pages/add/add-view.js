class AddStoryView {
  getTemplate() {
    return `
        <section class="container">
          <h1>Tambah Cerita Baru</h1>
          <form id="story-form">
            <label for="description">Deskripsi:</label>
            <textarea id="description" name="description" required></textarea>
  
            <label for="photo">Ambil Gambar:</label>
            <video id="camera" autoplay></video>
            <canvas id="snapshot" hidden></canvas>
            <button type="button" id="take-photo">Ambil Foto</button>
  
            <input type="hidden" id="lat" name="lat" />
            <input type="hidden" id="lon" name="lon" />
            <div id="map" style="height: 300px; margin: 1rem 0;"></div>
  
            <button type="submit">Kirim Cerita</button>
          </form>
        </section>
      `;
  }

  initCamera() {
    return navigator.mediaDevices.getUserMedia({ video: true });
  }

  initMap() {
    const map = L.map("map").setView([-2.5, 118], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      map
    );
    return map;
  }

  handleMapClick(map, latInput, lonInput) {
    let marker = null;
    map.on("click", function (e) {
      latInput.value = e.latlng.lat;
      lonInput.value = e.latlng.lng;

      if (marker) map.removeLayer(marker);
      marker = L.marker(e.latlng).addTo(map);
    });
  }

  capturePhoto(video, canvas) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.hidden = false;
    return canvas.toDataURL("image/jpeg");
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
