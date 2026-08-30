/**
 * Impressum und Datenschutzerklärung.
 *
 * ACHTUNG — Vorlage zum Ausfüllen, keine Rechtsberatung: Die mit [eckigen Klammern]
 * markierten Stellen müssen vor einer Veröffentlichung durch die eigenen Angaben
 * ersetzt und der Text auf die tatsächlichen Verhältnisse geprüft werden.
 */

export function Imprint() {
  return (
    <div className="panel prose">
      <h2>Impressum</h2>

      <p>Angaben gemäß § 5 DDG (vormals § 5 TMG):</p>

      <p>
        [Vorname Nachname]
        <br />
        [Straße und Hausnummer]
        <br />
        [PLZ Ort]
        <br />
        [Land]
      </p>

      <h3>Kontakt</h3>
      <p>
        E-Mail: [adresse@beispiel.de]
        <br />
        Telefon: [optional]
      </p>

      <h3>Verantwortlich für den Inhalt</h3>
      <p>[Vorname Nachname], Anschrift wie oben.</p>

      <h3>Haftung für Inhalte</h3>
      <p>
        Diese Anwendung wird ohne Gewähr bereitgestellt. Die erzeugten Sitzpläne sind
        Vorschläge; die pädagogische Verantwortung für die tatsächliche Sitzordnung bleibt
        bei der Lehrkraft.
      </p>

      <p className="notice warning">
        Diese Seite ist eine Vorlage. Ersetzen Sie alle Angaben in [eckigen Klammern] durch
        Ihre eigenen, bevor Sie die Anwendung veröffentlichen. Ob und in welcher Form ein
        Impressum erforderlich ist, hängt vom Einzelfall ab — dies ist keine Rechtsberatung.
      </p>
    </div>
  );
}

export function Privacy() {
  return (
    <div className="panel prose">
      <h2>Datenschutzerklärung</h2>

      <h3>Das Wichtigste zuerst</h3>
      <p>
        Diese Anwendung hat <strong>keinen Server</strong>. Alle eingegebenen Namen, Wünsche und
        Sitzpläne werden ausschließlich im Speicher Ihres Browsers verarbeitet und dort
        gespeichert. Sie werden <strong>zu keinem Zeitpunkt übertragen</strong> — weder an den
        Anbieter dieser Seite noch an Dritte. Nach dem Laden der Seite stellt die Anwendung
        keine Netzwerkverbindungen mehr her; das lässt sich im Netzwerk-Tab der
        Entwicklerwerkzeuge Ihres Browsers überprüfen.
      </p>

      <h3>Welche Daten wo liegen</h3>
      <dl>
        <dt>Namen, Wünsche, Sonderwünsche, Trennungen, Sitzpläne</dt>
        <dd>
          Gespeichert in der IndexedDB Ihres Browsers, ausschließlich auf diesem Gerät und in
          diesem Browserprofil. Kein anderer Nutzer und kein anderes Gerät hat Zugriff darauf.
        </dd>

        <dt>Cookies, Analyse, Tracking</dt>
        <dd>
          Werden nicht eingesetzt. Es gibt keine Zählpixel, keine Einbindung externer Schriften
          oder Skripte und keine Reichweitenmessung.
        </dd>

        <dt>Exportdateien</dt>
        <dd>
          Wenn Sie „Daten sichern“ wählen, wird eine JSON-Datei auf Ihrem Rechner erzeugt. Wo
          diese Datei anschließend liegt und wer darauf zugreifen kann, liegt in Ihrer
          Verantwortung.
        </dd>

        <dt>Server-Protokolle des Hosting-Anbieters</dt>
        <dd>
          Beim Abruf der Seite überträgt Ihr Browser technisch notwendige Daten (IP-Adresse,
          Zeitpunkt, aufgerufene Datei, Browserkennung) an den Hosting-Anbieter
          [z. B. GitHub Pages, GitHub Inc., USA]. Diese Daten fallen bei jedem Aufruf einer
          Webseite an und werden vom Anbieter zur Auslieferung und Absicherung verarbeitet.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Auf diese Protokolle hat der
          Betreiber dieser Anwendung keinen Einfluss.
        </dd>
      </dl>

      <h3>Verantwortlichkeit und Zweckbindung</h3>
      <p>
        Da keine Daten an den Anbieter übermittelt werden, findet insoweit keine Verarbeitung
        personenbezogener Daten durch ihn statt und es entsteht kein Auftragsverarbeitungs&shy;verhältnis.
        Verantwortlich für die Verarbeitung der Schülerdaten in Ihrem Browser bleiben Sie
        beziehungsweise Ihre Schule im Rahmen der jeweiligen Schuldatenschutzverordnung.
      </p>

      <h3>Datensparsamkeit</h3>
      <p>
        Erfassen Sie nur, was Sie brauchen. Der Nachname ist optional; unter „Klasse“ lässt sich
        einstellen, dass auf dem Bildschirm und im Ausdruck nur Vornamen erscheinen. Für einen
        Aushang im Klassenraum reicht das in aller Regel.
      </p>

      <h3>Löschung</h3>
      <p>
        Über die Schaltfläche <strong>„Alle Daten löschen“</strong> in der Fußzeile werden
        sämtliche gespeicherten Daten unwiderruflich aus dem Browser entfernt. Dasselbe erreichen
        Sie über die Funktion Ihres Browsers zum Löschen von Websitedaten.
      </p>

      <h3>Ihre Rechte</h3>
      <p>
        Betroffenenrechte nach Art. 15 ff. DSGVO (Auskunft, Berichtigung, Löschung,
        Einschränkung, Widerspruch, Datenübertragbarkeit) richten sich an die verantwortliche
        Stelle — bei schulischer Nutzung in der Regel die Schule. Kontakt für diese Anwendung:
        [adresse@beispiel.de].
      </p>

      <p className="notice warning">
        Diese Seite ist eine Vorlage. Ersetzen Sie die Angaben in [eckigen Klammern] und prüfen
        Sie den Text auf Ihre tatsächlichen Verhältnisse — insbesondere den Hosting-Anbieter.
        Dies ist keine Rechtsberatung.
      </p>
    </div>
  );
}
