
const showWifiList = async () => {
  qs("#ssid-list").innerText = null;
  await populateWifiList();
  qs("#ssid-list-container").style.display = "block";
};

const wifiSsidChanged = (e) => {
  qs("#wifi-1-ssid").value = e.target.value;
};

const populateWifiList = async () => {
  toggleLoading("Haetaan wifi-verkkoja...");

  const res = await getData(`${BASE_URL}/rpc/Wifi.Scan`);

  if (res.success) {
    const data = res.data;
    debug(me(), "wifis", data);

    qs("#ssid-list").add(new Option(`Valitse (${data.results.length} verkkoa löytyi`, ""));
    qs("#ssid-list").add(new Option("-------------", ""));

    for (let ssid of data.results) {
      qs("#ssid-list").add(new Option(`${ssid.ssid} (${ssid.rssi} dBms)`, ssid.ssid));
    }
  } else {
    qs("#ssid-list").add(new Option("error", ""));
  }
  toggleLoading();
};

const wifiStatusToStr = (s) => {
  switch (s) {
    case "got ip":
      return "Yhdistetty (IP saatu)";
    case "disconnected":
      return "Ei yhdistetty";
    case "connecting":
      return "Yhdistetään";
    case "connected":
      return "Yhdistetty";
    default:
      return s;
  }
};

const getWifiConfig = async () => {
  toggleLoading("Ladataan wifi-asetuksia...");

  let res = await getData(`${BASE_URL}/rpc/Wifi.GetStatus`);
  if (res.success) {
    const data = res.data;
    debug(me(), "wifi status:", data);

    qs("#wifi-1-status-state").innerHTML = wifiStatusToStr(data.status);
    qs("#wifi-1-status-ip").innerHTML = data.sta_ip;
    qs("#wifi-1-status-ssid").innerHTML = data.ssid;
  } else {
    debug(me(), "wifi status error:", res);
  }

  res = await getData(`${BASE_URL}/rpc/Wifi.GetConfig`);

  if (res.success) {
    const data = res.data;
    debug(me(), "wifi config:", data);

    qs("#wifi-1-enable").checked = data.sta.enable ? "checked" : "";
    qs("#wifi-1-ssid").value = data.sta.ssid;
    qs("#wifi-1-ssid-orig").value = data.sta.ssid;

    qs("#wifi-1-dhcp").checked = data.sta.ipv4mode === "dhcp" ? "checked" : "";
    qs("#wifi-1-ip").value = data.sta.ip;
    qs("#wifi-1-mask").value = data.sta.netmask;
    qs("#wifi-1-gw").value = data.sta.gw;
    qs("#wifi-1-nameserver").value = data.sta.nameserver;

    qs("#wifi-ap-enable").checked = data.ap.enable ? "checked" : "";
    qs("#wifi-ap-ssid").value = data.ap.ssid;
    qs("#wifi-ap-is-open").checked = data.ap.is_open ? "checked" : "";
    qs("#wifi-ap-pass").value = data.ap.is_open ? "" : "_default_";

    toggleWifiDhcp();
    toggleWifiApOpen();
  } else {
    debug(me(), "wifi config error:", res);
  }
  toggleLoading();
};

const toggleWifiDhcp = () => {
  const dhcp = qs("#wifi-1-dhcp").checked;

  qs("#wifi-1-ip").disabled = dhcp;
  qs("#wifi-1-mask").disabled = dhcp;
  qs("#wifi-1-gw").disabled = dhcp;
  qs("#wifi-1-nameserver").disabled = dhcp;
};

const toggleWifiApOpen = () => {
  qs("#wifi-ap-pass").disabled = qs("#wifi-ap-is-open").checked;
};

const setWifiConfig = async (e) => {
  e.preventDefault();

  let config = {
    sta: {
      "enable": qs("#wifi-1-enable").checked,
      "ipv4mode": qs("#wifi-1-dhcp").checked ? "dhcp" : "static",
      "ip": qs("#wifi-1-ip").value,
      "netmask": qs("#wifi-1-mask").value,
      "gw": qs("#wifi-1-gw").value,
      "nameserver": qs("#wifi-1-nameserver").value,
    },
    ap: {
      enable: qs("#wifi-ap-enable").checked,
      is_open: qs("#wifi-ap-is-open").checked
    }
  };


  if (qs("#wifi-1-ssid-orig").value !== qs("#wifi-1-ssid").value || qs("#wifi-1-pass").value !== "_default_") {
    config.sta.ssid = qs("#wifi-1-ssid").value;
    config.sta.pass = qs("#wifi-1-pass").value;
  }

  if (qs("#wifi-ap-pass").value !== "" && !config.ap.is_open && qs("#wifi-ap-pass").value !== "_default_") {
    config.ap.pass = qs("#wifi-ap-pass").value;
    config.ap.ssid = qs("#wifi-ap-ssid").value;
  }

  debug(me(), "wifi settings to save:", config);
  toggleLoading("Tallennetaan wifi-asetuksia...");
  const res = await getData(`${BASE_URL}/rpc/Wifi.SetConfig?config=${JSON.stringify(config)}`);

  if (res.success) {
    showModal("Asetukset tallennettu", "Asetukset tallennettu - muutokset otetaan pian käyttöön.");
  } else if (config.ap.pass) {
    showModal("Virhe", `Tallentaminen epäonnistui. Tarkista että tiedot ovat oikein ja varmista että tukiaseman salasana on tarpeeksi pitkä.<br><br>Virhetiedot: ${res.statusText})`);
  } else {
    showModal("Virhe", `Tallentaminen epäonnistui. Tarkista että tiedot ovat oikein.<br><br>Virhetiedot: ${res.statusText})`);
  }
  toggleLoading();
  await getWifiConfig();
};

qs("#wifi-config-form").addEventListener("submit", setWifiConfig);
qs("#btn-ssid-select").addEventListener("click", showWifiList);
qs("#ssid-list").addEventListener("change", wifiSsidChanged);
qs("#wifi-1-dhcp").addEventListener("change", toggleWifiDhcp);
qs("#wifi-ap-is-open").addEventListener("change", toggleWifiApOpen);
qs("#btn-wifi-ip-settings").addEventListener("click", (e) => {
  const style = qs(`#table-wifi-ip-settings`).style;
  style.display = style.display === "block" ? "none" : "block";
});

const wifiOnLoad = async () => {
  debug(me(), "onload begin");
  await getWifiConfig();
  debug(me(), "onload done");
};

wifiOnLoad();