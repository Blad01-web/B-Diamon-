// ============ B DIAMOND - SYSTÈME DE RETRAIT PAR PAYS ============

let withdrawalData = JSON.parse(localStorage.getItem('bdiamond_withdrawals')) || initializeWithdrawals();

function initializeWithdrawals() {
    return {
        currencies: {
            'EUR': { symbol: '€', name: 'Euro', rate: 1, countries: ['France', 'Belgique', 'Allemagne', 'Espagne', 'Italie'] },
            'USD': { symbol: '$', name: 'Dollar US', rate: 1.08, countries: ['USA', 'Canada'] },
            'XOF': { symbol: 'CFA', name: 'Franc CFA', rate: 655.96, countries: ['Sénégal', 'Côte d\'Ivoire', 'Cameroun', 'Mali', 'Burkina Faso'] },
            'MAD': { symbol: 'DH', name: 'Dirham Marocain', rate: 10.8, countries: ['Maroc'] },
            'DZD': { symbol: 'DA', name: 'Dinar Algérien', rate: 145, countries: ['Algérie'] },
            'TND': { symbol: 'DT', name: 'Dinar Tunisien', rate: 3.35, countries: ['Tunisie'] },
            'NGN': { symbol: '₦', name: 'Naira Nigérian', rate: 1700, countries: ['Nigeria'] },
            'GHS': { symbol: 'GH₵', name: 'Cedi Ghanéen', rate: 15.5, countries: ['Ghana'] },
            'CNY': { symbol: '¥', name: 'Yuan Chinois', rate: 7.8, countries: ['Chine'] },
            'INR': { symbol: '₹', name: 'Roupie Indienne', rate: 90, countries: ['Inde'] },
            'BRL': { symbol: 'R$', name: 'Real Brésilien', rate: 5.5, countries: ['Brésil'] },
            'RUB': { symbol: '₽', name: 'Rouble Russe', rate: 95, countries: ['Russie'] },
            'CHF': { symbol: 'CHF', name: 'Franc Suisse', rate: 0.95, countries: ['Suisse'] },
            'GBP': { symbol: '£', name: 'Livre Sterling', rate: 0.85, countries: ['Royaume-Uni'] },
            'JPY': { symbol: '¥', name: 'Yen Japonais', rate: 160, countries: ['Japon'] }
        },
        withdrawalMethods: {
            'bank': { name: '🏦 Virement bancaire', minAmount: 10, fee: 1 },
            'mobile_money': { name: '📱 Mobile Money', minAmount: 5, fee: 0.5 },
            'paypal': { name: '💳 PayPal', minAmount: 10, fee: 2 },
            'western_union': { name: '🏧 Western Union', minAmount: 20, fee: 3 },
            'crypto': { name: '🪙 Crypto-monnaie', minAmount: 5, fee: 0.5 }
        },
        withdrawals: [],
        userBalances: {},
        conversionHistory: []
    };
}

// ============ CONVERSION DE DEVISES ============
function convertCurrency(amount, fromCurrency, toCurrency) {
    const from = withdrawalData.currencies[fromCurrency];
    const to = withdrawalData.currencies[toCurrency];
    
    if (!from || !to) return amount;
    
    // Convertir d'abord en EUR puis vers la devise cible
    const amountInEUR = amount / from.rate;
    return amountInEUR * to.rate;
}

function getCurrencyForCountry(country) {
    for (const currencyCode in withdrawalData.currencies) {
        const currency = withdrawalData.currencies[currencyCode];
        if (currency.countries.includes(country)) {
            return currencyCode;
        }
    }
    return 'EUR'; // Par défaut
}

// ============ DEMANDE DE RETRAIT ============
function requestWithdrawal(userId, amount, currency, method) {
    const user = registeredUsers.find(u => u.id === userId);
    if (!user) return { success: false, message: 'Utilisateur non trouvé' };
    
    const userDiamonds = user.diamonds || 0;
    const conversionRate = 0.01; // 1 diamant = 0.01€
    const amountInEUR = amount;
    const diamondsNeeded = Math.ceil(amountInEUR / conversionRate);
    
    if (userDiamonds < diamondsNeeded) {
        return { success: false, message: 'Diamants insuffisants. Il faut ' + diamondsNeeded + ' 💎' };
    }
    
    const withdrawalMethod = withdrawalData.withdrawalMethods[method];
    if (!withdrawalMethod) {
        return { success: false, message: 'Méthode invalide' };
    }
    
    if (amount < withdrawalMethod.minAmount) {
        return { success: false, message: 'Montant minimum : ' + withdrawalMethod.minAmount + '€' };
    }
    
    // Déduire les diamants
    user.diamonds -= diamondsNeeded;
    localStorage.setItem('bdiamond_users', JSON.stringify(registeredUsers));
    
    // Calculer les frais
    const fee = amount * (withdrawalMethod.fee / 100);
    const netAmount = amount - fee;
    
    // Créer le retrait
    const withdrawal = {
        id: Date.now(),
        userId: userId,
        username: user.username,
        amount: amount,
        netAmount: netAmount,
        fee: fee,
        currency: currency,
        method: method,
        methodName: withdrawalMethod.name,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    withdrawalData.withdrawals.push(withdrawal);
    saveWithdrawalData();
    
    // Notification
    if (typeof sendNotification === 'function') {
        sendNotification(userId, 'system', '💸 Demande de retrait de ' + amount + ' ' + currency + ' en cours');
    }
    
    return { success: true, withdrawal: withdrawal, diamondsSpent: diamondsNeeded };
}

// ============ STATISTIQUES DE RETRAIT ============
function getWithdrawalStats(userId) {
    const userWithdrawals = withdrawalData.withdrawals.filter(w => w.userId === userId);
    const totalWithdrawn = userWithdrawals.reduce((sum, w) => sum + w.netAmount, 0);
    const pendingWithdrawals = userWithdrawals.filter(w => w.status === 'pending');
    
    return {
        totalWithdrawals: userWithdrawals.length,
        totalWithdrawn: totalWithdrawn,
        pendingCount: pendingWithdrawals.length,
        pendingAmount: pendingWithdrawals.reduce((sum, w) => sum + w.netAmount, 0)
    };
}

// ============ SAUVEGARDE ============
function saveWithdrawalData() {
    localStorage.setItem('bdiamond_withdrawals', JSON.stringify(withdrawalData));
}