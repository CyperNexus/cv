document.addEventListener('DOMContentLoaded', () => {
    const musicBtn = document.getElementById('music-btn');
    const audio = document.getElementById('bg-music');
    let isPlaying = false;

    // Set default volume
    audio.volume = 0.5;

    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            musicBtn.innerHTML = '<i class="fas fa-play"></i> Play Music';
            musicBtn.classList.remove('playing');
        } else {
            // Some browsers require user interaction before playing audio
            audio.play().catch(e => {
                console.error("Error playing audio:", e);
                alert("Trình duyệt chặn tự động phát âm thanh, vui lòng tương tác trước khi bật nhạc.");
            });
            musicBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Music';
            musicBtn.classList.add('playing');
        }
        isPlaying = !isPlaying;
    });

    // Optional: Add hover sound effects for links
    // const hoverSound = new Audio('hover.mp3'); // If you had a hover sound
    // const links = document.querySelectorAll('.neon-link');
    // links.forEach(link => {
    //     link.addEventListener('mouseenter', () => {
    //         hoverSound.currentTime = 0;
    //         hoverSound.play().catch(() => {});
    //     });
    // });
});
