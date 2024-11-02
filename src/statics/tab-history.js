/**
 * shelly-porssisahko
 * 
 * (c) Jussi isotalo - http://jisotalo.fi
 * https://github.com/jisotalo/shelly-porssisahko
 * 
 * License: GNU Affero General Public License v3.0 
 */
{
  let history = [];

  /**
   * Clears page
   * Used when instance is changed or during error
   */
  const clear = (e) => {
    qs("s-hist").innerHTML = "<tr><td colspan=3>Ei historiaa</td></tr>";
  }

  /**
   * Callback called by main loop
   * 
   * @param {*} instChanged true = instance has changed (reset data)
   * @returns 
   */
  const onUpdate = async (instChanged) => {
    let e = qs("s-hist");

    try {
      if (instChanged || state == undefined) {
        return clear(e);
      }
      if (activeTab != "tab-history") {
        return;
      }

      let res = await getData(`${URLS}?r=h&i=${inst}`);

      if (res.ok) {
        history = res.data;

        if (!history.length) {
          return clear(e);
        }

        //If status 503 the shelly is just now busy running the logic -> do nothing
      } else if (res.code !== 503) {
        return clear(e);
      }

      //History
      e.innerHTML = "";

      for (let row of history.sort((a, b) => b[0] - a[0])) {
        let data = `<tr>`;
        data += `<td class="fit">${formatTime(new Date(row[0] * 1000))}</td>`;
        data += `<td style="color:${row[1] ? `green` : `red`}">${row[1] ? `Ohjaus päälle` : `Ohjaus pois`}</td>`;
        data += `<td>${STATE_STR[row[2]]?.replace(" (%s asti)", "")}</td>`;
        data += `</tr>`;

        e.innerHTML += data;
      }

    } catch (err) {
      console.error(err);
      e.innerHTML = err;
    }
  };

  onUpdate();
  CBS.push(onUpdate);
}