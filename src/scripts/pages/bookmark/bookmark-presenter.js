import { storyMapper } from "../../data/api-mapper";

export default class BookmarkPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async initialBookmarkStories() {
    this.#view.showStoriesListLoading();

    try {
      const listOfStories = await this.#model.getAllStories();
      const stories = await Promise.all(listOfStories.map(storyMapper));

      console.log("📦 listOfStories from IndexedDB:", listOfStories);
      console.log("📘 mapped stories:", stories);

      const message = "Berhasil menampilkan daftar story";
      this.#view.populateBookmarkStories(message, stories);
    } catch (error) {
      console.error("initialBookmarkStories error", error);
      this.#view.populateBookmarkedStoriesError(error.message);
    } finally {
      this.#view.hideStoreListLoading();
    }
  }
}
