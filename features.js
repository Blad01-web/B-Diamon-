// ============ B DIAMOND - FONCTIONNALITÉS AVANCÉES COMPLÈTES ============

let featuresData = JSON.parse(localStorage.getItem('bdiamond_features')) || initializeFeatures();

function initializeFeatures() {
    return {
        ghostMode: {
            enabled: false,
            activeForUsers: {},
            invisibleUsers: []
        },
        ephemeralMessages: {
            enabled: true,
            messages: [],
            defaultDuration: 10,
            screenshotBlocked: true
        },
        videoEditor: {
            enabled: true,
            tools: ['cut', 'text', 'filter', 'speed', 'reverse', 'stickers', 'transitions'],
            savedProjects: []
        },
        duets: {
            enabled: true,
            duetVideos: [],
            duetChains: []
        },
        virtualGifts: {
            enabled: true,
            gifts: [
                { id: 'rose', name: '🌹 Rose', price: 1, animation: 'roseFloat' },
                { id: 'heart', name: '❤️ Cœur', price: 5, animation: 'heartBurst' },
                { id: 'diamond_gift', name: '💎 Diamant', price: 10, animation: 'diamondShine' },
                { id: 'crown', name: '👑 Couronne', price: 50, animation: 'crownGlow' },
                { id: 'rocket', name: '🚀 Fusée', price: 100, animation: 'rocketLaunch' }
            ],
            giftHistory: [],
            topGifters: []
        },
        scheduledPosts: {
            enabled: true,
            scheduledVideos: [],
            calendar: {}
        },
        creatorShop: {
            enabled: true,
            products: [],
            orders: []
        },
        multilingual: {
            enabled: true,
            currentLanguage: 'fr',
            supportedLanguages: ['fr', 'en', 'es', 'ar', 'zh', 'de', 'it', 'pt', 'ru', 'ja'],
            translations: {}
        },
        musicStudio: {
            enabled: true,
            createdSounds: [],
            recordings: [],
            beats: []
        },
        predictiveAnalytics: {
            enabled: true,
            predictions: {},
            optimalTimes: {},
            viralScores: {}
        },
        quests: {
            enabled: true,
            dailyQuests: [],
            weeklyQuests: [],
            seasonalEvents: [],
            userProgress: {}
        },
        aiConversational: {
            enabled: true,
            conversations: {},
            voiceMessages: [],
            emotionalStates: {}
        },
        stories2: {
            enabled: true,
            stories: [],
            polls: [],
            questions: [],
            countdowns: []
        },
        communities: {
            enabled: true,
            groups: [],
            memberships: {},
            groupChats: {}
        },
        geolocation: {
            enabled: true,
            userLocations: {},
            localTrends: {},
            nearbyCreators: []
        },
        gamification: {
            enabled: true,
            xp: {},
            levels: {},
            trophies: {},
            streaks: {},
            dailyRewards: {},
            mysteryBoxes: []
        },
        wallet: {
            enabled: true,
            balances: {},
            transactions: [],
            withdrawals: [],
            giftCards: []
        },
        contextualNotifications: {
            enabled: true,
            locationBased: [],
            trendAlerts: [],
            reminders: [],
            dailySummaries: []
        },
        liveStreaming: {
            enabled: true,
            liveStreams: [],
            liveChats: {},
            liveGuests: {},
            liveGifts: [],
            liveReplays: []
        },
        customization: {
            enabled: true,
            themes: {},
            accentColors: {},
            fonts: {},
            layouts: {},
            sounds: {},
            animations: {},
            widgets: {}
        }
    };
}

// ============ MODE FANTÔME ============
function toggleGhostMode(userId) {
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
        read: false,
        screenshotAttempted: false
    };
    
    featuresData.ephemeralMessages.messages.push(message);
    saveFeaturesData();
    
    // Auto-destruction
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
    
    // Mettre à jour le classement des gifters
    updateTopGifters(fromUserId);
    
    saveFeaturesData();
    return transaction;
}

function updateTopGifters(userId) {
    const userGifts = featuresData.virtualGifts.giftHistory.filter(g => g.fromUserId === userId);
    const totalSpent = userGifts.reduce((sum, g) => sum + g.price, 0);
    
    const existingIndex = featuresData.virtualGifts.topGifters.findIndex(g => g.userId === userId);
    
    if (existingIndex !== -1) {
        featuresData.virtualGifts.topGifters[existingIndex].totalSpent = totalSpent;
    } else {
        featuresData.virtualGifts.topGifters.push({ userId, totalSpent });
    }
    
    featuresData.virtualGifts.topGifters.sort((a, b) => b.totalSpent - a.totalSpent);
    saveFeaturesData();
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
    
    // Simuler la publication automatique
    const delay = new Date(scheduledTime) - new Date();
    if (delay > 0) {
        setTimeout(() => {
            scheduledPost.status = 'published';
            saveFeaturesData();
            showToast('📹 Vidéo publiée automatiquement !');
        }, delay);
    }
    
    return scheduledPost;
}

// ============ BOUTIQUE DE CRÉATEURS ============
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

function purchaseProduct(userId, productId) {
    const product = featuresData.creatorShop.products.find(p => p.id === productId);
    if (!product || product.stock <= 0) return null;
    
    product.stock--;
    product.sold++;
    
    const order = {
        id: Date.now(),
        userId: userId,
        productId: productId,
        productName: product.name,
        price: product.price,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    featuresData.creatorShop.orders.push(order);
    saveFeaturesData();
    return order;
}

// ============ MULTILINGUE ============
function setLanguage(userId, language) {
    if (!featuresData.multilingual.supportedLanguages.includes(language)) return;
    featuresData.multilingual.currentLanguage = language;
    saveFeaturesData();
    showToast('🌍 Langue changée : ' + language);
}

function translateText(text, targetLanguage) {
    // Simulation de traduction
    const translations = {
        'fr': 'Bonjour',
        'en': 'Hello',
        'es': 'Hola',
        'ar': 'مرحبا',
        'zh': '你好',
        'de': 'Hallo',
        'it': 'Ciao',
        'pt': 'Olá',
        'ru': 'Привет',
        'ja': 'こんにちは'
    };
    
    return translations[targetLanguage] || text;
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

// ============ ANALYSES PRÉDICTIVES ============
function predictViralityScore(video) {
    const score = bDiamondAI ? bDiamondAI.predictVirality(video) : 0;
    
    const prediction = {
        videoId: video.id,
        score: score,
        predictedViews: score * 10000,
        confidence: Math.min(95, score * 10),
        recommendedActions: []
    };
    
    if (score > 10) {
        prediction.recommendedActions.push('🔥 Vidéo à fort potentiel viral');
        prediction.recommendedActions.push('📤 Partager immédiatement');
    }
    
    featuresData.predictiveAnalytics.predictions[video.id] = prediction;
    saveFeaturesData();
    return prediction;
}

function getOptimalPostingTime(userId) {
    if (bDiamondAI && bDiamondAI.model.userPreferences[userId]) {
        const activeHours = bDiamondAI.model.userPreferences[userId].activeHours;
        let bestHour = '20';
        let maxActivity = 0;
        
        Object.keys(activeHours).forEach(hour => {
            if (activeHours[hour] > maxActivity) {
                maxActivity = activeHours[hour];
                bestHour = hour;
            }
        });
        
        return bestHour + ':00';
    }
    return '20:00';
}

// ============ QUÊTES ET MISSIONS ============
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
        // Récompenser l'utilisateur
        const user = registeredUsers.find(u => u.id === userId);
        if (user) {
            user.diamonds = (user.diamonds || 0) + quest.reward;
            localStorage.setItem('bdiamond_users', JSON.stringify(registeredUsers));
        }
        showToast('🎉 Quête complétée ! +' + quest.reward + ' 💎');
    }
    
    saveFeaturesData();
}

// ============ IA CONVERSATIONNELLE ============
function chatWithAI(userId, message) {
    if (!featuresData.aiConversational.conversations[userId]) {
        featuresData.aiConversational.conversations[userId] = [];
    }
    
    const userMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
    };
    
    featuresData.aiConversational.conversations[userId].push(userMessage);
    
    // Générer une réponse intelligente
    const aiResponse = {
        role: 'ai',
        content: generateAIConversationalResponse(message),
        timestamp: new Date().toISOString()
    };
    
    featuresData.aiConversational.conversations[userId].push(aiResponse);
    saveFeaturesData();
    
    return aiResponse;
}

function generateAIConversationalResponse(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('bonjour') || msg.includes('salut')) {
        return '👋 Bonjour ! Comment puis-je t\'aider aujourd\'hui ?';
    }
    if (msg.includes('vidéo') || msg.includes('video')) {
        return '📹 Pour tes vidéos, je te conseille de les rendre courtes (15-30s) et dynamiques !';
    }
    if (msg.includes('abonné') || msg.includes('followers')) {
        return '👥 Pour gagner des abonnés, publie régulièrement et interagis avec ta communauté !';
    }
    if (msg.includes('merci')) {
        return '🙏 Avec plaisir ! Je suis là pour t\'aider !';
    }
    
    return '🤖 Je peux t\'aider avec tes vidéos, ton audience, les hashtags, et bien plus !';
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

function createPoll(userId, question, options) {
    const poll = {
        id: Date.now(),
        userId: userId,
        question: question,
        options: options,
        votes: {},
        createdAt: new Date().toISOString()
    };
    
    featuresData.stories2.polls.push(poll);
    saveFeaturesData();
    return poll;
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

function joinGroup(userId, groupId) {
    const group = featuresData.communities.groups.find(g => g.id === groupId);
    if (!group) return;
    
    if (!group.members.includes(userId)) {
        group.members.push(userId);
        featuresData.communities.memberships[userId] = featuresData.communities.memberships[userId] || [];
        featuresData.communities.memberships[userId].push(groupId);
        saveFeaturesData();
    }
}

// ============ GÉOLOCALISATION ============
function setUserLocation(userId, location) {
    featuresData.geolocation.userLocations[userId] = {
        latitude: location.latitude,
        longitude: location.longitude,
        country: location.country,
        city: location.city,
        updatedAt: new Date().toISOString()
    };
    saveFeaturesData();
}

function getNearbyCreators(userId, radius = 10) {
    const userLocation = featuresData.geolocation.userLocations[userId];
    if (!userLocation) return [];
    
    const nearby = [];
    
    Object.keys(featuresData.geolocation.userLocations).forEach(otherUserId => {
        if (parseInt(otherUserId) === userId) return;
        
        const otherLocation = featuresData.geolocation.userLocations[otherUserId];
        const distance = calculateDistance(userLocation, otherLocation);
        
        if (distance <= radius) {
            const user = registeredUsers.find(u => u.id === parseInt(otherUserId));
            nearby.push({ ...user, distance: distance });
        }
    });
    
    return nearby.sort((a, b) => a.distance - b.distance);
}

function calculateDistance(loc1, loc2) {
    // Formule simplifiée
    const dx = (loc1.latitude - loc2.latitude) * 111;
    const dy = (loc1.longitude - loc2.longitude) * 111;
    return Math.sqrt(dx * dx + dy * dy);
}

// ============ GAMIFICATION ============
function addXP(userId, amount) {
    featuresData.gamification.xp[userId] = (featuresData.gamification.xp[userId] || 0) + amount;
    
    // Calculer le niveau
    const level = Math.floor(Math.sqrt(featuresData.gamification.xp[userId] / 100)) + 1;
    featuresData.gamification.levels[userId] = level;
    
    // Vérifier les trophées
    checkTrophies(userId);
    
    saveFeaturesData();
    return level;
}

function checkTrophies(userId) {
    const xp = featuresData.gamification.xp[userId] || 0;
    const trophies = featuresData.gamification.trophies[userId] || [];
    
    const trophyMilestones = [
        { xp: 100, name: '🥉 Débutant', id: 'beginner' },
        { xp: 1000, name: '🥈 Intermédiaire', id: 'intermediate' },
        { xp: 5000, name: '🥇 Avancé', id: 'advanced' },
        { xp: 10000, name: '💎 Expert', id: 'expert' },
        { xp: 50000, name: '👑 Légende', id: 'legend' }
    ];
    
    trophyMilestones.forEach(milestone => {
        if (xp >= milestone.xp && !trophies.includes(milestone.id)) {
            trophies.push(milestone.id);
            showToast('🏆 Trophée débloqué : ' + milestone.name + ' !');
        }
    });
    
    featuresData.gamification.trophies[userId] = trophies;
}

// ============ PORTEFEUILLE ============
function getWalletBalance(userId) {
    return featuresData.wallet.balances[userId] || 0;
}

function addFunds(userId, amount) {
    featuresData.wallet.balances[userId] = (featuresData.wallet.balances[userId] || 0) + amount;
    
    featuresData.wallet.transactions.push({
        id: Date.now(),
        userId: userId,
        type: 'deposit',
        amount: amount,
        date: new Date().toISOString()
    });
    
    saveFeaturesData();
}

function withdrawFunds(userId, amount) {
    const balance = getWalletBalance(userId);
    if (balance < amount) return false;
    
    featuresData.wallet.balances[userId] = balance - amount;
    
    featuresData.wallet.withdrawals.push({
        id: Date.now(),
        userId: userId,
        amount: amount,
        status: 'processing',
        date: new Date().toISOString()
    });
    
    saveFeaturesData();
    return true;
}

// ============ NOTIFICATIONS CONTEXTUELLES ============
function sendContextualNotification(userId, type, message) {
    const notification = {
        id: Date.now(),
        userId: userId,
        type: type,
        message: message,
        read: false,
        createdAt: new Date().toISOString()
    };
    
    switch(type) {
        case 'location':
            featuresData.contextualNotifications.locationBased.push(notification);
            break;
        case 'trend':
            featuresData.contextualNotifications.trendAlerts.push(notification);
            break;
        case 'reminder':
            featuresData.contextualNotifications.reminders.push(notification);
            break;
        case 'summary':
            featuresData.contextualNotifications.dailySummaries.push(notification);
            break;
    }
    
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
    featuresData.customization.themes[userId] = theme;
    saveFeaturesData();
}

function setAccentColor(userId, color) {
    featuresData.customization.accentColors[userId] = color;
    saveFeaturesData();
}

// ============ SAUVEGARDE ============
function saveFeaturesData() {
    localStorage.setItem('bdiamond_features', JSON.stringify(featuresData));
}

// ============ INITIALISATION ============
document.addEventListener('DOMContentLoaded', () => {
    // Créer les quêtes quotidiennes
    if (featuresData.quests.dailyQuests.length === 0) {
        createDailyQuests();
    }
    
    // Vérifier les stories expirées
    featuresData.stories2.stories = featuresData.stories2.stories.filter(s => 
        new Date(s.expiresAt) > new Date()
    );
    
    saveFeaturesData();
});