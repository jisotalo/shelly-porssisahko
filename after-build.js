const fs = require('fs').promises;

const run = async () => {
  let filePath = `dist/shelly-porssisahko.js`;
  let data = (await fs.readFile(filePath)).toString();
  

  let userOverride = `${data}

function USER_OVERRIDE(cmd, state, callback) {
  try {
    console.log("Suoritetaan USER_OVERRIDE. Ohjauksen tila ennen: ", cmd);

    let temp = Shelly.getComponentStatus("temperature:100");

    if (!temp) {
      throw new Error("Kyseistä lämpötila-anturia ei löytynyt");
    }

    if (cmd && temp.tC > 15) {
      console.log("Lämpötila on yli 15 astetta, asetetaan ohjaus pois. Lämpötila nyt:", temp.tC);
      cmd = false;

    } else if (!cmd && temp.tC < 5) {
      console.log("Lämpötila on alle 5 astetta, asetetaan ohjaus päälle. Lämpötila nyt:", temp.tC);
      cmd = true;
    }
    
    console.log("USER_OVERRIDE suoritettu. Ohjauksen tila nyt: ", cmd);
    callback(cmd);

  } catch (err) {
    console.log("Virhe tapahtui USER_OVERRIDE-funktiossa. Virhe:", err);
    callback(cmd);
  }
}`;
  
  await fs.writeFile(`dist/shelly-porssisahko-user-override.js`, Buffer.from(userOverride, 'utf8'));

  
  let userConfig = `${data}

function USER_CONFIG(config) {
  config = {
    /**  
     * Active mode
     * 0: manual mode (on/off toggle)
     * 1: price limit
     * 2: cheapest hours 
    */
    mode: 0,
    /** Settings for mode 0 (manual) */
    m0: {
      /** Manual relay output command [0/1] */
      cmd: 0
    },
    /** Settings for mode 1 (price limit) */
    m1: {
      /** Price limit limit - if price <= relay output command is set on [c/kWh] */
      lim: 0
    },
    /** Settings for mode 2 (cheapest hours) */
    m2: {
      /** Period length [h] (example: 24 -> cheapest hours during 24h) */
      per: 24,
      /** How many cheapest hours */
      cnt: 0,
      /** Always on price limit [c/kWh] */
      lim: -999,
      /** Should the hours be sequential / in a row [0/1] */
      sq: 0,
      /** Maximum price limit [c/kWh] */
      m: 999
    },
    /** VAT added to spot price [%] */
    vat: 24,
    /** Day (07...22) transfer price [c/kWh] */
    day: 0,
    /** Night (22...07) transfer price [c/kWh] */
    night: 0,
    /** Backup hours [binary] (example: 0b111111 = 00, 01, 02, 03, 04, 05) */
    bk: 0b0,
    /** Relay output command if clock time is not known [0/1] */
    err: 0,
    /** Output number to use [0..n] */
    out: 0,
    /** Forced ON hours [binary] (example: 0b110000000000001100000 = 05, 06, 19, 20) */
    fh: 0b0,
    /** Invert output [0/1] */
    inv: 0
  };

  return config;
}`;
  await fs.writeFile(`dist/shelly-porssisahko-user-config.js`, Buffer.from(userConfig, 'utf8'));
}

run();