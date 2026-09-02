// ============================================================
// MUSICSCHOOL — Firebase Config
// Auth réelle (email/password + Google) + Firestore (données persistantes)
//
// SETUP :
// 1. Va sur https://console.firebase.google.com
// 2. Crée un projet "MusicSchool"
// 3. Active Authentication → Email/Password + Google
// 4. Active Firestore Database (mode production)
// 5. Remplace les valeurs ci-dessous par ta config Firebase
// 6. Dans Firestore Rules, colle les règles du bas du fichier
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider,
    EmailAuthProvider,
    linkWithCredential,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile,
    deleteUser
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    arrayUnion,
    serverTimestamp,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
// 🆕 ANALYTICS — le projet avait déjà un measurementId configuré côté
// Firebase console, mais le SDK n'était jamais importé ni initialisé :
// aucun événement ne remontait, l'app tournait sans aucune visibilité
// sur son usage réel (combien d'utilisateurs, quelles leçons, où les
// gens abandonnent...). On active ça maintenant.
import {
    getAnalytics,
    logEvent,
    setUserId,
    setUserProperties
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

// ─────────────────────────────────────────────────────────────
// 🔧 TA CONFIG FIREBASE — À remplir avec tes vraies valeurs
// ─────────────────────────────────────────────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyDs6pThRaeiu8_VQiq5nZoKhYwes8hwKBA",
    authDomain: "musicschool1960.firebaseapp.com",
    projectId: "musicschool1960",
    storageBucket: "musicschool1960.firebasestorage.app",
    messagingSenderId: "414960595906",
    appId: "1:414960595906:web:8f166e2e6e86ad89405c5b",
    measurementId: "G-78V3KQCQ2Y"
};

window._firebaseAuthReady = true; // Empêche initAuth() localStorage de s'exécuter

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'fr'; // 🔧 FIX : les emails Firebase (vérif, reset password) étaient en anglais
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// 🆕 ANALYTICS — initialisation + pont global window._msTrack(), pour
// que script.js puisse envoyer des événements sans avoir à gérer les
// imports Firebase lui-même (il charge en script classique, pas en
// module). getAnalytics peut échouer silencieusement si le navigateur
// bloque les trackers (ex: certains bloqueurs de pub) — on protège donc
// l'appel pour ne jamais casser le reste de l'app dans ce cas.
let analytics = null;
try {
    analytics = getAnalytics(app);
} catch (e) {
    console.warn('Analytics non disponible (bloqueur de pub ?) :', e);
}
window._msTrack = function(eventName, params) {
    if (!analytics) return;
    try {
        logEvent(analytics, eventName, params || {});
    } catch (e) {
        console.warn('Erreur tracking event', eventName, e);
    }
};

// ─────────────────────────────────────────────────────────────
// ÉTAT GLOBAL — remplace les variables localStorage
// ─────────────────────────────────────────────────────────────
window.MS = {
    user: null,          // Firebase Auth user
    profile: null,       // Données Firestore (role, classe, etc.)
    userData: null,      // XP, streak, progression, likes
};

// Cache local pour éviter les lectures Firestore trop fréquentes
let _userDataCache = null;
let _userDataDirty = false;
let _syncTimeout = null;

// ─────────────────────────────────────────────────────────────
// FIRESTORE — Lecture/écriture des données utilisateur
// ─────────────────────────────────────────────────────────────

/**
 * Charge les données utilisateur — VERSION RAPIDE (chargement optimiste)
 *
 * 🔧 FIX (10s de chargement) : avant, on attendait TOUJOURS la réponse de
 * Firestore (jusqu'à 8s de timeout) avant d'afficher quoi que ce soit,
 * même pour un utilisateur qui s'est déjà connecté sur cet appareil et
 * dont on a déjà une copie de ses données en localStorage. Maintenant :
 *  1. Si un cache local existe pour ce compte → on l'utilise IMMÉDIATEMENT
 *     (0ms d'attente perçue), et on relance la vraie lecture Firestore
 *     en arrière-plan pour rafraîchir silencieusement dès qu'elle arrive.
 *  2. Si aucun cache (1ère connexion sur cet appareil) → on doit attendre
 *     Firestore, mais le timeout de sécurité passe de 8s à 4s.
 */
async function loadUserData(uid) {
    const cached = _readLocalCache(uid);
    if (cached) {
        MS.profile = cached.profile;
        MS.userData = cached.userData;
        _userDataCache = { ...MS.userData };
        _syncLegacyStorage();
        // Rafraîchissement Firestore en arrière-plan, sans bloquer l'UI
        _refreshUserDataInBackground(uid);
        return;
    }
    // Pas de cache : on doit attendre Firestore (1ère fois sur cet appareil)
    await _fetchUserDataFromFirestore(uid, 4000);
}

function _readLocalCache(uid) {
    try {
        const profileRaw = localStorage.getItem('ms_profile_' + uid);
        const userDataRaw = localStorage.getItem('ms_userData_' + uid);
        if (!profileRaw && !userDataRaw) return null;
        return {
            profile: profileRaw ? JSON.parse(profileRaw) : null,
            userData: userDataRaw ? JSON.parse(userDataRaw) : null
        };
    } catch (_) {
        return null;
    }
}

/**
 * Relit Firestore en tâche de fond (après affichage instantané du cache) et
 * met à jour l'écran en douceur si des données plus fraîches arrivent.
 */
async function _refreshUserDataInBackground(uid) {
    try {
        // 🔧 FIX (l'app "s'actualise seule" quelques secondes après le
        // démarrage et remet le scroll en haut) : ce rafraîchissement
        // silencieux rappelait showGrades() à CHAQUE lancement de l'app,
        // même quand Firestore renvoyait EXACTEMENT les mêmes données que
        // le cache déjà affiché — reconstruisant tout l'écran pour rien,
        // pile pendant que l'utilisateur commence à scroller. On ne
        // reconstruit l'écran maintenant que si les données ont vraiment
        // changé entre-temps.
        const _beforeProfile = JSON.stringify(MS.profile);
        const _beforeUserData = JSON.stringify(MS.userData);
        await _fetchUserDataFromFirestore(uid, 6000);
        const _changed = JSON.stringify(MS.profile) !== _beforeProfile ||
                          JSON.stringify(MS.userData) !== _beforeUserData;
        // 🔧 FIX (nom "undefined" / progression à 0 tant qu'on n'actualise pas
        // manuellement) : avant, on ne reconstruisait QUE l'écran d'accueil
        // (showGrades) quand les vraies données arrivaient — si l'utilisateur
        // était déjà sur un autre écran (ex: "Mon Profil") juste après
        // connexion, cet écran restait figé avec les données provisoires
        // (avant que Firestore ait confirmé) jusqu'à un rechargement manuel.
        // On reconstruit maintenant l'écran réellement affiché.
        if (_changed && isAuth) {
            const _activeTitle = document.getElementById('section-title')?.innerText || '';
            if (_activeTitle === 'MON PROFIL' && typeof showProfile === 'function') {
                showProfile();
            } else if (typeof showGrades === 'function') {
                showGrades();
            }
        }
    } catch (e) {
        console.warn('Rafraîchissement Firestore en arrière-plan échoué (pas grave, cache local conservé) :', e.message);
    }
}

async function _fetchUserDataFromFirestore(uid, timeoutMs) {
    try {
        // 🔧 FIX : sans timeout, une lecture Firestore lente pouvait bloquer
        // l'app pendant ~1 minute avant d'échouer.
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Firestore timeout (' + timeoutMs + 'ms)')), timeoutMs)
        );
        const [profileSnap, userDataSnap] = await Promise.race([
            Promise.all([
                getDoc(doc(db, "users", uid, "data", "profile")),
                getDoc(doc(db, "users", uid, "data", "userData"))
            ]),
            timeout
        ]);

        MS.profile = profileSnap.exists() ? profileSnap.data() : null;
        MS.userData = userDataSnap.exists() ? userDataSnap.data() : {
            xp: 0,
            streak: 0,
            lastDate: null,
            quizDone: [],
            completedLessons: [],
            likedLessons: [],
            listenHistory: [],
            loginCount: 0
        };
        // Sécurité si un vieux doc Firestore existant n'a pas encore ce champ
        if (!MS.userData.listenHistory) MS.userData.listenHistory = [];

        _userDataCache = { ...MS.userData };

        // 🔧 FIX : le fallback localStorage n'était jamais alimenté, donc en
        // cas de souci réseau il tombait toujours sur du vide. On le met à
        // jour ici à chaque lecture réussie.
        try {
            localStorage.setItem('ms_profile_' + uid, JSON.stringify(MS.profile));
            localStorage.setItem('ms_userData_' + uid, JSON.stringify(MS.userData));
        } catch (_) { /* quota localStorage plein, on ignore */ }

        // 🔧 FIX CRITIQUE (Maths + classe + historique disparus) : script.js
        // (le fichier d'origine, 35000+ lignes) ne lit JAMAIS MS.profile /
        // MS.userData. Il lit directement les vieilles clés localStorage
        // brutes : 'userAccount', 'completedLessons', 'likedLessons',
        // 'xpData', 'ms_listen_history'. Sans ce miroir, ces clés restent
        // vides ou périmées après une connexion Firebase, donc showGrades()
        // (la vraie version, déléguée) retombe sur des valeurs par défaut
        // (classe 'terminale', série 'A') qui filtrent les Mathématiques et
        // n'affichent ni l'historique d'écoute ni les cours terminés.
        _syncLegacyStorage();

        return { profile: MS.profile, userData: MS.userData };
    } catch (e) {
        console.error("Erreur chargement Firestore:", e);
        // Fallback localStorage en cas d'erreur réseau ou de timeout
        return loadFromLocalStorageFallback(uid);
    }
}

/**
 * Sauvegarde les données userData (XP, streak, etc.) avec debounce
 * pour limiter les écritures Firestore
 */
function saveUserData(updates) {
    if (!MS.user) return;

    // Mise à jour locale immédiate
    MS.userData = { ...MS.userData, ...updates };
    _userDataCache = { ...MS.userData };

    // 🔧 FIX : sans ça, un appel à saveXPData/addCompletedLesson/toggleLike
    // mettait à jour Firestore + MS.userData, mais script.js continuait à
    // relire les VIEILLES valeurs depuis localStorage à chaque navigation.
    _syncLegacyStorage();

    // Sauvegarde Firestore avec debounce 2s (évite les écritures excessives)
    _userDataDirty = true;
    clearTimeout(_syncTimeout);
    _syncTimeout = setTimeout(() => {
        if (!_userDataDirty) return;
        _userDataDirty = false;
        try { localStorage.setItem('ms_userData_' + MS.user.uid, JSON.stringify(MS.userData)); } catch (_) {}
        setDoc(
            doc(db, "users", MS.user.uid, "data", "userData"),
            MS.userData,
            { merge: true }
        ).catch(e => console.error("Erreur sauvegarde userData:", e));

        // 🆕 (demandé) : le classement se tenait à jour uniquement si
        // l'utilisateur ouvrait lui-même l'écran "Classement" — un joueur
        // actif mais qui n'y allait jamais restait invisible pour les
        // autres. On met maintenant sa ligne à jour automatiquement à
        // chaque gain d'XP, comme le reste de ses données.
        if (typeof getCurrentLevel === 'function') {
            const _name = (MS.profile && MS.profile.user) || 'Élève';
            setDoc(doc(db, 'leaderboard', MS.user.uid), {
                name: _name,
                xp: MS.userData.xp || 0,
                streak: MS.userData.streak || 0,
                level: getCurrentLevel(MS.userData.xp || 0).label,
                updatedAt: serverTimestamp()
            }, { merge: true }).catch(() => {}); // pas grave si ça échoue, pas bloquant
        }
    }, 2000);
}

/**
 * Sauvegarde le profil utilisateur (role, classe, etc.)
 */
async function saveProfile(profileData) {
    if (!MS.user) return;
    MS.profile = { ...MS.profile, ...profileData };
    try { localStorage.setItem('ms_profile_' + MS.user.uid, JSON.stringify(MS.profile)); } catch (_) {}
    // 🔧 FIX : switchGrade()/changeClasse() appelaient saveProfile() puis
    // showGrades() tout de suite après — mais showGrades() (la vraie,
    // déléguée à script.js) relit 'userAccount' dans localStorage, qui
    // n'était JAMAIS mis à jour ici. Résultat : il fallait sélectionner la
    // classe une 2e fois pour que ça s'affiche enfin correctement.
    _syncLegacyStorage();
    // 🔧 FIX (photo/nom perdus à la déconnexion) : on garde une référence à
    // cet envoi Firestore, même quand l'appelant ne fait pas "await
    // saveProfile(...)" (ex: après upload photo) — voir logout() plus bas.
    const _savePromise = setDoc(
        doc(db, "users", MS.user.uid, "data", "profile"),
        { ...MS.profile, updatedAt: serverTimestamp() },
        { merge: true }
    );
    _pendingProfileSave = _savePromise;
    try {
        await _savePromise;
    } finally {
        if (_pendingProfileSave === _savePromise) _pendingProfileSave = null;
    }
}

/**
 * 🔧 FIX CENTRAL — Miroir Firestore → localStorage "legacy"
 *
 * script.js (le fichier d'origine) ignore complètement MS.profile /
 * MS.userData : il lit/écrit directement dans des clés localStorage brutes
 * ('userAccount', 'completedLessons', 'likedLessons', 'xpData',
 * 'ms_listen_history'). C'est ce décalage entre les deux systèmes qui
 * causait : Mathématiques manquantes (mauvaise série lue par défaut),
 * "obligé de sélectionner la classe" à chaque fois, et historique
 * d'écoute / cours terminés vides après connexion.
 *
 * On appelle cette fonction à chaque fois que MS.profile ou MS.userData
 * changent (après lecture Firestore, après saveProfile, après
 * saveUserData) pour que script.js voie TOUJOURS les bonnes données.
 */
function _syncLegacyStorage() {
    if (!MS.user) return;
    try {
        // 🔧 FIX (chargement lent au démarrage) : on garde une trace du
        // dernier UID connecté sur cet appareil. Au prochain chargement de
        // la page, AVANT même que Firebase confirme la session, on peut
        // afficher directement les données en cache de ce compte — au lieu
        // d'attendre le "Connexion en cours..." qui dépend de la latence du
        // SDK Firebase (souvent 1 à 3s, parfois plus sur réseau lent).
        localStorage.setItem('ms_last_uid', MS.user.uid);
        if (MS.profile) {
            // On fusionne avec l'existant pour ne pas perdre des champs que
            // script.js gère lui-même côté localStorage (ex: 'pass').
            const existing = JSON.parse(localStorage.getItem('userAccount') || '{}');
            const merged = { ...existing, ...MS.profile };
            localStorage.setItem('userAccount', JSON.stringify(merged));
            // 🔧 FIX (photo de profil pas synchronisée avec le compte) :
            // avant, la photo uploadée par l'utilisateur restait UNIQUEMENT
            // dans le localStorage de l'appareil (jamais envoyée à
            // Firestore) — changement d'appareil ou cache vidé = photo
            // perdue, alors que le compte et la progression restaient
            // intacts. On la stocke maintenant aussi dans le profil
            // Firestore (champ `customPhoto`, voir window._saveProfilePhoto
            // dans script.js), et on la remiroir ici vers la clé locale
            // 'profilePhoto' que le reste de l'app sait déjà afficher.
            if (MS.profile.customPhoto) {
                localStorage.setItem('profilePhoto', MS.profile.customPhoto);
            } else if (MS.user && MS.user.photoURL) {
                // Pas de photo uploadée à la main → on utilise la photo du
                // compte Google par défaut, comme le ferait n'importe quelle
                // app "normale" avec connexion Google.
                localStorage.setItem('profilePhoto', MS.user.photoURL);
            }
        }
        if (MS.userData) {
            localStorage.setItem('completedLessons', JSON.stringify(MS.userData.completedLessons || []));
            localStorage.setItem('likedLessons', JSON.stringify(MS.userData.likedLessons || []));
            localStorage.setItem('ms_listen_history', JSON.stringify(MS.userData.listenHistory || []));
            localStorage.setItem('xpData', JSON.stringify({
                xp: MS.userData.xp || 0,
                streak: MS.userData.streak || 0,
                lastDate: MS.userData.lastDate || null,
                quizDone: MS.userData.quizDone || []
            }));
        }
    } catch (_) { /* localStorage indisponible/plein, on ignore */ }

    // 🔧 FIX (photo/avatar pas à jour sans rafraîchissement manuel) :
    // centralisé ici plutôt que rappelé à la main après chaque connexion/
    // sync — _syncLegacyStorage() est LE point de passage unique à chaque
    // fois que le profil change (connexion, upload photo, changement de
    // classe...), donc l'avatar du header reste toujours à jour sans
    // dépendre qu'on ait pensé à l'appeler à chaque nouvel endroit.
    if (typeof window.updateHeaderAvatar === 'function') {
        try { window.updateHeaderAvatar(); } catch (_) {}
    }
}

/**
 * ── Système de parrainage ──────────────────────────────────────
 * Chaque compte a un code fixe (les 6 derniers caractères de son
 * uid, déjà utilisé par script.js pour l'afficher). On stocke la
 * correspondance code → uid dans une collection Firestore séparée
 * `referralCodes/{code}`, lisible par tous mais dont le champ `uid`
 * ne peut être défini qu'une fois par son propriétaire (voir règles
 * Firestore à ajouter, données à part).
 *
 * Pourquoi le parrain n'est pas crédité immédiatement : au moment où
 * le filleul s'inscrit, il est connecté avec SON compte à lui — les
 * règles Firestore (request.auth.uid == userId) empêchent d'écrire
 * dans les données d'un autre compte. On dépose donc la récompense
 * du parrain dans le document partagé `referralCodes/{code}`
 * (champ `pendingXP`), et le parrain la récupère tout seul (avec ses
 * propres droits d'écriture) à sa prochaine connexion.
 */
const REFERRAL_REWARD_NEW_USER = 750;
const REFERRAL_REWARD_REFERRER = 750;

function _myReferralCode() {
    return MS.user ? MS.user.uid.slice(-6).toUpperCase() : null;
}

/**
 * Crée (une fois) la fiche référencant le code de l'utilisateur
 * connecté, pour que d'autres puissent le retrouver à l'inscription.
 */
async function _ensureMyReferralCode() {
    if (!MS.user) return;
    const code = _myReferralCode();
    try {
        await setDoc(doc(db, 'referralCodes', code), { uid: MS.user.uid }, { merge: true });
    } catch (e) {
        console.warn('Impossible de déposer le code parrain (pas grave) :', e.message);
    }
}

/**
 * Appelé une fois à l'inscription si un code parrain a été saisi.
 * Récompense IMMÉDIATEMENT le nouvel inscrit, et dépose la
 * récompense du parrain dans le document partagé (récupérée par lui
 * à sa prochaine connexion — voir _claimPendingReferralXP).
 */
async function _processReferral() {
    if (!MS.user || !MS.profile) return;
    if (MS.userData && MS.userData.referralApplied) return; // déjà fait, jamais 2 fois
    const code = MS.profile.referredBy;
    if (!code) return;

    try {
        const snap = await getDoc(doc(db, 'referralCodes', code));
        if (!snap.exists()) { showToast("⚠️ Code parrain invalide."); return; }
        const referrerUid = snap.data().uid;
        if (referrerUid === MS.user.uid) return; // pas d'auto-parrainage

        // Récompense immédiate pour le nouvel inscrit (écriture sur SON
        // propre compte — toujours autorisée)
        if (typeof awardXP === 'function') awardXP(REFERRAL_REWARD_NEW_USER, 'Code parrain');
        await saveUserData({ referralApplied: true });

        // Récompense du parrain déposée en attente (écriture sur le
        // document partagé referralCodes, pas sur le compte du parrain)
        const currentPending = snap.data().pendingXP || 0;
        await setDoc(doc(db, 'referralCodes', code),
            { uid: referrerUid, pendingXP: currentPending + REFERRAL_REWARD_REFERRER },
            { merge: true });
    } catch (e) {
        console.warn('Parrainage : erreur non bloquante —', e.message);
    }
}

/**
 * Appelé à chaque connexion : si des XP de parrainage attendent
 * d'être réclamées (des amis se sont inscrits avec mon code), je me
 * les crédite moi-même (écriture sur mon propre document, toujours
 * autorisée).
 */
async function _claimPendingReferralXP() {
    if (!MS.user) return;
    const code = _myReferralCode();
    try {
        const snap = await getDoc(doc(db, 'referralCodes', code));
        if (!snap.exists()) return;
        const pending = snap.data().pendingXP || 0;
        if (pending <= 0) return;
        if (typeof awardXP === 'function') awardXP(pending, `${Math.round(pending / REFERRAL_REWARD_REFERRER)} ami(s) parrainé(s)`);
        await setDoc(doc(db, 'referralCodes', code), { uid: MS.user.uid, pendingXP: 0 }, { merge: true });
    } catch (e) {
        console.warn('Réclamation parrainage : erreur non bloquante —', e.message);
    }
}

/**
 * Fallback localStorage si Firestore indisponible
 */
function loadFromLocalStorageFallback(uid) {
    const profile = JSON.parse(localStorage.getItem('ms_profile_' + uid) || 'null');
    const userData = JSON.parse(localStorage.getItem('ms_userData_' + uid) || 'null') || {
        xp: 0, streak: 0, lastDate: null, quizDone: [],
        completedLessons: [], likedLessons: [], listenHistory: [], loginCount: 0
    };
    if (!userData.listenHistory) userData.listenHistory = [];
    MS.profile = profile;
    MS.userData = userData;
    _syncLegacyStorage();
    return { profile, userData };
}

// ─────────────────────────────────────────────────────────────
// AUTH — Remplace les fonctions du script original
// ─────────────────────────────────────────────────────────────

let _authListenerSet = false; // évite d'empiler plusieurs onAuthStateChanged
let _signupInProgress = false; // 🔧 voir handleAuth() plus bas — évite la course signOut/showLanding
let _optimisticRenderedUid = null; // 🔧 voir initAuth() — évite le double showGrades()
// 🔧 FIX (photo/nom perdus à la déconnexion) : saveProfile() lance son envoi
// Firestore SANS que l'appelant l'attende toujours (ex: après upload photo).
// Si l'utilisateur clique "Déconnexion" pendant que cet envoi est encore en
// vol, signOut()+location.reload() l'interrompent avant qu'il n'atteigne le
// serveur. On garde ici une référence à la sauvegarde en cours pour que
// logout() puisse l'attendre avant de couper la session.
let _pendingProfileSave = null;

/**
 * Initialisation — remplace initAuth()
 * Écoute l'état de connexion Firebase en temps réel
 */
function initAuth() {
    // 🔧 FIX : showSplash() peut appeler son callback onDone() deux fois
    // (filet de sécurité réseau lent) → sans cette garde, ça empilait un
    // 2ème onAuthStateChanged à chaque refresh lent, causant des rendus
    // en double et des états incohérents (écran vide après reselection).
    if (_authListenerSet) return;
    _authListenerSet = true;

    // 🔧 FIX MAJEUR (chargement de ~10s perçu par l'utilisateur) :
    // Avant, on attendait TOUJOURS qu'onAuthStateChanged confirme la
    // session (ce qui dépend de Firebase, 1-5s+ selon le réseau) avant
    // d'afficher quoi que ce soit — d'où le "Connexion en cours..." qui
    // traînait. Maintenant : si on a une trace d'un compte déjà connecté
    // sur CET appareil (ms_last_uid), on affiche directement ses données
    // en cache, IMMÉDIATEMENT, sans attendre Firebase du tout.
    // Si jamais Firebase dit ensuite "pas connecté" (session expirée,
    // déconnexion sur un autre appareil...), on bascule proprement vers
    // l'écran de connexion à ce moment-là seulement.
    const lastUid = localStorage.getItem('ms_last_uid');
    if (lastUid) {
        const cached = _readLocalCache(lastUid);
        if (cached && cached.profile) {
            MS.profile = cached.profile;
            MS.userData = cached.userData || {
                xp: 0, streak: 0, lastDate: null, quizDone: [],
                completedLessons: [], likedLessons: [], listenHistory: [], loginCount: 0
            };
            _userDataCache = { ...MS.userData };
            _syncLegacyStorage();
            isAuth = true;
            // 🔧 FIX (l'app "s'actualise seule" et remet en haut du scroll
            // quelques secondes après le démarrage) : on retient ici QUEL
            // uid vient d'être affiché en optimiste, pour que la
            // confirmation Firebase plus bas (onAuthStateChanged) ne
            // reconstruise pas tout l'écran une 2e fois pour rien.
            _optimisticRenderedUid = lastUid;
            if (typeof showGrades === 'function') showGrades();
            if (typeof initFloatingBubble === 'function') initFloatingBubble();
        }
    }

    // 🔧 FIX : tant que Firebase n'a pas confirmé l'état de connexion
    // (ça peut prendre 1-3s après un refresh), on affiche un loader au
    // lieu de laisser main-grid vide → c'est ce qui causait l'écran
    // "logo seul" après actualisation. (Ne s'affiche que si on n'a pas pu
    // faire le rendu optimiste ci-dessus, càd 1ère connexion sur l'appareil.)
    const grid = document.getElementById('main-grid');
    if (grid && !grid.innerHTML.trim()) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;color:#555;">
                <div style="width:34px;height:34px;border:3px solid #2a2a2a;border-top-color:#8a2be2;border-radius:50%;animation:msSpin 0.8s linear infinite;margin-bottom:16px;"></div>
                <div style="font-size:0.8rem;font-weight:700;letter-spacing:0.5px;">Connexion en cours...</div>
            </div>
            <style>@keyframes msSpin{to{transform:rotate(360deg);}}</style>`;
    }

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // 🔧 FIX : un compte Google a déjà un email vérifié PAR Google —
            // cette étape ne devrait jamais lui être demandée. Mais
            // completeGoogleProfile() lie ensuite un mot de passe au compte
            // (linkWithCredential), et juste après, ce contrôle pouvait
            // encore tomber sur emailVerified=false (état pas encore
            // rafraîchi côté client à ce moment précis) — un nouveau compte
            // Google se retrouvait donc bloqué sur "Vérifie ton email !",
            // alors que rien n'a jamais été envoyé nulle part pour lui.
            const _isGoogleAccount = user.providerData.some(p => p.providerId === 'google.com');
            // ✅ Bloquer l'accès si email non vérifié (comptes email/mdp uniquement)
            if (!_isGoogleAccount && !user.emailVerified) {
                // 🔧 FIX : pendant l'inscription, handleAuth() gère déjà lui-même
                // le signOut + l'écran de vérification. Si on le refait ici en
                // même temps, les deux signOut() se chevauchent et la 2ème
                // notification (user = null) écrasait l'écran de vérification
                // avec showLanding() → c'est ce qui causait "ça reste pareil
                // même en actualisant" après une inscription.
                if (_signupInProgress) return;
                // 🔧 FIX (retour en boucle à la connexion) : avant, on appelait
                // signOut(auth) ICI. Mais ensuite auth.currentUser devenait
                // null, donc "Renvoyer le mail" (resendVerifEmail) et le bouton
                // "J'ai vérifié" ne pouvaient plus rien faire — ils renvoyaient
                // systématiquement vers l'écran de connexion, même juste après
                // avoir cliqué le lien reçu par email. On garde maintenant la
                // session active (elle ne donne accès à rien de plus : les
                // règles Firestore exigent déjà request.auth != null, pas
                // emailVerified, donc ça ne change rien côté sécurité) pour que
                // ces deux boutons fonctionnent enfin.
                _showEmailVerifScreen(user.email);
                return;
            }

            MS.user = user;
            await loadUserData(user.uid);

            // 🆕 ANALYTICS : relier les événements à cet utilisateur (via son
            // uid Firebase, jamais son email) pour pouvoir suivre un même
            // utilisateur à travers ses sessions, sans exposer de donnée
            // personnelle identifiable dans les rapports Analytics.
            if (analytics) {
                try { setUserId(analytics, user.uid); } catch (e) {}
            }

            // 🔧 FIX CRITIQUE : avant, on créait un profil par défaut dès que
            // MS.profile était vide — mais MS.profile peut être vide pour
            // DEUX raisons très différentes :
            //  1. C'est vraiment un nouveau compte (1ère connexion Google) → OK de créer un profil par défaut
            //  2. Firestore a juste été lent/en erreur (réseau) → le compte EXISTE déjà,
            //     mais on n'a pas réussi à lire son vrai profil à temps.
            // Dans le 2e cas, créer un profil par défaut écrasait le classe/série
            // réel de l'utilisateur (→ Mathématiques et l'historique disparaissaient).
            // On utilise les métadonnées Firebase pour ne JAMAIS confondre les deux cas.
            const isBrandNewAccount = user.metadata?.creationTime === user.metadata?.lastSignInTime;
            const providerId = user.providerData?.[0]?.providerId || 'password';

            if (!MS.profile && isBrandNewAccount) {
                if (providerId === 'google.com') {
                    // 🔧 FIX (inscription) : Google ne fournit que l'email et
                    // parfois un nom — pas de rôle, classe, série ou pays.
                    // Avant, on créait direct un profil par défaut (Élève,
                    // Terminale) sans rien demander. On sauvegarde maintenant
                    // un profil MINIMAL (juste pour éviter de re-déclencher ce
                    // bloc en boucle) marqué `profileIncomplete`, et on affiche
                    // un écran qui demande les infos manquantes avant de
                    // laisser entrer dans l'app.
                    await saveProfile({
                        user: user.displayName || (user.email ? user.email.split('@')[0] : 'Utilisateur'),
                        email: user.email,
                        provider: providerId,
                        profileIncomplete: true,
                        createdAt: serverTimestamp()
                    });
                    isAuth = true;
                    _showCompleteProfileScreen(user);
                    return; // on attend que l'utilisateur termine son profil
                }
                await saveProfile({
                    user: user.displayName || (user.email ? user.email.split('@')[0] : 'Utilisateur'),
                    email: user.email,
                    role: 'eleve',
                    classe: 'terminale',
                    provider: providerId,
                    tourSeen: false,
                    createdAt: serverTimestamp()
                });
            } else if (!MS.profile && !isBrandNewAccount) {
                // Compte existant mais profil introuvable/non chargé → on retente
                // une fois avant d'abandonner, plutôt que d'écraser quoi que ce soit.
                console.warn("Profil introuvable pour un compte existant, nouvelle tentative...");
                await loadUserData(user.uid);
            }

            // 🔧 FIX : si l'utilisateur a fermé l'app pendant l'étape
            // "complète ton profil" (Google), on la lui remontre à la
            // prochaine connexion plutôt que de le laisser entrer avec un
            // profil à moitié vide.
            if (MS.profile && MS.profile.profileIncomplete) {
                isAuth = true;
                _showCompleteProfileScreen(user);
                return;
            }

            isAuth = true;

            // 🆕 ANALYTICS : segmenter les rapports par rôle et classe, pour
            // pouvoir un jour répondre à des questions comme "les élèves de
            // Terminale D utilisent-ils l'app différemment des Terminale A ?"
            if (analytics && MS.profile) {
                try {
                    setUserProperties(analytics, {
                        role: MS.profile.role || 'inconnu',
                        classe: MS.profile.classe || 'inconnue'
                    });
                } catch (e) {}
            }

            // Supprimer l'écran auth si présent
            const container = document.getElementById('auth-container');
            if (container) container.innerHTML = '';

            // 🔧 FIX (rafraîchissement intempestif + scroll qui remonte) :
            // si on a déjà affiché ces mêmes données en optimiste au tout
            // début de initAuth() (cache local, même uid), refaire
            // showGrades() ici ne change rien à l'écran — ça ne fait que
            // le reconstruire en plein milieu de la lecture/du scroll de
            // l'utilisateur, quelques secondes après le démarrage (le
            // temps que Firebase confirme la session sur le réseau). Les
            // données fraîches sont déjà en mémoire (loadUserData vient
            // de tourner) : elles s'appliqueront naturellement à la
            // prochaine navigation, pas besoin de forcer un rendu ici.
            if (_optimisticRenderedUid !== user.uid) {
                showGrades();
            }
            _optimisticRenderedUid = user.uid;
            initFloatingBubble();
            // 🔧 Guide de l'app pour les nouveaux utilisateurs — affiché une
            // seule fois par compte, juste après sa toute première arrivée
            // sur l'écran principal (tourSeen mis à true dès l'affichage
            // pour ne jamais revenir en boucle, y compris si l'app est
            // fermée en plein milieu du guide).
            if (MS.profile && MS.profile.tourSeen === false) {
                MS.profile.tourSeen = true;
                saveProfile({ tourSeen: true }).catch(() => {});
                if (typeof showOnboarding === 'function') showOnboarding();
            }
            // 🔧 FIX : le bouton IA est maintenant créé ici (après connexion)
            // et non plus au démarrage de l'app — il ne s'affiche donc plus
            // sur l'écran de connexion.
            if (typeof initAIButton === 'function') initAIButton();

            // 🎁 Parrainage : dépose mon code s'il n'existe pas encore, encaisse
            // les XP en attente laissées par des filleuls, et applique le code
            // que j'ai moi-même saisi si ce n'est pas déjà fait (inscription
            // Google → complète directement ; sinon, filet de sécurité ici).
            // 🔧 FIX (email "undefined" dans les paramètres) : l'inscription
            // Google n'enregistrait jamais l'email dans le profil. Pour les
            // comptes déjà créés avant ce correctif, on le complète tout
            // seul ici dès qu'on le détecte manquant.
            if (MS.profile && !MS.profile.email && user.email) {
                saveProfile({ email: user.email });
            }

            // 🔧 FIX (lenteur au chargement) : ces vérifications tournaient à
            // CHAQUE connexion, ajoutant du trafic réseau juste au moment où
            // le reste de l'app charge déjà (cours, images...). L'essentiel
            // (récupérer des XP en attente) n'a pas besoin d'être vérifié
            // plus d'une fois par jour — on limite donc à ça, sauf pour
            // l'application d'un code fraîchement saisi à l'inscription
            // (_processReferral), qui doit rester immédiate.
            const _todayStr = new Date().toDateString();
            const _refCheckKey = 'ms_referral_check_date';
            if (localStorage.getItem(_refCheckKey) !== _todayStr) {
                localStorage.setItem(_refCheckKey, _todayStr);
                _ensureMyReferralCode();
                _claimPendingReferralXP();
            }
            if (MS.profile && MS.profile.referredBy && !(MS.userData && MS.userData.referralApplied)) {
                _processReferral();
            }

            // 🆕 (demandé) : entrée automatique dans le classement dès la
            // connexion, même à 0 XP — pour que le joueur soit "en
            // compétition" dès que son compte est actif, pas seulement une
            // fois qu'il a ouvert l'écran Classement au moins une fois.
            if (typeof getCurrentLevel === 'function' && MS.userData) {
                setDoc(doc(db, 'leaderboard', user.uid), {
                    name: (MS.profile && MS.profile.user) || 'Élève',
                    xp: MS.userData.xp || 0,
                    streak: MS.userData.streak || 0,
                    level: getCurrentLevel(MS.userData.xp || 0).label,
                    updatedAt: serverTimestamp()
                }, { merge: true }).catch(() => {});
            }

            // 🆕 (demandé) : bonus de connexion quotidien — +10 XP la
            // première fois qu'on se connecte un jour donné, tout seul,
            // sans action à faire.
            const _loginBonusKey = 'ms_daily_login_' + user.uid;
            const _todayLogin = new Date().toDateString();
            if (localStorage.getItem(_loginBonusKey) !== _todayLogin) {
                localStorage.setItem(_loginBonusKey, _todayLogin);
                if (typeof awardXP === 'function') {
                    setTimeout(() => awardXP(10, '🌅 Bonus de connexion'), 800);
                }
            }

            // 🆕 (demandé) : bannière "Nouveautés" — après le bonus, pour ne
            // pas empiler les popups d'un coup.
            if (typeof checkAppAnnouncements === 'function') {
                setTimeout(checkAppAnnouncements, 1800);
            }
        } else {
            MS.user = null;
            MS.profile = null;
            MS.userData = null;
            isAuth = false;
            // 🔧 FIX : on vide le contenu de l'écran Matières à la
            // déconnexion, pour éviter tout risque de superposition visuelle
            // avec l'écran de connexion qui s'affiche juste après.
            const grid = document.getElementById('main-grid');
            if (grid) grid.innerHTML = '';
            // 🔧 FIX : supprimer aussi le bouton IA à la déconnexion
            const aiBtn = document.getElementById('ai-float-btn');
            if (aiBtn) aiBtn.remove();
            if (_signupInProgress) return;
            showLanding();
        }
    });
}

/**
 * Récupère le résultat d'une connexion Google par redirection.
 * 🔧 FIX : signInWithPopup ne fonctionne presque jamais de façon fiable
 * sur Android (popup bloquée par le navigateur/PWA, ou fermée par le
 * système avant la fin de l'échange) → c'était la cause du "rien ne se
 * passe, retour à l'inscription" après avoir choisi le compte Gmail.
 * signInWithRedirect quitte la page puis revient ; ce bloc récupère le
 * résultat au rechargement. onAuthStateChanged (dans initAuth) prend le
 * relais pour afficher le menu une fois l'utilisateur confirmé.
 */
getRedirectResult(auth).catch((e) => {
    if (e.code && e.code !== 'auth/popup-closed-by-user') {
        console.error('Erreur retour connexion Google:', e.code, e);
        showToast('Erreur de connexion Google : ' + _firebaseErrMsg(e.code));
    }
});

/**
 * Inscription email/password — remplace handleAuth('signup')
 */
async function handleAuth(type) {
    if (type === 'signup') {
        const user    = document.getElementById('auth-user')?.value.trim();
        const email   = document.getElementById('auth-email')?.value.trim();
        const pass    = document.getElementById('auth-pass')?.value;
        const role    = document.getElementById('auth-role')?.value;
        const classe  = document.getElementById('auth-classe')?.value;

        // Validations
        if (!user || !email || !pass) return _authAlert("Remplis tous les champs !");
        if (!email.includes('@') || !email.includes('.')) return _authAlert("Adresse email invalide !");
        if (pass.length < 6) return _authAlert("Mot de passe trop court (6 caractères min).");
        if (!role) return _authAlert("Choisis ton profil (Élève, Parent, Prof ou Autre) !");
        if (role === 'eleve' && !classe) return _authAlert("Choisis ta classe !");

        _setAuthBtnLoading(true);
        _signupInProgress = true; // 🔧 voir onAuthStateChanged plus haut
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, pass);
            await updateProfile(cred.user, { displayName: user });

            // Sauvegarder le profil dans Firestore
            const serie = document.getElementById('auth-serie')?.value || 'A';
            const mentor = document.getElementById('auth-mentor')?.value || '';
            const pays = document.getElementById('auth-pays')?.value || '';
            await saveProfile({ user, email: email.toLowerCase(), role, classe, serie, mentor, pays, emailVerified: false, tourSeen: false, createdAt: serverTimestamp() });

            // ✅ Envoyer l'email de vérification Firebase
            await sendEmailVerification(cred.user);
            showToast('📧 Email envoyé ! Pense à vérifier tes Spams si tu ne le vois pas.');

            // Déconnecter — l'user doit vérifier son email d'abord
            await signOut(auth);

            // Afficher l'écran de vérification
            _showEmailVerifScreen(email);

            // 🔧 On laisse un court délai avant de réactiver le listener,
            // pour être sûr que la notification signOut() ci-dessus a fini
            // de se propager (sinon elle écraserait l'écran de vérification
            // qu'on vient d'afficher).
            setTimeout(() => { _signupInProgress = false; }, 3000);
        } catch (e) {
            _signupInProgress = false;
            _setAuthBtnLoading(false);
            console.error('Erreur signup Firebase:', e.code, e); // 🔧 debug
            if (e.code === 'auth/email-already-in-use') {
                _authAlert("Un compte existe déjà avec cet email.");
                setTimeout(() => showAuthScreen('login'), 800);
            } else {
                _authAlert("Erreur : " + _firebaseErrMsg(e.code));
            }
        }

    } else {
        // Connexion
        const email = document.getElementById('auth-email')?.value.trim();
        const pass  = document.getElementById('auth-pass')?.value;

        if (!email || !pass) return _authAlert("Remplis ton email et ton mot de passe !");

        _setAuthBtnLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            // onAuthStateChanged prend le relais
        } catch (e) {
            _setAuthBtnLoading(false);
            console.error('Erreur login Firebase:', e.code, e); // 🔧 debug
            _authAlert(_firebaseErrMsg(e.code));
        }
    }
}

/**
 * Connexion Google — remplace handleSocialAuth('Google')
 *
 * 🔧 FIX (boucle infinie / retour à l'inscription après choix du compte
 * Gmail, erreur console "Uncaught TypeError: Permissions check failed") :
 * signInWithRedirect() s'appuie sur un iframe cross-origin vers le domaine
 * authDomain de Firebase (musicschool1960.firebaseapp.com) pour transmettre
 * le résultat. Comme ce domaine est DIFFÉRENT de celui où l'app est
 * hébergée (netlify.app), Chrome bloque cet iframe dès qu'il restreint le
 * stockage tiers (comportement de plus en plus fréquent sur Chrome
 * mobile/Android) → la connexion échoue silencieusement et l'app retombe
 * sur l'écran d'inscription comme si rien ne s'était passé.
 * signInWithPopup() n'a pas ce problème car il échange directement le
 * résultat entre les deux fenêtres, sans passer par ce mécanisme de
 * stockage partagé. On garde un fallback automatique vers signInWithRedirect
 * uniquement si la popup est bloquée par le navigateur.
 */
async function handleSocialAuth(provider) {
    // 🔧 FIX (bouton semblait ne rien faire) : le clic ne donnait aucun
    // retour visuel immédiat, donc si la popup mettait un instant à
    // s'ouvrir (ou était bloquée), l'utilisateur avait l'impression que
    // le bouton ne réagissait pas du tout. On ajoute un retour visuel
    // au clic — mais on garde bien signInWithPopup() en premier (voir
    // le commentaire au-dessus de cette fonction) : forcer la
    // redirection sur mobile réintroduirait le bug déjà corrigé
    // précédemment (iframe cross-origin bloqué, connexion cassée
    // silencieusement).
    const btn = document.querySelector('.google-btn');
    if (btn) {
        btn.style.opacity = '0.6';
        btn.style.pointerEvents = 'none';
    }

    try {
        await signInWithPopup(auth, googleProvider);
        // onAuthStateChanged prend le relais
    } catch (e) {
        if (e.code === 'auth/popup-blocked' || e.code === 'auth/cancelled-popup-request') {
            console.warn('Popup bloquée, fallback vers signInWithRedirect:', e.code);
            try {
                await signInWithRedirect(auth, googleProvider);
            } catch (e2) {
                console.error('Erreur Google signInWithRedirect (fallback):', e2.code, e2);
                showToast("Erreur Google : " + _firebaseErrMsg(e2.code));
            }
        } else if (e.code === 'auth/popup-closed-by-user') {
            // L'utilisateur a fermé la popup volontairement, rien à afficher
        } else if (e.code === 'auth/account-exists-with-different-credential') {
            // 🔧 FIX (trou trouvé lors de l'audit connexion) : un élève qui
            // s'est inscrit d'abord avec email + mot de passe, puis essaie
            // "Continuer avec Google" avec la MÊME adresse, tombait sur un
            // message technique imbuvable ("account-exists-with-different-
            // credential") et restait bloqué sans savoir quoi faire. On lui
            // explique maintenant clairement quoi faire à la place.
            _authAlert("Un compte existe déjà avec cet email, créé avec un mot de passe. Connecte-toi avec ton email et ton mot de passe plutôt qu'avec Google.");
        } else {
            console.error('Erreur Google signInWithPopup:', e.code, e); // 🔧 debug
            showToast("Erreur Google : " + _firebaseErrMsg(e.code));
        }
    }
    if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
}

/**
 * Déconnexion — remplace logout()
 */
async function logout() {
    // Forcer la synchro des données avant déconnexion
    if (_userDataDirty && MS.user) {
        _userDataDirty = false;
        clearTimeout(_syncTimeout);
        await setDoc(
            doc(db, "users", MS.user.uid, "data", "userData"),
            MS.userData,
            { merge: true }
        ).catch(() => {});
    }
    // 🔧 FIX (photo/nom perdus à la déconnexion) : si un saveProfile() est
    // encore en vol (ex: photo tout juste changée), on le laisse finir
    // avant de couper la session — sinon signOut()+reload() l'annulait.
    if (_pendingProfileSave) {
        await _pendingProfileSave.catch(() => {});
    }
    await signOut(auth);
    MS.user = null;
    MS.profile = null;
    MS.userData = null;
    isAuth = false;
    location.reload();
}

/**
 * Mot de passe oublié — remplace handleForgotPassword()
 */
async function handleForgotPassword() {
    const email = document.getElementById('forgot-email')?.value.trim().toLowerCase();
    if (!email) return _authAlert("Entre ton adresse email !");

    try {
        await sendPasswordResetEmail(auth, email);
        showToast("📧 Email de réinitialisation envoyé !");
        setTimeout(() => showAuthScreen('login'), 1500);
    } catch (e) {
        if (e.code === 'auth/user-not-found') {
            _authAlert("Aucun compte trouvé avec cet email.");
        } else {
            _authAlert("Erreur : " + _firebaseErrMsg(e.code));
        }
    }
}

// ─────────────────────────────────────────────────────────────
// DONNÉES — Remplace les fonctions localStorage
// ─────────────────────────────────────────────────────────────

/**
 * Remplace getXPData()
 */
function getXPData() {
    if (!MS.userData) return { xp: 0, streak: 0, lastDate: null, quizDone: [] };
    return MS.userData;
}

/**
 * Remplace saveXPData()
 */
function saveXPData(data) {
    saveUserData(data);
}

/**
 * Remplace updateStreak() — même logique mais sauvegarde Firestore
 */
function updateStreak() {
    const data = getXPData();
    const today = new Date().toDateString();
    if (data.lastDate === today) return data;

    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (data.lastDate === yesterday) {
        data.streak = (data.streak || 0) + 1;
        data.xp = (data.xp || 0) + (5 * Math.min(data.streak, 10));
    } else {
        data.streak = 1;
    }
    data.lastDate = today;
    saveUserData(data);
    return data;
}

/**
 * Remplace awardXP()
 */
function awardXP(amount, reason) {
    const data = getXPData();
    data.xp = (data.xp || 0) + amount;
    saveUserData(data);
    showXPToast(amount, reason);
    updateXPBar();
}

/**
 * Gestion des cours complétés — remplace localStorage.completedLessons
 */
function getCompletedLessons() {
    return MS.userData?.completedLessons || [];
}

function addCompletedLesson(id) {
    const current = getCompletedLessons();
    if (!current.includes(id)) {
        const updated = [...current, id];
        completedLessons = updated; // Synchro variable globale
        saveUserData({ completedLessons: updated });
    }
}

/**
 * Gestion des likes — remplace localStorage.likedLessons
 */
function getLikedLessons() {
    return MS.userData?.likedLessons || [];
}

function toggleLike(id) {
    const current = getLikedLessons();
    const updated = current.includes(id)
        ? current.filter(l => l !== id)
        : [...current, id];
    likedLessons = updated; // Synchro variable globale
    saveUserData({ likedLessons: updated });
    renderPlayerUI(currentPlaylist[viewingIndex]);
}

/**
 * Compte de connexions — remplace ms_login_count
 */
function getLoginCount() {
    return MS.userData?.loginCount || 0;
}

function incrementLoginCount() {
    const count = getLoginCount() + 1;
    saveUserData({ loginCount: count });
    return count;
}

/**
 * Profil utilisateur — remplace localStorage.userAccount
 * Construit un objet compatible avec le reste du code
 */
function getUserAccount() {
    if (!MS.user || !MS.profile) return { user: "Invité", email: "—" };
    return {
        user: MS.profile.user || MS.user.displayName || "Utilisateur",
        email: MS.profile.email || MS.user.email,
        role: MS.profile.role || 'eleve',
        classe: MS.profile.classe || 'terminale'
    };
}

// ─────────────────────────────────────────────────────────────
// 💬 ESPACE COMMENTAIRES GÉNÉRAL — public, visible par tous
// Remplace l'ancien bouton "commentaire" qui n'enregistrait rien
// (le texte disparaissait, seul un faux message "Chicky a reçu ton
// message" s'affichait). Ici, chaque commentaire est un vrai
// document Firestore, lisible par tout le monde (même déconnecté),
// mais seul un utilisateur connecté peut en publier un nouveau.
// ─────────────────────────────────────────────────────────────

/**
 * S'abonne en temps réel aux commentaires publics (les plus récents
 * en premier). callback(list) est rappelé à chaque changement.
 * Retourne une fonction unsubscribe() à appeler pour se désabonner.
 */
function subscribePublicComments(callback) {
    try {
        const q = query(collection(db, "publicComments"), orderBy("createdAt", "desc"), limit(100));
        return onSnapshot(q, (snap) => {
            const list = [];
            snap.forEach((docSnap) => list.push({ id: docSnap.id, ...docSnap.data() }));
            callback(list);
        }, (err) => {
            console.error('Erreur lecture commentaires:', err);
            callback([]);
        });
    } catch (e) {
        console.error('Erreur abonnement commentaires:', e);
        callback([]);
        return () => {};
    }
}

/**
 * Publie un commentaire public. Nécessite d'être connecté.
 * lessonContext (optionnel) : titre de la leçon si le commentaire est
 * posté depuis un lecteur de cours — sinon c'est un avis général sur l'app.
 */
async function postPublicComment(text, lessonContext) {
    if (!MS.user) throw new Error('not-logged-in');
    const clean = (text || '').trim().slice(0, 500);
    if (!clean) throw new Error('empty');
    const account = getUserAccount();
    const payload = {
        uid: MS.user.uid,
        author: account.user || 'Utilisateur',
        role: account.role || 'eleve',
        text: clean,
        createdAt: serverTimestamp()
    };
    if (lessonContext) payload.lessonContext = String(lessonContext).slice(0, 80);
    await addDoc(collection(db, "publicComments"), payload);
}

/**
 * Changement de classe — remplace changeClasse()
 */
async function changeClasse(classe) {
    await saveProfile({ classe });
    selectedGrade = (classe === 'terminale' || classe === '1ere') ? classe : 'terminale';
    showToast('✅ Classe changée : ' + classe.charAt(0).toUpperCase() + classe.slice(1));
    showProfile();
}

// ─────────────────────────────────────────────────────────────
// OVERRIDE — Patch des fonctions du script principal
// Ces fonctions écrasent celles du script.js au chargement
// ─────────────────────────────────────────────────────────────

/**
 * showProfile() patchée pour utiliser Firebase
 *
 * 🔧 FIX (même pattern que showGrades() ci-dessus) : cette fonction NE
 * réimplémente PLUS tout le HTML du profil. L'ancienne version ci-dessous
 * datait d'avant l'ajout de la Roue du Destin, du Défi du Jour, de la
 * Question Surprise, du Classement, des Mini-Jeux, des Favoris, des Stats,
 * des Playlists, etc. — comme firebase-config.js s'exécute APRÈS script.js
 * et écrase window.showProfile, tout l'écran retombait sur cette version
 * minimaliste et ces sections disparaissaient silencieusement, alors
 * qu'elles étaient toujours présentes (et fonctionnelles) dans script.js.
 *
 * On synchronise juste les variables/comptes depuis Firestore, puis on
 * délègue l'affichage à la VRAIE fonction showProfile() de script.js
 * (capturée dans window._msOrigShowProfile avant d'être écrasée — voir
 * _applyFirebaseOverrides()). getXPData/getCompletedLessons/getUserAccount
 * étant déjà patchés vers Firebase, et 'userAccount' étant tenu à jour par
 * _syncLegacyStorage(), la fonction d'origine s'affiche normalement mais
 * avec les données Firebase, et réaffiche TOUS les widgets du profil.
 */
function showProfile() {
    // Récupérer la classe/rôle depuis le profil Firebase avant l'affichage
    if (MS.profile?.classe) {
        selectedGrade = (['terminale','1ere'].includes(MS.profile.classe))
            ? MS.profile.classe : 'terminale';
    }

    // Filet de sécurité : force la synchro juste avant que script.js
    // relise 'userAccount' / 'completedLessons' / etc.
    _syncLegacyStorage();

    if (typeof window._msOrigShowProfile === 'function') {
        window._msOrigShowProfile();
        return;
    }

    // ── Filet de sécurité si jamais l'original n'a pas pu être capturé ──
    console.warn('⚠️ showProfile original introuvable, affichage minimal de secours.');
    currentLevel = 'profile';
    updateHeaderBtns();
    if (sectionTitle) sectionTitle.innerText = "MON PROFIL";
    const account = getUserAccount();
    mainGrid.innerHTML = `
        <div class="profile-container">
            <div style="text-align:center; margin-bottom:16px;">
                <div style="font-size:1rem; font-weight:bold; color:#fff;">${account.user}</div>
                <div style="font-size:0.88rem;color:#aaa;">${account.email}</div>
            </div>
            <div class="logout-btn" onclick="logout()">Se déconnecter</div>
        </div>
    `;
}

/**
 * showWelcome() patché pour utiliser Firebase
 */
function showWelcome(account, isNewUser = false) {
    const prenom = (account.user || 'toi').split(' ')[0];
    const heure = new Date().getHours();
    const salut = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';
    const xpData = getXPData();
    const level = getCurrentLevel(xpData.xp);
    const completedCount = getCompletedLessons().length;
    const isPrem = isPremium();
    const loginCount = incrementLoginCount();
    const isReturning = loginCount > 1 && !isNewUser;

    const newUserMessages = {
        eleve: { titre: `Bienvenue ${prenom} ! 🎉`, sub: `Prêt à réviser le Bac autrement ? Tes cours t'attendent.`, emoji: '🚀' },
        parent: { titre: `Bonjour ${prenom} ! 👋`, sub: `Découvrez comment MusicSchool aide votre enfant à réviser.`, emoji: '👪' },
        prof: { titre: `Bienvenue Prof ${prenom} ! 📚`, sub: `Explorez tous les cours disponibles pour vos élèves.`, emoji: '🎓' },
    };

    const returningMessages = [
        { titre: `Content de te revoir ${prenom} !`, sub: xpData.streak > 1 ? `🔥 ${xpData.streak} jours de suite, continue !` : "Reprends là où tu t'es arrêté." },
        { titre: `De retour ${prenom} ! 💪`, sub: `Tu as déjà ${completedCount} cours dans la poche. Allez !` },
        { titre: `${salut} ${prenom} !`, sub: `${isPrem ? '👑 Premium actif — tous tes cours sont là.' : `⚡ ${xpData.xp} XP au compteur. Continue !`}` },
        { titre: `Ravi de te retrouver ${prenom} !`, sub: `${level.label} — tu montes en puissance 🔥` },
    ];

    // 🆕 XP gagnés pendant l'absence (écran verrouillé, app en arrière-plan...)
    // — avant, seul un récap tous les 5 cours pouvait le montrer ; on
    // l'affiche maintenant systématiquement à la réouverture de l'app.
    const _xpSnapKey = 'ms_last_seen_xp_' + (MS.user ? MS.user.uid : 'anon');
    const _lastSeenXP = parseInt(localStorage.getItem(_xpSnapKey) || xpData.xp, 10);
    const _xpGainedAway = Math.max(0, xpData.xp - _lastSeenXP);
    localStorage.setItem(_xpSnapKey, xpData.xp);

    // 🔧 FIX : le message n'est plus juste tiré au hasard dans une petite
    // liste fixe (répétitif au bout de 5-6 ouvertures) — il tient compte
    // de la vraie progression (proximité du niveau suivant, streak, taille
    // de la session pendant l'absence), avec une liste de secours plus
    // large et sans répéter le même message que la dernière fois.
    const _nextLvl = getNextLevel(xpData.xp);
    const _xpToNext = _nextLvl ? _nextLvl.min - xpData.xp : null;
    let _motivLine;
    if (_nextLvl && _xpToNext !== null && _xpToNext <= 30) {
        _motivLine = `Plus que ${_xpToNext} XP avant "${_nextLvl.label}" — tu y es presque ! 🎯`;
    } else if (_xpGainedAway >= 50) {
        _motivLine = `Grosse session pendant ton absence, continue sur cette lancée ! 🚀`;
    } else if (xpData.streak >= 5) {
        _motivLine = `${xpData.streak} jours d'affilée — un vrai rythme de champion 🏆`;
    } else {
        const _fallbackMotivations = [
            "Le Bac n'a qu'à bien se tenir 🔥",
            "Petit à petit, l'oiseau fait son nid 🐦",
            "Chaque cours écouté te rapproche du jour J 🎯",
            "T'es sur la bonne voie, continue comme ça 💪",
            "La régularité bat le talent — tu le prouves 🚀",
            "Un cours de plus, un pas de plus vers la mention 🎓",
            "Ton futur toi te remerciera pour ça 🙌",
            "Petite routine, grands résultats — garde le cap ⚡",
        ];
        const _lastMotivKey = 'ms_last_motiv_idx';
        const _lastIdx = parseInt(localStorage.getItem(_lastMotivKey) || '-1', 10);
        let _idx = Math.floor(Math.random() * _fallbackMotivations.length);
        if (_fallbackMotivations.length > 1) {
            while (_idx === _lastIdx) _idx = Math.floor(Math.random() * _fallbackMotivations.length);
        }
        localStorage.setItem(_lastMotivKey, _idx);
        _motivLine = _fallbackMotivations[_idx];
    }

    const msg = isReturning
        ? returningMessages[loginCount % returningMessages.length]
        : (newUserMessages[account.role] || newUserMessages.eleve);

    const overlay = document.createElement('div');
    overlay.id = 'welcome-overlay';
    overlay.style.cssText = `
        position:fixed; inset:0; z-index:99999;
        background:linear-gradient(160deg,#0a0a0a 0%,#0d0018 100%);
        display:flex; flex-direction:column;
        align-items:center; justify-content:center;
        padding:40px 28px;
        animation: fadeIn 0.4s ease;
    `;
    overlay.innerHTML = `
        <div style="font-size:1.6rem;font-weight:900;color:#fff;letter-spacing:-1px;margin-bottom:36px;">
            MusicSchool<span style="color:#8a2be2;">.</span>
        </div>
        <div style="
            width:80px; height:80px; border-radius:50%;
            background:linear-gradient(135deg,#8a2be2,#6a0dad);
            border:3px solid ${level.color};
            box-shadow:0 0 30px ${level.color}55;
            display:flex; align-items:center; justify-content:center;
            font-size:2rem; font-weight:900; color:#fff;
            margin-bottom:20px;
        ">${isReturning ? prenom.charAt(0).toUpperCase() : (msg.emoji || '🎵')}</div>
        <div style="text-align:center; margin-bottom:${isReturning ? '24px' : '32px'};">
            <div style="font-size:1.6rem;font-weight:900;color:#fff;margin-bottom:8px;letter-spacing:-0.5px;">${msg.titre}</div>
            <div style="font-size:0.85rem;color:#666;max-width:260px;line-height:1.5;">${msg.sub}</div>
        </div>
        ${isReturning && _xpGainedAway > 0 ? `
        <div style="text-align:center;margin-bottom:20px;padding:14px 20px;background:linear-gradient(135deg,#4ade8022,#4ade8008);border:1px solid #4ade8044;border-radius:16px;max-width:280px;">
            <div style="font-size:1.1rem;font-weight:900;color:#4ade80;">🎉 +${_xpGainedAway} XP pendant ton absence !</div>
            <div style="font-size:0.75rem;color:#888;margin-top:6px;">${_motivLine}</div>
        </div>
        ` : ''}
        ${isReturning ? `
        <div style="display:flex;gap:24px;margin-bottom:36px;padding:16px 24px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:16px;">
            <div style="text-align:center;">
                <div style="font-size:1.3rem;font-weight:900;color:#e67e22;">🔥 ${xpData.streak}</div>
                <div style="font-size:0.65rem;color:#555;margin-top:2px;">jours de suite</div>
            </div>
            <div style="width:1px;background:#222;"></div>
            <div style="text-align:center;">
                <div style="font-size:1.3rem;font-weight:900;color:#8a2be2;">⚡ ${xpData.xp}</div>
                <div style="font-size:0.65rem;color:#555;margin-top:2px;">XP total</div>
            </div>
            <div style="width:1px;background:#222;"></div>
            <div style="text-align:center;">
                <div style="font-size:1.3rem;font-weight:900;color:#2ecc71;">📖 ${completedCount}</div>
                <div style="font-size:0.65rem;color:#555;margin-top:2px;">cours écoutés</div>
            </div>
        </div>
        ` : ''}
        <div style="width:100%;max-width:280px;">
            <div style="font-size:0.68rem;color:#444;text-align:center;margin-bottom:8px;letter-spacing:1px;">
                ${isReturning ? 'CHARGEMENT EN COURS...' : 'PRÉPARATION DE TES COURS...'}
            </div>
            <div style="background:#1a1a1a;border-radius:20px;height:4px;overflow:hidden;">
                <div id="welcome-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#8a2be2,#a855f7);border-radius:20px;transition:width 0.05s linear;"></div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    let pct = 0;
    const bar = document.getElementById('welcome-bar');
    const speed = isReturning ? 12 : 6;
    const interval = setInterval(() => {
        pct += Math.random() * speed + 3;
        if (pct >= 100) {
            pct = 100;
            clearInterval(interval);
            bar.style.width = '100%';
            setTimeout(() => {
                overlay.style.transition = 'opacity 0.4s ease';
                overlay.style.opacity = '0';
                setTimeout(() => { overlay.remove(); showGrades(); }, 400);
            }, 300);
        }
        bar.style.width = pct + '%';
    }, 60);
}

/**
 * showGrades() — synchro variable globale likedLessons/completedLessons
 * au démarrage pour que le reste du code fonctionne normalement
 *
 * 🔧 FIX CRITIQUE (Maths + Historique d'écoute disparus) :
 * Cette fonction REMPLACE window.showGrades de script.js. Avant, elle
 * reconstruisait elle-même le HTML de la grille de matières — mais cette
 * reconstruction était incomplète : elle ne réaffichait que Philo,
 * Histoire-Géo et Français, et oubliait Maths, SVT, Anglais, À Méditer,
 * ET toute la section "Reprendre l'écoute" (historique). Les données
 * n'étaient PAS supprimées (elles restent dans Firestore/localStorage),
 * mais l'écran ne les affichait plus du tout après le passage à Firebase.
 *
 * Le fix : on synchronise juste les variables depuis Firestore, puis on
 * délègue l'affichage à la VRAIE fonction showGrades() de script.js
 * (capturée dans window._msOrigShowGrades avant d'être écrasée — voir
 * _applyFirebaseOverrides()). Comme getXPData/getCompletedLessons/
 * getLikedLessons/getUserAccount sont eux aussi déjà patchés vers Firebase,
 * la fonction d'origine continue de fonctionner normalement mais avec les
 * données Firebase, et réaffiche TOUTES les matières + l'historique.
 */
function showGrades() {
    // Synchro variables globales depuis Firestore
    if (MS.userData) {
        likedLessons = MS.userData.likedLessons || [];
        completedLessons = MS.userData.completedLessons || [];
    }

    // Récupérer la classe depuis le profil Firebase
    if (MS.profile?.classe) {
        selectedGrade = (['terminale','1ere'].includes(MS.profile.classe))
            ? MS.profile.classe : 'terminale';
    }

    // 🔧 FIX : filet de sécurité — au cas où showGrades() serait appelée
    // avant que _syncLegacyStorage() ait eu l'occasion de tourner (ex:
    // après un switchGrade() rapide), on force la synchro juste avant que
    // script.js relise 'userAccount' / 'completedLessons' / etc.
    _syncLegacyStorage();

    if (typeof window._msOrigShowGrades === 'function') {
        window._msOrigShowGrades();
        return;
    }

    // ── Filet de sécurité si jamais l'original n'a pas pu être capturé ──
    console.warn('⚠️ showGrades original introuvable, affichage minimal de secours.');
    currentLevel = 'grades';
    updateHeaderBtns();
    if (sectionTitle) sectionTitle.innerText = "MATIÈRES";
    updateStreak();
    injectXPBar();
    if (mainGrid) {
        mainGrid.style.gridTemplateColumns = '';
        mainGrid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:#e74c3c;font-size:0.85rem;">
                ⚠️ Erreur d'affichage des matières. Recharge la page (ou contacte le support si ça persiste).
            </div>`;
    }
}

// Override switchGrade pour sauvegarder dans Firebase
const _origSwitchGrade = window.switchGrade;
function switchGrade(grade) {
    selectedGrade = grade;
    if (MS.profile) saveProfile({ classe: grade });
    showGrades();
    showToast('✅ Classe : ' + grade.charAt(0).toUpperCase() + grade.slice(1));
}

/**
 * 🔧 FIX (historique d'écoute perdu) : addToHistory() de script.js
 * n'écrivait QUE dans localStorage ('ms_listen_history'), jamais dans
 * Firestore. Donc sur un nouvel appareil, après un nettoyage de cache, ou
 * simplement après reconnexion, l'historique repartait de zéro même si le
 * compte existait depuis longtemps. On intercepte l'appel pour répliquer
 * vers Firestore (via saveUserData, qui debounce déjà l'écriture).
 */
function _patchAddToHistory() {
    if (typeof window.addToHistory !== 'function' || window.addToHistory._msPatched) return;
    const origAddToHistory = window.addToHistory;
    function patchedAddToHistory(lessonId) {
        origAddToHistory(lessonId);
        try {
            const history = JSON.parse(localStorage.getItem('ms_listen_history') || '[]');
            saveUserData({ listenHistory: history });
        } catch (_) {}
    }
    patchedAddToHistory._msPatched = true;
    window.addToHistory = patchedAddToHistory;
}

// Patch audio.onended pour utiliser addCompletedLesson
const _patchAudioOnEnded = () => {
    // 🔧 FIX : `audio` est une variable globale de script.js, pas encore
    // disponible au moment où firebase-config.js s'initialise. On attend
    // qu'elle existe avant de patcher.
    if (typeof audio === 'undefined' || !audio) return;
    const origOnEnded = audio.onended;
    audio.onended = () => {
        const lesson = typeof lessonsData !== 'undefined'
            ? lessonsData.find(l => l.id === currentlyPlayingId) : null;
        if (lesson && !getCompletedLessons().includes(lesson.id)) {
            addCompletedLesson(lesson.id);
            awardXP(20, 'Cours terminé !');
        }
        if (typeof isRepeatMode !== 'undefined' && isRepeatMode) {
            audio.currentTime = 0; audio.play();
        } else if (typeof nextTrack === 'function') {
            nextTrack();
        }
    };
};

// ─────────────────────────────────────────────────────────────
// UTILITAIRES INTERNES
// ─────────────────────────────────────────────────────────────

function _authAlert(msg) {
    const existing = document.querySelector('.auth-error-msg');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.className = 'auth-error-msg';
    el.style.cssText = `
        background:#2a0a0a; border:1px solid #e74c3c44;
        color:#e74c3c; font-size:0.82rem; font-weight:600;
        padding:10px 16px; border-radius:10px; margin-bottom:12px;
        text-align:center; animation: fadeIn 0.2s ease;
    `;
    el.textContent = msg;
    const btn = document.querySelector('.auth-btn');
    if (btn) btn.before(el);
    else alert(msg);
}

function _setAuthBtnLoading(loading) {
    const btn = document.querySelector('.auth-btn');
    if (!btn) return;
    btn.disabled = loading;
    btn.style.opacity = loading ? '0.6' : '1';
    btn.textContent = loading ? 'Connexion...' : btn._origText || btn.textContent;
    if (!loading) return;
    btn._origText = btn.textContent;
}

function _firebaseErrMsg(code) {
    const msgs = {
        'auth/wrong-password': 'Mot de passe incorrect.',
        'auth/invalid-credential': 'Email ou mot de passe incorrect.',
        'auth/user-not-found': 'Aucun compte avec cet email.',
        'auth/too-many-requests': 'Trop de tentatives. Réessaie plus tard.',
        'auth/network-request-failed': 'Problème réseau. Vérifie ta connexion.',
        'auth/invalid-email': 'Adresse email invalide.',
        'auth/weak-password': 'Mot de passe trop faible (6 caractères min).',
        'auth/popup-blocked': 'Popup bloquée. Autorise les popups pour ce site.',
        // 🔧 FIX : ces 3 codes cassent À LA FOIS la connexion email/password
        // ET Google en même temps (symptôme rapporté par Chicky) — ce sont
        // des problèmes de CONFIGURATION côté console Firebase / Google
        // Cloud, pas un bug de code. On affiche maintenant un message clair
        // au lieu du "Une erreur est survenue" générique d'avant.
        'auth/unauthorized-domain': "Ce domaine n'est pas autorisé dans Firebase (Authentication → Settings → Domaines autorisés). Ajoute ton domaine Netlify.",
        'auth/operation-not-allowed': "La méthode de connexion est désactivée côté Firebase (Authentication → Sign-in method). Active Email/Password et Google.",
        'auth/api-key-not-valid.-please-pass-a-valid-api-key.': "Clé API Firebase invalide ou restreinte (vérifie les restrictions HTTP referrer dans Google Cloud Console → Credentials).",
        'auth/configuration-not-found': "Configuration Firebase Auth manquante ou incorrecte (vérifie le projectId/apiKey dans firebase-config.js).",
    };
    if (msgs[code]) return msgs[code];
    // 🔧 FIX : avant, un code inconnu donnait juste "Une erreur est survenue"
    // sans indice. On affiche maintenant le code brut pour pouvoir le
    // chercher / me le communiquer directement, sans avoir à ouvrir la
    // console développeur.
    return 'Une erreur est survenue' + (code ? ' (' + code + ')' : '') + '.';
}

// ─────────────────────────────────────────────────────────────
// VÉRIFICATION EMAIL — Écran + renvoi
// ─────────────────────────────────────────────────────────────

/**
 * Affiche l'écran "Vérifie ton email" après inscription
 */
function _showEmailVerifScreen(email) {
    const container = document.getElementById('auth-container');
    if (!container) return;
    container.innerHTML = `
        <div class="auth-overlay" style="background:linear-gradient(160deg,#0a0a0a 0%,#0d0018 100%);align-items:flex-start;padding-top:60px;">
            <div class="auth-card" style="animation:fadeIn 0.4s ease;text-align:center;">
                <div style="font-size:3rem;margin-bottom:16px;">📧</div>
                <h2 style="color:#fff;font-size:1.2rem;font-weight:900;margin-bottom:8px;">Vérifie ton email !</h2>
                <p style="color:#888;font-size:0.85rem;line-height:1.5;margin-bottom:20px;">
                    On a envoyé un lien de vérification à<br>
                    <span style="color:#8a2be2;font-weight:700;">${email || ''}</span><br><br>
                    Clique sur le lien dans le mail, puis reviens ici pour te connecter.
                </p>
                <div style="background:#0d0018;border:1px solid #8a2be233;border-radius:12px;padding:14px;margin-bottom:20px;font-size:0.78rem;color:#666;line-height:1.6;">
                    📁 Vérifie aussi ton dossier <strong style="color:#888;">Spam / Promotions</strong> si tu ne vois rien.
                </div>
                <button class="auth-btn" onclick="checkEmailVerifiedAndContinue()" style="margin-bottom:10px;">
                    ✅ J'ai vérifié, continuer
                </button>
                <button class="auth-btn" onclick="resendVerifEmail('${email || ''}')" style="margin-bottom:12px;background:#8a2be2;">
                    🔄 Renvoyer le mail
                </button>
                <p style="color:#555;font-size:0.8rem;cursor:pointer;margin-top:8px;" onclick="showAuthScreen('login')">
                    ← Retour à la connexion
                </p>
            </div>
        </div>
    `;
}

/**
 * 🔧 NOUVEAU : appelé par le bouton "J'ai vérifié, continuer" de l'écran
 * de vérification. Comme la session reste maintenant active (voir le FIX
 * dans onAuthStateChanged plus haut), on peut relire le statut à jour
 * directement depuis Firebase (reload()) sans redemander l'email/mdp.
 */
async function checkEmailVerifiedAndContinue() {
    const user = auth.currentUser;
    if (!user) {
        showToast('⚠️ Reconnecte-toi pour continuer.');
        showAuthScreen('login');
        return;
    }
    try {
        await user.reload();
        if (user.emailVerified) {
            showToast('✅ Email vérifié !');
            // Redémarre proprement le flux de connexion (onAuthStateChanged
            // va maintenant laisser passer l'utilisateur, vu emailVerified=true)
            location.reload();
        } else {
            showToast("📧 Pas encore vérifié — clique d'abord le lien reçu par email.");
        }
    } catch (e) {
        showToast('❌ ' + _firebaseErrMsg(e.code));
    }
}

/**
 * Renvoie l'email de vérification à l'utilisateur
 */
async function resendVerifEmail(email) {
    if (!email) return showToast('⚠️ Email introuvable.');
    try {
        // On doit récupérer l'user courant depuis Firebase
        const user = auth.currentUser;
        if (user) {
            await sendEmailVerification(user);
            showToast('📧 Email renvoyé ! Pense à vérifier tes Spams si tu ne le vois pas.');
        } else {
            showToast('⚠️ Reconnecte-toi pour recevoir un nouveau mail.');
            showAuthScreen('login');
        }
    } catch (e) {
        if (e.code === 'auth/too-many-requests') {
            showToast('⏳ Trop de demandes. Attends quelques minutes.');
        } else {
            showToast('❌ Erreur : ' + _firebaseErrMsg(e.code));
        }
    }
}

// ─────────────────────────────────────────────────────────────
// COMPLÉTER LE PROFIL — étape demandée après une 1ère connexion
// Google (pas de rôle/classe/série/pays fournis par Google)
// ─────────────────────────────────────────────────────────────

/**
 * Affiche l'écran "Encore une étape !" pour les nouveaux comptes Google.
 * Réutilise les mêmes fonctions (selectRole/selectClasse/selectSerie) et
 * la même apparence que le formulaire d'inscription email/mot de passe
 * d'origine, pour rester cohérent visuellement.
 */
function _showCompleteProfileScreen(user) {
    const container = document.getElementById('auth-container');
    if (!container) return;
    const prenom = (user.displayName || '').replace(/"/g, '&quot;');
    const photo = user.photoURL || '';

    container.innerHTML = `
        <div class="auth-overlay" style="background:linear-gradient(160deg,#0a0a0a 0%,#0d0018 100%);align-items:flex-start;padding-top:40px;overflow-y:auto;">
            <div class="auth-card" style="animation:fadeIn 0.4s ease;">
                <div style="text-align:center;margin-bottom:18px;">
                    ${photo ? `<img src="${photo}" referrerpolicy="no-referrer" style="width:64px;height:64px;border-radius:50%;border:2px solid #8a2be2;margin-bottom:10px;object-fit:cover;">` : ''}
                    <h2 style="color:#fff;font-size:1.1rem;font-weight:900;margin-bottom:4px;">Encore une étape ! 🚀</h2>
                    <p style="color:#888;font-size:0.78rem;line-height:1.4;">Google ne nous donne pas tout — on a besoin de quelques infos pour personnaliser ton expérience.</p>
                </div>

                <div style="position:relative;margin-bottom:12px;">
                    <i class="fas fa-user" style="position:absolute;left:16px;top:50%;transform:translateY(-50%);color:#555;font-size:0.85rem;"></i>
                    <input type="text" id="cp-user" class="auth-input" placeholder="Prénom et Nom" value="${prenom}" style="padding-left:42px;margin-bottom:0;">
                </div>

                <div style="margin-bottom:12px;">
                    <div style="font-size:0.72rem;color:#555;font-weight:bold;letter-spacing:0.5px;margin-bottom:8px;padding-left:4px;">JE SUIS...</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                        <button type="button" id="role-eleve" onclick="selectRole('eleve')" style="padding:10px 6px;border-radius:12px;border:1.5px solid #333;background:#111;color:#888;font-size:0.78rem;font-weight:700;cursor:pointer;">🎓 Élève</button>
                        <button type="button" id="role-parent" onclick="selectRole('parent')" style="padding:10px 6px;border-radius:12px;border:1.5px solid #333;background:#111;color:#888;font-size:0.78rem;font-weight:700;cursor:pointer;">👪 Parent</button>
                        <button type="button" id="role-prof" onclick="selectRole('prof')" style="padding:10px 6px;border-radius:12px;border:1.5px solid #333;background:#111;color:#888;font-size:0.78rem;font-weight:700;cursor:pointer;">📚 Prof</button>
                        <button type="button" id="role-autre" onclick="selectRole('autre')" style="padding:10px 6px;border-radius:12px;border:1.5px solid #333;background:#111;color:#888;font-size:0.78rem;font-weight:700;cursor:pointer;">🧩 Autre</button>
                    </div>
                </div>

                <div id="classe-block" style="margin-bottom:12px;display:none;">
                    <div style="font-size:0.72rem;color:#555;font-weight:bold;letter-spacing:0.5px;margin-bottom:8px;padding-left:4px;">MA CLASSE</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                        <button type="button" class="classe-btn" onclick="selectClasse('terminale')" style="padding:10px;border-radius:12px;border:1.5px solid #333;background:#111;color:#888;font-size:0.8rem;font-weight:700;cursor:pointer;">Terminale</button>
                        <button type="button" class="classe-btn" onclick="selectClasse('1ere')" style="padding:10px;border-radius:12px;border:1.5px solid #333;background:#111;color:#888;font-size:0.8rem;font-weight:700;cursor:pointer;">Première</button>
                        <button type="button" class="classe-btn" onclick="selectClasse('2nde')" style="padding:10px;border-radius:12px;border:1.5px solid #333;background:#111;color:#888;font-size:0.8rem;font-weight:700;cursor:pointer;">Seconde</button>
                        <button type="button" class="classe-btn" onclick="selectClasse('3eme')" style="padding:10px;border-radius:12px;border:1.5px solid #333;background:#111;color:#888;font-size:0.8rem;font-weight:700;cursor:pointer;">3ème</button>
                    </div>
                </div>
                <div id="serie-block" style="margin-bottom:12px;display:none;">
                    <div style="font-size:0.72rem;color:#555;font-weight:bold;letter-spacing:0.5px;margin-bottom:8px;padding-left:4px;">MA SÉRIE</div>
                    <div style="display:flex;gap:8px;">
                        <button type="button" class="serie-btn" onclick="selectSerie('A')" style="flex:1;padding:10px;border-radius:12px;border:1.5px solid #333;background:#111;color:#888;font-size:0.85rem;font-weight:800;cursor:pointer;">📚 Série A</button>
                        <button type="button" class="serie-btn" onclick="selectSerie('D')" style="flex:1;padding:10px;border-radius:12px;border:1.5px solid #333;background:#111;color:#888;font-size:0.85rem;font-weight:800;cursor:pointer;">🔬 Série D</button>
                    </div>
                </div>

                <div style="margin-bottom:14px;">
                    <div style="font-size:0.72rem;color:#555;font-weight:bold;letter-spacing:0.5px;margin-bottom:8px;padding-left:4px;">🌍 MON PAYS</div>
                    <select id="cp-pays" style="width:100%;padding:12px 16px;border-radius:12px;border:1.5px solid #333;background:#111;color:#888;font-size:0.85rem;font-weight:600;cursor:pointer;appearance:none;-webkit-appearance:none;outline:none;">
                        <option value="" selected>Sélectionne ton pays (optionnel)</option>
                        <option value="cote-divoire">🇨🇮 Côte d'Ivoire</option>
                        <option value="senegal">🇸🇳 Sénégal</option>
                        <option value="mali">🇲🇱 Mali</option>
                        <option value="cameroun">🇨🇲 Cameroun</option>
                        <option value="rdc">🇨🇩 RD Congo</option>
                        <option value="maroc">🇲🇦 Maroc</option>
                        <option value="algerie">🇩🇿 Algérie</option>
                        <option value="tunisie">🇹🇳 Tunisie</option>
                        <option value="france">🇫🇷 France</option>
                        <option value="belgique">🇧🇪 Belgique</option>
                        <option value="suisse">🇨🇭 Suisse</option>
                        <option value="canada">🇨🇦 Canada</option>
                        <option value="autre">🌐 Autre pays</option>
                    </select>
                </div>

                <div style="margin-bottom:14px;">
                    <div style="font-size:0.72rem;color:#22c55e;font-weight:bold;letter-spacing:0.5px;margin-bottom:8px;padding-left:4px;">🎁 CODE PARRAIN (OPTIONNEL)</div>
                    <input type="text" id="cp-referral" class="auth-input" placeholder="Code d'un ami (facultatif)" style="margin-bottom:0;text-transform:uppercase;">
                </div>

                <input type="hidden" id="auth-role" value="">
                <input type="hidden" id="auth-classe" value="">
                <input type="hidden" id="auth-serie" value="">

                <!-- 🔧 FIX (demandé) : même en connexion Google automatique, on -->
                <!-- exige un mot de passe pour le compte MusicSchool — utile pour -->
                <!-- se reconnecter par email si besoin, et cohérent avec les -->
                <!-- comptes créés à l'ancienne. Lié au compte via linkWithCredential -->
                <!-- (même mécanisme que "Ajouter un mot de passe" dans le profil). -->
                <div style="position:relative;margin-bottom:6px;">
                    <i class="fas fa-lock" style="position:absolute;left:16px;top:50%;transform:translateY(-50%);color:#555;font-size:0.85rem;"></i>
                    <input type="password" id="cp-pass" class="auth-input" placeholder="Crée un mot de passe (6 caractères min)" style="padding-left:42px;margin-bottom:0;">
                </div>
                <!-- 🆕 Confirmation du mot de passe (demandé) -->
                <div style="position:relative;margin-top:10px;margin-bottom:6px;">
                    <i class="fas fa-lock" style="position:absolute;left:16px;top:50%;transform:translateY(-50%);color:#555;font-size:0.85rem;"></i>
                    <input type="password" id="cp-pass-confirm" class="auth-input" placeholder="Confirme ton mot de passe" style="padding-left:42px;margin-bottom:0;">
                </div>
                <p style="color:#555;font-size:0.7rem;line-height:1.4;margin-bottom:14px;padding-left:4px;">Pour pouvoir aussi te reconnecter avec ton email, sans repasser par Google.</p>

                <button class="auth-btn" onclick="completeGoogleProfile()">C'est parti 🚀</button>
            </div>
        </div>
    `;
}

/**
 * Valide et sauvegarde le profil rempli sur _showCompleteProfileScreen.
 */
async function completeGoogleProfile() {
    const user = document.getElementById('cp-user')?.value.trim();
    const role = document.getElementById('auth-role')?.value;
    const classe = document.getElementById('auth-classe')?.value;
    const serie = document.getElementById('auth-serie')?.value || 'A';
    const pays = document.getElementById('cp-pays')?.value || '';
    const pass = document.getElementById('cp-pass')?.value || '';
    const passConfirm = document.getElementById('cp-pass-confirm')?.value || '';
    const referralCode = (document.getElementById('cp-referral')?.value || '').trim().toUpperCase();

    if (!user) return _authAlert("Indique ton prénom et nom !");
    if (!role) return _authAlert("Choisis ton profil (Élève, Parent, Prof ou Autre) !");
    if (role === 'eleve' && !classe) return _authAlert("Choisis ta classe !");
    // 🔧 FIX (demandé) : mot de passe obligatoire même en connexion Google
    if (!pass || pass.length < 6) return _authAlert("Choisis un mot de passe (6 caractères minimum) !");
    // 🆕 Confirmation du mot de passe (demandé)
    if (pass !== passConfirm) return _authAlert("Les deux mots de passe ne correspondent pas !");

    if (auth.currentUser && auth.currentUser.displayName !== user) {
        try { await updateProfile(auth.currentUser, { displayName: user }); } catch (_) {}
    }

    // Lie le mot de passe au compte Google (comme addPasswordToAccount()) —
    // si un mot de passe est déjà lié (ex: retour sur cet écran), on ignore
    // l'erreur "credential-already-in-use"/"provider-already-linked" plutôt
    // que de bloquer l'utilisateur.
    if (auth.currentUser && auth.currentUser.email) {
        try {
            const credential = EmailAuthProvider.credential(auth.currentUser.email, pass);
            await linkWithCredential(auth.currentUser, credential);
        } catch (e) {
            if (e.code !== 'auth/provider-already-linked' && e.code !== 'auth/credential-already-in-use') {
                console.error('Erreur liaison mot de passe:', e.code, e);
                return _authAlert("Erreur avec ce mot de passe : " + _firebaseErrMsg(e.code));
            }
        }
    }

    await saveProfile({
        user,
        email: auth.currentUser?.email || '',
        role,
        classe: classe || 'terminale',
        serie,
        pays,
        referredBy: referralCode || null,
        profileIncomplete: false,
        tourSeen: false
    });

    const container = document.getElementById('auth-container');
    if (container) container.innerHTML = '';
    isAuth = true;
    showGrades();
    initFloatingBubble();
    if (typeof _processReferral === 'function') _processReferral();
}

/**
 * Petite modale stylée (même apparence que les écrans auth-card de l'app)
 * pour remplacer les prompt() natifs moches du navigateur.
 */
function _showStyledModal({ title, subtitle = '', inputId, inputType = 'text', placeholder = '', defaultValue = '', confirmLabel = 'Valider', onConfirm }) {
    const existing = document.getElementById('ms-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'ms-modal-overlay';
    overlay.style.cssText = `
        position:fixed; inset:0; z-index:99999;
        background:rgba(5,0,15,0.82); backdrop-filter:blur(3px);
        display:flex; align-items:center; justify-content:center; padding:20px;
        animation:fadeIn 0.2s ease;
    `;
    overlay.innerHTML = `
        <div class="auth-card" style="max-width:340px; width:100%; position:relative; animation:fadeInScale 0.25s cubic-bezier(0.22,1,0.36,1) both;">
            <div id="ms-modal-close" style="position:absolute; top:14px; right:16px; color:#666; font-size:1.2rem; line-height:1; cursor:pointer;">✕</div>
            <h2 style="color:#fff; font-size:1.05rem; font-weight:900; margin-bottom:6px; padding-right:20px;">${title}</h2>
            ${subtitle ? `<p style="color:#888; font-size:0.78rem; line-height:1.4; margin-bottom:18px;">${subtitle}</p>` : ''}
            <input type="${inputType}" id="${inputId}" class="auth-input" placeholder="${placeholder}" value="${defaultValue}" style="margin-bottom:18px;" autocomplete="off">
            <button class="auth-btn" id="ms-modal-confirm-btn">${confirmLabel}</button>
        </div>
    `;
    document.body.appendChild(overlay);

    const closeModal = () => overlay.remove();
    document.getElementById('ms-modal-close').onclick = closeModal;
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

    const input = document.getElementById(inputId);
    setTimeout(() => input?.focus(), 60);
    const submit = () => onConfirm(input.value, closeModal);
    document.getElementById('ms-modal-confirm-btn').onclick = submit;
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
}

/**
 * Permet d'ajouter un mot de passe à un compte créé via Google (qui n'en
 * a pas par défaut), pour pouvoir aussi se connecter par email/mot de
 * passe plus tard. Accessible depuis l'écran Profil.
 */
async function addPasswordToAccount() {
    if (!auth.currentUser) return;
    _showStyledModal({
        title: '🔑 Ajouter un mot de passe',
        subtitle: 'Pour pouvoir te connecter aussi avec ton email, sans passer par Google.',
        inputId: 'ms-modal-pass',
        inputType: 'password',
        placeholder: '6 caractères minimum',
        confirmLabel: 'Valider',
        onConfirm: async (pass, closeModal) => {
            if (!pass || pass.length < 6) return showToast('⚠️ Mot de passe trop court (6 caractères min).');
            try {
                const credential = EmailAuthProvider.credential(auth.currentUser.email, pass);
                await linkWithCredential(auth.currentUser, credential);
                closeModal();
                showToast('✅ Mot de passe ajouté ! Tu peux maintenant aussi te connecter avec ton email.');
                showProfile();
            } catch (e) {
                console.error('Erreur ajout mot de passe:', e.code, e);
                showToast('❌ Erreur : ' + _firebaseErrMsg(e.code));
            }
        }
    });
}

/**
 * Permet de modifier son prénom/nom depuis l'écran Profil.
 */
// 🔧 AJOUT PROFIL COMPLET (compte + support) :
// ⚠️ Chicky — remplace cette adresse par ta vraie adresse de support avant
// publication, sinon les messages des utilisateurs partiront dans le vide.
const SUPPORT_EMAIL = 'musicschool.bac@gmail.com';

/**
 * Envoie un email de réinitialisation à l'adresse du compte CONNECTÉ
 * (contrairement à handleForgotPassword() qui sert à l'écran de connexion
 * et demande de retaper l'email).
 */
async function changeMyPassword() {
    const email = auth.currentUser && auth.currentUser.email;
    if (!email) { showToast('⚠️ Indisponible pour ce type de compte (Google)'); return; }
    try {
        await sendPasswordResetEmail(auth, email);
        showToast('📧 Email envoyé à ' + email);
    } catch (e) {
        showToast('❌ Erreur : ' + _firebaseErrMsg(e.code));
    }
}

function showHelpSupport() {
    const overlay = document.createElement('div');
    overlay.id = 'help-support-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:#000d;z-index:10000;display:flex;align-items:flex-end;justify-content:center;';
    overlay.innerHTML = `<div style="width:92%;max-width:400px;background:#0d0d0d;border:1.5px solid #38bdf844;border-radius:22px 22px 0 0;padding:22px 20px 32px;">
        <div style="font-size:0.6rem;font-weight:900;letter-spacing:2px;color:#38bdf8;margin-bottom:14px;">🆘 AIDE & SUPPORT</div>
        <div style="font-size:0.85rem;color:#ccc;line-height:1.6;margin-bottom:18px;">Une question, un bug à signaler, une suggestion ? Écris-nous, on te répond au plus vite.</div>
        <a href="mailto:${SUPPORT_EMAIL}?subject=MusicSchool%20-%20Support" style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:13px;background:linear-gradient(135deg,#0a1020,#0d1530);border:1px solid #38bdf855;border-radius:12px;color:#38bdf8;font-size:0.85rem;font-weight:800;text-decoration:none;margin-bottom:10px;box-sizing:border-box;">✉️ ${SUPPORT_EMAIL}</a>
        <button onclick="document.getElementById('help-support-overlay').remove()" style="width:100%;padding:13px;background:#1a1a1a;border:1px solid #333;border-radius:12px;color:#888;font-size:0.8rem;cursor:pointer;">Fermer</button>
    </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
}

function showDeleteAccountModal() {
    const overlay = document.createElement('div');
    overlay.id = 'delete-account-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:#000d;z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML = `<div style="width:100%;max-width:380px;background:#0d0d0d;border:1.5px solid #ef444455;border-radius:20px;padding:24px 20px;box-sizing:border-box;">
        <div style="font-size:2rem;text-align:center;margin-bottom:10px;">⚠️</div>
        <div style="font-size:1rem;font-weight:900;color:#fff;text-align:center;margin-bottom:8px;">Supprimer mon compte ?</div>
        <div style="font-size:0.8rem;color:#888;text-align:center;line-height:1.6;margin-bottom:20px;">Cette action est <b style="color:#ef4444;">définitive</b>. Ta progression, tes XP, tes favoris et ton compte seront supprimés pour toujours.</div>
        <button onclick="confirmDeleteAccount()" style="width:100%;padding:13px;background:#ef4444;border:none;border-radius:12px;color:#fff;font-size:0.85rem;font-weight:800;cursor:pointer;margin-bottom:8px;">Oui, supprimer définitivement</button>
        <button onclick="document.getElementById('delete-account-overlay').remove()" style="width:100%;padding:13px;background:#1a1a1a;border:1px solid #333;border-radius:12px;color:#aaa;font-size:0.85rem;cursor:pointer;">Annuler</button>
    </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
}

async function confirmDeleteAccount() {
    const overlay = document.getElementById('delete-account-overlay');
    if (overlay) overlay.innerHTML = '<div style="color:#fff;text-align:center;padding:40px;font-size:0.9rem;">⏳ Suppression en cours...</div>';
    try {
        const user = auth.currentUser;
        const uid = user ? user.uid : null;
        if (uid) {
            try { await deleteDoc(doc(db, "users", uid, "data", "profile")); } catch (_) {}
            try { await deleteDoc(doc(db, "users", uid, "data", "userData")); } catch (_) {}
        }
        if (user) await deleteUser(user);
        try { localStorage.clear(); } catch (_) {}
        if (overlay) overlay.remove();
        showToast('✅ Compte supprimé. À bientôt !');
        setTimeout(() => location.reload(), 1200);
    } catch (e) {
        if (overlay) overlay.remove();
        if (e && e.code === 'auth/requires-recent-login') {
            showToast('🔒 Reconnecte-toi puis réessaie (sécurité Firebase)');
        } else {
            showToast('❌ ' + _firebaseErrMsg(e && e.code));
        }
    }
}

function editProfileName() {
    _showStyledModal({
        title: '✏️ Modifier mon nom',
        inputId: 'ms-modal-name',
        placeholder: 'Prénom et Nom',
        defaultValue: MS.profile?.user || '',
        confirmLabel: 'Enregistrer',
        onConfirm: async (newName, closeModal) => {
            const trimmed = (newName || '').trim();
            if (!trimmed || trimmed === MS.profile?.user) return closeModal();
            if (auth.currentUser) {
                try { await updateProfile(auth.currentUser, { displayName: trimmed }); } catch (_) {}
            }
            await saveProfile({ user: trimmed });
            closeModal();
            showToast('✅ Nom mis à jour !');
            showProfile();
        }
    });
}

// ─────────────────────────────────────────────────────────────
// EXPORT — rendre disponible globalement
//
// 🔧 FIX CRUCIAL : script.js (chargé juste après ce fichier) définit
// SES PROPRES fonctions avec exactement les mêmes noms (handleAuth,
// logout, initAuth, getXPData, showProfile, switchGrade, ...). Comme
// script.js s'exécute après ce module, ses fonctions écrasaient les
// nôtres et l'app retombait silencieusement sur le faux système
// localStorage, même avec Firebase configuré.
//
// On enregistre donc nos overrides dans un listener 'DOMContentLoaded'.
// Ce listener est ajouté ICI, AVANT que script.js ne s'exécute, donc
// il sera appelé EN PREMIER quand l'événement se déclenche — c'est-à-dire
// après que script.js ait fini de tourner et d'écraser nos fonctions,
// mais avant que script.js n'appelle initAuth() (qui se fait plus tard,
// dans son propre callback showSplash). Résultat : nos vraies fonctions
// Firebase reprennent la main au bon moment.
// ─────────────────────────────────────────────────────────────
function _applyFirebaseOverrides() {
    // 🔧 FIX (Maths + Historique) : on capture la VRAIE showGrades() de
    // script.js avant de l'écraser, pour pouvoir la réutiliser plus tard
    // depuis notre version (voir showGrades() plus haut). Au 1er appel
    // (avant DOMContentLoaded), script.js n'a pas encore tourné, donc
    // window.showGrades n'existe pas encore — on ne capture rien, ce
    // n'est pas grave, la capture se fait au 2e appel (DOMContentLoaded),
    // qui arrive après l'exécution complète de script.js.
    if (typeof window.showGrades === 'function'
        && window.showGrades !== showGrades
        && !window._msOrigShowGrades) {
        window._msOrigShowGrades = window.showGrades;
    }
    // 🔧 FIX : même capture pour showProfile (voir commentaire sur la
    // fonction showProfile() plus haut dans ce fichier)
    if (typeof window.showProfile === 'function'
        && window.showProfile !== showProfile
        && !window._msOrigShowProfile) {
        window._msOrigShowProfile = window.showProfile;
    }
    window.initAuth        = initAuth;
    window.resendVerifEmail = resendVerifEmail;
    window.checkEmailVerifiedAndContinue = checkEmailVerifiedAndContinue;
    window.completeGoogleProfile = completeGoogleProfile;
    window.addPasswordToAccount = addPasswordToAccount;
    window.editProfileName = editProfileName;
    window.changeMyPassword = changeMyPassword;
    window.showHelpSupport = showHelpSupport;
    window.showDeleteAccountModal = showDeleteAccountModal;
    window.confirmDeleteAccount = confirmDeleteAccount;
    window.handleAuth      = handleAuth;
    window.handleSocialAuth = handleSocialAuth;
    window.logout          = logout;
    window.handleForgotPassword = handleForgotPassword;
    window.getXPData       = getXPData;
    window.saveXPData      = saveXPData;
    window.updateStreak    = updateStreak;
    window.awardXP         = awardXP;
    // 🔧 FIX (progression jamais sauvegardée sur le serveur) : script.js
    // redéfinit getXPData/saveXPData en versions localStorage-only, et
    // comme il se charge après ce fichier, ses définitions écrasent
    // celles ci-dessus. On expose donc saveUserData sous un nom séparé,
    // que script.js n'a aucune raison de redéclarer, pour que sa version
    // de saveXPData puisse quand même pousser vers Firestore.
    window._msSaveUserData = saveUserData;
    window.toggleLike      = toggleLike;
    window.changeClasse    = changeClasse;
    window.showProfile     = showProfile;
    window.showWelcome     = showWelcome;
    window.showGrades      = showGrades;
    window.switchGrade     = switchGrade;
    window.getUserAccount  = getUserAccount;
    window.getCompletedLessons = getCompletedLessons;
    window.addCompletedLesson = addCompletedLesson;
    window.getLikedLessons = getLikedLessons;
    window.MS              = MS;
    // 🔧 FIX (photo de profil pas synchronisée avec le compte) : exposée
    // pour que script.js puisse envoyer la photo à Firestore — voir
    // window._saveProfilePhoto plus bas dans ce fichier.
    window.saveProfile     = saveProfile;
    // 💬 Espace commentaires public
    window.subscribePublicComments = subscribePublicComments;
    window.postPublicComment       = postPublicComment;
}

// Appliqué une 1ère fois tout de suite (au cas où certaines fonctions
// sont appelées avant DOMContentLoaded), puis une 2ème fois juste après
// pour reprendre la main sur script.js.
_applyFirebaseOverrides();
document.addEventListener('DOMContentLoaded', () => {
    _applyFirebaseOverrides();
    setTimeout(_patchAudioOnEnded, 100);
    setTimeout(_patchAddToHistory, 100);
});

// 🔧 FIX (progression perdue si l'appli est fermée sans passer par
// "Déconnexion") : saveUserData() attend 2s avant d'envoyer à Firestore
// (pour éviter d'écrire à chaque clic). Si l'onglet/l'appli est fermé(e)
// ou mis(e) en arrière-plan avant ces 2s, l'écriture programmée est
// perdue. 'visibilitychange' se déclenche de façon fiable quand l'appli
// passe en arrière-plan sur mobile (contrairement à 'beforeunload', peu
// fiable sur mobile) — on en profite pour forcer l'envoi immédiatement.
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden') return;
    if (_userDataDirty && MS.user) {
        _userDataDirty = false;
        clearTimeout(_syncTimeout);
        try { localStorage.setItem('ms_userData_' + MS.user.uid, JSON.stringify(MS.userData)); } catch (_) {}
        setDoc(
            doc(db, "users", MS.user.uid, "data", "userData"),
            MS.userData,
            { merge: true }
        ).catch(() => {});
    }
});


// ─────────────────────────────────────────────────────────────
// FIRESTORE SECURITY RULES — Colle ça dans ta console Firebase
// ─────────────────────────────────────────────────────────────
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Chaque utilisateur ne peut lire/écrire QUE ses propres données
    match /users/{userId}/data/{document} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 💬 Espace commentaires public : tout le monde peut lire (même
    // déconnecté), seul un utilisateur connecté peut publier — et
    // uniquement en son propre nom (uid = son propre uid). Modification
    // et suppression désactivées côté app : la modération se fait
    // depuis la console Firebase (onglet Firestore) par toi seul.
    match /publicComments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null
                    && request.resource.data.uid == request.auth.uid
                    && request.resource.data.text is string
                    && request.resource.data.text.size() > 0
                    && request.resource.data.text.size() <= 500;
      allow update, delete: if false;
    }

    // Aucun accès par défaut sur tout le reste
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
*/


