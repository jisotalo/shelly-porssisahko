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

      qs("#c-mode").innerHTML = MODE_STR.map((m, i) => `<option value="${i}">${m}</option>`)

      qs("#c-mode").value = c.mode;
      qs("#c-out").value = c.out;
      qs("#c-vat").value = c.vat;
      qs("#c-day").value = c.day;
      qs("#c-night").value = c.night;

      let backups = "";
      for (let i = 0; i < 24; i++) {
        backups += `<input type="checkbox" id="c-backups-${i}"><label for="c-backups-${i}">${(i + 1).toString().padStart(2, "0")}</label> `
      }
      qs("#c-backups").innerHTML = backups;

      qs("#c-err").checked = c.err ? "checked" : "";
      qs("#c-m0-cmd").checked = c.m0.cmd ? "checked" : "";
      qs("#c-m1-lim").value = c.m1.lim;
      qs("#c-m2-per").value = c.m2.per;
      qs("#c-m2-cnt").value = c.m2.cnt;
      qs("#c-m2-lim").value = c.m2.lim;

      configRead = true;
    } catch (err) {
      console.error(me(), `Error:`, err);

    }
  };

  const save = async (e) => {
    e.preventDefault();

    try {
      let c = state.c
      let n = (v) => Number(v);

      c.mode = n(qs("#c-mode").value);
      c.out = n(qs("#c-out").value);
      c.vat = n(qs("#c-vat").value);
      c.day = n(qs("#c-day").value);
      c.night = n(qs("#c-night").value);

      c.backups = [];
      for (let i = 0; i < 24; i++) {
        if (qs(`#c-backups-${i}`).checked) {
          c.backups.push(i);
        }
      }

      c.err = qs("#c-err").checked ? 1 : 0;
      c.m0.cmd = qs("#c-m0-cmd").checked ? 1 : 0;
      c.m1.lim = n(qs("#c-m1-lim").value);
      c.m2.per = n(qs("#c-m2-per").value);
      c.m2.cnt = n(qs("#c-m2-cnt").value);
      c.m2.lim = n(qs("#c-m2-lim").value);

      if (c.m2.cnt > c.m2.per) {
        throw new Error("Tuntimäärä > ajanjakso");
      }

      DBG(me(), "Settings to save:", c);

      const res = await getData(`${URL}/rpc/KVS.Set?key="porssi-config"&value=${(JSON.stringify(c))}`);

      if (res.ok) {
        getData(`${URL_SCRIPT}?r=r`)
          .then(res => {
            alert(`Asetukset tallennettu!`);
            configRead = false;
          })
          .catch(err => {
            alert(`Asetukset tallennettu mutta päivitys epäonnistui: ${err})`);
          });

      } else {
        alert(`Tallentaminen epäonnistui. Virhetiedot: ${res.txt})`);
      }
    } catch (err) {
      alert("Virhe: " + err.message);
    }
  };

  const force = async () => {
    let data = prompt("Kuinka monta tuntia?");
    if (data !== null) {
      data = Number(data);
      data = data > 0 ? Math.floor(Date.now() / 1000 + data * 60 * 60) : 0;

      let res = await getData(`${URL_SCRIPT}?r=f&ts=${data}`);
      console.log(res);

      alert(res.ok ? "OK!" : `Virhe: ${res.txt}`);
    }
  }

  onUpdate();
  CBS.push(onUpdate);
  qs("#c-save").addEventListener("click", save);
  qs("#c-shelly").addEventListener("click", () => window.open("/"));
  qs("#c-force").addEventListener("click", force);
}
