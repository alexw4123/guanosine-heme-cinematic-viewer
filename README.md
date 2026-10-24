# Heme research viewer

A complete static Heme research presentation, copied from the approved private opening-screen checkpoint and expanded in a new directory. The checkpoint, original repository files, and existing live folders have not been overwritten. This directory has not been deployed by the implementation agent.

The opening pairs the actual atomic source structure with the experiment: compare ABTS oxidation in assemblies with and without hemin, with hemin-only and reagent controls. It retains the compact desktop workbench and accessible molecular controls. Below it are six user-paced research topics, seven linked research steps, original source figures, a figure lightbox, expandable methods, and a recorded five-second VMD clip. There is no autoplay, timed guide, invented assembly motion, body/chip cartoon, or new simulation.

## Serve / publish

This is buildless HTML/CSS/JavaScript. Serve this directory over HTTP. A file URL may block PDB loading. Every runtime library, model, image, video, and caption file is local and uses a relative path. Source-document and DHFR links open separately.

Deploy source files are listed in DEPLOY-FILES.txt. ASSET-MANIFEST.json lists asset byte sizes, SHA-256 values, provenance, and source-model distinctions. There is no package installation, API key, backend, or generated build directory.

The existing repository assets.zip is not changed. The publishing owner can place this directory's assets in supplemental research-assets.zip, extract the existing archive first, then overlay the supplement and new root source files. The publishing owner controls the GitHub Pages workflow and deployment; this app does not publish itself.

## Scientific distinctions

- assets/heme-original.pdb is byte-identical to the approved checkpoint source. SHA-256: e3eccb1cbe10a18a0bd633aaf076a7cd1fd2beeedccba0fd73a2a7695b238b4c.
- Local NGL 2.4.0 parses 1,213 atoms and 1,232 explicit CONECT bonds with inferBonds set to none. No additional connectivity is inferred. Source coordinates and component transforms are never changed.
- The original model, older matched as-run GSPEG2 trajectory, corrected 2HH:2HA_AC dry reference, and future PEG3 laboratory variants are described separately. As-run coordinates are not applied to the unmatched original model.
- Both Fe-His links are imposed topology bonds. Appearance or persistence does not establish spontaneous binding, affinity, catalytic activity, or sensor performance.
- The five-second VMD replay appears only in research step 4. Video, poster, provenance JSON, and English WebVTT captions are copied unchanged. It shows 120 aligned snapshots at source frames 0, 42, ... 4,998. Playback seconds are not physical simulation time. It stays paused until the visitor presses Play.
- Findings are reported project analysis: compact core, partial helix retention, and no sustained tested guanine contacts. This site does not fabricate plot values or perform an independent trajectory analysis. The conflicting uncorrected secondary_structure_occupancy.png is intentionally not embedded.
- The assay chain is hydrogen peroxide + reduced ABTS -> green oxidized ABTS if activity is confirmed -> spectrophotometer absorbance -> calibration. Useful sensing also needs selectivity, repeatability, stability, and sample-interference tests.

## Source rights and credits

Title and author credit follow the historical Fairfield poster: Designing a Four-Helix Nucleopeptide Bundle Capable of Hemin Binding, Christie Stevkovski, Alexander Wong, and Jillian Smith-Carpenter, Department of Chemistry and Biochemistry, Fairfield University. Historical HPLC/MS/CD data concern the experimental constructs in that poster, not measured activity of this computational PEG2 model. Source figures are preserved as original copies with version-specific captions. Full private notebooks are linked, not reproduced as page text. Source access may require the lab account.

NGL is distributed under assets/NGL-LICENSE.txt. No ownership claim is made to source scientific material or university marks. The masthead uses university/laboratory text rather than a recreated crest. DHFR is linked as a separate research project.

## Controls and accessibility

The molecule opens in Atomic mode with all source atoms visible. Component buttons and atom/bond picking use one selection function: selected atoms are emphasized, the whole structure remains present, and the camera stays still. Explicit isolation is opt-in and is cleared by ordinary component or atom selection. Secondary structure uses NGL's coordinate-based assignment, retaining cap/heme and coordinating-histidine atomic detail.

Drag rotates; scroll/pinch zooms. Visible buttons provide rotation, zoom, and reset. With the view focused, arrow keys rotate, plus/minus zoom, and Home restores the initial camera. NGL recenter-on-click, component-transform drags, spin/rock keys, and hover tooltip bindings are removed. A short stationary-tap adapter supports touch atom picking. No interaction depends on animation; the page honors reduced-motion preferences.

The six-topic reader is user-paced and highlights the relevant source component through the same selection function without moving the camera or starting playback. Native figure dialogs support Escape, Close, open-original, download, and source links. Methods start collapsed. The video uses native controls and a local caption track.

## DOM-backed QA hooks

The molecular-viewport element exposes real NGL state:

- data-model-ready=true after source parsing and count verification.
- data-atom-count=1213 and data-bond-count=1232 from NGL.
- data-selected-component: all, peptide, guanosine, or heme.
- data-selected-atom-count: 1213 / 924 / 216 / 73.
- data-last-picked-atom: zero-based source index from an actual atom or closest-bond-atom pick; blank before a real pick.
- data-view-orientation: actual NGL camera matrix, refreshed on camera changes and rendering. It stays unchanged on selection and representation changes.
- data-topic, data-isolated, data-representation; readable state is also shown in source metadata and pressed buttons.

Selectors: [data-component=heme], [data-mode], #zoom-in, #zoom-out, [data-rotate], #reset-camera, #isolate-selected, .topic-controls [data-topic], #topic-reading[data-current-topic], [data-figure], #figure-dialog[data-figure], .method-source-details, #trajectory-video. Video data-playback updates only on native media events.

Source index groups: HEMA 1140-1212 (73 atoms); cap/linker ranges 0-53, 284-337, 570-623, 854-907 (216 atoms); remaining peptide atoms (924). Picked segment labels use these verified ranges because the original chain field is blank and the NGL proxy does not expose its segment field directly.

Loading/failure disables molecular controls but leaves the research readable. Retry and the original-viewer fallback are provided. Original parser verification remains in verification.json. Final browser QA belongs to the publishing owner.
