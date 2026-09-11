#!/bin/bash
# À lancer dans ~/Desktop/mini-pelle-direct

FILES=(
  "location-mini-pelle-beslé.html"
  "location-mini-pelle-chateaubriant.html"
  "location-mini-pelle-erbray.html"
  "location-mini-pelle-issé.html"
  "location-mini-pelle-jans.html"
  "location-mini-pelle-la-meilleraye-de-bretagne.html"
  "location-mini-pelle-louisfert.html"
  "location-mini-pelle-lusanger.html"
  "location-mini-pelle-marsac-sur-don.html"
  "location-mini-pelle-moisdon-la-riviere.html"
  "location-mini-pelle-noyal-sur-brutz.html"
  "location-mini-pelle-pierric.html"
  "location-mini-pelle-ruffigne.html"
  "location-mini-pelle-saint-aubin-des-chateaux.html"
  "location-mini-pelle-saint-julien-de-vouvantes.html"
  "location-mini-pelle-saint-leger-des-prés.html"
  "location-mini-pelle-saint-nicolas-de-redon.html"
  "location-mini-pelle-saint-vincent-des-landes.html"
  "location-mini-pelle-sion-les-mines.html"
)

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    wrong="https://www.mini-pelle-direct.com/location-mini-pelle-rennes.html"
    correct="https://www.mini-pelle-direct.com/$f"
    # macOS sed nécessite une extension de backup après -i
    sed -i '' "s|${wrong}|${correct}|g" "$f"
    echo "✅ Corrigé : $f"
  else
    echo "⚠️  Introuvable : $f"
  fi
done

echo ""
echo "--- Vérification ---"
for f in "${FILES[@]}"; do
  canon=$(grep -o 'rel="canonical" href="[^"]*"' "$f" | sed 's/.*href="//;s/"//')
  echo "$f | $canon"
done
