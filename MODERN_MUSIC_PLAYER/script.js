// ========================================
// MUSIC COLLECTION
// ========================================

const songs = [
    {
        title: "Dreams",
        artist: "Ambient Music",
        src: "songs/song1.mp3",
        cover: "images/cover1.jpeg"
    },
    {
        title: "Midnight Vibes",
        artist: "Chill Beats",
        src: "songs/song2.mp3",
        cover: "images/cover2.jpeg"
    },
    {
        title: "Ocean Eyes",
        artist: "Indie Collection",
        src: "songs/song3.mp3",
        cover: "images/cover3.jpeg"
    },
    {
        title: "Golden Hour",
        artist: "Acoustic Sounds",
        src: "songs/song4.mp3",
        cover: "images/cover4.jpeg"
    },
    {
        title: "Night Drive",
        artist: "Electronic Beats",
        src: "songs/song5.mp3",
        cover: "images/cover5.jpeg"
    }
];


// ========================================
// HTML ELEMENTS
// ========================================

const audioPlayer = document.getElementById("audioPlayer");

const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");

const currentTitle = document.getElementById("currentTitle");
const currentArtist = document.getElementById("currentArtist");
const currentCover = document.getElementById("currentCover");

const progressBar = document.getElementById("progressBar");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const volumeBar = document.getElementById("volumeBar");
const muteBtn = document.getElementById("muteBtn");

const favoriteBtn = document.getElementById("favoriteBtn");

const songGrid = document.getElementById("songGrid");
const playlist = document.getElementById("playlist");
const favoritesList = document.getElementById("favoritesList");

const exploreBtn = document.getElementById("exploreBtn");


// ========================================
// PLAYER VARIABLES
// ========================================

let currentIndex = 0;

let isPlaying = false;
let isShuffle = false;

// Repeat modes: 0 = Off, 1 = All, 2 = One
let repeatMode = 0;

let favorites = [];


// ========================================
// FORMAT TIME
// ========================================

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}


// ========================================
// DISPLAY SONGS
// ========================================

function displaySongs() {

    songGrid.innerHTML = "";
    playlist.innerHTML = "";

    songs.forEach((song, index) => {

        // Song cards

        const card = document.createElement("div");

        card.className = "song-card";

        card.innerHTML = `
            <img src="${song.cover}" alt="${song.title} album artwork">
            <h3>${song.title}</h3>
            <p>${song.artist}</p>
        `;

        card.addEventListener("click", () => {
            loadSong(index);
            playSong();
        });

        songGrid.appendChild(card);


        // Playlist items

        const item = document.createElement("div");

        item.className = "playlist-item";

        item.innerHTML = `
            <img src="${song.cover}" alt="">
            <div class="playlist-info">
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            </div>
            <span>${index + 1}</span>
        `;

        item.addEventListener("click", () => {
            loadSong(index);
            playSong();
        });

        playlist.appendChild(item);

    });

    updateFavorites();
}


// ========================================
// LOAD SONG
// ========================================

function loadSong(index) {

    if (index < 0 || index >= songs.length) {
        return;
    }

    currentIndex = index;

    const song = songs[currentIndex];

    audioPlayer.src = song.src;

    currentTitle.textContent = song.title;
    currentArtist.textContent = song.artist;

    currentCover.src = song.cover;

    currentCover.alt = song.title + " album artwork";

    currentCover.onerror = () => {
        currentCover.onerror = null;
        currentCover.src = "images/default.jpeg";
    };

    progressBar.value = 0;

    currentTime.textContent = "0:00";
    duration.textContent = "0:00";

    updateFavoriteButton();

    updateActiveSong();
}


// ========================================
// PLAY SONG
// ========================================

function playSong() {

    audioPlayer.play()
        .then(() => {

            isPlaying = true;

            playBtn.innerHTML = '<i class="fas fa-pause"></i>';

            playBtn.setAttribute("aria-label", "Pause");

        })
        .catch(error => {

            isPlaying = false;

            console.error("Audio playback error:", error);

            alert("Unable to play this song. Check the MP3 file and its location.");

        });

}


// ========================================
// PAUSE SONG
// ========================================

function pauseSong() {

    audioPlayer.pause();

    isPlaying = false;

    playBtn.innerHTML = '<i class="fas fa-play"></i>';

    playBtn.setAttribute("aria-label", "Play");

}


// ========================================
// PLAY / PAUSE BUTTON
// ========================================

playBtn.addEventListener("click", () => {

    if (isPlaying) {

        pauseSong();

    } else {

        playSong();

    }

});


// ========================================
// NEXT SONG
// ========================================

function nextSong() {

    if (isShuffle && songs.length > 1) {

        let randomIndex;

        do {

            randomIndex = Math.floor(Math.random() * songs.length);

        } while (randomIndex === currentIndex);

        currentIndex = randomIndex;

    } else {

        currentIndex++;

        if (currentIndex >= songs.length) {

            if (repeatMode === 1) {

                currentIndex = 0;

            } else {

                currentIndex = 0;
                loadSong(currentIndex);
                pauseSong();
                return;

            }

        }

    }

    loadSong(currentIndex);

    playSong();

}

nextBtn.addEventListener("click", nextSong);


// ========================================
// PREVIOUS SONG
// ========================================

function previousSong() {

    if (audioPlayer.currentTime > 3) {

        audioPlayer.currentTime = 0;

        return;

    }

    currentIndex--;

    if (currentIndex < 0) {

        currentIndex = songs.length - 1;

    }

    loadSong(currentIndex);

    playSong();

}

prevBtn.addEventListener("click", previousSong);


// ========================================
// AUTOMATIC NEXT SONG
// ========================================

audioPlayer.addEventListener("ended", () => {

    if (repeatMode === 2) {

        audioPlayer.currentTime = 0;

        playSong();

    } else {

        nextSong();

    }

});


// ========================================
// UPDATE PLAYBACK TIME
// ========================================

audioPlayer.addEventListener("timeupdate", () => {

    if (Number.isFinite(audioPlayer.duration)) {

        const progress =
            (audioPlayer.currentTime / audioPlayer.duration) * 100;

        progressBar.value = progress || 0;

        currentTime.textContent =
            formatTime(audioPlayer.currentTime);

    }

});


// ========================================
// DISPLAY SONG DURATION
// ========================================

audioPlayer.addEventListener("loadedmetadata", () => {

    duration.textContent = formatTime(audioPlayer.duration);

});


// ========================================
// SEEK BAR
// ========================================

progressBar.addEventListener("input", () => {

    if (Number.isFinite(audioPlayer.duration)) {

        audioPlayer.currentTime =
            (progressBar.value / 100) * audioPlayer.duration;

    }

});


// ========================================
// VOLUME CONTROL
// ========================================

audioPlayer.volume = 0.7;

volumeBar.value = 70;

volumeBar.addEventListener("input", () => {

    audioPlayer.volume = volumeBar.value / 100;

    audioPlayer.muted = false;

    updateVolumeIcon();

});


// ========================================
// MUTE / UNMUTE
// ========================================

muteBtn.addEventListener("click", () => {

    audioPlayer.muted = !audioPlayer.muted;

    updateVolumeIcon();

});


function updateVolumeIcon() {

    const icon = muteBtn.querySelector("i");

    if (audioPlayer.muted || audioPlayer.volume === 0) {

        icon.className = "fas fa-volume-xmark";

    } else if (audioPlayer.volume < 0.5) {

        icon.className = "fas fa-volume-low";

    } else {

        icon.className = "fas fa-volume-high";

    }

}


// ========================================
// SHUFFLE
// ========================================

shuffleBtn.addEventListener("click", () => {

    isShuffle = !isShuffle;

    shuffleBtn.classList.toggle("active", isShuffle);

});


// ========================================
// REPEAT
// ========================================

repeatBtn.addEventListener("click", () => {

    repeatMode = (repeatMode + 1) % 3;

    if (repeatMode === 0) {

        repeatBtn.innerHTML = '<i class="fas fa-repeat"></i>';

        repeatBtn.title = "Repeat Off";

    } else if (repeatMode === 1) {

        repeatBtn.innerHTML = '<i class="fas fa-repeat"></i>';

        repeatBtn.title = "Repeat All";

    } else {

        repeatBtn.innerHTML = '<i class="fas fa-repeat-1"></i>';

        repeatBtn.title = "Repeat One";

    }

    repeatBtn.classList.toggle("active", repeatMode !== 0);

});


// ========================================
// ADD / REMOVE FAVOURITES
// ========================================

favoriteBtn.addEventListener("click", () => {

    if (favorites.includes(currentIndex)) {

        favorites = favorites.filter(index => index !== currentIndex);

    } else {

        favorites.push(currentIndex);

    }

    updateFavoriteButton();

    updateFavorites();

});


function updateFavoriteButton() {

    const icon = favoriteBtn.querySelector("i");

    if (favorites.includes(currentIndex)) {

        icon.className = "fas fa-heart";

        favoriteBtn.style.color = "#b99aff";

    } else {

        icon.className = "far fa-heart";

        favoriteBtn.style.color = "";

    }

}


// ========================================
// DISPLAY FAVOURITE SONGS
// ========================================

function updateFavorites() {

    favoritesList.innerHTML = "";

    if (favorites.length === 0) {

        favoritesList.innerHTML =
            '<p style="padding:20px;color:#85859a;">No favourite songs yet. Add songs using the heart button.</p>';

        return;

    }

    favorites.forEach(index => {

        const song = songs[index];

        const item = document.createElement("div");

        item.className = "playlist-item";

        item.innerHTML = `
            <img src="${song.cover}" alt="">
            <div class="playlist-info">
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            </div>
            <i class="fas fa-heart"></i>
        `;

        item.addEventListener("click", () => {

            loadSong(index);

            playSong();

        });

        favoritesList.appendChild(item);

    });

}


// ========================================
// HIGHLIGHT CURRENT SONG
// ========================================

function updateActiveSong() {

    const items = document.querySelectorAll(".playlist-item");

    items.forEach((item, index) => {

        item.classList.toggle("active", index === currentIndex);

    });

}


// ========================================
// EXPLORE MUSIC BUTTON
// ========================================

exploreBtn.addEventListener("click", () => {

    document.getElementById("playlist-section")
        .scrollIntoView({ behavior: "smooth" });

});


// ========================================
// INITIALIZE MUSIC PLAYER
// ========================================

displaySongs();

loadSong(0);

updateVolumeIcon();