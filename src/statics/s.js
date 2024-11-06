/**
 * shelly-porssisahko
 * 
 * (c) Jussi isotalo - http://jisotalo.fi
 * https://github.com/jisotalo/shelly-porssisahko
 * 
 * License: GNU Affero General Public License v3.0 
 */

/** 
 * URL of the shelly (only if DEV active, otherwise it is same origin) 
 */
let URL = "";

/** 
 * URL of the logic script 
 */
let URLS = ``;

/**
 * Selected instance from dropdown
 */
let inst = 0;

/** 
 * Active tab name
 */
let activeTab = '';

/**
 * Shortcut for document
 */
let doc = document;

/** 
 * Shortcut for querySelector() call 
 */
let qs = (s) => doc.querySelector("#" + s);

/**
 * debug function that is printing to console only when DEV is active
 */
let DBG = () => { };

/**
 * Enumeration of state
 */
let STATE_STR = [
  "Käynnistetään", //0
  "Käsiohjaus", //1
  "Hinta alle rajan", //2
  "Hinta yli rajan", //3
  "Hinta ei halvimpia tällä ajanjaksolla", //4
  "Hinta halvimpia tällä ajanjaksolla", //5
  "Hinta alle aina päällä -rajan", //6
  "Varmuustuntiohjaus (ei hintoja, aika tiedossa)", //7
  "Hätätilaohjaus (aika ei tiedossa)", //8
  "Pakko-ohjaus (%s asti)", //9
  "Pakko-ohjattu tunti", //10
  "Hinta yli maksimirajan", //11
  "Käyttäjän skriptiohjaus ylikirjoittaa", //12
  "Tunnin ohjausminuutit käytetty" //13
]

/**
 * Enumeration of mode
 */
let MODE_STR = [
  "Käsiohjaus",
  "Hintaraja",
  "Jakson halvimmat tunnit"
]

/**
 * Global state
 * 
 * undefined = not yet read
 * null = error
 */
let state = undefined;

/** 
 * Callbacks to call when state is updated 
 */
let CBS = [];

/**
 * Helper that is used for DBG calls to add caller information
 */
let me = () => "";

/** 
 * Timer handle 
 */
let loopTimer = null;

/**
 * Opens tab with given name
 * @param {*} tab 
 * @returns 
 */
let openTab = async (tab) => {
  if (tab === undefined || tab === "") {
    tab = "tab-status";
  }

  window.location.hash = `${tab}/${inst + 1}`;
  activeTab = tab;

  let e = qs("" + tab);
  if (e) {
    e.checked = true;
  }

  if (qs(`c-${tab}`).innerHTML === "") {
    try {
      await populateDynamicData(`${tab}.html`, `c-${tab}`);

    } catch (err) {
      DBG(me(), "error", err);
      console.error(err);
      if (confirm(`Sivun avaus epäonnistui - kokeile uudelleen? (${err.message})`)) {
        openTab(tab);
      }
    }
  }

  updateLoop(true);
};

/**
 * When page opens, select tab by URL hash
 */
window.onload = async () => {
  let hash = window.location.hash.split("/");
  inst = (parseInt(hash[1]) || 1) - 1;
  openTab(hash[0].slice(1));

  //At startup, run dev code or start immediately
  if (DEV) {
    reqJs("dev.js");
  } else {
    updateLoop();
  }
};

/**
 * Tab changing
 */
doc.querySelectorAll(".ts").forEach(e => e.addEventListener("change", (e) => {
  openTab(e.target.id);
}));

/**
 * eval() <script> tag contents
 * @param {*} elementId 
 */
let evalContainerScriptTags = (elementId) => {
  DBG(me(), "eval running for", elementId);

  var scripts = qs(elementId).querySelectorAll("script");
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].innerText) {
      /*DBG(scripts[i].innerText);*/
      eval(scripts[i].innerText);
    } else {
      fetch(scripts[i].src).then(function (data) {
        data.text().then(function (r) {
          eval(r);
        })
      });
    }
    scripts[i].parentNode.removeChild(scripts[i]);
  }
}

/**
* Loads dynamic data from URL to the container in DOM
 * @param {*} url 
 * @param {*} containerId 
 */
let populateDynamicData = async (url, containerId) => {
  if (!DEV) {
    url = `${URLS}?r=${url.replace("tab-", "").replace(".html", "")}`
  }
  DBG(me(), "fetching", url, "for", containerId);

  let res = await getData(url, false);

  if (res.ok) {
    qs(containerId).innerHTML = res.data;
    evalContainerScriptTags(containerId);

  } else {
    throw new Error(res.txt);
  }

  DBG(me(), "done for", containerId);
}

/**
 * Fetches data as json or plain text
 * @param {*} url 
 * @param {*} isJson 
 * @returns 
 */
let getData = async (url, isJson = true) => {
  try {
    let res = await fetch(url);

    if (res.ok) {
      let data = null;

      if (res.status !== 204) {
        if (isJson) {
          data = await res.json();
        } else {
          data = await res.text();
        }
      }
      DBG(me(), `Fetching ${url} done. Status code: ${res.status}`);

      return {
        ok: true,
        code: res.status,
        txt: res.statusText,
        data
      };

    } else {
      console.error(`${url}: ${res.statusText}`);

      return {
        ok: false,
        code: res.status,
        txt: `${url}: ${res.statusText} (${(await res.text())})`,
        data: null
      };

    }
  } catch (err) {
    console.error(url, err);

    return {
      ok: false,
      code: -1,
      txt: JSON.stringify(err, Object.getOwnPropertyNames(err)) + " :" + url,
      data: null
    };
  }
}

/**
 * Formats Date to string as dd.mm.yyyy
 * @param {*} date 
 * @returns 
 */
let formatDate = (date) => {
  return `${(date.getDate().toString().padStart(2, "0"))}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getFullYear()}`;
}

/**
 * Formats Date to time string as hh:mm[:ss]
 * @param {*} date 
 * @param {*} showSeconds true = add seconds
 * @returns 
 */
let formatTime = (date, showSeconds = true) => {
  return `${(date.getHours().toString().padStart(2, "0"))}:${date.getMinutes().toString().padStart(2, "0")}${(showSeconds ? `:${date.getSeconds().toString().padStart(2, "0")}` : "")}`;
}

/**
 * Formats Date to datetime string
 * @param {*} date 
 * @param {*} showSeconds true = add seconds
 * @returns 
 */
let formatDateTime = (date, showSeconds = true) => {
  return `${formatDate(date)} ${formatTime(date, showSeconds)}`;
}

/**
 * Called by setTimeout every 5 seconds
 * 
 * Can be also called manually when instance has been changed (instChanged)
 * 
 * @param {*} instChanged true if instance has been changed 
 */
let updateLoop = async () => {
  clearTimeout(loopTimer);
  DBG(me(), "Updating");
  qs("spin").style.visibility = "visible";

  try {
    let res = await getData(`${URLS}?r=s&i=${inst}`);

    if (res.ok) {
      state = res.data;

      //Updating title
      doc.title = (state.s.dn ? state.s.dn + " - " : "") + "Pörssisähkö";

      //Updating instances to dropdown
      qs("inst").innerHTML = state.c.names.map((n, i) => `<option value="${i}">Ohjaus #${(i + 1)}: ${n}</option>`)
      qs("inst").value = inst;

      //If status 503 the shelly is just now busy running the logic -> do nothing
    } else if (res.code !== 503) {
      //A real error
      state = null;
    }

    CBS.forEach(cb => cb());

  } catch (err) {
    console.error(err);
    state = null;

  } finally {
    qs("spin").style.visibility = "hidden";
    loopTimer = setTimeout(updateLoop, 5000);
  }
}

/**
 * Adding event handler to instance dropdown
 */
qs("inst").addEventListener("change", (e) => {
  //Instance has changed by user
  inst = parseInt(e.target.value);

  //Reset state as it's no longer valid
  state = undefined;

  //Running callbacks so that pages know instance has changed (no new data yet)
  CBS.forEach(cb => cb(true));

  //Run loop immediately
  updateLoop();

  openTab(activeTab);
});