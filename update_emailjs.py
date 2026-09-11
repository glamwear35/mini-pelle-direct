#!/usr/bin/env python3"""
Mini Pelle Direct — Mise à jour EmailJS dans chatbot-mpd.js
"""
from pathlib import Path

JS_PATH = Path.home() / "Desktop" / "mini-pelle-direct" / "chatbot-mpd.js"

PUBLIC_KEY  = "DacAC6gXgD340-WQX"
SERVICE_ID  = "service_minipelle"
TEMPLATE_ID = "szycjxq"

# 1. Lire le fichier
content = JS_PATH.read_text(encoding="utf-8")

# 2. Remplacer le template ID dans sendNotif
old_template = "'template_mpd_prospect'"
new_template  = f"'{TEMPLATE_ID}'"
content = content.replace(old_template, new_template)

# 3. Ajouter le chargement EmailJS + init en tête du fichier (une seule fois)
emailjs_loader = f"""
/* EmailJS — chargé automatiquement */
(function(){{
  if (document.getElementById('emailjs-sdk')) return;
  var s = document.createElement('script');
  s.id = 'emailjs-sdk';
  s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  s.onload = function() {{ emailjs.init('{PUBLIC_KEY}'); }};
  document.head.appendChild(s);
}})();
"""

if "emailjs-sdk" not in content:
    content = emailjs_loader + "\n" + content

# 4. Écrire
JS_PATH.write_text(content, encoding="utf-8")
print(f"✅ chatbot-mpd.js mis à jour avec EmailJS")
print(f"   Service  : {SERVICE_ID}")
print(f"   Template : {TEMPLATE_ID}")
print(f"   Clé pub  : {PUBLIC_KEY}")
print(f"\n🚀 Lance maintenant : vercel --prod")
