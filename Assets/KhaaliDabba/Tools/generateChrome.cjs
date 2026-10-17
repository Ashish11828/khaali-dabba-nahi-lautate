const fs=require('fs'),path=require('path');
const template='C:/Program Files/Snap Inc/Lens Studio/JsPlugins/PresetsRegistry/Assets/CodeNodeMaterial/Resources/codeNode.graphShader';
const code=`input_texture_2d baseTexture;
input_vec4 colorInput1;
output_vec4 result;

void main() {
  vec3 n=normalize(system.getSurfaceNormalCameraSpace());
  vec3 v=normalize(-system.getSurfacePositionCameraSpace());
  vec3 r=reflect(-v,n);
  vec3 p=system.getSurfacePositionObjectSpace();
  float sky=smoothstep(-0.22,0.32,r.y);
  vec3 metal=mix(vec3(0.22,0.27,0.32),vec3(0.72,0.79,0.85),sky);
  float horizon=exp(-pow((r.y-0.08)*11.0,2.0));
  metal=mix(metal,vec3(0.10,0.14,0.19),horizon*0.60);
  float softbox=pow(max(0.0,dot(r,normalize(vec3(-0.65,0.6,0.4)))),24.0);
  float warmbox=pow(max(0.0,dot(r,normalize(vec3(0.8,0.3,0.3)))),38.0);
  float edge=pow(1.0-clamp(abs(dot(n,v)),0.0,1.0),3.0);
  float brush=sin(p.y*154.0+sin(p.x*15.0)*0.4)*0.008;
  metal+=vec3(0.65,0.67,0.68)*softbox+vec3(0.35,0.27,0.14)*warmbox;
  metal+=vec3(0.22,0.25,0.28)*edge+brush;
  result=vec4(clamp(metal,0.16,1.0),1.0);
}`;
let yaml=fs.readFileSync(template,'utf8');
yaml=yaml.replace(/(        Code:\r?\n          ClassType1: TEXT\r?\n          String: \|-\r?\n)[\s\S]*?(        CustomCodeNodeAsset:)/,'$1'+code.split('\n').map(x=>'            '+x).join('\n')+'\n$2');
fs.writeFileSync(path.resolve(__dirname,'../Materials/DabbaChrome 2.graphShader'),yaml);
console.log('Generated brushed steel shader from installed Lens Studio code-node template');
