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
 * NOTE: Currenly commented out as we have no memory
 */
//let C_LOG = 0;

/**
 * Number of historical commands kept
 */
let C_HIST = 24;

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
  /** Settings for mode 0 (manual) */
  m0: {
    /** Manual relay output command [0/1] */
    cmd: 0
  },
  /** Settings for mode 1 (price limit) */
  m1: {
    /** Price limit limit - if price <= relay output command is set on [c/kWh] */
    lim: 0
  },
  /** Settings for mode 2 (cheapest hours) */
  m2: {
    /** Period length [h] (example: 24 -> cheapest hours during 24h) */
    per: 24,
    /** How many cheapest hours */
    cnt: 0,
    /** Always on price limit [c/kWh] */
    lim: -999,
    /** Should the hours be sequential / in a row [0/1] */
    sq: 0,
    /** Maximum price limit [c/kWh] */
    m: 999
  },
  /** VAT added to spot price [%] */
  vat: 24,
  /** Day (07...22) transfer price [c/kWh] */
  day: 0,
  /** Night (22...07) transfer price [c/kWh] */
  night: 0,
  /** Backup hours [binary] (example: 0b111111 = 00, 01, 02, 03, 04, 05) */
  bk: 0b0,
  /** Relay output command if clock time is not known [0/1] */
  err: 0,
  /** Outputs IDs to use (array of numbers) */
  outs: [0],
  /** Forced ON hours [binary] (example: 0b110000000000001100000 = 05, 06, 19, 20) */
  fh: 0b0,
  /** Invert output [0/1] */
  inv: 0
};

/** Log history */
//let logData = [];
//NOTE: Currenly commented out as we have no memory

/** Main state of app */
let _ = {
  s: {
    /** version number */
    v: "2.9.0",
    /** Device name */
    dn: '',
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
    /** If forced manually to ON, then this is the timestamp until cmd shall be on */
    fCmdTs: 0,
    /** Active time zone as string (URL encoded - such as %2b02:00 = +02:00)*/
    tz: "+02:00",
    /** current price info */
    p: {
      /** time when prices were read */
      ts: 0,
      /** current price */
      now: 0,
      /** lowest price of  the day */
      low: 0,
      /** highest price of the day */
      high: 0,
      /** average price of the day */
      avg: 0
    }
  },
  /** prices of the day (each item is array [epoch, price]*/
  p: [],
  /** command history (each item is array [epoch, cmd])*/
  h: [],
  /** actice config */
  c: C_DEF
};

/**
 * True if loop is running (new one is not started + HTTP requests are not handled)
 */
let loopRunning = false;

/** Active command (internal) - here because some weird issues if was inside logic()... (memory/stack issues?) */
let cmd = false;

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
 * Wrapper for Date.getDate to help minifying
 * @param {Date} dt 
 * @returns 
 */
function getDate(dt) {
  return dt.getDate();
}

/**
 * Updates current timezone to state
 * 
 *  - If timezone is UTC -> result is "Z"
 *  - Otherwise the result is in format similar to -0200 or +0200
 * 
 * @param {Date} now Current time
 */
function updateTz(now) {
  //Get date as string: Fri Nov 10 2023 00:02:29 GMT+0200
  let tz = now.toString();

  //Get timezone part: +0200
  tz = tz.substring(tz.indexOf("GMT") + 3);

  //If timezone is UTC, we need to use Z
  if (tz == "+0000") {
    tz = "Z";

  } else {
    //tz is now similar to -0100 or +0200 -> add : between hours and minutes
    tz = tz.substring(0, 3) + ":" + tz.substring(3);
  }

  if (tz != _.s.tz) {
    //Timezone has changed -> we should get prices
    _.s.p.ts = 0;
  }

  _.s.tz = tz;
}

/**
 * Adds new log line row
 * @param {*} str 
 */
function log(data, me) {
  let now = new Date();
  console.log(now.toISOString().substring(11) + ": " + (me ? me + " - " : ""), data);

  //NOTE: Currenly commented out as we have no memory
  /*logData.push([epoch(now), me + ": " + str]);

  if (logData.length >= C_LOG) {
    logData.splice(0, 1);
  }*/
}

/**
 * Updates state
 * - Checks if time is OK
 * - Some things need to be kept up-to-date here
 */
function updateState() {
  let now = new Date();
  _.s.timeOK = now.getFullYear() > 2000 ? 1 : 0;
  _.s.dn = Shelly.getComponentConfig("sys").device.name;

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
      //log("Asetus '" + prop + "' alustettu arvoon " + JSON.stringify(C_DEF[prop]), me);
      _.c[prop] = C_DEF[prop];
      count++;

    } else if (typeof C_DEF[prop] === "object") {
      for (let innerProp in C_DEF[prop]) {
        if (typeof _.c[prop][innerProp] === "undefined") {
          //log("Asetus '" + prop + "." + innerProp + "' alustettu arvoon " + JSON.stringify(C_DEF[prop][innerProp]), me);
          _.c[prop][innerProp] = C_DEF[prop][innerProp];
          count++;
        }
      }
    }
  }

  //Config update: v.2.9.0 added support to multiple outputs
  if (_.c.out !== undefined) {
    _.c.outs = [_.c.out];

    _.c.out = undefined;
  }

  //Deleting default config after 1st check to save memory...
  C_DEF = null;

  if (count > 0) {
    Shelly.call("KVS.Set", { key: "porssi-config", value: _.c }, function (res, err, msg, cb) {
      if (err !== 0) {
        //log("virhe tallennettaessa asetuksia:" + err + " - " + msg, me);
      } else {
        //log("asetukset tallennettu", me);
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
 */
function getConfig(isLoop) {
  //let me = "getConfig()";
  //log("luetaan asetukset...", me);

  //Note: passing callback (cb) as userdata otherwise it can't be accessed from Shelly.call callback
  Shelly.call('KVS.Get', { key: "porssi-config" }, function (res, err, msg, isLoop) {
    if (!res) {
      //log("asetuksia ei löytynyt - alustetaan...", me);
      _.c = {};

    } else {
      _.c = res.value;
    }

    if (typeof USER_CONFIG == 'function') {
      _.c = USER_CONFIG(_.c);
    }

    chkConfig(function (ok) {
      _.s.configOK = ok ? 1 : 0;
      _.s.chkTs = 0; //To run the logic again with new settings
      //log("asetukset ladattu", me);

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
    getPrices();

  } else if (logicRunNeeded()) {
    //Hour has changed or we now know the time (=year has changed)
    logic();

  } else {
    //Nothing to do
    loopRunning = false;
  }
}

/**
 * Returns true if we should get prices for today
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
  res = _.s.timeOK && (_.s.p.ts === 0 || getDate(new Date(_.s.p.ts * 1000)) !== getDate(now));

  //If fetching prices has failed too many times -> wait until trying again
  if (_.s.errCnt >= C_ERRC && (epoch(now) - _.s.errTs) < C_ERRD) {
    let timeLeft = (C_ERRD - (epoch(now) - _.s.errTs));
    //log("liikaa virheitä, odotetaan " + timeLeft.toFixed(0) + " s", me);
    res = false;

  } else if (_.s.errCnt >= C_ERRC) {
    //We can clear error counter (time has passed)
    _.s.errCnt = 0;
  }

  return res;
}

/**
 * Returns true if we should run the logic now
 */
function logicRunNeeded() {
  if (_.s.chkTs == 0) {
    return true;
  }

  let now = new Date();
  let chk = new Date(_.s.chkTs * 1000);

  //for debugging:
  /*
  return (chk.getMinutes() !== now.getMinutes()
    || chk.getFullYear() !== now.getFullYear())
    || (_.s.fCmdTs > 0 && _.s.fCmdTs - epoch(now) < 0);
  */
  return (chk.getHours() !== now.getHours()
    || chk.getFullYear() !== now.getFullYear())
    || (_.s.fCmdTs > 0 && _.s.fCmdTs - epoch(now) < 0);
}

/**
 * Gets prices for today and then runs the logic
 */
function getPrices() {
  let now = new Date();
  updateTz(now);

  try {
    //let me = "getPrices()";
    //log("haetaan päivän hinnat (yritys " + (_.s.errCnt + 1) + "/" + C_ERRC + ")", me);

    let start = now.getFullYear()
      + "-"
      + padStart(now.getMonth() + 1, 2, "0")
      + "-"
      + padStart(getDate(now), 2, "0")
      + "T00:00:00"
      + _.s.tz.replace("+", "%2b"); //URL encode the + character

    let end = start.replace("T00:00:00", "T23:59:59");

    let req = {
      url: "https://dashboard.elering.ee/api/nps/price/csv?fields=fi&start=" + start + "&end=" + end,
      timeout: 5,
      ssl_ca: "*"
    };

    //Clearing variables to save memory
    now = null;
    start = null;
    end = null;

    //log("URL:" + req.url, me);
    Shelly.call("HTTP.GET", req, function (res, err, msg) {
      req = null;

      try {
        if (err === 0 && res != null && res.code === 200 && res.body_b64) {
          //Clearing some fields to save memory
          res.headers = null;
          res.message = null;
          msg = null;

          //log("hintadata luettu, käydään läpi", me);
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
            row[1] = row[1] / 10.0 * (100 + (row[1] > 0 ? _.c.vat : 0)) / 100.0;

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

          if (getDate(priceDate) === getDate(now)) {
            _.s.p.ts = epoch(now);
            _.s.p.now = getPriceNow();

            //log("päivän hintatiedot päivitetty", me);

          } else {
            //throw new Error("virhe, hinnat eri päivältä - nyt:" + now.toString() + " - data:" + priceDate.toString());
            throw new Error("date err " + now.toString() + " - " + priceDate.toString());
          }

        } else {
          //throw new Error("virhe luettaessa hintoja: " + err + "(" + msg + ") - " + JSON.stringify(res));
          throw new Error("conn.err (" + msg + ") " + JSON.stringify(res));
        }

      } catch (err) {
        _.s.errCnt += 1;
        _.s.errTs = epoch();
        _.s.p.ts = 0;
        _.p = [];
        log(err);

        //NOTE: All the rest are commented for now because of memory limit
        /*
        if (err.message.indexOf("virhe") >= 0) {
          log(err.message, me);
        } else {
          log("virhe: " + JSON.stringify(err), me);
        }
        */
      }

      /*
      NOTE: commented for now because of memory limit
      if (_.s.errCnt >= C_ERRC) {
        //log("luku epäonnistui " + EC + " kertaa, pidetään taukoa", me);
      }
      */

      //Run logic no matter what happened
      logic();

    });

  } catch (err) {
    log(err);
    //Run logic no matter what happened
    logic();
  }
}

/**
 * Sets outputs to cmd
 * If callback given, its called with success status, like cb(true)
 * @param {*} cb callback (optional)
 */
function setOutputs(cb) {
  //Invert?
  if (_.c.inv) {
    cmd = !cmd;
  }

  let cnt = 0;
  let success = 0;

  for (let i = 0; i < _.c.outs.length; i++) {

    setRelay(_.c.outs[i], function (res) {
      cnt++;

      if (res) {
        success++;
      }

      if (cnt == _.c.outs.length) {
        //All done
        if (success == cnt) {
          while (_.h.length >= C_HIST) {
            _.h.splice(0, 1);
          }
          _.h.push([epoch(), cmd ? 1 : 0]);

          _.s.cmd = cmd ? 1 : 0;
          cb(true)
        } else {
          cb(false);
        }
      }
    });
  }
}

/**
 * Sets relay output to cmd
 * If callback given, its called with success status, like cb(true)
 * @param {*} cb callback (optional)
 */
function setRelay(output, cb) {
  let prm = "{id:" + output + ",on:" + (cmd ? "true" : "false") + "}";

  Shelly.call("Switch.Set", prm, function (res, err, msg, cb) {
    if (err != 0) {
      log("error setting output " + output + " " + (cmd ? "ON" : "OFF") + ": " + err + " - " + msg);
    }

    cb(err == 0);

  }, cb);
}

/**
 * Runs the main logic
 */
function logic() {
  //let me = "logic()";
  let now = new Date();
  updateTz(now);

  cmd = false;

  try {
    if (_.c.mode === 0) {
      //Manual mode
      cmd = _.c.m0.cmd === 1;
      //log("moodi on käsiohjaus, ohjaus: " + (cmd ? "PÄÄLLE" : "POIS"), me);
      _.s.st = 1;

    } else if (_.s.timeOK && (_.s.p.ts > 0 && getDate(new Date(_.s.p.ts * 1000)) === getDate(now))) {
      //We have time and we have price data for today
      _.s.p.now = getPriceNow();

      //log("tämän tunnin hinta: " + _.s.p.now + " c/kWh", me);
      if (_.c.mode === 1) {
        //Price limit
        cmd = _.s.p.now <= (_.c.m1.lim == "avg" ? _.s.p.avg : _.c.m1.lim);
        //log("moodi on hintaraja (" + _.c.m1.priceLimit + "), ohjaus: " + (cmd ? "PÄÄLLE" : "POIS"), me);
        _.s.st = cmd ? 2 : 3;

      } else if (_.c.mode === 2) {
        //Cheapest hours
        cmd = isCheapestHour();
        _.s.st = cmd ? 5 : 4;

        //always on price limit
        if (!cmd && _.s.p.now <= (_.c.m2.lim == "avg" ? _.s.p.avg : _.c.m2.lim)) {
          cmd = true;
          _.s.st = 6;
        }

        //maximum price
        if (cmd && _.s.p.now > (_.c.m2.m == "avg" ? _.s.p.avg : _.c.m2.m)) {
          cmd = false;
          _.s.st = 11;
        }

        //log("moodi on halvimmat tunnit, ohjaus: " + (cmd ? "PÄÄLLE" : "POIS"), me);
      }

    } else if (_.s.timeOK) {
      //We have time but no data for today
      _.s.st = 7;

      let binNow = (1 << now.getHours());
      if ((_.c.bk & binNow) == binNow) {
        cmd = true;
      }
      //log("hintatietoja ei ole, ohjaus: " + (cmd ? "PÄÄLLE" : "POIS"), me);

    } else {
      //Time is not known
      cmd = _.c.err === 1;
      _.s.st = 8;
      //log("kellonaikaa ei ole, ohjaus: " + (cmd ? "PÄÄLLE" : "POIS"), me);
    }

    //Forcing automatically or manually
    if (_.s.timeOK) {
      //Forced hours
      if (_.c.fh > 0) {
        let binNow = (1 << now.getHours());
        if ((_.c.fh & binNow) == binNow) {
          cmd = true;
          _.s.st = 10;
        }
      }

      //Manual force
      if (_.s.fCmdTs > 0) {
        if (_.s.fCmdTs - epoch(now) > 0) {
          cmd = true;
          _.s.st = 9;
        } else {
          _.s.fCmdTs = 0;
        }
      }
    }

    function logicFinalize(finalCmd) {
      //Normally cmd == finalCmd, but user script could change it
      if (cmd != finalCmd) {
        _.s.st = 12;
        log("Note: command edited by user script");
      }

      cmd = finalCmd;

      setOutputs(function (ok) {
        if (ok) {
          _.s.chkTs = epoch();
        }

        loopRunning = false;
      });
    }

    //User script
    if (typeof USER_OVERRIDE == 'function') {
      USER_OVERRIDE(cmd, _, logicFinalize);
    } else {
      logicFinalize(cmd);
    }

  } catch (err) {
    //log("virhe: " + JSON.stringify(err), me);
    log(err);
    loopRunning = false;
  }
}

/**
 * Returns true if current hour is one of the cheapest
 * 
 * NOTE: Variables are here outside function() as it caused memory issues
 * (for loop i variable suddenly changed to something very odd)
 * Perhaps the stack was getting too full or something because of multiple for() loops?
 * This worked!
 * 
 */
let _perStart = 0;
let _ind = 0;
let _ind2 = 0;
function isCheapestHour() {
  if (_.c.m2.cn == 0) {
    return;
  }

  //This is (and needs to be) 1:1 in both frontend and backend code
  let cheapest = [];

  for (_perStart = 0; _perStart < _.p.length; _perStart += _.c.m2.per) {
    //Create array of indexes in selected period
    let order = [];
    for (ind = _perStart; ind < _perStart + _.c.m2.per; ind++) {
      //If we have less hours than 24 then skip the rest from the end
      if (ind > _.p.length - 1)
        break;

      order.push(ind);
    }

    if (_.c.m2.sq) {
      //Find cheapest in a sequence
      //Loop through each possible starting index and compare average prices
      let avg = 999;
      let startIndex = 0;

      for (_ind = 0; _ind <= order.length - _.c.m2.cnt; _ind++) {
        let sum = 0;
        //Calculate sum of these sequential hours
        for (_ind2 = _ind; _ind2 < _ind + _.c.m2.cnt; _ind2++) {
          sum += _.p[order[_ind2]][1];
        };

        //If average price of these sequential hours is lower -> it's better
        if (sum / _.c.m2.cnt < avg) {
          avg = sum / _.c.m2.cnt;
          startIndex = _ind;
        }
      }

      for (_ind = startIndex; _ind < startIndex + _.c.m2.cnt; _ind++) {
        cheapest.push(order[_ind]);
      }

    } else {
      //Sort indexes by price
      for (_ind = 1; _ind < order.length; _ind++) {
        let temp = order[_ind];

        for (_ind2 = _ind - 1; _ind2 >= 0 && _.p[temp][1] < _.p[order[_ind2]][1]; _ind2--) {
          order[_ind2 + 1] = order[_ind2];
        }
        order[_ind2 + 1] = temp;
      }

      //Select the cheapest ones
      for (_ind = 0; _ind < _.c.m2.cnt; _ind++) {
        cheapest.push(order[_ind]);
      }
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

  _perStart = null;
  _ind = null;
  _ind2 = null;

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

  //If no price found it might be error OR because of timezone we don't have prices yet
  //If number of hours is less than 24 -> get prices again
  if (_.p.length < 24) {
    _.s.p.ts = 0;
  }
  //log("tämän tunnin hintaa ei löytynyt", me);
  throw new Error("no price for this hour");
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
  try {
    if (loopRunning) {
      request = null;
      response.code = 503;
      //NOTE: Uncomment the next line for local development or remote API access (allows cors)
      //response.headers = [["Access-Control-Allow-Origin", "*"]];
      response.send();
      return;
    }

    //Parsing parameters (key=value&key2=value2) to object
    let params = parseParams(request.query);
    request = null;

    let MIME_TYPE = "application/json"; //default
    response.code = 200; //default
    let GZIP = true; //default

    let MIME_HTML = "text/html";
    let MIME_JS = "text/javascript";
    let MIME_CSS = "text/css";

    if (params.r === "s") {
      //s = get state
      updateState();

      //if k given, return only the key k
      /*
      if (params.k) {
        response.body = JSON.stringify(_[params.k]);
      } else {*/
      response.body = JSON.stringify(_);
      GZIP = false;
      //}

    } else if (params.r === "r") {
      //r = reload settings
      _.s.configOK = false; //reload settings (prevent getting prices before new settings loaded )
      getConfig(false);
      _.s.p.ts = 0; //get prices
      response.code = 204;
      GZIP = false;

    } else if (params.r === "f" && params.ts) {
      //f = force
      _.s.fCmdTs = Number(params.ts);
      _.s.chkTs = 0;
      response.code = 204;
      GZIP = false;

    } else if (!params.r) {
      response.body = atob('#[index.html]');
      MIME_TYPE = MIME_HTML;

    } else if (params.r === "s.js") {
      response.body = atob('#[s.js]');
      MIME_TYPE = MIME_JS;

    } else if (params.r === "s.css") {
      response.body = atob('#[s.css]');
      MIME_TYPE = MIME_CSS;

    } else if (params.r === "status") {
      response.body = atob('#[tab-status.html]');
      MIME_TYPE = MIME_HTML;

    } else if (params.r === "status.js") {
      response.body = atob('#[tab-status.js]');
      MIME_TYPE = MIME_JS;

    } else if (params.r === "config") {
      response.body = atob('#[tab-config.html]');
      MIME_TYPE = MIME_HTML;

    } else if (params.r === "config.js") {
      response.body = atob('#[tab-config.js]');
      MIME_TYPE = MIME_JS;

    } else {
      response.code = 404;
    }

    params = null;

    response.headers = [["Content-Type", MIME_TYPE]];

    //NOTE: Uncomment the next line for local development or remote API access (allows cors)
    //response.headers.push(["Access-Control-Allow-Origin", "*"]);

    if (GZIP) {
      response.headers.push(["Content-Encoding", "gzip"]);
    }
  } catch (err) {
    log(err);
    response.code = 500;
  }
  response.send();
}

//Startup
log("shelly-porssisahko v." + _.s.v);
log("URL: http://" + (Shelly.getComponentStatus("wifi").sta_ip ?? "192.168.33.1") + "/script/" + Shelly.getCurrentScriptId());

HTTPServer.registerEndpoint('', onServerRequest);
Timer.set(10000, true, loop);
loop();