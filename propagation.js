// ============ B DIAMOND - SYSTÈME D'AUTO-PROPAGATION ============

let propagationData = JSON.parse(localStorage.getItem('bdiamond_propagation')) || initializePropagation();

function initializePropagation() {
    return {
        inviteLinks: {},
        referralCodes: {},
        referrals: {},
        rankings: [],
        challenges: [],
        shareCounts: {},
        totalInvites: 0,
        totalShares: 0,
        kFactor: 0,
        weeklyGrowth: [],
        lastUpdate: new Date().toISOString()
    };
}

// ============ SYSTÈME DE RÉCOMPENSES ============
const rewardSystem = {
    invite: 50,
    cascade: [25, 10, 5],
    share: 10,
    challenge: 100,
    viralVideo: 200,
    topRank: 1000,
    weeklyActive: 50
};

// ============ GÉNÉRATION DE CODE D'INVITATION ============
function generateInviteCode(userId) {
    const user = registeredUsers.find(u => u.id === userId);
    if (!user) return null;
    
    // Créer un code unique basé sur le nom d'utilisateur
    const base = user.username.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = base.substring(0, 4) + '-' + random;
    
    propagationData.referralCodes[code] = {
        userId: userId,
        username: user.username,
        createdAt: new Date().toISOString(),
        uses: 0
    };
    
    propagationData.inviteLinks[userId] = {
        code: code,
        link: 'https://bdiamond.app/invite/' + code,
        createdAt: new Date().toISOString()
    };
    
    savePropagationData();
    return code;
}

function getInviteLink(userId) {
    if (!propagationData.inviteLinks[userId]) {
        return generateInviteCode(userId);
    }
    return propagationData.inviteLinks[userId].link;
}

function getInviteCode(userId) {
    if (!propagationData.inviteLinks[userId]) {
        return generateInviteCode(userId);
    }
    return propagationData.inviteLinks[userId].code;
}

// ============ SUIVI DES PARRAINAGES ============
function trackReferral(code, newUserId) {
    if (!propagationData.referralCodes[code]) {
        return { success: false, message: 'Code invalide' };
    }
    
    const referrer = propagationData.referralCodes[code];
    
    if (!propagationData.referrals[referrer.userId]) {
        propagationData.referrals[referrer.userId] = {
            directInvites: [],
            cascadeInvites: [],
            totalRewards: 0
        };
    }
    
    // Ajouter à la liste des invités directs
    propagationData.referrals[referrer.userId].directInvites.push({
        userId: newUserId,
        date: new Date().toISOString(),
        level: 1
    });
    
    // Récompenser l'inviteur
    rewardUser(referrer.userId, rewardSystem.invite, 'invite');
    
    // Mettre à jour le compteur du code
    propagationData.referralCodes[code].uses++;
    propagationData.totalInvites++;
    
    // Récompenser en cascade
    rewardCascade(referrer.userId, 2);
    
    savePropagationData();
    updateRankings();
    
    return { 
        success: true, 
        referrer: referrer.username,
        reward: rewardSystem.invite 
    };
}

function rewardCascade(userId, level) {
    if (level > rewardSystem.cascade.length + 1) return;
    
    // Trouver qui a invité cet utilisateur
    const parentReferral = findParentReferral(userId);
    if (parentReferral && rewardSystem.cascade[level - 2]) {
        rewardUser(parentReferral, rewardSystem.cascade[level - 2], 'cascade_level_' + (level - 1));
        
        if (propagationData.referrals[parentReferral]) {
            propagationData.referrals[parentReferral].cascadeInvites.push({
                userId: userId,
                level: level - 1,
                date: new Date().toISOString()
            });
        }
        
        // Continuer la cascade
        rewardCascade(parentReferral, level + 1);
    }
}

function findParentReferral(userId) {
    for (const referrerId in propagationData.referrals) {
        const referral = propagationData.referrals[referrerId];
        if (referral.directInvites.some(invite => invite.userId === userId)) {
            return parseInt(referrerId);
        }
    }
    return null;
}

// ============ SYSTÈME DE RÉCOMPENSES ============
function rewardUser(userId, amount, type) {
    const user = registeredUsers.find(u => u.id === userId);
    if (!user) return;
    
    // Initialiser le portefeuille de diamants
    if (!user.diamonds) {
        user.diamonds = 0;
    }
    
    user.diamonds += amount;
    
    // Enregistrer la transaction
    if (!user.diamondTransactions) {
        user.diamondTransactions = [];
    }
    
    user.diamondTransactions.push({
        amount: amount,
        type: type,
        date: new Date().toISOString()
    });
    
    // Mettre à jour dans le localStorage
    localStorage.setItem('bdiamond_users', JSON.stringify(registeredUsers));
    
    // Mettre à jour les récompenses totales
    if (propagationData.referrals[userId]) {
        propagationData.referrals[userId].totalRewards += amount;
    }
    
    // Notification
    showToast('💎 +' + amount + ' diamants !');
}

// ============ PARTAGE MULTI-PLATEFORMES ============
function shareToPlatform(platform, videoId, userId) {
    const video = videos.find(v => v.id === videoId);
    const user = registeredUsers.find(u => u.id === userId);
    
    if (!video || !user) return;
    
    const inviteCode = getInviteCode(userId);
    const videoCaption = video.caption.substring(0, 50) + '...';
    
    const shareMessages = {
        whatsapp: `🎬 Regarde cette vidéo sur B Diamond ! 💎\n\n"${videoCaption}"\n\n📱 Rejoins-moi avec mon code : ${inviteCode}\n🔗 https://bdiamond.app/invite/${inviteCode}`,
        facebook: `Je viens de découvrir B Diamond ! 💎\n\n"${videoCaption}"\n\nRejoins-moi avec mon code : ${inviteCode}`,
        instagram: `Nouvelle app géniale ! 💎 #BDiamond #Viral\n\nMon code d'invitation : ${inviteCode}`,
        twitter: `Découvre B Diamond ! 💎\n\n"${videoCaption}"\n\nCode : ${inviteCode} #BDiamond`,
        sms: `Rejoins-moi sur B Diamond ! 💎 Mon code : ${inviteCode}`,
        email: `Salut !\n\nJe t'invite à rejoindre B Diamond, le nouveau réseau social qui cartonne ! 💎\n\nUtilise mon code d'invitation : ${inviteCode}\n\nÀ bientôt !`,
        qrcode: inviteCode
    };
    
    // Récompenser le partage
    rewardUser(userId, rewardSystem.share, 'share');
    
    // Suivre les partages
    if (!propagationData.shareCounts[userId]) {
        propagationData.shareCounts[userId] = {};
    }
    if (!propagationData.shareCounts[userId][platform]) {
        propagationData.shareCounts[userId][platform] = 0;
    }
    propagationData.shareCounts[userId][platform]++;
    propagationData.totalShares++;
    
    savePropagationData();
    
    // Simuler le partage
    showToast('📤 Partagé sur ' + platform + ' !');
    
    return shareMessages[platform];
}

// ============ CLASSEMENT VIRAL ============
function updateRankings() {
    const rankings = [];
    
    for (const userId in propagationData.referrals) {
        const referral = propagationData.referrals[userId];
        const user = registeredUsers.find(u => u.id === parseInt(userId));
        
        if (user) {
            rankings.push({
                userId: parseInt(userId),
                username: user.username,
                directInvites: referral.directInvites.length,
                cascadeInvites: referral.cascadeInvites.length,
                totalInvites: referral.directInvites.length + referral.cascadeInvites.length,
                totalRewards: referral.totalRewards,
                avatar: user.avatar
            });
        }
    }
    
    // Trier par nombre total d'invitations
    rankings.sort((a, b) => b.totalInvites - a.totalInvites);
    
    // Ajouter les badges
    rankings.forEach((rank, index) => {
        rank.position = index + 1;
        if (index === 0) rank.badge = '👑 Légende';
        else if (index < 10) rank.badge = '⭐ Star';
        else if (index < 100) rank.badge = '🏆 Influenceur';
        else rank.badge = '📣 Ambassadeur';
    });
    
    propagationData.rankings = rankings;
    savePropagationData();
    
    return rankings;
}

// ============ DÉFIS HEBDOMADAIRES ============
function createWeeklyChallenges() {
    const challenges = [
        {
            id: 'invite_3',
            title: 'Invite 3 amis',
            description: 'Invite 3 amis à rejoindre B Diamond',
            reward: 100,
            target: 3,
            type: 'invite',
            day: 'Lundi'
        },
        {
            id: 'share_5',
            title: 'Partage 5 vidéos',
            description: 'Partage 5 vidéos sur les réseaux sociaux',
            reward: 100,
            target: 5,
            type: 'share',
            day: 'Mardi'
        },
        {
            id: 'create_viral',
            title: 'Crée une vidéo virale',
            description: 'Crée une vidéo qui dépasse 1000 vues',
            reward: 200,
            target: 1,
            type: 'viral',
            day: 'Mercredi'
        },
        {
            id: 'comment_10',
            title: 'Commente 10 vidéos',
            description: 'Laisse 10 commentaires sur des vidéos',
            reward: 100,
            target: 10,
            type: 'comment',
            day: 'Jeudi'
        },
        {
            id: 'like_20',
            title: 'Like 20 vidéos',
            description: 'Aime 20 vidéos différentes',
            reward: 100,
            target: 20,
            type: 'like',
            day: 'Vendredi'
        }
    ];
    
    propagationData.challenges = challenges.map(challenge => ({
        ...challenge,
        progress: 0,
        completed: false,
        completedBy: []
    }));
    
    savePropagationData();
    return propagationData.challenges;
}

function updateChallengeProgress(userId, challengeId, progress) {
    const challenge = propagationData.challenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    if (progress >= challenge.target && !challenge.completed) {
        challenge.completed = true;
        rewardUser(userId, challenge.reward, 'challenge');
        showToast('🎉 Défi complété : ' + challenge.title + ' !');
    } else {
        challenge.progress = progress;
    }
    
    savePropagationData();
}

// ============ AUTO-PARTAGE IA ============
function autoShareViralVideos() {
    const viralThreshold = 10; // Score de viralité minimum
    
    videos.forEach(video => {
        const viralityScore = bDiamondAI ? bDiamondAI.predictVirality(video) : 0;
        
        if (viralityScore > viralThreshold && !video.autoShared) {
            const creator = registeredUsers.find(u => u.id === video.userId);
            
            if (creator) {
                // Auto-partage sur les plateformes
                const platforms = ['whatsapp', 'facebook', 'twitter'];
                platforms.forEach(platform => {
                    shareToPlatform(platform, video.id, creator.id);
                });
                
                video.autoShared = true;
                
                // Notification au créateur
                showToast('🤖 IA : Ta vidéo a été auto-partagée !');
            }
        }
    });
    
    localStorage.setItem('bdiamond_videos', JSON.stringify(videos));
}

// ============ CALCUL DU K-FACTOR ============
function calculateKFactor() {
    const totalUsers = registeredUsers.length;
    const totalInvites = propagationData.totalInvites;
    const totalShares = propagationData.totalShares;
    
    // K-factor = invitations réussies / utilisateurs existants
    const kFactor = totalUsers > 0 ? totalInvites / totalUsers : 0;
    
    propagationData.kFactor = kFactor;
    
    // Suivi de la croissance hebdomadaire
    propagationData.weeklyGrowth.push({
        week: new Date().toISOString().split('T')[0],
        users: totalUsers,
        invites: totalInvites,
        shares: totalShares,
        kFactor: kFactor
    });
    
    // Garder seulement les 52 dernières semaines
    if (propagationData.weeklyGrowth.length > 52) {
        propagationData.weeklyGrowth.shift();
    }
    
    savePropagationData();
    
    return {
        kFactor: kFactor,
        totalUsers: totalUsers,
        totalInvites: totalInvites,
        totalShares: totalShares,
        growth: propagationData.weeklyGrowth
    };
}

// ============ MESSAGES D'INVITATION ============
function getInviteMessage(userId, platform) {
    const inviteCode = getInviteCode(userId);
    const user = registeredUsers.find(u => u.id === userId);
    
    if (!user) return '';
    
    const messages = {
        whatsapp: `💎 Rejoins-moi sur B Diamond !\n\nC'est le nouveau réseau social qui cartonne ! 🚀\n\n🎁 Utilise mon code : ${inviteCode}\n🔗 https://bdiamond.app/invite/${inviteCode}\n\nÀ bientôt !`,
        sms: `Rejoins-moi sur B Diamond ! 💎 Mon code : ${inviteCode}`,
        email: `Salut !\n\nJe t'invite à rejoindre B Diamond ! 💎\n\nC'est une application géniale avec :\n- Vidéos courtes\n- IA intelligente\n- Récompenses en diamants\n\nUtilise mon code : ${inviteCode}\n\nÀ bientôt !`
    };
    
    return messages[platform] || messages.whatsapp;
}

// ============ STATISTIQUES DE PROPAGATION ============
function getPropagationStats(userId) {
    const user = registeredUsers.find(u => u.id === userId);
    if (!user) return null;
    
    const referral = propagationData.referrals[userId] || {
        directInvites: [],
        cascadeInvites: [],
        totalRewards: 0
    };
    
    const shareCount = propagationData.shareCounts[userId] || {};
    const totalShares = Object.values(shareCount).reduce((a, b) => a + b, 0);
    
    const ranking = propagationData.rankings.find(r => r.userId === userId);
    
    return {
        inviteCode: getInviteCode(userId),
        inviteLink: getInviteLink(userId),
        directInvites: referral.directInvites.length,
        cascadeInvites: referral.cascadeInvites.length,
        totalRewards: referral.totalRewards,
        diamonds: user.diamonds || 0,
        totalShares: totalShares,
        ranking: ranking ? ranking.position : null,
        badge: ranking ? ranking.badge : null,
        shareCounts: shareCount
    };
}

// ============ SAUVEGARDE ============
function savePropagationData() {
    propagationData.lastUpdate = new Date().toISOString();
    localStorage.setItem('bdiamond_propagation', JSON.stringify(propagationData));
}

// ============ INITIALISATION ============
function initializePropagationSystem() {
    // Créer les défis hebdomadaires s'il n'y en a pas
    if (propagationData.challenges.length === 0) {
        createWeeklyChallenges();
    }
    
    // Mettre à jour le classement
    updateRankings();
    
    // Calculer le K-factor
    calculateKFactor();
    
    // Démarrer l'auto-partage IA
    setInterval(() => {
        autoShareViralVideos();
    }, 300000); // Toutes les 5 minutes
    
    // Mettre à jour le classement toutes les heures
    setInterval(() => {
        updateRankings();
        calculateKFactor();
    }, 3600000); // Toutes les heures
}

// Appeler l'initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    initializePropagationSystem();
});

// ============ FONCTIONS D'INTERFACE ============
function showInvitePage() {
    window.location.href = 'invite.html';
}

function showRankingPage() {
    window.location.href = 'classement.html';
}

function showChallengesPage() {
    window.location.href = 'defis.html';
}

function showRewardsPage() {
    window.location.href = 'recompenses.html';
}

function copyInviteLink(userId) {
    const link = getInviteLink(userId);
    
    // Copier dans le presse-papier
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
            showToast('🔗 Lien copié !');
        }).catch(() => {
            showToast('📋 Lien : ' + link);
        });
    } else {
        showToast('📋 Lien : ' + link);
    }
}

function shareInvite(platform, userId) {
    const message = getInviteMessage(userId, platform);
    
    // Simuler le partage
    showToast('📤 Invitation envoyée sur ' + platform + ' !');
    
    // Récompenser le partage d'invitation
    rewardUser(userId, 5, 'invite_share');
    
    return message;
}