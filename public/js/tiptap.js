// ────────────────────────────────────────────────────────────────────────────
// TIPTAP EDITORS — chargement via esm.sh (bundle avec dépendances incluses)
// ────────────────────────────────────────────────────────────────────────────
const tiptapEditors = {};
let _tiptapReady = false;
let _tiptapModules = null;
let _tiptapReadyCallbacks = [];

// Charge Tiptap une seule fois via import() dynamique (esm.sh résout les dépendances)
async function _loadTiptap() {
  if (_tiptapReady) return _tiptapModules;
  if (_tiptapModules === 'loading') {
    return new Promise(res => _tiptapReadyCallbacks.push(res));
  }
  _tiptapModules = 'loading';
  try {
    const [
      { Editor },
      { Document },
      { Paragraph },
      { Text },
      { Bold },
      { Italic },
      { Underline },
      { BulletList },
      { OrderedList },
      { ListItem },
      { HardBreak },
      { History },
      { Table },
      { TableRow },
      { TableHeader },
      { TableCell },
    ] = await Promise.all([
      import('https://esm.sh/@tiptap/core@2.4.0'),
      import('https://esm.sh/@tiptap/extension-document@2.4.0'),
      import('https://esm.sh/@tiptap/extension-paragraph@2.4.0'),
      import('https://esm.sh/@tiptap/extension-text@2.4.0'),
      import('https://esm.sh/@tiptap/extension-bold@2.4.0'),
      import('https://esm.sh/@tiptap/extension-italic@2.4.0'),
      import('https://esm.sh/@tiptap/extension-underline@2.4.0'),
      import('https://esm.sh/@tiptap/extension-bullet-list@2.4.0'),
      import('https://esm.sh/@tiptap/extension-ordered-list@2.4.0'),
      import('https://esm.sh/@tiptap/extension-list-item@2.4.0'),
      import('https://esm.sh/@tiptap/extension-hard-break@2.4.0'),
      import('https://esm.sh/@tiptap/extension-history@2.4.0'),
      import('https://esm.sh/@tiptap/extension-table@2.4.0'),
      import('https://esm.sh/@tiptap/extension-table-row@2.4.0'),
      import('https://esm.sh/@tiptap/extension-table-header@2.4.0'),
      import('https://esm.sh/@tiptap/extension-table-cell@2.4.0'),
    ]);
    _tiptapModules = {
      Editor,
      extensions: [
        Document, Paragraph, Text,
        Bold, Italic, Underline,
        BulletList, OrderedList, ListItem,
        HardBreak, History,
        Table.configure({ resizable: false }),
        TableRow, TableHeader, TableCell,
      ]
    };
    _tiptapReady = true;
    _tiptapReadyCallbacks.forEach(cb => cb(_tiptapModules));
    _tiptapReadyCallbacks = [];
    return _tiptapModules;
  } catch (err) {
    console.warn('Tiptap load failed:', err.message);
    _tiptapModules = null;
    _tiptapReady = false;
    return null;
  }
}

// Initialise un éditeur Tiptap dans les éléments id-toolbar et id-editor
async function initTiptap(id, initialHTML, onUpdate) {
  const toolbarEl = document.getElementById(id + '-toolbar');
  const editorEl  = document.getElementById(id + '-editor');
  if (!toolbarEl || !editorEl) return;
  if (tiptapEditors[id]) {
    try { tiptapEditors[id].destroy(); } catch {}
    delete tiptapEditors[id];
  }

  const mods = await _loadTiptap();
  // Vérifier que les éléments sont toujours dans le DOM après le chargement async
  if (!document.getElementById(id + '-editor')) return;
  if (!mods) {
    _initFallbackEditor(id, editorEl, toolbarEl, initialHTML, onUpdate);
    return;
  }

  try {
    const { Editor, extensions } = mods;
    const editor = new Editor({
      element: editorEl,
      extensions,
      content: initialHTML || '',
      onUpdate: () => {
        const val = editor.getHTML() === '<p></p>' ? '' : editor.getHTML();
        state[id] = val;
        if (onUpdate) onUpdate(val);
      },
    });
    tiptapEditors[id] = editor;
    _buildToolbar(editor, toolbarEl);
    editor.on('selectionUpdate', () => _buildToolbar(editor, toolbarEl));
    editor.on('transaction',     () => _buildToolbar(editor, toolbarEl));
  } catch (err) {
    console.warn('Tiptap init failed:', err.message);
    _initFallbackEditor(id, editorEl, toolbarEl, initialHTML, onUpdate);
  }
}

function _buildToolbar(editor, toolbarEl) {
  const inTable = editor.isActive('table');

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

  toolbarEl.innerHTML = '';

  // Boutons de base
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
    b.addEventListener('mousedown', e => { e.preventDefault(); btn.cmd(); });
    toolbarEl.appendChild(b);
  });

  // Séparateur avant tableau
  const sep2 = document.createElement('div');
  sep2.className = 'tiptap-btn-sep';
  toolbarEl.appendChild(sep2);

  // Bouton tableau + picker de taille
  const wrap = document.createElement('div');
  wrap.className = 'tiptap-table-wrap';

  const tableBtn = document.createElement('button');
  tableBtn.type = 'button';
  tableBtn.className = 'tiptap-btn' + (inTable ? ' active' : '');
  tableBtn.title = 'Insérer un tableau';
  tableBtn.innerHTML = '⊞';

  const picker = document.createElement('div');
  picker.className = 'tiptap-table-picker';

  const ROWS = 6, COLS = 6;
  const grid = document.createElement('div');
  grid.className = 'tiptap-table-grid';
  grid.style.gridTemplateColumns = `repeat(${COLS}, 18px)`;

  const label = document.createElement('div');
  label.className = 'tiptap-table-label';
  label.textContent = 'Choisir une taille';

  let hoverR = 0, hoverC = 0;

  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'tiptap-table-cell-pick';
      cell.addEventListener('mouseenter', () => {
        hoverR = r; hoverC = c;
        cells.forEach((cc, idx) => {
          const cr = Math.floor(idx / COLS), cc2 = idx % COLS;
          cc.classList.toggle('hover', cr <= r && cc2 <= c);
        });
        label.textContent = `${r+1} × ${c+1}`;
      });
      cell.addEventListener('mousedown', e => {
        e.preventDefault();
        picker.classList.remove('open');
        editor.chain().focus().insertTable({ rows: r + 1, cols: c + 1, withHeaderRow: true }).run();
        _buildToolbar(editor, toolbarEl);
      });
      grid.appendChild(cell);
      cells.push(cell);
    }
  }

  picker.appendChild(grid);
  picker.appendChild(label);

  tableBtn.addEventListener('mousedown', e => {
    e.preventDefault();
    e.stopPropagation();
    if (inTable) return;
    const isOpen = picker.classList.contains('open');
    picker.classList.toggle('open');
    if (!isOpen) {
      // Un seul listener, se retire tout seul après le premier clic extérieur
      setTimeout(() => {
        document.addEventListener('mousedown', function closePickerOnce(e) {
          if (!wrap.contains(e.target)) {
            picker.classList.remove('open');
            document.removeEventListener('mousedown', closePickerOnce, true);
          }
        }, true);
      }, 0);
    }
  });

  wrap.appendChild(tableBtn);
  wrap.appendChild(picker);
  toolbarEl.appendChild(wrap);

  // Actions contextuelles si dans un tableau
  if (inTable) {
    const sep3 = document.createElement('div');
    sep3.className = 'tiptap-btn-sep';
    toolbarEl.appendChild(sep3);

    const tableActions = [
      { label: '+col→', title: 'Ajouter colonne après',  cmd: () => editor.chain().focus().addColumnAfter().run() },
      { label: '-col',  title: 'Supprimer colonne',       cmd: () => editor.chain().focus().deleteColumn().run() },
      { label: '+lig↓', title: 'Ajouter ligne après',     cmd: () => editor.chain().focus().addRowAfter().run() },
      { label: '-lig',  title: 'Supprimer ligne',          cmd: () => editor.chain().focus().deleteRow().run() },
      { label: '🗑',    title: 'Supprimer le tableau',    cmd: () => editor.chain().focus().deleteTable().run() },
    ];

    tableActions.forEach(btn => {
      const b = document.createElement('button');
      b.className = 'tiptap-btn';
      b.innerHTML = btn.label;
      b.title = btn.title;
      b.type = 'button';
      b.style.fontSize = '11px';
      b.addEventListener('mousedown', e => { e.preventDefault(); btn.cmd(); _buildToolbar(editor, toolbarEl); });
      toolbarEl.appendChild(b);
    });
  }
}

function _initFallbackEditor(id, editorEl, toolbarEl, initialHTML, onUpdate) {
  editorEl.contentEditable = 'true';
  editorEl.innerHTML = initialHTML || '';
  editorEl.style.minHeight = '80px';
  editorEl.addEventListener('input', () => {
    const val = editorEl.innerHTML;
    state[id] = val;
    if (onUpdate) onUpdate(val);
  });
  toolbarEl.innerHTML = `
    <button class="tiptap-btn" type="button" title="Gras"     onmousedown="event.preventDefault();document.execCommand('bold')"><b>B</b></button>
    <button class="tiptap-btn" type="button" title="Italique" onmousedown="event.preventDefault();document.execCommand('italic')"><i>I</i></button>
    <button class="tiptap-btn" type="button" title="Souligné" onmousedown="event.preventDefault();document.execCommand('underline')"><u>U</u></button>
    <div class="tiptap-btn-sep"></div>
    <button class="tiptap-btn" type="button" title="Liste"    onmousedown="event.preventDefault();document.execCommand('insertUnorderedList')">≡</button>
    <button class="tiptap-btn" type="button" title="Num."     onmousedown="event.preventDefault();document.execCommand('insertOrderedList')">①</button>
  `;
}

// Génère le HTML d'un wrapper Tiptap (à insérer via innerHTML)
function tiptapWrapperHTML(id, placeholder) {
  return `<div class="tiptap-wrapper" id="${id}-wrapper">
    <div class="tiptap-toolbar" id="${id}-toolbar"></div>
    <div class="tiptap-editor" id="${id}-editor" data-placeholder="${placeholder || ''}"></div>
  </div>`;
}

// Initialise un éditeur après insertion dans le DOM
// onUpdate(html) est appelé à chaque modification
function initTiptapDynamic(id, initialContent, onUpdate) {
  if (tiptapEditors[id]) {
    try { tiptapEditors[id].destroy(); } catch {}
    delete tiptapEditors[id];
  }
  const html = initialContent && !String(initialContent).trim().startsWith('<')
    ? String(initialContent).split('\n').map(l => `<p>${l || '<br>'}</p>`).join('')
    : (initialContent || '');
  initTiptap(id, html, onUpdate);
}

// Lit le contenu HTML d'un éditeur
function getTiptapValue(id) {
  const ed = tiptapEditors[id];
  if (ed) {
    const html = ed.getHTML();
    return html === '<p></p>' ? '' : html;
  }
  const el = document.getElementById(id + '-editor');
  return el ? el.innerHTML : '';
}

// Détruit tous les éditeurs dont l'id commence par prefix
function destroyTiptapEditors(prefix) {
  Object.keys(tiptapEditors).forEach(id => {
    if (id.startsWith(prefix)) {
      try { tiptapEditors[id].destroy(); } catch {}
      delete tiptapEditors[id];
    }
  });
}

// Fonctions pour intro/conclusion (generate page)
function syncTiptapToState() {
  ['intro', 'conclusion'].forEach(id => {
    const ed = tiptapEditors[id];
    if (ed) state[id] = ed.getHTML();
    else {
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
