class RegisterPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  init() {
    this.#view.bindSubmitHandler(() => this.handleRegister());
  }

  async handleRegister() {
    const registerData = this.#view.getRegisterData();

    try {
      const result = await this.#model.register(registerData);

      if (result.success) {
        this.#view.showSuccessMessage(result.message);
        this.#view.redirectToLogin();
      } else {
        this.#view.showErrorMessage(result.message);
      }
    } catch (error) {
      this.#view.showErrorMessage();
    }
  }
}

export default RegisterPresenter;
