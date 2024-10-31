/**
 * shelly-porssisahko
 * 
 * (c) Jussi isotalo - http://jisotalo.fi
 * https://github.com/jisotalo/shelly-porssisahko
 * 
 * License: GNU Affero General Public License v3.0 
 */
{
  let priceListsUpdated = [0, 0];
  let priceListActiveHour = -1;
  let notYetKnown = `<tr><td colspan="3">Ei vielä tiedossa</td></tr>`;

  const clear = () => {
    let c = (e) => qs(e).innerHTML = "";
    c("#s-cmd");
    qs("#s-cmd").style.color = "";
    c("#s-dn");
    c("#s-now");
    c("#s-mode");
    c("#s-p0");
    c("#s-pi0");
    c("#s-p1");
    c("#s-pi1");
    c("#s-info");
    c("#s-st");
  }

  const onUpdate = async (instChanged) => {
    try {
      if (instChanged) {
        clear();
        qs("#s-cmd").innerHTML = "Ladataan...";
        priceListsUpdated = [0, 0];
        priceListActiveHour = -1;
      }

      if (state === undefined) {
        return;
      } else if (!state) {
        throw new Error("no data");
      }

      //Some shortcuts..
      let d = state;
      let s = d.s;
      let c = d.c;
      let si = d.si;
      let ci = d.ci;

      let todayPricesOK = d.p.length > 0;
      document.title = `${(s.dn ? `${s.dn} - ` : '')}Pörssisähkö`;

      if (ci.en) {
        qs("#s-cmd").innerHTML = si.cmd ? "PÄÄLLÄ" : "POIS";
        qs("#s-cmd").style.color = si.cmd ? "green" : "red";
        qs("#s-mode").innerHTML = MODE_STR[ci.mode];
        qs("#s-now").innerHTML = todayPricesOK ? `${s.p[0].now.toFixed(2)} c/kWh` : "";
        qs("#s-st").innerHTML = (si.st === 9
          ? STATE_STR[si.st].replace("%s", formatDateTime(new Date(si.fCmdTs * 1000), false))
          : STATE_STR[si.st]) + (ci.inv ? " (käänteinen)" : "");

        if (si.str != "") {
          qs("#s-st").innerHTML += `<br><br>${s.str}`;
        }
        qs("#s-info").innerHTML = si.chkTs > 0 ? `Ohjaus tarkistettu ${formatTime(new Date(si.chkTs * 1000))}` : `Tarkistetaan ohjausta...`;

      } else {
        clear();
        qs("#s-info").innerHTML = `Ei käytössä`;
        qs("#s-cmd").innerHTML = `Ohjaus #${(inst + 1)} ei käytössä`;
        qs("#s-cmd").style.color = "orange";
      }

      let dn = s.dn ? s.dn : '<i>Ei asetettu</i>';
      if (c.names[inst]) {
        dn += ` | ${c.names[inst]}`
      }
      dn += ` (ohjaus #${(inst + 1)})`;

      qs("#s-dn").innerHTML = dn;

      qs("#s-info").innerHTML += ` - ${s.p[0].ts > 0 ? `Hinnat päivitetty ${formatTime(new Date(Math.max(s.p[0].ts, s.p[1].ts) * 1000))}` : "Hintoja haetaan..."}`;
      qs("#s-v").innerHTML = `Käynnistetty ${formatDateTime(new Date(s.upTs * 1000))} (käynnissä ${((new Date().getTime() - new Date(s.upTs * 1000).getTime()) / 1000.0 / 60.0 / 60.0 / 24.0).toFixed("1")} päivää) - versio ${s.v}`;


      /**
       * Helper that builds price info table for today or tomorrow
       */
      const buildPriceTable = (priceInfo, elementId) => {
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

      qs("#s-pi0").innerHTML = buildPriceTable(s.p[0]);
      qs("#s-pi1").innerHTML = buildPriceTable(s.p[1]);

      /**
       * Helper that builds price/cmd table for today or tomorrow 
       */
      const buildPriceList = (dayIndex, element) => {
        let header = ` <tr><td class="t bg">Aika</td><td class="t bg">Hinta</td><td class="t bg">Ohjaus</td></tr>`;
        //Get cheapest hours

        //This is (and needs to be) 1:1 in both frontend and backend code
        let cheapest = [];

        if (s.p[dayIndex].ts == 0) {
          element.innerHTML = `${header}${notYetKnown}`;;
          return;
        }

        if (ci.mode === 2) {
          //Select increment (a little hacky - to support custom periods too)
          let inc = ci.m2.p < 0 ? 1 : ci.m2.p;

          for (let i = 0; i < d.p[dayIndex].length; i += inc) {
            let cnt = (ci.m2.p == -2 && i >= 1 ? ci.m2.c2 : ci.m2.c);

            //Safety check
            if (cnt <= 0)
              continue;

            //Create array of indexes in selected period
            let order = [];

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

            for (let j = start; j < end; j++) {
              //If we have less hours than 24 then skip the rest from the end
              if (j > d.p[dayIndex].length - 1)
                break;

              order.push(j);
            }

            if (ci.m2.sq) {
              //Find cheapest in a sequence
              //Loop through each possible starting index and compare average prices
              let avg = 999;
              let startIndex = 0;

              for (let j = 0; j <= order.length - cnt; j++) {
                let sum = 0;

                //Calculate sum of these sequential hours
                for (let k = j; k < j + cnt; k++) {
                  sum += d.p[dayIndex][order[k]][1];
                };

                //If average price of these sequential hours is lower -> it's better
                if (sum / cnt < avg) {
                  avg = sum / cnt;
                  startIndex = j;
                }
              }

              for (let j = startIndex; j < startIndex + cnt; j++) {
                cheapest.push(order[j]);
              }

            } else {
              //Sort indexes by price
              let j = 0;

              for (let k = 1; k < order.length; k++) {
                let temp = order[k];

                for (j = k - 1; j >= 0 && d.p[dayIndex][temp][1] < d.p[dayIndex][order[j]][1]; j--) {
                  order[j + 1] = order[j];
                }
                order[j + 1] = temp;
              }

              //Select the cheapest ones
              for (let j = 0; j < cnt; j++) {
                cheapest.push(order[j]);
              }
            }

            //If custom period, quit when all periods are done (1 or 2 periods)
            if (ci.m2.p == -1 || (ci.m2.p == -2 && i >= 1))
              break;
          }
        }

        //Price list
        if (priceListsUpdated[dayIndex] !== s.p[dayIndex].ts || (dayIndex == 0 && priceListActiveHour !== new Date().getHours())) {
          element.innerHTML = header;

          let per = 0;
          let bg = false;
          for (let i = 0; i < d.p[dayIndex].length; i++) {
            let row = d.p[dayIndex][i];
            let date = new Date(row[0] * 1000);
            let cmd =

              ((ci.mode === 0 && ci.m0.cmd)
                || (ci.mode === 1 && row[1] <= (ci.m1.l == "avg" ? s.p[dayIndex].avg : ci.m1.l))
                || (ci.mode === 2 && cheapest.includes(i) && row[1] <= (ci.m2.m == "avg" ? s.p[dayIndex].avg : ci.m2.m))
                || (ci.mode === 2 && row[1] <= (ci.m2.l == "avg" ? s.p[dayIndex].avg : ci.m2.l))
                || ((ci.f & (1 << i)) == (1 << i) && (ci.fc & (1 << i)) == (1 << i)))
              && !((ci.f & (1 << i)) == (1 << i) && (ci.fc & (1 << i)) == 0);

            //Invert
            if (ci.inv) {
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

            element.innerHTML += `<tr style="${date.getHours() === new Date().getHours() && dayIndex == 0 ? `font-weight:bold;` : ``}${(bg ? "background:#ededed;" : "")}">
            <td class="fit">${formatTime(date, false)}</td>
            <td>${row[1].toFixed(2)} c/kWh</td>
            <td>${cmd ? "&#x2714;" : ""}</td>
            </tr>`;
          }

          //Only if today
          if (dayIndex == 0) {
            priceListActiveHour = new Date().getHours();
          }

          priceListsUpdated[dayIndex] = s.p[dayIndex].ts;
        }

        return s.p[dayIndex].ts;
      }

      //Creating price/cmd tables for today and tomorror
      buildPriceList(0, qs("#s-p0"));
      buildPriceList(1, qs("#s-p1"));


    } catch (err) {
      console.error(err);
      clear();

      qs("#s-cmd").innerHTML = "Tila ei tiedossa";
      qs("#s-cmd").style.color = "red";
    }
  };

  onUpdate();
  CBS.push(onUpdate);
}