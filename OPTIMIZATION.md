# Migration und Prüfung

Die Inhalte wurden aus der aktuellen lokalen Website übernommen. WordPress, Enfold, die Datenbank, jQuery und die Page-Builder-Skripte werden für den Betrieb der neuen Website nicht benötigt.

## Übernommene Inhalte

| Bereich | Umfang |
| --- | ---: |
| Hauptseiten | 7 |
| NEWS inklusive bisherigem LOG | 11 Einträge |
| PERFORMANCES | 5 Gruppen |
| FILMS | 5 Filme mit separaten Vorschauen |
| PICTURES | 29 Fotografien |
| ABOUT | 4 vollständige Chronologie-Abschnitte |
| CONTACT | Adresse, Kuratorin, E-Mail und Animation |

## Gemessene Dateigrößen

| Bestandteil | Unkomprimiert | Gzip zum Vergleich |
| --- | ---: | ---: |
| CSS | 11,7 KB | 3,4 KB |
| JavaScript | 3,4 KB | 1,2 KB |
| Startseiten-HTML | 5,5 KB | 1,3 KB |

Die übernommenen GIF-Animationen belegten zusammen 11.860.441 Bytes. Ihre MP4-Ersatzdateien belegen 752.795 Bytes: rund **94 % weniger**. Die tatsächliche Übertragung eines Seitenaufrufs hängt von der Fenstergröße und den angesehenen Medien ab. Große Filme laden erst beim Öffnen ihres Dialogs; Schleifen nur nahe dem sichtbaren Bereich und nicht bei aktiviertem Datensparmodus oder reduzierter Bewegung.

Die gesamte statische Ausgabe einschließlich aller Filme, Fotos, PDFs und Bildvarianten umfasst etwa 53 MiB. Keine Einzeldatei erreicht die GitHub-Grenze von 100 MiB.

## Geprüft

- Alle sieben Seiten haben Titel, Beschreibung und genau eine Hauptüberschrift.
- 542 relative Seiten- und Medienverweise wurden auf vorhandene Dateien geprüft.
- Anzahl der NEWS-Einträge, Performance-Gruppen, Filme und Fotos stimmt mit dem Import überein.
- Keine lokale WordPress-Adresse oder WordPress-Abhängigkeit in den fertigen HTML-Seiten.
- Smartphone-Layout: NEWS-Bild und Text stehen untereinander; kein horizontaler Überlauf.
- Burger-Menü: schwarzer Hintergrund, Animation von oben, zentrierte Schaltfläche.
- Galerie: Öffnen, nächstes Bild und Schließen funktionieren.
- Film-Dialog: Vollfilm wird bei Klick eingesetzt und beim Schließen entfernt.
- ABOUT bei 972 Pixeln: Figuren unten ausgerichtet, natürliche Bildproportionen, keine Navigationsköpfe.

Die Datei dokumentiert lokale Größen- und Funktionsprüfungen, keinen garantierten Lighthouse-Score.
