// ============================================================
// MUSICSCHOOL — Proxy serveur vers l'API Groq
// La clé API ne quitte JAMAIS le serveur : elle est lue depuis
// la variable d'environnement Netlify GROQ_API_KEY (à créer
// dans Site settings → Environment variables).
//
// Le front (script.js) appelle désormais /.netlify/functions/groq-chat
// exactement comme il appelait avant api.groq.com/openai/v1/chat/completions,
// avec le même corps JSON (model, messages, stream, ...) mais SANS
// header Authorization — ce fichier l'ajoute lui-même.
//
// Le streaming (Server-Sent Events) est transmis tel quel au client,
// donc le code de lecture du flux dans script.js n'a pas besoin de changer.
// ============================================================

export default async (req) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: { message: 'Méthode non autorisée' } }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: { message: "Clé API Groq manquante côté serveur (variable d'environnement GROQ_API_KEY non définie)" } }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    let body;
    try {
        body = await req.text();
    } catch (e) {
        return new Response(JSON.stringify({ error: { message: 'Corps de requête invalide' } }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    let groqResp;
    try {
        groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: { message: 'Erreur réseau vers Groq : ' + e.message } }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // On retransmet tel quel (streaming SSE inclus) — même statut, même corps.
    return new Response(groqResp.body, {
        status: groqResp.status,
        headers: {
            'Content-Type': groqResp.headers.get('Content-Type') || 'application/json'
        }
    });
};

export const config = {
    path: '/.netlify/functions/groq-chat'
};
