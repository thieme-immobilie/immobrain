# Kalenderabo

Die Bedienung befindet sich unter **Besichtigungskalender → Kalender verbinden**.

1. Anmelde-E-Mail anfordern. Den Anmeldelink aus der E-Mail kopieren und in das Bestätigungsfeld einfügen (alternativ den Zahlencode verwenden, sofern die E-Mail einen enthält). So ist keine Änderung der Supabase-Weiterleitungs-URL nötig.
2. Lokale Termine prüfen; die Übertragung von Notizen kann deaktiviert werden.
3. Termine aus diesem Browser übertragen. Vorhandene zentrale Daten werden nur nach expliziter Bestätigung ersetzt. Bei Bedarf automatische Übertragung aktivieren.
4. Kalenderlink erstellen und als Kalender-URL bei Google, Outlook oder Apple abonnieren. Den Link vertraulich behandeln. Er wird nur direkt nach dem Erstellen angezeigt und nicht im Browser dauerhaft gespeichert.
5. Ein erneuerter Link ersetzt den bisherigen sofort; bei Verlust einen neuen Link erstellen. Widerruf und Löschen der zentralen Kalenderdaten sind im selben Bereich möglich. Bereits beim Kalenderanbieter gespeicherte Kopien bleiben davon unberührt.

## Umfang

Einseitiger, lesender iCalendar-Feed. Uhrzeiten werden als Europe/Berlin interpretiert und in UTC exportiert; ohne Uhrzeit ganztägig. Dauer ist einstellbar. Notizen aus Objekt, Checkliste und Terminpflege sind optional. Separate Telefon-, E-Mail-, Angebotsbetrag- und Kalkulationsfelder werden nicht exportiert. Freitext wird unverändert übertragen und kann selbst persönliche Angaben enthalten.

Zentral gespeichert wird nur der freigegebene Kalenderstand, nicht die vollständigen Objekte, Checklisten oder Kalkulationen. Lokale Daten werden nicht automatisch aus dem Kalender zurückgespielt. Ein anderer Browser muss die Anmeldung und die erste Übertragung selbst durchführen. Versionsprüfung pausiert widersprüchliche automatische Änderungen. Eine automatische Übertragung findet nur bei geöffnetem ImmoBrain und gültiger Anmeldung statt; der bereits gespeicherte Feed bleibt auch bei geschlossener Website abrufbar.

Google/Outlook entscheiden über Abrufintervalle und Erinnerungen. Keine bidirektionale Google-/Microsoft-OAuth-Anbindung. Keine Push-/E-Mail-Erinnerung durch diesen Dienst.

## Betrieb

- Supabase-Projekt: `ivatbtfjijqdbrmkvyvl` (EU-Region `eu-north-1`).
- Schema: `supabase/calendar-schema.sql` wurde einmalig angewendet, RLS und explizite Rechte gesetzt.
- Edge Function: `calendar-feed`, Quellcode in `supabase/functions/calendar-feed/`. Deployment mit `verify_jwt=false`, weil Kalenderanbieter keinen Benutzer-JWT mitsenden. **Der Funktionscode authentifiziert selbst:** Verwaltungsaktionen validieren den Benutzer über `/auth/v1/user`, prüfen bestätigte E-Mail und den erlaubten Origin; Feedzugriff validiert einen zufälligen 256-Bit-Token.
- Token nur als SHA-256-Hash in separater Tabelle, kein Clientzugriff auf diese Tabelle. Erneuern/Widerrufen ersetzt/entfernt den Hash.
- Anmeldung verwendet Supabase Auth. Der veröffentlichte Publishable Key ist absichtlich öffentlich; administrative Schlüssel werden nur aus der Supabase-Serverumgebung gelesen.
- Kalenderfeed liegt außerhalb von Cloudflare Access, damit Kalenderanbieter ihn abrufen können. Website und Links zu Checklisten bleiben durch den bestehenden Website-Zugang geschützt.
- Wird später eine eigene Domain verwendet, `APP_ORIGIN` in `calendar-core.mjs` aktualisieren und Edge Function neu deployen. Danach die Auth-/Frontend-Origins prüfen.
- Funktionsupdate: `deno.json` als `import_map_path` explizit mitgeben; sonst kann die Plattform einen alten absoluten Pfad übernehmen.

## Prüfung

`node tests/calendar-feed.test.mjs`, `node tests/calendar-events.test.cjs`, `node tests/calendar-sync.test.cjs` plus vorhandene Objekt-/Kalendertests. Der Feed wurde mit einem synthetischen Testtermin live geprüft; Testtermine anschließend geleert und Testlink ungültig gemacht. Der synthetische Auth-Datensatz ohne E-Mail/Passwort bleibt bestehen, da die automatische Freigabe seine Löschung abgelehnt hat. Authentifizierte E-Mail-Anmeldung und echtes Abonnieren beim Kalenderanbieter müssen vom Nutzer im eigenen Konto abgeschlossen werden.
