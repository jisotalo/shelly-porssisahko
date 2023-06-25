let latestLogTs = -1;
let RELAY_DESC = {
  0: "Unknown",
  1: "Skripti käynnistetty",
  10: "Yhteysvirhe ja on varmuustunti -> päälle",
  11: "Yhteysvirhe ja ei varmuustunti -> pois",
  12: "Yhteysvirhe eikä kello tiedossa -> päälle",
  13: "Yhteysvirhe eikä kello tiedossa -> pois",
  20: "Käsiohjaus -> päälle",
  21: "Käsiohjaus -> pois",
  30: "Hinta alle hintarajan -> päälle",
  31: "Hinta yli hintarajan -> päälle",
  40: "On halvimpia tunteja -> päälle",
  41: "Ei ole halvimpia tunteja -> pois",
  42: "Ei ole halvimpia mutta alle rajan -> päälle"
};

const runStatusUpdater = async () => {
  try {
    await updateStatus();
    await updateRelayLog();
  } catch { }

  setTimeout(runStatusUpdater, 5000);
};

const updateStatus = async () => {
  debug(me(), "Updating status");
  qs("#status-loading").style.visibility = "visible";

  try {
    const res = await getData(`${BASE_SCRIPT_URL}?req=api-status`);

    if (res.success) {
      const data = res.data;
      debug(me(), "api-status data:", res.data);

      qs("#status-relayOnReq").innerHTML = res.data.relayOnReq ? `<txt-green>PÄÄLLÄ</txt-green>` : `<txt-red>POIS</txt-red>`;

      let modeStr = "";
      switch (data.mode) {
        case 0:
          modeStr = "Käsiohjaus";
          break;
        case 1:
          modeStr = "Hintaraja";
          break;
        case 2:
          modeStr = "Halvimmat tunnit";
          break;
        default:
          modeStr = "Ei tiedossa";
          break;
      }

      qs("#status-mode").innerHTML = modeStr;
      qs("#status-priceInfo").innerHTML = res.data.lastPrice >= 0 ? `${res.data.lastPrice.toFixed(2)} c/kWh (päivitetty ${formatTime(new Date(res.data.lastCheckedEpoch * 1000))})` : "Ei tiedossa";
      qs("#status-lastCheckResultStr").innerHTML = res.data.lastCheckResultStr;
      qs("#status-info").innerHTML = `Käynnistetty ${formatDateTime(new Date(res.data.started * 1000))} (up: ${((new Date().getTime() - res.data.started * 1000)/1000.0/60.0/60.0/24.0).toFixed("1")} d) - versio ${res.data.version}`;
      
      if (res.data.infoStr.includes("#cheapest")) {
        qs("#status-infoStr").innerHTML = res.data.infoStr.replace("#cheapest", `Halvimmat ${res.data.infoData.length} tuntia 24h aikana ovat:<br>` + res.data.infoData.map((h, i) => {
          const date = new Date(h.timestamp * 1000);
          const str = `&nbsp;${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

          return `${str} (${h.price.toFixed(2)} c/kWh)`;
        }).join("<br>"));

      } else if (res.data.infoStr === "#priceInfo") {
        qs("#status-infoStr").innerHTML = `Hinta nyt: ${res.data.infoData.price.toFixed(2)} c/kWh - hintaraja: ${res.data.infoData.limit.toFixed(2)} c/kWh`;
      } else {
        qs("#status-infoStr").innerHTML = res.data.infoStr;
      }

      qs("#status-alv").innerHTML = res.data.alv > 0 ? `Hinta sisältää ALV ${(res.data.alv * 100.0).toFixed(0)} %` : "";
    } else {
      throw new Error(`Yhteysvirhe: ${res.status}`);
    }

  } catch (err) {
    console.error(me(), `Error:`, err);

    qs("#status-relayOnReq").innerHTML = "<txt-red>VIRHE - Tila ei tiedossa</txt-red>";
    qs("#status-mode").innerHTML = "-";
    qs("#status-priceInfo").innerHTML = "-";
    qs("#status-lastCheckResultStr").innerHTML = "-";
    qs("#status-infoStr").innerHTML = "-";

  } finally {
    qs("#status-loading").style.visibility = "hidden";
  }
};

const updateRelayLog = async () => {
  debug(me(), "Updating relay log");
  try {
    const res = await getData(`${BASE_SCRIPT_URL}?req=api-relay-log&last=${latestLogTs}`);

    if (res.success && res.statusCode === 200) {
      const log = res.data.reverse();
      latestLogTs = log[0].ts;
      qs("#status-relay-log").innerHTML = "";

      for (let i = 0; i < log.length; i++) {
        const line = log[i];
        qs("#status-relay-log").innerHTML += `
              <tr>
                <td class="fit">${formatDateTime(new Date(line.ts * 1000))}</td>
                <td class="fit"><b>${(line.on ? "<txt-green>PÄÄLLÄ</txt-green>" : "<txt-red>POIS</txt-red>")}</b></td>
                <td>${RELAY_DESC[line.desc]}${(line.price >= 0 ? ` [${line.price.toFixed(2)} c/kWh]` : "")}</td>
              </tr>
            `;
      }
    } else if (res.success && res.statusCode === 204) {
      debug(me(), "No new data for relay log");

    } else {
      console.error(me(), "Error - failed to read relay log");
    }

  } catch (err) {
    console.error(me(), "Error - ", err);
  }
};

const statusOnLoad = async () => {
  debug(me(), "onload begin");
  toggleLoading("Ladataan tilatietoja...");
  await runStatusUpdater();
  toggleLoading();
  debug(me(), "onload done");
};

statusOnLoad();