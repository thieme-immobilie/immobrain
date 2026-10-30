# 3D-Grundriss

`/grundriss.html` creates an AI-generated still image from a cropped 2D plan. It does not create editable geometry, a measured model, a walkthrough or a renovation quantity survey.

## Flow

- Upload PDF/PNG/JPEG/WebP (20 MB maximum); PDFs up to 30 pages. PDF.js is loaded through the existing same-origin invoice-vendor route. The PDF stays in the browser.
- Select a page and optionally drag a crop. Confirm the crop; review exactly the raster image that will be sent. Cropping removes outside title blocks but cannot remove identifying details inside the selected rectangle.
- Raster input is reduced to a 2000-pixel long edge, white background, JPEG; original filename and file metadata are not forwarded.
- Choose modern, Scandinavian or unfurnished; height defaults to 2.50 m. Wall tops and perimeter are white. Manually entered notes are sent; local project name and favorite reference are not.
- Explicit transfer/cost consent and the existing confirmed ImmoBrain login are required for each new source. Each generate click makes one image-edit request, with no automatic retry.
- Results and the raster source can be saved in IndexedDB `immobrain-floorplans-v1` under the project id with a local favorite reference. Multiple versions can be saved. Download for backup. No cloud synchronization or public image storage.

## Cloudflare configuration

- Existing server secret `OPENAI_API_KEY` is reused; never expose it in the client. GPT Image model access and a funded OpenAI API project are required independently of a ChatGPT subscription.
- Optional `OPENAI_IMAGE_MODEL`: `gpt-image-2` (default) or `gpt-image-1.5`. High quality, one 1536×1024 JPEG. With 1.5 input_fidelity is high; it is omitted for 2.
- `/api/floorplan/status` checks configuration only; it does not prove image-model entitlement or make a paid generation.
- Generation revalidates the Supabase bearer token via `/auth/v1/user`. No database changes or new Supabase grants were introduced.
- Request size is bounded to 6 MB, image to 5 MB, notes to 1200 characters, and height/style are validated. Source URLs cannot be supplied. Only the fixed OpenAI image-edit endpoint is called.
- Concurrency and three-request/hour limits are in-memory per user per Worker isolate. These are soft abuse controls, NOT a global billing cap. Configure OpenAI project usage limits/alerts for financial control. Use durable rate limiting if this becomes multi-user.
- A provider/network timeout can incur API costs even without a displayed result. UI does not retry automatically. Upstream payload/error details and secrets are not returned or logged.

## Privacy and verification

External image processing occurs only after the user confirms the selected crop. Do not describe this feature as EU-only processing or certified GDPR compliance; provider contract, retention and regional settings need separate review. The site stores no source PDF in its backend. The preview and input raster can contain private property details; users must review them before transfer.

`tests/floorplan.test.mjs` uses a mocked provider and auth server; no paid live generation or provider permission was verified during implementation. A real generation from the deployed page remains the integration check. Browser visual QA depends on preview infrastructure.
