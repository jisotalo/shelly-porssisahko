# shelly-porssisahko - Pörssisähköohjaus Shelly-releisiin
[![License](https://img.shields.io/badge/License-AGPLv3-orange)](https://choosealicense.com/licenses/agpl-3.0/)
[![GitHub](https://img.shields.io/badge/View%20on-GitHub-brightgreen)](https://github.com/jisotalo/shelly-porssisahko)
[![Support](https://img.shields.io/badge/Support_with-PayPal-yellow)](https://www.paypal.com/donate/?business=KUWBXXCVGZZME&no_recurring=0&currency_code=EUR)
 
 
 
*In English - see bottom of the page.*

Shelly-laitteisiin selaimella ohjattava pörssisähkösovellus, joka venyttää laitteen skriptien rajoja. Pyörittää käyttöliittymää omalla web-serverillä ja tallentaa asetuksensa Shellyn muistiin.

Jos haluat ohjata Shellyn relekytkintä sähkön hinnan mukaan, ilman johonkin palveluun rekisteröitymistä, niin tämä voi olla hyödyllinen.

Käyttää suoraan Viron kantaverkkoyhtiön [elering.ee](https://dashboard.elering.ee/api) -rajapintaa, eli välissä ei ole muita palveluita. Skripti ei vaadi rekisteröitymistä mihinkään vaan se toimii "suoraan paketista".

<img style="width:100%;max-width:450px;" src="https://github.com/jisotalo/shelly-porssisahko/assets/13457157/44da4ece-2e7b-4420-9906-31a644ebcddd" alt="shelly-porssisahko">

## Ominaisuudet
* Oma web-serveri Shellyn sisällä ja siinä pyörivä käyttöliittymä
* Valvonta ja konfigurointi selaimen avulla
* Ei tarvitse rekisteröityä mihinkään
* Konfiguroitavuus ja hienosäätö mahdollisesta omilla skripteillä
  * Esim. ulkolämpötilan hyödyntäminen ohjauksessa
* Kolme ohjaustapaa: 
  * **käsiohjaus** - yksinkertaisesti ohjaus päälle/pois
  * **hintaraja** - jos hinta on alle rajan, laitetaan ohjaus päälle 
  * **jakson halvimmat tunnit** - valitaan halutulta aikajaksolta x halvinta tuntia
* Mahdollisuus ohjata osatunteja
* Pakko-ohjaus väliaikaisesti tai aina tietyille tunneille (ohjaus päälle tai pois)
* Vikasietoinen
  * Varmuustunnit (jos ei hintoja mutta tiedetään kellonaika)
  * Hätätilaohjaus (jos ei internet-yhteyttä eikä tiedetä kellonaikaa)
* Todettu toimivaksi seuraavilla
  * Shelly Plus 1PM
  * Shelly Plus 2PM
  * Shelly Plus 1
  * Shelly Pro 1
  * Shelly Pro 2
  * Shelly Pro 3
  * Shelly Pro 4PM
  * Shelly Plus Plug S
  * Shelly Pro3EM + Switch Add-on
  * *Laita viestiä jos sinulla on kokemusta muista laitteista!*

## Sisällysluettelo
- [Muutoshistoria](#muutoshistoria)
- [Asennus](#asennus)
- [Skriptin päivitys](#skriptin-päivitys)
- [Laitteisto ja sähköinen kytkentä](#laitteisto-ja-sähköinen-kytkentä)
- [Asetukset](#asetukset)
  + [Yleiset](#yleiset)
  + [Ohjaustapa: Käsiohjaus](#ohjaustapa-käsiohjaus)
  + [Ohjaustapa: Hintaraja](#ohjaustapa-hintaraja)
  + [Ohjaustapa: Jakson halvimmat tunnit](#ohjaustapa-jakson-halvimmat-tunnit)
  + [Toiminnot](#toiminnot)
- [Lisätoiminnot ja omat skriptit](#lisätoiminnot-ja-omat-skriptit)
  + [Esimerkki: Ohjauksen hienosäätö keskiarvon avulla](#esimerkki-ohjauksen-hienosäätö-keskiarvon-avulla)
  + [Esimerkki: Ohjauksen hienosäätö lämpötilan avulla (Shelly Plus Add-On ja DS18B20)](#esimerkki-ohjauksen-hienosäätö-lämpötilan-avulla-shelly-plus-add-on-ja-ds18b20)
  + [Esimerkki: Ohjauksen hienosäätö Shelly H&T:n lämpötilamittauksen avulla](#esimerkki-ohjauksen-hienosäätö-shelly-htn-lämpötilamittauksen-avulla)
  + [Esimerkki: Ulkolämpötilan hakeminen sääpalvelusta ja sen hyödyntäminen](#esimerkki-ulkolämpötilan-hakeminen-sääpalvelusta-ja-sen-hyödyntäminen)
  + [Esimerkki: Asetusten määrittäminen skriptissä (ilman käyttöliittymää)](#esimerkki-asetusten-määrittäminen-skriptissä-ilman-käyttöliittymää)
- [Kysymyksiä ja vastauksia](#kysymyksiä-ja-vastauksia)
- [Teknistä tietoa ja kehitysympäristö](#teknistä-tietoa-ja-kehitysympäristö)
  + [Lyhyesti](#lyhyesti)
  + [Tiedostot ja kansiot](#tiedostot-ja-kansiot)
  + [Muistin käyttö](#muistin-käyttö)
  + [Kehitysympäristö](#kehitysympäristö)
- [In English](#in-english)
- [License](#license)

## Muutoshistoria

Katso päivitysten sisältö [CHANGELOG.md-tiedostosta](https://github.com/jisotalo/shelly-porssisahko/blob/master/CHANGELOG.md).

## Asennus

**Seuraa alla olevia ohjeita asentaaksesi skriptin.**

*Jos haluat asentaa skriptin käsin, Shelly Smart Control -sovelluksella tai [control.shelly.cloud](https://control.shelly.cloud) -pilvipalvelun kautta, löydät skriptin osoitteesta [https://raw.githubusercontent.com/jisotalo/shelly-porssisahko/master/dist/shelly-porssisahko.js](https://raw.githubusercontent.com/jisotalo/shelly-porssisahko/master/dist/shelly-porssisahko.js)*

1. Ota Shelly käyttöön, yhdistä se wifi-verkkoon ja päivitä sen firmware. 

    **HUOMIO: Firmware 1.0.7 tai uudempi vaaditaan versiosta 2.7.0 eteenpäin.**

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

12. Valmis. Avaa käyttöliittymä selaimessa (**kohta 10**) ja säädä asetukset kohdilleen [Asetukset](#asetukset)-kappaleen ohjeilla.

## Skriptin päivitys

Jos haluat päivittää skriptin uusimaan versioon, poista nykyinen skripti ja tee asenna uusi **Library**-painikkeen kautta. Kaikki asetukset säilyvät. Voit myös päivittää sen käsin (katso [Asennus käsin](#asennus-käsin)).

Huomaa, että tämän jälkeen skripti ei enää käynnisty automaattisesti. Päivitä **Scripts**-sivu (esim. painamalla F5 selaimessa) ja laita skripti käynnistymään automaattisesti uudelleen (kuten asennusohjeiden kohdassa 11).

## Laitteisto ja sähköinen kytkentä

Olen kehittänyt tämän Shelly Plus 1PM -relekytkimelle, jonka saa esimerkiksi [Verkkokaupasta](https://www.verkkokauppa.com/fi/product/835579/Shelly-Plus-1PM-relekytkin-Wi-Fi-verkkoon) tai halvemmalla [monelta suomalaiselta jälleenmyyjältä](https://www.google.com/search?q=shelly+plus+1pm&lr=lang_fi). Se kestää speksien mukaan 16A kuorman, joten ainakin kevyttä sähköpatteria uskaltaa ohjata suoraan.

Jos ohjaat kontaktoria, on suositeltavaa käyttää Shellyn sinisiä laitteita, jotka kestävät paremmin kelan aiheuttamia kytkentäpiikkejä. Näitä ovat esimerkiksi:

* Shelly Plus 1
* Shelly Plus 1 Mini
* Shelly Pro 1, 2 ja 3

Jos kuitenkin käytät esim. Shelly Plus 1PM -laitetta kontaktorin kanssa, [RC-suodatin](https://www.google.com/search?q=shelly+rc+snubber&lr=lang_fi) voi auttaa. Jännitepiikit ovat tunnetusti aiheuttaneet laitteen yllättävää uudelleenkäynnistystä.

Lisää hyvää tietoa löytyy [Shelly tuki (suomeksi)](https://www.facebook.com/groups/shellytuki) -ryhmästä.

## Asetukset

### Yleiset

Nämä asetukset ovat voimassa kaikilla ohjaustavoilla.

 ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/1e770799-25d6-442b-a04b-eb8f77de63f5)

| Asetus | Selite | Esim. (kuva yllä)
| --- | --- | ---
| Ohjaustapa | Millä ohjaustavalla lähtöä ohjataan.<br><br>Selitykset taulukon alapuolella. | `jakson halvimmat tunnit`
| Ohjattavat lähdöt | Shellyn ohjattavien lähtöjen ID-numerot.<br><br>Jos useampi lähtö, erota pilkulla (max. 4 kpl). <br><br>- Yksi lähtö  (mm. Shelly Plus 1) --> `0`.<br>- Useampi (esim 0, 1 ja 100) --> `0,1,100` | `0` 
| Käänteinen ohjaus | Jos ruksittu, ohjaus toimii käänteisesti normaaliin nähden. Tällöin lähtökohta on, että lähtö on päällä.<br><br>- **Varmuustunnit**: Lähtö ohjataan varmuustunneilla pois päältä<br>- **Hätätilaohjaus**: Lähtö on päinvastainen asetukseen nähden<br>- **Pakko-ohjaukset**: Lähtö voidaan pakko-ohjata pois päältä<br>- **Käsiohjaus**: Lähtö on päinvastainen asetukseen nähden<br>- **Hintaraja**: Jos hinta on alle rajan, lähtö asetetaan pois päältä<br>- **Jakson halvimmat tunnit**: Jos nykyinen tunti on halvimpia tunteja, lähtö asetetaan pois päältä | `ei`
| Sähkön ALV | Käytettävä ALV-% sähkön hinnalle. [%]| `24`
| Siirtomaksut | Jos haluat että siirtomaksut otetaan huomioon, voit syöttää ne päivä- ja yöajalle. Nämä lisätään tuntihintoihin. [c/kWh]<br><br>Esim. jos haluat ottaa erisuuruiset siirtomaksut huomioon tuntien valinnassa. | päivä: `4` <br> yö: `3`
| Varmuustunnit | Jos sähkön hintaa ei jostain syystä tiedetä, ohjataan lähtö näillä tunneilla päälle.<br><br>Esim. ongelma hintojen haussa tai nettiyhteys katkeaa. | `01:00-07:00`
| Hätätilaohjaus | Jos Shelly ei jostain syystä tiedä kellonaikaa, ohjataan lähtö tähän tilaan varmuuden vuoksi.<br><br>Esim. jos sähkökatkon jälkeen nettiyhteys ei palaudu (ei hintoja eikä kellonaikaa). | `ON`
| Pakko-ohjaukset | Voidaan määrittää tunnit, jolloin ohjaus asetetaan joko päälle tai pois riippumatta sähkön hinnasta ja muista ohjauksista (pl. pakko-ohjaus käsin).<br><br>Esim. jos haluat lämmittää varajaa joka aamu tai estää ohjauksen tiettynä osana vuorokaudesta. | `05:00-07:00` ja `19:00-21:00` päällä<br><br>`01:00-02:00` pois
| Ohjausminuutit | Määrittää kuinka monta minuuttia tunnista ohjaus on päällä. Jos tunti on turhan pitkä aika pitää lähtöä päällä, voidaan aika muuttaa lyhyemmäksi. Asetus vaikuttaa kaikkiin ohjauksiin pois lukien pakko-ohjaukseen käsin. [min]<br><br>Esim. 30 minuuttia riittää aina varaajan lämmittämiseen, joten pidetään vain tunnin ensimmäiset 30 minuuttia ohjausta päällä. | `60`
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
| Hintaraja | Hinta, jossa ja jonka alla lähtö asetetaan päälle. [c/kWh]<br><br>Voit syöttää tähän myös arvon `avg`, jolloin käytetään päivän hinnan keskiarvoa. | `4.25`

### Ohjaustapa: Jakson halvimmat tunnit

Jakson halvimmat tunnit -ohjauksella vuorokausi jaetaan osiin. Lähtö ohjataan päälle jokaisen osan halvimmmilla tunneilla. Lisäksi voidaan määrittää raja jonka alla ohjaus on aina päällä.

Versiosta 2.4.0 lähtien voidaan myös määrittää, että päälläolotuntien tulee olla perättäiset. Versiosta 2.5.0 lähtien voidaan myös rajoittaa maksimihinta.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/b021403e-0b88-4fdc-8335-0c8edc244bd1)


| Asetus | Selite | Esim. (kuva yllä)
| --- | --- | ---
| Ajanjakso | Minkä mittaisiin jaksoihin vuorokausi jaetaan. Jokaiselta jaksolta haetaan sitten halvimmat tunnit. [h] | `6`
| Tuntimäärä | Kuinka monta halvinta tuntia lähtö ohjataan päälle ajanjakson aikana.<br><br>Eli jos ajanjakso on 6h ja tuntimäärä 2, kello 00:00-06:00 lähtö ohjataan päälle kahtena halvimpana tuntina. Kuten myös kello 06:00-12:00 ja niin edelleen. | `2`
| Peräkkäiset | Jos käytössä, valitaan jakson tunnit siten että ne ovat peräkkäin.<br><br>Näin yksittäisiä halvimpia tunteja ei välttämättä hyödynnetä, mutta halvin mahdollinen yhtenäinen jakso otetaan käyttöön. Katso esimerkki alta. | `ei`
| Aina päällä -raja | Jos sähkö on tätä halvempaa (tai juuri tämän hintaista) niin lähtö on aina päällä. [c/kWh]<br><br>Voit syöttää tähän myös arvon `avg`, jolloin käytetään päivän hinnan keskiarvoa. | `-0.5`
| Maksimihinta | Jos sähkön hinta on tätä korkeampi, lähtöä ei aseteta päälle vaikka tunti olisikin halvimpia tunteja. [c/kWh]<br><br>Voit syöttää tähän myös arvon `avg`, jolloin käytetään päivän hinnan keskiarvoa.<br><br>*Tämän kanssa pitää olla tarkkana, jos tulee kalliita päiviä.* | `30` 

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
  * Painamalla tätä voit asettaa lähdön päälle tai pois määritellyksi ajaksi
  * Syötä kysyttäessä kuinka monta tuntia lähtö pidetään päällä (voit syöttää myös osatunteja, esim. `0.5` on puoli tuntia) sekä haluttu lähdön tila
* **Shelly**
  * Avaa uudessa välilehdessä Shellyn oman hallintasivun

## Lisätoiminnot ja omat skriptit

Versiosta 2.8.0 lähtien on mahdollista lisätä omaa toiminnallisuutta pörssisähköohjuksen rinnalle. Tämä tapahtuu lisäämällä omaa koodia skriptin perään. Idea on, että pörssisähköohjauksen asetuksia tai ohjausta voidaan hienosäätää tarpeen mukaan, esimerkiksi lämpötilan perusteella. Alla oleva esimerkit voi asentaa **Library**-painikkeen takaa.

Alla esimerkki, kuinka käyttöliittymä näyttää [Shelly H&T:n lämpötilaa hyödyntävän ohjauksen](#esimerkki-ohjauksen-hienosäätö-shelly-htn-lämpötilamittauksen-avulla) tilan:
<img alt="image" src="https://github.com/jisotalo/shelly-porssisahko/assets/13457157/76449d42-d2bb-4300-9786-fcf2cf23498c">

**Globaalit muuttujat**

Skriptissä on saatavilla globaali muuttuja `_`, joka sisältää skriptin tilan. Sen kuvaus löytyy koodista: <https://github.com/jisotalo/shelly-porssisahko/blob/master/src/shelly-porssisahko.js#L88>


**Ohjauksen muutokset (USER_OVERRIDE)**

Kun skripti on todennut ohjauksen tilan, kutsuu se funktiota `USER_OVERRIDE`, mikäli se on määritelty. Tässä funktiossa voidaan vielä tehdä viime hetken muutoksia skriptin ohjaukseen.

`USER_OVERRIDE(cmd: boolean, state: object, callback: function(boolean)) => void`

| parametri | tyyppi | selite |
| --- | --- | --- |
| `cmd` | `boolean` | Skriptin määrittämä lopullinen komento (ennen mahdollista käänteistä ohjausta)
| `state` | `object` | Skriptin tila, sama kuin globaali muuttuja `_`.<br><br>Selitykset koodissa: <https://github.com/jisotalo/shelly-porssisahko/blob/master/src/shelly-porssisahko.js#L88> (esim `state.s.p.now`)
| `callback` | `function(boolean)` | Takaisinkutsufunktio, jota **täytyy** kutsua lopullisella komennolla, esim: `callback(true)`
| *`paluuarvo`* | `void` | Ei paluuarvoa


**Asetusten muutokset (USER_CONFIG)**

Kun skripti on hakenut asetukset muistista tai kun pörssisähköohjauksen logiikan suoritus alkaa, kutsuu se funktiota `USER_CONFIG`, mikäli se on määritelty. Tässä funktiossa voidaan ylikirjoittaa yksittäisiä tai kaikki asetukset. Näin asetukset voidaan määrittää skriptissä ilman käyttöliittymää (esim. Shellyn pilvipalvelun kautta) tai niitä voidaan muuttaa lennossa esimerkiksi lämpötilaan perustuen.

`USER_CONFIG(config: object, state: object, initialized: boolean) => object`

| parametri | tyyppi | selite |
| --- | --- | --- |
| `config` | `object` | Skriptin tämänhetkiset asetukset
| `state` | `object` | Skriptin tila, sama kuin globaali muuttuja `_`.<br><br>Selitykset koodissa: <https://github.com/jisotalo/shelly-porssisahko/blob/master/src/shelly-porssisahko.js#L88> (esim `state.s.p.now`)
| `initialized` | `boolean` | `true` jos funktiota kutsutaan asetusten muistista hakemisen jälkeen, `false` jos kyseessä on logiikan suoritus. Tämän avulla tietää, onko aktiiviset asetukset tallennetut (`true`) vai mahdollisesti ylikirjoitetut. Näin esim. alkuperäiset käyttöliittymältä tallennetut asetukset voidaan ottaa talteen.
| *`paluuarvo`* | `object` | Lopulliset asetukset, joita halutaan käyttää

### Esimerkki: Ohjauksen hienosäätö keskiarvon avulla

Tämä esimerkki näyttää kuinka voi hyödyntää hintatietoja ohjauksen hienosäätöön. Asenna esimerkkiskripti nimeltä **ESIMERKKI: Ohjauksen hienosäätö keskiarvon avulla** Library-painikkeen takaa. Voit myös kopioida sen käsin alla olevasta linkistä.

Skripti asettaa ohjauksen pois, mikäli tuntihinta on yli 80% päivän keskiarvosta. Muuten mennään pörssisähköohjauksen mukaan.

**Esimerkin koodi:** <https://github.com/jisotalo/shelly-porssisahko/blob/master/dist/shelly-porssisahko-override-avg-price.js>

### Esimerkki: Ohjauksen hienosäätö lämpötilan avulla (Shelly Plus Add-On ja DS18B20)

Tämä esimerkki näyttää, kuinka voi hyödyntää lämpötilamittausta ohjauksen hienosäädössä. Asenna esimerkkiskripti nimeltä **ESIMERKKI: Ohjauksen hienosäätö lämpötilan avulla (Shelly Plus Add-On ja DS18B20)** Library-painikkeen takaa. Voit myös kopioida sen käsin alla olevasta linkistä.

Käyttää lämpötila-anturia, jonka id on 100.
* Jos lämpötila on yli 15 astetta, asetetaan lähtö aina pois
* Jos lämpötila on alle 5 astetta, asetetaan se aina päälle
* Muuten annetaan ohjata pörssisähköohjauksen mukaan

**Esimerkin koodi:** <https://github.com/jisotalo/shelly-porssisahko/blob/master/dist/shelly-porssisahko-addon-temp.js>

### Esimerkki: Ohjauksen hienosäätö Shelly H&T:n lämpötilamittauksen avulla

Tämä esimerkki näyttää, kuinka voi hyödyntää Shelly H&T:n lämpötilamittausta ohjauksen hienosäädössä. Asenna esimerkkiskripti nimeltä **ESIMERKKI: Ohjauksen hienosäätö Shelly H&T:n lämpötilamittauksen avulla** Library-painikkeen takaa. Voit myös kopioida sen käsin alla olevasta linkistä.

HUOM: Tämä vaatii, että Shelly H&T asetetaan `actions -> sensor reports` alle osoite `http://ip-osoite/script/1/update-temp`, missä IP-osoite on pörssisähköskriptiä pyörittävän Shellyn osoite. Lisäksi `sensor reports` pitää ruksia käyttöön. Näin kyseinen laite lähettää lämpötilan tähän osoitteeseen.

Esimerkin toiminta
* Jos lämpötila on alle -15°C, laitetaan halvimpien tuntien määräksi 8h ja ohjausminuuteksi 60min
* Jos lämpötila on alle -10°C, laitetaan halvimpien tuntien määräksi 7h ja ohjausminuuteksi 45min
* Jos lämpötila on alle -5°C, laitetaan halvimpien tuntien määräksi 6h ja ohjausminuuteksi 45min
* Muuten annetaan ohjata pörssisähköohjauksen asetusten mukaan

**Esimerkin koodi:** <https://github.com/jisotalo/shelly-porssisahko/blob/master/dist/shelly-porssisahko-ht-sensor-temp.js>

### Esimerkki: Ulkolämpötilan hakeminen sääpalvelusta ja sen hyödyntäminen

Tulossa.

### Esimerkki: Asetusten määrittäminen skriptissä (ilman käyttöliittymää)

Jos et halua käyttää tai pysty käyttämään selainpohjaista käyttöliittymää, voidaan asetukset määrittää myös skriptissä (versiosta 2.8.0 alkaen). Tämä tapahtuu lisäämällä skriptin perään uusi funktio `USER_CONFIG`. 

Tämä myös mahdollistaa asetusten muuttamisen esimerkiksi etänä Shellyn pilvipalvelusta käsin skriptiä muokkaamalla. Huomaa, että käyttöliittymästä tehdyt asetusmuutokset ylikirjoitetaan.

Asenna esimerkkiskripti nimeltä **ESIMERKKI: Asetusten määrittäminen skriptissä** Library-painikkeen takaa. Voit myös kopioida sen käsin alla olevasta linkistä.

**Esimerkin koodi:** <https://github.com/jisotalo/shelly-porssisahko/blob/master/dist/shelly-porssisahko-user-config.js>

Voit myös halutessasi hyödyntää nykyisiä asetuksia ja vain muokata jotain niistä, sillä funktion parametri `config` sisältää tallennetut asetukset. 

Esimerkki: Olet laittanut asetukset kuntoon kotona, mutta huomaat reissun päällä että halvimpia tunteja pitäisikin olla neljän sijaan viisi. Voit tehdä muutoksen etänä pilvipalvelusta lisäämällä alla olevan koodin skriptin perään: 

```js
function USER_CONFIG(config) {
  //Muutetaan vain "halvimmat tunnit" -ohjauksen tuntimäärä arvoon 5
  //Muuten asetukset pysyy samana
  config.m2.cnt = 5;
  
  return config;
}

```

## Kysymyksiä ja vastauksia
### Miksi välillä tulee HTTP error 503?

Tällä hetkellä jos skripti hakee hintoja tai suorittaa ohjauslogiikkaa, vastataan kaikkiin HTTP-pyyntöihin 503 (Service Unavailable). Käyttöliittymä osaa hallita tämän.

Jos hintojen hakeminen ei onnistu, voi tämä virhe tulla käyttöliittymää avatessa (hintojen haun aikakatkaisu on 5s --> pahimmillaan virhe voi tulla 5 sekunnin ajan). Yritä avata sivu uudelleen.

Voi olla että muutan tätä myöhemmin, vaatii vielä testejä. Syy on jälleen muistin säästäminen.

### Miten ohjaan ainoastaan yön halvimmilla tunneilla?

Aseta ohjaustavaksi `jakson halvimmat tunnit` ja päivän siirtohinnaksi `999` c/kWh. Näin kaikki päivätunnit ovat kalliita ja halvimmat tunnit valitaan sen johdosta yöajalta.

### Miten saan lähdön päälle aina jos sähkön hinta on keskiarvon alapuolella?

Versiosta 2.6.0 lähtien tämä onnistuu valitsemalla ohjaustavaksi `hintaraja` ja asettamalla hintarajaksi arvon `avg`.

### Miksi laitteen nimen kohdalla lukee "Ei asetettu"?

Et ole asettanut laitteelle nimeä Shellyn hallinnasta. Nimen voit asettaa `Settings` -> `Device name` alta. 

Huomaa, että tehdasasetuksena nimen kohdalla lukee lukee laitteen malli. Tämä näkyy silti pörssisähköskriptille tyhjänä.

### Kuinka saa skriptin toimimaan Switch Add-Onin kanssa?

Testattu Shelly Pro3EM + Switch Add-on.

Kun olet asentanut add-onin, näet lähdön numeron Shellyn hallinnassa. Alla olevassa esimerkissä lähdön numero on `100`.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/81babe94-1999-4890-ab80-c2f9ffbd54e0)


Muuta skriptin asetuksista `ohjattavat lähdöt` kyseiseen arvoon, jolloin ohjaus toimii.

## Teknistä tietoa ja kehitysympäristö

### Lyhyesti 
  * Skriptin tekemisen alkuvaiheessa Shellyn firmware ei hallinnut muistia kunnolla -> muistista oli kokoajan pulaa. Tämän takia monet asiat on optimoitu äärimilleen, vaikka enää ei ehkä tarvitsisi
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
* `src/after-build-examples/`
  * Esimerkkiskriptit, jotka yhdistetään shelly-porssisahko.js kanssa käännön lopussa
* `src/statics/`
  * Staattiset html, js ja css -tiedostot
* `dist/shelly-porssisahko.js`
  * **"Käänetty" valmis skripti joka voidaan laittaa ajoon**
  * Minimoitu ja sisältää myös staattiset tiedostot
* `dist/*.js`
  * Muut käännetyt esimerkkiskriptit
  * Minimoitu ja sisältää myös staattiset tiedostot
* `dist/statics/`
  * Staattiset tiedostot, jotka muodostuvat kääntöprosessin aikana, debuggausta varten
  * Minimoidut staattiset tiedostot sekä pakatut versiot
  * Ei sisälly versiohallintaan

### Muistin käyttö

Skripti vie enimillään hetkellisesti noin 12kt RAM-muistia (Shellyn maksimi 25200).
```json
"script:1": {
  "id": 1,
  "running": true,
  "mem_used": 6482,
  "mem_peak": 11788,
  "mem_free": 18718
},
```

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

## In English

This is a script to control relay by Nordpool electric spot prices for Shelly products with web-based user interface.

At the moment it's available only in Finnish and the spot price is queried for Finland. 

There will be an English version (maybe with country selection) available later when I have an insipiration to work on it.

## License

GNU Affero General Public License v3.0 - [LICENSE.txt](https://github.com/jisotalo/shelly-porssisahko/blob/master/LICENSE.txt)

Huomaathan, että projekti on täysin harrasteena tehty, eikä siinä ole lisenssin mukaisesti mitään takuuta. Näin ollen tekijä ei ole vastuussa jos sen käytön kanssa on ongelmia.