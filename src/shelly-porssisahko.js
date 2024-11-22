/**
 * @license
 * 
 * shelly-porssisahko
 * shelly-porssisahko-en
 * 
 * (c) Jussi isotalo - http://jisotalo.fi
 * https://github.com/jisotalo/shelly-porssisahko
 * https://github.com/jisotalo/shelly-porssisahko-en
 * 
 * License: GNU Affero General Public License v3.0 
 */

/** Constants etc. */
const CNST = {
  /** Number of instances (if INSTANCE_COUNT is set, use it instead) */
  INST_COUNT: typeof INSTANCE_COUNT === 'undefined' ? 3 : INSTANCE_COUNT,
  /** Maximum total number of history rows - this is later divided by enabled instance count (3 enabled instances -> 8 history per each)*/
  HIST_LEN: typeof HIST_LEN === 'undefined' ? 24 : HIST_LEN,
  /** How many errors with getting prices until to have a break */
  ERR_LIMIT: 3,
  /** How long to wait after multiple errors (>= ERR_LIMIT) before trying again (s) */
  ERR_DELAY: 120,

  /** Default status for an instance */
  DEF_INST_ST: {
    /** epoch when last check was done (logic was run) */
    chkTs: 0,
    /** status as number */
    st: 0,
    /** Additional status string (only meant to be used by user override scripts) */
    str: '',
    /** active command (-1 = not yet determined)*/
    cmd: -1,
    /** 1 if config is checked */
    configOK: 0,
    /** If forced manually, then this is the timestamp until the force is removed */
    fCmdTs: 0,
    /** If forced manually, then this is the command */
    fCmd: 0,
  },

  /** Default configs - deleted from memory after checking */
  DEF_CFG: {

    /** Default config for common settings */
    COM: {
      /** Group (country) to get prices from */
      g: 'fi',
      /** VAT added to spot price [%] */
      vat: 25.5,
      /** Day (07...22) transfer price [c/kWh] */
      day: 0,
      /** Night (22...07) transfer price [c/kWh] */
      night: 0,
      /** Instance names */
      names: []
    },

    /** Default config for instance settings */
    INST: {
      /** Enabled [0/1]*/
      en: 0,
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
        c: 0
      },
      /** Settings for mode 1 (price limit) */
      m1: {
        /** Price limit limit - if price <= relay output command is set on [c/kWh] */
        l: 0
      },
      /** Settings for mode 2 (cheapest hours) */
      m2: {
        /** Period length (-1 = custom range) [h] (example: 24 -> cheapest hours during 24h) */
        p: 24,
        /** How many cheapest hours */
        c: 0,
        /** Always on price limit [c/kWh] */
        l: -999,
        /** Should the hours be sequential / in a row [0/1] */
        s: 0,
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
        c2: 0,
      },
      /** Backup hours [binary] (example: 0b111111 = 00, 01, 02, 03, 04, 05) */
      b: 0b0,
      /** Relay output command if clock time is not known [0/1] */
      e: 0,
      /** Outputs IDs to use (array of numbers) */
      o: [0],
      /** Forced hours [binary] (example: 0b110000000000001100001 = 00, 05, 06, 19, 20) */
      f: 0b0,
      /** Forced hours commands [binary] (example: 0b110000000000001100000 = 05, 06, 19, 20 are forced to on, 00 to off (if forced as in above example "fh" setting) */
      fc: 0b0,
      /** Invert output [0/1] */
      i: 0,
      /** How many first minutes of the hour the output should be on [min]*/
      m: 60,
      /** Output config - when to set output (0 = always after running logic, 1 = only when output changes)*/
      oc: 0
    }
  }
};

/** Main state of app */
let _ = {
  s: {
    /** version number */
    v: "3.1.0",
    /** Device name */
    dn: '',
    /** 1 if config is checked */
    configOK: 0,
    /** 1 if we have somewhat ok time */
    timeOK: 0,
    /** active error count */
    errCnt: 0,
    /** epoch of last error */
    errTs: 0,
    /** epoch when started (when time was ok for first time) */
    upTs: 0,
    /** Active time zone as string (URL encoded - such as %2b02:00 = +02:00)*/
    tz: "+02:00",
    /** Active time zone hour difference*/
    tzh: 0,
    /** Enabled instance count */
    enCnt: 0,
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
    ]
  },
  /** status for instances */
  si: [CNST.DEF_INST_ST], //Initialized later - this is just for autocomplete
  /** price data [0] = today, [1] tomorrow - each item is array [epoch, price]*/
  p: [[], []],
  /** command history for each instance (each item is array [epoch, cmd, desc])*/
  h: [], //Initialized later

  /** actice config */
  c: {
    c: CNST.DEF_CFG.COM,
    i: [CNST.DEF_CFG.INST] //Initialized later - this is just for autocomplete
  }
};

/**
 * Common variables to prevent strange stack issues..
 */
let _i = 0;
let _j = 0;
let _k = 0;
let _inc = 0;
let _cnt = 0;
let _start = 0;
let _end = 0;
let cmd = []; // Active commands for each instances (internal)

/**
 * Previous epoch time
 * Used to see changes in system time
 */
let prevEpoch = 0;
  
/**
 * True if loop is currently running 
 * (new one is not started + HTTP requests are not handled)
 */
let loopRunning = false;

/**
 * Returns KVS key name for settings
 * 
 * @param {*} inst instance number 0..x or -1 = common
 * @returns 
 */
function getKvsKey(inst) {
  let key = "porssi";

  if (inst >= 0) {
    key = key + "-" + (inst + 1);
  }

  return key;
}

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
function log(str) {
  console.log("shelly-porssisahko: " + str);
}

/**
 * Adds command to history
 */
function addHistory(inst) {
  //Calculate history max length (based on instance count)
  let max = _.s.enCnt > 0
    ? CNST.HIST_LEN / _.s.enCnt
    : CNST.HIST_LEN;

  while (CNST.HIST_LEN > 0 && _.h[inst].length >= max) {
    _.h[inst].splice(0, 1);
  }
  _.h[inst].push([epoch(), cmd[inst] ? 1 : 0, _.si[inst].st]);
}

/**
 * Request all logics to run
 */
function reqLogic() {
  for (let i = 0; i < CNST.INST_COUNT; i++) {
    _.si[i].chkTs = 0;
  }
}

/**
 * Updates state (called intervally)
 * - Checks if time is OK
 * - Some things need to be kept up-to-date here
 */
function updateState() {
  let now = new Date();

  //Using unixtime from sys component to detect if NTP is synced (= time OK)
  //Previously used only Date() but after some firmware update it started to display strange dates at boot
  _.s.timeOK = Shelly.getComponentStatus("sys").unixtime != null && now.getFullYear() > 2000;
  _.s.dn = Shelly.getComponentConfig("sys").device.name;

  //Detecting if time has changed and getting prices again
  let epochNow = epoch(now);

  if (_.s.timeOK && Math.abs(epochNow - prevEpoch) > 300) {
    log("Time changed 5 min+ -> refresh");
    
    _.s.p[0].ts = 0; 
    _.s.p[0].now = 0; 
    _.s.p[1].ts = 0; 
    _.p[0] = [];
    _.p[1] = [];
  }

  prevEpoch = epochNow;

  //Instance stuff
  _.s.enCnt = 0;

  for (_i = 0; _i < CNST.INST_COUNT; _i++) {
    if (_.c.i[_i].en) {
      _.s.enCnt++; //Enabled instance count
    }
  }

  if (!_.s.upTs && _.s.timeOK) {
    _.s.upTs = epoch(now);
  }
}

/**
 * Checks configuration
 * If a config key is missings, adds a new one with default value
 */
function chkConfig(inst, callback) {
  let count = 0;

  //If config is already checked, do nothing (default configs removed from memory)
  if (!CNST.DEF_CFG.COM && !CNST.DEF_CFG.INST) {
    callback(true);
    return;
  }

  //Are we checking instance or common config
  let source = inst < 0 ? CNST.DEF_CFG.COM : CNST.DEF_CFG.INST;
  let target = inst < 0 ? _.c.c : _.c.i[inst];

  //Note: Hard-coded to max 2 levels
  for (let prop in source) {

    if (typeof target[prop] === "undefined") {
      target[prop] = source[prop];
      count++;

    } else if (typeof source[prop] === "object") {
      for (let innerProp in source[prop]) {
        if (typeof target[prop][innerProp] === "undefined") {
          target[prop][innerProp] = source[prop][innerProp];
          count++;
        }
      }
    }
  }

  //Deleting default config after 1st check to save memory
  if (inst >= CNST.INST_COUNT - 1) {
    CNST.DEF_CFG.COM = null;
    CNST.DEF_CFG.INST = null;
  }

  if (count > 0) {
    let key = getKvsKey(inst);

    Shelly.call("KVS.Set", { key: key, value: JSON.stringify(target) }, function (res, err, msg, callback) {
      if (err) {
        log("failed to set config: " + err + " - " + msg);
      }
      callback(err == 0);

    }, callback);
    return;
  }

  //All settings OK
  callback(true);
}

/**
 * Reads config from KVS.
 * Afterwards, sets loopRunning to false and starts another loop
 */
function getConfig(inst) {
  let key = getKvsKey(inst);

  Shelly.call('KVS.Get', { key: key }, function (res, err, msg) {
    if (inst < 0) {
      _.c.c = res ? JSON.parse(res.value) : {};
    } else {
      _.c.i[inst] = res ? JSON.parse(res.value) : {};
    }

    if (typeof USER_CONFIG == 'function') {
      USER_CONFIG(inst, true);
    }

    chkConfig(inst, function (ok) {
      //Common config or instance
      if (inst < 0) {
        _.s.configOK = ok ? 1 : 0;
      } else {
        log("config for #" + (inst + 1) + " read, enabled: " + _.c.i[inst].en);

        _.si[inst].configOK = ok ? 1 : 0;
        _.si[inst].chkTs = 0; //To run the logic again with new settings
      }

      loopRunning = false;
      Timer.set(500, false, loop);
    });
  });
}

/**
 * Background process loop
 */
function loop() {
  try {
    if (loopRunning) {
      return;
    }
    loopRunning = true;

    updateState();

    if (!_.s.configOK) {
      //Common config
      getConfig(-1);

    } else if (pricesNeeded(0)) {
      //Prices for today
      getPrices(0);

    } else if (pricesNeeded(1)) {
      //Prices for tomorrow
      getPrices(1);

    } else {
      //Instances
      //Separate loops to make sure configs are read first and in all cases
      for (let inst = 0; inst < CNST.INST_COUNT; inst++) {
        if (!_.si[inst].configOK) {
          //We need to update config to this instance
          getConfig(inst);
          return;
        }
      }

      for (let inst = 0; inst < CNST.INST_COUNT; inst++) {
        if (logicRunNeeded(inst)) {
          //We need to run logic for this instance
          //Running using a timer to prevent stack issues
          Timer.set(500, false, logic, inst);
          return;
        }
      }

      //If we are here, there is nothing to
      //Is there a user script?
      if (typeof USER_LOOP == 'function') {
        USER_LOOP();
      } else {
        loopRunning = false;
      }
    }
  } catch (err) {
    //Shouldn't happen
    log("error at main loop:" + err);
    loopRunning = false;
  }
}

/**
 * Returns true if we need to fetch prices for selected day
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

    res = _.s.timeOK && (_.s.p[0].ts == 0 || dateChanged);
  }

  //If fetching prices has failed too many times -> wait until trying again
  if (_.s.errCnt >= CNST.ERR_LIMIT && (epoch(now) - _.s.errTs) < CNST.ERR_DELAY) {
    res = false;

  } else if (_.s.errCnt >= CNST.ERR_LIMIT) {
    //We can clear error counter (time has passed)
    _.s.errCnt = 0;
  }

  return res;
}

/**
 * 
 */
/**
 * Returns true if we should run the logic now
 * for the selected instance
 * 
 * @param {*} inst instance number 0..x
 */
function logicRunNeeded(inst) {
  //Shortcuts
  let st = _.si[inst];
  let cfg = _.c.i[inst];

  //If not enabled, do nothing
  if (cfg.en != 1) {
    //clear history
    _.h[inst] = [];
    return false;
  }

  let now = new Date();
  let chk = new Date(st.chkTs * 1000);

  //for debugging (run every minute)
  /*return st.chkTs == 0
    || (chk.getMinutes() !== now.getMinutes()
      || chk.getFullYear() !== now.getFullYear())
    || (st.fCmdTs > 0 && st.fCmdTs - epoch(now) < 0)
    || (st.fCmdTs == 0 && cfg.m < 60 && now.getMinutes() >= cfg.m && (st.cmd + cfg.i) == 1);
*/

  /*
    Logic should be run if
    - never run before
    - hour has changed
    - year has changed (= time has been received)
    - manually forced command is active and time has passed
    - user wants the output to be commanded only for x first minutes of the hour which has passed (and command is not yet reset)
  */
  return st.chkTs == 0
    || (chk.getHours() !== now.getHours()
      || chk.getFullYear() !== now.getFullYear())
    || (st.fCmdTs > 0 && st.fCmdTs - epoch(now) < 0)
    || (st.fCmdTs == 0 && cfg.m < 60 && now.getMinutes() >= cfg.m && (st.cmd + cfg.i) == 1);
}

/**
 * Gets prices for selected day
 * 
 * @param {number} dayIndex 0 = today, 1 = tomorrow
 */
function getPrices(dayIndex) {
  try {
    log("fetching prices for day " + dayIndex)
    let now = new Date();
    updateTz(now);

    let date = dayIndex == 1
      ? new Date(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() + 24 * 60 * 60 * 1000) //tomorrow at 00:00
      : now;

    let start = date.getFullYear()
      + "-"
      + (date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1))
      + "-"
      + (getDate(date) < 10 ? "0" + getDate(date) : getDate(date))
      + "T00:00:00"
      + _.s.tz.replace("+", "%2b"); //URL encode the + character

    let end = start.replace("T00:00:00", "T23:59:59");

    let req = {
      url: "https://dashboard.elering.ee/api/nps/price/csv?fields=" + _.c.c.g + "&start=" + start + "&end=" + end,
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
            row[1] = row[1] / 10.0 * (100 + (row[1] > 0 ? _.c.c.vat : 0)) / 100.0;

            //Add transfer fees (if any)
            let hour = new Date(row[0] * 1000).getHours();

            if (hour >= 7 && hour < 22) {
              //day
              row[1] += _.c.c.day;
            } else {
              //night
              row[1] += _.c.c.night;
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

          if (_.p[dayIndex].length < 23) {
            //Let's assume that if we have data for at least 23 hours everything is OK
            //This should take DST saving changes in account
            //If we get less the prices may not be updated yet to elering API?
            throw new Error("invalid data received");
          }
        } else {
          throw new Error(err + "(" + msg + ") - " + JSON.stringify(res));
        }

      } catch (err) {
        log("error getting prices: " + err);
        _.s.errCnt += 1;
        _.s.errTs = epoch();
        _.s.p[dayIndex].ts = 0;
        _.p[dayIndex] = [];
      }

      //Done (success or not)
      //Run all logic again if prices are for today
      if (dayIndex == 0) {
        reqLogic();
      }

      loopRunning = false;
      Timer.set(500, false, loop);
    });

  } catch (err) {
    log("error getting prices: " + err);
    _.s.errCnt += 1;
    _.s.errTs = epoch();
    _.s.p[dayIndex].ts = 0;
    _.p[dayIndex] = [];

    //Done (error)
    //Run all logic again if prices are for today
    if (dayIndex == 0) {
      reqLogic();
    }

    loopRunning = false;
    Timer.set(500, false, loop);
  }
}

/**
 * Sets relay output to cmd
 * If callback given, its called with success status, like cb(true)
 * 
 * @param {number} output output number
 * @param {Function} callback callback to call after done
 */
function setRelay(inst, output, callback) {
  let prm = "{id:" + output + ",on:" + (cmd[inst] ? "true" : "false") + "}";

  Shelly.call("Switch.Set", prm, function (res, err, msg, cb) {
    if (err != 0) {
      log("setting output " + output + " failed: " + err + " - " + msg);
    }

    callback(err == 0);
  }, callback);
}

/**
 * Runs the main logic
 */
function logic(inst) {
  try {
    //This is a good time to update config if any overrides exist
    if (typeof USER_CONFIG == 'function') {
      USER_CONFIG(inst, false);
    }

    cmd[inst] = false;
    let now = new Date();
    updateTz(now);
    updateCurrentPrice();

    let st = _.si[inst];
    let cfg = _.c.i[inst];


    if (cfg.mode === 0) {
      //Manual mode
      cmd[inst] = cfg.m0.c === 1;
      st.st = 1;

    } else if (_.s.timeOK && (_.s.p[0].ts > 0 && getDate(new Date(_.s.p[0].ts * 1000)) === getDate(now))) {
      //We have time and we have price data for today

      if (cfg.mode === 1) {
        //Price limit
        cmd[inst] = _.s.p[0].now <= (cfg.m1.l == "avg" ? _.s.p[0].avg : cfg.m1.l);
        st.st = cmd[inst] ? 2 : 3;

      } else if (cfg.mode === 2) {
        //Cheapest hours
        cmd[inst] = isCheapestHour(inst);
        st.st = cmd[inst] ? 5 : 4;

        //always on price limit
        if (!cmd[inst] && _.s.p[0].now <= (cfg.m2.l == "avg" ? _.s.p[0].avg : cfg.m2.l)) {
          cmd[inst] = true;
          st.st = 6;
        }

        //maximum price
        if (cmd[inst] && _.s.p[0].now > (cfg.m2.m == "avg" ? _.s.p[0].avg : cfg.m2.m)) {
          cmd[inst] = false;
          st.st = 11;
        }
      }

    } else if (_.s.timeOK) {
      //We have time but no data for today
      st.st = 7;

      let binNow = (1 << now.getHours());
      if ((cfg.b & binNow) == binNow) {
        cmd[inst] = true;
      }

    } else {
      //Time is not known
      cmd[inst] = cfg.e === 1;
      st.st = 8;
    }

    //Forced hours
    if (_.s.timeOK && cfg.f > 0) {
      let binNow = (1 << now.getHours());
      if ((cfg.f & binNow) == binNow) {
        cmd[inst] = (cfg.fc & binNow) == binNow;
        st.st = 10;
      }
    }

    //Final check - if user wants to set command only for first x minutes
    //Manual force is only thing that overrides
    if (cmd[inst] && _.s.timeOK && now.getMinutes() >= cfg.m) {
      st.st = 13;
      cmd[inst] = false;
    }

    //Manual force
    if (_.s.timeOK && st.fCmdTs > 0) {
      if (st.fCmdTs - epoch(now) > 0) {
        cmd[inst] = st.fCmd == 1;
        st.st = 9;
      } else {
        st.fCmdTs = 0;
      }
    }

    function logicFinalize(finalCmd) {
      if (finalCmd == null) {
        //User script wants to re-run logic
        loopRunning = false;
        return;
      }
      //Normally cmd == finalCmd, but user script could change it
      if (cmd[inst] != finalCmd) {
        st.st = 12;
      }

      cmd[inst] = finalCmd;

      //Invert?
      if (cfg.i) {
        cmd[inst] = !cmd[inst];
      }
      log("logic for #" + (inst + 1) + " done, cmd: " + finalCmd + " -> output: " + cmd[inst]);

      if (cfg.oc == 1 && st.cmd == cmd[inst]) {
        //No need to write 
        log("outputs already set for #" + (inst + 1));
        addHistory(inst);
        st.cmd = cmd[inst] ? 1 : 0;
        st.chkTs = epoch();
        loopRunning = false;
        return;
      }

      let cnt = 0;
      let success = 0;

      for (let i = 0; i < cfg.o.length; i++) {
        setRelay(inst, cfg.o[i], function (res) {
          cnt++;

          if (res) {
            success++;
          }

          if (cnt == cfg.o.length) {
            //All done
            if (success == cnt) {
              addHistory(inst);
              st.cmd = cmd[inst] ? 1 : 0;
              st.chkTs = epoch();

              //We can continue almost immediately as everything went nicely
              Timer.set(500, false, loop);
            }

            loopRunning = false;
          }
        });
      }
    }

    //User script
    if (typeof USER_OVERRIDE == 'function') {
      USER_OVERRIDE(inst, cmd[inst], logicFinalize);
    } else {
      logicFinalize(cmd[inst]);
    }

  } catch (err) {
    log("error running logic: " + JSON.stringify(err));
    loopRunning = false;
  }
}

/**
 * Returns true if current hour is one of the cheapest
 * 
 * NOTE: Variables starting with _ are intentionally in global scope
 * to fix memory/stack issues
 */
let _avg = 999;
let _startIndex = 0;
let _sum = 0;

function isCheapestHour(inst) {
  let cfg = _.c.i[inst];

  //Safety checks
  cfg.m2.ps = limit(0, cfg.m2.ps, 23);
  cfg.m2.pe = limit(cfg.m2.ps, cfg.m2.pe, 24);
  cfg.m2.ps2 = limit(0, cfg.m2.ps2, 23);
  cfg.m2.pe2 = limit(cfg.m2.ps2, cfg.m2.pe2, 24);
  cfg.m2.c = limit(0, cfg.m2.c, cfg.m2.p > 0 ? cfg.m2.p : cfg.m2.pe - cfg.m2.ps);
  cfg.m2.c2 = limit(0, cfg.m2.c2, cfg.m2.pe2 - cfg.m2.ps2);

  //This is (and needs to be) 1:1 in both frontend and backend code
  let cheapest = [];

  //Select increment (a little hacky - to support custom periods too)
  _inc = cfg.m2.p < 0 ? 1 : cfg.m2.p;

  for (_i = 0; _i < _.p[0].length; _i += _inc) {
    _cnt = (cfg.m2.p == -2 && _i >= 1 ? cfg.m2.c2 : cfg.m2.c);

    //Safety check
    if (_cnt <= 0)
      continue;

    //Create array of indexes in selected period
    let order = [];

    //If custom period -> select hours from that range. Otherwise use this period
    _start = _i;
    _end = (_i + cfg.m2.p);

    if (cfg.m2.p < 0 && _i == 0) {
      //Custom period 1 
      _start = cfg.m2.ps;
      _end = cfg.m2.pe;

    } else if (cfg.m2.p == -2 && _i == 1) {
      //Custom period 2
      _start = cfg.m2.ps2;
      _end = cfg.m2.pe2;
    }

    for (_j = _start; _j < _end; _j++) {
      //If we have less hours than 24 then skip the rest from the end
      if (_j > _.p[0].length - 1)
        break;

      order.push(_j);
    }

    if (cfg.m2.s) {
      //Find cheapest in a sequence
      //Loop through each possible starting index and compare average prices
      _avg = 999;
      _startIndex = 0;

      for (_j = 0; _j <= order.length - _cnt; _j++) {
        _sum = 0;

        //Calculate sum of these sequential hours
        for (_k = _j; _k < _j + _cnt; _k++) {
          _sum += _.p[0][order[_k]][1];
        };

        //If average price of these sequential hours is lower -> it's better
        if (_sum / _cnt < _avg) {
          _avg = _sum / _cnt;
          _startIndex = _j;
        }
      }

      for (_j = _startIndex; _j < _startIndex + _cnt; _j++) {
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
    if (cfg.m2.p == -1 || (cfg.m2.p == -2 && _i >= 1))
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
    _.s.p[0].ts == 0;
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

  //If we are here the active hour wasn't found
  //This means that Shelly clock is wrong or we have prices for wrong date (Shelly clock _was_ wrong, but no longer)
  //All we can do is clear active prices and try again
  //Let's also increase error counter to prevent flooding Elering if things go terribly wrong
  _.s.timeOK = false;
  _.s.p[0].ts = 0;
  _.s.errCnt += 1;
  _.s.errTs = epoch();
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
    let inst = parseInt(params.i);

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

      if (inst >= 0 && inst < CNST.INST_COUNT) {
        //Building status object for certain instance
        response.body = JSON.stringify({
          s: _.s,
          si: _.si[inst],
          c: _.c.c,
          ci: _.c.i[inst],
          p: _.p
        });
      }
      GZIP = false;

    } else if (params.r === "c") {
      //c = get config
      updateState();

      if (inst >= 0 && inst < CNST.INST_COUNT) {
        response.body = JSON.stringify(_.c.i[inst]);
      } else {
        //common
        response.body = JSON.stringify(_.c.c);
      }

      GZIP = false;

    } else if (params.r === "h") {
      //h = get history
      if (inst >= 0 && inst < CNST.INST_COUNT) {
        response.body = JSON.stringify(_.h[inst]);
      }

      GZIP = false;

    } else if (params.r === "r") {
      //r = reload settings
      if (inst >= 0 && inst < CNST.INST_COUNT) {
        //Just one instance
        log("config changed for #" + (inst + 1));
        _.si[inst].configOK = false;

      } else {
        //For all
        log("config changed");
        for (let i = 0; i < CNST.INST_COUNT; i++) {
          _.si[i].configOK = false;
        }
      }

      _.s.configOK = false; //reload settings (prevent getting prices before new settings loaded )

      reqLogic();

      if (!loopRunning) {
        loopRunning = true;
        getConfig(inst);
      }

      _.s.p[0].ts = 0; //get prices
      _.s.p[1].ts = 0; //get prices

      response.code = 204;
      GZIP = false;

    } else if (params.r === "f" && params.ts) {
      //f = force
      if (inst >= 0 && inst < CNST.INST_COUNT) {
        _.si[inst].fCmdTs = Number(params.ts);
        _.si[inst].fCmd = Number(params.c);
        _.si[inst].chkTs = 0;
      }

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
    log("server error: " + err);
    response.code = 500;
  }
  response.send();
}

function initialize() {
  _.c.i.pop();
  _.si.pop();

  for (let inst = 0; inst < CNST.INST_COUNT; inst++) {
    _.si.push(Object.assign({}, CNST.DEF_INST_ST));
    _.c.i.push(Object.assign({}, CNST.DEF_CFG.INST));

    _.c.c.names.push("-");
    _.h.push([]);

    cmd.push(false);
  }

  CNST.DEF_INST_ST = null; //No longer needed

  prevEpoch = epoch();
}

//Startup
log("v." + _.s.v);
log("URL: http://" + (Shelly.getComponentStatus("wifi").sta_ip ?? "192.168.33.1") + "/script/" + Shelly.getCurrentScriptId());

initialize();

//Start server and loop
HTTPServer.registerEndpoint('', onServerRequest);
Timer.set(10000, true, loop);
loop();