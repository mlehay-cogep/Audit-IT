// ────────────────────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────────────────


function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function escNl(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/\n/g, '<br>');
}


function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 4000);
}

// ── Initialisations au démarrage
// ── Init date par défaut
document.getElementById('c-date').value = new Date().toISOString().split('T')[0];
refreshClientsListHome(); // Charge la liste des audits serveur immédiatement

// ── Chargement automatique du dernier client ouvert
(async () => {
  try {
    const { id } = await fetch('/api/last-client').then(r => r.json());
    if (!id) return;
    const data = await fetch(`/api/clients/${encodeURIComponent(id)}`).then(r => r.json());
    if (data.error) return;
    applyImportedData(data, id);
    // Mettre à jour le sélecteur de la page d'accueil
    await refreshClientsListHome();
    const selHome = document.getElementById('client-select-home');
    if (selHome) selHome.value = id;
    showToast(`✅ Reprise de "${data.client?.company || id}"`);
  } catch {}
})();

// ── Pré-remplir le champ "sauvegarder sous" quand on saisit le nom de l'entreprise
document.getElementById('c-company').addEventListener('input', function() {
  const nameInput = document.getElementById('client-save-name');
  if (nameInput && !nameInput.dataset.userEdited) {
    nameInput.value = this.value.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
  }
});
document.getElementById('client-save-name') && document.getElementById('client-save-name').addEventListener('input', function() {
  this.dataset.userEdited = this.value ? '1' : '';
});

// ── Charger la liste clients au démarrage
refreshClientsList();
