// ============ B DIAMOND - PARTAGE SIMPLE QUI FONCTIONNE ============

let sharingData = JSON.parse(localStorage.getItem('bdiamond_sharing')) || {
    totalRegisteredUsers: 0,
    verifiedBadgeRewardLimit: 10000,
    usersWhoShared: {},
    sharingHistory: [],
    totalShares: 0,
    badgeRewardsGranted: 0
};

function hasUserShared(userId) {
    return sharingData.usersWhoShared[userId] && sharingData.usersWhoShared[userId].shared === true;
}

function isBadgeRewardAvailable() {
    return sharingData.badgeRewardsGranted < sharingData.verifiedBadgeRewardLimit;
}

function mustUserShare(userId) {
    return !hasUserShared(userId);
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
            badgeRewarded: false
        };
    }
    
    const user = sharingData.usersWhoShared[userId];
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
        return { success: true, message: 'Partage complet !' };
    }
    
    saveSharingData();
    return { success: true, remainingShares: 5 - user.shareCount };
}

function grantVerificationBadge(userId) {
    if (currentUser && currentUser.id === userId) {
        currentUser.verification = { type: 'blue', badge: '💙' };
        localStorage.setItem('bdiamond_current_user', JSON.stringify(currentUser));
    }
}

function saveSharingData() {
    localStorage.setItem('bdiamond_sharing', JSON.stringify(sharingData));
}

// ============ PAGE DE PARTAGE ============
function showMandatorySharingModal(userId, username) {
    if (!mustUserShare(userId)) return;
    
    const shareLink = 'https://blad01-web.github.io/B-Diamon-/';
    const shareMessage = '💎 Rejoins-moi sur B Diamond ! 🚀\n📱 Lien : ' + shareLink + '\n🎁 Badge de vérification GRATUIT pour les 10 000 premiers !';
    
    const modal = document.createElement('div');
    modal.id = 'mandatorySharingModal';
    modal.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.95); z-index:5000; display:flex; align-items:center; justify-content:center; padding:20px;';
    
    modal.innerHTML = `
        <div style="background:#1a1a1a; border:2px solid #FFD700; border-radius:20px; padding:25px; width:100%; max-width:400px;">
            <div style="text-align:center; margin-bottom:20px;">
                <span style="font-size:3rem;">💎</span>
                <h2 style="color:#FFD700; margin:10px 0;">Partage B Diamond !</h2>
                <p style="color:#a8a8a8;">Partage à <strong style="color:#FFD700;">5 contacts</strong> pour débloquer !</p>
            </div>
            
            <p style="text-align:center; margin-bottom:15px; color:#FFD700; font-weight:bold;">Progression : <span id="shareProgress">0/5</span></p>
            
            <div style="display:grid; gap:10px;">
                <a href="https://wa.me/?text=${encodeURIComponent(shareMessage)}" target="_blank" onclick="recordShareAndUpdate(${userId})" style="padding:15px; border-radius:10px; background:#25D366; color:#fff; font-weight:bold; text-align:center; text-decoration:none; font-size:1.1rem;">
                    📱 Partager sur WhatsApp
                </a>
                
                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}" target="_blank" onclick="recordShareAndUpdate(${userId})" style="padding:15px; border-radius:10px; background:#1877F2; color:#fff; font-weight:bold; text-align:center; text-decoration:none; font-size:1.1rem;">
                    📘 Partager sur Facebook
                </a>
                
                <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}" target="_blank" onclick="recordShareAndUpdate(${userId})" style="padding:15px; border-radius:10px; background:#1DA1F2; color:#fff; font-weight:bold; text-align:center; text-decoration:none; font-size:1.1rem;">
                    🐦 Partager sur Twitter/X
                </a>
                
                <a href="sms:?body=${encodeURIComponent(shareMessage)}" onclick="recordShareAndUpdate(${userId})" style="padding:15px; border-radius:10px; background:#FF9800; color:#fff; font-weight:bold; text-align:center; text-decoration:none; font-size:1.1rem;">
                    💬 Partager par SMS
                </a>
            </div>
            
            <p style="text-align:center; margin-top:15px; color:#a8a8a8; font-size:0.8rem;">Clique sur un bouton et partage !</p>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ============ ENREGISTRER LE PARTAGE (fonction globale) ============
function recordShareAndUpdate(userId) {
    const result = recordShare(userId, 'social');
    
    const progressElement = document.getElementById('shareProgress');
    
    if (result.badgeRewarded) {
        if (progressElement) progressElement.textContent = '5/5 ✅';
        showToast('🎉 Badge de Vérification OFFERT ! 💙');
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
        } catch(e) {}
    }
});
