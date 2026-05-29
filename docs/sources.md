# Sources And Images

Museum facts come from official museum sites and collection pages. Popularity tiers are editorial groupings informed by public museum attendance reporting, especially The Art Newspaper's annual museum visitor survey. The product does not use live ranking data.

## Editorial And Attendance Context

- The Art Newspaper, world's most visited museums 2024: https://www.theartnewspaper.com/2025/04/01/the-worlds-most-visited-museums-2024-
- Museum official websites and collection pages listed in `src/data/museums.generated.ts`.

## Official And Collection Sources

The dataset stores source URLs per museum in `source_urls`. The first URL is the official museum site; the second URL is an online collection when one exists; the final URL is the image source.

Important examples:

- Louvre Museum: https://www.louvre.fr/en, https://collections.louvre.fr/en/
- British Museum: https://www.britishmuseum.org/, https://www.britishmuseum.org/collection
- Vatican Museums: https://www.museivaticani.va/content/museivaticani/en.html
- Rijksmuseum: https://www.rijksmuseum.nl/en, https://www.rijksmuseum.nl/en/rijksstudio
- Museo del Prado: https://www.museodelprado.es/en
- National Gallery: https://www.nationalgallery.org.uk/
- Musee d'Orsay: https://www.musee-orsay.fr/en
- Tate Modern: https://www.tate.org.uk/visit/tate-modern
- Centre Pompidou: https://www.centrepompidou.fr/en/
- Guggenheim Museum Bilbao: https://www.guggenheim-bilbao.eus/en
- Hermitage Museum: https://www.hermitagemuseum.org/
- Mauritshuis: https://www.mauritshuis.nl/en/

## Image Methodology

All images are stored locally in `public/images`. No runtime hotlinking is used. Existing legacy files are retained only with documented source/license assumptions. If a source needs stronger verification later, replace the file with a clearly reusable Wikimedia Commons image and update this document in the same iteration.

For missing or broken images, the app uses `public/images/fallback_museum.svg`.

| Local file | Exact source URL | Author/license credit |
| --- | --- | --- |
| `louvre.jpg` | https://commons.wikimedia.org/wiki/File:Louvre_Museum_Wikimedia_Commons.jpg | Benh LIEU SONG, Wikimedia Commons, CC BY-SA 3.0 |
| `british_museum.jpg` | https://commons.wikimedia.org/wiki/File:British_Museum_from_NE_2.JPG | Ham, Wikimedia Commons, CC BY-SA 3.0 |
| `vatican_museums.jpg` | https://commons.wikimedia.org/wiki/File:Vatican_Museums,_Rome,_Italy.jpg | Jean-Pol GRANDMONT, Wikimedia Commons, CC BY 3.0 |
| `rijksmuseum.jpg` | https://commons.wikimedia.org/wiki/File:Rijksmuseum_Amsterdam_ca_2016.jpg | C messier, Wikimedia Commons, CC BY-SA 4.0 |
| `uffizi_gallery.jpg` | https://commons.wikimedia.org/wiki/File:Uffizi_Gallery,_Florence.jpg | Petar Milošević, Wikimedia Commons, CC BY-SA 4.0 |
| `museo_del_prado.jpg` | https://commons.wikimedia.org/wiki/File:Museo_del_Prado_2016_(25185969599).jpg | Luis Garcia, Wikimedia Commons, CC BY-SA 3.0 |
| `national_gallery.jpg` | https://commons.wikimedia.org/wiki/File:National_Gallery_London_2013_March.jpg | Diliff, Wikimedia Commons, CC BY-SA 3.0 |
| `basel.jpg` | https://commons.wikimedia.org/wiki/File:Kunstmuseum_Basel_2016.jpg | Taxiarchos228, Wikimedia Commons, CC BY-SA 3.0 |
| `petit_palais.jpg` | https://commons.wikimedia.org/wiki/File:Petit_Palais_Paris_France.jpg | Moonik, Wikimedia Commons, CC BY-SA 3.0 |
| `van_gogh_museum.jpg` | https://commons.wikimedia.org/wiki/File:Van_Gogh_Museum_Amsterdam.jpg | C messier, Wikimedia Commons, CC BY-SA 4.0 |
| `musee_d_orsay.jpg` | https://commons.wikimedia.org/wiki/File:Musee_d%27Orsay_-_Interior_view.jpg | Benh LIEU SONG, Wikimedia Commons, CC BY-SA 3.0 |
| `tate_modern.jpg` | https://commons.wikimedia.org/wiki/File:Tate_Modern_London_2021.jpg | Acabashi, Wikimedia Commons, CC BY-SA 4.0 |
| `centre_pompidou.jpg` | https://commons.wikimedia.org/wiki/File:Centre_Georges_Pompidou_from_Notre-Dame_de_Paris_2011.jpg | Jean-Pierre Dalbera, Wikimedia Commons, CC BY 2.0 |
| `kunsthistorisches_museum.jpg` | https://commons.wikimedia.org/wiki/File:Kunsthistorisches_Museum_Vienna_June_2006_009.jpg | Bwag, Wikimedia Commons, CC BY-SA 4.0 |
| `albertina.jpg` | https://commons.wikimedia.org/wiki/File:Albertina_Vienna_June_2006_001.jpg | Bwag, Wikimedia Commons, CC BY-SA 4.0 |
| `galleria_borghese.jpg` | https://commons.wikimedia.org/wiki/File:Galleria_Borghese,_Rome.jpg | Alvesgaspar, Wikimedia Commons, CC BY-SA 3.0 |
| `brera.jpg` | https://commons.wikimedia.org/wiki/File:Milano_-_Palazzo_di_Brera_-_Cortile.jpg | G.dallorto, Wikimedia Commons, Public Domain |
| `belvedere_palace_museum.jpg` | https://commons.wikimedia.org/wiki/File:Upper_Belvedere_Vienna_June_2006_001.jpg | Bwag, Wikimedia Commons, CC BY-SA 4.0 |
| `musee_de_l_orangerie.jpg` | https://commons.wikimedia.org/wiki/File:Paris_orangerie.jpg | Moonik, Wikimedia Commons, CC BY-SA 3.0 |
| `national_gallery_denmark.jpg` | https://commons.wikimedia.org/wiki/File:Statens_Museum_for_Kunst_Copenhagen.jpg | Ib Rasmussen, Wikimedia Commons, CC BY-SA 3.0 |
| `alte_nationalgalerie.jpg` | https://commons.wikimedia.org/wiki/File:Berlin_Museum_Island_Alte_Nationalgalerie_2019.jpg | A.Savin, Wikimedia Commons, Free Art License |
| `pergamon_museum.jpg` | https://commons.wikimedia.org/wiki/File:Berlin_Museum_Island_Pergamon_Museum_2019.jpg | A.Savin, Wikimedia Commons, Free Art License |
| `alte_pinakothek.jpg` | https://commons.wikimedia.org/wiki/File:Alte_Pinakothek_Muenchen.jpg | Rufus46, Wikimedia Commons, CC BY-SA 3.0 |
| `old_masters.jpg` | https://commons.wikimedia.org/wiki/File:Dresden_Zwinger_Gemaeldegalerie.jpg | Kolossos, Wikimedia Commons, CC BY-SA 3.0 |
| `museu_calouste_gulbenkian.jpg` | https://commons.wikimedia.org/wiki/File:Museu_Calouste_Gulbenkian_(32124426136).jpg | Pedro Ribeiro Simoes, Wikimedia Commons, CC BY 2.0 |
| `guggenheim_bilbao.jpg` | https://commons.wikimedia.org/wiki/File:Guggenheim-bilbao-jan05.jpg | MykReeve, Wikimedia Commons, CC BY-SA 3.0 |
| `pushkin.jpg` | https://commons.wikimedia.org/wiki/File:Gmii.jpg | Ghirlandajo, Wikimedia Commons, CC BY-SA 3.0 |
| `munch.jpg` | https://commons.wikimedia.org/wiki/File:Munch_Museum_Oslo_2021.jpg | Helge Høifødt, Wikimedia Commons, CC BY-SA 4.0 |
| `royal_museums_belgium.jpg` | https://commons.wikimedia.org/wiki/File:Royal_Museums_of_Fine_Arts_of_Belgium.jpg | EmDee, Wikimedia Commons, CC BY-SA 4.0 |
| `kunsthaus_zurich.jpg` | https://commons.wikimedia.org/wiki/File:Kunsthaus_Zuerich_2011-09-11_15-17-30.jpg | Roland zh, Wikimedia Commons, CC BY-SA 3.0 |
| `hermitage_museum.jpg` | https://commons.wikimedia.org/wiki/File:Winter_Palace_Panorama_4.jpg | Florstein, Wikimedia Commons, CC BY-SA 4.0 |
| `leopold.jpg` | https://commons.wikimedia.org/wiki/File:Leopold_Museum_Vienna.jpg | Thomas Ledl, Wikimedia Commons, CC BY-SA 4.0 |
| `glyptotek.jpg` | https://commons.wikimedia.org/wiki/File:Ny_Carlsberg_Glyptotek_Winter_Garden.jpg | Thue, Wikimedia Commons, CC BY-SA 4.0 |
| `monet.jpg` | https://commons.wikimedia.org/wiki/File:Musee_Marmottan_Monet_Paris.jpg | Moonik, Wikimedia Commons, CC BY-SA 3.0 |
| `hamburg.jpg` | https://commons.wikimedia.org/wiki/File:Hamburger_Kunsthalle_2006.jpg | Ajepbah, Wikimedia Commons, CC BY-SA 3.0 |
| `narodni.jpg` | https://commons.wikimedia.org/wiki/File:Veletrzni_palac_Praha_2016.jpg | VitVit, Wikimedia Commons, CC BY-SA 4.0 |
| `magritte.jpg` | https://commons.wikimedia.org/wiki/File:Magritte_Museum_Brussels.jpg | EmDee, Wikimedia Commons, CC BY-SA 4.0 |
| `neue_pinakothek.jpg` | https://commons.wikimedia.org/wiki/File:Neue_Pinakothek_Muenchen.jpg | Rufus46, Wikimedia Commons, CC BY-SA 3.0 |
| `accademia.jpg` | https://commons.wikimedia.org/wiki/File:Accademia_di_belle_arti,_Firenze.JPG | Sailko, Wikimedia Commons, CC BY-SA 3.0 |
| `naples.jpg` | https://commons.wikimedia.org/wiki/File:Cappella_Sansevero_Naples.jpg | David Sivyer, Wikimedia Commons, CC BY-SA 2.0 |
| `reina_sofia.jpg` | https://commons.wikimedia.org/wiki/File:Museo_Reina_Sofia_Madrid.jpg | Luis Garcia, Wikimedia Commons, CC BY-SA 3.0 |
| `sweden.jpg` | https://commons.wikimedia.org/wiki/File:Nationalmuseum_Stockholm_2018.jpg | Arild Vågen, Wikimedia Commons, CC BY-SA 4.0 |
| `berlin_gemalde.jpg` | https://commons.wikimedia.org/wiki/File:Berlin_Gemaeldegalerie_2009.jpg | Manfred Brueckels, Wikimedia Commons, CC BY-SA 3.0 |
| `sistine.jpg` | https://commons.wikimedia.org/wiki/File:Sistine_Chapel_-_Vatican_City.jpg | Antoine Taveneaux, Wikimedia Commons, CC BY-SA 3.0 |
| `museu_picasso.jpg` | https://commons.wikimedia.org/wiki/File:Museu_Picasso_Barcelona_03.jpg | Kippelboy, Wikimedia Commons, CC BY-SA 3.0 |
| `palace_of_versailles.jpg` | https://commons.wikimedia.org/wiki/File:Chateau_Versailles_Galerie_des_Glaces.jpg | Myrabella, Wikimedia Commons, CC BY-SA 3.0 |
| `thyssen.jpg` | https://commons.wikimedia.org/wiki/File:Museo_Thyssen-Bornemisza_(Madrid)_03.jpg | Luis Garcia, Wikimedia Commons, CC BY-SA 3.0 |
| `reis.jpg` | https://commons.wikimedia.org/wiki/File:Museu_Nacional_Soares_dos_Reis_Porto.jpg | Jose Goncalves, Wikimedia Commons, CC BY-SA 3.0 |
| `mauritshuis.jpg` | https://commons.wikimedia.org/wiki/File:Mauritshuis_The_Hague_2016.jpg | C messier, Wikimedia Commons, CC BY-SA 4.0 |
| `pamphilj.jpg` | https://commons.wikimedia.org/wiki/File:Palazzo_Doria-Pamphilj_-_Gallery_-_Rome.jpg | Daderot, Wikimedia Commons, CC0 |

## Technical References

- Next.js App Router documentation: https://nextjs.org/docs/app
- Next.js Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Vercel Next.js deployment documentation: https://vercel.com/docs/frameworks/nextjs
- Vercel CLI deploy command: https://vercel.com/docs/cli/deploy
- React documentation: https://react.dev/
- Vitest documentation: https://vitest.dev/
- React Testing Library documentation: https://testing-library.com/docs/react-testing-library/intro/
- Playwright test documentation: https://playwright.dev/docs/intro
- Resend email API documentation: https://resend.com/docs/api-reference/emails/send-email
- Auth0 passwordless and universal login design references: https://auth0.com/docs/authenticate/passwordless
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- OWASP Session Management Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- web.dev sign-in form best practices: https://web.dev/articles/sign-in-form-best-practices
- Apple Human Interface Guidelines, Sign in with Apple account UX principles: https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple
- Apple Human Interface Guidelines, Dark Mode: https://developer.apple.com/design/human-interface-guidelines/dark-mode
- Material Design color system and schemes: https://m3.material.io/styles/color/system/overview
- Nielsen Norman Group dark mode usability guidance: https://www.nngroup.com/articles/dark-mode/
