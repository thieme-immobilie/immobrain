# Renovierungsplaner

Hauptnavigation → Renovierungsplaner. Mehrere lokale Renovierungspläne mit optionaler Zuordnung zu einem favorisierten Objekt.

## Checklisten übernehmen

Gespeicherte Besichtigungs-Checkliste auswählen, Maßnahmen prüfen und markierte Positionen übernehmen. Alternativ aus der Liste gespeicherter Besichtigungen „Renovierung planen“ öffnen. Nur Maßnahmen mit einer ausgewählten Arbeit werden importiert. Bereits importierte Quellpositionen werden übersprungen, damit Fortschritt und eigene Anpassungen erhalten bleiben. Eine spätere Änderung der Quellcheckliste überschreibt den Plan nicht automatisch. Vorhandene To-dos können manuell bearbeitet werden.

## Planung

- To-dos mit frei benennbarem Gewerk, Phase, Status, Zuständigkeit, Termin, Menge, Einheit, Preis und Notizen.
- Teilaufgaben hinzufügen, entfernen und abhaken. Abgeschlossene To-dos bleiben im Budget enthalten.
- Zehn Phasen: Entrümpeln, Entkernen, Sanitär-Rohinstallation, Sanitär-Fertigmontage, Wände & Decken, Boden, Türen, Endmontage, Finish & Abnahme, Home Staging. Manuelle Phasenzuordnung und Sortierung innerhalb einer Phase. „Nicht benötigt“ zählt eine Phase als abgeschlossen; die Markierung ist reversibel und löscht keine Aufgaben oder Budgets. Neue importierte Aufgaben aktivieren ihre Phase wieder. Bestehende Pläne werden beim Öffnen auf die neue Phasenstruktur umgestellt, ohne Aufgaben oder Fortschritt zu löschen.
- Material- und Werkzeugvorschläge passend zu übernommenen Maßnahmen. Vorschläge sind keine verbindliche Material- oder Ausführungsplanung; Mengen, Systeme und Produkte sind vom Nutzer festzulegen. Gemeinsame Werkzeugvorschläge werden zusammengefasst.
- Eigene To-dos, Materialien und Werkzeuge ergänzen; Beschaffungsstatus offen/bestellt/vorhanden; Lieferanten und optionale Produktlinks hinterlegen.

## Kosten

Maßnahmenbudget = Summe aus Menge × Einheitspreis der To-dos. Importierte Vorschläge gelten als im Maßnahmenbudget enthalten und erhöhen die Gesamtkosten nicht erneut. Nur als zusätzliche Kosten markierte Beschaffungen werden addiert. Darauf wird die eingestellte Reserve gerechnet. Fehlende Mengen/Preise werden kenntlich gemacht. Es werden keine Marktpreise oder automatisch berechneten Materialmengen vorgetäuscht.

## Speicherung

`immobrain-renovation-plans-v1` enthält gespeicherte Pläne, `immobrain-renovation-draft-v1` den letzten Entwurf. Speicherung erfolgt im aktuellen Browser, ohne Cloud-Synchronisierung. Bearbeitung aktualisiert einen vorhandenen Plan; ein neuer Plan bekommt eine eigene ID. Lokale Quelldaten und Besichtigungen bleiben unverändert.

## Tests

`node tests/renovation-core.test.cjs` und `node tests/renovation-ui.test.cjs`. Prüfen u. a. Import, Preisübernahme, Idempotenz, Werkzeugzuordnung, Kosten ohne Doppelzählung, mehrere Pläne, zusätzliche Arbeiten/Beschaffungen, Status und Tabs. Zusätzlich wurden vorhandene Prüfungen für Besichtigungen, Navigation, Immobiliensuche und Fix-und-Flip-Rechner ausgeführt. Eine Browser-Rendering-Prüfung war in der Ausführungsumgebung mangels installiertem Chromium nicht möglich.

## Fortschritt

Jede Phase erhält einen Prozentkreis: Teilaufgaben zählen als einzelne To-dos; To-dos ohne Teilaufgaben zählen jeweils als ein To-do. Erledigte To-dos zählen mit allen ihren Teilaufgaben als abgeschlossen. Eine leere Phase bleibt bei 0 %, sofern sie nicht als nicht benötigt markiert wird. Nicht benötigte Phasen zählen als 100 %. Der Gesamtfortschritt ist das gleichgewichtete Mittel der zehn Phasen. Vollständige Phasen und erledigte Aufgaben erscheinen durchgestrichen und ausgegraut. Die Markierung ist umkehrbar.

## Zentrale Stammdaten

Materialien, Werkzeuge und Gewerke werden unter Stammdaten geräteweit in `immobrain-renovation-catalog-v1` definiert, unabhängig vom einzelnen Plan. Pro Renovierungsschritt lassen sich direkt To-dos anlegen. To-dos können mehrere Materialien und Werkzeuge aus dem Katalog oder aus dem aktuellen Plan sowie ein zentrales Gewerk erhalten. Die Zuordnung mehrerer To-dos zu derselben Katalogposition erzeugt nur eine Beschaffungsposition pro Plan; deren Gesamtmenge wird im Plan gepflegt. Neu zugeordnete Vorlagen zählen zunächst als im To-do-Budget enthalten. Bestehende Planpreise bleiben unverändert, bis ausdrücklich Stammdaten übernommen werden. Das Entfernen einer Zuordnung oder eines Stammdateneintrags löscht keine bestehenden Beschaffungspositionen. Gewerke können Ansprechpartner, Betrieb, Telefon und einen Standardpreis haben; Preis/Einheit werden nur auf ausdrücklichen Klick in ein To-do übernommen.
