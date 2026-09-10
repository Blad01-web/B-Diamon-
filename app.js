// ============ B DIAMOND - APPLICATION ULTRA PUISSANTE ============

let currentUser = null;
let registeredUsers = JSON.parse(localStorage.getItem('bdiamond_users')) || [];
let userInteractions = JSON.parse(localStorage.getItem('bdiamond_interactions')) || {};
let aiModel = JSON.parse(localStorage.getItem('bdiamond_ai_model')) || initializeAIModel();
let founderData = JSON.parse(localStorage.getItem('bdiamond_founder_data')) || initializeFounderData();
let founderSession = JSON.parse(localStorage.getItem('bdiamond_founder_session')) || null;
let verificationRequests = JSON.parse(localStorage.getItem('bdiamond_verification_requests')) || [];

// ============ DONNÉES DU FONDATEUR (TOUT À ZÉRO) ============
function initializeFounderData() {
    return {
        founderId: 1,
        founderUsername: "b_diamond_official",
        founderEmail: "contact@bdiamond.com",
        founderPin: "1234",
        // REVENUS RÉELS (calculés dynamiquement)
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalWithdrawals: 0,
        verificationRevenue: 0,
        // STATISTIQUES RÉELLES (calculées dynamiquement)
        totalUsers: 0,
        totalVideos: 0,
        totalDiamondsSold: 0,
        premiumUsers: 0,
        // CONFIGURATION
        commissionRate: 0.30,
        revenueHistory: [],
        transactions: [],
        accessLog: [],
        featurePermissions: {},
        monetizationPermissions: {},
        countryPermissions: {
            'France': 'active',
            'Belgique': 'active',
            'Suisse': 'active',
            'Canada': 'active',
            'USA': 'active',
            'Maroc': 'active',
            'Algérie': 'active',
            'Tunisie': 'active',
            'Sénégal': 'active',
            'Côte d\'Ivoire': 'active',
            'Cameroun': 'active',
            'RDC': 'active',
            'Brésil': 'limited',
            'Inde': 'limited',
            'Chine': 'blocked',
            'Russie': 'blocked'
        }
    };
}

// ============ CALCUL DES STATISTIQUES RÉELLES ============
function recalculateFounderStats() {
    // Nombre réel d'utilisateurs
    founderData.totalUsers = registeredUsers.length;
    
    // Nombre réel de vidéos
    founderData.totalVideos = (typeof videos !== 'undefined') ? videos.length : 0;
    
    // Total des diamants vendus (à partir des transactions)
    founderData.totalDiamondsSold = founderData.transactions
        .filter(t => t.type === 'diamonds')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Revenus totaux
    founderData.totalRevenue = founderData.transactions
        .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Revenus du mois en cours
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    founderData.monthlyRevenue = founderData.transactions
        .filter(t => new Date(t.date) >= startOfMonth)
        .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Retraits totaux
    founderData.totalWithdrawals = founderData.transactions
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Utilisateurs premium (vérifiés)
    founderData.premiumUsers = registeredUsers.filter(u => u.verification).length;
    
    localStorage.setItem('bdiamond_founder_data', JSON.stringify(founderData));
}

// ============ VÉRIFICATION DES PERMISSIONS ============
function isFeatureEnabled(featureName) {
    if (!founderData.featurePermissions) return true;
    return founderData.featurePermissions[featureName] !== false;
}

function isMonetizationEnabled(featureName) {
    if (!founderData.monetizationPermissions) return true;
    return founderData.monetizationPermissions[featureName] !== false;
}

function isCountryAllowed(countryName) {
    if (!founderData.countryPermissions) return true;
    const status = founderData.countryPermissions[countryName];
    return status === 'active' || status === undefined;
}

function isCountryLimited(countryName) {
    if (!founderData.countryPermissions) return false;
    return founderData.countryPermissions[countryName] === 'limited';
}

function isCountryBlocked(countryName) {
    if (!founderData.countryPermissions) return false;
    return founderData.countryPermissions[countryName] === 'blocked';
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
const verificationSystem = {
    badges: {
        blue: { id: 'blue', name: "Badge Bleu", price: 4.99, color: "#1E90FF", icon: "💙" },
        diamond: { id: 'diamond', name: "Badge Diamant", price: 9.99, color: "#FFD700", icon: "💎" },
        founder: { id: 'founder', name: "Badge Fondateur", price: 0, color: "#FFD700", icon: "👑" }
    }
};

function requestVerification(badgeType) {
    if (!currentUser) { showToast('❌ Connectez-vous d\'abord'); return; }
    
    if (!isMonetizationEnabled('verification')) {
        showToast('❌ La vérification payante est désactivée');
        return;
    }
    
    const badge = verificationSystem.badges[badgeType];
    if (!badge) return;
    
    const cardNumber = prompt('💳 Numéro de carte bancaire (simulation) :');
    if (!cardNumber || cardNumber.length < 10) { showToast('❌ Carte invalide'); return; }
    
    const expiry = prompt('📅 Date d\'expiration (MM/AA) :');
    if (!expiry) { showToast('❌ Date invalide'); return; }
    
    const cvv = prompt('🔒 CVV (3 chiffres) :');
    if (!cvv || cvv.length !== 3) { showToast('❌ CVV invalide'); return; }
    
    const fullName = prompt('👤 Nom complet pour la vérification :');
    if (!fullName) { showToast('❌ Nom requis'); return; }
    
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
    founderData.transactions.unshift({
        id: founderData.transactions.length + 1,
        type: type,
        amount: amount,
        date: new Date().toISOString(),
        user: currentUser ? currentUser.username : 'unknown'
    });
    
    recalculateFounderStats();
    localStorage.setItem('bdiamond_founder_data', JSON.stringify(founderData));
}

function getVerificationBadge(user) {
    if (!user || !user.verification) return '';
    switch(user.verification.type) {
        case 'blue': return ' <span style="color:#1E90FF; font-weight:bold;">💙</span>';
        case 'diamond': return ' <span style="color:#FFD700; font-weight:bold;" class="animated-badge">💎</span>';
        case 'founder': return ' <span style="color:#FFD700; font-weight:bold;" class="animated-badge">👑</span>';
        default: return '';
    }
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
    } catch(e) { console.log('⚠️ Erreur vérification :', e.message); }
}

// ============ VÉRIFICATION FONDATEUR ============
function isFounder(user) {
    if (!user) return false;
    return user.id === founderData.founderId && user.username === founderData.founderUsername;
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
    founderData.accessLog.push({ timestamp: new Date().toISOString(), action: 'dashboard_access' });
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
                watchedVideos: [], likedVideos: [], commentedVideos: [],
                sharedVideos: [], skippedVideos: [], watchTime: {},
                categories: {}, activeHours: {}, sessionCount: 0, totalWatchTime: 0
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
                if (!behavior.watchedVideos.includes(videoId)) behavior.watchedVideos.push(videoId);
                behavior.watchTime[videoId] = (behavior.watchTime[videoId] || 0) + watchDuration;
                behavior.totalWatchTime += watchDuration;
                // Ajouter au watch time pour la monétisation
                if (currentUser && currentUser.id === userId) {
                    currentUser.watchMinutes = (currentUser.watchMinutes || 0) + watchDuration;
                    localStorage.setItem('bdiamond_current_user', JSON.stringify(currentUser));
                }
                break;
            case 'like': if (!behavior.likedVideos.includes(videoId)) behavior.likedVideos.push(videoId); break;
            case 'comment': if (!behavior.commentedVideos.includes(videoId)) behavior.commentedVideos.push(videoId); break;
            case 'share': if (!behavior.sharedVideos.includes(videoId)) behavior.sharedVideos.push(videoId); break;
            case 'skip': if (!behavior.skippedVideos.includes(videoId)) behavior.skippedVideos.push(videoId); break;
        }
        
        const video = videos.find(v => v.id === videoId);
        if (video && video.category) behavior.categories[video.category] = (behavior.categories[video.category] || 0) + 1;
        
        const hour = new Date().getHours();
        behavior.activeHours[hour] = (behavior.activeHours[hour] || 0) + 1;
        behavior.sessionCount++;
        
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
                        if (this.model.contentCategories[category]) this.model.contentCategories[category].weight += score * this.learningRate;
                    });
                }
                this.model.userPreferences[userId] = {
                    categories: behavior.categories, activeHours: behavior.activeHours,
                    avgWatchTime: this.calculateAvgWatchTime(behavior),
                    engagementRate: this.calculateEngagementRate(behavior),
                    totalWatchTime: behavior.totalWatchTime
                };
            });
            this.model.lastUpdate = new Date().toISOString();
            localStorage.setItem('bdiamond_ai_model', JSON.stringify(this.model));
        } catch(e) { console.log('⚠️ Erreur IA :', e.message); }
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
            if (video.category && preferences.categories[video.category]) score += preferences.categories[video.category] * 10;
            score += (video.likes * 0.001) + (video.comments * 0.005) + (video.shares * 0.01) + (video.views * 0.0001);
            const daysSinceCreation = (new Date() - new Date(video.createdAt)) / (1000 * 60 * 60 * 24);
            score += Math.max(0, 10 - daysSinceCreation);
            if (behavior.watchedVideos && behavior.watchedVideos.includes(video.id)) score *= 0.3;
            if (behavior.skippedVideos && behavior.skippedVideos.includes(video.id)) score *= 0.1;
            if (behavior.watchedVideos && !behavior.watchedVideos.includes(video.id)) score *= 1.5;
            return { video, score };
        });
        return scoredVideos.sort((a, b) => b.score - a.score).slice(0, limit).map(item => item.video);
    }
    
    getTrendingVideos(limit = 10) {
        if (typeof videos === 'undefined' || videos.length === 0) return [];
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
        return scoredVideos.sort((a, b) => b.score - a.score).slice(0, limit).map(item => item.video);
    }
    
    detectEmergingTrends() {
        const trends = [];
        Object.keys(this.model.contentCategories).forEach(category => {
            const weight = this.model.contentCategories[category].weight;
            if (weight > 1.5) trends.push({ category, strength: weight, status: 'hot' });
            else if (weight > 1.2) trends.push({ category, strength: weight, status: 'rising' });
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
}

const bDiamondAI = new BDiamondAI();

// ============ AUTHENTIFICATION ============
function showLogin() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm) loginForm.classList.remove('hidden');
    if (registerForm) registerForm.classList.add('hidden');
    const tabs = document.querySelectorAll('.tab-btn');
    if (tabs.length >= 2) { tabs[0].classList.add('active'); tabs[1].classList.remove('active'); }
}

function showRegister() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm) loginForm.classList.add('hidden');
    if (registerForm) registerForm.classList.remove('hidden');
    const tabs = document.querySelectorAll('.tab-btn');
    if (tabs.length >= 2) { tabs[0].classList.remove('active'); tabs[1].classList.add('active'); }
}

function showApp() {
    const authScreen = document.getElementById('authScreen');
    const app = document.getElementById('app');
    if (authScreen) authScreen.classList.add('hidden');
    if (app) app.classList.remove('hidden');
    try { loadVideos(); } catch(e) { console.log('⚠️ Erreur chargement vidéos :', e.message); }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('bdiamond_current_user');
    try { logoutFounder(); } catch(e) {}
    window.location.href = 'index.html';
}

// ============ FLUX VIDÉO ============
function loadVideos() {
    const feed = document.getElementById('videoFeed');
    if (!feed) return;
    if (typeof videos === 'undefined' || videos.length === 0) {
        feed.innerHTML = '<p style="text-align:center; color:#a8a8a8; padding:40px;">Aucun contenu pour le moment 💎</p>';
        return;
    }
    feed.innerHTML = '';
    let recommendedVideos;
    if (currentUser && currentUser.id) {
        recommendedVideos = bDiamondAI.getRecommendations(currentUser.id, 10);
    } else {
        recommendedVideos = bDiamondAI.getTrendingVideos(10);
    }
    if (recommendedVideos.length === 0) recommendedVideos = videos;
    recommendedVideos.forEach(video => {
        const user = registeredUsers.find(u => u.id === video.userId);
        if (user) feed.appendChild(createVideoElement(video, user));
    });
}

function createVideoElement(video, user) {
    const container = document.createElement('div');
    container.className = 'video-container';
    const verifiedBadge = getVerificationBadge(user);
    const clickableCaption = (typeof makeHashtagsClickable === 'function') ? makeHashtagsClickable(video.caption) : video.caption;
    container.innerHTML = `
        <video src="${video.videoUrl}" loop playsinline></video>
        <div class="video-overlay">
            <div class="video-user">
                <img src="${user.avatar}" alt="${user.username}" onerror="this.src='https://i.pravatar.cc/150?img=1'">
                <span class="video-username">@${user.username}${verifiedBadge}</span>
            </div>
            <p class="video-caption">${clickableCaption}</p>
            <p class="video-music">${video.music}</p>
        </div>
        <div class="video-actions">
            <button class="action-btn ${video.liked ? 'liked' : ''}" onclick="toggleLike(${video.id}, this)">❤️<span>${formatNumber(video.likes)}</span></button>
            <button class="action-btn" onclick="showComments(${video.id})">💬<span>${formatNumber(video.comments)}</span></button>
            <button class="action-btn" onclick="shareVideo(${video.id})">📤<span>${formatNumber(video.shares)}</span></button>
            <button class="action-btn" onclick="toggleFollow(${user.id}, this)">👤<span>Suivre</span></button>
        </div>
    `;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const videoEl = entry.target.querySelector('video');
            if (videoEl) { if (entry.isIntersecting) { videoEl.play().catch(() => {}); if (currentUser && currentUser.id) bDiamondAI.trackInteraction(currentUser.id, video.id, 'watch', 5); } else videoEl.pause(); }
        });
    }, { threshold: 0.5 });
    observer.observe(container);
    return container;
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num || 0;
}

function toggleLike(videoId, button) {
    if (!isFeatureEnabled('likes')) { showToast('❌ Les likes sont désactivés'); return; }
    const video = videos.find(v => v.id === videoId);
    if (!video) return;
    if (video.liked) { video.likes--; button.classList.remove('liked'); }
    else { video.likes++; button.classList.add('liked'); if (currentUser && currentUser.id) bDiamondAI.trackInteraction(currentUser.id, videoId, 'like'); }
    button.querySelector('span').textContent = formatNumber(video.likes);
    video.liked = !video.liked;
    localStorage.setItem('bdiamond_videos', JSON.stringify(videos));
}

function toggleFollow(userId, button) {
    if (button.classList.contains('following')) { button.classList.remove('following'); button.querySelector('span').textContent = 'Suivre'; }
    else { button.classList.add('following'); button.querySelector('span').textContent = 'Suivi ✓'; }
}

function showComments(videoId) {
    if (!isFeatureEnabled('comments')) { showToast('❌ Les commentaires sont désactivés'); return; }
    const videoComments = comments.filter(c => c.videoId === videoId);
    let commentList = '';
    videoComments.forEach(comment => {
        const user = registeredUsers.find(u => u.id === comment.userId);
        if (user) commentList += `@${user.username}: ${comment.content}\n`;
    });
    const newComment = prompt('💬 Commentaires :\n\n' + (commentList || 'Aucun commentaire') + '\n\nAjouter un commentaire :');
    if (newComment && newComment.trim() !== '') {
        comments.push({ id: comments.length + 1, videoId: videoId, userId: currentUser && currentUser.id ? currentUser.id : 1, content: newComment, likes: 0, createdAt: new Date().toISOString().split('T')[0] });
        if (currentUser && currentUser.id) bDiamondAI.trackInteraction(currentUser.id, videoId, 'comment');
        showToast('✅ Commentaire ajouté !');
    }
}

function shareVideo(videoId) {
    if (!isFeatureEnabled('shares')) { showToast('❌ Les partages sont désactivés'); return; }
    const video = videos.find(v => v.id === videoId);
    if (video) { video.shares++; localStorage.setItem('bdiamond_videos', JSON.stringify(videos)); if (currentUser && currentUser.id) bDiamondAI.trackInteraction(currentUser.id, videoId, 'share'); showToast('📤 Lien copié !'); }
}

function createVideo() {
    if (!isFeatureEnabled('contentCreation')) { showToast('❌ La création est désactivée'); return; }
    window.location.href = 'creation.html';
}

// ============ FONCTIONS FONDATEUR ============
function accessFounderDashboard() {
    if (!currentUser || !isFounder(currentUser)) { showToast('❌ Accès refusé'); return; }
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
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
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
                if (isFounder(currentUser)) setTimeout(() => showToast('👑 Mode Fondateur actif'), 3000);
            } else currentUser = null;
        } catch(e) { currentUser = null; }
    }
    
    recalculateFounderStats();
    
    setInterval(() => {
        try {
            bDiamondAI.learnFromInteractions();
            checkVerificationExpiry();
            recalculateFounderStats();
        } catch(e) {}
    }, 60000);
});
