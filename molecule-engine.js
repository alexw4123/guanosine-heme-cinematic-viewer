/* Isolated research prototype. All selections are bound to unchanged source files. */
(() => {
  'use strict';
  let mappingsPromise;
  const asset = name => new URL(`assets/${name}`, document.baseURI).href;
  const atomSelection = indices => indices.length ? '@' + indices.join(',') : 'NONE';
  const expand = ranges => ranges.flatMap(([first,last]) => Array.from({length:last-first+1},(_,i)=>first+i));
  const labels = {
    all:'Whole structure',peptide:'Peptide helices',guanosine:'Guanosine caps',caps:'Guanosine + PEG2',
    heme:'Heme + Fe',iron:'Iron',histidines:'Histidines',base:'Base chemistry',linker:'PEG2 linkers',
    protein:'Human DHFR',enzyme:'Human DHFR',nadph:'NADPH',candidate:'Nucleopeptide model',pocket:'Modeled pocket context',
    ribose:'Ribose',phenylalanine:'L-Phenylalanine',glutamate:'L-Glutamate',changedBaseGroups:'Changed base chemistry'
  };
  const captions = {
    heme:{
      all:'Four peptide chains surround heme in the original PEG2 coordinate model. The two Fe–histidine bonds are imposed model connections.',
      peptide:'Each modeled chain has 15 amino acids. The chain sequences differ at several positions; these coordinates do not establish a synthesized batch sequence.',
      guanosine:'The four guanosine-derived caps are highlighted without the PEG2 linkers. The design asks whether these caps can help organize the assembly.',
      caps:'Each guanosine-derived cap connects to a peptide through PEG2. This combined selection includes all four caps and their linkers.',
      base:'The guanine face is intended to contribute hydrogen-bonding contacts. A persistent guanine quartet has not been established for this bundle.',
      linker:'PEG2 separates the guanosine-derived cap from the peptide. This selection follows the linker atoms in the original coordinate file.',
      heme:'Heme contains an iron center. Two histidine NE2 atoms are explicitly bonded to Fe in this model; binding and catalytic activity still need experimental tests.',
      iron:'The iron atom is explicitly connected to four porphyrin nitrogens and two peptide histidines in this source model.',
      histidines:'Histidine is at peptide position 8 on chains PEPA and PEPC. Its two Fe connections are part of the model topology.'
    },
    dhfr:{
      all:'The source complex combines human DHFR, modeled reduced NADPH, and a nucleopeptide starting pose. It has not been relaxed or validated as an inhibitor.',
      protein:'DHFR helps regenerate tetrahydrofolate, a cofactor needed for nucleotide production. NADPH supplies the reducing equivalents for the normal enzyme reaction.',
      nadph:'NADPH is the modeled reduced cofactor. In the normal reaction it supplies a hydride while dihydrofolate is reduced to tetrahydrofolate.',
      candidate:'The model combines a nucleoside with Phe–Glu. Its placement here is a prepared starting structure. Inhibition has not been measured.',
      pocket:'This geometric neighborhood includes the nucleopeptide, NADPH, and protein residues with a heavy atom within 6 Å of the nucleopeptide. Short contacts remain unresolved.',
      base:'GS and isog exchange amino and oxo groups at base positions 2 and 6. That changes the arrangement of possible hydrogen-bond donors and acceptors.',
      changedBaseGroups:'GS has 2-amino/6-oxo chemistry; isog has 2-oxo/6-amino chemistry. The highlighted atoms are mapped from the explicit source topology.',
      ribose:'The ribose ring links the base to the 5′ carbonyl attachment. Its hydroxyl groups can contribute to molecular recognition.',
      linker:'A 5′ carbonyl links the nucleoside to the Phe amide nitrogen. This model contains a carbonyl amide connection, not a PEG linker.',
      phenylalanine:'Phenylalanine supplies an aromatic side chain. The same Phe portion is retained in both models.',
      glutamate:'Glutamate provides two carboxylate groups in the prepared model. Its shared peptide chemistry is retained in both models.'
    }
  };

  async function getMappings() {
    if (!mappingsPromise) mappingsPromise = fetch(asset('selection-maps.v1.compact.json'),{cache:'no-store'}).then(response=>{
      if (!response.ok) throw new Error('The molecular selection map could not load.');
      return response.json();
    }).catch(error=>{mappingsPromise=undefined;throw error;});
    return mappingsPromise;
  }

  window.createResearchMolecule = function createResearchMolecule(options) {
    const {project,viewport,onSelection=()=>{},onReady=()=>{},onError=()=>{},onMotion=()=>{},
      backgroundColor='#fafbfc',defaultMode='hybrid',interactionEnabled=false,contextIntensity=.32} = options || {};
    const hemePalette={PEPA:'#18b8cf',PEPB:'#529fdb',PEPC:'#35c3b4',PEPD:'#88c8e2',
      guanosine:'#9676d9',linker:'#b8b2cc',heme:'#d99328',iron:'#f0aa35'};
    const hex=value=>Number.parseInt(value.slice(1),16);
    if (!['heme','dhfr'].includes(project) || !(viewport instanceof HTMLElement)) throw new Error('A project and molecular viewport are required.');
    const state = {project,model:project==='heme'?'original-peg2':'gs',mode:['atomic','secondary','hybrid'].includes(defaultMode)?defaultMode:'hybrid',ready:false,isolated:false,interactionEnabled:Boolean(interactionEnabled),
      selected:'all',kind:'component',chain:null,position:null,picked:null,sourceHash:null,hashVerified:false};
    let maps,modelMap,stage,component,colorScheme,selectedIndices=[],selectedSet=new Set(),allIndices=[],pocketIndices=[];
    let residueByAtom=new Map(),candidatePartByAtom=new Map(),hemeColorByAtom=new Map(),pendingSelection=null,initialOrientation,generation=0,destroyed=false;
    let lastPick={index:-1,time:0},touchStart=null,resizeObserver,initialTiltApplied=false;
    let secondaryAssignments={}, coordinateFingerprint=null;
    let motionFrame=null,motionToken=0,motionResolve=null,motionState='idle',motionProgress=0,scrollPose=null;
    const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)');
    viewport.classList.add('research-molecule');
    viewport.tabIndex = viewport.tabIndex < 0 ? 0 : viewport.tabIndex;
    viewport.setAttribute('aria-label',(project==='heme'?'Interactive four-helix heme bundle':'Interactive human DHFR complex')+'. Arrow keys rotate, plus and minus zoom, Home resets.');
    viewport.dataset.project=project;
    viewport.dataset.modelReady='false';
    const host=document.createElement('div');
    host.className='research-molecule-canvas';
    viewport.append(host);

    function orientation() {
      return stage ? Array.from(stage.viewerControls.getOrientation().elements) : [];
    }
    function diagnostics() {
      return {project,model:state.model,ready:state.ready,atomCount:component?.structure.atomCount||0,
        bondCount:component?.structure.bondCount||0,selectedComponent:state.selected,selectedKind:state.kind,
        selectedIndices:[...selectedIndices],selectedAtomCount:selectedIndices.length,chain:state.chain,position:state.position,
        representation:state.mode,isolated:state.isolated,orientation:orientation(),sourceHash:state.sourceHash,
        hashVerified:state.hashVerified,coordinateFingerprint,secondaryStructureAssignments:{...secondaryAssignments},lastPickedAtom:state.picked,
        motionState,motionProgress,motionKind:'camera',interactionEnabled:state.interactionEnabled,
        scrollPose:scrollPose?{...scrollPose}:null,
        palette:project==='heme'?{...hemePalette}:null};
    }
    function reflect() {
      const d=diagnostics();
      viewport.dataset.modelReady=String(d.ready);
      viewport.dataset.currentModel=d.model;
      viewport.dataset.atomCount=String(d.atomCount);
      viewport.dataset.bondCount=String(d.bondCount);
      viewport.dataset.selectedComponent=d.selectedComponent;
      viewport.dataset.selectedKind=d.selectedKind;
      viewport.dataset.selectedAtomCount=String(d.selectedAtomCount);
      viewport.dataset.selectedIndices=JSON.stringify(d.selectedIndices);
      viewport.dataset.selectedResidue=state.kind==='residue'?`${state.chain}:${state.position}`:'';
      viewport.dataset.representation=d.representation;
      viewport.dataset.isolated=String(d.isolated);
      viewport.dataset.viewOrientation=JSON.stringify(d.orientation);
      viewport.dataset.sourceHash=d.sourceHash||'';
      viewport.dataset.hashVerified=String(d.hashVerified);
      viewport.dataset.coordinateFingerprint=d.coordinateFingerprint||'';
      viewport.dataset.secondaryStructure=JSON.stringify(d.secondaryStructureAssignments);
      viewport.dataset.lastPickedAtom=state.picked?String(state.picked.index):'';
      viewport.dataset.motionState=d.motionState;
      viewport.dataset.motionProgress=String(d.motionProgress);
      viewport.dataset.motionKind=d.motionKind;
      viewport.dataset.scrollPose=JSON.stringify(d.scrollPose);
      viewport.dataset.interactionEnabled=String(state.interactionEnabled);
      viewport.dataset.palette=JSON.stringify(d.palette);
    }
    function reportMotion(status,progress,reason) {
      motionState=status;motionProgress=progress;
      reflect();
      onMotion({state:status,progress,kind:'camera',...(reason?{reason}:{})});
    }
    function stopAnimation(reason='stopped') {
      const playing=motionState==='playing';
      ++motionToken;
      if(motionFrame!==null)cancelAnimationFrame(motionFrame);
      motionFrame=null;
      if(playing)reportMotion('stopped',motionProgress,reason);
      if(motionResolve){const resolve=motionResolve;motionResolve=null;resolve({state:'stopped',reason});}
      return playing;
    }
    function animateModel({durationMs=2500}={}) {
      if(destroyed||!state.ready)return {started:false,reason:destroyed?'destroyed':'not-ready',finished:Promise.resolve({state:'unavailable'})};
      scrollPose=null;
      stopAnimation('restarted');
      if(reducedMotion?.matches) {
        reportMotion('reduced-motion',0,'reduced-motion');
        return {started:false,reason:'reduced-motion',finished:Promise.resolve({state:'reduced-motion'})};
      }
      const duration=Math.min(3000,Math.max(400,Number(durationMs)||2500));
      const token=++motionToken;
      let startedAt=null,previous=0;
      const finished=new Promise(resolve=>{motionResolve=resolve;});
      reportMotion('playing',0);
      function step(now) {
        if(destroyed||token!==motionToken||!state.ready)return;
        if(startedAt===null)startedAt=now;
        const progress=Math.min(1,Math.max(0,(now-startedAt)/duration));
        const eased=progress*progress*(3-2*progress);
        // Orbit the camera around authentic coordinates. No atom or bond is changed.
        stage.trackballControls.rotate(65*(eased-previous),6*(eased-previous));
        previous=eased;
        if(progress<1) {
          reportMotion('playing',progress);
          motionFrame=requestAnimationFrame(step);
        } else {
          motionFrame=null;
          reportMotion('completed',1);
          if(motionResolve){const resolve=motionResolve;motionResolve=null;resolve({state:'completed'});}
        }
      }
      motionFrame=requestAnimationFrame(step);
      return {started:true,finished};
    }
    function emitSelection() {
      reflect();
      const residue=state.kind==='residue' ? modelMap.chains.find(c=>c.segment===state.chain)?.residues.find(r=>r.position===state.position) : null;
      const key=state.selected;
      const chainLabel=modelMap.chains?.find(c=>c.segment===key);
      const label=chainLabel?`Peptide ${key.slice(-1)}`:residue ? `${state.chain} · ${residue.letter}${residue.position}` :
        key==='base' ? (project==='heme'?'Guanine base':state.model==='gs'?'Guanine base':'Isoguanine base') : labels[key]||key;
      onSelection({project,model:state.model,key,label,indices:[...selectedIndices],count:selectedIndices.length,
        kind:state.kind,chain:state.chain,position:state.position,sourceResidueName:residue?.sourceResidueName,
        sourceResidueNumber:residue?.sourceResidueNumber,picked:state.picked,
        caption:chainLabel?`Peptide ${key.slice(-1)} contains ${chainLabel.sequence.length} residues in the original PEG2 coordinate model.`:residue?`Peptide position ${residue.position} is ${residue.sourceResidueName} in ${state.chain}, source residue ${residue.sourceResidueNumber}. This selection uses the original PEG2 coordinate model.`:captions[project][key]||'',
        mode:state.mode,isolated:state.isolated,ready:state.ready});
    }
    function baseColor(atom) {
      const i=atom.index;
      if (project==='heme') {
        return hemeColorByAtom.get(i)??hex(hemePalette.PEPA);
      }
      if (i>=3087) return state.model==='gs'?0xfb86ae:0xc3a3ff;
      if (i>=3013) return 0xf1c272;
      const colors={C:0xa8bbce,N:0x97bed0,O:0xd3a0ad,S:0xe5c987,H:0x8c9fb3};
      return colors[atom.element]||0xa8bbce;
    }
    function render() {
      if (!state.ready || !component) return;
      component.removeAllRepresentations();
      const allowed=state.isolated?selectedIndices:allIndices;
      const atomic={colorScheme,multipleBond:'symmetric',radiusScale:project==='heme'?(state.mode==='hybrid'?0.44:0.46):0.44,
        aspectRatio:2,bondSpacing:0.75,quality:'high',opacity:1,disablePicking:false};
      if (state.mode==='atomic') {
        // The single complete representation retains the source's Fe–His cross-component bonds.
        component.addRepresentation('ball+stick',{...atomic,sele:atomSelection(allowed)});
      } else {
        const protein=allowed.filter(i=>project==='heme'?residueByAtom.has(i):i<3013);
        if (protein.length) component.addRepresentation('cartoon',{sele:atomSelection(protein),colorScheme,quality:'high',
          smoothSheet:true,scale:1,disablePicking:false});
        const accessories=allowed.filter(i=>project==='heme'?!residueByAtom.has(i):i>=3013);
        // Selected peptide residues remain visible atomically alongside their coordinate-derived ribbon.
        const highlightedProtein=state.selected==='all'?[]:selectedIndices.filter(i=>protein.includes(i));
        const atomicIndices=state.mode==='hybrid'?allowed:[...new Set([...accessories,...highlightedProtein])];
        // The full hybrid atomic layer also retains cross-component Fe–His bonds.
        if (atomicIndices.length) component.addRepresentation('ball+stick',{...atomic,sele:atomSelection(atomicIndices)});
      }
      // Selection, isolation, and mode changes deliberately do not center or orient the camera.
      reflect();
    }
    function normalizeKey(key) {
      const aliases={cap:'guanosine',enzyme:'protein',phe:'phenylalanine',Phe:'phenylalanine',glu:'glutamate',Glu:'glutamate',
        histidine:'histidines',guanosinePEG2:'caps',changed:'changedBaseGroups'};
      return aliases[key]||key;
    }
    function indicesFor(key) {
      if (key==='all') return allIndices;
      if (project==='heme') {
        const chain=modelMap.chains.find(c=>c.segment===key);
        if(chain)return chain.residues.flatMap(r=>expand(r.atomIndexRanges));
        if (key==='guanosine'||key==='base'||key==='linker') return modelMap.chains.flatMap(c=>expand(c.groups[key].atomIndexRanges));
        return modelMap.components[key] ? expand(modelMap.components[key].atomIndexRanges) : null;
      }
      if (key==='protein') return expand(modelMap.components.enzyme.atomIndexRanges);
      if (key==='pocket') return pocketIndices;
      const entry=modelMap.components[key]||modelMap.parts[key];
      return entry ? expand(entry.atomIndexRanges) : null;
    }
    function commitSelection({key,indices,kind='component',chain=null,position=null,picked=null}) {
      stopAnimation('selection');
      state.selected=key;state.kind=kind;state.chain=chain;state.position=position;state.picked=picked;
      state.isolated=false;
      selectedIndices=[...indices];selectedSet=new Set(selectedIndices);
      render();emitSelection();
      return true;
    }
    function setComponent(rawKey,picked=null) {
      const key=normalizeKey(rawKey);
      if (!state.ready) {pendingSelection={key};return false;}
      const indices=indicesFor(key);
      return indices?commitSelection({key,indices,picked}):false;
    }
    function setResidue(rawChain,rawPosition,picked=null) {
      if (project!=='heme') return false;
      const chain=/^[ABCD]$/.test(rawChain)?'PEP'+rawChain:rawChain;
      const position=Number(rawPosition);
      if (!state.ready) {pendingSelection={chain,position};return false;}
      const residue=modelMap.chains.find(c=>c.segment===chain)?.residues.find(r=>r.position===position);
      return residue?commitSelection({key:'residue',indices:expand(residue.atomIndexRanges),kind:'residue',chain,position,picked}):false;
    }
    function onPicked(proxy) {
      if (!state.ready || !proxy) return;
      const atom=proxy.atom||proxy.closestBondAtom;
      if (!atom || atom.index<0 || atom.index>=allIndices.length) return;
      const now=performance.now();
      if (lastPick.index===atom.index && now-lastPick.time<180) return;
      const picked={index:atom.index,atomname:atom.atomname,resname:atom.resname,resno:atom.resno,element:atom.element};
      lastPick={index:picked.index,time:now};
      if (project==='heme') {
        const residue=residueByAtom.get(picked.index);
        if (residue) return setResidue(residue.chain,residue.position,picked);
        if (picked.index>=1140) return setComponent('heme',picked);
        const isLinker=modelMap.chains.some(c=>c.groups.linker.atomIndexRanges.some(([first,last])=>picked.index>=first&&picked.index<=last));
        return setComponent(isLinker?'linker':'guanosine',picked);
      }
      if (picked.index>=3087) return setComponent(candidatePartByAtom.get(picked.index)||'candidate',picked);
      return setComponent(picked.index>=3013?'nadph':'protein',picked);
    }
    function calculatePocket() {
      const ligand=[];const residues=new Set();
      component.structure.eachAtom(atom=>{if(atom.index>=3087 && atom.element!=='H')ligand.push([atom.x,atom.y,atom.z]);});
      component.structure.eachAtom(atom=>{
        if(atom.index>=3013 || atom.element==='H')return;
        if(ligand.some(([x,y,z])=>(x-atom.x)**2+(y-atom.y)**2+(z-atom.z)**2<=36))residues.add(atom.residueIndex);
      });
      pocketIndices=[];
      component.structure.eachAtom(atom=>{if(atom.index>=3013 || residues.has(atom.residueIndex))pocketIndices.push(atom.index);});
      viewport.dataset.pocketProteinResidueCount=String(residues.size);
    }
    function makeStage() {
      if(!window.NGL)throw new Error('The molecular viewer library is unavailable.');
      stage=new NGL.Stage(host,{backgroundColor,quality:'high',sampleLevel:0,cameraType:'perspective',cameraFov:36,
        lightIntensity:1.1,ambientIntensity:0.72,clipNear:0,clipFar:100,fogNear:75,fogFar:100,tooltip:false});
      const canvas=stage.viewer.renderer.domElement;
      canvas.setAttribute('role','img');
      canvas.setAttribute('aria-label','Molecular structure. Arrow keys rotate, plus and minus zoom, and Home resets the camera.');
      ['clickPick-left','clickPick-middle','clickPick-right','clickPick-ctrl-left','drag-ctrl-shift-right','drag-ctrl-shift-left','hoverPick'].forEach(binding=>stage.mouseControls.remove(binding));
      stage.keyControls.clear();
      stage.spinAnimation.pause(true);stage.rockAnimation.pause(true);
      stage.signals.clicked.add(onPicked);
      stage.viewerControls.signals.changed.add(()=>{if(!destroyed)reflect();});
      stage.viewer.signals.rendered.add(()=>{if(!destroyed)reflect();});
      colorScheme=NGL.ColormakerRegistry.addScheme(function () {
        this.atomColor=atom=>{
          let color=baseColor(atom);
          if(state.selected!=='all' && !selectedSet.has(atom.index) && !state.isolated) {
            const amount=Math.min(1,Math.max(0,Number(contextIntensity)||.32));
            const mix=(c,b)=>Math.round(b+(c-b)*amount);
            // Pale neutral context keeps every nonselected component legible on the light stage.
            color=(mix((color>>16)&255,222)<<16)|(mix((color>>8)&255,227)<<8)|mix(color&255,232);
          }
          return color;
        };
      });
      setInteractionEnabled(state.interactionEnabled);
    }
    function setInteractionEnabled(value) {
      state.interactionEnabled=Boolean(value);
      if(state.interactionEnabled)scrollPose=null;
      if(stage){
        // Click picking is dispatched independently of mouse-controls actions.
        stage.mouseControls.disabled=!state.interactionEnabled;
        stage.mouseObserver.handleScroll=state.interactionEnabled;
        const canvas=stage.viewer.renderer.domElement;
        canvas.style.touchAction=state.interactionEnabled?'none':'pan-y pinch-zoom';
        const observer=stage.mouseObserver;
        ['touchstart','touchend','touchmove'].forEach(type=>{
          const handler=observer['_onTouch'+type.slice(5)];
          document.removeEventListener(type,handler);
          if(state.interactionEnabled)document.addEventListener(type,handler,{passive:false});
        });
        if(!state.interactionEnabled)stopAnimation('page-scroll');
      }
      reflect();
      return state.interactionEnabled;
    }
    async function verifiedBuffer(url,expectedHash) {
      const response=await fetch(url,{cache:'no-store'});
      if(!response.ok)throw new Error('The source molecular file could not load.');
      const buffer=await response.arrayBuffer();
      if(!window.crypto?.subtle)throw new Error('Open this preview through localhost or HTTPS to verify the molecular file.');
      const digest=await crypto.subtle.digest('SHA-256',buffer);
      const hash=Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
      if(hash!==expectedHash)throw new Error('The molecular file differs from the verified selection map.');
      return {buffer,hash};
    }
    async function loadModel(key) {
      if(destroyed)return;
      if(project==='dhfr' && !['gs','isog'].includes(key))return;
      scrollPose=null;stopAnimation('model-change');
      const token=++generation;
      const preserve=stage&&state.ready?stage.viewerControls.getOrientation().clone():null;
      const previousSelection=state.kind==='residue'?{chain:state.chain,position:state.position}:{key:state.selected};
      state.ready=false;state.model=project==='heme'?'original-peg2':key;state.hashVerified=false;state.picked=null;
      viewport.dataset.modelReady='false';viewport.dataset.loadError='';
      try {
        maps=await getMappings();
        modelMap=project==='heme'?maps.heme:maps.dhfr[key];
        if(destroyed || token!==generation)return;
        if(!stage)makeStage();
        const name=project==='heme'?'heme-original.pdb':`dhfr-${key}-connected.pdb`;
        const {buffer,hash}=await verifiedBuffer(asset(name),modelMap.sha256);
        if(destroyed || token!==generation)return;
        const loaded=await stage.loadFile(new Blob([buffer]),{ext:'pdb',defaultRepresentation:false,inferBonds:'none'});
        if(destroyed || token!==generation){if(!destroyed)stage.removeComponent(loaded);return;}
        if(loaded.structure.atomCount!==modelMap.atomCount || loaded.structure.bondCount!==modelMap.explicitBondCount) {
          stage.removeComponent(loaded);throw new Error('The source atom or explicit bond count differs.');
        }
        if(component)stage.removeComponent(component);
        component=loaded;allIndices=Array.from({length:modelMap.atomCount},(_,i)=>i);
        residueByAtom=new Map();candidatePartByAtom=new Map();
        if(project==='heme'){
          hemeColorByAtom=new Map();
          modelMap.chains.forEach(c=>{
            c.residues.forEach(r=>expand(r.atomIndexRanges).forEach(i=>{
              residueByAtom.set(i,{chain:c.segment,position:r.position});
              hemeColorByAtom.set(i,hex(hemePalette[c.segment]));
            }));
            // Coloring follows the verified source atom groups, never inferred residue names.
            expand(c.groups.guanosine.atomIndexRanges).forEach(i=>hemeColorByAtom.set(i,hex(hemePalette.guanosine)));
            expand(c.groups.linker.atomIndexRanges).forEach(i=>hemeColorByAtom.set(i,hex(hemePalette.linker)));
          });
          expand(modelMap.components.heme.atomIndexRanges).forEach(i=>hemeColorByAtom.set(i,hex(hemePalette.heme)));
          expand(modelMap.components.iron.atomIndexRanges).forEach(i=>hemeColorByAtom.set(i,hex(hemePalette.iron)));
        }
        else {
          ['base','ribose','linker','phenylalanine','glutamate'].forEach(part=>expand(modelMap.parts[part].atomIndexRanges).forEach(i=>candidatePartByAtom.set(i,part)));
          calculatePocket();
        }
        secondaryAssignments={};
        component.structure.eachResidue(residue=>{if(residue.isProtein())secondaryAssignments[residue.sstruc||'unassigned']=(secondaryAssignments[residue.sstruc||'unassigned']||0)+1;});
        // A small diagnostic fingerprint is sampled directly from NGL's unchanged coordinates.
        const fingerprint=[];
        component.structure.eachAtom(atom=>{if(atom.index===0||atom.index===Math.floor(allIndices.length/2)||atom.index===allIndices.length-1)fingerprint.push([atom.index,atom.x,atom.y,atom.z]);});
        coordinateFingerprint=JSON.stringify(fingerprint);
        state.sourceHash=hash;state.hashVerified=true;state.ready=true;
        const requested=pendingSelection||previousSelection;pendingSelection=null;
        if(requested.chain)setResidue(requested.chain,requested.position);
        else if(!setComponent(requested.key))setComponent('all');
        stage.handleResize();
        if(preserve)stage.viewerControls.orient(preserve);
        else {
          component.autoView(0);
          if(project==='heme')stage.viewerControls.zoom(viewport.clientWidth<600?0.08:0.27);
          // The deposited heme plane is initially edge-on. Tilt the camera once for the opening view;
          // all coordinates remain untouched, and later selections/modes keep this orientation.
          if(project==='heme'&&!initialTiltApplied){stage.trackballControls.rotate(30,12);initialTiltApplied=true;}
          initialOrientation=stage.viewerControls.getOrientation().clone();
        }
        reflect();
        // Capture the rendered initial matrix before the caller can use Reset.
        await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
        if(destroyed||token!==generation)return;
        if(!preserve)initialOrientation=stage.viewerControls.getOrientation().clone();
        reflect();onReady(diagnostics());
      } catch(error) {
        if(destroyed||token!==generation)return;
        state.ready=false;viewport.dataset.loadError=error.message;reflect();onError(error);
      }
    }
    function rotate(direction) {
      if(!state.ready)return;
      const movement={left:[-12,0],right:[12,0],up:[0,-12],down:[0,12]}[direction];
      if(movement){scrollPose=null;stopAnimation('manual-control');stage.trackballControls.rotate(...movement);reflect();}
    }
    function zoom(delta) {if(state.ready){scrollPose=null;stopAnimation('manual-control');stage.viewerControls.zoom(Number(delta));reflect();}}
    function reset() {scrollPose=null;stopAnimation('reset');if(state.ready&&initialOrientation){stage.viewerControls.orient(initialOrientation.clone());reflect();}}
    // Scroll poses affect the camera only. Each pose starts at the cached opening
    // matrix, so forward/backward scrolling cannot accumulate rotation or zoom.
    function setScrollPose({yaw=0,pitch=0,zoom:zoomAmount=0,static:staticPose=false}={}) {
      if(destroyed||!state.ready||!stage||!initialOrientation||state.interactionEnabled)return false;
      const bounded=(value,min,max)=>Number.isFinite(Number(value))?Math.min(max,Math.max(min,Number(value))):0;
      const isStatic=Boolean(staticPose||reducedMotion?.matches);
      const pose={yaw:isStatic?0:bounded(yaw,-180,180),pitch:isStatic?0:bounded(pitch,-90,90),
        zoom:isStatic?0:bounded(zoomAmount,-1,1),static:isStatic};
      if(scrollPose&&Object.keys(pose).every(key=>scrollPose[key]===pose[key]))return true;
      stopAnimation('scroll-camera');scrollPose=pose;
      stage.viewerControls.orient(initialOrientation.clone());
      if(pose.yaw||pose.pitch)stage.trackballControls.rotate(pose.yaw,pose.pitch);
      if(pose.zoom)stage.viewerControls.zoom(pose.zoom);
      reflect();
      return true;
    }
    function restoreScrollPose() {
      if(destroyed||!state.ready||!stage||!initialOrientation||state.interactionEnabled)return false;
      scrollPose=null;stopAnimation('scroll-camera-reset');
      stage.viewerControls.orient(initialOrientation.clone());reflect();
      return true;
    }
    function onKey(event) {
      if(!state.ready||event.altKey||event.ctrlKey||event.metaKey)return;
      const direction={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[event.key];
      if(direction){event.preventDefault();rotate(direction);}
      else if(event.key==='+'||event.key==='='){event.preventDefault();zoom(.12);}
      else if(event.key==='-'||event.key==='_'){event.preventDefault();zoom(-.12);}
      else if(event.key==='Home'){event.preventDefault();reset();}
      else if(event.key==='Escape'){event.preventDefault();stopAnimation('manual-control');}
    }
    function pointerDown(event) {
      stopAnimation('manual-control');
      if(event.pointerType==='touch')touchStart={id:event.pointerId,x:event.clientX,y:event.clientY,time:performance.now(),multiple:!event.isPrimary};
    }
    function pointerUp(event) {
      if(event.pointerType!=='touch'||!touchStart||touchStart.id!==event.pointerId)return;
      const tap=touchStart;touchStart=null;
      if(!state.ready||tap.multiple||performance.now()-tap.time>500||Math.hypot(event.clientX-tap.x,event.clientY-tap.y)>6)return;
      const rect=stage.viewer.renderer.domElement.getBoundingClientRect();
      onPicked(stage.pickingControls.pick(event.clientX-rect.left,rect.bottom-event.clientY));
    }
    function pointerCancel(){touchStart=null;}
    const wheel=()=>stopAnimation('manual-control');
    const motionPreference=event=>{if(event.matches)stopAnimation('reduced-motion');};
    const resize=()=>{if(stage&&!destroyed){stage.handleResize();reflect();}};
    viewport.addEventListener('keydown',onKey);
    viewport.addEventListener('pointerdown',pointerDown);
    viewport.addEventListener('pointerup',pointerUp);
    viewport.addEventListener('pointercancel',pointerCancel);
    viewport.addEventListener('wheel',wheel,{passive:true});
    reducedMotion?.addEventListener?.('change',motionPreference);
    if('ResizeObserver'in window){resizeObserver=new ResizeObserver(resize);resizeObserver.observe(viewport);}
    else window.addEventListener('resize',resize);
    const api={
      setComponent,setResidue,
      setModel:key=>loadModel(key),
      setMode(mode){if(!['atomic','secondary','hybrid'].includes(mode))return false;stopAnimation('representation-change');state.mode=mode;if(state.ready){render();emitSelection();}return true;},
      isolate(value){stopAnimation('selection');state.isolated=Boolean(value)&&state.selected!=='all';if(state.ready){render();emitSelection();}},
      zoom,rotate,reset,animateModel,stopAnimation,setInteractionEnabled,setScrollPose,restoreScrollPose,getDiagnostics:diagnostics,
      destroy(){if(destroyed)return;stopAnimation('destroyed');destroyed=true;++generation;resizeObserver?.disconnect();window.removeEventListener('resize',resize);
        viewport.removeEventListener('keydown',onKey);viewport.removeEventListener('pointerdown',pointerDown);
        viewport.removeEventListener('pointerup',pointerUp);viewport.removeEventListener('pointercancel',pointerCancel);
        viewport.removeEventListener('wheel',wheel);reducedMotion?.removeEventListener?.('change',motionPreference);
        if(stage)stage.dispose();host.remove();viewport.dataset.modelReady='false';}
    };
    api.ready=loadModel(state.model);
    return api;
  };
})();
