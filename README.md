# Coffee House Menu

A simple, responsive coffee shop menu. Click an item to view ingredients and nutrition.

## Tech
- HTML, CSS, JavaScript (no framework)
- Data in JSON: `data/menu.json`
- Accessible modal, keyboard navigation, dark mode support
- Deployable to Netlify as a static site

## Run locally
Because `fetch` of JSON requires HTTP, serve the folder:

```bash
npx serve -s .
# or
python3 -m http.server 8080
