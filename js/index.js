// 顯示全部電影清單
function renderMovieList(data, mode) {
  let rawHTML = ''
  
  if (mode === 'card-mode') {
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
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
      `
    })
  }
  else if (mode === 'list-mode') {
    rawHTML += `
      <div class="col">
        <ul class="list-group">
    `
    data.forEach((item) => {    
      rawHTML += `
        <li class="list-group-item list-group-item-action d-flex justify-content-between">
          <h5 class="card-title">${item.title}</h5>
          <div>
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </li>
      `
    })
    rawHTML += ` 
        </ul>
      </div>
    `
  }
  dataPanel.innerHTML = rawHTML
}

// 顯示頁數
function renderPaginator(amount) {
  // 計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

// 依page顯示哪12筆電影資料
function getMoviesByPage(page) {
  // 若搜尋清單有資料，就取搜尋清單filteredMovies，否則取總清單movies
  const data = filteredMovies.length ? filteredMovies : movies
  // 計算起始index
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  // 回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// 顯示點擊的對應modal
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  
  // 清空上一個modal資料殘影
  modalTitle.innerText = ''
  modalDate.innerText = ''
  modalDescription.innerText = ''
  modalImage.innerHTML = ''
  
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

// 加入收藏
function addToFavorite(id){
  // 取出localStorage的值，JSON.parse會將取出的字串轉成物件或陣列
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  // 取出每部電影的id中有符合點擊的id的資料
  const movie = movies.find((movie) => movie.id === id)
  
  // 判斷是否重複加入收藏
  if (list.some((movie) => movie.id === id)) {
    alert('此電影已加入收藏清單')
    return
  }
  
  // 傳入電影資料
  list.push(movie)
  // 存進JSON字串資料
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}


const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
// 一頁12筆電影資料
const MOVIES_PER_PAGE = 12
// 預設當下頁數
let currentPage = 1
// 將取得的資料放入空陣列
const movies = []
// 存放篩選後符合條件的電影資料
let filteredMovies = []
// 預設顯示card-mode
let mode = 'card-mode'


const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const changeMode = document.querySelector('#change-mode')


// 監聽點擊modal資料和加入收藏
dataPanel.addEventListener('click', event => {
  const target = event.target
  if (target.matches('.btn-show-movie')) {
    showMovieModal(Number(target.dataset.id))
  } else if (target.matches('.btn-add-favorite')) {
    addToFavorite(Number(target.dataset.id))
  }
})

// 監聽點擊頁數，顯示該頁電影資料
paginator.addEventListener('click', (event) => {
  // 若不是所點擊對應的頁數則return
  if (!event.target.dataset.page) return

  // 取得當下點擊的頁數(字串轉數字型別的dataset) 
  const page = Number(event.target.dataset.page)
  // 賦值為當下點擊的頁數
  currentPage = page

  // 判斷當下頁面狀態，新增刪除.active
  for (const pageItem of paginator.children) {
    if (pageItem.matches('.active')) {
      pageItem.classList.remove('active')
      break
    }
  }
  event.target.parentElement.classList.add('active')
  
  renderMovieList(getMoviesByPage(currentPage), mode)
})

// 監聽搜尋關鍵字並渲染篩選後的資料
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()
  
  //條件篩選
  filteredMovies = movies.filter((movie) => {
    return movie.title.toLowerCase().includes(keyword)
  })
  
  // 當符合條件筆數為0 或 未輸入、連續輸入空白，會跳alert
  if (filteredMovies.length === 0 || keyword.length === 0) {
    searchInput.value = ''
    // 將先前點擊的頁數設定成第1頁
    currentPage = 1
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(currentPage), mode)
    alert(`您輸入的關鍵字："${keyword}" 沒有符合條件的電影，請輸入其他關鍵字`)
  } 
  
  currentPage = 1
  // 渲染分頁，依篩選資料的長度顯示頁數
  renderPaginator(filteredMovies.length)
  // 預設顯示第1頁搜尋資料
  renderMovieList(getMoviesByPage(currentPage), mode)
})

// 監聽點擊mode，並動態加上.active切換效果，渲染各別資料
changeMode.addEventListener('click', (event) => {
  const target = event.target
  const cardModeClassList = document.querySelector('#card-mode').classList
  const listModeClassList = document.querySelector('#list-mode').classList

  // 取得點擊位置的 mode，讓按鈕範圍都能點擊判斷
  if (target.tagName === 'I') {
    mode = target.parentElement.id
  } else if (target.tagName === 'A'){
    mode = target.id
  }
  // 判斷mode的id 和 切換mode動態加上.active
  if (mode === 'card-mode' && !cardModeClassList.contains('active')) {
    cardModeClassList.add('active')
    listModeClassList.remove('active')
  }
  else if (mode === 'list-mode' && !listModeClassList.contains('active')) {
    listModeClassList.add('active')
    cardModeClassList.remove('active')
  }
  // 渲染點擊的mode
  renderMovieList(getMoviesByPage(currentPage), mode)
})


// 取得資料
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    // 預設顯示card-mode第1頁資料
    renderMovieList(getMoviesByPage(1), mode)
  })
  .catch((error) => {
    console.log('error')
  })