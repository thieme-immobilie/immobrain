# Gesamte Projektkosten im Renovierungsplaner

Unter den bisherigen vier Kennzahlen erscheint eine hervorgehobene Projektkostensumme mit Aufschlüsselung. Kaufpreis stammt vorrangig aus dem tatsächlichen Kaufpreis im Bestand, danach aus der zugeordneten Fix-und-Flip-Kalkulation und schließlich aus dem Objektdatensatz. Bestehende Zuordnungen der Kalkulation bleiben unverändert.

Kaufnebenkosten: Kaufpreis × (Notar/Grundbuch + Makler + Grunderwerbsteuer in Prozent) aus der Kalkulation. Finanzierungsansatz: Kaufpreis × Finanzierungsanteil × (Zins/12 × Finanzierungsmonate + Bearbeitungsgebühr + Provisionen), Prozentwerte jeweils durch 100. Haltekosten: (Hausgeld + Strom/Heizung + weitere monatliche Kosten) × Projektmonate. Weitere monatliche Kosten werden hier mitgezählt, auch wenn die bisherige Gesamtinvestment-Formel im Rechner sie nicht beinhaltet. Diese Änderung verändert keine gespeicherten Kalkulationen.

Renovierungsansatz der Plansumme: höherer Wert aus Maßnahmenbudget und aktuell definierten Maßnahmen inklusive zusätzlicher Beschaffungen. Dadurch verschwindet ein bereits hinterlegtes Budget nicht, wenn noch keine Maßnahmen erfasst wurden. Budget und Maßnahmen werden nicht addiert. Das Budget enthält bereits die Reserve der Kalkulation; kein zweiter Puffer wird angesetzt. Bereits im To-do enthaltene Beschaffungen zählen nicht erneut. Nur ausgewählte Varianten zählen. Bezahlte Rechnungen bleiben eine separate Zahlungsübersicht und werden ebenfalls nicht erneut addiert.

Eine zweite Summe zeigt den Stand nur mit den tatsächlich definierten Maßnahmen statt des Budgetansatzes. Beide Zahlen sind Plan-/Erfassungswerte, kein Beleg für tatsächlich vollständig bezahlte Projektkosten. Fehlende Daten werden nicht als bekanntes Nullbudget behandelt: die Darstellung heißt dann erfasste Zwischensumme und nennt die fehlenden Angaben. Bekannte Teilbeträge der Kaufnebenkosten bleiben in der Zwischensumme enthalten und werden als unvollständig markiert.

Die Summe wird live aus Plan, zugeordnetem Objekt und Kalkulation berechnet; es wird kein neuer paralleler Gesamtbetrag gespeichert und kein bestehendes Budget verändert. Änderungen über andere Tabs werden beim Fokus-/Storage-Ereignis übernommen.

Tests: `node tests/project-costs.test.cjs`, `node tests/renovation-budget.test.cjs`, `node tests/renovation-ui.test.cjs`. Browseransicht hier nicht live geprüft.
