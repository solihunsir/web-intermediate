import { showFormattedDate } from "./utils";

export function generateLoaderTemplate() {
  return `
        <div class="loader"></div>
    `;
}

export function generateLoaderAbsoluteTemplate() {
  return `
        <div class="loader loader-absolute"></div>
    `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
        <li id="push-notification-tools" class="push-notification-tools"></li>
        <li> <a id="login-button" href="#/login">Login</a></li>
        <li> <a id="register-button" href="#/register">Register</a></li>
    `;
}

export function generateAuthenticatedNavigationListTemplate() {
  return `
        <li id="push-notification-tools" class="push-notification-tools"></li>
        <li> <a id="bookmark-button" class="btn bookmark-button" href="#/bookmark">Story Tersimpan</a></li>
        <li> <a id="new-story-button" class="btn new-story-button" href="#/new">Add Story <i class="fas fa-plus"></i></a></li>
        <li> <a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
    `;
}

export function generateStoriesListEmptyTemplate() {
  return `
        <div id="stories-list-empty" class="stories-list__empty">
          <h2>Tidak ada Story yang tersedia</h2>
          <p>Tidak ada Story yang dapat ditampilkan.</p>
        </div>
    `;
}

export function generateStoriesListErrorTemplate(message) {
  return `
        <div id="stories-list-error" class="stories-list__error">
          <h2>Terjadi kesalahan </h2>
          <p>${message ? message : "Gunakan jaringan lain"}</p>
        </div>
    `;
}

export function generateStoryItemTemplate({
  id,
  name,
  description,
  photoUrl,
  createdAt,
  location,
}) {
  return `
        <div tabindex="0" class="story-item" data-storyid="${id}">
          <img class="story-item__image" src="${photoUrl}" alt="${name}">
          <div class="story-item__body">
            <div class="story-item__main">
              <h2 id="story-title" class="story-item__title">${name}</h2>
              <div class="story-item__more-info">
                <div class="story-item__createdat">
                  <i class="fas fa-calendar-alt"></i> ${showFormattedDate(
                    createdAt,
                    "id-ID"
                  )}
                </div>
                <div class="story-item__location">
                  <i class="fas fa-map"></i>${
                    location.latitude ?? "Tidak ada data"
                  }, ${location.longitude ?? "Tidak ada data"}
                </div>
              </div>
            </div>
            <div id="story-description" class="story-item__description">
              ${description}
            </div>
            <div class="story-item__more-info">
              <div class="story-item__author">
                Dibuat oleh: ${name}
              </div>
            </div>
            <a class="btn story-item__read-more" href="#/story/${id}">
              Selengkapnya <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
    `;
}

export function generateStoryDetailTemplate({
  image,
  description,
  location,
  authorName,
  createdAt,
}) {
  const createdAtFormatted = showFormattedDate(createdAt, "id-ID");
  const imageHtml = generateImageDetailTemplate(image);

  return `
        <div class="container">
            <div class="story-detail__images__container">
                <div id="image" class="story-detail__image">${imageHtml}</div>
            </div>
        </div>
        
        <div class="container">
            <div class="story-detail__body">
                <div class="story-detail__more-info">
                    <div class="story-detail__more-info__inline">
                      <div id="createdat" class="story-detail__createdat" data-value="${createdAtFormatted}"><i class="fas fa-calendar-alt"></i></div>
                      <div id="location-place-name" class="story-detail__location__place-name" data-value="${
                        location.placeName
                      }"><i class="fas fa-map"></i></div>
                    </div>
                    <div class="story-detail__more-info__inline">
                      <div id="location-latitude" class="story-detail__location__latitude" data-value="${
                        location.latitude ?? "Latitude tidak ada"
                      }">Latitude:</div>
                      <div id="location-longitude" class="story-detail__location__longitude" data-value="${
                        location.longitude ?? "Longitude tidak ada"
                      }">Longitude:</div>
                    </div>
                    <div id="author" class="story-detail__author" data-value="${authorName}">Dibuat oleh:</div>
              </div>
              
              <div class="story-detail__body__description__container">
                <h2 class="story-detail__description__title">Deskripsi</h2>
                <div id="description" class="story-detail__description__body">
                  ${description}
                </div>
              </div>
              
               <div class="story-detail__body__map__container">
                  <h2 class="story-detail__map__title">Peta Lokasi</h2>
                  <div class="story-detail__map__container">
                    <div id="map" class="story-detail__map"></div>
                    <div id="map-loading-container"></div>
                  </div>
               </div>
               
               <hr>
  
               <div class="story-detail__body__actions__container">
                 <h2>Aksi</h2>
                 <div class="story-detail__actions__buttons">
                   <div id="save-actions-container"></div>
                 </div>
               </div>
            </div>
        </div>
    `;
}

export function generateImageDetailTemplate(imageUrl = null, alt = "") {
  if (!imageUrl) {
    return `<img class="story-detail__image" src="" alt="Placeholder Image">`;
  }

  return `
        <img class="story-detail__image" src="${imageUrl}" alt="${alt}">
    `;
}

export function generateStoryDetailErrorTemplate(message) {
  return `
    <div id="story-detail-error" class="story-detail__error">
      <h2>Terjadi kesalahan</h2>
      <p>${message ? message : "Gunakan jaringan lain"}</p>
    </div>
  `;
}

export function generateSubscribeButtonTemplate() {
  return `
    <button id="subscribe-button" class="btn subscribe-button">
      Subscribe <i class="fas fa-bell"></i>
    </button>
  `;
}

export function generateUnsubscribeButtonTemplate() {
  return `
    <button id="unsubscribe-button" class="btn unsubscribe-button">
      Unsubscribe <i class="fas fa-bell-slash"></i>
    </button>
  `;
}

export function generateSaveStoryButtonTemplate() {
  return `
    <button id="story-detail-save" class="btn btn-transparent">
      Simpan Story <i class="far fa-bookmark"></i>
    </button>
  `;
}

export function generateSaveLocationButtonTemplate() {
  return `
    <button id="story-detail-save-location" class="btn btn-transparent">
      Simpan Lokasi <i class="fas fa-map-marker-alt"></i>
    </button>
  `;
}

export function generateRemoveStoryButtonTemplate() {
  return `
    <button id="story-detail-remove" class="btn btn-transparent">
      Buang Story <i class="fas fa-bookmark"></i>
    </button>
  `;
}

export function generateLocationItemTemplate(location, index) {
  return `
    <div class="location-item" data-locationid="${index}">
      <div class="location-item__details">
        <div class="location-item__coordinates">
          <i class="fas fa-map-marker-alt"></i> Latitude: ${
            location.latitude
          }, Longitude: ${location.longitude}
        </div>
        <div class="location-item__place-name">
          <i class="fas fa-map"></i> Place: ${
            location.placeName || "Tidak ada data"
          }
        </div>
      </div>
    </div>
  `;
}
