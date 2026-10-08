/** Deutsche Texte — die Referenz für alle anderen Sprachen. */

export const de = {
  // Allgemein
  'common.name': 'Name',
  'common.ok': 'ok',
  'common.unknown': '(unbekannt)',

  // Gerüst
  'app.title': 'Sitzplan-Generator',
  'app.subtitle': 'läuft vollständig im Browser · keine Datenübertragung',
  'app.className': 'Klasse',
  'app.classNamePlaceholder': 'z. B. 7b',
  'app.language': 'Sprache',
  'app.steps': 'Arbeitsschritte',
  'app.loading': 'Gespeicherte Daten werden geladen …',
  'step.room': 'Klassenzimmer',
  'step.class': 'Klasse',
  'step.wishes': 'Wünsche & Regeln',
  'step.plan': 'Sitzplan',
  'footer.imprint': 'Impressum',
  'footer.privacy': 'Datenschutz',
  'footer.save': 'Daten sichern',
  'footer.load': 'Sicherung laden',
  'footer.demo': 'Beispielklasse laden',
  'footer.reset': 'Alle Daten löschen',
  'demo.loaded': 'Beispielklasse geladen — {count} Personen mit Wünschen und Regeln.',
  'import.done': 'Daten geladen.',
  'import.failed': 'Die Datei konnte nicht gelesen werden.',
  'import.invalidJson': 'Die Datei ist keine gültige JSON-Datei.',
  'import.noClassData': 'Die Datei enthält keine Klassendaten dieses Programms.',
  'reset.confirm':
    'Alle gespeicherten Daten dieser Anwendung unwiderruflich löschen?\n\n' +
    'Namen, Wünsche, Regeln und der Sitzplan gehen dabei verloren. ' +
    'Sichern Sie vorher gegebenenfalls über „Daten sichern“.',
  'reset.done': 'Alle Daten wurden gelöscht.',

  // Schritt 1: Klassenzimmer
  'room.title': 'Klassenzimmer',
  'room.layout': 'Anordnung',
  'room.template.rows': 'Frontalreihen (Einzeltische)',
  'room.template.doubleRows': 'Doppelreihen (2er-Tische)',
  'room.template.groups4': '4er-Gruppentische',
  'room.template.groups6': '6er-Gruppentische',
  'room.template.uShape': 'U-Form',
  'room.rows': 'Tischreihen',
  'room.armSeats': 'Plätze je Seitenarm',
  'room.tablesPerRow': 'Tische je Reihe',
  'room.backTables': 'Tische hinten',
  'room.seatsPerTable': 'Plätze je Tisch',
  'room.windowSide': 'Fensterseite',
  'room.window.left': 'links',
  'room.window.right': 'rechts',
  'room.window.none': 'kein Fenster berücksichtigen',
  'room.door': 'Tür',
  'room.doorPos.frontLeft': 'vorne links',
  'room.doorPos.frontRight': 'vorne rechts',
  'room.doorPos.backLeft': 'hinten links',
  'room.doorPos.backRight': 'hinten rechts',
  'room.hint':
    'Die Angaben gelten aus Sicht der Schülerinnen und Schüler, also mit Blick zur Tafel. ' +
    'Zwischen den Tischblöcken liegt jeweils ein Gang — über ihn hinweg zählen Personen ' +
    'nicht als Sitznachbarn.',
  'room.preview': 'Vorschau',
  'room.seatsOnly': '{seats} Plätze',
  'room.seatsMissing': '{seats} Plätze für {students} Personen — es fehlen {missing}.',
  'room.seatsFull': '{seats} Plätze für {students} Personen — kein Platz bleibt frei.',
  'room.seatsFree': '{seats} Plätze für {students} Personen — {free} bleiben frei.',
  'seat.tag.window': 'Fenster',
  'seat.tag.door': 'Tür',
  'seat.tag.aisle': 'Gang',
  'seat.tag.front': 'vorne',
  'seat.tag.back': 'hinten',

  // Schritt 2: Klasse
  'class.addNames': 'Namen hinzufügen',
  'class.onePerLine': 'Ein Name je Zeile',
  'class.placeholder': 'Amelie Bauer\nBen Cordes\nCharlotte Dietz',
  'class.add': 'Hinzufügen',
  'class.pasteHint':
    'Sie können die Liste auch aus einer Tabelle einfügen — Zeilenumbrüche, Kommas und ' +
    'Semikolons trennen die Namen. Das erste Wort gilt als Vorname, der Rest als Nachname.',
  'class.displayAs': 'Namen anzeigen als',
  'class.display.full': 'Vor- und Nachname',
  'class.display.firstName': 'nur Vorname',
  'class.display.initial': 'Vorname + Anfangsbuchstabe',
  'class.displayHint':
    'Gilt für Bildschirm und Ausdruck. Für einen Aushang im Klassenraum reicht meist der ' +
    'Vorname — je weniger personenbezogene Daten sichtbar sind, desto besser.',
  'class.heading': 'Klasse',
  'class.count_one': '{count} Person, {seats} Plätze',
  'class.count_other': '{count} Personen, {seats} Plätze',
  'class.none': 'Noch keine Namen erfasst.',
  'class.firstName': 'Vorname',
  'class.lastName': 'Nachname',
  'class.firstNameOf': 'Vorname von {name}',
  'class.lastNameOf': 'Nachname von {name}',
  'class.remove': '{name} entfernen',
  'class.removeTitle': 'Entfernen — löscht auch alle Wünsche und Regeln zu dieser Person',

  // Schritt 3: Wünsche & Regeln
  'wishes.title': 'Wünsche & Regeln',
  'wishes.heading': 'Wünsche und Regeln',
  'wishes.empty': 'Erfassen Sie zuerst die Namen der Klasse.',
  'wishes.intro':
    'Je Kind können bis zu drei Sitznachbar-Wünsche und beliebig viele Regeln erfasst werden. ' +
    'Regeln wählen Sie über das Menü „Regel hinzufügen“; es ist nach Themen gegliedert: ' +
    'Lage im Raum, Platzeigenschaften und Beziehung zu einem anderen Kind.',
  'wishes.hardHint':
    'Eine Regel ist entweder „weich“ (ein Wunsch, den der Algorithmus nach Möglichkeit erfüllt) ' +
    'oder „hart“ (wird nie verletzt — gedacht für Attest, Sehschwäche oder Nachteilsausgleich). ' +
    'Je mehr harte Regeln, desto weniger Spielraum bleibt für die übrigen Wünsche. ' +
    'Ein Klick auf „weich“ bzw. „hart“ schaltet um.',
  'wishes.rules': 'Regeln',
  'wishes.first': 'Erstwunsch',
  'wishes.second': 'Zweitwunsch',
  'wishes.third': 'Drittwunsch',
  'wishes.wishOf': '{rank} von {name}',
  'wishes.addRule': '+ Regel hinzufügen …',
  'wishes.addRuleFor': 'Regel für {name} hinzufügen',
  'wishes.removeRule': 'Regel „{rule}“ entfernen',
  'wishes.rowLimit': 'Grenzreihe',
  'wishes.rowNumber': 'Reihe {row}',
  'wishes.ruleTarget': 'Anderes Kind',
  'wishes.soft': 'weich',
  'wishes.hard': 'hart',
  'wishes.softTitle': 'Weicher Wunsch. Klicken, um ihn verbindlich zu machen.',
  'wishes.hardTitle':
    'Harte Regel — wird nie verletzt. Klicken, um sie zu einem Wunsch zu machen.',

  // Regelkatalog
  'rule.group.position': 'Lage im Raum',
  'rule.group.features': 'Platzeigenschaften',
  'rule.group.neighbours': 'Beziehung zu einem anderen Kind',
  'rule.front.name': 'Vorne sitzen (erste Reihe)',
  'rule.front.short': 'vorne',
  'rule.notBack.name': 'Nicht in der letzten Reihe',
  'rule.notBack.short': 'nicht hinten',
  'rule.back.name': 'Hinten sitzen (letzte Reihe)',
  'rule.back.short': 'hinten',
  'rule.maxRow.name': 'Höchstens bis Reihe …',
  'rule.maxRow.short': 'höchstens bis',
  'rule.minRow.name': 'Frühestens ab Reihe …',
  'rule.minRow.short': 'frühestens ab',
  'rule.leftSide.name': 'Linke Raumhälfte',
  'rule.leftSide.short': 'links',
  'rule.rightSide.name': 'Rechte Raumhälfte',
  'rule.rightSide.short': 'rechts',
  'rule.center.name': 'Raummitte',
  'rule.center.short': 'Mitte',
  'rule.window.name': 'Am Fenster',
  'rule.window.short': 'Fenster',
  'rule.notWindow.name': 'Nicht am Fenster (Blendung, Zugluft)',
  'rule.notWindow.short': 'nicht am Fenster',
  'rule.aisle.name': 'Am Gang',
  'rule.aisle.short': 'Gang',
  'rule.notAisle.name': 'Nicht am Gang',
  'rule.notAisle.short': 'nicht am Gang',
  'rule.nearDoor.name': 'Nah an der Tür',
  'rule.nearDoor.short': 'an der Tür',
  'rule.notDoor.name': 'Nicht an der Tür',
  'rule.notDoor.short': 'nicht an der Tür',
  'rule.notNextTo.name': 'Nicht neben …',
  'rule.notNextTo.short': 'nicht neben',
  'rule.notSameTable.name': 'Nicht am selben Tisch wie …',
  'rule.notSameTable.short': 'nicht am Tisch von',
  'rule.nextTo.name': 'Direkt neben …',
  'rule.nextTo.short': 'neben',
  'rule.sameTable.name': 'Am selben Tisch wie …',
  'rule.sameTable.short': 'am Tisch von',

  // Schritt 4: Sitzplan
  'plan.calculate': 'Sitzplan berechnen',
  'plan.recalculate': 'Neu berechnen',
  'plan.running': 'Berechne …',
  'plan.optimizeRest': 'Rest neu optimieren ({count} festgehalten)',
  'plan.clearPins': 'Alle Pins lösen',
  'plan.needNames': 'Erfassen Sie zuerst die Namen der Klasse.',
  'plan.progress': 'Fortschritt',
  'plan.error': 'Fehler bei der Berechnung: {message}',
  'plan.blocked':
    'Solange sich die harten Regeln widersprechen, gibt es keinen zulässigen Sitzplan. ' +
    'Passen Sie eine der genannten Regeln an.',
  'plan.stats': '{succeeded} von {attempted} Läufen erfolgreich, {ms} ms.',
  'plan.variant': 'Variante {letter}',
  'plan.score': 'Bewertung {score}',
  'plan.teacherView': 'Lehrerperspektive',
  'plan.studentView': 'Schülerperspektive',
  'plan.mirrorTitle': 'Zeigt den Plan so, wie Sie ihn von vorne sehen — links und rechts vertauscht',
  'plan.print': 'Drucken / als PDF speichern',
  'plan.edited':
    'Von Hand geändert. Halten Sie Plätze mit dem Nadel-Symbol fest und wählen Sie ' +
    '„Rest neu optimieren“, damit der Algorithmus den Rest darum herum neu ordnet.',
  'plan.printTitle': 'Sitzplan {name}',
  'plan.facingBoard': 'Blick zur Tafel',
  'plan.legendFirst': 'Erstwunsch erfüllt',
  'plan.legendSecond': 'Zweitwunsch erfüllt',
  'plan.legendNone': 'kein Wunsch erfüllt',
  'plan.legendDrag': 'Zum Umsetzen einen Platz auf einen anderen ziehen.',
  'grid.label': 'Sitzplan',
  'grid.board': 'Tafel',
  'grid.viewFromFront': 'Ansicht von vorne',
  'grid.free': 'frei',
  'grid.pin': 'Platz festhalten',
  'grid.unpin': 'Platz freigeben',
  'grid.pinTitle': 'Platz festhalten — bleibt beim Neuberechnen erhalten',
  'grid.unpinTitle': 'Platz freigeben — wird beim Neuberechnen wieder verschoben',

  // Auswertung
  'report.title': 'Auswertung',
  'report.withWish': 'mit erfülltem Wunsch ({share} %)',
  'report.firstFulfilled': 'erfüllte Erstwünsche',
  'report.secondFulfilled': 'erfüllte Zweitwünsche',
  'report.mutualPairs': 'gegenseitige Paare zusammen',
  'report.rulesSatisfied': 'Regeln erfüllt',
  'report.separations': 'Trennungen eingehalten',
  'report.unfulfilled': 'Ohne erfüllten Wunsch:',
  'report.unfulfilledHint':
    '{names}. Hier lohnt ein prüfender Blick — oft hilft schon ein einzelnes Umsetzen von Hand.',
  'report.allFulfilled':
    'Alle Personen mit Wünschen sitzen neben mindestens einer gewünschten Person.',
  'report.row': 'Reihe',
  'report.wishes': 'Wünsche',
  'report.rules': 'Regeln',
  'report.noWishes': 'keine abgegeben',
  'report.mutualTitle': 'Der Wunsch ist gegenseitig',
  'report.hardTitle': 'harte Regel',
  'report.softTitle': 'weicher Wunsch',

  // Gewichtung
  'weights.title': 'Gewichtung anpassen',
  'weights.hint':
    'Nach dem Verschieben muss neu gerechnet werden. Die Voreinstellung entspricht dem ' +
    'Profil „Fairness zuerst“.',
  'weights.fairness.label': 'Fairness',
  'weights.fairness.hint':
    'Wie stark eine Person ins Gewicht fällt, für die kein einziger Wunsch aufgeht. ' +
    'Hoch = niemand geht leer aus, notfalls auf Kosten der Gesamtzahl.',
  'weights.mutual.label': 'Gegenseitigkeit',
  'weights.mutual.hint':
    'Zuschlag für Wünsche, die auf Gegenseitigkeit beruhen. ' +
    'Hoch = echte Freundschaftspaare gehen vor einseitigen Wünschen.',
  'weights.first.label': 'Erstwunsch',
  'weights.first.hint':
    'Grundwert eines erfüllten Erstwunsches. Der Zweit- und Drittwunsch bleiben im Verhältnis dazu.',
  'weights.rules.label': 'Weiche Regeln',
  'weights.rules.hint':
    'Gewicht der weichen Regeln (Fenster, vorne, Gang, neben …) gegenüber den ' +
    'Sitznachbar-Wünschen.',
  'weights.diminishing.label': 'Zweiter Wunsch derselben Person',
  'weights.diminishing.hint':
    'Anteil, mit dem ein zweiter erfüllter Wunsch derselben Person zählt. ' +
    'Niedrig = die Erfüllung verteilt sich gleichmäßiger über die Klasse.',
  'weights.recalculate': 'Mit neuer Gewichtung rechnen',
  'weights.reset': 'Voreinstellung wiederherstellen',

  // Hinweise des Solvers (Kompilierung)
  'warn.wishUnknown': '{name}: Wunsch verweist auf einen unbekannten Namen.',
  'warn.wishSelf': '{name}: Wunsch auf sich selbst wird ignoriert.',
  'warn.wishDuplicate': '{name}: Doppelter Wunsch wird nur einmal gezählt.',
  'warn.pinnedMissing': '{name}: Fester Platz existiert im Raum nicht mehr.',
  'warn.noSeatAllowed': '{name}: Die harten Regeln lassen keinen einzigen Platz zu.',
  'warn.separationUnknown': 'Eine Trennung verweist auf einen unbekannten Namen und wird ignoriert.',
  'warn.ruleUnknown': '{name}: Eine Regel verweist auf kein gültiges Kind und wird ignoriert.',
  'warn.ruleSelf': '{name}: Eine Regel bezieht sich auf das Kind selbst und wird ignoriert.',

  // Vorabprüfung
  'validation.seatsMissing':
    'Der Raum hat {seats} Plätze, die Klasse zählt aber {students} Personen. Es fehlen {missing} Plätze.',
  'validation.allSeatsTaken':
    'Alle Plätze sind belegt. Ohne freien Platz hat der Algorithmus kaum Spielraum — ' +
    'ein oder zwei zusätzliche Plätze verbessern das Ergebnis oft deutlich.',
  'validation.noSeatAllowed': '{name}: Die harten Regeln schließen jeden Platz im Raum aus.',
  'validation.oversubscribed':
    '{count} Personen ({names}) benötigen wegen harter Regeln Plätze, von denen es nur {seats} ' +
    'gibt. Lockern Sie eine der Regeln oder vergrößern Sie den passenden Bereich.',
  'validation.cannotSeparate':
    '{a} und {b} lassen sich nicht trennen: Ihre harten Platzregeln lassen nur Plätze zu, ' +
    'die zu nah beieinander liegen.',
  'validation.tableClique':
    '{names} müssen alle voneinander getrennt sitzen, es gibt aber nur {tables} Tische. ' +
    'Mindestens zwei von ihnen müssten sich einen Tisch teilen.',
  'validation.togetherConflict':
    '{a} und {b} sollen zugleich zusammen und getrennt sitzen — die beiden harten Regeln ' +
    'widersprechen sich.',
  'validation.togetherImpossible':
    '{a} und {b} sollen zusammensitzen, aber ihre harten Platzregeln lassen keine ' +
    'Plätze zu, die nah genug beieinander liegen.',
  'validation.nobodyWants':
    'Niemand hat sich {names} als Sitznachbarn gewünscht. Der Plan versucht trotzdem, die ' +
    'eigenen Wünsche dieser Personen zu erfüllen — ein Blick lohnt sich aber.',

  // Verletzte harte Regeln im Bericht
  'violation.pinned': '{name} sitzt nicht auf dem festgehaltenen Platz.',
  'violation.hardRule': '{name}: harte Regel nicht eingehalten ({rules}).',
  'violation.seatRule': '{name}: harte Platzregel nicht eingehalten.',
  'violation.separation':
    '{a} und {b} sitzen zu nah beieinander — die Trennung ist verletzt.',
  'violation.together':
    '{a} und {b} sollen zusammensitzen, sitzen aber zu weit auseinander.',

  // Impressum
  'imprint.title': 'Impressum',
  'imprint.translationNote':
    'Rechtlich maßgeblich ist die deutsche Fassung. Diese Übersetzung dient der Orientierung.',
  'imprint.legalBasis': 'Angaben gemäß § 5 DDG',
  'imprint.country': 'Deutschland',
  'imprint.contact': 'Kontakt',
  'imprint.email': 'E-Mail',
  'imprint.form': 'Kontaktformular',
  'imprint.responsible': 'Inhaltlich verantwortlich',
  'imprint.responsibleText': 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:',
  'imprint.support': 'Unterstützung',
  'imprint.supportText':
    'Dieses Projekt ist kostenlos, werbefrei und wird in der Freizeit gepflegt. Ein ' +
    'Buy-Me-a-Coffee-Link für freiwillige Unterstützung ist in Vorbereitung und wird hier ' +
    'freigeschaltet, sobald er verfügbar ist.',
  'imprint.liabilityContent': 'Haftung für Inhalte',
  'imprint.liabilityContentText':
    'Die Inhalte dieser Seiten wurden mit größtmöglicher Sorgfalt erstellt. Für die ' +
    'Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr ' +
    'übernommen werden. Als Diensteanbieter bin ich gemäß § 7 Abs. 1 DDG für eigene Inhalte ' +
    'auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG bin ' +
    'ich als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde ' +
    'Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige ' +
    'Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von ' +
    'Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine ' +
    'diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten ' +
    'Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werde ' +
    'ich diese Inhalte umgehend entfernen.',
  'imprint.liabilityApp':
    'Die erzeugten Sitzpläne sind Vorschläge ohne Gewähr; die pädagogische Verantwortung für ' +
    'die tatsächliche Sitzordnung bleibt bei der Lehrkraft.',
  'imprint.liabilityLinks': 'Haftung für Links',
  'imprint.liabilityLinksText':
    'Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen ' +
    'Einfluss habe. Deshalb kann ich für diese fremden Inhalte auch keine Gewähr übernehmen. ' +
    'Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der ' +
    'Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf ' +
    'mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der ' +
    'Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ' +
    'ist ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden ' +
    'von Rechtsverletzungen werde ich derartige Links umgehend entfernen.',
  'imprint.copyright': 'Urheberrecht',
  'imprint.copyrightText':
    'Die durch mich erstellten Inhalte und Werke auf diesen Seiten unterliegen, soweit nicht ' +
    'anders gekennzeichnet, dem deutschen Urheberrecht. Beiträge Dritter sowie Materialien, die ' +
    'ausdrücklich als frei nutzbar oder gemeinfrei gekennzeichnet sind, sind hiervon ' +
    'ausgenommen und dürfen im Rahmen der jeweils angegebenen Lizenz genutzt werden. Downloads ' +
    'und Kopien dieser Seiten sind nur für den privaten, nicht kommerziellen Gebrauch ' +
    'gestattet, soweit nichts anderes angegeben ist.',
  'imprint.note': 'Hinweis',
  'imprint.noteText': 'Dies ist eine private, redaktionell gepflegte Bildungswebsite.',

  // Datenschutz
  'privacy.title': 'Datenschutzerklärung',
  'privacy.firstTitle': 'Das Wichtigste zuerst',
  'privacy.firstText':
    'Diese Anwendung hat keinen Server. Alle eingegebenen Namen, Wünsche und Sitzpläne werden ' +
    'ausschließlich im Speicher Ihres Browsers verarbeitet und dort gespeichert. Sie werden ' +
    'zu keinem Zeitpunkt übertragen — weder an den Anbieter dieser Seite noch an Dritte. Nach ' +
    'dem Laden der Seite stellt die Anwendung keine Netzwerkverbindungen mehr her; das lässt ' +
    'sich im Netzwerk-Tab der Entwicklerwerkzeuge Ihres Browsers überprüfen.',
  'privacy.whereTitle': 'Welche Daten wo liegen',
  'privacy.dataTitle': 'Namen, Wünsche, Regeln, Sitzpläne',
  'privacy.dataText':
    'Gespeichert in der IndexedDB Ihres Browsers, ausschließlich auf diesem Gerät und in ' +
    'diesem Browserprofil. Kein anderer Nutzer und kein anderes Gerät hat Zugriff darauf.',
  'privacy.langTitle': 'Spracheinstellung',
  'privacy.langText':
    'Die gewählte Sprache wird im lokalen Speicher (localStorage) Ihres Browsers abgelegt, ' +
    'damit sie beim nächsten Besuch erhalten bleibt. Sie enthält keine personenbezogenen Daten ' +
    'und wird nicht übertragen.',
  'privacy.trackingTitle': 'Cookies, Analyse, Tracking, Schriften',
  'privacy.trackingText':
    'Werden nicht eingesetzt. Es gibt keine Zählpixel und keine Reichweitenmessung. Die ' +
    'verwendeten Schriften werden mit der Anwendung selbst ausgeliefert und nicht bei ' +
    'Drittanbietern nachgeladen.',
  'privacy.exportTitle': 'Exportdateien',
  'privacy.exportText':
    'Wenn Sie „Daten sichern“ wählen, wird eine JSON-Datei auf Ihrem Rechner erzeugt. Wo ' +
    'diese Datei anschließend liegt und wer darauf zugreifen kann, liegt in Ihrer ' +
    'Verantwortung.',
  'privacy.logsTitle': 'Server-Protokolle des Hosting-Anbieters',
  'privacy.logsText':
    'Beim Abruf der Seite überträgt Ihr Browser technisch notwendige Daten (IP-Adresse, ' +
    'Zeitpunkt, aufgerufene Datei, Browserkennung) an den Hosting-Anbieter GitHub Pages ' +
    '(GitHub Inc., USA). Diese Daten fallen bei jedem Aufruf einer Webseite an und werden ' +
    'vom Anbieter zur Auslieferung und Absicherung verarbeitet. Rechtsgrundlage ist ' +
    'Art. 6 Abs. 1 lit. f DSGVO. Auf diese Protokolle hat der Betreiber dieser Anwendung ' +
    'keinen Einfluss.',
  'privacy.controllerTitle': 'Verantwortlichkeit und Zweckbindung',
  'privacy.controllerText':
    'Da keine Daten an den Anbieter übermittelt werden, findet insoweit keine Verarbeitung ' +
    'personenbezogener Daten durch ihn statt und es entsteht kein Auftragsverarbeitungs' +
    'verhältnis. Verantwortlich für die Verarbeitung der Schülerdaten in Ihrem Browser ' +
    'bleiben Sie beziehungsweise Ihre Schule im Rahmen der jeweiligen Schuldatenschutz' +
    'verordnung.',
  'privacy.minimisationTitle': 'Datensparsamkeit',
  'privacy.minimisationText':
    'Erfassen Sie nur, was Sie brauchen. Der Nachname ist optional; unter „Klasse“ lässt sich ' +
    'einstellen, dass auf dem Bildschirm und im Ausdruck nur Vornamen erscheinen. Für einen ' +
    'Aushang im Klassenraum reicht das in aller Regel.',
  'privacy.deletionTitle': 'Löschung',
  'privacy.deletionText':
    'Über die Schaltfläche „Alle Daten löschen“ in der Fußzeile werden sämtliche ' +
    'gespeicherten Daten unwiderruflich aus dem Browser entfernt. Dasselbe erreichen Sie über ' +
    'die Funktion Ihres Browsers zum Löschen von Websitedaten.',
  'privacy.rightsTitle': 'Ihre Rechte',
  'privacy.rightsText':
    'Betroffenenrechte nach Art. 15 ff. DSGVO (Auskunft, Berichtigung, Löschung, ' +
    'Einschränkung, Widerspruch, Datenübertragbarkeit) richten sich an die verantwortliche ' +
    'Stelle — bei schulischer Nutzung in der Regel die Schule. Kontakt für diese ' +
    'Anwendung:',
} as const;

export type Messages = { [K in keyof typeof de]: string };
