import * as ThreeModule from './vendor/three.module.js';

// All geometry in this module is an application schematic. The engine owns the
// source molecule; this module never changes, replaces, or morphs source atoms.
export function createApplicationContext({ THREE = ThreeModule, scene, project = 'heme', reducedMotion = false } = {}) {
  if (!scene?.add) throw new TypeError('Application context requires a Three.js scene.');
  const key = String(typeof project === 'string' ? project : project?.id ?? project?.key ?? project?.slug ?? project?.type ?? 'heme').toLowerCase();
  const kind = key.includes('dhfr') ? 'dhfr' : 'heme';
  const group = new THREE.Group();
  group.name = `application-context-${kind}`;
  group.visible = false;
  group.userData = {
    scientificStatus: 'proposed-application',
    notToScale: true,
    sourceAtomsModified: false,
    deliveryRepresents: kind === 'dhfr' ? 'Candidate delivery concept only. The enzyme complex is an enlarged structural view, not an injected object.' : undefined,
  };
  scene.add(group);

  const geometries = new Set();
  const materials = new Set();
  const palette = { navy: 0x071724, cyan: 0x4ce3ef, blue: 0x2c719a, amber: 0xf1b652, violet: 0xa790f4, green: 0x54e4ac, white: 0xc5f6ff };
  const clamp = (v) => Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const geometry = (g) => { geometries.add(g); return g; };
  const material = (values = {}) => {
    const m = new THREE.MeshPhysicalMaterial({ roughness: 0.3, metalness: 0.05, transparent: true, ...values });
    m.userData.applicationBaseOpacity = values.opacity ?? 1;
    m.userData.applicationDepthWrite = values.depthWrite ?? true;
    materials.add(m);
    return m;
  };
  const sphereGeometry = geometry(new THREE.SphereGeometry(1, 20, 14));
  const beadGeometry = geometry(new THREE.SphereGeometry(1, 10, 8));
  const cylinderGeometry = geometry(new THREE.CylinderGeometry(1, 1, 1, 14));
  const dummy = new THREE.Object3D();
  const point = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const v = (x, y, z) => new THREE.Vector3(x, y, z);
  const addMesh = (parent, g, m, position, scale) => {
    const mesh = new THREE.Mesh(g, m);
    if (position) mesh.position.copy(position);
    if (scale) mesh.scale.copy(scale);
    parent.add(mesh);
    return mesh;
  };
  const sphere = (parent, m, position, radius) => addMesh(parent, sphereGeometry, m, position, v(radius, radius, radius));
  const rod = (parent, a, b, radius, m) => {
    const direction = b.clone().sub(a);
    const mesh = addMesh(parent, cylinderGeometry, m, a.clone().add(b).multiplyScalar(0.5), v(radius, direction.length(), radius));
    mesh.quaternion.setFromUnitVectors(up, direction.normalize());
    return mesh;
  };
  const tube = (parent, points, radius, m, tubularSegments = 64) => {
    const curve = new THREE.CatmullRomCurve3(points.map(p => p.clone()));
    addMesh(parent, geometry(new THREE.TubeGeometry(curve, tubularSegments, radius, 8, false)), m);
    return curve;
  };
  const torus = (parent, position, radius, thickness, m, horizontal = false) => {
    const mesh = addMesh(parent, geometry(new THREE.TorusGeometry(radius, thickness, 8, 48)), m, position);
    if (horizontal) mesh.rotation.x = -Math.PI / 2;
    return mesh;
  };
  const setOpacity = (parent, alpha) => {
    if (!parent.userData.applicationMaterials) {
      const collection = new Set();
      parent.traverse(o => { if (o.material) for (const m of Array.isArray(o.material) ? o.material : [o.material]) collection.add(m); });
      parent.userData.applicationMaterials = [...collection];
    }
    for (const m of parent.userData.applicationMaterials) {
      m.opacity = (m.userData.applicationBaseOpacity ?? 1) * clamp(alpha);
      m.depthWrite = !!m.userData.applicationDepthWrite && alpha > 0.98;
    }
    parent.visible = alpha > 0.005;
  };
  const particleStream = (parent, curve, count, radius, color, speed = 0.05) => {
    const m = material({ color, emissive: color, emissiveIntensity: 0.5, roughness: 0.2, opacity: 0.9, depthWrite: false });
    const mesh = new THREE.InstancedMesh(beadGeometry, m, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    parent.add(mesh);
    const update = (time, start = 0, end = 1) => {
      for (let i = 0; i < count; i++) {
        const t = start + (((i + 0.35) / count + time * speed) % 1) * (end - start);
        curve.getPoint(t, point);
        dummy.position.copy(point);
        dummy.scale.setScalar(radius * (0.8 + 0.2 * Math.sin(i * 1.7)));
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    };
    update(0);
    return { mesh, update };
  };

  function createHeme() {
    const content = new THREE.Group();
    content.scale.setScalar(0.8);
    content.position.x = 1;
    const platform = new THREE.Group();
    const liquid = new THREE.Group();
    const sample = new THREE.Group();
    const readout = new THREE.Group();
    group.add(content);
    content.add(platform, liquid, sample, readout);
    const dark = material({ color: 0x071b2b, metalness: 0.16, roughness: 0.72 });
    const edge = material({ color: palette.cyan, emissive: 0x126a85, emissiveIntensity: 0.6, metalness: 0.15, roughness: 0.3, opacity: 0.65 });
    const glass = material({ color: 0x397d94, roughness: 0.2, metalness: 0, opacity: 0.075, depthWrite: false, side: THREE.DoubleSide, clearcoat: 0.35 });
    const channelMat = material({ color: palette.cyan, emissive: 0x086778, emissiveIntensity: 0.8, opacity: 0.74, depthWrite: false });
    const gold = material({ color: palette.amber, metalness: 0.78, roughness: 0.3 });
    const fluid = material({ color: palette.cyan, emissive: 0x125b71, emissiveIntensity: 0.3, roughness: 0.08, opacity: 0.66, clearcoat: 1, depthWrite: false });
    const reporter = material({ color: palette.amber, emissive: 0x67502c, emissiveIntensity: 0.7, roughness: 0.2, opacity: 0.75, depthWrite: false });

    // Raised, beveled substrate and a transparent cover form a spatial device,
    // rather than a plane, icon, or dashboard card.
    const roundedRectangle = (w, h, radius) => {
      const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
      s.moveTo(x + radius, y); s.lineTo(x + w - radius, y);
      s.quadraticCurveTo(x + w, y, x + w, y + radius); s.lineTo(x + w, y + h - radius);
      s.quadraticCurveTo(x + w, y + h, x + w - radius, y + h); s.lineTo(x + radius, y + h);
      s.quadraticCurveTo(x, y + h, x, y + h - radius); s.lineTo(x, y + radius);
      s.quadraticCurveTo(x, y, x + radius, y);
      return s;
    };
    const plateGeometry = geometry(new THREE.ExtrudeGeometry(roundedRectangle(23, 13, 1.3), { depth: 0.9, bevelEnabled: true, bevelThickness: 0.16, bevelSize: 0.17, bevelSegments: 2, steps: 1, curveSegments: 8 }));
    const base = addMesh(platform, plateGeometry, dark, v(10.8, -8.8, -1.4));
    base.rotation.x = -Math.PI / 2;
    const lid = addMesh(platform, geometry(new THREE.BoxGeometry(22, 0.24, 11.8)), glass, v(10.8, -6.7, -1.4));
    lid.rotation.y = 0.015;
    for (const z of [-7.35, 4.55]) rod(platform, v(0.2, -7.8, z), v(21.4, -7.8, z), 0.07, edge);
    for (const x of [0.2, 21.4]) rod(platform, v(x, -7.8, -7.35), v(x, -7.8, 4.55), 0.07, edge);
    for (let i = 0; i < 7; i++) addMesh(platform, geometry(new THREE.BoxGeometry(0.55, 0.2, 2)), gold, v(16 + i * 0.85, -7.85, 5.8));
    for (const [x, z] of [[1.8, 2.8], [18.7, -5]]) {
      addMesh(platform, geometry(new THREE.CylinderGeometry(1.32, 1.32, 0.18, 32)), dark, v(x, -7.5, z));
      torus(platform, v(x, -7.35, z), 1.22, 0.09, gold, true);
    }
    const channelPoints = [v(1.8, -7.2, 2.8), v(4.5, -7.2, 2.8), v(5.6, -7.2, 0), v(10.2, -7.2, 0), v(13.8, -7.2, -1), v(15.5, -7.2, -4.9), v(18.7, -7.2, -5)];
    const flowCurve = tube(platform, channelPoints, 0.55, glass, 96);
    tube(liquid, channelPoints, 0.32, channelMat, 96);
    const stream = particleStream(liquid, flowCurve, 26, 0.13, palette.cyan, 0.055);
    const sensingWell = sphere(readout, reporter, v(12.2, -7.18, -0.55), 1.2);
    sensingWell.scale.y = 0.2;
    torus(readout, v(12.2, -7.1, -0.55), 1.32, 0.08, gold, true);
    const outlet = sphere(readout, reporter, v(18.7, -7.18, -5), 0.98);
    outlet.scale.y = 0.16;

    // A proposed immobilization/docking region is beside the retained molecule.
    // The bridge is device geometry, not a new bond to a source atom.
    torus(platform, v(-5.5, -8.1, 0), 3.15, 0.11, gold, true);
    tube(platform, [v(-2.4, -8.1, 0), v(-0.7, -8.1, 0), v(0.7, -7.6, 1.5), v(1.8, -7.3, 2.8)], 0.09, gold, 32);
    const support = addMesh(platform, geometry(new THREE.CylinderGeometry(3.5, 3.7, 0.42, 40)), glass, v(-5.5, -8.4, 0));
    support.rotation.y = 0.3;

    const dropPoints = [new THREE.Vector2(0, -1), new THREE.Vector2(0.5, -0.9), new THREE.Vector2(0.86, -0.35), new THREE.Vector2(0.87, 0.15), new THREE.Vector2(0.58, 0.85), new THREE.Vector2(0.1, 1.9), new THREE.Vector2(0, 2.2)];
    const drop = addMesh(sample, geometry(new THREE.LatheGeometry(dropPoints, 32)), fluid, v(1.8, 4.5, 2.8));
    const sampleArc = tube(sample, [v(-18, 9, 1), v(-10, 10, 6), v(-1, 7, 7), v(1.8, 2, 2.8)], 0.035, material({ color: palette.cyan, emissive: palette.cyan, emissiveIntensity: 0.5, opacity: 0.23, depthWrite: false }), 64);
    const sampleBeads = particleStream(sample, sampleArc, 6, 0.13, palette.cyan, 0.04);
    const readoutArc = tube(readout, [v(18.7, -7, -5), v(21, -4, -6), v(20, 1, -7), v(16.5, 3.5, -8)], 0.045, material({ color: palette.green, emissive: palette.green, emissiveIntensity: 0.6, opacity: 0.5, depthWrite: false }), 48);
    const outputBeads = particleStream(readout, readoutArc, 7, 0.12, palette.green, 0.045);
    const opticalRing = torus(readout, v(16.5, 3.5, -8), 1.7, 0.09, material({ color: palette.green, emissive: palette.green, emissiveIntensity: 0.8, opacity: 0.6, depthWrite: false }));
    opticalRing.rotation.y = -0.35;

    return {
      setProgress(p) {
        const entering = ease(0, 0.22, p);
        content.position.y = mix(1, 4, entering);
        setOpacity(platform, entering);
        setOpacity(sample, ease(0, 0.12, p) * (1 - 0.78 * ease(0.55, 0.8, p)));
        setOpacity(liquid, ease(0.025, 0.2, p));
        setOpacity(readout, ease(0.08, 0.4, p));
        drop.position.y = mix(4.5, -7, ease(0.08, 0.52, p));
        drop.scale.setScalar(mix(1.1, 0.12, ease(0.4, 0.55, p)));
        reporter.color.setHex(palette.amber).lerp(new THREE.Color(palette.green), ease(0.48, 0.8, p));
      },
      update(time) { stream.update(time); sampleBeads.update(time); outputBeads.update(time); },
      stage(p) {
        if (p < 0.28) return { id: 'sample', label: 'From sample to device', status: 'Proposed assay; not an observed experiment' };
        if (p < 0.66) return { id: 'assay', label: 'A proposed peroxide-reporting assay', status: 'Conceptual microfluidic integration; no measured performance' };
        return { id: 'reporter', label: 'A chemical signal to test', status: 'Proposed ABTS reporting; no calibration or detection limit claimed' };
      },
    };
  }

  function createDhfr() {
    const body = new THREE.Group();
    const delivery = new THREE.Group();
    const cell = new THREE.Group();
    const nucleus = new THREE.Group();
    const pathway = new THREE.Group();
    group.add(body, delivery, cell, nucleus, pathway);
    body.scale.setScalar(0.62);
    body.position.set(7, 0, -6.08);
    const bodyMat = material({ color: 0x6cd1e4, emissive: 0x166176, emissiveIntensity: 0.6, opacity: 0.15, roughness: 0.3, depthWrite: false, side: THREE.DoubleSide });
    const outlineMat = material({ color: palette.cyan, emissive: palette.cyan, emissiveIntensity: 0.5, opacity: 0.58, depthWrite: false });
    const bodyOrigin = v(0, 0, -16);
    const profile = [[0, -10.5], [3.8, -10.5], [4.3, -8.3], [3.4, -4.2], [4.5, 0], [5.1, 4.7], [4, 7], [1.55, 8.7], [1.35, 9.5], [0, 9.5]].map(([x, y]) => new THREE.Vector2(x, y));
    addMesh(body, geometry(new THREE.LatheGeometry(profile, 36)), bodyMat, bodyOrigin);
    sphere(body, bodyMat, v(0, 12, -16), 2.55).scale.set(2.45, 3.05, 2.2);
    const headOutline = torus(body, v(0, 12, -16), 2.5, 0.055, outlineMat);
    headOutline.scale.set(1, 1.2, 0.9);
    headOutline.rotation.y = 0.15;
    for (const side of [-1, 1]) {
      rod(body, v(side * 4.3, 5.5, -16), v(side * 7.2, -5.4, -15.6), 0.94, bodyMat);
      sphere(body, bodyMat, v(side * 4.3, 5.5, -16), 1.15);
      sphere(body, bodyMat, v(side * 7.2, -5.4, -15.6), 0.9);
      rod(body, v(side * 2.05, -9.3, -16), v(side * 2.8, -17.5, -15.6), 1.28, bodyMat);
      tube(body, [v(side * 1.5, 9, -16), v(side * 4.9, 5.1, -15.9), v(side * 4.1, -2, -16), v(side * 3.6, -6, -16), v(side * 4, -10.4, -16)], 0.065, outlineMat, 56);
      tube(body, [v(side * 4.3, 5.5, -15.6), v(side * 6.2, 0, -15.2), v(side * 7.2, -5.4, -15)], 0.045, outlineMat, 32);
      rod(body, v(side * 2.05, -9.3, -15.2), v(side * 2.8, -17.5, -15), 0.045, outlineMat);
    }
    const deliveryCurve = tube(delivery, [v(-24, 8, 7), v(-19, 7, 0), v(-10, 5, -11), v(-4, 1, -9), v(-3, -1, -3)], 0.045, material({ color: palette.violet, emissive: palette.violet, emissiveIntensity: 0.45, opacity: 0.3, depthWrite: false }), 96);
    const candidateStream = particleStream(delivery, deliveryCurve, 7, 0.22, palette.violet, 0.035);
    const candidateHalo = torus(delivery, v(-3, -1, -3), 0.92, 0.075, material({ color: palette.violet, emissive: palette.violet, emissiveIntensity: 0.5, opacity: 0.5, depthWrite: false }));
    candidateHalo.rotation.y = Math.PI / 3;

    const cellMat = material({ color: 0x3fc6d7, emissive: 0x103e55, emissiveIntensity: 0.5, roughness: 0.18, opacity: 0.055, depthWrite: false, side: THREE.DoubleSide });
    const cellGeometry = geometry(new THREE.SphereGeometry(17.6, 44, 28));
    const positions = cellGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
      const factor = 1 + 0.035 * Math.sin(y * 0.23 + z * 0.16) * Math.cos(x * 0.19);
      positions.setXYZ(i, x * factor, y * factor * 0.91, z * factor * 0.85);
    }
    cellGeometry.computeVertexNormals();
    addMesh(cell, cellGeometry, cellMat);
    const membraneMat = material({ color: palette.cyan, emissive: 0x1a566e, emissiveIntensity: 0.4, opacity: 0.15, depthWrite: false });
    for (const tilt of [-0.55, 0.6]) {
      const ring = torus(cell, v(0, 0, 0), 17.55, 0.035, membraneMat);
      ring.scale.set(1, 0.91, 0.85);
      ring.rotation.y = tilt;
      ring.rotation.z = 0.1;
    }
    const membraneBeads = new THREE.InstancedMesh(beadGeometry, material({ color: palette.cyan, emissive: 0x1b5468, emissiveIntensity: 0.3, opacity: 0.3, depthWrite: false }), 84);
    membraneBeads.frustumCulled = false;
    for (let i = 0; i < 84; i++) {
      const y = 1 - 2 * (i + 0.5) / 84, r = Math.sqrt(1 - y * y), phi = i * 2.399963229728653;
      dummy.position.set(17.7 * r * Math.cos(phi), 16 * y, 15 * r * Math.sin(phi));
      dummy.scale.setScalar(0.12);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      membraneBeads.setMatrixAt(i, dummy.matrix);
    }
    cell.add(membraneBeads);

    const nucleusPosition = v(9.6, 3.3, -6.5);
    const nucleusShell = sphere(nucleus, material({ color: palette.violet, emissive: 0x30245d, emissiveIntensity: 0.55, opacity: 0.11, depthWrite: false, side: THREE.DoubleSide, roughness: 0.18 }), nucleusPosition, 4.55);
    nucleusShell.scale.y *= 1.1;
    const nucleusRim = torus(nucleus, nucleusPosition, 4.5, 0.045, material({ color: palette.violet, emissive: palette.violet, emissiveIntensity: 0.4, opacity: 0.3, depthWrite: false }));
    nucleusRim.rotation.y = -0.45;
    const dnaMat = material({ color: palette.cyan, emissive: 0x0c6872, emissiveIntensity: 0.5, opacity: 0.7 });
    const dnaOther = material({ color: palette.violet, emissive: 0x554083, emissiveIntensity: 0.5, opacity: 0.75 });
    const rungMat = material({ color: palette.amber, emissive: 0x5f4022, emissiveIntensity: 0.45, opacity: 0.65 });
    const strandA = [], strandB = [];
    for (let i = 0; i <= 48; i++) {
      const t = i / 48, a = t * Math.PI * 4;
      strandA.push(nucleusPosition.clone().add(v(Math.cos(a), (t - 0.5) * 6.2, Math.sin(a))));
      strandB.push(nucleusPosition.clone().add(v(-Math.cos(a), (t - 0.5) * 6.2, -Math.sin(a))));
    }
    tube(nucleus, strandA, 0.09, dnaMat, 96);
    tube(nucleus, strandB, 0.09, dnaOther, 96);
    for (let i = 0; i <= 48; i += 4) rod(nucleus, strandA[i], strandB[i], 0.035, rungMat);

    // These stations summarize a multistep folate/nucleotide pathway. They are
    // not a direct catalytic reaction, measured flux, or a cell-efficacy result.
    const pathwayMat = material({ color: palette.amber, emissive: 0x65451c, emissiveIntensity: 0.5, opacity: 0.42, depthWrite: false });
    const pathwayCurve = tube(pathway, [v(-10, -4.7, 2), v(-4, -5.4, 2), v(1, -4.7, 0.5), v(6.3, -3, -1.1), v(9.2, -0.5, -4.8), v(9.6, 2, -6.5)], 0.055, pathwayMat, 96);
    const precursorStream = particleStream(pathway, pathwayCurve, 15, 0.16, palette.amber, 0.045);
    for (const pos of [v(-10, -4.7, 2), v(1, -4.7, 0.5), v(9.2, -0.5, -4.8)]) {
      sphere(pathway, pathwayMat, pos, 0.42);
      const ring = torus(pathway, pos, 0.83, 0.04, pathwayMat);
      ring.rotation.y = Math.PI / 3;
    }
    const hypothesis = new THREE.Group();
    pathway.add(hypothesis);
    const hypothesisMat = material({ color: palette.violet, emissive: palette.violet, emissiveIntensity: 0.35, opacity: 0.45, depthWrite: false });
    const gate = torus(hypothesis, v(5.2, -3.5, -0.2), 1.24, 0.08, hypothesisMat);
    gate.rotation.y = 0.7;
    const gateInner = torus(hypothesis, v(5.2, -3.5, -0.2), 0.68, 0.05, hypothesisMat);
    gateInner.rotation.y = 0.7;
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3;
      rod(hypothesis, v(5.2, -3.5, -0.2), v(5.2 + Math.cos(a) * 0.85, -3.5 + Math.sin(a) * 0.85, -0.2), 0.045, hypothesisMat);
    }

    return {
      setProgress(p) {
        setOpacity(body, ease(0, 0.15, p) * (1 - 0.94 * ease(0.26, 0.62, p)));
        setOpacity(delivery, ease(0.04, 0.18, p) * (1 - 0.8 * ease(0.5, 0.8, p)));
        setOpacity(cell, ease(0.2, 0.53, p));
        setOpacity(nucleus, ease(0.45, 0.74, p));
        setOpacity(pathway, ease(0.48, 0.78, p));
        setOpacity(hypothesis, ease(0.76, 0.95, p));
        cell.scale.setScalar(mix(0.87, 1, ease(0.18, 0.65, p)));
        nucleus.scale.setScalar(mix(0.9, 1, ease(0.45, 0.8, p)));
      },
      update(time) { candidateStream.update(time); precursorStream.update(time); },
      stage(p) {
        if (p < 0.28) return { id: 'delivery', label: 'A delivery question, not a treatment claim', status: 'Candidate delivery and cellular uptake are untested' };
        if (p < 0.68) return { id: 'cell', label: 'From a candidate to a cellular hypothesis', status: 'The enzyme complex is an enlarged model; cell context is schematic' };
        return { id: 'pathway', label: 'Could inhibition affect a folate pathway?', status: 'Potential inhibition and cell effects require experiments; no cancer selectivity claimed' };
      },
    };
  }

  const context = kind === 'dhfr' ? createDhfr() : createHeme();
  let localProgress = 0;
  let visibleRequested = true;
  let elapsedTime = 0;
  let disposed = false;
  context.setProgress(0);
  group.visible = false;
  const setProgress = (progress) => {
    if (disposed) return;
    localProgress = clamp((clamp(progress) - 0.68) / 0.32);
    context.setProgress(localProgress);
    group.visible = visibleRequested && localProgress > 0.002;
    group.userData.stage = { ...context.stage(localProgress), notToScale: true, sourceAtomsModified: false };
    if (reducedMotion) context.update(0);
  };
  return {
    group,
    setProgress,
    setReducedMotion(value) {
      if (disposed) return;
      reducedMotion = !!value;
      context.setProgress(localProgress);
      if (reducedMotion) context.update(0);
    },
    setVisible(visible) { visibleRequested = !!visible; group.visible = visibleRequested && localProgress > 0.002 && !disposed; },
    getStage() { return { ...context.stage(localProgress), notToScale: true, sourceAtomsModified: false }; },
    update(delta, elapsed) {
      if (disposed || !group.visible || reducedMotion) return;
      elapsedTime = Number.isFinite(elapsed) ? elapsed : elapsedTime + Math.min(0.05, Math.max(0, delta || 0));
      context.update(elapsedTime);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      scene.remove(group);
      group.traverse(o => { if (o.isInstancedMesh && typeof o.dispose === 'function') o.dispose(); });
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      group.clear();
    },
  };
}

export default createApplicationContext;
