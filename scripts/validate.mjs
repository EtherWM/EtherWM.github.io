import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ctx={window:{}};vm.createContext(ctx);
for(const name of ['content.js','assets/frame-data.js','assets/curve-data.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),ctx);
const {ETHER_CONTENT:C,ETHER_FRAMES:F,ETHER_CURVES:curves}=ctx.window;
let checked=0;const errors=[];
function checkPath(relative){
  if(!relative||relative.startsWith('#'))return;
  if(/^(https?:|data:|mailto:)/.test(relative)){errors.push('Remote dependency or link: '+relative);return;}
  if(!fs.existsSync(path.join(root,relative.split('#')[0])))errors.push('Missing: '+relative);else checked++;
}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g))checkPath(match[1]);
for(const [key,config] of Object.entries(C.experiments)){
  for(const [id] of config.models){
    const frames=F[key]?.[id];
    if(!frames?.length&&!C.videos[key]?.[id]){errors.push(`No media: ${key}/${id}`);continue;}
    let previous=-1;
    for(const frame of frames||[]){checkPath(frame.src);if(frame.t<previous||frame.t>config.duration)errors.push('Frame timing: '+key+'/'+id);previous=frame.t;}
    const video=C.videos[key]?.[id];checkPath(video);if(video)checkPath(video.replace(/\.mp4$/,'.webp'));
    if(video&&config.charts&&config.alignment!=='progress')errors.push('Unverified video-to-curve timing needs a visible preview alignment label: '+key);
  }
  if(config.charts){
    for(const metric of (config.chartMetrics||['psnr','ssim']))for(const [id,data] of Object.entries(curves[key][metric])){
      if(!config.models.some(x=>x[0]===id))errors.push('Unknown curve model: '+id);
      let previous=-1;
      for(const [t,v] of data){if(t<previous||!Number.isFinite(v)||t>config.duration)errors.push('Curve timing/value: '+key);previous=t;}
    }
  }
}
if(Object.keys(curves.transfer.psnr).join(',')!=='scene1,scene2')errors.push('Transfer PSNR must contain only the two original scene-action pairs.');
checkPath(C.teaserVideo);
if(C.heroClips.length!==2||C.heroClips.some(clip=>!clip.src))errors.push('Expected two playable hero videos with no placeholder slot.');
for(const clip of C.heroClips){checkPath(clip.src);checkPath(clip.poster);if(!(clip.duration>0))errors.push('Missing hero preview duration: '+clip.id);}
if(C.experiments.ablation.variants?.join(',')!=='both,memory,motion')errors.push('Expected three selectable ablation variants.');
if(/id="(?:show-table|show-ablation|ablation-storyboard)"/.test(html))errors.push('Removed ablation controls remain.');
for(const [key,gallery] of Object.entries(C.galleries||{})){
  if(!html.includes(`id="player-${key}"`))errors.push('Missing gallery container: '+key);
  for(const clip of gallery.clips){for(const id of ['gt','ours']){const video=clip.videos?.[id];if(!video)errors.push('Missing paired video: '+clip.id+'/'+id);else{checkPath(video);checkPath(video.replace(/\.mp4$/,'.webp'));}}if(!(clip.duration>0))errors.push('Invalid clip duration: '+clip.id);}
}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/videos/manifest.json'),'utf8'));
for(const clip of manifest){if(clip.codec!=='h264'||!clip.frames||clip.hasAudio||!clip.crop)errors.push('Unexpected video encoding/crop: '+clip.file);}
if(new Set(manifest.map(clip=>clip.source)).size!==13)errors.push('Expected all thirteen supplied sources.');
const memory=manifest.find(m=>C.videos.ablation.memory.endsWith('/'+m.file));
if(memory?.sourceLabel!=='Original inference'||memory?.postprocessed!==false||!memory?.identityConfirmedBy)errors.push('Without memory must use the confirmed original inference pane.');
for(const key of ['transfer','wipe']){
  if(C.experiments[key].layout!=='transfer'||C.experiments[key].charts)errors.push('Expected source-to-prediction layout without curves: '+key);
}
if(C.videos.transfer.scene1!=='assets/videos/fold-scene1-gt.mp4'||C.videos.transfer.scene2!=='assets/videos/fold-scene2-gt.mp4')errors.push('Folding source videos must be GT, not predictions.');
const sections=[...html.matchAll(/<section id="([^"]+)"/g)].map(m=>m[1]);
if(sections.slice(-3).join(',')!=='ablation,benchmark,citation')errors.push('Expected Ablations, RoboTwin, Citation as the final chapters.');
if(/Labels pending|player-extras-long|RoboTwin video comparisons/.test(html+fs.readFileSync(path.join(root,'app.js'),'utf8')))errors.push('Outdated composite-video UI remains.');
const ours=C.benchmark.rows.find(x=>x[0]==='EtherWM');
const wins=C.benchmark.headers.filter((_,i)=>ours[i+1]===Math.max(...C.benchmark.rows.map(x=>x[i+1]))).length;
if(wins!==5)errors.push('WorldArena best-score count differs from five.');
if(C.ablation.rows.length!==4)errors.push('Expected all four paper ablation rows.');
if(!curves.droid.illustrative)errors.push('DROID illustrative source label must remain until measured logs replace it.');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log(`PASS: ${checked} local references; ${Object.keys(C.experiments).length} experiment groups; four paired everyday cases; thirteen supplied sources; cropped H.264 assets; confirmed memory inference; GT transfer sources; chapter order; complete ablation table. No remote page dependencies.`);
