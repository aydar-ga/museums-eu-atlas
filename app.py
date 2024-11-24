import os
from flask import Flask, render_template

app = Flask(__name__)

# Static museums
museums = [
    {
        "id": 0,
        "name": "Louvre Museum",
        "city": "Paris",
        "country": "France",
        "image": "louvre.jpg",
    },
    {
        "id": 1,
        "name": "British Museum",
        "city": "London",
        "country": "United Kingdom",
        "image": "british_museum.jpg",
    },
    {
        "id": 2,
        "name": "Vatican Museums",
        "city": "Vatican City",
        "country": "Vatican City",
        "image": "vatican_museums.jpg",
    },
    {
        "id": 3,
        "name": "Rijksmuseum",
        "city": "Amsterdam",
        "country": "Netherlands",
        "image": "rijksmuseum.jpg",
    },
    {
        "id": 4,
        "name": "Uffizi Gallery",
        "city": "Florence",
        "country": "Italy",
        "image": "uffizi_gallery.jpg",
    },
    {
        "id": 5,
        "name": "Museo del Prado",
        "city": "Madrid",
        "country": "Spain",
        "image": "museo_del_prado.jpg",
    },
    {
        "id": 6,
        "name": "National Gallery",
        "city": "London",
        "country": "United Kingdom",
        "image": "national_gallery.jpg",
    },
    {
        "id": 7,
        "name": "Kunstmuseum Basel",
        "city": "Basel",
        "country": "Switzerland",
        "image": "basel.jpg",
    },
    {
        "id": 8,
        "name": "Petit Palais",
        "city": "Paris",
        "country": "France",
        "image": "petit_palais.jpg",
    },
    {
        "id": 9,
        "name": "Van Gogh Museum",
        "city": "Amsterdam",
        "country": "Netherlands",
        "image": "van_gogh_museum.jpg",
    },
    {
        "id": 10,
        "name": "Musée d'Orsay",
        "city": "Paris",
        "country": "France",
        "image": "musee_d_orsay.jpg",
    },
    {
        "id": 11,
        "name": "Tate Modern",
        "city": "London",
        "country": "United Kingdom",
        "image": "tate_modern.jpg",
    },
    {
        "id": 12,
        "name": "Centre Pompidou",
        "city": "Paris",
        "country": "France",
        "image": "centre_pompidou.jpg",
    },
    {
        "id": 13,
        "name": "Kunsthistorisches Museum",
        "city": "Vienna",
        "country": "Austria",
        "image": "kunsthistorisches_museum.jpg",
    },
    {
        "id": 14,
        "name": "Albertina",
        "city": "Vienna",
        "country": "Austria",
        "image": "albertina.jpg",
    },
    {
        "id": 15,
        "name": "Galleria Borghese",
        "city": "Rome",
        "country": "Italy",
        "image": "galleria_borghese.jpg",
    },
    {
        "id": 16,
        "name": "Pinacoteca di Brera",
        "city": "Milan",
        "country": "Italy",
        "image": "brera.jpg",
    },
    {
        "id": 17,
        "name": "Belvedere Palace Museum",
        "city": "Vienna",
        "country": "Austria",
        "image": "belvedere_palace_museum.jpg",
    },
    {
        "id": 18,
        "name": "Musée de l'Orangerie",
        "city": "Paris",
        "country": "France",
        "image": "musee_de_l_orangerie.jpg",
    },
    {
        "id": 19,
        "name": "National Gallery of Denmark",
        "city": "Copenhagen",
        "country": "Denmark",
        "image": "national_gallery_denmark.jpg",
    },
    {
        "id": 20,
        "name": "Alte Nationalgalerie",
        "city": "Berlin",
        "country": "Germany",
        "image": "alte_nationalgalerie.jpg",
    },
    {
        "id": 21,
        "name": "Pergamon Museum",
        "city": "Berlin",
        "country": "Germany",
        "image": "pergamon_museum.jpg",
    },
    {
        "id": 22,
        "name": "Alte Pinakothek",
        "city": "Munich",
        "country": "Germany",
        "image": "alte_pinakothek.jpg",
    },
    {
        "id": 23,
        "name": "Old Masters Gallery",
        "city": "Dresden",
        "country": "Germany",
        "image": "old_masters.jpg",
    },
    {
        "id": 24,
        "name": "Museu Calouste Gulbenkian",
        "city": "Lisbon",
        "country": "Portugal",
        "image": "museu_calouste_gulbenkian.jpg",
    },
    {
        "id": 25,
        "name": "Guggenheim Museum Bilbao",
        "city": "Bilbao",
        "country": "Spain",
        "image": "guggenheim_bilbao.jpg",
    },
    {
        "id": 26,
        "name": "Pushkin Museum",
        "city": "Moscow",
        "country": "Russia",
        "image": "pushkin.jpg",
    },
    {
        "id": 27,
        "name": "Munch Museum",
        "city": "Oslo",
        "country": "Norway",
        "image": "munch.jpg",
    },
    {
        "id": 28,
        "name": "Royal Museums",
        "city": "Brussels",
        "country": "Belgium",
        "image": "royal_museums_belgium.jpg",
    },
    {
        "id": 29,
        "name": "Kunsthaus Zürich",
        "city": "Zürich",
        "country": "Switzerland",
        "image": "kunsthaus_zurich.jpg",
    },
    {
        "id": 30,
        "name": "Hermitage Museum",
        "city": "Saint Petersburg",
        "country": "Russia",
        "image": "hermitage_museum.jpg",
    },
    {
        "id": 31,
        "name": "Leopold Museum",
        "city": "Vienna",
        "country": "Austria",
        "image": "leopold.jpg",
    },
    {
        "id": 32,
        "name": "Ny Carlsberg Glyptotek",
        "city": "Copenhagen",
        "country": "Denmark",
        "image": "glyptotek.jpg",
    },
    {
        "id": 33,
        "name": "Musée Marmottan Monet",
        "city": "Paris",
        "country": "France",
        "image": "monet.jpg",
    },
    {
        "id": 34,
        "name": "Hamburger Kunsthalle",
        "city": "Hamburg",
        "country": "Germany",
        "image": "hamburg.jpg",
    },
    {
        "id": 35,
        "name": "Národní Galerie",
        "city": "Prague",
        "country": "Czech Republic",
        "image": "narodni.jpg",
    },
    {
        "id": 36,
        "name": "Magritte Museum",
        "city": "Brussels",
        "country": "Belgium",
        "image": "magritte.jpg",
    },
    {
        "id": 37,
        "name": "Neue Pinakothek",
        "city": "Munich",
        "country": "Germany",
        "image": "neue_pinakothek.jpg",
    },
    {
        "id": 38,
        "name": "​​Galleria dell'Accademia",
        "city": "Venice",
        "country": "Italy",
        "image": "accademia.jpg",
    },
    {
        "id": 39,
        "name": "Museo Cappella Sansevero",
        "city": "Naples",
        "country": "Italy",
        "image": "naples.jpg",
    },
    {
        "id": 40,
        "name": "Reina Sofía",
        "city": "Madrid",
        "country": "Spain",
        "image": "reina_sofia.jpg",
    },
    {
        "id": 41,
        "name": "National Museum",
        "city": "Stockholm",
        "country": "Sweden",
        "image": "sweden.jpg",
    },
    {
        "id": 42,
        "name": "Gemäldegalerie",
        "city": "Berlin",
        "country": "Germany",
        "image": "berlin_gemalde.jpg",
    },
    {
        "id": 43,
        "name": "Sistine Chapel",
        "city": "Vatican City",
        "country": "Vatican City",
        "image": "sistine.jpg",
    },
    {
        "id": 44,
        "name": "Museu Picasso",
        "city": "Barcelona",
        "country": "Spain",
        "image": "museu_picasso.jpg",
    },
    {
        "id": 45,
        "name": "Palace of Versailles",
        "city": "Versailles",
        "country": "France",
        "image": "palace_of_versailles.jpg",
    },
    {
        "id": 46,
        "name": "Thyssen",
        "city": "Madrid",
        "country": "Spain",
        "image": "thyssen.jpg",
    },
    {
        "id": 47,
        "name": "Museu Nacional Soares dos Reis",
        "city": "Porto",
        "country": "Portugal",
        "image": "reis.jpg",
    },
    {
        "id": 48,
        "name": "Mauritshuis",
        "city": "The Haague",
        "country": "Netherlands",
        "image": "mauritshuis.jpg",
    },
    {
        "id": 49,
        "name": "Palazzo Doria Pamphilj",
        "city": "Rome",
        "country": "Italy",
        "image": "pamphilj.jpg",
    },
]

# Extract unique countries for the dropdown
countries = sorted(set(museum["country"] for museum in museums))


@app.route("/")
def index():
    return render_template("index.html", museums=museums, countries=countries)


@app.route("/mark-visited/<int:id>", methods=["POST"])
def mark_visitwd(id):
    museums[id]["visited"] = True
    return "", 204  # Return a "No Content" response


if __name__ == "__main__":
    port = int(
        os.environ.get("PORT", 5000)
    )  # Use the PORT env variable or default to 5000
    app.run(host="0.0.0.0", port=port, debug=True)
