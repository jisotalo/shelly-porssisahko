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

/**
 * Slot length (seconds) used for price indexing.
 * Default is 3600 (1 hour) for now.
 * With 15-minute pricing this can be changed to 900.
 * NOTE: If you change SLOT you MUST also adapt getPrices()
 *       Current implementation assumes hourly aggregation in CSV.
 */
const SLOT = 3600;

/**
 * Main constants and default config/state objects (4 chars max for memory efficiency)
 */
const CNST = {
  /** Number of instances (if INSTANCE_COUNT is set, use it instead) */
  INST: typeof INSTANCE_COUNT === 'undefined' ? 3 : INSTANCE_COUNT,
  /** Maximum total number of history rows - this is later divided by enabled instance count (3 enabled instances -> 8 history per each)*/
  HIST: typeof HIST_LEN === 'undefined' ? 24 : HIST_LEN,
  /** How many errors with getting prices until to have a break */
  ERRC: 3,
  /** How long to wait after multiple errors (>= ERR_LIMIT) before trying again (s) */
  ERRT: 120,

  /** Default status for an instance */
  DINS: {
    /** epoch when last check was done (logic was run) */
    cTs: 0,
    /** status as number */
    st: 0,
    /** Additional status string (only meant to be used by user override scripts) */
    str: '',
    /** active command (-1 = not yet determined)*/
    cmd: -1,
    /** 1 if config is checked */
    cOK: 0,
    /** If forced manually, then this is the timestamp until the force is removed */
    fTs: 0,
    /** If forced manually, then this is the command */
    fCmd: 0,
  },

  /** Default configs - deleted from memory after checking */
  DCFG: {
    /** Default config for common settings */
    COM: {
      /** Group (country) to get prices from */
      g: 'fi',
      /** VAT added to spot price [%] */
      vat: 25.5,
      /** Day (07...22) transfer price [c/kWh] */
      day: 0,
      /** Night (22...07) transfer price [c/kWh] */
      nite: 0,
      /** Instance names */
      nms: []
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
    v: "4.0.0",
    /** Device name */
    dn: '',
    /** 1 if config is checked */
    cOK: 0,
    /** 1 if we have somewhat ok time */
    tOK: 0,
    /** active error count */
    eCnt: 0,
    /** epoch of last error */
    eTs: 0,
    /** epoch when started (when time was ok for first time) */
    upTs: 0,
    /** Active time zone as string (URL encoded - such as %2b02:00 = +02:00)*/
    tz: "+02:00",
    /** Active time zone hour difference*/
    tzh: 0,
    /** Enabled instance count */
    enC: 0,
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
  si: [CNST.DINS], //Initialized later - this is just for autocomplete
  /* Original price data 'p: [[],[]]', [0] = today, [1] tomorrow - each item is array [epoch, price]
   * Replaced by pv and ps for memory efficiency. ps has starting epoch for the day.
   * 'pv: [[],[]]', [0] = today, [1] tomorrow - each item is array [price].
   * Epochs per price index are calculated on the fly when needed.
  */
  ps: [0, 0],
  pv: [[], []],
  /** command history for each instance (each item is array [epoch, cmd, desc])*/
  h: [], //Initialized later

  /** active config */
  c: {
    c: CNST.DCFG.COM,
    i: [CNST.DCFG.INST] //Initialized later - this is just for autocomplete
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
let _st = 0;
let _end = 0;
let cmd = []; // Active commands for each instances (internal)

/**
 * Previous epoch time
 * Used to see changes in system time
 */
let pEp = 0;

/**
 * True if loop is currently running 
 * (new one is not started + HTTP requests are not handled)
 */
let lRun = false;

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

/** Clears price data for a specific day
 *
 * @param {number} dayIndex
 */
function clearPrice(dayIndex) {
  _.pv[dayIndex].splice(0); // clears but preserves array reference
  _.ps[dayIndex] = 0;
  _.s.p[dayIndex].ts = 0;
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
    clearPrice(0);
    clearPrice(1);
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
  let max = _.s.enC > 0
    ? CNST.HIST / _.s.enC
    : CNST.HIST;
  while (CNST.HIST > 0 && _.h[inst].length >= max) {
    _.h[inst].splice(0, 1);
  }
  _.h[inst].push([epoch(), cmd[inst] ? 1 : 0, _.si[inst].st]);
}

/**
 * Request all logics to run
 */
function reqLogic() {
  for (let i = 0; i < CNST.INST; i++) {
    _.si[i].cTs = 0;
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
  _.s.tOK = Shelly.getComponentStatus("sys").unixtime != null && now.getFullYear() > 2000;
  _.s.dn = Shelly.getComponentConfig("sys").device.name;

  //Detecting if time has changed and getting prices again
  let nEp = epoch(now);

  if (_.s.tOK && Math.abs(nEp - pEp) > 300) {
    log("Time changed 5 min+ -> refresh");
    _.s.p[0].now = 0;
    clearPrice(0);
    clearPrice(1);
  }
  pEp = nEp;

  //Instance stuff
  _.s.enC = 0;
  for (_i = 0; _i < CNST.INST; _i++) {
    if (_.c.i[_i].en) {
      _.s.enC++; //Enabled instance count
    }
  }

  if (!_.s.upTs && _.s.tOK) {
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
  if (!CNST.DCFG.COM && !CNST.DCFG.INST) {
    callback(true);
    return;
  }

  //Are we checking instance or common config
  let source = inst < 0 ? CNST.DCFG.COM : CNST.DCFG.INST;
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
  if (inst >= CNST.INST - 1) {
    CNST.DCFG.COM = null;
    CNST.DCFG.INST = null;
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
 * Afterwards, sets lRun to false and starts another loop
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
        _.s.cOK = ok ? 1 : 0;
      } else {
        log("config for #" + (inst + 1) + " read, enabled: " + _.c.i[inst].en);
        _.si[inst].cOK = ok ? 1 : 0;
        _.si[inst].cTs = 0; //To run the logic again with new settings
      }
      lRun = false;
      Timer.set(500, false, loop);
    });
  });
}

/**
 * Background process loop
 */
function loop() {
  try {
    if (lRun) {
      return;
    }
    lRun = true;

    updateState();

    if (!_.s.cOK) {
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
      for (let inst = 0; inst < CNST.INST; inst++) {
        if (!_.si[inst].cOK) {
          //We need to update config to this instance
          getConfig(inst);
          return;
        }
      }

      for (let inst = 0; inst < CNST.INST; inst++) {
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
        lRun = false;
      }
    }
  } catch (err) {
    //Shouldn't happen
    log("error at main loop:" + err);
    lRun = false;
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
  res = _.s.tOK && _.s.p[1].ts === 0 && now.getHours() >= 15;

  } else {
    /*
    Getting prices for today if
      - we have a valid time
      - we don't have prices OR prices aren't for this day
    */
    let dateChanged = getDate(new Date(_.s.p[0].ts * 1000)) !== getDate(now);

    //Clear tomorrow data
    if (dateChanged) {
      clearPrice(1);
    }

  res = _.s.tOK && (_.s.p[0].ts == 0 || dateChanged);
  }

  //If fetching prices has failed too many times -> wait until trying again
  if (_.s.eCnt >= CNST.ERRC && (epoch(now) - _.s.eTs) < CNST.ERRT) {
    res = false;
  } else if (_.s.eCnt >= CNST.ERRC) {
    //We can clear error counter (time has passed)
    _.s.eCnt = 0;
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
  let chk = new Date(st.cTs * 1000);

  //for debugging (run every minute)
  /*
  return st.chkTs == 0
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
  return st.cTs == 0
    || (chk.getHours() !== now.getHours()
      || chk.getFullYear() !== now.getFullYear())
    || (st.fTs > 0 && st.fTs - epoch(now) < 0)
    || (st.fTs == 0 && cfg.m < 60 && now.getMinutes() >= cfg.m && (st.cmd + cfg.i) == 1);
}

/**
 * Gets prices for selected day
 *
 * 1. Fetches price data in chunks
 *   - Single 24-hour request can cause memory pressure on Shelly
 *   - Currently using 2x 12-hour chunks to flood less likely
 * 2. Parses CSV response and aggregates hourly averages
 * 3. Stores prices in _.pv[dayIndex] array (one price per slot)
 * 4. Calculates daily statistics (avg, high, low)
 *
 * @param {number} dayIndex 0 = today, 1 = tomorrow
 */
function getPrices(dayIndex) {
  try {
    log("fetching prices for day " + dayIndex);
    let now = new Date();
    updateTz(now);

    // Calculate target date (today or tomorrow at 00:00)
    let date = dayIndex == 1
      ? new Date(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() + 24 * 60 * 60 * 1000) //tomorrow at 00:00
      : now;

    // Helper to format date string
    // Returns (e.g., "2025-01-19T00:00:00+02:00")
    function formatDate(date, hour, min, sec) {
      return date.getFullYear()
        + "-"
        + (date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1))
        + "-"
        + (getDate(date) < 10 ? "0" + getDate(date) : getDate(date))
        + "T"
        + (hour < 10 ? "0" + hour : hour)
        + ":"
        + (min < 10 ? "0" + min : min)
        + ":"
        + (sec < 10 ? "0" + sec : sec)
        + _.s.tz.replace("+", "%2b"); //URL encode the + character
    }

    // --- CHUNK CONFIGURATION ---
    // One 24-hour chunk
    // let cRng = [
    //   { strt: formatDate(date, 0, 0, 0), end: formatDate(date, 23, 59, 59) }
    // ];

    // Two 12-hour chunks. Currently seems sufficient from memory perspective
    let cRng = [
      { strt: formatDate(date, 0, 0, 0), end: formatDate(date, 11, 59, 59) },
      { strt: formatDate(date, 12, 0, 0), end: formatDate(date, 23, 59, 59) }
    ];

    // Four 6-hour chunks
    // let cRng = [
    //   { strt: formatDate(date, 0, 0, 0), end: formatDate(date, 5, 59, 59) },
    //   { strt: formatDate(date, 6, 0, 0), end: formatDate(date, 11, 59, 59) },
    //   { strt: formatDate(date, 12, 0, 0), end: formatDate(date, 17, 59, 59) },
    //   { strt: formatDate(date, 18, 0, 0), end: formatDate(date, 23, 59, 59) }
    // ];

    //Clearing variables to save memory
    date = null;

    // Initialize result arrays and statistics
    // These persist across all chunks and accumulate data
    _.pv[dayIndex] = [];
    _.s.p[dayIndex].avg = 0;
    _.s.p[dayIndex].high = -999;
    _.s.p[dayIndex].low = 999;

    /**
     * Helper: Handle price fetch errors
     */
    function handleError(errMsg) {
      log("error getting prices: " + errMsg);
      _.s.eCnt += 1;
      _.s.eTs = epoch();
      clearPrice(dayIndex);

      // Trigger logic re-run if today's prices failed
      if (dayIndex == 0) {
        reqLogic();
      }

      lRun = false;
      Timer.set(500, false, loop);
    }

    /**
     * Fetches chunks sequentially (one after another)
     * - Prevent memory spikes from multiple simultaneous requests
     * - Easy error handling, if chunk N fails, we stop
     * - Maintains data order
     *
     * @param {number} idx Current chunk index (0, 1, 2, ...)
     */
    function fetchChunk(idx) {
      // --- All chunks successfully fetched ---
      if (idx >= cRng.length) {
        let slotCount = _.pv[dayIndex].length;
        _.s.p[dayIndex].avg = slotCount > 0 ? (_.s.p[dayIndex].avg / slotCount) : 0;
        _.s.p[dayIndex].ts = epoch(now);

        // Validate we have enough data (assume 23-hours is OK)
        let minSlots = (86400 / SLOT) - 1;
        if (slotCount < minSlots) {
          log("invalid data: got " + slotCount + " slots, expected " + minSlots);
          handleError("insufficient slot count");
          cRng = null;
          return;
        }

        // Trigger logic re-run if today's prices were updated
        if (dayIndex == 0) {
          reqLogic();
        }
        lRun = false;
        Timer.set(500, false, loop);
        cRng = null;
        return;
      }

      // --- Fetch next chunk ---
      let req = {
        url: "https://dashboard.elering.ee/api/nps/price/csv?fields=" + _.c.c.g
          + "&start=" + cRng[idx].strt
          + "&end=" + cRng[idx].end,
        timeout: 5,
        ssl_ca: "*"
      };

      Shelly.call("HTTP.GET", req, function(res, err, msg) {
        try {
          if (err !== 0 || !res || res.code !== 200 || !res.body_b64) {
            throw new Error("HTTP error: " + err + " (" + msg + ") - " + JSON.stringify(res));
          }
          //Clearing some fields to save memory
          res.headers = null;
          res.message = null;
          res.code = null;
          msg = null;
          err = null;

          //Converting base64 to text
          res.body_b64 = atob(res.body_b64);

          //Discarding header
          res.body_b64 = res.body_b64.substring(res.body_b64.indexOf("\n") + 1);

          let activePos = 0;
          let valueCount = 0;
          let activeSlot = -1;
          let activeData = [-1, 0];

          /**
           * Helper: Finalizes current slot and adds it to results
           * - Calculates average price if multiple samples exist (for sub-hourly data)
           * - Sets start epoch (_.ps[dayIndex]) on first slot
           * - Adds price to result array (_.pv[dayIndex])
           * - Updates daily statistics (avg, high, low)
           */
          function addSlot() {
            if (valueCount <= 0) return;
            activeData[1] = activeData[1] / valueCount;

            // Set start epoch on first slot
            if (_.pv[dayIndex].length === 0) {
              _.ps[dayIndex] = activeData[0];
            }

            _.pv[dayIndex].push(activeData[1]);

            //Calculating daily avg and highest/lowest
            _.s.p[dayIndex].avg += activeData[1];

            if (activeData[1] > _.s.p[dayIndex].high) {
                _.s.p[dayIndex].high = activeData[1];
            }

            if (activeData[1] < _.s.p[dayIndex].low) {
                _.s.p[dayIndex].low = activeData[1];
            }
          }

          // Parsing CSV rows
          // Example:
          //   "Ajatempel (UTC)";"Kuupäev (Eesti aeg)";"NPS Soome"
          //   "1760475600";"15.10.2025 00:00";"120,5"
          //   "1760476500";"15.10.2025 00:15";"98,71"
          while (activePos >= 0) {
            res.body_b64 = res.body_b64.substring(activePos);
            activePos = 0;

            let row = [0, 0];
            activePos = res.body_b64.indexOf("\"", activePos) + 1;

            if (activePos === 0) {
              //" character not found -> end of data
              if (valueCount > 0) {
                addSlot();
              }

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
              row[1] += _.c.c.nite;
            }

            //find next row
            activePos = res.body_b64.indexOf("\n", activePos);
            
            //If first row, set the epoch
            if (activeSlot < 0) {
              activeData[0] = row[0];
              activeSlot = hour;
            }

            //If new hour (or EOF), we should handle the previous one
            if (activeSlot != hour || activePos < 0) {
              addSlot();

              //Take starting epoch and reset total
              activeData = [row[0], 0];

              valueCount = 0;
              activeSlot = hour;
            }

            activeData[1] += row[1];
            valueCount++;
          }

          //Again to save memory..
          res = null;

        } catch (err) {
          handleError("chunk " + idx + " parse error: " + err);
          return;
        }

        // --- Fetch next chunk ---
        fetchChunk(idx + 1);
      });
    }

    // Start fetching chunks sequentially
    fetchChunk(0);

  } catch (err) {
    handleError("setup error: " + err);
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

    } else if (_.s.tOK && (_.s.p[0].ts > 0 && getDate(new Date(_.s.p[0].ts * 1000)) === getDate(now))) {
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

    } else if (_.s.tOK) {
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
    if (_.s.tOK && cfg.f > 0) {
      let binNow = (1 << now.getHours());
      if ((cfg.f & binNow) == binNow) {
        cmd[inst] = (cfg.fc & binNow) == binNow;
        st.st = 10;
      }
    }

    //Final check - if user wants to set command only for first x minutes
    //Manual force is only thing that overrides
    if (cmd[inst] && _.s.tOK && now.getMinutes() >= cfg.m) {
      st.st = 13;
      cmd[inst] = false;
    }

    //Manual force
    if (_.s.tOK && st.fTs > 0) {
      if (st.fTs - epoch(now) > 0) {
        cmd[inst] = st.fCmd == 1;
        st.st = 9;
      } else {
        st.fTs = 0;
      }
    }

    function logicFinalize(finalCmd) {
      if (finalCmd == null) {
        //User script wants to re-run logic
        lRun = false;
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
        st.cmd = cmd[inst] ? 1 : 0;
        st.cTs = epoch();
        lRun = false;
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
              if (st.cmd != cmd[inst]) {
                addHistory(inst);
              }

              st.cmd = cmd[inst] ? 1 : 0;
              st.cTs = epoch();

              //We can continue almost immediately as everything went nicely
              Timer.set(500, false, loop);
            }

            lRun = false;
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
    lRun = false;
  }
}

/**
 * Returns true if current hour is one of the cheapest
 * 
 * NOTE: Variables starting with _ are intentionally in global scope
 * to fix memory/stack issues
 */
let _avg = 999;
let _sId = 0;
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

  // Use compact price array and start epoch
  let slotPrices = _.pv[0];
  if (!slotPrices || slotPrices.length === 0 || !_.ps[0]) {
    return false;
  }

   //This is (and needs to be) 1:1 in both frontend and backend code
 let cheapest = [];

  //Select increment (a little hacky - to support custom periods too)
  _inc = cfg.m2.p < 0 ? 1 : cfg.m2.p;

  for (_i = 0; _i < slotPrices.length; _i += _inc) {
    _cnt = (cfg.m2.p == -2 && _i >= 1 ? cfg.m2.c2 : cfg.m2.c);

    //Safety check
    if (_cnt <= 0)
      continue;

    //Create array of indexes in selected period
    let order = [];

    //If custom period -> select slots from that range. Otherwise use this period
    _st = _i;
    _end = (_i + cfg.m2.p);

    if (cfg.m2.p < 0 && _i == 0) {
      //Custom period 1
      _st = cfg.m2.ps;
      _end = cfg.m2.pe;

    } else if (cfg.m2.p == -2 && _i == 1) {
      //Custom period 2
      _st = cfg.m2.ps2;
      _end = cfg.m2.pe2;
    }

    // Build array of indices for this period
    for (_j = _st; _j < _end && _j < slotPrices.length; _j++) {
      order.push(_j);
    }

    // Skip if no valid slots in period
    if (order.length === 0) continue;

    if (cfg.m2.s) {
      //Find cheapest in a sequence
      //Loop through each possible starting index and compare average prices
      _avg = 999;
      _sId = 0;

      for (_j = 0; _j <= order.length - _cnt; _j++) {
        _sum = 0;

        //Calculate sum of these sequential slots
        for (_k = _j; _k < _j + _cnt; _k++) {
          _sum += slotPrices[order[_k]];
        };

        //If average price of these sequential slots is lower -> it's better
        if (_sum / _cnt < _avg) {
          _avg = _sum / _cnt;
          _sId = _j;
        }
      }

      for (_j = _sId; _j < _sId + _cnt; _j++) {
        cheapest.push(order[_j]);
      }

    } else {
      //Sort indexes by price
      _j = 0;

      for (_k = 1; _k < order.length; _k++) {
        let temp = order[_k];

        // Find correct position by comparing prices
        _j = _k - 1;
        while (_j >= 0 && slotPrices[temp] < slotPrices[order[_j]]) {
          order[_j + 1] = order[_j];
          _j--;
        }
        order[_j + 1] = temp;
      }

      //Select the cheapest ones
      for (_j = 0; _j < _cnt && _j < order.length; _j++) {
        cheapest.push(order[_j]);
      }
    }

    //If custom period, quit when all periods are done (1 or 2 periods)
    if (cfg.m2.p == -1 || (cfg.m2.p == -2 && _i >= 1))
      break;
  }

  //Check if current slot is cheap enough
  let nEp = epoch();

  // Convert current epoch to slot index relative to start epoch
  // This is O(1) instead of scanning all slots
  let relSlot = Math.floor((nEp - _.ps[0]) / SLOT);

  // Validate index is in valid range
  if (relSlot < 0 || relSlot >= slotPrices.length) {
    return false;
  }

  // Check if current slot index is in cheapest array
  for (let i = 0; i < cheapest.length; i++) {
    if (cheapest[i] === relSlot) {
      return true;
    }
  }

  return false;
}

/**
 * Update current price to _.s.p[0].now
 * Returns true if OK, false if failed
 *
 * - Prices are stored in _.pv[0] array (one price per time slot)
 * - _.ps[0] is the epoch timestamp of the FIRST slot (e.g., midnight)
 * - Each slot represents SLOT seconds (e.g., 3600 = 1 hour)
 * - We calculate which slot index matches the current time
 *
 * Example (with SLOT=3600, hourly prices):
 *   _.ps[0] = 1640995200  (Jan 1, 2022 00:00:00)
 *   now     = 1641002400  (Jan 1, 2022 02:00:00)
 *   diff    = 7200 seconds
 *   idx     = 7200 / 3600 = 2  → Use _.pv[0][2] (price for hour 02:00)
 */
function updateCurrentPrice() {
  // Early exit if we don't have valid price data
  if (!_.s.tOK || _.s.p[0].ts == 0 || !_.ps[0] || _.pv[0].length === 0) {
    _.s.p[0].now = 0;
    return;
  }

  // Calculate time difference from start of price data
  const now = epoch();
  const diff = now - _.ps[0];
  // Sanity check: If current time is BEFORE price data starts, something is wrong
  if (diff < 0) { _.s.p[0].now = 0; return; }

  // Calculate which slot index corresponds to current time
  // Example: If 7200 seconds elapsed and SLOT=3600, idx=2 (third slot, index 2)
  const idx = Math.floor(diff / SLOT);
  // Tolerance for end-of-day boundary (allows prices within last minute to still be valid)
  const tol = 60;

  // Normal - index is within valid range
  if (idx >= 0 && idx < _.pv[0].length) {
    _.s.p[0].now = _.pv[0][idx];
  // Last minute - we're in the final minute of the last slot
  // Example: Last slot ends at 23:59:59, current time is 23:59:30
  //   idx = 24 (out of range for 24-hour array [0-23])
  //   but we're still within the last slot, so use last price
  } else if (idx === _.pv[0].length && diff - (_.pv[0].length * SLOT) < tol) {
    _.s.p[0].now = _.pv[0][_.pv[0].length - 1];
  // Error - index is completely out of range
  // Something went wrong, possible reasons:
  //   a) System clock wrong
  //   b) Price data is wrong
  } else {
    log("updateCurrentPrice: out-of-range idx=" + idx);
    _.s.tOK = false;
    clearPrice(0);
    _.s.eCnt++;
    _.s.eTs = epoch();
  }
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
    if (lRun) {
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

      if (inst >= 0 && inst < CNST.INST) {
        // Build minimal object - send compact price data directly
        let resp = {
          s: _.s,
          si: _.si[inst],
          c: _.c.c,
          ci: _.c.i[inst],
          // Send compact price format with metadata
          p: [
            { ps: _.ps[0], pv: _.pv[0] },  // today
            { ps: _.ps[1], pv: _.pv[1] }   // tomorrow
          ],
          slot: SLOT  // Frontend needs this to calculate epochs
        };
        response.body = JSON.stringify(resp);
      }
      GZIP = false;

    } else if (params.r === "c") {
      //c = get config
      updateState();

      if (inst >= 0 && inst < CNST.INST) {
        response.body = JSON.stringify(_.c.i[inst]);
      } else {
        //common
        response.body = JSON.stringify(_.c.c);
      }

      GZIP = false;

    } else if (params.r === "h") {
      //h = get history
      if (inst >= 0 && inst < CNST.INST) {
        response.body = JSON.stringify(_.h[inst]);
      }

      GZIP = false;

    } else if (params.r === "r") {
      //r = reload settings
      if (inst >= 0 && inst < CNST.INST) {
        //Just one instance
        log("config changed for #" + (inst + 1));
        _.si[inst].cOK = false;

      } else {
        //For all
        log("config changed");
        for (let i = 0; i < CNST.INST; i++) {
          _.si[i].cOK = false;
        }
      }

      _.s.cOK = false; //reload settings (prevent getting prices before new settings loaded )

      reqLogic();

      if (!lRun) {
        lRun = true;
        getConfig(inst);
      }

      clearPrice(0);
      clearPrice(1);

      response.code = 204;
      GZIP = false;

    } else if (params.r === "f" && params.ts) {
      //f = force
      if (inst >= 0 && inst < CNST.INST) {
        _.si[inst].fTs = Number(params.ts);
        _.si[inst].fCmd = Number(params.c);
        _.si[inst].cTs = 0;
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

  for (let inst = 0; inst < CNST.INST; inst++) {
    _.si.push(Object.assign({}, CNST.DINS));
    _.c.i.push(Object.assign({}, CNST.DCFG.INST));

    _.c.c.nms.push("-");
    _.h.push([]);

    cmd.push(false);
  }

  CNST.DINS = null; //No longer needed

  pEp = epoch();
}

//Startup
log("v." + _.s.v);
log("URL: http://" + (Shelly.getComponentStatus("wifi").sta_ip ?? "192.168.33.1") + "/script/" + Shelly.getCurrentScriptId());

initialize();

//Start server and loop
HTTPServer.registerEndpoint('', onServerRequest);
Timer.set(10000, true, loop);
loop();