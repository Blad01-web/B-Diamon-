// ============ B DIAMOND - CONFIGURATION SUPABASE ============

const SUPABASE_URL = 'https://suatuvvkdkrkuqcvwxws.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Vvu3kqC1MdqGUq2yZms42A_KWcKHHGN';

// Initialiser le client Supabase
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Vérifier la connexion
console.log('✅ Supabase connecté à :', SUPABASE_URL);

// ============ FONCTIONS D'AUTHENTIFICATION SUPABASE ============

// Inscription avec Supabase
async function supabaseSignUp(email, password, username) {
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                    is_founder: false
                }
            }
        });
        
        if (error) throw error;
        
        // Créer l'utilisateur dans la table users
        if (data.user) {
            const { error: insertError } = await supabaseClient
                .from('users')
                .insert([
                    {
                        username: username,
                        email: email,
                        avatar: 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 70),
                        bio: 'Nouveau sur B Diamond 💎',
                        diamonds: 0,
                        verified: false,
                        is_online: true
                    }
                ]);
            
            if (insertError) {
                console.log('⚠️ Erreur insertion users :', insertError.message);
            }
        }
        
        return { success: true, user: data.user };
    } catch (error) {
        console.error('❌ Erreur inscription :', error.message);
        return { success: false, error: error.message };
    }
}

// Connexion avec Supabase
async function supabaseSignIn(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        // Récupérer les infos de l'utilisateur depuis la table users
        // Utiliser .maybeSingle() au lieu de .single() pour éviter l'erreur
        const { data: userData, error: userError } = await supabaseClient
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();
        
        if (userError) {
            console.log('⚠️ Erreur profil :', userError.message);
        }
        
        return { success: true, user: data.user, profile: userData || null };
    } catch (error) {
        console.error('❌ Erreur connexion :', error.message);
        return { success: false, error: error.message };
    }
}

// Déconnexion
async function supabaseSignOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('❌ Erreur déconnexion :', error.message);
        return { success: false, error: error.message };
    }
}

// Obtenir l'utilisateur actuel
async function getCurrentSupabaseUser() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error) throw error;
        
        if (user) {
            // Utiliser .maybeSingle() au lieu de .single()
            const { data: profile, error: profileError } = await supabaseClient
                .from('users')
                .select('*')
                .eq('email', user.email)
                .maybeSingle();
            
            if (profileError) {
                console.log('⚠️ Profil non trouvé :', profileError.message);
            }
            
            return { user: user, profile: profile || null };
        }
        
        return { user: null, profile: null };
    } catch (error) {
        console.error('❌ Erreur utilisateur :', error.message);
        return { user: null, profile: null };
    }
}

// ============ FONCTIONS DE DONNÉES SUPABASE ============

// Récupérer toutes les vidéos
async function fetchVideosFromSupabase() {
    try {
        const { data, error } = await supabaseClient
            .from('videos')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        
        if (error) throw error;
        return { success: true, videos: data };
    } catch (error) {
        console.error('❌ Erreur vidéos :', error.message);
        return { success: false, videos: [] };
    }
}

// Ajouter une vidéo
async function addVideoToSupabase(videoData) {
    try {
        const { data, error } = await supabaseClient
            .from('videos')
            .insert([videoData])
            .select();
        
        if (error) throw error;
        return { success: true, video: data[0] };
    } catch (error) {
        console.error('❌ Erreur ajout vidéo :', error.message);
        return { success: false, error: error.message };
    }
}

// Liker une vidéo
async function likeVideoInSupabase(userId, videoId) {
    try {
        const { data, error } = await supabaseClient
            .from('likes')
            .insert([{ user_id: userId, video_id: videoId }]);
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('❌ Erreur like :', error.message);
        return { success: false, error: error.message };
    }
}

// Ajouter un commentaire
async function addCommentToSupabase(userId, videoId, content) {
    try {
        const { data, error } = await supabaseClient
            .from('comments')
            .insert([{ user_id: userId, video_id: videoId, content: content }])
            .select();
        
        if (error) throw error;
        return { success: true, comment: data[0] };
    } catch (error) {
        console.error('❌ Erreur commentaire :', error.message);
        return { success: false, error: error.message };
    }
}

// Récupérer les commentaires d'une vidéo
async function fetchCommentsFromSupabase(videoId) {
    try {
        const { data, error } = await supabaseClient
            .from('comments')
            .select('*')
            .eq('video_id', videoId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { success: true, comments: data };
    } catch (error) {
        console.error('❌ Erreur commentaires :', error.message);
        return { success: false, comments: [] };
    }
}

// Suivre un utilisateur
async function followUserInSupabase(followerId, followingId) {
    try {
        const { data, error } = await supabaseClient
            .from('follows')
            .insert([{ follower_id: followerId, following_id: followingId }]);
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('❌ Erreur follow :', error.message);
        return { success: false, error: error.message };
    }
}

// Ne plus suivre un utilisateur
async function unfollowUserInSupabase(followerId, followingId) {
    try {
        const { error } = await supabaseClient
            .from('follows')
            .delete()
            .eq('follower_id', followerId)
            .eq('following_id', followingId);
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('❌ Erreur unfollow :', error.message);
        return { success: false, error: error.message };
    }
}

// Envoyer un message
async function sendMessageInSupabase(fromUserId, toUserId, content) {
    try {
        const { data, error } = await supabaseClient
            .from('messages')
            .insert([{ from_user_id: fromUserId, to_user_id: toUserId, content: content }])
            .select();
        
        if (error) throw error;
        return { success: true, message: data[0] };
    } catch (error) {
        console.error('❌ Erreur message :', error.message);
        return { success: false, error: error.message };
    }
}

// Récupérer les messages entre deux utilisateurs
async function fetchMessagesFromSupabase(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        return { success: true, messages: data };
    } catch (error) {
        console.error('❌ Erreur messages :', error.message);
        return { success: false, messages: [] };
    }
}

// Récupérer tous les utilisateurs
async function fetchUsersFromSupabase() {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
        
        if (error) throw error;
        return { success: true, users: data };
    } catch (error) {
        console.error('❌ Erreur utilisateurs :', error.message);
        return { success: false, users: [] };
    }
}

// Mettre à jour le profil utilisateur
async function updateUserProfileInSupabase(userId, updateData) {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .update(updateData)
            .eq('id', userId)
            .select();
        
        if (error) throw error;
        return { success: true, user: data[0] };
    } catch (error) {
        console.error('❌ Erreur mise à jour profil :', error.message);
        return { success: false, error: error.message };
    }
}

// Récupérer les hashtags
async function fetchHashtagsFromSupabase() {
    try {
        const { data, error } = await supabaseClient
            .from('hashtags')
            .select('*')
            .order('count', { ascending: false });
        
        if (error) throw error;
        return { success: true, hashtags: data };
    } catch (error) {
        console.error('❌ Erreur hashtags :', error.message);
        return { success: false, hashtags: [] };
    }
}

// Créer une notification
async function createNotificationInSupabase(userId, type, message) {
    try {
        const { data, error } = await supabaseClient
            .from('notifications')
            .insert([{ user_id: userId, type: type, message: message }])
            .select();
        
        if (error) throw error;
        return { success: true, notification: data[0] };
    } catch (error) {
        console.error('❌ Erreur notification :', error.message);
        return { success: false, error: error.message };
    }
}

// Récupérer les notifications d'un utilisateur
async function fetchNotificationsFromSupabase(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);
        
        if (error) throw error;
        return { success: true, notifications: data };
    } catch (error) {
        console.error('❌ Erreur notifications :', error.message);
        return { success: false, notifications: [] };
    }
}

// ============ FONCTIONS DE STOCKAGE SUPABASE ============

// Uploader une vidéo
async function uploadVideoToSupabase(file, fileName) {
    try {
        const { data, error } = await supabaseClient.storage
            .from('videos')
            .upload(fileName, file);
        
        if (error) throw error;
        
        const { data: urlData } = supabaseClient.storage
            .from('videos')
            .getPublicUrl(fileName);
        
        return { success: true, url: urlData.publicUrl };
    } catch (error) {
        console.error('❌ Erreur upload vidéo :', error.message);
        return { success: false, error: error.message };
    }
}

// Uploader un avatar
async function uploadAvatarToSupabase(file, fileName) {
    try {
        const { data, error } = await supabaseClient.storage
            .from('avatars')
            .upload(fileName, file);
        
        if (error) throw error;
        
        const { data: urlData } = supabaseClient.storage
            .from('avatars')
            .getPublicUrl(fileName);
        
        return { success: true, url: urlData.publicUrl };
    } catch (error) {
        console.error('❌ Erreur upload avatar :', error.message);
        return { success: false, error: error.message };
    }
}

// ============ VÉRIFICATION DE CONNEXION ============
async function testSupabaseConnection() {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('count', { count: 'exact', head: true });
        
        if (error) throw error;
        
        console.log('✅ Connexion Supabase réussie !');
        return { success: true, message: 'Connexion réussie' };
    } catch (error) {
        console.error('❌ Erreur connexion :', error.message);
        return { success: false, error: error.message };
    }
}

// Tester la connexion au chargement
document.addEventListener('DOMContentLoaded', () => {
    testSupabaseConnection();
});