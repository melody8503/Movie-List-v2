// 顯示全部電影清單
function renderMovieList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster" />
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
          </div>
        </div>
      </div>
    </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

// 顯示點擊的對應modal
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `
        <img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">
      `
    })
}

// 移除收藏電影
function removeFromFavorite(id) {
  // 判斷 movies陣列不存在 或 陣列中沒有元素
  if (!movies || !movies.length) return

  // 透過 id 找到要刪除電影的 index
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  // 判斷移除電影的id不在movies內(movieIndex的值是-1)
  if (movieIndex === -1) return

  // 刪除一筆移除電影的索引位置資料
  movies.splice(movieIndex, 1)

  // 陣列movies JSON字串化，用setItem以{key : value}方式存到local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  // 渲染更新頁面
  renderMovieList(movies)
}


const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
// 將取得的資料放入空陣列
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
const dataPanel = document.querySelector('#data-panel')


// 監聽 data-panel，當符合點擊到的.btn-show-movie，會呼叫函式執行
dataPanel.addEventListener('click', event => {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)


