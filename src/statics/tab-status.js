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
        // Pick correct charmap depending on dayIndex:
        //   - dayIndex 0 → use si.slots0  (today)
        //   - dayIndex 1 → use si.slots1  (tomorrow)
        let slotCodes = "";
        if (dayIndex === 0 && typeof si.slots0 === "string") {
          slotCodes = si.slots0;
        } else if (dayIndex === 1 && typeof si.slots1 === "string") {
          slotCodes = si.slots1;
        }
        // 0:"OFF" 1:"Cheapest", 2:"Below limit", 3:"Forced", 4:"Backup", 5:"Manual"
        const rMap = ["", "", "", "**", "B", "M"];

        for (let i = 0; i < slotPrices.length; i++) {
          const slotEp = startEpoch + i * slot;
          const price = slotPrices[i];
          const date = new Date(slotEp * 1000);

          const isCurr = (dayIndex === 0 &&
                          now >= slotEp * 1000 &&
                          now < (slotEp + slot) * 1000);

          // Convert char → integer (e.g. '2' → 2)
          const codeChar = slotCodes.charAt(i) || "0";
          const code = codeChar.charCodeAt(0) - 48; // fast numeric conversion
          const cmd = code > 0;

          rows.push(`<tr style="${isCurr ? 'font-weight:bold;' : ''}">
              <td class="fit">${formatTime(date, false)}</td>
              <td>${price.toFixed(2)} c/kWh</td>
              <td>${cmd ? "&#x2714;" : ""} ${rMap[code] || ""}</td>
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
