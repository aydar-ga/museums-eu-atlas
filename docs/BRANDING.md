# Branding

Name, domain and brand direction for the product, from the owner's ChatGPT session of 2026-05-30 ("Museum Project Branding Ideas"). Nothing here is implemented yet: the visible product is still `museums-eu-atlas` / "Europe's Top 50 Art Museums".

## Decision

- **Name:** ArtMuse.
- **Domain:** `artmuse.app`. Decided on 2026-05-30 ("artmuse.app is the only available, I am buying it"). Whether the purchase went through is not recorded here.
- **Not available on 2026-05-30:** `artmuse.eu`, `artmuse.ai`, `euromuse.ai`.
- **Budget the domain was chosen under:** below €15 per year.

## The owner's brief

From the prompt that opened the session:

- Product: <https://museums-eu-atlas.vercel.app/>, to gain **scratch-off map mechanics** based on the user's listed museums, and an **AI guide that adapts to the user**. Focus on the EU only.
- Competitor: [Artlas](https://www.artlas.art/en).
- Inspiration for the physical scratch map: [Europe Art Travel scratch map, 52 museums (Etsy)](https://www.etsy.com/de/listing/1478021081/europe-art-travel-scratch-map-52-museen). The owner attached a product photo of it: "The Art Travels of Europe" by Mandrivna Ptakha, a black and gold scratch poster with a Europe map, UNESCO must-visit sites around it and a grid of round scratch-off museum icons below; the tube shows *Girl with a Pearl Earring*. The photo is not committed (third-party product photo).
- Asked for: domain ideas, a competitor and plan analysis, monetisation potential, UX ideas, marketing and brand communication in a **cheeky style**, and eye-catching visuals such as **Girl with a Pearl Earring winking**.

## Open questions before any of this is built

The ideas below are ChatGPT's suggestions, not decisions. Some conflict with the current project rules:

- **Tone.** `docs/DESIGN_DIRECTION.md` says the product "should feel like a focused personal route planner for serious art travel, not a marketing landing page". The cheeky copy below changes that; decide before rewriting copy.
- **Animated paintings.** `CLAUDE.md` / `CODEX.md`: "Do not add a mascot or character layer unless explicitly requested", and `docs/DECISIONS.md` records "Remove Mascot". The "Alive Paintings" idea is a character layer and needs an explicit decision.
- **Image rights.** Artwork reactions need local images with documented licences (`docs/sources.md`); runtime hotlinking stays forbidden.
- **Prices** for the tiers are ChatGPT's guesses, not market research.

## ChatGPT's suggestions (archived, 2026-05-30)

### Positioning

The product is not museum information but a collection: "I've visited 27 of Europe's greatest museums. Here's my collection." The Etsy map shows the emotional hook: people enjoy revealing progress.

| Artlas | This product |
|---|---|
| Museum discovery map | Museum progression game |
| Static content | Adaptive AI guide |
| Mostly planning | Planning + collecting + learning |
| Geographic exploration | Personal cultural journey |
| Map interface | Scratch-map mechanic + achievements |
| Broad art discovery | EU museum completionism |

Taglines offered: "The Duolingo of European museums"; "Scratch off Europe, one museum at a time"; "Turn museum visits into a collectible adventure". Advice: drop "atlas" from the brand; it sounds like a reference, a database, a directory, while the product is a collection, an adventure, a progression.

For ArtMuse specifically:

- "ArtMuse — Collect Europe's greatest museums."
- "ArtMuse — Your European museum quest."
- "ArtMuse — Scratch. Discover. Collect."

`.app` reads as modern and product-focused; `.eu` as cultural and institutional; `.ai` as AI-first. The name leaves room to grow beyond museums (galleries, cultural routes, city art challenges, collectible travel experiences) without a geographic limit.

### Domain candidates considered

- First round (`.eu`): artmuse.eu, museatlas.eu, musemap.eu, museumatlas.eu, europemuse.eu, musepath.eu, musequest.eu, museumquest.eu, artquest.eu, collectmuse.eu, musehunt.eu. `.ai` estimated at €60–120/year, over budget.
- Second round (after artmuse.eu/.ai turned out taken): musequest.app (ChatGPT's favourite), museum.quest, artquest.app, musemap.app, euromuse.app, artpassport.app, musepassport.app, museumxp.app, museumlevels.app, arthunter.app, masterpiece.quest, collectart.app, unlockart.app, scratchmuse.app, musejourney.app.

### Secure next

- Social handles: @artmuse on X, Instagram and TikTok; @artmuseapp as fallback.
- Cheap defensive domains, redirected: artmuse.eu (taken on 2026-05-30), artmuse.net, artmuse.org.

### Monetisation tiers

| Tier | Price suggested | Contents |
|---|---|---|
| Premium AI Guide | €4.99/month | personalised itineraries, AI explanations, artwork and collection recommendations |
| Collector Pass | €19/year | badges, completion percentages ("You've completed 42% of the European Masters Collection"), private collections, travel statistics, exportable certificates |
| Partner revenue | affiliate | museum tickets, city cards, guided tours, train tickets, hotels |
| Physical products | €29–49 | personalised print-on-demand scratch poster, e.g. "Alexander's European Museum Journey 2026", visited museums highlighted |

### UX ideas

1. **Scratch reveal animation** (called the most important feature): marking a museum visited scratches away gold foil, like the Etsy map, instead of a plain check mark.
2. **Museum rarity:** Common, Rare, Epic, Legendary (Legendary: Louvre, Prado, Rijksmuseum).
3. **Collections to unlock:** Impressionist Hunter (Musée d'Orsay, Van Gogh Museum, …), Renaissance Master (Uffizi, Vatican Museums, Prado), Northern Masters (Rijksmuseum, Mauritshuis, Alte Pinakothek).
4. **Cultural XP and levels:** small museum 10 XP, Louvre 100 XP; levels Explorer → Curator → Conservator → Art Historian → Grand Master.

### AI guide

Ask "What are you today?" and adapt: Tourist mode (simple), Student mode (educational), Art nerd mode (deep analysis), Gossip mode (fun facts and drama: "Caravaggio was basically Europe's most talented troublemaker.").

### Cheeky copy

| Instead of | Use |
|---|---|
| Discover Europe's cultural heritage. | Steal culture legally. |
| Explore masterpieces. | Collect masterpieces without triggering any alarms. |
| Visit museums. | Catch them all. |

### Visuals: "Alive Paintings"

Classic artworks react in the UI with subtle animations: Girl with a Pearl Earring winks after a completed museum ("Nice. One down."), Mona Lisa smirks at level 10 ("Finally taking culture seriously?"), Venus de Milo after the Louvre ("Not bad, human."), Napoleon points to the next museum, Van Gogh nods approval.

### Suggested build order

1. Museum database
2. Scratch-off reveal mechanic
3. User progress tracking
4. Achievement collections
5. AI guide
6. Shareable museum passport
7. Premium memberships
8. Personalised print posters

ChatGPT's closing argument: museum data and AI guides are easy to copy; a strong collector experience and identity system are the defensible part.
