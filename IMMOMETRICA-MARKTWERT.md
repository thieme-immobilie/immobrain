# Immometrica-Auswertung im Marktwert-Reiter

Die neue Sektion unter Immobiliensuche → Marktwert importiert Immometrica-CSV-Dateien lokal im Browser, berechnet den gewünschten Text und speichert Auswertungen samt den bereinigten Preis-/DOM-Datensätzen. Es erfolgt keine Übertragung an eine KI/API und keine Veröffentlichung der CSV. Die CSV ist nach einem Neuladen aus der gespeicherten Auswertung wieder bearbeitbar; die Originaldatei als Byte-Datei wird nicht gespeichert. Angeboten werden auch manuelle Durchschnittswerte mit bestätigter Immometrica-Datenherkunft.

## Bestätigte Rechenregeln

Die zwei im Prompt offenen Punkte wurden vor Umsetzung vom Nutzer bestätigt: 60-/90-Tage-Ziele für die Korridorgrenzen und +1 % bis einschließlich 30 Tagen Durchschnitts-DOM. Für Durchschnittspreis P und Durchschnitts-DOM D gilt für Ziel T (60 bzw. 90 Tage): `P × (1 + Aufschlag − min(0,12; max(0; D − T) × 0,0015))`. Aufschlag ist bei D ≤ 30 gleich 0,01, sonst 0. Die Preisfindung verwendet ausschließlich Preis und DOM, keine qualitativen Zuschläge oder Abschläge. Bei D ≤ 60 oder sehr langen DOM können beide Grenzen identisch sein; es wird keine künstliche Spanne erzeugt. Ausgabe mit ganzen €/m², gespeicherte Rechenwerte bleiben ungerundet. Regelversion und Parameter werden gespeichert.

CSV-Mittelwerte sind arithmetische Mittel derselben gültigen Angebotszeilen für ausgewählte PLZ, exakte Zimmeranzahl und Objektart. Standardmäßig werden nur aktive Angebote verwendet. Der Aktivfilter lässt sich ausschalten; ohne Aktiv-Spalte ist er ausgeschaltet. DOM wird als Stand der exportierten Datei verwendet und nicht automatisch um Tage seit dem Upload erhöht. Zeilen ohne gültigen DOM oder ohne positiven Preis sind ausgeschlossen. Preis/m² wird vorrangig gelesen, ersatzweise aus Kaufpreis/Wohnfläche berechnet. Gleiche Immometrica-Details-IDs werden nur einmal gezählt. Es gibt keine unscharfe Dublettenerkennung über verschiedene Immometrica-IDs.

## Unterstützter Upload

UTF-8 mit/ohne BOM, ersatzweise Windows-1252; Semikolon, Komma oder Tab; Anführungszeichen, mehrzeilige Felder und deutsche Dezimalzahlen. Maximal 5 MB und 10.000 Zeilen. Wesentliche Spalten: PLZ, Zi/Zimmer, Tage online/DOM, Preis/m² oder Preis+Wfl.; optional Ort, Aktiv, Wohnungstyp/Haustyp/Objektart und Details. Nicht passende oder fehlerhafte Zeilen werden gezählt, kein DOM wird aus „Datum“ erfunden. Die Datenherkunft muss vom Nutzer als ausschließlich Immometrica bestätigt werden.

## Speicherung und Inseratvergleich

`immobrain-singer-analyses-v1` enthält mehrere Auswertungen mit Ausgabetext, Segment, Durchschnittswerten, Parametern, Upload-Metadaten und bereinigtem Datensatz. `immobrain-singer-references-v1` enthält nur die separat aktivierten, kleinen Vergleichswert-Datensätze pro `PLZ|Zimmer|Objektart`. Auswahl: Untergrenze, Korridormitte oder Obergrenze. Ein aktivierter Segmentwert gilt ausschließlich für passende Kaufangebote; Mietwerte und andere Zimmerzahlen/Objektarten werden nicht verändert.

Priorität im Inseratvergleich: individueller Objektwert → aktivierter Immometrica-Segmentwert → bisheriger allgemeiner PLZ-Wert. Sortierung und Filter nutzen denselben Vergleichswert. Änderungen einer aktiven Auswertung aktualisieren ihren Vergleichswert beim Speichern. Beim Löschen werden dazugehörige aktive Referenzen entfernt; es wird kein älterer Wert automatisch aktiviert. Die bisherige manuelle PLZ-Verwaltung bleibt bestehen. Speicherfehler werden angezeigt; ein fehlgeschlagener Mehrfachschreibvorgang setzt die vorherigen Daten nach Möglichkeit zurück.

Die Ergebnisbox und der kopierte Text enthalten exakt die angeforderte Ausgabe, ohne Grafiken, Tabellen, Herleitung, Methodikbeschreibung oder Zusatzkommentare. Eingabe-, Speicher- und Importmeldungen liegen außerhalb der Ergebnisbox.

Tests: `node tests/singer.test.cjs`, `node tests/singer-ui.test.cjs`, `node tests/market-values.test.cjs`, `node tests/listing-market.test.cjs`, `node tests/market-search.test.cjs`. Der Kern-Test kann optional einen lokalen CSV-Pfad als Argument für die bereitgestellte Beispieldatei erhalten. Die tatsächliche hochgeladene Datei wurde zusätzlich lokal gegen eine unabhängige CSV-Berechnung geprüft; sie ist nicht Bestandteil des Repositories. Browserdarstellung wegen nicht verfügbarem Vorschau-Daemon nicht live geprüft.

## Beobachtete Preise nach Angebotsdauer

Zusätzlich zum unveränderten Prompt-Ausgabetext gibt es eine separate Übersicht der passenden CSV-Angebote. Drei farbige Gruppen: DOM ≤ 60 grün (ideal oder schneller), 60 < DOM ≤ 90 orange (Oberkante), DOM > 90 rot (kritisch/überteuert nach der vorgegebenen Logik). Genau 90 Tage zählt zur Oberkante, erst darüber zur kritischen Gruppe. Jede Gruppe zeigt Anzahl, arithmetischen Durchschnitt des Angebotspreises pro m², Preisspanne und mittlere DOM. Aufklappbare Einzellisten zeigen €/m², Tage online, CSV-Zeile und Aktivstatus, nach Preis aufsteigend sortiert. Zunächst 20 Einträge je Gruppe, danach schrittweise weitere 20.

Die Daten stammen aus derselben CSV-Auswahl (PLZ, Zimmeranzahl, Objektart, optional nur aktive Angebote). Keine erfundenen Verkäufe oder Verkaufspreise: „Tage online“ beschreibt die im Export erfasste Angebotsdauer, nicht einen belegten Verkauf. Ein inaktives Angebot wird nicht automatisch als verkauft eingestuft. Ohne passende CSV gibt es keine beobachtete Laufzeitübersicht; rein manuelle Durchschnittswerte erzeugen keine erfundenen Einzelangebote. Gespeicherte Auswertungen stellen die Übersicht beim Öffnen aus ihrem gespeicherten Datensatz wieder her. Der kopierte Ergebnistext bleibt exakt im vorher festgelegten Format, ohne die zusätzliche Übersicht.

## Gespeicherte Preiskorridore mit Zeitraum

Die Auswertung enthält jetzt explizite Felder für den Auswertungszeitraum von/bis. Vorgabe entsprechend Nutzerangabe: 06.11.2025 bis 06.11.2026, frei editierbar. Neue Berechnungen erfordern gültige Daten und Beginn ≤ Ende. Der Zeitraum ist eine Beschreibung der bereitgestellten CSV-Auswahl und verändert weder deren Zeilenauswahl noch die exportierten DOM automatisch. Vorhandene Auswertungen ohne Zeitraum bleiben lesbar, beim erneuten Berechnen muss der Zeitraum ergänzt werden.

Im eigenen Abschnitt „Meine gespeicherten Preiskorridore“ erscheinen Zeitraum und Ergebnis. „Vollständige Auswertung ansehen“ zeigt direkt innerhalb der gespeicherten Karte die drei Laufzeitgruppen mit allen Einzelangeboten (schrittweise weitere Einträge), ohne das aktuelle Formular zu verändern und ohne erneuten CSV-Upload. Zusätzlich zum Datensatz werden die fertig berechneten Laufzeitgruppen als `domSnapshot` sowie `periodStart` und `periodEnd` gespeichert. Alte Einträge ohne Gruppen-Snapshot werden aus ihren gespeicherten Preis-/DOM-Daten dargestellt.

„Preiskorridor speichern“ aktualisiert eine geöffnete Auswertung. „Als weitere Auswertung speichern“ legt eine unabhängige Kopie mit neuer ID an, sodass verschiedene Zeiträume/Varianten derselben PLZ nebeneinander erhalten bleiben. Dabei wird kein bestehender aktiver Inserat-Marktwert auf die Kopie umgestellt. Der reine Prompt-Ergebnistext für die Zwischenablage bleibt unverändert; der Zeitraum steht separat in der Ansicht. Wie bisher lokale Browser-Speicherung mit Fehleranzeige, keine zusätzliche API und kein Cloud-Sync.
