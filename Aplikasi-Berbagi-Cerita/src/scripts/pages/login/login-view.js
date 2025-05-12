class LoginView {
  #emailInput;
  #passwordInput;
  #form;

  getTemplate() {
    return `
      <section class="container">
        <h1>Masuk</h1>
        <form id="login-form">
          <label for="email">Email:</label>
          <input type="email" id="email" required />

          <label for="password">Password:</label>
          <input type="password" id="password" required />

          <button type="submit">Masuk</button>
        </form>
      </section>
    `;
  }

  bindElements() {
    this.#form = document.querySelector("#login-form");
    this.#emailInput = document.getElementById("email");
    this.#passwordInput = document.getElementById("password");
  }

  getLoginData() {
    return {
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
    alert(message || "Login berhasil!");
  }

  showErrorMessage(message) {
    alert(message || "Terjadi kesalahan saat login");
  }

  redirectToHome() {
    window.location.hash = "/";
  }
}

export default LoginView;
