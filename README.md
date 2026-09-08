# Träningsappen

Enkel webbapp för att logga gympass: passtyp, övning, set, reps och vikt.
Visar historik, veckostatistik och vilket pass som står på tur. Bilder på
maskinerna finns inbyggda, och egna passtyper och maskiner kan läggas till.

**Öppna appen:** https://stockholmsvy1-droid.github.io/traningsappen/

## Så använder du den i gymmet

1. Öppna adressen ovan i Safari på telefonen.
2. Tryck på dela-ikonen → **Lägg till på hemskärmen**.
3. Starta appen från hemskärmsikonen. Den fungerar utan nätverk.

Att lägga till den på hemskärmen är viktigt: Safari kan annars rensa
sparad data efter en tids inaktivitet.

## Var data finns

All träningsdata sparas i webbläsarens `localStorage` — alltså **lokalt på
den enhet du använder**. Inget skickas någonstans. Pass du loggar på
telefonen syns inte på datorn, och tvärtom.

## Teknik

Ren HTML, CSS och JavaScript. Inget byggsteg, inga beroenden.
`sw.js` är en service worker som cachar appen för offline-läge — höj
`CACHE_VERSION` där när du ändrat index.html, script.js eller style.css,
annars fortsätter telefonen visa den gamla versionen.

## Proveniens

Byggd som Sprint 1 i Dirigenten-metoden, juli 2026. Källa:
`~/Dirigenten/Arkiv/Sprint 1 Tränings-appen` (arkiverad, styr inget).
Kopierad hit 2026-09-08 för publicering; arkivet lämnades orört.
Tillagt vid publicering: PWA-stöd (manifest, service worker, ikoner).
