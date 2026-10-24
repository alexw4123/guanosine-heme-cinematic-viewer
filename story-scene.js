/* Multiscale teaching scenes. Source atomic coordinates are verified and never altered. */
(() => {
  'use strict';
  const clamp=x=>Math.max(0,Math.min(1,Number(x)||0));
  const ease=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
  const mix=(a,b,t)=>a+(b-a)*t;
  const sources={
    heme:{file:'heme-original.pdb',hash:'e3eccb1cbe10a18a0bd633aaf076a7cd1fd2beeedccba0fd73a2a7695b238b4c',atoms:1213,bonds:1232},
    gs:{file:'dhfr-gs-connected.pdb',hash:'726d5828f685de3bb83d5370b2296a891caef991bb02d0f6627b8b94a7378144',atoms:3153,bonds:3195},
    isog:{file:'dhfr-isog-connected.pdb',hash:'4322fbcf031733d17a8e409c2bbbf0910e759e8d8aec3628fb586c1c99c0f45b',atoms:3153,bonds:3195}
  };
  const sourceCache=new Map();
  async function sourceModel(key){
    if(sourceCache.has(key))return sourceCache.get(key);
    const task=(async()=>{
      const spec=sources[key],response=await fetch(new URL('assets/'+spec.file,document.baseURI));
      if(!response.ok)throw new Error('The source structure could not load.');
      const buffer=await response.arrayBuffer();
      const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))].map(x=>x.toString(16).padStart(2,'0')).join('');
      if(hash!==spec.hash)throw new Error('The source structure hash differs.');
      const lines=new TextDecoder().decode(buffer).split(/\r?\n/),atoms=[],serials=new Map(),connections=[];
      for(const line of lines){
        if(/^(ATOM  |HETATM)/.test(line)){
          const serial=Number(line.slice(6,11)),name=line.slice(12,16).trim();
          const element=line.slice(76,78).trim().toUpperCase()||name.replace(/[0-9]/g,'')[0];
          serials.set(serial,atoms.length);atoms.push({serial,name,element,x:Number(line.slice(30,38)),y:Number(line.slice(38,46)),z:Number(line.slice(46,54))});
        }else if(line.startsWith('CONECT'))connections.push(line.slice(6).trim().split(/\s+/).map(Number));
      }
      const bondSet=new Set(),bonds=[];
      for(const row of connections){const a=serials.get(row[0]);for(const serial of row.slice(1)){const b=serials.get(serial);if(a===undefined||b===undefined||a===b)continue;const pair=a<b?[a,b]:[b,a],id=pair.join(':');if(!bondSet.has(id)){bondSet.add(id);bonds.push(pair);}}}
      if(atoms.length!==spec.atoms||bonds.length!==spec.bonds)throw new Error('The source atom or bond count differs.');
      return {key,atoms,bonds,hash};
    })();
    sourceCache.set(key,task);task.catch(()=>sourceCache.delete(key));return task;
  }

  window.createResearchStoryScene=function({project='heme',container,onError=()=>{}}={}){
    if(!(container instanceof HTMLElement))throw new TypeError('A story container is required.');
    container.classList.add('story-scene');
    let T,renderer,scene,camera,currentGroup,update=()=>{},dead=false,buildId=0;
    let current={id:project==='heme'?'sample':'body',p:0,variant:project==='heme'?'glucose':'normal',reducedMotion:false};
    const geometries=new Set(),materials=new Set(),textures=new Set();
    const palette={navy:0x071524,cyan:0x62d8e8,amber:0xf7bd65,violet:0xb69aee,rose:0xf0a0bc,red:0xc94968,green:0x70e2af,white:0xe4edf7,muted:0x7695ad,blue:0x467ea2};
    const badge=document.createElement('span');badge.className='story-scene-kind';badge.textContent='3D explanation';container.append(badge);
    const note=document.createElement('span');note.className='story-scene-note';container.append(note);
    let resizeObserver;
    const v=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
    const geometry=g=>{geometries.add(g);return g;};
    const material=(color,opacity=1,extra={})=>{const m=new T.MeshStandardMaterial({color,roughness:.35,metalness:.12,transparent:opacity<1,opacity,depthWrite:opacity>.97,...extra});materials.add(m);return m;};
    const mesh=(parent,g,m,pos=[0,0,0],scale=[1,1,1])=>{const o=new T.Mesh(g,m);o.position.set(...pos);o.scale.set(...scale);parent.add(o);return o;};
    const group=(parent,pos=[0,0,0])=>{const g=new T.Group();g.position.set(...pos);parent.add(g);return g;};
    const sphere=(parent,pos,r,color,opacity=1,scale=[1,1,1])=>mesh(parent,geometry(new T.SphereGeometry(r,16,12)),material(color,opacity),pos,scale);
    const rod=(parent,a,b,r,color,opacity=1)=>{const va=v(...a),vb=v(...b),dir=vb.clone().sub(va);const o=mesh(parent,geometry(new T.CylinderGeometry(r,r,dir.length(),10)),material(color,opacity),va.clone().add(vb).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(v(0,1,0),dir.normalize());return o;};
    const box=(parent,pos,size,color,opacity=1)=>mesh(parent,geometry(new T.BoxGeometry(...size)),material(color,opacity),pos);
    const torus=(parent,pos,r,t,color,opacity=1,rotation=[0,0,0])=>{const o=mesh(parent,geometry(new T.TorusGeometry(r,t,10,44)),material(color,opacity),pos);o.rotation.set(...rotation);return o;};
    const tube=(parent,points,r,color,opacity=1)=>{const c=new T.CatmullRomCurve3(points.map(a=>v(...a)));mesh(parent,geometry(new T.TubeGeometry(c,Math.max(24,points.length*3),r,8,false)),material(color,opacity));return c;};
    function label(parent,text,pos,width=2.3,color='#d9e7f2'){
      const canvas=document.createElement('canvas');canvas.width=640;canvas.height=112;const ctx=canvas.getContext('2d');
      ctx.fillStyle='rgba(7,21,36,.83)';ctx.beginPath();ctx.roundRect(4,7,632,96,25);ctx.fill();ctx.font='500 39px -apple-system,Segoe UI,Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(text,320,58,604);
      const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;textures.add(texture);
      const m=new T.SpriteMaterial({map:texture,transparent:true,depthTest:false});materials.add(m);const s=new T.Sprite(m);s.position.set(...pos);s.scale.set(width,width*112/640,1);s.renderOrder=8;parent.add(s);return s;
    }
    function fade(parent,alpha){parent.visible=alpha>.001;parent.traverse(o=>{if(o.isMesh||o.isSprite){for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m.userData.storyBaseOpacity===undefined)m.userData.storyBaseOpacity=m.opacity;m.transparent=true;m.opacity=m.userData.storyBaseOpacity*alpha;}}});}
    function molecule(parent,pos,color=palette.rose,scale=1){const g=group(parent,pos);sphere(g,[0,0,0],.25,color);sphere(g,[.35,.18,0],.16,palette.white);sphere(g,[-.3,.12,.1],.18,color);rod(g,[-.3,.12,.1],[.35,.18,0],.055,color);g.scale.setScalar(scale);return g;}
    function enzyme(parent,pos,scale=1){const g=group(parent,pos);for(let i=0;i<8;i++){const angle=i*Math.PI*.25;sphere(g,[Math.cos(angle)*.92,Math.sin(angle)*.78,Math.sin(i*1.9)*.3],.55,palette.blue,.8,[1,.85,1]);}torus(g,[0,0,.45],.65,.08,palette.cyan,.8);g.scale.setScalar(scale);return g;}
    function flow(parent,count,color,range=[8,3,2],radius=.08){const particles=[];for(let i=0;i<count;i++){const y=Math.sin(i*8.17)*range[1],z=Math.cos(i*2.39)*range[2];const o=sphere(parent,[0,y,z],radius*(.75+(i%4)*.15),color,.8);particles.push({o,y,z,offset:i/count});}return p=>particles.forEach(({o,y,z,offset},i)=>{o.position.set((((offset+p*1.6)%1)-.5)*range[0],y+Math.sin(p*6.28+i)*.06,z);});}
    function human(parent,pos,color=palette.cyan,scale=1){const g=group(parent,pos);const translucent=material(color,.14,{side:T.DoubleSide});mesh(g,geometry(new T.SphereGeometry(.54,20,16)),translucent,[0,3.05,0]);mesh(g,geometry(new T.CapsuleGeometry(.73,1.7,6,16)),translucent,[0,1.04,0],[1,1,.65]);const limb=(a,b,r)=>{const va=v(...a),vb=v(...b),o=mesh(g,geometry(new T.CapsuleGeometry(r,va.distanceTo(vb),4,12)),translucent,va.add(vb).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(v(0,1,0),v(...b).sub(v(...a)).normalize());};limb([-.75,1.9,0],[-1.3,.05,0],.22);limb([.75,1.9,0],[1.3,.05,0],.22);limb([-.38,-.15,0],[-.5,-2.35,0],.27);limb([.38,-.15,0],[.5,-2.35,0],.27);
      for(const side of [-1,1]){tube(g,[[0,2.2,.25],[side*.25,1,.35],[side*.3,-.2,.2],[side*.46,-2.15,.1]],.035,palette.red,.9);tube(g,[[0,1.55,.3],[side*.7,1.65,.1],[side*1.22,.1,.05]],.025,palette.rose,.75);}sphere(g,[.08,1.6,.4],.18,palette.rose);g.scale.setScalar(scale);return g;}
    function background(g){const points=[];for(let i=0;i<95;i++)points.push((Math.sin(i*72.1)*.5)*25,(Math.cos(i*34.7)*.5)*15,-5-Math.abs(Math.sin(i))*8);const geom=geometry(new T.BufferGeometry());geom.setAttribute('position',new T.Float32BufferAttribute(points,3));const mat=new T.PointsMaterial({color:palette.muted,size:.035,transparent:true,opacity:.35});materials.add(mat);g.add(new T.Points(geom,mat));}
    function hemeRing(parent,pos=[0,0,0],scale=1){const g=group(parent,pos);const points=[];for(let i=0;i<=8;i++){const a=i*Math.PI/4;points.push([Math.cos(a)*1.3,Math.sin(a)*1.3,0]);}tube(g,points,.09,palette.amber);for(let i=0;i<4;i++){const a=i*Math.PI/2+.4;const x=Math.cos(a)*.65,y=Math.sin(a)*.65;sphere(g,[x,y,0],.13,palette.violet);rod(g,[x,y,0],[0,0,0],.045,palette.amber);}sphere(g,[0,0,0],.27,palette.amber);g.scale.setScalar(scale);return g;}

    function sourceAtomic(model,focus='whole'){
      const outer=group(currentGroup),g=group(outer),atoms=model.atoms;const bounds=new T.Box3();atoms.forEach(a=>bounds.expandByPoint(v(a.x,a.y,a.z)));const center=bounds.getCenter(v()),span=bounds.getSize(v()),scale=6.6/Math.max(span.x,span.y,span.z);
      let pivot=center;if(focus==='iron')pivot=v(atoms[1140].x,atoms[1140].y,atoms[1140].z);
      const atomGeo=geometry(new T.SphereGeometry(1,10,8)),bondGeo=geometry(new T.CylinderGeometry(1,1,1,7));
      const atomMat=material(palette.white),bondMat=material(palette.white);const atomMesh=new T.InstancedMesh(atomGeo,atomMat,atoms.length),bondMesh=new T.InstancedMesh(bondGeo,bondMat,model.bonds.length);g.add(atomMesh,bondMesh);
      const dummy=new T.Object3D(),color=new T.Color();
      const colorFor=i=>{
        if(project==='heme'){if(i>=1140)return palette.amber;const capped=(i<=53)||(i>=284&&i<=337)||(i>=570&&i<=623)||(i>=854&&i<=907);return capped?palette.violet:palette.cyan;}
        return i>=3087?(model.key==='isog'?palette.violet:palette.rose):i>=3013?palette.amber:0x94b0c5;
      };
      atoms.forEach((a,i)=>{dummy.position.set(a.x-pivot.x,a.y-pivot.y,a.z-pivot.z);dummy.scale.setScalar(a.element==='H'?.17:a.element==='FE'?.7:.32);dummy.quaternion.identity();dummy.updateMatrix();atomMesh.setMatrixAt(i,dummy.matrix);color.setHex(colorFor(i));if(focus==='iron'&&i<1140)color.multiplyScalar(.34);atomMesh.setColorAt(i,color);});
      model.bonds.forEach(([a,b],i)=>{const aa=atoms[a],bb=atoms[b],pa=v(aa.x-pivot.x,aa.y-pivot.y,aa.z-pivot.z),pb=v(bb.x-pivot.x,bb.y-pivot.y,bb.z-pivot.z),dir=pb.clone().sub(pa);dummy.position.copy(pa).add(pb).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(v(0,1,0),dir.clone().normalize());dummy.scale.set(.10,dir.length(),.10);dummy.updateMatrix();bondMesh.setMatrixAt(i,dummy.matrix);color.setHex(colorFor(a));if(focus==='iron'&&a<1140&&b<1140)color.multiplyScalar(.34);bondMesh.setColorAt(i,color);});
      g.scale.setScalar(focus==='iron'?scale*2.4:scale);outer.rotation.set(-.12,.35,.08);
      container.dataset.sourceModel=model.key;container.dataset.sourceHashVerified='true';container.dataset.sourceAtomCount=String(atoms.length);container.dataset.sourceBondCount=String(model.bonds.length);badge.textContent='Source atomic model';note.textContent='Unchanged coordinates · explicit bonds';
      return {outer,g,model,scale,pivot};
    }
    function addSource(key,focus,token,after){note.textContent='Loading source coordinates…';sourceModel(key).then(model=>{if(dead||token!==buildId)return;const atomic=sourceAtomic(model,focus);after?.(atomic);render();}).catch(error=>{if(dead||token!==buildId)return;note.textContent='Source structure unavailable. Use the molecular explorer below.';onError(error);render();});}
    function buildDhfr(id,token){
      const g=currentGroup,variant=current.variant,mtx=variant==='mtx'||variant==='methotrexate',unmeasured=variant==='gs'||variant==='isog';
      if(id==='body'){
        const body=human(g,[-2.6,0,0],palette.cyan,.9),vessel=group(g,[1.1,.1,0]);
        const tubeMesh=mesh(vessel,geometry(new T.CylinderGeometry(1.2,1.2,7.4,40,1,true)),material(palette.rose,.12,{side:T.DoubleSide}),[0,0,0]);tubeMesh.rotation.z=Math.PI/2;
        for(let i=0;i<7;i++)torus(vessel,[-3.7+i*1.24,0,0],1.2,.025,palette.rose,.35,[0,Math.PI/2,0]);
        const cells=[];for(let i=0;i<8;i++){const c=torus(vessel,[0,Math.sin(i*2)*.6,Math.cos(i*3)*.55],.38,.18,palette.red,.95,[Math.PI/2+i*.2,.3,0]);c.scale.z=.55;cells.push(c);}
        const stream=flow(vessel,22,palette.rose,[7.3,.8,.7],.07);label(g,'Person',[-2.6,-2.85,0],1.5);label(vessel,'Methotrexate in plasma',[0,1.8,0],3);label(vessel,'Red blood cells',[0,-1.8,0],2.2);
        update=p=>{const t=ease(.08,.65,p);body.position.x=mix(-2.6,-6.5,t);fade(body,1-ease(.2,.65,p));vessel.position.x=mix(2.1,0,t);vessel.scale.setScalar(mix(.55,1.2,t));cells.forEach((c,i)=>{c.position.x=(((i/8+p*.8)%1)-.5)*7.1;c.rotation.x=i*.4+p*2;});stream(p);camera.position.z=mix(14,11,t);};
      }else if(id==='transport'){
        const membrane=group(g);for(let row=-7;row<=7;row++){for(let col=-2;col<=2;col++){const y=row*.5,z=col*.55;if(Math.abs(y)<1.1&&Math.abs(z)<.9)continue;for(const side of [-1,1]){sphere(membrane,[side*.42,y,z],.12,palette.cyan,.8);rod(membrane,[side*.32,y,z],[side*.02,y+.08,z],.035,palette.muted,.8);}}}
        const gate=group(g);const lobes=[];for(const side of [-1,1]){const l=group(g,[0,side*.8,0]);for(let i=0;i<5;i++){const c=mesh(l,geometry(new T.CapsuleGeometry(.15,.9,4,10)),material(palette.violet,.85),[Math.sin(i)*.22,0,(i-2)*.23]);c.rotation.z=.12*side;}lobes.push(l);}
        const drug=molecule(g,[-3,0,.3],palette.rose,.8);label(g,'Outside cell',[-2.7,2.5,0],2);label(g,'Inside cell',[2.7,2.5,0],2);label(g,'SLC19A1',[0,-2.6,0],2);label(g,'Methotrexate',[-2.8,-1.1,0],2.3);
        update=p=>{drug.position.x=mix(-3,3,ease(.12,.88,p));lobes.forEach((l,i)=>{l.rotation.z=(i?1:-1)*Math.sin(p*Math.PI)*.5;l.position.y=(i?1:-1)*(.75+Math.sin(p*Math.PI)*.35);});gate.rotation.y=Math.sin(p*Math.PI)*.1;};
      }else if(id==='cell'){
        const crowd=group(g);for(let i=0;i<42;i++){const x=Math.sin(i*19.1)*5,y=Math.cos(i*7.7)*3,z=Math.sin(i*3.1)*3-1;const o=mesh(crowd,geometry(new T.IcosahedronGeometry(.16+(i%4)*.09,1)),material(i%3?palette.blue:palette.violet,.4),[x,y,z],[1.4,.8,1]);o.rotation.set(i,i*.8,i*.4);}
        addSource('gs','whole',token,a=>{a.outer.scale.setScalar(.83);update=p=>{fade(crowd,mix(1,.16,ease(.1,.8,p)));a.outer.scale.setScalar(mix(.65,1.1,ease(.15,.85,p)));a.outer.rotation.y=.35+p*.28;};update(current.p);});
        label(g,'Crowded cytoplasm',[-2.7,3,0],2.9);update=p=>{crowd.rotation.y=p*.1;};
      }else if(id==='reaction'){
        const protein=enzyme(g,[0,0,0],1.5),cofactor=molecule(g,[.8,.8,.9],palette.amber,.8),substrate=molecule(g,[-3,0,1],palette.cyan,1),hydride=sphere(g,[.7,.8,1.3],.09,palette.amber);const productLabel=label(g,'THF',[3,-1,0],1.1,'#8fe5bf');label(g,'DHF',[-3,-1,0],1.1);label(g,'NADPH',[1.4,2,0],1.9);label(g,'DHFR',[0,-2.3,0],1.5);label(g,'H⁻ transfer',[0,1.25,2],2.2,'#ffd38e');
        update=p=>{substrate.position.x=p<.55?mix(-3,0,ease(.05,.45,p)):mix(0,3,ease(.65,.97,p));substrate.traverse(o=>{if(o.isMesh)o.material.color.setHex(p>.65?palette.green:palette.cyan);});hydride.position.set(mix(.8,0,ease(.4,.62,p)),mix(.8,0,ease(.4,.62,p)),1.2);hydride.visible=p>.34&&p<.7;productLabel.material.opacity=ease(.65,.9,p);protein.rotation.y=Math.sin(p*Math.PI)*.08;};
      }else if(id==='inhibition'){
        if(variant==='gs'||variant==='isog'){
          addSource(variant,'whole',token,a=>{
            const clashes=[];for(let i=3087;i<a.model.atoms.length;i++){const aa=a.model.atoms[i];if(aa.element==='H')continue;for(let j=0;j<3013;j++){const bb=a.model.atoms[j];if(bb.element==='H')continue;const d=(aa.x-bb.x)**2+(aa.y-bb.y)**2+(aa.z-bb.z)**2;if(d<2.25){clashes.push([aa,bb]);if(clashes.length>=3)break;}}if(clashes.length>=3)break;}
            clashes.forEach(([aa])=>{const pos=[(aa.x-a.pivot.x)*a.scale,(aa.y-a.pivot.y)*a.scale,(aa.z-a.pivot.z)*a.scale];torus(a.outer,pos,.24,.025,palette.red,.9);});
            label(g,variant==='gs'?'GS starting pose':'isog starting pose',[0,-3,0],2.8);note.textContent='Unrelaxed source pose · red marks indicate short contacts';update=p=>{a.outer.rotation.y=.25+p*.25;};update(current.p);
          });
        }else{
          const protein=enzyme(g,[0,0,0],1.5),ligand=molecule(g,[-3,0,1],mtx?palette.rose:palette.cyan,1);const substrate=molecule(g,[-4,1,0],palette.cyan,.7);label(g,mtx?'Methotrexate reference':'Normal substrate',[-2.3,-2.5,0],3);label(g,'DHFR pocket',[1.5,2.3,0],2.4);
          update=p=>{ligand.position.x=mix(-3,0,ease(.1,.5,p));if(!mtx)ligand.position.x=p>.6?mix(0,3,ease(.6,.95,p)):ligand.position.x;substrate.position.x=mtx?mix(-4,-1.5,ease(.2,.8,p)):mix(-4,-.5,ease(.4,.85,p));protein.rotation.y=p*.08;};
        }
      }else if(id==='nucleotides'){
        const center=sphere(g,[-2.7,0,0],.63,palette.green,.8);label(g,'Reduced folates',[-2.7,-1.2,0],2.9);const branches=[{y:1.6,c:palette.cyan,title:'dUMP → dTMP'},{y:-1.6,c:palette.violet,title:'Purine synthesis'}],beads=[];
        branches.forEach(({y,c,title})=>{tube(g,[[-2.1,0,0],[-.8,y,0],[2.5,y,0]],.035,palette.muted,.65);sphere(g,[2.5,y,0],.4,c);label(g,title,[1.6,y+.65,0],3);for(let i=0;i<12;i++)beads.push({o:sphere(g,[0,0,0],.075,c),y,offset:i/12});});label(g,'Nucleotide supply',[2.4,-.05,0],2.8);
        if(unmeasured){label(g,'GS / isog effects are unmeasured',[0,3.1,0],4.8);note.textContent='This pathway explains the reference biology, not a GS/isog result.';}
        update=p=>{beads.forEach(({o,y,offset},i)=>{const t=(offset+(unmeasured?.36:p*.8))%1;o.position.set(mix(-2.1,2.5,t),mix(0,y,Math.min(1,t*3)),0);o.visible=!mtx||i%3===0||p<.38;if(unmeasured)o.material.color.setHex(palette.muted);});center.scale.setScalar(mtx?mix(1,.68,ease(.2,.8,p)):1);};
      }else if(id==='dna'){
        const dna=group(g),daughterSteps=[],polymerases=[],supply=[];
        // An intact parental duplex opens into two template arms. New rungs
        // appear progressively on each arm; inhibition changes their supply,
        // never cuts or edits the parental DNA.
        for(let i=0;i<=16;i++){
          const y=-2.8+i*.17,a=i*.56,x=Math.cos(a)*.32,z=Math.sin(a)*.32;
          sphere(dna,[x,y,z],.055,palette.cyan);sphere(dna,[-x,y,-z],.055,palette.violet);
          rod(dna,[x,y,z],[-x,y,-z],.026,i%2?palette.amber:palette.rose,.8);
          if(i){const b=(i-1)*.56,py=y-.17;rod(dna,[x,y,z],[Math.cos(b)*.32,py,Math.sin(b)*.32],.035,palette.cyan);rod(dna,[-x,y,-z],[-Math.cos(b)*.32,py,-Math.sin(b)*.32],.035,palette.violet);}
        }
        for(const side of [-1,1]){
          const templateColor=side<0?palette.cyan:palette.violet,daughterColor=side<0?palette.amber:palette.rose;
          const template=[];for(let i=0;i<=23;i++){const t=i/23;template.push([side*(.17+2.0*t),-.08+2.65*t,Math.sin(t*8)*.09]);}
          tube(dna,template,.045,templateColor,.95);
          for(let i=0;i<20;i++){
            const t=(i+.5)/20,x=side*(.17+2*t),y=-.08+2.65*t,z=Math.sin(t*8)*.09;
            const next=group(dna);sphere(next,[x-side*.31,y+.13,z+.05],.065,daughterColor);
            rod(next,[x,y,z],[x-side*.31,y+.13,z+.05],.032,i%2?palette.amber:palette.rose,.95);
            if(i){const pt=(i-.5)/20;rod(next,[x-side*.31,y+.13,z+.05],[side*(.17+2*pt)-side*.31,-.08+2.65*pt+.13,Math.sin(pt*8)*.09+.05],.04,daughterColor);}
            daughterSteps.push({object:next,t});
          }
          const polymerase=group(dna);sphere(polymerase,[0,0,0],.26,palette.green,.8,[1.6,.85,1]);torus(polymerase,[0,0,.16],.15,.045,palette.green,.95);polymerases.push({object:polymerase,side});
          for(let i=0;i<9;i++)supply.push({object:molecule(g,[0,0,0],daughterColor,.26),side,offset:i/9});
        }
        label(g,'Parental DNA',[0,-3.35,0],2.4);label(g,'Template arms',[0,.1,-1],2.5);label(g,'Daughter DNA',[-2.65,3.1,0],2.5);
        label(g,mtx?'Nucleotide supply restricted':'Nucleotides build the copies',[2.55,3.1,0],3.5);label(g,'Polymerases extend new strands',[0,-1.45,1.3],4.8);
        if(unmeasured){note.textContent='GS / isog cellular uptake and DNA-response effects remain unmeasured.';label(g,'GS / isog response is unmeasured',[0,3.8,0],5);}
        update=p=>{
          const travel=unmeasured?.4:mtx?Math.min(.4,.1+p*.8):.1+p*.88;
          daughterSteps.forEach(({object,t})=>{object.visible=t<=travel;});
          polymerases.forEach(({object,side})=>object.position.set(side*(.17+2*travel)-side*.16,-.08+2.65*travel+.05,.27));
          supply.forEach(({object,side,offset},i)=>{const t=(offset+(unmeasured?.3:p*.9))%1,px=side*(.17+2*travel)-side*.16,py=-.08+2.65*travel+.05;object.position.set(mix(side*4,px,t),mix(.9,py,t),.4+Math.sin(t*Math.PI)*.3);object.visible=!mtx||i%4===0||p<.25;if(unmeasured)object.traverse(a=>{if(a.isMesh)a.material.color.setHex(palette.muted);});});
          dna.rotation.y=unmeasured?.12:Math.sin(p*Math.PI)*.12;
        };
      }else{
        human(g,[0,-.2,-2],palette.cyan,.75);const cells=[];for(const side of [-1,1])for(let i=0;i<5;i++){const c=sphere(g,[side*2.5+Math.sin(i*3)*.5,Math.cos(i*2)*1.4,1],.38,side<0?palette.rose:palette.cyan,.45);sphere(c,[0,0,0],.13,palette.violet,.8);cells.push(c);}label(g,'Disease cells',[-2.7,-2.5,1],2.4);label(g,'Normal dividing tissue',[2.7,-2.5,1],3.4);label(g,'Benefit and harm need separate evidence',[0,3.1,0],5.5);
        if(unmeasured)note.textContent='GS / isog selectivity and safety remain open experimental questions.';
        update=p=>{cells.forEach((o,i)=>{const growth=unmeasured?0:mtx?.08:.23;o.scale.setScalar(1+Math.sin(p*Math.PI*2+i)*growth);});};
      }
    }

    function buildHeme(id,token){
      const g=currentGroup,variant=current.variant;
      if(id==='sample'){
        const well=group(g,[0,-1,0]);mesh(well,geometry(new T.CylinderGeometry(1.5,1.3,2.2,44,1,true)),material(palette.cyan,.12,{side:T.DoubleSide}));torus(well,[0,1.1,0],1.5,.05,palette.cyan,.65,[Math.PI/2,0,0]);const liquid=mesh(well,geometry(new T.CylinderGeometry(1.25,1.15,.8,40)),material(palette.rose,.38),[0,-.55,0]);const drop=sphere(g,[0,3,0],.42,palette.red,.85,[.8,1.3,.8]);const mixture=group(g);for(let i=0;i<22;i++){const x=Math.sin(i*6.1)*2.6,y=Math.cos(i*2.9)*1.3,z=Math.sin(i*4.7);mesh(mixture,geometry(new T.IcosahedronGeometry(i%3?.14:.28,1)),material(i%3?palette.muted:palette.violet,.65),[x,y,z]);}label(g,'Blood sample',[0,3.6,0],2.2);label(g,'Assay outside the body',[0,-3,0],3.4);label(mixture,'Proteins · salts · targets',[0,2,0],3.8);
        update=p=>{drop.position.y=mix(3,-.5,ease(.05,.48,p));drop.scale.setScalar(mix(1,.1,ease(.38,.55,p)));well.position.x=mix(0,-4,ease(.55,.95,p));fade(mixture,ease(.48,.85,p));mixture.scale.setScalar(mix(.3,1.2,ease(.5,.95,p)));liquid.scale.y=mix(.3,1,ease(.3,.5,p));};
      }else if(id==='recognition'){
        const target=molecule(g,[-3.8,.4,0],variant==='methotrexate'?palette.rose:palette.amber,.8);const recognition=group(g,[-.8,0,0]);let reporter;
        if(variant==='methotrexate'){
          const points=[];for(let i=0;i<=60;i++){const a=i/60*Math.PI*1.8;points.push([Math.cos(a)*1,Math.sin(a)*1.2,Math.sin(a*3)*.2]);}tube(recognition,points,.07,palette.violet);label(g,'MTX aptamer',[-1,-2,0],2.5);reporter=hemeRing(g,[3,0,0],.65);label(g,'Recognition → DNAzyme reporter',[1.2,2.5,0],4.8);label(g,'Peroxide is an assay reagent',[3,-2,0],3.2);
        }else{enzyme(recognition,[0,0,0],.8);label(g,variant==='cholesterol'?'Cholesterol oxidase':'Glucose oxidase',[-.8,-2,0],3);reporter=group(g,[3,0,0]);sphere(reporter,[-.15,0,0],.22,palette.red);sphere(reporter,[.2,0,0],.22,palette.red);sphere(reporter,[-.32,.18,0],.12,palette.white);sphere(reporter,[.38,.18,0],.12,palette.white);label(g,'H₂O₂',[3,-1,0],1.5);label(g,variant==='cholesterol'?'Cholesterol':'Glucose',[-3.5,1.6,0],1.8);label(g,'Recognition first. Reporter second.',[0,2.6,0],5.2);}
        update=p=>{target.position.x=mix(-3.8,-.8,ease(.05,.45,p));fade(reporter,ease(.45,.85,p));reporter.position.x=mix(1.5,3,ease(.45,.88,p));recognition.rotation.y=Math.sin(p*Math.PI)*.22;};
      }else if(id==='bundle'){
        addSource('heme','whole',token,a=>{label(g,'Four peptide chains',[-2.8,2.9,0],2.8,'#86e5ef');label(g,'Hemin',[2.3,-2.9,0],1.5,'#ffd18b');label(g,'Guanosine–PEG2',[2.5,2.9,0],2.8,'#cfb9f3');update=p=>{a.outer.rotation.y=.3+p*.5;a.outer.scale.setScalar(mix(.95,1.07,ease(.1,.9,p)));};update(current.p);});
      }else if(id==='iron'){
        addSource('heme','iron',token,a=>{label(g,'Fe + porphyrin',[0,-3,0],2.7,'#ffd18b');label(g,'Cofactor retention',[2.4,2.6,0],2.8);label(g,'Access for peroxide?',[-2.3,2.6,0],3);const peroxide=group(g,[3,0,2]);sphere(peroxide,[-.15,0,0],.16,palette.red);sphere(peroxide,[.15,0,0],.16,palette.red);badge.textContent='Source model + illustration';note.textContent='Illustrated peroxide approaches the unchanged source model.';update=p=>{peroxide.position.x=mix(3,.8,ease(.05,.7,p));peroxide.position.z=2+Math.sin(p*Math.PI)*.4;a.outer.rotation.y=.2+p*.12;};update(current.p);});
      }else if(id==='catalysis'){
        const ring=hemeRing(g,[0,0,0],1.1),peroxide=group(g,[-3,1,0]);sphere(peroxide,[-.15,0,0],.2,palette.red);sphere(peroxide,[.15,0,0],.2,palette.red);const oxo=sphere(g,[0,0,.65],.17,palette.red),oxoBond=rod(g,[0,0,0],[0,0,.65],.06,palette.amber);const reporters=[molecule(g,[-3,-1,1],palette.muted,.8),molecule(g,[3,-1,1],palette.muted,.8)];label(g,'Peroxide',[-3,2,0],2);label(g,'Heme cycle',[0,-2.3,0],2);label(g,'ABTS → oxidized ABTS',[0,3,0],4,'#a4efc7');label(g,'Mechanism illustration',[0,-3.2,0],3.3);
        update=p=>{peroxide.position.set(mix(-3,0,ease(.02,.25,p)),mix(1,0,ease(.02,.25,p)),.7);fade(peroxide,1-ease(.22,.34,p));oxo.visible=p>.24&&p<.78;oxoBond.visible=oxo.visible;reporters.forEach((r,i)=>{const phase=ease(i?.55:.29,i?.9:.6,p);r.position.x=(i?1:-1)*(3-Math.sin(phase*Math.PI)*2);r.traverse(o=>{if(o.isMesh)o.material.color.setHex(phase>.5?palette.green:palette.muted);});});ring.rotation.y=p*.15;};
      }else if(id==='signal'){
        const well=mesh(g,geometry(new T.CylinderGeometry(2.15,1.9,3,48,1,true)),material(palette.cyan,.1,{side:T.DoubleSide}),[0,0,0]);const liquid=mesh(g,geometry(new T.CylinderGeometry(1.85,1.7,2.2,40)),material(palette.muted,.25),[0,-.35,0]);const particles=[];for(let i=0;i<65;i++){const r=Math.sqrt((i+.5)/65)*1.5,a=i*2.4;particles.push(sphere(g,[Math.cos(a)*r,Math.sin(i*6.1)*.85-.3,Math.sin(a)*r],.075,palette.muted,.85));}label(g,'Many reporter molecules',[0,2.4,0],3.5);label(g,'Bulk optical signal',[0,-2.5,0],3.1,'#a4efc7');
        update=p=>{particles.forEach((o,i)=>{o.material.color.setHex(i/particles.length<p?palette.green:palette.muted);o.position.y=Math.sin(i*6.1+p*3)*.85-.3;});liquid.material.color.setHex(palette.muted).lerp(new T.Color(palette.green),ease(.1,.9,p));liquid.material.opacity=mix(.2,.6,p);well.rotation.y=p*.08;};
      }else if(id==='calibration'){
        const cuvettes=[];
        for(let i=0;i<5;i++){
          const x=-2.5+i*1.25;box(g,[x,-1.24,.55],[.58,1.1,.58],palette.cyan,.12);
          const fill=box(g,[x,-1.42,.55],[.46,.58,.46],palette.green,i===4?.22:.07+i*.12);cuvettes.push(fill);
          label(g,i===0?'Blank':i===4?'Unknown':'Standard',[x,-2.03,.6],1.16);
        }
        const instrument=box(g,[0,-2.52,-.7],[5.9,.36,1],palette.blue,.72);
        const beam=box(g,[-2.5,-1.22,1],[.025,.9,.025],palette.green,.85);
        box(g,[0,1.38,-.9],[6.4,3.25,.06],palette.blue,.11);
        const left=-2.45,bottom=.22,right=2.6,top=2.78;
        rod(g,[left,bottom,0],[right,bottom,0],.025,palette.muted,.9);
        rod(g,[left,bottom,0],[left,top,0],.025,palette.muted,.9);
        label(g,'Concentration',[.2,-.23,.1],2.6);
        const yLabel=label(g,'Optical response',[-3.04,1.55,.1],2.7);yLabel.material.rotation=Math.PI/2;
        label(g,'Illustration · no measured data',[.15,3.22,0],4.6);
        const calibration=[[-2.3,.37],[-1.25,.89],[-.2,1.41],[.85,1.93],[1.9,2.45]];
        tube(g,calibration.map(([x,y])=>[x,y,.04]),.025,palette.cyan,.6);
        calibration.forEach(([x,y],i)=>sphere(g,[x,y,.12],i===0?.065:.085,i===0?palette.muted:palette.green,.95));
        label(g,'Standards',[1.3,2.86,.15],2.1,'#a4efc7');label(g,'Blank',[-2.05,.65,.15],1.1);
        const projection=group(g),unknownX=.27,unknownY=1.64;
        for(let y=bottom;y<unknownY;y+=.17)rod(projection,[unknownX,y,.17],[unknownX,Math.min(y+.08,unknownY),.17],.018,palette.violet,.9);
        for(let x=left;x<unknownX;x+=.19)rod(projection,[x,unknownY,.17],[Math.min(x+.09,unknownX),unknownY,.17],.018,palette.violet,.9);
        sphere(projection,[unknownX,unknownY,.17],.11,palette.violet);label(projection,'Unknown',[unknownX+.7,unknownY-.26,.3],1.7,'#d3bdf7');
        note.textContent='Illustrative calibration only. No measured concentrations or responses are shown.';
        update=p=>{beam.position.x=mix(-2.5,2.5,p);instrument.material.emissive.setHex(palette.green);instrument.material.emissiveIntensity=.1+Math.sin(p*Math.PI)*.15;fade(projection,ease(.35,.78,p));};
      }else{
        const labels=['Free hemin','Peptide only','Peptide + hemin','HRP'];const cells=[];labels.forEach((text,i)=>{const x=-3.3+i*2.2;box(g,[x,0,0],[1.1,2.1,1.1],palette.cyan,.13);box(g,[x,-.4,0],[.9,1.1,.9],palette.muted,.3);label(g,text,[x,-1.75,0],2);cells.push(torus(g,[x,0,1],.7,.035,palette.amber,.2));});label(g,'Measure the comparison',[0,2.8,0],3.7);label(g,'Activity · lifetime · reproducibility',[0,-3,0],5.1);update=p=>{cells.forEach((o,i)=>{o.material.opacity=Math.max(.1,1-Math.abs(p*3-i)*1.3);});};
      }
    }
    function clear(){if(currentGroup){scene.remove(currentGroup);currentGroup.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}}});}geometries.clear();materials.clear();textures.clear();}
    function build(){
      if(!T||dead)return;const token=++buildId;clear();currentGroup=new T.Group();scene.add(currentGroup);background(currentGroup);update=()=>{};badge.textContent='3D explanation';note.textContent='Qualitative scale · illustrated process';delete container.dataset.sourceModel;container.dataset.sourceHashVerified='false';delete container.dataset.sourceAtomCount;delete container.dataset.sourceBondCount;
      camera.position.set(0,.2,12);camera.lookAt(0,0,0);project==='heme'?buildHeme(current.id,token):buildDhfr(current.id,token);resize();apply();
    }
    function apply(){if(!T||dead)return;const p=current.reducedMotion?.52:current.p;update(p);container.dataset.storyScene=current.id;container.dataset.storyProgress=current.p.toFixed(4);container.dataset.storyVariant=current.variant;renderer.render(scene,camera);}
    function resize(){if(!renderer||dead)return;const width=Math.max(240,container.clientWidth),height=Math.max(260,container.clientHeight||420);renderer.setSize(width,height,false);camera.aspect=width/height;camera.fov=width<500?54:44;camera.updateProjectionMatrix();apply();}
    function render(){if(renderer&&!dead)renderer.render(scene,camera);}
    const ready=import('./vendor/three.module.js').then(module=>{
      if(dead)return;T=module;renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));renderer.setClearColor(palette.navy,1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;renderer.domElement.className='story-webgl';renderer.domElement.setAttribute('aria-hidden','true');container.prepend(renderer.domElement);
      scene=new T.Scene();scene.fog=new T.Fog(palette.navy,15,32);camera=new T.PerspectiveCamera(44,1,.1,80);scene.add(new T.HemisphereLight(0xd0ecff,0x102035,2.4));const key=new T.DirectionalLight(0xffffff,3);key.position.set(-4,6,8);scene.add(key);const rim=new T.DirectionalLight(project==='heme'?palette.cyan:palette.rose,2);rim.position.set(5,-2,3);scene.add(rim);resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container);build();container.dataset.sceneReady='true';
    }).catch(error=>{note.textContent='The 3D explanation could not open. The captions and source explorer remain available.';container.dataset.sceneError=error.message;onError(error);});
    return {ready,setScene(id,p=0,options={}){current={...current,id,p:clamp(p),...options,variant:options.variant||current.variant};build();},setProgress(p){current.p=clamp(p);apply();},setVariant(variant){current.variant=variant;build();},resize,destroy(){dead=true;++buildId;resizeObserver?.disconnect();clear();renderer?.dispose();renderer?.forceContextLoss();renderer?.domElement.remove();badge.remove();note.remove();}};
  };
})();
