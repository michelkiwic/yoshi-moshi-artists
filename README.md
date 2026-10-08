# Yoshi + Moshi — eigenständige Website

Statische, WordPress-unabhängige Version der aktuellen Künstlerwebsite. Die Website verwendet ausschließlich HTML, CSS und kleines natives JavaScript. Keine Datenbank, kein PHP, kein Framework, keine Plugins und keine externen Schrift- oder Tracking-Anfragen.

## Lokal ansehen

Benötigt Node.js 22 oder neuer. Im Projektordner:

```sh
npm ci
npm run build
npm run check
npm run dev
```

Die Vorschau ist unter `http://127.0.0.1:4173` erreichbar. Änderungen an `public/site.css`, `public/site.js` oder `content/site.json` mit `npm run build` übernehmen und die Browserseite aktualisieren.

## Auf GitHub hochladen

1. Ein neues Repository anlegen und den **Inhalt dieses Projektordners** hochladen, einschließlich `.github`, `content`, `public`, `tools`, `package.json` und `package-lock.json`.
2. `node_modules` und `dist` nicht hochladen; diese sind in `.gitignore` ausgeschlossen.
3. Im Repository unter **Settings → Pages → Source** die Option **GitHub Actions** auswählen.
4. Der mitgelieferte Workflow baut, prüft und veröffentlicht die Website bei einem Push auf `main`. Er kann auch unter **Actions** manuell gestartet werden.

Die Seiten und Medien verwenden relative Pfade. Der GitHub-Pages-Workflow veröffentlicht Version 1 unter `https://michelkiwic.github.io/yoshi-moshi-artists/V1/`; die Repository-Startadresse leitet dorthin weiter. Die vorhandenen URLs `film-performances-yoshi-moshi/`, `yoshi-moshi-3/` und `log/` sind als Weiterleitungen enthalten.

Alternativ kann der gesamte Inhalt von `dist/` direkt auf einem beliebigen statischen Webhost liegen. Für eine eigene Domain beim Bauen `SITE_URL` setzen, damit Canonical-URLs und `sitemap.xml` die richtige Adresse enthalten. In PowerShell beispielsweise:

```powershell
$env:SITE_URL = 'https://deine-domain.ch'
npm run build
```

## Inhalte ändern

- `content/site.json`: Alle Texte, Chronologien, Einträge und Medienzuordnungen. Die NEWS-Chronik enthält auch das bisherige LOG-Archiv.
- `public/media/`: Lokale Medien. Vorhandene Bilder liegen in mehreren WebP-Größen vor; GIF-Animationen werden durch kompakte MP4-Schleifen ersetzt.
- `public/fonts/`: Selbst gehostete Oswald-Schrift samt Lizenz.
- `public/site.css`: Gestaltung und responsive Layouts.
- `public/site.js`: Menü, Galerie, Film-Dialoge und bedarfsgesteuerte Videos.
- `tools/build.mjs`: Erzeugt die vollständigen HTML-Seiten in `dist/`.

Die einmalige Migration ist in `tools/import.mjs` dokumentiert. Sie wird **nicht** beim Bauen oder Veröffentlichen ausgeführt. Für die fertige Website wird die alte WordPress-Installation nicht benötigt.

## Optimierungen

- Vollständig vorgerenderte Seiten, sinnvoller HTML-Inhalt auch ohne JavaScript.
- Responsive WebP-Bilder mit festen Abmessungen, Lazy Loading und lokalem Font.
- Kleine Vorschauvideos statt animierter GIF-Dateien; große Filme werden erst beim Öffnen geladen.
- Native Dialoge mit Tastaturbedienung, Escape-Schließen und Fokusverwaltung.
- Responsive, exakt zentrierte Navigation, die von oben herunterkommt.
- Rücksicht auf reduzierte Bewegung und Datensparmodus.
- Kein WordPress-/Enfold-Code, keine jQuery-Abhängigkeit, kein Analytics und keine Cookie-Banner-Abhängigkeit.
- Metadaten, Sprachangabe, Favicon, robots.txt, optionale Sitemap und GitHub-Pages-Workflow.

Alle künstlerischen Inhalte und Medien bleiben Eigentum ihrer jeweiligen Rechteinhaber. Die Oswald-Schrift steht unter der beiliegenden SIL Open Font License.
