# Sitzplan-Generator (classroom-arranger)

Erstellt aus den Sitznachbar-Wünschen einer Klasse einen Sitzplan — unter
Berücksichtigung von 18 Regeln je Kind (Lage im Raum, Platzeigenschaften, Beziehung zu
einem anderen Kind; jeweils weich oder hart). Oberfläche auf **Deutsch, Englisch,
Französisch und Spanisch.** Läuft vollständig im Browser: **kein Server,
keine Datenübertragung.**

Kurzanleitung für Lehrkräfte (PDF, z. B. für eduki):
[`docs/Sitzplan-Generator_Kurzanleitung-Lehrkraefte.pdf`](docs/Sitzplan-Generator_Kurzanleitung-Lehrkraefte.pdf)

```bash
npm install
npm run dev      # Entwicklungsserver auf http://localhost:5173
npm test         # Solver-, Regel-, Validierungs- und Übersetzungstests
npm run bench    # Solver auf der Demo-Klasse, mit Textausgabe des Sitzplans
npm run build    # statischer Build nach dist/
```

## Regeln je Kind

Je Kind lassen sich beliebig viele Regeln über ein nach Themen gegliedertes Auswahlmenü
hinzufügen ([`src/domain/rules.ts`](src/domain/rules.ts)). Jede Regel ist **weich**
(Wunsch, wird in der Zielfunktion belohnt) oder **hart** (wird nie verletzt).

| Gruppe | Regeln |
|---|---|
| Lage im Raum | vorne · nicht hinten · hinten · höchstens bis Reihe … · ab Reihe … · linke Hälfte · rechte Hälfte · Raummitte |
| Platzeigenschaften | Fenster · nicht am Fenster · Gang · nicht am Gang · nahe der Tür · nicht an der Tür |
| Beziehung zu einem Kind | nicht neben … · nicht am selben Tisch wie … · direkt neben … · am selben Tisch wie … |

Harte Platzregeln sperren Plätze, harte „nicht neben / nicht am selben Tisch“-Regeln
sperren Züge (strukturell, wie Pins). Harte „neben / selber Tisch“-Regeln können nicht
strukturell ausgedrückt werden (jeder einzelne Zug trennt das Paar kurzzeitig) und gehen
daher mit einer sehr hohen Strafe in die Zielfunktion ein; die Vorabprüfung und der Bericht
melden, falls sie dennoch nicht erfüllt sind. Ältere Datensätze mit einer eigenen
Trennungsliste werden beim Laden automatisch in Regeln umgewandelt.

## Der Algorithmus

Das Problem ist ein **Quadratic Assignment Problem**: Personen auf Plätze abbilden,
wobei die Bewertung von *Paaren* abhängt (wer neben wem). NP-schwer, aber die
Instanz ist klein (≈ 30 Personen) und dünn besetzt — lokale Suche liefert hier
praktisch das Optimum in Millisekunden.

### 1. Nähe-Kernel — [`src/domain/proximity.ts`](src/domain/proximity.ts)

Aus der Raumgeometrie wird einmalig berechnet, wie stark zwei Plätze zusammengehören:

| Beziehung | Gewicht |
|---|---|
| direkt nebeneinander | 1,0 |
| gleicher Tisch, gegenüber oder über Eck | 0,6 |
| gleicher Tisch, weiter entfernt | 0,4 |
| direkt davor / dahinter | 0,35 |
| diagonal versetzt | 0,2 |
| durch einen Gang getrennt | 0 |

*Gestuft* statt binär — das glättet die Zielfunktion, sodass die Suche nicht auf
Plateaus stecken bleibt, und bildet ab, dass „am selben Gruppentisch“ ein halb
erfüllter Wunsch ist.

Welche Rasterachse „nebeneinander“ bedeutet, entscheidet die **Blickrichtung** des
Platzes. In Frontalreihen sitzt der Nachbar in derselben Zeile, am Arm einer U-Form
in derselben Spalte — dieselbe Regel deckt beides ab.

### 2. Zielfunktion — [`src/solver/objective.ts`](src/solver/objective.ts)

Je Person:

```
für jeden Wunsch (i → j):  c = Rangwert · Gegenseitigkeit · w(Platz_i, Platz_j)
                               Rangwert      = 10 / 6 / 3
                               Gegenseitigkeit = ×1,6, wenn j sich ebenfalls i wünscht

Beiträge absteigend, mit abnehmendem Grenznutzen:
    satScore = c₁·1,0 + c₂·0,4 + c₃·0,16

Fairness: −25, wenn kein Wunsch die Nähe-Schwelle (0,6) erreicht
Weiche Regeln: gestufter Bonus für den belegten Platz bzw. für die Nähe zu einem Kind
```

Drei Terme trennen „mathematisch optimal“ von „fühlt sich gerecht an“:

- **Gegenseitigkeit** — echte Freundschaftspaare wiegen mehr als einseitige Wünsche.
- **Abnehmender Grenznutzen** — der zweite erfüllte Wunsch derselben Person zählt nur
  noch 40 %. Verhindert, dass beliebte Kinder alles bekommen und andere leer ausgehen.
- **Fairness-Strafe** — der Hebel für „möglichst niemand ohne erfüllten Wunsch“.

**Harte Regeln stehen nicht in der Bewertung.** Pins, harte Sonderwünsche und
„nicht neben / nicht am selben Tisch“ schränken die zulässigen Züge ein: Unzulässige Züge entstehen gar nicht
erst. Die Suche kann sie deshalb strukturell nicht „erkaufen“.

### 3. Suche

1. **Vorabprüfung** ([`validation.ts`](src/domain/validation.ts)) — meldet
   Unlösbarkeiten im Klartext, bevor gerechnet wird: zu wenige Plätze, widersprüchliche
   Vorgaben, unerfüllbare Trennungen und — über ein bipartites Matching (Hall-Bedingung) —
   Fälle wie „fünf Personen müssen zwingend in die erste Reihe, dort sind vier Plätze“,
   mitsamt den Namen der Beteiligten.
2. **Startlösung** ([`construct.ts`](src/solver/construct.ts)) — *Paar-zuerst*
   (gegenseitige Paare zuerst auf benachbarte Plätze) und *randomisiert-gierig* (GRASP,
   nach Eingeschränktheit sortiert), im Wechsel. Ein Ausweichschritt löst Sackgassen auf,
   in denen für die letzte Person kein zulässiger Platz mehr frei ist.
3. **Simulated Annealing** ([`anneal.ts`](src/solver/anneal.ts)) — Tausch, Umsetzen auf
   einen freien Platz, Dreier-Rotation. Starttemperatur kalibriert auf ~50 % Annahme
   verschlechternder Züge, geometrische Abkühlung, danach deterministisches Bergsteigen.
4. **20 Neustarts**, daraus **3 möglichst verschiedene** gute Varianten zur Auswahl.

Der Geschwindigkeitstrick ist die **inkrementelle Delta-Auswertung**: Wechselt Person i
den Platz, ändert sich die Bewertung nur für i selbst und für alle, die sich i wünschen —
typisch 4 statt 30 Personen. Ein Zug kostet dadurch ~30 Operationen statt ~500.

**Ergebnis für 28 Personen auf 30 Plätzen: 20 Neustarts × 40 000 Schritte in ~280 ms**,
27 von 28 Personen mit mindestens einem erfüllten Wunsch, alle harten Regeln eingehalten.

## Datenschutz

- **Kein Backend.** Nach dem Laden stellt die Seite keine Netzwerkverbindung mehr her —
  im Browsertest nachgewiesen: null Anfragen an fremde Hosts.
- Daten liegen ausschließlich in der **IndexedDB** dieses Browsers; JSON-Export als Sicherung.
- Keine Cookies, kein Tracking, keine externen Schriften oder CDNs (Fraunces und
  Atkinson Hyperlegible werden mit der Anwendung ausgeliefert).
- Namensanzeige umschaltbar auf Vorname bzw. Vorname + Anfangsbuchstabe (Datenminimierung).
- Impressum und Datenschutzerklärung ([`src/pages/Legal.tsx`](src/pages/Legal.tsx))
  entsprechen dem Impressum auf <https://tinfo.space/about/impressum.html>; die
  Übersetzungen sind Lesehilfen, verbindlich ist die deutsche Fassung. Das ist keine
  Rechtsberatung.

## Aufbau

```
src/
  types/model.ts        Datenmodell
  domain/               roomTemplates · proximity · validation · names
  solver/               problem · objective · construct · anneal · solve · report · worker
  state/                store (IndexedDB) · useSolver (Web Worker)
  components/           RoomEditor · StudentTable · WishEditor · SeatGrid
                        SeatingView · ReportPanel · WeightSliders
  export/               print.css · exportJson
  i18n/                 Übersetzungen (locales/de · en · fr · es) · Kontext · Platzhalter/Plural
  pages/Legal.tsx       Impressum · Datenschutz
docs/
  teacher-guide/        Quelle der PDF-Kurzanleitung (HTML + Screenshots)
  Sitzplan-Generator_Kurzanleitung-Lehrkraefte.pdf
  fixtures/demoClass.ts Beispielklasse (28 Personen)
```

`solver/` und `domain/` haben **keine React-Abhängigkeit** — reines TypeScript, im Web
Worker lauffähig und isoliert testbar.

## Tests

Die wichtigste Zusicherung ist die **Delta-Invariante**: Über 5 000 zufällige Züge muss
das inkrementell berechnete Delta exakt der vollständigen Neubewertung entsprechen. Wäre
es falsch, liefe die Suche stillschweigend in die falsche Richtung und gäbe trotzdem
plausibel aussehende Sitzpläne aus — ein Fehler, der ohne diesen Test unentdeckt bliebe.

Dazu: harte Regeln werden über tausende Zufallsläufe nie verletzt; der Nähe-Kernel ist
symmetrisch und trifft für jede Vorlage die erwarteten Nachbarschaften; die Vorabprüfung
erkennt konstruierte Unlösbarkeiten und benennt die richtigen Personen.

## Übersetzungen

Neue Texte gehören in alle vier Dateien unter `src/i18n/locales/`; `de.ts` ist die Referenz,
TypeScript und ein Test prüfen, dass Schlüssel und Platzhalter übereinstimmen. Mehrzahlformen
heißen `schluessel_one` / `schluessel_other`. Meldungen des Solvers sind sprachneutrale
`Msg`-Objekte und werden erst in der Oberfläche übersetzt.

## Kurzanleitung als PDF

Die Quelle liegt in [`docs/teacher-guide/index.html`](docs/teacher-guide/index.html) (nutzt die
Schriften aus `node_modules`). Neu erzeugen mit:

```bash
chromium --headless --no-pdf-header-footer --allow-file-access-from-files \
  --print-to-pdf=docs/Sitzplan-Generator_Kurzanleitung-Lehrkraefte.pdf \
  "file://$PWD/docs/teacher-guide/index.html"
```

## Veröffentlichen

`npm run build` erzeugt einen statischen Build in `dist/`. Der Vite-Build nutzt relative
Pfade (`base: './'`), läuft also in jedem Unterverzeichnis. Der Workflow unter
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) veröffentlicht bei jedem
Push auf `main` nach GitHub Pages (in den Repository-Einstellungen unter *Pages* als
Quelle „GitHub Actions“ auswählen).
