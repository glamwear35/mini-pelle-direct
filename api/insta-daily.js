// api/insta-daily.js — Agent Instagram Mini Pelle Direct
const PILLARS = [
  "chantier_client",
  "conseil_technique",
  "machine_vedette",
  "offre_promo",
  "temoignage",
  "coulisses",
  "question_audience",
];

const TOTAL_IMAGES = 35;
const BASE_URL = "https://www.mini-pelle-direct.com/images-instagram";

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Non autorisé" });
  }

  try {
    // 1. Choisir pilier et image du jour
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const pillar = PILLARS[dayOfYear % PILLARS.length];
    const imageIndex = (dayOfYear % TOTAL_IMAGES) + 1;
    const imageUrl = `${BASE_URL}/insta-${String(imageIndex).padStart(2, '0')}.jpg`;

    // 2. Générer le texte avec Claude
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        messages: [{
          role: "user",
          content: `Tu es le community manager de Mini Pelle Direct, entreprise de location et vente de mini pelles basée en Bretagne (Saint-Sulpice-des-Landes, 35).

Rédige un post Instagram sur le thème : "${pillar}"

Règles :
- Ton authentique, proche, professionnel mais pas corporate
- Maximum 150 mots
- 3 à 5 hashtags pertinents à la fin (#minipelle #bretagne #terrassement etc.)
- Toujours finir par un call-to-action (appel, DM, lien bio)
- Pas d'emojis excessifs, maximum 3

Réponds uniquement avec le texte du post, rien d'autre.`
        }],
      }),
    });

    const anthropicData = await anthropicRes.json();
    if (!anthropicData.content || !anthropicData.content[0]) {
      throw new Error(`Réponse Anthropic invalide: ${JSON.stringify(anthropicData)}`);
    }
    const caption = anthropicData.content[0].text.trim();

    // 3. Récupérer l'ID Instagram via la Page Facebook
    const igRes = await fetch(
      `https://graph.facebook.com/v19.0/${process.env.PAGE_ID}?fields=instagram_business_account&access_token=${process.env.META_PAGE_TOKEN}`
    );
    const igData = await igRes.json();

    if (!igData.instagram_business_account) {
      throw new Error(`Compte Instagram non trouvé: ${JSON.stringify(igData)}`);
    }
    const igUserId = igData.instagram_business_account.id;

    // 4. Créer le container média
    const containerRes = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
          access_token: process.env.META_PAGE_TOKEN,
        }),
      }
    );
    const containerData = await containerRes.json();

    if (!containerData.id) {
      throw new Error(`Erreur création container: ${JSON.stringify(containerData)}`);
    }

    // 5. Publier
    const publishRes = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: process.env.META_PAGE_TOKEN,
        }),
      }
    );
    const publishData = await publishRes.json();

    if (!publishData.id) {
      throw new Error(`Erreur publication: ${JSON.stringify(publishData)}`);
    }

    console.log(`✅ Post publié — ID: ${publishData.id} — Pilier: ${pillar} — Image: insta-${String(imageIndex).padStart(2, '0')}.jpg`);
    return res.status(200).json({
      success: true,
      post_id: publishData.id,
      pillar: pillar,
      image: imageUrl,
      caption: caption,
    });

  } catch (error) {
    console.error("❌ Erreur:", error.message);
    return res.status(500).json({ error: error.message });
  }
}