const biosensor = document.querySelector('#biosensor-tour');

if (biosensor) {
  const steps = [
    {
      title: 'Start with a peroxide-containing sample.',
      lead: 'The sample goes into an external assay cell containing ABTS and the hemin-containing assembly.',
      copy: 'The liquid and pipette show a possible measurement setup. The molecular inset uses the original 1,213-atom bundle coordinates; its placement beside the cell is an explanation of the design.',
      boundary: 'This is an assay outside the body. The bundle is not shown as an injectable treatment.',
      tag: 'Sample + reagents', detail: 'A possible bench assay', sourceText: 'Read the laboratory comparison plan ↗',
      source: 'https://docs.google.com/document/d/1rmexqF9TSg2FgBzd4zzPp6pdkmKvPH0Gi1d7rOUiM1I/edit'
    },
    {
      title: 'Test whether the assembly changes the reaction.',
      lead: 'If it has peroxidase activity, the hemin-containing assembly could support peroxide-dependent ABTS oxidation.',
      copy: 'Compare the assembly plus hemin with matched free hemin, assembly without hemin, and reagent controls. This determines whether the peptide assembly contributes beyond hemin on its own.',
      boundary: 'Neither catalytic activity nor a rate advantage has been measured for this bundle. The moving particles illustrate mixing, not an atomistic reaction simulation.',
      tag: 'Hemin + assembly + ABTS', detail: 'Activity is the next question', sourceText: 'Read the ABTS / heme-enzyme precedent ↗',
      source: 'https://doi.org/10.1038/s41467-017-00541-4'
    },
    {
      title: 'Read the oxidized ABTS optically.',
      lead: 'Peroxidase-dependent ABTS oxidation gives a green colored product that can be followed by absorbance.',
      copy: 'A spectrophotometer measures how much light the assay absorbs. The beam and green liquid illustrate that readout; their intensity is not experimental data from this project.',
      boundary: 'A color response alone is insufficient. Matched no-peroxide and sample-background measurements help separate the intended response from other color or chemistry.',
      tag: 'Optical signal', detail: 'Green oxidized ABTS', sourceText: 'Read the experimental assay precedent ↗',
      source: 'https://doi.org/10.1038/s41467-017-00541-4'
    },
    {
      title: 'Turn a validated signal into a concentration.',
      lead: 'Measure known peroxide standards under the same conditions, then compare the sample response with the resulting calibration.',
      copy: 'After activity is confirmed, establish the usable range, timing, repeatability, selectivity, stability, and sample interference. No calibration curve or detection limit has been measured for this bundle.',
      boundary: 'A later biosensor could couple peroxide production to a recognition reaction, such as glucose oxidation. That requires another validated component and testing of the complete assay.',
      tag: 'Standards + blanks', detail: 'Calibration is still to be measured', sourceText: 'Read a different hemin / glucose-oxidase assay ↗',
      source: 'https://doi.org/10.1002/smsc.202400025'
    }
  ];

  const stepButtons = [...biosensor.querySelectorAll('[data-biosensor-step]')];
  const viewport = biosensor.querySelector('#biosensor-stage');
  const motion = biosensor.querySelector('#biosensor-motion');
  const previous = biosensor.querySelector('#biosensor-previous');
  const next = biosensor.querySelector('#biosensor-next');
  const replay = biosensor.querySelector('#biosensor-replay');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let sceneApi;
  motion.checked = !reduceMotion.matches;
  motion.disabled = reduceMotion.matches;
  motion.title = reduceMotion.matches ? 'Your reduced-motion preference keeps this illustration still.' : 'Animate only after choosing a step or replay.';
  replay.textContent = reduceMotion.matches ? 'Show still view' : 'Replay this step';

  function selectStep(index, animate = true) {
    current = Math.max(0, Math.min(steps.length - 1, index));
    const step = steps[current];
    biosensor.querySelector('#biosensor-caption-index').textContent = `${String(current + 1).padStart(2, '0')} / THE PEROXIDE READOUT`;
    biosensor.querySelector('#biosensor-caption-title').textContent = step.title;
    biosensor.querySelector('#biosensor-caption-lead').textContent = step.lead;
    biosensor.querySelector('#biosensor-caption-copy').textContent = step.copy;
    biosensor.querySelector('#biosensor-caption-boundary').textContent = step.boundary;
    biosensor.querySelector('#biosensor-signal-title').textContent = step.tag;
    biosensor.querySelector('#biosensor-signal-detail').textContent = step.detail;
    const source = biosensor.querySelector('#biosensor-caption-source');
    source.href = step.source;
    source.textContent = step.sourceText;
    stepButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
    previous.disabled = current === 0;
    next.disabled = current === steps.length - 1;
    biosensor.dataset.currentStep = String(current);
    sceneApi?.show(current, animate && motion.checked && !reduceMotion.matches);
  }

  stepButtons.forEach((button, index) => {
    button.addEventListener('click', () => selectStep(index));
    button.addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowRight') target = (index + 1) % steps.length;
      if (event.key === 'ArrowLeft') target = (index + steps.length - 1) % steps.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = steps.length - 1;
      if (target === undefined) return;
      event.preventDefault();
      stepButtons[target].focus();
      selectStep(target);
    });
  });
  previous.addEventListener('click', () => selectStep(current - 1));
  next.addEventListener('click', () => selectStep(current + 1));
  replay.addEventListener('click', () => sceneApi?.show(current, motion.checked && !reduceMotion.matches));
  motion.addEventListener('change', () => {
    replay.textContent = motion.checked && !reduceMotion.matches ? 'Replay this step' : 'Show still view';
    if (!motion.checked) sceneApi?.show(current, false);
  });
  reduceMotion.addEventListener('change', () => {
    motion.checked = !reduceMotion.matches;
    motion.disabled = reduceMotion.matches;
    motion.title = reduceMotion.matches ? 'Your reduced-motion preference keeps this illustration still.' : 'Animate only after choosing a step or replay.';
    replay.textContent = reduceMotion.matches ? 'Show still view' : 'Replay this step';
    sceneApi?.show(current, false);
  });
  selectStep(0, false);

  async function buildScene() {
    const THREE = await import('./vendor/three.module.js');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#07131f');
    scene.fog = new THREE.Fog('#07131f', 22, 40);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    viewport.prepend(renderer.domElement);
    const camera = new THREE.OrthographicCamera(-6, 6, 4, -4, .1, 100);
    camera.position.set(8.5, 7, 14);
    camera.lookAt(.1, 1.45, 0);
    scene.add(new THREE.HemisphereLight('#d3edff', '#14202b', 2.1));
    const key = new THREE.DirectionalLight('#e1f2ff', 3.3);
    key.position.set(-4, 10, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#57d8e8', 1.9);
    rim.position.set(5, 4, -5);
    scene.add(rim);

    const opaque = color => new THREE.MeshStandardMaterial({ color, roughness: .52, metalness: .18 });
    const navy = opaque('#1c3445');
    const pale = opaque('#b3c5cc');
    const teal = opaque('#4f9eaa');
    const green = opaque('#65c69a');
    const white = opaque('#d9e4e8');
    const lineMaterial = new THREE.LineBasicMaterial({ color: '#36505f', transparent: true, opacity: .6 });
    const bench = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), new THREE.MeshStandardMaterial({ color: '#0a1a28', roughness: .82, metalness: .15 }));
    bench.rotation.x = -Math.PI / 2;
    bench.position.y = -.39;
    scene.add(bench);
    const grid = new THREE.GridHelper(24, 30, '#193444', '#102735');
    grid.position.y = -.38;
    grid.material.transparent = true;
    grid.material.opacity = .42;
    scene.add(grid);

    const box = (w, h, d, material, x, y, z, parent = scene) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    };
    const cylinder = (r1, r2, height, material, x, y, z, parent = scene) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, height, 24), material);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    };
    const connector = (a, b, color, radius = .014, parent = scene) => {
      const first = new THREE.Vector3(...a);
      const second = new THREE.Vector3(...b);
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, first.distanceTo(second), 8), opaque(color));
      mesh.position.copy(first).add(second).multiplyScalar(.5);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), second.clone().sub(first).normalize());
      parent.add(mesh);
      return mesh;
    };

    // The assay hardware is a schematic; none of its dimensions are experimental measurements.
    const cellGroup = new THREE.Group();
    scene.add(cellGroup);
    box(1.85, .28, 1.45, navy, .35, -.17, .1, cellGroup);
    const glassMaterial = new THREE.MeshPhysicalMaterial({ color: '#a0ccdc', transparent: true, opacity: .12, roughness: .05, metalness: 0, side: THREE.DoubleSide, depthWrite: false });
    const glass = box(1.2, 2.75, .84, glassMaterial, .35, 1.37, .1, cellGroup);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(glass.geometry), new THREE.LineBasicMaterial({ color: '#6f9baa', transparent: true, opacity: .54 }));
    edges.position.copy(glass.position);
    cellGroup.add(edges);
    const liquidMaterial = new THREE.MeshPhysicalMaterial({ color: '#416e7d', transparent: true, opacity: .6, roughness: .22, metalness: 0, depthWrite: false });
    const liquid = box(1.07, 1.45, .71, liquidMaterial, .35, .78, .1, cellGroup);
    const meniscus = box(1.07, .024, .71, new THREE.MeshBasicMaterial({ color: '#7aacb7', transparent: true, opacity: .5 }), .35, 1.51, .1, cellGroup);

    const pipette = new THREE.Group();
    cylinder(.15, .16, 1.22, pale, 0, .57, 0, pipette);
    cylinder(.19, .19, .15, teal, 0, 1.08, 0, pipette);
    cylinder(.065, .065, .28, navy, 0, 1.31, 0, pipette);
    cylinder(.14, .14, .055, white, 0, 1.48, 0, pipette);
    cylinder(.10, .05, .69, white, 0, -.38, 0, pipette);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(.072, .62, 16), new THREE.MeshPhysicalMaterial({ color: '#c5e5ed', transparent: true, opacity: .7, roughness: .15 }));
    tip.rotation.z = Math.PI;
    tip.position.set(0, -1.03, 0);
    pipette.add(tip);
    pipette.position.set(.08, 4.28, .12);
    pipette.rotation.z = -.13;
    scene.add(pipette);

    const detector = new THREE.Group();
    detector.position.set(3.45, -.1, -.1);
    box(2.05, 1.85, 1.72, navy, 0, .85, 0, detector);
    box(1.76, .16, 1.5, opaque('#2c4557'), 0, 1.85, 0, detector);
    box(1.17, .52, .03, opaque('#0c232b'), .02, 1.16, .88, detector);
    box(.55, .045, .036, green, -.2, 1.2, .903, detector);
    box(.82, .025, .036, opaque('#3c6b6c'), -.07, 1.07, .903, detector);
    for (let i = 0; i < 3; i++) {
      const control = cylinder(.055, .055, .045, pale, -.48 + i * .35, .52, .89, detector);
      control.rotation.x = Math.PI / 2;
    }
    cylinder(.14, .14, .09, opaque('#547788'), -1.06, 1.3, .1, detector).rotation.z = Math.PI / 2;
    scene.add(detector);
    const emitter = box(.46, 1.2, .75, navy, -1.02, .49, .1);
    cylinder(.12, .12, .08, pale, -.75, 1.2, .1).rotation.z = Math.PI / 2;
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, 3.37, 16), new THREE.MeshBasicMaterial({ color: '#8ddbb9', transparent: true, opacity: .55, depthWrite: false }));
    beam.rotation.z = Math.PI / 2;
    beam.position.set(.91, 1.2, .1);
    scene.add(beam);

    const sourceBase = cylinder(1.12, 1.19, .14, navy, -3.03, -.14, .2);
    const sourceRing = new THREE.Mesh(new THREE.TorusGeometry(1.10, .012, 8, 70), new THREE.MeshBasicMaterial({ color: '#4b889b', transparent: true, opacity: .6 }));
    sourceRing.rotation.x = Math.PI / 2;
    sourceRing.position.set(-3.03, -.05, .2);
    scene.add(sourceRing);
    const sourceBundle = new THREE.Group();
    sourceBundle.position.set(-3.03, 1.28, .2);
    sourceBundle.rotation.set(.7, -.45, .1);
    scene.add(sourceBundle);
    const sourceConnector = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.92, .28, .20), new THREE.Vector3(-1.45, .28, .20),
      new THREE.Vector3(-.75, .75, .20)
    ]), lineMaterial);
    scene.add(sourceConnector);

    const standards = new THREE.Group();
    standards.position.set(2.3, 0, -2.0);
    const standardLiquid = new THREE.MeshPhysicalMaterial({ color: '#59ae84', transparent: true, opacity: .58, roughness: .25, depthWrite: false });
    for (let i = 0; i < 3; i++) {
      box(.42, 1.19, .4, glassMaterial, i * .67 - .67, .60, 0, standards);
      box(.32, .75, .3, standardLiquid, i * .67 - .67, .41, 0, standards);
      box(.46, .08, .44, pale, i * .67 - .67, 1.23, 0, standards);
    }
    box(2.1, .16, .78, navy, 0, -.04, 0, standards);
    scene.add(standards);

    const peroxide = new THREE.Group();
    const peroxideMaterial = opaque('#a4dfef');
    const moleculeGeometry = new THREE.SphereGeometry(.065, 10, 8);
    for (let i = 0; i < 7; i++) {
      const molecule = new THREE.Group();
      for (const direction of [-1, 1]) {
        const atom = new THREE.Mesh(moleculeGeometry, peroxideMaterial);
        atom.position.x = direction * .065;
        molecule.add(atom);
      }
      connector([-.04, 0, 0], [.04, 0, 0], '#a4dfef', .023, molecule);
      peroxide.add(molecule);
    }
    scene.add(peroxide);

    let moleculeReady = false;
    try {
      const response = await fetch('./assets/heme-original.pdb');
      if (!response.ok) throw new Error(`Source structure HTTP ${response.status}`);
      const pdb = await response.text();
      const atoms = [];
      const bonds = new Set();
      const serials = new Map();
      for (const line of pdb.split(/\r?\n/)) {
        if (!/^(ATOM  |HETATM)/.test(line)) continue;
        const serial = Number(line.slice(6, 11));
        const xyz = [30, 38, 46].map(start => Number(line.slice(start, start + 8)));
        if (!xyz.every(Number.isFinite)) throw new Error('Invalid source coordinates');
        serials.set(serial, atoms.length);
        atoms.push(xyz);
      }
      if (atoms.length !== 1213) throw new Error('Source atom count differs from the original bundle');
      for (const line of pdb.split(/\r?\n/)) {
        if (!line.startsWith('CONECT')) continue;
        const indices = line.slice(6).match(/.{1,5}/g)?.map(value => serials.get(Number(value.trim()))) || [];
        if (indices[0] === undefined) continue;
        for (const index of indices.slice(1)) if (index !== undefined && index !== indices[0]) bonds.add([indices[0], index].sort((a, b) => a - b).join(':'));
      }
      const center = new THREE.Vector3();
      atoms.forEach(atom => center.add(new THREE.Vector3(...atom)));
      center.multiplyScalar(1 / atoms.length);
      const scale = .061;
      const coordinates = atoms.map(atom => new THREE.Vector3(...atom).sub(center).multiplyScalar(scale));
      const colorFor = index => index >= 1140 ? '#f7bc60' : [0, 284, 570, 854].some(start => index >= start && index < start + 54) ? '#b9a0f2' : '#56d5e9';
      const atomMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(.026, 8, 6), new THREE.MeshStandardMaterial({ roughness: .4, metalness: .12 }), atoms.length);
      const object = new THREE.Object3D();
      atoms.forEach((atom, i) => {
        object.position.copy(coordinates[i]);
        object.updateMatrix();
        atomMesh.setMatrixAt(i, object.matrix);
        atomMesh.setColorAt(i, new THREE.Color(colorFor(i)));
      });
      sourceBundle.add(atomMesh);
      const positions = [];
      const colors = [];
      bonds.forEach(pair => {
        const [a, b] = pair.split(':').map(Number);
        positions.push(...coordinates[a].toArray(), ...coordinates[b].toArray());
        colors.push(...new THREE.Color(colorFor(a)).toArray(), ...new THREE.Color(colorFor(b)).toArray());
      });
      const bondGeometry = new THREE.BufferGeometry();
      bondGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      bondGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      sourceBundle.add(new THREE.LineSegments(bondGeometry, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .9 })));
      viewport.dataset.sourceAtoms = String(atoms.length);
      viewport.dataset.sourceBonds = String(bonds.size);
      moleculeReady = true;
    } catch (error) {
      biosensor.querySelector('#biosensor-source-note').textContent = 'Source inset unavailable. The original molecular viewer above remains separate.';
      viewport.dataset.sourceError = 'true';
      console.warn('Assay illustration source inset:', error.message);
    }

    let raf = 0;
    let visible = false;
    let animating = false;
    let activeStep = 0;
    let activeStart = 0;
    const liquidStart = new THREE.Color('#416e7d');
    const liquidGreen = new THREE.Color('#50af7c');
    const requestFrame = () => { if (!raf) raf = requestAnimationFrame(frame); };
    function drawState(step, progress, moving) {
      const signal = step >= 2 ? (moving ? progress : 1) : 0;
      liquidMaterial.color.copy(liquidStart).lerp(liquidGreen, signal);
      meniscus.material.color.copy(liquidMaterial.color).multiplyScalar(1.2);
      beam.visible = step >= 2;
      beam.material.opacity = .19 + .37 * (step >= 2 ? (moving ? progress : 1) : 0);
      detector.position.y = -.1;
      emitter.material.color.set(step >= 2 ? '#294b57' : '#1c3445');
      standards.visible = step === 3;
      pipette.position.y = 4.28 + (moving && step === 0 ? .10 * Math.sin(progress * Math.PI) : 0);
      sourceBundle.rotation.y = -.45 + (moving && step === 1 ? .22 * Math.sin(progress * Math.PI) : 0);
      peroxide.visible = moving && step <= 1;
      peroxide.children.forEach((molecule, i) => {
        const offset = (progress * 1.5 + i * .11) % 1;
        if (step === 0) molecule.position.set(.1 + .12 * Math.sin(i), 3.02 - offset * 1.45, .1 + .12 * Math.cos(i));
        else molecule.position.set(.35 + Math.cos(offset * Math.PI * 2 + i) * .38, .55 + .58 * offset, .1 + Math.sin(offset * Math.PI * 2 + i) * .23);
        molecule.rotation.z = i + progress * 1.2;
      });
      viewport.dataset.currentStep = String(step);
      viewport.dataset.animating = String(moving);
      viewport.dataset.sourceInsetReady = String(moleculeReady);
    }
    function render() { renderer.render(scene, camera); }
    function frame(now) {
      raf = 0;
      if (!visible || document.hidden || !animating) return;
      const progress = Math.min(1, (now - activeStart) / 1450);
      drawState(activeStep, progress, progress < 1);
      render();
      if (progress < 1) requestFrame();
      else animating = false;
    }
    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      animating = false;
      drawState(activeStep, 1, false);
    }
    function show(step, animate) {
      stop();
      activeStep = step;
      if (animate && visible && !document.hidden) {
        animating = true;
        activeStart = performance.now();
        drawState(step, 0, true);
        requestFrame();
      } else drawState(step, 1, false);
      render();
    }
    function resize() {
      const width = Math.max(1, viewport.clientWidth);
      const height = Math.max(1, viewport.clientHeight);
      const aspect = width / height;
      const halfHeight = Math.max(3.25, 5.6 / aspect);
      camera.left = -halfHeight * aspect;
      camera.right = halfHeight * aspect;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      render();
    }
    new ResizeObserver(resize).observe(viewport);
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      viewport.dataset.sceneVisible = String(visible);
      if (!visible) stop();
      else { drawState(activeStep, 1, false); render(); }
    }, { threshold: .05 }).observe(viewport);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (visible) render();
    });
    renderer.domElement.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      stop();
      biosensor.querySelector('#biosensor-fallback').hidden = false;
      viewport.dataset.sceneReady = 'false';
    });
    renderer.domElement.addEventListener('webglcontextrestored', () => {
      biosensor.querySelector('#biosensor-fallback').hidden = true;
      viewport.dataset.sceneReady = 'true';
      resize();
    });
    resize();
    drawState(0, 1, false);
    render();
    biosensor.querySelector('#biosensor-fallback').hidden = true;
    viewport.dataset.sceneReady = 'true';
    return { show };
  }

  // Keep captions usable if WebGL, the local renderer, or the molecular inset is unavailable.
  if ('IntersectionObserver' in window) {
    const lazy = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      lazy.disconnect();
      buildScene().then(api => { sceneApi = api; sceneApi.show(current, false); }).catch(error => {
        biosensor.querySelector('#biosensor-fallback').hidden = false;
        viewport.dataset.sceneReady = 'false';
        viewport.dataset.loadError = 'true';
        replay.disabled = true;
        console.warn('3D assay illustration unavailable:', error.message);
      });
    }, { rootMargin: '400px' });
    lazy.observe(viewport);
  } else buildScene().then(api => { sceneApi = api; sceneApi.show(current, false); }).catch(() => { replay.disabled = true; });
}
