/**
 * shelly-porssisahko
 * 
 * (c) Jussi isotalo - http://jisotalo.fi
 * https://github.com/jisotalo/shelly-porssisahko
 * 
 * License: GNU Affero General Public License v3.0 
 */
{
  let prevHistoryTs = 0;

  const onUpdate = async () => {
    try {
      if (state === undefined) {
        return;
      } else if (!state) {
        throw new Error("no data");
      }

      let d = state;
      
      //History
      d.h = d.h.sort((a, b) => b[0] - a[0]);

      if (d.h.length > 0 && prevHistoryTs !== d.h[0][0]) {
        qs("#s-hist").innerHTML = "";

        for (let row of d.h) {
          let data = `<tr>`;
          data += `<td class="fit">${formatTime(new Date(row[0] * 1000))}</td>`;
          data += `<td style="color:${row[1] ? `green` : `red`}">${row[1] ? `Ohjaus päälle` : `Ohjaus pois`}</td>`;
          data += `<td>${STATE_STR[row[2]]?.replace(" (%s asti)", "")}</td>`;
          data += `</tr>`;

          qs("#s-hist").innerHTML += data;
        }
        prevHistoryTs = d.h[0][0];
      }

    } catch (err) {
      console.error(err);
      qs("#s-hist").innerHTML = err;
    }
  };

  onUpdate();
  CBS.push(onUpdate);
}