// ============ B DIAMOND - SYSTÈME D'INSTALLATION PWA ============

let deferredPrompt = null;
let isInstalled = false;

// Vérifier si l'application est déjà installée
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    isInstalled = true;
}

// Capturer l'événement d'installation
window.addEventListener('beforeinstallprompt', (event) => {
    // Empêcher l'affichage automatique
    event.preventDefault();
    
    // Sauvegarder l'événement
    deferredPrompt = event;
    
    // Afficher le bouton d'installation
    showInstallButton();
});

// Détecter quand l'application est installée
window.addEventListener('appinstalled', () => {
    isInstalled = true;
    deferredPrompt = null;
    
    // Masquer le bouton
    hideInstallButton();
    
    // Notification
    if (typeof showToast === 'function') {
        showToast('✅ B Diamond installé sur votre écran !');
    }
});

// ============ AFFICHER LE BOUTON D'INSTALLATION ============
function showInstallButton() {
    // Ne pas afficher si déjà installé
    if (isInstalled) return;
    
    // Vérifier si le bouton existe déjà
    if (document.getElementById('installButton')) return;
    
    const installButton = document.createElement('div');
    installButton.id = 'installButton';
    installButton.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(45deg, #FFD700, #FFA500);
        color: #000;
        padding: 15px 25px;
        border-radius: 50px;
        font-weight: bold;
        cursor: pointer;
        z-index: 2500;
        box-shadow: 0 5px 20px rgba(255, 215, 0, 0.5);
        display: flex;
        align-items: center;
        gap: 10px;
        animation: bounceIn 0.5s ease;
        border: none;
        font-size: 1rem;
    `;
    
    installButton.innerHTML = `📱 Installer B Diamond`;
    
    installButton.onclick = async () => {
        if (deferredPrompt) {
            // Afficher le prompt d'installation
            deferredPrompt.prompt();
            
            // Attendre la réponse
            const result = await deferredPrompt.userChoice;
            
            if (result.outcome === 'accepted') {
                console.log('✅ Installation acceptée');
                deferredPrompt = null;
                isInstalled = true;
                installButton.remove();
            } else {
                console.log('❌ Installation refusée');
            }
        } else {
            // Fallback : afficher les instructions
            showInstallInstructions();
        }
    };
    
    document.body.appendChild(installButton);
    
    // Masquer après 10 secondes si pas cliqué
    setTimeout(() => {
        if (installButton && installButton.parentNode) {
            installButton.style.opacity = '0.5';
        }
    }, 10000);
}

function hideInstallButton() {
    const installButton = document.getElementById('installButton');
    if (installButton) {
        installButton.remove();
    }
}

// ============ INSTRUCTIONS D'INSTALLATION MANUELLE ============
function showInstallInstructions() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        z-index: 4000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background:#1a1a1a; border:2px solid #FFD700; border-radius:20px; padding:30px; width:100%; max-width:400px; text-align:center;">
            <span style="font-size:3rem;">📱</span>
            <h3 style="color:#FFD700; margin:15px 0;">Installer B Diamond</h3>
            <p style="color:#a8a8a8; margin-bottom:20px;">Suivez ces étapes :</p>
            
            <div style="text-align:left; margin-bottom:20px;">
                <p style="color:#fff; margin-bottom:10px;">📱 <strong>Android (Chrome) :</strong></p>
                <p style="color:#a8a8a8; font-size:0.9rem; margin-bottom:15px;">Menu ⋮ → "Ajouter à l'écran d'accueil"</p>
                
                <p style="color:#fff; margin-bottom:10px;">📱 <strong>iPhone (Safari) :</strong></p>
                <p style="color:#a8a8a8; font-size:0.9rem;">Partager → "Sur l'écran d'accueil"</p>
            </div>
            
            <button onclick="this.closest('div[style*=\"fixed\"]').remove()" style="background:#FFD700; color:#000; border:none; padding:12px 20px; border-radius:25px; cursor:pointer; font-weight:bold; width:100%;">Fermer</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ============ ANIMATION ============
const installStyle = document.createElement('style');
installStyle.textContent = `
    @keyframes bounceIn {
        0% { transform: translateX(-50%) translateY(100px); opacity: 0; }
        60% { transform: translateX(-50%) translateY(-10px); opacity: 1; }
        100% { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
`;
document.head.appendChild(installStyle);

// ============ VÉRIFIER AU CHARGEMENT ============
document.addEventListener('DOMContentLoaded', () => {
    // Si l'application peut être installée, le navigateur déclenche beforeinstallprompt
    // Le bouton s'affichera automatiquement
});