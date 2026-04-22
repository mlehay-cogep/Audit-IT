// ────────────────────────────────────────────────────────────────────────────
// PAGE RECOMMANDATIONS
// ────────────────────────────────────────────────────────────────────────────
function renderRecommandations() {
  const container = document.getElementById('reco-content');
  const items = [];

  state.chapters.forEach(ch => {
    if (state.hidden.chapters[ch.id]) return;
    ch.questions.forEach(q => {
      if (state.hidden.questions[q.id]) return;
      if (q.qtype === 'freetext') return;
      const ans = getAnswerValue(q.id);
      if (!ans) return;
      const lo = ans.toLowerCase();
      if (lo === 'non' || lo === 'partiel') {
        items.push({ ch, q, ans, para: q.paragraphs[ans] || '' });
      }
    });
  });

  // Mettre à jour le badge sidebar
  const badge = document.getElementById('reco-badge');
  if (badge) {
    if (items.length) {
      badge.textContent = items.length;
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }

  if (!items.length) {
    container.innerHTML = `<div style="text-align:center;padding:48px 0;">
      <div style="font-size:48px;margin-bottom:12px;">✅</div>
      <div style="font-size:16px;font-weight:600;color:var(--green);margin-bottom:6px;">Aucun point nécessitant une action corrective</div>
      <div style="font-size:13px;color:var(--gray-med);">Toutes les réponses sont positives ou non applicables.</div>
    </div>`;
    return;
  }

  const nonItems     = items.filter(i => i.ans.toLowerCase() === 'non');
  const partielItems = items.filter(i => i.ans.toLowerCase() === 'partiel');

  let html = `<div class="warn-box" style="margin-bottom:16px;">
    ⚠️ <strong>${nonItems.length} point(s) non conformes</strong> et <strong>${partielItems.length} point(s) partiels</strong> nécessitent une attention particulière.
  </div>`;

  // Grouper par chapitre
  const byChapter = {};
  items.forEach(item => {
    if (!byChapter[item.ch.id]) byChapter[item.ch.id] = { ch: item.ch, items: [] };
    byChapter[item.ch.id].items.push(item);
  });

  let globalIdx = 0;
  Object.values(byChapter).forEach(group => {
    html += `<div style="margin-bottom:8px;padding:8px 12px;background:var(--blue-pale);border-radius:var(--radius);font-size:13px;font-weight:600;color:var(--blue-dark);">
      📂 ${esc(group.ch.name)}
    </div>`;
    group.items.forEach(item => {
      globalIdx++;
      const isPartiel = item.ans.toLowerCase() === 'partiel';
      const savedAction = (state.recoActions && state.recoActions[item.q.id]) || {};
      const priority = savedAction.priority || 'medium';
      const actionText = savedAction.action || '';

      html += `<div class="reco-card">
        <div class="reco-card-head${isPartiel ? ' partial' : ''}">
          <div class="reco-card-num${isPartiel ? ' partial' : ''}">${globalIdx}</div>
          <div class="reco-card-title${isPartiel ? ' partial' : ''}" style="flex:1;">${esc(item.q.text)}</div>
          <span class="badge ${isPartiel ? 'badge-amber' : 'badge-red'}" style="flex-shrink:0;">${esc(item.ans)}</span>
        </div>
        <div class="reco-card-body">
          ${item.para ? `<div style="margin-bottom:10px;padding:8px 12px;background:${isPartiel ? 'var(--amber-light)' : 'var(--red-light)'};border-radius:var(--radius);font-size:13px;border-left:3px solid ${isPartiel ? 'var(--amber)' : 'var(--red)'};">${esc(item.para)}</div>` : ''}
          <div class="reco-action-field">
            <label style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--gray-med);display:block;margin-bottom:5px;">Action corrective</label>
            <textarea rows="2" placeholder="Décrivez l'action corrective à mettre en place…"
              style="width:100%;font-size:13px;"
              oninput="setRecoAction(${item.q.id}, 'action', this.value)"
              onchange="setRecoAction(${item.q.id}, 'action', this.value)"
            >${esc(actionText)}</textarea>
          </div>
          <div class="reco-priority-row">
            <span style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--gray-med);">Priorité :</span>
            <button class="image-size-btn${priority==='high'?' active':''}" onclick="setRecoAction(${item.q.id},'priority','high');renderRecommandations()" style="border-color:${priority==='high'?'var(--red)':'var(--border)'};color:${priority==='high'?'var(--red)':'inherit'};">🔴 Haute</button>
            <button class="image-size-btn${priority==='medium'?' active':''}" onclick="setRecoAction(${item.q.id},'priority','medium');renderRecommandations()" style="border-color:${priority==='medium'?'var(--amber)':'var(--border)'};color:${priority==='medium'?'var(--amber)':'inherit'};">🟡 Moyenne</button>
            <button class="image-size-btn${priority==='low'?' active':''}" onclick="setRecoAction(${item.q.id},'priority','low');renderRecommandations()" style="border-color:${priority==='low'?'var(--green)':'var(--border)'};color:${priority==='low'?'var(--green)':'inherit'};">🟢 Faible</button>
          </div>
        </div>
      </div>`;
    });
  });

  container.innerHTML = html;
}

function setRecoAction(qid, field, value) {
  if (!state.recoActions) state.recoActions = {};
  if (!state.recoActions[qid]) state.recoActions[qid] = {};
  state.recoActions[qid][field] = value;
}

function updateRecoBadge() {
  let count = 0;
  state.chapters.forEach(ch => {
    if (state.hidden.chapters[ch.id]) return;
    ch.questions.forEach(q => {
      if (state.hidden.questions[q.id] || q.qtype === 'freetext') return;
      const ans = getAnswerValue(q.id);
      if (ans && (ans.toLowerCase() === 'non' || ans.toLowerCase() === 'partiel')) count++;
    });
  });
  const badge = document.getElementById('reco-badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count ? '' : 'none';
  }
}

