// ────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ────────────────────────────────────────────────────────────────────────────
function goPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelector(`[data-page="${name}"]`).classList.add('active');
  if (name === 'audit') {
    renderAudit();
    // Init Tiptap editors if not yet created
    setTimeout(() => {
      if (!tiptapEditors.intro) initTiptap('intro', state.intro || '');
      if (!tiptapEditors.conclusion) initTiptap('conclusion', state.conclusion || '');
    }, 0);
  }
  if (name === 'manage') renderManage();
  if (name === 'generate') renderSummary();
  if (name === 'settings') refreshClientsList();
  if (name === 'client') refreshClientsListHome();
  if (name === 'recommandations') renderRecommandations();
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => goPage(item.dataset.page));
});

// ────────────────────────────────────────────────────────────────────────────
// PROGRESS
// ────────────────────────────────────────────────────────────────────────────
function updateProgress() {
  let total = 0, answered = 0;
  state.chapters.forEach(ch => {
    if (state.hidden.chapters[ch.id]) return;
    ch.questions.forEach(q => {
      if (state.hidden.questions[q.id]) return;
      if (q.qtype === 'freetext') return;
      total++;
      if (state.answers[q.id]) answered++;
    });
  });
  document.getElementById('prog-answered').textContent = answered;
  document.getElementById('prog-total').textContent = total;
  document.getElementById('prog-fill').style.width = total ? ((answered / total) * 100) + '%' : '0%';
}
updateProgress();

