// Inicializar Canvas Background com Partículas Reativas
function initCanvasBackground() {
    const canvas = document.getElementById('background-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    // Configuração de partículas
    const particles = [];
    const particleCount = 50;
    const interactionRadius = 150;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.baseX = this.x;
            this.baseY = this.y;
            this.size = Math.random() * 2 + 0.5;
            // Velocidade inicial reduzida para movimento mais lento
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.3;
            this.baseOpacity = this.opacity;
            // Ruído para movimento mais orgânico (reduzido para ser mais lento)
            this.noiseX = Math.random() * Math.PI * 2;
            this.noiseY = Math.random() * Math.PI * 2;
            this.noiseSpeedX = Math.random() * 0.008 + 0.003;
            this.noiseSpeedY = Math.random() * 0.008 + 0.003;
        }
        
        update() {
            // Adicionar ruído ao movimento para efeito mais orgânico
            this.noiseX += this.noiseSpeedX;
            this.noiseY += this.noiseSpeedY;
            
            const noiseInfluenceX = Math.sin(this.noiseX) * 0.5;
            const noiseInfluenceY = Math.cos(this.noiseY) * 0.5;
            
            // Movimento suave com ruído
            this.x += this.vx + noiseInfluenceX;
            this.y += this.vy + noiseInfluenceY;
            
            // Reduzir a atração à posição base para permitir mais movimento livre
            this.x += (this.baseX - this.x) * 0.005;
            this.y += (this.baseY - this.y) * 0.005;
            
            // Limites da tela
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
            
            // Calcular distância do mouse
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Reação ao mouse
            if (distance < interactionRadius) {
                const angle = Math.atan2(dy, dx);
                const force = (1 - distance / interactionRadius) * 3;
                
                this.vx -= Math.cos(angle) * force;
                this.vy -= Math.sin(angle) * force;
                
                // Aumentar opacidade quando perto do mouse
                this.opacity = this.baseOpacity + (1 - distance / interactionRadius) * 0.7;
            } else {
                this.opacity = this.baseOpacity;
            }
            
            // Limitar velocidade
            const maxSpeed = 2;
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > maxSpeed) {
                this.vx = (this.vx / speed) * maxSpeed;
                this.vy = (this.vy / speed) * maxSpeed;
            }
            
            // Atrito reduzido para manter movimento constante
            this.vx *= 0.98;
            this.vy *= 0.98;
        }
        
        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Inicializar partículas espalhadas por todo o canvas
    for (let i = 0; i < particleCount; i++) {
        const p = new Particle();
        // Garantir que as partículas estejam distribuídas por toda a tela
        p.x = Math.random() * window.innerWidth;
        p.y = Math.random() * window.innerHeight;
        p.baseX = p.x;
        p.baseY = p.y;
        particles.push(p);
    }
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    function drawConnections() {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const opacity = (1 - distance / 100) * 0.3;
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    

    
    function animate() {
        // Fundo gradiente escuro
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.5, '#1a1a1a');
        gradient.addColorStop(1, '#0d0d0d');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        

        
        // Atualizar e desenhar partículas
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Desenhar conexões entre partículas
        drawConnections();
        
        animationId = requestAnimationFrame(animate);
    }
    
    // Event listeners
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Quando sair da tela
    document.addEventListener('mouseleave', () => {
        mouseX = window.innerWidth / 2;
        mouseY = window.innerHeight / 2;
    });
    
    animate();
}

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar background
    initCanvasBackground();
    
    const CONFIG = {
        DISCORD_USER_ID: '1440015076688920618',
        UPDATE_INTERVAL: 1000,
    };
    
    const cursor = document.querySelector('.cursor');
    
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        
        const hoverElements = document.querySelectorAll('a, .profile-img, .desktop-icon, .discord-link');
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.style.width = '16px';
                cursor.style.height = '16px';
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.style.width = '8px';
                cursor.style.height = '8px';
            });
        });
    }
    
    const typingText = document.querySelector('.typing-text');
    if (typingText) {
        const text = 'made by @wwwwwwwwaska or @k9wn';
        let index = 0;
        
        function typeWriter() {
            if (index < text.length) {
                typingText.textContent = text.slice(0, index + 1);
                index++;
                setTimeout(typeWriter, 100);
            } else {
                setTimeout(() => {
                    index = 0;
                    typingText.textContent = '';
                    setTimeout(typeWriter, 2000);
                }, 4000);
            }
        }
        
        setTimeout(typeWriter, 1000);
    }
    
    // WebSocket para Lanyard
    let socket;
    let currentLanyardData = null;
    let spotifyInterval = null;

    function connectLanyard() {
        socket = new WebSocket('wss://api.lanyard.rest/socket');
        
        socket.onopen = () => {
            socket.send(JSON.stringify({
                op: 2,
                d: { subscribe_to_id: CONFIG.DISCORD_USER_ID }
            }));
            
            if (spotifyInterval) clearInterval(spotifyInterval);
            spotifyInterval = setInterval(() => {
                if (currentLanyardData) {
                    updateRealtimeUI(currentLanyardData);
                }
            }, 1000);
        };

        socket.onmessage = (event) => {
            const { op, d } = JSON.parse(event.data);
            if (op === 1) { // Hello
                setInterval(() => {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({ op: 3 }));
                    }
                }, d.heartbeat_interval);
            } else if (op === 0) { // Event data
                currentLanyardData = d;
                updateRealtimeUI(d);
            }
        };

        socket.onclose = () => {
            if (spotifyInterval) clearInterval(spotifyInterval);
            setTimeout(connectLanyard, 5000);
        };
    }

    function updateRealtimeUI(data) {
        if (!data) return;

        const avatar = document.getElementById('discord-avatar');
        const mainAvatar = document.getElementById('main-avatar');
        const username = document.getElementById('discord-username');
        const statusIndicator = document.getElementById('discord-status');
        
        if (data.discord_user) {
            const avatarUrl = data.discord_user.avatar 
                ? `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png?size=128`
                : `https://cdn.discordapp.com/embed/avatars/0.png`;
            if (avatar) avatar.src = avatarUrl;
            if (mainAvatar) mainAvatar.src = avatarUrl;
            if (username) username.textContent = '@' + (data.discord_user.username || 'wwwwwwwwaska');
            window.discordUsername = data.discord_user.username || 'wwwwwwwwaska';
        }
        
        if (statusIndicator) {
            statusIndicator.className = `status-indicator ${data.discord_status || 'offline'}`;
        }

        updateLastSeen(data);

        if (data.listening_to_spotify && data.spotify) {
            updateSpotifyUI(data.spotify);
        } else {
            hideSpotify();
        }
    }

    function updateLastSeen(userData) {
        const lastSeenEl = document.getElementById('last-seen');
        if (!lastSeenEl) return;
        
        if (userData.discord_status !== 'offline') {
            lastSeenEl.textContent = 'Currently Online';
            lastSeenEl.style.color = '#ffffff';
        } else {
            let lastActive = userData.heartbeat_last_active || null;
            
            if (!lastActive && userData.activities && userData.activities.length > 0) {
                const lastActivity = userData.activities[0];
                if (lastActivity.timestamps && lastActivity.timestamps.end) {
                    lastActive = lastActivity.timestamps.end;
                } else if (lastActivity.timestamps && lastActivity.timestamps.start) {
                    lastActive = lastActivity.timestamps.start;
                }
            }
            
            if (lastActive) {
                const now = Date.now();
                const diff = Math.max(0, now - lastActive);
                const seconds = Math.floor(diff / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);

                let timeStr = "";
                if (days > 0) timeStr = `${days}d ${hours % 24}h ago`;
                else if (hours > 0) timeStr = `${hours}h ${minutes % 60}m ago`;
                else if (minutes > 0) timeStr = `${minutes}m ${seconds % 60}s ago`;
                else timeStr = `${seconds}s ago`;

                lastSeenEl.textContent = `Last seen: ${timeStr}`;
            } else {
                lastSeenEl.textContent = 'Last seen: Recently';
            }
            lastSeenEl.style.color = 'var(--text-secondary)';
        }
    }

    function updateSpotifyUI(spotify) {
        const spotifyWidget = document.querySelector('.spotify-section');
        const widgetDivider = document.querySelector('.widget-divider');
        const trackName = document.getElementById('spotify-track');
        const artistName = document.getElementById('spotify-artist');
        const albumArt = document.getElementById('spotify-album');
        const progressFill = document.getElementById('spotify-progress-fill');
        const currentTime = document.getElementById('spotify-current-time');
        const duration = document.getElementById('spotify-duration');

        if (spotifyWidget) spotifyWidget.style.display = 'flex';
        if (widgetDivider) widgetDivider.style.display = 'block';

        if (trackName) trackName.textContent = spotify.song;
        if (artistName) artistName.textContent = spotify.artist;
        if (albumArt) albumArt.src = spotify.album_art_url;

        const start = spotify.timestamps.start;
        const end = spotify.timestamps.end;
        const total = end - start;
        const current = Date.now() - start;
        const progress = Math.min(100, (current / total) * 100);

        if (progressFill) progressFill.style.width = `${progress}%`;
        if (currentTime) currentTime.textContent = formatTime(current / 1000);
        if (duration) duration.textContent = formatTime(total / 1000);
    }

    function hideSpotify() {
        const spotifyWidget = document.querySelector('.spotify-section');
        const widgetDivider = document.querySelector('.widget-divider');
        if (spotifyWidget) spotifyWidget.style.display = 'none';
        if (widgetDivider) widgetDivider.style.display = 'none';
    }

    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    connectLanyard();

    function animateTitle() {
        const title = "waska";
        let i = 0;
        let direction = 1;
        setInterval(() => {
            document.title = title.substring(0, i + 1);
            i += direction;
            if (i >= title.length) direction = -1;
            else if (i < 0) { direction = 1; i = 0; }
        }, 150);
    }
    animateTitle();

    function initDesktop() {
        const desktop = document.getElementById('desktop-environment');
        if (desktop) {
            desktop.style.display = 'flex';
            setTimeout(() => { desktop.style.opacity = '1'; }, 50);
            
            const appIcon = document.getElementById('waska-app');
            if (appIcon) {
                appIcon.addEventListener('click', () => {
                    appIcon.classList.add('app-opening');
                    desktop.classList.add('app-launching');
                    
                    setTimeout(() => {
                        desktop.style.display = 'none';
                        revealContent();
                    }, 300);
                });
            }
        }
    }

    function revealContent() {
        document.body.classList.add('entered');
        const container = document.querySelector('.container');
        const statusWidget = document.querySelector('.status-widget');
        const card = document.querySelector('.card');
        const player = document.getElementById('audio-player');
        const audio = document.getElementById('bg-music');

        if (container) container.classList.add('show');
        if (statusWidget) statusWidget.classList.add('show');
        if (card) card.classList.add('show');
        if (player) player.classList.add('show');

        if (audio) {
            audio.volume = 0.5;
            audio.play().catch(e => console.error('Audio failed:', e));
        }
    }

    initDesktop();

    const discordSocialLink = document.getElementById('discord-social-link');
    if (discordSocialLink) {
        discordSocialLink.addEventListener('click', (e) => {
            e.preventDefault();
            const usernameToCopy = window.discordUsername || 'wwwwwwwwaska';
            navigator.clipboard.writeText(usernameToCopy).then(() => {
                const span = discordSocialLink.querySelector('span');
                const originalText = span.textContent;
                span.textContent = 'Copied!';
                setTimeout(() => {
                    span.textContent = originalText;
                }, 2000);
            });
        });
    }

    const bgAudio = document.getElementById('bg-music');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const playerCurrentTimeEl = document.getElementById('player-current-time');
    const playerDurationEl = document.getElementById('player-duration');
    const playerProgressFill = document.getElementById('player-progress-fill');
    const playerProgressBar = document.querySelector('.player-progress-bar');

    if (playPauseBtn && bgAudio) {
        playPauseBtn.addEventListener('click', () => {
            const icon = playPauseBtn.querySelector('i');
            if (bgAudio.paused) {
                bgAudio.play();
                icon.className = 'fas fa-pause';
            } else {
                bgAudio.pause();
                icon.className = 'fas fa-play';
            }
        });
    }

    if (volumeSlider && bgAudio) {
        volumeSlider.addEventListener('input', (e) => {
            const vol = e.target.value;
            bgAudio.volume = vol;
            const volumeIcon = document.getElementById('vol-icon');
            if (vol == 0) volumeIcon.className = 'fas fa-volume-mute';
            else if (vol < 0.5) volumeIcon.className = 'fas fa-volume-down';
            else volumeIcon.className = 'fas fa-volume-up';
        });
    }

    if (bgAudio) {
        bgAudio.addEventListener('timeupdate', () => {
            if (playerCurrentTimeEl) playerCurrentTimeEl.textContent = formatTime(bgAudio.currentTime);
            if (playerProgressFill && bgAudio.duration) {
                const percent = (bgAudio.currentTime / bgAudio.duration) * 100;
                playerProgressFill.style.width = `${percent}%`;
            }
        });
        bgAudio.addEventListener('loadedmetadata', () => {
            if (playerDurationEl) playerDurationEl.textContent = formatTime(bgAudio.duration);
        });
        if (playerProgressBar) {
            playerProgressBar.addEventListener('click', (e) => {
                const rect = playerProgressBar.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                bgAudio.currentTime = pos * bgAudio.duration;
            });
        }
    }
});
