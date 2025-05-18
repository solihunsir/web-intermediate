import DetailPresenter from "./detail-presenter";
import { parseActivePathname } from "../../routes/url-parser";
import * as StoriesAPI from "../../data/api";
import {
  generateLoaderAbsoluteTemplate,
  generateStoryDetailErrorTemplate,
  generateStoryDetailTemplate,
  generateSaveStoryButtonTemplate,
  generateSaveLocationButtonTemplate,
} from "../../template";
import Map from "../../utils/map";
import Swal from "sweetalert2";
import Database from "../../data/database";
export default class DetailPage {
  #presenter = null;
  #map = null;
  #story = null;

  async render() {
    return `
      <section>
        <div class="story-detail__container">
          <div id="story-detail" class="story-detail"></div>
          <div id="story-detail-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new DetailPresenter(parseActivePathname().id, {
      view: this,
      apiModel: StoriesAPI,
    });

    this.#presenter.showStoryDetail();
  }

  async populateStoryDetailAndInitialMap(message, story) {
    this.#story = story; // Simpan data cerita
    document.getElementById("story-detail").innerHTML =
      generateStoryDetailTemplate({
        authorName: story.name,
        description: story.description,
        image: story.photoUrl,
        createdAt: story.createdAt,
        location: story.location,
      });

    document.getElementById("save-actions-container").innerHTML = `
      ${generateSaveStoryButtonTemplate()}
      ${generateSaveLocationButtonTemplate()}
    `;

    document
      .getElementById("story-detail-save")
      .addEventListener("click", async () => {
        try {
          await Database.putStory(this.#story);
          Swal.fire({
            icon: "success",
            title: "Story Tersimpan",
            text: "Cerita ini telah disimpan.",
          });
        } catch (error) {
          console.error("Error saving story:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Gagal menyimpan cerita.",
          });
        }
      });

    document
      .getElementById("story-detail-save-location")
      .addEventListener("click", async () => {
        const location = {
          latitude: story.location.latitude,
          longitude: story.location.longitude,
          placeName: story.location.placeName,
        };
        try {
          await Database.putStory({ ...this.#story, location });
          Swal.fire({
            icon: "success",
            title: "Lokasi Tersimpan",
            text: "Lokasi ini telah disimpan.",
          });
        } catch (error) {
          console.error("Error saving location:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Gagal menyimpan lokasi.",
          });
        }
      });

    // Jika lokasi ada, tampilkan peta
    if (story.location.latitude !== null && story.location.longitude !== null) {
      try {
        await this.#presenter.showStoryDetailMap();

        if (this.#map) {
          const coordinate = [
            story.location.latitude,
            story.location.longitude,
          ];
          const markerOptions = { alt: story.description };
          const popupOptions = { content: story.description };

          this.#map.changeCamera(coordinate);
          this.#map.addMarker(coordinate, markerOptions, popupOptions);
        }
      } catch (error) {
        setTimeout(() => {
          Swal.fire({
            icon: "error",
            title: "Yops!",
            text: "Terjadi kesalahan.",
            footer: `<small>Error: ${error.message}</small>`,
          });
        }, 950);
      }
    } else {
      setTimeout(() => {
        Swal.fire({
          icon: "info",
          title: "Lokasi tidak ada",
          text: "Koordinat tidak ada.",
        });
      }, 950);
    }
  }

  populateStoryDetailError(message) {
    document.getElementById("story-detail").innerHTML =
      generateStoryDetailErrorTemplate(message);
  }

  async initialMap() {
    console.log("Memulai peta...");
    this.#map = await Map.build("#map", {
      zoom: 15,
    });
    console.log("Peta berhasil dibuat:", this.#map);
  }

  showStoryDetailLoading() {
    document.getElementById("story-detail-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideStoryDetailLoading() {
    document.getElementById("story-detail-loading-container").innerHTML = "";
  }

  showMapLoading() {
    document.getElementById("map-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById("map-loading-container").innerHTML = "";
  }
}
