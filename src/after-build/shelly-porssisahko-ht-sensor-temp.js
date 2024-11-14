//__REPLACED_WITH_MAIN_CODE__

/**
 * Tämä käyttäjäskripti hyödyntää Shelly H&T:n lähettämää lämpötilaa pörssisähköohjausten asetuksissa
 * Mitä kylmempi lämpötila, sitä useampi halvempi tunti ohjataan ja samalla myös ohjausminuuttien määrää kasvatetaan.
 * 
 * Tämä muuttaa ainoastaan #1 ohjauksen asetuksia, muihin ei kosketa.
 * 
 * Käyttöönotto:
 * -----
 * Lisää Shelly H&T-asetuksiin "actions -> sensor reports" -osoitteisiin osoite
 *    http://ip-osoite/script/1/update-temp
 * missä ip-osoite on tämän shellyn osoite. 
 * Muista myös ottaa "sensor reports" -ominaisuus käyttöön
 */

//Mitä ohjausta hienosäädetään (0 = ohjaus #1, 1 = ohjaus #2 jne.)
let INSTANCE = 0;

//Kuinka vanha lämpötilatieto sallitaan ohjauksessa (tunteina)
let TEMPERATURE_MAX_AGE_HOURS = 12;

//Viimeisin tiedossa oleva lämpötiladata
let data = null;

//Alkuperäiset muokkaamattomat asetukset
let originalConfig = {
  hours: 0,
  minutes: 60
};

function USER_CONFIG(inst, initialized) {
  //Jos kyseessä on jonkun muun asetukset niin ei tehdä mitään
  if (inst != INSTANCE) {
    return;
  }

  //Vähän apumuuttujia
  const state = _;
  const config = state.c.i[inst];

  //Jos asetuksia ei vielä ole, skipataan (uusi asennus)
  if (typeof config.m2 == "undefined") {
    console.log("Tallenna asetukset kerran käyttäjäskriptiä varten");
    return;
  }

  //Tallenentaan alkuperäiset asetukset muistiin
  if (initialized) {
    originalConfig.hours = config.m2.c;
    originalConfig.minutes = config.m;

    console.log("Alkuperäiset asetukset:", originalConfig);
  }

  //Käytetää lähtökohtaisesti alkuperäisiin asetuksiin tallennettua tuntimäärää ja ohjausminuutteja
  //Näin ollen jos tallentaa asetukset käyttöliittymältä, tulee ne myös tähän käyttöön
  let hours = originalConfig.hours;
  let minutes = originalConfig.minutes;

  try {

    if (data == null) {
      console.log("Lämpötilatietoa ei ole saatavilla");
      state.si[inst].str = "Lämpötila ei tiedossa -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";

    } else {
      let age = (Date.now() - data.ts) / 1000.0 / 60.0 / 60.0;
      console.log("Lämpötila on tiedossa (päivittynyt " + age.toFixed(2) + " h sitten):", data);

      if (age <= TEMPERATURE_MAX_AGE_HOURS * 60) {
        //------------------------------
        // Toimintalogiikka
        // muokkaa haluamaksesi
        //------------------------------

        //Muutetaan lämpötilan perusteella lämmitystuntien määrää ja minuutteja
        if (data.temp <= -15) {
          hours = 8;
          minutes = 60;

        } else if (data.temp <= -10) {
          hours = 7;
          minutes = 45;

        } else if (data.temp <= -5) {
          hours = 6;
          minutes = 45;

        } else {
          //Ei tehdä mitään --> käytetään käyttöliittymän asetuksia
        }

        //------------------------------
        // Toimintalogiikka päättyy
        //------------------------------
        state.si[inst].str = "Lämpötila " + data.temp.toFixed(1) + "°C (" + age.toFixed(1) + "h sitten) -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";
        console.log("Lämpötila:", data.temp.toFixed(1), "°C -> asetettu halvimpien tuntien määräksi ", hours, "h ja ohjausminuuteiksi", minutes, "min");

      } else {
        console.log("Lämpötilatieto on liian vanha -> ei käytetä");
        state.si[inst].str = "Lämpötilatieto liian vanha (" + age.toFixed(1) + " h) -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";
      }
    }
  } catch (err) {
    state.si[inst].str = "Virhe lämpötilaohjauksessa:" + err;
    console.log("Virhe tapahtui USER_CONFIG-funktiossa:", err);
  }

  //Asetetaan arvot asetuksiin
  config.m2.c = hours;
  config.m = minutes;
}

/**
 * Apufunktio, joka kerää parametrit osoitteesta
 */
function parseParams(params) {
  let res = {};
  let splitted = params.split("&");

  for (let i = 0; i < splitted.length; i++) {
    let pair = splitted[i].split("=");

    res[pair[0]] = pair[1];
  }

  return res;
}

/**
 * Takaisinkutsu, joka suoritetaan kun saadaan HTTP-pyyntö
 */
function onHttpRequest(request, response) {
  try {
    let params = parseParams(request.query);
    request = null;

    if (params.temp != undefined) {
      data = {
        temp: Number(params.temp),
        ts: Math.floor(Date.now())
      };

      console.log("Lämpötilatiedot päivitetty, pyydetään pörssisähkölogiikan ajoa. Data:", data);

      _.si[INSTANCE].chkTs = 0; //Requesting to run logic again

      response.code = 200;

    } else {
      console.log("Lämpötilatiedojen päivitys epäonnistui, 'temp' puuttuu parametreista:", params);
      response.code = 400;
    }

    response.send();

  } catch (err) {
    console.log("Virhe:", err);
  }
}

//Rekisteröidään /script/x/update-temp -osoite
HTTPServer.registerEndpoint('update-temp', onHttpRequest);