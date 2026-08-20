
(function(){
  if (document.getElementById("emailjs-sdk")) return;
  var s = document.createElement("script");
  s.id = "emailjs-sdk";
  s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
  s.onload = function() { emailjs.init("DacAC6gXgD340-WQX"); };
  document.head.appendChild(s);
})();
/* ============================================================
   Mini Pelle Direct — Chatbot commercial 24h/24
   Version 1.0 — inject_chatbot.py
   ============================================================ */

(function() {
  if (document.getElementById('mpd-chatbot-loaded')) return;
  const marker = document.createElement('meta');
  marker.id = 'mpd-chatbot-loaded';
  document.head.appendChild(marker);

  // ── STYLES ──────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@700;800&display=swap');
    #mpd-trigger {
      position:fixed; bottom:24px; right:24px; width:64px; height:64px;
      background:#FFD700; border-radius:50%; border:none; cursor:pointer;
      box-shadow:0 4px 20px rgba(0,0,0,.3); display:flex; align-items:center;
      justify-content:center; z-index:9998; transition:transform .2s,box-shadow .2s;
    }
    #mpd-trigger:hover { transform:scale(1.08); box-shadow:0 6px 28px rgba(0,0,0,.4); }
    #mpd-trigger svg { width:30px; height:30px; }
    #mpd-badge {
      position:fixed; bottom:98px; right:22px; background:#111; color:#FFD700;
      font-family:'Barlow',sans-serif; font-size:12px; font-weight:600;
      padding:5px 10px; border-radius:20px; white-space:nowrap; z-index:9999;
      box-shadow:0 2px 10px rgba(0,0,0,.2); animation:mpd-pulse 2s ease-in-out infinite;
    }
    @keyframes mpd-pulse { 0%,100%{opacity:1;transform:translateY(0)} 50%{opacity:.8;transform:translateY(-2px)} }
    #mpd-window {
      position:fixed; bottom:100px; right:24px; width:370px; max-height:580px;
      background:#fff; border-radius:16px; box-shadow:0 8px 40px rgba(0,0,0,.18);
      display:none; flex-direction:column; z-index:9997; overflow:hidden;
      font-family:'Barlow',sans-serif;
    }
    #mpd-window.mpd-open { display:flex; animation:mpd-slide .25s ease; }
    @keyframes mpd-slide { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    #mpd-header { background:#111; padding:14px 16px; display:flex; align-items:center; gap:10px; flex-shrink:0; }
    .mpd-avatar { width:38px; height:38px; background:#FFD700; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
    .mpd-hname { font-family:'Barlow Condensed',sans-serif; font-weight:800; font-size:15px; color:#FFD700; }
    .mpd-hstatus { font-size:11px; color:#aaa; display:flex; align-items:center; gap:4px; }
    .mpd-dot { width:7px; height:7px; background:#4CAF50; border-radius:50%; animation:mpd-blink 1.5s infinite; }
    @keyframes mpd-blink { 0%,100%{opacity:1} 50%{opacity:.4} }
    #mpd-close { background:none; border:none; color:#666; cursor:pointer; font-size:20px; padding:4px; }
    #mpd-close:hover { color:#fff; }
    #mpd-messages { flex:1; overflow-y:auto; padding:16px 14px; display:flex; flex-direction:column; gap:10px; background:#f8f8f8; scroll-behavior:smooth; }
    #mpd-messages::-webkit-scrollbar { width:4px; }
    #mpd-messages::-webkit-scrollbar-thumb { background:#ddd; border-radius:2px; }
    .mpd-msg { max-width:85%; padding:10px 13px; border-radius:14px; font-size:14px; line-height:1.5; word-break:break-word; }
    .mpd-msg.bot { background:#fff; color:#111; border-bottom-left-radius:4px; box-shadow:0 1px 4px rgba(0,0,0,.08); align-self:flex-start; }
    .mpd-msg.user { background:#FFD700; color:#111; border-bottom-right-radius:4px; align-self:flex-end; font-weight:500; }
    .mpd-typing { display:flex; gap:4px; padding:12px 14px; background:#fff; border-radius:14px; border-bottom-left-radius:4px; width:fit-content; box-shadow:0 1px 4px rgba(0,0,0,.08); align-self:flex-start; }
    .mpd-typing span { width:7px; height:7px; background:#bbb; border-radius:50%; animation:mpd-bounce 1.2s infinite; }
    .mpd-typing span:nth-child(2){animation-delay:.2s} .mpd-typing span:nth-child(3){animation-delay:.4s}
    @keyframes mpd-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px);background:#FFD700} }
    #mpd-quick { padding:8px 14px; display:flex; flex-wrap:wrap; gap:6px; background:#f8f8f8; border-top:1px solid #eee; flex-shrink:0; min-height:10px; }
    .mpd-qr { background:#fff; border:1.5px solid #FFD700; color:#111; font-family:'Barlow',sans-serif; font-size:12px; font-weight:600; padding:5px 10px; border-radius:20px; cursor:pointer; transition:background .15s; white-space:nowrap; }
    .mpd-qr:hover { background:#FFD700; }
    #mpd-input-area { padding:10px 12px; display:flex; gap:8px; background:#fff; border-top:1px solid #eee; flex-shrink:0; }
    #mpd-input { flex:1; border:1.5px solid #e0e0e0; border-radius:22px; padding:9px 14px; font-family:'Barlow',sans-serif; font-size:13px; outline:none; transition:border-color .2s; background:#f8f8f8; }
    #mpd-input:focus { border-color:#FFD700; background:#fff; }
    #mpd-send { width:38px; height:38px; background:#FFD700; border:none; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background .15s,transform .1s; }
    #mpd-send:hover { background:#e6c200; transform:scale(1.05); }
    .mpd-cform { background:#fff; border:1.5px solid #FFD700; border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:8px; align-self:flex-start; max-width:88%; box-shadow:0 2px 8px rgba(0,0,0,.07); }
    .mpd-cform input { border:1.5px solid #e0e0e0; border-radius:8px; padding:8px 10px; font-family:'Barlow',sans-serif; font-size:13px; outline:none; }
    .mpd-cform input:focus { border-color:#FFD700; }
    .mpd-cform button { background:#FFD700; border:none; border-radius:8px; padding:9px; font-family:'Barlow',sans-serif; font-weight:700; font-size:13px; cursor:pointer; }
    .mpd-cform button:hover { background:#e6c200; }
    .mpd-dcard { background:#111; color:#fff; border-radius:12px; padding:13px; align-self:flex-start; max-width:88%; font-size:13px; }
    .mpd-dcard-title { font-family:'Barlow Condensed',sans-serif; font-size:15px; font-weight:800; color:#FFD700; margin-bottom:6px; }
    .mpd-dcard-line { margin:3px 0; }
    .mpd-dcard-total { margin-top:8px; padding-top:8px; border-top:1px solid #333; font-weight:700; font-size:15px; color:#FFD700; }
    @media(max-width:420px){ #mpd-window{width:calc(100vw - 20px);right:10px;} }
  `;
  document.head.appendChild(style);

  // ── HTML ────────────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', `
    <div id="mpd-badge">🚜 Devis gratuit en 30 sec</div>
    <button id="mpd-trigger" aria-label="Ouvrir le chat">
      <svg id="mpd-icon-chat" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg id="mpd-icon-close" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round" style="display:none">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
    <div id="mpd-window">
      <div id="mpd-header">
        <div class="mpd-avatar">🚜</div>
        <div style="flex:1">
          <div class="mpd-hname">Mini Pelle Direct</div>
          <div class="mpd-hstatus"><span class="mpd-dot"></span> Assistant disponible 24h/24</div>
        </div>
        <button id="mpd-close">✕</button>
      </div>
      <div id="mpd-messages"></div>
      <div id="mpd-quick"></div>
      <div id="mpd-input-area">
        <input id="mpd-input" type="text" placeholder="Posez votre question..." autocomplete="off">
        <button id="mpd-send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  `);

  // ── LOGIQUE ─────────────────────────────────────────────
  let chatOpen = false, started = false, step = 'start', devisData = {};

  const MACHINES = {
    kpc:    { nom:'KPC KT562', poids:'800 kg', profil:'Compacte et maniable, idéale pour accès restreints et travaux légers', tarifs:{journee:130,weekend:250,semaine:450}, livraison:69 },
    kubota: { nom:'Kubota D902', poids:'1,5 tonne', profil:'Puissante et polyvalente, parfaite pour terrassements et travaux importants', tarifs:{journee:160,weekend:300,semaine:600}, livraison:89, pack:{prix:19990} }
  };


  // ── Message de relance après 30s d'inactivité ───────────
  let relanceTimer = null;
  let relanceDone = false;

  function resetRelanceTimer() {
    if (relanceDone) return;
    clearTimeout(relanceTimer);
    relanceTimer = setTimeout(async () => {
      if (!chatOpen || relanceDone) return;
      relanceDone = true;
      addMsg('👋 Vous êtes toujours là ? Je peux vous faire un devis gratuit en 30 secondes !', 'bot');
      setQR([
        {label:'Oui, je veux un devis', value:'Louer une machine'},
        {label:'Je préfère appeler', value:'Parler à Alex'},
      ]);
    }, 30000);
  }

  function toggleChat() {
    chatOpen = !chatOpen;
    document.getElementById('mpd-window').classList.toggle('mpd-open', chatOpen);
    document.getElementById('mpd-icon-chat').style.display = chatOpen ? 'none' : 'block';
    document.getElementById('mpd-icon-close').style.display = chatOpen ? 'block' : 'none';
    document.getElementById('mpd-badge').style.display = chatOpen ? 'none' : 'block';
    if (chatOpen && !started) { started = true; setTimeout(startConvo, 400); }
    if (chatOpen) resetRelanceTimer(); else clearTimeout(relanceTimer);
  }

  document.getElementById('mpd-trigger').onclick = toggleChat;
  document.getElementById('mpd-close').onclick = toggleChat;
  document.getElementById('mpd-send').onclick = sendUserMsg;
  document.getElementById('mpd-input').addEventListener('keydown', e => { if (e.key === 'Enter') sendUserMsg(); });

  function addMsg(html, type = 'bot') {
    const msgs = document.getElementById('mpd-messages');
    const d = document.createElement('div');
    d.className = `mpd-msg ${type}`;
    d.innerHTML = html;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const msgs = document.getElementById('mpd-messages');
    const d = document.createElement('div');
    d.className = 'mpd-typing'; d.id = 'mpd-typing';
    d.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() { const t = document.getElementById('mpd-typing'); if(t) t.remove(); }

  function botReply(html, delay = 900) {
    return new Promise(r => { showTyping(); setTimeout(() => { removeTyping(); addMsg(html); r(); }, delay); });
  }

  function setQR(opts) {
    const qr = document.getElementById('mpd-quick');
    qr.innerHTML = '';
    opts.forEach(o => {
      const b = document.createElement('button');
      b.className = 'mpd-qr';
      b.textContent = o.label || o;
      b.onclick = () => handleQR(o.value || o, o.label || o);
      qr.appendChild(b);
    });
  }

  function clearQR() { document.getElementById('mpd-quick').innerHTML = ''; }


  function showDatePicker() {
    const msgs = document.getElementById('mpd-messages');
    const today = new Date().toISOString().split('T')[0];
    const f = document.createElement('div');
    f.className = 'mpd-cform';
    f.id = 'mpd-datepicker';
    f.innerHTML = `
      <div style="font-weight:700;font-size:13px">📅 Date de début souhaitée</div>
      <input type="date" id="mpd-date-input" min="${today}" style="font-size:14px;padding:8px;">
      <button onclick="window._mpdHandleDate()">Continuer →</button>
    `;
    msgs.appendChild(f);
    msgs.scrollTop = msgs.scrollHeight;
  }

  window._mpdHandleDate = async function() {
    const dateVal = document.getElementById('mpd-date-input')?.value;
    if (!dateVal) { addMsg('⚠️ Merci de choisir une date.'); return; }
    document.getElementById('mpd-datepicker')?.remove();
    const dateLabel = new Date(dateVal).toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'});
    devisData.date = dateLabel;
    addMsg('📅 ' + dateLabel, 'user');
    await botReply('Parfait ! Pour confirmer cette réservation, laissez vos coordonnées 👇', 700);
    const ctx = 'Location ' + (devisData.machine==='kpc'?'KPC KT562 800kg':'Kubota D902 1T5') + ' — ' + devisData.duree + ' — ' + dateLabel + ' — ~' + devisData.total + '€';
    showContactForm(ctx);
  };

  function showDevisCard(machine, duree) {
    const m = MACHINES[machine];
    const labels = {journee:'Journée', weekend:'Week-end', semaine:'Semaine'};
    const prix = m.tarifs[duree];
    const total = prix + m.livraison;
    const msgs = document.getElementById('mpd-messages');
    const c = document.createElement('div');
    c.className = 'mpd-dcard';
    c.innerHTML = `
      <div class="mpd-dcard-title">🚜 Estimation — ${m.nom}</div>
      <div class="mpd-dcard-line">📅 Durée : <strong>${labels[duree]}</strong></div>
      <div class="mpd-dcard-line">💰 Machine : ${prix}€ TTC</div>
      <div class="mpd-dcard-line">🚚 Livraison A/R : ${m.livraison}€</div>
      <div class="mpd-dcard-total">Total estimé : ~${total}€ TTC</div>`;
    msgs.appendChild(c); msgs.scrollTop = msgs.scrollHeight;
    return total;
  }

  function showContactForm(ctx) {
    const msgs = document.getElementById('mpd-messages');
    const f = document.createElement('div');
    f.className = 'mpd-cform';
    f.innerHTML = `
      <div style="font-weight:700;font-size:13px">📋 Vos coordonnées</div>
      <input type="text" id="mpd-cf-name" placeholder="Votre prénom *">
      <input type="tel" id="mpd-cf-phone" placeholder="Votre téléphone *">
      <input type="email" id="mpd-cf-email" placeholder="Email (facultatif)">
      <button onclick="window._mpdSubmit('${ctx.replace(/'/g, "\\'")}')">✅ Envoyer ma demande</button>`;
    msgs.appendChild(f); msgs.scrollTop = msgs.scrollHeight;
  }

  window._mpdSubmit = async function(ctx) {
    const name  = (document.getElementById('mpd-cf-name')?.value || '').trim();
    const phone = (document.getElementById('mpd-cf-phone')?.value || '').trim();
    const email = (document.getElementById('mpd-cf-email')?.value || '').trim();
    if (!name || !phone) { addMsg('⚠️ Merci de renseigner votre prénom et téléphone.'); return; }
    document.querySelectorAll('.mpd-cform').forEach(f => f.remove());
    addMsg(`${name} — ${phone}${email ? ' — '+email : ''}`, 'user');
    clearQR();
    await botReply('✅ Parfait ! J\'envoie votre demande à Alex maintenant…', 600);
    await sendNotif(name, phone, email, ctx);
    await sendToSheet(name, phone, email, ctx);
    await botReply(`🎉 <strong>Demande envoyée !</strong><br>Alex va vous rappeler très rapidement.<br><br>Besoin urgent ? <a href="tel:0699168777" style="color:#e6a800;font-weight:700">📞 06 99 16 87 77</a> &nbsp;·&nbsp; <a href="https://wa.me/33699168777" style="color:#25D366;font-weight:700">💬 WhatsApp</a>`, 1200);
    setQR(['Autre question', 'Fermer']);
  };


  // ── SMS via Brevo ──────────────────────────────────────
  async function sendSMS(name, phone, ctx) {
    try {
      await fetch('https://ntfy.sh/minipelledirect-prospects', {
        method: 'POST',
        headers: {
          'Title': 'Nouveau prospect MPD',
          'Priority': 'high',
          'Tags': 'tractor'
        },
        body: 'Nom: ' + name + ' | Tel: ' + phone + ' | ' + ctx.substring(0, 100)
      });
    } catch(e) { console.warn('Ntfy:', e); }
  }


  // ── Google Sheet ────────────────────────────────────────
  async function sendToSheet(name, phone, email, ctx) {
    try {
      await fetch('https://script.google.com/macros/s/AKfycbwTwC879g6Vw3f_rqbgGFQHDbJOoK5DVVFC_nJ5qMD4DsZlpviim7vtdrAYW7d1sKiTPQ/exec', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, phone, email, context: ctx})
      });
    } catch(e) { console.warn('Sheet:', e); }
  }

  async function sendNotif(name, phone, email, ctx) {
    try {
      if (typeof emailjs !== 'undefined') {
        await emailjs.send('service_minipelle', 'template_brnmm8m', {
          name: name,
          subject: 'Nouveau prospect ' + name,
          message: 'Nom: ' + name + ' | Tel: ' + phone + ' | Email: ' + (email||'non') + ' | ' + ctx,
          email: email || 'minipelledirect@gmail.com'
        });
      }
    } catch(e) { console.warn('EmailJS:', e); }
    await sendSMS(name, phone, ctx);
  }

  async function startConvo() {
    const h = new Date().getHours();
    const gr = h < 18 ? 'Bonjour' : 'Bonsoir';
    await botReply(`${gr} ! 👋 Je suis l'assistant de <strong>Mini Pelle Direct</strong>.<br>Je peux vous aider à :<br>• Choisir la bonne machine<br>• Calculer un devis<br>• Vérifier la disponibilité`);
    setQR(['Louer une machine', 'Acheter une machine', 'Tarifs & devis', 'Zone de livraison', 'Parler à Alex']);
    step = 'menu';
  }

  function handleQR(value, label) {
    clearQR(); addMsg(label, 'user'); handleIntent(value);
  }

  async function handleIntent(intent) {
    switch(intent) {
      case 'Louer une machine':
        await botReply('Pour vous guider, quelle machine vous intéresse ?');
        setQR([{label:'KPC KT562 — 800kg (accès étroits)',value:'loc_kpc'},{label:'Kubota D902 — 1T5 (terrassement)',value:'loc_kubota'},{label:'Je ne sais pas encore',value:'aide_choix'}]);
        break;
      case 'loc_kpc':
        devisData.machine = 'kpc';
        await botReply(`✅ <strong>KPC KT562 — 800 kg</strong><br>${MACHINES.kpc.profil}<br><br>Pour quelle durée ?`);
        setQR([{label:'Journée (130€)',value:'dur_journee'},{label:'Week-end (250€)',value:'dur_weekend'},{label:'Semaine (450€)',value:'dur_semaine'}]);
        break;
      case 'loc_kubota':
        devisData.machine = 'kubota';
        await botReply(`✅ <strong>Kubota D902 — 1T5</strong><br>${MACHINES.kubota.profil}<br><br>Pour quelle durée ?`);
        setQR([{label:'Journée (160€)',value:'dur_journee'},{label:'Week-end (300€)',value:'dur_weekend'},{label:'Semaine (600€)',value:'dur_semaine'}]);
        break;
      case 'dur_journee': case 'dur_weekend': case 'dur_semaine': {
        const duree = intent.replace('dur_', '');
        devisData.duree = duree;
        const total = showDevisCard(devisData.machine, duree);
        devisData.total = total;
        await botReply('Voil\u00e0 votre estimation \ud83d\udc46<br><br>Pour quelle date avez-vous besoin de la machine ?', 1000);
        showDatePicker();
        break;
      }
      case 'aide_choix':
        await botReply('Voici comment choisir :<br><br>🔹 <strong>KPC KT562 — 800 kg</strong><br>→ Jardin, tranchée, accès étroit, petits travaux<br><br>🔸 <strong>Kubota D902 — 1T5</strong><br>→ Terrassement, assainissement, démolition légère');
        setQR([{label:'Prendre la KPC (800kg)',value:'loc_kpc'},{label:'Prendre la Kubota (1T5)',value:'loc_kubota'},{label:'Appeler Alex',value:'Parler à Alex'}]);
        break;
      case 'Acheter une machine':
        await botReply('🛒 <strong>Pack Complet Kubota D902 1T5</strong><br><br>✅ Mini pelle neuve — garantie 1 an<br>✅ Remorque double essieux 2000 kg<br>✅ 6 accessoires (godets, BRH, tarière, attache rapide)<br>✅ Livraison incluse Bretagne<br><br>💰 <strong>19 990 € TTC</strong> — tout inclus');
        await botReply('Intéressé(e) ? Laissez vos coordonnées et Alex vous rappelle.', 800);
        showContactForm('Intérêt achat Pack Complet Kubota 1T5 — 19 990€ TTC');
        break;
      case 'Tarifs & devis':
        await botReply('💰 <strong>Tarifs TTC :</strong><br><br>🔹 <strong>KPC KT562 — 800 kg</strong><br>Journée 130€ · Week-end 250€ · Semaine 450€ · Livraison 90€<br><br>🔸 <strong>Kubota D902 — 1T5</strong><br>Journée 160€ · Week-end 300€ · Semaine 600€ · Livraison 89€<br><br>Voulez-vous un devis précis ?');
        setQR([{label:'Devis KPC 800kg',value:'loc_kpc'},{label:'Devis Kubota 1T5',value:'loc_kubota'},{label:'Pack achat 1T5',value:'Acheter une machine'}]);
        break;
      case 'Zone de livraison':
        await botReply('📍 <strong>Zone de livraison :</strong><br>Rayon 30 km autour de Bain-de-Bretagne<br>Bruz, Guichen, Janzé, Retiers, Pipriac, Redon, Rennes…<br><br>Livraison sous <strong>24h</strong> · 69–89 € A/R');
        setQR(['Louer une machine', 'Parler à Alex']);
        break;
      case 'Parler à Alex':
        await botReply('📞 <strong>Contacter Alex :</strong><br><br><a href="tel:0699168777" style="color:#e6a800;font-weight:700;font-size:15px">📞 06 99 16 87 77</a><br><br><a href="https://wa.me/33699168777" style="color:#25D366;font-weight:700">💬 WhatsApp</a><br><br>Ou laissez vos coordonnées :');
        showContactForm('Demande de rappel général');
        break;
      case 'Autre question':
        await botReply('Bien sûr ! Comment puis-je vous aider ?');
        setQR(['Louer une machine', 'Acheter une machine', 'Tarifs & devis', 'Zone de livraison', 'Parler à Alex']);
        break;
      case 'Fermer': toggleChat(); break;
      default: handleFreeText(intent);
    }
  }

  async function handleFreeText(text) {
    const t = text.toLowerCase();
    if (t.match(/tarif|prix|co[uû]t|combien/)) return handleIntent('Tarifs & devis');
    if (t.match(/louer|location|loue/)) return handleIntent('Louer une machine');
    if (t.match(/acheter|achat|vente|pack/)) return handleIntent('Acheter une machine');
    if (t.match(/livraison|zone|km|secteur/)) return handleIntent('Zone de livraison');
    if (t.match(/caces|permis|licence/)) {
      await botReply('🪪 <strong>CACES :</strong><br>• KPC 800kg : aucun permis requis<br>• Kubota 1T5 : CACES R482 cat. A recommandé pour pros');
      setQR(['Louer une machine', 'Autre question']); return;
    }
    if (t.match(/accessoire|godet|brh|tari[eè]re/)) {
      await botReply('🔧 <strong>Accessoires :</strong><br>• Godet standard<br>• Godet curage<br>• Godet étroit<br>• BRH brise-roche<br>• Tarière<br>• Attache rapide<br><br>6 accessoires inclus dans le pack 1T5.');
      setQR(['Louer une machine', 'Parler à Alex']); return;
    }
    if (t.match(/garantie/)) {
      await botReply('🛡️ Garantie constructeur <strong>1 an</strong> sur toutes nos machines.');
      setQR(['Louer une machine', 'Acheter une machine']); return;
    }
    if (t.match(/disponib/)) {
      await botReply('📅 Pour la disponibilité en temps réel, laissez vos coordonnées ou appelez Alex.');
      showContactForm('Vérification disponibilité'); return;
    }
    // Fallback API Claude
    await botReply('Laissez-moi chercher…', 500);
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514', max_tokens:300,
          system:'Tu es l\'assistant commercial de Mini Pelle Direct à Bain-de-Bretagne (35). Réponds uniquement sur la location/vente de mini-pelles. Sois concis (max 2 phrases), chaleureux. KPC 800kg 130€/j, Kubota 1T5 160€/j, pack 19990€. Tél 06 99 16 87 77.',
          messages:[{role:'user', content:text}]
        })
      });
      const data = await resp.json();
      addMsg(data.content?.[0]?.text || 'Alex peut mieux répondre à ça ! 📞 06 99 16 87 77');
    } catch(e) {
      addMsg('Je ne suis pas sûr. Appelez Alex : <a href="tel:0699168777" style="color:#e6a800;font-weight:700">06 99 16 87 77</a>');
    }
    setQR(['Louer une machine', 'Tarifs & devis', 'Parler à Alex']);
  }

  function sendUserMsg() {
    const inp = document.getElementById('mpd-input');
    const text = inp.value.trim();
    if (!text) return;
    clearQR(); addMsg(text, 'user'); inp.value = '';
    resetRelanceTimer();
    handleFreeText(text);
  }

  // Badge pulse après 8s
  setTimeout(() => {
    const b = document.getElementById('mpd-badge');
    if (b && !chatOpen) { b.style.background='#FFD700'; b.style.color='#111'; }
  }, 8000);

})();