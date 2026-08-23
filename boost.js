// ============ B DIAMOND - SYSTÈME DE BOOST PAYANT ============

let boostData = JSON.parse(localStorage.getItem('bdiamond_boosts')) || initializeBoosts();

function initializeBoosts() {
    return {
        boostPackages: [
            {
                id: 'boost_basic',
                name: 'Boost Basique',
                icon: '⚡',
                price: 0.99,
                duration: '24h',
                viewsBoost: 100,
                likesBoost: 10,
                followersBoost: 5,
                description: 'Boost léger pour démarrer',
                color: '#4CAF50'
            },
            {
                id: 'boost_standard',
                name: 'Boost Standard',
                icon: '🔥',
                price: 2.99,
                duration: '24h',
                viewsBoost: 500,
                likesBoost: 50,
                followersBoost: 25,
                description: 'Boost moyen pour plus de visibilité',
                color: '#FF9800'
            },
            {
                id: 'boost_premium',
                name: 'Boost Premium',
                icon: '💎',
                price: 4.99,
                duration: '24h',
                viewsBoost: 2000,
                likesBoost: 200,
                followersBoost: 100,
                description: 'Boost puissant pour devenir viral',
                color: '#FFD700'
            },
            {
                id: 'boost_viral',
                name: 'Boost Viral',
                icon: '🚀',
                price: 9.99,
                duration: '24h',
                viewsBoost: 10000,
                likesBoost: 1000,
                followersBoost: 500,
                description: 'Boost ultra puissant pour exploser',
                color: '#FF0050'
            },
            {
                id: 'boost_legend',
                name: 'Boost Légendaire',
                icon: '👑',
                price: 19.99,
                duration: '24h',
                viewsBoost: 50000,
                likesBoost: 5000,
                followersBoost: 2500,
                description: 'Boost légendaire pour dominer',
                color: '#FFD700'
            }
        ],
        activeBoosts: [],
        boostHistory: [],
        totalBoostRevenue: 0,
        boostStats: {
            totalBoostsSold: 0,
            totalViewsGenerated: 0,
            totalLikesGenerated: 0,
            totalFollowersGenerated: 0
        }
    };
}

// ============ SYSTÈME DE BOOST ============
function purchaseBoost(userId, boostId) {
    const user = registeredUsers.find(u => u.id === userId);
    const boost = boostData.boostPackages.find(b => b.id === boostId);
    
    if (!user || !boost) return { success: false, message: 'Utilisateur ou boost introuvable' };
    
    // Vérifier si l'utilisateur a assez de diamants ou d'argent
    if (user.diamonds && user.diamonds >= boost.price * 100) {
        // Payer avec des diamants
        user.diamonds -= boost.price * 100;
        return activateBoost(userId, boostId, 'diamonds');
    } else {
        // Simuler le paiement par carte
        const cardNumber = prompt('💳 Paiement ' + boost.price + '€ - Numéro de carte :');
        if (!cardNumber || cardNumber.length < 10) {
            return { success: false, message: 'Carte invalide' };
        }
        
        const expiry = prompt('📅 Date d\'expiration (MM/AA) :');
        if (!expiry) {
            return { success: false, message: 'Date invalide' };
        }
        
        const cvv = prompt('🔒 CVV (3 chiffres) :');
        if (!cvv || cvv.length !== 3) {
            return { success: false, message: 'CVV invalide' };
        }
        
        return activateBoost(userId, boostId, 'card');
    }
}

function activateBoost(userId, boostId, paymentMethod) {
    const user = registeredUsers.find(u => u.id === userId);
    const boost = boostData.boostPackages.find(b => b.id === boostId);
    
    if (!user || !boost) return { success: false, message: 'Erreur' };
    
    // Créer le boost actif
    const activeBoost = {
        id: Date.now(),
        userId: userId,
        username: user.username,
        boostId: boostId,
        boostName: boost.name,
        boostIcon: boost.icon,
        viewsBoost: boost.viewsBoost,
        likesBoost: boost.likesBoost,
        followersBoost: boost.followersBoost,
        price: boost.price,
        paymentMethod: paymentMethod,
        activatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        viewsGenerated: 0,
        likesGenerated: 0,
        followersGenerated: 0
    };
    
    boostData.activeBoosts.push(activeBoost);
    boostData.boostHistory.push(activeBoost);
    boostData.totalBoostRevenue += boost.price;
    boostData.boostStats.totalBoostsSold++;
    
    // Appliquer le boost aux vidéos de l'utilisateur
    applyBoostToVideos(userId, boost);
    
    // Mettre à jour les statistiques de l'utilisateur
    user.followers += boost.followersBoost;
    user.likes += boost.likesBoost;
    
    // Ajouter les revenus au fondateur
    if (typeof addFounderRevenue === 'function') {
        addFounderRevenue('boost', boost.price);
    }
    
    localStorage.setItem('bdiamond_users', JSON.stringify(registeredUsers));
    saveBoostData();
    
    // Notification
    if (typeof sendNotification === 'function') {
        sendNotification(userId, 'reward', '🚀 Boost ' + boost.name + ' activé ! +' + boost.viewsBoost + ' vues');
    }
    
    return { 
        success: true, 
        message: '🚀 Boost ' + boost.name + ' activé avec succès !',
        boost: activeBoost
    };
}

function applyBoostToVideos(userId, boost) {
    const userVideos = videos.filter(v => v.userId === userId);
    
    userVideos.forEach(video => {
        // Augmenter les vues
        video.views += boost.viewsBoost;
        video.likes += boost.likesBoost;
        
        // Simuler l'augmentation progressive
        const interval = setInterval(() => {
            video.views += Math.floor(boost.viewsBoost / 100);
            video.likes += Math.floor(boost.likesBoost / 100);
            localStorage.setItem('bdiamond_videos', JSON.stringify(videos));
        }, 1000);
        
        // Arrêter après 24h (simulé en 10 secondes pour la démo)
        setTimeout(() => {
            clearInterval(interval);
        }, 10000);
    });
    
    localStorage.setItem('bdiamond_videos', JSON.stringify(videos));
    
    // Mettre à jour les statistiques du boost
    boostData.boostStats.totalViewsGenerated += boost.viewsBoost;
    boostData.boostStats.totalLikesGenerated += boost.likesBoost;
    boostData.boostStats.totalFollowersGenerated += boost.followersBoost;
    saveBoostData();
}

// ============ VÉRIFICATION DES BOOSTS ACTIFS ============
function checkActiveBoosts(userId) {
    return boostData.activeBoosts.filter(b => 
        b.userId === userId && 
        b.status === 'active' && 
        new Date(b.expiresAt) > new Date()
    );
}

function checkBoostExpiry() {
    boostData.activeBoosts.forEach(boost => {
        if (new Date(boost.expiresAt) < new Date() && boost.status === 'active') {
            boost.status = 'expired';
            // Notification
            if (typeof sendNotification === 'function') {
                sendNotification(boost.userId, 'system', '⏰ Boost ' + boost.boostName + ' expiré');
            }
        }
    });
    saveBoostData();
}

// ============ STATISTIQUES DE BOOST ============
function getBoostStats(userId) {
    const userBoosts = boostData.boostHistory.filter(b => b.userId === userId);
    const activeBoosts = checkActiveBoosts(userId);
    
    return {
        totalBoosts: userBoosts.length,
        activeBoosts: activeBoosts,
        totalSpent: userBoosts.reduce((sum, b) => sum + b.price, 0),
        totalViewsGained: userBoosts.reduce((sum, b) => sum + b.viewsBoost, 0),
        totalLikesGained: userBoosts.reduce((sum, b) => sum + b.likesBoost, 0),
        totalFollowersGained: userBoosts.reduce((sum, b) => sum + b.followersBoost, 0)
    };
}

// ============ SÉLECTION DU BOOST ============
function getBoostRecommendation(userId) {
    const user = registeredUsers.find(u => u.id === userId);
    if (!user) return null;
    
    // Recommander un boost basé sur le nombre d'abonnés
    if (user.followers < 1000) {
        return boostData.boostPackages.find(b => b.id === 'boost_standard');
    } else if (user.followers < 10000) {
        return boostData.boostPackages.find(b => b.id === 'boost_premium');
    } else if (user.followers < 50000) {
        return boostData.boostPackages.find(b => b.id === 'boost_viral');
    } else {
        return boostData.boostPackages.find(b => b.id === 'boost_legend');
    }
}

// ============ SAUVEGARDE ============
function saveBoostData() {
    localStorage.setItem('bdiamond_boosts', JSON.stringify(boostData));
}

// ============ INITIALISATION ============
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier les boosts expirés toutes les minutes
    setInterval(() => {
        checkBoostExpiry();
    }, 60000);
});