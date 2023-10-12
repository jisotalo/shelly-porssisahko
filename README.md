# shelly-porssisahko - Pörssisähköohjaus Shelly-releisiin
[![License](https://img.shields.io/badge/License-AGPLv3-orange)](https://choosealicense.com/licenses/agpl-3.0/)
[![GitHub](https://img.shields.io/badge/View%20on-GitHub-brightgreen)](https://github.com/jisotalo/shelly-porssisahko)
[![Support](https://img.shields.io/badge/Support_with-PayPal-yellow)](https://www.paypal.com/donate/?business=KUWBXXCVGZZME&no_recurring=0&currency_code=EUR)

*In English - see bottom of the page.*

Shelly-laitteisiin selaimella ohjattava pörssisähkösovellus, joka venyttää laitteen rajoja. Kehitetty ja testattu käyttäen Shelly Plus 1PM -relekytkintä, jonka saa esimerkiksi [Verkkokaupasta](https://www.verkkokauppa.com/fi/product/835579/Shelly-Plus-1PM-relekytkin-Wi-Fi-verkkoon). Pyörittää käyttöliittymää omalla web-serverillä ja tallentaa asetuksensa Shellyn muistiin.

Mahdollisesti hyödyllinen, jos haluat yksinkertaisesti ohjata relekytkintä sähkön hinnan mukaan, ilman ylimääräistä säätöä ja muita laitteita. Oma käyttökohteeni on varaston sähköpatterin ohjaus halvimpien tuntien mukaan.

Skripti käyttää suoraan Viron kantaverkkoyhtiön [elering.ee](https://dashboard.elering.ee/api) -rajapintaa, eli välissä ei ole kolmannen osapuolen palveluita. Ei myöskään tarvitse rekisteröityä mihinkään vaan kaikki toimii suoraan.

![0qmExM5DKq](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/adb41125-9be3-4bc4-9ba3-3eff180160bf)


## Ominaisuudet
* Oma web-serveri Shellyn sisällä ja siinä pyörivä käyttöliittymä
* Valvonta ja konfigurointi selaimen avulla
* Ei liityntöjä 3. osapuolen palveluihin
* Kolme ohjaustapaa: 
  * **käsiohjaus** - yksinkertaisesti ohjaus päälle/pois
  * **hintaraja** - jos hinta on alle rajan, laitetaan ohjaus päälle 
  * **jakson halvimmat tunnit** - valitaan halutulta aikajaksolta x halvinta tuntia (tai aina päälle kun tarpeeksi halpaa)
* Vikasietoinen
  * Varmuustunnit (jos ei hintoja mutta tiedetään kellonaika)
  * Hätätilaohjaus (jos ei internet-yhteyttä eikä tiedetä kellonaikaa)
* Todettu toimivaksi seuraavilla laitteilla
  * Shelly Plus 1PM

## Projektin tila

Versio 2 julkaistu 10.0.2023. Ensimmäinen versio lakkasi toimista kun Shelly kiristi skriptien koko- ja muistirajoituksia reilusti.

Uusi versio on tehty alusta asti uusiksi ja skripti pakataan niin pieneen tilaan kuin mahdollista. Näin se mahtuu Shellyn nykyisin rajoihin.

Uutta versiota ei ole vielä pitkäaikaistestattu.


## Asennus
1. Ota Shelly käyttöön, yhdistä se wifi-verkkoon ja päivitä sen firmware (ainakin varmista että se on 1.0.0 tai uudempi)
2. Valinnainen: Laita **Websocket debug** päälle (Settings -> Debug -> Enable websocket debug). Näin näet suoraan hallintapaneelin osoitteen skriptin alla.
3. Avaa **Scripts**-sivu Shellyn hallinnasta. Poista olemassaolevat skriptit, jos niitä on.
4. Paina **Library**-painiketta

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/21abeef6-4191-433c-8134-f5f12a29b6af)

5. Aukeavassa ikkunassa paina **Configure URL**

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/ccd4b9fd-f9f2-4f42-8bc9-74c9486f6432)

6. Syötä osoitteeksi `https://raw.githubusercontent.com/jisotalo/shelly-porssisahko/master/shelly-library.json` ja paina **Save**

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/972fedb9-8503-4d90-a9b2-3af6f430ed7d)

7. Nyt kirjastoon ilmestyy pörssisähköohjaus. Asenna se painamalla **Insert code**

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/9139dad1-e3ec-4a09-9e39-d940af5ea9d7)

8. Kun skripti ilmestyy, paina **Save**

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/2a241033-4ccb-415e-b422-373ec7ce54ef)

9. Tallentamisen jälkeen paina **Start**, jolloin skripti käynnistyy

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/8b30aa9f-b9de-44a7-9677-6872404b022d)

10. Jos websocket debug on päällä (**kohta 2**), näet hallinnan osoitteen suoraan skriptin alla konsolissa. Kopioi tämä osoite ja avaa se selaimella. Jos et näe sitä niin osoite on muotoa `http://ip-osoite/script/1`


    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/2b28b29e-3e7b-4ea9-8a11-4d612bbaf99b)

11. Varmista vielä että skripti käynnistyy aina automaattisesti. Eli **Scripts**-sivulla pitää shelly-porssisahko.js -skriptin kohdalla olla valinta päällä.

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/2d9fbb5f-e2c5-4f5c-a457-5606825184f3)

12. Valmista. **Älä asenna muita skriptejä - muisti loppuu kesken**

## Ohje

### Etusivu
*README kesken* 

### Asetukset
*README kesken* 

**Yleiset**

| Asetus | Selite | Esimerkki
| --- | --- | ---
| Ohjaustyyppi | Millä ohjaustavalla lähtöä ohjataan (katso alla)
| Ohjattava lähtö | Shellyn ohjattavan lähdön numero | `0`
| Sähkön ALV | Käytettävä ALV-% sähkön hinnalle [%]| `24` 
| Siirtomaksut | Jos haluat että siirtomaksut otetaan huomioon, voit syöttää ne päivä- ja yöajalle [c/kWh]| päivä: `4` <br> yö: `3`
| Varmuustunnit | Jos sähkön hintaa ei jostain syystä tiedetä, ohjataan lähtö näillä tunneilla päälle
| Hätätilaohjaus | Jos Shelly ei jostain syystä tiedä kellonaikaa, ohjataan lähtö tähän tilaan

**KÄSIOHJAUS**

Asetukset voimassa vain jos ohjaustapa on *käsiohjaus*.

| Asetus | Selite | Esimerkki
| --- | --- | ---
| Ohjaus | Laitetaankö lähtö päälle vai pois

**HINTARAJA**

Asetukset voimassa vain jos ohjaustapa on *hintaraja*.

| Asetus | Selite | Esimerkki
| --- | --- | ---
| Hintaraja | Aseta hinta, jossa ja jonka alla lähtö asetetaan päälle. Muuten lähtö on pois päältä [c/kWh] | `4.25`

**JAKSON HALVIMMAT TUNNIT**

Asetukset voimassa vain jos ohjaustapa on *jakson halvimmat tunnit*.

| Asetus | Selite | Esimerkki
| --- | --- | ---
| Ajanjakso | Minkä mittaisiin jaksoihin vuorokausi jaetaan. Jokaiselta jaksolta haetaan sitten halvimmat tunnit [h] | `6`
| Tuntimäärä | Kuinka monta halvinta tuntia lähtö ohjataan päälle ajanjakson aikana.<br><br>Eli jos ajanjakso on 6h ja tuntimäärä 2, kello 00...06 lähtö ohjataan päälle kahtena halvimpana tuntina. Kuten myös kello 06...12 ja niin edelleen. | `2`
| Aina päällä -raja | Jos sähkö on tätä halvempaa niin lähtö on aina päällä [c/kWh] | `-0.5`

Alla esimerkki miten ohjaukset menevät 12.10.2023 hinnoilla ja yllä olevilla asetuksilla (6h, 2 halvinta tuntia, aina päällä -raja -0.5 c/kWh). Huomaa jaksojen korostus taustavärillä.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/35324051-c58a-46f0-897f-afa5eb373c18)

**TOIMINNOT**
* **Pakko-ohjaus**
  * Painamalla tätä voit asettaa lähdön päälle määritellyksi ajaksi (voi syöttää myös esim 0.5 = puoli tuntia)
* **Avaa Shelly**
  * Avaa uudessa välilehdessä Shellyn oman hallintasivun






## Sähköinen kytkentä

Lue lisää häiriösuojauksesta esimerkiksi [spot-hinta.fi -sivustolta](https://spot-hinta.fi/shelly/).

## Teknistä tietoa ja kehitysympäristö

### Lyhyesti
  * Shellyyn asennattava skripti on "kääntöprosessin" tulos
  * Tämä jotta skripti saadaan mahtumaan mahdollisimman pieneen tilaan
  * Staattiset web-serverin tiedostot (html, css, js) minimoidaan, pakataan gzip-muotoon ja base64-enkoodataan
    * Nämä tiedostot sisällytetään `shelly-porssisahko.js`-skriptiin
      * Esim `atob('#[tab-config.js]')` korvataan kyseisen tiedoston pakatulla sisällöllä, joten lopputulos on luokkaa `atob("H4sIAAAAAAAACo1...`
  * Myös `shelly-porssisahko.js` minimoidaan
  * Käyttää [elering.ee:n CSV-muotoista API:a](https://dashboard.elering.ee/assets/api-doc.html#/nps-controller/getPriceAsCSVUsingGET) (JSON vie liikaa muistia)
    * Esim. [Suomen hinnat 12.10.2023 CSV:nä](https://dashboard.elering.ee/api/nps/price/csv?fields=fi&start=2023-10-12T00:00:00%2b03:00&end=2023-10-12T23:59:59%2b03:00)


### Tiedostot ja kansiot
* `src/shelly-porssisahko.js`
  * Itse skripti, ei kuitenkaan ajettavissa Shellyssä (vaatii "kääntämisen")
* `src/statics/`
  * Staattiset html, js ja css -tiedostot
* `dist/shelly-porssisahko.js`
  * **"Käänetty" valmis skripti joka voidaan laittaa ajoon**
  * Minimoitu ja sisältää myös staattiset tiedostot
* `dist/statics/`
  * Staattiset tiedostot, jotka muodostuvat kääntöprosessin aikana, debuggausta varten
  * Minimoidut staattiset tiedostot sekä pakatut versiot
  * Ei sisälly versiohallintaan

### Muistin käyttö

*README kesken*

### Kehitysympäristö

Käyttää Node.js -ympäristöä. 

**Kääntöprosessi:**

1) `npm i`
2) `npm run build`
3) `dist/shelly-porssisahko.js` on valmis ladattavaksi laitteeseen

**Komentoja**
* `npm run build`
  * "kääntää" eli tekee valmiin `dist/shelly-porssisahko.js`-skriptin
* `npm run upload`
  * lähettää `dist/shelly-porssisahko.js`-skriptin määritettyyn shellyyn ja käynnistää sen
* `npm start`
  * ajaa `npm run build` ja sen jälkeen `npm run upload`
* `npm run debug`
  * kuuntelee porttiin 8001 tulevaa UDP-dataa
  * aseta shellystä UDP debug muotoon `ip_osoitteesi:8001`
* `npm run serve`
  * käyttöliittymän kehitystä varten
  * käynnistää paikallisen web-serverin ja tarjoaa `src/statics/` -kansion tiedostot portista 3000
## In English

This is a script to control relay by Nordpool electric spot prices for Shelly products (especially Shelly Plus 1PM) with web-based user interface.

At the moment it's available only in Finnish and the spot price is queried for Finland. 

There will soon be an English version (with country selection) available.

## Lisenssi / Lisence

GNU Affero General Public License v3.0 - [LICENSE.txt](https://github.com/jisotalo/shelly-porssisahko/blob/master/LICENSE.txt)

