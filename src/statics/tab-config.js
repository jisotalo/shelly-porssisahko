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
      qs("#fh").innerHTML = hours.replaceAll("X", "f");

      for (let i = 0; i < 24; i++) {
        qs(`#b${i}`).checked = (c.bk & (1 << i)) == (1 << i);
        qs(`#f${i}`).checked = (c.fh & (1 << i)) == (1 << i);
      }

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
      for (let i = 0; i < 24; i++) {
        if (qs(`#b${i}`).checked) {
          c.bk = c.bk | (1 << i);
        }
        if (qs(`#f${i}`).checked) {
          c.fh = c.fh | (1 << i);
        }
      }

      c.err = qs("#err").checked ? 1 : 0;
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
    let data = prompt("Tuntimäärä:");
    if (data !== null) {
      data = Number(data);
      data = data > 0 ? Math.floor(Date.now() / 1000 + data * 60 * 60) : 0;

      let res = await getData(`${URLS}?r=f&ts=${data}`);
      alert(res.code == 204 ? "OK!" : `Virhe: ${res.txt}`);
    }
  }

  onUpdate();
  CBS.push(onUpdate);
  qs("#save").addEventListener("click", save);
  qs("#force").addEventListener("click", force);
}
