//__REPLACED_WITH_MAIN_CODE__

/**
 * Tämä esimerkki hyödyntää Shelly Plus Add-onin mittaamaa ulkolämpötilaa pörssisähköohjausten asetuksissa
 * Mitä kylmempi lämpötila, sitä useampi halvempi tunti ohjataan ja samalla myös ohjausminuuttien määrää kasvatetaan.
 */

//Alkuperäiset muokkaamattomat asetukset
let originalConfig = {
  hours: 0,
  minutes: 60
};

function USER_CONFIG(config, state, initialized) {
  //Tallenentaan alkuperäiset asetukset muistiin
  if (initialized) {
    originalConfig.hours = config.m2.cnt;
    originalConfig.minutes = config.min;

    console.log("Alkuperäiset asetukset:", originalConfig);
  }

  //Käytetää lähtökohtaisesti alkuperäisiin asetuksiin tallennettua tuntimäärää ja ohjausminuutteja
  //Näin ollen jos tallentaa asetukset käyttöliittymältä, tulee ne myös tähän käyttöön
  let hours = originalConfig.hours;
  let minutes = originalConfig.minutes;

  try {
    let temp = Shelly.getComponentStatus("temperature:100");

    if (!temp) {
      state.s.str = "Lämpötilaohjauksen virhe - anturia 100 ei löytynyt";
      throw new Error("Lämpötila-anturia 100 ei löytynyt");
    }

    if (temp.tC == null) {
      state.s.str = "Lämpötilaohjauksen virhe - onko anturi kytketty?";
      throw new Error("Onko anturi kytketty?");
    }

    //------------------------------
    // Toimintalogiikka
    // muokkaa haluamaksesi
    //------------------------------

    //Muutetaan lämpötilan perusteella lämmitystuntien määrää ja minuutteja
    if (temp.tC <= -15) {
      hours = 8;
      minutes = 60;

    } else if (temp.tC <= -10) {
      hours = 7;
      minutes = 45;

    } else if (temp.tC <= -5) {
      hours = 6;
      minutes = 45;
      
    } else {
      //Ei tehdä mitään --> käytetään käyttöliittymän asetuksia
    } 

    //------------------------------
    // Toimintalogiikka päättyy
    //------------------------------
    state.s.str = "Lämpötila " + temp.tC.toFixed(1) + "°C -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";
    console.log("Lämpötila:", temp.tC.toFixed(1), "°C -> asetettu halvimpien tuntien määräksi ", hours, "h ja ohjausminuuteiksi", minutes, "min");


  } catch (err) {
    state.s.str = "Virhe lämpötilaohjauksessa:" + err;
    console.log("Virhe tapahtui USER_CONFIG-funktiossa. Virhe:", err);
  }

  //Asetetaan arvot asetuksiin
  config.m2.cnt = hours;
  config.min = minutes;

  return config;
}