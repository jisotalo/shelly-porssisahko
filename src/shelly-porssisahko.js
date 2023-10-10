/**
 * shelly-porssisahko
 * 
 * (c) Jussi isotalo - http://jisotalo.fi
 * https://github.com/jisotalo/shelly-porssisahko
 * 
 * License: GNU Affero General Public License v3.0 
 */

/**
 * Number of log lines saved to history
 * NOTE: At the moment 0 as Shelly memory limit is so low
 */
let C_LOG = 0;

/**
 * Number of historical commands kept
 * NOTE: At the moment 12 (not 24) as Shelly memory limit is so low
 */
let C_HIST = 12;

/** How many errors during getting prices until we have a break */
let C_ERRC = 3;

/** How long to wait after multiple errors (>= C_ERRC) before trying again (s) */
let C_ERRD = 120;

/** Default config to use if some/all of them are missing from KVS */
let C_DEF = {
  /**  
   * Active mode
   * 0: manual mode (on/off toggle)
   * 1: price limit
   * 2: cheapest hours 
  */
  mode: 0,
  /** Settings for mode 0 */
  m0: {
    /** Manual relay output command */
    cmd: 0
  },
  /** Settings for mode 1 */
  m1: {
    /** Price limit (€ cents/kWh) limit - if price <= relay output command is set on */
    lim: 0
  },
  /** Settings for mode 2 */
  m2: {
    /** Period length (24 -> cheapest hours during 24h) */
    per: 24,
    /** How many cheapest hours */
    cnt: 0,
    /** Always on price limit */
    lim: -99
  },
  /** VAT added to spot price (%) */
  vat: 24,
  /** Day (07...22) transfer price c/kWh */
  day: 0,
  /** Night (22...07) transfer price c/kWh */
  night: 0,
  /** Array of backup hours when relay output command is on if no data available */
  backups: [],
  /** Relay output command if clock time is not known */
  err: 0,
  /** Output number to use */
  out: 0
};

/** Log history */
let logData = [];

/** Main state of app */
let _ = {
  s: {
    /** version number */
    v: "2.0.0-beta1",
    /** status as number */
    st: 0,
    /** active command */
    cmd: 0,
    /** epoch when last check was done (logic was run) */
    chkTs: 0,
    /** active error count */
    errCnt: 0,
    /** epoch of last error */
    errTs: 0,
    /** epoch when started (when time was ok for first time) */
    upTs: 0,
    /** 1 if we have somewhat ok time */
    timeOK: 0,
    /** 1 if config is checked */
    configOK: 0,
    /** current price info */
    p: {
      /** time when prices were read */
      ts: 0,
      /** current price */
      now: 0,
      /** lowest price of the day */
      low: 0,
      /** highest price of the day */
      high: 0,
      /** average price of the day */
      avg: 0
    }
  },
  /** prices of the day (each item is array [epoch, price]*/
  p: [[0, 0]],
  /** command history (each item is array [epoch, cmd])*/
  h: [],
  /** actice config */
  c: C_DEF
};

/**
 * True if loop is running (new one is not started)
 */
let loopRunning = false;

/**
 * Returns true if hour in epoch timestamp is current hour
 * @param val epoch value
 * @param now current epoch time (s)
 * @returns 
 */
function isCurrentHour(val, now) {
  let diff = now - val;
  return diff >= 0 && diff < (60 * 60);
}

/**
 * Returns epoch time (s) without decimals
 * @param date Date object (optional) - if not provided, taking current time
 * @returns 
 */
function epoch(date) {
  return Math.floor((date ? date.getTime() : Date.now()) / 1000.0);
}

/**
 * Similar as String.padStart() which is missing from Shelly
 * @param {*} str String to add characters
 * @param {*} targetLength The length of the resulting string
 * @param {*} padString The string to pad the current str with. (optional - default is " ")
 */
function padStart(num, targetLength, padString) {
  let str = num.toString();

  while (str.length < targetLength) {
    str = padString ? padString + str : " " + str;
  }

  return str;
}


/**
 * Adds new log line row
 * @param {*} str 
 */
function log(me, str) {
  let now = new Date();
  console.log(now.toISOString().substring(11) + ": " + me + " - " + str);

  logData.push([epoch(now), me + ": " + str]);

  if (logData.length >= C_LOG) {
    logData.splice(0, 1);
  }
}

/**
 * Updates state
 * 
 * Some things need to be kept up-to-date here
 */
function updateState() {
  let now = new Date();
  _.s.timeOK = now.getFullYear() > 2000 ? 1 : 0;

  if (!_.s.upTs && _.s.timeOK) {
    _.s.upTs = epoch(now);
  }
}

/**
 * Checks configuration
 * If a config key is missings, adds a new one with default value
 */
function chkConfig(cb) {
  //let me = "chkConfig()";
  let count = 0;

  if (!C_DEF) {
    if (cb) {
      cb(true);
    }
    return;
  }

  //Todo: Change to recursive, now hard-coded to max 2 levels
  for (let prop in C_DEF) {
    if (typeof _.c[prop] === "undefined") {
      //log(me, "Asetus '" + prop + "' alustettu arvoon " + JSON.stringify(C_DEF[prop]));
      _.c[prop] = C_DEF[prop];
      count++;

    } else if (typeof C_DEF[prop] === "object") {
      for (let innerProp in C_DEF[prop]) {
        if (typeof _.c[prop][innerProp] === "undefined") {
          //log(me, "Asetus '" + prop + "." + innerProp + "' alustettu arvoon " + JSON.stringify(C_DEF[prop][innerProp]));
          _.c[prop][innerProp] = C_DEF[prop][innerProp];
          count++;
        }
      }
    }
  }

  //Deleting default config after 1st check to save memory...
  C_DEF = null;

  if (count > 0) {
    Shelly.call("KVS.Set", { key: "porssi-config", value: _.c }, function (res, err, msg, cb) {
      if (err !== 0) {
        //log(me, "virhe tallennettaessa asetuksia:" + err + " - " + msg);
      } else {
        //log(me, "asetukset tallennettu");
      }
      if (cb) {
        cb(err === 0);
      }
    }, cb);

  } else {
    if (cb) {
      cb(true);
    }
  }
}

/**
 * Reads config from KVS
 * @param isLoop If true then loopRunning is set to false after finished
 */
function getConfig(isLoop) {
  //let me = "getConfig()";

  //log(me, "luetaan asetukset...");

  //Note: passing callback (cb) as userdata otherwise it can't be accessed from Shelly.call callback
  Shelly.call('KVS.Get', { key: "porssi-config" }, function (res, err, msg, isLoop) {
    if (!res) {
      //log(me, "asetuksia ei löytynyt - alustetaan...");
      _.c = {};

    } else {
      _.c = res.value;
    }

    chkConfig(function (ok) {
      _.s.configOK = ok ? 1 : 0;
      _.s.chkTs = 0; //To run the logic again with new settings
      //log(me, "asetukset ladattu");

      if (isLoop) {
        loopRunning = false;
        loop();
      }
    });

  }, isLoop);
}

/**
 * Background process loop that is called every x seconds
 */
function loop() {
  if (loopRunning) {
    return;
  }
  loopRunning = true;

  updateState();

  if (!_.s.configOK) {
    getConfig(true);

  } else if (pricesNeeded()) {
    getPrices(true);

  } else if (logicRunNeeded()) {
    //Hour has changed or we now know the time (=year has changed)
    logic(true);

  } else {
    //Nothing to do
    loopRunning = false;
  }
}

/**
 * Returns true if we should get prices for today
 * @returns 
 */
function pricesNeeded() {
  //let me = "pricesNeeded()";
  let now = new Date();
  let res = false;

  /*
  Getting prices for today if
    - we have a valid time
    - prices have never been fetched OR prices are from different day
  */
  res = _.s.timeOK && (_.s.p.ts === 0 || new Date(_.s.p.ts * 1000).getDate() !== now.getDate());

  //If fetching prices has failed too many times -> wait until trying again
  if (_.s.errCnt >= C_ERRC && (epoch(now) - _.s.errTs) < C_ERRD) {
    //let timeLeft = (C_ERRD - (epoch(now) - _.s.errTs));
    //log(me, "liikaa virheitä, odotetaan " + timeLeft.toFixed(0) + " s");
    res = false;

  } else if (_.s.errCnt >= C_ERRC) {
    //We can clear error counter (time has passed)
    _.s.errCnt = 0;
  }

  return res;
}

function logicRunNeeded() {
  let now = new Date();
  let chk = new Date(_.s.chkTs * 1000);

  //return (chk.getHours() !== now.getHours() || chk.getFullYear() !== now.getFullYear());
  return (chk.getMinutes() !== now.getMinutes() || chk.getFullYear() !== now.getFullYear());
}

/**
 * Gets prices for today and then runs the logic
 * 
 * @param isLoop If true then loopRunning is set to false after finished
 */
function getPrices(isLoop) {
  let me = "getPrices()";
  //log(me, "haetaan päivän hinnat (yritys " + (_.s.errCnt + 1) + "/" + C_ERRC + ")");

  let now = new Date();

  let start = now.getFullYear()
    + "-"
    + padStart(now.getMonth() + 1, 2, "0")
    + "-"
    + padStart(now.getDate(), 2, "0")
    + "T00:00:00"
    + "%2b03:00";

  let end = start.replace("T00:00:00", "T23:59:59");

  let req = {
    //url: "https://dashboard.elering.ee/api/nps/price?start=" + start + "&end=" + end,
    url: "https://dashboard.elering.ee/api/nps/price/csv?fields=fi&start=" + start + "&end=" + end,
    timeout: 8,
    ssl_ca: "*"
  };

  //Clearing variables to save memory
  now = null;
  start = null;
  end = null;

  log(me, "URL:" + req.url);

  Shelly.call("HTTP.GET", req, function (res, err, msg, isLoop) {
    req = null;

    try {
      if (err === 0 && res !== null && res !== undefined && res.code === 200 && res.body_b64) {
        //Clearing some fields to save memory
        res.headers = null;
        res.message = null;
        msg = null;

        //log(me, "hintadata luettu, käydään läpi");
        _.p = [];
        _.s.p.high = -999;
        _.s.p.low = 999;

        //Converting base64 to text
        res.body_b64 = atob(res.body_b64);

        //Discarding header
        res.body_b64 = res.body_b64.substring(res.body_b64.indexOf("\n") + 1);

        let activePos = 0;

        while (activePos >= 0) {
          res.body_b64 = res.body_b64.substring(activePos);
          activePos = 0;

          let row = [0, 0];
          activePos = res.body_b64.indexOf("\"", activePos) + 1;

          if (activePos === 0) {
            //" character not found -> end of data
            break;
          }

          //epoch
          row[0] = Number(res.body_b64.substring(activePos, res.body_b64.indexOf("\"", activePos)));

          //skip "; after timestamp
          activePos = res.body_b64.indexOf("\"", activePos) + 2;

          //price
          activePos = res.body_b64.indexOf(";\"", activePos) + 2;
          row[1] = Number(res.body_b64.substring(activePos, res.body_b64.indexOf("\"", activePos)).replace(",", "."));
          //Converting price to c/kWh and adding VAT to price
          row[1] = row[1] / 10.0 * (100 + _.c.vat) / 100.0;

          //Add transfer fees (if any)
          let hour = new Date(row[0] * 1000).getHours();

          if (hour >= 7 && hour < 22) {
            //day
            row[1] += _.c.day;
          } else {
            //night
            row[1] += _.c.night;
          }

          //Adding and calculating stuff
          _.p.push(row);

          _.s.p.avg += row[1];

          if (row[1] > _.s.p.high) {
            _.s.p.high = row[1];
          }

          if (row[1] < _.s.p.low) {
            _.s.p.low = row[1];
          }


          //find next row
          activePos = res.body_b64.indexOf("\n", activePos);
        }

        //Again to save memory..
        res = null;

        //Calculate average
        _.s.p.avg = _.p.length > 0 ? (_.s.p.avg / _.p.length) : 0;

        //Check that read price data is from today
        let now = new Date();
        let priceDate = new Date(_.p[0][0] * 1000);

        if (priceDate.getDate() === now.getDate()) {
          _.s.p.ts = epoch(now);
          _.s.p.now = getPriceNow();

          //log(me, "päivän hintatiedot päivitetty");

        } else {
          throw new Error("virhe, hinnat eri päivältä - nyt:" + now.toString() + " - data:" + priceDate.toString());
        }

      } else {
        throw new Error("virhe luettaessa hintoja: " + err + "(" + msg + ") - " + JSON.stringify(res));
      }

    } catch (err) {
      _.s.errCnt += 1;
      _.s.errTs = 0;
      _.s.p.ts = 0;
      _.p = [];
      log(me, "virhe: " + JSON.stringify(err));

      if (err.message.indexOf("virhe") >= 0) {
        //log(me, err.message);
      } else {
        //log(me, "virhe: " + JSON.stringify(err));
      }
    }

    if (_.s.errCnt >= C_ERRC) {
      //log(me, "luku epäonnistui " + EC + " kertaa, pidetään taukoa");
    }

    //Run logic no matter what happened
    logic(isLoop);

  }, isLoop);
}

/**
 * Sets relay output to given cmd
 * If callback given, its called with success status, like cb(true)
 * @param {*} cmd 
 * @param {*} cb callback (optional)
 */
function setRelay(cmd, cb) {
  //let me = "setRelay()";
  let prm = "{id:" + _.c.out + ",on:" + (cmd ? "true" : "false") + "}";

  Shelly.call("Switch.Set", prm, function (res, err, msg, data) {
    if (err === 0) {
      //log(me, "lähtö asetettu " + (data.cmd ? "PÄÄLLE" : "POIS"));
      _.s.cmd = cmd ? 1 : 0;

      while (_.h.length >= C_HIST) {
        _.h.splice(0, 1);
      }
      _.h.push([epoch(), data.cmd ? 1 : 0]);

      //Call callback (if any)
      if (data.cb) {
        data.cb(true);
      }

    } else {
      //log(me, "virhe asettaessa lähtöä " + (data.cmd ? "PÄÄLLE" : "POIS") + ": " + err + " - " + msg);

      //Call callback (if any)
      if (data.cb) {
        data.cb(false);
      }
    }

  }, { cmd, cb });
}

let cmd = false;
/**
 * Runs the main logic
 * 
 * @param isLoop If true then loopRunning is set to false after finished
 */
function logic(isLoop) {
  let me = "logic()";

  try {
    let now = new Date();

    if (_.s.timeOK && (_.s.p.ts > 0 && new Date(_.s.p.ts * 1000).getDate() === now.getDate())) {
      //We have time and we have price data for today
      _.s.p.now = getPriceNow();

      //log(me, "tämän tunnin hinta: " + _.s.p.now + " c/kWh");

      if (_.c.mode === 0) {
        //Manual mode
        cmd = _.c.m0.cmd === 1;
        //log(me, "moodi on käsiohjaus, ohjaus: " + (cmd ? "PÄÄLLE" : "POIS"));
        _.s.st = 1;

      } else if (_.c.mode === 1) {
        //Price limit
        cmd = _.s.p.now <= _.c.m1.lim;
        //log(me, "moodi on hintaraja (" + _.c.m1.priceLimit + "), ohjaus: " + (cmd ? "PÄÄLLE" : "POIS"));
        _.s.st = cmd ? 2 : 3;

      } else if (_.c.mode === 2) {
        //Cheapest hours
        cmd = isCheapestHour();
        _.s.st = cmd ? 5 : 4;

        //always on price limit
        if (!cmd && _.s.p.now <= _.c.m2.lim) {
          cmd = true;
          _.s.st = 6;
        }

        //log(me, "moodi on halvimmat tunnit, ohjaus: " + (cmd ? "PÄÄLLE" : "POIS"));
      }

    } else if (_.s.timeOK) {
      //We have time but no data for today
      for (let i = 0; i < _.c.backups.length; i++) {
        if (_.c.backups[i] === now.getHours()) {
          cmd = true;
          _.s.st = 7;
          break;
        }
      }
      //log(me, "hintatietoja ei ole, ohjaus: " + (cmd ? "PÄÄLLE" : "POIS"));

    } else {
      //Time is not known
      cmd = _.c.err === 1;
      _.s.st = 8;
      //log(me, "kellonaikaa ei ole, ohjaus: " + (cmd ? "PÄÄLLE" : "POIS"));
    }

    //Setting relay command and after that starting background timer again
    setRelay(cmd, function (ok) {
      if (ok) {
        _.s.chkTs = epoch();
      }

      if (isLoop) {
        loopRunning = false;
      }
    });

  } catch (err) {
    //log(me, "virhe: " + JSON.stringify(err));

    if (isLoop) {
      loopRunning = false;
    }
  }
}

/**
 * Returns true if current hour is one of the cheapest
 * @returns 
 */
function isCheapestHour() {

  //This is (and needs to be) 1:1 in both frontend and backend code
  let cheapest = [];

  for (let i = 0; i < 24; i += _.c.m2.per) {
    //Create array of indexes in selected period
    let order = [];
    for (let j = i; j < i + _.c.m2.per; j++) order.push(j);

    //Sort indexes by price
    let j = 0;
    for (let k = 1; k < order.length; k++) {
      let temp = order[k];

      for (j = k - 1; j >= 0 && _.p[temp][1] < _.p[order[j]][1]; j--) {
        order[j + 1] = order[j];
      }
      order[j + 1] = temp;
    }

    //Select the cheapest ones
    for (let j = 0; j < _.c.m2.cnt; j++) {
      cheapest.push(order[j]);
    }
  }

  //Check if current hour is cheap enough
  let epochNow = epoch();
  let res = false;

  for (let i = 0; i < cheapest.length; i++) {
    let row = _.p[cheapest[i]];

    if (isCurrentHour(row[0], epochNow)) {
      //This hour is active -> current hour is one of the cheapest
      res = true;
      break;
    }
  }

  return res;
}

/**
 * Returns the current price. Throws error if not found
 * @returns 
 */
function getPriceNow() {
  ////let me = "getPriceNow()";
  let now = epoch();

  //todo start from current hour?
  for (let i = 0; i < _.p.length; i++) {
    if (isCurrentHour(_.p[i][0], now)) {
      //This hour is active 
      return _.p[i][1];
    }
  }

  //This should happen
  //log(me, "tämän tunnin hintaa ei löytynyt");
  throw new Error("price now not found");
}

/**
 * Parses parameters from HTTP GET request query to array of objects
 * For example key=value&key2=value2
 * @param {*} params 
 * @returns 
 */
function parseParams(params) {
  let res = {};
  let splitted = params.split("&");

  for (let i = 0; i < splitted.length; i++) {
    let pair = splitted[i].split("=");

    res[pair[0]] = pair[1];
  }

  return res;
}

/**
 * Handles server HTTP requests
 * @param {*} request 
 * @param {*} response 
 */
function onServerRequest(request, response) {
  if (loopRunning) {
    request = null;
    response.code = 503;
    response.send();
    return;
  }

  //Parsing parameters (key=value&key2=value2) to object
  let params = parseParams(request.query);
  request = null;

  let MIME_TYPE = "application/json"; //default
  response.code = 200; //default
  let GZIP = false; //default

  let MIME_HTML = "text/html";
  let MIME_JS = "text/javascript";
  let MIME_CSS = "text/css";

  if (params.r === "s") {
    updateState();

    if (params.k) {
      response.body = JSON.stringify(_[params.k]);
    } else {
      response.body = JSON.stringify(_);
    }

  } else if (params.r === "l") {
    response.body = JSON.stringify(log);

  } else if (params.r === "r") {
    _.s.configOK = false; //reload settings (prevent getting prices before new settings loaded )
    getConfig();
    _.s.p.ts = 0; //get prices

    response.body = JSON.stringify({ ok: true });

  } else if (!params.r || params.r === "index.html") {
    response.body = atob('#[index.html]');
    MIME_TYPE = MIME_HTML;
    GZIP = true;

  } else if (params.r === "s.js") {
    response.body = atob('#[s.js]');
    MIME_TYPE = MIME_JS;
    GZIP = true;

  } else if (params.r === "s.css") {
    response.body = atob('#[s.css]');
    MIME_TYPE = MIME_CSS;
    GZIP = true;

  } else if (params.r === "tab-status.html") {
    response.body = atob('#[tab-status.html]');
    MIME_TYPE = MIME_HTML;
    GZIP = true;

  } else if (params.r === "tab-status.js") {
    response.body = atob('#[tab-status.js]');
    MIME_TYPE = MIME_JS;
    GZIP = true;

  } else if (params.r === "tab-config.html") {
    response.body = atob('#[tab-config.html]');
    MIME_TYPE = MIME_HTML;
    GZIP = true;

  } else if (params.r === "tab-config.js") {
    response.body = atob('#[tab-config.js]');
    MIME_TYPE = MIME_JS;
    GZIP = true;

  } else {
    response.code = 404;
  }

  response.headers = [["Content-Type", MIME_TYPE], ["Access-Control-Allow-Origin", "*"]];

  if (GZIP) {
    response.headers.push(["Content-Encoding", "gzip"]);
  }
  response.send();
}

//Startup
log("main", "shelly-porssisahko (v." + _.s.v + ") started");
let ip = Shelly.getComponentStatus("wifi") ? Shelly.getComponentStatus("wifi").sta_ip : "192.168.33.1";
log("main", "URL is: http://" + ip + "/script/" + Shelly.getCurrentScriptId());
ip = null;

HTTPServer.registerEndpoint('', onServerRequest);
Timer.set(10000, true, loop);
loop();