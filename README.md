# shelly-porssisahko - Pörssisähköohjaus Shelly-releisiin
[![License](https://img.shields.io/badge/License-AGPLv3-orange)](https://choosealicense.com/licenses/agpl-3.0/)
[![Support](https://img.shields.io/badge/Support_with-PayPal-yellow)](https://www.paypal.com/donate/?business=KUWBXXCVGZZME&no_recurring=0&currency_code=EUR)

**In English - see bottom of the page.**

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

## Sähköinen kytkentä

Lue lisää häiriösuojauksesta [spot-hinta.fi -sivustolta](https://spot-hinta.fi/shelly/).

## Kehitysympäristö ja toiminta

*TODO* 

## In English

This is a script to control relay by Nordpool electric spot prices for Shelly products (especially Shelly Plus 1PM) with web-based user interface.

At the moment it's available only in Finnish and the spot price is queried for Finland. However other Nordpool countries is trivial to add.

## Lisenssi / Lisence

GNU Affero General Public License v3.0 - [LICENSE.txt](https://github.com/jisotalo/shelly-porssisahko/blob/master/LICENSE.txt)

