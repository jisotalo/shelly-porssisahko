# shelly-porssisahko - Pörssisähköohjaus Shelly-releisiin
[![License](https://img.shields.io/badge/License-AGPLv3-orange)](https://choosealicense.com/licenses/agpl-3.0/)
[![GitHub](https://img.shields.io/badge/View%20on-GitHub-brightgreen)](https://github.com/jisotalo/shelly-porssisahko)
[![Support](https://img.shields.io/badge/Support_with-PayPal-yellow)](https://www.paypal.com/donate/?business=KUWBXXCVGZZME&no_recurring=0&currency_code=EUR)

*In English - see bottom of the page.*

Shelly-laitteisiin selaimella ohjattava pörssisähkösovellus, joka venyttää laitteen skriptien rajoja. Pyörittää käyttöliittymää omalla web-serverillä ja tallentaa asetuksensa Shellyn muistiin.

Jos haluat ohjata relekytkintä sähkön hinnan mukaan, ilman ulkopuolisia palveluita, niin tämä voi olla hyödyllinen. Käyttää suoraan Viron kantaverkkoyhtiön [elering.ee](https://dashboard.elering.ee/api) -rajapintaa, eli välissä ei ole kolmannen osapuolen palveluita. Skripti ei vaadi rekisteröitymistä mihinkään vaan se toimii "suoraan paketista".

![porssisahko](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/751cbd0c-1b7a-4086-9e32-b04b888c5425)


## Ominaisuudet
* Oma web-serveri Shellyn sisällä ja siinä pyörivä käyttöliittymä
* Valvonta ja konfigurointi selaimen avulla
* Ei liityntöjä 3. osapuolen palveluihin
* Kolme ohjaustapaa: 
  * **käsiohjaus** - yksinkertaisesti ohjaus päälle/pois
  * **hintaraja** - jos hinta on alle rajan, laitetaan ohjaus päälle 
  * **jakson halvimmat tunnit** - valitaan halutulta aikajaksolta x halvinta tuntia
* Vikasietoinen
  * Varmuustunnit (jos ei hintoja mutta tiedetään kellonaika)
  * Hätätilaohjaus (jos ei internet-yhteyttä eikä tiedetä kellonaikaa)
* Todettu toimivaksi seuraavilla
  * Shelly Plus 1PM
  * Shelly Plus 2PM
  * Shelly Plus 1
  * Shelly Pro 1
  * Shelly Pro 2
  * *Laita viestiä jos sinulla on kokemusta muista laitteista!*

## Sisällysluettelo
- [Muutoshistoria](#muutoshistoria)
- [Asennus](#asennus)
- [Laitteisto ja sähköinen kytkentä](#laitteisto-ja-sähköinen-kytkentä)
- [Asetukset](#asetukset)
  + [Yleiset](#yleiset)
  + [Ohjaustapa: Käsiohjaus](#ohjaustapa-käsiohjaus)
  + [Ohjaustapa: Hintaraja](#ohjaustapa-hintaraja)
  + [Ohjaustapa: Jakson halvimmat tunnit](#ohjaustapa-jakson-halvimmat-tunnit)
  + [Toiminnot](#toiminnot)
- [Teknistä tietoa ja kehitysympäristö](#teknistä-tietoa-ja-kehitysympäristö)
  + [Lyhyesti](#lyhyesti)
  + [Tiedostot ja kansiot](#tiedostot-ja-kansiot)
  + [Muistin käyttö](#muistin-käyttö)
  + [Kehitysympäristö](#kehitysympäristö)
- [FAQ](#faq)
- [In English](#in-english)
- [License](#license)

## Muutoshistoria

Katso päivitysten sisältö [CHANGELOG.md-tiedostosta](https://github.com/jisotalo/shelly-porssisahko/blob/master/CHANGELOG.md).

## Asennus
1. Ota Shelly käyttöön, yhdistä se wifi-verkkoon ja päivitä sen firmware (ainakin varmista että se on 1.0.0 tai uudempi)
2. Valinnainen: Laita **Websocket debug** päälle (Settings -> Debug -> Enable websocket debug). Näin näet suoraan hallintapaneelin osoitteen skriptin alla.
3. Avaa **Scripts**-sivu Shellyn hallinnasta. Poista olemassaolevat skriptit, jos niitä on.
4. Paina **Library**-painiketta

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/5fe7184e-f9ac-4fd4-b461-ad2239a96d95)

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


    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/93b64aea-ec36-4ea4-88ff-e0a75146262b)

11. Varmista vielä että skripti käynnistyy aina automaattisesti. Eli **Scripts**-sivulla pitää shelly-porssisahko.js -skriptin kohdalla olla valinta päällä.

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/2d9fbb5f-e2c5-4f5c-a457-5606825184f3)

12. Valmis. Avaa käyttöliittymä selaimessa (**kohta 10**) ja säädä asetukset kohdilleen [Asetukset](#asetukset)-kappaleen ohjeilla. **Älä asenna muita skriptejä - muisti loppuu kesken**

## Laitteisto ja sähköinen kytkentä

Olen kehittänyt tämän Shelly Plus 1PM -relekytkimelle, jonka saa esimerkiksi [Verkkokaupasta](https://www.verkkokauppa.com/fi/product/835579/Shelly-Plus-1PM-relekytkin-Wi-Fi-verkkoon) tai halvemmalla [monelta suomalaiselta jälleenmyyjältä](https://www.google.com/search?q=shelly+plus+1pm&lr=lang_fi). Se kestää speksien mukaan 16A kuorman, joten ainakin kevyttä sähköpatteria uskaltaa ohjata suoraan.

Jos ohjaat kontaktoria, on suositeltavaa käyttää Shellyn sinisiä laitteita, jotka kestävät paremmin kelan aiheuttamia kytkentäpiikkejä. Näitä ovat esimerkiksi:

* Shelly Plus 1
* Shelly Plus 1 Mini
* Shelly Pro 1
* Shelly Pro 2

Jos kuitenkin käytät esim. Shelly Plus 1PM -laitetta kontaktorin kanssa, [RC-suodatin](https://www.google.com/search?q=shelly+rc+snubber&lr=lang_fi) voi auttaa. Jännitepiikit ovat tunnetusti aiheuttaneet laitteen yllättävää uudelleenkäynnistystä.

Lisää hyvää tietoa löytyy [Shelly tuki (suomeksi)](https://www.facebook.com/groups/shellytuki) -ryhmästä.

## Asetukset

### Yleiset

Nämä asetukset ovat voimassa kaikilla ohjaustavoilla.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/5e38e7f4-7124-4905-ac54-65cd7e1ccf52)


| Asetus | Selite | Esim. (kuva yllä)
| --- | --- | ---
| Ohjaustapa | Millä ohjaustavalla lähtöä ohjataan.<br><br>Selitykset taulukon alapuolella. | `jakson halvimmat tunnit`
| Ohjattava lähtö | Shellyn ohjattavan lähdön numero.<br><br>Esim. Shelly Plus 1PM (ainoa) lähtö nro 0.| `0`
| Käänteinen ohjaus | Jos ruksittu, ohjaus toimii käänteisesti normaaliin nähden. Tällöin lähtökohta on, että lähtö on päällä.<br><br>- **Varmuustunnit**: Lähtö ohjataan varmuustunneilla pois päältä<br>- **Hätätilaohjaus**: Lähtö on päinvastainen asetukseen nähden<br>- **Pakko-ohjaukset**: Lähtö voidaan pakko-ohjata pois päältä<br>- **Käsiohjaus**: Lähtö on päinvastainen asetukseen nähden<br>- **Hintaraja**: Jos hinta on alle rajan, lähtö asetetaan pois päältä<br>- **Jakson halvimmat tunnit**: Jos nykyinen tunti on halvimpia tunteja, lähtö asetetaan pois päältä | `ei`
| Sähkön ALV | Käytettävä ALV-% sähkön hinnalle. [%]| `24`
| Siirtomaksut | Jos haluat että siirtomaksut otetaan huomioon, voit syöttää ne päivä- ja yöajalle. Nämä lisätään tuntihintoihin. [c/kWh]| päivä: `4` <br> yö: `3`
| Varmuustunnit | Jos sähkön hintaa ei jostain syystä tiedetä, ohjataan lähtö näillä tunneilla päälle.<br><br>Esim. ongelma hintojen haussa tai nettiyhteys katkeaa. | `01:00-07:00`
| Hätätilaohjaus | Jos Shelly ei jostain syystä tiedä kellonaikaa, ohjataan lähtö tähän tilaan varmuuden vuoksi.<br><br>Esim. jos sähkökatkon jälkeen nettiyhteys ei palaudu (ei hintoja eikä kellonaikaa). | `ON`
| Pakko-ohjaukset | Valittuina tunteina ohjaus on aina päällä - oli hinta mikä hyvänsä.<br><br>Esim. jos haluat lämmittää varajaa joka aamu. | `05:00-07:00` ja `19:00-20:00`

### Ohjaustapa: Käsiohjaus

Käsiohjauksella lähtö ohjataan käyttöliittymältä asetettuun tilaan.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/f130cb88-84b5-4530-86c4-067e9ee655e4)


| Asetus | Selite | Esim. (kuva yllä)
| --- | --- | ---
| Ohjaus | Asetetaanko lähtö päälle vai pois | `ON`

### Ohjaustapa: Hintaraja

Hintarajaohjauksella lähtö asetetaan päälle jos sähkön hinta on alle määritellyn rajan (tai juuri sen verran).

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/5178ebad-78c8-4e89-90cc-269977748a4d)

| Asetus | Selite | Esim. (kuva yllä)
| --- | --- | ---
| Hintaraja | Hinta, jossa ja jonka alla lähtö asetetaan päälle. [c/kWh] | `4.25`

### Ohjaustapa: Jakson halvimmat tunnit

Jakson halvimmat tunnit -ohjauksella vuorokausi jaetaan osiin. Lähtö ohjataan päälle jokaisen osan halvimmmilla tunneilla. Lisäksi voidaan määrittää raja jonka alla ohjaus on aina päällä.

Versiosta 2.4.0 lähtien voidaan myös määrittää, että päälläolotuntien tulee olla perättäiset. Versiosta 2.5.0 lähtien voidaan myös rajoittaa maksimihinta.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/b021403e-0b88-4fdc-8335-0c8edc244bd1)


| Asetus | Selite | Esim. (kuva yllä)
| --- | --- | ---
| Ajanjakso | Minkä mittaisiin jaksoihin vuorokausi jaetaan. Jokaiselta jaksolta haetaan sitten halvimmat tunnit. [h] | `6`
| Tuntimäärä | Kuinka monta halvinta tuntia lähtö ohjataan päälle ajanjakson aikana.<br><br>Eli jos ajanjakso on 6h ja tuntimäärä 2, kello 00:00-06:00 lähtö ohjataan päälle kahtena halvimpana tuntina. Kuten myös kello 06:00-12:00 ja niin edelleen. | `2`
| Peräkkäiset | Jos käytössä, valitaan jakson tunnit siten että ne ovat peräkkäin.<br><br>Näin yksittäisiä halvimpia tunteja ei välttämättä hyödynnetä, mutta halvin mahdollinen yhtenäinen jakso otetaan käyttöön. Katso esimerkki alta. | `ei`
| Aina päällä -raja | Jos sähkö on tätä halvempaa (tai juuri tämän hintaista) niin lähtö on aina päällä. [c/kWh] | `-0.5`
| Maksimihinta | Jos sähkön hinta on tätä korkeampi, lähtöä ei aseteta päälle vaikka tunti olisikin halvimpia tunteja. [c/kWh]<br><br>Tämän kanssa pitää olla tarkkana, jos tulee kalliita päiviä. | `30` 

Alla esimerkki miten ohjaukset menenivät 12.10.2023 hinnoilla ja yllä olevilla asetuksilla (6h, 2 halvinta tuntia, aina päällä -raja -0.5 c/kWh). Huomaa jaksojen korostus taustavärillä.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/b095bac2-4b95-4f1f-810c-51ae2bba98d9)

Alla on havainnollistettu **peräkkäiset**-asetuksen vaikutusta. Esimerkkikuvissa asetuksena on 4h ajanjakso ja tuntimäärä 3.

**Ei käytössä (oletusarvo):**

Valitaan kolme halvinta tuntia.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/1d2b9eac-591b-4fa7-9b18-076483db1bc5)


**Käytössä:**

Valitaan kolme perättäistä tuntia. Valitaan kello 17-19 koska niiden hinnan keskiarvo on pienempi kuin kello 16-18.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/cfb23821-496b-477e-b352-b5828f7c5525)

### Toiminnot

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/41d46697-028b-4294-8c62-88bc67c846c6)

* **Pakko-ohjaus**
  * Painamalla tätä voit asettaa lähdön päälle määritellyksi ajaksi
  * Syötä kysyttäessä kuinka monta tuntia lähtö pidetään päällä (voit syöttää myös osatunteja, esim. `0.5` on puoli tuntia)
* **Shelly**
  * Avaa uudessa välilehdessä Shellyn oman hallintasivun

## Teknistä tietoa ja kehitysympäristö

### Lyhyesti
  * Shellyyn asennattava skripti on "kääntöprosessin" tulos, jotta skripti saadaan mahtumaan mahdollisimman pieneen tilaan
  * Koodissa on jonkin verran outoja ja rumia temppuja (mitä en tekisi muualla)
    - Näiden syy on usein minimoida skriptin kokoa, joko suoraan tai helpottamalla minimointikirjastojen toimintaa
    - Esim: `document.querySelector()` on korvattu `qs()` jolloin säästetään paljon muistia
    - Esim: typerät mahdollisimman lyhyet muuttujanimet ja kentät
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

Versio 2.5.0 vie enimmillään 24276 tavua muistia (Shellyn maksimi 25200). Eli pieni skripti saattaa mahtua rinnalle pyörimään.

### Kehitysympäristö

Käyttää Node.js -ympäristöä. 

**Kääntöprosessi:**

1) Asenna Node.js 
2) Kloonaa repository ja avaa terminaali `shelly-porssisahko`-kansiossa
3) Aja komento `npm i` asentaaksesi kirjastot
2) Aja komento `npm run build` kääntääksesi projektin
3) Valmis skripti löytyy `dist/shelly-porssisahko.js`

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

## FAQ
**Miksi välillä tulee HTTP error 503?**

Tällä hetkellä jos skripti hakee hintoja tai suorittaa ohjauslogiikkaa, vastataan kaikkiin HTTP-pyyntöihin 503 (Service Unavailable). Käyttöliittymä osaa hallita tämän.

Jos hintojen hakeminen ei onnistu, voi tämä virhe tulla käyttöliittymää avatessa (hintojen haun aikakatkaisu on 5s --> pahimmillaan virhe voi tulla 5 sekunnin ajan). Yritä avata sivu uudelleen.

Voi olla että muutan tätä myöhemmin, vaatii vielä testejä. Syy on jälleen muistin säästäminen.

**Voinko ohjata ainoastaan yön halvimmilla tunneilla?**

Aseta ohjaustavaksi `jakson halvimmat tunnit` ja päivän siirtohinnaksi 999 c/kWh. Näin kaikki päivätunnit ovat kalliita ja halvimmat tunnit valitaan sen johdosta yöajalta.

## In English

This is a script to control relay by Nordpool electric spot prices for Shelly products (especially Shelly Plus 1PM) with web-based user interface.

At the moment it's available only in Finnish and the spot price is queried for Finland. 

There will soon be an English version (with country selection) available.

## License

GNU Affero General Public License v3.0 - [LICENSE.txt](https://github.com/jisotalo/shelly-porssisahko/blob/master/LICENSE.txt)

