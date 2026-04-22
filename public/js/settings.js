// ────────────────────────────────────────────────────────────────────────────
// PARAMÈTRES — Import / Export JSON
// ────────────────────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────────────────
// GESTION COLLABORATIVE DES CLIENTS (serveur)
// ────────────────────────────────────────────────────────────────────────────

let _clientsList = []; // cache de la liste serveur

async function refreshClientsList() {
  try {
    const list = await fetch('/api/clients').then(r => r.json());
    _clientsList = Array.isArray(list) ? list : [];
    const sel = document.getElementById('client-select');
    if (!sel) return;
    const prev = sel.value;
    sel.innerHTML = '<option value="">— Sélectionner un audit client —</option>';
    _clientsList.forEach(c => {
      const date = c.auditDate ? ` (${c.auditDate})` : '';
      const ref  = c.ref ? ` — ${c.ref}` : '';
      const opt  = document.createElement('option');
      opt.value       = c.id;
      opt.textContent = `${c.company}${ref}${date}`;
      sel.appendChild(opt);
    });
    if (prev) sel.value = prev;
    onClientSelectChange();
  } catch (e) {
    console.warn('Impossible de charger la liste clients :', e.message);
  }
}

    // Rafraîchit la liste des clients pour le sélecteur de la page d'accueil
    async function refreshClientsListHome() {
        try {
            const res = await fetch('/api/clients');
            const clients = await res.json();
            const select = document.getElementById('client-select-home');
            const currentVal = select.value;
            select.innerHTML = '<option value="">— Sélectionner un audit sur le serveur —</option>';
            clients.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = `${c.company} (${c.auditDate || 'Sans date'})`;
                select.appendChild(opt);
            });
            select.value = currentVal;
        } catch (err) {
            console.error("Erreur liste clients accueil:", err);
        }
    }

    // Charge l'audit sélectionné depuis la page d'accueil
    async function loadSelectedClientHome() {
        const id = document.getElementById('client-select-home').value;
        if (!id) return;
        if (!confirm(`Charger l'audit "${_clientsList.find(x => x.id === id)?.company || id}" ?\n\nLes données non sauvegardées seront perdues.`)) return;

        try {
            const data = await fetch(`/api/clients/${encodeURIComponent(id)}`).then(r => r.json());
            if (data.error) throw new Error(data.error);
            applyImportedData(data, id);
            showToast('✅ Audit chargé avec succès');
            goPage('audit');
        } catch (err) {
            alert("Erreur lors du chargement : " + err.message);
        }
    }


function onClientSelectChange() {
  const sel = document.getElementById('client-select');
  const id  = sel ? sel.value : '';
  document.getElementById('btn-load-client').disabled   = !id;
  document.getElementById('btn-delete-client').disabled = !id;

  const info = document.getElementById('client-select-info');
  if (!id || !info) return (info && (info.textContent = ''));
  const c = _clientsList.find(x => x.id === id);
  if (c) {
    const saved = c.savedAt ? new Date(c.savedAt).toLocaleString('fr-FR') : '';
    info.textContent = `Dernière sauvegarde : ${saved}`;
  }
}

async function loadSelectedClient() {
  const id = document.getElementById('client-select').value;
  if (!id) return;
  if (!confirm(`Charger l'audit "${_clientsList.find(x=>x.id===id)?.company || id}" ?\n\nLes données non sauvegardées seront perdues.`)) return;

  try {
    const data = await fetch(`/api/clients/${encodeURIComponent(id)}`).then(r => r.json());
    if (data.error) throw new Error(data.error);
    applyImportedData(data, id);
    showToast(`✅ Audit "${data.client?.company || id}" chargé.`);
    goPage('audit');
  } catch (e) {
    alert('Erreur chargement : ' + e.message);
  }
}

async function saveCurrentClient() {
  syncTiptapToState();
  const nameInput = document.getElementById('client-save-name');
  const rawName   = nameInput ? nameInput.value.trim() : '';
  const client    = getClient();
  const autoName  = (client.company || 'audit').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') || 'audit';
  const finalName = rawName || autoName;

  // ID = nom nettoyé
  const id = finalName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);

  const status = document.getElementById('save-status');
  status.textContent = '⏳ Sauvegarde en cours...';
  status.style.color = 'var(--gray-med)';

  const payload = {
    _version: 1,
    client,
    chapters: state.chapters,
    answers:  state.answers,
    hidden:   state.hidden,
    intro:    state.intro    || '',
    conclusion: state.conclusion || '',
    recoActions: state.recoActions || {},
  };

  try {
    const res = await fetch(`/api/clients/${encodeURIComponent(id)}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    // Mémoriser comme dernier client ouvert
    await fetch('/api/last-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {});
    status.textContent = `✅ Sauvegardé sous "${finalName}"`;
    status.style.color = 'var(--green)';
    await refreshClientsList();
    // Sélectionner automatiquement le client sauvegardé
    const sel = document.getElementById('client-select');
    if (sel) { sel.value = id; onClientSelectChange(); }
    setTimeout(() => { status.textContent = ''; }, 4000);
  } catch (e) {
    status.textContent = '❌ Erreur : ' + e.message;
    status.style.color = 'var(--red)';
  }
}

async function deleteSelectedClient() {
  const sel = document.getElementById('client-select');
  const id  = sel ? sel.value : '';
  if (!id) return;
  const name = _clientsList.find(x => x.id === id)?.company || id;
  if (!confirm(`Supprimer définitivement l'audit "${name}" du serveur ?`)) return;

  try {
    await fetch(`/api/clients/${encodeURIComponent(id)}`, { method: 'DELETE' });
    showToast(`🗑 Audit "${name}" supprimé.`);
    await refreshClientsList();
  } catch (e) {
    alert('Erreur suppression : ' + e.message);
  }
}

function updateSaveName(val) {
  // Rien à faire, le champ est libre
}

function applyImportedData(data, clientId = null) {
  state.chapters   = data.chapters || state.chapters;
  state.answers    = data.answers  || {};
  state.hidden     = data.hidden   || { chapters: {}, questions: {} };
  state.intro      = data.intro      || '';
  state.conclusion = data.conclusion || '';
  state.recoActions = data.recoActions || {};
  if (data.client) {
    const c = data.client;
    document.getElementById('c-company').value  = c.company    || '';
    document.getElementById('c-contact').value  = c.contact    || '';
    document.getElementById('c-email').value    = c.email      || '';
    document.getElementById('c-phone').value    = c.phone      || '';
    document.getElementById('c-address').value  = c.address    || '';
    document.getElementById('c-postal').value   = c.postalCode || '';
    document.getElementById('c-city').value     = c.city       || '';
    document.getElementById('c-date').value     = c.auditDate  || '';
    document.getElementById('c-auditor').value  = c.auditor    || '';
    document.getElementById('c-ref').value      = c.ref        || '';
    state.logoBase64 = c.logoBase64 || null;
    if (typeof renderLogoPreview === 'function') renderLogoPreview();
    // Préremplir le champ "sauvegarder sous"
    const nameInput = document.getElementById('client-save-name');
    if (nameInput && c.company) {
      nameInput.value = (c.company + (c.ref ? '_' + c.ref : '') + (c.auditDate ? '_' + c.auditDate : ''))
        .replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    }
  }
  // Synchroniser les éditeurs tiptap si déjà ouverts
  ['intro','conclusion'].forEach(id => {
    if (tiptapEditors[id]) setTiptapContent(id, state[id]);
  });
  // Mémoriser le dernier client ouvert sur le serveur
  if (clientId) {
    fetch('/api/last-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: clientId }),
    }).catch(() => {});
  }
  updateProgress();
  updateRecoBadge();
}

function exportJSON() {
  const client = getClient();
  const data = {
    _version: 1,
    _exported: new Date().toISOString(),
    client,
    chapters:   state.chapters,
    answers:    state.answers,
    hidden:     state.hidden,
    intro:      state.intro    || '',
    conclusion: state.conclusion || '',
    recoActions: state.recoActions || {},
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-config_${(client.company || 'export').replace(/\s+/g,'_')}_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('✅ Export JSON téléchargé !');
}

function importJSON(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.chapters || !Array.isArray(data.chapters)) {
        alert('Fichier JSON invalide : champ "chapters" manquant.');
        return;
      }
      if (!confirm(`Importer "${file.name}" ?\n\nCela remplacera toutes les données actuelles.`)) {
        input.value = '';
        return;
      }
      applyImportedData(data);
      input.value = '';
      showToast('✅ Import réussi !');
    } catch (err) {
      alert('Erreur de lecture du fichier JSON : ' + err.message);
    }
  };
  reader.readAsText(file);
}

function resetAnswers() {
  if (!confirm('Effacer toutes les réponses du questionnaire ?')) return;
  state.answers = {};
  updateProgress();
  showToast('✅ Réponses effacées.');
}

