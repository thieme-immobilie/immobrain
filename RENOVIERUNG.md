# Renovierungsplaner

Hauptnavigation → Renovierungsplaner. Mehrere lokale Renovierungspläne mit optionaler Zuordnung zu einem favorisierten Objekt.

## Checklisten übernehmen

Gespeicherte Besichtigungs-Checkliste auswählen, Maßnahmen prüfen und markierte Positionen übernehmen. Alternativ aus der Liste gespeicherter Besichtigungen „Renovierung planen“ öffnen. Nur Maßnahmen mit einer ausgewählten Arbeit werden importiert. Bereits importierte Quellpositionen werden übersprungen, damit Fortschritt und eigene Anpassungen erhalten bleiben. Eine spätere Änderung der Quellcheckliste überschreibt den Plan nicht automatisch. Vorhandene Arbeitspakete können manuell bearbeitet werden.

## Planung

- Arbeitspakete mit frei benennbarem Gewerk, Phase, Status, Zuständigkeit, Termin, Menge, Einheit, Preis und Notizen.
- Teilaufgaben hinzufügen, entfernen und abhaken. Abgeschlossene Arbeitspakete bleiben im Budget enthalten.
- Acht vorgeschlagene Phasen; manuelle Phasenzuordnung und Sortierung innerhalb einer Phase.
- Material- und Werkzeugvorschläge passend zu übernommenen Maßnahmen. Vorschläge sind keine verbindliche Material- oder Ausführungsplanung; Mengen, Systeme und Produkte sind vom Nutzer festzulegen. Gemeinsame Werkzeugvorschläge werden zusammengefasst.
- Eigene Arbeitspakete, Materialien und Werkzeuge ergänzen; Beschaffungsstatus offen/bestellt/vorhanden; Lieferanten und optionale Produktlinks hinterlegen.

## Kosten

Maßnahmenbudget = Summe aus Menge × Einheitspreis der Arbeitspakete. Importierte Vorschläge gelten als im Maßnahmenbudget enthalten und erhöhen die Gesamtkosten nicht erneut. Nur als zusätzliche Kosten markierte Beschaffungen werden addiert. Darauf wird die eingestellte Reserve gerechnet. Fehlende Mengen/Preise werden kenntlich gemacht. Es werden keine Marktpreise oder automatisch berechneten Materialmengen vorgetäuscht.

## Speicherung

`immobrain-renovation-plans-v1` enthält gespeicherte Pläne, `immobrain-renovation-draft-v1` den letzten Entwurf. Speicherung erfolgt im aktuellen Browser, ohne Cloud-Synchronisierung. Bearbeitung aktualisiert einen vorhandenen Plan; ein neuer Plan bekommt eine eigene ID. Lokale Quelldaten und Besichtigungen bleiben unverändert.

## Tests

`node tests/renovation-core.test.cjs` und `node tests/renovation-ui.test.cjs`. Prüfen u. a. Import, Preisübernahme, Idempotenz, Werkzeugzuordnung, Kosten ohne Doppelzählung, mehrere Pläne, zusätzliche Arbeiten/Beschaffungen, Status und Tabs. Zusätzlich wurden vorhandene Prüfungen für Besichtigungen, Navigation, Immobiliensuche und Fix-und-Flip-Rechner ausgeführt. Eine Browser-Rendering-Prüfung war in der Ausführungsumgebung mangels installiertem Chromium nicht möglich.
