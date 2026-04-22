// ────────────────────────────────────────────────────────────────────────────
// MODAL QUESTION
// ────────────────────────────────────────────────────────────────────────────
function openAddQuestion(cid) {
  state.modal = { type: 'add', cid, q: { id: null, text: '', qtype: 'choice', options: ['Oui', 'Non'], paragraphs: { 'Oui': '', 'Non': '' } } };
  document.getElementById('modal-title').textContent = 'Nouvelle question';
  renderModal();
  document.getElementById('modal-overlay').classList.add('open');
}

function openEditQuestion(cid, qid) {
  const ch = state.chapters.find(c => c.id === cid);
  const q = ch.questions.find(q => q.id === qid);
  state.modal = { type: 'edit', cid, q: JSON.parse(JSON.stringify(q)) };
  document.getElementById('modal-title').textContent = 'Modifier la question';
  renderModal();
  document.getElementById('modal-overlay').classList.add('open');
}

function renderModal() {
  const { q } = state.modal;
  const isFree = q.qtype === 'freetext';

  let html = `<div class="field">
    <label>Texte / Titre *</label>
    <textarea id="modal-qtext" rows="2" placeholder="${isFree ? 'Titre du bloc (ex: Contexte, Planning…)' : 'La question à poser lors de l\'audit...'}">${esc(q.text)}</textarea>
  </div>
  <div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;">
    <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--gray-med);">Type :</span>
    <label style="display:flex;align-items:center;gap:5px;font-size:13px;cursor:pointer;">
      <input type="radio" name="modal-qtype" value="choice" ${!isFree?'checked':''} onchange="setModalQtype('choice')"> Question à choix
    </label>
    <label style="display:flex;align-items:center;gap:5px;font-size:13px;cursor:pointer;">
      <input type="radio" name="modal-qtype" value="freetext" ${isFree?'checked':''} onchange="setModalQtype('freetext')"> Bloc libre (contexte, planning…)
    </label>
  </div>`;

  if (isFree) {
    // ── Mode champ libre ──
    html += `<div class="field">
      <label>Contenu du bloc</label>
      <textarea id="modal-freetext" rows="8" placeholder="Texte libre affiché tel quel dans le rapport…" style="font-size:13px;">${escNl(q.freetextContent || '')}</textarea>
    </div>`;
  } else {
    // ── Mode question à choix ──
    const ALL_OPTS = ['Oui', 'Non', 'Partiel', 'Non applicable', 'Réponse libre'];
    const OPT_COLORS = {
      'oui': 'var(--green)', 'non': 'var(--red)', 'partiel': 'var(--amber)',
      'non applicable': 'var(--gray-med)', 'réponse libre': 'var(--blue-med)'
    };

    // Sélecteur d'options actives
    html += `<div style="margin-bottom:14px;">
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--gray-med);margin-bottom:8px;">Options disponibles</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${ALL_OPTS.map(opt => {
          const checked = q.options.includes(opt);
          const col = OPT_COLORS[opt.toLowerCase()] || 'var(--blue-med)';
          return `<label style="display:flex;align-items:center;gap:5px;font-size:13px;cursor:pointer;padding:4px 10px;border:1.5px solid ${checked ? col : 'var(--border)'};border-radius:20px;background:${checked ? col+'22' : '#fff'};transition:all 0.15s;">
            <input type="checkbox" value="${esc(opt)}" ${checked?'checked':''} onchange="toggleOption('${esc(opt)}', this.checked)" style="accent-color:${col};">
            <span style="color:${checked ? col : 'var(--gray-dark)'};font-weight:${checked?'600':'400'};">${esc(opt)}</span>
          </label>`;
        }).join('')}
      </div>
    </div>`;

    html += `<div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--gray-med);margin-bottom:12px;">Paragraphes et images associés</div>`;

  q.options.forEach((opt, i) => {
    const lo = opt.toLowerCase();
    const isSpecial = lo === 'non applicable' || lo === 'réponse libre';
    const color = OPT_COLORS[lo] || 'var(--amber)';
    const imgs = (q.images && q.images[opt]) ? (Array.isArray(q.images[opt]) ? q.images[opt] : [q.images[opt]]) : [];

    // Construire la liste des images existantes
    const imgsHtml = imgs.map((img, imgIdx) => {
      const imgSrc = img.url || img.data || '';
      const activeClass = img.size === 'full' ? ' active' : '';
      const activeClassHalf = img.size !== 'full' ? ' active' : '';
      return '<div class="image-item">'
        + '<img src="' + esc(imgSrc) + '" alt="' + esc(img.name||'') + '">'
        + '<div class="image-item-info">'
        + '<div class="image-item-name">' + esc(img.name||'') + '</div>'
        + '<input type="text" id="modal-img-caption-' + i + '-' + imgIdx + '" value="' + esc(img.caption||'') + '" placeholder="Légende (optionnel)" style="font-size:12px;padding:3px 7px;margin-top:4px;width:100%;">'
        + '<div class="image-size-btns">'
        + '<button class="image-size-btn' + activeClass + '" onclick="event.stopPropagation();setModalImageSize(' + i + ',' + imgIdx + ',\'full\')">🖼 Pleine page</button>'
        + '<button class="image-size-btn' + activeClassHalf + '" onclick="event.stopPropagation();setModalImageSize(' + i + ',' + imgIdx + ',\'half\')">◧ Demi-page</button>'
        + '</div>'
        + '</div>'
        + '<button class="btn btn-xs btn-danger" onclick="removeImage(event,' + i + ',' + imgIdx + ')">✕</button>'
        + '</div>';
    }).join('');

    // Construire le picker (seulement pour options non-spéciales)
    const pickerHtml = isSpecial ? '' :
      '<div class="img-picker" id="img-picker-' + i + '">'
      + '<div class="img-picker-tabs">'
      + '<button class="img-picker-tab active" onclick="switchImgTab(' + i + ',\'upload\')">📤 Ajouter</button>'
      + '<button class="img-picker-tab" onclick="switchImgTab(' + i + ',\'gallery\')">🖼️ Bibliothèque</button>'
      + '</div>'
      + '<div class="img-picker-panel" id="img-panel-upload-' + i + '">'
      + '<input class="img-name-input" type="text" id="img-display-name-' + i + '" placeholder="Nom de l\'image (ex: Schéma réseau)">'
      + '<label class="img-drop-zone" for="modal-img-' + i + '">'
      + '📎 Cliquez pour uploader (JPG, PNG, GIF, WEBP)'
      + '<input type="file" id="modal-img-' + i + '" accept="image/*" style="display:none;" onchange="handleImageUpload(' + i + ', this)">'
      + '</label>'
      + '</div>'
      + '<div class="img-picker-panel hidden" id="img-panel-gallery-' + i + '">'
      + '<div class="img-gallery" id="img-gallery-' + i + '">'
      + '<div class="img-gallery-empty">⏳ Chargement…</div>'
      + '</div>'
      + '</div>'
      + '</div>';

    html += '<div class="option-edit-row">'
      + '<div class="option-edit-label">'
      + '<span style="color:' + color + ';font-size:13px;font-weight:600;">' + esc(opt) + '</span>'
      + '</div>'
      + '<textarea id="modal-para-' + i + '" rows="4" placeholder="Paragraphe si réponse «' + esc(opt) + '»...">' + esc(q.paragraphs[opt] || '') + '</textarea>'
      + '<div style="margin-top:10px;">'
      + '<div style="font-size:11px;color:var(--gray-med);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.04em;">Images (optionnel)</div>'
      + '<div class="images-list" id="modal-imgs-list-' + i + '">' + imgsHtml + '</div>'
      + pickerHtml
      + '</div>'
      + '</div>';
  });

  // Plus de bouton "Ajouter une option" — les options sont sélectionnées via les checkboxes

  } // end if/else isFree

  document.getElementById('modal-body').innerHTML = html;
}

function toggleOption(opt, checked) {
  syncModalFields();
  const q = state.modal.q;
  if (checked) {
    if (!q.options.includes(opt)) {
      // Insérer dans l'ordre prédéfini
      const ORDER = ['Oui', 'Non', 'Partiel', 'Non applicable', 'Réponse libre'];
      const targetIdx = ORDER.indexOf(opt);
      let insertAt = q.options.length;
      for (let i = 0; i < q.options.length; i++) {
        if (ORDER.indexOf(q.options[i]) > targetIdx) { insertAt = i; break; }
      }
      q.options.splice(insertAt, 0, opt);
      if (!q.paragraphs[opt]) q.paragraphs[opt] = '';
    }
  } else {
    const idx = q.options.indexOf(opt);
    if (idx !== -1) {
      if (q.options.length <= 1) return; // garder au moins une option
      q.options.splice(idx, 1);
      delete q.paragraphs[opt];
      if (q.images) delete q.images[opt];
    }
  }
  setTimeout(() => renderModal(), 0);
}

function setModalQtype(qtype) {
  syncModalFields();
  state.modal.q.qtype = qtype;
  if (qtype === 'freetext') {
    // Pas besoin d'options pour un bloc libre
    state.modal.q.options = [];
    state.modal.q.paragraphs = {};
  } else if (!state.modal.q.options.length) {
    // Restaurer des options par défaut si on repasse en mode choix
    state.modal.q.options = ['Oui', 'Non'];
    state.modal.q.paragraphs = { 'Oui': '', 'Non': '' };
  }
  renderModal();
}

// removeOption remplacé par toggleOption (checkboxes prédéfinies)

function syncModalFields() {
  const { q } = state.modal;
  q.text = document.getElementById('modal-qtext').value;
  if (q.qtype === 'freetext') {
    q.freetextContent = document.getElementById('modal-freetext')?.value || '';
    return;
  }
  if (!q.images) q.images = {};
  q.options.forEach((opt, i) => {
    q.paragraphs[opt] = document.getElementById('modal-para-' + i)?.value || q.paragraphs[opt] || '';
    // Sync captions for multi-images
    const imgs = Array.isArray(q.images[opt]) ? q.images[opt] : (q.images[opt] ? [q.images[opt]] : []);
    imgs.forEach((img, imgIdx) => {
      const captEl = document.getElementById(`modal-img-caption-${i}-${imgIdx}`);
      if (captEl) img.caption = captEl.value;
    });
    q.images[opt] = imgs;
  });
}

function handleImageUpload(optIndex, input) {
  const file = input.files[0];
  if (!file) return;
  const opt = state.modal.q.options[optIndex];

  const nameInput = document.getElementById('img-display-name-' + optIndex);
  const displayName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : file.name;

  const zone = input.parentElement;
  zone.innerHTML = `<span style="font-size:12px;color:var(--gray-med);">⏳ Upload en cours...</span>`;

  fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'X-Filename': encodeURIComponent(file.name),
      'X-Display-Name': encodeURIComponent(displayName),
    },
    body: file,
  })
  .then(r => r.json())
  .then(data => {
    if (data.error) throw new Error(data.error);
    syncModalFields();
    if (!state.modal.q.images) state.modal.q.images = {};
    const encodedUrl = data.url.replace(/\/([^/]+)$/, (_, fname) => '/' + encodeURIComponent(fname));
    const newImg = { url: encodedUrl, filename: data.filename, name: data.name, caption: '', size: 'half' };
    if (!Array.isArray(state.modal.q.images[opt])) {
      state.modal.q.images[opt] = state.modal.q.images[opt] ? [state.modal.q.images[opt]] : [];
    }
    state.modal.q.images[opt].push(newImg);
    renderModal();
    showToast('✅ Image uploadée : ' + data.name);
  })
  .catch(err => {
    renderModal();
    alert('Erreur upload : ' + err.message);
  });
}

// ── Onglets du picker image ──────────────────────────────────────────────────
function switchImgTab(optIndex, tab) {
  const uploadPanel  = document.getElementById('img-panel-upload-' + optIndex);
  const galleryPanel = document.getElementById('img-panel-gallery-' + optIndex);
  const picker       = document.getElementById('img-picker-' + optIndex);
  if (!picker) return;
  const tabs = picker.querySelectorAll('.img-picker-tab');
  tabs[0].classList.toggle('active', tab === 'upload');
  tabs[1].classList.toggle('active', tab === 'gallery');
  uploadPanel.classList.toggle('hidden', tab !== 'upload');
  galleryPanel.classList.toggle('hidden', tab !== 'gallery');
  if (tab === 'gallery') loadImageGallery(optIndex);
}

// Cache des images serveur (évite les problèmes d'échappement dans les onclick inline)
const _imgGalleryCache = {};

function loadImageGallery(optIndex) {
  const container = document.getElementById('img-gallery-' + optIndex);
  if (!container) return;
  container.innerHTML = '<div class="img-gallery-empty">⏳ Chargement\u2026</div>';
  fetch('/api/images')
    .then(r => r.json())
    .then(images => {
      if (!images.length) {
        container.innerHTML = '<div class="img-gallery-empty">Aucune image sur le serveur.<br>Uploadez-en une d\'abord.</div>';
        return;
      }
      _imgGalleryCache[optIndex] = images;
      container.innerHTML = images.map((img, idx) => `
        <div class="img-gallery-item" onclick="selectGalleryImage(event, ${optIndex}, ${idx})" title="${esc(img.name)}">
          <img src="${esc(img.url)}" alt="${esc(img.name)}" loading="lazy">
          <div class="img-gallery-name">${esc(img.name)}</div>
        </div>
      `).join('');
    })
    .catch(() => {
      container.innerHTML = '<div class="img-gallery-empty">Erreur de chargement.</div>';
    });
}

function selectGalleryImage(event, optIndex, imgIdx) {
  event.stopPropagation();
  event.stopImmediatePropagation();
  const images = _imgGalleryCache[optIndex];
  if (!images || !images[imgIdx]) return;
  const img = images[imgIdx];
  syncModalFields();
  if (!state.modal.q.images) state.modal.q.images = {};
  const opt = state.modal.q.options[optIndex];
  const encodedUrl = img.url.replace(/\/([^/]+)$/, (_, fname) => '/' + encodeURIComponent(fname));
  const newImg = { url: encodedUrl, filename: img.filename, name: img.name, caption: '', size: 'half' };
  if (!Array.isArray(state.modal.q.images[opt])) {
    state.modal.q.images[opt] = state.modal.q.images[opt] ? [state.modal.q.images[opt]] : [];
  }
  state.modal.q.images[opt].push(newImg);
  setTimeout(() => { renderModal(); showToast('✅ Image ajoutée : ' + img.name); }, 0);
}

function setModalImageSize(optIndex, imgIdx, size) {
  const opt = state.modal.q.options[optIndex];
  if (!state.modal.q.images || !state.modal.q.images[opt]) return;
  const imgs = Array.isArray(state.modal.q.images[opt]) ? state.modal.q.images[opt] : [state.modal.q.images[opt]];
  if (imgs[imgIdx]) {
    syncModalFields();
    imgs[imgIdx].size = size;
    state.modal.q.images[opt] = imgs;
    renderModal();
  }
}

function removeImage(event, optIndex, imgIdx) {
  event.stopPropagation();
  syncModalFields();
  const opt = state.modal.q.options[optIndex];
  const images = state.modal.q.images || {};
  let imgs = Array.isArray(images[opt]) ? images[opt] : (images[opt] ? [images[opt]] : []);
  const img = imgs[imgIdx];

  if (img && img.filename) {
    fetch(`/api/upload/${encodeURIComponent(img.filename)}`, { method: 'DELETE' }).catch(() => {});
  }
  imgs.splice(imgIdx, 1);
  if (state.modal.q.images) state.modal.q.images[opt] = imgs;
  renderModal();
}

function saveQuestion() {
  syncModalFields();
  const { type, cid, q } = state.modal;
  if (!q.text.trim()) { alert('Le titre ne peut pas être vide.'); return; }
  const ch = state.chapters.find(c => c.id === cid);
  if (type === 'add') {
    q.id = Date.now();
    ch.questions.push(q);
  } else {
    const idx = ch.questions.findIndex(qq => qq.id === q.id);
    ch.questions[idx] = q;
  }
  closeModalNow();
  renderManage();
  updateProgress();
}

function closeModal(e) {
  // Ferme si on clique sur l'overlay sombre (pas sur le panneau lui-même)
  const panel = document.querySelector('.modal');
  if (panel && !panel.contains(e.target)) closeModalNow();
}

function closeModalNow() {
  document.getElementById('modal-overlay').classList.remove('open');
  state.modal = null;
}

