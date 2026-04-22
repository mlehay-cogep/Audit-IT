// ────────────────────────────────────────────────────────────────────────────
// AUDIT PAGE
// ────────────────────────────────────────────────────────────────────────────
function getAnswerValue(qid) {
  const a = state.answers[qid];
  if (!a) return null;
  return typeof a === 'object' ? a.value : a;
}
function getAnswerReason(qid) {
  const a = state.answers[qid];
  return (a && typeof a === 'object') ? (a.reason || '') : '';
}

function hideChapter(cid)   { state.hidden.chapters[cid] = true;  renderAudit(); }
function showChapter(cid)   { delete state.hidden.chapters[cid];  renderAudit(); }
function hideQuestion(qid)  { state.hidden.questions[qid] = true; renderAudit(); }
function showQuestion(qid)  { delete state.hidden.questions[qid]; renderAudit(); }

function renderAudit() {
  const container = document.getElementById('audit-content');

  // Calcul progression sur questions non masquées (blocs libres exclus)
  let total = 0, answered = 0;
  state.chapters.forEach(ch => {
    if (state.hidden.chapters[ch.id]) return;
    ch.questions.forEach(q => {
      if (state.hidden.questions[q.id]) return;
      if (q.qtype === 'freetext') return; // les blocs libres ne comptent pas
      total++;
      if (state.answers[q.id]) answered++;
    });
  });

  let html = '';
  if (total > 0 && answered < total) {
    html += `<div class="warn-box">⚠ ${total - answered} question(s) sans réponse</div>`;
  }

  // Chapitres masqués — affichés en mode réduit avec bouton "Afficher"
  state.chapters.filter(ch => state.hidden.chapters[ch.id]).forEach(ch => {
    html += `<div class="hidden-chapter-bar">
      <span>🙈 Chapitre masqué du rapport : <strong>${esc(ch.name)}</strong></span>
      <button onclick="showChapter(${ch.id})">Afficher</button>
    </div>`;
  });

  state.chapters.filter(ch => !state.hidden.chapters[ch.id]).forEach((ch, ci) => {
    const visibleQuestions = ch.questions.filter(q => !state.hidden.questions[q.id]);
    const hiddenQuestions  = ch.questions.filter(q =>  state.hidden.questions[q.id]);

    html += `<div class="chapter-section">
      <div class="chapter-header-bar">
        <div class="ch-num">${ci + 1}</div>
        <div class="ch-name">${esc(ch.name)}</div>
        <span class="badge badge-blue" style="margin-left:auto;">${visibleQuestions.length} Q</span>
        <button class="hide-btn" onclick="hideChapter(${ch.id})" title="Masquer ce chapitre du rapport">✕ Masquer</button>
      </div>`;

    // Questions masquées dans ce chapitre
    hiddenQuestions.forEach(q => {
      html += `<div class="hidden-question-bar">
        <span>🙈 Question masquée : <em>${esc(q.text)}</em></span>
        <button onclick="showQuestion(${q.id})">Afficher</button>
      </div>`;
    });

    visibleQuestions.forEach(q => {
      if (q.qtype === 'freetext') {
        // ── Bloc libre : affichage lecture seule dans le questionnaire ──
        html += `<div class="question-card" style="background:var(--blue-pale);border-left:3px solid var(--blue-med);">
          <div style="display:flex;align-items:flex-start;gap:8px;">
            <div style="flex:1;">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--blue-med);margin-bottom:4px;">📝 Bloc libre</div>
              <div class="question-text">${escNl(q.text)}</div>
              ${q.freetextContent ? `<div class="preview-para" style="margin-top:6px;">${escNl(q.freetextContent)}</div>` : ''}
            </div>
            <button class="hide-btn" onclick="hideQuestion(${q.id})" title="Masquer ce bloc du rapport">✕ Masquer</button>
          </div>
        </div>`;
        return;
      }

      const ans     = getAnswerValue(q.id);
      const reason  = getAnswerReason(q.id);
      const para    = ans && ans !== 'Non applicable' && ans !== 'Réponse libre' ? q.paragraphs[ans] : null;
      const isNA    = ans === 'Non applicable';
      const isFreeA = ans === 'Réponse libre';

      html += `<div class="question-card">
        <div style="display:flex;align-items:flex-start;gap:8px;">
          <div class="question-text" style="flex:1;">${esc(q.text)}</div>
          <button class="hide-btn" onclick="hideQuestion(${q.id})" title="Masquer cette question du rapport">✕ Masquer</button>
        </div>
        <div class="radio-group">`;

      q.options.forEach(opt => {
        const lo  = opt.toLowerCase();
        const cls = lo === 'oui' ? 'oui' : lo === 'non' ? 'non' : lo === 'non applicable' ? 'na' : lo === 'réponse libre' ? 'na' : 'other';
        const sel = ans === opt ? 'selected' : '';
        html += `<div class="radio-option ${cls} ${sel}" onclick="setAnswer(${q.id}, '${esc(opt)}')">${esc(opt)}</div>`;
      });

      html += `</div>`;

      if (para) html += `<div class="preview-para">${esc(para)}</div>`;

      if (isNA) {
        html += `<div class="na-reason-block">
          <label style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--gray-med);display:block;margin-bottom:5px;">Raison / Précision</label>
          <textarea
            placeholder="Expliquez pourquoi ce point est non applicable dans ce contexte..."
            rows="3"
            style="width:100%;font-size:13px;"
            onchange="setAnswerReason(${q.id}, this.value)"
            oninput="setAnswerReason(${q.id}, this.value)"
          >${esc(reason)}</textarea>
        </div>`;
      }

      if (isFreeA) {
        const freeImgs = (state.answers[q.id] && typeof state.answers[q.id] === 'object') ? (state.answers[q.id].images || (state.answers[q.id].image ? [state.answers[q.id].image] : [])) : [];
        html += `<div class="na-reason-block">
          <label style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--blue-med);display:block;margin-bottom:5px;">Informations</label>
          <textarea
            placeholder="Saisissez les informations complémentaires..."
            rows="3"
            style="width:100%;font-size:13px;"
            onchange="setAnswerReason(${q.id}, this.value)"
            oninput="setAnswerReason(${q.id}, this.value)"
          >${esc(reason)}</textarea>
          <div style="margin-top:10px;">
            <div style="font-size:11px;color:var(--gray-med);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.04em;font-weight:600;">Images associées (optionnel)</div>
            <div class="images-list" id="imgs-list-${q.id}">
              ${freeImgs.map((img, imgIdx) => `
                <div class="image-item">
                  <img src="${esc(img.url || img.data || '')}" alt="${esc(img.name||'')}">
                  <div class="image-item-info">
                    <div class="image-item-name">${esc(img.name||'')}</div>
                    <input type="text" placeholder="Légende (optionnel)" value="${esc(img.caption||'')}"
                      style="font-size:12px;padding:3px 7px;margin-top:4px;width:100%;"
                      oninput="setFreeAnswerImageCaption(${q.id}, ${imgIdx}, this.value)"
                      onchange="setFreeAnswerImageCaption(${q.id}, ${imgIdx}, this.value)">
                    <div class="image-size-btns">
                      <button class="image-size-btn${img.size==='full'?' active':''}" onclick="setFreeAnswerImageSize(${q.id},${imgIdx},'full')">🖼 Pleine page</button>
                      <button class="image-size-btn${img.size!=='full'?' active':''}" onclick="setFreeAnswerImageSize(${q.id},${imgIdx},'half')">◧ Demi-page</button>
                    </div>
                  </div>
                  <button class="btn btn-xs btn-danger" onclick="event.stopPropagation();removeFreeAnswerImage(${q.id},${imgIdx})">✕</button>
                </div>`).join('')}
            </div>
            <div class="img-picker" id="free-img-picker-${q.id}" style="margin-top:8px;">
              <div class="img-picker-tabs">
                <button class="img-picker-tab active" onclick="event.stopPropagation();switchFreeImgTab(${q.id},'upload')">📤 Ajouter une image</button>
                <button class="img-picker-tab" onclick="event.stopPropagation();switchFreeImgTab(${q.id},'gallery')">🖼️ Bibliothèque</button>
              </div>
              <div class="img-picker-panel" id="free-img-panel-upload-${q.id}">
                <label class="img-upload-zone" style="cursor:pointer;display:flex;align-items:center;gap:8px;justify-content:center;padding:10px;margin:0;border:none;border-radius:0;">
                  📎 Cliquez pour uploader une image
                  <input type="file" accept="image/*" style="display:none;" onchange="handleFreeAnswerImageUpload(${q.id}, this)">
                </label>
              </div>
              <div class="img-picker-panel hidden" id="free-img-panel-gallery-${q.id}">
                <div class="img-gallery" id="free-img-gallery-${q.id}">
                  <div class="img-gallery-empty">⏳ Chargement…</div>
                </div>
              </div>
            </div>
          </div>
        </div>`;
      }

      html += `</div>`;
    });
    html += `</div>`;
  });

  container.innerHTML = html;

  // Mettre à jour la progression avec les questions visibles
  document.getElementById('prog-answered').textContent = answered;
  document.getElementById('prog-total').textContent = total;
  document.getElementById('prog-fill').style.width = total ? ((answered / total) * 100) + '%' : '0%';
}

function setAnswer(qid, val) {
  if (val === 'Non applicable' || val === 'Réponse libre') {
    const prev = state.answers[qid];
    const prevReason = (prev && typeof prev === 'object') ? prev.reason : '';
    state.answers[qid] = { value: val, reason: prevReason };
  } else {
    state.answers[qid] = val;
  }
  updateProgress();
  updateRecoBadge();
  renderAudit();
}

function setAnswerReason(qid, reason) {
  const a = state.answers[qid];
  if (a && typeof a === 'object') {
    a.reason = reason;
  } else {
    // Ne devrait pas arriver, mais sécurité
    state.answers[qid] = { value: 'Non applicable', reason };
  }
}

function handleFreeAnswerImageUpload(qid, input) {
  const file = input.files[0];
  if (!file) return;
  const zone = input.parentElement;
  zone.innerHTML = `<span style="font-size:12px;color:var(--gray-med);">⏳ Upload en cours...</span>`;

  fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'X-Filename': encodeURIComponent(file.name),
    },
    body: file,
  })
  .then(r => r.json())
  .then(data => {
    if (data.error) throw new Error(data.error);
    const newImg = { url: data.url, filename: data.filename, name: data.name, caption: '', size: 'half' };
    const a = state.answers[qid];
    if (a && typeof a === 'object') {
      if (!a.images) a.images = [];
      a.images.push(newImg);
    } else {
      state.answers[qid] = { value: 'Réponse libre', reason: '', images: [newImg] };
    }
    renderAudit();
    showToast('✅ Image ajoutée.');
  })
  .catch(err => {
    renderAudit();
    alert('Erreur upload : ' + err.message);
  });
}

function setFreeAnswerImageCaption(qid, imgIdx, caption) {
  const a = state.answers[qid];
  if (a && typeof a === 'object' && a.images && a.images[imgIdx]) a.images[imgIdx].caption = caption;
}

function setFreeAnswerImageSize(qid, imgIdx, size) {
  const a = state.answers[qid];
  if (a && typeof a === 'object' && a.images && a.images[imgIdx]) {
    a.images[imgIdx].size = size;
    renderAudit();
  }
}

function removeFreeAnswerImage(qid, imgIdx) {
  const a = state.answers[qid];
  if (a && typeof a === 'object' && a.images) {
    const img = a.images[imgIdx];
    if (img && img.filename) {
      fetch(`/api/upload/${encodeURIComponent(img.filename)}`, { method: 'DELETE' }).catch(() => {});
    }
    a.images.splice(imgIdx, 1);
  }
  renderAudit();
}

    function switchFreeImgTab(qid, tab) {
        const upload = document.getElementById(`free-img-panel-upload-${qid}`);
        const gallery = document.getElementById(`free-img-panel-gallery-${qid}`);
        const picker = document.getElementById(`free-img-picker-${qid}`);
        if (!picker) return;
        picker.querySelectorAll('.img-picker-tab').forEach((t, i) => {
            t.classList.toggle('active', (i === 0 && tab === 'upload') || (i === 1 && tab === 'gallery'));
        });
        if (upload) upload.classList.toggle('hidden', tab !== 'upload');
        if (gallery) gallery.classList.toggle('hidden', tab !== 'gallery');
        if (tab === 'gallery') loadFreeImageGallery(qid);
    }

    const _freeGalleryCache = {};

    function loadFreeImageGallery(qid) {
        const container = document.getElementById(`free-img-gallery-${qid}`);
        if (!container) return;
        container.innerHTML = '<div class="img-gallery-empty">⏳ Chargement…</div>';
        fetch('/api/images')
            .then(r => r.json())
            .then(images => {
                _freeGalleryCache[qid] = images;
                if (!images.length) {
                    container.innerHTML = '<div class="img-gallery-empty">Aucune image dans la bibliothèque.</div>';
                    return;
                }
                container.innerHTML = images.map((img, idx) => `
            <div class="img-gallery-item" onclick="selectFreeAnswerImage(${qid}, ${idx})">
              <img src="${esc(img.url)}" alt="${esc(img.name)}" loading="lazy">
              <div class="img-gallery-name">${esc(img.name)}</div>
            </div>`).join('');
            })
            .catch(() => {
                container.innerHTML = '<div class="img-gallery-empty">Erreur de chargement.</div>';
            });
    }

    function selectFreeAnswerImage(qid, idx) {
        const images = _freeGalleryCache[qid];
        if (!images || !images[idx]) return;
        const img = images[idx];
        const newImg = { url: img.url, filename: img.filename || '', name: img.name, caption: '', size: 'half' };
        const a = state.answers[qid];
        if (a && typeof a === 'object') {
            if (!a.images) a.images = [];
            a.images.push(newImg);
        } else {
            state.answers[qid] = { value: 'Réponse libre', reason: '', images: [newImg] };
        }
        renderAudit();
        showToast('✅ Image ajoutée.');
    }

