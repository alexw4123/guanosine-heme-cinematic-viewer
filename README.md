# Heme bundle · Fairfield research viewer

Independent public viewer for the Smith-Carpenter Lab research project. Its own project opens by default; the project switch links to the other independent viewer.

Scientific explanations, application comparisons, source documents and atom-selection mappings are separate from the interface. The molecular engine validates source SHA256, atom counts and explicit bond counts before display. NGL bond inference is disabled; secondary structure comes from each currently loaded model's own coordinates.

The original guanosine-heme-bundle-viewer website and source molecular files are preserved. Historic characterization, constructed models, the as-run trajectory and corrected references remain distinct. Missing experimental values are not invented. DHFR delivery/injection content is removed; application claims are tied to named comparisons and measurements.

## Deployment

The workflow extracts the existing, unchanged assets.zip, research-assets.zip and the additive atomic-replay-assets.zip, then copies the versioned selection-map JSON. Existing molecular archives are not replaced. The native-controlled atomic replay is five seconds and never autoplays.

Live page: https://alexw4123.github.io/guanosine-heme-cinematic-viewer/
