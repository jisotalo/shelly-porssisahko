//__REPLACED_WITH_MAIN_CODE__

/**
 * Tämä esimerkki hyödyntää Open-Meteo-palvelun sääennustetta halvimpien tuntien määrän valintaan
 * Mitä kylmempi lämpötila, sitä useampi halvempi tunti ohjataan ja samalla myös ohjausminuuttien määrää kasvatetaan.
 * 
 * Muokkaa alle sijaintisi koordinaatit - esimerkkinä Tampere
 * Löydät koordinaatit esim. https://www.openstreetmap.org/ - klikkaa hiiren oikealla ja valitse "näytä osoite"
 * 
 * Sen jälkeen muokkaa alempaa toimintalogiikka haluamaksesi
 */
let LATITUDE = "61.4991";
let LONGITUDE = "23.7871";

/**
 * Alkuperäiset asetukset
 */
let originalConfig = {
  hours: 0,
  minutes: 60
};

/**
 * Päivä, jonka lämpötilat on haettu
 */
let activeDay = -1;

/**
 * Päivän matalin ja korkein lämpötila
 */
let tempData = {
  min: null,
  max: null
};

/**
 * Käytetään USER_CONFIG hyödyksi ja tallennetaan alkuperäiset asetukset
 */
function USER_CONFIG(config, state, initialized) {
  //Tallenentaan alkuperäiset asetukset muistiin
  if (initialized) {
    //Suoritetaan lämpötilalogiikka
    activeDay = -1;

    originalConfig.hours = config.m2.cnt;
    originalConfig.minutes = config.min;

    console.log("Alkuperäiset asetukset:", originalConfig);
  }

  return config;
}

/**
 * Kun logiikka on suoritettu, katsotaan onko lämpötilan vaikutus jo tarkistettu tälle päivää
 * Jos ei ole, haetaan lämpötilat ja muutetaan tuntimääriä
 */
function USER_OVERRIDE(cmd, state, callback) {
  //Käytetää lähtökohtaisesti alkuperäisiin asetuksiin tallennettua tuntimäärää ja ohjausminuutteja
  //Näin ollen jos tallentaa asetukset käyttöliittymältä, tulee ne myös tähän käyttöön
  let hours = originalConfig.hours;
  let minutes = originalConfig.minutes;

  try {
    if (activeDay == new Date().getDate()) {
      console.log("Lämpötilat haettu jo tälle päivälle -> ei muutoksia:", tempData);
      callback(cmd);
      return;
    }

    let req = {
      url: "https://api.open-meteo.com/v1/forecast?latitude=" + LATITUDE + "&longitude=" + LONGITUDE + "&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1",
      timeout: 5,
      ssl_ca: "*"
    };

    console.log("Haetaan lämpötilatietoja:", req.url);
    
    Shelly.call("HTTP.GET", req, function (res, err, msg) {
      try {
        req = null;

        if (err === 0 && res != null && res.code === 200 && res.body) {
          let data = JSON.parse(res.body);
          res.body = null;

          //Tarkistetaan, onko vastaus validi
          if (data.daily.temperature_2m_min != undefined && data.daily.temperature_2m_max != undefined) {
            //Nyt meillä on alhaisin ja korkein lämpötila tälle päivälle
            tempData.min = data.daily.temperature_2m_min[0];
            tempData.max = data.daily.temperature_2m_max[0];

            console.log("Lämpötilat:", tempData);

            //------------------------------
            // Toimintalogiikka
            // muokkaa haluamaksesi
            //------------------------------

            //Muutetaan päivän alhaisimman lämpötilan perusteella lämmitystuntien määrää ja minuutteja
            if (tempData.min <= -15) {
              //Vuorokauden aikana alimmillaan alle -15 °C
              hours = 8;
              minutes = 60;

            } else if (tempData.min <= -10) {
              //Vuorokauden aikana alimmillaan -15...-10 °C
              hours = 7;
              minutes = 45;

            } else if (tempData.min <= -5) {
              //Vuorokauden aikana alimmillaan -10...-5 °C
              hours = 6;
              minutes = 45;

            } else {
              //Ei tehdä mitään --> käytetään käyttöliittymän asetuksia
            } 


            

            //------------------------------
            // Toimintalogiikka päättyy
            //------------------------------
            state.s.str = "Kylmintä tänään: " + tempData.min.toFixed(1) + "°C -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";
            console.log("Kylmintä tänään:", tempData.min.toFixed(1), "°C -> asetettu halvimpien tuntien määräksi ", hours, "h ja ohjausminuuteiksi", minutes, "min");


            //Tänään ei enää tarvitse hakea
            activeDay = new Date().getDate();
            
          } else {
            throw new Error("Virheellinen lämpötiladata");
          }
        } else {
          throw new Error("Lämpötilojen haku epäonnistui:" + msg);
        }

      } catch (err) {
        state.s.str = "Virhe lämpötilaohjauksessa:" + err;
        console.log("Virhe lämpötiloja käsitellessä:", err);
      }

      //Asetetaan arvot asetuksiin
      //HUOM: Jos käytät "oma valinta (2 jaksoa)", 2. jakson tunnit voit asettaa muuttujaan "state.c.m2.cnt2"
      state.c.m2.cnt = hours;
      state.c.min = minutes;

      //Pyydetään suorittamaan logiikka uusiksi
      callback(null);
      return;
    });

  } catch (err) {
    state.s.str = "Virhe lämpötilaohjauksessa:" + err;
    console.log("Virhe tapahtui USER_CONFIG-funktiossa. Virhe:", err);

    state.c.m2.cnt = hours;
    state.c.min = minutes;

    callback(cmd);
  }
}