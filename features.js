// ============ B DIAMOND - FONCTIONNALITÉS AVANCÉES COMPLÈTES ============

let featuresData = JSON.parse(localStorage.getItem('bdiamond_features')) || initializeFeatures();

function initializeFeatures() {
    return {
        ghostMode: { enabled: false, activeForUsers: {}, invisibleUsers: [] },
        ephemeralMessages: { enabled: true, messages: [], defaultDuration: 10, screenshotBlocked: true },
        videoEditor: { enabled: true, tools: ['cut', 'text', 'filter', 'speed', 'reverse', 'stickers', 'transitions'], savedProjects: [] },
        duets: { enabled: true, duetVideos: [], duetChains: [] },
        virtualGifts: { enabled: true, gifts: [], giftHistory: [], topGifters: [] },
        scheduledPosts: { enabled: true, scheduledVideos: [], calendar: {} },
        creatorShop: { enabled: true, products: [], orders: [] },
        multilingual: { enabled: true, currentLanguage: 'fr', supportedLanguages: ['fr', 'en', 'es', 'ar'], translations: {} },
        musicStudio: { enabled: true, createdSounds: [], recordings: [], beats: [] },
        predictiveAnalytics: { enabled: true, predictions: {}, optimalTimes: {}, viralScores: {} },
        quests: { enabled: true, dailyQuests: [], weeklyQuests: [], seasonalEvents: [], userProgress: {} },
        aiConversational: { enabled: true, conversations: {}, voiceMessages: [], emotionalStates: {} },
        stories2: { enabled: true, stories: [], polls: [], questions: [], countdowns: [] },
        communities: { enabled: true, groups: [], memberships: {}, groupChats: {} },
        geolocation: { enabled: true, userLocations: {}, localTrends: {}, nearbyCreators: [] },
        gamification: { enabled: true, xp: {}, levels: {}, trophies: {}, streaks: {}, dailyRewards: {}, mysteryBoxes: [] },
        wallet: { enabled: true, balances: {}, transactions: [], withdrawals: [], giftCards: [] },
        contextualNotifications: { enabled: true, locationBased: [], trendAlerts: [], reminders: [], dailySummaries: [] },
        liveStreaming: { enabled: true, liveStreams: [], liveChats: {}, liveGuests: {}, liveGifts: [], liveReplays: [] },
        customization: { enabled: true, themes: {}, accentColors: {}, fonts: {}, layouts: {}, sounds: {}, animations: {}, widgets: {} },
        proMode: { enabled: true, requiredForMonetization: true },
        monetization: {
            enabled: true,
            eligibleCountries: ['France', 'Belgique', 'Suisse', 'Canada', 'USA', 'Maroc', 'Sénégal', 'Côte d\'Ivoire', 'Cameroun', 'RDC', 'Tunisie', 'Algérie'],
            minAge: 18,
            minWatchMinutes: 60000,
            periodDays: 90
        }
    };
}

// ============ VÉRIFICATION DES PERMISSIONS FONDATEUR ============
function isFeatureEnabled(featureName) {
    const founderData = JSON.parse(localStorage.getItem('bdiamond_founder_data')) || {};
    if (!founderData.featurePermissions) return true;
    return founderData.featurePermissions[featureName] !== false;
}

function isMonetizationEnabled(featureName) {
    const founderData = JSON.parse(localStorage.getItem('bdiamond_founder_data')) || {};
    if (!founderData.monetizationPermissions) return true;
    return founderData.monetizationPermissions[featureName] !== false;
}

function isCountryAllowed(countryName) {
    const founderData = JSON.parse(localStorage.getItem('bdiamond_founder_data')) || {};
    if (!founderData.countryPermissions) return true;
    return founderData.countryPermissions[countryName] === 'active' || founderData.countryPermissions[countryName] === undefined;
}

function isCountryLimited(countryName) {
    const founderData = JSON.parse(localStorage.getItem('bdiamond_founder_data')) || {};
    if (!founderData.countryPermissions) return false;
    return founderData.countryPermissions[countryName] === 'limited';
}

function isCountryBlocked(countryName) {
    const founderData = JSON.parse(localStorage.getItem('bdiamond_founder_data')) || {};
    if (!founderData.countryPermissions) return false;
    return founderData.countryPermissions[countryName] === 'blocked';
}

// ============ MODE PRO ET MONÉTISATION ============
function isProModeEnabled(userId) {
    const user = registeredUsers.find(u => u.id === userId);
    return user && user.proMode === true;
}

function canMonetize(userId) {
    const user = registeredUsers.find(u => u.id === userId);
    if (!user) return false;
    
    // Vérifier si la monétisation est activée par le fondateur
    if (!isFeatureEnabled('monetization')) return false;
    if (!isMonetizationEnabled('withdrawal')) return false;
    
    // Vérifier si le pays est autorisé
    if (!isCountryAllowed(user.country || 'France')) return false;
    if (isCountryBlocked(user.country || 'France')) return false;
    
    const eligibleCountries = featuresData.monetization.eligibleCountries;
    const countryEligible = eligibleCountries.includes(user.country || 'France');
    const ageEligible = (user.age || 0) >= featuresData.monetization.minAge;
    const proModeEligible = user.proMode === true;
    const watchTimeEligible = (user.watchMinutes || 0) >= featuresData.monetization.minWatchMinutes;
    
    return countryEligible && ageEligible && proModeEligible && watchTimeEligible;
}

function updateWatchTime(userId, minutes) {
    const user = registeredUsers.find(u => u.id === userId);
    if (user) {
        user.watchMinutes = (user.watchMinutes || 0) + minutes;
        localStorage.setItem('bdiamond_users', JSON.stringify(registeredUsers));
    }
}

function pushVideosForWatchTime(userId) {
    const user = registeredUsers.find(u => u.id === userId);
    if (!user || user.proMode !== true) return null;
    
    if ((user.watchMinutes || 0) < featuresData.monetization.minWatchMinutes) {
        if (typeof bDiamondAI !== 'undefined') {
            return bDiamondAI.getRecommendations(userId, 20);
        }
    }
    return null;
}

// ============ MODE FANTÔME ============
function toggleGhostMode(userId) {
    if (!isFeatureEnabled('ghostMode')) { showToast('❌ Mode Fantôme désactivé'); return; }
    featuresData.ghostMode.activeForUsers[userId] = !featuresData.ghostMode.activeForUsers[userId];
    if (featuresData.ghostMode.activeForUsers[userId]) {
        featuresData.ghostMode.invisibleUsers.push(userId);
        showToast('👻 Mode Fantôme activé');
    } else {
        featuresData.ghostMode.invisibleUsers = featuresData.ghostMode.invisibleUsers.filter(id => id !== userId);
        showToast('✅ Mode Fantôme désactivé');
    }
    saveFeaturesData();
}

function isGhostModeActive(userId) {
    return featuresData.ghostMode.activeForUsers[userId] || false;
}

// ============ MESSAGES ÉPHÉMÈRES ============
function sendEphemeralMessage(fromUserId, toUserId, content, duration = 10) {
    const message = {
        id: Date.now(),
        fromUserId: fromUserId,
        toUserId: toUserId,
        content: content,
        duration: duration,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + duration * 1000).toISOString(),
        read: false
    };
    featuresData.ephemeralMessages.messages.push(message);
    saveFeaturesData();
    setTimeout(() => {
        featuresData.ephemeralMessages.messages = featuresData.ephemeralMessages.messages.filter(m => m.id !== message.id);
        saveFeaturesData();
    }, duration * 1000);
    return message;
}

// ============ ÉDITEUR VIDÉO ============
function saveVideoProject(userId, projectData) {
    const project = {
        id: Date.now(),
        userId: userId,
        projectData: projectData,
        createdAt: new Date().toISOString(),
        lastEdited: new Date().toISOString()
    };
    featuresData.videoEditor.savedProjects.push(project);
    saveFeaturesData();
    return project;
}

// ============ DUOS ============
function createDuet(userId, originalVideoId, duetVideoUrl) {
    const duet = {
        id: Date.now(),
        userId: userId,
        originalVideoId: originalVideoId,
        duetVideoUrl: duetVideoUrl,
        createdAt: new Date().toISOString(),
        likes: 0,
        views: 0
    };
    featuresData.duets.duetVideos.push(duet);
    saveFeaturesData();
    return duet;
}

// ============ CADEAUX VIRTUELS ============
function sendVirtualGift(fromUserId, toUserId, giftId) {
    if (!isMonetizationEnabled('gifts')) { showToast('❌ Cadeaux désactivés'); return null; }
    const gift = featuresData.virtualGifts.gifts.find(g => g.id === giftId);
    if (!gift) return null;
    const transaction = {
        id: Date.now(),
        fromUserId: fromUserId,
        toUserId: toUserId,
        giftId: giftId,
        giftName: gift.name,
        price: gift.price,
        createdAt: new Date().toISOString()
    };
    featuresData.virtualGifts.giftHistory.push(transaction);
    saveFeaturesData();
    return transaction;
}

// ============ PUBLICATION PROGRAMMÉE ============
function schedulePost(userId, videoId, scheduledTime) {
    const scheduledPost = {
        id: Date.now(),
        userId: userId,
        videoId: videoId,
        scheduledTime: scheduledTime,
        status: 'scheduled',
        createdAt: new Date().toISOString()
    };
    featuresData.scheduledPosts.scheduledVideos.push(scheduledPost);
    saveFeaturesData();
    return scheduledPost;
}

// ============ BOUTIQUE CRÉATEURS ============
function addProduct(creatorId, productData) {
    const product = {
        id: Date.now(),
        creatorId: creatorId,
        name: productData.name,
        price: productData.price,
        image: productData.image,
        stock: productData.stock || 100,
        sold: 0,
        createdAt: new Date().toISOString()
    };
    featuresData.creatorShop.products.push(product);
    saveFeaturesData();
    return product;
}

// ============ MULTILINGUE ============
function setLanguage(userId, language) {
    if (!featuresData.multilingual.supportedLanguages.includes(language)) return;
    featuresData.multilingual.currentLanguage = language;
    saveFeaturesData();
    showToast('🌍 Langue changée : ' + language);
}

// ============ STUDIO MUSICAL ============
function createSound(userId, soundData) {
    const sound = {
        id: Date.now(),
        userId: userId,
        name: soundData.name,
        type: soundData.type,
        duration: soundData.duration,
        url: soundData.url,
        createdAt: new Date().toISOString(),
        uses: 0
    };
    featuresData.musicStudio.createdSounds.push(sound);
    saveFeaturesData();
    return sound;
}

// ============ QUÊTES ============
function createDailyQuests() {
    featuresData.quests.dailyQuests = [
        { id: 'watch_10', title: 'Regarder 10 vidéos', reward: 10, target: 10, progress: 0 },
        { id: 'like_5', title: 'Aimer 5 vidéos', reward: 5, target: 5, progress: 0 },
        { id: 'comment_1', title: 'Commenter 1 vidéo', reward: 5, target: 1, progress: 0 },
        { id: 'share_1', title: 'Partager 1 vidéo', reward: 10, target: 1, progress: 0 }
    ];
    saveFeaturesData();
}

function completeQuest(userId, questId) {
    const quest = featuresData.quests.dailyQuests.find(q => q.id === questId);
    if (!quest || quest.progress >= quest.target) return;
    quest.progress++;
    if (quest.progress >= quest.target) {
        const user = registeredUsers.find(u => u.id === userId);
        if (user) { user.diamonds = (user.diamonds || 0) + quest.reward; localStorage.setItem('bdiamond_users', JSON.stringify(registeredUsers)); }
        showToast('🎉 Quête complétée ! +' + quest.reward + ' 💎');
    }
    saveFeaturesData();
}

// ============ STORIES AVANCÉES ============
function createStory(userId, storyData) {
    const story = {
        id: Date.now(),
        userId: userId,
        content: storyData.content,
        type: storyData.type,
        music: storyData.music,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        views: 0,
        reactions: []
    };
    featuresData.stories2.stories.push(story);
    saveFeaturesData();
    return story;
}

// ============ COMMUNAUTÉS ============
function createGroup(creatorId, groupData) {
    const group = {
        id: Date.now(),
        creatorId: creatorId,
        name: groupData.name,
        description: groupData.description,
        type: groupData.type || 'public',
        members: [creatorId],
        moderators: [creatorId],
        createdAt: new Date().toISOString()
    };
    featuresData.communities.groups.push(group);
    saveFeaturesData();
    return group;
}

// ============ GAMIFICATION ============
function addXP(userId, amount) {
    featuresData.gamification.xp[userId] = (featuresData.gamification.xp[userId] || 0) + amount;
    const level = Math.floor(Math.sqrt(featuresData.gamification.xp[userId] / 100)) + 1;
    featuresData.gamification.levels[userId] = level;
    saveFeaturesData();
    return level;
}

// ============ PORTEFEUILLE ============
function getWalletBalance(userId) {
    return featuresData.wallet.balances[userId] || 0;
}

function addFunds(userId, amount) {
    featuresData.wallet.balances[userId] = (featuresData.wallet.balances[userId] || 0) + amount;
    featuresData.wallet.transactions.push({ id: Date.now(), userId: userId, type: 'deposit', amount: amount, date: new Date().toISOString() });
    saveFeaturesData();
}

// ============ LIVE STREAMING ============
function startLiveStream(userId, title) {
    const stream = {
        id: Date.now(),
        userId: userId,
        title: title,
        startedAt: new Date().toISOString(),
        viewers: 0,
        gifts: [],
        chat: [],
        status: 'live'
    };
    featuresData.liveStreaming.liveStreams.push(stream);
    saveFeaturesData();
    return stream;
}

// ============ PERSONNALISATION ============
function setUserTheme(userId, theme) {
    featuresData.customization.themes[userId] = theme;
    saveFeaturesData();
}

// ============ SAUVEGARDE ============
function saveFeaturesData() {
    localStorage.setItem('bdiamond_features', JSON.stringify(featuresData));
}

// ============ INITIALISATION ============
document.addEventListener('DOMContentLoaded', () => {
    if (featuresData.quests.dailyQuests.length === 0) createDailyQuests();
    featuresData.stories2.stories = featuresData.stories2.stories.filter(s => new Date(s.expiresAt) > new Date());
    saveFeaturesData();
});
