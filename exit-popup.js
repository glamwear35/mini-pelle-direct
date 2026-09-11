/* ============================================================
   Mini Pelle Direct — Pop-up promo accueil
   ============================================================ */
(function() {
  if (document.getElementById('mpd-exit-loaded')) return;
  const path = window.location.pathname;
  if (path !== '/' && path !== '/index.html') return;
  const marker = document.createElement('meta');
  marker.id = 'mpd-exit-loaded';
  document.head.appendChild(marker);

  const style = document.createElement('style');
  style.textContent = `
    #mpd-exit-overlay {
      position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:99999;
      display:flex; align-items:center; justify-content:center;
      animation:mpd-fadein .3s ease;
    }
    @keyframes mpd-fadein { from{opacity:0} to{opacity:1} }
    #mpd-exit-box {
      background:#111; border-radius:16px; max-width:420px;
      width:92%; text-align:center; position:relative;
      border:2px solid #FFD700; box-shadow:0 20px 60px rgba(0,0,0,0.6);
      animation:mpd-slidein .35s ease; overflow:hidden;
    }
    @keyframes mpd-slidein { from{transform:translateY(-30px);opacity:0} to{transform:translateY(0);opacity:1} }
    #mpd-exit-close {
      position:absolute; top:10px; right:14px; background:rgba(0,0,0,0.6);
      border:none; color:#fff; font-size:20px; cursor:pointer;
      line-height:1; border-radius:50%; width:30px; height:30px;
      display:flex; align-items:center; justify-content:center; z-index:10;
    }
    #mpd-exit-close:hover { background:rgba(255,215,0,0.8); color:#111; }
    #mpd-exit-img {
      width:100%; display:block; cursor:pointer;
    }
    #mpd-exit-footer {
      padding:16px 20px; display:flex; flex-direction:column; gap:10px;
    }
    #mpd-exit-cta {
      background:#FFD700; border:none; border-radius:10px; padding:14px;
      font-family:'Barlow Condensed',Arial,sans-serif; font-weight:800;
      font-size:17px; cursor:pointer; transition:background .15s;
      letter-spacing:0.3px; color:#111; text-decoration:none;
      display:block;
    }
    #mpd-exit-cta:hover { background:#e6c200; }
    #mpd-exit-skip {
      color:#555; font-size:12px; cursor:pointer; padding:4px;
    }
    #mpd-exit-skip:hover { color:#888; }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'mpd-exit-overlay';
  overlay.innerHTML = `
    <div id="mpd-exit-box">
      <button id="mpd-exit-close" onclick="document.getElementById('mpd-exit-overlay').remove()">✕</button>
      <img id="mpd-exit-img" src="/promo-mini-pelle.png" alt="Promo Pack Mini Pelle 1T5" onclick="window.location.href='/promo.html'">
      <div id="mpd-exit-footer">
        <a href="/promo.html" id="mpd-exit-cta">🚜 Voir l'offre complète →</a>
        <div id="mpd-exit-skip" onclick="document.getElementById('mpd-exit-overlay').remove()">Non merci, continuer sur le site</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

})();
