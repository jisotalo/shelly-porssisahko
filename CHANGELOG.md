# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# Suomeksi
## [2.1.0] - 12.10.2023
- Lisätty asetussivulle kaksi nappia
  - Pakko-ohjaus (lähdön voi pakottaa päälle x tunniksi - ei väliä onko hinta kallis vai halpa)
  - Linkki Shellyn hallintapaneeliin
- Otettu `Access-Control-Allow-Origin` vakiona pois käytöstä tietoturvan vuoksi
  - Paikallinen käyttöliittymäkehitys ei onnistu ilman tätä
  - Kehitystä ja API:n muualta käyttöä varten rivi pitää kommentoida käyttöön `src/shelly-porssisahko.js`-tiedostosta
- README päivitetty

## [2.0.1] - 10.10.2023
- Bugikorjaus: Käsiajon ohjauksen ja hätätilaohjauksen muuttaminen ei toiminut

## [2.0.0] - 10.10.2023
- Versio 2 julkaistu (tehty täysin uusiksi)

# In English
## [2.1.0] - 12.10.2023
- Added buttons to config page
  - Manual forcing feature (output can be set ON for next x hours - no matter what the price is / logic does)
  - Link to Shelly web admin 
- Removed `Access-Control-Allow-Origin` header for security
  - Needed for local web UI development
  - For developing and external API usage, the line needs to be uncommented from `src/shelly-porssisahko.js`
- README updated


## [2.0.1] - 10.10.2023
- Bug fix: Setting manual mode command and error command to ON weren't working

## [2.0.0] - 10.10.2023
- Version 2 released (total rewrite)
