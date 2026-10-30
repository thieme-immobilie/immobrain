# Interactive floorplan reconstruction

Mode 1 remains the photorealistic still-image workflow. Mode 2 at `/grundriss-3d.html` creates actual schematic geometry from a saved still image and, if available, its cropped original 2D source.

## Workflow

Use **Interaktives Modell erstellen** beneath a generated image, or select a saved image on the interactive page. The first action saves the current image locally before navigating. Nothing is sent to an AI provider until the user confirms the two visible image references and starts reconstruction.

The authenticated `/api/floorplan/model` route shares the image route's login validation, bounded input, concurrency and per-isolate soft limits. It sends only raster references, ceiling height, style and explicit notes. No favorite id, object name, original filename or automatic contact data. Uses the existing OPENAI_API_KEY; optional OPENAI_FLOORPLAN_MODEL defaults to gpt-5.4-mini. Responses API uses structured JSON schema and store:false. This is an additional paid inference, not another image render. No automatic retries after provider failures.

Model fields: width/depth/height in metres; normalized x/z wall endpoints, polygon room floors, door/window intervals along wall segments; furniture positions normalized but dimensions in metres. Output is validated before browser rendering. An AI projection from a single picture cannot recover measured or hidden geometry reliably. The original 2D image has structural precedence over the generated image. All metric output is explicitly unverified.

Three.js 0.180.0 is served by a three-file same-origin allowlisted vendor proxy. No upstream request carries client auth or cookies. Orbit controls rotate/zoom/pan the scene; auto-rotation, top view, wall cut height and furniture visibility are available. Furniture consists of procedural primitives, not photorealistic mesh recovery. Walls have real geometric gaps for inferred doors and windows. No ceiling is rendered.

Width, depth and ceiling height can be corrected. Advanced users can edit the validated JSON representation to change walls, room polygons, furniture locations and dimensions. Export JSON and PNG snapshots. Saved model is stored alongside the image in existing IndexedDB projects, retaining local object association and source blobs. No cloud sync. Saved images can be deleted by the image page, which also removes their stored models.

## Verification

Tests use fake API/auth responses, not live paid inference. Geometry/schema checks, opening gaps, image/reference selection, private metadata exclusion, vendor allowlisting and regressions of the existing still-image workflow are covered. Actual WebGL rendering and real inference quality need a browser check on the deployed site; local preview infrastructure was unavailable during implementation. WebGL 2 is required. No claim is made that this recovers photorealistic hidden surfaces or accurate construction geometry.
