# Lokale Rechnungsverwaltung im Renovierungsplaner

An konkreten To-dos sowie Material- und Werkzeugpositionen befindet sich ein Rechnungsbutton. Rechnungen für Gewerke werden am betreffenden To-do hinterlegt, nicht an einer globalen Stammdatenvorlage. Der Plan muss bereits eine gespeicherte ID haben. Mehrere Belege pro Kostenposition sind möglich.

Der zusätzliche Tab Rechnungen zeigt Belege des aktuellen Plans oder auf Wunsch aus allen lokal gespeicherten Plänen. Belegdateien und Metadaten liegen in IndexedDB `immobrain-invoices-v1`, getrennt in den Stores `files` und `invoices`. Diese Speicherung ist browser- und gerätegebunden, keine Cloud-Synchronisierung und keine revisionssichere Archivierung. Originalbelege zusätzlich sichern. Google Drive bleibt zurückgestellt.

## Auswertung und Übernahme

PDFs werden mit PDF.js ausgelesen. Textarme PDF-Seiten sowie PNG/JPEG/WebP werden lokal mit Tesseract.js (Deutsch/Englisch) erkannt. Grenze: 20 MB je Datei, 20 Seiten je PDF. Fehlerhafte oder nicht unterstützte Auswertung lässt den gespeicherten Beleg erhalten; Angaben können manuell ergänzt werden. Dateiinhalt wird niemals an den Bibliotheksanbieter übertragen.

Die Texterkennung und der heuristische Parser liefern Vorschläge. Manche Rechnungsaufbauten liefern keine brauchbaren Positionen. Einzelne Position, Menge, Einheit und Preis können geprüft/korrigiert werden. Netto/Brutto muss ausdrücklich bestätigt werden; Nettopreise benötigen einen Umsatzsteuersatz. Der Brutto-Gesamtbetrag kann alternativ für eine pauschale Kostenposition vorbereitet werden. Nur nach Bestätigung werden Menge, Einheit und Brutto-Einzelpreis der betreffenden Kostenposition ersetzt. Das Planbudget wird nicht zusätzlich um den Rechnungsbetrag erhöht. Übernommene Werte danach im Plan speichern. Die bisherigen Budgetregeln (enthalten/zusätzlich) bleiben bestehen.

## Zahlungsstatus

Neue Belege sind immer `pending` / Zahlung ausstehend. Nur ein ausdrücklicher Benutzerschritt setzt `paid` / Bezahlt; der Zeitpunkt wird festgehalten. Erneutes Öffnen als ausstehend ist möglich. Rechnungstext und OCR entscheiden niemals über den Zahlungsstatus. Ein erneut hochgeladener identischer Beleg derselben Planposition wird über SHA-256 erkannt und nicht doppelt gespeichert. Übernahmeprotokoll und Zahlungsstatus bleiben getrennt von Arbeits- und Beschaffungsstatus.

## Bibliotheken und Datenschutz

Pinned Dateien werden bei Bedarf serverseitig über einen engen Cloudflare-Worker-Allowlist-Proxy bereitgestellt; Browser und OCR-Worker laden über die eigene Domain:

- `pdfjs-dist@6.4.299`: PDF.js, Worker und gegebenenfalls WASM-Bausteine.
- `tesseract.js@6.0.1` mit `tesseract.js-core@6.1.2`.
- Sprachdaten `@tesseract.js-data/deu@1.0.0` und `@tesseract.js-data/eng@1.0.0`, `4.0.0_best_int`.

Quellen: https://mozilla.github.io/pdf.js/getting_started/ und https://github.com/naptha/tesseract.js/blob/master/docs/api.md . Die Bibliotheken sind Apache-2.0-lizenziert; ihre eingebetteten Lizenzhinweise bleiben erhalten. Der Proxy akzeptiert nur GET/HEAD für festgelegte Bibliotheksdateien, keine Uploads, keine frei wählbaren Hosts und keine Weitergabe von Browser-Anmeldedaten. Er hat keine OCR- oder Rechnungs-Upload-API. Dokumentbytes verbleiben im Browser.

## Tests und Grenzen

`node tests/invoice-core.test.cjs`, `node tests/invoice-ui.test.cjs`, `node tests/invoice-store.test.cjs`, `node tests/invoice-vendor.test.mjs`. Prüfen Parser, Mengen/Preisübernahme, Netto/Brutto, Standardstatus und Statuswechsel, Dublettenerkennung, Speicheradapter und Proxy-Allowlist. Die Bibliotheks-URLs wurden auf Verfügbarkeit geprüft. Zusätzlich bestehen die bisherigen Renovierungs- und Navigationstests. Browser-OCR und echte IndexedDB-Persistenz konnten in dieser Umgebung mangels lauffähigem Chromium nicht Ende-zu-Ende verifiziert werden; UI-/Speichertests nutzen kontrollierte Testadapter. Keine Zusage fehlerfreier Rechnungserkennung oder vollständiger Buchhaltungsfunktion.
