// ────────────────────────────────────────────────────────────────────────────
// TIPTAP EDITORS
// ────────────────────────────────────────────────────────────────────────────
const tiptapEditors = {};

// Les UMD Tiptap via jsdelivr s'exposent sous window.tiptap.XXX
// ex: @tiptap/core → window.tiptap.core
function _getTiptapModule(name) {
  const short = name.replace('@tiptap/', '');
  return window[name]
    || window['tiptap-' + short]
    || (window.tiptap && window.tiptap[short])
    || null;
}

function initTiptap(id, initialHTML) {
  const toolbarEl = document.getElementById(id + '-toolbar');
  const editorEl  = document.getElementById(id + '-editor');
  if (!toolbarEl || !editorEl) return;
  if (tiptapEditors[id]) {
    try { tiptapEditors[id].destroy(); } catch {}
    delete tiptapEditors[id];
  }

  const coreModule = _getTiptapModule('@tiptap/core');
  if (!coreModule || !coreModule.Editor) {
    _initFallbackEditor(id, editorEl, toolbarEl, initialHTML);
    return;
  }

  try {
    const { Editor } = coreModule;
    const extNames = [
      '@tiptap/extension-document',
      '@tiptap/extension-paragraph',
      '@tiptap/extension-text',
      '@tiptap/extension-bold',
      '@tiptap/extension-italic',
      '@tiptap/extension-underline',
      '@tiptap/extension-bullet-list',
      '@tiptap/extension-ordered-list',
      '@tiptap/extension-list-item',
      '@tiptap/extension-hard-break',
      '@tiptap/extension-history',
    ];

    const exts = extNames
      .map(name => {
        const mod = _getTiptapModule(name);
        if (!mod) return null;
        return Object.values(mod).find(
          v => v && typeof v === 'object' && v.name && typeof v.configure === 'function'
        );
      })
      .filter(Boolean);

    if (exts.length < 3) throw new Error('Extensions insuffisantes: ' + exts.length);

    const editor = new Editor({
      element: editorEl,
      extensions: exts,
      content: initialHTML || '',
      onUpdate: ({ editor }) => { state[id] = editor.getHTML(); },
    });
    tiptapEditors[id] = editor;

    const buttons = [
      { label: '<b>B</b>', title: 'Gras',       cmd: () => editor.chain().focus().toggleBold().run(),         active: () => editor.isActive('bold') },
      { label: '<i>I</i>', title: 'Italique',    cmd: () => editor.chain().focus().toggleItalic().run(),      active: () => editor.isActive('italic') },
      { label: '<u>U</u>', title: 'Souligné',    cmd: () => editor.chain().focus().toggleUnderline().run(),   active: () => editor.isActive('underline') },
      { sep: true },
      { label: '≡',        title: 'Liste puces', cmd: () => editor.chain().focus().toggleBulletList().run(),  active: () => editor.isActive('bulletList') },
      { label: '①',        title: 'Liste num.',  cmd: () => editor.chain().focus().toggleOrderedList().run(), active: () => editor.isActive('orderedList') },
      { sep: true },
      { label: '↩', title: 'Annuler',  cmd: () => editor.chain().focus().undo().run(), active: () => false },
      { label: '↪', title: 'Rétablir', cmd: () => editor.chain().focus().redo().run(), active: () => false },
    ];

    function renderToolbar() {
      toolbarEl.innerHTML = '';
      buttons.forEach(btn => {
        if (btn.sep) {
          const sep = document.createElement('div');
          sep.className = 'tiptap-btn-sep';
          toolbarEl.appendChild(sep);
          return;
        }
        const b = document.createElement('button');
        b.className = 'tiptap-btn' + (btn.active() ? ' active' : '');
        b.innerHTML = btn.label;
        b.title = btn.title;
        b.type = 'button';
        b.addEventListener('mousedown', e => { e.preventDefault(); btn.cmd(); renderToolbar(); });
        toolbarEl.appendChild(b);
      });
    }
    renderToolbar();
    editor.on('selectionUpdate', renderToolbar);
    editor.on('transaction', renderToolbar);

  } catch (err) {
    console.warn('Tiptap init failed:', err.message, '— fallback activé');
    _initFallbackEditor(id, editorEl, toolbarEl, initialHTML);
  }
}

function _initFallbackEditor(id, editorEl, toolbarEl, initialHTML) {
  editorEl.contentEditable = 'true';
  editorEl.innerHTML = initialHTML || '';
  editorEl.style.minHeight = '80px';
  editorEl.addEventListener('input', () => { state[id] = editorEl.innerHTML; });
  toolbarEl.innerHTML = `
    <button class="tiptap-btn" title="Gras"     onmousedown="event.preventDefault();document.execCommand('bold')"><b>B</b></button>
    <button class="tiptap-btn" title="Italique" onmousedown="event.preventDefault();document.execCommand('italic')"><i>I</i></button>
    <button class="tiptap-btn" title="Souligné" onmousedown="event.preventDefault();document.execCommand('underline')"><u>U</u></button>
    <div class="tiptap-btn-sep"></div>
    <button class="tiptap-btn" title="Liste"    onmousedown="event.preventDefault();document.execCommand('insertUnorderedList')">≡</button>
    <button class="tiptap-btn" title="Num."     onmousedown="event.preventDefault();document.execCommand('insertOrderedList')">①</button>
  `;
}

function syncTiptapToState() {
  ['intro', 'conclusion'].forEach(id => {
    const ed = tiptapEditors[id];
    if (ed) {
      state[id] = ed.getHTML();
    } else {
      const el = document.getElementById(id + '-editor');
      if (el) state[id] = el.innerHTML;
    }
  });
}

function setTiptapContent(id, html) {
  const ed = tiptapEditors[id];
  if (ed) {
    ed.commands.setContent(html || '');
  } else {
    const el = document.getElementById(id + '-editor');
    if (el) el.innerHTML = html || '';
  }
  state[id] = html || '';
}
