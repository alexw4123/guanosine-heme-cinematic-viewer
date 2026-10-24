/* Molecular closeups. Project coordinate files and explicit connectivity remain unchanged. */
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
      const atoms=[],serials=new Map(),connections=[];
      for(const line of new TextDecoder().decode(buffer).split(/\r?\n/)){
        if(/^(ATOM  |HETATM)/.test(line)){
          const serial=Number(line.slice(6,11)),name=line.slice(12,16).trim();
          const element=line.slice(76,78).trim().toUpperCase()||name.replace(/[0-9]/g,'')[0];
          serials.set(serial,atoms.length);atoms.push({serial,name,element,x:Number(line.slice(30,38)),y:Number(line.slice(38,46)),z:Number(line.slice(46,54))});
        }else if(line.startsWith('CONECT'))connections.push(line.slice(6).trim().split(/\s+/).map(Number));
      }
      const seen=new Set(),bonds=[];
      for(const row of connections){const a=serials.get(row[0]);for(const serial of row.slice(1)){const b=serials.get(serial);if(a===undefined||b===undefined||a===b)continue;const pair=a<b?[a,b]:[b,a],id=pair.join(':');if(!seen.has(id)){seen.add(id);bonds.push(pair);}}}
      if(atoms.length!==spec.atoms||bonds.length!==spec.bonds)throw new Error('The source atom or bond count differs.');
      return {key,atoms,bonds,hash};
    })();sourceCache.set(key,task);task.catch(()=>sourceCache.delete(key));return task;
  }
  window.createResearchStoryScene=function({project='heme',container,onError=()=>{}}={}){
    if(!(container instanceof HTMLElement))throw new TypeError('A molecular scene container is required.');
    container.classList.add('story-scene');
    let T,renderer,scene,camera,currentGroup,update=()=>{},dead=false,buildId=0,resizeObserver;
    let current={id:project==='heme'?'bundle':'cell',p:0,variant:project==='heme'?'glucose':'normal',reducedMotion:false};
    const palette={navy:0x071421,cyan:0x69d0db,amber:0xeeb76a,violet:0xb9a4dd,rose:0xeaa4bc,red:0xc76070,green:0x6fc69f,white:0xdce7ee,muted:0x91a9b9,blue:0x7199b6};
    const note={textContent:''};
    const v=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
    const material=(color,opacity=1,extra={})=>new T.MeshStandardMaterial({color,roughness:.28,metalness:.03,transparent:opacity<1,opacity,depthWrite:opacity>.97,...extra});
    const mesh=(parent,g,m,pos=[0,0,0],scale=[1,1,1])=>{const o=new T.Mesh(g,m);o.position.set(...pos);o.scale.set(...scale);parent.add(o);return o;};
    const group=(parent,pos=[0,0,0])=>{const g=new T.Group();g.position.set(...pos);parent.add(g);return g;};
    const sphere=(parent,pos,r,color,opacity=1,scale=[1,1,1])=>mesh(parent,new T.SphereGeometry(r,24,18),material(color,opacity),pos,scale);
    const rod=(parent,a,b,r,color,opacity=1)=>{const va=v(...a),vb=v(...b),dir=vb.clone().sub(va);const o=mesh(parent,new T.CylinderGeometry(r,r,dir.length(),12),material(color,opacity),va.clone().add(vb).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(v(0,1,0),dir.normalize());return o;};
    const box=(parent,pos,size,color,opacity=1)=>mesh(parent,new T.BoxGeometry(...size),material(color,opacity),pos);
    const torus=(parent,pos,r,t,color,opacity=1,rotation=[0,0,0])=>{const o=mesh(parent,new T.TorusGeometry(r,t,12,64),material(color,opacity),pos);o.rotation.set(...rotation);return o;};
    const tube=(parent,points,r,color,opacity=1)=>{const c=new T.CatmullRomCurve3(points.map(a=>v(...a)));mesh(parent,new T.TubeGeometry(c,Math.max(32,points.length*4),r,10,false),material(color,opacity));return c;};
    function label(parent,text,pos,width=2.3,color='#d9e7f2'){
      const canvas=document.createElement('canvas');canvas.width=768;canvas.height=128;const ctx=canvas.getContext('2d');
      ctx.fillStyle='rgba(7,20,33,.72)';ctx.beginPath();ctx.roundRect(10,12,748,104,18);ctx.fill();ctx.font='500 44px -apple-system,Segoe UI,Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(text,384,65,720);
      const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
      const m=new T.SpriteMaterial({map:texture,transparent:true,depthTest:false});const s=new T.Sprite(m);s.position.set(...pos);s.scale.set(width,width/6,1);s.renderOrder=8;parent.add(s);return s;
    }
    function fade(parent,alpha){parent.visible=alpha>.001;parent.traverse(o=>{if(o.isMesh||o.isSprite)for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m.userData.baseOpacity===undefined)m.userData.baseOpacity=m.opacity;m.transparent=true;m.opacity=m.userData.baseOpacity*alpha;}});}
    function token(parent,text,pos,color=palette.cyan,scale=1){const g=group(parent,pos);label(g,text,[0,0,.1],1.25,'#e8f1f5');const ring=torus(g,[0,0,0],.34,.025,color,.85);ring.scale.x=1.55;g.scale.setScalar(scale);return g;}
    // Small symbolic nucleotide units are used only in the pathway view.
    function molecule(parent,pos,color=palette.rose,scale=1){const g=group(parent,pos);const hex=[];for(let i=0;i<=6;i++){const a=i*Math.PI/3;hex.push([Math.cos(a)*.2,Math.sin(a)*.2,0]);}tube(g,hex,.035,color);sphere(g,[.4,0,0],.07,palette.amber);rod(g,[.2,0,0],[.4,0,0],.025,color);g.scale.setScalar(scale);return g;}
    function peroxide(parent,pos,scale=1){const g=group(parent,pos);sphere(g,[-.16,0,0],.145,palette.red);sphere(g,[.16,0,0],.145,palette.red);rod(g,[-.16,0,0],[.16,0,0],.055,palette.red);sphere(g,[-.3,.16,.08],.075,palette.white);sphere(g,[.3,-.16,-.08],.075,palette.white);rod(g,[-.16,0,0],[-.3,.16,.08],.034,palette.white);rod(g,[.16,0,0],[.3,-.16,-.08],.034,palette.white);g.scale.setScalar(scale);return g;}
    function sourceAtomic(model,focus='whole',options={}){
      const outer=group(currentGroup),g=group(outer),atoms=model.atoms,bounds=new T.Box3();atoms.forEach(a=>bounds.expandByPoint(v(a.x,a.y,a.z)));
      const center=bounds.getCenter(v()),span=bounds.getSize(v());let scale=6.9/Math.max(span.x,span.y,span.z),pivot=center;
      if(focus==='iron'||focus==='hemeOnly')pivot=v(atoms[1140].x,atoms[1140].y,atoms[1140].z);
      if(focus==='pocket'){pivot=v();for(let i=3087;i<atoms.length;i++)pivot.add(v(atoms[i].x,atoms[i].y,atoms[i].z));pivot.multiplyScalar(1/(atoms.length-3087));scale*=1.45;}
      if(focus==='iron')scale*=2.15;if(focus==='hemeOnly')scale*=3.3;
      const visible=atoms.map((_,i)=>i).filter(i=>focus==='hemeOnly'?i>=1140:options.hideLigand?i<3087:true),visibleSet=new Set(visible);
      const bonds=model.bonds.filter(([a,b])=>visibleSet.has(a)&&visibleSet.has(b));
      const atomGeo=new T.SphereGeometry(1,18,14),bondGeo=new T.CylinderGeometry(1,1,1,10);
      const atomMat=material(palette.white,1,{roughness:.24}),bondMat=material(palette.white,1,{roughness:.32});
      const atomMesh=new T.InstancedMesh(atomGeo,atomMat,visible.length),bondMesh=new T.InstancedMesh(bondGeo,bondMat,bonds.length*2);g.add(atomMesh,bondMesh);
      const dummy=new T.Object3D(),color=new T.Color();
      const colorFor=i=>{
        if(project==='heme'){if(i>=1140)return atoms[i].element==='FE'?0xffd48b:palette.amber;const cap=(i<=53)||(i>=284&&i<=337)||(i>=570&&i<=623)||(i>=854&&i<=907);return cap?palette.violet:palette.cyan;}
        if(i>=3087)return model.key==='isog'?palette.violet:palette.rose;if(i>=3013)return palette.amber;
        return atoms[i].element==='N'?0xa2bbce:atoms[i].element==='O'?0xc3a3b0:atoms[i].element==='H'?0x748c9c:0xadc0cd;
      };
      const dim=i=>focus==='iron'&&i<1140?.31:focus==='pocket'&&i<3013?.64:1;
      visible.forEach((index,i)=>{const a=atoms[index];dummy.position.set(a.x-pivot.x,a.y-pivot.y,a.z-pivot.z);dummy.scale.setScalar(a.element==='H'?.14:a.element==='FE'?.62:.29);dummy.quaternion.identity();dummy.updateMatrix();atomMesh.setMatrixAt(i,dummy.matrix);color.setHex(colorFor(index)).multiplyScalar(dim(index));atomMesh.setColorAt(i,color);});
      let n=0;bonds.forEach(([a,b])=>{const aa=atoms[a],bb=atoms[b],pa=v(aa.x-pivot.x,aa.y-pivot.y,aa.z-pivot.z),pb=v(bb.x-pivot.x,bb.y-pivot.y,bb.z-pivot.z),mid=pa.clone().add(pb).multiplyScalar(.5);for(const [from,to,index] of [[pa,mid,a],[mid,pb,b]]){const dir=to.clone().sub(from);dummy.position.copy(from).add(to).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(v(0,1,0),dir.clone().normalize());dummy.scale.set(.095,dir.length(),.095);dummy.updateMatrix();bondMesh.setMatrixAt(n,dummy.matrix);color.setHex(colorFor(index)).multiplyScalar(dim(index));bondMesh.setColorAt(n++,color);}});
      g.scale.setScalar(scale);
      if(focus==='iron'||focus==='hemeOnly'){
        const fe=atoms[1140],nitrogens=model.bonds.filter(([a,b])=>a===1140||b===1140).map(([a,b])=>a===1140?b:a).filter(i=>i>=1140&&atoms[i].element==='N');
        let normal=v(0,0,1),largest=0;
        for(let i=0;i<nitrogens.length;i++)for(let j=i+1;j<nitrogens.length;j++){const a=atoms[nitrogens[i]],b=atoms[nitrogens[j]],n=v(a.x-fe.x,a.y-fe.y,a.z-fe.z).cross(v(b.x-fe.x,b.y-fe.y,b.z-fe.z));if(n.lengthSq()>largest){largest=n.lengthSq();normal=n.normalize();}}
        if(normal.z<0)normal.negate();g.quaternion.setFromUnitVectors(normal,v(0,0,1));
      }
      outer.rotation.set(-.16,.24,.04);
      container.dataset.sourceModel=model.key;container.dataset.sourceHashVerified='true';container.dataset.sourceAtomCount=String(atoms.length);container.dataset.sourceBondCount=String(model.bonds.length);container.dataset.sourceVisibleAtomCount=String(visible.length);container.dataset.sourceView=options.hideLigand?'protein-cofactor':focus;
      return {outer,g,model,scale,pivot,atomMesh,bondMesh};
    }
    function addSource(key,focus,token,after,options={}){sourceModel(key).then(model=>{if(dead||token!==buildId)return;const atomic=sourceAtomic(model,focus,options);after?.(atomic);apply();}).catch(error=>{if(dead||token!==buildId)return;container.dataset.sceneError=error.message;onError(error);});}
    function buildDhfr(id,tokenId){
      const g=currentGroup,variant=current.variant,mtx=variant==='mtx'||variant==='methotrexate',unmeasured=variant==='gs'||variant==='isog';
      if(id==='cell'){
        addSource('gs','whole',tokenId,a=>{label(g,'Human DHFR',[-2.55,2.8,0],2.4);label(g,'NADPH',[2.5,2.8,0],1.5,'#edc58a');update=p=>{a.outer.scale.setScalar(mix(.95,1.14,ease(.05,.9,p)));a.outer.rotation.y=.16+p*.23;camera.position.z=mix(12,10.8,ease(.1,.95,p));};update(current.p);});
      }else if(id==='reaction'||id==='inhibition'&&!unmeasured){
        // The prepared complex supplies protein/cofactor context only. The GS ligand
        // is hidden. Reference substrate/inhibitor tokens are not source coordinates.
        addSource('gs','pocket',tokenId,a=>{
          const reference=id==='inhibition'&&mtx;
          const actor=token(g,reference?'MTX':'DHF',[-3.3,.12,2.7],reference?palette.rose:palette.cyan,1.15);
          const product=token(g,'THF',[3.2,.12,2.7],palette.green,1.1);product.visible=false;
          const hydride=sphere(g,[.9,1.05,2.55],.075,palette.amber),trail=rod(g,[0,0,0],[0,1,0],.012,palette.amber,.4);
          const donorAtom=a.model.atoms.slice(3013,3087).find(atom=>atom.name==='C4N');
          label(g,'NADPH',[1.6,2.5,1.9],1.7,'#eac28b');label(g,reference?'Reference inhibition':'DHF → THF',[0,-2.7,1.9],reference?3.2:2.7);
          update=p=>{
            const enter=ease(.02,.43,p);actor.position.x=mix(-3.3,0,enter);actor.position.y=mix(.4,.12,enter);
            const leave=ease(.62,.97,p);fade(actor,reference?1:1-leave);product.visible=!reference&&p>.58;product.position.x=mix(0,3.2,leave);fade(product,leave);
            a.outer.rotation.y=.20+Math.sin(p*Math.PI)*.035;
            hydride.visible=!reference&&p>.36&&p<.68;trail.visible=hydride.visible;
            if(donorAtom){a.outer.updateMatrixWorld(true);const donor=a.g.localToWorld(v(donorAtom.x-a.pivot.x,donorAtom.y-a.pivot.y,donorAtom.z-a.pivot.z)),target=actor.position.clone(),direction=target.clone().sub(donor);hydride.position.copy(donor).lerp(target,ease(.38,.64,p));trail.position.copy(donor).add(target).multiplyScalar(.5);trail.quaternion.setFromUnitVectors(v(0,1,0),direction.clone().normalize());trail.scale.y=direction.length();}
          };update(current.p);
        },{hideLigand:true});
      }else if(id==='inhibition'){
        addSource(variant,'pocket',tokenId,a=>{
          const clashes=[];for(let i=3087;i<a.model.atoms.length;i++){const aa=a.model.atoms[i];if(aa.element==='H')continue;for(let j=0;j<3013;j++){const bb=a.model.atoms[j];if(bb.element==='H')continue;const d=(aa.x-bb.x)**2+(aa.y-bb.y)**2+(aa.z-bb.z)**2;if(d<2.25){clashes.push([aa,bb]);if(clashes.length>=3)break;}}if(clashes.length>=3)break;}
          clashes.forEach(([aa])=>{const pos=[(aa.x-a.pivot.x)*a.scale,(aa.y-a.pivot.y)*a.scale,(aa.z-a.pivot.z)*a.scale];torus(a.outer,pos,.18,.018,palette.red,.85);});
          label(g,variant==='gs'?'GS model':'isog model',[0,-2.85,1],2.1);update=p=>{a.outer.rotation.y=.22+p*.13;};update(current.p);
        });
      }else if(id==='nucleotides'){
        const pathways=[{y:1.35,color:palette.cyan,name:'dUMP → dTMP'},{y:-1.35,color:palette.violet,name:'Purine synthesis'}],units=[];
        label(g,'Reduced folates',[-2.7,0,0],2.8);label(g,'Nucleotide supply',[2.5,0,0],3);
        pathways.forEach(({y,color,name})=>{tube(g,[[-2.2,0,0],[-.5,y,0],[2.7,y,0]],.025,palette.muted,.4);label(g,name,[1.6,y+.6,0],3);for(let i=0;i<9;i++)units.push({object:molecule(g,[0,0,0],color,.55),y,offset:i/9});});
        update=p=>{units.forEach(({object,y,offset},i)=>{const t=(offset+(unmeasured?.35:p*.75))%1;object.position.set(mix(-2.1,2.5,t),mix(0,y,ease(0,.45,t)),0);object.visible=!mtx||i%3===0||p<.25;if(unmeasured)fade(object,.35);});};
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

      }else{buildDhfr('cell',tokenId);}
    }
    function cuvette(parent,pos=[0,0,0],size=1,initial=palette.muted){
      const g=group(parent,pos);g.scale.setScalar(size);
      const glass=new T.MeshPhysicalMaterial({color:0xdaedf1,roughness:.055,metalness:0,transmission:.35,thickness:.16,ior:1.46,transparent:true,opacity:.24,clearcoat:1,depthWrite:false});
      for(const [x,z,w,d] of [[-.57,0,.035,1.02],[.57,0,.035,1.02],[0,-.51,1.16,.035],[0,.51,1.16,.035]])mesh(g,new T.BoxGeometry(w,3,d),glass,[x,0,z]);
      mesh(g,new T.BoxGeometry(1.16,.06,1.05),glass,[0,-1.51,0]);
      const solution=mesh(g,new T.BoxGeometry(1.06,2.25,.94),material(initial,.28,{roughness:.12}),[0,-.35,0]);
      const surface=mesh(g,new T.PlaneGeometry(1.06,.94,12,12),material(initial,.4,{side:T.DoubleSide,roughness:.09}),[0,.78,0]);surface.rotation.x=-Math.PI/2;
      const edgeColor=0xa8c8d6;for(const x of [-.58,.58])for(const z of [-.52,.52])rod(g,[x,-1.5,z],[x,1.5,z],.012,edgeColor,.5);
      return {g,solution,surface};
    }
    function buildHeme(id,tokenId){
      const g=currentGroup;
      if(id==='bundle'){
        addSource('heme','whole',tokenId,a=>{update=p=>{a.outer.rotation.y=.18+p*.28;a.outer.scale.setScalar(mix(.98,1.12,ease(.05,.95,p)));camera.position.z=mix(12,11.3,ease(.1,.9,p));};update(current.p);});
      }else if(id==='iron'){
        addSource('heme','iron',tokenId,a=>{const input=peroxide(g,[3.1,.35,2.2],1.05);label(g,'Fe',[.3,-2.75,1.8],.8,'#f3ca8a');update=p=>{input.position.set(mix(3.1,1.1,ease(.05,.85,p)),mix(.7,.35,ease(.05,.8,p)),2.2);input.rotation.y=p*.35;a.outer.rotation.y=.15+p*.10;};update(current.p);});
      }else if(id==='catalysis'){
        // The porphyrin is extracted from the unchanged model. Reactant motion and
        // the transient oxo group are a mechanism explanation, not an MD frame.
        addSource('heme','hemeOnly',tokenId,a=>{
          const input=peroxide(g,[-3.1,1.15,1.3],1),oxo=sphere(g,[0,0,1.1],.15,palette.red),bond=rod(g,[0,0,.3],[0,0,1.1],.045,palette.red);
          const reporters=[token(g,'ABTS',[-3,-1.6,2],palette.muted,1),token(g,'ABTS',[3,-1.6,2],palette.muted,1)];
          const products=[token(g,'ABTS•+',[-3,-1.6,2],palette.green,1),token(g,'ABTS•+',[3,-1.6,2],palette.green,1)];
          update=p=>{input.position.set(mix(-3.1,0,ease(.02,.28,p)),mix(1.15,0,ease(.02,.28,p)),1.3);fade(input,1-ease(.24,.34,p));oxo.visible=p>.28&&p<.79;bond.visible=oxo.visible;
            reporters.forEach((actor,i)=>{const phase=ease(i?.56:.31,i?.94:.64,p),x=(i?1:-1)*(3-Math.sin(phase*Math.PI)*1.9);actor.position.x=x;products[i].position.x=x;fade(actor,1-ease(.42,.62,phase));fade(products[i],ease(.42,.62,phase));});a.outer.rotation.y=.10+p*.06;
          };update(current.p);
        });
      }else if(id==='signal'){
        const sample=cuvette(g,[-.8,.2,0],1.45,0xc4d7db);sample.g.rotation.y=.28;
        const light=rod(g,[-4,-.15,.3],[-1.65,-.15,.3],.026,0xeaf4f7,.9),detected=rod(g,[.1,-.15,.3],[2.6,-.15,.3],.026,0xeaf4f7,.9);
        box(g,[2.65,-.15,.3],[.18,1.4,1.15],palette.blue,.85);label(g,'Optical readout',[2.45,1.0,.7],2.4);label(g,'ABTS oxidation',[-.8,-2.7,.3],2.9);
        update=p=>{const conversion=ease(.04,.96,p);sample.solution.material.color.setHex(0xc4d7db).lerp(new T.Color(palette.green),conversion);sample.surface.material.color.copy(sample.solution.material.color);sample.solution.material.opacity=mix(.16,.62,conversion);detected.material.opacity=mix(.88,.22,conversion);light.material.opacity=.72;};
      }else if(id==='calibration'){
        const row=group(g,[0,-1.72,.6]);for(let i=0;i<5;i++){const c=cuvette(row,[-2.7+i*1.35,0,0],.48,palette.green);c.solution.material.opacity=i===4?.34:.08+i*.12;c.surface.material.opacity=c.solution.material.opacity;label(g,i===0?'Blank':i===4?'Unknown':'Standard',[-2.7+i*1.35,-2.78,.6],1.3);}
        const left=-2.45,bottom=.1,right=2.6,top=2.78;rod(g,[left,bottom,0],[right,bottom,0],.018,palette.muted,.75);rod(g,[left,bottom,0],[left,top,0],.018,palette.muted,.75);
        label(g,'Concentration',[.2,-.32,.1],2.5);const yl=label(g,'Optical response',[-3.04,1.55,.1],2.7);yl.material.rotation=Math.PI/2;
        const points=[[-2.3,.32],[-1.25,.84],[-.2,1.36],[.85,1.88],[1.9,2.40]];tube(g,points.map(([x,y])=>[x,y,.04]),.018,palette.cyan,.7);points.forEach(([x,y],i)=>sphere(g,[x,y,.12],i===0?.045:.065,i===0?palette.muted:palette.green,.95));
        const projection=group(g),ux=.27,uy=1.59;for(let y=bottom;y<uy;y+=.17)rod(projection,[ux,y,.17],[ux,Math.min(y+.075,uy),.17],.012,palette.violet,.8);for(let x=left;x<ux;x+=.19)rod(projection,[x,uy,.17],[Math.min(x+.08,ux),uy,.17],.012,palette.violet,.8);sphere(projection,[ux,uy,.17],.08,palette.violet);label(projection,'Unknown',[ux+.7,uy-.25,.3],1.7,'#d3bdf7');
        update=p=>{fade(projection,ease(.25,.82,p));row.rotation.y=Math.sin(p*Math.PI)*.025;};
      }else{buildHeme('bundle',tokenId);}
    }
    function clear(){if(!currentGroup)return;scene.remove(currentGroup);const geometries=new Set(),materials=new Set(),textures=new Set();currentGroup.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:o.material?[o.material]:[])){materials.add(m);if(m.map)textures.add(m.map);}});geometries.forEach(x=>x.dispose());textures.forEach(x=>x.dispose());materials.forEach(x=>x.dispose());currentGroup=null;}
    function build(){
      if(!T||dead)return;const tokenId=++buildId;clear();currentGroup=new T.Group();scene.add(currentGroup);update=()=>{};
      delete container.dataset.sourceModel;container.dataset.sourceHashVerified='false';delete container.dataset.sourceAtomCount;delete container.dataset.sourceBondCount;delete container.dataset.sourceVisibleAtomCount;delete container.dataset.sourceView;delete container.dataset.sceneError;
      camera.position.set(0,.35,12);camera.lookAt(0,0,0);project==='heme'?buildHeme(current.id,tokenId):buildDhfr(current.id,tokenId);resize();apply();
    }
    function apply(){if(!T||dead)return;const p=current.reducedMotion?.52:current.p;update(p);container.dataset.storyScene=current.id;container.dataset.storyProgress=current.p.toFixed(4);container.dataset.storyVariant=current.variant;renderer.render(scene,camera);}
    function resize(){if(!renderer||dead)return;const width=Math.max(240,container.clientWidth),height=Math.max(180,container.clientHeight||420);renderer.setSize(width,height,false);camera.aspect=width/height;camera.fov=width<500?52:42;camera.updateProjectionMatrix();apply();}
    const ready=import('./vendor/three.module.js').then(module=>{
      if(dead)return;T=module;renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));renderer.setClearColor(palette.navy,1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.domElement.className='story-webgl';renderer.domElement.setAttribute('aria-hidden','true');container.prepend(renderer.domElement);
      scene=new T.Scene();scene.fog=new T.Fog(palette.navy,20,38);camera=new T.PerspectiveCamera(42,1,.1,80);scene.add(new T.HemisphereLight(0xdbe9f1,0x101c28,1.6));const key=new T.DirectionalLight(0xfff7ed,2.1);key.position.set(-5,7,9);scene.add(key);const fill=new T.DirectionalLight(0xa7cadf,.9);fill.position.set(5,2,5);scene.add(fill);const rim=new T.DirectionalLight(project==='heme'?0x81d1dc:0xc1a7cd,.8);rim.position.set(4,-2,-2);scene.add(rim);resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container);build();container.dataset.sceneReady='true';
    }).catch(error=>{container.dataset.sceneError=error.message;onError(error);});
    return {ready,setScene(id,p=0,options={}){const allowed=project==='heme'?['bundle','iron','catalysis','signal','calibration']:['cell','reaction','inhibition','nucleotides','dna'];current={...current,id:allowed.includes(id)?id:allowed[0],p:clamp(p),...options,variant:options.variant||current.variant};build();},setProgress(p){current.p=clamp(p);apply();},setVariant(variant){current.variant=variant;build();},resize,destroy(){dead=true;++buildId;resizeObserver?.disconnect();clear();renderer?.dispose();renderer?.forceContextLoss();renderer?.domElement.remove();container.classList.remove('story-scene');}};
  };
})();
