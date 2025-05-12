class RegisterView {
  #nameInput;
  #emailInput;
  #passwordInput;
  #form;

  getTemplate() {
    return `
      <section class="container">
        <h1>Daftar</h1>
        <form id="register-form">
          <label for="name">Nama:</label>
          <input type="text" id="name" required />

          <label for="email">Email:</label>
          <input type="email" id="email" required />

          <label for="password">Password:</label>
          <input type="password" id="password" required minlength="8" />

          <button type="submit">Daftar</button>
        </form>
      </section>
    `;
  }

  bindElements() {
    this.#form = document.querySelector("#register-form");
    this.#nameInput = document.getElementById("name");
    this.#emailInput = document.getElementById("email");
    this.#passwordInput = document.getElementById("password");
  }

  getRegisterData() {
    return {
      name: this.#nameInput.value,
      email: this.#emailInput.value,
      password: this.#passwordInput.value
    };
  }

  bindSubmitHandler(handler) {
    this.bindElements();
    this.#form.addEventListener("submit", (e) => {
      e.preventDefault();
      handler();
    });
  }

  showSuccessMessage(message) {
    alert(message || "Registrasi berhasil!");
  }

  showErrorMessage(message) {
    alert(message || "Gagal daftar");
  }

  redirectToLogin() {
    window.location.hash = "/login";
  }
}

export default RegisterView;
