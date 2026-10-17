import {Interactable} from 'SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable';
import {InteractableManipulation} from 'SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation';
import {Geometry,C,obj,building,plant} from './KhaaliGeometry';
import {KhaaliDabbaUI,welcomeNote} from './KhaaliDabbaUI';
import {KhaaliDabbaPlacement} from './KhaaliDabbaPlacement';

type Chapter='gift'|'laddoos'|'magic'|'neighborhood'|'choice'|'carrying'|'placed'|'ending';
type Home=ReturnType<typeof building>;
@component
export class KhaaliDabbaGame extends BaseScriptComponent {
  @input @hint('Vertex-color material for the miniature world') material:Material;
  @input @allowUndefined @hint('Reflective SimplePBR steel material') steelMaterial:Material;
  @input @hint('Table-relative root: centimetres, tabletop at local Y zero') contentRoot:SceneObject;
  @input @hint('World-space subtitle root above the dabba') uiRoot:SceneObject;
  @input @allowUndefined @hint('Optional real-table surface placement manager') placement:KhaaliDabbaPlacement;
  @input @allowUndefined @hint('Font supporting Devanagari and Latin') hindiFont:Font;
  @input @allowUndefined @hint('Steel lid sound') clink:AudioComponent;
  @input @allowUndefined @hint('Laddoo and hover feedback') pickup:AudioComponent;
  @input @allowUndefined @hint('Magical reveal sound') reveal:AudioComponent;
  @input @allowUndefined @hint('Ending sound') ending:AudioComponent;
  @input @allowUndefined @hint('Neighborhood ambience') ambient:AudioComponent;
  @input @allowUndefined @hint('Warm instrumental score') music:AudioComponent;
  @input @allowUndefined @hint('Optional recorded Hindi welcome; subtitles always remain available') welcomeVoice:AudioComponent;
  @input @allowUndefined @hint('Optional recorded Arre beta, khaali dabba nahi lautate dialogue') reminderVoice:AudioComponent;
  @input @allowUndefined @hint('Optional recorded Dabba khaali tha, rishta nahi finale') finalVoice:AudioComponent;
  @input @hint('Enable automatic 80-second demo. Leave off for normal play.') demoMode:boolean=false;
  @input @hint('Neighborhood reveal animation duration in seconds') revealSeconds:number=4;
  @input @hint('Delay between each miniature building rising, in seconds') houseRevealStagger:number=0.6;
  private chapter:Chapter='gift';private ui:KhaaliDabbaUI;
  private lid:SceneObject;private world:SceneObject;private snacks:SceneObject[]=[];private homes:Home[]=[];
  private gifts:SceneObject[]=[];private giftHomes:vec3[]=[];private sparkles:SceneObject[]=[];private replay:SceneObject;
  private note:SceneObject;private endingProps:SceneObject[]=[];
  private drop:SceneObject;
  private ripple:SceneObject;private foodParcels:SceneObject[]=[];private balconyLetters:SceneObject[]=[];
  private bindings:(()=>void)[]=[];private visited:boolean[]=[false,false,false];private selected=-1;
  private time=0;private phaseTime=0;private lidAmount=0;private lidGoal=0;private revealAmount=0;
  private generation=0;private demoStep=0;private demoTimes=[3,8,20,30,40,52,62,69,76];
  onAwake() {
    this.construct();
    this.createEvent('OnStartEvent').bind(()=>{this.bindings.forEach(b=>b());this.ui=new KhaaliDabbaUI(this.uiRoot,this.hindiFont);this.restart();
      if(this.placement){this.placement.onStatusChanged.add(status=>{if(!this.placement.isReadyForInteraction())this.say('Find your table',status,'Look at a clear tabletop and pinch to place the dabba.');});this.placement.onPlaced.add(result=>{
        if(result.source==='world-query'){const rt=this.contentRoot.getTransform(),rot=rt.getWorldRotation();this.uiRoot.getTransform().setWorldPosition(rt.getWorldPosition().add(rot.multiplyVec3(new vec3(0,31,-5))));this.uiRoot.getTransform().setWorldRotation(rot);}
        this.later(0.8,()=>this.say('Khaali Dabba Nahi Lautate','Sharma Aunty sent something homemade.','Look at the steel lid and pinch to open.'));});this.placement.useAuthoredEditorPlacement();}
      [this.clink,this.pickup,this.reveal,this.ending,this.welcomeVoice,this.reminderVoice,this.finalVoice].forEach(a=>{if(a)a.playbackMode=Audio.PlaybackMode.LowLatency;});
      [this.ambient,this.music].forEach(a=>{if(a)a.playbackMode=Audio.PlaybackMode.LowPower;});
      this.play(this.ambient,-1);this.play(this.music,-1);});
    this.createEvent('UpdateEvent').bind(()=>this.update());
  }
  private play(a:AudioComponent,loops:number=1) {if(a)a.play(loops);}
  private say(title:string,body:string,hint:string) {if(this.ui)this.ui.set(title,body,hint);console.log('[KhaaliDabba] '+title+' | '+body+' | '+hint);}
  private enter(c:Chapter) {this.chapter=c;this.phaseTime=0;}
  private later(seconds:number,callback:()=>void) {const gen=this.generation;const e=this.createEvent('DelayedCallbackEvent');e.bind(()=>{if(gen===this.generation)callback();});e.reset(seconds);}
  private target(o:SceneObject,size:vec3,action:()=>void,drag:boolean=false) {
    const collider=o.createComponent('Physics.ColliderComponent') as ColliderComponent;const shape=Shape.createBoxShape();shape.size=size;collider.shape=shape;collider.intangible=false;
    const inter=o.createComponent(Interactable.getTypeName()) as Interactable;
    // Preserve authored/rest scale. Buildings use an accent rather than growing
    // under the hand; scaling them would fight their reveal animation.
    let restScale:vec3|null=null;
    this.bindings.push(()=>{inter.onTriggerEnd.add(()=>{if(!drag&&(!this.placement||this.placement.isReadyForInteraction()))action();});inter.onHoverEnter.add(()=>{
      this.play(this.pickup);const home=this.homes.filter(h=>h.root===o)[0];
      if(home){home.accent.enabled=true;return;}
      if(!restScale)restScale=o.getTransform().getLocalScale();o.getTransform().setLocalScale(restScale.uniformScale(1.045));
    });inter.onHoverExit.add(()=>{const home=this.homes.filter(h=>h.root===o)[0];if(home)home.accent.enabled=false;else if(restScale){o.getTransform().setLocalScale(restScale);restScale=null;}});});
    if(drag) {
      const manip=o.createComponent(InteractableManipulation.getTypeName()) as InteractableManipulation;
      manip.setCanScale(false);manip.setCanRotate(false);
      this.bindings.push(()=>{manip.onManipulationStart.add(()=>{if(!this.placement||this.placement.isReadyForInteraction())action();});manip.onManipulationEnd.add(()=>this.releaseGift(o));});
    }
  }
  private construct() {
    const root=this.contentRoot;const steel=this.steelMaterial||this.material;
    if(this.placement&&!this.placement.reticle){
      const reticle=obj(this.placement.getSceneObject(),'Table placement marigold ring');
      new Geometry().lathe([[4.8,0],[5,0.08],[5,0.15],[4.8,0.15],[4.8,0]],C.light,40).build(reticle,'Pinch here to place',this.material);
      reticle.enabled=false;this.placement.reticle=reticle;
    }
    // A continuous lathed inner wall, rolled lip and brushed rings, not a solid cylinder.
    new Geometry().lathe([[0,0],[9.8,0],[10.5,0.5],[10.8,1],[10.8,5.5],[11.15,5.7],[11.15,6],[10.55,6],[10.3,5.5],[10.3,0.8],[0,0.8]],C.steel,64).build(root,'DabbaBody',steel);
    for(let y=1.5;y<5;y+=1.4)new Geometry().lathe([[10.79,y],[10.86,y+0.08],[10.79,y+0.16]],C.steel,48).build(root,'Pressed steel bead',steel);
    this.lid=obj(root,'Lid',new vec3(0,6.2,0));
    new Geometry().lathe([[0,0],[10.8,0],[10.9,-0.55],[11.3,-0.45],[11.3,0.15],[9.8,0.45],[0,0.45]],C.steel,64).build(this.lid,'Rolled lid',steel);
    new Geometry().lathe([[0,0],[1.4,0],[1.5,0.5],[1.2,0.85],[0,0.85]],C.steel,24).build(this.lid,'Pinch lid handle',steel).getTransform().setLocalPosition(new vec3(0,0.45,0));
    this.target(this.lid,new vec3(23,3,23),()=>this.chapter==='placed'?this.closeLid():this.openLid());
    this.note=welcomeNote(root,this.hindiFont);
    // Paper and lettering share one articulated root, so the card can float
    // forward to be read and disappear together before the magical reveal.
    new Geometry().box(0,0,0,12,6,0.1,C.cream).box(-5.6,0,0.08,0.12,5.4,0.03,C.terracotta).build(this.note,'Folded handwritten paper',this.material);
    for(let j=0;j<3;j++) {
      const p=new vec3((j-1)*4.8,2.8,j===1?-2:2);const s=obj(root,'Laddoo '+(j+1),p);
      const g=new Geometry().sphere(0,0,0,2.1,C.gold,18,12);
      for(let k=0;k<18;k++){const a=k*2.399,r=1.9,yy=Math.sin(k*1.7)*1.7;g.sphere(Math.cos(a)*Math.sqrt(Math.max(0,r*r-yy*yy)),yy,Math.sin(a)*Math.sqrt(Math.max(0,r*r-yy*yy)),0.13,k%3?C.cream:C.terracotta,5,3);}
      g.build(s,'Besan, ghee and pistachio crumbs',this.material);this.target(s,new vec3(4.8,4.8,4.8),()=>this.eatLaddoo(j));this.snacks.push(s);
    }
    this.world=obj(root,'MiniMohalla',new vec3(0,6.2,0));
    const street=new Geometry().lathe([[0,0],[10.2,0],[10.2,0.4],[0,0.4]],C.terracotta,48);
    street.box(0,0.44,3,18,0.12,2,C.cream);
    for(let k=0;k<12;k++){const a=k*Math.PI/6;plant(street,Math.cos(a)*8.6,0.45,Math.sin(a)*8.6);}
    // Rangoli around the courtyard.
    for(let k=0;k<16;k++){const a=k*Math.PI/8;street.sphere(Math.cos(a)*2.1,0.55,4+Math.sin(a)*1.2,0.18,k%2?C.pink:C.gold,6,4);}
    street.build(this.world,'Courtyard rangoli and tulsi pots',this.material);
    for(let j=0;j<3;j++){const h=building(this.world,j,this.material);this.homes.push(h);this.target(h.root,new vec3(6,14,7),()=>this.visitHouse(j));}
    for(let mode=0;mode<3;mode++){
      const e=obj(this.world,['Shared supper','Letters in every balcony','Chai in the courtyard'][mode]);const g=new Geometry();
      if(mode===0)for(let j=0;j<3;j++){
        const plate=new Geometry().lathe([[0,0],[1,0],[1.1,0.15],[0,0.15]],C.steel,16).sphere(0,0.5,0,0.55,C.gold,10,6).sphere(0.5,0.32,0.2,0.27,C.green,8,4).build(e,'A plate for home '+(j+1),this.material);
        this.foodParcels.push(plate);
      }
      if(mode===1)for(let j=0;j<3;j++){
        const letter=new Geometry().box(0,0,0,1.8,1.3,0.1,C.cream).box(0,0,0.07,0.95,0.09,0.03,C.terracotta).sphere(0,0.35,0.1,0.14,C.pink,8,5).build(e,'A letter for balcony '+(j+1),this.material);
        this.balconyLetters.push(letter);
      }
      if(mode===2){g.lathe([[0,0],[2.1,0],[2.1,0.2],[0,0.2]],C.terracotta,20,0,1.3,5);for(let j=0;j<4;j++){const a=j*Math.PI/2;g.lathe([[0,0],[0.4,0],[0.55,0.8],[0,0.8]],C.gold,12,Math.cos(a)*1.3,1.5,5+Math.sin(a)*1.3);}}
      if(mode===2)g.build(e,'Return gesture becomes connection',this.material);e.enabled=false;this.endingProps.push(e);
    }
    const giftRoot=obj(root,'Return gestures',new vec3(0,0,17));
    for(let j=0;j<3;j++) {
      const p=new vec3((j-1)*10,3,0);const gift=obj(giftRoot,['Homemade food','Handwritten thank-you','Chai invitation'][j],p);const g=new Geometry();
      if(j===0){g.lathe([[0,0],[2.6,0],[2.8,0.3],[0,0.3]],C.steel,28);for(let k=0;k<3;k++)g.sphere((k-1)*1.2,0.8,0,0.85,C.gold);}
      if(j===1){g.box(0,0,0,4.8,0.22,3.6,C.cream);for(let k=0;k<4;k++)g.box(-0.2,0.15,-1+k*0.55,3-k*0.45,0.06,0.09,C.terracotta);g.sphere(1.4,0.2,0.9,0.35,C.pink);}
      if(j===2){g.lathe([[0,0],[1.3,0],[1.6,1.8],[1.35,1.8],[1.1,0.4],[0,0.4]],C.terracotta,24);g.lathe([[0,0],[1.33,0],[0,0.04]],C.dark,24,0,1.6,0);g.lathe([[0.25,0],[0.42,0.12],[0.42,1],[0.25,1.12]],C.terracotta,12,1.5,0.4,0);}
      g.build(gift,'Gesture object',this.material);this.gifts.push(gift);this.giftHomes.push(p);this.target(gift,new vec3(6,5,6),()=>this.chooseGesture(j),true);
    }
    const drop=obj(root,'Return placement target',new vec3(0,8,7));
    this.drop=drop;
    new Geometry().lathe([[3.5,0],[3.8,0.12],[3.5,0.25]],C.light,32).build(drop,'Golden return ring',this.material);this.target(drop,new vec3(8,5,7),()=>this.placeGesture());
    this.replay=obj(root,'Replay diya',new vec3(16,2,0));new Geometry().lathe([[0,0],[1.5,0],[2,1],[0,1]],C.terracotta,24).sphere(0,1.6,0,0.55,C.gold).build(this.replay,'A new beginning',this.material);this.target(this.replay,new vec3(5,5,5),()=>{if(this.chapter==='ending')this.restart();});
    const halo=new Geometry();
    for(let ring=0;ring<2;ring++)halo.lathe([[8.4+ring,0],[8.5+ring,0.08],[8.4+ring,0.16]],ring?C.gold:C.light,48);
    for(let j=0;j<24;j++){const a=j*Math.PI/12;halo.sphere(Math.cos(a)*9,0.1,Math.sin(a)*9,0.20,j%2?C.gold:C.pink,6,4);}
    this.ripple=halo.build(root,'Marigold rings of connection',this.material);this.ripple.enabled=false;
    // Twelve reused particles and a single batched halo keep this flourish cheap.
    for(let j=0;j<12;j++){const s=obj(root,'Marigold magic '+j);new Geometry().sphere(0,0,0,j%3?0.09:0.16,C.light,5,3).build(s,'Light',this.material);this.sparkles.push(s);}
  }
  public openLid() {if(this.chapter!=='gift')return;this.enter('laddoos');this.lidGoal=1;this.play(this.clink);this.play(this.welcomeVoice);this.say('१ · Sharma Aunty ka dabba','“Naye aaye ho na? Ghar ka bana hai.”\n— Sharma Aunty','Look at a laddoo and pinch. Take your time.');}
  public eatLaddoo(index:number=0) {
    if(this.chapter!=='laddoos'||index<0||index>2||!this.snacks[index].enabled)return;
    this.snacks[index].enabled=false;this.play(this.pickup);
    if(this.snacks.some(s=>s.enabled)){this.say('Ghar ka swaad','Besan, ghee, aur thoda sa pyaar.','Pinch the remaining laddoos.');return;}
    this.enter('magic');this.note.enabled=false;this.say('“Arre beta…”','“Khaali dabba nahi lautate!”','An empty dabba. A whole world inside.');this.play(this.reveal);this.play(this.reminderVoice);this.world.enabled=true;
    this.later(this.revealSeconds+1,()=>{this.enter('neighborhood');this.homes.forEach(h=>{const collider=h.root.getComponent('Physics.ColliderComponent') as ColliderComponent;if(collider)collider.enabled=true;});this.say('२ · Dabba ke andar ek mohalla','Three homes. Three little stories.','Pinch each colorful house to meet your neighbours.');});
  }
  public visitHouse(index:number) {
    if((this.chapter!=='neighborhood'&&this.chapter!=='choice')||index<0||index>2)return;
    this.visited[index]=true;this.homes[index].window.enabled=true;this.play(this.pickup);
    const stories=[['Meera · Exam tomorrow','“Hostel ki maggi se break chahiye!”\nShe misses home.'],['Iyer Uncle · One extra cup','“Do cup chai ban jaati hai… aadat hai.”\nOne cup is still waiting.'],['Sharma Aunty · Dinner time','“Ek roti aur bana lo!”\nThere is always room for one more.']];
    const count=this.visited.filter(v=>v).length;this.say(stories[index][0],stories[index][1],count<3?count+'/3 homes met · Pinch another house.':'3/3 homes met · What will you return?');
    if(count===3&&this.chapter==='neighborhood'){this.enter('choice');this.gifts.forEach(g=>g.enabled=true);this.later(6,()=>{if(this.chapter==='choice')this.say('३ · Kya lautayenge?','Food nourishes. A note remembers. Chai brings us together.','Pinch and carry a plate, note or chai into the golden ring.');});}
  }
  public chooseGesture(index:number) {if((this.chapter!=='choice'&&this.chapter!=='carrying')||index<0||index>2)return;this.selected=index;this.enter('carrying');this.drop.enabled=true;this.play(this.pickup);this.say('A little gesture, a big feeling',['Ghar ka khana.','Dil se shukriya.','Aaiye, chai pe milte hain.'][index],'Carry it into the dabba and release. Or pinch the golden ring.');}
  private releaseGift(o:SceneObject) {
    if(this.chapter!=='carrying'||this.gifts[this.selected]!==o)return;
    const p=o.getTransform().getWorldPosition();const local=this.contentRoot.getTransform().getInvertedWorldTransform().multiplyPoint(p);
    if(Math.sqrt(local.x*local.x+local.z*local.z)<9.8&&local.y>0&&local.y<15)this.placeGesture();else {o.getTransform().setLocalPosition(this.giftHomes[this.selected]);this.drop.enabled=false;this.enter('choice');this.say('Almost!','Your gesture belongs inside the dabba.','Try again, or select it and pinch the golden ring.');}
  }
  public placeGesture() {
    if(this.chapter!=='carrying')return;this.enter('placed');this.drop.enabled=false;this.play(this.clink);const g=this.gifts[this.selected];
    g.setParent(this.contentRoot);g.getTransform().setLocalPosition(new vec3(0,7.2,6));g.getTransform().setLocalScale(vec3.one());
    this.gifts.forEach((o,i)=>o.enabled=i===this.selected);this.say('४ · Pyaar se band kijiye','The dabba is ready to go home.','Pinch the raised steel lid to return your gesture.');
  }
  public closeLid() {
    if(this.chapter!=='placed')return;this.enter('ending');this.lidGoal=0;this.play(this.clink);this.play(this.ending);this.gifts.forEach(g=>g.enabled=false);
    this.homes.forEach(h=>h.window.enabled=false);this.replay.enabled=true;
    this.endingProps.forEach((o,i)=>o.enabled=i===this.selected);
    const endings=[['Ghar ka khana','One plate becomes a meal for every home.'],['Dil se shukriya','A few handwritten words. A keepsake in every balcony.'],['Aaiye, chai pe milte hain','Three doors open. Nobody drinks alone.']];
    this.say(endings[this.selected][0],endings[this.selected][1],'Watch your kindness travel.');
    this.later(8,()=>{this.play(this.finalVoice);this.say('“Dabba khaali tha. Rishta nahi.”','The container was empty. The connection was not.','Pinch the glowing diya to discover another ending.');});
  }
  public restart() {
    this.generation++;this.enter('gift');this.time=0;this.demoStep=0;this.visited=[false,false,false];this.selected=-1;this.lidAmount=0;this.lidGoal=0;this.revealAmount=0;
    this.world.enabled=false;this.replay.enabled=false;this.snacks.forEach(s=>s.enabled=true);
    this.drop.enabled=false;
    this.note.enabled=true;this.endingProps.forEach(o=>o.enabled=false);
    this.ripple.enabled=false;
    this.note.getTransform().setLocalPosition(new vec3(0,1.15,-5));this.note.getTransform().setLocalRotation(quat.angleAxis(-Math.PI/2,vec3.right()));
    this.gifts.forEach((g,i)=>{g.enabled=false;g.setParent(this.contentRoot);g.getTransform().setLocalPosition(new vec3((i-1)*10,3,17));g.getTransform().setLocalScale(vec3.one());this.giftHomes[i]=new vec3((i-1)*10,3,17);});
    this.homes.forEach((h,i)=>{h.window.enabled=false;h.accent.enabled=false;h.root.getTransform().setLocalPosition(new vec3((i-1)*6.6,0,i===1?-3.7:-1));h.root.getTransform().setLocalScale(vec3.one());h.resident.getTransform().setLocalPosition(new vec3(0,0.5,3.4));h.door.getTransform().setLocalRotation(quat.quatIdentity());});
    this.say('Khaali Dabba Nahi Lautate','An everyday Indian magic story\nखाली डब्बा नहीं लौटाते','Look at the steel lid and pinch to open.');
  }
  private update() {
    if(!this.lid)return;if(this.placement&&!this.placement.isReadyForInteraction())return;const dt=Math.min(getDeltaTime(),0.08);this.time+=dt;this.phaseTime+=dt;
    this.lidAmount+=(this.lidGoal-this.lidAmount)*Math.min(1,dt*5);
    this.lid.getTransform().setLocalPosition(new vec3(this.lidAmount*20,6.2+this.lidAmount*4,-this.lidAmount*12));
    this.lid.getTransform().setLocalRotation(quat.angleAxis(-this.lidAmount*1.05,vec3.right()));
    const clamp=(v:number)=>Math.max(0,Math.min(1,v)),ease=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
    if(this.chapter==='laddoos'){
      const t=ease(this.phaseTime/1.3);this.note.getTransform().setLocalPosition(new vec3(-18.5*t,1.15+8*t,-5+15*t));
      this.note.getTransform().setLocalRotation(quat.angleAxis(-Math.PI/2+(Math.PI/2-0.15)*t,vec3.right()));
    }
    if(this.chapter==='magic')this.revealAmount=clamp(this.phaseTime/Math.max(1,this.revealSeconds));
    if(this.world.enabled){this.world.getTransform().setLocalScale(vec3.one());this.world.getTransform().setLocalPosition(new vec3(0,6.2,0));}
    this.homes.forEach((h,i)=>{
      const end=this.chapter==='ending',a=this.time*2+i,baseZ=i===1?-3.7:-1;
      if(this.chapter==='magic'){
        const duration=Math.max(1,this.revealSeconds-Math.max(0,this.houseRevealStagger)*2);
        const t=ease((this.phaseTime-i*Math.max(0,this.houseRevealStagger))/duration);
        h.root.getTransform().setLocalPosition(new vec3((i-1)*6.6,-12*(1-t),baseZ));h.root.getTransform().setLocalScale(new vec3(1,Math.max(0.001,t),1));
      }else if(this.world.enabled){h.root.getTransform().setLocalPosition(new vec3((i-1)*6.6,0,baseZ));h.root.getTransform().setLocalScale(vec3.one());}
      h.resident.getTransform().setLocalRotation(quat.angleAxis(Math.sin(a)*0.09,vec3.forward()));
      if(end){
        const t=ease((this.phaseTime-0.7-i*0.4)/3.2);h.window.enabled=this.phaseTime>0.5+i*0.65;
        h.door.getTransform().setLocalRotation(quat.angleAxis(-0.95*ease(this.phaseTime/1.4),vec3.up()));
        if(this.selected===2){const angle=i*Math.PI*2/3;const tx=-(i-1)*6.6+Math.cos(angle)*2.7,tz=5-baseZ+Math.sin(angle)*1.8;
          h.resident.getTransform().setLocalPosition(new vec3(tx*t,0.5+Math.sin(this.phaseTime*11+i)*0.07*(1-t),3.4+(tz-3.4)*t));
        }
      }
    });
    if(this.chapter==='ending'){
      this.foodParcels.forEach((plate,i)=>{const t=ease((this.phaseTime-0.5-i*0.65)/3.2),x=(i-1)*6.6,z=i===1?-0.3:2.4;plate.getTransform().setLocalPosition(new vec3(x*t,1.1+Math.sin(t*Math.PI)*4.2,5.7+(z-5.7)*t));plate.getTransform().setLocalRotation(quat.angleAxis((1-t)*Math.PI*2,vec3.up()));});
      this.balconyLetters.forEach((letter,i)=>{const t=ease((this.phaseTime-0.6-i*0.65)/2.7),x=(i-1)*6.6,z=i===1?-0.45:2.25;letter.getTransform().setLocalPosition(new vec3(x*t,1+5.2*t+Math.sin(t*Math.PI)*2,6+(z-6)*t));letter.getTransform().setLocalScale(new vec3(0.15+1.05*t,0.15+1.05*t,0.15+1.05*t));letter.getTransform().setLocalRotation(quat.angleAxis(Math.sin(this.phaseTime*1.5+i)*0.10,vec3.forward()));});
    }
    const magic=this.chapter==='magic',celebrating=this.chapter==='ending';this.ripple.enabled=magic||celebrating;
    if(this.ripple.enabled){const t=magic?this.phaseTime:this.phaseTime*0.6,scale=0.45+(t%2)*0.36;this.ripple.getTransform().setLocalPosition(new vec3(0,6.65,0));this.ripple.getTransform().setLocalScale(new vec3(scale,1,scale));this.ripple.getTransform().setLocalRotation(quat.angleAxis(this.time*0.13,vec3.up()));}
    this.sparkles.forEach((s,i)=>{const active=this.chapter==='magic'||this.chapter==='ending';s.enabled=active;if(active){const a=i*2.4+this.time*0.35,r=3+i%7;s.getTransform().setLocalPosition(new vec3(Math.cos(a)*r,7+(this.time*2+i*0.7)%15,Math.sin(a)*r));}});
    if(this.demoMode&&this.demoStep<this.demoTimes.length&&this.time>this.demoTimes[this.demoStep]){const actions=[()=>this.openLid(),()=>{this.eatLaddoo(0);this.eatLaddoo(1);this.eatLaddoo(2);},()=>this.visitHouse(0),()=>this.visitHouse(1),()=>this.visitHouse(2),()=>this.chooseGesture(2),()=>this.placeGesture(),()=>this.closeLid(),()=>{}];actions[this.demoStep++]();}
  }
  public getDebugState():string {return JSON.stringify({chapter:this.chapter,visited:this.visited,selected:this.selected,lid:this.lidAmount,reveal:this.revealAmount,demo:this.demoMode});}
}
