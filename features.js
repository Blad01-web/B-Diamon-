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
        multilingual: { enabled: true, currentLanguage: 'fr', supportedLanguages: ['fr', 'en', 'es', 'ar', 'zh', 'de', 'it', 'pt', 'ru', 'ja'], translations: {} },
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

// ============ VÉRIFICATION DES PERMISSIONS ============
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
    if (!isFeatureEnabled('monetization')) return false;
    if (!isMonetizationEnabled('withdrawal')) return false;
    if (!isCountryAllowed(user.country || 'France')) return false;
    if (isCountryBlocked(user.country || 'France')) return false;
    
    const eligibleCountries = featuresData.monetization.eligibleCountries;
    const countryEligible = eligibleCountries.includes(user.country || 'France');
    const ageEligible = (user.age || 0) >= featuresData.monetization.minAge;
    const proModeEligible = user.proMode === true;
    const watchTimeEligible = (user.watchMinutes || 0) >= featuresData.monetization.minWatchMinutes;
    
    return countryEligible && ageEligible && proModeEligible && watchTimeEligible;
}

// ============ STORIES AVANCÉES ============
function createPoll(userId, question, options) {
    if (!isFeatureEnabled('storyPolls')) { showToast('❌ Sondages désactivés'); return null; }
    const poll = { id: Date.now(), userId, question, options, votes: {}, createdAt: new Date().toISOString() };
    featuresData.stories2.polls.push(poll);
    saveFeaturesData();
    return poll;
}

function createQuestion(userId, question) {
    if (!isFeatureEnabled('storyQuestions')) { showToast('❌ Questions désactivées'); return null; }
    const q = { id: Date.now(), userId, question, answers: [], createdAt: new Date().toISOString() };
    featuresData.stories2.questions.push(q);
    saveFeaturesData();
    return q;
}

function createCountdown(userId, title, endDate) {
    if (!isFeatureEnabled('storyCountdowns')) { showToast('❌ Comptes à rebours désactivés'); return null; }
    const countdown = { id: Date.now(), userId, title, endDate, createdAt: new Date().toISOString() };
    featuresData.stories2.countdowns.push(countdown);
    saveFeaturesData();
    return countdown;
}

// ============ COMMUNAUTÉS AVANCÉES ============
function createGroup(creatorId, groupData) {
    if (!isFeatureEnabled('communities')) { showToast('❌ Communautés désactivées'); return null; }
    const group = { id: Date.now(), creatorId, name: groupData.name, description: groupData.description, type: groupData.type || 'public', members: [creatorId], moderators: [creatorId], createdAt: new Date().toISOString() };
    featuresData.communities.groups.push(group);
    saveFeaturesData();
    return group;
}

function joinGroup(userId, groupId) {
    const group = featuresData.communities.groups.find(g => g.id === groupId);
    if (!group) return;
    if (!group.members.includes(userId)) {
        group.members.push(userId);
        if (!featuresData.communities.memberships[userId]) featuresData.communities.memberships[userId] = [];
        featuresData.communities.memberships[userId].push(groupId);
        saveFeaturesData();
    }
}

// ============ GAMIFICATION AVANCÉE ============
function addXP(userId, amount) {
    if (!isFeatureEnabled('xpLevels')) return 0;
    featuresData.gamification.xp[userId] = (featuresData.gamification.xp[userId] || 0) + amount;
    const level = Math.floor(Math.sqrt(featuresData.gamification.xp[userId] / 100)) + 1;
    featuresData.gamification.levels[userId] = level;
    checkTrophies(userId);
    saveFeaturesData();
    return level;
}

function checkTrophies(userId) {
    if (!isFeatureEnabled('trophies')) return;
    const xp = featuresData.gamification.xp[userId] || 0;
    const trophies = featuresData.gamification.trophies[userId] || [];
    const milestones = [
        { xp: 100, name: '🥉 Débutant', id: 'beginner' },
        { xp: 1000, name: '🥈 Intermédiaire', id: 'intermediate' },
        { xp: 5000, name: '🥇 Avancé', id: 'advanced' },
        { xp: 10000, name: '💎 Expert', id: 'expert' },
        { xp: 50000, name: '👑 Légende', id: 'legend' }
    ];
    milestones.forEach(m => {
        if (xp >= m.xp && !trophies.includes(m.id)) {
            trophies.push(m.id);
            showToast('🏆 Trophée débloqué : ' + m.name + ' !');
        }
    });
    featuresData.gamification.trophies[userId] = trophies;
}

// ============ LIVE STREAMING ============
function startLiveStream(userId, title) {
    if (!isFeatureEnabled('liveStreaming')) { showToast('❌ Live désactivé'); return null; }
    const stream = { id: Date.now(), userId, title, startedAt: new Date().toISOString(), viewers: 0, gifts: [], chat: [], status: 'live' };
    featuresData.liveStreaming.liveStreams.push(stream);
    saveFeaturesData();
    return stream;
}

function endLiveStream(streamId) {
    const stream = featuresData.liveStreaming.liveStreams.find(s => s.id === streamId);
    if (stream) {
        stream.status = 'ended';
        stream.endedAt = new Date().toISOString();
        featuresData.liveStreaming.liveReplays.push(stream);
        saveFeaturesData();
    }
}

// ============ PERSONNALISATION ============
function setUserTheme(userId, theme) {
    if (!isFeatureEnabled('customization')) { showToast('❌ Personnalisation désactivée'); return; }
    featuresData.customization.themes[userId] = theme;
    saveFeaturesData();
    showToast('🎨 Thème appliqué !');
}

function setAccentColor(userId, color) {
    if (!isFeatureEnabled('customization')) return;
    featuresData.customization.accentColors[userId] = color;
    saveFeaturesData();
}

// ============ MULTILINGUE ============
function setLanguage(userId, language) {
    if (!isFeatureEnabled('multilingual')) { showToast('❌ Multilingue désactivé'); return; }
    if (!featuresData.multilingual.supportedLanguages.includes(language)) return;
    featuresData.multilingual.currentLanguage = language;
    saveFeaturesData();
    showToast('🌍 Langue changée : ' + language);
}

// ============ GÉOLOCALISATION ============
function setUserLocation(userId, location) {
    if (!isFeatureEnabled('geolocation')) return;
    featuresData.geolocation.userLocations[userId] = {
        latitude: location.latitude, longitude: location.longitude,
        country: location.country, city: location.city, updatedAt: new Date().toISOString()
    };
    saveFeaturesData();
}

function getNearbyCreators(userId, radius = 10) {
    if (!isFeatureEnabled('geolocation')) return [];
    const userLocation = featuresData.geolocation.userLocations[userId];
    if (!userLocation) return [];
    const nearby = [];
    Object.keys(featuresData.geolocation.userLocations).forEach(otherUserId => {
        if (parseInt(otherUserId) === userId) return;
        const otherLocation = featuresData.geolocation.userLocations[otherUserId];
        const dx = (userLocation.latitude - otherLocation.latitude) * 111;
        const dy = (userLocation.longitude - otherLocation.longitude) * 111;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= radius) {
            const user = registeredUsers.find(u => u.id === parseInt(otherUserId));
            nearby.push({ ...user, distance });
        }
    });
    return nearby.sort((a, b) => a.distance - b.distance);
}

// ============ PORTEFEUILLE ============
function getWalletBalance(userId) {
    if (!isFeatureEnabled('wallet')) return 0;
    return featuresData.wallet.balances[userId] || 0;
}

function addFunds(userId, amount) {
    if (!isFeatureEnabled('wallet')) { showToast('❌ Portefeuille désactivé'); return; }
    featuresData.wallet.balances[userId] = (featuresData.wallet.balances[userId] || 0) + amount;
    featuresData.wallet.transactions.push({ id: Date.now(), userId, type: 'deposit', amount, date: new Date().toISOString() });
    saveFeaturesData();
}

// ============ SAUVEGARDE ============
function saveFeaturesData() {
    localStorage.setItem('bdiamond_features', JSON.stringify(featuresData));
}

// ============ INITIALISATION ============
document.addEventListener('DOMContentLoaded', () => {
    saveFeaturesData();
});
