/* User-paced research stories. Scene geometry, evidence and source structures are separate. */
(() => {
  'use strict';
  const escapeText=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const playIcon='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 9 6-9 6Z" fill="currentColor"/></svg>';
  const pauseIcon='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4h3v12H6zm5 0h3v12h-3z" fill="currentColor"/></svg>';
  const arrowIcon=direction=>`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="${direction==='previous'?'m12 5-5 5 5 5':'m8 5 5 5-5 5'}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  window.mountResearchStory=function mountResearchStory({project,host,onExploreStructure=()=>{}}={}) {
    const story=window.RESEARCH_STORY;
    if(!host||!story||story.project!==project||!Array.isArray(story.scenes)||!story.scenes.length){
      if(host)host.innerHTML='<p class="source-note">The process could not open. Reload the page to try again.</p>';
      return {destroy(){},pause(){},play(){},goToScene(){}};
    }
    const scenes=story.scenes;
    const duration=scenes.map(s=>Math.max(1,Number(s.durationSeconds)||15));
    const starts=duration.map((_,i)=>duration.slice(0,i).reduce((a,b)=>a+b,0));
    const total=duration.reduce((a,b)=>a+b,0);
    const media=matchMedia('(prefers-reduced-motion:reduce)');
    let reduced=media.matches,index=0,progress=0,elapsed=0,playing=false,destroyed=false,frame=0,lastTick=0,lastClock=-1,sceneApi=null,sceneFailed=false;
    let variant=project==='dhfr'?'normal':'glucose',variantChosen=false;
    const time=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
    host.classList.add('research-story');
    host.dataset.storyProject=project;
    host.innerHTML=`<header class="story-heading"><div><span class="eyebrow">How it works</span><h2>${escapeText(story.title)}</h2></div><p>${escapeText(story.subtitle)}</p></header>
      <section class="story-player" aria-label="${escapeText(story.title)}">
        <div class="story-visual" tabindex="0" role="img" aria-label="3D illustrated process. Press Space to play or pause. Arrow keys choose a chapter.">
          <div class="story-stage"></div>
          <div class="story-scene-hud"><span class="story-scale"></span><span class="story-illustration">Illustrated process</span></div>
          <div class="story-stage-status" role="status">Preparing the 3D scene…</div>
          <div class="story-location" aria-label="Location"></div>
          <p class="story-onstage-caption" aria-hidden="true"></p>
        </div>
        <div class="story-controls">
          <div class="story-playback"><button type="button" class="story-play" aria-label="Play story">${playIcon}<span>Play story</span></button><div class="story-skip"><button type="button" class="story-previous" aria-label="Previous chapter">${arrowIcon('previous')}</button><button type="button" class="story-next" aria-label="Next chapter">${arrowIcon('next')}</button></div><button type="button" class="story-restart">Restart</button><span class="story-clock" aria-hidden="true">0:00 / ${time(total)}</span></div>
          <label class="story-scrub"><span class="visually-hidden">Story position</span><input type="range" min="0" max="${total}" value="0" step="0.05" aria-label="Story position"></label>
          <p class="story-motion-note" ${reduced?'':'hidden'}>Reduced motion is on. Choose a chapter or move the timeline to inspect each scene.</p>
        </div>
      </section>
      <nav class="story-chapters" aria-label="Story chapters">${scenes.map((s,i)=>`<button type="button" data-story-chapter="${i}" aria-current="${i===0?'step':'false'}"><span>${String(i+1).padStart(2,'0')}</span><strong>${escapeText(s.title)}</strong></button>`).join('')}</nav>
      <section class="story-caption" aria-live="polite" aria-atomic="true">
        <div class="story-caption-top"><span class="eyebrow story-evidence-type"></span><span class="story-step-count"></span></div>
        <h3 class="story-question"></h3><p class="story-caption-copy"></p>
        <div class="story-variants" aria-label="Choose a comparison"></div><p class="story-variant-note" hidden></p>
        <div class="story-caption-actions"><button type="button" class="story-structure" hidden>Open the actual structure <span aria-hidden="true">↗</span></button><details class="story-evidence"><summary>Explanation &amp; sources</summary><div class="story-evidence-body"></div></details></div>
      </section>`;
    const $=selector=>host.querySelector(selector);
    const stage=$('.story-stage'),visual=$('.story-visual'),play=$('.story-play'),scrub=$('.story-scrub input'),status=$('.story-stage-status');
    let clock=$('.story-clock');
    function bringPlayerIntoView(){
      requestAnimationFrame(()=>{if(!destroyed)$('.story-player').scrollIntoView({block:'start',behavior:reduced?'instant':'smooth'});});
    }
    function updateEvidenceBadge(){
      $('.story-illustration').textContent=stage.dataset.sourceHashVerified==='true'?(scenes[index].id==='iron'?'Source model + illustration':'Source model'):'Illustrated process';
    }
    const sourceObserver=new MutationObserver(updateEvidenceBadge);
    sourceObserver.observe(stage,{attributes:true,attributeFilter:['data-source-hash-verified','data-source-model']});
    function reflect(){
      host.dataset.storyState=playing?'playing':elapsed>=total?'completed':'paused';
      host.dataset.storyScene=scenes[index].id;
      host.dataset.storyProgress=String(Math.round(progress*10000)/10000);
      host.dataset.storyVariant=variant;
      scrub.value=String(elapsed);
      scrub.setAttribute('aria-valuetext',`${time(elapsed)} of ${time(total)}. ${scenes[index].title}`);
      const quarter=Math.floor(elapsed*4);
      if(quarter!==lastClock){clock.textContent=`${time(elapsed)} / ${time(total)}`;lastClock=quarter;}
    }
    function updatePlay(){
      play.innerHTML=(playing?pauseIcon:playIcon)+`<span>${playing?'Pause':elapsed>=total?'Replay story':'Play story'}</span>`;
      play.setAttribute('aria-label',playing?'Pause story':elapsed>=total?'Replay story':'Play story');
      play.setAttribute('aria-pressed',String(playing));
      play.disabled=reduced;
      if(reduced){play.innerHTML=playIcon+'<span>Manual chapters</span>';play.setAttribute('aria-label','Manual chapters. Reduced motion is enabled.');}
      reflect();
    }
    function pause(){
      playing=false;cancelAnimationFrame(frame);frame=0;lastTick=0;updatePlay();
    }
    function bridgeFor(scene){
      if(scene.structure)return {...scene.structure,returnScene:scene.id};
      if(project==='heme'&&['bundle','iron'].includes(scene.id))return {selection:scene.id==='iron'?'heme':'all',mode:scene.id==='bundle'?'secondary':'atomic',returnScene:scene.id};
      if(project==='dhfr'&&scene.id==='cell')return {selection:'protein',mode:'secondary',model:'gs',returnScene:scene.id,label:'Inspect the prepared DHFR model'};
      if(project==='dhfr'&&scene.id==='inhibition'&&['gs','isog'].includes(variant))return {selection:'base',mode:'atomic',model:variant,returnScene:scene.id,label:`Inspect the ${variant==='gs'?'GS':'isog'} model`};
      return null;
    }
    function renderCaption(){
      const base=scenes[index];
      const overrides=base.variants?.[variant]||base.variants?.[variant==='methotrexate'?'mtx':variant]||{};
      const current={...base,...overrides};
      $('.story-scale').textContent=current.scale||'';
      const breadcrumbs=Array.isArray(current.breadcrumb)?current.breadcrumb:String(current.breadcrumb||'').split(/\s*→\s*/);
      $('.story-location').innerHTML=breadcrumbs.map((b,i)=>`<span${i===breadcrumbs.length-1?' class="current"':''}>${escapeText(b)}</span>`).join('<i aria-hidden="true">›</i>');
      $('.story-evidence-type').textContent=current.evidenceType||'Illustrated process';
      $('.story-step-count').textContent=`${index+1} / ${scenes.length}`;
      $('.story-question').textContent=current.question||current.title;
      $('.story-caption-copy').textContent=current.caption||'';
      $('.story-onstage-caption').textContent=current.onstageCaption||current.caption||'';
      updateEvidenceBadge();
      visual.setAttribute('aria-label',`${current.title}. ${current.caption||''} Illustrated process. Space plays or pauses; arrow keys choose a chapter.`);
      const variants=project==='dhfr'&&['inhibition','nucleotides','dna','outcome'].includes(base.id)?[['normal','Normal'],['methotrexate','Methotrexate'],['gs','GS model'],['isog','isog model']]:project==='heme'&&base.id==='recognition'?[['glucose','Glucose'],['cholesterol','Cholesterol'],['methotrexate','Methotrexate']]:[];
      const variantHost=$('.story-variants'),focusedVariant=document.activeElement?.dataset?.storyVariant;
      variantHost.hidden=!variants.length;
      variantHost.innerHTML=variants.map(([key,label])=>`<button type="button" data-story-variant="${key}" aria-pressed="${key===variant}">${escapeText(label)}</button>`).join('');
      variantHost.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
        variant=button.dataset.storyVariant;variantChosen=true;
        sceneApi?.setScene(base.id,progress,{variant,reducedMotion:reduced});
        renderCaption();reflect();bringPlayerIntoView();
      }));
      if(focusedVariant)variantHost.querySelector(`[data-story-variant="${focusedVariant}"]`)?.focus({preventScroll:true});
      const variantNote=$('.story-variant-note');
      variantNote.hidden=!(project==='dhfr'&&['gs','isog'].includes(variant)&&variants.length);
      variantNote.textContent='For GS and isog, uptake, inhibition and cell response remain questions to test.';
      const deep=Array.isArray(current.deep)?current.deep:[current.deep].filter(Boolean);
      const sources=(current.sources||[]).map(source=>`<a href="${escapeText(source.url)}" target="_blank" rel="noopener">${escapeText(source.title)} <span aria-hidden="true">↗</span></a>`).join('');
      $('.story-evidence-body').innerHTML=(current.evidenceNote?`<p class="story-evidence-note">${escapeText(current.evidenceNote)}</p>`:'')+deep.map(p=>`<p>${escapeText(p)}</p>`).join('')+(current.scaleNote?`<p class="story-scale-note">${escapeText(current.scaleNote)}</p>`:'')+(sources?`<div class="story-source-links">${sources}</div>`:'');
      $('.story-evidence').open=false;
      const bridge=bridgeFor(base);
      $('.story-structure').hidden=!bridge;
      $('.story-structure').innerHTML=escapeText(bridge?.label||'Open the actual structure')+' <span aria-hidden="true">↗</span>';
      host.querySelectorAll('[data-story-chapter]').forEach(button=>button.setAttribute('aria-current',Number(button.dataset.storyChapter)===index?'step':'false'));
      $('.story-previous').disabled=index===0&&progress===0;
      $('.story-next').disabled=index===scenes.length-1&&progress===1;
    }
    function setScene(next,nextProgress=0){
      const changed=next!==index;
      index=Math.max(0,Math.min(scenes.length-1,next));progress=Math.max(0,Math.min(1,nextProgress));elapsed=starts[index]+duration[index]*progress;
      if(project==='dhfr'&&scenes[index].id==='reaction'){variant='normal';variantChosen=false;}
      if(changed&&!variantChosen&&project==='dhfr'){
        if(scenes[index].id==='reaction')variant='normal';
        if(scenes[index].id==='inhibition')variant='methotrexate';
      }
      sceneApi?.setScene(scenes[index].id,progress,{variant,reducedMotion:reduced});
      renderCaption();reflect();
    }
    function setElapsed(value){
      const nextElapsed=Math.max(0,Math.min(total,Number(value)||0));
      const next=nextElapsed===total?scenes.length-1:starts.findIndex((start,i)=>nextElapsed>=start&&nextElapsed<start+duration[i]);
      const nextProgress=(nextElapsed-starts[next])/duration[next];
      if(next!==index)setScene(next,nextProgress);
      else{progress=nextProgress;elapsed=nextElapsed;sceneApi?.setProgress(progress);reflect();}
    }
    function tick(now){
      if(!playing||destroyed)return;
      const delta=lastTick?Math.min(.12,(now-lastTick)/1000):0;lastTick=now;
      setElapsed(elapsed+delta);
      if(elapsed>=total){pause();return;}
      frame=requestAnimationFrame(tick);
    }
    function start(){
      if(reduced||destroyed)return;
      if(elapsed>=total){variantChosen=false;variant=project==='dhfr'?'normal':'glucose';setScene(0,0);}
      playing=true;lastTick=0;updatePlay();frame=requestAnimationFrame(tick);bringPlayerIntoView();
    }
    function goToScene(idOrIndex,options={}){
      const next=typeof idOrIndex==='string'?scenes.findIndex(scene=>scene.id===idOrIndex):Number(idOrIndex);
      if(!Number.isInteger(next)||next<0||next>=scenes.length)return false;
      if(options.variant){variant=options.variant;variantChosen=true;}
      pause();setScene(next,Number(options.progress)||0);bringPlayerIntoView();return true;
    }
    play.addEventListener('click',()=>playing?pause():start());
    $('.story-previous').addEventListener('click',()=>goToScene(progress>.1?index:Math.max(0,index-1)));
    $('.story-next').addEventListener('click',()=>goToScene(Math.min(scenes.length-1,index+1)));
    $('.story-restart').addEventListener('click',()=>{pause();variantChosen=false;variant=project==='dhfr'?'normal':'glucose';setScene(0,0);});
    scrub.addEventListener('input',()=>{const value=scrub.value;pause();setElapsed(value);updatePlay();});
    host.querySelectorAll('[data-story-chapter]').forEach(button=>button.addEventListener('click',()=>goToScene(Number(button.dataset.storyChapter))));
    $('.story-structure').addEventListener('click',()=>{pause();const bridge=bridgeFor(scenes[index]);if(bridge)onExploreStructure(bridge);});
    const keys=event=>{
      if(event.target!==visual)return;
      if(event.key===' '){event.preventDefault();playing?pause():start();}
      else if(event.key==='ArrowRight'){event.preventDefault();goToScene(Math.min(scenes.length-1,index+1));}
      else if(event.key==='ArrowLeft'){event.preventDefault();goToScene(Math.max(0,index-1));}
      else if(event.key==='Escape')pause();
    };
    visual.addEventListener('keydown',keys);
    const visibility=()=>{if(document.hidden)pause();};
    const preference=event=>{reduced=event.matches;pause();$('.story-motion-note').hidden=!reduced;sceneApi?.setScene(scenes[index].id,progress,{variant,reducedMotion:reduced});};
    const resize=()=>sceneApi?.resize();
    document.addEventListener('visibilitychange',visibility);media.addEventListener('change',preference);window.addEventListener('resize',resize,{passive:true});
    try{
      sceneApi=window.createResearchStoryScene({project,container:stage,onError:error=>{
        if(destroyed)return;sceneFailed=true;pause();status.hidden=false;status.textContent='The 3D scene could not load. You can still follow the captions, chapters and source structures.';console.warn(error);
      }});
      Promise.resolve(sceneApi?.ready).then(()=>{if(destroyed||sceneFailed)return;status.hidden=true;sceneApi?.resize();}).catch(error=>{
        if(destroyed)return;sceneFailed=true;pause();status.hidden=false;status.textContent='The 3D scene could not load. Use the chapters and source structures to continue.';console.warn(error);
      });
    }catch(error){sceneFailed=true;status.textContent='The 3D scene could not load. Use the chapters and source structures to continue.';console.warn(error);}
    setScene(0,0);updatePlay();
    return {pause,play:start,goToScene,destroy(){
      if(destroyed)return;pause();destroyed=true;sourceObserver.disconnect();sceneApi?.destroy();sceneApi=null;
      ['storyState','storyScene','storyVariant','storyProgress','storyProject'].forEach(key=>delete host.dataset[key]);
      document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',preference);window.removeEventListener('resize',resize);visual.removeEventListener('keydown',keys);host.classList.remove('research-story');
    }};
  };
})();
