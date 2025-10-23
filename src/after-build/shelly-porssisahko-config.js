/**
 * Tämä skripti päivittää shelly-porssisahko -skriptin
 * asetukset Shellyn KVS-muistiin.
 * 
 * Käyttökohde esim. jos haluaa päivittää asetukset etänä,
 * ilman pääsyä hallintaan.
 * 
 * 1. Asenna skripti erikseen pörssisähkön rinnalle.
 * 2. Ota kommentit pois niistä asetuksista, joita haluat muuttaa.
 *    Eli // rivin alusta pois
 * 3. Muuta asetukset, tallennta ja käynnistä skripti.
 * 4. Valmis! Muut asetukset pysyivät koskemattomina.
 */

//Pörssisähköskriptin numero
let MAIN_SRIPT_NUMBER = 1;

let cfg = {
  //-------------------------------------
  // Yleiset asetukset
  //-------------------------------------
  c: {
    /** Group (country) to get prices from */
    //g: 'fi',

    /** VAT added to spot price [%] */
    //vat: 25.5,

    /** Day (07...22) transfer price [c/kWh] */
    //day: 0,

    /** Night (22...07) transfer price [c/kWh] */
    //nite: 0,

    /** Instance names */
    //names: ['yksi', 'kaksi', 'kolme']
  },
  i:
    [
      //-------------------------------------
      // Ohjaus #1
      //-------------------------------------
      {
        /** Enabled [0/1]*/
        //en: 0,

        /**  
         * Active mode
         * 0: manual mode (on/off toggle)
         * 1: price limit
         * 2: cheapest hours 
        */
        //mode: 0,

        /** Settings for mode 0 (manual) */
        m0: {
          /** Manual relay output command [0/1] */
          //c: 0
        },

        /** Settings for mode 1 (price limit) */
        m1: {
          /** Price limit limit - if price <= relay output command is set on [c/kWh] */
          //l: 0
        },

        /** Settings for mode 2 (cheapest hours) */
        m2: {
          /** Period length (-1 = custom range) [h] (example: 24 -> cheapest hours during 24h) */
          //p: 24,

          /** How many cheapest hours */
          //c: 0,

          /** Always on price limit [c/kWh] */
          //l: -999,

          /** Should the hours be sequential / in a row [0/1] */
          //s: 0,

          /** Maximum price limit [c/kWh] */
          //m: 999,

          /** Custom period start hour */
          //ps: 0,

          /** Custom period end hour */
          //pe: 23,

          /** Custom period 2 start hour */
          //ps2: 0,

          /** Custom period 2 end hour */
          //pe2: 23,

          /** How many cheapest hours (custom period 2) */
          //c2: 0,
        },

        /** Backup hours [binary] (example: 0b111111 = 00, 01, 02, 03, 04, 05) */
        //b: 0b0,

        /** Relay output command if clock time is not known [0/1] */
        //e: 0,

        /** Outputs IDs to use (array of numbers) */
        //o: [0],

        /** Forced hours [binary] (example: 0b110000000000001100001 = 00, 05, 06, 19, 20) */
        //f: 0b0,

        /** Forced hours commands [binary] (example: 0b110000000000001100000 = 05, 06, 19, 20 are forced to on, 00 to off (if forced as in above example "fh" setting) */
        //fc: 0b0,

        /** Invert output [0/1] */
        //i: 0,

        /** How many first minutes of the hour the output should be on [min]*/
        //m: 60,

        /** Output config - when to set output (0 = always after running logic, 1 = only when output changes)*/
        //oc: 0
      },


      //-------------------------------------
      // Ohjaus #2
      //-------------------------------------
      {
        /** Enabled [0/1]*/
        //en: 0,

        /**  
         * Active mode
         * 0: manual mode (on/off toggle)
         * 1: price limit
         * 2: cheapest hours 
        */
        //mode: 0,

        /** Settings for mode 0 (manual) */
        m0: {
          /** Manual relay output command [0/1] */
          //c: 0
        },

        /** Settings for mode 1 (price limit) */
        m1: {
          /** Price limit limit - if price <= relay output command is set on [c/kWh] */
          //l: 0
        },

        /** Settings for mode 2 (cheapest hours) */
        m2: {
          /** Period length (-1 = custom range) [h] (example: 24 -> cheapest hours during 24h) */
          //p: 24,

          /** How many cheapest hours */
          //c: 0,

          /** Always on price limit [c/kWh] */
          //l: -999,

          /** Should the hours be sequential / in a row [0/1] */
          //s: 0,

          /** Maximum price limit [c/kWh] */
          //m: 999,

          /** Custom period start hour */
          //ps: 0,

          /** Custom period end hour */
          //pe: 23,

          /** Custom period 2 start hour */
          //ps2: 0,

          /** Custom period 2 end hour */
          //pe2: 23,

          /** How many cheapest hours (custom period 2) */
          //c2: 0,
        },

        /** Backup hours [binary] (example: 0b111111 = 00, 01, 02, 03, 04, 05) */
        //b: 0b0,

        /** Relay output command if clock time is not known [0/1] */
        //e: 0,

        /** Outputs IDs to use (array of numbers) */
        //o: [0],

        /** Forced hours [binary] (example: 0b110000000000001100001 = 00, 05, 06, 19, 20) */
        //f: 0b0,

        /** Forced hours commands [binary] (example: 0b110000000000001100000 = 05, 06, 19, 20 are forced to on, 00 to off (if forced as in above example "fh" setting) */
        //fc: 0b0,

        /** Invert output [0/1] */
        //i: 0,

        /** How many first minutes of the hour the output should be on [min]*/
        //m: 60,

        /** Output config - when to set output (0 = always after running logic, 1 = only when output changes)*/
        //oc: 0
      },


      //-------------------------------------
      // Ohjaus #3
      //-------------------------------------
      {
        /** Enabled [0/1]*/
        //en: 0,

        /**  
         * Active mode
         * 0: manual mode (on/off toggle)
         * 1: price limit
         * 2: cheapest hours 
        */
        //mode: 0,

        /** Settings for mode 0 (manual) */
        m0: {
          /** Manual relay output command [0/1] */
          //c: 0
        },

        /** Settings for mode 1 (price limit) */
        m1: {
          /** Price limit limit - if price <= relay output command is set on [c/kWh] */
          //l: 0
        },

        /** Settings for mode 2 (cheapest hours) */
        m2: {
          /** Period length (-1 = custom range) [h] (example: 24 -> cheapest hours during 24h) */
          //p: 24,

          /** How many cheapest hours */
          //c: 0,

          /** Always on price limit [c/kWh] */
          //l: -999,

          /** Should the hours be sequential / in a row [0/1] */
          //s: 0,

          /** Maximum price limit [c/kWh] */
          //m: 999,

          /** Custom period start hour */
          //ps: 0,

          /** Custom period end hour */
          //pe: 23,

          /** Custom period 2 start hour */
          //ps2: 0,

          /** Custom period 2 end hour */
          //pe2: 23,

          /** How many cheapest hours (custom period 2) */
          //c2: 0,
        },

        /** Backup hours [binary] (example: 0b111111 = 00, 01, 02, 03, 04, 05) */
        //b: 0b0,

        /** Relay output command if clock time is not known [0/1] */
        //e: 0,

        /** Outputs IDs to use (array of numbers) */
        //o: [0],

        /** Forced hours [binary] (example: 0b110000000000001100001 = 00, 05, 06, 19, 20) */
        //f: 0b0,

        /** Forced hours commands [binary] (example: 0b110000000000001100000 = 05, 06, 19, 20 are forced to on, 00 to off (if forced as in above example "fh" setting) */
        //fc: 0b0,

        /** Invert output [0/1] */
        //i: 0,

        /** How many first minutes of the hour the output should be on [min]*/
        //m: 60,

        /** Output config - when to set output (0 = always after running logic, 1 = only when output changes)*/
        //oc: 0
      }
    ]
}



//-------------------------------------
// Koodi alkaa, älä koske
//-------------------------------------
function getKvsKey(inst) {
  let key = "porssi";

  if (inst >= 0) {
    key = key + "-" + (inst + 1);
  }

  return key;
}

function requestReload() {
  let req = {
    url: "http://localhost/script/" + MAIN_SRIPT_NUMBER + "?r=r&i=0",
    timeout: 5,
    ssl_ca: "*"
  };

  Shelly.call("HTTP.GET", req, function (res, err, msg) {
    if (!err) {
      console.log("Config changed");
    } else {
      console.log("Error:", err, msg);
    }

    Shelly.call("Script.Stop", { id: Shelly.getCurrentScriptId() }, function () { });
  });
}

function chkConfig(inst) {
  let key = getKvsKey(inst);

  //Haetaan nykyiset asetukset
  Shelly.call('KVS.Get', { key: key }, function (res, err, msg) {
    let active = res ? JSON.parse(res.value) : {};
    console.log("Active settings for #" + inst + ": ", JSON.stringify(active));

    //Muutetaan mitä muutetaan
    let source = inst < 0
      ? cfg.c
      : cfg.i[inst];

    //Note: Hard-coded to max 2 levels
    for (let prop in source) {
      if (typeof source[prop] === "object") {
        for (let innerProp in source[prop]) {
          active[prop][innerProp] = source[prop][innerProp];
        }
      } else {
        active[prop] = source[prop];
      }
    }

    //Save the new settings
    Shelly.call("KVS.Set", { key: key, value: JSON.stringify(active) }, function (res, err, msg) {

      if (err) {
        console.log("Error updating config for #" + inst + ":", err, msg);
        return;
      }

      console.log("Config changed for #" + inst + ":", JSON.stringify(active));
      console.log(" ");

      if (inst < 2) {
        Timer.set(500, false, function () { chkConfig(inst + 1); });
      } else {
        //Done - request porssisahko to reload
        Timer.set(500, false, requestReload);
      }
    });

  });
}

chkConfig(-1);

//-------------------------------------
// HUOM: Asetukset löytyvät ylhäältä
//-------------------------------------