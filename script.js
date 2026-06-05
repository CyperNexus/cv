document.addEventListener('DOMContentLoaded', () => {
    const musicBtn = document.getElementById('music-btn');
    const audio = document.getElementById('bg-music');
    const record = document.getElementById('record');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');

    let isPlaying = false;
    audio.volume = 0.5;

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    }

    audio.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audio.duration);
        progressBar.max = audio.duration;
    });

    let isDragging = false;

    audio.addEventListener('timeupdate', () => {
        if (!isDragging) {
            progressBar.value = audio.currentTime;
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }
        if (totalTimeEl.textContent === "0:00" && audio.duration) {
            totalTimeEl.textContent = formatTime(audio.duration);
            progressBar.max = audio.duration;
        }
    });

    progressBar.addEventListener('mousedown', () => isDragging = true);
    progressBar.addEventListener('touchstart', () => isDragging = true, {passive: true});

    progressBar.addEventListener('input', () => {
        currentTimeEl.textContent = formatTime(progressBar.value);
    });

    progressBar.addEventListener('change', () => {
        isDragging = false;
        audio.currentTime = progressBar.value;
    });
    
    progressBar.addEventListener('mouseup', () => isDragging = false);
    progressBar.addEventListener('touchend', () => isDragging = false);

    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            musicBtn.innerHTML = '<i class="fas fa-play"></i>';
            musicBtn.classList.remove('playing');
            record.classList.remove('playing');
        } else {
            audio.play().catch(e => {
                console.error("Error playing audio:", e);
                alert("Trình duyệt chặn tự động phát âm thanh, vui lòng tương tác trước khi bật nhạc.");
            });
            musicBtn.innerHTML = '<i class="fas fa-pause"></i>';
            musicBtn.classList.add('playing');
            record.classList.add('playing');
        }
        isPlaying = !isPlaying;
    });
});
