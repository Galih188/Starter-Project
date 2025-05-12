class LoginPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  init() {
    this.#view.bindSubmitHandler(() => this.handleLogin());
  }

  async handleLogin() {
    const loginData = this.#view.getLoginData();

    try {
      const result = await this.#model.login(loginData);

      if (result.success) {
        this.#view.showSuccessMessage(result.message);
        this.#view.redirectToHome();
      } else {
        this.#view.showErrorMessage(result.message);
      }
    } catch (error) {
      this.#view.showErrorMessage();
    }
  }
}

export default LoginPresenter;
