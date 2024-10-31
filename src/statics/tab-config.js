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

  let onUpdate = async (instChanged) => {
    try {
      if (instChanged) {
        qs("#cfg-l").innerHTML = 'Ladataan...';
        qs("#cfg").style.display = 'none';
        configRead = false;
      }
      if (state === undefined || configRead || !state) {
        return;
      }
      
      qs("#cfg-l").innerHTML = '';
      qs("#cfg").style.display = 'block';

      let c = state.c;
      let ci = state.ci;

      qs("#g").value = c.g;
      qs("#vat").value = c.vat;
      qs("#day").value = c.day;
      qs("#night").value = c.night;

      qs("#ci").innerHTML = (inst+1);

      qs("#en").checked = ci.en ? "checked" : "";
      qs("#n").value = c.names[inst];
      qs("#mode").innerHTML = MODE_STR.map((m, i) => `<option value="${i}">${m}</option>`)
      qs("#mode").value = ci.mode;
      qs("#outs").value = ci.o.join(",");
      qs("#inv").checked = ci.i ? "checked" : "";

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
        qs(`#b${i}`).checked = (c.b & (1 << i)) == (1 << i);
        setRadio(`f${i}`, (c.f & (1 << i)) == (1 << i) ? (c.fc & (1 << i)) == (1 << i) ? 1 : 0 : -1);
      }
      
      qs("#min").value = ci.m;
      qs("#oc").value = ci.oc;
      qs("#err").checked = ci.e ? "checked" : "";
      qs("#m0-cmd").checked = ci.m0.c ? "checked" : "";
      qs("#m1-lim").value = ci.m1.l;
      qs("#m2-per").value = ci.m2.p;
      qs("#m2-cnt").value = ci.m2.c;
      qs("#m2-sq").checked = ci.m2.s ? "checked" : "";
      qs("#m2-m").value = ci.m2.m;
      qs("#m2-lim").value = ci.m2.l;
      qs("#m2-ps").value = `${ci.m2.ps}`.padStart(2, "0");
      qs("#m2-pe").value = `${ci.m2.pe}`.padStart(2, "0");
      qs("#m2-ps2").value = `${ci.m2.ps2}`.padStart(2, "0");
      qs("#m2-pe2").value = `${ci.m2.pe2}`.padStart(2, "0");
      qs("#m2-cnt2").value = ci.m2.c2;
      checkCustomPeriodDisplay(ci.m2.p);

      configRead = true;
    } catch (err) {
      console.error(err);

    }
  };

  let save = async (e) => {
    e.preventDefault();

    const limit = (min, value, max) => Math.min(max, Math.max(min, value));

    try {
      let c = state.c;
      let ci = state.ci;
      let avgn = (e) => qs(e).value == "avg" ? "avg" : n(qs(e).value);

      c.g = qs("#g").value;
      c.vat = n(qs("#vat").value);
      c.day = n(qs("#day").value);
      c.night = n(qs("#night").value);

      ci.en = qs("#en").checked ? 1 : 0;
      c.names[inst] = qs("#n").value;
      ci.mode = n(qs("#mode").value);
      ci.o = qs("#outs").value.split(",").map(v => n(v));
      ci.i = qs("#inv").checked ? 1 : 0;

      ci.b = 0;
      ci.f = 0;
      ci.fc = 0;
      for (let i = 0; i < 24; i++) {
        if (qs(`#b${i}`).checked) {
          ci.b = ci.b | (1 << i);
        }
        
        let val = qs(`[name=f${i}]:checked`).value;

        if (val != -1) {
          ci.f = ci.f | (1 << i);
          ci.fc = ci.fc | (val << i);
        }
      }
      ci.e = qs("#err").checked ? 1 : 0;
      ci.m = n(qs("#min").value);
      ci.m = limit(0, ci.m, 60);
      ci.oc = n(qs("#oc").value);

      ci.m0.c = qs("#m0-cmd").checked ? 1 : 0;
      ci.m1.l = avgn("#m1-lim");
      ci.m2.p = n(qs("#m2-per").value);
      ci.m2.c = n(qs("#m2-cnt").value);
      ci.m2.s = qs("#m2-sq").checked ? 1 : 0;
      ci.m2.m = avgn("#m2-m");
      ci.m2.l = avgn("#m2-lim");
      ci.m2.ps = limit(0, n(qs("#m2-ps").value), 23);
      ci.m2.pe = limit(ci.m2.ps, n(qs("#m2-pe").value), 24);
      ci.m2.ps2 = limit(0, n(qs("#m2-ps2").value), 23);
      ci.m2.pe2 = limit(ci.m2.ps2, n(qs("#m2-pe2").value), 24);
      ci.m2.c2 = n(qs("#m2-cnt2").value);

      //Checking count limits
      ci.m2.c = limit(0, ci.m2.c, ci.m2.p > 0 ? ci.m2.p : ci.m2.pe - ci.m2.ps);
      ci.m2.c2 = limit(0, ci.m2.c2, ci.m2.pe2 - ci.m2.ps2);

      DBG(me(), "Settings to save:", c, ci);

      let res = await getData(`${URL}/rpc/KVS.Set?key="porssi-config-${(inst + 1)}"&value="${encodeURIComponent(JSON.stringify(ci))}"`);
      let res2 = await getData(`${URL}/rpc/KVS.Set?key="porssi-config-common"&value="${encodeURIComponent(JSON.stringify(c))}"`);

      if (res.code == 200 && res2.code == 200) {
        getData(`${URLS}?r=r&i=${inst}`)
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
      throw err;
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
