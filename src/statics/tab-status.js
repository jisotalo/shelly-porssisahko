/**
 * shelly-porssisahko
 *
 * (c) Jussi isotalo - http://jisotalo.fi
 * https://github.com/jisotalo/shelly-porssisahko
 *
 * License: GNU Affero General Public License v3.0
 */
{
  /**
   * ============================================================================
   * SHARED LOGIC - START
   * These functions are copied from backend (shelly-porssisahko.js)
   * They work in both Shelly backend and browser frontend
   * ============================================================================
   */

  /**
   * Limits the value to min..max range
   * (Copy of limit() from backend)
   */
  const limit = (min, value, max) => {
    return Math.min(max, Math.max(min, value));
  };

  // Global variables for slot calculation (reused to avoid stack issues)
  let _i = 0;
  let _j = 0;
  let _k = 0;
  let _inc = 0;
  let _cnt = 0;
  let _st = 0;
  let _end = 0;
  let _avg = 999;
  let _sId = 0;
  let _sum = 0;

  /**
   * Checks if given slot index is among the cheapest slots
   * This is the core logic extracted from isCheapestHour() but works with any slot
   * 
   * @param {object} cfg - Instance config (ci from frontend)
   * @param {array} slotPrices - Price array (p[dayIndex].pv from frontend)
   * @param {number} slotIdx - Slot index to check (0..95 for 15min, 0..23 for hourly)
   * @param {number} slotSize - Slot duration in seconds (900 or 3600)
   * @returns {boolean} - true if slot is among cheapest
   */
  const isSlotInCheapest = (cfg, slotPrices, slotIdx, slotSize) => {
    if (!slotPrices || slotPrices.length === 0 || slotIdx >= slotPrices.length) {
      return false;
    }

    //Safety checks
    cfg.m2.ps = limit(0, cfg.m2.ps, 23);
    cfg.m2.pe = limit(cfg.m2.ps, cfg.m2.pe, 24);
    cfg.m2.ps2 = limit(0, cfg.m2.ps2, 23);
    cfg.m2.pe2 = limit(cfg.m2.ps2, cfg.m2.pe2, 24);
    cfg.m2.c = limit(0, cfg.m2.c, cfg.m2.p > 0 ? cfg.m2.p : cfg.m2.pe - cfg.m2.ps);
    cfg.m2.c2 = limit(0, cfg.m2.c2, cfg.m2.pe2 - cfg.m2.ps2);

    // --- 15‑minute slot scaling ---
    const scale = 3600 / slotSize; // 1 for hourly, 4 for 15 min

    // Convert hour-based configs to slot indices
    const ps = Math.floor(cfg.m2.ps * scale);
    const pe = Math.floor(cfg.m2.pe * scale);
    const ps2 = Math.floor(cfg.m2.ps2 * scale);
    const pe2 = Math.floor(cfg.m2.pe2 * scale);

    // Convert "cheapest hours" & periods to slot counts
    const c1 = Math.floor(cfg.m2.c * scale);
    const c2 = Math.floor(cfg.m2.c2 * scale);
    const periodSlots = cfg.m2.p < 0 ? cfg.m2.p : Math.floor(cfg.m2.p * scale);

    //This is (and needs to be) 1:1 in both frontend and backend code
    let cheapest = [];

    //Select increment (a little hacky - to support custom periods too)
    _inc = periodSlots < 0 ? 1 : periodSlots;

    for (_i = 0; _i < slotPrices.length; _i += _inc) {
      _cnt = (periodSlots == -2 && _i >= 1 ? c2 : c1);

      //Safety check
      if (_cnt <= 0)
        continue;

      //Create array of indexes in selected period
      let order = [];

      //If custom period -> select slots from that range. Otherwise use this period
      _st = _i;
      _end = (_i + periodSlots);

      if (periodSlots < 0 && _i == 0) {
        //Custom period 1
        _st = ps;
        _end = pe;

      } else if (periodSlots == -2 && _i == 1) {
        //Custom period 2
        _st = ps2;
        _end = pe2;
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
        for (let k = 1; k < order.length; k++) {
          const temp = order[k];
          // Find correct position by comparing prices
          let j = k - 1;
          while (j >= 0 && slotPrices[temp] < slotPrices[order[j]]) {
            order[j + 1] = order[j];
            j--;
          }
          order[j + 1] = temp;
        }

        //Select the cheapest ones
        for (_j = 0; _j < _cnt && _j < order.length; _j++) {
          cheapest.push(order[_j]);
        }
      }

      //If custom period, quit when all periods are done (1 or 2 periods)
      if (periodSlots == -1 || (periodSlots == -2 && _i >= 1))
        break;
    }

    // Check if given slot index is in cheapest array
    for (let i = 0; i < cheapest.length; i++) {
      if (cheapest[i] === slotIdx) {
        return true;
      }
    }

    return false;
  };

  /**
   * Calculates relay command and status code for a specific slot
   * This replaces the per-slot logic from buildSlotCharmap()
   * 
   * @param {object} cfg - Instance config (ci from frontend)
   * @param {object} priceData - Object with {pv: array, avg: number} 
   * @param {number} slotIdx - Slot index to calculate (0..95 for 15min, 0..23 for hourly)
   * @param {number} slotSize - Slot duration in seconds (900 or 3600)
   * @returns {object} - {cmd: boolean, st: number} where cmd is relay state and st is status code
   */
  const calcSlotCmd = (cfg, priceData, slotIdx, slotSize) => {
    let cmd = false;
    let st = 0;

    // Mode 0: Manual
    if (cfg.mode === 0) {
      cmd = cfg.m0.c === 1;
      st = cmd ? 1 : 0;
      return { cmd: cmd, st: st };
    }

    // Need price data for other modes
    if (!priceData.pv || priceData.pv.length === 0 || slotIdx >= priceData.pv.length) {
      return { cmd: false, st: 0 };
    }

    const price = priceData.pv[slotIdx];
    const avg = priceData.avg;

    // Mode 1: Price limit
    if (cfg.mode === 1) {
      const limitVal = (cfg.m1.l === "avg") ? avg : cfg.m1.l;
      cmd = price <= limitVal;
      st = cmd ? 2 : 3;
      return { cmd: cmd, st: st };
    }

    // Mode 2: Cheapest hours
    if (cfg.mode === 2) {
      const isCheap = isSlotInCheapest(cfg, priceData.pv, slotIdx, slotSize);
      const limAlways = (cfg.m2.l === "avg") ? avg : cfg.m2.l;
      const limMax = (cfg.m2.m === "avg") ? avg : cfg.m2.m;

      if (isCheap) {
        cmd = true;
        st = 5; // Cheapest slot
        
        // Check maximum price limit
        if (price > limMax) {
          cmd = false;
          st = 11; // Exceeds max price
        }
      } else {
        cmd = false;
        st = 4; // Not selected
        
        // Check always-on price limit
        if (price <= limAlways) {
          cmd = true;
          st = 6; // Always-on limit
        }
      }
      
      return { cmd: cmd, st: st };
    }

    return { cmd: false, st: 0 };
  };

  /**
   * ============================================================================
   * SHARED LOGIC - END
   * ============================================================================
   */

  /**
   * Table content if data not yet available
   */
  const notK = `<tr><td colspan="3">Ei vielä tiedossa</td></tr>`;

  /**
   * Clears status page
   * Used when instance is changed or during error
   */
  const clear = () => {
    let c = (e) => qs(e).innerHTML = "";
    c("s-cmd");
    qs("s-cmd").style.color = "#000";
    c("s-dn");
    c("s-now");
    c("s-mode");
    c("s-p0");
    c("s-pi0");
    c("s-p1");
    c("s-pi1");
    c("s-info");
    c("s-st");
  }

  /**
   * Callback called by main loop
   *
   * @param {*} instChanged true = instance has changed (reset data)
   * @returns
   */
  const onUpdate = async (instChanged) => {
    try {
      if (instChanged || state === undefined) {
        clear();
        qs("s-cmd").innerHTML = "Ladataan...";
        return;
      }

      if (!state) {
        throw new Error("no data");
      }

      /** data (state) */
      let d = state;
      /** status */
      let s = d.s;
      /** common config */
      let c = d.c;
      /** instance status*/
      let si = d.si;
      /** instance config */
      let ci = d.ci;
      /** slot size (seconds) */
      let slot = d.slot || 3600;

      //If instance is enabled (otherwise just update price lists)
      if (ci.en) {
        qs("s-cmd").innerHTML = si.cmd ? "PÄÄLLÄ" : "POIS";
        qs("s-cmd").style.color = si.cmd ? "green" : "red";

        qs("s-mode").innerHTML = MODE_STR[ci.mode];

        qs("s-now").innerHTML = d.p[0].pv && d.p[0].pv.length > 0
          ? `${s.p[0].now.toFixed(2)} c/kWh`
          : "";

        qs("s-st").innerHTML = si.st === 9
          ? STATE_STR[si.st].replace("%s", formatDateTime(new Date(si.fTs * 1000), false))
          : STATE_STR[si.st] + (ci.i ? " (käänteinen)" : "");

        //Extended status for instance (by user scripts)
        if (si.str != "") {
          qs("s-st").innerHTML += `<br><br>${si.str}`;
        }

        qs("s-info").innerHTML = si.cTs > 0
          ? `Ohjaus tarkistettu ${formatTime(new Date(si.cTs * 1000))}`
          : `Tarkistetaan ohjausta...`;

      } else {
        //Instance is not enabled, clear almost everything
        clear();
        qs("s-info").innerHTML = `Ei käytössä`;
        qs("s-cmd").innerHTML = `Ohjaus #${(inst + 1)} ei ole käytössä`;
        qs("s-cmd").style.color = "000";
      }

      //Device name and instance
      let dn = s.dn ? s.dn : '<i>Ei asetettu</i>';
      if (c.nms[inst]) {
        dn += ` | ${c.nms[inst]}`
      }
      dn += ` (ohjaus #${(inst + 1)})`;
      qs("s-dn").innerHTML = dn;

      //Price info
      qs("s-info").innerHTML += ` - ${s.p[0].ts > 0
        ? `Hinnat päivitetty ${formatTime(new Date(Math.max(s.p[0].ts, s.p[1].ts) * 1000))}`
        : "Hintoja haetaan..."}`;
      
      //Version info (footer)
      qs("s-v").innerHTML = `Käynnistetty ${formatDateTime(new Date(s.upTs * 1000))} (käynnissä ${((new Date().getTime() - new Date(s.upTs * 1000).getTime()) / 1000.0 / 60.0 / 60.0 / 24.0).toFixed("1")} päivää) - versio ${s.v}`;

      /**
       * Helper that builds price info table for today or tomorrow
       */
      const buildPriceTable = (priceInfo) => {
        const header = `<tr><td class="t bg">Keskiarvo</td><td class="t bg">Halvin</td><td class="t bg">Kallein</td></tr>`;

        if (priceInfo.ts == 0) {
          return `${header}${notK}`;
        }

        return `${header}
        <tr>
          <td>${priceInfo.avg.toFixed(2)} c/kWh</td>
          <td>${priceInfo.low.toFixed(2)} c/kWh</td>
          <td>${priceInfo.high.toFixed(2)} c/kWh</td>
        </tr>`;
      }

      //Price info for today and tomorrow
      qs("s-pi0").innerHTML = buildPriceTable(s.p[0]);
      qs("s-pi1").innerHTML = buildPriceTable(s.p[1]);

      /**
      * Helper that builds price/cmd table for today or tomorrow
      *
      * @param {number} dayIndex 0=today, 1=tomorrow
      * @param {HTMLElement} element Target element
      */
      const buildPriceList = (dayIndex, element) => {
        const header = ` <tr><td class="t bg">Aika</td><td class="t bg">Hinta</td><td class="t bg">Ohjaus</td></tr>`;

        // Get compact price data
        const slotPrices = d.p[dayIndex].pv;
        const startEpoch = d.p[dayIndex].ps;

        if (s.p[dayIndex].ts == 0 || !slotPrices || slotPrices.length === 0 || !startEpoch) {
          element.innerHTML = `${header}${notK}`;
          return;
        }

        const rows = [header];
        const now = Date.now();
        
        // Prepare price data for calculation
        const priceData = {
          pv: slotPrices,
          avg: s.p[dayIndex].avg
        };

        for (let i = 0; i < slotPrices.length; i++) {
          const slotEp = startEpoch + i * slot;
          const price = slotPrices[i];
          const date = new Date(slotEp * 1000);

          const isCurr = (dayIndex === 0 &&
                          now >= slotEp * 1000 &&
                          now < (slotEp + slot) * 1000);

          // Calculate command and status using shared logic
          const result = calcSlotCmd(ci, priceData, i, slot);
          let cmd = result.cmd;
          let st = result.st;
          let marker = "";

          // Apply forced hours override (hour-based, not slot-based)
          if (ci.f > 0) {
            const slotHour = date.getHours();
            const hourBit = 1 << slotHour;
            if ((ci.f & hourBit) === hourBit) {
              cmd = (ci.fc & hourBit) === hourBit;
              st = 3; // Forced
              marker = "**"; // Forced marker
            }
          }

          // Show only checkmark for relay ON, no additional markers except for forced
          rows.push(`<tr style="${isCurr ? 'font-weight:bold;' : ''}">
              <td class="fit">${formatTime(date, false)}</td>
              <td>${price.toFixed(2)} c/kWh</td>
              <td>${cmd ? "&#x2714;" : ""} ${marker}</td>
            </tr>`);
        }

        // --- Replace only if changed to avoid frequent DOM recreation ---
        const newHtml = rows.join('');
        if (element.innerHTML !== newHtml) {
          element.innerHTML = newHtml;
        }
      };

      //Creating price/cmd tables for today and tomorrow
      buildPriceList(0, qs("s-p0"));
      buildPriceList(1, qs("s-p1"));
      d = s = c = si = ci = null;
      slot = null;

    } catch (err) {
      console.error(err);

      clear();
      qs("s-cmd").innerHTML = `Tila ei tiedossa (${err.message})`;
      qs("s-cmd").style.color = "red";
    }
  };

  onUpdate();
  // --- Prevent multiple frontend callback registrations ---
  if (!CBS.includes(onUpdate)) {
    CBS.push(onUpdate);
  }
}
