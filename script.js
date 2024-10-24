const apiKey = '9830cdd8'; // Replace with your actual API key
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const ratingFilter = document.getElementById('ratingFilter');
const ratingValue = document.getElementById('ratingValue');
const movieGrid = document.getElementById('movieGrid');

// Event Listeners
ratingFilter.addEventListener('input', () => {
    ratingValue.textContent = ratingFilter.value;
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMovies();
    }
});

searchButton.addEventListener('click', searchMovies);

// Main search function
async function searchMovies() {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
        showError('Please enter a movie title');
        return;
    }

    showLoading();

    try {
        // Initial search request
        const searchResponse = await fetch(
            `https://www.omdbapi.com/?s=${searchTerm}&apikey=${apiKey}`
        );
        const searchData = await searchResponse.json();

        if (searchData.Response === 'False') {
            showError(searchData.Error || 'No movies found');
            return;
        }

        // Fetch detailed information for each movie
        const movies = await Promise.all(
            searchData.Search.map(movie => 
                fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`)
                    .then(res => res.json())
            )
        );

        displayMovies(movies);
    } catch (error) {
        showError('An error occurred while fetching movies');
        console.error('Error:', error);
    }
}

// Display movies in the grid
function displayMovies(movies) {
    const minRating = parseFloat(ratingFilter.value);
    const filteredMovies = movies.filter(movie => 
        parseFloat(movie.imdbRating) >= minRating && movie.imdbRating !== 'N/A'
    );

    if (filteredMovies.length === 0) {
        showError('No movies match your criteria');
        return;
    }

    movieGrid.innerHTML = filteredMovies
        .map(movie => `
            <article class="movie-card">
                <img 
                    class="movie-poster" 
                    src="${movie.Poster !== 'N/A' ? movie.Poster : '/api/placeholder/250/375'}" 
                    alt="${movie.Title} poster"
                    loading="lazy"
                >
                <div class="movie-info">
                    <h2 class="movie-title">${movie.Title} (${movie.Year})</h2>
                    <div class="movie-rating">
                        <span class="rating-star">★</span>
                        <span>${movie.imdbRating}/10</span>
                        <span>(${formatNumber(movie.imdbVotes)} votes)</span>
                    </div>
                </div>
            </article>
        `)
        .join('');
}

// Utility Functions
function showLoading() {
    movieGrid.innerHTML = '<div class="loading">Searching for movies...</div>';
}

function showError(message) {
    movieGrid.innerHTML = `<div class="error">${message}</div>`;
}

function formatNumber(numStr) {
    if (!numStr) return '0';
    return parseInt(numStr.replace(/,/g, '')).toLocaleString();
}