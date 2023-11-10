# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# Suomeksi
## [2.7.2] - 10.11.2023
- Bugikorjaus: Hintojen haku ei toiminut klo 00-02 välillä
  - Aikavyöhykkeen selvityksen toteutus muutettu järkevämmäksi
- Bugikorjaus: Jos aikavyöhykevalinnasta johtuen hintoja ei saatu koko vuorokaudeksi (alle 24 tuntia), skripti ei toiminut oikein
  - Todennäköisesti ei vaikutusta, sillä kaikki toimi Suomen/Viron aikavyöhykkeillä

## [2.7.1] - 09.11.2023
- Muutos/korjaus: Jos käsiohjaus, ei välitetä onko hintatiedot tai kellonaika OK - totellaan vain käsiohjausta
- Bugikorjaus: Jos kellonaika ei ollut tiedossa skriptin käynnistyessä, ohjaus ei toiminut heti (vaan vasta kun kellonaika saatiin tai tunti vaihtui)

## [2.7.0] - 05.11.2023
- Uusi ominaisuus: automaattinen aikavyöhyke (eli myös autom. kesä/talviaika)
  - Shelly laskee aikaeron UTC-ajan ja paikallisen ajan välillä -> Käytetään aina oikeaa aikavyöhykettä hintojen haussa
  - Jos aikaero muuttuu, haetaan hinnat uusiksi (esim. kun kesä/talviaika vaihtuu)
  - Lisätiedot: [Issue #7](https://github.com/jisotalo/shelly-porssisahko/issues/7)
- Firmware-vaatimus on 1.0.7. Vanhemmille ei luvata tukea.
  - Tässä firmisversiossa parannettiin skriptien muistinhallintaa

## [2.6.1] - 29.10.2023
- Bugikorjaus: Pikainen paikkaus jotta toimii kellojen siirron jälkeen
  - Koodiin on valitettavasti unohtunut kiinteä aikavyöhyke
  - Muutettu kiinteä aikavyöhyke +03:00 -> +02:00 väliaikaisesti
  - Parempi ratkaisu työn alla (joka hoitaa tämän automaattisesti)

## [2.6.0] - 23.10.2023
- Lisätty uusi ominaisuus: päivän keskiarvon käyttö hintarajana
  - Jos syöttää mihin tahansa seuraavista kentistä arvon `avg`, käytetään päivän keskiarvoa kiinteän arvon sijaan
    - **käsiohjaus**: hintaraja
    - **jakson halvimmat tunnit**: aina päällä -raja, maksimihinta

## [2.5.1] - 21.10.2023 (2)
- Bugikorjaus: Jos asetti pakko-ohjauksen x tunniksi painikkeella, se kyllä toimi, mutta tuli virheilmoitus

## [2.5.0] - 21.10.2023
- Lisätty uusi asetus: maksimihinta 
  - Ohjaustapaan **jakson halvimmat tunnit**
  - Jos hinta on yli asetetun rajan, lähtöä ei laiteta päälle (vaikka olisi halvimpia tunteja)
- Asetettu minimi- ja maksimirajojen vakioarvot -999 ja 999 c/kWh
  
## [2.4.0] - 19.10.2023
- Lisätty uusi asetus: Perättäiset tunnit
  - Valitaan perättäiset tunnit siten että hinnan keskiarvo on mahdollisimman alhainen
- Kasvatettu ohjaushistoria 12->24h
- Bugikorjaus: Tilasivulta saattoi vahingossa pystyä painaan asetussivun painikkeita

## [2.3.1] - 18.10.2023
- Optimoitu paljon muistin käyttöä
  - Lisää tilaa tuleville ominaisuuksille
  - Poistettu animaatioita ja muita karkkeja käyttöliittymästä tilan aikaansaamiseksi

## [2.3.0] - 17.10.2023
- Lisätty uusi asetus: käänteinen ohjaus
  - Jos ruksittu, relelähtö on aina päinvastainen kuin normaalisti
- Optimoitu muistin käyttöä

## [2.2.0] - 13.10.2023
- Lisätty uusi ominaisuus: pakko-ohjatut tunnit
  - Voi pakottaa että ohjaus on päällä aina tiettyinä tunteina
  - Kiitos ideasta petri1973 ([issue #4](https://github.com/jisotalo/shelly-porssisahko/issues/4))
- Parannettu toimintaa ongelmatilanteissa
- Optimoitu muistin käyttöä
  - Vanhat varmuustunti-asetukset katoavat päivityksen yhteydessä
  - Kommentoitu lokituksia pois shelly-koodista toistaiseksi
- Bugikorjaus: Jos hintojen luku epäonnistui, skripti kaatui
- Bugikorjaus: Korjattu varmuustuntien toiminta

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
## [2.7.2] - 10.11.2023
- Bug fix: Fetching prices failed between 00:00-02:00 AM
  - Time zone detection updated to a better solution
- Bug fix: If timezone was selected so that prices weren't received for the whole 24h period, the script didn't operate correctly
  - However worked fine for Finland/Estonia timezones

## [2.7.1] - 09.11.2023
- Change/fix: If manual mode, the script works even when we have no prices nor time - just follows the manual command
- Bugfix: If time wasn't known and script started, the control didn't work until time was acquired or hour was changed

## [2.7.0] - 05.11.2023
- New feature: automatic timezone detection (also automatic DST)
  - Calculating time difference between UTC and local time -> if time difference changes, prices are updated
  - Handles changing of DST automatically
- Firmware requirement: 1.0.7 or newer

## [2.6.1] - 29.10.2023
- Bugfix: Quick patch to fix problem with DST
  - Better fix under development

## [2.6.0] - 23.10.2023
- Added new feature: using day average price instead of static price limit (by setting value to `avg`)

## [2.5.1] - 21.10.2023 (2)
- Bugfix: Setting override hour using button caused an error (however it worked)

## [2.5.0] - 21.10.2023
- Added new setting: maximum price

## [2.4.0] - 19.10.2023
- Added setting: sequential hours
- Inceased history 12h -> 24h
- Bug fix: It was possible to click buttons of settings page when it was not shown

## [2.3.1] - 18.10.2023
- Optimized memory usage

## [2.3.0] - 17.10.2023
- New setting: invert output
- Optimized memory usage

## [2.2.0] - 13.10.2023
- New feature: forced hoursLisätty uusi ominaisuus: pakko-ohjatut tunnit
  - Thanks for the idea petri1973 ([issue #4](https://github.com/jisotalo/shelly-porssisahko/issues/4))
- Better operation in problem situations
- Optimized memory usage
- Bug fix: If reading prices failed, script crashed
- Bug fix: Fixed backup hour operation

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
