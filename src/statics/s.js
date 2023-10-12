/**
 * shelly-porssisahko
 * 
 * (c) Jussi isotalo - http://jisotalo.fi
 * https://github.com/jisotalo/shelly-porssisahko
 * 
 * License: GNU Affero General Public License v3.0 
 */
/** URL of the shelly (only if DEV active, otherwise it is same origin) */
const URL = DEV ? "http://192.168.68.105" : "";

/** URL of the logic script */
const URL_SCRIPT = `${URL}/script/1`;

/** Shortcut for querySelector() call */
const qs = (s) => document.querySelector(s);

/**
 * debug function that is printing to console only when DEV is active
 */
let DBG = DEV ? console.log.bind(window.console) : () => { };

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
  "Varmuustunti (ei hintatietoja, aika tiedossa)", //7
  "Hätätilaohjaus (aika ei tiedossa)", //8
  "Pakko-ohjaus (%s asti)" //9
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

/** Callbacks called when state is updated */
let CBS = [];

/**
 * Helper that is used for DBG calls to add caller information
 */
const me = () => {
  let s = new Error().stack;
  if (s) {
    s = s.split(String.fromCharCode(10));
  }
  if (s.length > 0) {
    let str = "";
    if (s[4] && s[4].trim().split(" ")[1]) {
      str += `/${s[4].trim().split(" ")[1]}`;
    }
    if (s[3] && s[3].trim().split(" ")[1]) {
      str += `/${s[3].trim().split(" ")[1]}`;
    }
    if (s[2] && s[2].trim().split(" ")[1]) {
      str += `/${s[2].trim().split(" ")[1]}`;
    }
    return `${str}:`;
  }
  return `?:`;
};

/**
 * Adding an error event listener so we will catch eval() script errors better
 */
window.addEventListener("error", (e) => console.error("Error at line:", e.lineno), false);

/**
 * Shows or hides loading text and spinner
 * @param {*} str Loading text to show
 */
const toggleLoading = (str) => {
  qs("#loading").style.visibility = str !== undefined ? "visible" : "hidden";
  qs("#loading-text").innerText = str;
};

/**
 * Opens tab with given id
 * @param {*} tab 
 * @returns 
 */
const openTab = async (tab) => {
  if (tab === undefined || tab === "") {
    tab = "tab-status";
  }
  window.location.hash = tab;

  const e = qs("#" + tab);
  if (e) {
    e.checked = true;
  }

  if (qs(`#c-${tab}`).innerHTML === "") {
    await populateDynamicData(`${tab}.html`, `#c-${tab}`);
  }
};

window.onload = async () => {
  openTab(window.location.hash.substring(window.location.hash.indexOf("#") + 1));
};

document.querySelectorAll(".tab-switch").forEach(e => e.addEventListener("change", (e) => {
  openTab(e.target.id);
}));

const evalContainerScriptTags = (elementId) => {
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

const populateDynamicData = async (url, containerId) => {
  try {
    if (!DEV) {
      url = `/script/1/?r=${url}`
    }
    DBG(me(), "fetching", url, "for", containerId);

    const res = await getData(url, false);
    if (res.ok) {
      qs(containerId).innerHTML = res.data;
      evalContainerScriptTags(containerId);
    } else {
      qs(containerId).innerHTML = `Error getting data: ${res.txt}`;
    }
    DBG(me(), "done for", containerId);
  } catch (err) {
    console.error(`populateDynamicData(): Error happened: `, err);
  }
}


const getData = async (url, isJson = true) => {
  try {
    const res = await fetch(url);

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
      console.error(`Failed to fetch ${url}: ${res.statusText} (${await res.text()})`);

      return {
        ok: false,
        code: res.status,
        txt: `Failed to fetch ${url}: ${res.statusText} (${(await res.text())})`,
        data: null
      };

    }
  } catch (err) {
    console.error(`Failed to fetch ${url}: (${JSON.stringify(err)})`);

    return {
      ok: false,
      code: -1,
      txt: `Failed to fetch ${url}: (${JSON.stringify(err)})`,
      data: null
    };
  } finally {

  }
}

const formatDate = (value) => {
  let date = null;

  if (typeof value === "string") {
    date = new Date(value);
  } else {
    date = value;
  }

  return `${(date.getDate().toString().padStart(2, "0"))}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getFullYear()}`;
}

const formatTime = (value, showSeconds = true, showMilliseconds = false) => {
  let date = null;

  if (typeof value === "string") {
    date = new Date(value);
  } else {
    date = value;
  }

  return `${(date.getHours().toString().padStart(2, "0"))}:${date.getMinutes().toString().padStart(2, "0")}${(showSeconds ? `:${date.getSeconds().toString().padStart(2, "0")}` : "")}${(showMilliseconds ? `.${date.getMilliseconds().toString().padStart(3, "0")}` : "")}`;
}

const formatDateTime = (value, showSeconds = true, showMilliseconds = false) => {
  return `${formatDate(value)} ${formatTime(value, showSeconds, showMilliseconds)}`;
}

const updateLoop = async () => {
  DBG(me(), "Updating");
  qs("#spin").style.visibility = "visible";

  try {
    const res = await getData(`${URL_SCRIPT}?r=s`);

    if (res.ok) {
      state = res.data;
      
      //If status 503 the shelly is just now busy running the logic -> do nothing
    } else if (res.code !== 503) {
      state = null;
    }

    CBS.forEach(cb => cb());

  } catch (err) {
    console.error(me(), `Error:`, err);
    state = null;

  } finally {
    qs("#spin").style.visibility = "hidden";
    setTimeout(updateLoop, 10000);
  }
}


toggleLoading("Ladataan tilatietoja...");
updateLoop().then(() => toggleLoading());