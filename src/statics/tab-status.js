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

        // Reusable loop variables
        let i, j, k, temp, sum, avg, inc, cnt, start, end;

        //------------------------------
        // Cheapest hours logic
        // This needs match 1:1 the Shelly script side
        //------------------------------
        let cheapest = [];
        if (ci.mode === 2 && slotPrices && slotPrices.length > 0) {
          //Select increment (a little hacky - to support custom periods too)
          inc = ci.m2.p < 0 ? 1 : ci.m2.p;

          for (i = 0; i < slotPrices.length; i += inc) {
            cnt = (ci.m2.p == -2 && i >= 1 ? ci.m2.c2 : ci.m2.c);

            //Safety check
            if (cnt <= 0)
              continue;

            //Create array of indexes in selected period
            let order = [];

            //If custom period -> select slots from that range. Otherwise use this period
            start = i;
            end = (i + ci.m2.p);

            if (ci.m2.p < 0 && i == 0) {
              //Custom period 1
              start = ci.m2.ps;
              end = ci.m2.pe;

            } else if (ci.m2.p == -2 && i == 1) {
              //Custom period 2
              start = ci.m2.ps2;
              end = ci.m2.pe2;
            }

            for (j = start; j < end; j++) {
              //If we have less slots than expected, skip the rest
              if (j > slotPrices.length - 1)
                break;

              order.push(j);
            }

            //Skip if no valid slots in period
            if (order.length === 0) continue;

            if (ci.m2.s) {
              //Find cheapest in a sequence
              //Loop through each possible starting index and compare average prices
              avg = 999;
              let startIndex = 0;

              for (j = 0; j <= order.length - cnt; j++) {
                sum = 0;

                //Calculate sum of these sequential slots
                for (k = j; k < j + cnt; k++) {
                  sum += slotPrices[order[k]];
                }

                //If average price of these sequential slots is lower -> it's better
                if (sum / cnt < avg) {
                  avg = sum / cnt;
                  startIndex = j;
                }
              }

              for (j = startIndex; j < startIndex + cnt; j++) {
                cheapest.push(order[j]);
              }

            } else {
              //Sort indexes by price (insertion sort)
              for (k = 1; k < order.length; k++) {
                temp = order[k];

                // Find correct position by comparing prices
                j = k - 1;
                while (j >= 0 && slotPrices[temp] < slotPrices[order[j]]) {
                  order[j + 1] = order[j];
                  j--;
                }
                order[j + 1] = temp;
              }

              //Select the cheapest ones (with bounds check)
              for (j = 0; j < cnt && j < order.length; j++) {
                cheapest.push(order[j]);
              }
            }

            //If custom period, quit when all periods are done (1 or 2 periods)
            if (ci.m2.p == -1 || (ci.m2.p == -2 && i >= 1))
              break;
          }
        }

        //------------------------------
        // Building the price list
        //------------------------------
        // Build array of rows, then join once (avoids repeated string concatenation)
        let rows = [header];

        let per = 0;
        let bg = false;

        for (i = 0; i < slotPrices.length; i++) {
          // Calculate epoch for this slot on-the-fly
          let slotEpoch = startEpoch + (i * slot);
          let price = slotPrices[i];
          let date = new Date(slotEpoch * 1000);

          //Forced hour on
          let fon = ((ci.f & (1 << i)) == (1 << i) && (ci.fc & (1 << i)) == (1 << i));
          //Forced hour off
          let foff = ((ci.f & (1 << i)) == (1 << i) && (ci.fc & (1 << i)) == 0);

          let mode2MaxPrice = ci.m2.m == "avg" ? s.p[dayIndex].avg : ci.m2.m;

          let cmd =
            ((ci.mode === 0 && ci.m0.c)
              || (ci.mode === 1 && price <= (ci.m1.l == "avg" ? s.p[dayIndex].avg : ci.m1.l))
              || (ci.mode === 2 && cheapest.includes(i) && price <= mode2MaxPrice)
              || (ci.mode === 2 && price <= (ci.m2.l == "avg" ? s.p[dayIndex].avg : ci.m2.l) && price <= mode2MaxPrice)
              || fon)
            && !foff;

          //Invert
          if (ci.i) {
            cmd = !cmd;
          }

          if (!ci.en) {
            cmd = false;
          }

          if (ci.en && ci.mode === 2
            && ((ci.m2.p < 0 && (i == ci.m2.ps || i == ci.m2.pe))
              || (ci.m2.p == -2 && (i == ci.m2.ps2 || i == ci.m2.pe2))
              || (ci.m2.p > 0 && i >= per + ci.m2.p))) {

            //Period changed
            per += ci.m2.p;
            bg = !bg;
          }

          rows.push(
            `<tr style="${date.getHours() === new Date().getHours() && dayIndex == 0 ? `font-weight:bold;` : ``}${(bg ? "background:#ededed;" : "")}">
              <td class="fit">${formatTime(date, false)}</td>
              <td>${price.toFixed(2)} c/kWh</td>
              <td>${cmd ? "&#x2714;" : ""}${fon || foff ? `**` : ""}</td>
            </tr>`
          );
        }

        // Set innerHTML once with all rows joined
        element.innerHTML = rows.join('');

        return s.p[dayIndex].ts;
      }

      //Creating price/cmd tables for today and tomorrow
      buildPriceList(0, qs("s-p0"));
      buildPriceList(1, qs("s-p1"));

    } catch (err) {
      console.error(err);

      clear();
      qs("s-cmd").innerHTML = `Tila ei tiedossa (${err.message})`;
      qs("s-cmd").style.color = "red";
    }
  };

  onUpdate();
  CBS.push(onUpdate);
}