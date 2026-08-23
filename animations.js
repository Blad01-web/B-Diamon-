// ============ B DIAMOND - SYSTÈME D'ANIMATIONS ============

// ============ EFFETS DE PARTICULES ============
function createParticles(x, y, type = 'diamond') {
    const particles = document.createElement('div');
    particles.className = 'particles-container';
    particles.style.position = 'fixed';
    particles.style.left = x + 'px';
    particles.style.top = y + 'px';
    particles.style.zIndex = '3000';
    particles.style.pointerEvents = 'none';
    
    const emojis = {
        'diamond': ['💎', '✨', '⭐', '🌟'],
        'heart': ['❤️', '💕', '💗', '💖'],
        'fire': ['🔥', '✨', '⚡', '💫'],
        'celebration': ['🎉', '🎊', '✨', '💎', '⭐']
    };
    
    const particlesList = emojis[type] || emojis['diamond'];
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('span');
        particle.textContent = particlesList[Math.floor(Math.random() * particlesList.length)];
        particle.style.position = 'absolute';
        particle.style.fontSize = (15 + Math.random() * 20) + 'px';
        particle.style.animation = `particleFly ${0.5 + Math.random() * 0.8}s ease-out forwards`;
        
        const angle = (Math.PI * 2 * i) / 8;
        const distance = 50 + Math.random() * 50;
        particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
        particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
        
        particles.appendChild(particle);
    }
    
    document.body.appendChild(particles);
    
    setTimeout(() => {
        particles.remove();
    }, 1500);
}

// ============ ANIMATION DE LIKE ============
function animateLike(button) {
    // Créer un cœur qui explose
    const heart = document.createElement('div');
    heart.textContent = '❤️';
    heart.style.position = 'fixed';
    heart.style.fontSize = '40px';
    heart.style.zIndex = '3000';
    heart.style.pointerEvents = 'none';
    heart.style.animation = 'heartExplode 0.8s ease-out forwards';
    
    const rect = button.getBoundingClientRect();
    heart.style.left = (rect.left + rect.width / 2) + 'px';
    heart.style.top = (rect.top + rect.height / 2) + 'px';
    
    document.body.appendChild(heart);
    
    // Créer des particules
    createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 'heart');
    
    setTimeout(() => {
        heart.remove();
    }, 800);
}

// ============ SON SIMULÉ ============
function playSound(type) {
    const sounds = {
        'like': { frequency: 800, duration: 0.1 },
        'message': { frequency: 600, duration: 0.15 },
        'notification': { frequency: 1000, duration: 0.2 },
        'share': { frequency: 500, duration: 0.1 },
        'success': { frequency: 900, duration: 0.3 },
        'error': { frequency: 300, duration: 0.3 }
    };
    
    const sound = sounds[type] || sounds['notification'];
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = sound.frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + sound.duration);
    } catch (e) {
        // L'audio n'est pas disponible, ignorer
    }
}

// ============ VIBRATION SIMULÉE ============
function vibrate(pattern = 50) {
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}

// ============ INDICATEUR EN LIGNE ============
function addOnlineIndicator(element, user) {
    if (user.isOnline) {
        const dot = document.createElement('span');
        dot.className = 'online-dot';
        dot.style.width = '10px';
        dot.style.height = '10px';
        dot.style.background = '#00ff00';
        dot.style.borderRadius = '50%';
        dot.style.display = 'inline-block';
        dot.style.marginLeft = '5px';
        dot.style.animation = 'pulse 1.5s ease-in-out infinite';
        element.appendChild(dot);
    }
}

// ============ ACTIVITÉ EN DIRECT ============
function showLiveActivity(videoId, container) {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;
    
    // Simuler des spectateurs en direct
    const liveViewers = Math.floor(Math.random() * 100) + 10;
    
    const activityDiv = document.createElement('div');
    activityDiv.className = 'live-activity';
    activityDiv.innerHTML = `
        <span style="color:#ff0000;">🔴 ${liveViewers} personnes regardent</span>
    `;
    
    container.appendChild(activityDiv);
    
    // Mettre à jour toutes les 5 secondes
    setInterval(() => {
        const newViewers = Math.floor(Math.random() * 100) + 10;
        activityDiv.innerHTML = `<span style="color:#ff0000;">🔴 ${newViewers} personnes regardent</span>`;
    }, 5000);
}

// ============ ÉGALISEUR DE MUSIQUE ============
function createMusicEqualizer(container) {
    const equalizer = document.createElement('div');
    equalizer.className = 'music-equalizer';
    equalizer.innerHTML = `
        <span class="eq-bar"></span>
        <span class="eq-bar"></span>
        <span class="eq-bar"></span>
        <span class="eq-bar"></span>
        <span class="eq-bar"></span>
    `;
    container.appendChild(equalizer);
}

// ============ TRANSITION DE PAGE ============
function pageTransition(url) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = '#000';
    overlay.style.zIndex = '5000';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    overlay.style.pointerEvents = 'none';
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}

// ============ SPINNER DE CHARGEMENT ============
function showLoading() {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.id = 'loadingSpinner';
    spinner.innerHTML = '💎';
    document.body.appendChild(spinner);
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.remove();
    }
}

// ============ COMPTEUR ANIMÉ ============
function animateCounter(element, target, duration = 1000) {
    const start = 0;
    const startTime = Date.now();
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (target - start) * progress);
        
        element.textContent = formatNumber(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

// ============ EFFET DE BRILLANCE DIAMANT ============
function createDiamondShine(element) {
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    
    const shine = document.createElement('div');
    shine.style.position = 'absolute';
    shine.style.top = '0';
    shine.style.left = '-100%';
    shine.style.width = '50%';
    shine.style.height = '100%';
    shine.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)';
    shine.style.animation = 'shine 2s ease-in-out infinite';
    element.appendChild(shine);
}

// ============ NOTIFICATION TOAST ANIMÉE ============
function showAnimatedToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast animated-toast';
    
    const icons = {
        'info': 'ℹ️',
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'diamond': '💎',
        'fire': '🔥'
    };
    
    toast.innerHTML = `${icons[type] || 'ℹ️'} ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        playSound(type === 'error' ? 'error' : 'notification');
        vibrate(30);
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============ EFFET DE FEU POUR VIDÉOS VIRALES ============
function addFireEffect(element) {
    const fire = document.createElement('div');
    fire.className = 'fire-effect';
    fire.textContent = '🔥';
    fire.style.position = 'absolute';
    fire.style.fontSize = '30px';
    fire.style.animation = 'fireBounce 1s ease-in-out infinite';
    element.appendChild(fire);
}

// ============ DÉTECTION DE GESTES ============
function setupGestures(element, callbacks) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let lastTap = 0;
    
    element.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
    });
    
    element.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndTime = Date.now();
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        const dt = touchEndTime - touchStartTime;
        
        // Détecter le double-tap
        if (dt < 300 && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
            const now = Date.now();
            if (now - lastTap < 300) {
                if (callbacks.onDoubleTap) callbacks.onDoubleTap();
                vibrate(50);
                playSound('like');
                lastTap = 0;
            } else {
                if (callbacks.onTap) callbacks.onTap();
                lastTap = now;
            }
        }
        
        // Détecter le swipe
        if (Math.abs(dx) > 50 && Math.abs(dy) < 50) {
            if (dx < 0 && callbacks.onSwipeLeft) callbacks.onSwipeLeft();
            if (dx > 0 && callbacks.onSwipeRight) callbacks.onSwipeRight();
        }
        
        if (Math.abs(dy) > 50 && Math.abs(dx) < 50) {
            if (dy < 0 && callbacks.onSwipeUp) callbacks.onSwipeUp();
            if (dy > 0 && callbacks.onSwipeDown) callbacks.onSwipeDown();
        }
    });
}

// ============ INITIALISATION DES STYLES D'ANIMATION ============
function initializeAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particleFly {
            0% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(var(--tx), var(--ty)) scale(0);
                opacity: 0;
            }
        }
        
        @keyframes heartExplode {
            0% {
                transform: scale(0);
                opacity: 1;
            }
            50% {
                transform: scale(2);
                opacity: 1;
            }
            100% {
                transform: scale(3);
                opacity: 0;
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
                transform: scale(1);
            }
            50% {
                opacity: 0.5;
                transform: scale(1.5);
            }
        }
        
        @keyframes shine {
            0% {
                left: -100%;
            }
            100% {
                left: 200%;
            }
        }
        
        @keyframes fireBounce {
            0%, 100% {
                transform: translateY(0) scale(1);
            }
            50% {
                transform: translateY(-10px) scale(1.2);
            }
        }
        
        .loading-spinner {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 50px;
            z-index: 5000;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        .music-equalizer {
            display: flex;
            gap: 3px;
            align-items: flex-end;
            height: 20px;
        }
        
        .eq-bar {
            width: 3px;
            background: #FFD700;
            animation: equalize 0.5s ease-in-out infinite;
        }
        
        .eq-bar:nth-child(1) { animation-delay: 0s; height: 50%; }
        .eq-bar:nth-child(2) { animation-delay: 0.1s; height: 80%; }
        .eq-bar:nth-child(3) { animation-delay: 0.2s; height: 60%; }
        .eq-bar:nth-child(4) { animation-delay: 0.3s; height: 90%; }
        .eq-bar:nth-child(5) { animation-delay: 0.4s; height: 70%; }
        
        @keyframes equalize {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(0.3); }
        }
        
        .online-dot {
            animation: pulse 1.5s ease-in-out infinite;
        }
        
        .live-activity {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.8rem;
            z-index: 20;
        }
        
        .animated-toast {
            animation: slideInUp 0.3s ease;
        }
        
        @keyframes slideInUp {
            from {
                transform: translate(-50%, 100px);
                opacity: 0;
            }
            to {
                transform: translate(-50%, 0);
                opacity: 1;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// ============ INITIALISATION ============
document.addEventListener('DOMContentLoaded', () => {
    initializeAnimationStyles();
});

// ============ EXPORT DES FONCTIONS ============
window.createParticles = createParticles;
window.animateLike = animateLike;
window.playSound = playSound;
window.vibrate = vibrate;
window.addOnlineIndicator = addOnlineIndicator;
window.showLiveActivity = showLiveActivity;
window.createMusicEqualizer = createMusicEqualizer;
window.pageTransition = pageTransition;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.animateCounter = animateCounter;
window.createDiamondShine = createDiamondShine;
window.showAnimatedToast = showAnimatedToast;
window.addFireEffect = addFireEffect;
window.setupGestures = setupGestures;