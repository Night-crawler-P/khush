## Timely — E‑commerce Watch Site with AI Chatbot

Run locally by simply opening `index.html` in your browser. No build steps required.

### Curated Product Photos (No Random Images)
- Place your own high‑quality, brand‑approved watch photos in `static/products/` using these exact filenames:
  - `aurora-auto.jpg`
  - `titan-solar.jpg`
  - `ceramica.jpg`
  - `heritage-gold.jpg`
  - `trailmaster.jpg`
  - `metro-chrono.jpg`
  - `oceanic.jpg`
  - `minimalist.jpg`
- Images should be:
  - 1200×900 px (or larger) JPG, sRGB
  - Clean backgrounds, well-lit, no watermarks
  - Cropped to clearly show the watch (avoid lifestyle randomness)
- If any file is missing, the UI shows a neutral `static/placeholder-watch.svg` (not a random photo).

### Chatbot Training Data
- The chatbot uses `knowledge.json`. Edit or add entries with:
  - `q`: question (training cue)
  - `a`: answer (chatbot response)
  - `tags`: keywords to improve matching
- The bot also supports basic recommendation prompts like “Recommend a titanium dive watch under $800”.

### Project Structure
- `index.html`: UI layout, cart drawer, chatbot widget.
- `styles.css`: Dark theme, responsive grid, components.
- `app.js`: Product catalog, filters, cart logic, and events.
- `chatbot.js`: Rule/similarity chatbot with `knowledge.json`.
- `knowledge.json`: FAQ/knowledge base.
- `static/`: Logos, hero art, placeholders, and your product photos.

### Notes
- Checkout is a stub—integrate your payment gateway where indicated in `app.js`.
- All assets are local; there are no network calls except loading `knowledge.json`.


