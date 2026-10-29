# Startseite und KI-Assistent

Die Startseite verbindet bestehende Funktionen über Schnellzugriffe, lokale Kennzahlen, die vier Statusgruppen und eine Liste der nächsten drei Termine. Alle Inhalte der Übersicht kommen aus dem Browserspeicher. Die Werkzeugkarten funktionieren unabhängig von einem KI-Zugang.

## KI aktivieren

1. Im Cloudflare-Dashboard den bestehenden Worker **immobrain** öffnen.
2. Unter **Settings → Variables and Secrets → Add** ein **Secret** namens `OPENAI_API_KEY` hinterlegen und deployen. Den Wert nicht in den Chat, das Repository, HTML oder Browser-Einstellungen eintragen.
3. Optional `OPENAI_MODEL` als serverseitige Variable setzen. Standard: `gpt-5.4-mini`.
4. Startseite neu laden. Der Status muss „KI bereit“ anzeigen.
5. Für KI-Anfragen bei ImmoBrain anmelden; die bestehende E-Mail-Anmeldung ist unter **Besichtigung → Kalender verbinden** erreichbar. Sitzungen gelten wie bisher pro Browser-Tab. Ohne Anmeldung wird keine kostenpflichtige KI-Abfrage gesendet.

Die OpenAI-API-Nutzung benötigt einen eigenen funktionsfähigen API-Zugang und wird entsprechend dessen Bedingungen abgerechnet. Der Schlüssel bleibt im Worker. Ein einfacher Anfrageschutz begrenzt auf acht Anfragen je Benutzer und Minute pro Worker-Instanz; dies ist kein globales Kostenlimit. API-Projektlimits und Cloudflare-Zugangsschutz separat passend zur Nutzung einstellen.

## Unterstützte Aktionen

- Bereiche öffnen: Suche, Meine Objekte, Suchprofile, Marktwert, Rechner, Kalender, Checkliste und Kalenderverbindung.
- Suchkriterien aus natürlicher Sprache vorbereiten. Nach Bestätigung öffnet die Suchseite mit den Filtern; die kostenpflichtige Somantic-Suche wird dort separat gestartet.
- Einen Favoriten auswählen und dessen Status nach Prüfung ändern. Für besichtigt/Angebot ist ein Datum bis einschließlich heute erforderlich. Vorhandene widersprechende Angebots- oder Nachfasshistorie wird nicht automatisch entfernt; die Oberfläche verweist auf die Terminpflege.
- Besichtigungen mit Datum und Uhrzeit anlegen: neue, zugeordnete Checkliste mit 60 Minuten Dauer und den üblichen Kostenpositionen. Vorhandene Termine bleiben erhalten. Gleiche Objekt-/Datums-/Uhrzeitkombinationen werden abgewiesen. Fehlende Objektzuordnung wird lokal ausgewählt.

Der Assistent verändert keinen Programmcode, löscht keine Daten und führt keine freien URLs oder Skripte aus. Die Serverantwort ist nur ein Vorschlag aus einer festen Aktionsliste; Objektwahl und Speicherung erfolgen nach Bestätigung lokal. Das Modell hat keinen Zugriff auf den Browserspeicher. Bei mehreren passenden Objekten ist die Auswahl erforderlich. Unbekannte Aktionen, ungültige Filter und nicht existierende Uhrzeiten bei der Zeitumstellung werden zurückgewiesen.

## Datenfluss

Nur die ausdrücklich eingegebene Anfrage wird über den authentifizierten Worker an die OpenAI Responses API geschickt. Die lokale Merkliste, Telefonnummern, Kontakte, Kalkulationen und Notizen werden nicht automatisch an OpenAI übertragen. Freitext kann dennoch persönliche Angaben enthalten; nur erforderliche Informationen eingeben. `store: false` ist gesetzt. ImmoBrain speichert keine Chat-Historie. Dies ist keine Aussage über anbieterseitige Sicherheitsprotokolle oder vertragliche Aufbewahrungsfristen.

Ein nach Prüfung gespeicherter Termin nimmt anschließend an der vorhandenen Kalendersynchronisierung entsprechend der gewählten Einstellungen teil. Für diese Synchronisierung gelten die Hinweise in CALENDAR.md. Die Nutzung eines zusätzlichen KI-Anbieters muss bei der noch offenen Prüfung von Verträgen, Informationspflichten und etwaigen internationalen Übermittlungen berücksichtigt werden.

## Prüfung

`node tests/assistant.test.mjs` prüft Aktionsgrenzen, Suchfilter, Authentifizierung, Datenminimierung, Anbieterfehler, Historie, Termine, Duplikate und Rücknahme bei Speicherfehlern. Die Anbieterantworten sind synthetisch; es wird keine echte KI-Anfrage gestellt. Dashboard-, Kalender- und Datenschutzt tests bleiben separat vorhanden.

Die Browser-Vorschau war bei dieser Änderung wegen fehlender Preview-Infrastruktur nicht verfügbar. Ein visueller Desktop-/Mobiltest und ein vollständiger Test mit dem eigenen OpenAI-Zugang stehen nach Deployment noch aus.

## Fragen zu gespeicherten Daten

Die Aktion `read` unterstützt die nächste Besichtigung, anstehende Besichtigungen, den nächsten geplanten Kontakt, geplante/überfällige Nachfasskontakte, Objektanzahlen je Status und gespeicherte Objektdaten (Preis, Fläche, Zimmer, Status). Eine Frage wird von der KI lediglich einer dieser Abfragen zugeordnet. Die Antworten werden im Browser aus den lokalen Daten gebildet; Termine, Merkliste und Antwortinhalte werden nicht an die KI zurückgeschickt. Angaben beziehen sich auf den Datenstand dieses Browsers, nicht auf eventuelle Änderungen direkt in Google. Ohne passende Daten wird ausdrücklich kein Termin gefunden. Read-Aktionen speichern nichts und benötigen keine Speicherbestätigung. `node tests/assistant-read.test.mjs` prüft diese Datenabfragen.
