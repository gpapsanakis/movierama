const apiKey = "?api_key=bc50218d91157b1ba4f142ef7baaa6a0";

const apiUrlMovies = 'https://api.themoviedb.org/3/movie/now_playing' + apiKey + '&language=en-US&page=1';
const apiUrlMoreMovies = 'https://api.themoviedb.org/3/movie/now_playing' + apiKey + '&language=en-US&page=';
const apiUrlGenre = 'https://api.themoviedb.org/3/genre/movie/list' + apiKey + '&language=en-US';
const apiMovieInfo = 'https://api.themoviedb.org/3/movie/';
const imgPath = "https://image.tmdb.org/t/p/w1280";
const apiSearch =
    'https://api.themoviedb.org/3/search/movie' + apiKey + '&query=';

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");
const loading = document.querySelector(".loading");

const youtubeLink = 'https://www.youtube.com/watch?v=';

let mainPage = 2;
let searchPage;
let searchTerm;

let posterPath;
let titleText;
let overviewText;
let releaseDate;
let vote;

let genreArray = [];

let trailerLink;

let reviewsArray = [];
let reviewHTML = ``;

let titleArray = [];

const useState = (defaultValue) => {
    let value = defaultValue;
    const getValue = () => value
    const setValue = newValue => value = newValue
    
    return [getValue, setValue];
}

const [activePage, setActivePage] = useState(null);
const [totalPages, setTotalPages] = useState(null);

showMovies(apiUrlMovies);
function showMovies(url) {
    setTotalPages(null);
    fetch(url).then(res => res.json())
    .then(function(data){
        data.results.forEach(element => {
            const el = document.createElement('div');
            const image = document.createElement('img');
            const title = document.createElement('h2');
            const overview = document.createElement('div');
            const year = document.createElement('h4');
            const voteAverage = document.createElement('h4');

            el.classList.add('movie')
            el.setAttribute('id',element.id);
            overview.classList.add('overview');
            
            image.src = imgPath + element.poster_path;
            image.alt = element.title;
            title.innerHTML = element.title;
            overview.innerHTML = element.overview;
            year.innerHTML = "<br>Year of release:" + element.release_date;
            voteAverage.innerHTML = "Vote average:" + element.vote_average + "/10";

            el.appendChild(image);
            el.appendChild(title);
            overview.appendChild(year);
            overview.appendChild(voteAverage);
            el.appendChild(overview);
            main.appendChild(el);

            document.getElementById(element.id).addEventListener("click", () => {
                retrieveInfoModal(apiMovieInfo, element.id);
                document.getElementById("movieModal").style.display = "block";
            });

            window.onclick = function(event) {
                if (event.target == document.getElementById("movieModal")) {
                    document.getElementById("movieModal").style.display = "none";
                }
            }
        });
        setTotalPages(data.total_pages);

        function retrieveInfoModal(url, id) {
            fetch(url + id + apiKey + "&language=en-US").then(res => res.json())
                .then(function (data) {
                    posterPath = data.poster_path;
                    titleText = data.title;
                    overviewText = data.overview;
                    releaseDate = data.release_date;
                    vote = data.vote_average;
                    data.genres.forEach(element => {
                        genreArray.push(element.name)
                    }); 
                })
            
            fetch(url + id + "/videos" + apiKey + "&language=en-US").then(res => res.json())
            .then(function (data) {
                trailerLink = data.results[0].key;
            })

            fetch(url + id + "/reviews" + apiKey + "&language=en-US").then(res => res.json())
                .then(function (data) {
                    data.results.forEach(element => {
                        reviewsArray.push(element.url)
                    });
                    let i = 1;
                    let x = reviewsArray.length >= 2 ? 1 : reviewsArray.length;
                    for (let y = 0; y <= x; y++) {
                        reviewHTML += `<a href=${reviewsArray[y]} target="_blank">Review ${i}</a><br>`;
                        i++;
                    }
            })

            fetch(url + id + "/similar" + apiKey + "&language=en-US").then(res => res.json())
            .then(function (data) {
                data.results.forEach(element => {
                    titleArray.push(element.title);
                })

                document.getElementById("modal-content").innerHTML = `
                <div class='moviePosterInModal'>
                    <img src="${imgPath + posterPath}" alt="${titleText}" style="width:280px;height:400px;">
                    <div class='reviews'>${reviewHTML}</div>
                </div>
                <br>
                <div class='movieDetails'>
                    <div class='movieName'>${titleText}</div>
                    <br>
                    <div class='linkToTrailer'><a href=${youtubeLink+trailerLink} target="_blank">Play trailer</a></div>
                    <br>
                    <div class='release'>Release Date: ${releaseDate}</div>
                    <br>
                    <div class='overviewModal'>${overviewText}</div>
                    <br>
                    <div class='rating'>Rating: ${vote}/10</div>
                    <br>
                    <div class='genreModal'>Genre(s): ${genreArray}</div>
                    <br>
                    <div class='similar'>Similar movies: ${titleArray}</div>
                </div>
                `;
            })
            .finally(() => {
                reviewHTML = ``;
                posterPath = "";
                titleText = "";
                overviewText = "";
                releaseDate = "";
                vote = "";
                genreArray = [];
                trailerLink = "";
                reviewsArray = [];
                reviewHTML = ``;
                titleArray = [];
            })
        }
    });
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    main.innerHTML = '';
     
    searchTerm = search.value;

    if (searchTerm && searchTerm !== '') {
        setActivePage("searchPage");
        searchPage = 2;
        showMovies(apiSearch + searchTerm);
        search.value = "";
    } else {
        window.location.reload()
    }
});

window.addEventListener('scroll', () => {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    if (activePage() !== "searchPage" && totalPages() >= mainPage) {
        loading.style.display = "flex";
        if(scrollTop + clientHeight > scrollHeight - 5){
            setTimeout(showMovies(apiUrlMoreMovies + mainPage), 2000)
            mainPage++;
            loading.style.display = "none";
        }
    }

    if (activePage() === "searchPage" && totalPages() >= searchPage) {
        loading.style.display = "flex";
        if (scrollTop + clientHeight > scrollHeight - 5) {
            setTimeout(showMovies(apiSearch + searchTerm + "&page=" + searchPage), 2000);
            searchPage++;
            loading.style.display = "none";
        }
    }
});

