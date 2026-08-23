// ============ B DIAMOND - SYSTÈME DE HASHTAGS COMPLET ============

let hashtagData = JSON.parse(localStorage.getItem('bdiamond_hashtags')) || initializeHashtags();

function initializeHashtags() {
    return {
        followedHashtags: {},
        hashtagStats: {},
        hashtagHistory: {},
        hashtagVideos: {},
        hashtagCreators: {},
        hashtagSuggestions: []
    };
}

// ============ RENDRE LES HASHTAGS CLIQUABLES ============
function makeHashtagsClickable(text) {
    if (!text) return '';
    
    return text.replace(/#(\w+)/g, (match, hashtag) => {
        return `<span class="hashtag-link" onclick="openHashtagPage('${hashtag}')" style="color:#FFD700; cursor:pointer; text-decoration:underline;">#${hashtag}</span>`;
    });
}

// ============ OUVRIR LA PAGE HASHTAG ============
function openHashtagPage(hashtagName) {
    // Nettoyer le nom du hashtag
    const cleanName = hashtagName.replace('#', '').toLowerCase();
    window.location.href = 'hashtag.html?tag=' + cleanName;
}

// ============ SUIVRE UN HASHTAG ============
function followHashtag(userId, hashtagName) {
    const cleanName = hashtagName.replace('#', '').toLowerCase();
    
    if (!hashtagData.followedHashtags[userId]) {
        hashtagData.followedHashtags[userId] = [];
    }
    
    if (!hashtagData.followedHashtags[userId].includes(cleanName)) {
        hashtagData.followedHashtags[userId].push(cleanName);
        saveHashtagData();
        
        if (typeof sendNotification === 'function') {
            sendNotification(userId, 'system', '✅ Vous suivez maintenant #' + cleanName);
        }
        
        return true;
    }
    
    return false;
}

function unfollowHashtag(userId, hashtagName) {
    const cleanName = hashtagName.replace('#', '').toLowerCase();
    
    if (hashtagData.followedHashtags[userId]) {
        hashtagData.followedHashtags[userId] = hashtagData.followedHashtags[userId].filter(h => h !== cleanName);
        saveHashtagData();
        
        if (typeof sendNotification === 'function') {
            sendNotification(userId, 'system', '❌ Vous ne suivez plus #' + cleanName);
        }
        
        return true;
    }
    
    return false;
}

function isFollowingHashtag(userId, hashtagName) {
    const cleanName = hashtagName.replace('#', '').toLowerCase();
    return hashtagData.followedHashtags[userId] && 
           hashtagData.followedHashtags[userId].includes(cleanName);
}

function getFollowedHashtags(userId) {
    return hashtagData.followedHashtags[userId] || [];
}

// ============ STATISTIQUES DES HASHTAGS ============
function getHashtagStats(hashtagName) {
    const cleanName = hashtagName.replace('#', '').toLowerCase();
    
    const videosWithHashtag = videos.filter(v => 
        v.caption.toLowerCase().includes('#' + cleanName)
    );
    
    const totalViews = videosWithHashtag.reduce((sum, v) => sum + v.views, 0);
    const totalLikes = videosWithHashtag.reduce((sum, v) => sum + v.likes, 0);
    const totalComments = videosWithHashtag.reduce((sum, v) => sum + v.comments, 0);
    const totalShares = videosWithHashtag.reduce((sum, v) => sum + v.shares, 0);
    
    // Trouver les créateurs uniques
    const creators = new Set();
    videosWithHashtag.forEach(v => {
        creators.add(v.userId);
    });
    
    return {
        name: cleanName,
        videoCount: videosWithHashtag.length,
        totalViews: totalViews,
        totalLikes: totalLikes,
        totalComments: totalComments,
        totalShares: totalShares,
        creatorCount: creators.size,
        averageEngagement: videosWithHashtag.length > 0 ? 
            (totalLikes + totalComments + totalShares) / videosWithHashtag.length : 0
    };
}

// ============ VIDÉOS D'UN HASHTAG ============
function getHashtagVideos(hashtagName, limit = 20) {
    const cleanName = hashtagName.replace('#', '').toLowerCase();
    
    return videos
        .filter(v => v.caption.toLowerCase().includes('#' + cleanName))
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
}

// ============ CRÉATEURS D'UN HASHTAG ============
function getHashtagCreators(hashtagName, limit = 10) {
    const cleanName = hashtagName.replace('#', '').toLowerCase();
    const hashtagVideos = getHashtagVideos(hashtagName, 100);
    
    const creatorStats = {};
    
    hashtagVideos.forEach(video => {
        if (!creatorStats[video.userId]) {
            const user = registeredUsers.find(u => u.id === video.userId);
            creatorStats[video.userId] = {
                userId: video.userId,
                username: user ? user.username : 'Unknown',
                avatar: user ? user.avatar : '',
                videoCount: 0,
                totalViews: 0,
                totalLikes: 0
            };
        }
        
        creatorStats[video.userId].videoCount++;
        creatorStats[video.userId].totalViews += video.views;
        creatorStats[video.userId].totalLikes += video.likes;
    });
    
    return Object.values(creatorStats)
        .sort((a, b) => b.totalViews - a.totalViews)
        .slice(0, limit);
}

// ============ HASHTAGS TENDANCE ============
function getTrendingHashtags(limit = 10) {
    return hashtags
        .sort((a, b) => parseInt(b.count) - parseInt(a.count))
        .slice(0, limit);
}

// ============ HASHTAGS ÉMERGENTS ============
function getEmergingHashtags() {
    const emerging = hashtags.filter(h => 
        h.count.includes('K') && parseInt(h.count) < 20
    );
    
    return emerging.sort((a, b) => {
        const countA = parseInt(a.count.replace('K', '')) * 1000;
        const countB = parseInt(b.count.replace('K', '')) * 1000;
        return countB - countA;
    });
}

// ============ SUGGESTIONS AUTOMATIQUES ============
function getHashtagSuggestions(input, limit = 5) {
    const cleanInput = input.replace('#', '').toLowerCase();
    
    if (!cleanInput) return [];
    
    return hashtags
        .filter(h => h.name.toLowerCase().includes(cleanInput))
        .slice(0, limit);
}

// ============ GÉNÉRATION IA DE HASHTAGS ============
function generateAIHashtags(videoContent, category, limit = 5) {
    const generatedHashtags = [];
    
    // Hashtags de base
    const baseHashtags = ['viral', 'trend', 'foryou', 'fyp'];
    
    // Hashtags par catégorie
    const categoryHashtags = {
        'dance': ['dance', 'dancer', 'challenge', 'moves'],
        'music': ['music', 'sound', 'beat', 'melody'],
        'comedy': ['comedy', 'funny', 'humor', 'lol'],
        'sport': ['sport', 'fitness', 'training', 'workout'],
        'cooking': ['cooking', 'food', 'recipe', 'chef'],
        'gaming': ['gaming', 'game', 'gamer', 'play'],
        'beauty': ['beauty', 'makeup', 'style', 'fashion'],
        'education': ['learn', 'education', 'knowledge', 'tips']
    };
    
    // Ajouter les hashtags de catégorie
    if (category && categoryHashtags[category]) {
        generatedHashtags.push(...categoryHashtags[category]);
    }
    
    // Analyser le contenu pour extraire des mots-clés
    if (videoContent) {
        const words = videoContent.toLowerCase().split(/\s+/);
        words.forEach(word => {
            if (word.length > 3 && !generatedHashtags.includes(word)) {
                generatedHashtags.push(word);
            }
        });
    }
    
    // Ajouter les hashtags tendance
    const trendingHashtags = getTrendingHashtags(3);
    trendingHashtags.forEach(tag => {
        const cleanName = tag.name.replace(/[^a-zA-Z]/g, '').toLowerCase();
        if (!generatedHashtags.includes(cleanName)) {
            generatedHashtags.push(cleanName);
        }
    });
    
    // Ajouter les hashtags de base
    baseHashtags.forEach(tag => {
        if (!generatedHashtags.includes(tag)) {
            generatedHashtags.push(tag);
        }
    });
    
    // Limiter et formater
    return generatedHashtags.slice(0, limit).map(tag => '#' + tag);
}

// ============ HASHTAGS SIMILAIRES ============
function getSimilarHashtags(hashtagName) {
    const cleanName = hashtagName.replace('#', '').toLowerCase();
    
    return hashtags.filter(h => {
        const tagName = h.name.replace(/[^a-zA-Z]/g, '').toLowerCase();
        return tagName !== cleanName && 
               (tagName.includes(cleanName) || cleanName.includes(tagName));
    });
}

// ============ RECHERCHE PAR HASHTAG ============
function searchByHashtag(query, limit = 20) {
    const cleanQuery = query.replace('#', '').toLowerCase();
    
    const results = {
        hashtags: [],
        videos: [],
        creators: []
    };
    
    // Rechercher les hashtags
    results.hashtags = hashtags.filter(h => 
        h.name.toLowerCase().includes(cleanQuery)
    );
    
    // Rechercher les vidéos
    results.videos = videos.filter(v => 
        v.caption.toLowerCase().includes('#' + cleanQuery) ||
        v.caption.toLowerCase().includes(cleanQuery)
    ).slice(0, limit);
    
    // Rechercher les créateurs
    results.creators = registeredUsers.filter(u => 
        u.username.toLowerCase().includes(cleanQuery) ||
        u.bio.toLowerCase().includes(cleanQuery)
    ).slice(0, 10);
    
    return results;
}

// ============ HISTORIQUE DES HASHTAGS ============
function trackHashtagView(userId, hashtagName) {
    const cleanName = hashtagName.replace('#', '').toLowerCase();
    
    if (!hashtagData.hashtagHistory[userId]) {
        hashtagData.hashtagHistory[userId] = [];
    }
    
    hashtagData.hashtagHistory[userId].unshift({
        hashtag: cleanName,
        viewedAt: new Date().toISOString()
    });
    
    // Garder les 50 derniers
    if (hashtagData.hashtagHistory[userId].length > 50) {
        hashtagData.hashtagHistory[userId].pop();
    }
    
    saveHashtagData();
}

function getHashtagHistory(userId) {
    return hashtagData.hashtagHistory[userId] || [];
}

// ============ FIL D'ACTUALITÉ DES HASHTAGS SUIVIS ============
function getFollowedHashtagsFeed(userId, limit = 20) {
    const followedHashtags = getFollowedHashtags(userId);
    
    if (followedHashtags.length === 0) return [];
    
    const feed = [];
    
    followedHashtags.forEach(hashtagName => {
        const hashtagVideos = getHashtagVideos(hashtagName, 5);
        hashtagVideos.forEach(video => {
            feed.push({
                ...video,
                hashtag: hashtagName
            });
        });
    });
    
    return feed
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
}

// ============ FILTRES PAR HASHTAGS ============
function filterVideosByHashtags(hashtagNames, limit = 20) {
    const cleanNames = hashtagNames.map(h => h.replace('#', '').toLowerCase());
    
    return videos.filter(v => {
        const caption = v.caption.toLowerCase();
        return cleanNames.some(name => caption.includes('#' + name));
    }).slice(0, limit);
}

// ============ BADGES DE HASHTAGS ============
function getHashtagBadge(userId, hashtagName) {
    const creatorStats = getHashtagCreators(hashtagName, 100);
    const userRank = creatorStats.findIndex(c => c.userId === userId);
    
    if (userRank === 0) return '👑 Top Créateur';
    if (userRank < 5) return '⭐ Top 5';
    if (userRank < 10) return '🏆 Top 10';
    if (userRank !== -1) return '📣 Contributeur';
    return null;
}

// ============ SAUVEGARDE ============
function saveHashtagData() {
    localStorage.setItem('bdiamond_hashtags', JSON.stringify(hashtagData));
}

// ============ INITIALISATION ============
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les statistiques pour tous les hashtags
    hashtags.forEach(tag => {
        const cleanName = tag.name.replace(/[^a-zA-Z]/g, '').toLowerCase();
        if (!hashtagData.hashtagStats[cleanName]) {
            hashtagData.hashtagStats[cleanName] = getHashtagStats(cleanName);
        }
    });
    saveHashtagData();
});