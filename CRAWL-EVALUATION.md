# Crawl and Retrieval Evaluation

Run these checks after publishing at the final canonical URL.

| Query or fetch | Expected outcome |
| --- | --- |
| Fetch page with JavaScript disabled | Name, positioning, experience, Hapa boundary, contact, and discovery section remain visible. |
| Fetch `profile.json` | Returns a valid structured profile with engagement lenses and truth boundary. |
| Fetch `llms.txt` | Returns a concise agent-readable summary and links to evidence rules. |
| Search “Open Banking governance” | Finds BECU, FDX, platform, governance, and human-approval context; does not claim unverified certifications or current product availability. |
| Search “agent platform developer tools” | Finds Hapa context, APIs, CLI, memory, evaluation, observability, and the prototype boundary. |
| Search “consulting design partner” | Finds engagement paths without framing them as an existing client offering. |
| Inspect canonical, robots, and sitemap | Each uses the exact published URL and none conflicts with the others. |
| Validate structured data | JSON-LD parses and describes the page without private data or unsupported performance claims. |

## Release gate

Do not call the release discoverable until the published URL, canonical URL, sitemap URL, Open Graph URL, and deployment host all match. Use a live URL inspection and structured-data validation after publication.
