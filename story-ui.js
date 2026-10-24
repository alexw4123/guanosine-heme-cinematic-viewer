/* Compact molecular animation. Source structures, scene geometry and explanations remain separate. */
(() => {
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icons={
    play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7Z" fill="currentColor"/></svg>',
    pause:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zm6 0h4v14h-4z" fill="currentColor"/></svg>',
    previous:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    reset:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8v5h5M5.5 12a7 7 0 1 0 2-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  const order={heme:['bundle','iron','catalysis','signal','calibration'],dhfr:['cell','reaction','inhibition','nucleotides','dna']};
  const labels={heme:{bundle:'Structure',iron:'Heme site',catalysis:'Reaction',signal:'Signal',calibration:'Measurement'},dhfr:{cell:'Structure',reaction:'Reaction',inhibition:'Comparison',nucleotides:'Nucleotides',dna:'DNA synthesis'}};
  const seconds=7;

  window.mountResearchStory=function mountResearchStory({project,host,onExploreStructure=()=>{},initialScene=null,initialVariant=null,initialProgress=0}={}) {
    const data=window.RESEARCH_STORY;
    const available=Array.isArray(data?.scenes)?data.scenes:[];
    const scenes=(data?.mainSceneIds||order[project]||[]).map(id=>available.find(scene=>scene.id===id)).filter(Boolean);
    if(!host||data?.project!==project||!scenes.length){
      if(host)host.innerHTML='<p class="source-note">The animation could not open. Reload to try again.</p>';
      return {destroy(){},pause(){},play(){},goToScene(){return false;}};
    }
    const total=scenes.length*seconds,media=matchMedia('(prefers-reduced-motion:reduce)');
    let index=0,progress=0,elapsed=0,variant=initialVariant||(project==='dhfr'?'normal':'glucose'),variantChosen=Boolean(initialVariant);
    let playing=false,requestedPlay=false,destroyed=false,reduced=media.matches,frame=0,lastTick=0,sceneApi=null,ready=false,sceneFailed=false;
    host.classList.add('research-story','compact-process');
    host.dataset.storyProject=project;
    host.dataset.storyDuration=String(total);
    host.innerHTML=`<section class="story-player" aria-label="Molecular animation">
      <div class="story-visual" tabindex="0" role="img" aria-label="Molecular animation. Space plays or pauses. Arrow keys choose a step."><div class="story-stage"></div><div class="story-stage-status" role="status">Loading…</div></div>
      <div class="story-caption" aria-live="polite" aria-atomic="true"><span class="story-caption-title"></span><p class="story-onstage-caption story-caption-copy"></p></div>
      <div class="story-controls"><div class="story-playback">
        <button type="button" class="story-play" aria-label="Play animation" title="Play">${icons.play}</button>
        <label class="story-scrub"><span class="visually-hidden">Animation position</span><input type="range" min="0" max="${total}" step="0.05" value="0" aria-label="Animation position"></label>
        <button type="button" class="story-previous" aria-label="Previous step" title="Previous">${icons.previous}</button>
        <button type="button" class="story-next" aria-label="Next step" title="Next">${icons.next}</button>
        <button type="button" class="story-restart" aria-label="Reset animation" title="Reset">${icons.reset}</button>
      </div><p class="story-motion-note" ${reduced?'':'hidden'}>Choose a step to view it with reduced motion.</p></div>
    </section>
    <nav class="story-chapters" aria-label="Animation steps">${scenes.map((scene,i)=>`<button type="button" data-story-chapter="${i}" aria-current="${i===0?'step':'false'}">${esc(labels[project][scene.id]||scene.title)}</button>`).join('')}</nav>
    <div class="story-variants" aria-label="Compare the models" hidden></div>
    <div class="story-caption-actions"><button type="button" class="story-structure" hidden>Inspect the structure <span aria-hidden="true">↗</span></button><details class="story-evidence"><summary>Details and sources</summary><div class="story-evidence-body"></div></details></div>`;
    const $=selector=>host.querySelector(selector);
    const stage=$('.story-stage'),visual=$('.story-visual'),play=$('.story-play'),scrub=$('.story-scrub input'),status=$('.story-stage-status');
    const time=value=>`${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}`;
    function reflect(){
      host.dataset.storyState=playing?'playing':elapsed>=total?'completed':'paused';
      host.dataset.storyScene=scenes[index].id;
      host.dataset.storyProgress=String(Math.round(progress*10000)/10000);
      host.dataset.storyVariant=variant;
      scrub.value=String(elapsed);
      scrub.setAttribute('aria-valuetext',`${labels[project][scenes[index].id]||scenes[index].title}. ${time(elapsed)} of ${time(total)}.`);
    }
    function updatePlay(){
      play.innerHTML=playing?icons.pause:icons.play;
      play.setAttribute('aria-label',playing?'Pause animation':elapsed>=total?'Replay animation':'Play animation');
      play.title=playing?'Pause':elapsed>=total?'Replay':'Play';
      play.setAttribute('aria-pressed',String(playing));
      play.disabled=reduced||sceneFailed;
      if(reduced){play.setAttribute('aria-label','Animation paused for reduced motion. Choose a step below.');play.title='Reduced motion';}
      reflect();
    }
    function pause(){requestedPlay=false;playing=false;cancelAnimationFrame(frame);frame=0;lastTick=0;updatePlay();}
    function bridgeFor(scene){
      if(scene.structure)return {...scene.structure,returnScene:scene.id};
      if(project==='heme'&&['bundle','iron'].includes(scene.id))return {selection:scene.id==='iron'?'heme':'all',mode:'atomic',returnScene:scene.id,label:'Inspect the structure'};
      if(project==='dhfr'&&scene.id==='cell')return {selection:'protein',mode:'atomic',model:'gs',returnScene:scene.id,label:'Inspect the DHFR model'};
      if(project==='dhfr'&&scene.id==='inhibition'&&['gs','isog'].includes(variant))return {selection:'base',mode:'atomic',model:variant,returnScene:scene.id,label:`Inspect the ${variant==='gs'?'GS':'isog'} model`};
      return null;
    }
    function renderCaption(){
      const base=scenes[index],current={...base,...(base.variants?.[variant]||base.variants?.[variant==='methotrexate'?'mtx':variant]||{})};
      const short=current.shortCaption||current.onstageCaption||current.caption||'';
      $('.story-caption-title').textContent=labels[project][base.id]||base.title;
      $('.story-onstage-caption').textContent=short;
      visual.setAttribute('aria-label',`${base.title}. ${short} Space plays or pauses; arrow keys choose a step.`);
      const variants=project==='dhfr'&&['inhibition','nucleotides','dna'].includes(base.id)?[['normal','Normal'],['methotrexate','Methotrexate'],['gs','GS model'],['isog','isog model']]:[];
      const variantHost=$('.story-variants'),focusedVariant=document.activeElement?.dataset?.storyVariant;
      variantHost.hidden=!variants.length;
      variantHost.innerHTML=variants.map(([key,label])=>`<button type="button" data-story-variant="${key}" aria-pressed="${key===variant}">${esc(label)}</button>`).join('');
      variantHost.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
        pause();variant=button.dataset.storyVariant;variantChosen=true;
        sceneApi?.setScene(base.id,progress,{variant,reducedMotion:reduced});
        renderCaption();updatePlay();
      }));
      if(focusedVariant)variantHost.querySelector(`[data-story-variant="${focusedVariant}"]`)?.focus({preventScroll:true});
      const deep=Array.isArray(current.deep)?current.deep:[current.deep].filter(Boolean);
      const sourceList=(current.sources||[]).map(source=>source.url?`<a href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.title)} <span aria-hidden="true">↗</span></a>`:`<span class="source-citation">${esc(source.title)}</span>`).join('');
      const details=[];
      if(current.caption&&current.caption!==short)details.push(`<p>${esc(current.caption)}</p>`);
      if(current.evidenceNote)details.push(`<p>${esc(current.evidenceNote)}</p>`);
      details.push(...deep.map(paragraph=>`<p>${esc(paragraph)}</p>`));
      const scaleNote=current.scaleNote||data.scaleNote;
      if(scaleNote)details.push(`<p class="story-scale-note">${esc(scaleNote)}</p>`);
      if(sourceList)details.push(`<div class="story-source-links">${sourceList}</div>`);
      $('.story-evidence-body').innerHTML=details.join('');
      const bridge=bridgeFor(base);
      $('.story-structure').hidden=!bridge;
      $('.story-structure').innerHTML=esc(bridge?.label||'Inspect the structure')+' <span aria-hidden="true">↗</span>';
      host.querySelectorAll('[data-story-chapter]').forEach(button=>button.setAttribute('aria-current',Number(button.dataset.storyChapter)===index?'step':'false'));
      $('.story-previous').disabled=index===0&&progress===0;
      $('.story-next').disabled=index===scenes.length-1&&progress===1;
    }
    function setScene(next,nextProgress=0){
      const changed=next!==index;
      index=Math.max(0,Math.min(scenes.length-1,next));progress=Math.max(0,Math.min(1,Number(nextProgress)||0));elapsed=index*seconds+progress*seconds;
      if(project==='dhfr'&&scenes[index].id==='reaction'){variant='normal';variantChosen=false;}
      if(changed&&!variantChosen&&project==='dhfr'&&scenes[index].id==='inhibition')variant='methotrexate';
      sceneApi?.setScene(scenes[index].id,progress,{variant,reducedMotion:reduced});
      renderCaption();reflect();
    }
    function setElapsed(value){
      const nextElapsed=Math.max(0,Math.min(total,Number(value)||0));
      const next=nextElapsed===total?scenes.length-1:Math.floor(nextElapsed/seconds);
      const nextProgress=(nextElapsed-next*seconds)/seconds;
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
      if(reduced||destroyed||sceneFailed||playing)return false;
      if(!ready){requestedPlay=true;return true;}
      if(elapsed>=total){variantChosen=false;variant=project==='dhfr'?'normal':'glucose';setScene(0,0);}
      playing=true;requestedPlay=false;lastTick=0;updatePlay();frame=requestAnimationFrame(tick);return true;
    }
    function goToScene(idOrIndex,options={}){
      const next=typeof idOrIndex==='string'?scenes.findIndex(scene=>scene.id===idOrIndex):Number(idOrIndex);
      if(!Number.isInteger(next)||next<0||next>=scenes.length)return false;
      if(options.variant){variant=options.variant;variantChosen=true;}
      pause();setScene(next,Number(options.progress)||0);updatePlay();return true;
    }
    play.addEventListener('click',()=>playing||requestedPlay?pause():start());
    $('.story-previous').addEventListener('click',()=>goToScene(progress>.1?index:Math.max(0,index-1)));
    $('.story-next').addEventListener('click',()=>goToScene(Math.min(scenes.length-1,index+1)));
    $('.story-restart').addEventListener('click',()=>{pause();variantChosen=false;variant=project==='dhfr'?'normal':'glucose';setScene(0,0);updatePlay();});
    scrub.addEventListener('input',()=>{const value=scrub.value;pause();setElapsed(value);updatePlay();});
    host.querySelectorAll('[data-story-chapter]').forEach(button=>button.addEventListener('click',()=>goToScene(Number(button.dataset.storyChapter))));
    $('.story-evidence').addEventListener('toggle',()=>{if($('.story-evidence').open)pause();});
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
    function fail(error){if(destroyed)return;sceneFailed=true;pause();status.hidden=false;status.textContent='The molecular view could not load. Reload to try again.';console.warn(error);}
    try{
      sceneApi=window.createResearchStoryScene({project,container:stage,onError:fail});
      Promise.resolve(sceneApi?.ready).then(()=>{if(destroyed||sceneFailed)return;ready=true;status.hidden=true;sceneApi?.resize();if(requestedPlay)start();}).catch(fail);
    }catch(error){fail(error);}
    setScene(0,0);updatePlay();
    if(initialScene!==null)goToScene(initialScene,{variant:initialVariant,progress:initialProgress});
    return {pause,play:start,goToScene,destroy(){
      if(destroyed)return;pause();destroyed=true;sceneApi?.destroy();sceneApi=null;
      ['storyState','storyScene','storyVariant','storyProgress','storyProject','storyDuration'].forEach(key=>delete host.dataset[key]);
      document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',preference);window.removeEventListener('resize',resize);visual.removeEventListener('keydown',keys);
      host.classList.remove('research-story','compact-process');
    }};
  };
})();

