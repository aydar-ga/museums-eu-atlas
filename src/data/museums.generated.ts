export const categories = [
  "Fine Art",
  "Modern and Contemporary Art",
  "Decorative Arts and Design",
  "Archaeology and Antiquities",
  "Historic Palace and Collection",
  "Artist Museum",
  "Museum Complex"
] as const;

export const popularityTiers = [
  "Global icons",
  "Major European classics",
  "Focused collections"
] as const;

export const museums = [
  {
    "slug": "louvre-museum",
    "name": "Louvre Museum",
    "city": "Paris",
    "country": "France",
    "category": "Fine Art",
    "themes": [
      "Old masters",
      "Antiquities",
      "French royal collections"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "The Louvre anchors the European museum canon with Egyptian, Greek, Roman, Islamic, and European art inside a former royal palace.",
    "whyVisit": "It is the clearest single stop for understanding how royal collecting, archaeology, and national museum culture shaped the modern art museum.",
    "highlights": [
      "Mona Lisa",
      "Venus de Milo",
      "Winged Victory of Samothrace"
    ],
    "officialUrl": "https://www.louvre.fr/en",
    "onlineUrl": "https://collections.louvre.fr/en/",
    "image": "louvre.jpg",
    "imageAlt": "The Louvre Pyramid and palace courtyard in Paris",
    "imageCredit": "Benh LIEU SONG, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://www.louvre.fr/en",
      "https://collections.louvre.fr/en/",
      "https://commons.wikimedia.org/wiki/File:Louvre_Museum_Wikimedia_Commons.jpg"
    ]
  },
  {
    "slug": "british-museum",
    "name": "British Museum",
    "city": "London",
    "country": "United Kingdom",
    "category": "Museum Complex",
    "themes": [
      "World cultures",
      "Archaeology",
      "Ancient history"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "A major world museum built around global material culture, ancient civilizations, manuscripts, coins, prints, and archaeological collections.",
    "whyVisit": "The British Museum gives first-time visitors a broad comparative route through human history, while also raising useful questions about collecting, empire, and provenance.",
    "highlights": [
      "Rosetta Stone",
      "Parthenon sculptures",
      "Assyrian palace reliefs"
    ],
    "officialUrl": "https://www.britishmuseum.org/",
    "onlineUrl": "https://www.britishmuseum.org/collection",
    "image": "british_museum.jpg",
    "imageAlt": "The neoclassical facade of the British Museum in London",
    "imageCredit": "Ham, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://www.britishmuseum.org/",
      "https://www.britishmuseum.org/collection",
      "https://commons.wikimedia.org/wiki/File:British_Museum_from_NE_2.JPG"
    ]
  },
  {
    "slug": "vatican-museums",
    "name": "Vatican Museums",
    "city": "Vatican City",
    "country": "Vatican City",
    "category": "Museum Complex",
    "themes": [
      "Renaissance",
      "Papacy",
      "Classical sculpture"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "The Vatican Museums connect papal patronage, classical sculpture, Renaissance fresco cycles, and the ceremonial geography of Vatican City.",
    "whyVisit": "Few museum routes combine architecture, painting, sculpture, and sacred history so densely, from antiquity to Michelangelo.",
    "highlights": [
      "Sistine Chapel",
      "Raphael Rooms",
      "Laocoon Group"
    ],
    "officialUrl": "https://www.museivaticani.va/content/museivaticani/en.html",
    "onlineUrl": "https://www.museivaticani.va/content/museivaticani/en/collezioni.html",
    "image": "vatican_museums.jpg",
    "imageAlt": "Entrance area of the Vatican Museums",
    "imageCredit": "Jean-Pol GRANDMONT, Wikimedia Commons, CC BY 3.0",
    "sourceUrls": [
      "https://www.museivaticani.va/content/museivaticani/en.html",
      "https://www.museivaticani.va/content/museivaticani/en/collezioni.html",
      "https://commons.wikimedia.org/wiki/File:Vatican_Museums,_Rome,_Italy.jpg"
    ]
  },
  {
    "slug": "rijksmuseum",
    "name": "Rijksmuseum",
    "city": "Amsterdam",
    "country": "Netherlands",
    "category": "Fine Art",
    "themes": [
      "Dutch Golden Age",
      "Design",
      "National collection"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "The Dutch national museum presents art, craft, and history with a globally important concentration of seventeenth-century painting.",
    "whyVisit": "It is the essential Amsterdam art stop for seeing Rembrandt, Vermeer, domestic interiors, ships, silver, and the civic culture behind them.",
    "highlights": [
      "The Night Watch",
      "The Milkmaid",
      "Doll's houses and Delftware"
    ],
    "officialUrl": "https://www.rijksmuseum.nl/en",
    "onlineUrl": "https://www.rijksmuseum.nl/en/rijksstudio",
    "image": "rijksmuseum.jpg",
    "imageAlt": "The Rijksmuseum building in Amsterdam",
    "imageCredit": "C messier, Wikimedia Commons, CC BY-SA 4.0",
    "sourceUrls": [
      "https://www.rijksmuseum.nl/en",
      "https://www.rijksmuseum.nl/en/rijksstudio",
      "https://commons.wikimedia.org/wiki/File:Rijksmuseum_Amsterdam_ca_2016.jpg"
    ]
  },
  {
    "slug": "uffizi-gallery",
    "name": "Uffizi Gallery",
    "city": "Florence",
    "country": "Italy",
    "category": "Fine Art",
    "themes": [
      "Renaissance",
      "Medici collecting",
      "Italian painting"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "The Uffizi is one of the defining museums for Renaissance painting, built from Medici collections in the historic center of Florence.",
    "whyVisit": "It lets visitors follow early Renaissance experiments through Botticelli, Leonardo, Raphael, Michelangelo, and Caravaggio in their Tuscan context.",
    "highlights": [
      "Birth of Venus",
      "Primavera",
      "Medici portraits"
    ],
    "officialUrl": "https://www.uffizi.it/en/the-uffizi",
    "onlineUrl": "https://www.uffizi.it/en/online-exhibitions",
    "image": "uffizi_gallery.jpg",
    "imageAlt": "The Uffizi Gallery courtyard in Florence",
    "imageCredit": "Petar Milošević, Wikimedia Commons, CC BY-SA 4.0",
    "sourceUrls": [
      "https://www.uffizi.it/en/the-uffizi",
      "https://www.uffizi.it/en/online-exhibitions",
      "https://commons.wikimedia.org/wiki/File:Uffizi_Gallery,_Florence.jpg"
    ]
  },
  {
    "slug": "museo-del-prado",
    "name": "Museo del Prado",
    "city": "Madrid",
    "country": "Spain",
    "category": "Fine Art",
    "themes": [
      "Spanish painting",
      "Royal collections",
      "Old masters"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Spain's flagship art museum holds one of the world's strongest Old Master collections, especially Spanish, Flemish, and Italian painting.",
    "whyVisit": "The Prado gives Madrid its classic art route through Velazquez, Goya, El Greco, Bosch, Titian, and Rubens.",
    "highlights": [
      "Las Meninas",
      "The Garden of Earthly Delights",
      "Goya's Black Paintings"
    ],
    "officialUrl": "https://www.museodelprado.es/en",
    "onlineUrl": "https://www.museodelprado.es/en/the-collection",
    "image": "museo_del_prado.jpg",
    "imageAlt": "Museo del Prado facade in Madrid",
    "imageCredit": "Luis Garcia, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://www.museodelprado.es/en",
      "https://www.museodelprado.es/en/the-collection",
      "https://commons.wikimedia.org/wiki/File:Museo_del_Prado_2016_(25185969599).jpg"
    ]
  },
  {
    "slug": "national-gallery-london",
    "name": "National Gallery",
    "city": "London",
    "country": "United Kingdom",
    "category": "Fine Art",
    "themes": [
      "European painting",
      "Old masters",
      "Public collection"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "The National Gallery presents a compact but deep survey of Western European painting from the thirteenth to early twentieth century.",
    "whyVisit": "It is one of Europe's most efficient masterpieces-per-hour museums, with free access and a strong Trafalgar Square setting.",
    "highlights": [
      "Van Eyck's Arnolfini Portrait",
      "Turner's Fighting Temeraire",
      "Van Gogh's Sunflowers"
    ],
    "officialUrl": "https://www.nationalgallery.org.uk/",
    "onlineUrl": "https://www.nationalgallery.org.uk/paintings",
    "image": "national_gallery.jpg",
    "imageAlt": "The National Gallery on Trafalgar Square in London",
    "imageCredit": "Diliff, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://www.nationalgallery.org.uk/",
      "https://www.nationalgallery.org.uk/paintings",
      "https://commons.wikimedia.org/wiki/File:National_Gallery_London_2013_March.jpg"
    ]
  },
  {
    "slug": "kunstmuseum-basel",
    "name": "Kunstmuseum Basel",
    "city": "Basel",
    "country": "Switzerland",
    "category": "Fine Art",
    "themes": [
      "Public art collection",
      "Modernism",
      "Swiss art"
    ],
    "popularityTier": "Major European classics",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Kunstmuseum Basel is rooted in one of Europe's oldest public art collections and spans early painting, modernism, and contemporary art.",
    "whyVisit": "Basel offers a museum route with scholarly depth and strong connections between civic collecting, Holbein, modernism, and the art fair city.",
    "highlights": [
      "Holbein collection",
      "Picasso and modernism",
      "Gegenwart contemporary galleries"
    ],
    "officialUrl": "https://kunstmuseumbasel.ch/en",
    "onlineUrl": "https://sammlung.kunstmuseumbasel.ch/en/",
    "image": "basel.jpg",
    "imageAlt": "Kunstmuseum Basel main building",
    "imageCredit": "Taxiarchos228, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://kunstmuseumbasel.ch/en",
      "https://sammlung.kunstmuseumbasel.ch/en/",
      "https://commons.wikimedia.org/wiki/File:Kunstmuseum_Basel_2016.jpg"
    ]
  },
  {
    "slug": "petit-palais",
    "name": "Petit Palais",
    "city": "Paris",
    "country": "France",
    "category": "Fine Art",
    "themes": [
      "Paris collections",
      "Decorative arts",
      "Belle Epoque"
    ],
    "popularityTier": "Focused collections",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "The Petit Palais, built for the 1900 Exposition Universelle, houses the City of Paris fine arts collection in a lavish Beaux-Arts building.",
    "whyVisit": "It is a quieter Paris museum with strong decorative arts, paintings, sculpture, and an atmospheric courtyard close to the Champs-Elysees.",
    "highlights": [
      "Beaux-Arts architecture",
      "Nineteenth-century painting",
      "Decorative arts"
    ],
    "officialUrl": "https://www.petitpalais.paris.fr/en",
    "onlineUrl": "https://www.petitpalais.paris.fr/en/collections",
    "image": "petit_palais.jpg",
    "imageAlt": "The Petit Palais entrance in Paris",
    "imageCredit": "Moonik, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://www.petitpalais.paris.fr/en",
      "https://www.petitpalais.paris.fr/en/collections",
      "https://commons.wikimedia.org/wiki/File:Petit_Palais_Paris_France.jpg"
    ]
  },
  {
    "slug": "van-gogh-museum",
    "name": "Van Gogh Museum",
    "city": "Amsterdam",
    "country": "Netherlands",
    "category": "Artist Museum",
    "themes": [
      "Van Gogh",
      "Post-Impressionism",
      "Letters"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "The Van Gogh Museum holds the largest collection of works by Vincent van Gogh and frames them through family, letters, and artistic networks.",
    "whyVisit": "It turns a famous name into a coherent life-and-work route, making Van Gogh's experiments and influences legible without losing emotional force.",
    "highlights": [
      "Sunflowers",
      "Almond Blossom",
      "Van Gogh letters"
    ],
    "officialUrl": "https://www.vangoghmuseum.nl/en",
    "onlineUrl": "https://www.vangoghmuseum.nl/en/collection",
    "image": "van_gogh_museum.jpg",
    "imageAlt": "The Van Gogh Museum in Amsterdam",
    "imageCredit": "C messier, Wikimedia Commons, CC BY-SA 4.0",
    "sourceUrls": [
      "https://www.vangoghmuseum.nl/en",
      "https://www.vangoghmuseum.nl/en/collection",
      "https://commons.wikimedia.org/wiki/File:Van_Gogh_Museum_Amsterdam.jpg"
    ]
  },
  {
    "slug": "musee-d-orsay",
    "name": "Musee d'Orsay",
    "city": "Paris",
    "country": "France",
    "category": "Fine Art",
    "themes": [
      "Impressionism",
      "Post-Impressionism",
      "Former railway station"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Musee d'Orsay gathers nineteenth-century French art in a converted railway station, with a world-leading Impressionist collection.",
    "whyVisit": "It is the best single museum for the shift from academic painting to modern life, Impressionism, symbolism, and early modern sculpture.",
    "highlights": [
      "Manet and Degas",
      "Monet and Renoir",
      "The station clock"
    ],
    "officialUrl": "https://www.musee-orsay.fr/en",
    "onlineUrl": "https://www.musee-orsay.fr/en/collections",
    "image": "musee_d_orsay.jpg",
    "imageAlt": "Interior of Musee d'Orsay with the large station clock",
    "imageCredit": "Benh LIEU SONG, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://www.musee-orsay.fr/en",
      "https://www.musee-orsay.fr/en/collections",
      "https://commons.wikimedia.org/wiki/File:Musee_d%27Orsay_-_Interior_view.jpg"
    ]
  },
  {
    "slug": "tate-modern",
    "name": "Tate Modern",
    "city": "London",
    "country": "United Kingdom",
    "category": "Modern and Contemporary Art",
    "themes": [
      "Modern art",
      "Contemporary art",
      "Industrial architecture"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Tate Modern places international modern and contemporary art inside the former Bankside Power Station on the Thames.",
    "whyVisit": "It is London's most accessible route into twentieth- and twenty-first-century art, with a building that remains part of the experience.",
    "highlights": [
      "Turbine Hall",
      "International modern art",
      "Contemporary installations"
    ],
    "officialUrl": "https://www.tate.org.uk/visit/tate-modern",
    "onlineUrl": "https://www.tate.org.uk/art",
    "image": "tate_modern.jpg",
    "imageAlt": "Tate Modern and the Millennium Bridge in London",
    "imageCredit": "Acabashi, Wikimedia Commons, CC BY-SA 4.0",
    "sourceUrls": [
      "https://www.tate.org.uk/visit/tate-modern",
      "https://www.tate.org.uk/art",
      "https://commons.wikimedia.org/wiki/File:Tate_Modern_London_2021.jpg"
    ]
  },
  {
    "slug": "centre-pompidou",
    "name": "Centre Pompidou",
    "city": "Paris",
    "country": "France",
    "category": "Modern and Contemporary Art",
    "themes": [
      "Modern art",
      "Contemporary art",
      "High-tech architecture"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Centre Pompidou combines a major modern and contemporary art collection with a public library and landmark inside-out architecture.",
    "whyVisit": "It is the essential Paris counterpoint to the Louvre and Orsay, tracking modernism, postwar experimentation, design, and contemporary practice.",
    "highlights": [
      "High-tech facade",
      "National modern art collection",
      "Kandinsky and postwar art"
    ],
    "officialUrl": "https://www.centrepompidou.fr/en/",
    "onlineUrl": "https://www.centrepompidou.fr/en/collection",
    "image": "centre_pompidou.jpg",
    "imageAlt": "Exterior escalators and colored pipes of Centre Pompidou",
    "imageCredit": "Jean-Pierre Dalbera, Wikimedia Commons, CC BY 2.0",
    "sourceUrls": [
      "https://www.centrepompidou.fr/en/",
      "https://www.centrepompidou.fr/en/collection",
      "https://commons.wikimedia.org/wiki/File:Centre_Georges_Pompidou_from_Notre-Dame_de_Paris_2011.jpg"
    ]
  },
  {
    "slug": "kunsthistorisches-museum",
    "name": "Kunsthistorisches Museum",
    "city": "Vienna",
    "country": "Austria",
    "category": "Fine Art",
    "themes": [
      "Habsburg collections",
      "Old masters",
      "Antiquities"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Vienna's Kunsthistorisches Museum presents Habsburg collecting at imperial scale, from antiquities to Bruegel, Titian, Velazquez, and decorative arts.",
    "whyVisit": "The building and collection together show how dynastic taste, court culture, and European painting history can form one museum experience.",
    "highlights": [
      "Bruegel collection",
      "Picture Gallery",
      "Kunstkammer Vienna"
    ],
    "officialUrl": "https://www.khm.at/en/",
    "onlineUrl": "https://www.khm.at/en/explore/offers/digital-museum/",
    "image": "kunsthistorisches_museum.jpg",
    "imageAlt": "Kunsthistorisches Museum facade in Vienna",
    "imageCredit": "Bwag, Wikimedia Commons, CC BY-SA 4.0",
    "sourceUrls": [
      "https://www.khm.at/en/",
      "https://www.khm.at/en/explore/offers/digital-museum/",
      "https://commons.wikimedia.org/wiki/File:Kunsthistorisches_Museum_Vienna_June_2006_009.jpg"
    ]
  },
  {
    "slug": "albertina",
    "name": "Albertina",
    "city": "Vienna",
    "country": "Austria",
    "category": "Fine Art",
    "themes": [
      "Graphic arts",
      "Modern art",
      "Habsburg palace"
    ],
    "popularityTier": "Major European classics",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "The Albertina is a Vienna museum known for one of the world's great graphic collections, alongside modern art and historic palace rooms.",
    "whyVisit": "It gives a different Vienna rhythm from the large imperial museums: drawings, prints, modern painting, and intimate collection history.",
    "highlights": [
      "Duerer's Young Hare",
      "Monet to Picasso",
      "Habsburg state rooms"
    ],
    "officialUrl": "https://www.albertina.at/en/",
    "onlineUrl": "https://sammlungenonline.albertina.at/",
    "image": "albertina.jpg",
    "imageAlt": "Albertina museum entrance in Vienna",
    "imageCredit": "Bwag, Wikimedia Commons, CC BY-SA 4.0",
    "sourceUrls": [
      "https://www.albertina.at/en/",
      "https://sammlungenonline.albertina.at/",
      "https://commons.wikimedia.org/wiki/File:Albertina_Vienna_June_2006_001.jpg"
    ]
  },
  {
    "slug": "galleria-borghese",
    "name": "Galleria Borghese",
    "city": "Rome",
    "country": "Italy",
    "category": "Fine Art",
    "themes": [
      "Baroque sculpture",
      "Roman villa",
      "Borghese collection"
    ],
    "popularityTier": "Major European classics",
    "familyFriendly": false,
    "hasOnlineCollection": true,
    "summary": "Galleria Borghese is a concentrated Roman villa museum with Bernini sculptures, Caravaggio paintings, and a powerful aristocratic collection setting.",
    "whyVisit": "Its timed-entry scale makes it one of Europe's most intense small museum experiences, especially for Baroque sculpture and theatrical display.",
    "highlights": [
      "Bernini's Apollo and Daphne",
      "Caravaggio paintings",
      "Canova's Pauline Bonaparte"
    ],
    "officialUrl": "https://galleriaborghese.beniculturali.it/en/",
    "onlineUrl": "https://galleriaborghese.beniculturali.it/en/the-collection/",
    "image": "galleria_borghese.jpg",
    "imageAlt": "Facade of Galleria Borghese in Rome",
    "imageCredit": "Alvesgaspar, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://galleriaborghese.beniculturali.it/en/",
      "https://galleriaborghese.beniculturali.it/en/the-collection/",
      "https://commons.wikimedia.org/wiki/File:Galleria_Borghese,_Rome.jpg"
    ]
  },
  {
    "slug": "pinacoteca-di-brera",
    "name": "Pinacoteca di Brera",
    "city": "Milan",
    "country": "Italy",
    "category": "Fine Art",
    "themes": [
      "Italian painting",
      "Milan",
      "Napoleonic museum"
    ],
    "popularityTier": "Major European classics",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Pinacoteca di Brera is Milan's historic picture gallery, focused on Italian painting and the cultural institutions of the Brera district.",
    "whyVisit": "It balances Milan's design and fashion reputation with a serious art route through Mantegna, Bellini, Raphael, Caravaggio, and Hayez.",
    "highlights": [
      "The Kiss by Hayez",
      "Dead Christ by Mantegna",
      "Raphael's Marriage of the Virgin"
    ],
    "officialUrl": "https://pinacotecabrera.org/en/",
    "onlineUrl": "https://pinacotecabrera.org/en/collezione-online/",
    "image": "brera.jpg",
    "imageAlt": "Courtyard of the Brera Palace in Milan",
    "imageCredit": "G.dallorto, Wikimedia Commons, Public Domain",
    "sourceUrls": [
      "https://pinacotecabrera.org/en/",
      "https://pinacotecabrera.org/en/collezione-online/",
      "https://commons.wikimedia.org/wiki/File:Milano_-_Palazzo_di_Brera_-_Cortile.jpg"
    ]
  },
  {
    "slug": "belvedere-palace-museum",
    "name": "Belvedere Palace Museum",
    "city": "Vienna",
    "country": "Austria",
    "category": "Historic Palace and Collection",
    "themes": [
      "Austrian art",
      "Secession",
      "Baroque palace"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "The Belvedere combines Baroque palace architecture with Austrian art from the Middle Ages to Klimt, Schiele, and the Vienna Secession.",
    "whyVisit": "It is the main Vienna stop for Klimt and for seeing modern Austrian art inside a palace-and-garden setting.",
    "highlights": [
      "Klimt's The Kiss",
      "Upper Belvedere",
      "Schiele and Kokoschka"
    ],
    "officialUrl": "https://www.belvedere.at/en",
    "onlineUrl": "https://sammlung.belvedere.at/",
    "image": "belvedere_palace_museum.jpg",
    "imageAlt": "Upper Belvedere palace and reflecting pool in Vienna",
    "imageCredit": "Bwag, Wikimedia Commons, CC BY-SA 4.0",
    "sourceUrls": [
      "https://www.belvedere.at/en",
      "https://sammlung.belvedere.at/",
      "https://commons.wikimedia.org/wiki/File:Upper_Belvedere_Vienna_June_2006_001.jpg"
    ]
  },
  {
    "slug": "musee-de-l-orangerie",
    "name": "Musee de l'Orangerie",
    "city": "Paris",
    "country": "France",
    "category": "Fine Art",
    "themes": [
      "Monet",
      "Impressionism",
      "School of Paris"
    ],
    "popularityTier": "Major European classics",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Musee de l'Orangerie is centered on Monet's panoramic Water Lilies rooms and a concise collection of early twentieth-century painting.",
    "whyVisit": "It is one of Paris's best small museums, offering a calm, focused encounter with late Monet and the Walter-Guillaume collection.",
    "highlights": [
      "Water Lilies rooms",
      "Renoir and Cezanne",
      "Soutine and Modigliani"
    ],
    "officialUrl": "https://www.musee-orangerie.fr/en",
    "onlineUrl": "https://www.musee-orangerie.fr/en/collections",
    "image": "musee_de_l_orangerie.jpg",
    "imageAlt": "Musee de l'Orangerie in the Tuileries Garden",
    "imageCredit": "Moonik, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://www.musee-orangerie.fr/en",
      "https://www.musee-orangerie.fr/en/collections",
      "https://commons.wikimedia.org/wiki/File:Paris_orangerie.jpg"
    ]
  },
  {
    "slug": "national-gallery-of-denmark",
    "name": "National Gallery of Denmark",
    "city": "Copenhagen",
    "country": "Denmark",
    "category": "Fine Art",
    "themes": [
      "Danish art",
      "European art",
      "Nordic modernism"
    ],
    "popularityTier": "Major European classics",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "SMK, the National Gallery of Denmark, combines Danish and European art with a strong public collection and modern extension.",
    "whyVisit": "It is the best Copenhagen museum for connecting Danish Golden Age painting, European collections, and Nordic modern art.",
    "highlights": [
      "Danish Golden Age",
      "Matisse collection",
      "Royal collections"
    ],
    "officialUrl": "https://www.smk.dk/en/",
    "onlineUrl": "https://open.smk.dk/en",
    "image": "national_gallery_denmark.jpg",
    "imageAlt": "National Gallery of Denmark building in Copenhagen",
    "imageCredit": "Ib Rasmussen, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://www.smk.dk/en/",
      "https://open.smk.dk/en",
      "https://commons.wikimedia.org/wiki/File:Statens_Museum_for_Kunst_Copenhagen.jpg"
    ]
  },
  {
    "slug": "alte-nationalgalerie",
    "name": "Alte Nationalgalerie",
    "city": "Berlin",
    "country": "Germany",
    "category": "Fine Art",
    "themes": [
      "Nineteenth-century art",
      "Museum Island",
      "German Romanticism"
    ],
    "popularityTier": "Major European classics",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "The Alte Nationalgalerie on Museum Island focuses on nineteenth-century painting and sculpture, especially German Romanticism and Impressionism.",
    "whyVisit": "It gives Berlin a poetic, focused art route through Caspar David Friedrich, Menzel, and the European nineteenth century.",
    "highlights": [
      "Caspar David Friedrich",
      "Adolph Menzel",
      "Museum Island setting"
    ],
    "officialUrl": "https://www.smb.museum/en/museums-institutions/alte-nationalgalerie/home/",
    "onlineUrl": "https://recherche.smb.museum/",
    "image": "alte_nationalgalerie.jpg",
    "imageAlt": "Alte Nationalgalerie on Museum Island in Berlin",
    "imageCredit": "A.Savin, Wikimedia Commons, Free Art License",
    "sourceUrls": [
      "https://www.smb.museum/en/museums-institutions/alte-nationalgalerie/home/",
      "https://recherche.smb.museum/",
      "https://commons.wikimedia.org/wiki/File:Berlin_Museum_Island_Alte_Nationalgalerie_2019.jpg"
    ]
  },
  {
    "slug": "pergamon-museum",
    "name": "Pergamon Museum",
    "city": "Berlin",
    "country": "Germany",
    "category": "Archaeology and Antiquities",
    "themes": [
      "Ancient architecture",
      "Near East",
      "Islamic art"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "The Pergamon Museum is known for monumental archaeological reconstructions and collections from the ancient Near East and Islamic world.",
    "whyVisit": "Even during long renovation phases, it remains central to Berlin's museum identity because its objects explain architecture at imperial scale.",
    "highlights": [
      "Pergamon Altar context",
      "Ishtar Gate",
      "Market Gate of Miletus"
    ],
    "officialUrl": "https://www.smb.museum/en/museums-institutions/pergamonmuseum/home/",
    "onlineUrl": "https://recherche.smb.museum/",
    "image": "pergamon_museum.jpg",
    "imageAlt": "Pergamon Museum building on Museum Island in Berlin",
    "imageCredit": "A.Savin, Wikimedia Commons, Free Art License",
    "sourceUrls": [
      "https://www.smb.museum/en/museums-institutions/pergamonmuseum/home/",
      "https://recherche.smb.museum/",
      "https://commons.wikimedia.org/wiki/File:Berlin_Museum_Island_Pergamon_Museum_2019.jpg"
    ]
  },
  {
    "slug": "alte-pinakothek",
    "name": "Alte Pinakothek",
    "city": "Munich",
    "country": "Germany",
    "category": "Fine Art",
    "themes": [
      "Old masters",
      "Wittelsbach collections",
      "European painting"
    ],
    "popularityTier": "Major European classics",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "The Alte Pinakothek is Munich's great Old Master gallery, built around the Bavarian royal collections and European painting to the eighteenth century.",
    "whyVisit": "It is one of Europe's strongest traditional picture galleries, especially for Rubens, Duerer, Raphael, and early German painting.",
    "highlights": [
      "Rubens collection",
      "Duerer self-portrait",
      "Italian and Flemish masters"
    ],
    "officialUrl": "https://www.pinakothek.de/en/alte-pinakothek",
    "onlineUrl": "https://www.sammlung.pinakothek.de/en/",
    "image": "alte_pinakothek.jpg",
    "imageAlt": "Alte Pinakothek building in Munich",
    "imageCredit": "Rufus46, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://www.pinakothek.de/en/alte-pinakothek",
      "https://www.sammlung.pinakothek.de/en/",
      "https://commons.wikimedia.org/wiki/File:Alte_Pinakothek_Muenchen.jpg"
    ]
  },
  {
    "slug": "old-masters-gallery-dresden",
    "name": "Old Masters Gallery",
    "city": "Dresden",
    "country": "Germany",
    "category": "Fine Art",
    "themes": [
      "Old masters",
      "Dresden collections",
      "Zwinger"
    ],
    "popularityTier": "Major European classics",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Dresden's Old Masters Gallery presents a celebrated European painting collection in the Zwinger museum complex.",
    "whyVisit": "It is worth the trip for Raphael, Vermeer, Rembrandt, and the way Dresden frames painting within a courtly architectural ensemble.",
    "highlights": [
      "Sistine Madonna",
      "Vermeer's Girl Reading a Letter",
      "Zwinger setting"
    ],
    "officialUrl": "https://gemaeldegalerie.skd.museum/en/",
    "onlineUrl": "https://skd-online-collection.skd.museum/",
    "image": "old_masters.jpg",
    "imageAlt": "Dresden Zwinger with the Old Masters Gallery",
    "imageCredit": "Kolossos, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://gemaeldegalerie.skd.museum/en/",
      "https://skd-online-collection.skd.museum/",
      "https://commons.wikimedia.org/wiki/File:Dresden_Zwinger_Gemaeldegalerie.jpg"
    ]
  },
  {
    "slug": "museu-calouste-gulbenkian",
    "name": "Museu Calouste Gulbenkian",
    "city": "Lisbon",
    "country": "Portugal",
    "category": "Fine Art",
    "themes": [
      "Private collection",
      "Decorative arts",
      "Modern art"
    ],
    "popularityTier": "Major European classics",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "The Gulbenkian Museum presents Calouste Gulbenkian's international collection and a modern art center within a garden campus in Lisbon.",
    "whyVisit": "It is Lisbon's strongest all-around art museum for visitors who want Egyptian, Islamic, European, Lalique, and Portuguese modern art together.",
    "highlights": [
      "Lalique collection",
      "Islamic art",
      "Modern Collection"
    ],
    "officialUrl": "https://gulbenkian.pt/museu/en/",
    "onlineUrl": "https://gulbenkian.pt/museu/en/collection/",
    "image": "museu_calouste_gulbenkian.jpg",
    "imageAlt": "Calouste Gulbenkian Museum building in Lisbon",
    "imageCredit": "Pedro Ribeiro Simoes, Wikimedia Commons, CC BY 2.0",
    "sourceUrls": [
      "https://gulbenkian.pt/museu/en/",
      "https://gulbenkian.pt/museu/en/collection/",
      "https://commons.wikimedia.org/wiki/File:Museu_Calouste_Gulbenkian_(32124426136).jpg"
    ]
  },
  {
    "slug": "guggenheim-museum-bilbao",
    "name": "Guggenheim Museum Bilbao",
    "city": "Bilbao",
    "country": "Spain",
    "category": "Modern and Contemporary Art",
    "themes": [
      "Contemporary art",
      "Architecture",
      "Urban regeneration"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Frank Gehry's Guggenheim Bilbao pairs contemporary art with one of the most influential museum buildings of the late twentieth century.",
    "whyVisit": "It remains a benchmark for how architecture, city identity, and contemporary museum programming can reshape a cultural destination.",
    "highlights": [
      "Gehry titanium building",
      "Puppy by Jeff Koons",
      "Large-scale installations"
    ],
    "officialUrl": "https://www.guggenheim-bilbao.eus/en",
    "onlineUrl": "https://www.guggenheim-bilbao.eus/en/the-collection",
    "image": "guggenheim_bilbao.jpg",
    "imageAlt": "Guggenheim Museum Bilbao titanium facade",
    "imageCredit": "MykReeve, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://www.guggenheim-bilbao.eus/en",
      "https://www.guggenheim-bilbao.eus/en/the-collection",
      "https://commons.wikimedia.org/wiki/File:Guggenheim-bilbao-jan05.jpg"
    ]
  },
  {
    "slug": "pushkin-museum",
    "name": "Pushkin Museum",
    "city": "Moscow",
    "country": "Russia",
    "category": "Fine Art",
    "themes": [
      "World art",
      "Antiquities",
      "Impressionism"
    ],
    "popularityTier": "Major European classics",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "The Pushkin Museum is Moscow's major world art museum, with antiquities, European painting, casts, education, and major exhibition programs.",
    "whyVisit": "It adds an important eastern European perspective to the list, connecting Moscow to ancient, European, and modern art histories.",
    "highlights": [
      "Main building on Volkhonka",
      "Impressionist and Post-Impressionist works",
      "Ancient and Egyptian collections"
    ],
    "officialUrl": "https://pushkinmuseum.art/",
    "onlineUrl": "https://pushkinmuseum.art/museum/collections/",
    "image": "pushkin.jpg",
    "imageAlt": "Main building of the Pushkin Museum in Moscow",
    "imageCredit": "Ghirlandajo, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://pushkinmuseum.art/",
      "https://pushkinmuseum.art/museum/collections/",
      "https://commons.wikimedia.org/wiki/File:Gmii.jpg"
    ]
  },
  {
    "slug": "munch-museum",
    "name": "Munch Museum",
    "city": "Oslo",
    "country": "Norway",
    "category": "Artist Museum",
    "themes": [
      "Edvard Munch",
      "Nordic modernism",
      "Oslo waterfront"
    ],
    "popularityTier": "Major European classics",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "The Munch Museum is dedicated to Edvard Munch and presents his work in depth within Oslo's contemporary waterfront museum district.",
    "whyVisit": "It turns a familiar image into a full artistic biography, from painting and prints to experiments, anxiety, landscape, and legacy.",
    "highlights": [
      "The Scream variants",
      "Munch prints",
      "Oslofjord views"
    ],
    "officialUrl": "https://www.munchmuseet.no/en/",
    "onlineUrl": "https://www.munchmuseet.no/en/our-collection/",
    "image": "munch.jpg",
    "imageAlt": "Munch Museum tower on Oslo waterfront",
    "imageCredit": "Helge Høifødt, Wikimedia Commons, CC BY-SA 4.0",
    "sourceUrls": [
      "https://www.munchmuseet.no/en/",
      "https://www.munchmuseet.no/en/our-collection/",
      "https://commons.wikimedia.org/wiki/File:Munch_Museum_Oslo_2021.jpg"
    ]
  },
  {
    "slug": "royal-museums-of-fine-arts-belgium",
    "name": "Royal Museums of Fine Arts of Belgium",
    "city": "Brussels",
    "country": "Belgium",
    "category": "Fine Art",
    "themes": [
      "Belgian art",
      "Old masters",
      "Surrealism"
    ],
    "popularityTier": "Major European classics",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "The Royal Museums of Fine Arts of Belgium bring together Old Masters, Belgian art, modern art, and dedicated Magritte collections in Brussels.",
    "whyVisit": "It is the strongest Brussels route for connecting Flemish painting, Belgian symbolism, and surrealism.",
    "highlights": [
      "Bruegel and Rubens",
      "Fin-de-siecle collections",
      "Magritte Museum connection"
    ],
    "officialUrl": "https://fine-arts-museum.be/en",
    "onlineUrl": "https://fine-arts-museum.be/en/the-collection",
    "image": "royal_museums_belgium.jpg",
    "imageAlt": "Royal Museums of Fine Arts of Belgium in Brussels",
    "imageCredit": "EmDee, Wikimedia Commons, CC BY-SA 4.0",
    "sourceUrls": [
      "https://fine-arts-museum.be/en",
      "https://fine-arts-museum.be/en/the-collection",
      "https://commons.wikimedia.org/wiki/File:Royal_Museums_of_Fine_Arts_of_Belgium.jpg"
    ]
  },
  {
    "slug": "kunsthaus-zurich",
    "name": "Kunsthaus Zurich",
    "city": "Zurich",
    "country": "Switzerland",
    "category": "Fine Art",
    "themes": [
      "Swiss art",
      "Modernism",
      "Private collections"
    ],
    "popularityTier": "Major European classics",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Kunsthaus Zurich combines Swiss art, European modernism, and major private collections in one of Switzerland's key art museums.",
    "whyVisit": "It is Zurich's main art anchor, valuable for Giacometti, Hodler, modern painting, and the debates around collection histories.",
    "highlights": [
      "Giacometti collection",
      "Hodler and Swiss art",
      "Modern extension"
    ],
    "officialUrl": "https://www.kunsthaus.ch/en/",
    "onlineUrl": "https://collection.kunsthaus.ch/en/",
    "image": "kunsthaus_zurich.jpg",
    "imageAlt": "Kunsthaus Zurich building facade",
    "imageCredit": "Roland zh, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://www.kunsthaus.ch/en/",
      "https://collection.kunsthaus.ch/en/",
      "https://commons.wikimedia.org/wiki/File:Kunsthaus_Zuerich_2011-09-11_15-17-30.jpg"
    ]
  },
  {
    "slug": "hermitage-museum",
    "name": "Hermitage Museum",
    "city": "Saint Petersburg",
    "country": "Russia",
    "category": "Museum Complex",
    "themes": [
      "Imperial palace",
      "World art",
      "Antiquities"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "The Hermitage is a vast museum complex centered on the Winter Palace, with major collections of European art, antiquities, and world cultures.",
    "whyVisit": "It shows the museum as palace, encyclopedia, and imperial collection at once, making it one of Europe's defining cultural landmarks.",
    "highlights": [
      "Winter Palace",
      "Rembrandt and Titian",
      "Antiquities and palace interiors"
    ],
    "officialUrl": "https://www.hermitagemuseum.org/",
    "onlineUrl": "https://collections.hermitagemuseum.org/",
    "image": "hermitage_museum.jpg",
    "imageAlt": "Winter Palace facade of the Hermitage Museum in Saint Petersburg",
    "imageCredit": "Florstein, Wikimedia Commons, CC BY-SA 4.0",
    "sourceUrls": [
      "https://www.hermitagemuseum.org/",
      "https://collections.hermitagemuseum.org/",
      "https://commons.wikimedia.org/wiki/File:Winter_Palace_Panorama_4.jpg"
    ]
  },
  {
    "slug": "leopold-museum",
    "name": "Leopold Museum",
    "city": "Vienna",
    "country": "Austria",
    "category": "Modern and Contemporary Art",
    "themes": [
      "Vienna 1900",
      "Egon Schiele",
      "Austrian modernism"
    ],
    "popularityTier": "Focused collections",
    "familyFriendly": false,
    "hasOnlineCollection": true,
    "summary": "The Leopold Museum in Vienna's MuseumsQuartier is known for Austrian modernism, especially Egon Schiele and Vienna around 1900.",
    "whyVisit": "It is the focused Vienna stop for Schiele, Klimt context, design, and the psychological intensity of early Austrian modern art.",
    "highlights": [
      "Egon Schiele collection",
      "Vienna 1900",
      "MuseumsQuartier setting"
    ],
    "officialUrl": "https://www.leopoldmuseum.org/en",
    "onlineUrl": "https://onlinecollection.leopoldmuseum.org/",
    "image": "leopold.jpg",
    "imageAlt": "Leopold Museum building in Vienna",
    "imageCredit": "Thomas Ledl, Wikimedia Commons, CC BY-SA 4.0",
    "sourceUrls": [
      "https://www.leopoldmuseum.org/en",
      "https://onlinecollection.leopoldmuseum.org/",
      "https://commons.wikimedia.org/wiki/File:Leopold_Museum_Vienna.jpg"
    ]
  },
  {
    "slug": "ny-carlsberg-glyptotek",
    "name": "Ny Carlsberg Glyptotek",
    "city": "Copenhagen",
    "country": "Denmark",
    "category": "Fine Art",
    "themes": [
      "Sculpture",
      "Antiquities",
      "French painting"
    ],
    "popularityTier": "Focused collections",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Ny Carlsberg Glyptotek combines ancient sculpture, Danish and French art, and a distinctive winter garden founded by brewer Carl Jacobsen.",
    "whyVisit": "It is Copenhagen's most atmospheric art museum for sculpture, antiquity, and a slower route through collecting and architecture.",
    "highlights": [
      "Winter garden",
      "Ancient sculpture",
      "French Impressionism"
    ],
    "officialUrl": "https://www.glyptoteket.com/",
    "onlineUrl": "https://www.glyptoteket.com/explore-the-collection/",
    "image": "glyptotek.jpg",
    "imageAlt": "Winter garden inside Ny Carlsberg Glyptotek",
    "imageCredit": "Thue, Wikimedia Commons, CC BY-SA 4.0",
    "sourceUrls": [
      "https://www.glyptoteket.com/",
      "https://www.glyptoteket.com/explore-the-collection/",
      "https://commons.wikimedia.org/wiki/File:Ny_Carlsberg_Glyptotek_Winter_Garden.jpg"
    ]
  },
  {
    "slug": "musee-marmottan-monet",
    "name": "Musee Marmottan Monet",
    "city": "Paris",
    "country": "France",
    "category": "Artist Museum",
    "themes": [
      "Monet",
      "Impressionism",
      "Private collection"
    ],
    "popularityTier": "Focused collections",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Musee Marmottan Monet holds a major Monet collection, including Impression, Sunrise, alongside works tied to private collecting in western Paris.",
    "whyVisit": "It is a quieter Paris route for visitors who want Monet beyond the headline museums and a more intimate collection setting.",
    "highlights": [
      "Impression, Sunrise",
      "Late Monet",
      "Berthe Morisot works"
    ],
    "officialUrl": "https://www.marmottan.fr/en/",
    "onlineUrl": "https://www.marmottan.fr/en/collections/",
    "image": "monet.jpg",
    "imageAlt": "Musee Marmottan Monet building in Paris",
    "imageCredit": "Moonik, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://www.marmottan.fr/en/",
      "https://www.marmottan.fr/en/collections/",
      "https://commons.wikimedia.org/wiki/File:Musee_Marmottan_Monet_Paris.jpg"
    ]
  },
  {
    "slug": "hamburger-kunsthalle",
    "name": "Hamburger Kunsthalle",
    "city": "Hamburg",
    "country": "Germany",
    "category": "Fine Art",
    "themes": [
      "German Romanticism",
      "Modern art",
      "Northern Germany"
    ],
    "popularityTier": "Major European classics",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Hamburger Kunsthalle is one of Germany's major art museums, spanning medieval panels, Romanticism, modernism, and contemporary art.",
    "whyVisit": "It gives Hamburg a serious art destination with exceptional German Romantic painting and a broad chronological route.",
    "highlights": [
      "Caspar David Friedrich",
      "Philipp Otto Runge",
      "Modern and contemporary galleries"
    ],
    "officialUrl": "https://www.hamburger-kunsthalle.de/en",
    "onlineUrl": "https://online-sammlung.hamburger-kunsthalle.de/en",
    "image": "hamburg.jpg",
    "imageAlt": "Hamburger Kunsthalle building in Hamburg",
    "imageCredit": "Ajepbah, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://www.hamburger-kunsthalle.de/en",
      "https://online-sammlung.hamburger-kunsthalle.de/en",
      "https://commons.wikimedia.org/wiki/File:Hamburger_Kunsthalle_2006.jpg"
    ]
  },
  {
    "slug": "national-gallery-prague",
    "name": "National Gallery Prague",
    "city": "Prague",
    "country": "Czech Republic",
    "category": "Fine Art",
    "themes": [
      "Czech art",
      "European art",
      "Multiple venues"
    ],
    "popularityTier": "Major European classics",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "The National Gallery Prague spans several historic and modern venues, presenting Czech and international art from medieval panels to modernism.",
    "whyVisit": "It makes Prague more than an architecture city for art travelers, connecting Bohemian art, European collections, and modern Central Europe.",
    "highlights": [
      "Sternberg Palace",
      "Trade Fair Palace",
      "Medieval and modern Czech art"
    ],
    "officialUrl": "https://www.ngprague.cz/en",
    "onlineUrl": "https://sbirky.ngprague.cz/en",
    "image": "narodni.jpg",
    "imageAlt": "National Gallery Prague Trade Fair Palace",
    "imageCredit": "VitVit, Wikimedia Commons, CC BY-SA 4.0",
    "sourceUrls": [
      "https://www.ngprague.cz/en",
      "https://sbirky.ngprague.cz/en",
      "https://commons.wikimedia.org/wiki/File:Veletrzni_palac_Praha_2016.jpg"
    ]
  },
  {
    "slug": "magritte-museum",
    "name": "Magritte Museum",
    "city": "Brussels",
    "country": "Belgium",
    "category": "Artist Museum",
    "themes": [
      "Surrealism",
      "Rene Magritte",
      "Belgian modern art"
    ],
    "popularityTier": "Focused collections",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "The Magritte Museum, part of the Royal Museums of Fine Arts of Belgium, focuses on Rene Magritte's surrealist work and archive.",
    "whyVisit": "It gives Brussels a concise, memorable route into surrealism through one artist's images, language games, and visual paradoxes.",
    "highlights": [
      "Magritte paintings",
      "Drawings and archives",
      "Belgian surrealism context"
    ],
    "officialUrl": "https://musee-magritte-museum.be/en",
    "onlineUrl": "https://fine-arts-museum.be/en/the-collection",
    "image": "magritte.jpg",
    "imageAlt": "Exterior sign for the Magritte Museum in Brussels",
    "imageCredit": "EmDee, Wikimedia Commons, CC BY-SA 4.0",
    "sourceUrls": [
      "https://musee-magritte-museum.be/en",
      "https://fine-arts-museum.be/en/the-collection",
      "https://commons.wikimedia.org/wiki/File:Magritte_Museum_Brussels.jpg"
    ]
  },
  {
    "slug": "neue-pinakothek",
    "name": "Neue Pinakothek",
    "city": "Munich",
    "country": "Germany",
    "category": "Fine Art",
    "themes": [
      "Nineteenth-century art",
      "German art",
      "Munich museums"
    ],
    "popularityTier": "Focused collections",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Neue Pinakothek is Munich's nineteenth-century art museum; its collection remains important even while building access changes through renovation.",
    "whyVisit": "It fills the bridge between the Alte Pinakothek and modern art, with Romanticism, realism, Impressionism, and early modern painting.",
    "highlights": [
      "German Romanticism",
      "French Impressionism",
      "Van Gogh and Cezanne context"
    ],
    "officialUrl": "https://www.pinakothek.de/en/neue-pinakothek",
    "onlineUrl": "https://www.sammlung.pinakothek.de/en/",
    "image": "neue_pinakothek.jpg",
    "imageAlt": "Neue Pinakothek building in Munich",
    "imageCredit": "Rufus46, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://www.pinakothek.de/en/neue-pinakothek",
      "https://www.sammlung.pinakothek.de/en/",
      "https://commons.wikimedia.org/wiki/File:Neue_Pinakothek_Muenchen.jpg"
    ]
  },
  {
    "slug": "galleria-dell-accademia",
    "name": "Galleria dell'Accademia",
    "city": "Florence",
    "country": "Italy",
    "category": "Fine Art",
    "themes": [
      "Michelangelo",
      "Florentine art",
      "Sculpture"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Galleria dell'Accademia is best known for Michelangelo's David, alongside Florentine painting, sculpture, and musical instruments.",
    "whyVisit": "It is a compact but essential Florence stop because David remains one of the defining encounters with Renaissance sculpture.",
    "highlights": [
      "Michelangelo's David",
      "Prisoners sculptures",
      "Florentine Gothic painting"
    ],
    "officialUrl": "https://www.galleriaaccademiafirenze.it/en/",
    "onlineUrl": "https://www.galleriaaccademiafirenze.it/en/artworks/",
    "image": "accademia.jpg",
    "imageAlt": "Exterior of Galleria dell'Accademia in Florence",
    "imageCredit": "Sailko, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://www.galleriaaccademiafirenze.it/en/",
      "https://www.galleriaaccademiafirenze.it/en/artworks/",
      "https://commons.wikimedia.org/wiki/File:Accademia_di_belle_arti,_Firenze.JPG"
    ]
  },
  {
    "slug": "museo-cappella-sansevero",
    "name": "Museo Cappella Sansevero",
    "city": "Naples",
    "country": "Italy",
    "category": "Historic Palace and Collection",
    "themes": [
      "Baroque sculpture",
      "Chapel",
      "Neapolitan art"
    ],
    "popularityTier": "Focused collections",
    "familyFriendly": false,
    "hasOnlineCollection": true,
    "summary": "Museo Cappella Sansevero is a small Naples museum-chapel known for virtuosic eighteenth-century sculpture and symbolic decoration.",
    "whyVisit": "It is one of Europe's most memorable single-room museum experiences, anchored by the technical drama of the Veiled Christ.",
    "highlights": [
      "Veiled Christ",
      "Disillusion",
      "Raimondo di Sangro's chapel program"
    ],
    "officialUrl": "https://www.museosansevero.it/en/",
    "onlineUrl": "https://www.museosansevero.it/en/the-chapel/",
    "image": "naples.jpg",
    "imageAlt": "Interior sculpture detail associated with Cappella Sansevero",
    "imageCredit": "David Sivyer, Wikimedia Commons, CC BY-SA 2.0",
    "sourceUrls": [
      "https://www.museosansevero.it/en/",
      "https://www.museosansevero.it/en/the-chapel/",
      "https://commons.wikimedia.org/wiki/File:Cappella_Sansevero_Naples.jpg"
    ]
  },
  {
    "slug": "museo-reina-sofia",
    "name": "Museo Reina Sofia",
    "city": "Madrid",
    "country": "Spain",
    "category": "Modern and Contemporary Art",
    "themes": [
      "Spanish modern art",
      "Picasso",
      "Contemporary art"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Museo Reina Sofia is Spain's national museum for twentieth-century and contemporary art, centered on Spanish modernism and international movements.",
    "whyVisit": "It completes Madrid's art triangle by moving from the Prado's Old Masters to Picasso, Dali, Miro, and postwar practice.",
    "highlights": [
      "Guernica",
      "Dali and Miro",
      "Sabatini and Nouvel buildings"
    ],
    "officialUrl": "https://www.museoreinasofia.es/en",
    "onlineUrl": "https://www.museoreinasofia.es/en/collection",
    "image": "reina_sofia.jpg",
    "imageAlt": "Museo Reina Sofia building in Madrid",
    "imageCredit": "Luis Garcia, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://www.museoreinasofia.es/en",
      "https://www.museoreinasofia.es/en/collection",
      "https://commons.wikimedia.org/wiki/File:Museo_Reina_Sofia_Madrid.jpg"
    ]
  },
  {
    "slug": "nationalmuseum-stockholm",
    "name": "Nationalmuseum",
    "city": "Stockholm",
    "country": "Sweden",
    "category": "Fine Art",
    "themes": [
      "Swedish art",
      "Design",
      "European painting"
    ],
    "popularityTier": "Major European classics",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Nationalmuseum is Sweden's national museum of art and design, with painting, sculpture, drawings, and applied arts in Stockholm.",
    "whyVisit": "It provides the strongest overview of Swedish art and design while also connecting Stockholm to broader European collecting.",
    "highlights": [
      "Swedish nineteenth-century art",
      "Design and applied arts",
      "Rembrandt and European painting"
    ],
    "officialUrl": "https://www.nationalmuseum.se/en/",
    "onlineUrl": "https://collection.nationalmuseum.se/eMP/eMuseumPlus",
    "image": "sweden.jpg",
    "imageAlt": "Nationalmuseum building in Stockholm",
    "imageCredit": "Arild Vågen, Wikimedia Commons, CC BY-SA 4.0",
    "sourceUrls": [
      "https://www.nationalmuseum.se/en/",
      "https://collection.nationalmuseum.se/eMP/eMuseumPlus",
      "https://commons.wikimedia.org/wiki/File:Nationalmuseum_Stockholm_2018.jpg"
    ]
  },
  {
    "slug": "gemaldegalerie-berlin",
    "name": "Gemaldegalerie",
    "city": "Berlin",
    "country": "Germany",
    "category": "Fine Art",
    "themes": [
      "European painting",
      "Old masters",
      "Berlin collections"
    ],
    "popularityTier": "Major European classics",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Berlin's Gemaldegalerie is a major European painting museum with German, Netherlandish, Italian, Spanish, French, and English works.",
    "whyVisit": "It is the Berlin stop for concentrated Old Master painting, especially when paired with Museum Island and the Kulturforum.",
    "highlights": [
      "Rembrandt collection",
      "Botticelli and Raphael",
      "Kulturforum galleries"
    ],
    "officialUrl": "https://www.smb.museum/en/museums-institutions/gemaeldegalerie/home/",
    "onlineUrl": "https://recherche.smb.museum/",
    "image": "berlin_gemalde.jpg",
    "imageAlt": "Gemaldegalerie building at the Kulturforum in Berlin",
    "imageCredit": "Manfred Brueckels, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://www.smb.museum/en/museums-institutions/gemaeldegalerie/home/",
      "https://recherche.smb.museum/",
      "https://commons.wikimedia.org/wiki/File:Berlin_Gemaeldegalerie_2009.jpg"
    ]
  },
  {
    "slug": "sistine-chapel",
    "name": "Sistine Chapel",
    "city": "Vatican City",
    "country": "Vatican City",
    "category": "Historic Palace and Collection",
    "themes": [
      "Michelangelo",
      "Renaissance fresco",
      "Papal chapel"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "The Sistine Chapel is a ceremonial chapel within the Vatican Museums route, famous for Michelangelo's ceiling and Last Judgment.",
    "whyVisit": "It is a singular destination for Renaissance fresco, papal ceremony, and the scale of artistic patronage in Rome.",
    "highlights": [
      "Michelangelo ceiling",
      "The Last Judgment",
      "Frescoes by Botticelli and Perugino"
    ],
    "officialUrl": "https://www.museivaticani.va/content/museivaticani/en/collezioni/musei/cappella-sistina.html",
    "onlineUrl": "https://www.museivaticani.va/content/museivaticani/en/collezioni.html",
    "image": "sistine.jpg",
    "imageAlt": "Exterior area near the Sistine Chapel in Vatican City",
    "imageCredit": "Antoine Taveneaux, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://www.museivaticani.va/content/museivaticani/en/collezioni/musei/cappella-sistina.html",
      "https://www.museivaticani.va/content/museivaticani/en/collezioni.html",
      "https://commons.wikimedia.org/wiki/File:Sistine_Chapel_-_Vatican_City.jpg"
    ]
  },
  {
    "slug": "museu-picasso-barcelona",
    "name": "Museu Picasso",
    "city": "Barcelona",
    "country": "Spain",
    "category": "Artist Museum",
    "themes": [
      "Picasso",
      "Barcelona",
      "Early work"
    ],
    "popularityTier": "Major European classics",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Museu Picasso in Barcelona focuses on Picasso's formative years and his connection to the city, housed in medieval palaces.",
    "whyVisit": "It is especially useful for seeing Picasso before the famous shorthand: academic training, Barcelona friendships, and early experimentation.",
    "highlights": [
      "Early Picasso",
      "Las Meninas series",
      "Gothic palace setting"
    ],
    "officialUrl": "https://museupicassobcn.cat/en",
    "onlineUrl": "https://museupicassobcn.cat/en/collection",
    "image": "museu_picasso.jpg",
    "imageAlt": "Facade of Museu Picasso in Barcelona",
    "imageCredit": "Kippelboy, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://museupicassobcn.cat/en",
      "https://museupicassobcn.cat/en/collection",
      "https://commons.wikimedia.org/wiki/File:Museu_Picasso_Barcelona_03.jpg"
    ]
  },
  {
    "slug": "palace-of-versailles",
    "name": "Palace of Versailles",
    "city": "Versailles",
    "country": "France",
    "category": "Historic Palace and Collection",
    "themes": [
      "Royal palace",
      "French history",
      "Gardens"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Versailles is a palace, garden, and museum complex that shaped the image of royal power in France and beyond.",
    "whyVisit": "It expands the museum tracker beyond galleries into state rooms, gardens, court ritual, architecture, and French political memory.",
    "highlights": [
      "Hall of Mirrors",
      "Gardens and fountains",
      "Trianon estate"
    ],
    "officialUrl": "https://en.chateauversailles.fr/",
    "onlineUrl": "https://collections.chateauversailles.fr/",
    "image": "palace_of_versailles.jpg",
    "imageAlt": "Garden facade of the Palace of Versailles",
    "imageCredit": "Myrabella, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://en.chateauversailles.fr/",
      "https://collections.chateauversailles.fr/",
      "https://commons.wikimedia.org/wiki/File:Chateau_Versailles_Galerie_des_Glaces.jpg"
    ]
  },
  {
    "slug": "thyssen-bornemisza-museum",
    "name": "Museo Nacional Thyssen-Bornemisza",
    "city": "Madrid",
    "country": "Spain",
    "category": "Fine Art",
    "themes": [
      "Private collection",
      "European painting",
      "Madrid art triangle"
    ],
    "popularityTier": "Major European classics",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Museo Nacional Thyssen-Bornemisza completes Madrid's art triangle with a private collection spanning medieval panels to modern painting.",
    "whyVisit": "It fills gaps between the Prado and Reina Sofia, especially in Northern painting, Impressionism, American art, and early modernism.",
    "highlights": [
      "European painting survey",
      "Impressionism",
      "Madrid art triangle"
    ],
    "officialUrl": "https://www.museothyssen.org/en",
    "onlineUrl": "https://www.museothyssen.org/en/collection",
    "image": "thyssen.jpg",
    "imageAlt": "Museo Nacional Thyssen-Bornemisza in Madrid",
    "imageCredit": "Luis Garcia, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://www.museothyssen.org/en",
      "https://www.museothyssen.org/en/collection",
      "https://commons.wikimedia.org/wiki/File:Museo_Thyssen-Bornemisza_(Madrid)_03.jpg"
    ]
  },
  {
    "slug": "museu-nacional-soares-dos-reis",
    "name": "Museu Nacional Soares dos Reis",
    "city": "Porto",
    "country": "Portugal",
    "category": "Fine Art",
    "themes": [
      "Portuguese art",
      "Sculpture",
      "Porto"
    ],
    "popularityTier": "Focused collections",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Museu Nacional Soares dos Reis is Porto's national art museum, housed in Carrancas Palace with Portuguese painting, sculpture, and decorative arts.",
    "whyVisit": "It gives Porto a serious museum anchor beyond architecture and wine routes, especially for Portuguese nineteenth-century art.",
    "highlights": [
      "Soares dos Reis sculpture",
      "Portuguese painting",
      "Carrancas Palace"
    ],
    "officialUrl": "https://museusoaresdosreis.gov.pt/",
    "onlineUrl": "https://museusoaresdosreis.gov.pt/collections/",
    "image": "reis.jpg",
    "imageAlt": "Museu Nacional Soares dos Reis building in Porto",
    "imageCredit": "Jose Goncalves, Wikimedia Commons, CC BY-SA 3.0",
    "sourceUrls": [
      "https://museusoaresdosreis.gov.pt/",
      "https://museusoaresdosreis.gov.pt/collections/",
      "https://commons.wikimedia.org/wiki/File:Museu_Nacional_Soares_dos_Reis_Porto.jpg"
    ]
  },
  {
    "slug": "mauritshuis",
    "name": "Mauritshuis",
    "city": "The Hague",
    "country": "Netherlands",
    "category": "Fine Art",
    "themes": [
      "Dutch Golden Age",
      "Cabinet museum",
      "The Hague"
    ],
    "popularityTier": "Global icons",
    "familyFriendly": true,
    "hasOnlineCollection": true,
    "summary": "Mauritshuis is a compact Dutch Golden Age museum in a seventeenth-century city palace beside the Binnenhof in The Hague.",
    "whyVisit": "It is one of Europe's highest-impact small museums, especially for Vermeer, Rembrandt, Fabritius, and intimate painting display.",
    "highlights": [
      "Girl with a Pearl Earring",
      "The Goldfinch",
      "Rembrandt's Anatomy Lesson"
    ],
    "officialUrl": "https://www.mauritshuis.nl/en/",
    "onlineUrl": "https://www.mauritshuis.nl/en/our-collection/",
    "image": "mauritshuis.jpg",
    "imageAlt": "Mauritshuis museum building in The Hague",
    "imageCredit": "C messier, Wikimedia Commons, CC BY-SA 4.0",
    "sourceUrls": [
      "https://www.mauritshuis.nl/en/",
      "https://www.mauritshuis.nl/en/our-collection/",
      "https://commons.wikimedia.org/wiki/File:Mauritshuis_The_Hague_2016.jpg"
    ]
  },
  {
    "slug": "palazzo-doria-pamphilj",
    "name": "Palazzo Doria Pamphilj",
    "city": "Rome",
    "country": "Italy",
    "category": "Historic Palace and Collection",
    "themes": [
      "Private palace",
      "Old masters",
      "Rome"
    ],
    "popularityTier": "Focused collections",
    "familyFriendly": false,
    "hasOnlineCollection": true,
    "summary": "Palazzo Doria Pamphilj is a historic Roman palace museum with a dense private gallery of Old Master painting and aristocratic interiors.",
    "whyVisit": "It offers a quieter Rome alternative to the largest museums, with a strong sense of collection, family, and palace continuity.",
    "highlights": [
      "Velazquez portrait of Innocent X",
      "Gallery of Mirrors",
      "Caravaggio and Carracci"
    ],
    "officialUrl": "https://www.doriapamphilj.it/en/rome/",
    "onlineUrl": "https://www.doriapamphilj.it/en/portfolio/the-masterpieces/",
    "image": "pamphilj.jpg",
    "imageAlt": "Gallery interior of Palazzo Doria Pamphilj in Rome",
    "imageCredit": "Daderot, Wikimedia Commons, CC0",
    "sourceUrls": [
      "https://www.doriapamphilj.it/en/rome/",
      "https://www.doriapamphilj.it/en/portfolio/the-masterpieces/",
      "https://commons.wikimedia.org/wiki/File:Palazzo_Doria-Pamphilj_-_Gallery_-_Rome.jpg"
    ]
  }
] as const;
