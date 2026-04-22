// ────────────────────────────────────────────────────────────────────────────
// MANAGE PAGE — avec drag & drop chapitres et questions
// ────────────────────────────────────────────────────────────────────────────

// État drag en cours
let drag = { type: null, cid: null, qid: null, fromIdx: null };

function renderManage() {
  const container = document.getElementById('manage-content');
  let html = '';

  state.chapters.forEach((ch, ci) => {
    html += `<div class="chapter-manage-card"
      draggable="true"
      data-cid="${ch.id}"
      ondragstart="onChapterDragStart(event,${ch.id})"
      ondragover="onChapterDragOver(event,${ch.id})"
      ondragleave="onChapterDragLeave(event)"
      ondrop="onChapterDrop(event,${ch.id})"
      ondragend="onDragEnd()">

      <div class="chapter-manage-head" onclick="toggleCollapse(${ch.id})">
        <span class="drag-handle" onclick="event.stopPropagation()" title="Glisser pour réordonner">⠿</span>
        <span class="chapter-manage-title">${esc(ch.name)}</span>
        <div style="display:flex;gap:8px;align-items:center;margin-left:auto;">
          <span class="badge badge-blue">${ch.questions.length} Q</span>
          <button class="btn btn-xs" onclick="event.stopPropagation();renameChapter(${ch.id})">✏ Renommer</button>
          <button class="btn btn-xs btn-danger" onclick="event.stopPropagation();removeChapter(${ch.id})">✕</button>
        </div>
      </div>

      <div class="chapter-manage-body" id="ch-body-${ch.id}">`;

    ch.questions.forEach((q, qi) => {
      const lo = (opt) => opt.toLowerCase();
      const isFree = q.qtype === 'freetext';
      html += `<div class="question-manage-row"
          draggable="true"
          data-cid="${ch.id}" data-qid="${q.id}"
          ondragstart="onQuestionDragStart(event,${ch.id},${q.id})"
          ondragover="onQuestionDragOver(event,${ch.id},${q.id})"
          ondragleave="onQuestionDragLeave(event)"
          ondrop="onQuestionDrop(event,${ch.id},${q.id})"
          ondragend="onDragEnd()">
        <span class="drag-handle" title="Glisser pour réordonner">⠿</span>
        <div style="flex:1;min-width:0;">
          <div class="question-manage-text">${isFree ? '📝 ' : ''}${esc(q.text)}</div>
          <div class="question-manage-options">`;
      if (isFree) {
        html += `<span class="badge badge-blue">Bloc libre</span>`;
      } else {
        q.options.forEach(opt => {
          const cls = lo(opt) === 'oui' ? 'badge-green' : lo(opt) === 'non' ? 'badge-red' : lo(opt) === 'non applicable' ? 'badge-amber' : 'badge-blue';
          html += `<span class="badge ${cls}">${esc(opt)}</span>`;
        });
      }
      html += `</div></div>
        <div style="display:flex;gap:6px;flex-shrink:0;">
          <button class="btn btn-xs" onclick="openEditQuestion(${ch.id}, ${q.id})">✏ Modifier</button>
          <button class="btn btn-xs btn-danger" onclick="removeQuestion(${ch.id}, ${q.id})">✕</button>
        </div>
      </div>`;
    });

    html += `<button class="add-btn-dashed" style="margin-top:${ch.questions.length?'10px':'0'}" onclick="openAddQuestion(${ch.id})">+ Ajouter une question</button>
      </div>
    </div>`;
  });

  container.innerHTML = html;
}

// ── Drag chapitres
function onChapterDragStart(e, cid) {
  drag = { type: 'chapter', cid };
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}
function onChapterDragOver(e, cid) {
  if (drag.type !== 'chapter' || drag.cid === cid) return;
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}
function onChapterDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}
function onChapterDrop(e, targetCid) {
  e.preventDefault();
  if (drag.type !== 'chapter' || drag.cid === targetCid) return;
  const fromIdx = state.chapters.findIndex(c => c.id === drag.cid);
  const toIdx   = state.chapters.findIndex(c => c.id === targetCid);
  const [moved] = state.chapters.splice(fromIdx, 1);
  state.chapters.splice(toIdx, 0, moved);
  renderManage();
}

// ── Drag questions
function onQuestionDragStart(e, cid, qid) {
  drag = { type: 'question', cid, qid };
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.stopPropagation(); // ne pas déclencher le drag chapitre
}
function onQuestionDragOver(e, cid, qid) {
  if (drag.type !== 'question') return;
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.add('drag-over');
}
function onQuestionDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}
function onQuestionDrop(e, targetCid, targetQid) {
  e.preventDefault();
  e.stopPropagation();
  if (drag.type !== 'question') return;

  const srcChapter  = state.chapters.find(c => c.id === drag.cid);
  const destChapter = state.chapters.find(c => c.id === targetCid);
  const fromIdx = srcChapter.questions.findIndex(q => q.id === drag.qid);
  const toIdx   = destChapter.questions.findIndex(q => q.id === targetQid);
  if (fromIdx === -1 || toIdx === -1) return;

  const [moved] = srcChapter.questions.splice(fromIdx, 1);
  destChapter.questions.splice(toIdx, 0, moved);
  renderManage();
}

function onDragEnd() {
  drag = { type: null, cid: null, qid: null };
  document.querySelectorAll('.dragging, .drag-over').forEach(el => {
    el.classList.remove('dragging', 'drag-over');
  });
}

function toggleCollapse(cid) {
  const body = document.getElementById('ch-body-' + cid);
  body.style.display = body.style.display === 'none' ? '' : 'none';
}

function addChapter() {
  const name = prompt('Nom du nouveau chapitre :');
  if (!name || !name.trim()) return;
  state.chapters.push({ id: Date.now(), name: name.trim(), questions: [] });
  renderManage();
}

function renameChapter(cid) {
  const ch = state.chapters.find(c => c.id === cid);
  const name = prompt('Nouveau nom :', ch.name);
  if (!name || !name.trim()) return;
  ch.name = name.trim();
  renderManage();
}

function removeChapter(cid) {
  if (!confirm('Supprimer ce chapitre et toutes ses questions ?')) return;
  state.chapters = state.chapters.filter(c => c.id !== cid);
  renderManage();
  updateProgress();
}

function removeQuestion(cid, qid) {
  if (!confirm('Supprimer cette question ?')) return;
  const ch = state.chapters.find(c => c.id === cid);
  ch.questions = ch.questions.filter(q => q.id !== qid);
  delete state.answers[qid];
  renderManage();
  updateProgress();
}

