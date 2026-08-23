// ============ B DIAMOND - SYSTÈME DE PARTAGE OBLIGATOIRE ============

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

function hasUserShared(userId) {
    return sharingData.usersWhoShared[userId] && sharingData.usersWhoShared[userId].shared === true;
}

function isBadgeRewardAvailable() {
    return sharingData.badgeRewardsGranted < sharingData.verifiedBadgeRewardLimit;
}

function mustUserShare(userId) {
    if (hasUserShared(userId)) {
        return false;
    }
    return true;
}

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
            return { success: true, badgeRewarded: true };
        }
        
        saveSharingData();
        return { success: true, badgeRewarded: false, message: 'Partage complet !' };
    }
    
    saveSharingData();
    return { success: true, remainingShares: 5 - user.shareCount, shareCount: user.shareCount };
}

function grantVerificationBadge(userId) {
    if (currentUser && currentUser.id === userId) {
        currentUser.verification = { type: 'blue', badge: '💙' };
        localStorage.setItem('bdiamond_current_user', JSON.stringify(currentUser));
    }
    const user = registeredUsers.find(u => u.id === userId);
    if (user) {
        user.verification = { type: 'blue', badge: '💙' };
        localStorage.setItem('bdiamond_users', JSON.stringify(registeredUsers));
    }
}

function saveSharingData() {
    localStorage.setItem('bdiamond_sharing', JSON.stringify(sharingData));
}

// ============ PAGE DE PARTAGE OBLIGATOIRE ============
function showMandatorySharingModal(userId, username) {
    if (!mustUserShare(userId)) {
        return;
    }
    
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
                    <p style="color:#a8a8a8; font-size:0.9rem;">Encore <strong style="color:#FFD700;">${sharingData.verifiedBadgeRewardLimit - sharingData.badgeRewardsGranted}</strong> badges GRATUITS !</p>
                </div>
            ` : ''}
            
            <p style="text-align:center; margin-bottom:15px; color:#FFD700; font-weight:bold;">Progression : <span id="shareProgress">0/5</span></p>
            
            <button onclick="doShare('${shareMessage}', ${userId})" style="width:100%; padding:18px; border-radius:15px; border:none; background:linear-gradient(45deg, #FFD700, #FFA500); color:#000; font-weight:bold; cursor:pointer; font-size:1.2rem;">
                📤 PARTAGER MAINTENANT
            </button>
            
            <p style="text-align:center; margin-top:15px; color:#a8a8a8; font-size:0.8rem;">Clique et choisis WhatsApp, Facebook, ou n'importe quelle app !</p>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ============ PARTAGE UNIVERSEL (fonctionne sur tous les téléphones) ============
async function doShare(message, userId) {
    // Vérifier si le navigateur supporte le partage natif
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'B Diamond 💎',
                text: message,
                url: 'https://blad01-web.github.io/B-Diamon-/'
            });
            
            const result = recordShare(userId, 'native');
            handleShareResult(result);
            showToast('✅ Partage effectué !');
        } catch (error) {
            if (error.name === 'AbortError') {
                showToast('⚠️ Partage annulé');
            } else {
                console.log('⚠️ Erreur partage :', error.message);
                fallbackShare(message, userId);
            }
        }
    } else {
        // Fallback : copier le message
        fallbackShare(message, userId);
    }
}

function fallbackShare(message, userId) {
    // Copier le message dans le presse-papier
    if (navigator.clipboard) {
        navigator.clipboard.writeText(message).then(() => {
            const result = recordShare(userId, 'copy');
            handleShareResult(result);
            showToast('📋 Message copié ! Colle-le dans WhatsApp ou autre.');
        }).catch(() => {
            // Autre fallback : afficher le message
            alert('📤 Copie ce message et partage-le :\n\n' + message);
            const result = recordShare(userId, 'manual');
            handleShareResult(result);
        });
    } else {
        alert('📤 Copie ce message et partage-le :\n\n' + message);
        const result = recordShare(userId, 'manual');
        handleShareResult(result);
    }
}

// ============ GÉRER LE RÉSULTAT ============
function handleShareResult(result) {
    if (result.success) {
        const progressElement = document.getElementById('shareProgress');
        
        if (result.badgeRewarded) {
            showToast('🎉 Badge de Vérification OFFERT ! 💙');
            if (progressElement) progressElement.textContent = '5/5 ✅';
            
            setTimeout(() => {
                const modal = document.getElementById('mandatorySharingModal');
                if (modal) modal.remove();
                showToast('✅ Compte débloqué !');
            }, 2000);
        } else if (result.remainingShares !== undefined) {
            const completed = 5 - result.remainingShares;
            if (progressElement) progressElement.textContent = completed + '/5';
            
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
