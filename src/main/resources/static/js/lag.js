/* ============ TourManager lagside – koblet mot backend ============
   Dataflyt:
   - alleRyttere fylles fra GET /api/ryttere ved oppstart
   - budsjett og mittLag eies av backend og hentes fra GET /api/lag
   - kjøp/salg sendes til backend; deretter hentes fersk lagstatus
   Kvotereglene i hvorforKanIkkeKjopes SPEILER backendens regler
   for å kunne vise knappestatus ("Full kvote" osv.) – backend er
   alltid fasit og validerer alle kjøp på nytt.
==================================================================== */

/* Kvoter og rekkefølge – speiler Lag-klassens regler i backend */
const ROLLER = [
    { navn: "Lagkaptein",     kode: "KAP", flertall: "Kapteiner",       kvote: 2 },
    { navn: "Spurter",        kode: "SPR", flertall: "Spurtere",        kvote: 2 },
    { navn: "Klatrer",        kode: "KLA", flertall: "Klatrere",        kvote: 2 },
    { navn: "Ungdomsrytter",  kode: "UNG", flertall: "Ungdomsryttere",  kvote: 2 },
    { navn: "Hjelperytter",   kode: "HJE", flertall: "Hjelperyttere",   kvote: 3 },
    { navn: "Temporytter",    kode: "TEM", flertall: "Temporyttere",    kvote: 1 },
    { navn: "Sportsdirektør", kode: "SD",  flertall: "Sportsdirektør",  kvote: 1 }
];

const MAKS_FRA_SAMME_LAG = 3;

/* Trøyefarger per rolle (fill for SVG-trøya) */
const TROYE_FARGER = {
    "Lagkaptein":     "#F2B32C",
    "Spurter":        "#8FAE5D",
    "Klatrer":        "url(#monster-prikker)",
    "Ungdomsrytter":  "#FFFFFF",
    "Temporytter":    "#7FB5D6",
    "Hjelperytter":   "#FAF5E9",
    "Sportsdirektør": "#22304A"
};

// ---------- State (speil av backend, fylles via API) ----------

let alleRyttere = [];
let mittLag = [];
let budsjett = 0;

let aktivtRolleFilter = "alle";
let aktivtLagFilter = "alle";
let aktivtPrisFilter = "alle";
let sokeTekst = "";

// ---------- Oppstart ----------

window.onload = async () => {
    try {
        // Hent data FØR vi bygger filtre, siden filtrene bygges fra datasettet
        await hentAlleRyttere();
        await hentLagStatus();
    } catch (feil) {
        console.error(feil);
        visBeskjed("Fikk ikke kontakt med serveren – kjører backend?", true);
        return;
    }

    byggRolleFaner();
    byggLagFilter();
    kobleFilterHendelser();
    oppdaterAlt();
};

// ---------- Datahenting fra backend ----------

async function hentAlleRyttere() {
    const response = await fetch("/api/ryttere");
    if (!response.ok) throw new Error("Kunne ikke hente ryttere");
    alleRyttere = await response.json();
}

async function hentLagStatus() {
    const response = await fetch("/api/lag");
    if (!response.ok) throw new Error("Kunne ikke hente lagstatus");
    const lag = await response.json();
    mittLag = lag.valgteRyttere ?? [];
    budsjett = lag.budsjett;
}

async function kjopRytter(rytterId) {
    try {
        const response = await fetch("/api/lag/kjop?id=" + rytterId, { method: "POST" });
        const melding = await response.text();
        visBeskjed(melding, !response.ok);

        if (response.ok) {
            await hentLagStatus(); // backend eier fasiten – hent den på nytt
            oppdaterAlt();
        }
    } catch (feil) {
        console.error(feil);
        visBeskjed("Noe gikk galt – fikk ikke kontakt med serveren.", true);
    }
}

async function selgRytter(rytterId) {
    try {
        const response = await fetch("/api/lag/ryttere/" + rytterId, { method: "DELETE" });
        const melding = await response.text();
        visBeskjed(melding, !response.ok);

        if (response.ok) {
            await hentLagStatus();
            oppdaterAlt();
        }
    } catch (feil) {
        console.error(feil);
        visBeskjed("Noe gikk galt – fikk ikke kontakt med serveren.", true);
    }
}

function oppdaterAlt() {
    oppdaterLagStatus();
    visRyttere(alleRyttere);
    oppdaterRolleFaner();
}

// ---------- Regler (speiler backend – kun for knappestatus i UI) ----------

function hvorforKanIkkeKjopes(rytter) {
    if (mittLag.some(r => r.id === rytter.id))
        return rytter.navn + " er allerede på laget ditt.";
    if (rytter.pris > budsjett)
        return "Ikke nok penger til " + rytter.navn + ".";

    const rolleInfo = ROLLER.find(r => r.navn === rytter.rolle);
    const antallIRolle = mittLag.filter(r => r.rolle === rytter.rolle).length;
    if (rolleInfo && antallIRolle >= rolleInfo.kvote)
        return "Du har allerede fullt i " + rytter.rolle + "-kategorien.";

    const fraSammeLag = mittLag.filter(r => r.lag === rytter.lag).length;
    if (fraSammeLag >= MAKS_FRA_SAMME_LAG)
        return "Maks " + MAKS_FRA_SAMME_LAG + " ryttere fra " + rytter.lag + ".";

    return null; // alt ok
}

function knappeTekst(rytter) {
    if (mittLag.some(r => r.id === rytter.id)) return "På laget";
    if (rytter.pris > budsjett) return "For dyr";
    const rolleInfo = ROLLER.find(r => r.navn === rytter.rolle);
    const antallIRolle = mittLag.filter(r => r.rolle === rytter.rolle).length;
    if (rolleInfo && antallIRolle >= rolleInfo.kvote) return "Full kvote";
    const fraSammeLag = mittLag.filter(r => r.lag === rytter.lag).length;
    if (fraSammeLag >= MAKS_FRA_SAMME_LAG) return "Lagkvote";
    return "Kjøp";
}

// ---------- Filtre ----------

function byggRolleFaner() {
    const container = document.getElementById("rolle-filter");
    const alleFane = lagFane("alle", "ALLE", () => `${mittLag.length}/13`);
    alleFane.classList.add("aktiv");
    container.appendChild(alleFane);

    ROLLER.forEach(rolle => {
        container.appendChild(
            lagFane(rolle.navn, rolle.kode,
                () => `${mittLag.filter(r => r.rolle === rolle.navn).length}/${rolle.kvote}`)
        );
    });
}

function lagFane(verdi, kode, tellerFn) {
    const fane = document.createElement("button");
    fane.className = "rolle-fane";
    fane.dataset.rolle = verdi;
    fane.innerHTML = `<span class="kode">${kode}</span><span class="teller">${tellerFn()}</span>`;
    fane.tellerFn = tellerFn;
    fane.onclick = () => {
        aktivtRolleFilter = verdi;
        document.querySelectorAll(".rolle-fane")
            .forEach(f => f.classList.toggle("aktiv", f === fane));
        visRyttere(alleRyttere);
    };
    return fane;
}

function oppdaterRolleFaner() {
    document.querySelectorAll(".rolle-fane").forEach(fane => {
        fane.querySelector(".teller").textContent = fane.tellerFn();
        if (fane.dataset.rolle !== "alle") {
            const rolle = ROLLER.find(r => r.navn === fane.dataset.rolle);
            const antall = mittLag.filter(r => r.rolle === fane.dataset.rolle).length;
            fane.classList.toggle("full", rolle && antall >= rolle.kvote);
        }
    });
}

function byggLagFilter() {
    const lagFilter = document.getElementById("lag-filter");
    [...new Set(alleRyttere.map(r => r.lag))].sort().forEach(lag => {
        const option = document.createElement("option");
        option.value = lag;
        option.textContent = lag;
        lagFilter.appendChild(option);
    });
}

function kobleFilterHendelser() {
    document.getElementById("lag-filter").onchange = e => {
        aktivtLagFilter = e.target.value;
        visRyttere(alleRyttere);
    };

    document.getElementById("sok-felt").oninput = e => {
        sokeTekst = e.target.value.toLowerCase().trim();
        visRyttere(alleRyttere);
    };

    document.querySelectorAll("#pris-filter .filter-chip").forEach(chip => {
        chip.onclick = () => {
            aktivtPrisFilter = chip.dataset.pris;
            document.querySelectorAll("#pris-filter .filter-chip")
                .forEach(c => c.classList.toggle("aktiv", c === chip));
            visRyttere(alleRyttere);
        };
    });
}

function filtrer(ryttere) {
    return ryttere.filter(r =>
        (aktivtRolleFilter === "alle" || r.rolle === aktivtRolleFilter) &&
        (aktivtLagFilter === "alle" || r.lag === aktivtLagFilter) &&
        (sokeTekst === "" || r.navn.toLowerCase().includes(sokeTekst)) &&
        prisMatch(r.pris)
    );
}

function prisMatch(pris) {
    switch (aktivtPrisFilter) {
        case "lav":     return pris < 5;
        case "middels": return pris >= 5 && pris <= 8;
        case "hoy":     return pris > 8;
        default:        return true;
    }
}

// ---------- Visning: markedet ----------

function visRyttere(ryttere) {
    const container = document.getElementById("rytter-container");
    container.innerHTML = "";

    const synlige = filtrer(ryttere);

    document.getElementById("treff-teller").textContent =
        synlige.length + " av " + ryttere.length + " ryttere";

    if (synlige.length === 0) {
        container.innerHTML =
            '<div class="tom-liste">Ingen treff – prøv et annet filter eller søk.</div>';
        return;
    }

    synlige.forEach(rytter => {
        const eier = mittLag.some(r => r.id === rytter.id);
        const kanKjopes = !hvorforKanIkkeKjopes(rytter);

        const rad = document.createElement("div");
        rad.className = "rytter-rad" + (eier ? " eid" : "");
        rad.innerHTML = `
      ${troyeSvg(rytter.rolle, "mini-troye")}
      <span class="rytter-info">
        <span class="rytter-navn">${rytter.navn}</span>
        <span class="rytter-lag">${rytter.lag}</span>
      </span>
      <span class="pris">${rytter.pris}<small> M</small></span>
      <button class="kjop-knapp" onclick="kjopRytter(${rytter.id})"
        ${kanKjopes ? "" : "disabled"}>${knappeTekst(rytter)}</button>
    `;
        container.appendChild(rad);
    });
}

// ---------- Visning: laget som trøyer ----------

function oppdaterLagStatus() {
    const budsjettEl = document.getElementById("budsjett-visning");
    budsjettEl.innerText = budsjett;
    budsjettEl.classList.toggle("lavt", budsjett < 10);
    document.getElementById("antall-visning").innerText = mittLag.length;

    const grupper = document.getElementById("lag-grupper");
    grupper.innerHTML = "";

    ROLLER.forEach(rolle => {
        const gruppe = document.createElement("section");
        gruppe.className = "rolle-gruppe";

        const iRollen = mittLag.filter(r => r.rolle === rolle.navn);
        let plasser = "";

        iRollen.forEach(rytter => {
            plasser += `
        <div class="troye-plass fylt">
          ${troyeSvg(rolle.navn)}
          <span class="navneskilt">${rytter.navn}</span>
          <span class="troye-pris">${rytter.pris} M</span>
          <button class="selg-knapp" onclick="selgRytter(${rytter.id})">Selg</button>
        </div>`;
        });

        for (let i = iRollen.length; i < rolle.kvote; i++) {
            plasser += `
        <button class="tom-plass troye-plass" onclick="filtrerTilRolle('${rolle.navn}')"
          title="Vis ${rolle.flertall.toLowerCase()} i markedet">
          ${tomTroyeSvg()}
          <span class="plass-tekst">+ Velg</span>
        </button>`;
        }

        gruppe.innerHTML = `
      <span class="gruppe-navn">${rolle.flertall}</span>
      <div class="troye-rekke">${plasser}</div>
    `;
        grupper.appendChild(gruppe);
    });

    // Kvoteoversikt i statuslinja
    const kvoter = document.getElementById("kvote-oversikt");
    kvoter.innerHTML = "";
    ROLLER.forEach(rolle => {
        const antall = mittLag.filter(r => r.rolle === rolle.navn).length;
        const tag = document.createElement("span");
        tag.className = "kvote-tag" + (antall >= rolle.kvote ? " full" : "");
        tag.textContent = `${rolle.kode} ${antall}/${rolle.kvote}`;
        kvoter.appendChild(tag);
    });
}

/* Klikk på tom trøyeplass -> filtrer markedet til den rollen */
function filtrerTilRolle(rolleNavn) {
    aktivtRolleFilter = rolleNavn;
    document.querySelectorAll(".rolle-fane")
        .forEach(f => f.classList.toggle("aktiv", f.dataset.rolle === rolleNavn));
    visRyttere(alleRyttere);
    document.getElementById("sok-felt").focus();
}

// ---------- Trøye-SVG ----------

function troyeSvg(rolle, cssKlasse = "") {
    const fyll = TROYE_FARGER[rolle] || "#FAF5E9";
    return `
    <svg class="${cssKlasse}" viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M32,6 L44,2 Q50,10 56,2 L68,6 L92,22 L82,40 L74,34 L74,86 L26,86 L26,34 L18,40 L8,22 Z"
        fill="${fyll}" stroke="#22304A" stroke-width="4" stroke-linejoin="round"/>
    </svg>`;
}

function tomTroyeSvg() {
    return `
    <svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M32,6 L44,2 Q50,10 56,2 L68,6 L92,22 L82,40 L74,34 L74,86 L26,86 L26,34 L18,40 L8,22 Z"
        fill="rgba(250,245,233,0.4)" stroke="#22304A" stroke-width="3"
        stroke-dasharray="7 6" stroke-linejoin="round"/>
    </svg>`;
}

// ---------- Toast ----------

let beskjedTimer;
function visBeskjed(tekst, erFeil = false) {
    let el = document.querySelector(".beskjed");
    if (!el) {
        el = document.createElement("div");
        el.className = "beskjed";
        document.body.appendChild(el);
    }
    el.textContent = tekst;
    el.classList.toggle("feil", erFeil);
    el.classList.add("vis");
    clearTimeout(beskjedTimer);
    beskjedTimer = setTimeout(() => el.classList.remove("vis"), 2600);
}