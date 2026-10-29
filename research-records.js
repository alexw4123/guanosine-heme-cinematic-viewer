/* Heme research records. Source content stays separate from presentation. */
(() => {
  'use strict';
  window.mountHemeResearch = function mountHemeResearch(host, {getEngine = () => null, onInspect = () => {}} = {}) {
    const data = window.RESEARCH_CONTENT;
    const p = data?.projects?.heme;
    if (!p) { host.textContent = 'The research records could not load. Reload to try again.'; return () => {}; }
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const links = values => (values || []).map(s => s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>` : `<span class="source-citation">${esc(s.title)}</span>`).join('');
    const ids = values => links((values || []).map(id => data.sources[id]).filter(Boolean));
    const records = [['molecules','Sequences and model versions'],['laboratory','Laboratory work'],['modeling','Modeling and analysis'],['chemistry','Chemistry and earlier research'],['applications','Applications'],['sources','Sources and methods']];
    const dialog = document.createElement('dialog');
    dialog.className = 'research-figure-dialog';
    dialog.setAttribute('aria-label','Source figure preview');
    dialog.innerHTML = '<button type="button" class="close-figure">Close</button><img alt=""><p></p><a target="_blank" rel="noopener">Open source image</a>';
    document.body.append(dialog);
    dialog.querySelector('button').addEventListener('click', () => dialog.close());
    const showFigure = (src, caption, source) => {
      const image = dialog.querySelector('img'); image.src = src; image.alt = caption;
      dialog.querySelector('p').textContent = caption;
      dialog.querySelector('a').href = source || src;
      dialog.showModal();
    };
    const figureGroups = () => (window.RESEARCH_FIGURES?.heme || []).map(group => `<section class="source-figure-group"><h3>${esc(group.title)}</h3><p class="section-intro">${esc(group.intro)}</p><div class="figure-row">${group.figures.map(f => `<button type="button" class="figure-button" data-image="${esc(f.path)}" data-caption="${esc(f.caption)}" data-source="${esc(f.source || f.path)}"><img loading="lazy" src="${esc(f.path)}" alt="${esc(f.alt)}"><span>${esc(f.shortCaption)}</span></button>`).join('')}</div></section>`).join('');
    const experiment = e => {
      const fields = [{label:'Construct',value:e.construct},{label:'Sequence and termini',value:e.sequence}, ...(e.fields || [])].filter(f => f.value && String(f.value).trim() !== '—');
      return `<details class="experiment-card"><summary><span>${esc(e.title)}<small>${esc(e.summary)}</small></span></summary><div class="experiment-body"><div class="experiment-layout"><dl class="experiment-fields">${fields.map((f,i) => `<div class="${i < 2 ? 'wide' : ''}"><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl><button type="button" class="poster-preview" data-figure="poster"><img loading="lazy" src="assets/heme-poster.jpg" alt="Historical Fairfield poster with HPLC, mass spectrometry and circular-dichroism measurements"><span>Preview the historical poster</span></button></div><details class="methods"><summary>Procedure and characterization</summary>${(e.procedure || []).map(t => `<p>${esc(t)}</p>`).join('')}<p>${esc(e.characterization)}</p></details><p class="interpretation">${esc(e.interpretation)}</p><p class="source-note">${esc(e.sourceNote)}</p><div class="experiment-links">${links(e.sources)}</div></div></details>`;
    };
    host.innerHTML = records.map(([id,label],i) => `<details class="research-record" id="research-${id}"><summary><span class="record-number">0${i+1}</span><span>${label}</span></summary><div class="research-body" data-record="${id}"></div></details>`).join('');
    const section = id => host.querySelector(`[data-record="${id}"]`);
    let chain = 'PEPA';
    section('molecules').innerHTML = `<h3>Read the sequence in the structure</h3><p>These letters describe the original model. They have not been assigned to a synthesized batch.</p><div class="sequence-panel"><div class="component-buttons chain-buttons" aria-label="Choose a peptide chain">${['PEPA','PEPB','PEPC','PEPD'].map(c => `<button type="button" data-chain="${c}" aria-pressed="${c === chain}">${c}</button>`).join('')}</div><div class="sequence-row"></div><p class="source-note">Peptide positions 1–15. The separate GS2 cap precedes the sequence.</p></div><div class="sequence-versions">${p.sequences.map(s => `<div class="sequence-version"><h4>${esc(s.label)}</h4>${s.sequence ? `<code>${esc(s.sequence)}</code>` : ''}<p>${esc(s.caption)}</p>${ids(s.sourceIds)}</div>`).join('')}</div>`;
    const renderSequence = () => {
      const seq = ['PEPA','PEPC'].includes(chain) ? 'GEQALQEHEQLAQEL' : 'GEQLAQEAEQLLQEL';
      const row = section('molecules').querySelector('.sequence-row');
      row.innerHTML = `<span>${chain}</span><div class="sequence-letters">${[...seq].map((letter,i) => `<button type="button" data-residue="${i+1}" aria-label="${chain}, peptide residue ${i+1}, ${letter}">${letter}<small>${i+1}</small></button>`).join('')}</div>`;
      row.querySelectorAll('[data-residue]').forEach(button => button.addEventListener('click', () => {
        getEngine()?.setResidue(chain, Number(button.dataset.residue));
        row.querySelectorAll('[data-residue]').forEach(b => b.setAttribute('aria-pressed',String(b === button)));
        onInspect();
      }));
    };
    renderSequence();
    section('molecules').querySelectorAll('[data-chain]').forEach(button => button.addEventListener('click', () => {
      chain = button.dataset.chain; renderSequence();
      section('molecules').querySelectorAll('[data-chain]').forEach(b => b.setAttribute('aria-pressed',String(b === button)));
    }));
    section('laboratory').innerHTML = `<p class="section-intro">Historical characterization is separate from the displayed PEG2 model and the next ABTS comparison.</p>${p.experiments.map(experiment).join('')}`;
    section('modeling').innerHTML = `<p class="section-intro">Construction, saved simulation, analysis and later corrections are separate stages.</p><div class="video-card"><h3>Saved simulation. Atomic replay.</h3><video controls playsinline preload="none" poster="assets/motion/heme-md-atomic-poster.jpg"><source src="assets/motion/heme-md-atomic-5s.mp4" type="video/mp4"><track kind="captions" src="assets/motion/heme-md-atomic-5s.vtt" srclang="en" label="English" default></video><p>120 authentic saved frames (0, 42, …, 4998), played in five seconds. Saved-frame indices are shown; physical simulation time is unverified. The as-run model is separate from the opening model. No ribbon assignments are used.</p><a href="assets/motion/heme-atomic-replay-manifest.json" target="_blank" rel="noopener">Frame provenance</a></div><div class="steps">${p.steps.map(s => `<div class="step"><span class="step-number">${esc(s.number)}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>${links(s.sources)}</div></div>`).join('')}</div>${figureGroups()}`;
    section('chemistry').innerHTML = `<h3>${esc(p.chemistry.title)}</h3><p>${esc(p.chemistry.caption)}</p><div class="mechanism"><h4>An educational peroxidase cycle</h4><p class="reaction">H₂O₂ + reduced ABTS → green oxidized-ABTS signal</p><div class="mechanism-steps">${[['Ferric heme · Fe(III)','Peroxide enters an accessible site.'],['Compound I','A high-valent Fe(IV)=O / porphyrin-radical intermediate accepts one electron.'],['Compound II','A second reporter oxidation returns the catalyst to its resting state.']].map(([title,caption],i) => `<button type="button" data-cycle="${i}" aria-pressed="${i === 0}">${title}<small>${caption}</small></button>`).join('')}</div><p class="mechanism-caption" aria-live="polite">Peroxide can produce Compound I at an accessible heme site. This is a general mechanism, not an observed reaction in this bundle.</p></div><div class="cards-grid"><div class="card"><h4>The comparison needs controls</h4><ul>${p.chemistry.controls.map(t => `<li>${esc(t)}</li>`).join('')}</ul>${links(p.chemistry.sources)}</div><div class="card"><h4>Coordination and access</h4><p>The source model imposes two Fe–His bonds. Heme binding and an accessible peroxide reaction site are separate requirements. The monohistidine C45 precedent makes that distinction useful to test.</p><button type="button" class="text-action" data-inspect="histidines">Inspect the source structure</button></div></div><h3>What earlier designs demonstrated</h3><div class="prior-work">${p.priorWork.map(w => `<article class="card"><h4>${esc(w.title)}</h4><p>${esc(w.text)}</p><dl><dt>Architecture</dt><dd>${esc(w.architecture)}</dd><dt>Reaction</dt><dd>${esc(w.reaction)}</dd></dl>${links(w.sources)}</article>`).join('')}</div>`;
    const cycleCaptions = [
      'Peroxide can produce Compound I at an accessible heme site. This is a general mechanism, not an observed reaction in this bundle.',
      'An electron from a reporter such as ABTS reduces Compound I to Compound II and creates oxidized ABTS.',
      'A second reporter electron reduces Compound II and returns ferric heme. The green ABTS oxidation signal can be followed optically.'
    ];
    section('chemistry').querySelectorAll('[data-cycle]').forEach(button => button.addEventListener('click', () => {
      section('chemistry').querySelectorAll('[data-cycle]').forEach(b => b.setAttribute('aria-pressed',String(b === button)));
      section('chemistry').querySelector('.mechanism-caption').textContent = cycleCaptions[Number(button.dataset.cycle)];
    }));
    section('applications').innerHTML = window.renderResearchApplication?.('heme') || '<p>Application records could not load. Reload to try again.</p>';
    window.bindResearchApplication?.(section('applications'),'heme');
    section('sources').innerHTML = `<p class="section-intro">Public studies are linked below. Laboratory records are cited by title; their access remains with the lab. Molecular files preserve the source coordinates.</p><div class="source-list">${p.sources.map(s => s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}<small>${esc(new URL(s.url,document.baseURI).hostname)}</small></a>` : `<div class="source-citation">${esc(s.title)}</div>`).join('')}</div><details class="methods"><summary>Molecular integrity and rendering</summary><p>Source coordinates and explicit connectivity are preserved. NGL loads connected files with bond inference disabled. Secondary structure comes from each loaded structure’s own coordinates. Selected saved simulation frames are replayed atomically; they do not carry a fixed ribbon assignment.</p><p>1,213 atoms and 1,232 explicit bonds. The Fe–histidine connections are specified in this model; binding and catalytic activity require experiments.</p><p><a href="assets/heme-original.pdb" download>Download the original PEG2 coordinates</a></p></details>`;
    host.querySelectorAll('[data-figure]').forEach(button => button.addEventListener('click', () => showFigure('assets/heme-poster.jpg','Historical poster. Earlier experimental samples, separate from the PEG2 model.','assets/heme-poster.jpg')));
    host.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => showFigure(button.dataset.image,button.dataset.caption,button.dataset.source)));
    host.querySelectorAll('[data-inspect]').forEach(button => button.addEventListener('click', () => { getEngine()?.setComponent(button.dataset.inspect); onInspect(); }));
    const intercept = event => {
      const link = event.target.closest('a[href^="#heme/"]');
      if (!link) return;
      const key = link.getAttribute('href').split('/')[1];
      if (key === 'molecules') { event.preventDefault(); onInspect(); return; }
      const record = host.querySelector(`#research-${key}`);
      if (record) { event.preventDefault(); record.open = true; record.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth'}); }
    };
    host.addEventListener('click',intercept);
    return () => { host.removeEventListener('click',intercept); dialog.remove(); host.innerHTML = ''; };
  };
})();
