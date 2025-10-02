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
  let notYetKnown = `<tr><td colspan="3">Ei vielä tiedossa</td></tr>`;

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
   * Calculate average of elements in array like or no-operation
   *
   * @param {Array[number]|number} container array of values
   */
  function maybeCalculateAverage(container) {
    if (typeof container !== "object") {
      return container;
    }
    let sum = 0
    if (container.length !== 0) {
      for (let i = 0; i < container.length; i++) {
        sum += container[i];
      }
      sum /= container.length;
    }
    return sum;
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

      //If instance is enabled (otherwise just update price lists)
      if (ci.en) {
        qs("s-cmd").innerHTML = si.cmd ? "PÄÄLLÄ" : "POIS";
        qs("s-cmd").style.color = si.cmd ? "green" : "red";

        qs("s-mode").innerHTML = MODE_STR[ci.mode];

        qs("s-now").innerHTML = d.p.length > 0
          ? `${s.p[0].now.toFixed(2)} c/kWh`
          : "";

        qs("s-st").innerHTML = si.st === 9
          ? STATE_STR[si.st].replace("%s", formatDateTime(new Date(si.fCmdTs * 1000), false))
          : STATE_STR[si.st] + (ci.i ? " (käänteinen)" : "");

        //Extended status for instance (by user scripts)
        if (si.str != "") {
          qs("s-st").innerHTML += `<br><br>${si.str}`;
        }

        qs("s-info").innerHTML = si.chkTs > 0
          ? `Ohjaus tarkistettu ${formatTime(new Date(si.chkTs * 1000))}`
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
      if (c.names[inst]) {
        dn += ` | ${c.names[inst]}`
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
        let header = `<tr><td class="t bg">Keskiarvo</td><td class="t bg">Halvin</td><td class="t bg">Kallein</td></tr>`;

        if (priceInfo.ts == 0) {
          return `${header}${notYetKnown}`;
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
       */
      const buildPriceList = (dayIndex, element) => {
        let header = ` <tr><td class="t bg">Aika</td><td class="t bg">Hinta</td><td class="t bg">Ohjaus</td></tr>`;

        if (s.p[dayIndex].ts == 0) {
          element.innerHTML = `${header}${notYetKnown}`;;
          return;
        }

        //------------------------------
        // Cheapest hours logic
        // This needs match 1:1 the Shelly script side
        //------------------------------
        // Bucket of cheapest [hour][quarter] combinations
        let cheapest = {};
        if (ci.mode === 2) {
          //Select increment (a little hacky - to support custom periods too)
          let inc = ci.m2.p < 0 ? 1 : ci.m2.p;

          for (let i = 0; i < d.p[dayIndex].length; i += inc) {
            let cnt = (ci.m2.p == -2 && i >= 1 ? ci.m2.c2 : ci.m2.c);
            // Configuration is in hours and logic in quarters
            let cntMultiplier = 4;

            //Safety check
            if (cnt <= 0)
              continue;

            //Create bucket of hourly prices
            let order = {};

            //If custom period -> select hours from that range. Otherwise use this period
            let start = i;
            let end = (i + ci.m2.p);

            if (ci.m2.p < 0 && i == 0) {
              //Custom period 1
              start = ci.m2.ps;
              end = ci.m2.pe;

            } else if (ci.m2.p == -2 && i == 1) {
              //Custom period 2
              start = ci.m2.ps2;
              end = ci.m2.pe2;
            }

            for (let hour = start; hour < end; hour++) {
              //If we have less hours than 24 then skip the rest from the end
              if (hour > d.p[dayIndex].length - 1)
                break;

              order[hour] = d.p[dayIndex][hour][1];
              if (typeof order[hour] !== "object") {
                // Wrap non quarterly prices to an array
                order[hour] = [order[hour]];
                cntMultiplier = 1;
              }
              cheapest[hour] = {};
            }

            if (ci.m2.s) {
              //Find cheapest in a sequence
              //Loop through each possible starting index and compare average prices
              let avg = 999;
              let startIndex = 0;
              let hours = Object.keys(order);

              for (let j = 0; j <= hours.length - cnt; j++) {
                let sum = 0;

                //Calculate sum of these sequential hours
                for (let k = j; k < j + cnt; k++) {
                  sum += maybeCalculateAverage(order[hours[k]]);
                }

                //If average price of these sequential hours is lower -> it's better
                if (sum / cnt < avg) {
                  avg = sum / cnt;
                  startIndex = j;
                }
              }

              for (let j = startIndex; j < startIndex + cnt; j++) {
                // TODO: Add quarter support for cheapest sequence
                cheapest[hours[j]] = {
                  0: true,
                  1: true,
                  2: true,
                  3: true,
                }
              }

            } else {
              let entries = []
              for (let hour in order) {
                if (order.hasOwnProperty(hour)) {
                  for (let quarter = 0; quarter < order[hour].length; quarter++) {
                    entries.push([order[hour][quarter], hour, quarter])
                  }
                }
              }

              //Sort entries by price
              entries.sort(function (a, b) {
                return a[0] - b[0];
              })

              //Select the cheapest ones
              let cheapestCounter = 0;
              for (let j = 0; j < entries.length; j++) {
                let entry = entries[j];

                //Respect hourly minute limit while selecting quarters
                if (ci.m < 60 && cntMultiplier > 1) {
                  if (Object.keys(cheapest[entry[1]]).length * 15 >= ci.m) {
                    continue
                  }
                }

                cheapest[entry[1]][entry[2]] = true;
                cheapestCounter++;

                if (cheapestCounter >= cnt * cntMultiplier) {
                  // Sufficient amount of cheapest quarters found
                  break;
                }
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
        element.innerHTML = header;

        let per = 0;
        let bg = false;
        for (let i = 0; i < d.p[dayIndex].length; i++) {
          let row = d.p[dayIndex][i];
          let row_1 = maybeCalculateAverage(row[1]);
          let date = new Date(row[0] * 1000);

          //Forced hour on
          let fon = ((ci.f & (1 << i)) == (1 << i) && (ci.fc & (1 << i)) == (1 << i));
          //Forced hour off
          let foff = ((ci.f & (1 << i)) == (1 << i) && (ci.fc & (1 << i)) == 0);

          let mode2MaxPrice = ci.m2.m == "avg" ? s.p[dayIndex].avg : ci.m2.m;

          let qCmd = "";
          let container = row[1];
          if (typeof container !== "object") {
            // Wrap to an array
            container = [container];
          }
          for (let j = 0; j < container.length; j++) {
            let cmd =
              ((ci.mode === 0 && ci.m0.c)
                || (ci.mode === 1 && container[j] <= (ci.m1.l == "avg" ? s.p[dayIndex].avg : ci.m1.l))
                || (ci.mode === 2 && (cheapest[i] || {})[j] && container[j] <= mode2MaxPrice)
                || (ci.mode === 2 && container[j] <= (ci.m2.l == "avg" ? s.p[dayIndex].avg : ci.m2.l) && container[j] <= mode2MaxPrice)
                || fon)
              && !foff;

            //Invert
            if (ci.i) {
              cmd = !cmd;
            }

            if (!ci.en) {
              cmd = false;
            }

            qCmd += cmd ? "&#x2714;" : "_";
          }

          if (ci.en && ci.mode === 2
            && ((ci.m2.p < 0 && (i == ci.m2.ps || i == ci.m2.pe))
              || (ci.m2.p == -2 && (i == ci.m2.ps2 || i == ci.m2.pe2))
              || (ci.m2.p > 0 && i >= per + ci.m2.p))) {

            //Period changed
            per += ci.m2.p;
            bg = !bg;
          }

          let f = fon || foff ? `*` : "";
          element.innerHTML +=
            `<tr style="${date.getHours() === new Date().getHours() && dayIndex == 0 ? `font-weight:bold;` : ``}${(bg ? "background:#ededed;" : "")}">
            <td class="fit">${formatTime(date, false)}</td>
            <td>${row_1.toFixed(2)} c/kWh</td>
            <td>${f}${qCmd}${f}</td>
          </tr>`;
        }

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