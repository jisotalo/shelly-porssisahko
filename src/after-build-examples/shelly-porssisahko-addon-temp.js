//__REPLACED_WITH_MAIN_CODE__

/**
 * Tämä esimerkki ylikirjoittaa pörssisähköohjauksen lähdön tarvittaessa
 * Plus Add-onin mittaaman lämpötilan perusteella.
 * 
 * Idea on, että jos lämpötila on tarpeeksi korkea, ei ohjata turhaan.
 * Ja jos lämpötila onkin liian matala, ohjataan vaikka olisi kallista.
 * 
 * Katso lisää:
 * https://github.com/jisotalo/shelly-porssisahko?tab=readme-ov-file#esimerkki-l%C3%A4mp%C3%B6tilaohjaus-shelly-plus-add-on-ja-ds18b20
 */
function USER_OVERRIDE(cmd, state, callback) {
  try {
    //console.log("Suoritetaan USER_OVERRIDE. Ohjauksen tila ennen: ", cmd);
    let temp = Shelly.getComponentStatus("temperature:100");

    if (!temp) {
      state.s.str = "Lämpötilaohjauksen virhe - anturia 100 ei löytynyt";
      throw new Error("Lämpötila-anturia 100 ei löytynyt");
    }

    if (temp.tC == null) {
      state.s.str = "Lämpötilaohjauksen virhe - onko anturi kytketty?";
      throw new Error("Onko anturi kytketty?");
    }

    if (cmd && temp.tC > 15) {
      state.s.str = "Lämpötila " + temp.tC + "°C on yli 15°C -> ohjaus pois";
      console.log("Lämpötila on yli 15 astetta, asetetaan ohjaus pois. Lämpötila nyt:", temp.tC);
      cmd = false;

    } else if (!cmd && temp.tC < 5) {
      state.s.str = "Lämpötila " + temp.tC + "°C on alle 5°C -> ohjaus päälle";
      console.log("Lämpötila on alle 5 astetta, asetetaan ohjaus päälle. Lämpötila nyt:", temp.tC);
      cmd = true;

    } else {
      state.s.str = "Lämpötila " + temp.tC + "°C -> mennään ohjauksen mukaan";
    }
    
    //console.log("USER_OVERRIDE suoritettu. Ohjauksen tila nyt: ", cmd);
    callback(cmd);

  } catch (err) {
    console.log("Virhe tapahtui USER_OVERRIDE-funktiossa. Virhe:", err);
    state.s.str = "Lämpötilaohjauksen virhe:" + err;
    callback(cmd);
  }
}