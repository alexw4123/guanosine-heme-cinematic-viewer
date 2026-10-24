import { PROJECTS } from './story-data.js';
import { createMolecularScene } from './molecular-scene.js';

const $ = (id) => document.getElementById(id);
const id = document.body.dataset.project;
const project = PROJECTS[id];
const isHeme = id === 'heme';
const repository = isHeme ? 'guanosine-heme-cinematic-viewer' : 'dhfr-cinematic-viewer';
const stageNames = isHeme ? ['The atoms', 'The assembly', 'Into solution', 'The chemistry', 'The biosensor', 'The next test'] : ['The target', 'The candidates', 'Into solution', 'The mechanism', 'Toward cells', 'The next test'];
const hero = isHeme ? 'From atoms.<br>To <em>signal.</em>' : 'One target.<br>A new <em>question.</em>';
const spatial = isHeme ? ['ORIGINAL ATOMIC DESIGN', 'ASSEMBLY · EXPLANATORY MOTION', 'AS-RUN MODEL · AUTHENTIC SAVED FRAMES', 'HEME CENTER · MECHANISM SCHEMATIC', 'EXTERNAL BIOSENSOR · PROPOSED', 'ACTIVITY & CALIBRATION TO TEST'] : ['PREPARED HUMAN DHFR MODEL', 'CANDIDATE PLACEMENT · ILLUSTRATIVE', 'SOLUTION PREPARATION · ILLUSTRATIVE', 'FOLATE PATHWAY · MECHANISM CONTEXT', 'DELIVERY & UPTAKE · UNTESTED', 'BINDING, INHIBITION & SELECTIVITY TO TEST'];
let engine;
let ready = false;
let playing = false;
let filmTime = 0;
let currentStage = -1;
let voice = false;
let exploring = false;
let resumeTime = 0;
let recording = false;
let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let previousTick = performance.now();
let lastStatusUpdate = 0;
let recordState = null;
let recordChunks = [];
let utterance = null;

$('project-name').textContent = isHeme ? 'Guanosine · Heme' : 'Human DHFR · GS / isog';
$('brand').innerHTML = isHeme ? 'HEME /<br>MOLECULAR CINEMA' : 'DHFR /<br>MOLECULAR CINEMA';
$('repository-link').href = `https://github.com/alexw4123/${repository}`;
$('candidate-control').hidden = isHeme;
$('vmd-link').hidden = !isHeme;
$('legend-protein').textContent = isHeme ? 'Peptide helices' : 'Human DHFR';
$('legend-cofactor').textContent = isHeme ? 'Heme · iron center' : 'Modeled NADPH';
$('legend-candidate').textContent = isHeme ? 'Guanosine / PEG2' : 'GS / isog candidate';
$('footnote').textContent = isHeme ? 'ORIGINAL DESIGN → REAL MOLECULAR MOTION → A PROPOSED BIOSENSOR' : 'PREPARED STRUCTURES → MECHANISM CONTEXT → A PROPOSED APPLICATION';
$('motion-toggle').setAttribute('aria-pressed', String(reducedMotion));

project.stages.forEach((stage, index) => {
  const button = document.createElement('button');
  button.className = 'chapter';
  button.setAttribute('aria-label', `Scene ${index + 1}: ${stage.title}`);
  button.innerHTML = `<span class="chapter-number">0${index + 1}</span><span>${stageNames[index]}</span>`;
  button.addEventListener('click', () => { leaveExplore(); setTime(index * 10 + (index ? (playing ? .1 : 5) : 0), true); });
  $('chapters').append(button);
});

project.methods.forEach(method => {
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  const body = document.createElement('p');
  summary.textContent = method.title;
  body.textContent = method.text;
  details.append(summary, body);
  $('methods').append(details);
});
project.sources.forEach(source => {
  const link = document.createElement('a');
  link.className = 'source';
  link.href = source.url;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = source.title + ' ↗';
  const note = document.createElement('small');
  note.textContent = source.note;
  link.append(note);
  $('sources').append(link);
});

function cancelSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  utterance = null;
}
function speakStage(index) {
  cancelSpeech();
  if (!voice || !playing || !('speechSynthesis' in window)) return;
  utterance = new SpeechSynthesisUtterance(project.stages[index].caption);
  utterance.rate = 1.02;
  utterance.lang = 'en-US';
  window.speechSynthesis.speak(utterance);
}
function formatTime(time) {
  return `${Math.floor(time / 60).toString().padStart(2, '0')}:${Math.floor(time % 60).toString().padStart(2, '0')}`;
}
function stageAt(time) { return Math.min(5, Math.floor(time / 10)); }

function updateStage(force = false) {
  const index = stageAt(filmTime);
  const stage = project.stages[index];
  if (force || index !== currentStage) {
    currentStage = index;
    $('scene-title').textContent = stage.title;
    $('scene-caption').textContent = stage.caption;
    $('scene-id').textContent = `SCENE 0${index + 1} / 06`;
    $('evidence-tag').textContent = stage.tag;
    $('evidence-tag').dataset.kind = stage.tag === 'REAL MD' ? 'real' : ['DESIGN ANIMATION', 'PROPOSED APPLICATION'].includes(stage.tag) ? 'concept' : 'source';
    $('scene-detail').textContent = stage.detail;
    $('spatial-caption').textContent = spatial[index];
    $('film-eyebrow').textContent = isHeme ? 'FROM ATOMS TO A POSSIBLE SIGNAL' : 'FROM A PREPARED MODEL TO A TESTABLE IDEA';
    $('context-note').textContent = index === 2 ? isHeme ? 'Source frames 0–4998. Playback seconds are editorial.' : 'No DHFR trajectory is represented in this film.' : index >= 4 ? isHeme ? 'A device concept. Activity and performance remain to be tested.' : 'Delivery, uptake and treatment benefit are unproven.' : 'Source structures and explanatory animation are labeled separately.';
    document.querySelectorAll('.chapter').forEach((button, i) => button.setAttribute('aria-current', String(i === index)));
    $('announcer').textContent = `Scene ${index + 1}. ${stage.title}. ${stage.tag}.`;
    if (playing) speakStage(index);
  }
  if (filmTime < .05 && !playing) {
    $('scene-title').innerHTML = hero;
    $('film-eyebrow').textContent = isHeme ? 'GUANOSINE · PEPTIDE · HEME' : 'GS–Phe–Glu · isog–Phe–Glu · DHFR';
    $('scene-caption').textContent = isHeme ? 'Enter the atomic structure. Watch the pieces come together. Follow real molecular motion toward a possible biosensor.' : 'Enter your actual candidate models. Travel from the enzyme to a proposed cellular application—and see what still needs to be proven.';
  }
  $('timeline').value = String(filmTime);
  $('timeline').style.setProperty('--progress', `${filmTime / 60 * 100}%`);
  $('timeline').setAttribute('aria-valuetext', `${filmTime.toFixed(1)} seconds of 60. Scene ${index + 1}, ${stage.title}`);
  $('time').textContent = formatTime(filmTime);
}
function setTime(time, announce = false) {
  filmTime = Math.max(0, Math.min(60, Number(time) || 0));
  engine?.setProgress(filmTime / 60);
  updateStage(announce);
  if (filmTime >= 60 && playing && !recording) setPlaying(false);
}
function setPlaying(value) {
  if (!ready) return;
  playing = Boolean(value);
  engine?.setPaused(!playing);
  $('play').textContent = playing ? 'Ⅱ' : '▶';
  $('play').setAttribute('aria-label', playing ? 'Pause film' : 'Play the 60-second film');
  $('hero-play').innerHTML = `<span class="play-icon">${playing ? 'Ⅱ' : '▶'}</span> ${playing ? 'Pause the film' : 'Play the 3D film'} <small>60 SEC</small>`;
  if (!playing) cancelSpeech();
  else { updateStage(true); speakStage(currentStage); }
}
function togglePlaying() {
  leaveExplore();
  if (filmTime >= 60) setTime(0, true);
  setPlaying(!playing);
}
function leaveExplore() {
  if (!exploring) return;
  exploring = false;
  document.body.classList.remove('exploring');
  $('exit-explore').hidden = true;
  engine?.setModel(isHeme ? 'auto' : $('candidate-select').value);
  setTime(resumeTime, true);
}

$('play').addEventListener('click', togglePlaying);
$('hero-play').addEventListener('click', togglePlaying);
$('restart').addEventListener('click', () => { leaveExplore(); setPlaying(false); setTime(0, true); engine?.resetCamera(); });
document.querySelector('.identity').addEventListener('click', event => { event.preventDefault(); $('restart').click(); });
$('timeline').addEventListener('input', event => { leaveExplore(); setTime(event.target.value, false); });
$('timeline').addEventListener('change', () => { if (playing) speakStage(currentStage); });
$('inspect').addEventListener('click', () => {
  setPlaying(false);
  resumeTime = filmTime;
  exploring = true;
  document.body.classList.add('exploring');
  $('exit-explore').hidden = false;
  engine?.setModel(isHeme ? 'design' : $('candidate-select').value);
  engine?.setProgress(0);
  engine?.resetCamera();
  $('spatial-caption').textContent = isHeme ? 'ORIGINAL SOURCE DESIGN · INTERACTIVE' : 'PREPARED SOURCE MODEL · INTERACTIVE';
  $('molecule-canvas').focus();
});
$('exit-explore').addEventListener('click', leaveExplore);
$('mode-atomic').addEventListener('click', () => setMode('atomic'));
$('mode-secondary').addEventListener('click', () => setMode('secondary'));
function setMode(mode) {
  engine?.setMode(mode);
  $('mode-atomic').setAttribute('aria-pressed', String(mode === 'atomic'));
  $('mode-secondary').setAttribute('aria-pressed', String(mode === 'secondary'));
}
$('focus-select').addEventListener('change', event => engine?.setSelection(event.target.value));
$('candidate-select').addEventListener('change', event => { engine?.setModel(event.target.value); $('announcer').textContent = `${event.target.value === 'gs' ? 'GS' : 'Isoguanosine'} candidate model selected. Prepared static coordinates.`; });
$('reset-camera').addEventListener('click', () => engine?.resetCamera());
$('voice').addEventListener('click', () => {
  voice = !voice;
  $('voice').setAttribute('aria-pressed', String(voice));
  $('voice').textContent = voice ? 'Voice on' : 'Voice off';
  if (voice && playing) speakStage(currentStage); else cancelSpeech();
});
if (!('speechSynthesis' in window)) { $('voice').disabled = true; $('voice').title = 'Narration is unavailable in this browser. Captions remain visible.'; }
$('motion-toggle').addEventListener('click', () => {
  reducedMotion = !reducedMotion;
  $('motion-toggle').setAttribute('aria-pressed', String(reducedMotion));
  document.body.classList.toggle('reduced-motion', reducedMotion);
  engine?.setReducedMotion?.(reducedMotion);
});
$('fullscreen').addEventListener('click', async () => {
  try { if (!document.fullscreenElement) await $('cinema').requestFullscreen(); else await document.exitFullscreen(); }
  catch { $('announcer').textContent = 'Fullscreen is unavailable in this browser panel.'; }
});

function openDialog(dialog) {
  setPlaying(false);
  if (!dialog.open) dialog.showModal();
}
$('evidence-open').addEventListener('click', () => openDialog($('evidence-dialog')));
$('structure-open').addEventListener('click', () => {
  const frame = $('structure-frame');
  const path = isHeme ? 'original-viewer/index.html' : `reference-viewer.html?candidate=${$('candidate-select').value}`;
  if (frame.getAttribute('src') !== path) frame.src = path;
  $('structure-title').textContent = isHeme ? 'Your preserved original viewer' : 'Actual DHFR preparation models';
  openDialog($('structure-dialog'));
});
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); }));
$('molecule-canvas').addEventListener('pointerdown', () => { if (playing && !recording) setPlaying(false); });
document.addEventListener('keydown', event => {
  if (event.code === 'Space' && !['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA', 'SUMMARY'].includes(document.activeElement?.tagName) && !document.querySelector('dialog[open]')) { event.preventDefault(); togglePlaying(); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden && playing && !recording) setPlaying(false); });

function wrapText(context, value, x, y, width, lineHeight, maxLines = 3) {
  const words = value.split(/\s+/); let line = '', lineIndex = 0;
  for (const word of words) {
    const next = line ? line + ' ' + word : word;
    if (context.measureText(next).width > width && line) {
      context.fillText(line, x, y + lineIndex * lineHeight);
      lineIndex++;
      if (lineIndex >= maxLines) return;
      line = word;
    } else line = next;
  }
  if (lineIndex < maxLines) context.fillText(line, x, y + lineIndex * lineHeight);
}
function drawRecordingFrame() {
  if (!recordState) return;
  const { context, canvas } = recordState;
  engine?.renderFrame?.();
  context.fillStyle = '#030a12'; context.fillRect(0, 0, canvas.width, canvas.height);
  const source = $('molecule-canvas');
  const scale = Math.min(canvas.width / source.width, canvas.height / source.height);
  const width = source.width * scale, height = source.height * scale;
  context.drawImage(source, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, 'rgba(3,10,18,.9)'); gradient.addColorStop(.24, 'rgba(3,10,18,0)'); gradient.addColorStop(.64, 'rgba(3,10,18,0)'); gradient.addColorStop(1, 'rgba(3,10,18,.98)');
  context.fillStyle = gradient; context.fillRect(0, 0, canvas.width, canvas.height);
  const stage = project.stages[stageAt(filmTime)];
  context.fillStyle = '#83e4ed'; context.font = '14px Segoe UI, sans-serif'; context.fillText(isHeme ? 'FROM ATOMS TO SIGNAL' : 'DHFR / A MOLECULAR QUESTION', 42, 39);
  context.textAlign = 'right'; context.fillStyle = '#c4c0e8'; context.font = '12px Segoe UI, sans-serif'; context.fillText(stage.tag, 1238, 39); context.textAlign = 'left';
  context.fillStyle = '#e1f2f5'; context.font = '32px Segoe UI, sans-serif'; context.fillText(stage.title, 42, 591);
  context.fillStyle = '#a2bbc7'; context.font = '17px Segoe UI, sans-serif'; wrapText(context, stage.caption, 42, 629, 1120, 25, 2);
  context.fillStyle = '#668c9b'; context.font = '11px Segoe UI, sans-serif';
  const info = engine?.getStatus();
  context.fillText(stage.tag === 'REAL MD' ? `SOURCE FRAME ${info?.sourceFrame ?? '—'} · PHYSICAL TIME UNVERIFIED` : stage.tag === 'SOURCE STRUCTURE' ? 'ACTUAL SOURCE COORDINATES · PRESENTATION CAMERA' : 'EXPLANATORY / PROPOSED SEQUENCE · NOT OBSERVED BIOLOGY', 42, 698);
}
async function startRecording() {
  if (!ready || recording) return;
  if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) { $('announcer').textContent = 'Recording is not available in this browser.'; return; }
  leaveExplore();
  const savedTime = filmTime, savedPlaying = playing;
  if (filmTime > 55) setTime(55, true);
  const startTime = filmTime;
  const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 720;
  const context = canvas.getContext('2d');
  const stream = canvas.captureStream(30);
  const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(type => MediaRecorder.isTypeSupported(type));
  if (!mimeType || !context) { stream.getTracks().forEach(track => track.stop()); return; }
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5500000 });
  recordChunks = [];
  recordState = { canvas, context, stream, recorder, start: performance.now(), startTime, savedTime, savedPlaying };
  recording = true; $('recording').hidden = false; $('record').disabled = true;
  recorder.ondataavailable = event => { if (event.data.size) recordChunks.push(event.data); };
  recorder.onstop = () => {
    const result = new Blob(recordChunks, { type: mimeType });
    const link = document.createElement('a'); link.href = URL.createObjectURL(result); link.download = `${repository}-scene-${stageAt(startTime) + 1}.webm`; link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 30000);
    stream.getTracks().forEach(track => track.stop());
    const prior = recordState;
    recording = false; recordState = null; recordChunks = [];
    $('recording').hidden = true; $('record').disabled = false;
    if (prior) { setTime(prior.savedTime, true); setPlaying(prior.savedPlaying); }
    $('announcer').textContent = 'Five-second captioned 3D film saved.';
  };
  drawRecordingFrame(); recorder.start(); setPlaying(true);
}
$('record').addEventListener('click', startRecording);

function tick(now) {
  const delta = Math.min(.08, (now - previousTick) / 1000); previousTick = now;
  if (recordState) {
    const elapsed = Math.min(5, (now - recordState.start) / 1000);
    setTime(recordState.startTime + elapsed);
    drawRecordingFrame();
    $('recording-text').textContent = `Recording ${elapsed.toFixed(1)} / 5.0 seconds`;
    if (elapsed >= 5 && recordState.recorder.state === 'recording') recordState.recorder.stop();
  } else if (playing) setTime(filmTime + delta);
  if (engine && now - lastStatusUpdate > 250) {
    lastStatusUpdate = now;
    const info = engine.getStatus();
    const source = isHeme ? info.model === 'asRun' ? 'As-run model' : 'Original design' : info.model === 'isog' ? 'isog candidate' : 'GS candidate';
    $('model-status').textContent = `${source} · ${(info.atomCount || (isHeme ? 1213 : 3153)).toLocaleString()} atoms`;
    $('motion-status').textContent = isHeme && currentStage === 2 ? `SOURCE FRAME ${info.sourceFrame ?? '—'} / 4999 · ${info.solutionIllustrative ? 'ILLUSTRATIVE SOLVENT' : 'RECORDED WATER + IONS'}` : !isHeme && currentStage >= 4 ? 'PROPOSED DELIVERY · UPTAKE UNTESTED' : 'DRAG TO ORBIT · SCROLL TO ZOOM';
  }
  requestAnimationFrame(tick);
}

updateStage(true);
try {
  engine = createMolecularScene({ canvas: $('molecule-canvas'), project, assetBase: './assets', reducedMotion,
    onReady() {
      ready = true;
      engine?.setTrajectory(isHeme);
      engine?.setPaused(true);
      $('hero-play').disabled = false; $('play').disabled = false; $('record').disabled = false;
      $('loading').hidden = true;
      $('announcer').textContent = 'Molecular scene ready. Play the film or explore the actual atoms.';
    },
    onError(error) {
      console.error(error);
      if (!ready) { $('loading').innerHTML = '<span>Could not open the 3D model.</span><small>Use a WebGL-capable browser and reload this page.</small>'; }
      $('announcer').textContent = error.message;
    },
  });
  engine.setProgress(0);
} catch (error) {
  console.error(error);
  $('loading').innerHTML = '<span>This browser could not initialize 3D.</span><small>Open the GitHub Pages viewer in a browser with WebGL enabled.</small>';
}
requestAnimationFrame(tick);
window.addEventListener('pagehide', () => { cancelSpeech(); engine?.dispose(); });
