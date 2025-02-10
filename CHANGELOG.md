# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.2.0] - 10.02.2025
- Historiaan tallennetaan rivi vain ohjauksen muuttuessa
- Bugikorjaus: Käsiohjauksen tila näkyi väärin tilasivulla
  - Kiitos [https://github.com/jpsarin](https://github.com/jpsarin)!
- Bugikorjaus: Ohjausta vaihtaessa perutaan aina mahdollinen edellinen datan haku
  - Toivottavasti korjaa [issue #45](https://github.com/jisotalo/shelly-porssisahko/issues/45)

## [3.1.1] - 24.11.2024
- Bugikorjaus: Käänteinen ohjaus ei näkynyt oikein tilasivulla
  - Kiitos [https://github.com/joomoz](https://github.com/joomoz)!

## [3.1.0] - 22.11.2024
- Lisätty tarkistus kellonajan muuttumiselle
  - Jos aika muuttuu yllättäen yli 5 min, haetaan hinnat ja suoritetaan logiikat uusiksi
  - Esim. pitkään ilman nettiyhteyttä ja kello alkaa näyttää väärin
- Bugikorjaus: Shellyn käynnistyessä päivämäärä ja aika saattoivat olla hetken aikaa menneisyydestä
  - Aiemmissa firmiksissä vuosi oli aina 1970 jos aika ei ollut tiedossa, ei enää
  - Muutettu käyttämään toista tapaa varmistamaan, että onko kellonaika tiedossa
  - Liittyy [issue #33](https://github.com/jisotalo/shelly-porssisahko/issues/33)
- Bugikorjaus: Jos nykyistä tuntia ei löydy hintatiedoista, hylätään hinnat ja haetaan ne uusiksi
  - Liittyy [issue #33](https://github.com/jisotalo/shelly-porssisahko/issues/33)
- Bugikorjaus: Jos maksimihinta oli pienempi kuin aina päällä -raja, näytettiin ohjauksia väärin tilasivulla.
  - Ohjaus kuitenkin toimi kuten suunniteltu
  - [Katso issue #31](https://github.com/jisotalo/shelly-porssisahko/issues/31)

Samalla lisätty ohjeet `shelly-porssisahko-ht-sensor-temp.js` -skriptiin, miten käyttää sitä uudempien H&T-mallien kanssa.

## [3.0.0] - 12.11.2024
**HUOM:** Päivittäessä v.2 -> v.3 asetukset nollaantuvat.

- Tuki kolmelle yhtäaikaiselle ohjaukselle
  - Jokaiselle voidaan määrittää omat asetukset ja lähdöt
  - Käyttöliittymässä valitaan, minkä ohjuksen tilaa, historiaa ja asetuksia käytetään.
- Näytetään ohjausrivillä ***, jos kyseessä on pakko-ohjaus
- Parannettu toimintaa vikatilanteissa (jos hinnat puuttuvat / virheelliset)
- Jos sivun lataaminen epäonnistuu, mahdollistetaan uudelleenyritys
- Oletus-ALV muutettu 25.5%
- Maan valinta
- Paljon parannuksia ja optimointeja konepellin alla
- Asetukset tallennetaan JSON-muodossa (voi muokata käsin KVS alta)

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
