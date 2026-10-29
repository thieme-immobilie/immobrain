# ImmoBrain – Ideenliste

Diese Liste sammelt spätere Erweiterungen. Offene Punkte bleiben mit `[ ]` markiert; nach Umsetzung und Prüfung werden sie mit `[x]` abgehakt. Neue Ideen erhalten einen eigenen Eintrag mit Status und Priorität.

## IDEE-001: Objektkarte für den Lagevergleich

Status: Zurückgestellt · Priorität: niedrig · Aufgenommen: 28.10.2026

Ziel: In der Marktübersicht je PLZ Kauf- und Mietobjekte an ihrer verfügbaren Lage vergleichen, statt nur die PLZ-Mitte zu zeigen.

- [ ] Freigegebenen Zugang zu ungefähren Objektkoordinaten bei Somantic klären (Anfrage durch den Nutzer; noch nicht versendet).
- [ ] Alternativ öffentlich angegebene Adressen aus Originalinseraten übernehmen, soweit technisch möglich und die Nutzung zulässig ist.
- [ ] Manuelle Adress- oder Positionsergänzung ermöglichen und vorhandene Adresskorrekturen wiederverwenden.
- [ ] Geeigneten Geocoding- und Kartenanbieter hinsichtlich Datenschutz, Nutzungsbedingungen und Kosten auswählen.
- [ ] Adressen in Koordinaten umwandeln und die ermittelte Lage überprüfen lassen.
- [ ] Interaktive Karte mit unterschiedlich gefärbten Kauf- und Mietmarkern, Objektinformationen und Originalinserat-Link ergänzen.
- [ ] Karte mit den Listenfiltern synchronisieren und dicht beieinanderliegende Marker gruppieren.
- [ ] Genauigkeit und Herkunft der Lage sichtbar kennzeichnen: Adresse, ungefähre Straßenlage oder manuell gesetzte Position. Ohne Standortdaten keine erfundenen Objektmarker anzeigen.
- [ ] Funktion mit Kauf- und Mietobjekten sowie fehlenden und ungenauen Adressen prüfen.

Abhängigkeit: Die aktuell dokumentierte Somantic-API liefert PLZ und Ort, aber keine Objektadressen oder Koordinaten. Die bestehende PLZ-Karte und Angebotsübersicht sind bereits umgesetzt; einzelne Objektpositionen sind noch offen.

Dokumentation zur späteren erneuten Prüfung: https://www.somantic.net/developers/docs


## IDEE-002: Automatische Rechnungsablage in Google Drive

Status: Zurückgestellt · Priorität: niedrig · Aufgenommen: 29.10.2026

Ziel: Rechnungen aus dem Renovierungsplaner automatisch in einem ausgewählten Google-Drive-Ordner für die Buchhaltung ablegen und mit der jeweiligen Kostenposition verknüpfen.

- [ ] Rechnungshochladen und Belegzuordnung je Kostenposition als Voraussetzung vorbereiten (To-do, Material, Werkzeug oder Gewerk; mehrere Belege möglich).
- [ ] Eigene Google-Anbindung der Website mit begrenzten Zugriffsrechten und widerrufbarer Kontofreigabe einrichten.
- [ ] Zielordner auswählen und Ordnerstruktur nach Objekt, Renovierung und Gewerk festlegen.
- [ ] Automatischen Upload mit eindeutiger Dateibenennung und Schutz vor doppelter Ablage umsetzen.
- [ ] Rechnungsdaten und Belegzuordnungen benutzerbezogen zentral speichern.
- [ ] Drive-Link und Übertragungsstatus an der Kostenposition anzeigen; fehlgeschlagene Uploads erneut starten können.
- [ ] Berechtigungen, Verbindungswiderruf und Fehlerfälle prüfen.

Abgrenzung: Zurückgestellt ist die automatische Drive-Ablage. Eine Belegsammlung ist keine vollständige Buchhaltungsintegration. Diese Idee ist noch nicht umgesetzt.
