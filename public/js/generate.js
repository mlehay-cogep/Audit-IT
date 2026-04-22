// ────────────────────────────────────────────────────────────────────────────
// GENERATE PAGE
// ────────────────────────────────────────────────────────────────────────────
let currentLayout = 'cogep';

function setLayout(layout) {
  currentLayout = layout;
  document.querySelectorAll('.layout-opt').forEach(el => el.classList.remove('active'));
  document.getElementById('lopt-' + layout).classList.add('active');
}

function renderSummary() {
  const total = state.chapters.reduce((s, c) => s + c.questions.length, 0);
  const answered = Object.keys(state.answers).length;
  const company = document.getElementById('c-company').value || '—';
  const date = document.getElementById('c-date').value || '—';
  const auditor = document.getElementById('c-auditor').value || '—';

  let html = `<div class="card-title">📊 Récapitulatif</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
      <div style="background:var(--blue-pale);border-radius:var(--radius);padding:14px;">
        <div style="font-size:11px;color:var(--gray-med);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px;">Entreprise</div>
        <div style="font-size:15px;font-weight:600;color:var(--blue-dark);">${esc(company)}</div>
      </div>
      <div style="background:var(--blue-pale);border-radius:var(--radius);padding:14px;">
        <div style="font-size:11px;color:var(--gray-med);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px;">Réponses</div>
        <div style="font-size:15px;font-weight:600;color:var(--blue-dark);">${answered} / ${total}</div>
      </div>
      <div style="background:var(--blue-pale);border-radius:var(--radius);padding:14px;">
        <div style="font-size:11px;color:var(--gray-med);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px;">Chapitres</div>
        <div style="font-size:15px;font-weight:600;color:var(--blue-dark);">${state.chapters.length}</div>
      </div>
    </div>`;

  document.getElementById('gen-summary').innerHTML = html;
}

function getClient() {
  return {
    company:   document.getElementById('c-company').value,
    contact:   document.getElementById('c-contact').value,
    email:     document.getElementById('c-email').value,
    phone:     document.getElementById('c-phone').value,
    address:   document.getElementById('c-address').value,
    postalCode:document.getElementById('c-postal').value,
    city:      document.getElementById('c-city').value,
    auditDate: document.getElementById('c-date').value,
    auditor:   document.getElementById('c-auditor').value,
    ref:       document.getElementById('c-ref').value,
    logoBase64: state.logoBase64 || null,
  };
}

function handleLogoUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    state.logoBase64 = e.target.result;
    renderLogoPreview();
  };
  reader.readAsDataURL(file);
}

function renderLogoPreview() {
  const zone = document.getElementById('logo-zone');
  if (!zone) return;
  if (state.logoBase64) {
    zone.innerHTML = `<div class="logo-preview">
      <img src="${state.logoBase64}" alt="Logo client">
      <div style="flex:1;">
        <div style="font-size:12px;font-weight:600;color:var(--gray-dark);">Logo chargé</div>
        <div style="font-size:11px;color:var(--gray-med);margin-top:2px;">Sera inclus dans le rapport</div>
      </div>
      <button class="btn btn-xs btn-danger" onclick="removeLogo()">✕ Supprimer</button>
    </div>`;
  } else {
    zone.innerHTML = `<label class="logo-upload-zone" for="c-logo-input">
      🖼️ Cliquez pour uploader un logo (PNG, JPG, SVG…)
      <span style="font-size:11px;color:var(--gray-med);">Affiché sur la page de garde du rapport</span>
      <input type="file" id="c-logo-input" accept="image/*" style="display:none;" onchange="handleLogoUpload(this)">
    </label>`;
  }
}

function removeLogo() {
  state.logoBase64 = null;
  renderLogoPreview();
}

async function generateReport(format) {
  syncTiptapToState();
  const client = getClient();
  if (!client.company) {
    alert('Veuillez saisir le nom de l\'entreprise cliente (onglet "Infos client").');
    goPage('client');
    return;
  }

  const btnDoc  = document.getElementById('gen-btn-doc');
  const btnHtml = document.getElementById('gen-btn-html');
  const status  = document.getElementById('gen-status');
  btnDoc.disabled = true;
  btnHtml.disabled = true;

  const activeBtn = format === 'html' ? btnHtml : btnDoc;
  const origLabel = activeBtn.innerHTML;
  activeBtn.innerHTML = '<span class="spinner"></span> Génération...';

  try {
    syncTiptapToState();
    const payload = {
      client,
      chapters:   state.chapters,
      answers:    state.answers,
      aiContent:  {
        introduction: state.intro      || null,
        conclusion:   state.conclusion || null,
        recoActions:  state.recoActions || {},
      },
      format,
      layout:     currentLayout,
      hidden:     state.hidden,
    };

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur serveur');
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ext = format === 'html' ? 'html' : 'doc';
    const layoutSuffix = currentLayout === 'simple' ? '_simple' : '';
    const filename = `Audit_${(client.company || 'rapport').replace(/\s+/g, '_')}_${client.auditDate || 'date'}${layoutSuffix}.${ext}`;
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    showToast(`✅ Rapport ${ext.toUpperCase()} téléchargé !`);
    status.textContent = '✅ ' + filename;
  } catch (e) {
    alert('Erreur : ' + e.message);
    status.textContent = '❌ ' + e.message;
  }

  activeBtn.innerHTML = origLabel;
  btnDoc.disabled = false;
  btnHtml.disabled = false;
}

