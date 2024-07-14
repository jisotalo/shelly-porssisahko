/**
 * @license
 * 
 * shelly-porssisahko
 * 
 * (c) Jussi isotalo - http://jisotalo.fi
 * https://github.com/jisotalo/shelly-porssisahko
 * 
 * License: GNU Affero General Public License v3.0 
 */

/** Number of history rows */
let C_HIST = 24;

/** How many errors with getting prices until to have a break */
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
    /** Period length (-1 = custom range) [h] (example: 24 -> cheapest hours during 24h) */
    per: 24,
    /** How many cheapest hours */
    cnt: 0,
    /** Always on price limit [c/kWh] */
    lim: -999,
    /** Should the hours be sequential / in a row [0/1] */
    sq: 0,
    /** Maximum price limit [c/kWh] */
    m: 999,
    /** Custom period start hour */
    ps: 0,
    /** Custom period end hour */
    pe: 23,
    /** Custom period 2 start hour */
    ps2: 0,
    /** Custom period 2 end hour */
    pe2: 23,
    /** How many cheapest hours (custom period 2) */
    cnt2: 0,
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
  /** Forced hours [binary] (example: 0b110000000000001100001 = 00, 05, 06, 19, 20) */
  fh: 0b0,
  /** Forced hours commands [binary] (example: 0b110000000000001100000 = 05, 06, 19, 20 are forced to on, 00 to off (if forced as in above example "fh" setting) */
  fhCmd: 0b0,
  /** Invert output [0/1] */
  inv: 0,
  /** How many first minutes of the hour the output should be on [min]*/
  min: 60,
  /** Output config - when to set output (0 = always after running logic, 1 = only when output changes)*/
  oc: 0
};

/** Main state of app */
let _ = {
  s: {
    /** version number */
    v: "2.13.0",
    /** Device name */
    dn: '',
    /** status as number */
    st: 0,
    /** Additional status string (only meant to be used by user override scripts) */
    str: '',
    /** active command (-1 = not yet determined)*/
    cmd: -1,
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
    /** If forced manually, then this is the timestamp until the force is removed */
    fCmdTs: 0,
    /** If forced manually, then this is the command */
    fCmd: 0,
    /** Active time zone as string (URL encoded - such as %2b02:00 = +02:00)*/
    tz: "+02:00",
    /** Active time zone hour difference*/
    tzh: 0,
    /** price info [0] = today, [1] = tomorrow */
    p: [
      {
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
      },
      {
        /** time when prices were read */
        ts: 0,
        /** current price (not valid for tomorrow) */
        now: 0,
        /** lowest price of  the day */
        low: 0,
        /** highest price of the day */
        high: 0,
        /** average price of the day */
        avg: 0
      }
    ],
  },
  /** price data [0] = today, [1] tomorrow - each item is array [epoch, price]*/
  p: [
    [],
    []
  ],
  /** command history (each item is array [epoch, cmd, desc])*/
  h: [],
  /** actice config */
  c: C_DEF
};

/**
 * True if loop is currently running 
 * (new one is not started + HTTP requests are not handled)
 */
let loopRunning = false;

/** 
 * Active command (internal)
 * Here because some weird issues if it was inside logic()... 
 * memory/stack issues?
 */
let cmd = false;

/**
 * Returns true if hour in epoch timestamp is current hour
 * 
 * @param {number} value epoch value
 * @param {number} now current epoch time (s)
 */
function isCurrentHour(value, now) {
  let diff = now - value;
  return diff >= 0 && diff < (60 * 60);
}

/**
 * Limits the value to min..max range
 * @param {number} min 
 * @param {number} value 
 * @param {number} max 
 */
function limit(min, value, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Returns epoch time (seconds) without decimals
 * 
 * @param {Date?} date Date object (optional) - if not provided, using new Date()
 */
function epoch(date) {
  return Math.floor((date ? date.getTime() : Date.now()) / 1000.0);
}

/**
 * Similar as String.padStart() which is missing from Shelly
 * 
 * @param {string} str String to add characters
 * @param {number} targetLength The length of the resulting string
 * @param {string} padString The string to pad the current str with. (optional - default is " ")
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
 * 
 * @param {Date} dt 
 */
function getDate(dt) {
  return dt.getDate();
}

/**
 * Updates current timezone to state 
 *  - _.s.tz is set to timezone as string 
 *    - If timezone is UTC -> result is "Z"
 *    - Otherwise the result is in format similar to -0200 or +0200
 *  - _.s.tzh is set to timezone hour difference (minutes are not handled)
 * 
 * @param {Date} now Date to use
 */
function updateTz(now) {
  //Get date as string: Fri Nov 10 2023 00:02:29 GMT+0200
  let tz = now.toString();
  let h = 0;

  //Get timezone part: +0200
  tz = tz.substring(tz.indexOf("GMT") + 3);

  //If timezone is UTC, we need to use Z
  if (tz == "+0000") {
    tz = "Z";
    h = 0;

  } else {
    //tz is now similar to -0100 or +0200 -> add : between hours and minutes
    h = Number(tz.substring(0, 3));
    tz = tz.substring(0, 3) + ":" + tz.substring(3);
  }

  if (tz != _.s.tz) {
    //Timezone has changed -> we should get prices
    _.s.p[0].ts = 0;
  }

  _.s.tz = tz;
  _.s.tzh = h;
}

/**
 * console.log() wrapper
 * 
 * @param {string} str String to log
 */
function log(data) {
  let now = new Date();
  console.log(now.toString().substring(16, 24) + ":", data);
}

/**
 * Adds command to history
 */
function addHistory() {
  while (C_HIST > 0 && _.h.length >= C_HIST) {
    _.h.splice(0, 1);
  }
  _.h.push([epoch(), cmd ? 1 : 0, _.s.st]);
}

/**
 * Updates state (called intervally)
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
  let count = 0;

  //If config already checked, do nothing
  if (!C_DEF) {
    if (cb) {
      cb(true);
    }
    return;
  }

  //Config update: v.2.10.0 added support to selecting forced hours commands
  if (_.c.fhCmd == undefined && _.c.fh != undefined) {
    _.c.fhCmd = _.c.fh;
  }

  //Note: Hard-coded to max 2 levels
  for (let prop in C_DEF) {
    if (typeof _.c[prop] === "undefined") {
      _.c[prop] = C_DEF[prop];
      count++;

    } else if (typeof C_DEF[prop] === "object") {
      for (let innerProp in C_DEF[prop]) {
        if (typeof _.c[prop][innerProp] === "undefined") {
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

  //Deleting default config after 1st check to save memory
  C_DEF = null;

  if (count > 0) {
    Shelly.call("KVS.Set", { key: "porssi-config", value: _.c }, function (res, err, msg, cb) {
      if (err !== 0) {
        log("chkConfig() - virhe:" + err + " - " + msg);
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
  Shelly.call('KVS.Get', { key: "porssi-config" }, function (res, err, msg, isLoop) {

    _.c = res ? res.value : {};

    if (typeof USER_CONFIG == 'function') {
      _.c = USER_CONFIG(_.c, _, true);
    }

    chkConfig(function (ok) {
      _.s.configOK = ok ? 1 : 0;
      _.s.chkTs = 0; //To run the logic again with new settings

      if (isLoop) {
        loopRunning = false;
        Timer.set(1000, false, loop);
      }
    });

  }, isLoop);
}

/**
 * Background process loop that is called every x seconds
 */
function loop() {
  try {
    if (loopRunning) {
      return;
    }
    loopRunning = true;

    updateState();

    if (!_.s.configOK) {
      getConfig(true);

    } else if (pricesNeeded(0)) {
      //Prices for today
      getPrices(0);

    } else if (logicRunNeeded()) {
      logic();

    } else if (pricesNeeded(1)) {
      //Prices for tomorrow
      getPrices(1);

    } else {
      //Nothing to do
      loopRunning = false;
    }

  } catch (err) {
    //Shouldn't happen
    log("loop() - virhe:" + err);
    loopRunning = false;
  }
}

/**
 * Returns true if we need prices for given day
 * 
 * @param {number} dayIndex 0 = today, 1 = tomorrow
 */
function pricesNeeded(dayIndex) {
  let now = new Date();
  let res = false;

  if (dayIndex == 1) {
    /*
    Getting prices for tomorrow if
      - we have a valid time
      - clock is past 15:00 local time (NOTE: Elering seems to have prices after 14.30 LOCAL time, no matter is it DST or not)
      - we don't have prices
    */
    res = _.s.timeOK && _.s.p[1].ts === 0 && now.getHours() >= 15;

  } else {
    /*
    Getting prices for today if
      - we have a valid time
      - we don't have prices OR prices aren't for this day
    */
    let dateChanged = getDate(new Date(_.s.p[0].ts * 1000)) !== getDate(now);

    //Clear tomorrow data
    if (dateChanged) {
      _.s.p[1].ts = 0;
      _.p[1] = [];
    }

    /*
    -----------------
    The following commented code moves tomorrow prices to today
    This way we don't need to get prices from Elering again

    If using this, comment out the if (dateChanged) { ... } above
    -----------------

    if (dateChanged && _.s.p[1].ts > 0 && getDate(new Date(_.s.p[1].ts * 1000)) !== getDate(now)) {
      //Copy tomorrow data
      _.p[0] = _.p[1];

      _.s.p[0] = Object.assign({}, _.s.p[1]);
      _.s.p[0].ts = epoch();

      //Clear tomorrow
      _.s.p[1].ts = 0;
      _.p[1] = [];

      //No need to fetch from server
      dateChanged = false;
    }
    */

    res = _.s.timeOK && (_.s.p[0].ts == 0 || dateChanged);
  }

  //If fetching prices has failed too many times -> wait until trying again
  if (_.s.errCnt >= C_ERRC && (epoch(now) - _.s.errTs) < C_ERRD) {
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

  //for debugging (run every minute)
  /*return (chk.getMinutes() !== now.getMinutes()
    || chk.getFullYear() !== now.getFullYear())
    || (_.s.fCmdTs > 0 && _.s.fCmdTs - epoch(now) < 0)
    || (_.s.fCmdTs == 0 && _.c.min < 60 && now.getMinutes() >= _.c.min && (_.s.cmd + _.c.inv) == 1);
*/

  /*
    Logic should be run if
    - hour has changed
    - year has changed (= time has been received)
    - manually forced command is active and time has passed
    - user wants the output to be commanded only for x first minutes of the hour which has passed (and command is not yet reset)
  */
  return (chk.getHours() !== now.getHours()
    || chk.getFullYear() !== now.getFullYear())
    || (_.s.fCmdTs > 0 && _.s.fCmdTs - epoch(now) < 0)
    || (_.s.fCmdTs == 0 && _.c.min < 60 && now.getMinutes() >= _.c.min && (_.s.cmd + _.c.inv) == 1);
}

/**
 * Gets prices and then runs the logic if needed
 * 
 * @param {number} dayIndex 0 = today, 1 = tomorrow
 */
function getPrices(dayIndex) {
  try {
    let now = new Date();
    updateTz(now);

    let date = dayIndex == 1
      ? new Date(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() + 24 * 60 * 60 * 1000) //tomorrow at 00:00
      : now;

    let start = date.getFullYear()
      + "-"
      + padStart(date.getMonth() + 1, 2, "0")
      + "-"
      + padStart(getDate(date), 2, "0")
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

    Shelly.call("HTTP.GET", req, function (res, err, msg) {
      req = null;

      try {
        if (err === 0 && res != null && res.code === 200 && res.body_b64) {
          //Clearing some fields to save memory
          res.headers = null;
          res.message = null;
          msg = null;

          _.p[dayIndex] = [];
          _.s.p[dayIndex].avg = 0;
          _.s.p[dayIndex].high = -999;
          _.s.p[dayIndex].low = 999;

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
            _.p[dayIndex].push(row);

            _.s.p[dayIndex].avg += row[1];

            if (row[1] > _.s.p[dayIndex].high) {
              _.s.p[dayIndex].high = row[1];
            }

            if (row[1] < _.s.p[dayIndex].low) {
              _.s.p[dayIndex].low = row[1];
            }

            //find next row
            activePos = res.body_b64.indexOf("\n", activePos);
          }

          //Again to save memory..
          res = null;

          //Calculate average and update timestamp
          _.s.p[dayIndex].avg = _.p[dayIndex].length > 0 ? (_.s.p[dayIndex].avg / _.p[dayIndex].length) : 0;
          _.s.p[dayIndex].ts = epoch(now);

          if (dayIndex == 1 && _.p[dayIndex].length < 23) {
            //Let's assume that if we have data for at least 23 hours everything is OK
            //This should take DST saving changes in account
            //If we get less the prices may not be updated yet to elering API?
            throw new Error("huomisen hintoja ei saatu");
          }


        } else {
          throw new Error("virhe: " + err + "(" + msg + ") - " + JSON.stringify(res));
        }

      } catch (err) {
        log("getPrices() - virhe:" + err);
        _.s.errCnt += 1;
        _.s.errTs = epoch();

        _.s.p[dayIndex].ts = 0;
        _.p[dayIndex] = [];
      }

      if (dayIndex == 1) {
        loopRunning = false;
        return;
      }

      //Today prices -> run logic ASAP
      Timer.set(1000, false, logic);
    });

  } catch (err) {
    log("getPrices() - virhe:" + err);
    _.s.p[dayIndex].ts = 0;
    _.p[dayIndex] = [];

    if (dayIndex == 1) {
      loopRunning = false;
      return;
    }

    //Today prices -> run logic ASAP
    Timer.set(1000, false, logic);
  }
}

/**
 * Sets relay output to cmd
 * If callback given, its called with success status, like cb(true)
 * 
 * @param {number} output output number
 * @param {Function} cb callback (optional)
 */
function setRelay(output, cb) {
  let prm = "{id:" + output + ",on:" + (cmd ? "true" : "false") + "}";

  Shelly.call("Switch.Set", prm, function (res, err, msg, cb) {
    if (err != 0) {
      log("setRelay() - ohjaus #" + output + " epäonnistui: " + err + " - " + msg);
    }

    cb(err == 0);
  }, cb);
}

/**
 * Runs the main logic
 */
function logic() {
  try {
    //This is a good time to update config if any overrides exist
    if (typeof USER_CONFIG == 'function') {
      _.c = USER_CONFIG(_.c, _, false);
    }

    cmd = false;
    let now = new Date();
    updateTz(now);
    updateCurrentPrice();

    if (_.c.mode === 0) {
      //Manual mode
      cmd = _.c.m0.cmd === 1;
      _.s.st = 1;

    } else if (_.s.timeOK && (_.s.p[0].ts > 0 && getDate(new Date(_.s.p[0].ts * 1000)) === getDate(now))) {
      //We have time and we have price data for today

      if (_.c.mode === 1) {
        //Price limit
        cmd = _.s.p[0].now <= (_.c.m1.lim == "avg" ? _.s.p[0].avg : _.c.m1.lim);
        _.s.st = cmd ? 2 : 3;

      } else if (_.c.mode === 2) {
        //Cheapest hours
        cmd = isCheapestHour();
        _.s.st = cmd ? 5 : 4;

        //always on price limit
        if (!cmd && _.s.p[0].now <= (_.c.m2.lim == "avg" ? _.s.p[0].avg : _.c.m2.lim)) {
          cmd = true;
          _.s.st = 6;
        }

        //maximum price
        if (cmd && _.s.p[0].now > (_.c.m2.m == "avg" ? _.s.p[0].avg : _.c.m2.m)) {
          cmd = false;
          _.s.st = 11;
        }
      }

    } else if (_.s.timeOK) {
      //We have time but no data for today
      _.s.st = 7;

      let binNow = (1 << now.getHours());
      if ((_.c.bk & binNow) == binNow) {
        cmd = true;
      }

    } else {
      //Time is not known
      cmd = _.c.err === 1;
      _.s.st = 8;
    }

    //Forced hours
    if (_.s.timeOK && _.c.fh > 0) {
      let binNow = (1 << now.getHours());
      if ((_.c.fh & binNow) == binNow) {
        cmd = (_.c.fhCmd & binNow) == binNow;
        _.s.st = 10;
      }
    }

    //Final check - if use wants to set command only for first x minutes
    //Manual force is only thing that overrides
    if (cmd && _.s.timeOK && now.getMinutes() >= _.c.min) {
      _.s.st = 13;
      cmd = false;
    }

    //Manual force
    if (_.s.timeOK && _.s.fCmdTs > 0) {
      if (_.s.fCmdTs - epoch(now) > 0) {
        cmd = _.s.fCmd == 1;
        _.s.st = 9;
      } else {
        _.s.fCmdTs = 0;
      }
    }

    function logicFinalize(finalCmd) {
      if (finalCmd == null) {
        //User script wants to re-run logic
        loopRunning = false;
        return;
      }
      //Normally cmd == finalCmd, but user script could change it
      if (cmd != finalCmd) {
        _.s.st = 12;
      }

      cmd = finalCmd;

      //Invert?
      if (_.c.inv) {
        cmd = !cmd;
      }

      if (_.c.oc == 1 && _.s.cmd == cmd) {
        //No need to write 
        log("logic(): lähtö on jo oikeassa tilassa");
        addHistory();
        _.s.cmd = cmd ? 1 : 0;
        _.s.chkTs = epoch();
        loopRunning = false;
        return;
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
              addHistory();
              _.s.cmd = cmd ? 1 : 0;
              _.s.chkTs = epoch();
            }

            loopRunning = false;
          }
        });
      }
    }


    //User script
    if (typeof USER_OVERRIDE == 'function') {
      USER_OVERRIDE(cmd, _, logicFinalize);
    } else {
      logicFinalize(cmd);
    }

  } catch (err) {
    log("logic() - virhe:" + JSON.stringify(err));
    loopRunning = false;
  }
}

/**
 * Returns true if current hour is one of the cheapest
 * 
 * DEV. NOTE: 
 * Variables are intentionally in global scope outside isCheapestHour()
 * 
 * There were memory issues with for-loops (random values)
 * Perhaps the stack was getting too full or something because of multiple for() loops
 * 
 * This fixes the operation 
 */
let _i = 0;
let _j = 0;
let _k = 0;
let _inc = 0;
let _cnt = 0;
let _start = 0;
let _end = 0;
function isCheapestHour() {
  //Safety checks
  _.c.m2.ps = limit(0, _.c.m2.ps, 23);
  _.c.m2.pe = limit(_.c.m2.ps, _.c.m2.pe, 24);
  _.c.m2.ps2 = limit(0, _.c.m2.ps2, 23);
  _.c.m2.pe2 = limit(_.c.m2.ps2, _.c.m2.pe2, 24);
  _.c.m2.cnt = limit(0, _.c.m2.cnt, _.c.m2.per > 0 ? _.c.m2.per : _.c.m2.pe - _.c.m2.ps);
  _.c.m2.cnt2 = limit(0, _.c.m2.cnt2, _.c.m2.pe2 - _.c.m2.ps2);

  //This is (and needs to be) 1:1 in both frontend and backend code
  let cheapest = [];

  //Select increment (a little hacky - to support custom periods too)
  _inc = _.c.m2.per < 0 ? 1 : _.c.m2.per;

  for (_i = 0; _i < _.p[0].length; _i += _inc) {
    _cnt = (_.c.m2.per == -2 && _i >= 1 ? _.c.m2.cnt2 : _.c.m2.cnt);

    //Safety check
    if (_cnt <= 0)
      continue;

    //Create array of indexes in selected period
    let order = [];

    //If custom period -> select hours from that range. Otherwise use this period
    _start = _i;
    _end = (_i + _.c.m2.per);

    if (_.c.m2.per < 0 && _i == 0) {
      //Custom period 1 
      _start = _.c.m2.ps;
      _end = _.c.m2.pe;

    } else if (_.c.m2.per == -2 && _i == 1) {
      //Custom period 2
      _start = _.c.m2.ps2;
      _end = _.c.m2.pe2;
    }

    for (_j = _start; _j < _end; _j++) {
      //If we have less hours than 24 then skip the rest from the end
      if (_j > _.p[0].length - 1)
        break;

      order.push(_j);
    }

    if (_.c.m2.sq) {
      //Find cheapest in a sequence
      //Loop through each possible starting index and compare average prices
      let avg = 999;
      let startIndex = 0;

      for (_j = 0; _j <= order.length - _cnt; _j++) {
        let sum = 0;

        //Calculate sum of these sequential hours
        for (_k = _j; _k < _j + _cnt; _k++) {
          sum += _.p[0][order[_k]][1];
        };

        //If average price of these sequential hours is lower -> it's better
        if (sum / _cnt < avg) {
          avg = sum / _cnt;
          startIndex = _j;
        }
      }

      for (_j = startIndex; _j < startIndex + _cnt; _j++) {
        cheapest.push(order[_j]);
      }

    } else {
      //Sort indexes by price
      _j = 0;

      for (_k = 1; _k < order.length; _k++) {
        let temp = order[_k];

        for (_j = _k - 1; _j >= 0 && _.p[0][temp][1] < _.p[0][order[_j]][1]; _j--) {
          order[_j + 1] = order[_j];
        }
        order[_j + 1] = temp;
      }

      //Select the cheapest ones
      for (_j = 0; _j < _cnt; _j++) {
        cheapest.push(order[_j]);
      }
    }

    //If custom period, quit when all periods are done (1 or 2 periods)
    if (_.c.m2.per == -1 || (_.c.m2.per == -2 && _i >= 1))
      break;
  }

  //Check if current hour is cheap enough
  let epochNow = epoch();
  let res = false;

  for (let i = 0; i < cheapest.length; i++) {
    let row = _.p[0][cheapest[i]];

    if (isCurrentHour(row[0], epochNow)) {
      //This hour is active -> current hour is one of the cheapest
      res = true;
      break;
    }
  }

  return res;
}

/**
 * Update current price to _.s.p[0].now
 * Returns true if OK, false if failed
 */
function updateCurrentPrice() {
  if (!_.s.timeOK || _.s.p[0].ts == 0) {
    _.s.p[0].now = 0;
    return;
  }

  let now = epoch();

  for (let i = 0; i < _.p[0].length; i++) {
    if (isCurrentHour(_.p[0][i][0], now)) {
      //This hour is active 
      _.s.p[0].now = _.p[0][i][1];
      return true;
    }
  }

  //If no price found it might be error OR because of timezone we don't have prices yet
  //If number of hours is less than 24 -> get prices again
  if (_.p[0].length < 24) {
    _.s.p[0].ts = 0;
  }

  _.s.p[0].now = 0;
  return false;
}

/**
 * Parses parameters from HTTP GET request query to array of objects
 * For example key=value&key2=value2
 * 
 * @param {string} params 
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
      response.body = JSON.stringify(_);
      GZIP = false;

    } else if (params.r === "r") {
      //r = reload settings
      _.s.configOK = false; //reload settings (prevent getting prices before new settings loaded )
      getConfig(false);
      _.s.p[0].ts = 0; //get prices
      _.s.p[1].ts = 0; //get prices
      response.code = 204;
      GZIP = false;

    } else if (params.r === "f" && params.ts) {
      //f = force
      _.s.fCmdTs = Number(params.ts);
      _.s.fCmd = Number(params.c);
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

    } else if (params.r === "history") {
      response.body = atob('#[tab-history.html]');
      MIME_TYPE = MIME_HTML;

    } else if (params.r === "history.js") {
      response.body = atob('#[tab-history.js]');
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
    log("http - virhe:" + err);
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