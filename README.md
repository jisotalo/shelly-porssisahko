# shelly-porssisahko - Pörssisähkö Shellyn laitteisiin
[![License](https://img.shields.io/github/license/jisotalo/shelly-porssisahko)](https://choosealicense.com/licenses/agpl-3.0/)
[![Support](https://img.shields.io/badge/Support_with-PayPal-yellow)](https://www.paypal.com/donate/?business=KUWBXXCVGZZME&no_recurring=0&currency_code=EUR)

Shelly-laitteisiin selaimella ohjattava pörssisähkösovellus, joka yrittää venyttää laitteen rajoja. Kehitetty ja testattu käyttäen Shelly Plus 1PM -relekytkintä, jonka saa esimerkiksi [Verkkokaupasta](https://www.verkkokauppa.com/fi/product/835579/Shelly-Plus-1PM-relekytkin-Wi-Fi-verkkoon). Pyörittää käyttöliittymää omalla web-serverillä ja tallentaa asetuksen Shellyn muistiin.

Mahdollisesti hyödyllinen, jos haluat yksinkertaisesti ohjata relekytkintä sähkön hinnan mukaan, ilman ylimääräistä säätöä ja muita laitteita.

Sain inspiraation projektiin alunperin [spot-hinta.fi](https://spot-hinta.fi/) -palvelusta. Käyttää suoraan Viron kantaverkkoyhtiön [elering.ee](https://dashboard.elering.ee/api) -APIa eikä välissä ole kolmannen osapuolen palveluita. Ei tarvitse rekisteröityä mihinkään.

**In English - see bottom of the page.**

![UVPmzHeV7U](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/b5b9d1ae-0373-4e17-9baf-b4ec2c5a6530)


## Projektin tila

Toimiva ja testattu omassa käytössä, pisimmillään 33 vuorokautta ilman uudelleenkäynnistystä, ja tällöinkin pysäytin sen tämän ohjeen tekoa varten. Tarkoitus on kehittää eteenpäin, kuitenkin Shellyn skriptin koko ja laitteen rajat alkavat jo tulla vastaan.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/199098ff-ae01-46e6-92b3-4fef68e90ead)

Itse koodi ei ole selkeintä eikä kommentteja ole paljoa. Yksi syy on juuri tilan puute eli merkien minimointi on tärkeää. Tarkoitus on kuitenkin vielä parannella koodia pikkuhiljaa. 

**Kehitysajatuksia**
* Koodin läpikäyntiä ja siistimistä
* Ohjaustapojen kehittäminen
* Skriptin asennuksen helpottaminen (saisiko helpommaksi jos jakaa muutamaan osaan?) 
* README:n kehitystä
* "Buildauksen" kehittämistä - tiedostojen parempi minimointi ja kommenttien poisto tuotantoskriptistä
* Englannin kieli + tuki muille maille?

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

## Skriptin asennus

**HUOM:** Repository sisältää myös [library-linkin Shellyä varten](https://raw.githubusercontent.com/jisotalo/shelly-porssisahko/master/shelly-library.md). Kuitenkin skripti on liian iso, eikä sen lisääminen onnistu ainakaan tällä hetkellä. Tästä johtuen se pitää lisätä käsin copypastella ohjeen mukaisesti.

**HUOM:** Ohje olettaa että muita skriptejä ei ole asennettu. Voi myös olla että tila riittää ainoastaan tälle skriptille.

1. Kytke Shellyyn sähköt
2. Yhdistä tietokoneesi Shellyn tukiaseman wifi-verkkoon, joka on muotoa `ShellyPlus1PM-XXX`. Tämän jälkeen hallintapaneeli löytyy osoitteesta [http://192.168.33.1](http://192.168.33.1)
3. *(Päivitä Shelly uusimpaan firmware-versioon jos se näyttää erilaiselta kuin alla)*
4. Avaa `Scripts`-sivu ja lisää uusi skripti painamalla `Add script`

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/ab837467-857d-4715-8ba5-29167e283000)

5. Anna skriptin nimeksi esim. `shelly-porssisahko`
6. Avaa [shelly-porssisahko.js](https://raw.githubusercontent.com/jisotalo/shelly-porssisahko/master/shelly-porssisahko.js) -tiedosto selaimessa. Kopioi koko tiedoston sisältö (CTRL+C)
7. Liitä tiedoston sisältö (CTRL+V) skriptin sisällöksi.
8. Paina `Save`-painiketta

**HUOMIO - TÄRKEÄÄ:**
* Jos tallennus epäonnistuu, yritä uudelleen kunnes se onnistuu. Ongelmat johtunevat isohkosta skriptistä.
* Jos tallennuksen jälkeen skriptin nimi ja sisältö katoavat, älä välitä, se ei haittaa. Tämäkin johtunee isosta skriptistä.


![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/7aa4cc6b-e824-4ee3-a8c8-2bb98068dbbd)

9. Paina `Start`-painiketta. Odota että skripti pysyy käynnissä (`Stop`-painike ei muutu takaisin `Start`-painikkeeksi).

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/e6c3474f-3936-47f9-9a2e-ad0992536117)

Jos olet asettanut websocket debugging -ominaisuuden päälle, voit myös tarkastella että konsoliin alkaa tulla tekstiä, jossa kerrotaan järjestelmän käynnistyneen.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/c80dbaff-6fd0-4f23-8d64-03e5ed665166)

**HUOMIO - TÄRKEÄÄ:**
* Jos käynnistyksen yhteydessä tulee erilaisia virheitä, liitä koodi uudelleen, tallenna ja yritä käynnistystä.
* Tämä voi käydä monta kertaa, toista tallennus/käynnistys -yritystä kunnes käynnistyy onnistuneesti.
* Tämäkin johtunee isosta skriptistä. Kun skripti on kerran saatu käynnistymään se toimii kyllä jatkossa aina, myös sähkökatkon jälkeen.

10. Kun skripti on käynnissä, siirry takaisin `Scripts` -sivulle. Aseta skripti käynnistymään automaattisesti skriptin kohdalta olevasta valintakytkimestä.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/78741ce4-9c4b-43ea-bd26-bd6c253cb205)


11. Nyt voit avata pörssisähkön käyttöliittymän osoitteesta [http://192.168.33.1/script/1/porssi](http://192.168.33.1/script/1/porssi)


![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/3fb21077-58d0-47a2-a182-99202ee6f474)

Jatka seuraavan kappaleen ohjeilla.

## Verkon konfigurointi

Tämän voi tehdä myös Shellyn omalla hallintapaneelilla.

1. Avaa [http://192.168.33.1/script/1/porssi](http://192.168.33.1/script/1/porssi)

2. Siirry Wifi-välilehteen
3. Aseta Wifi päälle, klikkaa `Valitse listalta` ja valitse haluamasi verkko ilmestyvästä alasvetovalikosta. Syötä myös mahdollinen salasana.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/e69554a6-168b-4fd9-b488-433c7c04664d)

4. Aseta myös tukiasemalle salasana, jos näet tarpeelliseksi.
5. Tallenna asetukset


Nyt sivun päivittämisen jälkeen Wifin tilatiedot ja IP-osoite ilmestyvät sivun ylälaitaan. Pörssisähkön käyttöliittymä on saatavilla myös tässä verkossa, eli esimerkissä hallintaan pääsee osoitteella [http://192.168.237.118/script/1/porssi](http://192.168.237.118/script/1/porssi).


![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/ca4cdb1a-b629-44a5-8c31-cea267468a77)

Loki-välilehdeltä nähdään myös että kellonaika on haettu internetistä:

`25.06.2023 20:14:14 - Kellonaika on nyt tiedossa. UTC-aika: 2023-06-25T17:14:14Z`


## Pörssisähkön konfigurointi

Pörssisähköasetukset konfiguroidaan `Asetukset`-sivun alta. Ohjaustapoja on kolme: käsiohjaus, hintaraja, halvimmat tunnit.

### Käsiohjaus

Tällä ohjaustavalla voit valita käsin onko ohjaus päällä vai pois.

| Asetus | Selite | Esimerkki |
| --- | --- | --- |
| Käsiohjaus | Onko ohjaus päällä vai pois | `on/off` |

### Hintaraja

Tällä ohjaustavalla syötetään kiinteä hintaraja. Jos sähkön hinta on alle rajan, ohjaus on päällä. Toimii jos halutaan ohjata jotain aina kun on tarpeeksi halpaa.

| Asetus | Selite | Esimerkki |
| --- | --- | --- |
| Hintaraja | Hinta (c/kWh), jonka alla ohjaus on aina päällä | `5.25` |
| Sähkön ALV-% | Sähkön arvonlisäveroprosentti (yleensä 24%) | `24` |
| Varmuustunnit | Tunnit (24h-muodossa), joina ohjaus on aina päällä jos yhteys on poikki eikä sähkön hintaa tiedetä | `04,05,22,23` |
| Hätätilaohjaus | Jos yhteyttä ei ole eikä kellonaika tiedetä, missä tilassa ohjaus on | `on/off` |
| Tervetuloa | Näytetäänkö tervetuloaviesti kun sivu avataan | `on/off` |


### Halvimmat tunnit

Tällä ohjaustavalla ohjaus on päällä 24h-jakson halvimpina tunteina. Lisäksi on mahdollista määrittää että ohjaus on päällä aina jos on tarpeeksi halpaa. 

Toimii esim. jos halutaan lämmittää varaajaa aina 4 tuntia, mutta jos sähkö on ilmaista, niin lämmitetään koko ajan.

| Asetus | Selite | Esimerkki |
| --- | --- | --- |
| Tuntimäärä | Kuinka monta tuntia 24h-jaksosta ohjauksen pitää olla päällä, eli kuinka monta halvinta tuntia ohjaus on päällä. <br><br>**Huom:** 24h tunti ei vastaa täysin suomen vuorokautta, sillä se toimii UTC-aikavyöhykkeellä. Loppupeleissä tulos on sama - 24h ajan sisältä valitaan halvimmat tunnit | `4`
| Hintaraja | Hinta (c/kWh), jonka alla ohjaus on aina päällä (oli halvimpia tai ei) - laita negatiivinen arvo jos et halua käyttää | `0.5` |
| Sähkön ALV-% | Sähkön arvonlisäveroprosentti (yleensä 24%) | `24` |
| Varmuustunnit | Tunnit (24h-muodossa), joina ohjaus on aina päällä jos yhteys on poikki eikä sähkön hintaa tiedetä | `04,05,22,23` |
| Hätätilaohjaus | Jos yhteyttä ei ole eikä kellonaika tiedetä, missä tilassa ohjaus on | `on/off` |
| Tervetuloa | Näytetäänkö tervetuloaviesti kun sivu avataan | `on/off` |


![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/e6c728c7-6461-419c-bbb0-a4531630c9e1)

## Kehitys

Statics-kansio sisältää html-, css- ja javascript-koodit. Nämä kopioidaan käsin `shelly-porssisahko.js`-skriptin web-serverin pyyntöihin.

Html-koodit minimoidaan poistamalla rivinvaihdot (vscode: F1 + join lines), css- ja js -tiedostot ajamalla vscoden Minify-pluginin läpi.

Kehitysympäristöä voi ajaa omalla koneella `start static server port 8080.ps1` -PowerShell-skriptillä. Tällöin Shellyn IP-osoite asetetaan `script.js`-tiedostossa [rivillä 3](https://github.com/jisotalo/shelly-porssisahko/blob/master/statics/script.js#L3). Kun PowerShell-skripti on käynnissä, pyörittää se simppeliä serveriä portissa 8080.


## In English

This is a script to control relay by electric spot price for Shelly products (especially Shelly Plus 1PM) with web-based user interface.

At the moment it's available only in Finnish and the spot price is queried for Finland. However other Nordpool countries would be trivial to add.

## Lisenssi / Lisence

GNU Affero General Public License v3.0 - [LICENSE.txt](https://github.com/jisotalo/shelly-porssisahko/blob/master/LICENSE.txt)

