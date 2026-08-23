// ============ B DIAMOND - SYSTÈME DE PARTAGE OBLIGATOIRE INTELLIGENT ============

let sharingData = JSON.parse(localStorage.getItem('bdiamond_sharing')) || initializeSharing();

function initializeSharing() {
    return {
        totalRegisteredUsers: 0,
        verifiedBadgeRewardLimit: 10000,
        usersWhoShared: {},
        sharingHistory: [],
        totalShares: 0,
        badgeRewardsGranted: 0
    };
}

// ============ VÉRIFIER SI L'UTILISATEUR A DÉJÀ PARTAGÉ ============
function hasUserShared(userId) {
    return sharingData.usersWhoShared[userId] && sharingData.usersWhoShared[userId].shared === true;
}

// ============ VÉRIFIER SI LA RÉCOMPENSE BADGE EST ENCORE DISPONIBLE ============
function isBadgeRewardAvailable() {
    return sharingData.badgeRewardsGranted < sharingData.verifiedBadgeRewardLimit;
}

// ============ VÉRIFIER SI L'UTILISATEUR DOIT PARTAGER ============
function mustUserShare(userId) {
    if (hasUserShared(userId)) {
        return false;
    }
    return true;
}

// ============ ENREGISTRER UN NOUVEL UTILISATEUR ============
function registerNewUser(userId, username) {
    sharingData.totalRegisteredUsers++;
    sharingData.usersWhoShared[userId] = {
        username: username,
        shared: false,
        shareCount: 0,
        sharedAt: null,
        badgeRewarded: false,
        registeredAt: new Date().toISOString()
    };
    saveSharingData();
}

// ============ ENREGISTRER LE PARTAGE ============
function recordShare(userId, platform) {
    if (!sharingData.usersWhoShared[userId]) {
        sharingData.usersWhoShared[userId] = {
            username: 'user_' + userId,
            shared: false,
            shareCount: 0,
            sharedAt: null,
            badgeRewarded: false,
            registeredAt: new Date().toISOString()
        };
    }
    
    const user = sharingData.usersWhoShared[userId];
    
    sharingData.sharingHistory.push({
        userId: userId,
        platform: platform,
        sharedAt: new Date().toISOString()
    });
    
    user.shareCount++;
    sharingData.totalShares++;
    
    if (user.shareCount >= 5 && !user.shared) {
        user.shared = true;
        user.sharedAt = new Date().toISOString();
        
        if (isBadgeRewardAvailable() && !user.badgeRewarded) {
            user.badgeRewarded = true;
            sharingData.badgeRewardsGranted++;
            grantVerificationBadge(userId);
            
            saveSharingData();
            return { success: true, badgeRewarded: true, remainingBadges: sharingData.verifiedBadgeRewardLimit - sharingData.badgeRewardsGranted };
        }
        
        saveSharingData();
        return { success: true, badgeRewarded: false, message: 'Partage complet !' };
    }
    
    saveSharingData();
    return { success: true, badgeRewarded: false, remainingShares: 5 - user.shareCount, shareCount: user.shareCount };
}

// ============ ATTRIBUER LE BADGE DE VÉRIFICATION ============
function grantVerificationBadge(userId) {
    if (currentUser && currentUser.id === userId) {
        currentUser.verification = {
            type: 'blue',
            badge: '💙',
            verifiedAt: new Date().toISOString(),
            expiresAt: null,
            source: 'sharing_reward'
        };
        localStorage.setItem('bdiamond_current_user', JSON.stringify(currentUser));
    }
    
    const user = registeredUsers.find(u => u.id === userId);
    if (user) {
        user.verification = {
            type: 'blue',
            badge: '💙',
            verifiedAt: new Date().toISOString(),
            expiresAt: null,
            source: 'sharing_reward'
        };
        localStorage.setItem('bdiamond_users', JSON.stringify(registeredUsers));
    }
    
    if (typeof sendNotification === 'function') {
        sendNotification(userId, 'reward', '💙 Badge de vérification offert !');
    }
}

// ============ OBTENIR LES STATISTIQUES ============
function getSharingStats() {
    return {
        totalUsers: sharingData.totalRegisteredUsers,
        totalShares: sharingData.totalShares,
        badgeRewardsGranted: sharingData.badgeRewardsGranted,
        remainingBadges: sharingData.verifiedBadgeRewardLimit - sharingData.badgeRewardsGranted
    };
}

// ============ SAUVEGARDE ============
function saveSharingData() {
    localStorage.setItem('bdiamond_sharing', JSON.stringify(sharingData));
}

// ============ PAGE DE PARTAGE OBLIGATOIRE ============
function showMandatorySharingModal(userId, username) {
    if (!mustUserShare(userId)) {
        return;
    }
    
    // TON VRAI LIEN
    const shareLink = 'https://blad01-web.github.io/B-Diamon-/';
    const shareMessage = '💎 Rejoins-moi sur B Diamond ! Le nouveau réseau social qui cartonne ! 🚀\n\n📱 Lien : ' + shareLink + '\n\n🎁 Les 10 000 premiers reçoivent un badge de vérification GRATUIT !';
    
    const modal = document.createElement('div');
    modal.id = 'mandatorySharingModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.95);
        z-index: 5000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background:#1a1a1a; border:2px solid #FFD700; border-radius:20px; padding:25px; width:100%; max-width:400px; max-height:90vh; overflow-y:auto;">
            <div style="text-align:center; margin-bottom:20px;">
                <span style="font-size:3rem;">💎</span>
                <h2 style="color:#FFD700; margin:10px 0;">Partage B Diamond !</h2>
                <p style="color:#a8a8a8;">Partage le lien à <strong style="color:#FFD700;">5 contacts</strong> pour débloquer ton compte !</p>
            </div>
            
            ${isBadgeRewardAvailable() ? `
                <div style="background:rgba(255,215,0,0.1); border:1px solid #FFD700; border-radius:10px; padding:15px; margin-bottom:20px; text-align:center;">
                    <p style="color:#FFD700; font-weight:bold;">🎁 RÉCOMPENSE SPÉCIALE</p>
                    <p style="color:#a8a8a8; font-size:0.9rem;">Encore <strong style="color:#FFD700;">${sharingData.verifiedBadgeRewardLimit - sharingData.badgeRewardsGranted}</strong> badges de vérification GRATUITS !</p>
                </div>
            ` : `
                <div style="background:rgba(255,0,0,0.1); border:1px solid #ff0000; border-radius:10px; padding:15px; margin-bottom:20px; text-align:center;">
                    <p style="color:#ff0000; font-weight:bold;">⚠️ LIMITE ATTEINTE</p>
                    <p style="color:#a8a8a8; font-size:0.9rem;">Continue à partager pour débloquer ton compte.</p>
                </div>
            `}
            
            <p style="text-align:center; margin-bottom:15px; color:#FFD700; font-weight:bold;">Progression : <span id="shareProgress">0/5</span></p>
            
            <div style="display:grid; grid-template-columns: repeat(1, 1fr); gap:10px;">
                <button onclick="shareToWhatsAppReal('${shareMessage}', ${userId})" style="padding:15px; border-radius:10px; border:none; background:#25D366; color:#fff; font-weight:bold; cursor:pointer; font-size:1rem;">
                    📱 Partager sur WhatsApp
                </button>
                <button onclick="shareToFacebookReal('${shareLink}', '${shareMessage}', ${userId})" style="padding:15px; border-radius:10px; border:none; background:#1877F2; color:#fff; font-weight:bold; cursor:pointer; font-size:1rem;">
                    📘 Partager sur Facebook
                </button>
                <button onclick="shareToTwitterReal('${shareMessage}', ${userId})" style="padding:15px; border-radius:10px; border:none; background:#1DA1F2; color:#fff; font-weight:bold; cursor:pointer; font-size:1rem;">
                    🐦 Partager sur Twitter/X
                </button>
                <button onclick="shareToSMSText('${shareMessage}', ${userId})" style="padding:15px; border-radius:10px; border:none; background:#FF9800; color:#fff; font-weight:bold; cursor:pointer; font-size:1rem;">
                    💬 Partager par SMS
                </button>
                <button onclick="shareNative('${shareMessage}', ${userId})" style="padding:15px; border-radius:10px; border:none; background:#607D8B; color:#fff; font-weight:bold; cursor:pointer; font-size:1rem;">
                    📤 Autre (Partage natif)
                </button>
            </div>
            
            <p style="text-align:center; margin-top:15px; color:#a8a8a8; font-size:0.8rem;">Chaque partage compte ! Ouvre l'application et partage.</p>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ============ PARTAGE RÉEL VERS WHATSAPP ============
function shareToWhatsAppReal(message, userId) {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = 'https://wa.me/?text=' + encodedMessage;
    
    window.open(whatsappUrl, '_blank');
    
    const result = recordShare(userId, 'whatsapp');
    handleShareResult(result);
    
    showToast('📱 WhatsApp ouvert ! Partage le message à un contact.');
}

// ============ PARTAGE RÉEL VERS FACEBOOK ============
function shareToFacebookReal(link, message, userId) {
    const encodedLink = encodeURIComponent(link);
    const encodedMessage = encodeURIComponent(message);
    const facebookUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodedLink + '&quote=' + encodedMessage;
    
    window.open(facebookUrl, '_blank');
    
    const result = recordShare(userId, 'facebook');
    handleShareResult(result);
    
    showToast('📘 Facebook ouvert ! Partage le message.');
}

// ============ PARTAGE RÉEL VERS TWITTER/X ============
function shareToTwitterReal(message, userId) {
    const encodedMessage = encodeURIComponent(message);
    const twitterUrl = 'https://twitter.com/intent/tweet?text=' + encodedMessage;
    
    window.open(twitterUrl, '_blank');
    
    const result = recordShare(userId, 'twitter');
    handleShareResult(result);
    
    showToast('🐦 Twitter ouvert ! Partage le message.');
}

// ============ PARTAGE RÉEL PAR SMS ============
function shareToSMSText(message, userId) {
    const encodedMessage = encodeURIComponent(message);
    const smsUrl = 'sms:?body=' + encodedMessage;
    
    window.location.href = smsUrl;
    
    const result = recordShare(userId, 'sms');
    handleShareResult(result);
    
    showToast('💬 SMS ouvert ! Partage le message.');
}

// ============ PARTAGE NATIF (Web Share API) ============
async function shareNative(message, userId) {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'B Diamond 💎',
                text: message,
                url: 'https://blad01-web.github.io/B-Diamon-/'
            });
            
            const result = recordShare(userId, 'native');
            handleShareResult(result);
            
            showToast('📤 Partage effectué !');
        } catch (error) {
            console.log('⚠️ Partage annulé :', error.message);
        }
    } else {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(message).then(() => {
                const result = recordShare(userId, 'copy');
                handleShareResult(result);
                showToast('📋 Message copié ! Colle-le dans WhatsApp ou autre.');
            });
        }
    }
}

// ============ GÉRER LE RÉSULTAT DU PARTAGE ============
function handleShareResult(result) {
    if (result.success) {
        const progressElement = document.getElementById('shareProgress');
        
        if (result.badgeRewarded) {
            showToast('🎉 Badge de Vérification OFFERT ! 💙');
            
            if (progressElement) {
                progressElement.textContent = '5/5 ✅';
            }
            
            setTimeout(() => {
                const modal = document.getElementById('mandatorySharingModal');
                if (modal) modal.remove();
                showToast('✅ Compte débloqué !');
            }, 2000);
        } else if (result.remainingShares !== undefined) {
            const completed = 5 - result.remainingShares;
            if (progressElement) {
                progressElement.textContent = completed + '/5';
            }
            
            if (result.remainingShares === 0) {
                showToast('✅ Compte débloqué !');
                setTimeout(() => {
                    const modal = document.getElementById('mandatorySharingModal');
                    if (modal) modal.remove();
                }, 2000);
            } else {
                showToast('📤 Partagé ! Encore ' + result.remainingShares + ' contacts');
            }
        } else if (result.message) {
            showToast(result.message);
            setTimeout(() => {
                const modal = document.getElementById('mandatorySharingModal');
                if (modal) modal.remove();
            }, 2000);
        }
    }
}

// ============ VÉRIFIER AU CHARGEMENT ============
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('bdiamond_current_user');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            if (user && user.id && mustUserShare(user.id)) {
                setTimeout(() => {
                    showMandatorySharingModal(user.id, user.username || 'user');
                }, 1000);
            }
        } catch(e) {
            console.log('⚠️ Erreur partage :', e.message);
        }
    }
});
