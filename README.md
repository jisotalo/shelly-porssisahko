# shelly-porssisahko - Pörssisähköohjaus Shelly-releisiin
[![License](https://img.shields.io/badge/License-AGPLv3-orange)](https://choosealicense.com/licenses/agpl-3.0/)
[![Support](https://img.shields.io/badge/Support_with-PayPal-yellow)](https://www.paypal.com/donate/?business=KUWBXXCVGZZME&no_recurring=0&currency_code=EUR)

*In English - see bottom of the page.*

Shelly-laitteisiin selaimella ohjattava pörssisähkösovellus, joka venyttää laitteen rajoja. Kehitetty ja testattu käyttäen Shelly Plus 1PM -relekytkintä, jonka saa esimerkiksi [Verkkokaupasta](https://www.verkkokauppa.com/fi/product/835579/Shelly-Plus-1PM-relekytkin-Wi-Fi-verkkoon). Pyörittää käyttöliittymää omalla web-serverillä ja tallentaa asetuksensa Shellyn muistiin.

Mahdollisesti hyödyllinen, jos haluat yksinkertaisesti ohjata relekytkintä sähkön hinnan mukaan, ilman ylimääräistä säätöä ja muita laitteita. Oma käyttökohteeni on varaston sähköpatterin ohjaus halvimpien tuntien mukaan.

Skripti käyttää suoraan Viron kantaverkkoyhtiön [elering.ee](https://dashboard.elering.ee/api) -rajapintaa, eli välissä ei ole kolmannen osapuolen palveluita. Ei myöskään tarvitse rekisteröityä mihinkään vaan kaikki toimii suoraan.

![0qmExM5DKq](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/adb41125-9be3-4bc4-9ba3-3eff180160bf)


## Projektin tila

Versio 2 julkaistu 10.0.2023. Ensimmäinen versio lakkasi toimista kun Shelly kiristi skriptien koko- ja muistirajoituksia reilusti.

Uusi versio on tehty alusta asti uusiksi ja skripti pakataan niin pieneen tilaan kuin mahdollista. Näin se mahtuu Shellyn uusiin rajoihin (jotka valmistaja on kyllä luvannut nostaa isommaksi).

Uutta versiota ei ole vielä pitkäaikaistestattu.

## Ominaisuudet
* Oma web-serveri Shellyn sisällä ja siinä pyörivä käyttöliittymä
* Valvonta ja konfigurointi selaimen avulla
* Kolme ohjaustapaa: käsiohjaus, hintaraja tai jakson halvimmat tunnit
* Vikasietoinen
  * Varmuustunnit (jos ei hintoja mutta tiedetään kellonaika)
  * Hätätilaohjaus (jos ei internet-yhteyttä eikä tiedetä kellonaikaa)

## Puutteet
- Logitus puuttuu
- Vain 12 viime ohjauksen muutosta (~12h) pysyy muistissa. 24h ei ihan mahdu nykyisellään.

Nämä saadaan kuntoon jos Shelly nostaa muistirajoitusta. Tällä hetkellä ei vaan yksinkertaisesti ole tarpeeksi muistia.

## Todettu toimivaksi seuraavilla laitteilla
* Shelly Plus 1PM


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

## Käyttöohje

*README kesken* 

## Sähköinen kytkentä

Lue lisää häiriösuojauksesta [spot-hinta.fi -sivustolta](https://spot-hinta.fi/shelly/).

## Teknistä tietoa ja kehitysympäristö 

*README kesken* 

## In English

This is a script to control relay by Nordpool electric spot prices for Shelly products (especially Shelly Plus 1PM) with web-based user interface.

At the moment it's available only in Finnish and the spot price is queried for Finland. 

There will soon be an English version (with country selection) available.

## Lisenssi / Lisence

GNU Affero General Public License v3.0 - [LICENSE.txt](https://github.com/jisotalo/shelly-porssisahko/blob/master/LICENSE.txt)

