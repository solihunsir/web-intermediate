import HomePresenter from "./home-page-presenter";
import * as StoriesAPI from "../../data/api";
import {
  generateLoaderAbsoluteTemplate,
  generateStoriesListEmptyTemplate,
  generateStoriesListErrorTemplate,
  generateStoryItemTemplate,
} from "../../template";

export default class HomePage {
  #presenter;

  async render() {
    return `
      <section class="container">
        <h1 class="section-title">Story</h1>
        
        <div class="stories-list__container">
            <div id="stories-list"></div>
            <div id="stories-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: StoriesAPI,
    });

    await this.#presenter.initialStories();
  }

  populateStoriesList(message, listStory) {
    if (listStory.length <= 0) {
      this.populateStoriesListEmpty();
      return;
    }

    const html = listStory.reduce((acc, story) => {
      const coordinate = {
        latitude: story.lat,
        longitude: story.lon,
      };

      console.log(coordinate);

      return acc.concat(
        generateStoryItemTemplate({
          id: story.id,
          name: story.name,
          description: story.description,
          photoUrl: story.photoUrl,
          createdAt: story.createdAt,
          location: { latitude: story.lat, longitude: story.lon },
        })
      );
    }, "");

    document.getElementById("stories-list").innerHTML = `
      <div class="stories-list">${html}</div>
    `;
  }

  populateStoriesListEmpty() {
    document.getElementById("stories-list").innerHTML =
      generateStoriesListEmptyTemplate();
  }

  populateStoriesListError(message) {
    document.getElementById("stories-list").innerHTML =
      generateStoriesListErrorTemplate(message);
  }

  showLoading() {
    document.getElementById("stories-list-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById("stories-list-loading-container").innerHTML = "";
  }
}
