 // ============ B DIAMOND - APPLICATION ULTRA PUISSANTE ============

let currentUser = null;
let registeredUsers = JSON.parse(localStorage.getItem('bdiamond_users')) || [];
let userInteractions = JSON.parse(localStorage.getItem('bdiamond_interactions')) || {};
let aiModel = JSON.parse(localStorage.getItem('bdiamond_ai_model')) || initializeAIModel();
let founderData = JSON.parse(localStorage.getItem('bdiamond_founder_data')) || initializeFounderData();
let founderSession = JSON.parse(localStorage.getItem('bdiamond_founder_session')) || null;
let verificationRequests = JSON.parse(localStorage.getItem('bdiamond_verification_requests')) || [];

// ============ SYSTÈME DE VÉRIFICATION PAYANTE ============
const verificationSystem = {
    badges: {
        blue: {
            id: 'blue',
            name: "Badge Bleu",
            price: 4.99,
            duration: "mois",
            color: "#1E90FF",
            icon: "💙",
            benefits: [
                "Badge bleu sur le profil",
                "Priorité dans les commentaires",
                "Protection contre l'usurpation",
                "Apparaît avant les non-vérifiés"
            ]
        },
        diamond: {
            id: 'diamond',
            name: "Badge Diamant",
            price: 9.99,
            duration: "mois",
            color: "#FFD700",
            icon: "💎",
            benefits: [
                "Tout du badge bleu",
                "Badge diamant animé",
                "Statistiques avancées",
                "Support prioritaire 24/7",
                "Apparaît en premier dans les recherches",
                "Accès aux fonctionnalités bêta"
            ]
        },
        founder: {
            id: 'founder',
            name: "Badge Fondateur",
            price: 0,
            duration: "permanent",
            color: "#FFD700",
            icon: "👑",
            benefits: [
                "Tout des badges précédents",
                "Accès au tableau de bord",
                "Contrôle total de l'application",
                "Badge exclusif"
            ]
        }
    }
};

// ============ DONNÉES DU FONDATEUR ============
function initializeFounderData() {
    return {
        founderId: 1,
        founderUsername: "b_diamond_official",
        founderEmail: "contact@bdiamond.com",
        founderPin: "1234",
        totalRevenue: 45780,
        monthlyRevenue: 3250,
        totalUsers: 15240,
        totalVideos: 45200,
        totalDiamondsSold: 125000,
        premiumUsers: 850,
        commissionRate: 0.30,
        revenueSources: {
            diamonds: 45,
            premium: 25,
            ads: 15,
            gifts: 10,
            verification: 5
        },
        revenueHistory: [],
        verificationRevenue: 1250,
        transactions: [],
        accessLog: [],
        featurePermissions: {},
        monetizationPermissions: {}
    };
}

// ============ MODÈLE IA ============
function initializeAIModel() {
    return {
        version: "2.0",
        lastUpdate: new Date().toISOString(),
        contentCategories: {
            dance: { weight: 1.0, videos: [] },
            music: { weight: 1.0, videos: [] },
            comedy: { weight: 1.0, videos: [] },
            sport: { weight: 1.0, videos: [] },
            cooking: { weight: 1.0, videos: [] },
            gaming: { weight: 1.0, videos: [] },
            beauty: { weight: 1.0, videos: [] },
            education: { weight: 1.0, videos: [] }
        },
        userPreferences: {},
        trendingScores: {},
        recommendationCache: {}
    };
}

// Initialiser avec les utilisateurs par défaut
if (registeredUsers.length === 0 && typeof users !== 'undefined') {
    registeredUsers = users;
    if (registeredUsers.length > 0) {
        registeredUsers[0].verification = {
            type: 'founder',
            badge: '👑',
            verifiedAt: '2024-01-01',
            expiresAt: null
        };
    }
    localStorage.setItem('bdiamond_users', JSON.stringify(registeredUsers));
}

// ============ SYSTÈME DE VÉRIFICATION ============
function requestVerification(badgeType) {
    if (!currentUser) {
        showToast('❌ Connectez-vous d\'abord');
        return;
    }
    
    const badge = verificationSystem.badges[badgeType];
    if (!badge) return;
    
    const cardNumber = prompt('💳 Numéro de carte bancaire (simulation) :');
    if (!cardNumber || cardNumber.length < 10) {
        showToast('❌ Carte invalide');
        return;
    }
    
    const expiry = prompt('📅 Date d\'expiration (MM/AA) :');
    if (!expiry) {
        showToast('❌ Date invalide');
        return;
    }
    
    const cvv = prompt('🔒 CVV (3 chiffres) :');
    if (!cvv || cvv.length !== 3) {
        showToast('❌ CVV invalide');
        return;
    }
    
    const fullName = prompt('👤 Nom complet pour la vérification :');
    if (!fullName) {
        showToast('❌ Nom requis');
        return;
    }
    
    const request = {
        id: verificationRequests.length + 1,
        userId: currentUser.id,
        username: currentUser.username,
        badgeType: badgeType,
        fullName: fullName,
        amount: badge.price,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    verificationRequests.push(request);
    localStorage.setItem('bdiamond_verification_requests', JSON.stringify(verificationRequests));
    
    showToast('💳 Paiement en cours...');
    
    setTimeout(() => {
        activateVerification(currentUser.id, badgeType);
        showToast('✅ ' + badge.name + ' activé !');
        addFounderRevenue('verification', badge.price);
    }, 2000);
}

function activateVerification(userId, badgeType) {
    const user = registeredUsers.find(u => u.id === userId);
    if (!user) return;
    
    const badge = verificationSystem.badges[badgeType];
    
    user.verification = {
        type: badgeType,
        badge: badge.icon,
        verifiedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    localStorage.setItem('bdiamond_users', JSON.stringify(registeredUsers));
    
    if (currentUser && currentUser.id === userId) {
        currentUser = user;
        localStorage.setItem('bdiamond_current_user', JSON.stringify(user));
    }
}

function addFounderRevenue(type, amount) {
    founderData.totalRevenue += amount;
    founderData.monthlyRevenue += amount;
    
    if (type === 'verification') {
        founderData.verificationRevenue = (founderData.verificationRevenue || 0) + amount;
    }
    
    founderData.transactions.unshift({
        id: founderData.transactions.length + 1,
        type: type,
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        user: currentUser ? currentUser.username : 'unknown'
    });
    
    localStorage.setItem('bdiamond_founder_data', JSON.stringify(founderData));
}

function getVerificationBadge(user) {
    if (!user || !user.verification) return '';
    
    switch(user.verification.type) {
        case 'blue':
            return ' <span style="color:#1E90FF; font-weight:bold;">💙</span>';
        case 'diamond':
            return ' <span style="color:#FFD700; font-weight:bold;" class="animated-badge">💎</span>';
        case 'founder':
            return ' <span style="color:#FFD700; font-weight:bold;" class="animated-badge">👑</span>';
        default:
            return '';
    }
}

function isVerified(user) {
    return user && user.verification && user.verification.type;
}

function checkVerificationExpiry() {
    try {
        if (!registeredUsers || registeredUsers.length === 0) return;
        
        registeredUsers.forEach(user => {
            if (user && user.verification && user.verification.expiresAt) {
                if (new Date(user.verification.expiresAt) < new Date()) {
                    user.verification = null;
                }
            }
        });
        localStorage.setItem('bdiamond_users', JSON.stringify(registeredUsers));
    } catch(e) {
        console.log('⚠️ Erreur vérification :', e.message);
    }
}

// ============ VÉRIFICATION FONDATEUR ============
function isFounder(user) {
    if (!user) return false;
    return user.id === founderData.founderId && 
           user.username === founderData.founderUsername;
}

function verifyFounderAccess(pin) {
    if (pin === founderData.founderPin) {
        founderSession = {
            authenticated: true,
            timestamp: Date.now(),
            expiresAt: Date.now() + (10 * 60 * 1000)
        };
        localStorage.setItem('bdiamond_founder_session', JSON.stringify(founderSession));
        return true;
    }
    return false;
}

function checkFounderSession() {
    if (!founderSession) return false;
    if (Date.now() > founderSession.expiresAt) {
        founderSession = null;
        localStorage.removeItem('bdiamond_founder_session');
        return false;
    }
    return founderSession.authenticated;
}

function logoutFounder() {
    founderSession = null;
    localStorage.removeItem('bdiamond_founder_session');
}

function logFounderAccess() {
    founderData.accessLog.push({
        timestamp: new Date().toISOString(),
        action: 'dashboard_access'
    });
    localStorage.setItem('bdiamond_founder_data', JSON.stringify(founderData));
}

// ============ IA ALGORITHMIQUE ============
class BDiamondAI {
    constructor() {
        this.model = aiModel;
        this.learningRate = 0.1;
        this.explorationRate = 0.2;
    }
    
    analyzeUserBehavior(userId) {
        if (!userId) return;
        
        if (!userInteractions[userId]) {
            userInteractions[userId] = {
                watchedVideos: [],
                likedVideos: [],
                commentedVideos: [],
                sharedVideos: [],
                skippedVideos: [],
                watchTime: {},
                categories: {},
                activeHours: {},
                sessionCount: 0,
                totalWatchTime: 0
            };
        }
        return userInteractions[userId];
    }
    
    trackInteraction(userId, videoId, action, watchDuration = 0) {
        if (!userId) return;
        
        const behavior = this.analyzeUserBehavior(userId);
        if (!behavior) return;
        
        switch(action) {
            case 'watch':
                if (!behavior.watchedVideos.includes(videoId)) {
                    behavior.watchedVideos.push(videoId);
                }
                behavior.watchTime[videoId] = (behavior.watchTime[videoId] || 0) + watchDuration;
                behavior.totalWatchTime += watchDuration;
                break;
            case 'like':
                if (!behavior.likedVideos.includes(videoId)) {
                    behavior.likedVideos.push(videoId);
                }
                break;
            case 'comment':
                if (!behavior.commentedVideos.includes(videoId)) {
                    behavior.commentedVideos.push(videoId);
                }
                break;
            case 'share':
                if (!behavior.sharedVideos.includes(videoId)) {
                    behavior.sharedVideos.push(videoId);
                }
                break;
            case 'skip':
                if (!behavior.skippedVideos.includes(videoId)) {
                    behavior.skippedVideos.push(videoId);
                }
                break;
        }
        
        localStorage.setItem('bdiamond_interactions', JSON.stringify(userInteractions));
        this.learnFromInteractions();
    }
    
    learnFromInteractions() {
        try {
            const allUsers = Object.keys(userInteractions);
            
            allUsers.forEach(userId => {
                const behavior = userInteractions[userId];
                if (!behavior) return;
                
                const totalInteractions = Object.values(behavior.categories || {}).reduce((a, b) => a + b, 0);
                
                if (totalInteractions > 0) {
                    Object.keys(behavior.categories).forEach(category => {
                        const score = behavior.categories[category] / totalInteractions;
                        if (this.model.contentCategories[category]) {
                            this.model.contentCategories[category].weight += score * this.learningRate;
                        }
                    });
                }
                
                this.model.userPreferences[userId] = {
                    categories: behavior.categories,
                    activeHours: behavior.activeHours,
                    avgWatchTime: this.calculateAvgWatchTime(behavior),
                    engagementRate: this.calculateEngagementRate(behavior),
                    totalWatchTime: behavior.totalWatchTime
                };
            });
            
            this.model.lastUpdate = new Date().toISOString();
            localStorage.setItem('bdiamond_ai_model', JSON.stringify(this.model));
        } catch(e) {
            console.log('⚠️ Erreur IA :', e.message);
        }
    }
    
    calculateAvgWatchTime(behavior) {
        const watchTimes = Object.values(behavior.watchTime || {});
        if (watchTimes.length === 0) return 0;
        return watchTimes.reduce((a, b) => a + b, 0) / watchTimes.length;
    }
    
    calculateEngagementRate(behavior) {
        const total = (behavior.watchedVideos || []).length;
        if (total === 0) return 0;
        const engaged = (behavior.likedVideos || []).length + (behavior.commentedVideos || []).length + (behavior.sharedVideos || []).length;
        return engaged / total;
    }
    
    getRecommendations(userId, limit = 10) {
        if (!userId) return [];
        
        const behavior = this.analyzeUserBehavior(userId);
        const preferences = this.model.userPreferences[userId];
        
        if (!preferences || !preferences.categories || Object.keys(preferences.categories).length === 0) {
            return this.getTrendingVideos(limit);
        }
        
        const scoredVideos = videos.map(video => {
            let score = 0;
            
            if (video.category && preferences.categories[video.category]) {
                score += preferences.categories[video.category] * 10;
            }
            
            score += (video.likes * 0.001);
            score += (video.comments * 0.005);
            score += (video.shares * 0.01);
            score += (video.views * 0.0001);
            
            const daysSinceCreation = (new Date() - new Date(video.createdAt)) / (1000 * 60 * 60 * 24);
            score += Math.max(0, 10 - daysSinceCreation);
            
            if (behavior.watchedVideos && behavior.watchedVideos.includes(video.id)) {
                score *= 0.3;
            }
            
            if (behavior.skippedVideos && behavior.skippedVideos.includes(video.id)) {
                score *= 0.1;
            }
            
            if (behavior.watchedVideos && !behavior.watchedVideos.includes(video.id)) {
                score *= 1.5;
            }
            
            return { video, score };
        });
        
        return scoredVideos
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.video);
    }
    
    getTrendingVideos(limit = 10) {
        if (typeof videos === 'undefined') return [];
        
        const now = Date.now();
        const scoredVideos = videos.map(video => {
            let score = 0;
            score += video.likes * 0.002;
            score += video.comments * 0.008;
            score += video.shares * 0.015;
            score += video.views * 0.0002;
            
            const hoursSinceCreation = (now - new Date(video.createdAt).getTime()) / (1000 * 60 * 60);
            score *= Math.max(0.5, 1 - (hoursSinceCreation / 72));
            
            return { video, score };
        });
        
        return scoredVideos
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.video);
    }
    
    detectEmergingTrends() {
        const trends = [];
        
        Object.keys(this.model.contentCategories).forEach(category => {
            const weight = this.model.contentCategories[category].weight;
            if (weight > 1.5) {
                trends.push({ category, strength: weight, status: 'hot' });
            } else if (weight > 1.2) {
                trends.push({ category, strength: weight, status: 'rising' });
            }
        });
        
        return trends;
    }
    
    predictVirality(video) {
        if (!video) return 0;
        
        let score = 0;
        score += (video.likes / (video.views || 1)) * 100;
        score += (video.comments / (video.views || 1)) * 200;
        score += (video.shares / (video.views || 1)) * 300;
        
        const hoursSinceCreation = (Date.now() - new Date(video.createdAt).getTime()) / (1000 * 60 * 60);
        score *= Math.max(0.3, 1 - (hoursSinceCreation / 48));
        
        return score;
    }
    
    optimizeHashtags(videoContent, category) {
        if (typeof hashtags === 'undefined') return [];
        
        const trendingTags = hashtags.filter(tag => 
            tag.name.toLowerCase().includes(category.toLowerCase())
        );
        const recommendedTags = trendingTags.slice(0, 3).map(tag => tag.name);
        const popularTags = hashtags.slice(0, 2).map(tag => tag.name);
        return [...new Set([...recommendedTags, ...popularTags])];
    }
    
    generateSmartNotifications(userId) {
        if (!userId) return [];
        
        const notifications = [];
        const recommendations = this.getRecommendations(userId, 3);
        
        recommendations.forEach(video => {
            const creator = registeredUsers.find(u => u.id === video.userId);
            notifications.push({
                type: 'recommendation',
                message: `📹 Nouvelle vidéo de @${creator ? creator.username : 'créateur'} !`,
                videoId: video.id
            });
        });
        
        const trends = this.detectEmergingTrends();
        if (trends.length > 0) {
            notifications.push({
                type: 'trend',
                message: `🔥 Tendance : ${trends[0].category} !`
            });
        }
        
        return notifications;
    }
}

const bDiamondAI = new BDiamondAI();

// ============ AUTHENTIFICATION ============
function showLogin() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm) loginForm.classList.remove('hidden');
    if (registerForm) registerForm.classList.add('hidden');
    
    const tabs = document.querySelectorAll('.tab-btn');
    if (tabs.length >= 2) {
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    }
}

function showRegister() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm) loginForm.classList.add('hidden');
    if (registerForm) registerForm.classList.remove('hidden');
    
    const tabs = document.querySelectorAll('.tab-btn');
    if (tabs.length >= 2) {
        tabs[0].classList.remove('active');
        tabs[1].classList.add('active');
    }
}

function showApp() {
    const authScreen = document.getElementById('authScreen');
    const app = document.getElementById('app');
    if (authScreen) authScreen.classList.add('hidden');
    if (app) app.classList.remove('hidden');
    
    try {
        loadVideos();
    } catch(e) {
        console.log('⚠️ Erreur chargement vidéos :', e.message);
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('bdiamond_current_user');
    try {
        logoutFounder();
    } catch(e) {
        // Ignorer
    }
    window.location.href = 'index.html';
}

// ============ FLUX VIDÉO ============
function loadVideos() {
    const feed = document.getElementById('videoFeed');
    if (!feed) return;
    
    const savedVideos = localStorage.getItem('bdiamond_videos');
    if (savedVideos) {
        try {
            const parsedVideos = JSON.parse(savedVideos);
            if (typeof videos !== 'undefined') {
                videos.length = 0;
                videos.push(...parsedVideos);
            }
        } catch(e) {
            console.log('⚠️ Erreur vidéos locales :', e.message);
        }
    }
    
    feed.innerHTML = '';
    
    if (typeof videos === 'undefined') return;
    
    let recommendedVideos;
    if (currentUser && currentUser.id) {
        recommendedVideos = bDiamondAI.getRecommendations(currentUser.id, 10);
    } else {
        recommendedVideos = bDiamondAI.getTrendingVideos(10);
    }
    
    if (recommendedVideos.length === 0) {
        recommendedVideos = videos;
    }
    
    recommendedVideos.forEach(video => {
        const user = registeredUsers.find(u => u.id === video.userId);
        if (user) {
            const videoElement = createVideoElement(video, user);
            feed.appendChild(videoElement);
        }
    });
}

function createVideoElement(video, user) {
    const container = document.createElement('div');
    container.className = 'video-container';
    container.id = 'video-' + video.id;
    
    const verifiedBadge = getVerificationBadge(user);
    const viralityScore = bDiamondAI.predictVirality(video);
    const viralBadge = viralityScore > 10 ? '<span style="color:#FFD700; margin-left:5px;">🔥</span>' : '';
    
    const clickableCaption = typeof makeHashtagsClickable === 'function' ? makeHashtagsClickable(video.caption) : video.caption;
    
    container.innerHTML = `
        <video src="${video.videoUrl}" loop playsinline></video>
        
        <div class="video-overlay">
            <div class="video-user">
                <img src="${user.avatar}" alt="${user.username}" onerror="this.src='https://i.pravatar.cc/150?img=1'">
                <span class="video-username">@${user.username}${verifiedBadge}${viralBadge}</span>
            </div>
            <p class="video-caption">${clickableCaption}</p>
            <p class="video-music">${video.music}</p>
        </div>
        
        <div class="video-actions">
            <button class="action-btn ${video.liked ? 'liked' : ''}" onclick="toggleLike(${video.id}, this)">
                ❤️
                <span>${formatNumber(video.likes)}</span>
            </button>
            <button class="action-btn" onclick="showComments(${video.id})">
                💬
                <span>${formatNumber(video.comments)}</span>
            </button>
            <button class="action-btn" onclick="shareVideo(${video.id})">
                📤
                <span>${formatNumber(video.shares)}</span>
            </button>
            <button class="action-btn" onclick="toggleFollow(${user.id}, this)">
                👤
                <span>Suivre</span>
            </button>
        </div>
    `;
    
    let lastTap = 0;
    container.addEventListener('click', (e) => {
        const now = Date.now();
        if (now - lastTap < 300) {
            const likeBtn = container.querySelector('.action-btn');
            if (likeBtn) {
                toggleLike(video.id, likeBtn);
            }
        }
        lastTap = now;
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const videoEl = entry.target.querySelector('video');
            if (videoEl) {
                if (entry.isIntersecting) {
                    videoEl.play().catch(() => {});
                    if (currentUser && currentUser.id) {
                        bDiamondAI.trackInteraction(currentUser.id, video.id, 'watch', 5);
                    }
                } else {
                    videoEl.pause();
                }
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(container);
    
    return container;
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num;
}

function toggleLike(videoId, button) {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;
    
    if (video.liked) {
        video.likes--;
        button.classList.remove('liked');
    } else {
        video.likes++;
        button.classList.add('liked');
        button.style.animation = 'likeAnimation 0.3s ease';
        setTimeout(() => button.style.animation = '', 300);
        if (currentUser && currentUser.id) {
            bDiamondAI.trackInteraction(currentUser.id, videoId, 'like');
        }
    }
    button.querySelector('span').textContent = formatNumber(video.likes);
    video.liked = !video.liked;
    localStorage.setItem('bdiamond_videos', JSON.stringify(videos));
}

function toggleFollow(userId, button) {
    if (button.classList.contains('following')) {
        button.classList.remove('following');
        button.querySelector('span').textContent = 'Suivre';
    } else {
        button.classList.add('following');
        button.querySelector('span').textContent = 'Suivi ✓';
    }
}

function showComments(videoId) {
    const videoComments = comments.filter(c => c.videoId === videoId);
    let commentList = '';
    
    videoComments.forEach(comment => {
        const user = registeredUsers.find(u => u.id === comment.userId);
        if (user) {
            const badge = getVerificationBadge(user);
            commentList += `@${user.username}${badge}: ${comment.content}\n`;
        }
    });
    
    const newComment = prompt('💬 Commentaires :\n\n' + (commentList || 'Aucun commentaire') + '\n\nAjouter un commentaire :');
    
    if (newComment && newComment.trim() !== '') {
        comments.push({
            id: comments.length + 1,
            videoId: videoId,
            userId: currentUser && currentUser.id ? currentUser.id : 1,
            content: newComment,
            likes: 0,
            createdAt: new Date().toISOString().split('T')[0]
        });
        if (currentUser && currentUser.id) {
            bDiamondAI.trackInteraction(currentUser.id, videoId, 'comment');
        }
        showToast('✅ Commentaire ajouté !');
    }
}

function shareVideo(videoId) {
    const video = videos.find(v => v.id === videoId);
    if (video) {
        video.shares++;
        localStorage.setItem('bdiamond_videos', JSON.stringify(videos));
        if (currentUser && currentUser.id) {
            bDiamondAI.trackInteraction(currentUser.id, videoId, 'share');
        }
        showToast('📤 Lien copié !');
    }
}

function createVideo() {
    window.location.href = 'creation.html';
}

// ============ FONCTIONS FONDATEUR ============
function accessFounderDashboard() {
    if (!currentUser || !isFounder(currentUser)) {
        showToast('❌ Accès refusé');
        return;
    }
    
    const pin = prompt('🔐 Entrez votre code PIN Fondateur :');
    if (pin && verifyFounderAccess(pin)) {
        logFounderAccess();
        showToast('👑 Bienvenue Fondateur !');
        window.location.href = 'founder.html';
    } else {
        showToast('❌ Code PIN incorrect');
    }
}

// ============ TOAST ============
function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============ INITIALISATION ============
window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('bdiamond_current_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            if (currentUser && currentUser.id) {
                showApp();
                bDiamondAI.analyzeUserBehavior(currentUser.id);
                
                if (isFounder(currentUser)) {
                    setTimeout(() => {
                        showToast('👑 Mode Fondateur actif');
                    }, 3000);
                }
            } else {
                currentUser = null;
            }
        } catch(e) {
            console.log('⚠️ Erreur session :', e.message);
            currentUser = null;
        }
    }
    
    setInterval(() => {
        try {
            bDiamondAI.learnFromInteractions();
            checkVerificationExpiry();
        } catch(e) {
            // Ignorer
        }
    }, 60000);
});