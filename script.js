// ===== Standardmaskiner =====
// Pass A = Ben + Balans, Pass B = Överkropp + Mage
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

function allaMaskiner() {
  return STANDARD_MASKINER.concat(lasEgnaMaskiner());
}

// ===== Logik =====
function nastaPass() {
  const pass = lasPass();
  if (pass.length === 0) return "A";
  const senaste = pass.reduce((a, b) => (b.datum >= a.datum ? b : a));
  return senaste.passTyp === "A" ? "B" : "A";
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

// ===== Rendering =====
function renderaBanner() {
  const banner = document.getElementById("nasta-pass-banner");
  const typ = nastaPass();
  banner.textContent = typ === "A" ? "Nästa pass: A (Ben + Balans)" : "Nästa pass: B (Överkropp + Mage)";
  banner.className = "banner " + (typ === "A" ? "pass-a" : "pass-b");
}

function renderaStatistik() {
  const pass = lasPass();
  const start = veckoStart();
  document.getElementById("stat-vecka").textContent = pass.filter(p => p.datum >= start).length;
  document.getElementById("stat-totalt").textContent = pass.length;
  document.getElementById("stat-a").textContent = pass.filter(p => p.passTyp === "A").length;
  document.getElementById("stat-b").textContent = pass.filter(p => p.passTyp === "B").length;
}

function renderaOvningsdropdown() {
  const passTyp = document.getElementById("passtyp").value;
  const dropdown = document.getElementById("ovning");
  const valtId = dropdown.value;
  dropdown.innerHTML = "";
  allaMaskiner()
    .filter(m => m.pass === passTyp)
    .forEach(m => {
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
    badge.className = "badge " + (p.passTyp === "A" ? "pass-a" : "pass-b");
    badge.textContent = p.passTyp;

    const info = document.createElement("div");
    info.className = "historik-info";
    const namn = document.createElement("div");
    namn.className = "historik-ovning";
    namn.textContent = maskin ? maskin.namn : p.ovning;
    const detaljer = document.createElement("div");
    detaljer.className = "historik-detaljer";
    detaljer.textContent = `${p.set} × ${p.reps} @ ${p.vikt} kg · ${p.datum}`;
    info.append(namn, detaljer);

    const taBort = document.createElement("button");
    taBort.className = "ta-bort";
    taBort.textContent = "✕";
    taBort.setAttribute("aria-label", "Ta bort pass");
    taBort.addEventListener("click", () => taBortPass(p.id));

    li.append(badge, info, taBort);
    lista.appendChild(li);
  });
}

function renderaMaskinGrid() {
  const grid = document.getElementById("maskin-grid");
  grid.innerHTML = "";
  allaMaskiner().forEach(m => {
    const kort = document.createElement("div");
    kort.className = "maskin-kort " + (m.pass === "A" ? "pass-a-kant" : "pass-b-kant");

    const bild = document.createElement("img");
    bild.src = m.bild;
    bild.alt = m.namn;

    const info = document.createElement("div");
    info.className = "maskin-kort-info";
    const namn = document.createElement("span");
    namn.className = "maskin-kort-namn";
    namn.textContent = m.namn;
    const badge = document.createElement("span");
    badge.className = "badge " + (m.pass === "A" ? "pass-a" : "pass-b");
    badge.textContent = m.pass;
    info.append(namn, badge);

    kort.append(bild, info);
    grid.appendChild(kort);
  });
}

function renderaAllt() {
  renderaBanner();
  renderaStatistik();
  renderaHistorik();
  renderaMaskinGrid();
  renderaOvningsdropdown();
}

// ===== Händelser =====
function taBortPass(id) {
  sparaPass(lasPass().filter(p => p.id !== id));
  renderaAllt();
  document.getElementById("passtyp").value = nastaPass();
  renderaOvningsdropdown();
}

document.getElementById("passtyp").addEventListener("change", renderaOvningsdropdown);
document.getElementById("ovning").addEventListener("change", renderaOvningsbild);

document.getElementById("logg-form").addEventListener("submit", e => {
  e.preventDefault();
  const pass = lasPass();
  pass.push({
    id: Date.now(),
    passTyp: document.getElementById("passtyp").value,
    ovning: document.getElementById("ovning").value,
    set: Number(document.getElementById("set").value),
    reps: Number(document.getElementById("reps").value),
    vikt: Number(document.getElementById("vikt").value),
    datum: document.getElementById("datum").value
  });
  sparaPass(pass);
  renderaAllt();
  document.getElementById("passtyp").value = nastaPass();
  renderaOvningsdropdown();
  document.getElementById("vikt").value = "";
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

// ===== Init =====
document.getElementById("datum").value = idagISO();
document.getElementById("passtyp").value = nastaPass();
renderaAllt();
