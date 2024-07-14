# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# Suomeksi
## [2.13.0] - 14.07.2024
- Muutos: Kun vuorokausi vaihtuu, hinnat haetaan aina varalta uudelleen ([Katso issue #26](https://github.com/jisotalo/shelly-porssisahko/issues/26))
  - Aiemmin käytettiin jo tiedossa olevia hintoja datan säästämiseksi ja optimoimiseksi
  - Aiemmin jos Nordpoolin hinnoissa oli klo 15:00 virheitä, virheelliset hinnat jäivät voimaan, vaikka korjattu data oli ollut saatavilla

## [2.12.5] - 02.04.2024
- Bugikorjaus: Seuraavan päivän hinnat haettiin kesäaikaan siirtymisen takia vasta 16:00 (15:00 sijaan)

## [2.12.4] - 20.03.2024
- Bugikorjaus: Korjattu `vain muuttuessa` -ohjausasetus
  - Ohjaus saatettiin ylikirjoittaa vaikka ei pitänyt
  - Historiaan kirjoitettiin tuplarivejä

## [2.12.3] - 09.03.2024
- Lisätty mahdollisuus pyytää `USER_OVERRIDE`-funktiosta logiikan uudelleen suoritusta (palauttamalla `null` takaisinkutsulla)
- Lisätty uusi esimerkki: **Ulkolämpötilan hakeminen sääpalvelusta ja sen hyödyntäminen** (`shelly-porssisahko-open-meteo-api.js`)
  - Hakee kuluvan vuorokauden alhaisimman lämpötilan Open-Meteo-palvelusta koordinaattien perusteella ja muuttaa sen perusteella ohjaustunteja

## [2.12.2] - 06.03.2024
- Uusi ominaisuus: Vapaavalintaiset ajanjaksot
  - Voi valita yhden tai kaksi vapaavalintaista ajanjaksoa ja niille halutut tuntimääräät
  - Esim *"kolme halvinta tuntia yöllä kello 00-06 väliltä ja yksi halvin tunti illalla kello 18-21 väliltä"*

## [2.11.2] - 05.02.2024
- Bugikorjaus: Hinnan keskiarvon laskennan virhe
  - Alussa laskenta näytti oikein, mutta joka päivä virhe alkoi kasvaa suuremmaksi

## [2.11.1] - 01.02.2024 (2)
- Bugikorjaus: Skripti ei aina käynnistynyt oikein Shellyn bootatessa / herätessä
  - **HUOMIO: Koskee versioita 2.90...2.11.0!**
  - Useamman lähdön ohjauksen yhteydessä tullut bugi, joka aiheuttaa välillä skriptin kaatumisen Shellyn käynnistyksen yhteydessä.

## [2.11.0] - 01.02.2024
- Seuraavan päivän hinnat ja toteutuva ohjaus etusivulla
- Uusi asetus: Lähdön ohjaus
  - Voi asettaa niin että lähtö asetetaan vain sen muuttuessa
  - Näin ohjauksen ylikirjoitus toimii kätevämmin Shellyn sovelluksesta tai hallinnasta
- Ohjaushistorialle oma välilehti
- Pieniä parannuksia ja optimointeja
- Lisätty esimerkki kuink Plus Add-onin mittaamalla lämpötilalla voidaan muuttaa halvimpien tuntien määrää

## [2.10.2] - 21.01.2024(2)
- Lisätty koodin tarkistus että halvimpien tuntien lukumäärä <= jakson pituus
  - Havaittu ongelma kun H&T skriptissä oli isompi tuntimäärä (koska käyttäjän skriptin muutoksia ei tarkisteta)

## [2.10.1] - 21.01.2024
- Pakko-ohjauspainikkeella voi valita, haluaako pakko-ohjata ohjauksen päälle vai pois
- Tuntikohtaisissa pakko-ohjauksissa voi valita, haluaako pakko-ohjata ohjauksen päälle vai pois
- Uusi asetus: Ohjausminuutit
  - Voidaan määritellä montako tunnin ensimmäistä minuuttia ohjaus on päällä (mahdollistaa esim. 30 minuutin ohjaukset)
  - Vakiona 60 min, eli koko tunti (kuten ennenkin)
- Lisätty parametreja `USER_CONFIG`-kutsuun
- Mahdollista näyttää lisätietoa käyttöliittyällä käyttäjäskriptin/hienosäätöskriptin tilasta, päivitetty esimerkit sen mukaiseksi
- Lisätty esimerkki kuinka Shelly H&T lämpötilaa voi hyödyntää ohjauksessa

## [2.9.0] - 16.12.2023
- Uusi ominaisuus: Useamman lähdön ohjaaminen samaan aikaan
  - Ohjattavat lähdöt -kenttään voi asettaa useamman lähdön pilkuilla erotettuna, esim `0,100` asettaa skriptin ohjaamaan lähtöjä 0 ja 100.
  - HUOM: Erilliset asetukset eri lähdöille eivät ole mahdollisia, tämän kehitys on suunnitelmissa. [Katso issue #16](https://github.com/jisotalo/shelly-porssisahko/issues/16)

## [2.8.2] - 25.11.2023
- Lisätty laitteen nimi myös sivun otsikkoon (selaimen otsikkopalkkiin)
- Parannettu checkboxien käytettävyyttä (voi klikata myös tekstejä, nyt kun on vapaata muistia)

## [2.8.1] - 24.11.2023 (2)
- Jos laittelle ei ole annettu nimeä, näytetään nimen tilalla "Ei asetettu"
- Päivitetty kääntämisprosessia

## [2.8.0] - 24.11.2023
- Uusi ominaisuus: Laitteen nimi näytetään tilasivulla
  - Asetetaan Shellyn omista asetuksista
- Uusi ominaisuus: käyttäjän oma funktio / ylikirjoitus
  - Käyttäjä voi lisätä skriptin loppuun oman funktion `USER_OVERRIDE`, joka ajetaan ennen ohjausta
  - Tällä voidaan tehdä omia ohjauksen lisäehtoja tai esimerkiksi lämpötilaohjaus
  - Katso esimerkit: [https://github.com/jisotalo/shelly-porssisahko/#lisätoiminnot-ja-omat-skriptit](https://github.com/jisotalo/shelly-porssisahko/#lisätoiminnot-ja-omat-skriptit)
- Uusi ominaisuus: asetusten määrity skriptistä
  - Skriptin asetukset voidaan määrittää ilman web-käyttöliittymää skriptistä
  - Käyttäjä voi lisätä oman funktion `USER_CONFIG`, joka muuttaa asetukset
  - Mahdollistaa asetukset muuttamisen esim. Shellyn pilvipalvelun kautta (skriptiä editoimalla)
  - Katso esimerkki: [https://github.com/jisotalo/shelly-porssisahko/#esimerkki-asetukset-suoraan-skriptiin-ilman-käyttöliittymää](https://github.com/jisotalo/shelly-porssisahko/#esimerkki-asetukset-suoraan-skriptiin-ilman-käyttöliittymää)

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
## [2.13.0] - 14.07.2024
- When day changes, the price data is always updated ([See issue #26](https://github.com/jisotalo/shelly-porssisahko/issues/26))
  - Before the already known prices were used 
  - Before, if Nordpool had faulty price data at 15:00, the corrected data was never updated. Now it will always be up-to-date.

## [2.12.5] - 02.04.2024
- Bugfix: Next day prices were read after 16:00 after DST change (instead of 15:00)

## [2.12.4] - 20.03.2024
- Bugfix: Fixed issues with `only on change` output setting

## [2.12.3] - 09.03.2024
- Added option for `USER_OVERRIDE` to request a re-run of logic by returning `null` with the callback
- New example: `shelly-porssisahko-open-meteo-api.js`

## [2.12.2] - 06.03.2024
- New feature: custom hour ranges
  - Can configure one or two custom time ranges and number of cheapest hours for each

## [2.11.2] - 05.02.2024
- Bug fix: Average price calculation

## [2.11.1] - 01.02.2024 (2)
- Bug fix: Script didn't always start after boot / power reset

## [2.11.0] - 01.02.2024
- Next day prices and control at the frontpage
- New setting to select if output should be always written or only when changed
- Own tab for history

## [2.10.2] - 21.01.2024(2)
- Added a safety check that period hours <= period length

## [2.10.1] - 21.01.2024
- Possible to manualyl force both on and off
- Forced hours commands can be selected both on and off
- New setting: how many first minutes of the hour to command output 
- Added more parameters to `USER_CONFIG` call
- Possible to show status of additional script / user script at UI. Updated examples.
- Added example how to use Shelly H&T temperature to fine adjust control

## [2.9.0] - 16.12.2023
- New feature: Controlling multiple outputs
  - Multiple output IDs can be configured by separating with commans. For example `0,100` -> script controls outputs 0 and 100
  - NOTE: Separate price settings for outputs aren't possible, it's in backlog. [See issue #16](https://github.com/jisotalo/shelly-porssisahko/issues/16)

## [2.8.2] - 25.11.2023
- Device name is also displayed in browser title
- Checkbox user experience is updated

## [2.8.1] - 24.11.2023 (2)
- If device has no name, a description about it is shown

## [2.8.0] - 24.11.2023
- New feature: Device name is shown in status page
- New feature: User can add scripts to change the output command
  - See examples: [https://github.com/jisotalo/shelly-porssisahko/#lisätoiminnot-ja-omat-skriptit](https://github.com/jisotalo/shelly-porssisahko/#lisätoiminnot-ja-omat-skriptit)
- New feature: user can add settings to the script instead of UI
  - See example: [https://github.com/jisotalo/shelly-porssisahko/#esimerkki-asetukset-suoraan-skriptiin-ilman-käyttöliittymää](https://github.com/jisotalo/shelly-porssisahko/#esimerkki-asetukset-suoraan-skriptiin-ilman-käyttöliittymää)


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
