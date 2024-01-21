//__REPLACED_WITH_MAIN_CODE__

/**
 * Tämä yksinkertainen esimerkki näyttää kuinka voi tehdä vapaasti omia 
 * ohjauslogiikoita. Se asettaa ohjauksen pois, jos tuntihinta on 
 * yli 80% päivän keskiarvosta.
 * 
 * Eli jos keskiarvo on 10 c/kWh, ohjaus laitetaan pois tuntihinnan 
 * ollessa yli 8 c/kWh
 * 
 * Katso lisää:
 * https://github.com/jisotalo/shelly-porssisahko?tab=readme-ov-file#esimerkki-hinnan-ja-keskiarvon-hy%C3%B6dynt%C3%A4minen
 */
function USER_OVERRIDE(cmd, state, callback) {
  try {
    //console.log("Suoritetaan USER_OVERRIDE. Ohjauksen tila ennen: ", cmd);

    if (cmd && state.s.p.now > 0.8 * state.s.p.avg) {
      state.s.str = "Hinta (" + state.s.p.now.toFixed(2) + "c/kWh) on yli 80% keskiarvosta -> ohjaus pois";
      console.log("Hinta (" + state.s.p.now.toFixed(2) + "c/kWh) on yli 80% keskiarvosta -> ohjaus pois");
      cmd = false;

    } else {
      state.s.str = "Keskiarvo-ohjaus: hinta OK -> ei muutosta";
    }

    //console.log("USER_OVERRIDE suoritettu. Ohjauksen tila nyt: ", cmd);
    callback(cmd);

  } catch (err) {
    console.log("Virhe tapahtui USER_OVERRIDE-funktiossa. Virhe:", err);
    state.s.str = "Keskiarvo-ohjauksen virhe:" + err;
    callback(cmd);
  }
}