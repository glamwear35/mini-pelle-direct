import re
import sys
import glob
import os

# Liste des 45 fichiers à traiter (les autres ont déjà été corrigés manuellement)
FICHIERS_DEJA_CORRIGES = {
    "location-mini-pelle-rennes.html", "location-mini-pelle-bruz.html",
    "location-mini-pelle-chateaugiron.html", "location-mini-pelle-maure-de-bretagne.html",
    "location-mini-pelle-martigne-ferchaud.html", "location-mini-pelle-marcille-robert.html",
    "location-mini-pelle-la-meilleraye-de-bretagne.html", "location-mini-pelle-chelun.html",
    "location-mini-pelle-visseiche.html", "location-mini-pelle-pont-pean.html",
    "location-mini-pelle-vern-sur-seiche.html", "location-mini-pelle-guerche-de-bretagne.html",
    "location-mini-pelle-saulnieres.html", "location-mini-pelle-brielles.html",
    "location-mini-pelle-amanlis.html", "location-mini-pelle-essé.html",
    "location-mini-pelle-noyal-sur-vilaine.html", "location-mini-pelle-saint-julien-de-vouvantes.html",
    "location-mini-pelle-ille-et-vilaine.html",
}

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    commune_match = re.search(r'<h1>Location Mini Pelle <span>([^<]+)</span></h1>', content)
    commune = commune_match.group(1) if commune_match else "cette commune"

    # --- Pattern A: bloc "X se situe à environ Y km de notre dépôt. La livraison est possible sur devis..." ---
    content = re.sub(
        r'([A-ZÀ-Ÿ][a-zà-ÿ\'\-]+(?:[\s\-][A-ZÀ-Ÿ][a-zà-ÿ\'\-]+)*) se situe à environ \d+ km de notre dépôt\. La livraison est possible sur devis selon la zone exacte d\'intervention\. (Appelez-nous au|Contactez-nous au) <strong>?06 99 16 87 77<\/strong>? (pour obtenir un devis personnalisé incluant la livraison\.|pour organiser la livraison sur votre chantier\.)',
        lambda m: f"{m.group(1)} se situe à proximité de notre rayon de livraison de 30 km depuis Saint-Sulpice-des-Landes. La livraison reste possible, avec un éventuel supplément selon l'adresse exacte. {m.group(2)} 06 99 16 87 77 {m.group(3)}",
        content
    )

    # --- Pattern B: "<strong>Mini Pelle Direct</strong> intervient à <strong>X</strong>, à seulement Y km de notre base à Bain-de-Bretagne." ---
    content = re.sub(
        r'(<strong>Mini Pelle Direct<\/strong> intervient à <strong>[^<]+<\/strong>), à seulement \d+ km de notre base à Bain-de-Bretagne\.',
        r'\1, dans la limite de notre forfait livraison de 30 km depuis notre base à Saint-Sulpice-des-Landes (proche Bain-de-Bretagne).',
        content
    )

    # --- Pattern C: "<p>Livraison sur chantier à X (CP) — À seulement Y km de notre dépôt</p>" ---
    content = re.sub(
        r'(<p>Livraison sur chantier à [^(]+\([0-9]+\)) — À seulement \d+ km de notre dépôt<\/p>',
        r'\1 — forfait 30 km depuis notre dépôt</p>',
        content
    )

    # --- Pattern D: "basé à Bain-de-Bretagne (35470), livre ses engins directement sur votre site à <strong>X (CP)</strong>, à seulement Y km." ---
    content = re.sub(
        r'basé à Bain-de-Bretagne \(35470\), livre ses engins directement sur votre site à (<strong>[^<]+<\/strong>), à seulement \d+ km\.',
        r'basé à Saint-Sulpice-des-Landes (proche Bain-de-Bretagne), livre ses engins directement sur votre site à \1, dans la limite de notre forfait 30 km.',
        content
    )

    # --- Pattern E: avantages block "<strong>Livraison à X</strong><span>Dépôt et reprise sur site, Y km</span>" ---
    content = re.sub(
        r'(<strong>Livraison à [^<]+<\/strong><span>Dépôt et reprise sur site,) \d+ km(<\/span>)',
        r'\1 forfait 30 km*\2',
        content
    )

    # --- Pattern F: FAQ "Oui, nous livrons à X (CP) qui se situe à environ Y km de notre dépôt à Bain-de-Bretagne. La livraison aller-retour est de 90€ pour la KPC KT562 et 89€ pour la Kubota D902 1T5." ---
    content = re.sub(
        r'Oui, nous livrons à ([^(]+\([0-9]+\)) qui se situe à environ \d+ km de notre dépôt à Bain-de-Bretagne\. La livraison aller-retour est de 90€ pour la KPC KT562 et 89€ pour la Kubota D902 1T5\.',
        lambda m: f"Oui, nous livrons à {m.group(1)}. Notre forfait de 90€ (KPC) et 89€ (Kubota) s'applique dans un rayon de 30 km depuis Saint-Sulpice-des-Landes ; selon votre adresse exacte, un léger supplément peut s'appliquer. Appelez-nous pour un tarif précis.",
        content
    )

    # --- Pattern G: meta description "Location et vente de mini pelles avec livraison à X (CP) en Y km" ---
    content = re.sub(
        r'(Location et vente de mini pelles avec livraison à [^(]+\([0-9]+\)) en \d+ km',
        r'\1, forfait 30 km',
        content
    )

    # --- Pattern H: JSON-LD FAQ "La livraison à X (CP) est de 90€ pour la KPC KT562 800kg et 89€ pour la Kubota D902 1T5. Mini Pelle Direct est situé à Y km de X." ---
    content = re.sub(
        r'La livraison à ([^(]+\([0-9]+\)) est de 90€ pour la KPC KT562 800kg et 89€ pour la Kubota D902 1T5\. Mini Pelle Direct est situé à \d+ km de [^."]+\.',
        lambda m: f"Le forfait de 90€ (KPC) et 89€ (Kubota) s'applique dans un rayon de 30 km depuis notre dépôt à Saint-Sulpice-des-Landes. Selon l'adresse exacte, un léger supplément peut s'appliquer — devis précis au 06 99 16 87 77.",
        content
    )

    # --- Pattern I: bas de page "Livraison et reprise incluses dans notre tarif. Intervention rapide à X et dans toute la zone Ille-et-Vilaine." ---
    content = re.sub(
        r'Livraison et reprise incluses dans notre tarif\. Intervention rapide à [^.]+ et dans toute la zone Ille-et-Vilaine\.',
        r"* Tarif valable dans notre rayon de 30 km depuis Saint-Sulpice-des-Landes ; selon l'adresse exacte, un léger supplément peut s'appliquer. Intervention rapide dans toute la zone Ille-et-Vilaine.",
        content
    )

    # --- Pattern J: "à seulement Y km de notre base à Bain-de-Bretagne." (template B variant for "sur devis" pages) ---
    content = re.sub(
        r'à seulement \d+ km de notre base à Bain-de-Bretagne\.',
        r'à proximité de notre forfait livraison de 30 km depuis Saint-Sulpice-des-Landes (proche Bain-de-Bretagne) — devis précis sur demande.',
        content
    )

    # --- Pattern K: machine cards "Livraison à X : 90€</div>" -> add asterisk if not already starred ---
    content = re.sub(
        r'(Livraison à [^:]+: )(90€|89€)(<\/div>)(?!\*)',
        r'\1\2*\3',
        content
    )

    changed = (content != original)
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    return changed

if __name__ == "__main__":
    target_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    files = sorted(glob.glob(os.path.join(target_dir, "location-mini-pelle-*.html")))
    files = [f for f in files if os.path.basename(f) not in FICHIERS_DEJA_CORRIGES]
    
    modified = []
    unmodified = []
    for f in files:
        if fix_file(f):
            modified.append(os.path.basename(f))
        else:
            unmodified.append(os.path.basename(f))
    
    print(f"Fichiers modifiés ({len(modified)}):")
    for f in modified:
        print(f"  ✓ {f}")
    print(f"\nFichiers NON modifiés ({len(unmodified)}) — à vérifier manuellement:")
    for f in unmodified:
        print(f"  ⚠ {f}")
