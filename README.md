# shelly-porssisahko - Pörssisähkö Shellyn laitteisiin
[![License](https://img.shields.io/github/license/jisotalo/shelly-porssisahko)](https://choosealicense.com/licenses/mit/)
[![Support](https://img.shields.io/badge/Support_with-PayPal-yellow)](https://www.paypal.com/donate/?business=KUWBXXCVGZZME&no_recurring=0&currency_code=EUR)

Shelly-laitteisiin selaimella ohjattava pörssisähkösovellus, joka yrittää venyttää laitteen rajoja. Kehitetty ja testattu käyttäen Shelly Plus 1PM -relekytkintä.

Mahdollisesti hyödyllinen, jos haluat yksinkertaisesti ohjata relekytkintä sähkön hinnan mukaan, ilman ylimääräistä säätöä ja muita laitteita.

Inspiraatio projektiin alunperin [spot-hinta.fi](https://spot-hinta.fi/) -palvelusta. Käyttää suoraan Viron kantaverkkoyhtiön [elering.ee](https://dashboard.elering.ee/api) -APIa eikä välissä ole kolmannen osapuolen palveluita. Ei tarvitse rekisteröityä mihinkään.

## Projektin tila

Toimiva ja testattu omassa käytössä, pisimmillään 33 vuorokautta ilman uudelleenkäynnistystä. Tarkoitus on kehittää eteenpäin, kuitenkin Shellyn skriptin koko alkanee tulla vastaan.

Itse koodi ei ole selkeintä eikä kommentteja ole paljoa. Yksi syy on juuri tilan puute eli merkien minimointi on tärkeää. Tarkoitus on kuitenkin vielä parannella koodia pikkuhiljaa.

Luonnollisesti en ota vastuuta toimivuudesta.

## Ominaisuudet

* Skripti pyörittää shellyn sisällä omaa web-serveriä käyttöliittymää varten
* Ohjaus 24h halvimpien tuntien mukaan tai yksinkertaisesti tuntihinnan perusteella
* Tilan seuranta selaimen kautta
* Ohjaus-, Wifi- ja tukiasema-asetusten muokkaus selaimen kautta
* Sähkön ALV-% asetus
* Varmuustunnit
  * Ohjaus laitetaan päälle tiettyinä tunteina, jos sähkön hinta ei ole tiedossa (mutta kellonaika tiedetään)
* Hätätilaohjaus 
  * Ohjaus laitetaan päälle/pois jos ei ole yhteyttä eikä tiedetä kellonaikaa
* Releohjauksen vaihdon lokitus
* Tekninen lokitus
* Sisäinen ohje

Testattu omassa käytössä ja toiminut ilman ongelmia 33 vuorokautta putkeen.

## Asennus

**Lyhyesti:**
Asenna Shellyyn skripti xxx, käynnistä se ja aseta käynnistymään automaattisesti. Avaa samassa verkossa ollessasi osoite [http://192.168.33.1/script/1/porssi](http://192.168.33.1/script/1/porssi)

Huom. Tämä olettaa että Shelly on otettu suoraan kaupan paketista.

1. Kytke Shellyyn sähköt
2. Yhdistä Shellyn tukiaseman wifi-verkkoon, joka on muotoa `ShellyPlus1PM-XXX`
3. Päivitä Shelly uusimpaan firmware-versioon
4. Avaa `Scripts`-sivu
5. Lisää uusi kirjasto painamalla `Library`-painiketta
6. Paina `Configure URL`
7. Syötä kenttään seuraava osoite: 

`xxx`

8. Paina `Save`


## Käyttö

todo

