import re
import glob
import os
import json
import sys

def extract_info(content, fname):
    """Extrait les informations nécessaires depuis le HTML existant."""
    info = {}

    # Nom de la commune depuis le H1 (deux formats possibles sur le site)
    m = re.search(r'<h1>Location Mini Pelle <span>([^<]+)</span></h1>', content)
    if not m:
        m = re.search(r'<h1>Location Mini Pelle à ([^(<]+?)\s*\(\d{5}\)</h1>', content)
    if not m:
        m = re.search(r'<h1>Location Mini Pelle à ([^<]+)</h1>', content)
    info['commune'] = m.group(1).strip() if m else None

    # Code postal depuis areaServed existant ou meta description
    m = re.search(r'"name":\s*"' + re.escape(info['commune']) + r'"\s*,\s*"postalCode":\s*"(\d{5})"', content) if info['commune'] else None
    if not m:
        m = re.search(r'\((\d{5})\)', content)
    info['cp'] = m.group(1) if m else "35000"

    # URL canonique
    m = re.search(r'<link rel="canonical" href="([^"]+)"', content)
    info['url'] = m.group(1) if m else f"https://www.mini-pelle-direct.com/{fname}"

    # Description meta
    m = re.search(r'name="description" content="([^"]+)"', content)
    info['meta_desc'] = m.group(1) if m else f"Location et vente de mini pelles avec livraison à {info['commune']}"

    # FAQ existante (question/réponse livraison + tarif)
    faq_items = []
    # Cherche dans les blocs faq-item visibles (texte HTML, plus fiable que le JSON cassé)
    faq_blocks = re.findall(
        r'<button class="faq-question"[^>]*>([^<]+?)\s*<span class="faq-arrow">.*?<div class="faq-answer">(.*?)</div>',
        content, re.DOTALL
    )
    for q, a in faq_blocks[:4]:  # max 4 pour rester raisonnable
        q_clean = q.strip()
        a_clean = re.sub(r'<[^>]+>', '', a).strip()
        a_clean = re.sub(r'\s+', ' ', a_clean)
        if q_clean and a_clean:
            faq_items.append({"@type": "Question", "name": q_clean,
                               "acceptedAnswer": {"@type": "Answer", "text": a_clean}})
    info['faq_items'] = faq_items

    return info

def build_jsonld(info):
    commune = info['commune']
    cp = info['cp']
    url = info['url']
    meta_desc = info['meta_desc']

    data = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Mini Pelle Direct",
        "description": meta_desc,
        "url": url,
        "telephone": "+33699168777",
        "email": "minipelledirect@gmail.com",
        "image": "https://www.mini-pelle-direct.com/logo%20mini%20pelle%20direct.png",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Saint-Sulpice-des-Landes",
            "postalCode": "35390",
            "addressCountry": "FR"
        },
        "areaServed": {
            "@type": "City",
            "name": commune,
            "postalCode": cp
        },
        "makesOffer": [
            {
                "@type": "Offer",
                "name": f"Location mini pelle KPC KT562 800kg à {commune}",
                "priceCurrency": "EUR",
                "price": "130",
                "priceSpecification": {
                    "@type": "UnitPriceSpecification",
                    "price": "130",
                    "priceCurrency": "EUR",
                    "unitText": "jour"
                }
            },
            {
                "@type": "Offer",
                "name": f"Location mini pelle Kubota D902 1,5T à {commune}",
                "priceCurrency": "EUR",
                "price": "160",
                "priceSpecification": {
                    "@type": "UnitPriceSpecification",
                    "price": "160",
                    "priceCurrency": "EUR",
                    "unitText": "jour"
                }
            }
        ]
    }

    blocks = [json.dumps(data, indent=2, ensure_ascii=False)]

    if info['faq_items']:
        faq_data = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": info['faq_items']
        }
        blocks.append(json.dumps(faq_data, indent=2, ensure_ascii=False))

    return blocks

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    fname = os.path.basename(filepath)

    info = extract_info(content, fname)
    if not info['commune']:
        return "SKIPPED_NO_H1", None

    new_blocks = build_jsonld(info)

    # Remplace TOUS les scripts ld+json existants par les nouveaux blocs reconstruits
    pattern = re.compile(r'<script type="application/ld\+json">.*?</script>', re.DOTALL)
    matches = list(pattern.finditer(content))
    if not matches:
        return "NO_SCRIPT_FOUND", None

    # Remplace le premier bloc par tous les nouveaux, supprime les blocs suivants
    new_scripts_html = "\n  ".join(
        f'<script type="application/ld+json">\n{block}\n  </script>' for block in new_blocks
    )

    # On retire tous les anciens blocs et on insère les nouveaux à la position du premier
    first_start = matches[0].start()
    last_end = matches[-1].end()
    new_content = content[:first_start] + new_scripts_html + content[last_end:]

    # Validation finale
    check_pattern = re.compile(r'<script type="application/ld\+json">(.*?)</script>', re.DOTALL)
    for m in check_pattern.finditer(new_content):
        try:
            json.loads(m.group(1))
        except Exception as e:
            return f"VALIDATION_FAILED: {e}", None

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    return "REBUILT", len(new_blocks)

def main(target_dir):
    files = sorted(glob.glob(os.path.join(target_dir, "location-mini-pelle-*.html")))
    
    rebuilt = 0
    skipped = []
    failed = []

    for filepath in files:
        fname = os.path.basename(filepath)
        status, detail = process_file(filepath)
        if status == "REBUILT":
            rebuilt += 1
            print(f"✅ {fname} : reconstruit ({detail} bloc(s) JSON-LD)")
        elif status.startswith("VALIDATION_FAILED"):
            failed.append((fname, status))
            print(f"❌ {fname} : {status}")
        else:
            skipped.append((fname, status))
            print(f"⏭️  {fname} : {status}")

    print(f"\n{'='*60}")
    print(f"Reconstruits avec succès : {rebuilt}")
    print(f"Ignorés (pas de H1 ou pas de script) : {len(skipped)}")
    print(f"Échecs de validation : {len(failed)}")

if __name__ == "__main__":
    target_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    main(target_dir)
