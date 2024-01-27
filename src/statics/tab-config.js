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

  const setRadio = (name, value) => {
    document.querySelectorAll(`[name=${name}]`).forEach(e => e.checked = e.value == value);
  }

  const radioRow = (name, value) => `<td><input type="radio" name="${name}" value="${value}"></td>`;

  const onUpdate = async () => {
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
        hours += `<input type="checkbox" id="X${i}"><label for="X${i}">${("" + i).padStart(2, "0")}</label> `
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

      configRead = true;
    } catch (err) {
      console.error(err);

    }
  };

  const save = async (e) => {
    e.preventDefault();

    try {
      let c = state.c
      let n = (v) => Number(v);
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
      c.min = Math.max(0, Math.min(60, c.min));

      c.m0.cmd = qs("#m0-cmd").checked ? 1 : 0;
      c.m1.lim = avgn("#m1-lim");
      c.m2.per = n(qs("#m2-per").value);
      c.m2.cnt = Math.min(c.m2.per, n(qs("#m2-cnt").value));
      c.m2.sq = qs("#m2-sq").checked ? 1 : 0;
      c.m2.lim = avgn("#m2-lim");
      c.m2.m = avgn("#m2-m");

      DBG(me(), "Settings to save:", c);

      const res = await getData(`${URL}/rpc/KVS.Set?key="porssi-config"&value=${(JSON.stringify(c))}`);

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

  const force = async () => {

    let hours = Number(prompt("Pakko-ohjauksen kesto tunteina? (0 = peru nykyinen)"));
    if (!isNaN(hours)) {
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
}
