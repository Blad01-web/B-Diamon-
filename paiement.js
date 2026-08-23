// ============ B DIAMOND - SYSTÈME DE PAIEMENT UNIVERSEL ============

let paymentData = JSON.parse(localStorage.getItem('bdiamond_payments')) || initializePayments();

function initializePayments() {
    return {
        methods: {
            'france': [
                { id: 'card', name: '💳 Carte bancaire', icon: '💳' },
                { id: 'paypal', name: '🅿️ PayPal', icon: '🅿️' },
                { id: 'bank', name: '🏦 Virement', icon: '🏦' }
            ],
            'senegal': [
                { id: 'orange_money', name: '🟠 Orange Money', icon: '🟠' },
                { id: 'wave', name: '🌊 Wave', icon: '🌊' },
                { id: 'free_money', name: '🔵 Free Money', icon: '🔵' },
                { id: 'card', name: '💳 Carte bancaire', icon: '💳' }
            ],
            'cote_ivoire': [
                { id: 'orange_money', name: '🟠 Orange Money', icon: '🟠' },
                { id: 'mtn_money', name: '🟡 MTN Money', icon: '🟡' },
                { id: 'wave', name: '🌊 Wave', icon: '🌊' },
                { id: 'moov_money', name: '🔵 Moov Money', icon: '🔵' }
            ],
            'maroc': [
                { id: 'card', name: '💳 Carte bancaire', icon: '💳' },
                { id: 'paypal', name: '🅿️ PayPal', icon: '🅿️' },
                { id: 'cashplus', name: '💵 CashPlus', icon: '💵' }
            ],
            'algerie': [
                { id: 'card', name: '💳 Carte CIB', icon: '💳' },
                { id: 'edahabia', name: '🟡 Edahabia', icon: '🟡' }
            ],
            'tunisie': [
                { id: 'card', name: '💳 Carte bancaire', icon: '💳' },
                { id: 'd17', name: '🟠 D17', icon: '🟠' }
            ],
            'rdc': [
                { id: 'm_pesa', name: '🟢 M-Pesa', icon: '🟢' },
                { id: 'airtel_money', name: '🔴 Airtel Money', icon: '🔴' },
                { id: 'orange_money', name: '🟠 Orange Money', icon: '🟠' }
            ],
            'cameroun': [
                { id: 'mtn_money', name: '🟡 MTN Money', icon: '🟡' },
                { id: 'orange_money', name: '🟠 Orange Money', icon: '🟠' }
            ],
            'usa': [
                { id: 'card', name: '💳 Carte bancaire', icon: '💳' },
                { id: 'paypal', name: '🅿️ PayPal', icon: '🅿️' },
                { id: 'venmo', name: '💚 Venmo', icon: '💚' }
            ],
            'default': [
                { id: 'card', name: '💳 Carte bancaire', icon: '💳' },
                { id: 'paypal', name: '🅿️ PayPal', icon: '🅿️' }
            ]
        },
        currencies: {
            'EUR': { symbol: '€', rate: 1 },
            'USD': { symbol: '$', rate: 1.08 },
            'XOF': { symbol: 'CFA', rate: 655.96 },
            'MAD': { symbol: 'DH', rate: 10.8 },
            'DZD': { symbol: 'DA', rate: 145 },
            'TND': { symbol: 'DT', rate: 3.35 },
            'CDF': { symbol: 'FC', rate: 2800 },
            'NGN': { symbol: '₦', rate: 1700 },
            'GHS': { symbol: 'GH₵', rate: 15.5 }
        },
        countryCurrencies: {
            'france': 'EUR',
            'belgique': 'EUR',
            'suisse': 'EUR',
            'senegal': 'XOF',
            'cote_ivoire': 'XOF',
            'cameroun': 'XOF',
            'rdc': 'CDF',
            'maroc': 'MAD',
            'algerie': 'DZD',
            'tunisie': 'TND',
            'usa': 'USD',
            'canada': 'USD',
            'default': 'EUR'
        },
        transactions: []
    };
}

// ============ OBTENIR LES MÉTHODES DE PAIEMENT PAR PAYS ============
function getPaymentMethods(country) {
    const countryKey = country.toLowerCase().replace(/[^a-z]/g, '_');
    return paymentData.methods[countryKey] || paymentData.methods['default'];
}

// ============ OBTENIR LA DEVISE PAR PAYS ============
function getCurrencyForCountry(country) {
    const countryKey = country.toLowerCase().replace(/[^a-z]/g, '_');
    const currencyCode = paymentData.countryCurrencies[countryKey] || 'EUR';
    return paymentData.currencies[currencyCode];
}

// ============ CONVERTIR LE PRIX ============
function convertPrice(amountEUR, country) {
    const currency = getCurrencyForCountry(country);
    const converted = amountEUR * currency.rate;
    return {
        amount: converted,
        symbol: currency.symbol,
        currencyCode: country === 'france' ? 'EUR' : country === 'senegal' ? 'XOF' : 'EUR',
        formatted: currency.symbol + ' ' + converted.toFixed(2)
    };
}

// ============ TRAITER LE PAIEMENT ============
function processPayment(userId, amount, country, methodId, itemName) {
    const methods = getPaymentMethods(country);
    const method = methods.find(m => m.id === methodId);
    
    if (!method) return { success: false, message: 'Méthode invalide' };
    
    const price = convertPrice(amount, country);
    
    // Simuler le traitement selon la méthode
    const result = simulatePayment(method, price);
    
    if (result.success) {
        const transaction = {
            id: Date.now(),
            userId: userId,
            amount: amount,
            convertedAmount: price.amount,
            currency: price.symbol,
            country: country,
            method: methodId,
            methodName: method.name,
            itemName: itemName,
            status: 'completed',
            date: new Date().toISOString()
        };
        
        paymentData.transactions.push(transaction);
        savePayments();
        
        return { 
            success: true, 
            message: '✅ Paiement réussi via ' + method.name + ' - ' + price.formatted,
            transaction: transaction 
        };
    }
    
    return { success: false, message: '❌ Paiement échoué' };
}

// ============ SIMULER LE PAIEMENT SELON LA MÉTHODE ============
function simulatePayment(method, price) {
    if (method.id === 'card') {
        const cardNumber = prompt('💳 Numéro de carte (' + method.name + ') :');
        if (!cardNumber || cardNumber.length < 10) return { success: false };
        
        const expiry = prompt('📅 Date d\'expiration (MM/AA) :');
        if (!expiry) return { success: false };
        
        const cvv = prompt('🔒 CVV (3 chiffres) :');
        if (!cvv || cvv.length !== 3) return { success: false };
        
        return { success: true };
    }
    
    if (method.id === 'paypal') {
        const email = prompt('🅿️ Email PayPal :');
        if (!email || !email.includes('@')) return { success: false };
        
        alert('🅿️ Redirection vers PayPal...\n\nMontant : ' + price.formatted + '\nEmail : ' + email);
        return { success: true };
    }
    
    if (method.id === 'orange_money' || method.id === 'mtn_money' || method.id === 'moov_money' || method.id === 'wave' || method.id === 'free_money' || method.id === 'm_pesa' || method.id === 'airtel_money' || method.id === 'd17' || method.id === 'edahabia' || method.id === 'cashplus' || method.id === 'venmo') {
        const phone = prompt('📱 Numéro de téléphone (' + method.name + ') :');
        if (!phone || phone.length < 8) return { success: false };
        
        const confirm = confirm('🔐 Confirmer le paiement de ' + price.formatted + ' via ' + method.name + ' ?\n\nTéléphone : ' + phone);
        return { success: confirm };
    }
    
    if (method.id === 'bank') {
        alert('🏦 Virement bancaire\n\nMontant : ' + price.formatted + '\n\nUtilisez ces coordonnées :\nIBAN : FR76 0000 0000 0000 0000 0000 000\nBIC : BDIAFRPP');
        return { success: true };
    }
    
    return { success: false };
}

// ============ PAGE DE PAIEMENT HTML ============
function showPaymentModal(itemName, amountEUR, userId, onSuccess) {
    // Créer un modal de paiement
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
        <div style="background:#1a1a1a; border:2px solid #FFD700; border-radius:15px; padding:25px; width:100%; max-width:400px; max-height:90vh; overflow-y:auto;">
            <h3 style="color:#FFD700; text-align:center; margin-bottom:15px;">💳 Paiement</h3>
            <p style="text-align:center; margin-bottom:10px; font-size:1.1rem;">${itemName}</p>
            <p style="text-align:center; margin-bottom:20px; font-size:1.5rem; color:#FFD700; font-weight:bold;">${amountEUR}€</p>
            
            <label style="display:block; margin-bottom:5px;">🌍 Pays :</label>
            <select id="paymentCountry" style="width:100%; padding:12px; border-radius:10px; border:1px solid #333; background:#000; color:#fff; margin-bottom:15px;" onchange="updatePaymentMethods()">
                <option value="france">🇫🇷 France</option>
                <option value="senegal">🇸🇳 Sénégal</option>
                <option value="cote_ivoire">🇨🇮 Côte d'Ivoire</option>
                <option value="cameroun">🇨🇲 Cameroun</option>
                <option value="rdc">🇨🇩 RD Congo</option>
                <option value="maroc">🇲🇦 Maroc</option>
                <option value="algerie">🇩🇿 Algérie</option>
                <option value="tunisie">🇹🇳 Tunisie</option>
                <option value="usa">🇺🇸 USA</option>
                <option value="canada">🇨🇦 Canada</option>
                <option value="belgique">🇧🇪 Belgique</option>
                <option value="suisse">🇨🇭 Suisse</option>
            </select>
            
            <label style="display:block; margin-bottom:5px;">💰 Méthode de paiement :</label>
            <select id="paymentMethod" style="width:100%; padding:12px; border-radius:10px; border:1px solid #333; background:#000; color:#fff; margin-bottom:15px;"></select>
            
            <div id="convertedPrice" style="text-align:center; margin-bottom:15px; color:#a8a8a8; font-size:0.9rem;"></div>
            
            <button class="btn-primary" style="width:100%;" onclick="confirmPayment('${itemName}', ${amountEUR}, ${userId}, '${onSuccess}')">
                💳 Payer
            </button>
            
            <button style="width:100%; padding:10px; margin-top:10px; background:#333; color:#fff; border:none; border-radius:10px; cursor:pointer;" onclick="this.closest('div[style*=\"fixed\"]').remove()">
                Annuler
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialiser les méthodes de paiement
    updatePaymentMethods();
}

function updatePaymentMethods() {
    const country = document.getElementById('paymentCountry').value;
    const methods = getPaymentMethods(country);
    const methodSelect = document.getElementById('paymentMethod');
    
    methodSelect.innerHTML = '';
    methods.forEach(method => {
        const option = document.createElement('option');
        option.value = method.id;
        option.textContent = method.name;
        methodSelect.appendChild(option);
    });
    
    updateConvertedPrice(country);
}

function updateConvertedPrice(country) {
    const amountEUR = 4.99; // Prix de base, à adapter
    const price = convertPrice(amountEUR, country);
    document.getElementById('convertedPrice').textContent = '≈ ' + price.formatted;
}

function confirmPayment(itemName, amountEUR, userId, onSuccess) {
    const country = document.getElementById('paymentCountry').value;
    const methodId = document.getElementById('paymentMethod').value;
    
    const result = processPayment(userId, amountEUR, country, methodId, itemName);
    
    if (result.success) {
        showToast(result.message);
        document.querySelector('div[style*="fixed"]').remove();
        if (onSuccess) {
            window[onSuccess]();
        }
    } else {
        showToast(result.message);
    }
}

// ============ SAUVEGARDE ============
function savePayments() {
    localStorage.setItem('bdiamond_payments', JSON.stringify(paymentData));
}