/**
 * shelly-porssisahko
 * 
 * (c) Jussi isotalo - http://jisotalo.fi
 * https://github.com/jisotalo/shelly-porssisahko
 * 
 * License: GNU Affero General Public License v3.0 
 */
{
  let configRead = false;
  let n = (v) => Number(v);

  let checkCustomPeriodDisplay = (value) => {
    document.querySelectorAll(".m2-c").forEach(e => e.style.display = n(value) < 0 ? "table-row" : "none");
    document.querySelectorAll(".m2-c2").forEach(e => e.style.display = n(value) < -1 ? "table-row" : "none");
  }

  let setRadio = (name, value) => {
    document.querySelectorAll(`[name=${name}]`).forEach(e => e.checked = e.value == value);
  }

  let radioRow = (name, value) => `<td><input type="radio" name="${name}" value="${value}"></td>`;

  let onUpdate = async () => {
    try {
      if (state === undefined || configRead || !state) {
        return;
      }
      let c = state.c;

      qs("#mode").innerHTML = MODE_STR.map((m, i) => `<option value="${i}">${m}</option>`)

      qs("#mode").value = c.mode;
      qs("#outs").value = c.outs.join(",");
      qs("#inv").checked = c.inv ? "checked" : "";
      qs("#vat").value = c.vat;
      qs("#day").value = c.day;
      qs("#night").value = c.night;

      let hours = "";
      for (let i = 0; i < 24; i++) {
        hours += `<label for="X${i}"><input type="checkbox" id="X${i}">${("" + i).padStart(2, "0")}</label> `
      }
      qs("#bk").innerHTML = hours.replaceAll("X", "b");

      //Forced hours
      let fh = `<tr><td>Tunti</td><td>OFF</td><td>-</td><td>ON</td></tr>`;
      for (let i = 0; i < 24; i++) {
        fh += `<tr><td>${("" + i).padStart(2, "0")}</td>${radioRow(`X${i}`, 0)}${radioRow(`X${i}`, -1)}${radioRow(`X${i}`, 1)}</tr>`;
      }
      qs("#fh").innerHTML = fh.replaceAll("X", "f");

      for (let i = 0; i < 24; i++) {
        qs(`#b${i}`).checked = (c.bk & (1 << i)) == (1 << i);
        setRadio(`f${i}`, (c.fh & (1 << i)) == (1 << i) ? (c.fhCmd & (1 << i)) == (1 << i) ? 1 : 0 : -1);
      }
      
      qs("#min").value = c.min;
      qs("#oc").value = c.oc;
      qs("#err").checked = c.err ? "checked" : "";
      qs("#m0-cmd").checked = c.m0.cmd ? "checked" : "";
      qs("#m1-lim").value = c.m1.lim;
      qs("#m2-per").value = c.m2.per;
      qs("#m2-cnt").value = c.m2.cnt;
      qs("#m2-sq").checked = c.m2.sq ? "checked" : "";
      qs("#m2-m").value = c.m2.m;
      qs("#m2-lim").value = c.m2.lim;
      qs("#m2-ps").value = `${c.m2.ps}`.padStart(2, "0");
      qs("#m2-pe").value = `${c.m2.pe}`.padStart(2, "0");
      qs("#m2-ps2").value = `${c.m2.ps2}`.padStart(2, "0");
      qs("#m2-pe2").value = `${c.m2.pe2}`.padStart(2, "0");
      qs("#m2-cnt2").value = c.m2.cnt2;
      checkCustomPeriodDisplay(c.m2.per);

      configRead = true;
    } catch (err) {
      console.error(err);

    }
  };

  let save = async (e) => {
    e.preventDefault();

    const limit = (min, value, max) => Math.min(max, Math.max(min, value));

    try {
      let c = state.c
      let avgn = (e) => qs(e).value == "avg" ? "avg" : n(qs(e).value);

      c.mode = n(qs("#mode").value);
      c.outs = qs("#outs").value.split(",").map(v => n(v));
      c.inv = qs("#inv").checked ? 1 : 0;
      c.vat = n(qs("#vat").value);
      c.day = n(qs("#day").value);
      c.night = n(qs("#night").value);

      c.bk = 0;
      c.fh = 0;
      c.fhCmd = 0;
      for (let i = 0; i < 24; i++) {
        if (qs(`#b${i}`).checked) {
          c.bk = c.bk | (1 << i);
        }
        
        let val = qs(`[name=f${i}]:checked`).value;

        if (val != -1) {
          c.fh = c.fh | (1 << i);
          c.fhCmd = c.fhCmd | (val << i);
        }
      }
      c.err = qs("#err").checked ? 1 : 0;
      c.min = n(qs("#min").value);
      c.oc = n(qs("#oc").value);
      c.min = limit(0, c.min, 60);

      c.m0.cmd = qs("#m0-cmd").checked ? 1 : 0;
      c.m1.lim = avgn("#m1-lim");
      c.m2.per = n(qs("#m2-per").value);
      c.m2.cnt = n(qs("#m2-cnt").value);
      c.m2.sq = qs("#m2-sq").checked ? 1 : 0;
      c.m2.m = avgn("#m2-m");
      c.m2.lim = avgn("#m2-lim");
      c.m2.ps = limit(0, n(qs("#m2-ps").value), 23);
      c.m2.pe = limit(c.m2.ps, n(qs("#m2-pe").value), 24);
      c.m2.ps2 = limit(0, n(qs("#m2-ps2").value), 23);
      c.m2.pe2 = limit(c.m2.ps2, n(qs("#m2-pe2").value), 24);
      c.m2.cnt2 = n(qs("#m2-cnt2").value);

      //Checking count limits
      c.m2.cnt = limit(0, c.m2.cnt, c.m2.per > 0 ? c.m2.per : c.m2.pe - c.m2.ps);
      c.m2.cnt2 = limit(0, c.m2.cnt2, c.m2.pe2 - c.m2.ps2);

      DBG(me(), "Settings to save:", c);

      let res = await getData(`${URL}/rpc/KVS.Set?key="porssi-config"&value=${(JSON.stringify(c))}`);

      if (res.code == 200) {
        getData(`${URLS}?r=r`)
          .then(res => {
            alert(`Tallennettu!`);
            configRead = false;
          })
          .catch(err => {
            alert(`Virhe: ${err})`);
          });

      } else {
        alert(`Virhe: ${res.txt})`);
      }
    } catch (err) {
      alert("Virhe: " + err.message);
    }
  };

  let force = async () => {
    let hours = prompt("Pakko-ohjauksen kesto tunteina? (0 = peru nykyinen)");
    
    if (hours != null) {
      hours = Number(hours);

      let cmd = hours > 0 ? parseInt(prompt("Pakko-ohjataanko ohjaus päälle (1) vai pois (0)?", "1")) : 0;
      if (isNaN(cmd)) {
        return;
      }

      let res = await getData(`${URLS}?r=f&ts=${hours > 0 ? Math.floor(Date.now() / 1000 + hours * 60 * 60) : 0}&c=${cmd}`);
      alert(res.code == 204 ? "OK!" : `Virhe: ${res.txt}`);
    }
  }

  onUpdate();
  CBS.push(onUpdate);
  qs("#save").addEventListener("click", save);
  qs("#force").addEventListener("click", force);
  qs("#m2-per").addEventListener("change", (e) => checkCustomPeriodDisplay(e.target.value));
}
