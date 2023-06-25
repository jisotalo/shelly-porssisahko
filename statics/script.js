const DEV = typeof IS_PROD === "undefined";
const LOG = DEV;
const BASE_URL = DEV === true ? "http://192.168.5.15" : "";
const BASE_SCRIPT_URL = DEV === true ? BASE_URL + "/script/1/porssi" : "";

const setDebug = (dbg) => {
  debug = dbg ? console.log.bind(window.console) : () => { };
};

setDebug(LOG);

window.addEventListener("error", function (e) {
  console.error("Error at line:", e.lineno)
}, false);

window.onload = async () => {
  openTab(window.location.hash.substring(window.location.hash.indexOf("#") + 1));

  await populateDynamicData("content-status.html", "#content-status");
  await populateDynamicData("content-settings.html", "#content-settings");
  await populateDynamicData("content-wifi.html", "#content-wifi");
  await populateDynamicData("content-log.html", "#content-log");
  await populateDynamicData("content-welcome.html", "#content-help");
};

document.querySelectorAll(".tab-switch").forEach(e => e.addEventListener("change", (e) => {
  window.location.hash = e.target.id;
}));

const evalContainerScriptTags = (elementId) => {
  debug(me(), "eval running for", elementId);

  var scripts = qs(elementId).querySelectorAll("script");
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].innerText) {
      /*debug(scripts[i].innerText);*/
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
      url = `${BASE_SCRIPT_URL}?req=${url}`
    }
    debug(me(), "fetching", url, "for", containerId);

    const res = await getData(url, false);
    if (res.success) {
      qs(containerId).innerHTML = res.data;
      evalContainerScriptTags(containerId);
    } else {
      qs(containerId).innerHTML = `Error getting data: ${res.statusText}`;
    }
    debug(me(), "done for", containerId);
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
      debug(me(), `Fetching ${url} done. Status code: ${res.status}`);

      return {
        success: true,
        statusCode: res.status,
        statusText: res.statusText,
        data
      };

    } else {
      console.error(`Failed to fetch ${url}: ${res.statusText} (${await res.text()})`);

      return {
        success: false,
        statusCode: res.status,
        statusText: `Failed to fetch ${url}: ${res.statusText} (${(await res.text())})`,
        data: null
      };

    }
  } catch (err) {
    console.error(`Failed to fetch ${url}: (${JSON.stringify(err)})`);

    return {
      success: false,
      statusCode: -1,
      statusText: `Failed to fetch ${url}: (${JSON.stringify(err)})`,
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