# shelly-porssisahko - Pörssisähköohjaus Shelly-releisiin
[![License](https://img.shields.io/badge/License-AGPLv3-orange)](https://choosealicense.com/licenses/agpl-3.0/)
[![Support](https://img.shields.io/badge/Support_with-PayPal-yellow)](https://www.paypal.com/donate/?business=KUWBXXCVGZZME&no_recurring=0&currency_code=EUR)

**In English - see bottom of the page.**

Shelly-laitteisiin selaimella ohjattava pörssisähkösovellus, joka yrittää venyttää laitteen rajoja. Kehitetty ja testattu käyttäen Shelly Plus 1PM -relekytkintä, jonka saa esimerkiksi [Verkkokaupasta](https://www.verkkokauppa.com/fi/product/835579/Shelly-Plus-1PM-relekytkin-Wi-Fi-verkkoon). Pyörittää käyttöliittymää omalla web-serverillä ja tallentaa asetuksensa Shellyn muistiin.

Mahdollisesti hyödyllinen, jos haluat yksinkertaisesti ohjata relekytkintä sähkön hinnan mukaan, ilman ylimääräistä säätöä ja muita laitteita.

Sain inspiraation projektiin alunperin [spot-hinta.fi](https://spot-hinta.fi/) -palvelusta. Skripti käyttää suoraan Viron kantaverkkoyhtiön [elering.ee](https://dashboard.elering.ee/api) -APIa, eli välissä ei ole kolmannen osapuolen palveluita. Ei myöskään tarvitse rekisteröityä mihinkään.

![UVPmzHeV7U](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/b5b9d1ae-0373-4e17-9baf-b4ec2c5a6530)


## Projektin tila

Toimiva ja testattu omassa käytössä. Pisin kokeilujakso on ollut 33 vuorokautta ilman uudelleenkäynnistystä. Tarkoitus on kehittää eteenpäin aina kun sille päälle sattuu, Shellyn rajat alkavat kuitenkin tulla vastaan. 

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/199098ff-ae01-46e6-92b3-4fef68e90ead)

**Kehitysajatuksia**
* Koodin läpikäyntiä ja siistimistä (kommentteja ei juuri ole koska pitää olla pieni tiedosto)
* Ohjaustapojen kehittäminen
* Skriptin asennuksen helpottaminen (saisiko helpommaksi jos jakaa muutamaan osaan?) 
* README:n kehitystä
* "Buildauksen" kehittämistä - tiedostojen parempi minimointi ja kommenttien poisto tuotantoskriptistä
* Englannin kieli + tuki muille maille?
* `shelly-porssisahko.js`-tiedoston minimointi?

## Ominaisuudet

* Skripti pyörittää shellyn sisällä omaa web-serveriä käyttöliittymää varten
* Kolme ohjaustapaa: käsiohjaus, hintaraja tai halvimmat tunnit
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

## Wifi-verkon asetukset

Tämän voi tehdä myös Shellyn omalla hallintapaneelilla.

1. Avaa [http://192.168.33.1/script/1/porssi](http://192.168.33.1/script/1/porssi)
2. Siirry Wifi-välilehteen
3. Aseta Wifi päälle, klikkaa `Valitse listalta`-painiketta. Skripti hakee saatavilla olevat verkot.
4. Valitse haluamasi verkko ilmestyvästä alasvetovalikosta. Syötä myös mahdollinen salasana.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/e69554a6-168b-4fd9-b488-433c7c04664d)

5. Tallenna asetukset. Shelly yrittää yhdistää uuteen verkkoon.

Sivu vaatii tällä hetkellä päivityksen, jotta tilatiedot päivittyvät. Päivittämisen jälkeen näet Shellyn IP-osoitteen, mikäli yhdistäminen onnistui.

![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/ca4cdb1a-b629-44a5-8c31-cea267468a77)

Pörssisähkön käyttöliittymä on saatavilla myös tässä verkossa, eli ylläolevassa tilanteessa hallintaan pääsee `Kotiverkko`-verkossa osoitteella [http://192.168.237.118/script/1/porssi](http://192.168.237.118/script/1/porssi).


## Pörssisähkön asetukset

Pörssisähköasetukset konfiguroidaan `Asetukset`-sivun alta. Ohjaustapoja on kolme: käsiohjaus, hintaraja ja halvimmat tunnit.

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

## Sähköinen kytkentä

Lue lisää häiriösuojauksesta [spot-hinta.fi -sivustolta](https://spot-hinta.fi/shelly/).

## Kehitysympäristö ja toiminta

*TODO* 

## In English

This is a script to control relay by Nordpool electric spot prices for Shelly products (especially Shelly Plus 1PM) with web-based user interface.

At the moment it's available only in Finnish and the spot price is queried for Finland. However other Nordpool countries would be trivial to add.

## Lisenssi / Lisence

GNU Affero General Public License v3.0 - [LICENSE.txt](https://github.com/jisotalo/shelly-porssisahko/blob/master/LICENSE.txt)

