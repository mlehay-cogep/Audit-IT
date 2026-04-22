// ────────────────────────────────────────────────────────────────────────────
// STATE — les chapitres/questions sont chargés depuis data.js
// ────────────────────────────────────────────────────────────────────────────
let state = {
  chapters: JSON.parse(JSON.stringify(AUDIT_DATA)),
  answers: {},
  hidden: { chapters: {}, questions: {} }, // masqués dans l'onglet Audit
  modal: null,
  logoBase64: null,  // logo client en base64 (data URI)
  intro: '',         // texte d'introduction personnalisé
  conclusion: '',    // texte de conclusion personnalisé
  recoActions: {},   // actions correctives par question
};

