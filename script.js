// ===== Version =====
// Höj vid varje ändring som publiceras. CACHE_VERSION i sw.js ska ha
// SAMMA nummer, annars fortsätter telefonen visa den gamla versionen.
const APP_VERSION = "1.2";

// ===== Passtyper =====
// A och B är standard; egna passtyper sparas i localStorage och får nästa lediga bokstav.
const STANDARD_PASSTYPER = [
  { id: "A", namn: "Ben + Balans" },
  { id: "B", namn: "Överkropp + Mage" }
];

// ===== Standardmaskiner =====
const STANDARD_MASKINER = [
  { id: "leg-extension",     namn: "Leg Extension",     pass: "A", bild: "bilder/leg-extension.jpeg" },
  { id: "seated-leg-curl",   namn: "Seated Leg Curl",   pass: "A", bild: "bilder/seated-leg-curl.jpeg" },
  { id: "hip-abduction",     namn: "Hip Abduction",     pass: "A", bild: "bilder/hip-abduction.jpeg" },
  { id: "balans-bosuboll",   namn: "Balans på bosuboll", pass: "A", bild: "bilder/balans-bosuboll.jpeg" },
  { id: "pectoral-fly",      namn: "Pectoral Fly",      pass: "B", bild: "bilder/pectoral-fly.jpeg" },
  { id: "shoulder-press",    namn: "Shoulder Press",    pass: "B", bild: "bilder/shoulder-press.jpeg" },
  { id: "row",               namn: "Row",               pass: "B", bild: "bilder/row.jpeg" },
  { id: "pulldown",          namn: "Pulldown",          pass: "B", bild: "bilder/pulldown.jpeg" },
  { id: "abdominal",         namn: "Abdominal",         pass: "B", bild: "bilder/abdominal.jpeg" },
  { id: "biceps-curl",       namn: "Biceps Curl",       pass: "B", bild: "bilder/biceps-curl.jpeg" },
  { id: "triceps-extension", namn: "Triceps Extension", pass: "B", bild: "bilder/triceps-extension.jpeg" },
  { id: "situps-bank",       namn: "Situps på bank",    pass: "B", bild: "bilder/situps-bank.jpeg" }
];

// ===== localStorage =====
const NYCKEL_PASS = "traningspass";
const NYCKEL_MASKINER = "egnaMaskiner";
const NYCKEL_PASSTYPER = "egnaPassTyper";
const NYCKEL_DOLDA_MASKINER = "doldaMaskiner"; // borttagna standardmaskiner (id-lista)

function lasPass() {
  return JSON.parse(localStorage.getItem(NYCKEL_PASS) || "[]");
}

function sparaPass(pass) {
  localStorage.setItem(NYCKEL_PASS, JSON.stringify(pass));
}

function lasEgnaMaskiner() {
  return JSON.parse(localStorage.getItem(NYCKEL_MASKINER) || "[]");
}

function sparaEgnaMaskiner(maskiner) {
  localStorage.setItem(NYCKEL_MASKINER, JSON.stringify(maskiner));
}

function lasEgnaPassTyper() {
  return JSON.parse(localStorage.getItem(NYCKEL_PASSTYPER) || "[]");
}

function sparaEgnaPassTyper(typer) {
  localStorage.setItem(NYCKEL_PASSTYPER, JSON.stringify(typer));
}

function lasDoldaMaskiner() {
  return JSON.parse(localStorage.getItem(NYCKEL_DOLDA_MASKINER) || "[]");
}

function sparaDoldaMaskiner(idn) {
  localStorage.setItem(NYCKEL_DOLDA_MASKINER, JSON.stringify(idn));
}

function allaMaskiner() {
  const dolda = lasDoldaMaskiner();
  return STANDARD_MASKINER.filter(m => !dolda.includes(m.id)).concat(lasEgnaMaskiner());
}

function allaPassTyper() {
  return STANDARD_PASSTYPER.concat(lasEgnaPassTyper());
}

// ===== Logik =====
function passEtikett(typId) {
  const typ = allaPassTyper().find(t => t.id === typId);
  return typ ? `${typ.id} – ${typ.namn}` : typId;
}

// Varje passtyp får en färgklass utifrån sin position i listan (cyklar efter 6).
function passFargKlass(typId) {
  const index = allaPassTyper().findIndex(t => t.id === typId);
  return "farg-" + (index >= 0 ? index % 6 : 0);
}

function nastaPass() {
  const typer = allaPassTyper();
  const pass = lasPass();
  if (pass.length === 0) return typer[0].id;
  const senaste = pass.reduce((a, b) => (b.datum >= a.datum ? b : a));
  const index = typer.findIndex(t => t.id === senaste.passTyp);
  return typer[(index + 1) % typer.length].id;
}

// Det pass som är igång just nu: passtypen för den senaste loggningen med
// dagens datum. Returnerar null om inget är loggat idag.
function pagaendePass() {
  const idag = idagISO();
  const idagsPass = lasPass().filter(p => p.datum === idag);
  if (idagsPass.length === 0) return null;
  const senaste = idagsPass.reduce((a, b) => (b.id >= a.id ? b : a));
  return allaPassTyper().some(t => t.id === senaste.passTyp) ? senaste.passTyp : null;
}

// Vilken passtyp formuläret ska stå på när appen laddas.
function startPass() {
  return pagaendePass() || nastaPass();
}

// Tomt talfält sparas som null, inte 0, så att historiken kan utelämna det.
function talEllerNull(id) {
  const text = document.getElementById(id).value.trim();
  if (text === "") return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

function harVarde(v) {
  return v !== null && v !== undefined && v !== "" && Number(v) > 0;
}

function idagISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function veckoStart() {
  // Måndag som veckostart
  const d = new Date();
  const dag = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dag);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

// Vilka maskinbilder som är utfällda just nu (sessionsläge, sparas inte).
const oppnaMaskiner = new Set();
let visaAllaBilder = false;

// ===== Rendering =====
function renderaBanner() {
  const banner = document.getElementById("nasta-pass-banner");
  const pagar = pagaendePass();
  const typ = pagar || nastaPass();
  const etikett = passEtikett(typ).replace(" – ", " (") + ")";
  banner.textContent = (pagar ? "Pågår: " : "Nästa pass: ") + etikett;
  banner.className = "banner " + passFargKlass(typ);
}

function renderaStatistik() {
  const pass = lasPass();
  const start = veckoStart();
  const grid = document.getElementById("stat-grid");
  grid.innerHTML = "";

  const tiles = [
    { varde: pass.filter(p => p.datum >= start).length, etikett: "Denna vecka" },
    { varde: pass.length, etikett: "Totalt" },
    ...allaPassTyper().map(t => ({
      varde: pass.filter(p => p.passTyp === t.id).length,
      etikett: "Pass " + t.id
    }))
  ];

  tiles.forEach(t => {
    const stat = document.createElement("div");
    stat.className = "stat";
    const varde = document.createElement("span");
    varde.className = "stat-varde";
    varde.textContent = t.varde;
    const etikett = document.createElement("span");
    etikett.className = "stat-etikett";
    etikett.textContent = t.etikett;
    stat.append(varde, etikett);
    grid.appendChild(stat);
  });
}

function fyllPassTypDropdown(select) {
  const valt = select.value;
  select.innerHTML = "";
  allaPassTyper().forEach(t => {
    const option = document.createElement("option");
    option.value = t.id;
    option.textContent = passEtikett(t.id);
    select.appendChild(option);
  });
  if ([...select.options].some(o => o.value === valt)) select.value = valt;
}

function renderaPassTypDropdowns() {
  fyllPassTypDropdown(document.getElementById("passtyp"));
  fyllPassTypDropdown(document.getElementById("maskin-pass"));
}

function renderaPassTypLista() {
  const lista = document.getElementById("passtyp-lista");
  const egnaIdn = lasEgnaPassTyper().map(t => t.id);
  lista.innerHTML = "";
  allaPassTyper().forEach(t => {
    const chip = document.createElement("span");
    chip.className = "passtyp-chip " + passFargKlass(t.id);
    chip.textContent = passEtikett(t.id);

    if (egnaIdn.includes(t.id)) {
      const taBort = document.createElement("button");
      taBort.type = "button";
      taBort.className = "chip-ta-bort";
      taBort.textContent = "✕";
      taBort.title = "Ta bort passtyp";
      taBort.setAttribute("aria-label", "Ta bort passtyp " + t.namn);
      taBort.addEventListener("click", () => taBortPassTyp(t.id));
      chip.appendChild(taBort);
    }

    lista.appendChild(chip);
  });
}

function visaPassTypMedd(text) {
  const medd = document.getElementById("passtyp-medd");
  medd.textContent = text;
  medd.hidden = !text;
}

function renderaOvningsdropdown() {
  const passTyp = document.getElementById("passtyp").value;
  const dropdown = document.getElementById("ovning");
  const valtId = dropdown.value;
  dropdown.innerHTML = "";

  const maskiner = allaMaskiner().filter(m => m.pass === passTyp);
  if (maskiner.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Inga moment ännu – lägg till ett moment";
    option.disabled = true;
    option.selected = true;
    dropdown.appendChild(option);
  }
  maskiner.forEach(m => {
    const option = document.createElement("option");
    option.value = m.id;
    option.textContent = m.namn;
    dropdown.appendChild(option);
  });
  if ([...dropdown.options].some(o => o.value === valtId)) dropdown.value = valtId;
  renderaOvningsbild();
}

function renderaOvningsbild() {
  const bild = document.getElementById("ovning-bild");
  const maskin = allaMaskiner().find(m => m.id === document.getElementById("ovning").value);
  if (maskin && maskin.bild) {
    bild.src = maskin.bild;
    bild.alt = maskin.namn;
    bild.hidden = false;
  } else {
    bild.hidden = true;
  }
}

function renderaHistorik() {
  const lista = document.getElementById("historik");
  const tomText = document.getElementById("historik-tom");
  const pass = lasPass().slice().sort((a, b) => b.datum.localeCompare(a.datum) || b.id - a.id);
  lista.innerHTML = "";
  tomText.hidden = pass.length > 0;

  pass.forEach(p => {
    const maskin = allaMaskiner().find(m => m.id === p.ovning);
    const li = document.createElement("li");

    const badge = document.createElement("span");
    badge.className = "badge " + passFargKlass(p.passTyp);
    badge.textContent = p.passTyp;

    const info = document.createElement("div");
    info.className = "historik-info";
    const namn = document.createElement("div");
    namn.className = "historik-ovning";
    namn.textContent = maskin ? maskin.namn : p.ovning;
    const detaljer = document.createElement("div");
    detaljer.className = "historik-detaljer";
    let matt = "";
    if (harVarde(p.set) && harVarde(p.reps)) matt = `${p.set} × ${p.reps}`;
    else if (harVarde(p.set)) matt = `${p.set} set`;
    else if (harVarde(p.reps)) matt = `${p.reps} reps`;
    if (harVarde(p.vikt)) matt = matt ? `${matt} @ ${p.vikt} kg` : `${p.vikt} kg`;
    detaljer.textContent = matt ? `${matt} · ${p.datum}` : p.datum;
    info.append(namn, detaljer);

    if (p.notering) {
      const notering = document.createElement("div");
      notering.className = "historik-notering";
      notering.textContent = p.notering;
      info.appendChild(notering);
    }

    const taBort = document.createElement("button");
    taBort.className = "ta-bort";
    taBort.textContent = "✕";
    taBort.setAttribute("aria-label", "Ta bort pass");
    taBort.addEventListener("click", () => taBortPass(p.id));

    li.append(badge, info, taBort);
    lista.appendChild(li);
  });
}

// Väljer en maskin i loggningsformuläret och rullar dit, så att man kan gå
// direkt från maskinbilden till att logga just den övningen.
function loggaMaskin(maskin) {
  const passtyp = document.getElementById("passtyp");
  passtyp.value = maskin.pass;
  renderaOvningsdropdown();
  const ovning = document.getElementById("ovning");
  ovning.value = maskin.id;
  renderaOvningsbild();
  document.getElementById("loggning").scrollIntoView({ behavior: "smooth", block: "start" });
  const vikt = document.getElementById("vikt");
  vikt.value = "";
  document.getElementById("notering").value = "";
  setTimeout(() => vikt.focus({ preventScroll: true }), 400);
}

function renderaMaskinGrid() {
  const grid = document.getElementById("maskin-grid");
  grid.innerHTML = "";
  allaMaskiner().forEach(m => {
    const kort = document.createElement("div");
    kort.className = "maskin-kort kant-" + passFargKlass(m.pass);

    const harBild = Boolean(m.bild);
    const oppen = harBild && oppnaMaskiner.has(m.id);

    const rad = document.createElement("div");
    rad.className = "maskin-header-rad";

    const header = document.createElement("button");
    header.type = "button";
    header.className = "maskin-header";
    header.setAttribute("aria-expanded", String(oppen));

    const namn = document.createElement("span");
    namn.className = "maskin-kort-namn";
    namn.textContent = m.namn;
    const badge = document.createElement("span");
    badge.className = "badge " + passFargKlass(m.pass);
    badge.textContent = m.pass;
    header.append(namn, badge);

    const taBort = document.createElement("button");
    taBort.type = "button";
    taBort.className = "ta-bort";
    taBort.textContent = "✕";
    taBort.title = "Ta bort moment";
    taBort.setAttribute("aria-label", "Ta bort " + m.namn);
    taBort.addEventListener("click", () => taBortMaskin(m.id));

    if (harBild) {
      const pil = document.createElement("span");
      pil.className = "chevron" + (oppen ? " oppen" : "");
      pil.textContent = "▾";
      header.appendChild(pil);

      const bildWrap = document.createElement("div");
      bildWrap.className = "maskin-bild-wrap";
      bildWrap.hidden = !oppen;
      const bild = document.createElement("img");
      bild.src = m.bild;
      bild.alt = m.namn;
      bild.loading = "lazy";
      bild.className = "maskin-bild-klickbar";
      bild.tabIndex = 0;
      bild.setAttribute("role", "button");
      bild.title = "Logga " + m.namn;
      bild.setAttribute("aria-label", "Logga " + m.namn);
      bild.addEventListener("click", () => loggaMaskin(m));
      bild.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          loggaMaskin(m);
        }
      });
      bildWrap.appendChild(bild);

      header.addEventListener("click", () => {
        if (oppnaMaskiner.has(m.id)) {
          oppnaMaskiner.delete(m.id);
        } else {
          oppnaMaskiner.add(m.id);
        }
        const nuOppen = oppnaMaskiner.has(m.id);
        bildWrap.hidden = !nuOppen;
        header.setAttribute("aria-expanded", String(nuOppen));
        pil.classList.toggle("oppen", nuOppen);
        uppdateraBildToggleKnapp();
      });

      rad.append(header, taBort);
      kort.append(rad, bildWrap);
    } else {
      header.disabled = true;
      rad.append(header, taBort);
      kort.appendChild(rad);
    }

    grid.appendChild(kort);
  });
}

function uppdateraBildToggleKnapp() {
  const medBild = allaMaskiner().filter(m => m.bild);
  visaAllaBilder = medBild.length > 0 && medBild.every(m => oppnaMaskiner.has(m.id));
  document.getElementById("toggla-bilder").textContent =
    visaAllaBilder ? "Dölj alla bilder" : "Visa alla bilder";
}

function renderaAllt() {
  renderaBanner();
  renderaStatistik();
  renderaPassTypDropdowns();
  renderaPassTypLista();
  renderaHistorik();
  renderaMaskinGrid();
  renderaOvningsdropdown();
  uppdateraBildToggleKnapp();
}

// ===== Händelser =====
function taBortPass(id) {
  sparaPass(lasPass().filter(p => p.id !== id));
  renderaAllt();
}

function taBortPassTyp(id) {
  // Bara egna passtyper kan tas bort, och bara om inget refererar till dem.
  const antalPass = lasPass().filter(p => p.passTyp === id).length;
  const antalMaskiner = allaMaskiner().filter(m => m.pass === id).length;
  if (antalPass > 0 || antalMaskiner > 0) {
    const delar = [];
    if (antalPass > 0) delar.push(antalPass + " loggade pass");
    if (antalMaskiner > 0) delar.push(antalMaskiner + " maskiner");
    visaPassTypMedd(`Passtyp ${id} används av ${delar.join(" och ")}. Ta bort dem först.`);
    return;
  }
  sparaEgnaPassTyper(lasEgnaPassTyper().filter(t => t.id !== id));
  visaPassTypMedd("");
  renderaAllt();
}

function taBortMaskin(id) {
  const egna = lasEgnaMaskiner();
  if (egna.some(m => m.id === id)) {
    // Egen maskin: raderas permanent ur localStorage
    sparaEgnaMaskiner(egna.filter(m => m.id !== id));
  } else {
    // Standardmaskin: markeras som borttagen så den inte kommer tillbaka vid omladdning
    const dolda = lasDoldaMaskiner();
    if (!dolda.includes(id)) dolda.push(id);
    sparaDoldaMaskiner(dolda);
  }
  oppnaMaskiner.delete(id);
  renderaAllt();
}

document.getElementById("passtyp").addEventListener("change", renderaOvningsdropdown);
document.getElementById("ovning").addEventListener("change", renderaOvningsbild);

document.getElementById("logg-form").addEventListener("submit", e => {
  e.preventDefault();
  if (!document.getElementById("ovning").value) return;
  const pass = lasPass();
  pass.push({
    id: Date.now(),
    passTyp: document.getElementById("passtyp").value,
    ovning: document.getElementById("ovning").value,
    set: talEllerNull("set"),
    reps: talEllerNull("reps"),
    vikt: talEllerNull("vikt"),
    notering: document.getElementById("notering").value.trim(),
    datum: document.getElementById("datum").value
  });
  sparaPass(pass);
  renderaAllt();
  document.getElementById("vikt").value = "";
  document.getElementById("notering").value = "";
});

document.getElementById("passtyp-form").addEventListener("submit", e => {
  e.preventDefault();
  const namn = document.getElementById("passtyp-namn").value.trim();
  if (!namn) return;

  // Nästa lediga bokstav efter befintliga passtyper (C, D, E ...)
  const upptagna = allaPassTyper().map(t => t.id);
  const bokstaver = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const ledig = [...bokstaver].find(b => !upptagna.includes(b));
  if (!ledig) return;

  const typer = lasEgnaPassTyper();
  typer.push({ id: ledig, namn });
  sparaEgnaPassTyper(typer);
  document.getElementById("passtyp-form").reset();
  visaPassTypMedd("");
  renderaAllt();
});

document.getElementById("maskin-form").addEventListener("submit", e => {
  e.preventDefault();
  const namn = document.getElementById("maskin-namn").value.trim();
  const passTyp = document.getElementById("maskin-pass").value;
  const fil = document.getElementById("maskin-bild").files[0];

  const laggTill = bildUrl => {
    const maskiner = lasEgnaMaskiner();
    maskiner.push({ id: "egen-" + Date.now(), namn, pass: passTyp, bild: bildUrl });
    sparaEgnaMaskiner(maskiner);
    document.getElementById("maskin-form").reset();
    renderaAllt();
  };

  if (fil) {
    const lasare = new FileReader();
    lasare.onload = () => laggTill(lasare.result);
    lasare.readAsDataURL(fil);
  } else {
    laggTill("");
  }
});

document.getElementById("toggla-bilder").addEventListener("click", () => {
  const medBild = allaMaskiner().filter(m => m.bild);
  if (visaAllaBilder) {
    oppnaMaskiner.clear();
  } else {
    medBild.forEach(m => oppnaMaskiner.add(m.id));
  }
  renderaMaskinGrid();
  uppdateraBildToggleKnapp();
});

// ===== Init =====
document.getElementById("app-version").textContent = "v" + APP_VERSION;
document.getElementById("datum").value = idagISO();
renderaAllt();
document.getElementById("passtyp").value = startPass();
renderaOvningsdropdown();
