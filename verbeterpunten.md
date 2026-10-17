# Clean Car District — Analyse & verbeterpunten

Analyse van de huidige website (structuur/code), exclusief ontbrekende content
(teksten, foto's e.d. komen later). Datum: 18-08-2026.

## Algemene verbeterpunten

1. **Contactformulier werkt niet betrouwbaar** — gebruikt `action="mailto:..."`
   met `enctype="text/plain"`. Werkt afhankelijk van of de bezoeker een lokaal
   e-mailprogramma heeft ingesteld; op veel telefoons/browsers onbetrouwbaar.
   Koppel een echte formulierverwerker (Formspree, Netlify Forms, eigen backend).
2. **Geen favicon** — geen `<link rel="icon">` op enige pagina; leeg icoon in
   browsertabblad.
3. **Geen Open Graph / social share tags** — geen `og:title`, `og:image`,
   `og:description`, `twitter:card`. Gedeelde links (WhatsApp, Instagram,
   Facebook) tonen geen nette preview.
4. **Geen `robots.txt` en `sitemap.xml`** — ontbreken volledig.
5. **Geen structured data (JSON-LD)** — geen `LocalBusiness`/`AutoRepair`-schema
   (naam, adres, telefoon, openingstijden, rating) voor rich snippets.
6. **Placeholder-gegevens staan nog live** — `[Plaatsnaam], Nederland`,
   `[telefoonnummer invullen]`, dummy nummer `+31600000000` op meerdere plekken
   (index, contact, footer).
7. **Geen echte kaart/locatie** — `map-placeholder` div in plaats van een
   ingesloten Google Maps/OpenStreetMap-embed.
8. **Geen analytics/tracking** — geen manier om bezoekers of prestatie van
   pagina's/CTA's te meten (bv. Plausible, Fathom, GA4).
9. **Fonts laden extern zonder performance-optimalisatie** — Google Fonts
   (Poppins/Inter) via externe `<link>`; self-hosten scheelt een DNS/TLS
   round-trip.
10. **Geen 404-pagina** — geen custom foutpagina met navigatie terug naar de site.

## SEO-verbeterpunten

1. **Geen plaatsnaam/regio in titels en teksten** — titels en H1's bevatten
   geen locatie, terwijl "auto detailing [plaatsnaam]" precies is waar
   potentiële klanten op zoeken. Hangt samen met de lege `[Plaatsnaam]`-placeholder.
2. **Geen canonical tags** — geen `<link rel="canonical">` op enige pagina;
   risico op duplicate-content-issues (met/zonder www, querystrings, etc.).
3. **Geen structured data (JSON-LD)** — `LocalBusiness`/`AutoDetailing`-schema
   met adres, telefoon, openingstijden en prijsklasse ontbreekt; dit is wat
   Google gebruikt voor rich snippets en Google Maps.
4. **Geen `robots.txt` en `sitemap.xml`** — vertraagt indexering van
   (nieuwe) pagina's door zoekmachines.
5. **Geen Open Graph / Twitter Card tags** — beïnvloedt ook indirect
   klikfrequentie in zoekresultaten en social previews.
6. **Interne links missen keyword-rijke ankerteksten** — bv. "Lees meer over
   mij" i.p.v. iets specifieker zoals "Bekijk onze detailing pakketten".
7. **Geen alt-tekst strategie voor toekomstige afbeeldingen** — gallerij en
   hero gebruiken nu SVG-placeholders zonder `alt`; echte foto's moeten
   beschrijvende alt-teksten krijgen (bv. "Lakcorrectie BMW 3-serie voor en na").
8. **Geen blog/contentsectie gepland** — alleen statische servicepagina's;
   periodieke content (onderhoudstips e.d.) scoort beter op long-tail
   zoekopdrachten.
9. **Geen Google Business Profile-koppeling zichtbaar** — geen link naar/embed
   van een Google Bedrijfsprofiel (reviews, openingstijden), vaak belangrijker
   dan de website zelf voor "in de buurt"-zoekopdrachten.
10. **Performance kan SEO-ranking raken** — Core Web Vitals is een
    rankingfactor; let straks op `width`/`height` op afbeeldingen (voorkomt
    layout shift) en self-hosted fonts.

## Open vragen afspraakagenda

De agenda op `contact.html#afspraak` is nu een testversie zonder verbinding.
Instellingen staan in `BOOKING_CONFIG` in `js/script.js`.

1. **Kloppen de werktijden, duur en reistijd?** Nu aangenomen: ma t/m za,
   09:00–18:00, starttijd elk heel uur; Basic 2 uur, Plus 3 uur, Premium
   6 uur; 30 minuten reistijd tussen afspraken; boeken vanaf morgen tot
   60 dagen vooruit.
2. **Direct vastleggen of eerst zelf goedkeuren?** Nu staat een afspraak
   meteen vast. Goedkeuren is handig bij Premium Care, vanwege de €50
   aanbetaling.
3. **Eén gezamenlijke Google Agenda of elk een eigen?** Met twee agenda's
   kunnen Emircan en Lmar mogelijk twee afspraken tegelijk doen.

Koppeling met Google Agenda: vervang `fetchBusy()` (bezette tijden) en
`createBooking()` (afspraak aanmaken) in `js/script.js`. Daarvoor is een
kleine backend nodig; de Google-inloggegevens mogen niet in de website staan.

## Overige open punten

- **Annuleringsvoorwaarden** vastleggen (ook voor de aanbetaling); de FAQ
  zegt nu alleen dat ze vooraf besproken worden.
- **Echte behandelduur** per pakket in de FAQ zetten.
- **Add-ons** (keramische coating, motorruimte, ozon, bekleding) nalopen:
  kloppen ze nog met het aanbod?
- **Over ons**: eventueel een eigen stukje tekst per eigenaar.
- **Contactformulier** werkt niet: koppel een formulierverwerker of een nieuw
  e-mailadres.

## Prioriteit

Van de SEO-lijst zijn punt 1, 2, 4 en 6 het meest impactvol om als eerste
op te pakken zodra er content beschikbaar is.
