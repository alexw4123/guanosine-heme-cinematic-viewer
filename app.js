/* Heme research viewer. Source coordinates are never changed. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const viewport = $('molecular-viewport');
  const groupButtons = [...document.querySelectorAll('[data-component]')];
  const modeButtons = [...document.querySelectorAll('[data-mode]')];
  const topicButtons = [...document.querySelectorAll('[data-topic]')].filter(element => element.tagName === 'BUTTON');
  const research = window.HEME_RESEARCH || {topics:{},figures:[]};
  const sourcePath = 'assets/heme-original.pdb';
  const caps = [[0,53],[284,337],[570,623],[854,907]];
  const isCap = index => caps.some(([start,end]) => index >= start && index <= end);
  const groupOf = index => index >= 1140 ? 'heme' : isCap(index) ? 'guanosine' : 'peptide';
  const sourceSegmentOf = index => index < 284 ? 'PEPA' : index < 570 ? 'PEPB' : index < 854 ? 'PEPC' : index < 1140 ? 'PEPD' : 'HEMA';
  const info = {
    all: { name:'Whole structure', count:1213, heading:'Inside the PEG2 model', copy:'Heme sits among four peptide helices. Histidine side chains on two helices face its iron center, Fe; guanosines connect through PEG2 linkers.', accent:'#f7bc60' },
    peptide: { name:'Peptide', count:924, heading:'Four peptide helices', copy:'The model contains four 15-residue peptide chains. Histidine at peptide position 8 on segments A and C faces heme iron; segments B and D have alanine at that position.', accent:'#56d5e9' },
    guanosine: { name:'Guanosine', count:216, heading:'Guanosine caps and PEG2 linkers', copy:'Each peptide is linked to a guanosine cap. The caps were intended to organize a guanine quartet; persistent quartet contacts were not supported by the reported trajectory checks.', accent:'#b9a0f2' },
    heme: { name:'Heme + Fe', count:73, heading:'Heme and its iron center, Fe', copy:'The heme cofactor contains the central iron atom. Histidine side chains on peptide segments A and C face Fe. Their two Fe–His connections are imposed bonds in this model.', accent:'#f7bc60' }
  };
  const state = { selected:'all', mode:'atomic', topic:'question', isolated:false, ready:false, picked:null };
  let stage, component, initialOrientation, colorScheme;
  let loadGeneration = 0;
  let touchStart = null;
  let lastTap = { index:-1, time:0 };

  function enableControls(enabled) {
    ['structure-controls','representation-controls','camera-controls'].forEach(id => { $(id).disabled = !enabled; });
    $('isolate-selected').disabled = !enabled || state.selected === 'all';
  }

  function updateOrientation() {
    if (!stage || !state.ready) return;
    const elements = stage.viewerControls.getOrientation().elements;
    viewport.dataset.viewOrientation = JSON.stringify(Array.from(elements));
  }

  function updateSelectionUI() {
    const current = info[state.selected];
    groupButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.component === state.selected)));
    modeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === state.mode)));
    viewport.dataset.selectedComponent = state.selected;
    viewport.dataset.selectedAtomCount = String(current.count);
    viewport.dataset.isolated = String(state.isolated);
    viewport.dataset.representation = state.mode;
    $('component-heading').textContent = current.heading;
    $('component-copy').textContent = current.copy;
    $('component-description').style.borderColor = current.accent;
    $('metadata-selection').textContent = `${current.name} · ${current.count.toLocaleString()} source atoms`;
    $('selection-summary').textContent = state.selected === 'all' ? 'All 1,213 source atoms' : `${current.count.toLocaleString()} ${state.selected === 'heme' ? 'heme' : state.selected} source atoms${state.isolated ? ' · isolated' : ' · whole structure retained'}`;
    $('isolate-selected').checked = state.isolated;
    $('isolate-selected').disabled = !state.ready || state.selected === 'all';
  }

  function selectedIndices(group) {
    return Array.from({length:1213}, (_,index) => index).filter(index => group === 'all' || groupOf(index) === group);
  }
  function atomSelection(indices) { return indices.length ? '@' + indices.join(',') : 'NONE'; }

  function renderRepresentation() {
    if (!component || !state.ready) return;
    component.removeAllRepresentations();
    const allowed = selectedIndices(state.isolated ? state.selected : 'all');
    const atomicParams = {
      colorScheme, multipleBond:'symmetric', radiusScale:0.38,
      aspectRatio:2.0, bondSpacing:0.75, quality:'high',
      opacity:1, disablePicking:false
    };
    if (state.mode === 'atomic') {
      // One whole-molecule representation retains the explicit cross-component Fe–His bonds.
      component.addRepresentation('ball+stick', {...atomicParams, sele:atomSelection(allowed)});
    } else {
      const peptideIndices = allowed.filter(index => groupOf(index) === 'peptide');
      if (peptideIndices.length) component.addRepresentation('cartoon', {
        sele:atomSelection(peptideIndices), colorScheme, quality:'high',
        smoothSheet:true, scale:1.1, disablePicking:false
      });
      const atomicIndices = [];
      component.structure.eachAtom(atom => {
        const index = atom.index;
        const histidine = ['HSD','HIS','HSE'].includes(atom.resname) && atom.resno === 9;
        if (allowed.includes(index) && (groupOf(index) !== 'peptide' || histidine)) atomicIndices.push(index);
      });
      if (atomicIndices.length) component.addRepresentation('ball+stick', {...atomicParams, sele:atomSelection(atomicIndices)});
    }
    // Selection and representation changes deliberately never call autoView/orient/center.
    updateSelectionUI();
    updateOrientation();
  }

  function setTopic(key) {
    const topic = research.topics[key];
    if (!topic) return;
    state.topic = key;
    viewport.dataset.topic = key;
    $('topic-reading').dataset.currentTopic = key;
    topicButtons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.topic === key)));
    $('topic-index').textContent = topic.index;
    $('topic-heading').textContent = topic.heading;
    $('topic-lead').textContent = topic.lead;
    $('topic-copy').textContent = topic.copy;
    $('topic-source').href = topic.source;
    $('topic-source').textContent = topic.sourceLabel;
  }

  function selectComponent(group, picked = null, topicKey = null) {
    if (!state.ready || !info[group]) return;
    state.selected = group;
    // Ordinary component/atom selection always returns to a complete, dimmed-context view.
    state.isolated = false;
    if (picked) {
      state.picked = picked;
      viewport.dataset.lastPickedAtom = String(picked.index);
      const label = `Atom ${picked.index + 1} · ${picked.atomname} · ${picked.resname} ${picked.resno} · ${picked.segid || 'source model'}`;
      $('metadata-picked').textContent = label;
      $('picked-label').textContent = label;
    }
    renderRepresentation();
    setTopic(topicKey || {all:'question',peptide:'peptide',guanosine:'cap',heme:'heme'}[group]);
  }

  function onPicked(proxy) {
    if (!state.ready || !proxy) return;
    const atom = proxy.atom || proxy.closestBondAtom;
    if (!atom || atom.index < 0 || atom.index >= 1213) return;
    const now = performance.now();
    if (lastTap.index === atom.index && now - lastTap.time < 180) return;
    // Copy immediately: NGL atom proxies are reused while representations are rebuilt.
    const picked = { index:atom.index, atomname:atom.atomname, resname:atom.resname, resno:atom.resno, segid:sourceSegmentOf(atom.index), element:atom.element };
    lastTap = { index:picked.index, time:now };
    selectComponent(groupOf(picked.index), picked);
  }

  function rotate(direction) {
    if (!state.ready) return;
    const movement = {left:[-12,0],right:[12,0],up:[0,-12],down:[0,12]}[direction];
    stage.trackballControls.rotate(...movement);
    updateOrientation();
  }

  function makeStage() {
    if (!window.NGL) throw new Error('Viewer library unavailable');
    stage = new NGL.Stage('ngl-canvas', {
      backgroundColor:'#07131f', quality:'high', sampleLevel:0,
      cameraType:'perspective', cameraFov:36,
      lightIntensity:1.0, ambientIntensity:0.65,
      clipNear:0, clipFar:100, fogNear:65, fogFar:100,
      tooltip:false
    });
    // NGL focuses its own canvas on pointer input; keep that focus in the accessibility tree.
    $('ngl-canvas').removeAttribute('aria-hidden');
    const canvas = stage.viewer.renderer?.domElement;
    if (canvas) {
      canvas.setAttribute('role','img');
      canvas.setAttribute('aria-label','Interactive atomic model of the four-helix heme bundle. Arrow keys rotate, plus and minus zoom, and Home resets the view.');
    }
    // Disable NGL defaults that recenter, animate, measure, or transform source components.
    ['clickPick-left','clickPick-middle','clickPick-right','clickPick-ctrl-left',
      'drag-ctrl-shift-right','drag-ctrl-shift-left','hoverPick'].forEach(binding => stage.mouseControls.remove(binding));
    stage.keyControls.clear();
    stage.spinAnimation.pause(true);
    stage.rockAnimation.pause(true);
    stage.signals.clicked.add(onPicked);
    stage.viewerControls.signals.changed.add(updateOrientation);
    // Camera group matrices are finalized by rendering; reflect that real matrix in the DOM too.
    stage.viewer.signals.rendered.add(updateOrientation);
    const colors = { peptide:0x56d5e9, guanosine:0xb9a0f2, heme:0xf7bc60 };
    colorScheme = NGL.ColormakerRegistry.addScheme(function () {
      this.atomColor = atom => {
        const group = groupOf(atom.index);
        let color = colors[group];
        if (atom.element === 'FE') color = 0xffe4a7;
        if (state.selected !== 'all' && group !== state.selected && !state.isolated) {
          const amount = 0.39;
          const mix = (channel,background) => Math.round(background + (channel-background)*amount);
          color = (mix((color>>16)&255,7)<<16) | (mix((color>>8)&255,19)<<8) | mix(color&255,31);
        }
        return color;
      };
    });
  }

  async function loadStructure() {
    const generation = ++loadGeneration;
    state.ready = false;
    viewport.dataset.modelReady = 'false';
    enableControls(false);
    $('load-state').hidden = false;
    $('load-message').textContent = 'Opening the source structure…';
    $('retry-load').hidden = true;
    $('fallback-link').hidden = true;
    try {
      if (!stage) makeStage();
      if (component) { stage.removeComponent(component); component = null; }
      const loaded = await stage.loadFile(sourcePath, {ext:'pdb',defaultRepresentation:false,inferBonds:'none'});
      if (generation !== loadGeneration) { stage.removeComponent(loaded); return; }
      component = loaded;
      const atoms = component.structure.atomCount;
      const bonds = component.structure.bondCount;
      if (atoms !== 1213 || bonds !== 1232) throw new Error('Source structure counts differ');
      viewport.dataset.atomCount = String(atoms);
      viewport.dataset.bondCount = String(bonds);
      $('atom-count').textContent = `${atoms.toLocaleString()} atoms`;
      $('bond-count').textContent = `${bonds.toLocaleString()} explicit bonds`;
      state.ready = true;
      state.selected = research.topics[state.topic]?.group || state.selected;
      renderRepresentation();
      stage.handleResize();
      component.autoView(0);
      initialOrientation = stage.viewerControls.getOrientation().clone();
      viewport.dataset.modelReady = 'true';
      updateOrientation();
      enableControls(true);
      $('load-state').hidden = true;
    } catch (error) {
      if (generation !== loadGeneration) return;
      state.ready = false;
      viewport.dataset.modelReady = 'false';
      enableControls(false);
      $('load-message').textContent = 'The structure could not open here. Try again, or explore the original source viewer.';
      $('retry-load').hidden = false;
      $('fallback-link').hidden = false;
      // Keep the reader-facing failure concise; no stack trace is inserted into the page.
      console.warn('Source molecular viewer did not load:', error.message);
    }
  }

  groupButtons.forEach(button => button.addEventListener('click', () => selectComponent(button.dataset.component)));
  topicButtons.forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.topic;
    if (!research.topics[key]) return;
    if (state.ready) selectComponent(research.topics[key].group,null,key);
    else setTopic(key);
  }));
  modeButtons.forEach(button => button.addEventListener('click', () => {
    if (!state.ready) return;
    state.mode = button.dataset.mode;
    renderRepresentation();
  }));
  document.querySelectorAll('[data-rotate]').forEach(button => button.addEventListener('click', () => rotate(button.dataset.rotate)));
  $('isolate-selected').addEventListener('change', event => {
    if (!state.ready) return;
    state.isolated = event.target.checked && state.selected !== 'all';
    renderRepresentation();
  });
  $('zoom-in').addEventListener('click', () => { if (state.ready) stage.viewerControls.zoom(0.12); });
  $('zoom-out').addEventListener('click', () => { if (state.ready) stage.viewerControls.zoom(-0.12); });
  function resetCamera() { if (state.ready && initialOrientation) { stage.viewerControls.orient(initialOrientation); updateOrientation(); } }
  $('reset-camera').addEventListener('click', resetCamera);
  $('retry-load').addEventListener('click', loadStructure);
  function focusStructure(event) {
    event.preventDefault();
    $('structure-controls').scrollIntoView({block:'center',behavior:'instant'});
    if (state.ready) groupButtons[0].focus({preventScroll:true});
    else viewport.focus({preventScroll:true});
  }
  $('explore-structure').addEventListener('click',focusStructure);
  document.querySelectorAll('.topic-structure-link').forEach(link => link.addEventListener('click',focusStructure));
  viewport.addEventListener('keydown', event => {
    if (!state.ready || event.altKey || event.ctrlKey || event.metaKey) return;
    const directions = {ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};
    if (directions[event.key]) { event.preventDefault(); rotate(directions[event.key]); }
    else if (event.key === '+' || event.key === '=') { event.preventDefault(); stage.viewerControls.zoom(0.12); }
    else if (event.key === '-' || event.key === '_') { event.preventDefault(); stage.viewerControls.zoom(-0.12); }
    else if (event.key === 'Home') { event.preventDefault(); resetCamera(); }
  });
  // NGL 2.4 mouse picking omits touchend clicks. Convert only a short, stationary touch to an atom pick.
  viewport.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch') return;
    touchStart = {id:event.pointerId,x:event.clientX,y:event.clientY,time:performance.now(),multiple:!event.isPrimary};
  });
  viewport.addEventListener('pointerup', event => {
    if (event.pointerType !== 'touch' || !touchStart || touchStart.id !== event.pointerId) return;
    const tap = touchStart;
    touchStart = null;
    if (!state.ready || tap.multiple || performance.now()-tap.time > 500 || Math.hypot(event.clientX-tap.x,event.clientY-tap.y)>6) return;
    const rect = $('ngl-canvas').getBoundingClientRect();
    onPicked(stage.pickingControls.pick(event.clientX-rect.left,rect.bottom-event.clientY));
  });
  viewport.addEventListener('pointercancel', () => { touchStart = null; });
  const resize = () => { if (stage) { stage.handleResize(); updateOrientation(); } };
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(viewport);
  else window.addEventListener('resize', resize);
  window.addEventListener('pagehide', event => { if (!event.persisted) { ++loadGeneration; if (stage) stage.dispose(); } });
  const figureMap = new Map(research.figures.map(figure => [figure.id,figure]));
  research.figures.forEach(figure => {
    if (!figure.container || !$(figure.container)) return;
    const wrapper = document.createElement('figure');
    wrapper.className = 'record-figure';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'figure-open';
    button.dataset.figure = figure.id;
    button.setAttribute('aria-label',`Enlarge ${figure.title}`);
    const image = document.createElement('img');
    image.src = figure.path;
    image.alt = figure.alt;
    image.loading = 'lazy';
    const action = document.createElement('span');
    action.textContent = 'View figure ↗';
    const caption = document.createElement('figcaption');
    caption.textContent = figure.shortCaption || figure.title;
    button.append(image,action);
    wrapper.append(button,caption);
    $(figure.container).append(wrapper);
  });
  const figureDialog = $('figure-dialog');
  document.querySelectorAll('[data-figure]').forEach(button => button.addEventListener('click', () => {
    const figure = figureMap.get(button.dataset.figure);
    if (!figure) return;
    $('figure-title').textContent = figure.title;
    $('figure-full').src = figure.path;
    $('figure-full').alt = figure.alt;
    $('figure-caption').textContent = figure.caption;
    $('figure-original').href = figure.path;
    $('figure-download').href = figure.path;
    $('figure-source-document').hidden = !figure.source;
    if (figure.source) $('figure-source-document').href = figure.source;
    figureDialog.dataset.figure = figure.id;
    if (typeof figureDialog.showModal === 'function') figureDialog.showModal();
    else window.open(figure.path,'_blank','noopener');
  }));
  $('close-figure').addEventListener('click', () => figureDialog.close());
  figureDialog.addEventListener('click',event => { if (event.target === figureDialog) { const r=figureDialog.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) figureDialog.close(); } });
  $('trajectory-video').addEventListener('play', () => { $('trajectory-video').dataset.playback = 'playing'; });
  $('trajectory-video').addEventListener('pause', () => { $('trajectory-video').dataset.playback = 'paused'; });
  $('trajectory-video').addEventListener('ended', () => { $('trajectory-video').dataset.playback = 'ended'; });
  updateSelectionUI();
  setTopic('question');
  loadStructure();
})();
