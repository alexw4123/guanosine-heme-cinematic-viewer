import React, {useEffect, useRef, useState} from 'react';
import {ArrowRightIcon,ArrowDownIcon, PlayIcon, PlusIcon, MinusIcon, ResetIcon, Cross2Icon} from '@radix-ui/react-icons';
import {ScrollAssay} from './ScrollAssay.jsx';
const components=[['all','Whole bundle'],['peptide','Peptide helices'],['guanosine','Guanosine caps'],['linker','PEG2 linkers'],['histidines','Histidines'],['heme','Heme + Fe']];
export function App(){
 const viewport=useRef(null),engine=useRef(null),records=useRef(null),video=useRef(null),hero=useRef(null);
 const [load,setLoad]=useState('loading'),[attempt,setAttempt]=useState(0),[mode,setMode]=useState('hybrid');
 const [selection,setSelection]=useState({key:'all',label:'The original PEG2 model',caption:'Four capped peptide chains surround hemin. Inspect a component to see its role.'});
 const [inspecting,setInspecting]=useState(false),[interactive,setInteractive]=useState(false),[isolated,setIsolated]=useState(false);
 const [active,setActive]=useState('structure'),[playing,setPlaying]=useState(false);
 const [motionOff,setMotionOff]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const reduced=()=>document.documentElement.dataset.motion==='reduced'||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 useEffect(()=>{document.documentElement.dataset.motion=motionOff?'reduced':'normal';},[motionOff]);
 const scroll=id=>document.getElementById(id)?.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'});
 function inspect(){setInspecting(true);setTimeout(()=>{viewport.current?.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'});viewport.current?.focus({preventScroll:true});},0);}
 useEffect(()=>{
  setLoad('loading');if(!window.createResearchMolecule){setLoad('error');return;}
  const instance=window.createResearchMolecule({project:'heme',viewport:viewport.current,backgroundColor:'#fafbfc',defaultMode:'hybrid',interactionEnabled:false,
   onReady:()=>setLoad('ready'),onError:()=>setLoad('error'),onSelection:s=>{setSelection(s);setIsolated(Boolean(s.isolated));}});
  engine.current=instance;return()=>{instance.destroy();engine.current=null;};
 },[attempt]);
 useEffect(()=>window.mountHemeResearch?.(records.current,{getEngine:()=>engine.current,onInspect:inspect}),[]);
 useEffect(()=>{
  let frame=null;
  const update=()=>{frame=null;if(load!=='ready'||inspecting||interactive||selection.key!=='all'||!hero.current)return;
   const box=hero.current.getBoundingClientRect();if(box.bottom<0||box.top>innerHeight)return;
   const p=Math.max(0,Math.min(1,-box.top/Math.max(1,box.height*.9)));hero.current.dataset.scrollProgress=String(Math.round(p*1000)/1000);
   engine.current?.setScrollPose({yaw:28*p,pitch:-7*p,zoom:-.025*p,static:reduced()});};
  const request=()=>{if(frame===null)frame=requestAnimationFrame(update);};
  window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request);request();
  return()=>{window.removeEventListener('scroll',request);window.removeEventListener('resize',request);if(frame!==null)cancelAnimationFrame(frame);};
 },[load,inspecting,interactive,selection.key,motionOff]);
 useEffect(()=>{
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('revealed');}),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  if(!reduced())document.documentElement.classList.add('motion-ready');
  const sections=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)setActive(entry.target.dataset.section);}),{rootMargin:'-20% 0px -55% 0px'});
  document.querySelectorAll('[data-section]').forEach(el=>sections.observe(el));
  function hashNavigation(){const key=location.hash.replace(/^#(?:heme\/)?/,'');
   if(['overview','structure','atomic-section','molecules'].includes(key)){window.scrollTo({top:0,behavior:reduced()?'instant':'smooth'});if(key==='molecules')setInspecting(true);return;}
   if(['chemistry','how-it-works','story'].includes(key)){scroll('chemistry');return;}
   if(['evidence','research'].includes(key)){scroll('evidence');return;}
   const record=document.getElementById('research-'+key);if(record){record.open=true;record.scrollIntoView({behavior:reduced()?'instant':'smooth'});}}
  window.addEventListener('hashchange',hashNavigation);if(location.hash)hashNavigation();
  const pauseObserver=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)video.current?.pause();},{threshold:.1});if(video.current)pauseObserver.observe(video.current);
  return()=>{observer.disconnect();sections.disconnect();pauseObserver.disconnect();window.removeEventListener('hashchange',hashNavigation);};
 },[]);
 function choose(key){engine.current?.setComponent(key);}
 function changeMode(value){setMode(value);engine.current?.setMode(value);}
 function toggleInteraction(){const enabled=!interactive;setInteractive(enabled);engine.current?.setInteractionEnabled?.(enabled);}
 function play(){if(!video.current)return;if(video.current.paused)video.current.play().catch(()=>setPlaying(false));else video.current.pause();}
 return <>
  <a className="skip-link" href="#evidence">Skip to research</a>
  <header className="masthead"><a className="project-mark" href="#structure">Guanosine + hemin</a><div className="masthead-right"><a className="university" href="https://www.fairfield.edu/" target="_blank" rel="noopener"><span><b>Fairfield</b> University</span><small>Smith-Carpenter Lab</small></a><a className="record-link" href="#evidence">Research record <ArrowRightIcon/></a></div></header>
  <main><section ref={hero} id="structure" className="opening" data-section="structure">
    <div className="hero-copy"><h1>Nucleopeptide<br/>heme bundle.</h1><p className="hero-deck">Designing a hemin-binding pocket from guanosine-capped peptide helices.</p><button className="primary" onClick={inspect}>Explore the structure <ArrowRightIcon/></button></div>
    <div className={'hero-visual '+(inspecting?'inspecting':'')}><div ref={viewport} id="molecular-viewport" tabIndex="0" role="img" aria-label="Interactive original PEG2 molecular model. Arrow keys rotate, plus and minus zoom, Home resets."/>
     {load==='loading'&&<div className="model-loading" role="status">Opening the original model…</div>}
     {load==='error'&&<div className="model-error" role="alert"><img src="assets/source-model-fallback.png" alt="Atomic representation of the original PEG2 source model"/><p>The interactive model could not load. The source image is shown here.</p><button onClick={()=>setAttempt(x=>x+1)}>Try again</button><a href="assets/heme-original.pdb" download>Download the source model</a></div>}
     <div className="model-note">Original PEG2 model<small>1,213 atoms</small></div>{!inspecting&&<span className="hero-scroll-note"><ArrowDownIcon/> Scroll to turn the view</span>}</div>
    <div className="structure-inspector" hidden={!inspecting}><div className="inspector-top"><span className="eyebrow">Inspect the original model</span><button className="icon-button" onClick={()=>{setInspecting(false);setInteractive(false);engine.current?.setInteractionEnabled?.(false);}} aria-label="Close structure controls"><Cross2Icon/></button></div>
     <div className="component-controls" aria-label="Select a molecular component">{components.map(([id,label])=><button key={id} data-component={id} aria-pressed={selection.key===id} onClick={()=>choose(id)}>{label}</button>)}</div>
     <div className="inspector-grid"><div className="selection-caption" aria-live="polite"><h2>{selection.label}</h2><p>{selection.caption}</p></div><div className="molecule-controls"><div className="representation" aria-label="Structure representation">{[['hybrid','Atoms + helices'],['atomic','Atoms'],['secondary','Secondary structure']].map(([id,label])=><button data-mode={id} key={id} aria-pressed={mode===id} onClick={()=>changeMode(id)}>{label}</button>)}</div>
      <div className="camera-controls"><button className="icon-button" aria-label="Zoom out" onClick={()=>engine.current?.zoom(-.12)}><MinusIcon/></button><button className="icon-button" aria-label="Zoom in" onClick={()=>engine.current?.zoom(.12)}><PlusIcon/></button><button onClick={()=>engine.current?.reset()}><ResetIcon/> Reset</button><label><input type="checkbox" checked={isolated} disabled={selection.key==='all'} onChange={e=>{engine.current?.isolate(e.target.checked);setIsolated(e.target.checked);}}/> Isolate</label></div>
      <button className="interaction-toggle" aria-pressed={interactive} onClick={toggleInteraction}>{interactive?'Finish rotating':'Rotate with touch or mouse'}</button><small>{interactive?'Drag to rotate. Finish rotating to resume normal page scrolling.':'Tap atoms to select. Page scrolling stays available.'}</small></div></div>
     <div className="color-key" aria-label="Structure colors">{[['chain-a','Helix A'],['chain-b','Helix B'],['chain-c','Helix C'],['chain-d','Helix D'],['caps','Guanosine'],['linkers','PEG2'],['cofactor','Heme + Fe']].map(([id,label])=><span className={id} key={id}>{label}</span>)}</div></div>
   </section>
   <nav className="section-nav" aria-label="Heme research sections">{[['structure','Structure'],['chemistry','Chemistry'],['evidence','Evidence']].map(([id,label])=><a href={'#'+id} key={id} aria-current={active===id?'location':undefined}>{label}</a>)}</nav>
   <div className="academic-credit"><p>Designing a Four-Helix Nucleopeptide Bundle Capable of Hemin Binding</p><p>Christie Stevkovski, Alexander Wong, and Jillian Smith-Carpenter</p><p>Smith-Carpenter Lab <span aria-hidden="true">|</span> Fairfield University</p></div>
   <section className="overview-section" aria-labelledby="overview-heading"><div className="overview-grid reveal"><div><span className="eyebrow">The research question</span><h2 id="overview-heading">Build the pocket.<br/>Test the chemistry.</h2></div><div><p>Can guanosine-capped peptides organize a hemin-binding bundle with a useful peroxide-dependent response?</p><p>Four peptide helices surround the cofactor in this model. PEG2 connects each peptide to its guanosine-derived cap. The next experiments ask whether the assembly binds hemin and changes its catalytic activity.</p><a className="text-link" href="#laboratory">See the next comparison <ArrowRightIcon/></a></div></div></section>
   <section id="chemistry" className="chemistry-section" data-section="chemistry" aria-labelledby="chemistry-heading"><div className="chemistry-intro reveal"><span className="eyebrow">How it works</span><h2 id="chemistry-heading">From a binding site<br/>to an optical signal.</h2><p>The chemistry connects the design to a measurable experiment.</p></div>
    <ScrollAssay motionOff={motionOff}/></section>
   <section id="evidence" className="evidence-section" data-section="evidence" aria-labelledby="evidence-heading"><header className="evidence-heading reveal"><div><span className="eyebrow">Modeling and experiment</span><h2 id="evidence-heading">Keep the evidence<br/>in view.</h2></div><p>The original model, saved simulation, historical experiments and later redesigns answer different questions. The research record keeps those versions together without treating them as the same result.</p></header>
    <div className="replay-feature reveal"><div className="replay-media"><video ref={video} playsInline controls={playing} preload="none" poster="assets/motion/heme-md-atomic-poster.jpg" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} aria-label="Five-second atomic replay of authentic saved simulation frames"><source src="assets/motion/heme-md-atomic-5s.mp4" type="video/mp4"/><track kind="captions" src="assets/motion/heme-md-atomic-5s.vtt" srcLang="en" label="English" default/></video>{!playing&&<button className="replay-play" onClick={play} aria-label="Play five-second saved simulation"><PlayIcon/></button>}</div><div className="replay-caption"><span className="eyebrow">The saved simulation</span><h3>Five seconds. <br/>Actual coordinates.</h3><p>An atomic-only replay of 120 selected saved frames. The frame indices stay visible. Physical simulation time has not been verified.</p><p className="source-note">As-run trajectory, separate from the opening PEG2 model. Water and ions are omitted from this view.</p><a className="text-link" href="#modeling">Read the analysis <ArrowRightIcon/></a></div></div>
    <div className="next-experiment reveal"><span className="eyebrow">The next experiment</span><h3>Does the assembly change the response?</h3><p>Compare peroxide-dependent ABTS oxidation in hemin-containing and control assemblies. Include free hemin, peptide-only and reagent controls before assessing a peroxide-reporting assay.</p></div><div ref={records} className="research-records"/>
   </section></main>
  <footer className="site-footer"><a href="#structure">Guanosine + hemin</a><p>Smith-Carpenter Lab<br/>Fairfield University</p><div className="footer-tools"><a href="#sources">Sources and methods <ArrowRightIcon/></a><button aria-pressed={motionOff} onClick={()=>setMotionOff(!motionOff)}>Reduce motion</button></div></footer>
 </>;
}
