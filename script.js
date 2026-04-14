document.addEventListener('DOMContentLoaded', function() {
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
            // Tenta pegar o heartbeat do Lanyard ou o timestamp de atividades passadas
            let lastActive = userData.heartbeat_last_active || null;
            
            // Fallback: Se não houver heartbeat, tenta pegar o fim da última atividade do Spotify ou Discord
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
                // Se realmente não houver dados, mostra "Recently" como fallback seguro
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
