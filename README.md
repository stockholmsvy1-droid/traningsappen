# Träningsappen

Enkel webbapp för att logga träningspass. Ett pass består av **moment** —
en gymmaskin, en stretchövning eller en löprunda — och för varje moment kan
du ange set, reps och vikt (alla frivilliga) samt en fritextnotering.
Visar historik, veckostatistik och vilket pass som står på tur. Bilder på
gymmaskinerna finns inbyggda, och egna passtyper och moment kan läggas till.

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

Versionsnumret visas i appen, till höger i hjälptextens rubrikrad. Det bor
på två ställen som alltid ska ha samma nummer:

- `APP_VERSION` i `script.js` — det som visas
- `CACHE_VERSION` i `sw.js` — det som får telefonen att hämta nya filer

Höj båda vid varje publicerad ändring. Glömmer du `CACHE_VERSION` fortsätter
telefonen visa den gamla versionen även efter push.

## Versionshistorik

- **1.8** — bannern heter "Nästa styrketräningspass" och roterar bara mellan A
  och B. Egna passtyper (löpning, promenad, stretching, hemmaövningar) ingår
  inte längre i turordningen och stör den inte heller när de loggas emellan.
  Bannern sätts i två rader så att passnamnet inte bryts mitt itu.
- **1.7** — Logga pass är öppen från start igen (den används oftast och kostade
  ett extra tryck per appstart), och Statistik har flyttats ned under den.
- **1.6** — alla avsnitt är hopfällda när appen startar, så startskärmen blir en
  innehållsförteckning i stället för en lång rulle. Statistik och Logga pass är
  numera också hopfällbara. Logga pass fälls ut automatiskt när man trycker på
  en momentbild eller på ✎ i historiken. Appikonen visas intill titeln.
- **1.5** — säkerhetskopiering: exportera all data till en JSON-fil (eller till
  urklipp som reserv på iOS) och läs tillbaka den igen. Historiken går att
  redigera i efterhand — ✎ på en rad öppnar den i loggningsformuläret, och
  radens id behålls så inget dubbleras.
- **1.4** — rättar att appen kunde fastna på en gammal version. Service
  workern var cache-först för allt, även HTML och JS, så en hemskärmsapp
  fortsatte servera gammal kod. Nu hämtas appens egna filer nätverk först med
  3 sekunders timeout (bilder är fortfarande cache-först), appen laddar om sig
  själv en gång när en ny version aktiverats, och en enskild bild som inte går
  att hämta sänker inte längre hela installationen.
- **1.3** — momenten sorteras efter passtyp (A, B, C …) i stället för att egna
  tillägg hamnar sist i skapandeordning. Inom varje passtyp ligger det senast
  tillagda momentet sist.
- **1.2** — "Maskin" och "Övning" heter numera **Moment** i hela gränssnittet,
  så att appen fungerar lika bra för löprundor, stretching och hemmaövningar
  som för gymmaskiner. Fritextnotering på varje loggning, synlig i historiken.
  Set, reps och vikt är frivilliga och utelämnas ur historiken när de är tomma.
  Lagringsnycklarna är oförändrade — ingen data gick förlorad i namnbytet.
- **1.1** — passtypen står kvar under passet i stället för att hoppa vidare
  efter varje loggning; bannern visar "Pågår" när du redan tränat idag;
  tryck på en maskinbild för att hoppa till loggningen med övningen vald;
  versionsnumret syns i appen.
- **1.0** — första publicerade versionen.

## Proveniens

Byggd som Sprint 1 i Dirigenten-metoden, juli 2026. Källa:
`~/Dirigenten/Arkiv/Sprint 1 Tränings-appen` (arkiverad, styr inget).
Kopierad hit 2026-09-08 för publicering; arkivet lämnades orört.
Tillagt vid publicering: PWA-stöd (manifest, service worker, ikoner).
