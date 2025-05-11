import StoryModel from "../../data/story-model.js";
import AddStoryView from "./add-view.js";
import AddStoryPresenter from "./add-presenter.js";

export default class AddStoryPage {
  #presenter;
  #view;

  constructor() {
    this.#view = new AddStoryView();
    const model = new StoryModel();
    this.#presenter = new AddStoryPresenter({ model, view: this.#view });
  }

  async render() {
    return this.#view.getTemplate();
  }

  async afterRender() {
    await this.#presenter.init();
  }
}
