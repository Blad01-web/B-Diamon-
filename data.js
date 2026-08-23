// ============ B DIAMOND - DONNÉES INITIALES 100% PROPRES ============

const users = [
    {
        id: 1,
        username: "b_diamond_official",
        email: "contact@bdiamond.com",
        password: "123456",
        avatar: "https://i.pravatar.cc/150?img=1",
        bio: "💎 Compte officiel B Diamond - Fondateur",
        followers: 0,
        following: 0,
        likes: 0,
        verified: true,
        verification: { type: 'founder', badge: '👑', verifiedAt: '2024-01-01', expiresAt: null },
        diamonds: 1000000,
        createdAt: "2024-01-01",
        isOnline: true,
        lastSeen: new Date().toISOString(),
        isFounder: true
    }
];

const videos = [];

const hashtags = [
    { name: "💎 diamond", count: "0" },
    { name: "🔥 viral", count: "0" },
    { name: "💃 dance", count: "0" },
    { name: "✨ trend", count: "0" },
    { name: "🎵 music", count: "0" }
];

const comments = [];

const messages = [];

const follows = [];

const sounds = [
    { id: 1, name: "B Diamond - Original Sound", artist: "B Diamond", uses: 0, category: "music" }
];

const categories = [
    { id: 'dance', name: '💃 Danse', count: '0' },
    { id: 'music', name: '🎵 Musique', count: '0' },
    { id: 'comedy', name: '😂 Comédie', count: '0' }
];