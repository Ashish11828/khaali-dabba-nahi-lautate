// Sample-free CLAD synthesis. Regenerate with the installed Node binary.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../../..');
const PROJECT_ASSETS_SFX = ROOT + '/Assets/GeneratedSFX';
const BASE='C:/Users/Admin/.codex/plugins/cache/ls-extensions/ls-clad/local/skills/';
const a=require(BASE+'build-sfx/tools'), m=require(BASE+'build-music/tools');
fs.mkdirSync(PROJECT_ASSETS_SFX,{recursive:true});
const sr=a.SAMPLE_RATE, p=a.sfx_presets;
function stereo(seconds){return {left:new Float32Array(Math.ceil(sr*seconds)),right:new Float32Array(Math.ceil(sr*seconds))};}
function layer(dst,src,t,g){a.addInto(dst.left,src.left||src,Math.round(t*sr),g);a.addInto(dst.right,src.right||src,Math.round(t*sr),g);}
function finish(name,b,ceiling=.88){
 b=a.mix_bus.applyFx(b,{hpf:90});
 for(const c of b.left?[b.left,b.right]:[b]) {a.fadeIn(c,.003);a.fadeOut(c,.025);}
 a.mix_bus.masterChain(b,{normalize:'peak',peakCeiling:ceiling});
 a.WavBuilder.write(b,path.join(PROJECT_ASSETS_SFX,name+'.wav'));
}
const lid=stereo(1.8);layer(lid,p.impact({material:'metal',size:.32}),0,.7);layer(lid,p.impact({material:'metal',size:.17}),.13,.27);finish('dabba_lid_clink',lid);
const pick=stereo(.9);layer(pick,p.uiPop({pitch:-5}),0,.6);layer(pick,p.uiHover({pitch:3}),.06,.16);finish('laddoo_pickup',pick,.8);
const reveal=stereo(5.5);layer(reveal,p.whoosh({duration:2.1,size:.5,direction:'up'}),0,.22);layer(reveal,p.sparkle({duration:3.8}),.6,.36);layer(reveal,p.magicChime(),1.6,.5);for(const c of [reveal.left,reveal.right])a.humanize.ampWobble(c,.38,.06);finish('neighborhood_reveal',reveal);
const end=stereo(4.5);layer(end,p.uiSuccess(),0,.7);layer(end,p.sparkle({duration:2.8}),.4,.16);finish('warm_ending_chime',end);
const ambient=stereo(24);layer(ambient,a.granular.roomTone(24),0,.4);layer(ambient,a.granular.crowdMurmur(24,.2),0,.09);
for(let i=0;i<9;i++)layer(ambient,p.impact({material:'metal',size:.08}),1.5+i*2.5+Math.random()*.4,.012);
for(const c of [ambient.left,ambient.right]){a.humanize.ampWobble(c,.17,.2);a.fadeIn(c,1.1);a.fadeOut(c,1.3);}finish('courtyard_utensils_ambience',ambient,.34);
const genre='folk', bpm=m.suggestTempo(genre), {chords,meta}=m.composeChords({genre,voice:'pluckString',scale:'pentatonicMajor',extension:'none'});
console.log('composition',JSON.stringify(meta),'bpm',bpm);
const bars=8, arrangement=m.arrangement.arrangement8();
const comp=m.chordEvents(chords,{voice:'pluckString',bars,velocity:63,stagger:.16});
const melody=m.composeMelody({chords,bars,notesPerBar:3,contour:'arch',scale:meta.scale,scaleRoot:meta.key,octaveShift:1,restProbability:.36});
const bed=m.render([
 m.track('warm_plucks','pluckString',m.mask(comp,arrangement.full,bars,4),{fx:{hpf:180,lpf:3800,reverb:'smallRoom',gain:.42}}),
 m.track('courtyard_bells','bell',m.mask(melody,arrangement.b,bars,4),{fx:{hpf:650,lpf:5200,reverb:'mediumRoom',gain:.12}})
],{bpm,duration:27,master:{normalize:'peak',glue:true,width:1.08}});
for(const c of [bed.left,bed.right]){a.fadeIn(c,1);a.fadeOut(c,3.5);}finish('warm_plucked_neighborhood_bed',bed,.78);
const report=[];
for(const file of fs.readdirSync(PROJECT_ASSETS_SFX).filter(x=>x.endsWith('.wav'))){
 const b=fs.readFileSync(path.join(PROJECT_ASSETS_SFX,file));let off=12,data,fmt;
 while(off+8<=b.length){const id=b.toString('ascii',off,off+4),size=b.readUInt32LE(off+4);if(id==='fmt ')fmt=off+8;if(id==='data'){data={start:off+8,size};break;}off+=8+size+(size%2);}
 const channels=b.readUInt16LE(fmt+2),rate=b.readUInt32LE(fmt+4),bits=b.readUInt16LE(fmt+14);let peak=0,sum=0,count=0;
 for(let i=data.start;i<data.start+data.size;i+=2){const v=b.readInt16LE(i)/32768;peak=Math.max(peak,Math.abs(v));sum+=v*v;count++;}
 report.push({file,seconds:+(data.size/(rate*channels*bits/8)).toFixed(3),channels,rate,bits,peakDb:+(20*Math.log10(peak)).toFixed(2),rmsDb:+(20*Math.log10(Math.sqrt(sum/count))).toFixed(2),bytes:b.length});
}
fs.writeFileSync(path.join(PROJECT_ASSETS_SFX,'audio_verification.json'),JSON.stringify({tool:'PCM16 direct scan; ffmpeg unavailable (VERIFY_TOOL_MISSING)',voices:'No installed Hindi voice. System.Speech enumeration failed; registry contains English GB/US/India voices only.',composition:{meta,bpm},files:report},null,2));console.log(JSON.stringify(report,null,2));
