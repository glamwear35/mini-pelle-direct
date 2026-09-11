import re
import glob
import os
import json
import sys

def fix_jsonld_block(json_str):
    """
    Corrige le pattern de bug récurrent :
    "itemOffered": { ... }   <- manque une virgule ici
  "offers": { ... },          <- ce bloc devrait être une propriété sœur de itemOffered, pas un nouvel élément flottant
    On insère une virgule après la fermeture de itemOffered quand elle est immédiatement suivie de "offers".
    """
    # Insère une virgule entre la fermeture de itemOffered et le début de "offers"
    fixed = re.sub(
        r'(\}\s*)\n(\s*"offers":\s*\{)',
        r'\1,\n\2',
        json_str
    )
    return fixed

def try_parse(s):
    try:
        json.loads(s)
        return True, None
    except Exception as e:
        return False, str(e)

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    pattern = re.compile(r'(<script type="application/ld\+json">)(.*?)(</script>)', re.DOTALL)
    matches = list(pattern.finditer(content))
    
    changed = False
    new_content = content
    offset = 0
    
    results = []
    for m in matches:
        raw_json = m.group(2)
        valid_before, err_before = try_parse(raw_json)
        if valid_before:
            results.append(("OK", None))
            continue
        
        fixed_json = fix_jsonld_block(raw_json)
        valid_after, err_after = try_parse(fixed_json)
        
        if valid_after:
            new_content = new_content.replace(raw_json, fixed_json, 1)
            changed = True
            results.append(("FIXED", None))
        else:
            results.append(("STILL_BROKEN", err_after))
    
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
    
    return results

def main(target_dir):
    files = sorted(glob.glob(os.path.join(target_dir, "location-mini-pelle-*.html")))
    
    fixed_count = 0
    still_broken = []
    already_ok = []
    
    for filepath in files:
        fname = os.path.basename(filepath)
        results = process_file(filepath)
        statuses = [r[0] for r in results]
        
        if "STILL_BROKEN" in statuses:
            still_broken.append((fname, [r[1] for r in results if r[0] == "STILL_BROKEN"]))
        elif "FIXED" in statuses:
            fixed_count += 1
            print(f"✅ {fname} : corrigé")
        else:
            already_ok.append(fname)
    
    print(f"\n{'='*60}")
    print(f"Total corrigés : {fixed_count}")
    print(f"Déjà OK : {len(already_ok)}")
    print(f"Toujours cassés : {len(still_broken)}")
    if still_broken:
        print("\nFichiers nécessitant une correction manuelle :")
        for fname, errs in still_broken:
            print(f"  ❌ {fname} : {errs}")

if __name__ == "__main__":
    target_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    main(target_dir)
