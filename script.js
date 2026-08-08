/* ==========================================================================
   CyperNexus Portfolio — Interactive Scripts & Web Audio Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------------------------
    // 1. Theme Switcher System
    // ----------------------------------------------------------------------
    const themeBtns = document.querySelectorAll('.theme-btn');
    const htmlEl = document.documentElement;
    
    // Load saved theme
    const savedTheme = localStorage.getItem('cyper_theme') || 'neon';
    setTheme(savedTheme);

    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-set-theme');
            setTheme(theme);
        });
    });

    function setTheme(themeName) {
        htmlEl.setAttribute('data-theme', themeName);
        localStorage.setItem('cyper_theme', themeName);
        
        themeBtns.forEach(btn => {
            if (btn.getAttribute('data-set-theme') === themeName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // ----------------------------------------------------------------------
    // 2. Interactive Cyber Particle Background Canvas
    // ----------------------------------------------------------------------
    const bgCanvas = document.getElementById('bg-canvas');
    if (bgCanvas) {
        const ctx = bgCanvas.getContext('2d');
        let width = bgCanvas.width = window.innerWidth;
        let height = bgCanvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = bgCanvas.width = window.innerWidth;
            height = bgCanvas.height = window.innerHeight;
        });

        const particles = [];
        const particleCount = Math.min(Math.floor(window.innerWidth / 20), 45);

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.8;
                this.radius = Math.random() * 2 + 1;
                this.color = Math.random() > 0.5 ? 'rgba(0, 243, 255, ' : 'rgba(255, 42, 133, ';
                this.alpha = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color + this.alpha + ')';
                ctx.shadowBlur = 8;
                ctx.shadowColor = this.color + '0.8)';
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        let mouseX = -1000;
        let mouseY = -1000;
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateParticles() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                // Connect nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 243, 255, ${0.15 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }

                // Connect to mouse cursor
                const mdx = particles[i].x - mouseX;
                const mdy = particles[i].y - mouseY;
                const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
                if (mdist < 140) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.strokeStyle = `rgba(255, 42, 133, ${0.3 * (1 - mdist / 140)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // ----------------------------------------------------------------------
    // 3. Dynamic Typing Subtitle Effect
    // ----------------------------------------------------------------------
    const typedTextEl = document.getElementById('typed-text');
    if (typedTextEl) {
        const roles = [
            "Software Engineer",
            "Cybernetic Enthusiast",
            "AI Agent Builder",
            "C++ & Rust Craftsman",
            "Distributed Systems Explorer"
        ];
        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;

        function typeLoop() {
            const currentRole = roles[roleIndex];

            if (isDeleting) {
                typedTextEl.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 40;
            } else {
                typedTextEl.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 90;
                
                // Spawn floating sparkle particles as characters are typed!
                if (window.spawnSparklesAtRect && typedTextEl.offsetParent !== null) {
                    const rect = typedTextEl.getBoundingClientRect();
                    window.spawnSparklesAtRect(rect, 3);
                }
            }

            if (!isDeleting && charIndex === currentRole.length) {
                typingSpeed = 2200; // Pause at complete word
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                typingSpeed = 500; // Pause before typing next
            }

            setTimeout(typeLoop, typingSpeed);
        }
        typeLoop();
    }

    // ----------------------------------------------------------------------
    // 4. Music Player Widget & Radial Audio Visualizer
    // ----------------------------------------------------------------------
    const musicBtn = document.getElementById('music-btn');
    const audio = document.getElementById('bg-music');
    const record = document.getElementById('record');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const volumeSlider = document.getElementById('volume-slider');
    const muteBtn = document.getElementById('mute-btn');
    const vizCanvas = document.getElementById('audio-visualizer-canvas');

    let isPlaying = false;
    let audioCtx = null;
    let analyser = null;
    let dataArray = null;
    let source = null;

    if (audio) {
        audio.volume = 0.5;
        if (volumeSlider) volumeSlider.value = 0.5;
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    }

    if (audio && totalTimeEl && progressBar) {
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
        progressBar.addEventListener('touchstart', () => isDragging = true, { passive: true });
        progressBar.addEventListener('input', () => {
            currentTimeEl.textContent = formatTime(progressBar.value);
        });
        progressBar.addEventListener('change', () => {
            isDragging = false;
            audio.currentTime = progressBar.value;
        });
        progressBar.addEventListener('mouseup', () => isDragging = false);
        progressBar.addEventListener('touchend', () => isDragging = false);

        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                audio.volume = e.target.value;
                if (audio.volume === 0) {
                    muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                } else {
                    muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                }
            });
        }

        if (muteBtn) {
            let lastVol = 0.5;
            muteBtn.addEventListener('click', () => {
                if (audio.volume > 0) {
                    lastVol = audio.volume;
                    audio.volume = 0;
                    if (volumeSlider) volumeSlider.value = 0;
                    muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                } else {
                    audio.volume = lastVol || 0.5;
                    if (volumeSlider) volumeSlider.value = audio.volume;
                    muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                }
            });
        }
    }

    // Audio Visualizer Setup
    function initVisualizer() {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            source = audioCtx.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioCtx.destination);
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            drawRadialVisualizer();
        } catch (err) {
            console.log("AudioContext fallback/not allowed until user gesture:", err);
        }
    }

    function drawRadialVisualizer() {
        if (!vizCanvas) return;
        const ctx = vizCanvas.getContext('2d');
        const centerX = vizCanvas.width / 2;
        const centerY = vizCanvas.height / 2;
        const baseRadius = 43;

        function render() {
            requestAnimationFrame(render);
            ctx.clearRect(0, 0, vizCanvas.width, vizCanvas.height);

            if (!analyser || !isPlaying) return;

            analyser.getByteFrequencyData(dataArray);

            const bars = 24;
            const step = Math.PI * 2 / bars;

            for (let i = 0; i < bars; i++) {
                const value = dataArray[i % dataArray.length] || 0;
                const barHeight = (value / 255) * 16;
                const angle = i * step;

                const x1 = centerX + Math.cos(angle) * baseRadius;
                const y1 = centerY + Math.sin(angle) * baseRadius;
                const x2 = centerX + Math.cos(angle) * (baseRadius + barHeight);
                const y2 = centerY + Math.sin(angle) * (baseRadius + barHeight);

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = i % 2 === 0 ? '#ff2a85' : '#00f3ff';
                ctx.lineWidth = 2.5;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
        }
        render();
    }

    if (musicBtn && audio) {
        musicBtn.addEventListener('click', () => {
            initVisualizer();
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            if (isPlaying) {
                audio.pause();
                musicBtn.innerHTML = '<i class="fas fa-play"></i>';
                musicBtn.classList.remove('playing');
                if (record) record.classList.remove('playing');
            } else {
                audio.play().then(() => {
                    musicBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    musicBtn.classList.add('playing');
                    if (record) record.classList.add('playing');
                    showToast("🎵 Đang phát nhạc nền...");
                }).catch(e => {
                    console.error("Error playing audio:", e);
                    showToast("⚠️ Vui lòng nhấp vào trang trước khi bật nhạc!");
                });
            }
            isPlaying = !isPlaying;
        });
    }

    // ----------------------------------------------------------------------
    // 5. Dynamic Stats Counter Animation
    // ----------------------------------------------------------------------
    const statNumbers = document.querySelectorAll('.stat-number');
    let animatedStats = false;

    function animateStats() {
        if (animatedStats) return;
        statNumbers.forEach(stat => {
            const target = parseFloat(stat.getAttribute('data-target'));
            let current = 0;
            const increment = target / 40;
            const isFloat = target % 1 !== 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                stat.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
            }, 30);
        });
        animatedStats = true;
    }
    setTimeout(animateStats, 600);

    // ----------------------------------------------------------------------
    // 6. Project Category Filter System
    // ----------------------------------------------------------------------
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');

            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ----------------------------------------------------------------------
    // 7. Interactive 3D Tilt Effect on Cards
    // ----------------------------------------------------------------------
    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
        });
    });

    // ----------------------------------------------------------------------
    // 8. Cyber Terminal Mini CLI
    // ----------------------------------------------------------------------
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');

    if (terminalInput && terminalOutput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = terminalInput.value.trim();
                if (!cmd) return;

                // Add user line
                appendTerminalLine(`cyper@nexus:~$ ${cmd}`, 'user-cmd-line');
                processCommand(cmd.toLowerCase());
                terminalInput.value = '';
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            }
        });
    }

    function appendTerminalLine(text, className = 'response-line') {
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        line.textContent = text;
        terminalOutput.appendChild(line);
    }

    function processCommand(cmd) {
        switch (cmd) {
            case '/help':
                appendTerminalLine('Các câu lệnh khả dụng:');
                appendTerminalLine('  /whoami     - Xem thông tin lập trình viên');
                appendTerminalLine('  /skills     - Danh sách kỹ năng nòng cốt');
                appendTerminalLine('  /projects   - Danh sách dự án nổi bật');
                appendTerminalLine('  /contact    - Thông tin liên hệ trực tiếp');
                appendTerminalLine('  /theme      - Thay đổi theme (vd: /theme emerald, /theme synthwave, /theme neon)');
                appendTerminalLine('  /clear      - Xóa lịch sử màn hình terminal');
                break;
            case '/whoami':
                appendTerminalLine('CyperNexus (Dat Nguyxn) — Software Engineer & Cybernetic Enthusiast.');
                appendTerminalLine('Tập trung phát triển AI Agents, C++/Rust Systems và Tự động hóa.');
                break;
            case '/skills':
                appendTerminalLine('Ngôn ngữ: Java, JavaScript/TS, Python, C++, Rust.');
                appendTerminalLine('Chuyên môn: AI Agents Framework, LLM Prompting, Distributed DB, Docker.');
                break;
            case '/projects':
                appendTerminalLine('1. FlowAgent — Autonomous AI Agentic System');
                appendTerminalLine('2. VideoUpper — Automated Multi-Platform Video Management');
                appendTerminalLine('3. VideoGenerate — AI Powered High Quality Video Pipeline');
                appendTerminalLine('4. DatabaseController — Distributed Database Coordinator');
                appendTerminalLine('5. PromtInjector — LLM Prompt Testing & Diagnostics');
                appendTerminalLine('6. NeuralCompiler — Neural Inference Optimization Engine');
                break;
            case '/contact':
                appendTerminalLine('Discord: ._almighty');
                appendTerminalLine('Email: cypernguyen@gmail.com');
                appendTerminalLine('Facebook: Dat Nguyxn');
                break;
            case '/clear':
                terminalOutput.innerHTML = '';
                appendTerminalLine('Đã xóa màn hình terminal.', 'system-line');
                break;
            case '/theme neon':
                setTheme('neon');
                appendTerminalLine('Đã đổi theme sang Neon Cyberpunk ⚡', 'system-line');
                break;
            case '/theme emerald':
                setTheme('emerald');
                appendTerminalLine('Đã đổi theme sang Emerald Matrix 🟢', 'system-line');
                break;
            case '/theme synthwave':
                setTheme('synthwave');
                appendTerminalLine('Đã đổi theme sang Deep Violet Synthwave 🌆', 'system-line');
                break;
            default:
                if (cmd.startsWith('/theme')) {
                    appendTerminalLine('Cú pháp: /theme <neon | emerald | synthwave>');
                } else {
                    appendTerminalLine(`Lệnh không hợp lệ: "${cmd}". Gõ /help để xem trợ giúp.`);
                }
                break;
        }
    }

    // ----------------------------------------------------------------------
    // 9. Clipboard Copy & Toast System
    // ----------------------------------------------------------------------
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const text = btn.getAttribute('data-copy');
            if (text) {
                navigator.clipboard.writeText(text).then(() => {
                    showToast(`📋 Đã sao chép: "${text}"`);
                }).catch(err => {
                    showToast(`⚠️ Không thể sao chép: ${err}`);
                });
            }
        });
    });

    function showToast(message) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
});
