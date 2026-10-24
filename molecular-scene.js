import * as THREE from './vendor/three.module.js';
import { createApplicationContext } from './application-scene.js';

const COLORS = { protein:0x67dce5, cofactor:0xf3bb63, candidate:0xc1a0fb, water:0x8bcde0, ion:0xb2b6da };
const AMINO = new Set('ALA ARG ASN ASP ASH CYS CYX GLN GLU GLH GLY HIS HSD HSE HSP HIE HID HIP ILE LEU LYS LYN MET PHE PRO SER THR TRP TYR VAL'.split(' '));
const WATER = new Set(['HOH','WAT','TIP3','TIP','SOL','H2O']);
const RADII = { H:.31,C:.76,N:.71,O:.66,S:1.05,P:1.07,F:.57,CL:1.02,BR:1.2,FE:1.24,K:2.03,NA:1.66,MG:1.41,CA:1.76 };
const UP = new THREE.Vector3(0,1,0);
const clamp = (x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth = (a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const mix = (a,b,t)=>a+(b-a)*t;
const assemblyAmount=progress=>{const t=clamp((progress-1/6)/(1/6));return t===0||t===1?0:Math.sin(Math.PI*t);};

/** Fixed-column PDB parser. CHARMM segment IDs and four-letter names survive. */
export function parsePDB(text){
  const atoms=[], serialToIndex=new Map(), connected=[];
  for(const line of text.split(/\r?\n/)){
    const record=line.slice(0,6).trim();
    if(record==='ATOM'||record==='HETATM'){
      const name=line.slice(12,16).trim(),resname=line.slice(17,21).trim(),segment=line.slice(72,76).trim();
      let element=line.slice(76,78).trim().toUpperCase();
      if(!element){const cleaned=name.replace(/^[0-9]+/,'').toUpperCase();element=resname==='POT'?'K':resname==='CLA'?'CL':/^FE/.test(cleaned)?'FE':/^CL/.test(cleaned)?'CL':cleaned[0]||'C';}
      const serial=Number(line.slice(6,11)), atom={index:atoms.length,serial,name,resname,segment,chain:line.slice(21,22).trim()||segment||'A',resid:line.slice(22,27).trim(),element,x:parseFloat(line.slice(30,38)),y:parseFloat(line.slice(38,46)),z:parseFloat(line.slice(46,54))};
      if(![atom.x,atom.y,atom.z].every(Number.isFinite))continue;
      atom.kind=WATER.has(resname)?'water':['POT','CLA','SOD','NA','K','CL','CAL','MG'].includes(resname)?'ion':['HEME','HEM','HEC','N4P','NAP','NAD','NDP','NADP','NADPH'].includes(resname)?'cofactor':AMINO.has(resname)?'protein':'candidate';
      serialToIndex.set(serial,atom.index);atoms.push(atom);
    }else if(record==='CONECT'){
      const numbers=line.slice(6).match(/.{1,5}/g)?.map(value=>Number(value.trim())).filter(Number.isFinite)||[];
      for(let j=1;j<numbers.length;j++)connected.push([numbers[0],numbers[j]]);
    }
  }
  const explicit=connected.map(([a,b])=>[serialToIndex.get(a),serialToIndex.get(b)]).filter(([a,b])=>a!==undefined&&b!==undefined&&a!==b);
  const uniqueExplicit=new Map();explicit.forEach(([a,b])=>{if(a>b)[a,b]=[b,a];uniqueExplicit.set(a+':'+b,[a,b]);});
  // PSF-derived CONECT records are authoritative. In particular, overlapping
  // unrelaxed DHFR candidates must not acquire guessed intermolecular bonds.
  return {atoms,bonds:explicit.length?[...uniqueExplicit.values()]:inferCovalentBonds(atoms),explicitBondCount:uniqueExplicit.size};
}

/** Distance-derived covalent connectivity supplements, never alters, coordinates. */
export function inferCovalentBonds(atoms,explicit=[]){
  const bonds=[],known=new Set(),grid=new Map(),cell=2.6;
  const add=(a,b)=>{if(a>b)[a,b]=[b,a];const key=a+':'+b;if(!known.has(key)){known.add(key);bonds.push([a,b]);}};
  explicit.forEach(([a,b])=>add(a,b));
  for(const atom of atoms){if(atom.kind==='water'||atom.kind==='ion'||atom.element==='H')continue;const key=[Math.floor(atom.x/cell),Math.floor(atom.y/cell),Math.floor(atom.z/cell)].join(',');if(!grid.has(key))grid.set(key,[]);grid.get(key).push(atom.index);}
  for(const atom of atoms){
    if(atom.kind==='water'||atom.kind==='ion'||atom.element==='H'||['FE','K','NA','MG','CA'].includes(atom.element))continue;
    const x=Math.floor(atom.x/cell),y=Math.floor(atom.y/cell),z=Math.floor(atom.z/cell);
    for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++)for(const otherIndex of grid.get([x+dx,y+dy,z+dz].join(','))||[]){
      if(otherIndex<=atom.index)continue;const other=atoms[otherIndex];if(['FE','K','NA','MG','CA'].includes(other.element))continue;
      const d2=(atom.x-other.x)**2+(atom.y-other.y)**2+(atom.z-other.z)**2,cut=(RADII[atom.element]||.76)+(RADII[other.element]||.76)+.38;
      if(d2>.16&&d2<cut*cut)add(atom.index,otherIndex);
    }
  }
  return bonds;
}

function componentKey(atom){return atom.kind==='protein'?'protein:'+atom.chain:atom.kind+':'+atom.chain+':'+atom.resid+':'+atom.resname;}
function atomColor(atom){
  const color=new THREE.Color(COLORS[atom.kind]||COLORS.candidate);
  if(atom.element==='O')color.lerp(new THREE.Color(0xe0a4b9),.38);
  if(atom.element==='N')color.lerp(new THREE.Color(0x83b6ff),.3);
  if(atom.element==='FE')color.set(0xffd89a);
  if(atom.element==='P')color.lerp(new THREE.Color(0xffd28a),.5);
  return color;
}
function radius(atom){return atom.element==='FE'?.63:atom.element==='S'?.41:atom.element==='P'?.42:atom.element==='O'?.32:atom.element==='N'?.33:.35;}
function disposeObject(root){root.traverse(object=>{object.geometry?.dispose();const materials=object.material?(Array.isArray(object.material)?object.material:[object.material]):[];materials.forEach(material=>material.dispose());});}
function makeGlowTexture(){const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d'),g=c.createRadialGradient(64,64,1,64,64,64);g.addColorStop(0,'rgba(255,255,255,.32)');g.addColorStop(.18,'rgba(255,255,255,.12)');g.addColorStop(.5,'rgba(255,255,255,.025)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,128,128);return new THREE.CanvasTexture(canvas);}

function ribbonGeometry(points,width=.84){
  const curve=new THREE.CatmullRomCurve3(points,false,'centripetal'),segments=Math.max(28,points.length*7),frames=curve.computeFrenetFrames(segments,false),vertices=[],indices=[];
  for(let i=0;i<=segments;i++){
    const p=curve.getPointAt(i/segments),normal=frames.normals[i],edge=width*(.7+.3*Math.sin(Math.PI*i/segments));
    vertices.push(p.x-normal.x*edge,p.y-normal.y*edge,p.z-normal.z*edge,p.x+normal.x*edge,p.y+normal.y*edge,p.z+normal.z*edge);
    if(i<segments){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}

class MolecularLayer{
  constructor(data,{id,glowTexture,project,exactBonds=null}){
    this.id=id;this.project=project;this.atoms=data.atoms;this.bonds=exactBonds||data.bonds;this.root=new THREE.Group();this.components=[];this.coord=new Float32Array(this.atoms.length*3);this.opacity=1;this.mode='atomic';this.selection='all';this.frame=-1;this.glowTexture=glowTexture;
    this.atoms.forEach((a,i)=>{this.coord[3*i]=a.x;this.coord[3*i+1]=a.y;this.coord[3*i+2]=a.z;});
    const focus=this.atoms.filter(a=>a.kind!=='water'&&a.kind!=='ion'&&a.element!=='H'),box=new THREE.Box3();focus.forEach(a=>box.expandByPoint(new THREE.Vector3(a.x,a.y,a.z)));this.center=box.getCenter(new THREE.Vector3());this.rawRadius=Math.max(1,box.getSize(new THREE.Vector3()).length()/2);this.scale=10/this.rawRadius;
    this.groups=new Map();
    for(const atom of this.atoms){if(atom.element==='H'||atom.kind==='water'||atom.kind==='ion')continue;const key=componentKey(atom);if(!this.groups.has(key))this.groups.set(key,{key,kind:atom.kind,chain:atom.chain,indices:[],caIndices:[],bonds:[],group:new THREE.Group(),materials:[],ribbons:[]});const component=this.groups.get(key);component.indices.push(atom.index);if(atom.kind==='protein'&&atom.name==='CA')component.caIndices.push(atom.index);}
    const atomGroup=new Map();this.groups.forEach(component=>component.indices.forEach(i=>atomGroup.set(i,component)));
    this.crossBonds=[];
    for(const bond of this.bonds){const a=atomGroup.get(bond[0]),b=atomGroup.get(bond[1]);if(!a||!b)continue;if(a===b)a.bonds.push(bond);else this.crossBonds.push(bond);}
    this.atomGroup=atomGroup;this.sphere=new THREE.SphereGeometry(1,15,11);this.cylinder=new THREE.CylinderGeometry(1,1,1,8,1,false);this._matrix=new THREE.Matrix4();this._quaternion=new THREE.Quaternion();this._vector=new THREE.Vector3();this._vector2=new THREE.Vector3();this._mid=new THREE.Vector3();this._size=new THREE.Vector3();
    let proteinIndex=0;
    for(const component of this.groups.values()){
      const centroid=new THREE.Vector3();component.indices.forEach(index=>centroid.add(this.point(index)));centroid.multiplyScalar(1/component.indices.length);component.base=centroid;component.localRadius=Math.max(...component.indices.map(index=>this.point(index).distanceTo(centroid)));component.group.position.copy(centroid);component.order=component.kind==='protein'?proteinIndex++:0;
      const material=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.25,metalness:.22,clearcoat:.85,clearcoatRoughness:.2,vertexColors:false,transparent:true,opacity:1,emissive:COLORS[component.kind],emissiveIntensity:.075});
      component.materials.push(material);component.atomMesh=new THREE.InstancedMesh(this.sphere,material,component.indices.length);component.atomMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);component.atomMesh.frustumCulled=false;
      component.indices.forEach((atomIndex,i)=>component.atomMesh.setColorAt(i,atomColor(this.atoms[atomIndex])));component.group.add(component.atomMesh);
      if(component.bonds.length){const bondMaterial=new THREE.MeshPhysicalMaterial({color:new THREE.Color(COLORS[component.kind]).lerp(new THREE.Color(0xadc9d5),.25),roughness:.34,metalness:.12,transparent:true,opacity:.85,emissive:COLORS[component.kind],emissiveIntensity:.035});component.materials.push(bondMaterial);component.bondMesh=new THREE.InstancedMesh(this.cylinder,bondMaterial,component.bonds.length);component.bondMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);component.bondMesh.frustumCulled=false;component.group.add(component.bondMesh);}
      if(component.kind==='protein'&&component.caIndices.length>3)this.rebuildRibbons(component);
      if(component.kind==='cofactor'||component.kind==='candidate'){
        const glowMaterial=new THREE.SpriteMaterial({map:glowTexture,color:COLORS[component.kind],transparent:true,opacity:component.kind==='cofactor'?.42:.19,blending:THREE.AdditiveBlending,depthWrite:false});component.glowMaterial=glowMaterial;component.glow=new THREE.Sprite(glowMaterial);component.glow.scale.setScalar(component.kind==='cofactor'?8:4.5);component.group.add(component.glow);
      }
      this.root.add(component.group);this.components.push(component);
    }
    if(this.crossBonds.length){this.crossMaterial=new THREE.MeshStandardMaterial({color:0xa8bac8,transparent:true,opacity:.48,roughness:.4});this.crossMesh=new THREE.InstancedMesh(this.cylinder,this.crossMaterial,this.crossBonds.length);this.crossMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.crossMesh.frustumCulled=false;this.root.add(this.crossMesh);}
    this.updateCoordinates(this.coord,true);
  }
  point(index,target=new THREE.Vector3()){const i=3*index;return target.set((this.coord[i]-this.center.x)*this.scale,(this.coord[i+1]-this.center.y)*this.scale,(this.coord[i+2]-this.center.z)*this.scale);}
  rebuildRibbons(component){
    component.ribbons.forEach(mesh=>{component.group.remove(mesh);mesh.geometry.dispose();mesh.material.dispose();});component.ribbons=[];
    const segments=[];let segment=[];
    for(const index of component.caIndices){const p=this.point(index).sub(component.base);if(segment.length&&p.distanceTo(segment[segment.length-1])>5.2*this.scale){if(segment.length>3)segments.push(segment);segment=[];}segment.push(p);}if(segment.length>3)segments.push(segment);
    for(const points of segments){
      const material=new THREE.MeshPhysicalMaterial({color:COLORS.protein,metalness:.28,roughness:.26,clearcoat:1,transparent:true,opacity:1,side:THREE.DoubleSide,emissive:0x3a939c,emissiveIntensity:.15});
      const mesh=new THREE.Mesh(ribbonGeometry(points,1.08*this.scale),material);component.group.add(mesh);component.ribbons.push(mesh);
      const backbone=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points,false,'centripetal'),Math.max(36,points.length*6),.16*this.scale,7,false),new THREE.MeshPhysicalMaterial({color:0xb0f4ef,emissive:0x63b9c4,emissiveIntensity:.19,roughness:.3,metalness:.1,transparent:true,opacity:.9}));component.group.add(backbone);component.ribbons.push(backbone);
    }
  }
  cylinderMatrix(a,b,radiusValue){const direction=this._vector2.copy(b).sub(a),length=direction.length();this._quaternion.setFromUnitVectors(UP,direction.multiplyScalar(1/(length||1)));this._mid.copy(a).add(b).multiplyScalar(.5);this._size.set(radiusValue,length,radiusValue);return this._matrix.compose(this._mid,this._quaternion,this._size);}
  updateCoordinates(coords,rebuild=true){
    this.coord=coords;let currentRadius=0;
    for(const component of this.components){
      component.indices.forEach((index,i)=>{const p=this.point(index,this._vector);currentRadius=Math.max(currentRadius,p.length());p.sub(component.base);const r=radius(this.atoms[index])*this.scale;this._matrix.makeScale(r,r,r);this._matrix.setPosition(p);component.atomMesh.setMatrixAt(i,this._matrix);});component.atomMesh.instanceMatrix.needsUpdate=true;
      if(component.bondMesh){component.bonds.forEach(([a,b],i)=>{const p=this.point(a,new THREE.Vector3()).sub(component.base),q=this.point(b,new THREE.Vector3()).sub(component.base);component.bondMesh.setMatrixAt(i,this.cylinderMatrix(p,q,.10*this.scale));});component.bondMesh.instanceMatrix.needsUpdate=true;}
      if(rebuild&&component.caIndices.length>3)this.rebuildRibbons(component);
    }
    if(this.crossMesh){this.crossBonds.forEach(([a,b],i)=>this.crossMesh.setMatrixAt(i,this.cylinderMatrix(this.point(a,new THREE.Vector3()),this.point(b,new THREE.Vector3()),.08*this.scale)));this.crossMesh.instanceMatrix.needsUpdate=true;}
    this.currentRadius=currentRadius+.35*this.scale;
  }
  setAppearance({opacity=this.opacity,mode=this.mode,selection=this.selection,explode=0}){
    this.opacity=opacity;this.mode=mode;this.selection=selection;this.currentExplosionDisplacement=0;
    for(const c of this.components){
      const selected=selection==='all'||c.kind===selection;c.group.visible=selected&&opacity>.002;
      const secondary=mode==='secondary'&&c.kind==='protein';c.atomMesh.visible=!secondary;if(c.bondMesh)c.bondMesh.visible=!secondary;c.ribbons.forEach(mesh=>{mesh.visible=secondary;mesh.material.opacity=opacity;mesh.material.depthWrite=opacity>.94;});
      c.materials.forEach(material=>{material.opacity=opacity*(material===c.materials[1] ? .85 : 1);material.depthWrite=opacity>.94;});if(c.glowMaterial)c.glowMaterial.opacity=opacity*(c.kind==='cofactor'?.42:.17);
      const offset=new THREE.Vector3();if(this.project==='heme'){if(c.kind==='protein'){const angle=c.order/Math.max(4,this.components.filter(x=>x.kind==='protein').length)*Math.PI*2+.5;offset.set(Math.cos(angle)*6.5,Math.sin(angle)*4.5,Math.sin(angle+.8)*2.5);}else if(c.kind==='candidate')offset.set(c.base.x*.6,7,c.base.z*.3);else offset.set(0,-1,6.5);}else{if(c.kind==='protein')offset.set(-4.8,0,-1);else if(c.kind==='cofactor')offset.set(5.8,-3,4);else offset.set(8,4,2);}
      c.group.position.copy(c.base).addScaledVector(offset,explode);c.group.rotation.set(0,explode*(c.kind==='protein'?.08:-.14),explode*(c.order%2?.04:-.04));
      this.currentExplosionDisplacement=Math.max(this.currentExplosionDisplacement,offset.length()*explode+c.localRadius*(Math.abs(c.group.rotation.y)+Math.abs(c.group.rotation.z)));
    }
    if(this.crossMesh){this.crossMesh.visible=explode<.015&&selection==='all';this.crossMaterial.opacity=opacity*.48;}
  }
  getFocus(kind){const list=this.atoms.filter(atom=>atom.kind===kind&&atom.element!=='H');if(!list.length)return new THREE.Vector3();const p=new THREE.Vector3();list.forEach(atom=>p.add(this.point(atom.index)));return p.multiplyScalar(1/list.length);}
  dispose(){for(const c of this.components){c.materials.forEach(m=>m.dispose());c.ribbons.forEach(mesh=>{mesh.geometry.dispose();mesh.material.dispose();});c.glowMaterial?.dispose();}this.crossMaterial?.dispose();this.sphere.dispose();this.cylinder.dispose();this.root.clear();}
}

function createWaterField(glowTexture){
  const group=new THREE.Group(),count=150,position=new Float32Array(count*3);let seed=4919;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  for(let i=0;i<count;i++){position[3*i]=(random()-.5)*66;position[3*i+1]=(random()-.5)*42;position[3*i+2]=(random()-.5)*48;}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(position,3));const material=new THREE.PointsMaterial({color:0x93c5dc,size:.14,map:glowTexture,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true});const points=new THREE.Points(geometry,material);group.add(points);
  // Each glyph is explanatory water geometry, never passed off as source solvent.
  const waterMaterial=new THREE.LineBasicMaterial({color:0x77a4bd,transparent:true,opacity:0}),vertices=[];
  for(let i=0;i<35;i++){const x=position[i*3],y=position[i*3+1],z=position[i*3+2],s=.19;vertices.push(x-s,y+s*.6,z,x,y,z,x,y,z,x+s,y+s*.6,z);}
  const waterGeometry=new THREE.BufferGeometry();waterGeometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));const lines=new THREE.LineSegments(waterGeometry,waterMaterial);group.add(lines);return {group,setOpacity(value){material.opacity=value*.65;waterMaterial.opacity=value*.38;},update(delta,moving){if(moving)group.rotation.y+=delta*.012;},dispose(){geometry.dispose();material.dispose();waterGeometry.dispose();waterMaterial.dispose();}};
}

/**
 * Buildless WebGL source-coordinate renderer. All non-source movement is either
 * a rigid, reversible instructional explosion, camera motion, or a labeled
 * proposed context. Source trajectory coordinates exist in a separate layer.
 */
export function createMolecularScene({canvas,project='heme',assetBase='./assets',onReady=()=>{},onError=()=>{},reducedMotion=false}={}){
  if(!canvas)throw new Error('A canvas is required.');
  const config=typeof project==='string'?{id:project}:project,id=config.id||config.key||'heme',isHeme=id==='heme';
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x030a13);scene.fog=new THREE.FogExp2(0x030a13,.0075);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
  const camera=new THREE.PerspectiveCamera(36,1,.1,400),lights=new THREE.Group();scene.add(lights);lights.add(new THREE.AmbientLight(0x91aac4,.7));
  for(const [color,intensity,position] of [[0xc9efff,3.8,[12,20,22]],[0x5396c9,2,[-20,-5,12]],[0xffd3a0,3.3,[5,8,-20]]]){const light=new THREE.DirectionalLight(color,intensity);light.position.set(...position);lights.add(light);}
  const glowTexture=makeGlowTexture(),molecularRoot=new THREE.Group();scene.add(molecularRoot);const water=createWaterField(glowTexture);scene.add(water.group);
  let application=null;try{application=createApplicationContext({THREE,scene,project:id,reducedMotion});application.setVisible(false);}catch(error){onError(new Error('The proposed application context could not initialize: '+error.message));}
  const layers=new Map(),loaders=new Map();let disposed=false,ready=false,progress=0,mode='atomic',selection='all',paused=true,trajectoryEnabled=false,trajectory=null,trajectoryLoading=false,authenticSolvent=null,trajectoryFrame=0,trajectoryElapsed=0,activeModel=isHeme?'design':'gs',forcedModel=null,modelToken=0;
  let width=1,height=1,aspect=1,raf=0,last=performance.now(),elapsed=0,lastProgressSet=0,manualUntil=0,theta=.28,phi=1.35,distance=44,target=new THREE.Vector3(),dragging=false,lastPointer=null,pointerDistance=null;
  const orbitPointers=new Map();
  const baseURL=document.baseURI||window.location.href,assetURL=name=>new URL(name,assetBase.endsWith('/')?new URL(assetBase,baseURL):new URL(assetBase+'/',baseURL)).href;
  const resolvePath=(path,fallback)=>new URL(path||fallback,baseURL).href;
  const status={ready:false,project:id,model:activeModel,frame:0,sourceFrame:null,frameCount:0,trajectoryReady:false,trajectoryEnabled:false,coordinateUnits:'angstrom',physicalTimeVerified:false,solutionIllustrative:true,mode,selection,phase:'source',application:null};

  async function getLayer(modelId){
    if(layers.has(modelId))return layers.get(modelId);if(loaders.has(modelId))return loaders.get(modelId);
    const file=isHeme?(modelId==='asRun'?'heme-solute.pdb':'heme-original.pdb'):(modelId==='isog'?'dhfr-isog-connected.pdb':'dhfr-gs-connected.pdb');
    const modelConfig=Array.isArray(config.models)?config.models.find(model=>model.id===modelId):config.models?.[modelId];
    const path=modelConfig?.pdbPath||(isHeme&&modelId==='asRun'?config.trajectoryPdbPath:null)||(isHeme&&modelId==='design'?config.pdbPath:null)||(!isHeme&&modelId==='gs'?config.pdbPath:null);
    const promise=fetch(path?resolvePath(path):assetURL(file)).then(response=>{if(!response.ok)throw new Error('Could not load source model '+file);return response.text();}).then(text=>{
      if(disposed)return null;const data=parsePDB(text);if(!data.atoms.length)throw new Error('The source PDB contains no readable atoms.');
      const layer=new MolecularLayer(data,{id:modelId,glowTexture,project:id});layer.root.visible=false;molecularRoot.add(layer.root);layers.set(modelId,layer);return layer;
    }).catch(error=>{loaders.delete(modelId);onError(error);return null;});loaders.set(modelId,promise);return promise;
  }
  async function loadTrajectory(){
    if(!isHeme||trajectory||trajectoryLoading||disposed)return;trajectoryLoading=true;
    try{
      const metadataURL=resolvePath(config.trajectoryPath,'data/heme-solute-trajectory.json'),response=await fetch(metadataURL);if(!response.ok)throw new Error('The source trajectory metadata is unavailable.');const metadata=await response.json();
      const layer=await getLayer('asRun');if(!layer||disposed)return;
      let coordinates;
      if(metadata.frames){coordinates=Float32Array.from(metadata.frames.flat());}
      else{const binaryResponse=await fetch(new URL(metadata.positionsFile||'heme-solute-positions.f32.bin',metadataURL));if(!binaryResponse.ok)throw new Error('The source trajectory coordinates are unavailable.');coordinates=new Float32Array(await binaryResponse.arrayBuffer());}
      if(disposed)return;const atomCount=metadata.atomCount||metadata.shape?.[1],frameCount=metadata.frameCount||metadata.shape?.[0];
      if(atomCount!==layer.atoms.length||coordinates.length!==atomCount*frameCount*3)throw new Error('The as-run coordinate layer and trajectory dimensions do not match.');
      if(Array.isArray(metadata.bonds)&&metadata.bonds.length){const replacement=new MolecularLayer({atoms:layer.atoms,bonds:metadata.bonds},{id:'asRun',glowTexture,project:id,exactBonds:metadata.bonds});molecularRoot.remove(layer.root);layer.dispose();layers.set('asRun',replacement);molecularRoot.add(replacement.root);}
      trajectory={coordinates,atomCount,frameCount,frameIndices:metadata.frameIndices||metadata.frameMap||[],fps:metadata.playbackFps||24,metadata};status.trajectoryReady=true;status.frameCount=frameCount;applyTrajectoryFrame(0);applyState();
      if(config.solventPath||metadata.solventPath)loadAuthenticSolvent(config.solventPath||metadata.solventPath,metadataURL);
    }catch(error){status.trajectoryError=error.message;onError(error);}finally{trajectoryLoading=false;}
  }
  async function loadAuthenticSolvent(path,parentMetadataURL){
    try{
      const metadataURL=new URL(path,path.includes('/')?baseURL:parentMetadataURL),response=await fetch(metadataURL);if(!response.ok)throw new Error('Recorded solvent metadata unavailable');const metadata=await response.json(),binary=await fetch(new URL(metadata.positionsFile,metadataURL));if(!binary.ok)throw new Error('Recorded solvent coordinates unavailable');const coordinates=new Float32Array(await binary.arrayBuffer());if(disposed)return;
      const atomCount=metadata.atomCount||metadata.shape?.[1],frameCount=metadata.frameCount||metadata.shape?.[0];if(!trajectory||frameCount!==trajectory.frameCount||coordinates.length!==atomCount*frameCount*3)throw new Error('Recorded solvent dimensions do not match the solute track');
      const geometry=new THREE.BufferGeometry(),positions=new Float32Array(atomCount*3),colors=new Float32Array(atomCount*3);geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
      const solventAtoms=metadata.atoms||[];for(let i=0;i<atomCount;i++){const element=(solventAtoms[i]?.element||'O').toUpperCase(),color=new THREE.Color(element==='K'?0xd7b8ed:element==='CL'?0xb5d8c7:0x89bfdc);color.toArray(colors,i*3);}geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
      const material=new THREE.PointsMaterial({size:.19,vertexColors:true,map:glowTexture,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true}),points=new THREE.Points(geometry,material);points.frustumCulled=false;layers.get('asRun').root.add(points);
      authenticSolvent={coordinates,atomCount,frameCount,metadata,positions,geometry,material,points,frame:-1};status.solutionIllustrative=false;status.solvent={recorded:true,sampled:true,atomCount,frameCount,description:metadata.description||'Sampled original water oxygen positions and original ions, frame-locked to the solute.'};applyTrajectoryFrame(trajectoryFrame);applyState();
    }catch(error){status.solventError=error.message;}
  }
  function applyTrajectoryFrame(index){
    if(!trajectory)return;const frame=clamp(Math.round(index),0,trajectory.frameCount-1),layer=layers.get('asRun');if(!layer)return;
    if(layer.frame!==frame){const offset=frame*trajectory.atomCount*3;layer.updateCoordinates(trajectory.coordinates.subarray(offset,offset+trajectory.atomCount*3),true);layer.frame=frame;}
    if(authenticSolvent&&authenticSolvent.frame!==frame){const solvent=authenticSolvent,offset=frame*solvent.atomCount*3;for(let i=0;i<solvent.atomCount;i++){const j=i*3;solvent.positions[j]=(solvent.coordinates[offset+j]-layer.center.x)*layer.scale;solvent.positions[j+1]=(solvent.coordinates[offset+j+1]-layer.center.y)*layer.scale;solvent.positions[j+2]=(solvent.coordinates[offset+j+2]-layer.center.z)*layer.scale;}solvent.geometry.attributes.position.needsUpdate=true;solvent.frame=frame;}
    trajectoryFrame=frame;status.frame=frame;status.sourceFrame=trajectory.frameIndices[frame]??null;
  }
  function currentLayer(){return layers.get(activeModel)||layers.get(isHeme?'design':'gs');}
  function applyState(){
    if(disposed)return;
    const mdBlend=isHeme?(forcedModel==='asRun'?1:forcedModel==='design'?0:smooth(.30,1/3,progress)*(1-smooth(.88,1,progress))):0;
    if(isHeme){const source=layers.get('design'),md=layers.get('asRun');const actualBlend=md?mdBlend:0;if(source){source.root.visible=actualBlend<.999;source.setAppearance({opacity:1-actualBlend,mode,selection,explode:assemblyAmount(progress)});}if(md){md.root.visible=actualBlend>.001;md.setAppearance({opacity:actualBlend,mode,selection,explode:0});}activeModel=actualBlend>.5?'asRun':'design';}
    else{for(const [key,layer] of layers){layer.root.visible=key===activeModel;layer.setAppearance({opacity:key===activeModel?1:0,mode,selection,explode:assemblyAmount(progress)});}}
    const app=smooth(.65,.74,progress)*(1-smooth(.93,1,progress)),portrait=aspect<.9,baseScale=portrait?.64:1;
    molecularRoot.scale.setScalar(baseScale*mix(1,.76,app));molecularRoot.position.set(portrait?0:mix(6.2,isHeme?-6.6:1.6,app),portrait?-2.3:mix(.1,1,app),0);
    const solutionOpacity=smooth(.30,.39,progress)*(1-smooth(.71,.85,progress));water.setOpacity(authenticSolvent?0:solutionOpacity);if(authenticSolvent)authenticSolvent.material.opacity=solutionOpacity*.78;
    if(application){application.setProgress(progress);application.setVisible(progress>.65&&progress<.99);if(application.group){application.group.scale.setScalar(portrait?.7:1);application.group.position.x=portrait?-2:0;}status.application=application.getStage?.()||null;}
    status.model=activeModel;status.mode=mode;status.selection=selection;status.phase=progress<1/6?'source':progress<1/3?'assembly':progress<.5?'solution':progress<2/3?'mechanism':progress<5/6?'application':'evidence';status.progress=progress;status.trajectoryEnabled=trajectoryEnabled;
    const layer=currentLayer();if(layer){status.atomCount=layer.atoms.length;status.heavyAtomCount=layer.atoms.filter(atom=>atom.element!=='H').length;status.bondCount=layer.bonds.length;status.modelRadius=layer.rawRadius;}
    if(trajectoryEnabled&&trajectory&&progress>=.32&&progress<=.66)applyTrajectoryFrame(Math.round(clamp((progress-1/3)/(1/6))*(trajectory.frameCount-1)));
  }
  function resize(){
    const rect=canvas.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);aspect=width/height;renderer.setSize(width,height,false);camera.aspect=aspect;
    // A portrait film has its narrative below the model. Shift the projection
    // of the entire 3D scene upward, including source solvent and application
    // geometry, without altering source coordinates or desktop composition.
    if(aspect<.9)camera.setViewOffset(width,height,0,height*.26,width,height);else camera.clearViewOffset();
    camera.updateProjectionMatrix();application?.resize?.(aspect);applyState();
  }
  function updateCamera(delta,now){
    const app=smooth(.65,.77,progress)*(1-smooth(.94,1,progress)),mechanism=smooth(.49,.55,progress)*(1-smooth(.62,.67,progress));
    if(now>manualUntil){
      const focus=currentLayer()?.getFocus(selection==='candidate'?'candidate':'cofactor')||new THREE.Vector3();focus.multiplyScalar(mechanism*.45);target.lerp(focus,reducedMotion?1:1-Math.exp(-delta*2.8));
      let radius=0;for(const layer of layers.values())if(layer.root.visible)radius=Math.max(radius,(layer.currentRadius||10)+(layer.currentExplosionDisplacement||0));radius*=molecularRoot.scale.x;
      const halfAngle=Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov)/2)*Math.min(1,aspect)),safeDistance=radius/Math.sin(halfAngle)+molecularRoot.position.distanceTo(target)+1;
      const wanted=Math.max(safeDistance,aspect<.9?mix(47,76,app):mix(43,55,app)-mechanism*10);distance=Math.max(safeDistance,mix(distance,wanted,reducedMotion?1:1-Math.exp(-delta*3)));
    }
    const orbitTheta=theta+(!paused&&!reducedMotion&&now>manualUntil?Math.sin(elapsed*.12)*.06:0);camera.position.set(target.x+distance*Math.sin(phi)*Math.sin(orbitTheta),target.y+distance*Math.cos(phi),target.z+distance*Math.sin(phi)*Math.cos(orbitTheta));camera.lookAt(target);
  }
  function tick(now){
    if(disposed)return;const delta=Math.min(.045,(now-last)/1000);last=now;if(!paused&&!reducedMotion)elapsed+=delta;
    if(trajectoryEnabled&&trajectory&&!paused&&now-lastProgressSet>180&&progress>=.32&&progress<.67){trajectoryElapsed+=delta;applyTrajectoryFrame(Math.floor(trajectoryElapsed*trajectory.fps)%trajectory.frameCount);}
    water.update(delta,!paused&&!reducedMotion);application?.update?.(paused||reducedMotion?0:delta,elapsed);updateCamera(delta,now);renderer.render(scene,camera);raf=requestAnimationFrame(tick);
  }
  function resetCamera(){theta=.28;phi=1.35;distance=aspect<.9?47:44;target.set(0,0,0);manualUntil=0;}
  function pointerDown(event){orbitPointers.set(event.pointerId,{x:event.clientX,y:event.clientY});canvas.setPointerCapture?.(event.pointerId);dragging=true;lastPointer={x:event.clientX,y:event.clientY};manualUntil=performance.now()+10000;if(orbitPointers.size===2){const p=[...orbitPointers.values()];pointerDistance=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);}}
  function pointerMove(event){if(!orbitPointers.has(event.pointerId))return;orbitPointers.set(event.pointerId,{x:event.clientX,y:event.clientY});manualUntil=performance.now()+10000;if(orbitPointers.size===2){const p=[...orbitPointers.values()],next=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);if(pointerDistance)distance=clamp(distance*pointerDistance/next,14,110);pointerDistance=next;return;}if(dragging&&lastPointer){theta-=(event.clientX-lastPointer.x)*.005;phi=clamp(phi-(event.clientY-lastPointer.y)*.004,.25,Math.PI-.25);lastPointer={x:event.clientX,y:event.clientY};}}
  function pointerUp(event){orbitPointers.delete(event.pointerId);dragging=orbitPointers.size>0;lastPointer=orbitPointers.size?[...orbitPointers.values()][0]:null;pointerDistance=null;}
  function wheel(event){event.preventDefault();distance=clamp(distance*Math.exp(event.deltaY*.0007),14,110);manualUntil=performance.now()+12000;}
  function key(event){let handled=true;if(event.key==='ArrowLeft')theta+=.10;else if(event.key==='ArrowRight')theta-=.10;else if(event.key==='ArrowUp')phi=clamp(phi-.08,.25,Math.PI-.25);else if(event.key==='ArrowDown')phi=clamp(phi+.08,.25,Math.PI-.25);else if(event.key==='+'||event.key==='=')distance=clamp(distance*.9,14,110);else if(event.key==='-')distance=clamp(distance*1.1,14,110);else if(event.key==='Home')resetCamera();else handled=false;if(handled){event.preventDefault();manualUntil=performance.now()+12000;}}
  canvas.style.touchAction='none';canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);canvas.addEventListener('wheel',wheel,{passive:false});canvas.addEventListener('keydown',key);canvas.setAttribute('aria-label',isHeme?'Interactive source-coordinate heme bundle. Drag to rotate, scroll to zoom.':'Interactive source-coordinate DHFR model. Drag to rotate, scroll to zoom.');if(!canvas.hasAttribute('tabindex'))canvas.tabIndex=0;
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();raf=requestAnimationFrame(tick);
  const readyPromise=getLayer(activeModel).then(layer=>{if(!layer||disposed)return null;ready=true;status.ready=true;applyState();onReady({...status});if(isHeme){getLayer('asRun').then(()=>applyState());loadTrajectory();}return {...status};});
  return {
    ready:readyPromise,scene,camera,
    setProgress(value){progress=clamp(Number(value)||0);lastProgressSet=performance.now();applyState();},
    setMode(value){mode=value==='secondary'?'secondary':'atomic';applyState();},
    setSelection(value){selection=['all','protein','cofactor','candidate'].includes(value)?value:'all';applyState();},
    setFocus(value){selection=value==='activeSite'?'cofactor':value==='candidate'?'candidate':'all';applyState();},
    setTrajectory(value){trajectoryEnabled=Boolean(value);trajectoryElapsed=0;if(trajectoryEnabled&&!trajectory)loadTrajectory();applyState();},
    setPaused(value){paused=Boolean(value);},
    setReducedMotion(value){reducedMotion=Boolean(value);application?.setReducedMotion?.(reducedMotion);applyState();},
    async setModel(value){
      const token=++modelToken;
      if(isHeme){forcedModel=value==='asRun'||value==='trajectory'?'asRun':value==='design'?'design':null;if(forcedModel==='asRun')await getLayer('asRun');if(token!==modelToken||disposed)return;applyState();return;}
      const next=/isog/i.test(value)?'isog':'gs';const layer=await getLayer(next);if(!layer||token!==modelToken||disposed)return;activeModel=next;applyState();
    },
    resetCamera,
    renderFrame(){if(disposed)return;updateCamera(0,performance.now());renderer.render(scene,camera);},
    getStatus(){return {...status,paused,ready,frame:trajectoryFrame,sourceFrame:trajectory?.frameIndices[trajectoryFrame]??null};},
    dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);observer.disconnect();canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',pointerUp);canvas.removeEventListener('wheel',wheel);canvas.removeEventListener('keydown',key);authenticSolvent?.geometry.dispose();authenticSolvent?.material.dispose();layers.forEach(layer=>layer.dispose());application?.dispose?.();water.dispose();glowTexture.dispose();renderer.dispose();renderer.forceContextLoss();scene.clear();}
  };
}
