const porssiModeChanged = (e) => {
  let value = qs("#cfg-mode").value;

  qs("#cfg-table-0").style.display = "none";
  qs("#cfg-table-1").style.display = "none";
  qs("#cfg-table-2").style.display = "none";
  qs("#cfg-table-common").style.display = "none";

  switch (value) {
    case "0":
      qs("#cfg-mode-desc").innerHTML = "Hintaohjaus pois käytöstä, ohjaus asetetaan käsin päälle/pois.";
      qs("#cfg-table-0").style.display = "table";
      break;
    case "1":
      qs("#cfg-mode-desc").innerHTML = "Ohjaus on päällä kun sähkön hinta on alle rajan.";
      qs("#cfg-table-1").style.display = "table";
      qs("#cfg-table-common").style.display = "table";
      break;
    case "2":
      qs("#cfg-mode-desc").innerHTML = "Ohjaus on päällä vuorokauden halvimpina tunteinta, tai aina jos hinta on alle rajan.<br><br>Huom: Käyttää vuorokautena UTC-aikavyöhykkeen (GMT) aikaa. Eli 24h jakso on suomen aikaa esim. 03:00-02:59 riippuen kesä/talviajasta.";
      qs("#cfg-table-2").style.display = "table";
      qs("#cfg-table-common").style.display = "table";
      break;
  }
};

const getPorssiConfig = async () => {
  toggleLoading("Ladataan asetuksia...");

  const res = await getData(`${BASE_URL}/rpc/KVS.GetMany?match=porssi-settings`);
  if (res.success) {
    const data = res.data.items["porssi-settings"].value;
    debug(me(), "settings data:", data);

    qs("#cfg-mode").value = data.mode;
    qs("#cfg-manualCmd").checked = data.manualCmd ? "checked" : "";
    qs("#cfg-priceLimit").value = data.priceLimit;
    qs("#cfg-numberOfHours").value = data.numberOfHours;
    qs("#cfg-alwaysOnPriceLimit").value = data.alwaysOnPriceLimit;
    qs("#cfg-backupHours").value = data.backupHours.join(",");
    qs("#cfg-alv").value = (data.alv * 100.0).toFixed(0);
    qs("#cfg-errorCmd").checked = data.errorCmd ? "checked" : "";
    qs("#cfg-welcomeShown").checked = data.welcomeShown ? "" : "checked";

    porssiModeChanged();

    if (!data.welcomeShown) {
      showWelcomeModal();
    }
  } else {
    throw new Error(`Yhteysvirhe: ${res.status}`);
  }
  toggleLoading();
};

const setPorssiConfig = async (e) => {
  e.preventDefault();

  const config = {
    mode: Number(qs("#cfg-mode").value),
    priceLimit: Number(qs("#cfg-priceLimit").value),
    numberOfHours: Number(qs("#cfg-numberOfHours").value),
    alwaysOnPriceLimit: Number(qs("#cfg-alwaysOnPriceLimit").value),
    manualCmd: qs("#cfg-manualCmd").checked,
    backupHours: qs("#cfg-backupHours").value.split(","),
    alv: Number(qs("#cfg-alv").value) / 100.0,
    errorCmd: qs("#cfg-errorCmd").checked,
    dataSource: 0, /*todo*/
    welcomeShown: !qs("#cfg-welcomeShown").checked
  };

  debug(me(), "Settings to save:", config);

  toggleLoading("Tallennetaan asetuksia...");
  const res = await getData(`${BASE_URL}/rpc/KVS.Set?key="porssi-settings"&value=${(JSON.stringify(config))}`);
  debug(me(), "Settings saved:", res);
  showModal("Asetukset tallennettu", "Asetukset tallennettu - muutokset otetaan pian käyttöön.");

  if (res.success) {
    getData(`${BASE_SCRIPT_URL}?req=api-cmd&cmd=reload-settings`).catch(err => {
      console.error("Failed to request setting reload:", err);
      showModal("Virhe", `Tallentaminen onnistui mutta asetuksia ei päivitetty.<br><br>Virhetiedot: ${err})`);
    });
  } else {
    showModal("Virhe", `Tallentaminen epäonnistui. Virhetiedot: ${res.statusText})`);
  }

  toggleLoading();
  await getPorssiConfig();
};

qs("#cfg-form").addEventListener("submit", setPorssiConfig);
qs("#cfg-mode").addEventListener("change", porssiModeChanged);

const contentSettingsOnLoad = async () => {
  debug(me(), "onload begin");
  await getPorssiConfig();
  debug(me(), "onload done");
};

contentSettingsOnLoad();