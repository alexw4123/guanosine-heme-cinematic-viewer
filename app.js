/* Fairfield research viewer. Scientific content and atom mappings remain separate. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const data=window.RESEARCH_CONTENT;
  const site=window.RESEARCH_SITE;
  const siteProject=site.project;
  const sections=[["overview","Overview","<path d=\"m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z\"/>"],["story","How it works","<path d=\"m9 5 11 7-11 7Z\"/>"],["molecules","Molecules","<path d=\"m12 3 8 4.5v9L12 21l-8-4.5v-9Z M12 12l8-4.5M12 12 4 7.5M12 12v9\"/>"],["laboratory","Laboratory Work","<path d=\"M9 3h6M10 3v7L4.5 19a1.3 1.3 0 0 0 1.2 2h12.6a1.3 1.3 0 0 0 1.2-2L14 10V3M7.5 15h9\"/>"],["modeling","Modeling & Results","<path d=\"M4 3v18h17M7 15l4-5 4 3 5-7\"/>"],["chemistry","Chemistry","<circle cx=\"5\" cy=\"12\" r=\"2.5\"/><circle cx=\"17\" cy=\"5\" r=\"2.5\"/><circle cx=\"17\" cy=\"19\" r=\"2.5\"/><path d=\"m7 10.7 7.8-4.5M7 13.3l7.8 4.5M17 7.5v9\"/>"],["applications","Applications","<path d=\"M14 3h7v7M21 3l-9 9M10 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-5\"/>"],["sources","Sources","<path d=\"M5 3h13a1 1 0 0 1 1 1v17H6a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2ZM3 17h16M7 7h8M7 11h6\"/>"]];
  let project='',section='overview',engine=null,selected='all',mode='atomic',model='gs',chain='PEPA',generation=0,story=null,returnScene=null,returnVariant=null,returnProgress=0,pendingMolecule=null,playStoryOnOpen=false;
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sourceLinks=arr=>(arr||[]).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>`).join('');
  const hemeComponents=[['all','Whole structure'],['peptide','Helices'],['guanosine','Guanosine + PEG2'],['histidines','Histidines'],['heme','Heme + Fe']];
  const dhfrComponents=[['all','Whole complex'],['protein','DHFR'],['nadph','NADPH'],['candidate','Model'],['base','Base'],['phenylalanine','Phe'],['glutamate','Glu']];
  function captionFor(key){
    const p=data.projects[project];
    const aliases={peptide:'peptides',protein:'enzyme'};
    const c=p.components.find(c=>c.id===(aliases[key]||key));
    if(c)return {label:c.label,text:c.text};
    const specifics={
      all:project==='heme'?['The original PEG2 model','Four capped peptide chains surround hemin. Choose a part to inspect its role.']:['The prepared DHFR complex','Human DHFR, modeled reduced NADPH, and the complete nucleopeptide model. Switch GS/isog to compare the changed base.'],
      base:['The nucleobase',model==='gs'?'Guanine carries a 2-amino / 6-oxo pattern. The isog model swaps these groups; their hydrogen-bonding faces differ.':'Isoguanine carries a 2-oxo / 6-amino pattern. The shared Phe–Glu peptide remains the same.'],
      phenylalanine:['L-Phenylalanine','The phenylalanine side chain provides an aromatic group. Its position in this unrelaxed pose is a modeled placement.'],
      glutamate:['L-Glutamate','Glutamate provides the shared acidic side chain. This selection comes from the complete model topology.'],
      ribose:['Ribose','The sugar connects the base to the 5′ carbonyl amide that joins the peptide.'],
      linker:['The linker',project==='heme'?'PEG2 joins the guanosine-derived group to its peptide. This model is separate from the planned PEG3 series.':'The model uses a 5′ carbonyl amide, rather than a PEG linker.'],
      iron:['The iron center','Fe is explicitly bonded to the porphyrin and two histidine nitrogens in this model. These imposed connections do not measure binding.']
    };
    const a=specifics[key]||['Molecular selection','The highlighted atoms belong to the current source model.']; return {label:a[0],text:a[1]};
  }
  function onSelection(s){
    selected=s.key||'all';
    const c=captionFor(selected);
    if(s.kind==='residue'){c.label=`${s.chain} · residue ${s.position}`;c.text=`The source residue at peptide position ${s.position} is highlighted. The separate guanosine–PEG2 cap is outside the 15-residue sequence.`;}
    $('selection-title').textContent=c.label;
    $('selection-copy').textContent=c.text;
    $('selection-count').textContent=`${s.count??s.indices?.length??0} atoms${s.isolated?' · isolated':''}`;
    document.querySelectorAll('[data-component]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.component===selected)));
    $('isolate').checked=Boolean(s.isolated);
    $('isolate').disabled=selected==='all';
    document.querySelectorAll('[data-residue]').forEach(b=>b.classList.toggle('selected',s.kind==='residue'&&Number(b.dataset.residue)===s.position));
  }
  function onMotion(motion){
    const playing=motion.state==='playing';
    $('motion-toggle').textContent=playing?'Stop rotation':'Rotate view';
    $('motion-toggle').setAttribute('aria-pressed',String(playing));
    $('motion-status').textContent=playing?'Camera rotation':motion.state==='reduced-motion'?'Use drag or arrows':'Drag to explore';
  }
  function setBusy(busy,message){$('load-state').hidden=!busy;if(message)$('load-message').textContent=message;}
  async function applyPendingMolecule(){
    if(!pendingMolecule||!engine?.getDiagnostics().ready)return;
    const next=pendingMolecule;pendingMolecule=null;
    const current=generation;
    if(project==='dhfr'&&['gs','isog'].includes(next.model)){model=next.model;await engine.setModel(model);}
    if(current!==generation||!engine)return;
    mode=['atomic','secondary'].includes(next.mode)?next.mode:'atomic';engine.setMode(mode);
    engine.setComponent(next.selection||'all');
    document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
    document.querySelectorAll('[data-model]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.model===model)));
    $('molecular-viewport').focus({preventScroll:true});
    $('molecular-viewport').scrollIntoView({block:'center',behavior:'instant'});
  }
  function createEngine(){
    if(engine)engine.destroy();engine=null;
    const current=++generation;$('motion-toggle').disabled=true;onMotion({state:'idle'});setBusy(true,'Loading the model…');$('retry-load').hidden=true;$('structure-counts').textContent='Opening source model…';onSelection({key:'all',count:data.projects[project].model.atomCount});
    engine=window.createResearchMolecule({project,viewport:$('molecular-viewport'),onSelection:s=>{if(current===generation)onSelection(s);},onMotion:m=>{if(current===generation)onMotion(m);},onReady:d=>{
      if(current!==generation)return;setBusy(false);$('motion-toggle').disabled=false;$('structure-counts').textContent=`${Number(d.atomCount||data.projects[project].model.atomCount).toLocaleString()} atoms · ${Number(d.bondCount||data.projects[project].model.bondCount).toLocaleString()} explicit bonds`;applyPendingMolecule();
    },onError:e=>{if(current!==generation)return;setBusy(true,'The molecular view could not open. Try again, or use the source files under Sources.');$('retry-load').hidden=false;console.warn(e);}});
  }
  function route(){
    const rawHash=location.hash.replace(/^#/,'');
    if(rawHash==='main'&&project)return;
    const parts=rawHash.split('/');
    const aliases={'biosensor-tour':'story','application-tour':'story','structure-controls':'molecules','model-controls':'molecules'};
    const nextProject=siteProject;
    const nextSection=aliases[rawHash]||(sections.some(s=>s[0]===parts[1])?parts[1]:'overview');
    if(['heme','dhfr'].includes(parts[0])&&parts[0]!==siteProject)history.replaceState(null,'','#'+siteProject+'/'+nextSection);
    const changed=nextProject!==project;project=nextProject;section=nextSection;
    const p=data.projects[project];document.body.classList.toggle('dhfr',project==='dhfr');document.title=(project==='heme'?'Heme bundle':'DHFR models')+' | Fairfield';
    $('project-label').textContent='Smith-Carpenter Lab';$('project-title').textContent=project==='heme'?'Guanosine-heme bundle':'DHFR models';$('full-project-title').textContent=p.title;$('project-credit').textContent=p.credit+(project==='dhfr'?' · In collaboration with Phelan Lab':'');
    $('section-nav').innerHTML=sections.map(([id,label,icon])=>`<a href="#${project}/${id}" ${id===section?'aria-current="page"':''}><span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icon}</svg></span>${label}</a>`).join('');
    $('molecule-title').textContent=project==='heme'?'Four helices + heme':'Human DHFR + nucleopeptide';$('model-switch').hidden=project!=='dhfr';
    $('question').textContent=project==='heme'?'Can this bundle turn peroxide into a measurable signal?':'Can a change in the nucleobase improve its fit at DHFR?';
    $('intro-copy').textContent=project==='heme'?'Four guanosine-capped peptides surround hemin in this model. The experiment asks whether the assembly changes hemin’s ability to oxidize a reporter in the presence of peroxide.':'DHFR helps make the reduced folates needed for DNA synthesis. Compare two nucleopeptide models, GS and isog, to inspect how their base chemistry changes the modeled fit.';
    $('question').after($('intro-copy'));
    $('next-copy').textContent=project==='heme'?'Compare assemblies with and without hemin, free hemin, and reagent controls. Measure the green color produced by ABTS oxidation.':'Check the starting structures for clashes, then test the synthesized compounds for DHFR inhibition with interference controls.';
    $('relevance-copy').textContent=p.relevance;
    $('structure-caption').textContent=project==='heme'?'Original PEG2 model. The heme pocket is a structural design; catalytic activity still needs to be measured.':'Starting structures derived from 4M6K. The modeled fit needs refinement and an enzyme inhibition test.';
    $('methods-link').href=`#${project}/modeling`;
    $('component-buttons').innerHTML=(project==='heme'?hemeComponents:dhfrComponents).map(([id,label])=>`<button data-component="${id}" aria-pressed="${id==='all'}">${label}</button>`).join('');
    $('component-buttons').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>engine?.setComponent(b.dataset.component)));
    $('overview').hidden=!['overview','molecules'].includes(section);
    $('section-content').hidden=section==='overview';$('return-to-story').hidden=section!=='molecules'||returnScene===null;
    if(section==='story'){engine?.destroy();engine=null;++generation;}
    if(!['overview','molecules'].includes(section))engine?.stopAnimation();
    renderSection();
    $('sidebar').classList.remove('open');$('menu-toggle').setAttribute('aria-expanded','false');
    if(changed){selected='all';mode='atomic';model='gs';$('isolate').checked=false;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));document.querySelectorAll('[data-model]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.model===model)));if(['overview','molecules'].includes(section))createEngine();else{engine?.destroy();engine=null;}}
    else {if(!engine&&['overview','molecules'].includes(section))createEngine();else if(engine){const d=engine.getDiagnostics();onSelection({key:d.selectedComponent,count:d.selectedAtomCount,kind:d.selectedKind,chain:d.chain,position:d.position,isolated:d.isolated,picked:d.lastPickedAtom});}window.dispatchEvent(new Event('resize'));}
    applyPendingMolecule();
    if(section==='story')requestAnimationFrame(()=>$('section-content').querySelector('.story-player')?.scrollIntoView({block:'start',behavior:'instant'}));
    else if(section!=='molecules')window.scrollTo({top:0,behavior:'instant'});
  }
  function renderFigureGroups(){
    return (window.RESEARCH_FIGURES?.[project]||[]).map(group=>`<section><h3>${esc(group.title)}</h3><p class="section-intro">${esc(group.intro)}</p><div class="figure-row">${group.figures.map(figure=>`<button class="figure-button" data-image="${esc(figure.path)}" data-caption="${esc(figure.caption)}" data-source="${esc(figure.source)}"><img src="${esc(figure.path)}" alt="${esc(figure.alt)}"><span>${esc(figure.shortCaption)} ↗</span></button>`).join('')}</div></section>`).join('');
  }
  function experimentCard(e,open=false){
    const fields=[{label:'Construct',value:e.construct},{label:'Sequence and termini',value:e.sequence},...e.fields].filter(f=>f.value&&String(f.value).trim()!=='—');
    return `<details class="experiment-card" ${open?'open':''}><summary><div><h3>${esc(e.title)}</h3><p>${esc(e.summary)}</p></div><span class="chevron" aria-hidden="true">⌄</span></summary><div class="experiment-body"><div class="experiment-layout"><div><dl class="experiment-fields">${fields.map((f,i)=>`<div class="${i<2?'wide':''}"><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl></div>${project==='heme'?`<div><button class="poster-preview" data-figure="poster"><img src="assets/heme-poster.jpg" alt="Historical Fairfield poster showing HPLC, mass spectrometry and circular-dichroism data"><span>Preview the original poster ↗</span></button></div>`:''}</div><details class="methods"><summary>Procedure &amp; characterization</summary>${e.procedure.map(x=>`<p>${esc(x)}</p>`).join('')}<p>${esc(e.characterization)}</p></details><p class="interpretation">${esc(e.interpretation)}</p><div class="experiment-links">${sourceLinks(e.sources)}</div></div></details>`;
  }
  function renderSection(){
    const p=data.projects[project],host=$('section-content');story?.destroy();story=null;host.innerHTML='';
    const heading=(title,intro='')=>`<h2>${title}</h2>${intro?`<p class="section-intro">${intro}</p>`:''}`;
    if(section==='story'){
      story=window.mountResearchStory({project,host,onExploreStructure:options=>{
        story?.pause();returnScene=options?.returnScene??null;returnVariant=host.dataset.storyVariant;returnProgress=Number(host.dataset.storyProgress)||0;pendingMolecule=options||{};location.hash='#'+project+'/molecules';
      }});
      if(returnScene!==null)story.goToScene(returnScene,{variant:returnVariant,progress:returnProgress});
      if(playStoryOnOpen){playStoryOnOpen=false;story.play();}
    } else if(section==='molecules'){
      host.innerHTML=heading(project==='heme'?'Read the sequence in the structure':'Compare the two models',project==='heme'?'These letters describe the original model. They have not been assigned to a synthesized batch.':'GS and isog share L-Phe–L-Glu. The amino and oxo groups exchange positions on the base.')+(project==='heme'?`<div class="sequence-panel"><div class="component-buttons">${['PEPA','PEPB','PEPC','PEPD'].map(c=>`<button data-chain="${c}" aria-pressed="${c===chain}">${c}</button>`).join('')}</div><div id="sequence-letters" class="sequence-row"></div><p class="source-note">Peptide positions 1–15 · the separate GS2 cap precedes the sequence.</p></div><div class="card">${p.sequences.map(s=>`<div class="sequence-version"><strong>${esc(s.label)}</strong><code>${esc(s.sequence)}</code><p>${esc(s.caption)}</p></div>`).join('')}</div>`:`<div class="cards-grid"><div class="card"><h3>Guanosine</h3><p>2-amino / 6-oxo base. Select the base in the GS complex, then compare isog.</p><button class="primary" data-compare="gs">Inspect GS base</button></div><div class="card"><h3>Isoguanosine</h3><p>2-oxo / 6-amino base. The peptide and 5′ carbonyl-amide linkage are shared.</p><button class="primary" data-compare="isog">Inspect isog base</button></div></div>`);
      if(project==='heme'){renderSequence();host.querySelectorAll('[data-chain]').forEach(b=>b.addEventListener('click',()=>{chain=b.dataset.chain;renderSequence();host.querySelectorAll('[data-chain]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.chain===chain)));}));}
      host.querySelectorAll('[data-compare]').forEach(b=>b.addEventListener('click',async()=>{model=b.dataset.compare;await engine.setModel(model);engine.setComponent('base');document.querySelectorAll('[data-model]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.model===model)));$('molecular-viewport').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}));
    } else if(section==='laboratory')host.innerHTML=heading(project==='heme'?'Laboratory work':'Testing the compounds',project==='heme'?'Historical characterization is separate from the displayed PEG2 model and the next ABTS comparison.':'Each experiment answers a different question; structural preparation is not an inhibition result.')+p.experiments.map((e,i)=>experimentCard(e,i===0)).join('');
    else if(section==='modeling'){
      host.innerHTML=heading('Modeling & results',project==='heme'?'Follow the construction, saved simulation, analysis and later corrections as separate stages.':'Five preparations are documented. Only the two supplied model complexes are interactive here.')+`<div class="section-stack">${project==='heme'?`<div class="card video-card"><h3>Saved simulation · atomic replay</h3><video controls playsinline preload="metadata" poster="assets/motion/heme-md-atomic-poster.jpg"><source src="assets/motion/heme-md-atomic-5s.mp4" type="video/mp4"><track kind="captions" src="assets/motion/heme-md-atomic-5s.vtt" srclang="en" label="English" default></video><p>120 authentic saved frames (0, 42, …, 4998), played in five seconds. Saved-frame indices are shown; physical simulation time is unverified. The as-run model is separate from the opening model. No ribbon assignments are used.</p><a href="assets/motion/heme-atomic-replay-manifest.json" target="_blank">Frame provenance ↗</a></div>`:`<div class="cards-grid">${p.fiveModels.map(m=>`<div class="card"><h3>${esc(m.title)}</h3><p>${esc(m.detail)}</p><small>${m.interactive?'Interactive complex':'Documented preparation'}</small></div>`).join('')}</div><div class="callout">Both starting poses contain short ligand–protein contacts. Review geometry, protonation and parameters before minimization, equilibration and independent simulation runs.</div>`}<div class="card steps">${p.steps.map(s=>`<div class="step"><span class="step-number">${esc(s.number)}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>${sourceLinks(s.sources)}</div></div>`).join('')}</div>${project==='heme'?renderFigureGroups():''}</div>`;
    } else if(section==='chemistry'){
      host.innerHTML=heading(p.chemistry.title,p.chemistry.caption)+(project==='heme'?`<div class="mechanism"><h3>An educational peroxidase cycle</h3><div class="reaction">H₂O₂ + reduced ABTS → green oxidized-ABTS signal</div><div class="mechanism-steps">${[['Ferric heme · Fe(III)','Peroxide enters an accessible site.'],['Compound I','A high-valent Fe(IV)=O / porphyrin-radical intermediate accepts one electron.'],['Compound II','A second reporter oxidation returns the catalyst to its resting state.']].map(([t,c],i)=>`<button data-cycle="${i}" aria-pressed="${i===0}">${t}<small>${c}</small></button>`).join('')}</div><p id="mechanism-caption">Peroxide can produce Compound I at an accessible heme site. This diagram teaches a general mechanism; this bundle has not demonstrated that cycle.</p></div>`:`<div class="mechanism"><div class="reaction">${esc(p.chemistry.reaction)}</div><p>NADPH supplies reducing power to DHFR. THF supports reduced-folate chemistry needed for nucleotide synthesis. Testing the synthesized compounds will show whether either nucleopeptide reduces the enzyme's activity.</p></div>`)+`<div class="cards-grid" style="margin-top:18px"><div class="card"><h3>The comparison needs controls</h3><ul>${p.chemistry.controls.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${sourceLinks(p.chemistry.sources)}</div><div class="card"><h3>${project==='heme'?'Coordination and access':'What the base changes'}</h3><p>${project==='heme'?'The source model imposes two Fe–His bonds. Heme binding and an accessible peroxide reaction site are separate requirements. The monohistidine C45 precedent makes that distinction useful to test.':'Guanine is 2-amino/6-oxo; isoguanine is 2-oxo/6-amino. This changes potential hydrogen-bond donors and acceptors. A compatible pose still needs structural review and experimental testing.'}</p><a href="#${project}/molecules">Inspect the source structure ↗</a></div></div>`+(project==='heme'?`<h2 style="margin:28px 0 15px">What earlier designs demonstrated</h2><div class="cards-grid">${p.priorWork.map(w=>`<div class="card"><h3>${esc(w.title||w.label)}</h3><p>${esc(w.text||w.architecture||'')}</p>${w.lesson?`<p>${esc(w.lesson)}</p>`:''}${sourceLinks(w.sources)}</div>`).join('')}</div>`:'');
      host.querySelectorAll('[data-cycle]').forEach(b=>b.addEventListener('click',()=>{host.querySelectorAll('[data-cycle]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('mechanism-caption').textContent=['Peroxide can produce Compound I at an accessible heme site. This is a general mechanism, not an observed reaction in this bundle.','An electron from a reporter such as ABTS reduces Compound I to Compound II and creates oxidized ABTS.','A second reporter electron reduces Compound II and returns ferric heme. The green ABTS oxidation signal can be followed optically.'][b.dataset.cycle];}));
    } else if(section==='applications'){
      host.innerHTML=window.renderResearchApplication(project);window.bindResearchApplication(host,project);
    } else if(section==='sources')host.innerHTML=heading('Sources & project records','Notebook and document links retain their existing access permissions. Molecular files are copies of the unchanged source coordinates.')+`<div class="source-list">${p.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗<small>${esc(new URL(s.url,document.baseURI).hostname)}</small></a>`).join('')}</div><details class="methods"><summary>Molecular integrity &amp; rendering</summary><p>Source coordinates and explicit connectivity are preserved. NGL loads connected files with bond inference disabled. Secondary structure comes from each loaded structure’s own coordinates. ${project==='heme'?'Selected saved simulation frames are replayed atomically; they do not carry a fixed ribbon assignment.':'The model poses are starting structures, not simulation trajectories.'}</p><p>${project==='heme'?'1,213 atoms and 1,232 explicit bonds. The Fe-histidine connections are specified in this model; binding and catalytic activity require experiments.':'Each DHFR complex contains 3,153 atoms and 3,195 explicit bonds.'}</p></details>`;
    host.querySelectorAll('[data-figure]').forEach(b=>b.addEventListener('click',()=>showFigure('assets/heme-poster.jpg','Historical poster · earlier experimental samples, separate from the PEG2 model',data.projects.heme.figure.url)));
    host.querySelectorAll('[data-image]').forEach(b=>b.addEventListener('click',()=>showFigure(b.dataset.image,b.dataset.caption,b.dataset.source||b.dataset.image)));
  }
  function renderSequence(){
    const seq=['PEPA','PEPC'].includes(chain)?'GEQALQEHEQLAQEL':'GEQLAQEAEQLLQEL';
    $('sequence-letters').innerHTML=`<span>${chain}</span><div class="sequence-letters">${[...seq].map((l,i)=>`<button data-residue="${i+1}" aria-label="${chain} peptide residue ${i+1}, ${l}">${l}<small>${i+1}</small></button>`).join('')}</div>`;
    $('sequence-letters').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{engine?.setResidue(chain,Number(b.dataset.residue));$('molecular-viewport').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}));
  }
  function showFigure(src,caption,source){$('figure-image').src=src;$('figure-image').alt=caption;$('figure-caption').textContent=caption;$('figure-source').href=source;$('figure-dialog').showModal();}
  $('close-figure').addEventListener('click',()=>$('figure-dialog').close());
  $('menu-toggle').addEventListener('click',()=>{$('sidebar').classList.toggle('open');$('menu-toggle').setAttribute('aria-expanded',String($('sidebar').classList.contains('open')));});
  $('follow-story').addEventListener('click',()=>{returnScene=null;returnVariant=null;returnProgress=0;playStoryOnOpen=true;location.hash='#'+project+'/story';});
  $('return-to-story').addEventListener('click',()=>{location.hash='#'+project+'/story';});
  $('explore').addEventListener('click',()=>{$('molecular-viewport').focus({preventScroll:true});$('molecular-viewport').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});});
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;engine?.setMode(mode);document.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
  document.querySelectorAll('[data-model]').forEach(b=>b.addEventListener('click',async()=>{model=b.dataset.model;await engine?.setModel(model);document.querySelectorAll('[data-model]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
  $('motion-toggle').addEventListener('click',()=>{
    if(!engine)return;
    if($('molecular-viewport').dataset.motionState==='playing')engine.stopAnimation();
    else engine.animateModel({durationMs:2500});
  });
  document.addEventListener('click',event=>{if($('sidebar').classList.contains('open')&&!event.target.closest('#sidebar,#menu-toggle')){$('sidebar').classList.remove('open');$('menu-toggle').setAttribute('aria-expanded','false');}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){$('sidebar').classList.remove('open');$('menu-toggle').setAttribute('aria-expanded','false');}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)engine?.stopAnimation();});
  $('isolate').addEventListener('change',e=>engine?.isolate(e.target.checked));$('zoom-in').addEventListener('click',()=>engine?.zoom(.12));$('zoom-out').addEventListener('click',()=>engine?.zoom(-.12));$('reset-view').addEventListener('click',()=>engine?.reset());$('retry-load').addEventListener('click',createEngine);
  window.addEventListener('hashchange',route);window.addEventListener('beforeunload',()=>{story?.destroy();engine?.destroy();});route();
})();
