# shelly-porssisahko - Pörssisähköohjaus Shelly-releisiin
[![License](https://img.shields.io/badge/License-AGPLv3-orange)](https://choosealicense.com/licenses/agpl-3.0/)
[![GitHub](https://img.shields.io/badge/View%20on-GitHub-brightgreen)](https://github.com/jisotalo/shelly-porssisahko)
[![Support](https://img.shields.io/badge/Support_with-PayPal-yellow)](https://www.paypal.com/donate/?business=KUWBXXCVGZZME&no_recurring=0&currency_code=EUR)
 
 
 
*In English - see bottom of the page.*

Shelly-laitteisiin selaimella ohjattava pörssisähkösovellus, joka venyttää laitteen skriptien rajoja. Pyörittää käyttöliittymää omalla web-serverillä ja tallentaa asetuksensa Shellyn muistiin.

Jos haluat ohjata Shellyn relekytkintä sähkön hinnan mukaan, ilman johonkin palveluun rekisteröitymistä, niin tämä voi olla hyödyllinen.

Käyttää suoraan Viron kantaverkkoyhtiön [elering.ee](https://dashboard.elering.ee/api) -rajapintaa, eli välissä ei ole muita palveluita. Skripti ei vaadi rekisteröitymistä mihinkään vaan se toimii "suoraan paketista".

![porssisahko](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/751cbd0c-1b7a-4086-9e32-b04b888c5425)


## Ominaisuudet
* Oma web-serveri Shellyn sisällä ja siinä pyörivä käyttöliittymä
* Valvonta ja konfigurointi selaimen avulla
* Ei tarvitse rekisteröityä mihinkään
* Konfiguroitavuus ja hienosäätö mahdollisesta skripteillä
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
  + [Esimerkki: Hinnan ja keskiarvon hyödyntäminen](#esimerkki-hinnan-ja-keskiarvon-hyödyntäminen)
  + [Esimerkki: Lämpötilaohjaus (Shelly Plus Add-On ja DS18B20)](#esimerkki-lämpötilaohjaus-shelly-plus-add-on-ja-ds18b20)
  + [Esimerkki: Ulkolämpötilan hakeminen sääpalvelusta ja sen hyödyntäminen](#esimerkki-ulkolämpötilan-hakeminen-sääpalvelusta-ja-sen-hyödyntäminen)
  + [Esimerkki: Asetukset suoraan skriptiin (ilman käyttöliittymää)](#esimerkki-asetukset-suoraan-skriptiin-ilman-käyttöliittymää)
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

 ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/3714ae4e-fc1e-48b7-8992-6e6640f74e2f)

| Asetus | Selite | Esim. (kuva yllä)
| --- | --- | ---
| Ohjaustapa | Millä ohjaustavalla lähtöä ohjataan.<br><br>Selitykset taulukon alapuolella. | `jakson halvimmat tunnit`
| Ohjattavat lähdöt | Shellyn ohjattavien lähtöjen ID-numerot.<br><br>Jos useampi lähtö, erota pilkulla (max. 4 kpl). <br><br>- Yksi lähtö  (mm. Shelly Plus 1) --> `0`.<br>- Useampi (esim 0, 1 ja 100) --> `0,1,100` | `0` 
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
  * Painamalla tätä voit asettaa lähdön päälle määritellyksi ajaksi
  * Syötä kysyttäessä kuinka monta tuntia lähtö pidetään päällä (voit syöttää myös osatunteja, esim. `0.5` on puoli tuntia)
* **Shelly**
  * Avaa uudessa välilehdessä Shellyn oman hallintasivun

## Lisätoiminnot ja omat skriptit

Versiosta 2.8.0 lähtien on mahdollista lisätä omaa toiminnallisuutta pörssisähköohjuksen rinnalle. Tämä tapahtuu lisäämällä omaa koodia skriptin perään, kuten alla olevassa kuvassa.

**Library**-painikkeen alta löytyy myös näitä esimerkkejä.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/52837e3c-5b06-4929-8571-4676898d6dc1)

**Ohjauksen muutokset (USER_OVERRIDE)**

Kun skripti on todennut ohjauksen tilan, kutsuu se funktiota `USER_OVERRIDE`, mikäli se on määritelty. Tässä funktiossa voidaan vielä tehdä viime hetken muutoksia skriptin ohjaukseen.

`USER_OVERRIDE(cmd: boolean, state: object, callback: function(boolean)) => void`

| parametri | tyyppi | selite |
| --- | --- | --- |
| `cmd` | `boolean` | Skriptin määrittämä lopullinen komento (ennen mahdollista käänteistä ohjausta)
| `state` | `object` | Skriptin tila. Selitykset koodissa: https://github.com/jisotalo/shelly-porssisahko/blob/master/src/shelly-porssisahko.js#L82 (esim `state.s.p.now`)
| `callback` | `function(boolean)` | Takaisinkutsufunktio, jota **täytyy** kutsua lopullisella komennolla, esim: `callback(true)`
| *`paluuarvo`* | `void` | Ei paluuarvoa


**Asetusten muuttaminen skriptistä (USER_CONFIG)**

Kun skripti on hakenut asetukset muistista, kutsuu se funktiota `USER_CONFIG`, mikäli se on määritelty. Tässä funktiossa voidaan ylikirjoittaa yksittäisiä tai kaikki asetukset. Näin asetukset voidaan määrittää skriptissä ilman käyttöliittymää (esim. Shellyn pilvipalvelun kautta).

`USER_CONFIG(config: object) => object`

| parametri | tyyppi | selite |
| --- | --- | --- |
| `config` | `object` | Skriptin tämänhetkiset asetukset
| *`paluuarvo`* | `object` | Lopulliset asetukset, joita halutaan käyttää

### Esimerkki: Hinnan ja keskiarvon hyödyntäminen

Tämä esimerkki näyttää kuinka voi hyödyntää hintatietoja ohjauksen hienosäätöön.

*Huom: try..catch on tärkeä, jotta mahdollisen bugin sattuessa ohjaus ei lakkaa toimimasta*

```js
function USER_OVERRIDE(cmd, state, callback) {
  try {
    console.log("Suoritetaan USER_OVERRIDE. Ohjauksen tila ennen: ", cmd);

    if (cmd && state.s.p.now > 0.8 * state.s.p.avg) {
      console.log("Hinta > 80% keskiarvosta, asetetaan ohjaus pois");
      cmd = false;
    }

    console.log("USER_OVERRIDE suoritettu. Ohjauksen tila nyt: ", cmd);
    callback(cmd);

  } catch (err) {
    console.log("Virhe tapahtui USER_OVERRIDE-funktiossa. Virhe:", err);
    callback(cmd);
  }
}
```

### Esimerkki: Lämpötilaohjaus (Shelly Plus Add-On ja DS18B20)

Tämä esimerkki näyttää, kuinka voi hyödyntää lämpötilamittausta ohjauksen hienosäädössä. Tämän voit myös asentaa esimerkin **Library**-painikkeen takaa (kuten itse skriptin).

Käyttää lämpötila-anturia, jonka id on 100.
* Jos lämpötila on yli 15 astetta, asetetaan lähtö aina pois
* Jos lämpötila on alle 5 astetta, asetetaan se aina päälle
* Muuten annetaan ohjata pörssisähköohjauksen mukaan

*Huom: try..catch on tärkeä, jotta mahdollisen bugin sattuessa ohjaus toimii silti.*

```js
function USER_OVERRIDE(cmd, state, callback) {
  try {
    console.log("Suoritetaan USER_OVERRIDE. Ohjauksen tila ennen: ", cmd);

    let temp = Shelly.getComponentStatus("temperature:100");

    if (!temp) {
      throw new Error("Kyseistä lämpötila-anturia ei löytynyt");
    }

    if (cmd && temp.tC > 15) {
      console.log("Lämpötila on yli 15 astetta, asetetaan ohjaus pois. Lämpötila nyt:", temp.tC);
      cmd = false;

    } else if (!cmd && temp.tC < 5) {
      console.log("Lämpötila on alle 5 astetta, asetetaan ohjaus päälle. Lämpötila nyt:", temp.tC);
      cmd = true;
    }
    
    console.log("USER_OVERRIDE suoritettu. Ohjauksen tila nyt: ", cmd);
    callback(cmd);

  } catch (err) {
    console.log("Virhe tapahtui USER_OVERRIDE-funktiossa. Virhe:", err);
    callback(cmd);
  }
}
```

### Esimerkki: Ulkolämpötilan hakeminen sääpalvelusta ja sen hyödyntäminen

Tulossa.

### Esimerkki: Asetukset suoraan skriptiin (ilman käyttöliittymää)

Jos et halua käyttää tai pysty käyttämään selainpohjaista käyttöliittymää, voidaan asetukset määrittää myös skriptissä (versiosta 2.8.0 alkaen). Tämä tapahtuu lisäämällä skriptin perään uusi funktio `USER_CONFIG`. 

Tämä myös mahdollistaa asetusten muuttamisen esimerkiksi etänä Shellyn pilvipalvelusta käsin skriptiä muokkaamalla.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/20bafc38-10cb-4ea2-9711-5acb339c7fe6)

Lisää seuraava koodi skriptin perään ylläolevan kuvan mukaisesti ja muokkaa asetukset kohdilleen. Voit myös asentaa esimerkin **Library**-painikkeen takaa (kuten itse skriptin).

Huomaa, että käyttöliittymästä tehdyt asetusmuutokset ylikirjoitetaan.

```js
function USER_CONFIG(config) {
  config = {
    /**  
     * Active mode
     * 0: manual mode (on/off toggle)
     * 1: price limit
     * 2: cheapest hours 
    */
    mode: 0,
    /** Settings for mode 0 (manual) */
    m0: {
      /** Manual relay output command [0/1] */
      cmd: 0
    },
    /** Settings for mode 1 (price limit) */
    m1: {
      /** Price limit limit - if price <= relay output command is set on [c/kWh] */
      lim: 0
    },
    /** Settings for mode 2 (cheapest hours) */
    m2: {
      /** Period length [h] (example: 24 -> cheapest hours during 24h) */
      per: 24,
      /** How many cheapest hours */
      cnt: 0,
      /** Always on price limit [c/kWh] */
      lim: -999,
      /** Should the hours be sequential / in a row [0/1] */
      sq: 0,
      /** Maximum price limit [c/kWh] */
      m: 999
    },
    /** VAT added to spot price [%] */
    vat: 24,
    /** Day (07...22) transfer price [c/kWh] */
    day: 0,
    /** Night (22...07) transfer price [c/kWh] */
    night: 0,
    /** Backup hours [binary] (example: 0b111111 = 00, 01, 02, 03, 04, 05) */
    bk: 0b0,
    /** Relay output command if clock time is not known [0/1] */
    err: 0,
    /** Outputs IDs to use (array of numbers) */
    outs: [0],
    /** Forced ON hours [binary] (example: 0b110000000000001100000 = 05, 06, 19, 20) */
    fh: 0b0,
    /** Invert output [0/1] */
    inv: 0
  };

  return config;
}
```

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

Skripti v.2.7.2 vie enimmillään ~11256 tavua RAM-muistia (Shellyn maksimi 25200)

Shellyn firmware-versiosta 1.0.7 eteenpäin tilaa on myös muille skripteille.

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