import re
import glob
import os
import json
import sys

def audit_file(filepath):
    issues = []
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    fname = os.path.basename(filepath)

    # 1. Codes postaux multiples incohérents
    cps = sorted(set(re.findall(r'\((\d{5})\)', content)))
    if len(cps) > 1:
        issues.append(f"Codes postaux multiples: {cps}")

    # 2. Balises de base manquantes
    if content.count('<html') != 1:
        issues.append(f"Nombre de balises <html> anormal: {content.count('<html')}")
    if content.count('</html>') != 1:
        issues.append(f"Nombre de balises </html> anormal: {content.count('</html>')}")
    if '<title>' not in content:
        issues.append("Balise <title> manquante")
    if 'name="description"' not in content:
        issues.append("Meta description manquante")
    if '<h1' not in content:
        issues.append("Balise H1 manquante")
    if content.count('<h1') > 1:
        issues.append(f"Plusieurs H1 trouvés: {content.count('<h1')}")

    # 3. JSON-LD valide
    scripts = re.findall(r'<script type="application/ld\+json">(.*?)</script>', content, re.DOTALL)
    for i, s in enumerate(scripts):
        try:
            json.loads(s)
        except Exception as e:
            issues.append(f"JSON-LD invalide (bloc {i+1}): {str(e)[:80]}")

    # 4. Téléphone cohérent
    phones = set(re.findall(r'0[1-9](?:[\s.]?\d{2}){4}', content))
    phones_clean = set(p.replace(' ', '').replace('.', '') for p in phones)
    if len(phones_clean) > 1:
        issues.append(f"Numéros de téléphone différents: {phones}")

    # 5. Liens internes vers fichiers (vérifie existence basique du pattern)
    internal_links = re.findall(r'href="(/[a-zA-Z0-9\-_./]+\.html)"', content)
    
    # 6. Email cohérent
    emails = set(re.findall(r'[\w.+-]+@[\w-]+\.[\w.-]+', content))
    if len(emails) > 1:
        issues.append(f"Emails différents trouvés: {emails}")

    # 7. SIRET présent et cohérent (doit être 52224467200039)
    sirets = set(re.findall(r'SIRET\s*:?\s*(\d{14})', content))
    for s in sirets:
        if s != "52224467200039":
            issues.append(f"SIRET incorrect trouvé: {s}")

    # 8. Prix incohérents pour les machines (130/160 attendus en base journée)
    if 'KT562' in content or 'KPC' in content:
        prix_kpc = set(re.findall(r'KPC[^€]*?(\d{2,4})€', content))
    
    # 9. Distance ou km suspects restants (ancien pattern "à seulement X km" non corrigé)
    old_pattern = re.findall(r'à seulement \d+ km', content)
    if old_pattern:
        issues.append(f"Ancien pattern 'à seulement X km' non corrigé: {old_pattern}")

    # 10. Année copyright cohérente
    years = set(re.findall(r'©\s*(\d{4})', content))
    
    # 11. Caractères mal encodés (mojibake commun)
    if 'Ã©' in content or 'Ã¨' in content or 'â€™' in content:
        issues.append("Possible problème d'encodage (mojibake détecté)")

    # 12. Liens vers HTTP non sécurisé
    if re.search(r'href="http://(?!localhost)', content):
        issues.append("Lien http:// non sécurisé trouvé")

    return issues, internal_links, emails, phones_clean, years

def main(target_dir):
    files = sorted(glob.glob(os.path.join(target_dir, "location-mini-pelle-*.html")))
    
    all_files_set = set(os.path.basename(f) for f in files)
    all_links = {}
    all_emails = set()
    all_phones = set()
    all_years = set()
    
    print("=" * 70)
    print("AUDIT DÉTAILLÉ PAR FICHIER")
    print("=" * 70)
    
    total_issues = 0
    for filepath in files:
        issues, links, emails, phones, years = audit_file(filepath)
        all_emails |= emails
        all_phones |= phones
        all_years |= years
        all_links[os.path.basename(filepath)] = links
        
        if issues:
            total_issues += len(issues)
            print(f"\n📄 {os.path.basename(filepath)}")
            for issue in issues:
                print(f"   ⚠️  {issue}")
    
    print("\n" + "=" * 70)
    print("RÉSUMÉ GLOBAL")
    print("=" * 70)
    print(f"Total fichiers analysés: {len(files)}")
    print(f"Total problèmes détectés: {total_issues}")
    print(f"\nEmails uniques trouvés sur le site: {all_emails}")
    print(f"Téléphones uniques trouvés sur le site: {all_phones}")
    print(f"Années de copyright trouvées: {all_years}")
    
    # Vérification des liens internes brisés (fichiers cibles n'existant pas)
    print("\n" + "=" * 70)
    print("LIENS INTERNES VERS DES PAGES MANQUANTES")
    print("=" * 70)
    broken_links_found = False
    for fname, links in all_links.items():
        for link in links:
            target = os.path.basename(link)
            target_path = os.path.join(target_dir, target)
            if not os.path.exists(target_path) and target.startswith("location-mini-pelle"):
                print(f"  {fname} -> lien cassé: {link}")
                broken_links_found = True
    if not broken_links_found:
        print("  Aucun lien interne cassé détecté (pour liens location-mini-pelle-*).")

if __name__ == "__main__":
    target_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    main(target_dir)
