# shelly-porssisahko - Pörssisähköohjaus Shelly-releisiin
[![License](https://img.shields.io/badge/License-AGPLv3-orange)](https://choosealicense.com/licenses/agpl-3.0/)
[![GitHub](https://img.shields.io/badge/View%20on-GitHub-brightgreen)](https://github.com/jisotalo/shelly-porssisahko)
[![Support](https://img.shields.io/badge/Support_with-PayPal-yellow)](https://www.paypal.com/donate/?business=KUWBXXCVGZZME&no_recurring=0&currency_code=EUR)
 
 

Shelly-laitteisiin selaimella ohjattava ilmainen ja avoimen lähdekoodin pörssisähkösovellus. Skripti pyörittää käyttöliittymää omalla web-serverillä ja tallentaa asetukset Shellyn muistiin.

Tämän skriptin avulla voi ohjata Shellyn relekytkintä sähkön hinnan mukaan, ilman rekisteröitymistä mihinkään palveluun.

Skripti käyttää suoraan Viron kantaverkkoyhtiö [Eleringin](https://dashboard.elering.ee/api) rajapintaa, eli välissä ei ole muita palveluita. Näin ollen rekisteröitymistä ei tarvita, vaan kaikki toimii "suoraan paketista".

![g0MPiID21U](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/2caa27f4-f1ec-4d22-b9c9-408ed01b13d0)

## Ominaisuudet
* Ilmainen sekä avoin lähdekoodi
* Oma web-serveri Shellyn sisällä ja siinä pyörivä käyttöliittymä
* Ei rekisteröitymistä
* Valvonta ja konfigurointi nettiselaimen avulla kotiverkossa (PC, puhelin, tabletti)
* Nykyisen ja seuraavan päivän hinnat sekä toteutuva ohjaus näkyvillä
* Kolme ohjaustapaa: 
  * **käsiohjaus** - yksinkertaisesti ohjaus päälle/pois
  * **hintaraja** - jos hinta on alle rajan, laitetaan ohjaus päälle 
  * **jakson halvimmat tunnit** - valitaan halutulta aikajaksolta x halvinta tuntia
* Mahdollisuus ohjata osatunteja
* Pakko-ohjaus väliaikaisesti tai aina tietyille tunneille (ohjaus päälle tai pois)
* Vikasietoinen
  * Varmuustunnit (jos ei hintoja mutta tiedetään kellonaika)
  * Hätätilaohjaus (jos ei internet-yhteyttä eikä tiedetä kellonaikaa)
* Konfiguroitavuus ja hienosäätö mahdollista omilla skripteillä
* Todettu toimivaksi ainakin seuraavilla
  * Shelly Plus 1PM
  * Shelly Plus 2PM
  * Shelly Plus 1
  * Shelly Pro 1
  * Shelly Pro 2
  * Shelly Pro 3
  * Shelly Pro 4PM
  * Shelly Pro3EM + Switch Add-on
  * Shelly Plus UNI
  * Shelly Plus 1 Mini
  * Shelly Plus Plug S
    * Plugin valon värin ohjaus sähkön hinnan mukaan onnistuu skriptillä [shelly-plug-nordpool-light](https://github.com/jisotalo/shelly-plug-nordpool-light)

## Sisällysluettelo
- [shelly-porssisahko - Pörssisähköohjaus Shelly-releisiin](#shelly-porssisahko---pörssisähköohjaus-shelly-releisiin)
  - [Ominaisuudet](#ominaisuudet)
  - [Sisällysluettelo](#sisällysluettelo)
  - [Muutoshistoria](#muutoshistoria)
  - [Tukeminen](#tukeminen)
  - [Asennus](#asennus)
    - [Asennus kirjaston avulla (suositeltu tapa)](#asennus-kirjaston-avulla-suositeltu-tapa)
    - [Asennus käsin](#asennus-käsin)
  - [Skriptin päivitys](#skriptin-päivitys)
  - [Laitteisto ja sähköinen kytkentä](#laitteisto-ja-sähköinen-kytkentä)
  - [Asetukset](#asetukset)
    - [Yleiset](#yleiset)
    - [Ohjaustapa: Käsiohjaus](#ohjaustapa-käsiohjaus)
    - [Ohjaustapa: Hintaraja](#ohjaustapa-hintaraja)
    - [Ohjaustapa: Jakson halvimmat tunnit](#ohjaustapa-jakson-halvimmat-tunnit)
    - [Jakson halvimmat tunnit - omavalintaiset jaksot](#jakson-halvimmat-tunnit---omavalintaiset-jaksot)
    - [Toiminnot](#toiminnot)
  - [Valmiita esimerkkiasetuksia](#valmiita-esimerkkiasetuksia)
    - [Yön halvimmat tunnit](#yön-halvimmat-tunnit)
    - [Yön ja illan halvimmat tunnit](#yön-ja-illan-halvimmat-tunnit)
    - [Vuorokauden halvimmat tunnit](#vuorokauden-halvimmat-tunnit)
    - [Joka 12 tunnin jakson halvimmat peräkkäiset tunnit](#joka-12-tunnin-jakson-halvimmat-peräkkäiset-tunnit)
    - [Alle päivän keskiarvon](#alle-päivän-keskiarvon)
    - [Ohjaus päällä vuorokauden kalliimpana tuntina](#ohjaus-päällä-vuorokauden-kalliimpana-tuntina)
  - [Lisätoiminnot ja omat skriptit](#lisätoiminnot-ja-omat-skriptit)
    - [Esimerkki: Ohjauksen muutos keskiarvon avulla](#esimerkki-ohjauksen-muutos-keskiarvon-avulla)
    - [Esimerkki: Ohjaustuntien asetus lämpötilan perusteella (Shelly Plus Add-On ja DS18B20)](#esimerkki-ohjaustuntien-asetus-lämpötilan-perusteella-shelly-plus-add-on-ja-ds18b20)
    - [Esimerkki: Ohjaustuntien asetus lämpötilan perusteella (erillinen Shelly H\&T)](#esimerkki-ohjaustuntien-asetus-lämpötilan-perusteella-erillinen-shelly-ht)
    - [Esimerkki: Ohjauksen rajoitus lämpötilan avulla (Shelly Plus Add-On ja DS18B20)](#esimerkki-ohjauksen-rajoitus-lämpötilan-avulla-shelly-plus-add-on-ja-ds18b20)
    - [Esimerkki: Ulkolämpötilan hakeminen Open-Meteo-sääpalvelusta ja sen hyödyntäminen](#esimerkki-ulkolämpötilan-hakeminen-open-meteo-sääpalvelusta-ja-sen-hyödyntäminen)
    - [Esimerkki: Asetusten määrittäminen skriptissä (ilman käyttöliittymää)](#esimerkki-asetusten-määrittäminen-skriptissä-ilman-käyttöliittymää)
  - [Kysymyksiä ja vastauksia](#kysymyksiä-ja-vastauksia)
    - [Miksi välillä tulee HTTP error 503?](#miksi-välillä-tulee-http-error-503)
    - [Miten ohjaan ainoastaan yön halvimmilla tunneilla?](#miten-ohjaan-ainoastaan-yön-halvimmilla-tunneilla)
    - [Miten saan lähdön päälle aina jos sähkön hinta on keskiarvon alapuolella?](#miten-saan-lähdön-päälle-aina-jos-sähkön-hinta-on-keskiarvon-alapuolella)
    - [Miksi laitteen nimen kohdalla lukee "Ei asetettu"?](#miksi-laitteen-nimen-kohdalla-lukee-ei-asetettu)
    - [Kuinka saa skriptin toimimaan Switch Add-Onin kanssa?](#kuinka-saa-skriptin-toimimaan-switch-add-onin-kanssa)
    - [Milloin seuraavan päivän hinnat haetaan? Miksi hintoja ei näy vaikka kello on 14?](#milloin-seuraavan-päivän-hinnat-haetaan-miksi-hintoja-ei-näy-vaikka-kello-on-14)
  - [Teknistä tietoa ja kehitysympäristö](#teknistä-tietoa-ja-kehitysympäristö)
    - [Lyhyesti](#lyhyesti)
    - [Tiedostot ja kansiot](#tiedostot-ja-kansiot)
    - [Muistin käyttö](#muistin-käyttö)
    - [Kehitysympäristö](#kehitysympäristö)
  - [In English](#in-english)
  - [License](#license)

## Muutoshistoria

Katso päivitysten sisältö [CHANGELOG.md-tiedostosta](https://github.com/jisotalo/shelly-porssisahko/blob/master/CHANGELOG.md).

Tarvittaessa vanhat skriptiversiot löytyvät [Releases](https://github.com/jisotalo/shelly-porssisahko/releases)-sivulta. Lataa halutun version zip-tiedosto, ja kopioi `dist/shelly-porssisahko.js`-tiedoston sisältö.


## Tukeminen

Jos skriptistä on hyötyä, voit vaikka tarjota kahvit vastineena!

<a href="https://www.buymeacoffee.com/jisotalo" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

[![Support](https://img.shields.io/badge/Support_with-PayPal-yellow)](https://www.paypal.com/donate/?business=KUWBXXCVGZZME&no_recurring=0&currency_code=EUR)
 
## Asennus

**HUOMIO:** Skripti vaatii firmwaren 1.0.7 tai uudemman

### Asennus kirjaston avulla (suositeltu tapa)

1. Ota Shelly käyttöön, yhdistä se wifi-verkkoon ja päivitä sen firmware. Avaa Shellyn hallinta **nettiselaimella**.

2. Laita **Websocket debug** päälle (Settings -> Debug -> Enable websocket debug). Näin näet suoraan hallintapaneelin osoitteen skriptin alla.
3. Avaa **Scripts**-sivu Shellyn hallinnasta. Poista olemassaolevat skriptit, jos niitä on.
4. Paina **Library**-painiketta

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/5fe7184e-f9ac-4fd4-b461-ad2239a96d95)

5. Aukeavassa ikkunassa paina **Configure URL**

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/ccd4b9fd-f9f2-4f42-8bc9-74c9486f6432)

6. Syötä osoitteeksi `https://raw.githubusercontent.com/jisotalo/shelly-porssisahko/master/shelly-library.json` ja paina **Save**

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/972fedb9-8503-4d90-a9b2-3af6f430ed7d)

7. Nyt kirjastoon ilmestyy pörssisähköohjaus. Asenna se painamalla **Import code**

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/9139dad1-e3ec-4a09-9e39-d940af5ea9d7)

8. Kun skripti ilmestyy, paina **Save**

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/2a241033-4ccb-415e-b422-373ec7ce54ef)

9. Tallentamisen jälkeen paina **Start**, jolloin skripti käynnistyy

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/8b30aa9f-b9de-44a7-9677-6872404b022d)

10. Jos websocket debug on päällä (**kohta 2**), näet hallinnan osoitteen suoraan skriptin alla konsolissa. Kopioi tämä osoite ja avaa se selaimella. Jos et näe sitä niin osoite on muotoa `http://ip-osoite/script/1`


    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/93b64aea-ec36-4ea4-88ff-e0a75146262b)

11. Varmista vielä että skripti käynnistyy aina automaattisesti. Eli **Scripts**-sivulla pitää shelly-porssisahko.js -skriptin kohdalla olla valinta päällä.

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/2d9fbb5f-e2c5-4f5c-a457-5606825184f3)

12. Valmis! Avaa käyttöliittymä selaimessa (**kohta 10**) ja säädä asetukset kohdilleen [Asetukset](#asetukset) ja [Valmiita esimerkkiasetuksia](#valmiita-esimerkkiasetuksia) -kappaleiden ohjeilla.

### Asennus käsin

Jos haluat asentaa skriptin käsin, Shelly Smart Control -sovelluksella tai [control.shelly.cloud](https://control.shelly.cloud) -pilvipalvelun kautta, löydät skriptin osoitteesta [https://raw.githubusercontent.com/jisotalo/shelly-porssisahko/master/dist/shelly-porssisahko.js](https://raw.githubusercontent.com/jisotalo/shelly-porssisahko/master/dist/shelly-porssisahko.js). 

Seuraa ylläolevia ohjeita pääpirteittäin, mutta kopioi skriptin sisältö Shellyyn sellaisenaan, kirjaston käytön sijaan.

## Skriptin päivitys

Jos haluat päivittää skriptin uusimaan versioon, poista nykyinen skripti ja tee asenna uusi **Library**-painikkeen kautta. Kaikki asetukset säilyvät. Voit myös päivittää sen käsin (katso [Asennus käsin](#asennus-käsin)).

**HUOMIO:** Tämän jälkeen skripti ei enää välttämättä käynnisty automaattisesti. Päivitä **Scripts**-sivu (esim. painamalla F5 selaimessa) ja laita skripti käynnistymään automaattisesti uudelleen (kuten asennusohjeiden kohdassa 11).

## Laitteisto ja sähköinen kytkentä

Uskallan suositella Shelly-tuotteiden ostoa [Nurkan Takaa -kaupasta](https://verkkokauppa.nurkantakaa.fi/), sillä omien kokemuksien perusteella homma toimii erittäin luotettavasti ja hinnat ovat Suomen alhaisimmat. 

Olen kehittänyt tämän skriptin alunperin Shelly Plus 1PM -relekytkimelle. Jos ohjaat kontaktoria, on suositeltavaa käyttää Shellyn sinisiä laitteita, jotka kestävät paremmin kelan aiheuttamia kytkentäpiikkejä. Näitä ovat esimerkiksi:

* [Shelly Plus 1](https://verkkokauppa.nurkantakaa.fi/tuote/shelly-plus-1/)
* [Shelly 1 Mini](https://verkkokauppa.nurkantakaa.fi/tuote/shelly-plus-1-mini-gen-3/)
* [Shelly Pro 1, 2 ja 3](https://verkkokauppa.nurkantakaa.fi/osasto/shelly/shelly-pro/)

Jos kuitenkin käytät esim. Shelly Plus 1PM -laitetta kontaktorin kanssa, [RC-suodatin](https://verkkokauppa.nurkantakaa.fi/tuote/rc-snubber/) voi auttaa. Jännitepiikit ovat tunnetusti aiheuttaneet laitteen yllättävää uudelleenkäynnistystä.

Lisää hyvää tietoa löytyy [Shelly tuki (suomeksi)](https://www.facebook.com/groups/shellytuki) -ryhmästä.

## Asetukset

### Yleiset

Nämä asetukset ovat voimassa kaikilla ohjaustavoilla.

<img  alt="image" src="https://github.com/jisotalo/shelly-porssisahko/assets/13457157/33c9fa38-487b-4fbd-a2b6-25b4a22b6fb2">

| Asetus | Selite | Esim. (kuva yllä)
| --- | --- | ---
| Ohjaustapa | Millä ohjaustavalla lähtöä ohjataan.<br><br>Selitykset taulukon alapuolella. | `jakson halvimmat tunnit`
| Ohjattavat lähdöt | Shellyn ohjattavien lähtöjen ID-numerot.<br><br>Jos useampi lähtö, erota pilkulla (max. 4 kpl). <br><br>- Yksi lähtö  (mm. Shelly Plus 1) --> `0`.<br>- Useampi (esim 0, 1 ja 100) --> `0,1,100` | `0` 
| Lähdön ohjaus | Ohjataanko relelähtö aina haluttuun tilaan vai ainoastaan jos tila muuttuu.<br><br>- **Aina tarkistaessa:** Lähtö ohjataan joka tarkistuksen jälkeen (eli yleensä kerran tunnissa) haluttuun tilaan ja Shellyn sovelluksen tai hallintapaneelin kautta tehty muutos ylikirjoitetaan.<br>- **Vain muuttuessa:** Lähtö ohjataan ensimmäisellä kerralla haluttuun tilaan ja sen jälkeen ainoastaan sen muuttuessa. | `aina tarkistaessa`
| Ohjausminuutit | Määrittää kuinka monta minuuttia tunnista ohjaus on päällä. Jos tunti on turhan pitkä aika pitää lähtöä päällä, voidaan aika muuttaa lyhyemmäksi. Asetus vaikuttaa kaikkiin ohjauksiin, pois lukien pakko-ohjaus käsin. [min]<br><br>Esim. 30 minuuttia riittää aina varaajan lämmittämiseen, joten pidetään vain tunnin ensimmäiset 30 minuuttia ohjausta päällä. | `60`
| Käänteinen ohjaus | Jos ruksittu, ohjaus toimii käänteisesti normaaliin nähden. Tällöin lähtökohta on, että lähtö on päällä.<br><br>- **Varmuustunnit**: Lähtö ohjataan varmuustunneilla pois päältä<br>- **Hätätilaohjaus**: Lähtö on päinvastainen asetukseen nähden<br>- **Pakko-ohjaukset**: Lähtö voidaan pakko-ohjata pois päältä<br>- **Käsiohjaus**: Lähtö on päinvastainen asetukseen nähden<br>- **Hintaraja**: Jos hinta on alle rajan, lähtö asetetaan pois päältä<br>- **Jakson halvimmat tunnit**: Jos nykyinen tunti on halvimpia tunteja, lähtö asetetaan pois päältä | `ei`
| Sähkön ALV | Käytettävä ALV-% sähkön hinnalle. [%]| `24`
| Siirtomaksut | Jos haluat että siirtomaksut otetaan huomioon, voit syöttää ne päivä- ja yöajalle. Nämä lisätään tuntihintoihin. [c/kWh]<br><br>Esim. jos haluat ottaa erisuuruiset siirtomaksut huomioon tuntien valinnassa. | päivä: `4` <br> yö: `3`
| Varmuustunnit | Jos sähkön hintaa ei jostain syystä tiedetä, ohjataan lähtö näillä tunneilla päälle.<br><br>Esim. ongelma hintojen haussa tai nettiyhteys katkeaa. | `01:00-07:00`
| Hätätilaohjaus | Jos Shelly ei jostain syystä tiedä kellonaikaa, ohjataan lähtö tähän tilaan varmuuden vuoksi.<br><br>Esim. jos sähkökatkon jälkeen nettiyhteys ei palaudu (ei hintoja eikä kellonaikaa). | `ON`
| Pakko-ohjaukset | Voidaan määrittää tunnit, jolloin ohjaus asetetaan joko päälle tai pois riippumatta sähkön hinnasta ja muista ohjauksista (pl. pakko-ohjaus käsin).<br><br>Esim. jos haluat lämmittää varajaa joka aamu tai estää ohjauksen tiettynä osana vuorokaudesta. | `05:00-07:00` ja `19:00-21:00` päällä<br><br>`01:00-02:00` pois

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

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/b021403e-0b88-4fdc-8335-0c8edc244bd1)

| Asetus | Selite | Esim. (kuva yllä)
| --- | --- | ---
| Ajanjakso | Minkä mittaisiin jaksoihin vuorokausi jaetaan. Jokaiselta jaksolta haetaan sitten halvimmat tunnit. [h]<br><br>**HUOMIO:** Versiosta 2.12.0 lähtien vaihtoehtona on myös `oma valinta`. Tällöin kellonajat voidaan syöttää itse. Katso lisätietoa kappaleesta [Jakson halvimmat tunnit - omavalintaiset jaksot](#jakson-halvimmat-tunnit---omavalintaiset-jaksot)| `6`
| Tuntimäärä | Kuinka monta halvinta tuntia lähtö ohjataan päälle ajanjakson aikana.<br><br>Eli jos ajanjakso on 6h ja tuntimäärä 2, kello 00:00-06:00 lähtö ohjataan päälle kahtena halvimpana tuntina. Kuten myös kello 06:00-12:00 ja niin edelleen. | `2`
| Peräkkäiset | Jos käytössä, valitaan jakson tunnit siten että ne ovat peräkkäin.<br><br>Näin yksittäisiä halvimpia tunteja ei välttämättä hyödynnetä, mutta halvin mahdollinen yhtenäinen jakso otetaan käyttöön. Katso esimerkki alta. | `ei`
| Aina päällä -raja | Jos sähkö on tätä halvempaa (tai juuri tämän hintaista) niin lähtö on aina päällä. [c/kWh]<br><br>Voit syöttää tähän myös arvon `avg`, jolloin käytetään päivän hinnan keskiarvoa. | `-0.5`
| Maksimihinta | Jos sähkön hinta on tätä korkeampi, lähtöä ei aseteta päälle vaikka tunti olisikin halvimpia tunteja. [c/kWh]<br><br>Voit syöttää tähän myös arvon `avg`, jolloin käytetään päivän hinnan keskiarvoa.<br><br>*Tämän kanssa pitää olla tarkkana, jos tulee kalliita päiviä.* | `30` 

Alla esimerkki miten ohjaukset toteutuivat 12.10.2023 hinnoilla ja yllä olevilla asetuksilla (6h, 2 halvinta tuntia, aina päällä -raja -0.5 c/kWh). Huomaa jaksojen korostus taustavärillä.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/b095bac2-4b95-4f1f-810c-51ae2bba98d9)

Alla on havainnollistettu **peräkkäiset**-asetuksen vaikutusta. Esimerkkikuvissa asetuksena on 4h ajanjakso ja tuntimäärä 3.

**Ei käytössä (oletusarvo):**

Valitaan kolme halvinta tuntia.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/1d2b9eac-591b-4fa7-9b18-076483db1bc5)


**Käytössä:**

Valitaan kolme perättäistä tuntia. Valitaan kello 17-19 koska niiden hinnan keskiarvo on pienempi kuin kello 16-18.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/cfb23821-496b-477e-b352-b5828f7c5525)

### Jakson halvimmat tunnit - omavalintaiset jaksot

Versiosta 2.12.0 lähtien voidaan vaihtoehtoisesti syöttää yksi tai kaksi omavalintaista jaksoa tuntimäärineen. Tämän avulla saadaan helposti tehtyä esimerkiksi "*kolme halvinta tuntia yöllä kello 00-06 väliltä ja yksi halvin tunti illalla kello 18-21 väliltä*" -tyylinen ohjaus.

Valittaessa ajanjaksoksi `oma valinta`, voidaan syöttää halutut kellonajat ja tuntimäärät alla olevan kuvan mukaisesti.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/f298906c-e4b7-4d8c-91d1-cf6fb67ec852)

Tällöin ohjaus voisi mennä esimerkiksi seuraavasti:

 ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/d965c456-af99-406f-960c-a8154b79c8f4)

### Toiminnot


![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/41d46697-028b-4294-8c62-88bc67c846c6)
* **Pakko-ohjaus**
  * Painamalla tätä voit asettaa lähdön päälle tai pois määritellyksi ajaksi
  * Syötä kysyttäessä kuinka monta tuntia pakko-ohjaus on käytössä sekä haluttu lähdön tila (voit syöttää myös osatunteja, esim. `0.5` on puoli tuntia)
* **Shelly**
  * Avaa uudessa välilehdessä Shellyn oman hallintasivun

## Valmiita esimerkkiasetuksia

Koska asetuksia on nykyään niin paljon, ajattelin listata tähän esimerkkejä.

### Yön halvimmat tunnit

* Kolme halvinta tuntia väliltä 00:00-06:00
* Jos hinnat ei tiedossa, ohjaus päällä 01:00-04:00
* Jos yhteysvika, ohjaus päällä

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/00301977-b26e-4e55-9249-336fee1f7f62)

### Yön ja illan halvimmat tunnit

* Kolme halvinta tuntia väliltä 00:00-06:00
* Yksi halvin tunti välillä 18:00-21:00
* Jos hinnat ei tiedossa, ohjaus päällä 01:00-04:00
* Jos yhteysvika, ohjaus päällä

 ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/19f2663c-8bd8-4a25-bd48-7e239b8d2cb8)

### Vuorokauden halvimmat tunnit

* Viisi halvinta tuntia vuorokaudelta
* Jos hinta alle 2 c/kWh, ohjaus on aina päällä
* Jos hinnat ei tiedossa, ohjaus päällä 02:00-04:00 ja 14:00-16:00
* Jos yhteysvika, ohjaus päällä

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/3a47ae5e-b257-4c7e-a346-81aa57ae909e)


### Joka 12 tunnin jakson halvimmat peräkkäiset tunnit

* Neljä halvinta **peräkkäistä** tuntia kahdelta jaksolta (eli yhteensä 8 tuntia)
  * 00:00 - 12:00 (4 tuntia)
  * 12:00 - 24:00 (4 tuntia)
* Jos hinta alle 2 c/kWh, ohjaus on aina päällä
* Jos hinnat ei tiedossa, ohjaus päällä 00:00-05:00, 14:00-15:00 ja 20:00-22:00
* Jos yhteysvika, ohjaus päällä

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/fbee67fd-df44-4571-80c3-46e425eaa576)

### Alle päivän keskiarvon

* Ohjaus on päällä kun hinta on alle vuorokauden keskiarvon
* Jos halpa tunti, ohjaus on kuitenkin päällä vain tunnin ensimmäiset 45 minuuttia 
  * Eli jos on peräkkäisiä tunteja, niiden välissä on 15 min tauko
* Jos hinnat ei tiedossa, ohjaus päällä 00:00-06:00
* Jos yhteysvika, ohjaus päällä

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/aa6650b9-c468-4dd0-b7a3-5bd2395cd4dc)

### Ohjaus päällä vuorokauden kalliimpana tuntina

* Ohjaus on päällä vuorokauden kalliimpana tuntina (huomaa käänteinen ohjaus)
* 23 muuta tuntia ohjaus on pois
* Jos hinnat ei tiedossa, ohjaus päällä 08:00-09:00
* Jos yhteysvika, ohjaus päällä

 ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/f9e4cf1f-84be-4dfd-816b-dde479f12dc2)

## Lisätoiminnot ja omat skriptit

Versiosta 2.8.0 lähtien on mahdollista lisätä omaa toiminnallisuutta pörssisähköohjuksen rinnalle. Tämä tapahtuu lisäämällä omaa koodia skriptin perään. Idea on, että pörssisähköohjauksen asetuksia tai ohjausta voidaan hienosäätää tarpeen mukaan, esimerkiksi lämpötilan perusteella. Alla oleva esimerkit voi asentaa **Library**-painikkeen takaa.

Alla esimerkki, kuinka käyttöliittymä näyttää [Shelly H&T:n lämpötilaa hyödyntävän ohjauksen](#esimerkki-ohjaustuntien-asetus-lämpötilan-perusteella-erillinen-shelly-ht) tilan:
<img alt="image" src="https://github.com/jisotalo/shelly-porssisahko/assets/13457157/76449d42-d2bb-4300-9786-fcf2cf23498c">

**Globaalit muuttujat**

Skriptissä on saatavilla globaali muuttuja `_`, joka sisältää skriptin tilan. Sen kuvaus löytyy koodista: <https://github.com/jisotalo/shelly-porssisahko/blob/master/src/shelly-porssisahko.js#L78>


**Ohjauksen muutokset (USER_OVERRIDE)**

Kun skripti on todennut ohjauksen tilan, kutsuu se funktiota `USER_OVERRIDE`, mikäli se on määritelty. Tässä funktiossa voidaan vielä tehdä viime hetken muutoksia skriptin ohjaukseen.

Vaihtoehtoisesti voidaan myös käskeä skriptiä ajamaan logiikka uudelleen. Tämä voi olla hyödyllistä esimerkiksi jos asetuksia on muutettu ja halutaan suorittaa logiikka heti uusilla asetuksilla.

`USER_OVERRIDE(cmd: boolean, state: object, callback: function(boolean|null)) => void`

| parametri | tyyppi | selite |
| --- | --- | --- |
| `cmd` | `boolean` | Skriptin määrittämä lopullinen komento (ennen mahdollista käänteistä ohjausta)
| `state` | `object` | Skriptin tila, sama kuin globaali muuttuja `_`.<br><br>Selitykset koodissa: <https://github.com/jisotalo/shelly-porssisahko/blob/master/src/shelly-porssisahko.js#L78> (esim `state.s.p.now`)
| `callback` | `function(boolean\|null)` | Takaisinkutsufunktio, jota **täytyy** kutsua lopullisella komennolla, esim: `callback(true)`.<br><br>Jos parametri on `null`, eli kutsu on `callback(null)`, ohjausta ei aseteta, vaan logiikka ajetaan hetken päästä uudelleen.
| *`paluuarvo`* | `void` | Ei paluuarvoa


**Asetusten muutokset (USER_CONFIG)**

Kun skripti on hakenut asetukset muistista tai kun pörssisähköohjauksen logiikan suoritus alkaa, kutsuu se funktiota `USER_CONFIG`, mikäli se on määritelty. Tässä funktiossa voidaan ylikirjoittaa yksittäisiä tai kaikki asetukset. Näin asetukset voidaan määrittää skriptissä ilman käyttöliittymää (esim. Shellyn pilvipalvelun kautta) tai niitä voidaan muuttaa lennossa esimerkiksi lämpötilaan perustuen.

`USER_CONFIG(config: object, state: object, initialized: boolean) => object`

| parametri | tyyppi | selite |
| --- | --- | --- |
| `config` | `object` | Skriptin tämänhetkiset asetukset
| `state` | `object` | Skriptin tila, sama kuin globaali muuttuja `_`.<br><br>Selitykset koodissa: <https://github.com/jisotalo/shelly-porssisahko/blob/master/src/shelly-porssisahko.js#L78> (esim `state.s.p.now`)
| `initialized` | `boolean` | `true` jos funktiota kutsutaan asetusten muistista hakemisen jälkeen, `false` jos kyseessä on logiikan suoritus. Tämän avulla tietää, onko aktiiviset asetukset tallennetut (`true`) vai mahdollisesti ylikirjoitetut. Näin esim. alkuperäiset käyttöliittymältä tallennetut asetukset voidaan ottaa talteen.
| *`paluuarvo`* | `object` | Lopulliset asetukset, joita halutaan käyttää

### Esimerkki: Ohjauksen muutos keskiarvon avulla

Tämä esimerkki näyttää kuinka voi hyödyntää hintatietoja ohjauksen hienosäätöön. 

Asenna esimerkkiskripti nimeltä **ESIMERKKI: Ohjauksen muutos keskiarvon avulla** Library-painikkeen takaa. Voit myös kopioida sen käsin alla olevasta linkistä.

Skripti asettaa ohjauksen pois, mikäli tuntihinta on yli 80% päivän keskiarvosta. Muuten mennään pörssisähköohjauksen mukaan.

**Esimerkin koodi:** <https://github.com/jisotalo/shelly-porssisahko/blob/master/dist/shelly-porssisahko-override-avg-price.js>

### Esimerkki: Ohjaustuntien asetus lämpötilan perusteella (Shelly Plus Add-On ja DS18B20)

Tämä esimerkki näyttää, kuinka voi hyödyntää mitattua ulkolämpötilaa ohjaustuntien hienosäädössä. 

Asenna esimerkkiskripti nimeltä **ESIMERKKI: Ohjaustuntien asetus lämpötilan perusteella (Shelly Plus Add-On ja DS18B20)** Library-painikkeen takaa. Voit myös kopioida sen käsin alla olevasta linkistä.

Käyttää lämpötila-anturia, jonka id on 100.

Esimerkin toiminta
* Jos lämpötila on alle -15°C, laitetaan halvimpien tuntien määräksi 8h ja ohjausminuuteksi 60min
* Jos lämpötila on alle -10°C, laitetaan halvimpien tuntien määräksi 7h ja ohjausminuuteksi 45min
* Jos lämpötila on alle -5°C, laitetaan halvimpien tuntien määräksi 6h ja ohjausminuuteksi 45min
* Muuten annetaan ohjata pörssisähköohjauksen asetusten mukaan

**Esimerkin koodi:** <https://github.com/jisotalo/shelly-porssisahko/blob/master/dist/shelly-porssisahko-addon-temp-hours.js>

### Esimerkki: Ohjaustuntien asetus lämpötilan perusteella (erillinen Shelly H&T)

Tämä esimerkki näyttää, kuinka voi hyödyntää toisen Shelly H&T:n lämpötilamittausta ohjaustuntien hienosäädössä. Eli pörssisähköskripti pyörii relelähdön omaavassa Shellyssä ja erikseen on ulkolämpötilaa mittaava Shelly H&T.

Asenna esimerkkiskripti nimeltä **ESIMERKKI: Ohjaustuntien asetus lämpötilan perusteella (erillinen Shelly H&T)** Library-painikkeen takaa. Voit myös kopioida sen käsin alla olevasta linkistä.

HUOM: Tämä vaatii, että Shelly H&T asetetaan `actions -> sensor reports` alle osoite `http://ip-osoite/script/1/update-temp`, missä IP-osoite on pörssisähköskriptiä pyörittävän Shellyn osoite. Lisäksi `sensor reports` pitää ruksia käyttöön. Näin kyseinen laite lähettää lämpötilan tähän osoitteeseen.

Esimerkin toiminta
* Jos lämpötila on alle -15°C, laitetaan halvimpien tuntien määräksi 8h ja ohjausminuuteksi 60min
* Jos lämpötila on alle -10°C, laitetaan halvimpien tuntien määräksi 7h ja ohjausminuuteksi 45min
* Jos lämpötila on alle -5°C, laitetaan halvimpien tuntien määräksi 6h ja ohjausminuuteksi 45min
* Muuten annetaan ohjata pörssisähköohjauksen asetusten mukaan

**Esimerkin koodi:** <https://github.com/jisotalo/shelly-porssisahko/blob/master/dist/shelly-porssisahko-ht-sensor-temp.js>

### Esimerkki: Ohjauksen rajoitus lämpötilan avulla (Shelly Plus Add-On ja DS18B20)

Tämä esimerkki näyttää, kuinka voi hyödyntää lämpötilamittausta ohjauksen rajoituksessa siten, että ei lämmitetä turhaan mutta ei myöskään päästetä liian kylmäksi. 

Asenna esimerkkiskripti nimeltä **Esimerkki: Ohjauksen rajoitus lämpötilan avulla (Shelly Plus Add-On ja DS18B20)** Library-painikkeen takaa. Voit myös kopioida sen käsin alla olevasta linkistä.

Käyttää lämpötila-anturia, jonka id on 100.
* Jos lämpötila on yli 15 astetta, asetetaan lähtö aina pois
* Jos lämpötila on alle 5 astetta, asetetaan se aina päälle
* Muuten annetaan ohjata pörssisähköohjauksen mukaan

**Esimerkin koodi:** <https://github.com/jisotalo/shelly-porssisahko/blob/master/dist/shelly-porssisahko-addon-temp.js>

### Esimerkki: Ulkolämpötilan hakeminen Open-Meteo-sääpalvelusta ja sen hyödyntäminen

Tämä esimerkki hakee koordinaattien perusteella kuluvan vuorokauden alhaisimman ja korkeimman lämpötilan [Open-Meteo](https://open-meteo.com/)-sääpalvelun API-rajapinnasta. Alhaisimman lämpötilan perusteella valitaan ohjaustuntien määrä ja ohjausminuutit.

Säätiedot haetaan vain kerran vuorokaudessa tai asetusten muuttuessa. Open-Meteo ei vaadi rekisteröitymistä.

Asenna esimerkkiskripti nimeltä **Esimerkki: Ulkolämpötilan hakeminen Open-Meteo-sääpalvelusta ja sen hyödyntäminen** Library-painikkeen takaa. Voit myös kopioida sen käsin alla olevasta linkistä.

Esimerkin toiminta
* Käytetään Tampereen koordinaatteja
* Jos vuorokauden alhaisin lämpötila on alle -15°C, laitetaan halvimpien tuntien määräksi 8h ja ohjausminuuteksi 60min
* Jos vuorokauden alhaisin lämpötila on alle -10°C, laitetaan halvimpien tuntien määräksi 7h ja ohjausminuuteksi 45min
* Jos vuorokauden alhaisin lämpötila on alle -5°C, laitetaan halvimpien tuntien määräksi 6h ja ohjausminuuteksi 45min
* Muuten annetaan ohjata pörssisähköohjauksen asetusten mukaan

**Esimerkin koodi:** <https://github.com/jisotalo/shelly-porssisahko/blob/master/dist/shelly-porssisahko-open-meteo-api.js>
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

Versiosta 2.12.0 lähtien tämä onnistuu helposti. Valitse ajanjaksoksi `oma valinta (1 jakso)` ja aseta asetukset. Katso [Jakson halvimmat tunnit - omavalintaiset jaksot](#jakson-halvimmat-tunnit---omavalintaiset-jaksot).

**Vanhemmat versiot:** Aseta ohjaustavaksi `jakson halvimmat tunnit` ja päivän siirtohinnaksi `999` c/kWh. Näin kaikki päivätunnit ovat kalliita ja halvimmat tunnit valitaan sen johdosta yöajalta.

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

### Milloin seuraavan päivän hinnat haetaan? Miksi hintoja ei näy vaikka kello on 14?

Seuraavan päivän hinnat haetaan kello 15. 

Elering tuntui päivittävän ne rajapintansa puoli kolmen kieppeillä, joten aiemmin yrittäminen on turhaa.

## Teknistä tietoa ja kehitysympäristö

### Lyhyesti 
  * Skriptin tekemisen alkuvaiheessa Shellyn firmware ei hallinnut muistia kunnolla -> muistista oli kokoajan pulaa. Tämän takia monet asiat on optimoitu äärimilleen, vaikka enää ei ehkä tarvitsisi
  * Shellyyn asennattava skripti on "kääntöprosessin" tulos, jotta skripti saadaan mahtumaan mahdollisimman pieneen tilaan
  * Koodissa on jonkin verran outoja ja rumia temppuja, mitä en tekisi muualla
    - Näiden syy on usein minimoida skriptin kokoa, joko suoraan tai helpottamalla minimointikirjastojen toimintaa
    - Esim: `document.querySelector()` on korvattu `qs()` jolloin säästetään paljon tilaa
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

Skriptin versio 2.11.0 vie enimillään hetkellisesti noin 15kt RAM-muistia (Shellyn maksimi 25200).
```json
"script:1": {
  "id": 1,
  "running": true,
  "mem_used": 9240,
  "mem_peak": 14854,
  "mem_free": 15960
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