// Génère des rapports d'audit en .doc ou .html
// Deux mises en page : COGEP (charte graphique) et Simple (épurée)
// Supporte les images base64 dans les paragraphes de réponse

const fs   = require('fs');
const path = require('path');

const esc = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// Dossier uploads (public/uploads/) — relatif à ce fichier
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Convertit une URL /uploads/img_xxx.png en data URI base64
// Renvoie null si le fichier n'existe pas ou si c'est déjà une data URI
function urlToBase64DataUri(url) {
  if (!url) return null;
  if (url.startsWith('data:')) return url; // déjà base64
  const filename = decodeURIComponent(url.replace(/^\/uploads\//, ''));
  const filepath = path.join(UPLOADS_DIR, path.basename(filename));
  if (!fs.existsSync(filepath)) return null;
  try {
    const ext = path.extname(filepath).toLowerCase();
    const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
    const mime = mimeMap[ext] || 'image/png';
    const data = fs.readFileSync(filepath).toString('base64');
    return `data:${mime};base64,${data}`;
  } catch { return null; }
}

// Lit les dimensions en pixels d'une image (PNG/JPEG) sans dépendance externe
function getImageDimensions(url) {
  try {
    if (!url || url.startsWith('data:')) return null;
    const filename = decodeURIComponent(url.replace(/^\/uploads\//, ''));
    const filepath = path.join(UPLOADS_DIR, path.basename(filename));
    if (!fs.existsSync(filepath)) return null;
    const buf = fs.readFileSync(filepath);
    const ext = path.extname(filepath).toLowerCase();
    if (ext === '.png') {
      if (buf[0]===0x89 && buf[1]===0x50 && buf.length > 24)
        return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    } else if (ext === '.jpg' || ext === '.jpeg') {
      let i = 2;
      while (i < buf.length - 8) {
        if (buf[i] !== 0xFF) break;
        const marker = buf[i+1];
        const len = buf.readUInt16BE(i+2);
        if ((marker >= 0xC0 && marker <= 0xC3) || (marker >= 0xC5 && marker <= 0xC7) ||
            (marker >= 0xC9 && marker <= 0xCB) || (marker >= 0xCD && marker <= 0xCF))
          return { w: buf.readUInt16BE(i+7), h: buf.readUInt16BE(i+5) };
        i += 2 + len;
      }
    }
  } catch {}
  return null;
}

// Contraint les dimensions à une largeur max en préservant le ratio
function constrainDimensions(dims, maxWpx) {
  if (!dims) return { w: maxWpx, h: Math.round(maxWpx * 0.6) };
  if (dims.w <= maxWpx) return { w: dims.w, h: dims.h };
  const ratio = dims.h / dims.w;
  return { w: maxWpx, h: Math.round(maxWpx * ratio) };
}

// Contraint les dimensions en respectant à la fois une largeur ET une hauteur max
function constrainDimensionsBoth(dims, maxWpx, maxHpx) {
  if (!dims) return { w: maxWpx, h: maxHpx };
  let { w, h } = dims;
  if (w > maxWpx) { h = Math.round(h * maxWpx / w); w = maxWpx; }
  if (h > maxHpx) { w = Math.round(w * maxHpx / h); h = maxHpx; }
  return { w, h };
}

// Lit les dimensions depuis un data URI base64 (PNG ou JPEG)
function getImageDimensionsFromDataUri(dataUri) {
  try {
    if (!dataUri || !dataUri.startsWith('data:')) return null;
    const base64 = dataUri.split(',')[1];
    if (!base64) return null;
    const buf = Buffer.from(base64, 'base64');
    // PNG
    if (buf[0]===0x89 && buf[1]===0x50 && buf.length > 24)
      return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    // JPEG
    if (buf[0]===0xFF && buf[1]===0xD8) {
      let i = 2;
      while (i < buf.length - 8) {
        if (buf[i] !== 0xFF) break;
        const marker = buf[i+1];
        const len = buf.readUInt16BE(i+2);
        if ((marker >= 0xC0 && marker <= 0xC3) || (marker >= 0xC5 && marker <= 0xC7) ||
            (marker >= 0xC9 && marker <= 0xCB) || (marker >= 0xCD && marker <= 0xCF))
          return { w: buf.readUInt16BE(i+7), h: buf.readUInt16BE(i+5) };
        i += 2 + len;
      }
    }
  } catch {}
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES COMMUNS
// ─────────────────────────────────────────────────────────────────────────────

function buildClientRows(client) {
  const today = client.auditDate || new Date().toISOString().split('T')[0];
  return [
    ['Entreprise',        client.company],
    ['Contact',           client.contact],
    ['Email',             client.email],
    ['Téléphone',         client.phone],
    ['Adresse',           [client.address, client.postalCode, client.city].filter(Boolean).join(', ')],
    ["Date de l'audit",   today],
    ['Auditeur',          client.auditor],
    ['Référence rapport', client.ref],
  ].filter(([, v]) => v);
}

// Extrait la valeur de réponse (string ou {value, reason})
function answerValue(raw) {
  if (!raw) return null;
  return typeof raw === 'object' ? raw.value : raw;
}

// Extrait la raison "Non applicable" saisie librement
function answerReason(raw) {
  if (!raw || typeof raw !== 'object') return '';
  return raw.reason || '';
}

// Extrait l'image attachée à une réponse libre
function answerImage(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return raw.image || null;
}

function buildRecoItems(chapters, answers, aiContent, styleExtra = '') {
  let items = '';
  if (aiContent?.recommendations?.length) {
    aiContent.recommendations.forEach(r => {
      items += `<li style="margin-bottom:6pt;${styleExtra}">${esc(r)}</li>`;
    });
  } else {
    chapters.forEach(ch => {
      ch.questions.forEach(q => {
        if (q.qtype === 'freetext') return;
        const val = answerValue(answers[q.id]);
        if (val && val.toLowerCase() === 'non' || val && val.toLowerCase() === 'partiel') {
          items += `<li style="margin-bottom:6pt;${styleExtra}"><strong>[${esc(ch.name)}]</strong> ${esc(q.text)}</li>`;
        }
      });
    });
  }
  return items;
}

// Rendu d'une image (URL serveur ou base64 legacy) dans le rapport
// L'image est intégrée en base64 pour que le document soit autonome
// La largeur est contrainte à MAX_IMG_PX pour ne pas dépasser les marges A4
const MAX_IMG_PX = 600; // ~160mm à 96dpi — largeur utile A4 avec marges standards

function renderImage(question, optionKey) {
  const images = question.images || {};
  const img = images[optionKey];
  if (!img) return '';

  const rawSrc = img.url || img.data || null;
  const src = rawSrc ? (rawSrc.startsWith('data:') ? rawSrc : urlToBase64DataUri(rawSrc)) : null;
  if (!src) return '';

  // Lire les dimensions réelles et contraindre à MAX_IMG_PX
  const dims = getImageDimensions(rawSrc);
  const { w, h } = constrainDimensions(dims, MAX_IMG_PX);

  return `<div style="margin:8pt 0 4pt 0;">
    <img src="${src}" alt="${esc(img.name || 'illustration')}"
         width="${w}" height="${h}"
         style="width:${w}px;height:${h}px;max-width:100%;display:block;border:1pt solid #CBD5E1;">
    ${img.caption ? `<p style="font-size:9pt;color:#666;margin:4pt 0 0 0;font-style:italic;">${esc(img.caption)}</p>` : ''}
  </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// VERSION COGEP (charte graphique)
// ─────────────────────────────────────────────────────────────────────────────

function htmlToDocCogep({ client, chapters, answers, aiContent }) {
  const today = client.auditDate || new Date().toISOString().split('T')[0];

  const C = {
    NAVY:     '#00274A', NAVY2:    '#002649', CYAN:     '#00A3E0',
    GREEN:    '#2BE083', ELECTRIC: '#4950FF', ORANGE:   '#FBAE40',
    WHITE:    '#FFFFFF', LIGHT_BG: '#F1F4F8', TEXT_DARK:'#00274A', TEXT_MED: '#44546A',
  };

  const clientTableRows = buildClientRows(client).map(([label, value]) => `
    <tr>
      <td style="background:${C.NAVY};color:${C.WHITE};font-weight:bold;padding:7pt 12pt;border:1pt solid ${C.NAVY2};width:32%;font-family:Calibri,Arial,sans-serif;font-size:10pt;">${esc(label)}</td>
      <td style="padding:7pt 12pt;border:1pt solid #CBD5E1;font-family:Calibri,Arial,sans-serif;font-size:10pt;color:${C.TEXT_DARK};">${esc(value)}</td>
    </tr>`).join('');

  const intro = aiContent?.introduction ||
    `Dans le cadre de sa mission d'accompagnement en sécurité informatique, ${esc(client.auditor || "l'auditeur")} a réalisé un audit des systèmes d'information de <strong>${esc(client.company)}</strong> en date du ${esc(today)}. Cet audit a pour objectif d'évaluer le niveau de maturité en matière de sécurité informatique et d'identifier les axes d'amélioration prioritaires.`;

  const conclusion = aiContent?.conclusion ||
    `Cet audit a permis d'évaluer le niveau de sécurité informatique de <strong>${esc(client.company)}</strong>. Les points identifiés doivent faire l'objet d'un plan d'action priorisé afin de renforcer la posture de sécurité globale de l'organisation.`;

  const sectionTitle = (text, anchorId = '') => `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18pt;border-collapse:collapse;">
  <tr>
    <td style="background:${C.NAVY};padding:10pt 18pt;">
      ${anchorId ? `<a name="${anchorId}" id="${anchorId}"></a>` : ''}
      <span style="color:${C.WHITE};font-size:16pt;font-weight:bold;font-family:Calibri,Arial,sans-serif;">${text}</span>
    </td>
    <td style="background:${C.GREEN};width:12pt;padding:0;"></td>
    <td style="background:${C.CYAN};width:6pt;padding:0;"></td>
  </tr>
</table>`;

  // IDs d'ancres pour chaque section du sommaire
  const sectionIds = ['section-client', 'section-intro', ...chapters.map((_, i) => `section-ch-${i}`), 'section-conclusion'];
  const allItems   = ['Informations client', 'Introduction', ...chapters.map(ch => ch.name), 'Conclusion & Recommandations'];

  // Sommaire avec liens
  const sommaireRows = allItems.map((name, i) => `
    <tr>
      <td style="padding:5pt 10pt;width:30pt;text-align:right;color:${C.CYAN};font-weight:bold;font-size:11pt;font-family:Calibri,Arial,sans-serif;">${i+1}.</td>
      <td style="padding:5pt 10pt;font-size:11pt;color:${C.NAVY};font-family:Calibri,Arial,sans-serif;border-bottom:1pt solid #E8EEF4;">
        <a href="#${sectionIds[i]}" style="color:${C.NAVY};text-decoration:none;">${esc(name)}</a>
      </td>
    </tr>`).join('');

  // Chapitres
  let chaptersHtml = '';
  chapters.forEach((chapter, ci) => {
    const bannerBg   = ci % 2 === 0 ? C.NAVY : C.CYAN;
    const bannerText = ci % 2 === 0 ? C.WHITE : C.NAVY;
    const bannerNum  = ci % 2 === 0 ? C.GREEN : C.NAVY;

    chaptersHtml += `
<br style="mso-special-character:line-break;page-break-before:always">
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16pt;border-collapse:collapse;">
  <tr>
    <td style="background:${bannerBg};padding:12pt 18pt;width:6pt;">
      <a name="section-ch-${ci}" id="section-ch-${ci}"></a>
      <span style="color:${bannerNum};font-size:14pt;font-weight:bold;font-family:Calibri,Arial,sans-serif;">${String(ci+1).padStart(2,'0')}</span>
    </td>
    <td style="background:${bannerBg};padding:12pt 8pt 12pt 12pt;">
      <span style="color:${bannerText};font-size:14pt;font-weight:bold;font-family:Calibri,Arial,sans-serif;">${esc(chapter.name).toUpperCase()}</span>
    </td>
    <td style="background:${C.GREEN};width:8pt;"></td>
  </tr>
</table>`;

    chapter.questions.forEach((question, qi) => {

      // ── Bloc libre (freetext) ──────────────────────────────────────────────
      if (question.qtype === 'freetext') {
        chaptersHtml += `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4pt;border-collapse:collapse;">
  <tr>
    <td style="background:${C.ELECTRIC};width:4pt;padding:0;"></td>
    <td style="padding:8pt 12pt;background:${C.LIGHT_BG};">
      <span style="font-size:11pt;font-weight:bold;color:${C.NAVY};font-family:Calibri,Arial,sans-serif;">${esc(question.text)}</span>
    </td>
  </tr>
</table>`;
        if (question.freetextContent) {
          chaptersHtml += `
<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:14pt;border-collapse:collapse;">
  <tr>
    <td style="background:${C.ELECTRIC};width:4pt;padding:0;"></td>
    <td style="padding:8pt 14pt;font-size:10.5pt;color:${C.TEXT_DARK};line-height:1.7;font-family:Calibri,Arial,sans-serif;border:1pt solid #CBD5E1;border-left:none;white-space:pre-wrap;">
      ${esc(question.freetextContent)}
    </td>
  </tr>
</table>`;
        }
        chaptersHtml += `<hr style="border:none;border-top:1pt solid #CBD5E1;margin:10pt 0;">`;
        return;
      }

      // ── Question à choix (comportement normal) ────────────────────────────
      const raw        = answers[question.id];
      const answer     = answerValue(raw);
      const reason     = answerReason(raw);
      const freeImg    = answerImage(raw);
      const isNA       = answer === 'Non applicable';
      const isFreeA    = answer === 'Réponse libre';
      const content    = answer && !isNA && !isFreeA ? (question.paragraphs[answer] || '') : '';

      let badgeBg = '#E8EEF4', badgeColor = C.TEXT_DARK, badgeBorder = '#CBD5E1';
      if (answer) {
        const lo = answer.toLowerCase();
        if (lo === 'oui')             { badgeBg='#E6FBF3'; badgeColor='#1A7A4A'; badgeBorder=C.GREEN; }
        else if (lo === 'non')        { badgeBg='#FFF4E6'; badgeColor='#8B5E00'; badgeBorder=C.ORANGE; }
        else if (lo === 'partiel')    { badgeBg='#FAEEDA'; badgeColor='#854F0B'; badgeBorder='#FBAE40'; }
        else if (lo === 'non applicable') { badgeBg='#F1EFE8'; badgeColor='#5F5E5A'; badgeBorder='#B4B2A9'; }
        else if (lo === 'réponse libre')  { badgeBg='#EEF5FC'; badgeColor='#185FA5'; badgeBorder='#B0CFEA'; }
        else                          { badgeBg='#EEF0FF'; badgeColor='#2D32AA'; badgeBorder=C.ELECTRIC; }
      }

      chaptersHtml += `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4pt;border-collapse:collapse;">
  <tr>
    <td style="background:${C.CYAN};width:4pt;padding:0;"></td>
    <td style="padding:8pt 12pt;background:${C.LIGHT_BG};">
      <span style="font-size:11pt;font-weight:bold;color:${C.NAVY};font-family:Calibri,Arial,sans-serif;">${ci+1}.${qi+1}&nbsp;&nbsp;${esc(question.text)}</span>
    </td>
  </tr>
</table>`;

      if (answer) {
        chaptersHtml += `
<table cellpadding="0" cellspacing="0" style="margin-bottom:8pt;border-collapse:collapse;">
  <tr>
    <td style="background:${badgeBg};color:${badgeColor};padding:4pt 16pt;font-size:10pt;font-weight:bold;border:1pt solid ${badgeBorder};font-family:Calibri,Arial,sans-serif;">
      Réponse : ${esc(answer)}
    </td>
  </tr>
</table>`;
      } else {
        chaptersHtml += `<p style="color:#999;font-style:italic;font-size:10pt;font-family:Calibri,Arial,sans-serif;margin:0 0 8pt 0;">Non renseigné</p>`;
      }

      if (content || renderImage(question, answer) || isNA || isFreeA) {
        // Image de réponse libre (depuis answers[qid].image)
        const freeImgHtml = (() => {
          if (!freeImg) return '';
          const src = freeImg.url ? urlToBase64DataUri(freeImg.url) : (freeImg.data || null);
          if (!src) return '';
          return `<div style="margin:8pt 0 4pt 0;"><img src="${src}" alt="${esc(freeImg.name||'illustration')}" style="max-width:460px;max-height:300px;display:block;border:1pt solid #CBD5E1;">${freeImg.caption ? `<p style="font-size:9pt;color:#666;margin:4pt 0 0 0;font-style:italic;">${esc(freeImg.caption)}</p>` : ''}</div>`;
        })();
        const bodyContent = isNA
          ? `<span style="font-style:italic;color:#5F5E5A;">Non applicable</span>${reason ? `<br>${esc(reason)}` : ''}`
          : isFreeA
          ? `<span style="font-weight:bold;color:#185FA5;font-size:9.5pt;">Informations :</span>${reason ? `<br>${esc(reason)}` : '<br><span style="font-style:italic;color:#999;">—</span>'}${freeImgHtml}`
          : `${content ? esc(content) : ''}${answer ? renderImage(question, answer) : ''}`;
        const borderColor = isNA ? '#B4B2A9' : isFreeA ? '#B0CFEA' : C.GREEN;
        chaptersHtml += `
<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:14pt;border-collapse:collapse;">
  <tr>
    <td style="background:${borderColor};width:4pt;padding:0;"></td>
    <td style="padding:8pt 14pt;font-size:10.5pt;color:${C.TEXT_DARK};line-height:1.7;font-family:Calibri,Arial,sans-serif;border:1pt solid #CBD5E1;border-left:none;">
      ${bodyContent}
    </td>
  </tr>
</table>`;
      }

      chaptersHtml += `<hr style="border:none;border-top:1pt solid #CBD5E1;margin:10pt 0;">`;
    });
  });

  const recoItems = buildRecoItems(chapters, answers, aiContent, `font-size:10.5pt;font-family:Calibri,Arial,sans-serif;color:${C.TEXT_DARK};`);

  const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="UTF-8">
<title>Rapport Audit - ${esc(client.company)}</title>
<!--[if gte mso 9]><xml>
  <w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument>
</xml><![endif]-->
<style>
  @page { size:A4; margin:0; }
  body { font-family:Calibri,Arial,sans-serif; font-size:11pt; color:${C.TEXT_DARK}; line-height:1.5; margin:0; padding:0; }
  table { border-collapse:collapse; }
  p { margin:0 0 8pt 0; }
  img { border:0; }
</style>
</head>
<body>

<!-- PAGE DE GARDE -->
<table width="100%" height="842pt" cellpadding="0" cellspacing="0" style="border-collapse:collapse;min-height:700pt;">
  <tr>
    <td style="background:${C.NAVY};width:55%;padding:60pt 40pt 40pt 50pt;vertical-align:middle;">
      <p style="color:${C.GREEN};font-size:11pt;font-weight:bold;letter-spacing:2pt;margin:0 0 20pt 0;font-family:Calibri,Arial,sans-serif;">COGEP NUMÉRIQUE</p>
      <p style="color:${C.WHITE};font-size:26pt;font-weight:bold;line-height:1.2;margin:0 0 8pt 0;font-family:Calibri,Arial,sans-serif;">RAPPORT D'AUDIT</p>
      <p style="color:${C.WHITE};font-size:26pt;font-weight:bold;line-height:1.2;margin:0 0 30pt 0;font-family:Calibri,Arial,sans-serif;">INFORMATIQUE</p>
      <p style="color:${C.CYAN};font-size:18pt;font-weight:bold;margin:0 0 40pt 0;font-family:Calibri,Arial,sans-serif;">${esc(client.company||'Entreprise')}</p>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr><td style="color:#8DB4CC;font-size:9pt;padding:3pt 0;width:80pt;font-family:Calibri,Arial,sans-serif;">Auditeur</td><td style="color:${C.WHITE};font-size:9pt;padding:3pt 0;font-family:Calibri,Arial,sans-serif;">${esc(client.auditor||'—')}</td></tr>
        <tr><td style="color:#8DB4CC;font-size:9pt;padding:3pt 0;font-family:Calibri,Arial,sans-serif;">Contact</td><td style="color:${C.WHITE};font-size:9pt;padding:3pt 0;font-family:Calibri,Arial,sans-serif;">${esc(client.contact||'—')}</td></tr>
        <tr><td style="color:#8DB4CC;font-size:9pt;padding:3pt 0;font-family:Calibri,Arial,sans-serif;">Date</td><td style="color:${C.WHITE};font-size:9pt;padding:3pt 0;font-family:Calibri,Arial,sans-serif;">${esc(today)}</td></tr>
        <tr><td style="color:#8DB4CC;font-size:9pt;padding:3pt 0;font-family:Calibri,Arial,sans-serif;">Référence</td><td style="color:${C.WHITE};font-size:9pt;padding:3pt 0;font-family:Calibri,Arial,sans-serif;">${esc(client.ref||'—')}</td></tr>
      </table>
      <p style="color:#8DB4CC;font-size:8pt;font-style:italic;margin:40pt 0 0 0;letter-spacing:1pt;font-family:Calibri,Arial,sans-serif;">DOCUMENT CONFIDENTIEL</p>
    </td>
    <td style="background:${C.LIGHT_BG};width:45%;padding:0;vertical-align:top;">
      <table width="100%" height="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;height:100%;">
        <tr><td style="background:${C.CYAN};height:200pt;"></td><td style="background:${C.ELECTRIC};height:200pt;width:50%;"></td></tr>
        <tr><td style="background:${C.GREEN};height:150pt;" colspan="2"></td></tr>
        <tr><td style="background:${C.LIGHT_BG};height:200pt;" colspan="2" style="vertical-align:middle;text-align:center;padding:20pt;">
          ${client.logoBase64
            ? (() => {
                const dims = getImageDimensionsFromDataUri(client.logoBase64);
                const { w, h } = constrainDimensionsBoth(dims, 213, 133); // 160pt x 100pt à 96dpi
                return `<img src="${client.logoBase64}" alt="Logo" width="${w}" height="${h}" style="width:${w}px;height:${h}px;display:block;margin:0 auto;">`;
              })()
            : `<p style="color:${C.NAVY};font-size:9pt;text-align:right;padding:16pt;margin:0;font-family:Calibri,Arial,sans-serif;">cogep-numerique.fr</p>`}
        </td></tr>
        <tr><td style="background:${C.NAVY};height:60pt;"></td><td style="background:${C.GREEN};height:60pt;"></td></tr>
      </table>
    </td>
  </tr>
</table>

<br style="mso-special-character:line-break;page-break-before:always">
<table width="100%" cellpadding="0" cellspacing="0" style="margin:40pt 50pt 20pt 50pt;width:calc(100% - 100pt);border-collapse:collapse;">
  <tr><td colspan="2" style="padding-bottom:12pt;">${sectionTitle('SOMMAIRE')}</td></tr>
  ${sommaireRows}
</table>

<br style="mso-special-character:line-break;page-break-before:always">
<div style="margin:40pt 50pt;font-family:Calibri,Arial,sans-serif;">
${sectionTitle('INFORMATIONS CLIENT', 'section-client')}
<table cellpadding="0" cellspacing="0" width="100%">${clientTableRows}</table>
</div>

<br style="mso-special-character:line-break;page-break-before:always">
<div style="margin:40pt 50pt;font-family:Calibri,Arial,sans-serif;">
${sectionTitle('INTRODUCTION', 'section-intro')}
<p style="font-size:11pt;line-height:1.8;color:${C.TEXT_DARK};">${intro}</p>
</div>

<div style="margin:0 50pt;font-family:Calibri,Arial,sans-serif;">
${chaptersHtml}
</div>

<br style="mso-special-character:line-break;page-break-before:always">
<div style="margin:40pt 50pt;font-family:Calibri,Arial,sans-serif;">
${sectionTitle('CONCLUSION ET RECOMMANDATIONS', 'section-conclusion')}
<p style="font-size:11pt;line-height:1.8;color:${C.TEXT_DARK};margin-bottom:16pt;">${conclusion}</p>
${recoItems ? `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16pt;border-collapse:collapse;">
  <tr><td style="background:${C.NAVY};padding:8pt 16pt;"><span style="color:${C.GREEN};font-size:12pt;font-weight:bold;font-family:Calibri,Arial,sans-serif;">Points nécessitant une action corrective</span></td></tr>
  <tr><td style="padding:14pt 16pt;border:1pt solid #CBD5E1;"><ol style="margin:0;padding-left:20pt;">${recoItems}</ol></td></tr>
</table>` : ''}
</div>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:40pt;border-collapse:collapse;">
  <tr>
    <td style="background:${C.NAVY};padding:10pt 50pt;width:70%;"><span style="color:#8DB4CC;font-size:9pt;font-family:Calibri,Arial,sans-serif;">Rapport d'audit — ${esc(client.company||'')} — ${esc(today)} — Réf. ${esc(client.ref||'—')}</span></td>
    <td style="background:${C.GREEN};padding:10pt 16pt;width:15%;text-align:right;"><span style="color:${C.NAVY};font-size:9pt;font-weight:bold;font-family:Calibri,Arial,sans-serif;">CONFIDENTIEL</span></td>
    <td style="background:${C.CYAN};width:15%;padding:10pt 16pt;text-align:right;"><span style="color:${C.WHITE};font-size:9pt;font-family:Calibri,Arial,sans-serif;font-weight:bold;">COGEP NUMÉRIQUE</span></td>
  </tr>
</table>

</body>
</html>`;

  return Buffer.from('\ufeff' + html, 'utf8');
}

// ─────────────────────────────────────────────────────────────────────────────
// VERSION SIMPLE (mise en page épurée, sans charte)
// ─────────────────────────────────────────────────────────────────────────────

function htmlToDocSimple({ client, chapters, answers, aiContent }) {
  const today = client.auditDate || new Date().toISOString().split('T')[0];

  const intro = aiContent?.introduction ||
    `Dans le cadre de sa mission d'accompagnement en sécurité informatique, ${esc(client.auditor || "l'auditeur")} a réalisé un audit des systèmes d'information de ${esc(client.company)} en date du ${esc(today)}.`;

  const conclusion = aiContent?.conclusion ||
    `Cet audit a permis d'évaluer le niveau de sécurité informatique de ${esc(client.company)}. Les points identifiés doivent faire l'objet d'un plan d'action priorisé.`;

  const clientTableRows = buildClientRows(client).map(([label, value]) => `
    <tr>
      <td style="font-weight:bold;padding:5pt 10pt;border:1pt solid #CCC;width:30%;background:#F5F5F5;">${esc(label)}</td>
      <td style="padding:5pt 10pt;border:1pt solid #CCC;">${esc(value)}</td>
    </tr>`).join('');

  const sectionIds = ['section-client', 'section-intro', ...chapters.map((_, i) => `section-ch-${i}`), 'section-conclusion'];
  const allItems = ['Informations client', 'Introduction', ...chapters.map(ch => ch.name), 'Conclusion & Recommandations'];

  let chaptersHtml = '';
  chapters.forEach((chapter, ci) => {
    chaptersHtml += `
<br style="mso-special-character:line-break;page-break-before:always">
<h2 id="section-ch-${ci}" style="font-size:14pt;color:#222;border-bottom:2pt solid #222;padding-bottom:4pt;margin-bottom:14pt;"><a name="section-ch-${ci}"></a>${ci+1}. ${esc(chapter.name)}</h2>`;

    chapter.questions.forEach((question, qi) => {

      // ── Bloc libre (freetext) ─────────────────────────────────────────────
      if (question.qtype === 'freetext') {
        chaptersHtml += `
<p style="font-size:12pt;font-weight:bold;margin:12pt 0 4pt 0;border-left:3pt solid #666;padding-left:8pt;">${esc(question.text)}</p>`;
        if (question.freetextContent) {
          chaptersHtml += `<p style="font-size:10.5pt;line-height:1.8;white-space:pre-wrap;margin:0 0 8pt 0;color:#333;">${esc(question.freetextContent)}</p>`;
        }
        chaptersHtml += `<hr style="border:none;border-top:1pt solid #DDD;margin:10pt 0;">`;
        return;
      }

      // ── Question à choix ──────────────────────────────────────────────────
      const raw     = answers[question.id];
      const answer  = answerValue(raw);
      const reason  = answerReason(raw);
      const freeImg = answerImage(raw);
      const isNA    = answer === 'Non applicable';
      const content = answer && !isNA ? (question.paragraphs[answer] || '') : '';

      // Badge simple
      const badgeStyle = !answer ? 'background:#e9ecef;color:#495057;border:1pt solid #dee2e6;'
        : answer.toLowerCase() === 'oui'            ? 'background:#d4edda;color:#155724;border:1pt solid #c3e6cb;'
        : answer.toLowerCase() === 'non'            ? 'background:#f8d7da;color:#721c24;border:1pt solid #f5c6cb;'
        : answer.toLowerCase() === 'partiel'        ? 'background:#fff3cd;color:#856404;border:1pt solid #ffeeba;'
        : answer.toLowerCase() === 'non applicable' ? 'background:#f1efea;color:#5f5e5a;border:1pt solid #ccc;'
        : answer.toLowerCase() === 'réponse libre'  ? 'background:#dbeafe;color:#1d4ed8;border:1pt solid #93c5fd;'
        :                                             'background:#fff3cd;color:#856404;border:1pt solid #ffeeba;';
      const isFreeA = answer && answer.toLowerCase() === 'réponse libre';

      chaptersHtml += `
<p style="font-size:11pt;font-weight:bold;margin:12pt 0 4pt 0;">${ci+1}.${qi+1} — ${esc(question.text)}</p>`;

      if (answer) {
        chaptersHtml += `<p style="margin:0 0 6pt 0;"><span style="font-size:10pt;font-weight:bold;padding:3pt 10pt;${badgeStyle}">Réponse : ${esc(answer)}</span></p>`;
      } else {
        chaptersHtml += `<p style="font-style:italic;color:#888;font-size:10pt;margin:0 0 6pt 0;">Non renseigné</p>`;
      }

      if (isNA && reason) {
        chaptersHtml += `<p style="font-size:10.5pt;line-height:1.7;border-left:3pt solid #aaa;padding-left:10pt;margin:0 0 6pt 10pt;color:#555;font-style:italic;">${esc(reason)}</p>`;
      } else if (isFreeA) {
        chaptersHtml += `<p style="font-size:9.5pt;font-weight:bold;color:#1d4ed8;margin:0 0 2pt 10pt;">Informations :</p>`;
        chaptersHtml += `<p style="font-size:10.5pt;line-height:1.7;border-left:3pt solid #93c5fd;padding-left:10pt;margin:0 0 6pt 10pt;color:#333;">${reason ? esc(reason) : '<em>—</em>'}</p>`;
        if (freeImg) {
          const src = freeImg.url ? urlToBase64DataUri(freeImg.url) : (freeImg.data || null);
          if (src) {
            chaptersHtml += `<div style="margin:6pt 0 6pt 10pt;"><img src="${src}" alt="${esc(freeImg.name||'illustration')}" style="max-width:460px;max-height:300px;display:block;border:1pt solid #CBD5E1;">${freeImg.caption ? `<p style="font-size:9pt;color:#666;margin:4pt 0 0 0;font-style:italic;">${esc(freeImg.caption)}</p>` : ''}</div>`;
          }
        }
      } else if (content) {
        chaptersHtml += `<p style="font-size:10.5pt;line-height:1.7;border-left:3pt solid #888;padding-left:10pt;margin:0 0 6pt 10pt;color:#333;">${esc(content)}</p>`;
      }
      if (answer && !isNA && !isFreeA) {
        chaptersHtml += renderImage(question, answer);
      }
      chaptersHtml += `<hr style="border:none;border-top:1pt solid #DDD;margin:10pt 0;">`;
    });
  });

  const recoItems = buildRecoItems(chapters, answers, aiContent);

  const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="UTF-8">
<title>Rapport Audit - ${esc(client.company)}</title>
<!--[if gte mso 9]><xml>
  <w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument>
</xml><![endif]-->
<style>
  @page { size:A4; margin:2cm 2.5cm; }
  body { font-family:Arial,sans-serif; font-size:11pt; color:#222; line-height:1.5; }
  table { border-collapse:collapse; }
  p { margin:0 0 8pt 0; }
  h1 { font-size:18pt; color:#111; margin:0 0 6pt 0; }
  h2 { font-size:14pt; color:#111; }
  img { border:0; }
</style>
</head>
<body>

<!-- ENTÊTE -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:6pt;border-collapse:collapse;">
  <tr>
    <td style="vertical-align:bottom;">
      <h1 style="margin:0 0 4pt 0;">Rapport d'audit informatique</h1>
      <p style="font-size:14pt;font-weight:bold;margin:0 0 4pt 0;">${esc(client.company||'')}</p>
      <p style="font-size:10pt;color:#555;margin:0;">Auditeur : ${esc(client.auditor||'—')} &nbsp;|&nbsp; Date : ${esc(today)} &nbsp;|&nbsp; Réf. : ${esc(client.ref||'—')}</p>
    </td>
    ${client.logoBase64
      ? (() => {
          const dims = getImageDimensionsFromDataUri(client.logoBase64);
          const { w, h } = constrainDimensionsBoth(dims, 200, 80); // 150pt x 60pt à 96dpi
          return `<td style="vertical-align:middle;text-align:right;width:160pt;"><img src="${client.logoBase64}" alt="Logo" width="${w}" height="${h}" style="width:${w}px;height:${h}px;display:block;margin-left:auto;"></td>`;
        })()
      : ''}
  </tr>
</table>
<hr style="border:none;border-top:2pt solid #222;margin:0 0 20pt 0;">

<!-- SOMMAIRE -->
<h2>Sommaire</h2>
<ol style="font-size:11pt;line-height:2;">
  ${allItems.map((n, i) => `<li><a href="#${sectionIds[i]}" style="color:#111;text-decoration:none;">${esc(n)}</a></li>`).join('')}
</ol>

<!-- INFOS CLIENT -->
<br style="mso-special-character:line-break;page-break-before:always">
<a name="section-client" id="section-client"></a>
<h2 style="border-bottom:1pt solid #CCC;padding-bottom:4pt;margin-bottom:12pt;">Informations client</h2>
<table width="100%" cellpadding="0" cellspacing="0">${clientTableRows}</table>

<!-- INTRODUCTION -->
<br style="mso-special-character:line-break;page-break-before:always">
<a name="section-intro" id="section-intro"></a>
<h2 style="border-bottom:1pt solid #CCC;padding-bottom:4pt;margin-bottom:12pt;">Introduction</h2>
<p style="font-size:11pt;line-height:1.8;">${intro}</p>

<!-- CHAPITRES -->
${chaptersHtml}

<!-- CONCLUSION -->
<br style="mso-special-character:line-break;page-break-before:always">
<a name="section-conclusion" id="section-conclusion"></a>
<h2 style="border-bottom:1pt solid #CCC;padding-bottom:4pt;margin-bottom:12pt;">Conclusion et recommandations</h2>
<p style="font-size:11pt;line-height:1.8;margin-bottom:14pt;">${conclusion}</p>
${recoItems ? `<h3 style="font-size:12pt;margin-bottom:8pt;">Points nécessitant une action corrective :</h3><ol>${recoItems}</ol>` : ''}

</body>
</html>`;

  return Buffer.from('\ufeff' + html, 'utf8');
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

function htmlToDoc(params) {
  // Filtrer les chapitres et questions masqués avant génération
  const hidden = params.hidden || { chapters: {}, questions: {} };
  const filteredChapters = (params.chapters || [])
    .filter(ch => !hidden.chapters[ch.id])
    .map(ch => ({
      ...ch,
      questions: ch.questions.filter(q => !hidden.questions[q.id])
    }))
    .filter(ch => ch.questions.length > 0); // exclure chapitres vides après filtre masquage

  const filtered = { ...params, chapters: filteredChapters };

  if (params.layout === 'simple') return htmlToDocSimple(filtered);
  return htmlToDocCogep(filtered);
}

module.exports = { htmlToDoc };
