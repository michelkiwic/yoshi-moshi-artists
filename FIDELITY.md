# Abgleich mit der WordPress-Referenz

Die erste statische Version war funktional migriert, aber nicht originalgetreu genug. Die korrigierte Fassung verwendet die tatsächlich berechneten Eigenschaften der vorhandenen WordPress-Seiten als Referenz.

## Schrift

Die Referenz lädt `Oswald` mit dem Google-Fonts-Aufruf `css?family=Oswald&display=auto`. Dieser liefert ausschließlich Regular (400). Fettschrift 700/800 wird dort vom Browser synthetisiert. Daher verwendet die statische Website nun dieselbe Regular-Schriftdatei mit derselben Deklaration und dieselben angeforderten Gewichte. Eine variable 200–700-Schrift wäre optisch nicht gleichwertig.

Zusätzlich wurden die berechneten Schriftgrößen, Zeilenhöhen und Buchstabenabstände übernommen. Beispielsweise hat NEWS bei 1482 Pixeln Fensterbreite eine Schriftgröße von 163,02 px, Gewicht 800, Zeilenhöhe 127,156 px und Buchstabenabstand −3,2604 px. Bei 390 Pixeln sind es 70,2 px, 800, 54,756 px und −1,404 px.

## Bewegung

Die drei Punkte verwenden wieder die fünf Bewegungsabschnitte des Originals mit horizontaler und vertikaler Bewegung, `ease-in-out`, zufälligen Laufzeiten zwischen 5 und 8 Sekunden, zufälligen Startphasen und derselben Positionsberechnung. Die zufälligen Startpositionen unterscheiden sich bewusst bei jedem Laden, auch auf der WordPress-Seite. Die weißen Farbtropfen verwenden den ursprünglichen 8-Sekunden-Verlauf bis `scaleY(1.1)`.

## Layout und Artwork

`public/fidelity.css` enthält die aus der Referenz übertragenen Regeln. Es korrigiert Hauptseite, Navigation, Titel, Textkästen, Chronologien, Medienkarten, CONTACT-Spalten und responsive Abstände. Die fünf dekorativen Artwork-Dateien wurden verlustfrei aus den Originalen übernommen, mit unveränderten Bildabmessungen.

Die Elemente wurden im selben Browser bei 390 × 844 und 1482 × 1244 Pixeln gemessen. Beispiele übereinstimmender sichtbarer Rechtecke (x, y, Breite, Höhe):

| Element | 390 × 844 | 1482 × 1244 |
| --- | --- | --- |
| Hauptseiten-Logo | 117,3 / 128 / 140,4 / 242,1 | 570,5 / 386,9 / 326 / 562,3 |
| NEWS-Titel | 19,7 / 185,6 / 330 / 54,8 | 167 / 266,7 / 1120 / 127,1 |
| PERFORMANCES-Titel | 56,6 / 211,6 / 258,8 / 28,9 | 167 / 266,7 / 1120 / 127,1 |
| FILMS-Titel | 55,3 / 211,6 / 258,8 / 54,8 | 167 / 266,7 / 1120 / 127,1 |
| PICTURES-Titel | 55,9 / 211,6 / 258,8 / 42,6 | 167 / 266,7 / 1120 / 127,1 |
| ABOUT-Titel | 79,4 / 112 / 239,4 / 133,4 | 445,4 / 144 / 563,2 / 464,6 |

Für weitere Designänderungen sollten dieselben Größen und derselbe Browser verglichen werden. Animationen und Videos müssen zusätzlich in Bewegung geprüft werden. Ein einzelner Screenshot kann zufällige Startphasen nicht sinnvoll vergleichen. Textumbrüche, Positionen und Schriftwerte lassen sich dagegen direkt messen.

CSS, JavaScript und Font-Deklarationen erhalten beim Bauen Inhaltskennungen in ihren URLs. Dadurch werden nach einem Update keine alten Gestaltungsregeln aus dem Browsercache verwendet.
