# Kalenderabo

Die Bedienung befindet sich unter **Besichtigungskalender → Kalender verbinden**.

1. Anmelde-E-Mail anfordern. Den Anmeldelink aus der E-Mail kopieren und in das Bestätigungsfeld einfügen (alternativ den Zahlencode verwenden, sofern die E-Mail einen enthält). So ist keine Änderung der Supabase-Weiterleitungs-URL nötig.
2. Lokale Termine prüfen; die Übertragung von Notizen kann deaktiviert werden.
3. Nach der Anmeldung werden lokale Termine automatisch übertragen, solange ImmoBrain geöffnet und die Anmeldung gültig ist. Bei widersprüchlichen zentralen Daten pausiert die Übertragung zur Prüfung. „Termine aus diesem Browser übertragen“ bleibt als manuelle Wiederholung verfügbar.
4. Kalenderlink erstellen und als Kalender-URL bei Google, Outlook oder Apple abonnieren. Den Link vertraulich behandeln. Er wird nur direkt nach dem Erstellen angezeigt und nicht im Browser dauerhaft gespeichert.
5. Ein erneuerter Link ersetzt den bisherigen sofort; bei Verlust einen neuen Link erstellen. Widerruf und Löschen der zentralen Kalenderdaten sind im selben Bereich möglich. Bereits beim Kalenderanbieter gespeicherte Kopien bleiben davon unberührt.

## Umfang

Einseitiger, lesender iCalendar-Feed. Uhrzeiten werden als Europe/Berlin interpretiert und in UTC exportiert; ohne Uhrzeit ganztägig. Dauer ist einstellbar. Notizen aus Objekt, Checkliste und Terminpflege sind optional. Separate Telefon-, E-Mail-, Angebotsbetrag- und Kalkulationsfelder werden nicht exportiert. Freitext wird unverändert übertragen und kann selbst persönliche Angaben enthalten.

Zentral gespeichert wird nur der freigegebene Kalenderstand, nicht die vollständigen Objekte, Checklisten oder Kalkulationen. Lokale Daten werden nicht automatisch aus dem Kalender zurückgespielt. Ein anderer Browser muss die Anmeldung und die erste Übertragung selbst durchführen. Versionsprüfung pausiert widersprüchliche automatische Änderungen. Eine automatische Übertragung findet nur bei geöffnetem ImmoBrain und gültiger Anmeldung statt; der bereits gespeicherte Feed bleibt auch bei geschlossener Website abrufbar.

Google/Outlook entscheiden über Abrufintervalle und Erinnerungen. Zusätzlich gibt es eine direkte, einseitige Google-OAuth-Anbindung; Änderungen in Google werden nicht zurück nach ImmoBrain übertragen. Keine direkte Microsoft-OAuth-Anbindung. Keine Push-/E-Mail-Erinnerung durch diesen Dienst.

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

## Direkte Google-Verbindung und Datenverwaltung

- Google Calendar API muss im eigenen Google-Cloud-Projekt aktiviert sein. OAuth-Webclient mit `calendar.app.created`; Geheimnis ausschließlich als `GOOGLE_CLIENT_SECRET` in den Edge Function Secrets.
- Rückleitungsadresse: `https://ivatbtfjijqdbrmkvyvl.supabase.co/functions/v1/calendar-feed?action=google-callback`.
- Zugang zum Google-Konto erst nach ausdrücklicher Google-Freigabe. Refresh-Token AES-GCM-verschlüsselt in einer für Browserrollen gesperrten Tabelle. OAuth-State ist zufällig, gehasht, einmal verwendbar und zehn Minuten gültig; abgelaufene Anfragen werden bei einer neuen Google-Verbindungsanfrage bereinigt. Keine unabhängige zeitgesteuerte Bereinigung.
- „Übertragene Google-Termine löschen und Übertragung pausieren“ löscht ausschließlich die serverseitig zugeordneten Event-IDs im ImmoBrain-Kalender. Andere Termine und der Kalender selbst bleiben bestehen. Löschung läuft in wiederholbaren Teilabschnitten; bei Fehlern bleibt die Übertragung pausiert und die noch offenen Zuordnungen bleiben für einen erneuten Versuch erhalten.
- „Beim Trennen … löschen“ ist ausdrücklich auswählbar. Die Löschung erfolgt vor dem Widerruf. Schlägt die Löschung fehl, bleibt die Verbindung zur Wiederholung erhalten. Ohne diese Auswahl bleiben Termine in Google bestehen.
- Google-Frist: 0 (manuell), 30, 90 oder 365 Tage nach dem Termindatum. Standard bleibt 0, damit keine bestehenden Daten ungefragt gelöscht werden. Am Stichtag selbst bleibt ein Termin erhalten. Die Frist wird beim erfolgreichen Abgleich angewendet, nicht durch einen Hintergrundauftrag. Bei aktivierter Frist wird spätestens nach 24 Stunden beim nächsten geöffneten, angemeldeten Kalender erneut ein Abgleich versucht.
- Die Frist gilt nur für die von ImmoBrain übertragenen Google-Termine. Der zentrale Kalenderstand und lokale Checklisten bleiben erhalten. Zentralen Stand manuell löschen, lokale Checklisten in der Checkliste löschen. Der zentrale Löschbutton deaktiviert die automatische Übertragung in diesem Browser, damit Daten nach dem Neuladen nicht sofort wieder übertragen werden. Andere Browser haben eigene Einstellungen.
- Notizen bleiben entsprechend der ausdrücklichen bisherigen Auswahl optional; Deaktivierung entfernt sie beim nächsten erfolgreichen Abgleich aus zentralem Stand und zugeordneten Google-Terminen. Bereits exportierte Kopien und Anbieter-Backups können damit nicht zurückgeholt werden.

## Datenschutz: noch vom Betreiber zu prüfen

Die Funktionshinweise in der Kalenderverbindung sind keine vollständige Datenschutzerklärung und keine Konformitätszusage.

- [ ] Betreiber und Datenschutzkontakt, Verarbeitungszweck, Rechtsgrundlage und betroffene Personengruppen dokumentieren.
- [ ] Erforderliche Informationen gegenüber Ansprechpartnern/anderen Betroffenen bereitstellen.
- [ ] Tatsächlich verwendete Google-Kontoart und Vertragsbedingungen prüfen; Anbieterrollen bestimmen.
- [ ] Erforderliche Auftragsverarbeitungsverträge für eingesetzte Dienste prüfen/abschließen; Unterauftragnehmer und internationale Übermittlungen dokumentieren.
- [ ] Aufbewahrungsfristen auch für lokale Checklisten, zentralen Kalenderstand, Anbieterprotokolle und Backups festlegen und regelmäßig prüfen.
- [ ] Google-Testnutzer auf eigene benötigte Konten begrenzen, Google-Kalender nicht öffentlich teilen und Mehrfaktor-Anmeldung für Betreiberkonten aktivieren.
- [ ] Löschung, Widerruf, Wiederanmeldung und Auskunft für den tatsächlichen Betriebsablauf prüfen.

Tests: `node tests/google-calendar.test.mjs` und `node tests/calendar-sync.test.cjs` prüfen unter anderem Fristgrenzen, Löschung ausschließlich zugeordneter Events, Pausierung, Wiederholung nach Teilausfall, Widerruf und deaktivierte Übertragung nach zentraler Löschung. Tests verwenden synthetische Daten; echte Google-Termine werden dadurch nicht gelöscht.
