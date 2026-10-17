// Lightweight articulated miniature geometry. Dimensions are centimetres.
export const C = {
  cream:[0.97,0.86,0.64,1], gold:[1,0.59,0.08,1], teal:[0.06,0.55,0.56,1],
  pink:[0.95,0.36,0.43,1], blue:[0.25,0.42,0.79,1], dark:[0.12,0.10,0.19,1],
  green:[0.20,0.61,0.25,1], terracotta:[0.72,0.26,0.13,1], steel:[0.68,0.75,0.81,1],
  light:[1,0.84,0.30,1], skin:[0.62,0.35,0.19,1], white:[1,0.97,0.87,1]
};
export function obj(parent:SceneObject,name:string,p:vec3=new vec3(0,0,0)):SceneObject {
  const o=global.scene.createSceneObject(name);o.setParent(parent);o.getTransform().setLocalPosition(p);return o;
}
export class Geometry {
  private v:number[]=[];private i:number[]=[];
  private vertex(p:number[],n:number[],c:number[]):number {
    const k=this.v.length/10;this.v.push(p[0],p[1],p[2],n[0],n[1],n[2],c[0],c[1],c[2],c[3]);return k;
  }
  private face(a:number[],b:number[],c:number[],d:number[],n:number[],col:number[]) {
    const k=this.vertex(a,n,col);this.vertex(b,n,col);this.vertex(c,n,col);this.vertex(d,n,col);
    this.i.push(k,k+1,k+2,k,k+2,k+3);
  }
  box(x:number,y:number,z:number,w:number,h:number,d:number,col:number[]):this {
    const l=x-w/2,r=x+w/2,b=y-h/2,t=y+h/2,f=z+d/2,q=z-d/2;
    this.face([l,b,f],[r,b,f],[r,t,f],[l,t,f],[0,0,1],col);
    this.face([r,b,q],[l,b,q],[l,t,q],[r,t,q],[0,0,-1],col);
    this.face([r,b,f],[r,b,q],[r,t,q],[r,t,f],[1,0,0],col);
    this.face([l,b,q],[l,b,f],[l,t,f],[l,t,q],[-1,0,0],col);
    this.face([l,t,f],[r,t,f],[r,t,q],[l,t,q],[0,1,0],col);
    this.face([l,b,q],[r,b,q],[r,b,f],[l,b,f],[0,-1,0],col);return this;
  }
  lathe(profile:number[][],col:number[],segments:number=36,cx:number=0,cy:number=0,cz:number=0):this {
    // Profile follows outer surface from bottom to top; reverse inner wall explicitly.
    for(let j=0;j<profile.length-1;j++) {
      const p=profile[j],q=profile[j+1],dr=q[0]-p[0],dy=q[1]-p[1],len=Math.sqrt(dr*dr+dy*dy)||1;
      for(let s=0;s<segments;s++) {
        const a=s/segments*Math.PI*2,b=(s+1)/segments*Math.PI*2;
        const point=(r:number,y:number,t:number)=>[cx+r*Math.cos(t),cy+y,cz+r*Math.sin(t)];
        const n=[dy/len*Math.cos((a+b)/2),-dr/len,dy/len*Math.sin((a+b)/2)];
        this.face(point(p[0],p[1],a),point(q[0],q[1],a),point(q[0],q[1],b),point(p[0],p[1],b),n,col);
      }
    }return this;
  }
  sphere(x:number,y:number,z:number,r:number,col:number[],segs:number=12,rings:number=8):this {
    const profile:number[][]=[];for(let j=0;j<=rings;j++){const a=-Math.PI/2+j*Math.PI/rings;profile.push([Math.max(0.001,Math.cos(a)*r),Math.sin(a)*r]);}
    return this.lathe(profile,col,segs,x,y,z);
  }
  build(parent:SceneObject,name:string,material:Material):SceneObject {
    const o=obj(parent,name);const mesh=new MeshBuilder([{name:'position',components:3},{name:'normal',components:3,normalized:true},{name:'color',components:4}]);
    mesh.topology=MeshTopology.Triangles;mesh.indexType=MeshIndexType.UInt16;
    mesh.appendVerticesInterleaved(this.v);mesh.appendIndices(this.i);mesh.updateMesh();
    const visual=o.createComponent('Component.RenderMeshVisual') as RenderMeshVisual;visual.mesh=mesh.getMesh();visual.mainMaterial=material;return o;
  }
}
export function plant(g:Geometry,x:number,y:number,z:number) {
  g.lathe([[0,y],[0.32,y],[0.42,y+0.65],[0,y+0.65]],C.terracotta,10,x,0,z);
  g.box(x,y+1.05,z,0.12,1,0.12,C.green);
  for(let j=0;j<4;j++){const a=j*Math.PI/2;g.sphere(x+Math.cos(a)*0.35,y+1+j*0.11,z+Math.sin(a)*0.35,0.35,C.green,6,4);}
}
export function building(parent:SceneObject,index:number,mat:Material):{root:SceneObject,door:SceneObject,resident:SceneObject,window:SceneObject,accent:SceneObject} {
  const root=obj(parent,['Meera • Exam tomorrow','Iyer Uncle • One extra cup','Sharma Home • Dinner for everyone'][index],new vec3((index-1)*6.6,0,index===1?-3.7:-1));
  const col=[C.teal,C.pink,C.gold][index],h=[10,12,9][index];const g=new Geometry();
  g.box(0,h/2,0,5.2,h,4.3,col).box(0,h+0.18,0,5.8,0.4,4.9,C.cream);
  g.box(0,0.3,2.6,5.8,0.5,1,C.terracotta);
  for(let floor=0;floor<3;floor++) {
    const y=2+floor*3.1;
    for(let side=-1;side<=1;side+=2) {
      const x=side*1.35;g.box(x,y,2.19,1.3,1.7,0.16,C.cream).box(x,y,2.30,1.05,1.4,0.12,C.dark);
      g.box(x,y-0.96,2.7,2,0.18,1.05,C.cream).box(x,y-0.25,3.15,2,0.12,0.12,C.dark);
      for(let k=0;k<5;k++)g.box(x-0.85+k*0.42,y-0.58,3.15,0.06,0.7,0.06,C.dark);
    }
    plant(g,2,y-0.83,2.72);
  }
  // Roof water tank, aerial, clothesline with sari/towel silhouettes.
  g.lathe([[0,0],[0.75,0],[0.75,1.5],[0,1.5]],C.dark,12,1.2,h+0.4,-0.5);
  g.box(-1.4,h+1,0,0.08,1.6,0.08,C.dark).box(-0.5,h+1,0,1.8,0.05,0.05,C.dark);
  g.box(0,h+0.9,1.8,4.6,0.05,0.05,C.cream);
  for(let k=0;k<4;k++)g.box(-1.8+k*1.1,h+0.35,1.8,0.65,1,0.07,[C.pink,C.blue,C.white,C.teal][k]);
  if(index===0){g.box(-1.35,4.7,2.9,1.6,0.12,0.7,C.terracotta).box(-1.35,4.83,2.9,0.9,0.12,0.5,C.cream).box(-1.35,4.91,2.9,0.04,0.04,0.5,C.pink);}
  if(index===1){g.box(1.1,0.9,3,0.8,0.15,0.8,C.terracotta).box(1.1,1.5,2.7,0.8,1,0.12,C.terracotta);g.lathe([[0,0],[0.25,0],[0.35,0.6],[0,0.6]],C.gold,10,1.6,1.2,3.1);}
  if(index===2){g.lathe([[0,0],[0.8,0],[0.8,0.12],[0,0.12]],C.steel,12,1.4,1,3);g.sphere(1.5,1.8,3.2,0.24,C.skin,8,5).box(1.5,1.2,3.2,0.45,0.8,0.35,C.teal);}
  g.build(root,'Balconies, railings, saris, tulsi and tank',mat);
  const door=new Geometry().box(0,1,0,1.2,2,0.15,C.dark).sphere(0.4,1,0.13,0.08,C.gold,6,4).build(root,'Opening front door',mat);
  door.getTransform().setLocalPosition(new vec3(0,0,2.3));
  const window=new Geometry().box(0,0,0,0.92,1.25,0.10,C.light).build(root,'Warm window',mat);
  window.getTransform().setLocalPosition(new vec3(-1.35,5.1,2.40));window.enabled=false;
  const resident=obj(root,'Tiny resident',new vec3(0,0.5,3.4));
  new Geometry().sphere(0,1.4,0,0.35,C.skin).lathe([[0,0],[0.44,0],[0.3,1],[0,1]],index===0?C.blue:index===1?C.white:C.pink,10).box(-0.18,-0.22,0,0.17,0.5,0.18,C.dark).box(0.18,-0.22,0,0.17,0.5,0.18,C.dark).build(resident,'Kurta and face',mat);
  new Geometry().box(0.56,0.8,0,0.55,0.15,0.16,C.skin).build(resident,'Waving arm',mat);
  const accent=new Geometry().box(0,0.62,3.3,5.6,0.13,0.18,C.light).box(-2.7,1,2.7,0.12,0.8,0.12,C.light).box(2.7,1,2.7,0.12,0.8,0.12,C.light).build(root,'Doorstep invitation glow',mat);
  accent.enabled=false;
  return {root,door,resident,window,accent};
}
