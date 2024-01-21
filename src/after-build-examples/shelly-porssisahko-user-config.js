//__REPLACED_WITH_MAIN_CODE__

/**
 * Tämä esimerkki ylikirjoittaa pörssisähköohjauksen käyttöliittymältä laitetut asetukset  
 * alla olevilla asetuksilla. Käyttökohde esim. asetusten hallinta suoraan skriptistä (esim. Shellyn pilvipalvelun kautta)
 * 
 * Katso lisää:
 * https://github.com/jisotalo/shelly-porssisahko?tab=readme-ov-file#esimerkki-asetukset-suoraan-skriptiin-ilman-k%C3%A4ytt%C3%B6liittym%C3%A4%C3%A4
 */
function USER_CONFIG(config, state, initialized) {
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
    /** Outputs IDs to use (array of numbers) */
    outs: [0],
    /** Forced hours [binary] (example: 0b110000000000001100001 = 00, 05, 06, 19, 20) */
    fh: 0b0,
    /** Forced hours commands [binary] (example: 0b110000000000001100000 = 05, 06, 19, 20 are forced to on, 00 to off (if forced as in above example "fh" setting) */
    fhCmd: 0b0,
    /** Invert output [0/1] */
    inv: 0,
    /** How many first minutes of the hour the output should be on [min]*/
    min: 60
  };

  return config;
}