// ============ B DIAMOND - SYSTÈME DE SÉCURITÉ COMPLET ============

let securityData = JSON.parse(localStorage.getItem('bdiamond_security')) || initializeSecurity();

function initializeSecurity() {
    return {
        vpnDetection: {
            enabled: true,
            sensitivity: 'high',
            sanctions: ['warning', '24h', '7days', 'permanent'],
            detectedVPNs: [],
            suspendedUsers: [],
            vpnIPs: []
        },
        nudityDetection: {
            enabled: true,
            aiModel: 'image_recognition_v2',
            sanctions: ['remove', '7days', '30days', 'ban'],
            flaggedContent: [],
            removedContent: [],
            suspendedUsers: []
        },
        fakeAccountDetection: {
            enabled: true,
            verificationRequired: true,
            sanctions: ['verify', 'suspend', 'ban'],
            suspiciousAccounts: [],
            suspendedAccounts: [],
            bannedAccounts: []
        },
        notifications: {
            system: [],
            interactions: [],
            messages: [],
            warnings: [],
            rewards: []
        },
        suspendedUsers: [],
        securityLog: []
    };
}

// ============ SYSTÈME DE NOTIFICATIONS ============
function sendNotification(userId, type, message, data = {}) {
    const notification = {
        id: Date.now(),
        userId: userId,
        type: type,
        message: message,
        data: data,
        read: false,
        createdAt: new Date().toISOString()
    };
    
    // Ajouter à la bonne catégorie
    switch(type) {
        case 'system':
            securityData.notifications.system.unshift(notification);
            break;
        case 'interaction':
            securityData.notifications.interactions.unshift(notification);
            break;
        case 'message':
            securityData.notifications.messages.unshift(notification);
            break;
        case 'warning':
            securityData.notifications.warnings.unshift(notification);
            break;
        case 'reward':
            securityData.notifications.rewards.unshift(notification);
            break;
    }
    
    saveSecurityData();
    
    // Afficher le toast si c'est l'utilisateur courant
    if (currentUser && currentUser.id === userId) {
        showToast(message);
    }
    
    return notification;
}

function getUserNotifications(userId) {
    const allNotifications = [];
    
    Object.keys(securityData.notifications).forEach(category => {
        securityData.notifications[category].forEach(notification => {
            if (notification.userId === userId) {
                allNotifications.push({
                    ...notification,
                    category: category
                });
            }
        });
    });
    
    return allNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function markNotificationAsRead(notificationId) {
    Object.keys(securityData.notifications).forEach(category => {
        securityData.notifications[category].forEach(notification => {
            if (notification.id === notificationId) {
                notification.read = true;
            }
        });
    });
    saveSecurityData();
}

function getUnreadCount(userId) {
    let count = 0;
    Object.keys(securityData.notifications).forEach(category => {
        securityData.notifications[category].forEach(notification => {
            if (notification.userId === userId && !notification.read) {
                count++;
            }
        });
    });
    return count;
}

// ============ DÉTECTION VPN ============
function detectVPN(userId, ipAddress = null) {
    if (!securityData.vpnDetection.enabled) return false;
    
    const user = registeredUsers.find(u => u.id === userId);
    if (!user) return false;
    
    // Simuler la détection VPN
    const simulatedIP = ipAddress || generateFakeIP();
    
    // Liste de VPN connus (simulation)
    const knownVPNIPs = [
        '185.220.101.x',
        '104.28.x.x',
        '45.133.x.x',
        '89.187.x.x',
        '198.54.x.x'
    ];
    
    const isVPN = knownVPNIPs.some(vpnIP => {
        const vpnPrefix = vpnIP.split('.x')[0];
        return simulatedIP.startsWith(vpnPrefix);
    });
    
    if (isVPN) {
        // Enregistrer la détection
        const detection = {
            userId: userId,
            username: user.username,
            ip: simulatedIP,
            detectedAt: new Date().toISOString(),
            sanctionLevel: getVPNSanctionLevel(userId)
        };
        
        securityData.vpnDetection.detectedVPNs.push(detection);
        securityData.vpnDetection.vpnIPs.push(simulatedIP);
        
        // Appliquer la sanction
        applyVPNSanction(userId, detection.sanctionLevel);
        
        saveSecurityData();
        logSecurityEvent('vpn_detected', userId, 'VPN détecté : ' + simulatedIP);
        
        return true;
    }
    
    return false;
}

function getVPNSanctionLevel(userId) {
    const userDetections = securityData.vpnDetection.detectedVPNs.filter(d => d.userId === userId);
    return userDetections.length;
}

function applyVPNSanction(userId, level) {
    const user = registeredUsers.find(u => u.id === userId);
    if (!user) return;
    
    const sanctions = securityData.vpnDetection.sanctions;
    const sanction = sanctions[Math.min(level, sanctions.length - 1)];
    
    switch(sanction) {
        case 'warning':
            sendNotification(userId, 'warning', '⚠️ VPN détecté ! Désactivez votre VPN pour continuer.');
            break;
        case '24h':
            suspendUser(userId, 24, 'VPN détecté');
            sendNotification(userId, 'warning', '🚫 Suspension 24h : Utilisation de VPN non autorisée.');
            break;
        case '7days':
            suspendUser(userId, 168, 'VPN détecté (récidive)');
            sendNotification(userId, 'warning', '🚫 Suspension 7 jours : Utilisation répétée de VPN.');
            break;
        case 'permanent':
            banUser(userId, 'VPN détecté (multiple récidives)');
            sendNotification(userId, 'warning', '⛔ Bannissement permanent : VPN.');
            break;
    }
}

// ============ DÉTECTION DE NUDITÉ ============
function detectNudity(videoId) {
    if (!securityData.nudityDetection.enabled) return false;
    
    const video = videos.find(v => v.id === videoId);
    if (!video) return false;
    
    // Simuler la détection IA
    const nudityScore = Math.random() * 100;
    const threshold = 80; // Seuil de détection
    
    if (nudityScore > threshold) {
        const flag = {
            videoId: videoId,
            userId: video.userId,
            score: nudityScore,
            detectedAt: new Date().toISOString(),
            status: 'flagged'
        };
        
        securityData.nudityDetection.flaggedContent.push(flag);
        
        // Supprimer la vidéo
        removeVideo(videoId);
        securityData.nudityDetection.removedContent.push(flag);
        
        // Sanctionner l'utilisateur
        applyNuditySanction(video.userId);
        
        saveSecurityData();
        logSecurityEvent('nudity_detected', video.userId, 'Contenu inapproprié détecté');
        
        return true;
    }
    
    return false;
}

function applyNuditySanction(userId) {
    const user = registeredUsers.find(u => u.id === userId);
    if (!user) return;
    
    const userFlags = securityData.nudityDetection.flaggedContent.filter(f => f.userId === userId);
    const level = userFlags.length;
    
    const sanctions = securityData.nudityDetection.sanctions;
    const sanction = sanctions[Math.min(level - 1, sanctions.length - 1)];
    
    switch(sanction) {
        case 'remove':
            sendNotification(userId, 'warning', '⚠️ Contenu supprimé : Non-respect des règles.');
            break;
        case '7days':
            suspendUser(userId, 168, 'Contenu inapproprié');
            sendNotification(userId, 'warning', '🚫 Suspension 7 jours : Contenu inapproprié.');
            break;
        case '30days':
            suspendUser(userId, 720, 'Contenu inapproprié (récidive)');
            sendNotification(userId, 'warning', '🚫 Suspension 30 jours : Contenu inapproprié répété.');
            break;
        case 'ban':
            banUser(userId, 'Contenu inapproprié (multiple récidives)');
            sendNotification(userId, 'warning', '⛔ Bannissement permanent.');
            break;
    }
}

// ============ DÉTECTION DE FAUX COMPTES ============
function detectFakeAccount(userId) {
    if (!securityData.fakeAccountDetection.enabled) return false;
    
    const user = registeredUsers.find(u => u.id === userId);
    if (!user) return false;
    
    // Critères de détection
    const criteria = {
        noEmail: !user.email,
        noAvatar: !user.avatar || user.avatar.includes('default'),
        recentCreation: user.createdAt && (Date.now() - new Date(user.createdAt).getTime()) < 3600000,
        noActivity: user.followers === 0 && user.likes === 0,
        suspiciousUsername: /^[a-z0-9]{1,3}$/.test(user.username),
        multipleAccounts: checkMultipleAccounts(user)
    };
    
    const suspiciousScore = Object.values(criteria).filter(Boolean).length;
    
    if (suspiciousScore >= 3) {
        const flag = {
            userId: userId,
            username: user.username,
            score: suspiciousScore,
            criteria: criteria,
            detectedAt: new Date().toISOString(),
            status: 'suspicious'
        };
        
        securityData.fakeAccountDetection.suspiciousAccounts.push(flag);
        
        // Appliquer la sanction
        applyFakeAccountSanction(userId, suspiciousScore);
        
        saveSecurityData();
        logSecurityEvent('fake_account_detected', userId, 'Compte suspect détecté');
        
        return true;
    }
    
    return false;
}

function checkMultipleAccounts(user) {
    // Simuler la détection d'IP multiples
    const sameEmail = registeredUsers.filter(u => u.email === user.email && u.id !== user.id);
    return sameEmail.length > 0;
}

function applyFakeAccountSanction(userId, score) {
    const user = registeredUsers.find(u => u.id === userId);
    if (!user) return;
    
    if (score >= 5) {
        banUser(userId, 'Faux compte confirmé');
        sendNotification(userId, 'warning', '⛔ Compte banni : Activité frauduleuse.');
    } else if (score >= 4) {
        suspendUser(userId, 168, 'Compte suspect');
        sendNotification(userId, 'warning', '🚫 Compte suspendu : Vérification requise.');
    } else {
        requireVerification(userId);
        sendNotification(userId, 'warning', '⚠️ Vérification d\'identité requise.');
    }
}

function requireVerification(userId) {
    const user = registeredUsers.find(u => u.id === userId);
    if (user) {
        user.verificationRequired = true;
        localStorage.setItem('bdiamond_users', JSON.stringify(registeredUsers));
    }
}

// ============ SUSPENSION ET BANNISSEMENT ============
function suspendUser(userId, durationHours, reason) {
    const user = registeredUsers.find(u => u.id === userId);
    if (!user) return;
    
    const suspension = {
        userId: userId,
        username: user.username,
        reason: reason,
        suspendedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + durationHours * 3600000).toISOString(),
        durationHours: durationHours
    };
    
    user.suspended = true;
    user.suspensionReason = reason;
    user.suspensionExpires = suspension.expiresAt;
    
    securityData.suspendedUsers.push(suspension);
    
    localStorage.setItem('bdiamond_users', JSON.stringify(registeredUsers));
    saveSecurityData();
    
    logSecurityEvent('user_suspended', userId, reason);
}

function banUser(userId, reason) {
    const user = registeredUsers.find(u => u.id === userId);
    if (!user) return;
    
    user.banned = true;
    user.banReason = reason;
    user.bannedAt = new Date().toISOString();
    
    securityData.fakeAccountDetection.bannedAccounts.push({
        userId: userId,
        username: user.username,
        reason: reason,
        bannedAt: new Date().toISOString()
    });
    
    localStorage.setItem('bdiamond_users', JSON.stringify(registeredUsers));
    saveSecurityData();
    
    logSecurityEvent('user_banned', userId, reason);
}

function checkUserStatus(userId) {
    const user = registeredUsers.find(u => u.id === userId);
    if (!user) return { active: false, reason: 'User not found' };
    
    if (user.banned) {
        return { active: false, reason: user.banReason, banned: true };
    }
    
    if (user.suspended) {
        if (new Date(user.suspensionExpires) < new Date()) {
            // La suspension est terminée
            user.suspended = false;
            user.suspensionReason = null;
            user.suspensionExpires = null;
            localStorage.setItem('bdiamond_users', JSON.stringify(registeredUsers));
            return { active: true };
        }
        return { active: false, reason: user.suspensionReason, suspended: true, expires: user.suspensionExpires };
    }
    
    return { active: true };
}

// ============ SUPPRESSION DE VIDÉO ============
function removeVideo(videoId) {
    const index = videos.findIndex(v => v.id === videoId);
    if (index !== -1) {
        const removedVideo = videos.splice(index, 1)[0];
        localStorage.setItem('bdiamond_videos', JSON.stringify(videos));
        return removedVideo;
    }
    return null;
}

// ============ JOURNAL DE SÉCURITÉ ============
function logSecurityEvent(type, userId, details) {
    securityData.securityLog.unshift({
        type: type,
        userId: userId,
        details: details,
        timestamp: new Date().toISOString()
    });
    saveSecurityData();
}

function getSecurityLog() {
    return securityData.securityLog;
}

// ============ STATISTIQUES DE SÉCURITÉ ============
function getSecurityStats() {
    return {
        vpnDetected: securityData.vpnDetection.detectedVPNs.length,
        vpnSuspended: securityData.vpnDetection.suspendedUsers.length,
        nudityFlagged: securityData.nudityDetection.flaggedContent.length,
        nudityRemoved: securityData.nudityDetection.removedContent.length,
        fakeAccounts: securityData.fakeAccountDetection.suspiciousAccounts.length,
        bannedAccounts: securityData.fakeAccountDetection.bannedAccounts.length,
        totalSuspended: securityData.suspendedUsers.length,
        securityEvents: securityData.securityLog.length
    };
}

// ============ OUTILS ============
function generateFakeIP() {
    return Math.floor(Math.random() * 256) + '.' + 
           Math.floor(Math.random() * 256) + '.' + 
           Math.floor(Math.random() * 256) + '.' + 
           Math.floor(Math.random() * 256);
}

function saveSecurityData() {
    localStorage.setItem('bdiamond_security', JSON.stringify(securityData));
}

// ============ INITIALISATION ============
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier les suspensions expirées
    registeredUsers.forEach(user => {
        if (user.suspended && new Date(user.suspensionExpires) < new Date()) {
            user.suspended = false;
            user.suspensionReason = null;
            user.suspensionExpires = null;
        }
    });
    localStorage.setItem('bdiamond_users', JSON.stringify(registeredUsers));
});