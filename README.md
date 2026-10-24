# From Heme to Signal

An independent public GitHub Pages viewer: a full-screen interactive 3D film made from actual project coordinates. The original [heme-bundle viewer](https://github.com/alexw4123/guanosine-heme-bundle-viewer) is unchanged.

## Use the viewer

- Play the 60-second film, or choose any of its six scenes.
- Drag the molecule to orbit; scroll or pinch to zoom. Keyboard arrows rotate; +/− zoom; Home resets.
- Explore atoms or the coordinate-derived backbone, isolate components, and open atomic/secondary structure details.
- Save a captioned five-second WebM of the current scene, enable optional browser narration, or reduce motion.

## Scientific interpretation

Source coordinates, design/assembly animation, authentic molecular dynamics when available, and proposed applications are labeled separately. Component assembly is an explanatory rigid-body animation, not observed self-assembly. Application scenes are conceptual and are not biological results.

Heme: the original constructed design and the matching as-run model are separate coordinate layers. Real MD retains 120 saved source frames, 0,42,…,4998. Sampled water oxygens and all 64 ions come from the same aligned trajectory. Physical simulation time remains unverified. Fe–His bonds are imposed in the source topology. Activity, calibration and biosensor performance remain to be tested.

## Source and deployment

The readable interface and rendering modules are versioned in this repository. The bundled molecular data, original-viewer copy and pinned Three.js library are in `assets.zip`; the Pages workflow extracts them into the published site. To work locally, extract `assets.zip` in the repository root and serve the folder with a local static web server.

Libraries include their original license notices. Molecular files and original project records retain their existing ownership; no new research-asset license is granted here.
