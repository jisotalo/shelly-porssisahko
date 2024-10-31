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
  //let prevHistoryTs = 0;

  const onUpdate = async (instChanged) => {
    try {
      if (instChanged) {
        qs("#s-hist").innerHTML = "";
        history = [];
      }

      if (state === undefined || activeTab != "tab-history") {
        return;
      } else if (!state) {
        throw new Error("no data");
      }

      let res = await getData(`${URLS}?r=h&i=${inst}`);

      if (res.ok) {
        history = res.data;

        //If status 503 the shelly is just now busy running the logic -> do nothing
      } else if (res.code !== 503) {
        history = [];
      }

      //History
      history = history.sort((a, b) => b[0] - a[0]);
      qs("#s-hist").innerHTML = "";

      for (let row of history) {
        let data = `<tr>`;
        data += `<td class="fit">${formatTime(new Date(row[0] * 1000))}</td>`;
        data += `<td style="color:${row[1] ? `green` : `red`}">${row[1] ? `Ohjaus päälle` : `Ohjaus pois`}</td>`;
        data += `<td>${STATE_STR[row[2]]?.replace(" (%s asti)", "")}</td>`;
        data += `</tr>`;

        qs("#s-hist").innerHTML += data;
      }

    } catch (err) {
      console.error(err);
      qs("#s-hist").innerHTML = err;
    }
  };

  onUpdate();
  CBS.push(onUpdate);
}