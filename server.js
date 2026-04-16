const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const crypto  = require('crypto');
const { htmlToDoc } = require('./docxGenerator');

const app     = express();
const PORT    = process.env.PORT || 3000;
const UPLOADS = path.join(__dirname, 'public', 'uploads');

// S'assurer que le dossier uploads existe
if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Servir les fichiers statiques (dont /uploads/)
app.use(express.static(path.join(__dirname, 'public')));

// ── Liste des images ─────────────────────────────────────────────────────────
app.get('/api/images', (req, res) => {
  try {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const files = fs.readdirSync(UPLOADS)
      .filter(f => allowed.includes(path.extname(f).toLowerCase()))
      .map(f => {
        const stat = fs.statSync(path.join(UPLOADS, f));
        // Lire le nom lisible depuis le fichier .meta si présent
        const metaPath = path.join(UPLOADS, f + '.meta');
        let displayName = f;
        if (fs.existsSync(metaPath)) {
          try { displayName = fs.readFileSync(metaPath, 'utf8').trim(); } catch {}
        }
        return {
          filename: f,
          url: `/uploads/${f}`,
          name: displayName,
          size: stat.size,
          mtime: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => b.mtime.localeCompare(a.mtime)); // plus récentes en premier
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Upload d'image ───────────────────────────────────────────────────────────
// Reçoit le binaire de l'image en body raw, le nom dans X-Filename, le nom lisible dans X-Display-Name
app.post('/api/upload', express.raw({ type: '*/*', limit: '20mb' }), (req, res) => {
  try {
    const originalName = req.headers['x-filename'] || 'image.png';
    const displayName  = req.headers['x-display-name']
      ? decodeURIComponent(req.headers['x-display-name'])
      : decodeURIComponent(originalName);
    const ext = path.extname(originalName).toLowerCase() || '.png';

    // Valider l'extension
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    if (!allowed.includes(ext)) {
      return res.status(400).json({ error: 'Format non supporté. Formats acceptés : JPG, PNG, GIF, WEBP, SVG.' });
    }

    // Générer un nom unique
    const hash = crypto.randomBytes(8).toString('hex');
    const filename = `img_${hash}${ext}`;
    const filepath = path.join(UPLOADS, filename);

    fs.writeFileSync(filepath, req.body);

    // Sauvegarder le nom lisible dans un fichier .meta
    if (displayName) {
      fs.writeFileSync(filepath + '.meta', displayName, 'utf8');
    }

    res.json({
      url: `/uploads/${filename}`,
      filename,
      name: displayName || originalName,
      size: req.body.length,
    });
  } catch (err) {
    console.error('Erreur upload:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Suppression d'image ──────────────────────────────────────────────────────
app.delete('/api/upload/:filename', (req, res) => {
  try {
    const filename = path.basename(req.params.filename); // sécurité : pas de path traversal
    const filepath = path.join(UPLOADS, filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    // Supprimer le .meta associé si présent
    const metaPath = filepath + '.meta';
    if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Génération du rapport ────────────────────────────────────────────────────
app.post('/api/generate', (req, res) => {
  let tmpLogoFile = null;
  try {
    const { client, chapters, answers, aiContent, format, layout, hidden } = req.body;

    if (!client || !client.company) {
      return res.status(400).json({ error: 'Informations client manquantes.' });
    }

    // Word ne peut pas afficher les data: URI dans les .doc HTML.
    // On écrit le logo base64 en fichier temporaire et on passe l'URL relative.
    let resolvedClient = { ...client };
    if (client.logoBase64 && client.logoBase64.startsWith('data:')) {
      try {
        const m = client.logoBase64.match(/^data:image\/(\w+);base64,(.+)$/s);
        if (m) {
          const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
          const hash = crypto.randomBytes(6).toString('hex');
          const filename = `tmp_logo_${hash}.${ext}`;
          tmpLogoFile = path.join(UPLOADS, filename);
          fs.writeFileSync(tmpLogoFile, Buffer.from(m[2], 'base64'));
          resolvedClient = { ...client, logoBase64: `/uploads/${filename}` };
        }
      } catch (e) {
        console.warn('Logo temp file error:', e.message);
      }
    }

    const buffer = htmlToDoc({ client: resolvedClient, chapters, answers, aiContent, layout, hidden });
    const safeName = (client.company || 'rapport').replace(/\s+/g, '_');
    const date = client.auditDate || 'date';
    const layoutSuffix = layout === 'simple' ? '_simple' : '';

    if (format === 'html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(`Audit_${safeName}_${date}${layoutSuffix}.html`)}"`);
    } else {
      res.setHeader('Content-Type', 'application/msword');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(`Audit_${safeName}_${date}${layoutSuffix}.doc`)}"`);
    }

    res.send(buffer);
  } catch (err) {
    console.error('Erreur génération:', err);
    res.status(500).json({ error: err.message });
  } finally {
    // Nettoyer le fichier logo temporaire
    if (tmpLogoFile) try { fs.unlinkSync(tmpLogoFile); } catch {}
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', uploads: UPLOADS }));

app.listen(PORT, () => {
  console.log(`\n✅ Serveur démarré sur http://localhost:${PORT}`);
  console.log(`   Images uploadées dans : ${UPLOADS}`);
  console.log(`   Ouvrez http://localhost:${PORT} dans votre navigateur\n`);
});
