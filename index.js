const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/movies/"; //電影資訊
const POSTER_URL = BASE_URL + "/posters/"; //圖片位子

const movies = [];
let filteredMovies = [];
const moviePerPage = 12;
let style = "A";
let rightNowPage = 1;
const dataPanel = document.querySelector("#data-panel");
const paginator = document.querySelector("#paginator");
const searchForm = document.querySelector("#search-form");
const input = document.querySelector("#search-input");
const template = document.querySelector("#template");
const cardStyle = document.querySelector("#card-style");
const listStyle = document.querySelector("#list-style");

//版型功能
const version = {
  A(data) {
    let rawHTML = "";
    data.forEach((item) => {
      rawHTML += `
    <div class="enlarge-body col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id='${item.id
        }'>
                More
              </button>
              <button class="btn btn-info btn-add-favorite"data-id ='${item.id
        }'>+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
    });
    return (dataPanel.innerHTML = rawHTML);
  },
  B(data) {
    let rawHTML = "";
    rawHTML += `<table class="table table table-hover" id="data-panel-list">
                  <tbody>`;
    data.forEach((item) => {
      rawHTML += `<tr class="table align-middle">
      <th  scope="row">${item.title}</th>
      <td></td>
      <td></td>
      <td><button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id='${item.id}'>More</button>
        <button class="btn btn-info btn-add-favorite" data-id='${item.id}'>+</button>
      </td>
    </tr>`;
    });
    rawHTML += ` </tbody>
            </table>`;
    return (dataPanel.innerHTML = rawHTML);
  },
  change() {
    if (event.target.matches(".fa-bars")) {
      this.B(page.regulate(rightNowPage));
      listStyle.classList.add("current-status");
      cardStyle.classList.remove("current-status");
      style = "B";
    } else {
      version.A(page.regulate(rightNowPage));
      cardStyle.classList.add("current-status");
      listStyle.classList.remove("current-status");
      style = "A";
    }
  }
};

//換頁功能
const page = {
  regulate(page) {
    //切頁器//
    const starIndex = (page - 1) * moviePerPage;
    let data = filteredMovies.length ? filteredMovies : movies;
    //搜尋時是用movies的Array或是filteredMovies的Array做頁數的計算
    return data.slice(starIndex, starIndex + moviePerPage);
  },
  pager(amount) {
    //展示頁數
    const totalPage = Math.ceil(amount / moviePerPage);
    let rawHTML = "";
    for (let page = 0; page < totalPage; page++) {
      rawHTML += `
     <li class="page-item"><a class="page-link" href="#" data-page="${page + 1
        }">${page + 1}</a></li>`;
    }
    return (paginator.innerHTML = rawHTML);
  },
  changer() {
    //跳轉指定頁面
    const eventTarget = event.target;
    if (style === "A") {
      version.A(this.regulate(Number(eventTarget.dataset.page)));
    } else if (style === "B") {
      version.B(this.regulate(Number(eventTarget.dataset.page)));
    }
    rightNowPage = Number(eventTarget.dataset.page);
  }
};

//搜尋功能
function search() {
  event.preventDefault();
  const keyword = input.value.trim().toLowerCase();
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  if (!keyword.length) {
    page.pager(movies.length);
    return version.A(page.regulate(1));
  }
  if (!filteredMovies.length) return alert(`Can't find ${keyword} movie`);

  page.pager(filteredMovies.length);
  if (style === "A") {
    version.A(page.regulate(rightNowPage));
  } else if (style === "B") {
    version.B(page.regulate(rightNowPage));
  }
}

//彈窗、Favorite功能
const feature = {
  flashWindos(id) {
    const movieModalTitle = document.querySelector("#movie-modal-title");
    const movieModalDate = document.querySelector("#movie-modal-date");
    const movieModalDescription = document.querySelector(
      "#movie-modal-description"
    );
    const movieModalImage = document.querySelector("#movie-modal-image");
    axios.get(INDEX_URL + id).then(function (response) {
      const data = response.data.results;
      movieModalTitle.innerHTML = data.title;
      movieModalDate.innerHTML = "Release date : " + data.release_date;
      movieModalDescription.innerHTML = data.description;
      movieModalImage.innerHTML = `<img src="${POSTER_URL + data.image
        }" alt="">`;
    });
  },
  
  addFavorite(id){
    let list = JSON.parse(localStorage.getItem('favorite'))||[]
    let movie = movies.find((movie) => movie.id === id)
    if(list.some((movie) => movie.id === id)){
      return alert('This movie is already in favorites list')
    }
    list.push(movie)
    localStorage.setItem('favorite', JSON.stringify(list))
  }  
};




  //more、Favorite監聽器
  dataPanel.addEventListener("click", (event) => {
    if (event.target.matches('.btn-show-movie')){
    feature.flashWindos(event.target.dataset.id);
    } else if (event.target.matches('.btn-add-favorite')){
    feature.addFavorite(Number(event.target.dataset.id))
    }
  });
  //版型切換監聽器
  template.addEventListener("click", (event) => version.change(event));
  //換頁監聽器                 因為click會觸發event
  paginator.addEventListener("click", (event) => page.changer());
  //搜尋監聽器
  searchForm.addEventListener("submit", search);

  axios
  .get(INDEX_URL)
    .then(function (response) {
      movies.push(...response.data.results);
      page.pager(movies.length);
      version.A(page.regulate(rightNowPage));
            
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });



  