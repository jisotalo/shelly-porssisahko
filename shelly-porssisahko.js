//(c) Jussi Isotalo https://github.com/jisotalo
//---- Constants ----
let SCRIPT_ID = JSON.stringify(Shelly.getCurrentScriptId());
let SCRIPT_NAME = "porssi";
let SCRIPT_URL = "/script/" + SCRIPT_ID + "/" + SCRIPT_NAME;
let MAX_LOG_LINES = 20;
let MAX_RELAY_LOG_LINES = 50;
let CHECK_INTERVAL_S = 60;
let STARTUP_DELAY_S = 5;
let DEFAULT_SETTINGS = {
  mode: 0,
  manualCmd: false,
  priceLimit: 0,
  numberOfHours: 0,
  alwaysOnPriceLimit: 0,
  backupHours: [],
  dataSource: 0,
  alv: 0.24,
  errorCmd: false,
  welcomeShown: false
};
let RELAY_DESC = {
  UNKNOWN: 0,
  STARTED: 1,
  CONN_ERROR_IS_BACKUP_HOUR: 10,
  CONN_ERROR_NOT_BACKUP_HOUR: 11,
  CONN_ERROR_NO_TIME_OUTPUT_ON: 12,
  CONN_ERROR_NO_TIME_OUTPUT_OFF: 13,
  MANUAL_ON: 20,
  MANUAL_OFF: 21,
  PRICE_BELOW_OUTPUT_ON: 30,
  PRICE_ABOVE_OUTPUT_OFF: 31,
  IS_CHEAPEST_OUTPUT_ON: 40,
  NOT_CHEAPEST_OUTPUT_OFF: 41,
  NOT_CHEAPEST_PRICE_BELOW_OUTPUT_ON: 42
};
let RELAY_MANUAL_ON = "";

//---- Variables ----
let initDone = false;
let firstCycleDone = false;
let settingsValid = false;
let loadDefaultSettings = false;
let settings = {};
let log = [];
let relayLog = [];
let localTimeStr = "init";
let epochTime = 0;
let getPriceCommand = false;
let noTimeErrorShown = false;
let porssiStatus = {
  version: "1.1.0",
  started: -1,
  alv: -1,
  lastPrice: -1,
  lastCheckedEpoch: 0,
  lastCheckedTimeStr: "",
  lastCheckResultStr: "",
  relayOnReq: false,
  mode: -1,
  lastRelayChangedEpoch: 0,
  infoStr: "Odotetaan ensimmäistä tarkistusta...",
  infoData: null
};

//---- Helpers ----
function isDefined(v) {
  return typeof (v) !== 'undefined';
}

function epochToDate(epochTimeIn, timezone, daylightSavingTime, override) {
  if (epochTimeIn === null || epochTimeIn === undefined) {
    epochTimeIn = 0;
  }

  let secondsInMinute = 60;
  let secondsInHour = secondsInMinute * 60;
  let secondsInDay = secondsInHour * 24;
  let secondsInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let secondsInYear = 0;
  let leepseconds = 0;
  let epochTime = epochTimeIn + (timezone * secondsInHour);
  let dayOfWeek = (Math.floor(epochTime / secondsInDay) + 4) % 7;
  let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  for (let i = 0; i < 12; i++) {
    secondsInYear += secondsInMonth[i] * secondsInDay;
  }

  let years = Math.floor(epochTime / secondsInYear) + 1970;
  for (let i = 1970; i < years; i++) {
    leepseconds += i % 400 === 0 || (i % 100 !== 0 && i % 4 === 0) ? secondsInDay : 0;
  }

  let remainder = (epochTime % secondsInYear) - leepseconds;
  if (remainder < 0) {
    years--;
    remainder += secondsInYear;
  }

  let leep = years % 400 === 0 || (years % 100 !== 0 && years % 4 === 0);
  let months = 0;
  while (remainder >= (secondsInMonth[months] * secondsInDay) + (months === 1 && leep ? secondsInDay : 0)) {
    remainder = (remainder - secondsInMonth[months] * secondsInDay) - (months === 1 && leep ? secondsInDay : 0);
    months++;
  }

  let days = Math.floor(remainder / secondsInDay);
  remainder = remainder % secondsInDay;

  if (daylightSavingTime && months >= 2 && months <= 9 && !(months === 2 && (dayOfWeek + 31 - days) > 7) && !(months === 9 && (dayOfWeek + 31 - days) < 7)) {
    return epochToDate(epochTimeIn, timezone + 1, false, override);
  }

  let hours = Math.floor(remainder / secondsInHour);
  remainder = remainder % secondsInHour;

  let minutes = Math.floor(remainder / secondsInMinute);
  let seconds = remainder % secondsInMinute;
  let tz = timezone === 0 ? "Z" : timezone > 9 ? ("+" + JSON.stringify(timezone) + "00") : timezone > 0 ? ("+0" + JSON.stringify(timezone) + "00") : timezone < -9 ? (JSON.stringify(timezone) + "00") : ("-0" + JSON.stringify(Math.abs(timezone)) + "00");

  if (isDefined(override)) {
    if (isDefined(override.hour))
      hours = override.hour;

    if (isDefined(override.min))
      minutes = override.min;

    if (isDefined(override.sec))
      seconds = override.sec;
  }

  let res = {
    epoch: epochTimeIn,
    year: years,
    yearStr: JSON.stringify(years),
    month: months + 1,
    monthStr: (months + 1 < 10 ? "0" : "") + JSON.stringify(months + 1),
    day: days + 1,
    dayStr: (days + 1 < 10 ? "0" : "") + JSON.stringify(days + 1),
    hour: hours,
    hourStr: (hours + 1 < 10 ? "0" : "") + JSON.stringify(hours),
    minute: minutes,
    minuteStr: (minutes + 1 < 10 ? "0" : "") + JSON.stringify(minutes),
    second: seconds,
    secondStr: (seconds + 1 < 10 ? "0" : "") + JSON.stringify(seconds),
    dayOfWeek: dayOfWeek,
    dayOfWeekName: daysOfWeek[dayOfWeek],
    date: JSON.stringify(years) + "-" + (months + 1 < 10 ? "0" : "") + JSON.stringify(months + 1) + "-" + (days + 1 < 10 ? "0" : "") + JSON.stringify(days + 1) + "T" + (hours + 1 < 10 ? "0" : "") + JSON.stringify(hours) + ":" + (minutes + 1 < 10 ? "0" : "") + JSON.stringify(minutes) + ":" + (seconds + 1 < 10 ? "0" : "") + JSON.stringify(seconds) + tz,
  };

  return res;
}

//Splits input string to array with given divider
function splitStr(str, divider) {
  let res = [];
  let temp = "";

  for (let i = 0; i < str.length; i++) {

    if (str[i] === divider) {
      res.push(temp);
      temp = "";
    } else if (i === str.length - 1) {
      temp = temp + str[i];
      res.push(temp);
      temp = "";
    } else {
      temp = temp + str[i];
    }
  }
  return res;
}

//Parses HTTP request parameters (key=value&key2=value2) to array of objects
function parseParams(params) {
  let res = {};
  let splitted = splitStr(params, "&");

  for (let i = 0; i < splitted.length; i++) {
    let pair = splitStr(splitted[i], "=");

    res[pair[0]] = pair[1];
  }

  return res;
}
function addLogLine(str) {
  console.log(localTimeStr + ": " + str);
  log.push({
    ts: epochTime === null ? 0 : epochTime,
    str: str
  });

  if (log.length >= MAX_LOG_LINES) {
    log.splice(0, 1);
  }
}

function addRelayLogLine(desc, relayOn, price) {
  console.log(localTimeStr + ": RELAY - " + JSON.stringify(desc));
  relayLog.push({
    ts: epochTime === null ? 0 : epochTime,
    desc: desc,
    on: relayOn,
    price: price
  });
  if (relayLog.length >= MAX_RELAY_LOG_LINES) {
    relayLog.splice(0, 1);
  }
}

//---- Logic ----
function checkSettings() {
  let save = 0;

  for (let prop in DEFAULT_SETTINGS) {
    if (settings[prop] === undefined) {
      addLogLine("HUOM: Asetusta '" + prop + "' ei löytynyt - alustetaan arvoon: " + JSON.stringify(DEFAULT_SETTINGS[prop]));
      settings[prop] = DEFAULT_SETTINGS[prop];
      save++;
    }
  }

  if (save > 0) {
    Shelly.call("KVS.Set", { key: "porssi-settings", value: settings }, function (res) {
      addLogLine("Asetukset tallennettu (jotain asetuksia puuttui): " + JSON.stringify(res));
    })
  }
}

function runClockUpdater() {
  Shelly.call('Sys.GetStatus', {}, function (status, error_code, error_message, userdata) {
    let success = true;

    if (status === null || status === undefined || error_code !== 0) {
      //Call failed
      success = false;
      addLogLine("VIRHE - Sys.GetStatus-kutsu epäonnistui. Virhekoodi " + JSON.stringify(error_code) + ": " + error_message);

    } else {
      let hours = "??";
      let minutes = "??";

      if (status.time !== null) {
        hours = JSON.stringify(JSON.parse(status.time.slice(0, 2)));
        minutes = JSON.stringify(JSON.parse(status.time.slice(3, 5)));

        if (hours.length < 2) {
          hours = "0" + hours;
        }
        if (minutes.length < 2) {
          minutes = "0" + minutes;
        }
      }

      localTimeStr = hours + "." + minutes;
      epochTime = status.unixtime;
    }

    if (epochTime === null || (success && status.time === null)) {
      //No internet connection - unknown time
      if (!noTimeErrorShown) {
        addLogLine("VIRHE - Kellonaika ei ole tiedossa - onko internet-yhteys OK?");
        noTimeErrorShown = true;
      }

    } else if (!initDone) {
      initDone = true;
      let dt = epochToDate(epochTime, 0, false);
      porssiStatus.started = epochTime;
      addLogLine("Järjestelmä käynnistetty - kellonaika ja tila selvillä. UTC-aika: " + dt.date);

    } else if (noTimeErrorShown) {
      //Error shown but time is now ok
      let dt = epochToDate(epochTime, 0, false);
      addLogLine("Kellonaika on nyt tiedossa. UTC-aika: " + dt.date);
      noTimeErrorShown = false;
    }

    Timer.set(5000, false, runClockUpdater);
  });
}

function UpdateSettings() {
  if (loadDefaultSettings) {
    Shelly.call("KVS.Set", { key: "porssi-settings", value: DEFAULT_SETTINGS }, function (res) {
      addLogLine("Asetukset alustettu tehdasasetuksilla: " + JSON.stringify(res));
      loadDefaultSettings = false;

      if (!firstCycleDone) {
        porssiMain();
      }
      settingsValid = true;
    });

  } else if (!settingsValid) {
    addLogLine("Asetukset eivät ole ajan tasalla -> päivitetään...");

    Shelly.call('KVS.GetMany', { match: "porssi-settings" }, function (res) {
      if (res.items["porssi-settings"] === undefined) {
        addLogLine("Asetuksia ei löytynyt - alustetaan tehdasasetuksilla");
        loadDefaultSettings = true;
        UpdateSettings();
      } else {
        settings = res.items["porssi-settings"].value;
        checkSettings();
        addLogLine("Asetukset ladattu: " + JSON.stringify(settings));

        if (!firstCycleDone) {
          porssiMain();
        }
      }

      settingsValid = true;
    });
  }
}

function buildApiRequest() {
  if (settings.dataSource === 0 && settings.mode === 1) {
    //elering.ee - price  
    return {
      url: "https://dashboard.elering.ee/api/nps/price/FI/current",
      timeout: 20,
      ssl_ca: "*"
    };

  } else if (settings.dataSource === 0 && settings.mode === 2) {
    //elering.ee - cheapest hours

    //We need to know epoch time for this
    if (epochTime === null || epochTime < 100000) {
      addLogLine("Kellonaika ei ole tiedossa, hintatietoja ei voida hakea");

      return {
        url: undefined
      };
    }
    //Creating timestamps for day start + day end
    let override = {
      hour: 0,
      min: 0,
      sec: 0
    };
    let start = epochToDate(epochTime, 0, false, override);

    override = {
      hour: 23,
      min: 59,
      sec: 0
    };
    let end = epochToDate(epochTime, 0, false, override);

    return {
      url: "https://dashboard.elering.ee/api/nps/price?start=" + start.date + "&end=" + end.date,
      timeout: 20,
      ssl_ca: "*"
    };

  }
}

function porssiMain() {
  firstCycleDone = true;

  //If this hour has already been checked, do nothing (skip xx:00 for clock error)
  if (porssiStatus.lastCheckedTimeStr.slice(0, 2) !== localTimeStr.slice(0, 2) && localTimeStr.slice(3, 5) !== "00") {
    addLogLine("Nykyisen tunnin hintaa ei ole vielä tarkistettu -> tarkistetaan");
    getPriceCommand = true;
  }

  if (getPriceCommand) {
    runPorssiCheck();
  }
}

function runPorssiCheck() {
  if (settings.mode === 0) {
    //Mode: Disabled -> manual output
    if (settings.manualCmd) {
      porssiStatus.lastCheckResultStr = "Käsiohjaus -> päälle";
      Shelly.call("Switch.Set", "{ id:0, on:true}", null, null);
    } else {
      porssiStatus.lastCheckResultStr = "Käsiohjaus -> pois";
      Shelly.call("Switch.Set", "{ id:0, on:false}", null, null);
    }

    if (porssiStatus.relayOnReq !== settings.manualCmd) {
      //Changed
      if (settings.manualCmd) {
        addRelayLogLine(RELAY_DESC.MANUAL_ON, true, -1);
      } else {
        addRelayLogLine(RELAY_DESC.MANUAL_OFF, false, -1);
      }
      porssiStatus.lastRelayChangedEpoch = epochTime;
    }

    porssiStatus.lastPrice = -1;
    porssiStatus.alv = settings.alv;
    porssiStatus.infoStr = "";
    porssiStatus.relayOnReq = settings.manualCmd;
    porssiStatus.lastCheckedEpoch = epochTime;
    porssiStatus.lastCheckedTimeStr = localTimeStr;
    porssiStatus.mode = settings.mode;

  } else if (settings.mode === 1 || settings.mode === 2) {
    let req = buildApiRequest();
    if (req.url !== undefined) {
      addLogLine("Haetaan hintatiedot osoitteesta: " + req.url);
      Shelly.call("HTTP.GET", req, HandleApiResponse);
    } else {
      addLogLine("Virhe - virheellinen URL");
      HandleApiResponse(null);
    }
  } else {
    addLogLine("Virhe - tuntematon ohjaustapa: '" + JSON.stringify(settings.mode) + "'");
  }
}

function HandleApiResponse(result) {
  //console.log("API RESPONSE: " + JSON.stringify(result));
  let success = false;
  let relayOnReq = false;
  let relayLogDesc = RELAY_DESC.UNKNOWN;

  porssiStatus.alv = settings.alv;

  if (result === null || result === undefined) {
    success = false;

  } else if (settings.dataSource === 0 && settings.mode === 1) {
    //elering.ee - price  
    if (result.code === 200) {
      let res = JSON.parse(result.body);

      if (res.success === true) {
        success = true;
        let price = (res.data[0].price / 10.0) * (1.0 + settings.alv);
        porssiStatus.lastPrice = price;

        if (price < settings.priceLimit) {
          relayOnReq = true;
          porssiStatus.lastCheckResultStr = "Hinta alle rajan -> päälle";
          relayLogDesc = RELAY_DESC.PRICE_BELOW_OUTPUT_ON;
        } else {
          relayOnReq = false;
          porssiStatus.lastCheckResultStr = "Hinta yli rajan -> pois";
          relayLogDesc = RELAY_DESC.PRICE_ABOVE_OUTPUT_OFF;
        }
        porssiStatus.infoData = {
          price: price,
          limit: settings.priceLimit
        };
        porssiStatus.infoStr = "#priceInfo";
      }
    }
  } else if (settings.dataSource === 0 && settings.mode === 2) {
    //elering.ee - cheapest hours
    if (result.code === 200) {
      let res = JSON.parse(result.body);

      if (res.success === true) {
        let data = res.data.fi;

        //Find current hour price
        let price = -1;
        for (let i = 0; i < data.length; i++) {
          if (epochTime >= data[i].timestamp && epochTime < data[i].timestamp + 60 * 60) {
            price = (data[i].price / 10.0) * (1.0 + settings.alv);
            break;
          }
        }
        porssiStatus.lastPrice = price;

        //Order by price
        let j = 0;

        for (let i = 1; i < data.length; i++) {
          let temp = data[i];
          for (j = i - 1; j >= 0 && temp.price < data[j].price; j--) {
            data[j + 1] = data[j];
          }
          data[j + 1] = temp;
        }


        let cheapHours = data.splice(0, settings.numberOfHours);
        porssiStatus.infoData = cheapHours;
        porssiStatus.infoStr = "#cheapest";

        //Calculating correct price
        //No longer epoch -> date conversion as it's too intensive operation
        for (let i = 0; i < cheapHours.length; i++) {
          cheapHours[i].price = (cheapHours[i].price / 10.0) * (1.0 + settings.alv);
        }

        //Is current hour in the cheapest?
        relayOnReq = false;
        porssiStatus.lastCheckResultStr = "Ei ole halvimpia tunteja -> pois";
        relayLogDesc = RELAY_DESC.NOT_CHEAPEST_OUTPUT_OFF;

        for (let i = 0; i < cheapHours.length; i++) {
          if (epochTime >= cheapHours[i].timestamp && epochTime < cheapHours[i].timestamp + 60 * 60) {
            relayOnReq = true;
            porssiStatus.lastCheckResultStr = "On halvimpia tunteja -> päälle";
            relayLogDesc = RELAY_DESC.IS_CHEAPEST_OUTPUT_ON;
            break;
          }
        }

        //Check also the hard limit
        if (!relayOnReq && price < settings.alwaysOnPriceLimit) {
          relayOnReq = true;
          porssiStatus.lastCheckResultStr = "Ei ole halvimpia mutta alle rajan -> päälle";
          relayLogDesc = RELAY_DESC.NOT_CHEAPEST_PRICE_BELOW_OUTPUT_ON;
          porssiStatus.infoStr = "Hinta nyt: " + JSON.stringify(price) + " c/kWh, raja: " + JSON.stringify(settings.alwaysOnPriceLimit) + " c/kWh";
          porssiStatus.infoStr += "<br>#cheapest";
        }

        success = true;
      }
    }
  }


  if (success === false && epochTime !== null) {
    //Something failed - backup hours?
    porssiStatus.lastPrice = -1;
    porssiStatus.infoStr = "Onko internet-yhteys ok?";
    let isBackupHour = false;
    let hour = localTimeStr.slice(0, 2);

    for (let i = 0; i < settings.backupHours.length; i++) {
      if (settings.backupHours[i] === hour || "0" + settings.backupHours[i] === hour) {
        isBackupHour = true;
        break;
      }
    }
    relayOnReq = isBackupHour;

    if (isBackupHour) {
      relayLogDesc = RELAY_DESC.CONN_ERROR_IS_BACKUP_HOUR;
      porssiStatus.lastCheckResultStr = "Yhteysvirhe ja on varmuustunti -> päälle";
    } else {
      relayLogDesc = RELAY_DESC.CONN_ERROR_NOT_BACKUP_HOUR;
      porssiStatus.lastCheckResultStr = "Yhteysvirhe ja ei varmuustunti -> pois";
    }

  } else if (!success && epochTime === null) {
    relayOnReq = settings.errorCmd;
    porssiStatus.lastPrice = -1;
    porssiStatus.infoStr = "Onko internet-yhteys ok?";

    if (settings.errorCmd) {
      relayLogDesc = RELAY_DESC.CONN_ERROR_NO_TIME_OUTPUT_ON;
      porssiStatus.lastCheckResultStr = "Yhteysvirhe eikä kello tiedossa -> päälle";
    } else {
      porssiStatus.lastCheckResultStr = "Yhteysvirhe eikä kello tiedossa -> pois";
      relayLogDesc = RELAY_DESC.CONN_ERROR_NO_TIME_OUTPUT_OFF;
    }
  }

  if (relayOnReq) {
    addLogLine("Tarkistus tehty - asetetaan releohjaus päälle");
    Shelly.call("Switch.Set", "{ id:0, on:true}", null, null);
  } else {
    addLogLine("Tarkistus tehty - asetetaan releohjaus pois");
    Shelly.call("Switch.Set", "{ id:0, on:false}", null, null);
  }

  addLogLine(porssiStatus.lastCheckResultStr);

  if (success) {
    //If success, we shouldn't get the price for this hour anymore
    //Otherwise we should try again
    getPriceCommand = false;
  }

  if (porssiStatus.relayOnReq !== relayOnReq) {
    //Changed
    addRelayLogLine(relayLogDesc, relayOnReq, porssiStatus.lastPrice);
    porssiStatus.lastRelayChangedEpoch = epochTime;
  }

  porssiStatus.relayOnReq = relayOnReq;
  porssiStatus.lastCheckedEpoch = epochTime;
  porssiStatus.lastCheckedTimeStr = localTimeStr;
  porssiStatus.mode = settings.mode;
}

function onServerRequest(request, response) {
  //Parsing parameters (key=value&key2=value2) to object
  let params = parseParams(request.query);

  let MIME_TYPE = "";
  let DATA = "";
  let GET = request.method === "GET";
  response.code = 200; //default

  if (GET && (params.req === "index.html" || params.req === "" || params.req === undefined)) {
    MIME_TYPE = "text/html";
    DATA = '<!DOCTYPE html> <html lang="en"> <head> <meta charset="utf-8"> <title>Pörssisähkö</title> <link rel="stylesheet" href="style.css"> <link rel="stylesheet" href="?req=style.css"> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> </head> <body> <div id="modal"> <div id="modal-t">asdad</div> <div id="modal-c">Modal</div> <div id="modal-b"><input type="button" id="btn-modal" value="OK"></div> </div> <div> <div class="wrapper"> <div class="top"> <div id="title">Pörssisähkö</div> <div class="copyright"> <div>&copy; <a href="https://jisotalo.github.io/" target="_blank">Jussi Isotalo</a></div> </div> </div> <div id="loading"> <div class="loadingspinner"></div> <div id="loading-text">Ladataan skriptejä</div> </div> <div class="tabs"> <div class="tab"> <input type="radio" name="css-tabs" id="tab-status" checked class="tab-switch"> <label for="tab-status" class="tab-label">Tila</label> <div class="tab-content" id="content-status"></div> </div> <div class="tab"> <input type="radio" name="css-tabs" id="tab-settings" class="tab-switch"> <label for="tab-settings" class="tab-label">Asetukset</label> <div class="tab-content" id="content-settings"></div> </div> <div class="tab"> <input type="radio" name="css-tabs" id="tab-wifi" class="tab-switch"> <label for="tab-wifi" class="tab-label">Wifi</label> <div class="tab-content" id="content-wifi"></div> </div> <div class="tab"> <input type="radio" name="css-tabs" id="tab-log" class="tab-switch"> <label for="tab-log" class="tab-label">Loki</label> <div class="tab-content" id="content-log"></div> </div> <div class="tab"> <input type="radio" name="css-tabs" id="tab-help" class="tab-switch"> <label for="tab-help" class="tab-label">Ohje</label> <div class="tab-content" id="content-help"></div> </div> </div> </div> </div> <script> let debug = () => { }; const qs = (s) => document.querySelector(s); const me = () => { let s = new Error().stack; if (s) { s = s.split(String.fromCharCode(10)); } if (s.length > 0) { let str = ""; if (s[4] && s[4].trim().split(" ")[1]) { str += `/${s[4].trim().split(" ")[1]}`; } if (s[3] && s[3].trim().split(" ")[1]) { str += `/${s[3].trim().split(" ")[1]}`; } if (s[2] && s[2].trim().split(" ")[1]) { str += `/${s[2].trim().split(" ")[1]}`; } return `${str}:`; } return `Unknown stack:`; }; const toggleLoading = (str) => { qs("#loading").style.visibility = str !== undefined ? "visible" : "hidden"; qs("#loading-text").innerText = str; }; const openTab = (tab) => { if (tab === undefined || tab === "") { return; } const e = qs("#" + tab); if (e) { e.checked = true; } }; const showModal = (title, html, cb) => { qs("#modal-t").innerHTML = title; qs("#modal-c").innerHTML = html; qs("#modal").style.visibility = "visible"; qs(".wrapper").style.opacity = 0.2; qs(".wrapper").style.pointerEvents = "none"; const click = () => { qs(".wrapper").style.opacity = 1; qs("#modal").style.visibility = "hidden"; qs(".wrapper").style.pointerEvents = "auto"; qs("#btn-modal").removeEventListener("click", click); if (cb) { cb(); } }; qs("#btn-modal").addEventListener("click", click); }; </script> <script src="script.js"></script> <script src="?req=script.js"></script> </body> </html>';

  } else if (GET && params.req === "script.js") {
    MIME_TYPE = "text/javascript";
    DATA = 'const DEV="undefined"==typeof IS_PROD,LOG=DEV,BASE_URL=!0===DEV?"http://192.168.5.15":"",BASE_SCRIPT_URL=!0===DEV?BASE_URL+"/script/1/porssi":"",setDebug=dbg=>{debug=dbg?console.log.bind(window.console):()=>{}};setDebug(LOG),window.addEventListener("error",(function(e){console.error("Error at line:",e.lineno)}),!1),window.onload=async()=>{openTab(window.location.hash.substring(window.location.hash.indexOf("#")+1)),await populateDynamicData("content-status.html","#content-status"),await populateDynamicData("content-settings.html","#content-settings"),await populateDynamicData("content-wifi.html","#content-wifi"),await populateDynamicData("content-log.html","#content-log"),await populateDynamicData("content-welcome.html","#content-help")},document.querySelectorAll(".tab-switch").forEach(e=>e.addEventListener("change",e=>{window.location.hash=e.target.id}));const evalContainerScriptTags=elementId=>{debug(me(),"eval running for",elementId);for(var scripts=qs(elementId).querySelectorAll("script"),i=0;i<scripts.length;i++)scripts[i].innerText?eval(scripts[i].innerText):fetch(scripts[i].src).then((function(data){data.text().then((function(r){eval(r)}))})),scripts[i].parentNode.removeChild(scripts[i])},populateDynamicData=async(url,containerId)=>{try{DEV||(url=`${BASE_SCRIPT_URL}?req=${url}`),debug(me(),"fetching",url,"for",containerId);const res=await getData(url,!1);res.success?(qs(containerId).innerHTML=res.data,evalContainerScriptTags(containerId)):qs(containerId).innerHTML=`Error getting data: ${res.statusText}`,debug(me(),"done for",containerId)}catch(err){console.error("populateDynamicData(): Error happened: ",err)}},getData=async(url,isJson=!0)=>{try{const res=await fetch(url);if(res.ok){let data=null;return 204!==res.status&&(data=isJson?await res.json():await res.text()),debug(me(),`Fetching ${url} done. Status code: ${res.status}`),{success:!0,statusCode:res.status,statusText:res.statusText,data:data}}return console.error(`Failed to fetch ${url}: ${res.statusText} (${await res.text()})`),{success:!1,statusCode:res.status,statusText:`Failed to fetch ${url}: ${res.statusText} (${await res.text()})`,data:null}}catch(err){return console.error(`Failed to fetch ${url}: (${JSON.stringify(err)})`),{success:!1,statusCode:-1,statusText:`Failed to fetch ${url}: (${JSON.stringify(err)})`,data:null}}},formatDate=value=>{let date=null;return date="string"==typeof value?new Date(value):value,`${date.getDate().toString().padStart(2,"0")}.${(date.getMonth()+1).toString().padStart(2,"0")}.${date.getFullYear()}`},formatTime=(value,showSeconds=!0,showMilliseconds=!1)=>{let date=null;return date="string"==typeof value?new Date(value):value,`${date.getHours().toString().padStart(2,"0")}:${date.getMinutes().toString().padStart(2,"0")}${showSeconds?`:${date.getSeconds().toString().padStart(2,"0")}`:""}${showMilliseconds?`.${date.getMilliseconds().toString().padStart(3,"0")}`:""}`},formatDateTime=(value,showSeconds=!0,showMilliseconds=!1)=>`${formatDate(value)} ${formatTime(value,showSeconds,showMilliseconds)}`;';
    DATA = 'const IS_PROD = true;' + DATA;

  } else if (GET && params.req === "style.css") {
    MIME_TYPE = "text/css";
    DATA = '*{box-sizing:border-box}body{background:#2c3e50;color:#ecf0f1;line-height:1.4em;font-size:.9em;font-family:Verdana,Geneva,Tahoma,sans-serif}a{color:#ecf0f1}.wrapper{max-width:50rem;width:100%;margin:0 auto}#title{font-size:1.4em;margin-bottom:5px}.tabs{position:relative;background:#1abc9c}.tabs::after,.tabs::before{content:"";display:table}.tabs::after{clear:both}.tab{float:left}.tab-switch{display:none}.tab-label{position:relative;display:block;line-height:2.75em;height:3em;padding:0 1.618em;background:#1abc9c;border-right:.125rem solid #16a085;color:#fff;cursor:pointer;top:0;transition:all .25s}.tab-label:hover{top:-.25rem;transition:top .25s}.tab-content{width:100%;min-height:12.5rem;position:absolute;z-index:1;top:2.75em;left:0;padding:1.618rem;background:#fff;color:#2c3e50;border-bottom:.25rem solid #bdc3c7;opacity:0;transition:all .35s}.tab-switch:checked+.tab-label{background:#fff;color:#2c3e50;border-bottom:0;border-right:.125rem solid #fff;transition:all .35s;z-index:1;top:-.0625rem}.tab-switch:checked+label+.tab-content{z-index:2;opacity:1;transition:all .35s}.top{display:grid;grid-template-columns:1fr auto}.copyright{display:flex}.copyright>div{font-size:smaller;align-self:flex-end}#loading{z-index:1000;position:fixed;margin:auto;top:20vh;left:0;right:0;width:20em;border:5px solid #1abc9c;background:#2c3e50;padding:.5em;text-align:center}.loadingspinner{margin-left:auto;margin-right:auto;margin-bottom:5px;pointer-events:none;width:2.5em;height:2.5em;border:.4em solid transparent;border-color:#1abc9c;border-top-color:#fff;border-radius:50%;animation:loadingspin 1s linear infinite}.spin-sm{pointer-events:none;width:1rem;height:1rem;border:.1rem solid transparent;border-color:#1abc9c;border-top-color:#fff;border-radius:50%;animation:loadingspin 1s linear infinite}@keyframes loadingspin{100%{transform:rotate(360deg)}}td.bg,td.title{font-weight:700;vertical-align:top}@media(max-width:480px){table.m td{display:block;width:100%!important}table.m td.bg,table.m td.title{margin-left:0;border-top:0;border-bottom:0}table.m tr:first-child{border-top:1px #000 solid}}textarea{white-space:pre}table{border-spacing:0;border-collapse:collapse;width:100%}td.bg{background:#1abc9c}td{border:1px #000 solid;padding:5px}.tc{text-align:center}td.fit{width:1%;white-space:nowrap}.h{display:none}.w180{width:180px}txt-green{color:green}txt-red{color:red}#modal{z-index:2000;position:fixed;margin:auto;top:5vh;left:0;right:0;width:40rem;border:2px solid #2c3e50;color:#000;background:#fff;visibility:hidden}#modal-t{background:#1abc9c;text-align:center;line-height:normal;font-size:1.1rem;padding:2px}#modal-c{padding:5px;min-height:10em;word-break:break-word}#modal-b{padding:5px;text-align:center}';

  } else if (GET && params.req === "content-wifi.html") {
    MIME_TYPE = "text/html";
    DATA = '<form id="wifi-config-form"> <table class="m"> <tr> <td class="bg w180">Tila:</td> <td id="wifi-1-status-state"></td> </tr> <tr> <td class="bg">IP-osoite:</td> <td id="wifi-1-status-ip"></td> </tr> <tr> <td class="bg">Verkko:</td> <td id="wifi-1-status-ssid"></td> </tr> </table> <br> <table class="m"> <tr> <td class="bg w180">Wifi käytössä</td> <td> <input type="checkbox" id="wifi-1-enable"> </td> </tr> <tr> <td class="bg">Wifi-verkko</td> <td> <input type="text" id="wifi-1-ssid"> <input type="hidden" id="wifi-1-ssid-orig"> <input type="button" value="Valitse listalta" id="btn-ssid-select"> <div class="h" id="ssid-list-container"> <br> <select id="ssid-list"> <option value=""> </option> </select> </div> </td> </tr> <tr> <td class="bg">Salasana</td> <td> <input type="password" id="wifi-1-pass" value="_default_"> </td> </tr> <tr> <td class="bg">Lisäasetukset</td> <td> <input type="button" value="Näytä lisäasetukset" id="btn-wifi-ip-settings" /> <table class="m h" id="table-wifi-ip-settings" style="margin-top:1rem;"> <tr> <td class="bg">DHCP käytössä (autom. IP):</td> <td> <input type="checkbox" id="wifi-1-dhcp"> </td> </tr> <tr> <td class="bg">IP-osoite:</td> <td> <input type="text" id="wifi-1-ip"> </td> </tr> <tr> <td class="bg">Aliverkon peite:</td> <td> <input type="text" id="wifi-1-mask"> </td> </tr> <tr> <td class="bg">Yhdyskäytävä:</td> <td> <input type="text" id="wifi-1-gw"> </td> </tr> <tr> <td class="bg">Nimipalvelin (DNS):</td> <td> <input type="text" id="wifi-1-nameserver"> </td> </tr> </table> </td> </tr> </table> <br> <table class="m"> <tr> <td class="bg w180">Tukiasema käytössä</td> <td> <input type="checkbox" id="wifi-ap-enable"> </td> </tr> <tr> <td class="bg">Tukiaseman verkko</td> <td> <input type="text" id="wifi-ap-ssid" disabled> </td> </tr> <tr> <td class="bg">Verkon salasana</td> <td> <input type="password" id="wifi-ap-pass"> <br> <input type="checkbox" id="wifi-ap-is-open"> <label for="wifi-ap-is-open">Ei salasanaa (avoin)</label> </td> </tr> </table> <br> <div class="tc"> <input type="submit" value="Tallenna asetukset"> </div> </form> <script src="content-wifi.js"></script> <script src="?req=content-wifi.js"></script>';

  } else if (GET && params.req === "content-wifi.js") {
    MIME_TYPE = "text/javascript";
    DATA = 'const showWifiList=async()=>{qs("#ssid-list").innerText=null,await populateWifiList(),qs("#ssid-list-container").style.display="block"},wifiSsidChanged=e=>{qs("#wifi-1-ssid").value=e.target.value},populateWifiList=async()=>{toggleLoading("Haetaan wifi-verkkoja...");const res=await getData(`${BASE_URL}/rpc/Wifi.Scan`);if(res.success){const data=res.data;debug(me(),"wifis",data),qs("#ssid-list").add(new Option(`Valitse (${data.results.length} verkkoa löytyi`,"")),qs("#ssid-list").add(new Option("------",""));for(let ssid of data.results)qs("#ssid-list").add(new Option(`${ssid.ssid} (${ssid.rssi} dBms)`,ssid.ssid))}else qs("#ssid-list").add(new Option("error",""));toggleLoading()},wifiStatusToStr=s=>{switch(s){case"got ip":return"Yhdistetty (IP saatu)";case"disconnected":return"Ei yhdistetty";case"connecting":return"Yhdistetään";case"connected":return"Yhdistetty";default:return s}},getWifiConfig=async()=>{toggleLoading("Ladataan wifi-asetuksia...");let res=await getData(`${BASE_URL}/rpc/Wifi.GetStatus`);if(res.success){const data=res.data;debug(me(),"wifi status:",data),qs("#wifi-1-status-state").innerHTML=wifiStatusToStr(data.status),qs("#wifi-1-status-ip").innerHTML=data.sta_ip,qs("#wifi-1-status-ssid").innerHTML=data.ssid}else debug(me(),"wifi status error:",res);if(res=await getData(`${BASE_URL}/rpc/Wifi.GetConfig`),res.success){const data=res.data;debug(me(),"wifi config:",data),qs("#wifi-1-enable").checked=data.sta.enable?"checked":"",qs("#wifi-1-ssid").value=data.sta.ssid,qs("#wifi-1-ssid-orig").value=data.sta.ssid,qs("#wifi-1-dhcp").checked="dhcp"===data.sta.ipv4mode?"checked":"",qs("#wifi-1-ip").value=data.sta.ip,qs("#wifi-1-mask").value=data.sta.netmask,qs("#wifi-1-gw").value=data.sta.gw,qs("#wifi-1-nameserver").value=data.sta.nameserver,qs("#wifi-ap-enable").checked=data.ap.enable?"checked":"",qs("#wifi-ap-ssid").value=data.ap.ssid,qs("#wifi-ap-is-open").checked=data.ap.is_open?"checked":"",qs("#wifi-ap-pass").value=data.ap.is_open?"":"_default_",toggleWifiDhcp(),toggleWifiApOpen()}else debug(me(),"wifi config error:",res);toggleLoading()},toggleWifiDhcp=()=>{const dhcp=qs("#wifi-1-dhcp").checked;qs("#wifi-1-ip").disabled=dhcp,qs("#wifi-1-mask").disabled=dhcp,qs("#wifi-1-gw").disabled=dhcp,qs("#wifi-1-nameserver").disabled=dhcp},toggleWifiApOpen=()=>{qs("#wifi-ap-pass").disabled=qs("#wifi-ap-is-open").checked},setWifiConfig=async e=>{e.preventDefault();let config={sta:{enable:qs("#wifi-1-enable").checked,ipv4mode:qs("#wifi-1-dhcp").checked?"dhcp":"static",ip:qs("#wifi-1-ip").value,netmask:qs("#wifi-1-mask").value,gw:qs("#wifi-1-gw").value,nameserver:qs("#wifi-1-nameserver").value},ap:{enable:qs("#wifi-ap-enable").checked,is_open:qs("#wifi-ap-is-open").checked}};qs("#wifi-1-ssid-orig").value===qs("#wifi-1-ssid").value&&"_default_"===qs("#wifi-1-pass").value||(config.sta.ssid=qs("#wifi-1-ssid").value,config.sta.pass=qs("#wifi-1-pass").value),""===qs("#wifi-ap-pass").value||config.ap.is_open||"_default_"===qs("#wifi-ap-pass").value||(config.ap.pass=qs("#wifi-ap-pass").value,config.ap.ssid=qs("#wifi-ap-ssid").value),debug(me(),"wifi settings to save:",config),toggleLoading("Tallennetaan wifi-asetuksia...");const res=await getData(`${BASE_URL}/rpc/Wifi.SetConfig?config=${JSON.stringify(config)}`);res.success?showModal("Asetukset tallennettu","Asetukset tallennettu - muutokset otetaan pian käyttöön."):config.ap.pass?showModal("Virhe",`Tallentaminen epäonnistui. Tarkista että tiedot ovat oikein ja varmista että tukiaseman salasana on tarpeeksi pitkä.<br><br>Virhetiedot: ${res.statusText})`):showModal("Virhe",`Tallentaminen epäonnistui. Tarkista että tiedot ovat oikein.<br><br>Virhetiedot: ${res.statusText})`),toggleLoading(),await getWifiConfig()};qs("#wifi-config-form").addEventListener("submit",setWifiConfig),qs("#btn-ssid-select").addEventListener("click",showWifiList),qs("#ssid-list").addEventListener("change",wifiSsidChanged),qs("#wifi-1-dhcp").addEventListener("change",toggleWifiDhcp),qs("#wifi-ap-is-open").addEventListener("change",toggleWifiApOpen),qs("#btn-wifi-ip-settings").addEventListener("click",e=>{const style=qs("#table-wifi-ip-settings").style;style.display="block"===style.display?"none":"block"});const wifiOnLoad=async()=>{debug(me(),"onload begin"),await getWifiConfig(),debug(me(),"onload done")};wifiOnLoad();';

  } else if (GET && params.req === "content-status.html") {
    MIME_TYPE = "text/html";
    DATA = '<div> <table class="m"> <tr> <td class="bg w180">Ohjauksen tila:</td> <td> <b><span id="status-relayOnReq"></span></b> <div id="status-loading" class="spin-sm" style="float:right;"></div> <div style="clear: botd;"></div> </td> </tr> <tr> <td class="bg">S&auml;hk&ouml;n hinta nyt:</td> <td id="status-priceInfo"></td> </tr> <tr> <td class="bg">Ohjaustyyppi:</td> <td id="status-mode"></td> </tr> <tr> <td class="bg">Viime tulos:</td> <td id="status-lastCheckResultStr"></td> </tr> <tr> <td class="bg">Lis&auml;tiedot:</td> <td id="status-infoStr"></td> </tr> </table> <small> <div id="status-alv"></div> </small> <br> <div style="max-height:190px;overflow-y: scroll;"> <table style="widtd:100%"> <tdead style="position:sticky;inset-block-start:0;"> <tr> <td class="title bg">Aika</td> <td class="title bg">Ohjaus</td> <td class="title bg">Selite</td> </tr> </tdead> <tbody id="status-relay-log"> </tbody> </table> <div id="status-info" class="tc" style="font-size:x-small"></div> </div> </div> <script src="content-status.js"></script> <script src="?req=content-status.js"></script>';

  } else if (GET && params.req === "content-status.js") {
    MIME_TYPE = "text/javascript";
    DATA = 'let latestLogTs=-1,RELAY_DESC={0:"Unknown",1:"Skripti käynnistetty",10:"Yhteysvirhe ja on varmuustunti -> päälle",11:"Yhteysvirhe ja ei varmuustunti -> pois",12:"Yhteysvirhe eikä kello tiedossa -> päälle",13:"Yhteysvirhe eikä kello tiedossa -> pois",20:"Käsiohjaus -> päälle",21:"Käsiohjaus -> pois",30:"Hinta alle hintarajan -> päälle",31:"Hinta yli hintarajan -> päälle",40:"On halvimpia tunteja -> päälle",41:"Ei ole halvimpia tunteja -> pois",42:"Ei ole halvimpia mutta alle rajan -> päälle"};const runStatusUpdater=async()=>{try{await updateStatus(),await updateRelayLog()}catch{}setTimeout(runStatusUpdater,5e3)},updateStatus=async()=>{debug(me(),"Updating status"),qs("#status-loading").style.visibility="visible";try{const res=await getData(`${BASE_SCRIPT_URL}?req=api-status`);if(!res.success)throw new Error(`Yhteysvirhe: ${res.status}`);{const data=res.data;debug(me(),"api-status data:",res.data),qs("#status-relayOnReq").innerHTML=res.data.relayOnReq?"<txt-green>PÄÄLLÄ</txt-green>":"<txt-red>POIS</txt-red>";let modeStr="";switch(data.mode){case 0:modeStr="Käsiohjaus";break;case 1:modeStr="Hintaraja";break;case 2:modeStr="Halvimmat tunnit";break;default:modeStr="Ei tiedossa"}qs("#status-mode").innerHTML=modeStr,qs("#status-priceInfo").innerHTML=res.data.lastPrice>=0?`${res.data.lastPrice.toFixed(2)} c/kWh (päivitetty ${formatTime(new Date(1e3*res.data.lastCheckedEpoch))})`:"Ei tiedossa",qs("#status-lastCheckResultStr").innerHTML=res.data.lastCheckResultStr,qs("#status-info").innerHTML=`Käynnistetty ${formatDateTime(new Date(1e3*res.data.started))} (up: ${(((new Date).getTime()-1e3*res.data.started)/1e3/60/60/24).toFixed("1")} d) - versio ${res.data.version}`,res.data.infoStr.includes("#cheapest")?qs("#status-infoStr").innerHTML=res.data.infoStr.replace("#cheapest",`Halvimmat ${res.data.infoData.length} tuntia 24h aikana ovat:<br>`+res.data.infoData.map((h,i)=>{const date=new Date(1e3*h.timestamp),str=`&nbsp;${date.getDate().toString().padStart(2,"0")}.${(date.getMonth()+1).toString().padStart(2,"0")} ${date.getHours().toString().padStart(2,"0")}:${date.getMinutes().toString().padStart(2,"0")}`;return`${str} (${h.price.toFixed(2)} c/kWh)`}).join("<br>")):"#priceInfo"===res.data.infoStr?qs("#status-infoStr").innerHTML=`Hinta nyt: ${res.data.infoData.price.toFixed(2)} c/kWh - hintaraja: ${res.data.infoData.limit.toFixed(2)} c/kWh`:qs("#status-infoStr").innerHTML=res.data.infoStr,qs("#status-alv").innerHTML=res.data.alv>0?`Hinta sisältää ALV ${(100*res.data.alv).toFixed(0)} %`:""}}catch(err){console.error(me(),"Error:",err),qs("#status-relayOnReq").innerHTML="<txt-red>VIRHE - Tila ei tiedossa</txt-red>",qs("#status-mode").innerHTML="-",qs("#status-priceInfo").innerHTML="-",qs("#status-lastCheckResultStr").innerHTML="-",qs("#status-infoStr").innerHTML="-"}finally{qs("#status-loading").style.visibility="hidden"}},updateRelayLog=async()=>{debug(me(),"Updating relay log");try{const res=await getData(`${BASE_SCRIPT_URL}?req=api-relay-log&last=${latestLogTs}`);if(res.success&&200===res.statusCode){const log=res.data.reverse();latestLogTs=log[0].ts,qs("#status-relay-log").innerHTML="";for(let i=0;i<log.length;i++){const line=log[i];qs("#status-relay-log").innerHTML+=`\n              <tr>\n                <td class="fit">${formatDateTime(new Date(1e3*line.ts))}</td>\n                <td class="fit"><b>${line.on?"<txt-green>PÄÄLLÄ</txt-green>":"<txt-red>POIS</txt-red>"}</b></td>\n                <td>${RELAY_DESC[line.desc]}${line.price>=0?` [${line.price.toFixed(2)} c/kWh]`:""}</td>\n              </tr>\n            `}}else res.success&&204===res.statusCode?debug(me(),"No new data for relay log"):console.error(me(),"Error - failed to read relay log")}catch(err){console.error(me(),"Error - ",err)}},statusOnLoad=async()=>{debug(me(),"onload begin"),toggleLoading("Ladataan tilatietoja..."),await runStatusUpdater(),toggleLoading(),debug(me(),"onload done")};statusOnLoad();';

  } else if (GET && params.req === "content-settings.html") {
    MIME_TYPE = "text/html";
    DATA = '<form id="cfg-form"> <table class="m"> <tr> <td class="bg w180">Ohjaustyyppi</td> <td> <select id="cfg-mode"> <option value="0">Käsiohjaus</option> <option value="1">Hintaraja</option> <option value="2">Halvimmat tunnit</option> </select> </td> </tr> <tr> <td class="bg">Selite</td> <td id="cfg-mode-desc">-</td> </tr> </table> <br> <table class="m h" id="cfg-table-0"> <tr> <td class="bg w180">Käsiohjaus</td> <td> <input type="checkbox" id="cfg-manualCmd"><label for="cfg-manualCmd"> OHJAUS POIS/PÄÄLLÄ</label> </td> </tr> </table> <table class="m h" id="cfg-table-1"> <tr> <td class="bg w180">Hintaraja</td> <td> <input type="text" id="cfg-priceLimit" size="2"> c/kWh </td> </tr> </table> <table class="m h" id="cfg-table-2"> <tr> <td class="bg w180">Tuntimäärä</td> <td> <input type="text" id="cfg-numberOfHours" size="2"> <br><small>Kuinka monta halvinta tuntia 24h jaksosta ohjaus on päällä (oli hinta mikä hyvänsä)</small> </td> </tr> <tr> <td class="bg">Hintaraja</td> <td> <input type="text" size="2" id="cfg-alwaysOnPriceLimit"> c/kWh <br><small>Jos hinta alle tämän rajan, ohjaus on aina päällä vaikka ei olisi halvimpia tunteja</small> </td> </tr> </table> <br> <table class="m h" id="cfg-table-common"> <tr> <td class="bg w180">Sähkön ALV-%</td> <td> <input type="text" id="cfg-alv" size="2"> </td> </tr> <tr> <td class="bg">Varmuustunnit</td> <td> <input type="text" id="cfg-backupHours"> <br><small>Jos yhteys ei toimi (hinta ei tiedossa), mutta kellonaika tiedetään.<br>Pilkulla erotetut tunnit jolloin lähtö on päällä (esim. "23,00,01")</small> </td> </tr> <tr> <td class="bg">Hätätilaohjaus</td> <td> <input type="checkbox" id="cfg-errorCmd"><label for="cfg-errorCmd"> OHJAUS POIS/PÄÄLLÄ</label> <br><small>Jos yhteys on poikki eikä kellonaika ole tiedossa, ohjataan rele tähän tilaan varmuuden vuoksi.</small> </td> </tr> <tr> <td class="bg">Tervetuloa</td> <td> <input type="checkbox" id="cfg-welcomeShown"><label for="cfg-welcomeShown"> NÄYTÄ</label> <br><small>Jos valittu niin sivu avatessa näytetään tervetuloa-ohjeviesti.</small> </td> </tr> </table> <br> <div class="tc"> <input type="submit" value="Tallenna asetukset"> </div> </form> <script> function showWelcomeModal() { getData(`${BASE_SCRIPT_URL}?req=content-welcome.html`, false) .then(welcome => { if (!welcome.success) { throw new Error(welcome); } showModal("Tervetuloa", welcome.data); }) .catch(err => { console.error("Failed to load welcome message:", err); }); }; </script> <script src="content-settings.js"></script> <script src="?req=content-settings.js"></script>';

  } else if (GET && params.req === "content-settings.js") {
    MIME_TYPE = "text/javascript";
    DATA = 'const porssiModeChanged=e=>{let value=qs("#cfg-mode").value;switch(qs("#cfg-table-0").style.display="none",qs("#cfg-table-1").style.display="none",qs("#cfg-table-2").style.display="none",qs("#cfg-table-common").style.display="none",value){case"0":qs("#cfg-mode-desc").innerHTML="Hintaohjaus pois käytöstä, ohjaus asetetaan käsin päälle/pois.",qs("#cfg-table-0").style.display="table";break;case"1":qs("#cfg-mode-desc").innerHTML="Ohjaus on päällä kun sähkön hinta on alle rajan.",qs("#cfg-table-1").style.display="table",qs("#cfg-table-common").style.display="table";break;case"2":qs("#cfg-mode-desc").innerHTML="Ohjaus on päällä vuorokauden halvimpina tunteinta, tai aina jos hinta on alle rajan.<br><br>Huom: Käyttää vuorokautena UTC-aikavyöhykkeen (GMT) aikaa. Eli 24h jakso on suomen aikaa esim. 03:00-02:59 riippuen kesä/talviajasta.",qs("#cfg-table-2").style.display="table",qs("#cfg-table-common").style.display="table"}},getPorssiConfig=async()=>{toggleLoading("Ladataan asetuksia...");const res=await getData(`${BASE_URL}/rpc/KVS.GetMany?match=porssi-settings`);if(!res.success)throw new Error(`Yhteysvirhe: ${res.status}`);{const data=res.data.items["porssi-settings"].value;debug(me(),"settings data:",data),qs("#cfg-mode").value=data.mode,qs("#cfg-manualCmd").checked=data.manualCmd?"checked":"",qs("#cfg-priceLimit").value=data.priceLimit,qs("#cfg-numberOfHours").value=data.numberOfHours,qs("#cfg-alwaysOnPriceLimit").value=data.alwaysOnPriceLimit,qs("#cfg-backupHours").value=data.backupHours.join(","),qs("#cfg-alv").value=(100*data.alv).toFixed(0),qs("#cfg-errorCmd").checked=data.errorCmd?"checked":"",qs("#cfg-welcomeShown").checked=data.welcomeShown?"":"checked",porssiModeChanged(),data.welcomeShown||showWelcomeModal()}toggleLoading()},setPorssiConfig=async e=>{e.preventDefault();const config={mode:Number(qs("#cfg-mode").value),priceLimit:Number(qs("#cfg-priceLimit").value),numberOfHours:Number(qs("#cfg-numberOfHours").value),alwaysOnPriceLimit:Number(qs("#cfg-alwaysOnPriceLimit").value),manualCmd:qs("#cfg-manualCmd").checked,backupHours:qs("#cfg-backupHours").value.split(","),alv:Number(qs("#cfg-alv").value)/100,errorCmd:qs("#cfg-errorCmd").checked,dataSource:0,welcomeShown:!qs("#cfg-welcomeShown").checked};debug(me(),"Settings to save:",config),toggleLoading("Tallennetaan asetuksia...");const res=await getData(`${BASE_URL}/rpc/KVS.Set?key="porssi-settings"&value=${JSON.stringify(config)}`);debug(me(),"Settings saved:",res),showModal("Asetukset tallennettu","Asetukset tallennettu - muutokset otetaan pian käyttöön."),res.success?getData(`${BASE_SCRIPT_URL}?req=api-cmd&cmd=reload-settings`).catch(err=>{console.error("Failed to request setting reload:",err),showModal("Virhe",`Tallentaminen onnistui mutta asetuksia ei päivitetty.<br><br>Virhetiedot: ${err})`)}):showModal("Virhe",`Tallentaminen epäonnistui. Virhetiedot: ${res.statusText})`),toggleLoading(),await getPorssiConfig()};qs("#cfg-form").addEventListener("submit",setPorssiConfig),qs("#cfg-mode").addEventListener("change",porssiModeChanged);const contentSettingsOnLoad=async()=>{debug(me(),"onload begin"),await getPorssiConfig(),debug(me(),"onload done")};contentSettingsOnLoad();';

  } else if (GET && params.req === "content-log.html") {
    MIME_TYPE = "text/html";
    DATA = ' <textarea style="width: 100%;" rows="20" id="porssi-log" readonly>Ladataan...</textarea> <script src="content-log.js"></script> <script src="?req=content-log.js"></script>';

  } else if (GET && params.req === "content-log.js") {
    MIME_TYPE = "text/javascript";
    DATA = 'let latestLogTimestamp=-1;const runLogUpdater=async()=>{try{await updateLog()}catch{}setTimeout(runLogUpdater,2e4)},updateLog=async()=>{debug(me(),"updating log");try{const res=await getData(`${BASE_SCRIPT_URL}?req=api-log&last=${latestLogTimestamp}`);if(res.success&&200===res.statusCode){const data=res.data,log=res.data.reverse();latestLogTimestamp=log[0].ts;const logHtml=log.map(line=>`${formatDateTime(new Date(1e3*line.ts))} - ${line.str}\n`);qs("#porssi-log").innerHTML=logHtml.join("")}else res.success&&204===res.statusCode?debug(me(),"No new data for log"):(debug(me(),"Failed to read log:",res),console.error("Failed to read log:",res))}catch(err){debug(me(),"Error reading log: ",err),console.error("Error reading log: ",err)}},logOnLoad=async()=>{debug(me(),"onload begin"),toggleLoading("Ladataan lokia..."),await runLogUpdater(),toggleLoading(),debug(me(),"onload done")};logOnLoad();';

  } else if (GET && params.req === "content-welcome.html") {
    MIME_TYPE = "text/html";
    DATA = 'Tervetuloa Pörssisähkön käyttäjäksi!<br><br> <b>Yhdistäminen wifiin</b><br> 1. Avaa <b>Wifi</b>-välilehti<br> 2. Aseta <b>Wifi käytössä</b> päälle, valitse listalta langaton verkkosi ja kirjoita sen salasana.<br> 3. Tallenna asetukset<br><br> <b>Pörssisähköasetukset</b><br> 1. Avaa <b>Asetukset</b>-välilehti<br> 2. Valitse ohjaustyypiksi <b>Halvimmat tunnit</b><br> 3. Syötä kuinka monta halvinta tuntia 24h jaksossa ohjaus on päällä (<b>tuntimäärä</b>)<br> 4. Syötä halutessasi hinnan alaraja, jonka alla ohjaus on aina päällä (<b>hintaraja</b>)<br> 5. Syötä sähkön ALV-%<br> 6. Jos haluat että yhteyden ollessa poikki, ohjataan lähtö tiettyinä tunteina päälle, syötä tunnit pilkulla erotettuna (<b>varmuustunnit</b>).<br> 7. Jos yhteys on poikki eikä kellonaikaa tiedetä, valitse ohjataanko tällöin päälle vai pois (<b>hätätilaohjaus</b>)<br> 8. Tallenna asetukset<br><br> <b>Valvonta</b><br> 1. Avaa <b>Tila</b>-välilehti.<br> 2. Seuraa toimintaa. Hinta tarkistetaan jokaisen tunnin ensimmäisenä minuuttina.<br><br> Tämä viesti näytetään kunnes kytket sen asetussivulta pois.';

  } else if (GET && params.req === "api-log") {
    MIME_TYPE = "application/json";

    if (log.length === 0 || params.last === JSON.stringify(log[log.length - 1].ts)) {
      response.headers = [["Access-Control-Allow-Origin", "*"]];
      response.code = 204;
      response.send();
      return;
    }

    DATA = JSON.stringify(log);

  } else if (GET && params.req === "api-relay-log") {
    MIME_TYPE = "application/json";

    if (relayLog.length === 0 || params.last === JSON.stringify(relayLog[relayLog.length - 1].ts)) {
      response.headers = [["Access-Control-Allow-Origin", "*"]];
      response.code = 204;
      response.send();
      return;
    }

    DATA = JSON.stringify(relayLog);

  } else if (GET && params.req === "api-status") {
    MIME_TYPE = "application/json";
    DATA = JSON.stringify(porssiStatus);

  } else if (GET && params.req === "api-cmd") {
    MIME_TYPE = "application/json";

    if (params.cmd === "reload-settings") {
      DATA = JSON.stringify({
        res: "ok",
        msg: "Reloading settings"
      });

      //request update
      settingsValid = false;
      firstCycleDone = false;
      porssiStatus.lastCheckedTimeStr = "";
      UpdateSettings();


    } else if (params.cmd === "request-check") {
      DATA = JSON.stringify({
        res: "ok",
        msg: "Requesting price check"
      });
      porssiStatus.lastCheckedTimeStr = ""; //request update

    } else {
      DATA = JSON.stringify({
        res: "error",
        msg: "Unknown command: " + params.cmd
      });
    }

  } else {
    response.code = 404;
    DATA = "Request page not found (404)";
  }

  response.headers = [["Content-Type", MIME_TYPE], ["Access-Control-Allow-Origin", "*"]];
  response.body = DATA;
  response.send();
}

console.log("Starting...");
runClockUpdater();

//Starting the system after a delay
Timer.set(STARTUP_DELAY_S * 1000, false, function () {
  addRelayLogLine(RELAY_DESC.STARTED, false, -1);
  UpdateSettings();

  HTTPServer.registerEndpoint(SCRIPT_NAME, onServerRequest);
  console.log("/" + SCRIPT_NAME + "/ endpoint registered - URL is", SCRIPT_URL);
  addLogLine("Palvelin käynnistetty, osoite on: " + SCRIPT_URL);

  Timer.set(CHECK_INTERVAL_S * 1000, true, porssiMain);
});
