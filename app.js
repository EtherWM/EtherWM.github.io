/* Offline EtherWM supplementary. No frameworks, CDN requests, or remote fonts. */
(() => {
'use strict';
const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
const C=window.ETHER_CONTENT,F=window.ETHER_FRAMES,CURVES=window.ETHER_CURVES;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const colors={gt:'#899ca8',oscar:'#dc857e',ours:'#439fc6',ctrl:'#aa89ce',mini:'#c6a255',scene1:'#899ca8',scene2:'#aa89ce',exchange:'#439fc6',memory:'#cfaa70',motion:'#aa89ce',both:'#dc857e',source:'#aa89ce',scene:'#899ca8'};
const icon=name=>`<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const time=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;
const nearest=(frames,t)=>frames.reduce((a,b)=>Math.abs(a.t-t)<=Math.abs(b.t-t)?a:b);
let toastTimer;
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3200);}
function sample(data,t){if(!data?.length)return null;if(t<=data[0][0])return data[0][1];for(let i=1;i<data.length;i++)if(t<=data[i][0]){const a=data[i-1],b=data[i];return a[1]+(b[1]-a[1])*(t-a[0])/(b[0]-a[0]);}return data[data.length-1][1];}
function setSound(button,muted,label){$('use',button).setAttribute('href',muted?'#i-muted':'#i-volume');button.setAttribute('aria-pressed',String(!muted));button.setAttribute('aria-label',`${muted?'Unmute':'Mute'} ${label}`);button.title=`${muted?'Unmute':'Mute'} ${label}`;}
function setPlayback(button,paused,label){$('use',button).setAttribute('href',paused?'#i-play':'#i-pause');button.setAttribute('aria-label',`${paused?'Play':'Pause'} ${label}`);button.title=`${paused?'Play':'Pause'} ${label}`;button.setAttribute('aria-pressed',String(paused));}

// Theme
function theme(value){document.documentElement.dataset.theme=value;$('.theme-toggle use').setAttribute('href',value==='dark'?'#i-sun':'#i-moon');$('.theme-toggle').setAttribute('aria-label',`Switch to ${value==='dark'?'light':'dark'} theme`);try{localStorage.setItem('etherwm-theme',value);}catch{}}
try{theme(localStorage.getItem('etherwm-theme')||'light');}catch{theme('light');}
$('.theme-toggle').addEventListener('click',()=>theme(document.documentElement.dataset.theme==='light'?'dark':'light'));

// Resource popover: a quiet, local placeholder for every future public resource.
const popover=$('#resource-popover');let resourceTrigger=null,resourceTimer;
function closeResource(){clearTimeout(resourceTimer);popover.hidden=true;if(resourceTrigger)resourceTrigger.setAttribute('aria-expanded','false');resourceTrigger=null;}
$$('[data-resource]').forEach(button=>{
  if(C.resources[button.dataset.resource])$('.todo',button).hidden=true;
  button.addEventListener('click',()=>{
    const name=button.dataset.resource,url=C.resources[name];
    if(url){window.open(url,'_blank','noopener');return;}
    if(resourceTrigger===button){closeResource();return;}
    closeResource();resourceTrigger=button;button.setAttribute('aria-expanded','true');$('#resource-popover-name').textContent=name==='Paper'?'arXiv Paper':name;popover.hidden=false;resourceTimer=setTimeout(closeResource,1000);
  });
});
document.addEventListener('click',e=>{if(!e.target.closest('.resource-links'))closeResource();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeResource();});

// Full-resolution figures.
const dialog=$('#figure-dialog'),figNames={intro:'Figure 1 · EtherWM overview',method:'Figure 2 · Motion-guided flow correction','long-horizon':'110-second comparison',droid:'DROID comparison · Curves include illustrative adjustments',transfer:'Cross-action transfer',ablation:'AgiBot component ablations',wipe:'Figure 7 · Cross-episode action transfer'};
$$('[data-figure]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.figure;$('#figure-large').src=`assets/figures/${key}.webp`;$('#figure-large').alt=figNames[key];$('#figure-title').textContent=figNames[key];dialog.showModal();}));
$('#close-figure').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});

// Fixed-size teaser / Figure 1 tabs. The toolbar's three grid columns never move.
const teaser=$('#teaser-video'),teaserMute=$('#teaser-mute'),teaserPlay=$('#teaser-play');
teaserMute.hidden=false;
function overviewTab(name){for(const key of ['video','figure']){const active=key===name;$('#tab-'+key).setAttribute('aria-selected',String(active));$('#tab-'+key).tabIndex=active?0:-1;$('#'+key+'-panel').hidden=!active;}teaserMute.classList.toggle('inactive',name==='figure');teaserMute.disabled=name==='figure';if(name==='figure')teaser.pause();}
for(const name of ['video','figure']){const button=$('#tab-'+name);button.addEventListener('click',()=>overviewTab(name));button.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'video':e.key==='End'?'figure':name==='video'?'figure':'video';overviewTab(next);$('#tab-'+next).focus();}});}
if(C.teaserVideo){teaser.src=C.teaserVideo;teaser.hidden=false;$('#teaser-placeholder').hidden=true;teaser.addEventListener('error',()=>{teaser.hidden=true;$('#teaser-placeholder').hidden=false;toast('Teaser unavailable. Showing its poster.');});}
teaserMute.addEventListener('click',()=>{if(teaser.muted||teaser.volume===0){if(teaser.volume===0)teaser.volume=1;teaser.muted=false;}else teaser.muted=true;});
teaser.addEventListener('volumechange',()=>setSound(teaserMute,teaser.muted||teaser.volume===0,'teaser'));
function updateTeaserPlay(){
  teaserPlay.hidden=!C.teaserVideo||teaser.hidden||!!teaser.error||!teaser.paused;
  const label=teaser.ended?'Replay teaser':'Play teaser';teaserPlay.setAttribute('aria-label',label);teaserPlay.title=label;
}
for(const event of ['loadedmetadata','play','pause','ended','error'])teaser.addEventListener(event,updateTeaserPlay);
teaserPlay.addEventListener('click',()=>{
  if(teaser.ended)teaser.currentTime=0;
  teaser.play().catch(error=>{if(error.name!=='AbortError'){updateTeaserPlay();toast('Unable to play the teaser. Please try again.');}});
});
updateTeaserPlay();


// Two video buffers keep the hero playlist moving without a timed end hold.
const heroSection=$('#home'),heroControl=$('#hero-control'),heroStill=$('.hero-still'),heroVideos=[$('#hero-video'),$('#hero-buffer')],heroClips=C.heroClips;
const heroRange=$('#hero-range'),heroTime=$('#hero-time'),heroTimeline=$('#hero-timeline'),heroPanel=$('#hero-scrub-panel');
let hero=null,heroIndex=0,heroPaused=reduced,heroReady=false,heroVisible=true,heroRaf=0,heroElapsed=0,heroLast=0,heroGeneration=0,heroSpeed=C.heroPlaybackRate||8,heroScrubbing=false,heroPopoverPinned=false;
function stopHero(){cancelAnimationFrame(heroRaf);heroRaf=0;heroVideos.forEach(v=>v.pause());}
function renderHeroTimeline(){
  const duration=hero&&Number.isFinite(hero.duration)?hero.duration:heroClips[heroIndex].duration,current=hero?hero.currentTime:heroElapsed;
  $('#hero-time-value').textContent=hero?`${Math.floor(current||0)}s / ${Number(duration.toFixed(1))}s`:'Preview';
  heroRange.max=duration;heroRange.value=current;heroRange.disabled=!hero;heroRange.style.setProperty('--progress',`${Math.min(100,current/duration*100)}%`);
  heroRange.setAttribute('aria-valuetext',hero?`${(current||0).toFixed(1)} of ${duration.toFixed(1)} seconds`:'Still preview; video pending');$('#hero-speed').textContent=`${heroSpeed}×`;
}
function prepareHeroVideo(video,clip){
  if(video.dataset.clip!==clip.id||video.error){video.pause();video.dataset.clip=clip.id;video.poster=clip.poster;video.src=clip.src;video.load();}
}
function preloadHero(){
  for(let step=1;step<heroClips.length;step++){
    const next=heroClips[(heroIndex+step)%heroClips.length];if(!next.src)continue;
    if(!heroVideos.some(v=>v.dataset.clip===next.id))prepareHeroVideo(heroVideos.find(v=>v!==hero),next);
    break;
  }
}
function selectHero(index){
  stopHero();heroGeneration++;heroIndex=(index+heroClips.length)%heroClips.length;heroElapsed=0;
  const clip=heroClips[heroIndex];heroSection.dataset.clip=clip.id;heroStill.src=clip.poster;heroStill.alt=`EtherWM ${clip.title}${clip.src?' poster':' paper preview'}`;
  heroVideos.forEach(v=>v.hidden=true);heroStill.hidden=false;heroReady=false;
  hero=clip.src?(heroVideos.find(v=>v.dataset.clip===clip.id)||heroVideos[0]):null;
  if(hero){prepareHeroVideo(hero,clip);if(hero.readyState>=1)hero.currentTime=0;heroReady=hero.readyState>=2;hero.hidden=!heroReady;heroStill.hidden=heroReady;hero.setAttribute('aria-label',`EtherWM ${clip.title} background rollout`);}
  preloadHero();updateHero();
}
function tickHero(now){
  if(heroPaused||heroScrubbing||!heroVisible||document.hidden)return;
  if(!hero){heroElapsed+=Math.min((now-heroLast)/1000,.2)*heroSpeed;if(heroElapsed>=heroClips[heroIndex].duration){selectHero(heroIndex+1);return;}}
  heroLast=now;renderHeroTimeline();heroRaf=requestAnimationFrame(tickHero);
}
function updateHero(){
  const inactive=heroPaused||heroScrubbing||!heroVisible||document.hidden;
  heroSection.dataset.paused=String(inactive);setPlayback(heroControl,heroPaused,hero?'background video':'background preview');
  cancelAnimationFrame(heroRaf);heroRaf=0;if(hero)hero.playbackRate=heroSpeed;renderHeroTimeline();
  if(inactive){heroVideos.forEach(v=>v.pause());return;}
  if(hero?.ended){selectHero(heroIndex+1);return;}
  if(hero&&heroReady){const active=hero,generation=heroGeneration;hero.playbackRate=heroSpeed;hero.play().catch(error=>{if(error.name!=='AbortError'&&generation===heroGeneration&&hero===active){heroPaused=true;updateHero();}});}
  heroLast=performance.now();heroRaf=requestAnimationFrame(tickHero);
}
heroVideos.forEach(video=>{
  const ready=()=>{if(video!==hero||video.readyState<2)return;heroReady=true;video.hidden=false;heroStill.hidden=true;updateHero();};
  for(const event of ['loadeddata','canplay','seeked'])video.addEventListener(event,ready);
  video.addEventListener('ended',()=>{if(video===hero&&!heroScrubbing&&!heroPaused)selectHero(heroIndex+1);});
  video.addEventListener('error',()=>{if(video!==hero)return;video.hidden=true;hero=null;heroReady=false;heroStill.hidden=false;heroElapsed=0;updateHero();});
});
new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;updateHero();},{threshold:0}).observe(heroSection);
heroControl.addEventListener('click',()=>{heroPaused=!heroPaused;updateHero();});
$('#hero-next').addEventListener('click',()=>selectHero(heroIndex+1));
function showHeroPanel(open){heroPanel.hidden=!open;heroTime.setAttribute('aria-expanded',String(open));}
heroTimeline.addEventListener('mouseenter',()=>showHeroPanel(true));
heroTimeline.addEventListener('mouseleave',()=>{if(!heroPopoverPinned&&!heroScrubbing)showHeroPanel(false);});
heroTimeline.addEventListener('focusin',()=>showHeroPanel(true));
heroTimeline.addEventListener('focusout',e=>{if(!heroTimeline.contains(e.relatedTarget)){heroPopoverPinned=false;showHeroPanel(false);}});
heroTime.addEventListener('click',()=>{heroPopoverPinned=!heroPopoverPinned;showHeroPanel(heroPopoverPinned||heroTimeline.matches(':hover'));});
document.addEventListener('pointerdown',e=>{if(!heroTimeline.contains(e.target)){heroPopoverPinned=false;showHeroPanel(false);}});
heroTimeline.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();heroPopoverPinned=false;heroTime.focus();showHeroPanel(false);}});
heroRange.addEventListener('pointerdown',()=>{heroScrubbing=true;updateHero();});
document.addEventListener('pointerup',()=>{if(heroScrubbing){heroScrubbing=false;updateHero();}});
document.addEventListener('pointercancel',()=>{if(heroScrubbing){heroScrubbing=false;updateHero();}});
heroRange.addEventListener('input',()=>{if(hero){hero.currentTime=Math.min(+heroRange.value,hero.duration);renderHeroTimeline();}});
$('#hero-speed').addEventListener('click',()=>{const speeds=[1,2,4,8,16];heroSpeed=speeds[(speeds.indexOf(heroSpeed)+1)%speeds.length];updateHero();});
selectHero(0);

// Method animation: user pause, reduced motion, and off-screen suspension.
const loop=$('#method-loop'),loopControl=$('#method-play');let loopPaused=reduced,loopVisible=false;
function updateLoop(){loop.classList.toggle('paused',loopPaused||!loopVisible||document.hidden);setPlayback(loopControl,loopPaused,'method animation');}
loopControl.addEventListener('click',()=>{loopPaused=!loopPaused;updateLoop();});
const loopObserver=new IntersectionObserver(entries=>{loopVisible=entries[0].isIntersecting;updateLoop();},{threshold:0.05});loopObserver.observe(loop);updateLoop();

class Experiment{
  constructor(key){
    this.key=key;this.config=C.experiments[key];this.root=$('#player-'+key);this.duration=this.config.duration;this.t=0;this.playing=false;this.speed=8;this.userPaused=false;this.visibility=0;this.muted=true;this.cards=[];this.raf=0;this.last=0;this.holdStarted=0;
    const cfg=this.config,stamps=cfg.timestamps||[0,this.duration],clock=cfg.clock==='video'?'video':'paper';
    this.root.innerHTML=`<div class="experiment-head"><h3 class="${cfg.layout==='transfer'?'sr-only':''}">${esc(cfg.title)}</h3></div>${cfg.description?`<p class="experiment-description">${esc(cfg.description)}</p>`:''}<div class="experiment-layout ${cfg.charts?'':'no-charts'}"><div class="video-grid count-${cfg.models.length}"></div>${cfg.charts?'<aside class="charts" aria-label="Synchronized quality curves"></aside>':''}</div><div class="sync-controls"><button class="play-button" aria-label="Play ${esc(cfg.title)}">${icon('play')}<span class="play-text">Play</span></button><div class="timeline-column"><input class="main-range" type="range" min="0" max="${this.duration}" value="0" step="0.1" aria-label="${esc(cfg.title)} ${clock} timeline"><div class="timeline-stamps" aria-label="${esc(cfg.title)} ${clock} timestamps">${stamps.map(t=>`<button data-time="${t}" style="--at:${t/this.duration*100}%" aria-label="Jump to ${clock} time ${t} seconds in ${esc(cfg.title)}">${t} s</button>`).join('')}</div></div><span class="time-label">00:00 / ${time(this.duration)}</span><select class="speed-select" aria-label="${esc(cfg.title)} playback speed"><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option><option value="8" selected>8×</option><option value="16">16×</option></select><button class="icon-button group-mute" ${cfg.hasAudio?'':'hidden'} aria-label="Unmute ${esc(cfg.title)}" title="Unmute" aria-pressed="false">${icon('muted')}</button></div>`;
    if(cfg.layout==='transfer'){this.root.classList.add('transfer-experiment');const grid=$('.video-grid',this.root);grid.className='video-grid transfer-comparison';grid.innerHTML='<div class="transfer-primary" aria-label="Action source plus scene source produces EtherWM prediction"></div>'+(cfg.models.length>3?'<div class="transfer-baselines" aria-label="Baseline predictions"></div>':'');}
    if(cfg.variants){
      this.root.classList.add('ablation-switch');$('.experiment-layout',this.root).classList.add('ablation-switch-layout');$('.video-grid',this.root).className='video-grid ablation-video-grid';
      const sidebar=document.createElement('div');sidebar.className='ablation-tabs';sidebar.setAttribute('role','tablist');sidebar.setAttribute('aria-label','Ablated component');
      sidebar.innerHTML=cfg.variants.map((id,i)=>`<button class="ablation-tab" id="ablation-tab-${id}" role="tab" aria-controls="ablation-panel-${id}" aria-selected="${i===0}" tabindex="${i===0?0:-1}" data-variant="${id}" style="--variant-color:${colors[id]}"><i></i><span>${esc(cfg.models.find(m=>m[0]===id)[1])}</span></button>`).join('');$('.experiment-layout',this.root).append(sidebar);
      const narrow=matchMedia('(max-width:700px)'),orientation=()=>sidebar.setAttribute('aria-orientation',narrow.matches?'horizontal':'vertical');narrow.addEventListener('change',orientation);orientation();
    }
    for(const[id,label]of cfg.models){
      const src=C.videos[key]?.[id],paperFrames=F[key]?.[id],frames=paperFrames||[{t:0,src:src.replace(/\.mp4$/,'.webp')}],el=document.createElement('div'),ours=['ours','exchange'].includes(id);el.className='video-card';el.dataset.model=id;el.style.setProperty('--model-color',colors[id]);
      el.innerHTML=`<div class="model-heading"><i class="model-dot"></i><span>${esc(label)}${ours?' <span class="ours-label">(Ours)</span>':''}</span></div><div class="frame-stage"><img src="${frames[0].src}" alt="${esc(label)} paper keyframe at 0 seconds" loading="lazy"><video muted playsinline preload="metadata" hidden aria-label="${esc(label)} rollout"></video><span class="still-label">0 s</span></div><input class="media-range" type="range" min="0" max="${this.duration}" value="0" step="0.1" aria-label="${esc(cfg.title)} ${esc(label)} timeline"><div class="frame-foot"><span>00:00</span><span>${time(this.duration)}</span></div>`;
      if(cfg.layout==='transfer'){const order=cfg.models.findIndex(m=>m[0]===id);if(order===1||order===2)el.insertAdjacentHTML('afterbegin',`<span class="transfer-operator" aria-hidden="true">${icon(order===1?'plus':'arrow')}</span>`);}
      if(cfg.variants?.includes(id)){el.id=`ablation-panel-${id}`;el.setAttribute('role','tabpanel');el.setAttribute('aria-labelledby',`ablation-tab-${id}`);el.hidden=id!==cfg.variants[0];}
      $(cfg.layout==='transfer'?(cfg.models.findIndex(m=>m[0]===id)<3?'.transfer-primary':'.transfer-baselines'):'.video-grid',this.root).append(el);
      const c={id,label,el,frames,isPaper:!!paperFrames,image:$('img',el),video:$('video',el),range:$('input',el),badge:$('.still-label',el),clock:$('.frame-foot span',el),endClock:$('.frame-foot span:last-child',el),ready:false,frameSrc:frames[0].src};this.cards.push(c);c.image.alt=`${label} ${c.isPaper?'paper keyframe':'video preview'}`;c.range.addEventListener('input',()=>this.seek(+c.range.value));
      if(src){c.video.poster=src.replace(/\.mp4$/,'.webp');c.video.src=src;c.video.addEventListener('loadedmetadata',()=>{if(!Number.isFinite(c.video.duration)||c.video.duration<=0)return;c.ready=true;c.video.hidden=false;c.image.hidden=true;c.badge.hidden=true;c.endClock.textContent=time(c.video.duration);this.updateVideo(c,true);this.render();if(this.playing&&!c.el.hidden&&!this.holdStarted)c.video.play().catch(error=>{if(error.name!=='AbortError')this.pause();});});c.video.addEventListener('error',()=>{c.ready=false;c.video.hidden=true;c.image.hidden=false;c.badge.hidden=false;c.endClock.textContent=time(this.duration);this.render();toast(`${label}: showing ${c.isPaper?'paper frames':'a still preview'} while the video is unavailable.`);});}
    }
    this.mainRange=$('.main-range',this.root);this.playButton=$('.play-button',this.root);this.timeLabel=$('.time-label',this.root);
    this.playButton.addEventListener('click',()=>this.playing?this.pause(true):this.play(true));this.mainRange.addEventListener('input',()=>this.seek(+this.mainRange.value));
    $$('[data-time]',this.root).forEach(button=>button.addEventListener('click',()=>this.seek(+button.dataset.time)));
    $('.speed-select',this.root).addEventListener('change',e=>{this.speed=+e.target.value;this.cards.forEach(c=>this.updateVideo(c,false));});
    $('.group-mute',this.root).addEventListener('click',()=>{this.muted=!this.muted;this.cards.forEach(c=>c.video.muted=this.muted);setSound($('.group-mute',this.root),this.muted,cfg.title);});
    if(cfg.charts){this.createCharts();this.sizeObserver=new ResizeObserver(entries=>this.root.style.setProperty('--comparison-height',`${Math.ceil(entries[0].contentRect.height)}px`));this.sizeObserver.observe($('.video-grid',this.root));}
    if(cfg.variants){
      const tabs=$$('[data-variant]',this.root);
      tabs.forEach((button,i)=>{button.addEventListener('click',()=>this.selectVariant(button.dataset.variant));button.addEventListener('keydown',e=>{let next;if(['ArrowDown','ArrowRight'].includes(e.key))next=(i+1)%tabs.length;else if(['ArrowUp','ArrowLeft'].includes(e.key))next=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();this.selectVariant(tabs[next].dataset.variant);tabs[next].focus();});});
    }
    this.render();
  }
  activeCards(){return this.cards.filter(c=>!c.el.hidden);}
  selectVariant(id){
    if(!this.config.variants.includes(id))return;
    this.pause();
    for(const c of this.cards){if(this.config.variants.includes(c.id))c.el.hidden=c.id!==id;}
    $$('[data-variant]',this.root).forEach(button=>{const selected=button.dataset.variant===id;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
    this.seek(0);this.play(true);
  }
  updatePlay(){this.root.dataset.playback=this.playing?(this.holdStarted?'holding':'playing'):'paused';this.playButton.setAttribute('aria-label',`${this.playing?'Pause':'Play'} ${this.config.title}`);$('use',this.playButton).setAttribute('href',this.playing?'#i-pause':'#i-play');$('.play-text',this.playButton).textContent=this.playing?'Pause':'Play';}
  updateVideo(c,force){if(!c.ready||c.el.hidden)return;const target=this.t/this.duration*c.video.duration;c.video.playbackRate=Math.min(16,Math.max(.0625,this.speed*c.video.duration/this.duration));if(force||Math.abs(c.video.currentTime-target)>.24)c.video.currentTime=Math.min(c.video.duration,target);}
  seek(t){this.holdStarted=0;this.last=performance.now();this.updatePlay();this.t=Math.max(0,Math.min(this.duration,t));this.cards.forEach(c=>{this.updateVideo(c,true);if(c.ready&&!c.el.hidden&&this.playing&&this.t<this.duration)c.video.play().catch(error=>{if(error.name!=='AbortError')this.pause(true);});});this.render();}
  play(user=false){
    if(user)this.userPaused=false;if(this.playing)return;
    Object.values(players).forEach(p=>{if(p!==this)p.pause();});
    if(this.t>=this.duration)this.seek(0);this.playing=true;this.last=performance.now();this.updatePlay();
    this.cards.forEach(c=>{if(c.ready&&!c.el.hidden){this.updateVideo(c,true);c.video.play().catch(error=>{if(error.name!=='AbortError'){this.pause(true);toast('Video playback is unavailable. Use the timeline to inspect frames.');}});}});
    this.raf=requestAnimationFrame(now=>this.tick(now));
  }
  tick(now){
    if(!this.playing)return;
    if(this.holdStarted){
      // Hold the final frame and complete curves for real time, independent of speed.
      if(now-this.holdStarted>=(this.config.loopPauseMs??C.loopPauseMs??3000)){
        this.holdStarted=0;this.t=0;this.updatePlay();
        this.cards.forEach(c=>{if(c.ready&&!c.el.hidden){this.updateVideo(c,true);c.video.play().catch(error=>{if(error.name!=='AbortError')this.pause(true);});}});
        this.render();
      }
      this.last=now;if(this.playing)this.raf=requestAnimationFrame(t=>this.tick(t));return;
    }
    const leader=this.activeCards().find(c=>c.ready);
    if(leader&&!leader.video.seeking)this.t=leader.video.currentTime/leader.video.duration*this.duration;
    else if(!leader)this.t+=Math.min((now-this.last)/1000,.15)*this.speed;
    this.last=now;
    if(this.t>=this.duration-.02||leader?.video.ended){
      this.t=this.duration;this.holdStarted=now;
      this.cards.forEach(c=>{if(c.ready){c.video.pause();this.updateVideo(c,true);}});this.updatePlay();
    }else this.cards.forEach(c=>{if(c!==leader)this.updateVideo(c,false);});
    this.render();if(this.playing)this.raf=requestAnimationFrame(t=>this.tick(t));
  }
  pause(user=false){if(user)this.userPaused=true;this.playing=false;this.holdStarted=0;cancelAnimationFrame(this.raf);this.cards.forEach(c=>c.video.pause());if(this.playButton)this.updatePlay();}
  render(){for(const c of this.activeCards()){c.range.value=this.t;c.clock.textContent=time(c.ready?this.t/this.duration*c.video.duration:this.t);if(!c.ready){const frame=nearest(c.frames,this.t);if(frame.src!==c.frameSrc){c.image.src=frame.src;c.frameSrc=frame.src;c.image.alt=`${c.label} paper keyframe at ${frame.t} seconds`;}c.badge.textContent=c.isPaper?`Paper · ${frame.paperT??frame.t} s`:'Still preview';}}this.mainRange.value=this.t;this.mainRange.style.setProperty('--progress',`${this.t/this.duration*100}%`);this.timeLabel.textContent=`${time(this.t)} / ${time(this.duration)}`;if(this.config.charts)this.renderCharts();}
  createCharts(){
    this.chartHandles=[];const aside=$('.charts',this.root),data=CURVES[this.key];aside.classList.toggle('single-chart',(this.config.chartMetrics||[]).length===1);
    for(const metric of (this.config.chartMetrics||['psnr','ssim'])){
      const box=document.createElement('div');box.className='chart-box';aside.append(box);
      const chart={box,metric,data:data[metric]};this.chartHandles.push(chart);
    }
    const legend=document.createElement('div');legend.className='chart-legend';
    legend.innerHTML=this.config.models.filter(([id])=>this.chartHandles.some(chart=>Object.hasOwn(chart.data,id))).map(([id,label])=>`<span style="--model-color:${colors[id]}"><i></i>${esc(label)}${id==='ours'?' (Ours)':''}</span>`).join('');aside.append(legend);
    // Plot in the container's real pixel coordinates. Text and circles never stretch.
    this.plotObserver=new ResizeObserver(entries=>{
      for(const entry of entries){const chart=this.chartHandles.find(c=>c.box===entry.target);if(entry.contentRect.width>0&&entry.contentRect.height>0)this.drawChart(chart,entry.contentRect.width,entry.contentRect.height);}
      this.renderCharts();
    });this.chartHandles.forEach(chart=>this.plotObserver.observe(chart.box));
  }
  drawChart(chart,width,height){
    const {metric,box,data}=chart,source=CURVES[this.key];
    const W=Math.round(width),H=Math.round(height),L=39,R=W-13,T=33,B=Math.max(T+25,H-27);
    const axes=source.axes?.[metric],min=axes?.min??(metric==='psnr'?10:.3),max=axes?.max??(metric==='psnr'?40:1),ticks=axes?.ticks??(metric==='psnr'?[10,25,40]:[.4,.7,1]);
    const mapX=t=>L+(R-L)*t/this.duration,mapY=v=>B-(v-min)/(max-min)*(B-T),clip=`clip-${this.key}-${metric}`;
    const sourceLabel=source.illustrative?'Illustrative':'Digitized';
    box.innerHTML=`<svg class="plot" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(this.config.title)} ${metric.toUpperCase()} ${sourceLabel.toLowerCase()} curves"><title>${esc(source.provenance)}</title><defs><clipPath id="${clip}"><rect x="${L-1}" y="${T-4}" width="1" height="${B-T+8}"/></clipPath></defs><text class="plot-title" x="2" y="17">${esc(this.config.chartLabels?.[metric]||metric.toUpperCase()+' ↑')}</text><text class="plot-source" x="${R}" y="17" text-anchor="end">${sourceLabel}</text>${ticks.map(v=>`<line class="grid" x1="${L}" y1="${mapY(v)}" x2="${R}" y2="${mapY(v)}"/><text x="${L-9}" y="${mapY(v)+4}" text-anchor="end">${metric==='ssim'?v.toFixed(1):v}</text>`).join('')}${[0,this.duration/2,this.duration].map(t=>`<text x="${mapX(t)}" y="${H-5}" text-anchor="${t===0?'start':t===this.duration?'end':'middle'}">${t}s</text>`).join('')}<g clip-path="url(#${clip})">${Object.keys(data).map(id=>`<path class="curve" data-model="${id}" stroke="${colors[id]}" d="${data[id].map((p,i)=>`${i?'L':'M'}${mapX(p[0]).toFixed(2)},${mapY(p[1]).toFixed(2)}`).join(' ')}"/>`).join('')}</g><line class="cursor" x1="${L}" x2="${L}" y1="${T}" y2="${B}"/>${Object.keys(data).map(id=>`<circle data-model="${id}" r="3" stroke="none" fill="${colors[id]}"/>`).join('')}</svg>`;
    Object.assign(chart,{clip:$('clipPath rect',box),cursor:$('.cursor',box),circles:$$('circle',box),mapX,mapY,L});
  }
  renderCharts(){for(const chart of this.chartHandles){if(!chart.clip)continue;const x=chart.mapX(this.t);chart.clip.setAttribute('width',Math.max(1,x-chart.L+2));chart.cursor.setAttribute('x1',x);chart.cursor.setAttribute('x2',x);chart.circles.forEach(dot=>{dot.setAttribute('cx',x);dot.setAttribute('cy',chart.mapY(sample(chart.data[dot.dataset.model],this.t)));});}}
}
// Paired everyday cases use separate, synchronized GT and EtherWM videos.
// Their controls show actual export seconds.
class RolloutGallery{
  constructor(key){
    this.key=key;this.config=C.galleries[key];this.root=$('#player-'+key);this.speed=this.config.speed;
    this.playing=false;this.userPaused=false;this.visibility=0;this.holdStarted=0;this.raf=0;this.t=0;this.cards=[];
    this.root.innerHTML=`<div class="gallery-heading"><h3>${esc(this.config.title)}</h3></div><div class="gallery-tabs" role="tablist" aria-label="${esc(this.config.title)}">${this.config.clips.map((clip,i)=>`<button class="gallery-tab" id="${key}-tab-${i}" role="tab" aria-controls="${key}-panel" aria-selected="${i===0}" tabindex="${i===0?0:-1}"><span>${esc(clip.title)}</span><small>${Number(clip.duration.toFixed(1))} s ${icon('video')}</small></button>`).join('')}</div><div class="gallery-panel" id="${key}-panel" role="tabpanel" aria-labelledby="${key}-tab-0"><div class="gallery-pair-grid"></div><div class="sync-controls"><button class="play-button" aria-label="Play ${esc(this.config.title)}">${icon('play')}<span class="play-text">Play</span></button><div class="timeline-column"><input class="main-range" type="range" min="0" step="0.01" value="0" aria-label="${esc(this.config.title)} video timeline"><div class="timeline-stamps"></div></div><span class="time-label"></span><select class="speed-select" aria-label="${esc(this.config.title)} playback speed">${[1,2,4,8,16].map(speed=>`<option value="${speed}">${speed}×</option>`).join('')}</select></div></div>`;
    this.playButton=$('.play-button',this.root);this.mainRange=$('.main-range',this.root);this.timeLabel=$('.time-label',this.root);
    for(const[id,label]of [['gt','Ground truth'],['ours','EtherWM (Ours)']]){
      const el=document.createElement('div');el.className='video-card';el.dataset.model=id;el.style.setProperty('--model-color',colors[id]);
      el.innerHTML=`<div class="model-heading"><i class="model-dot"></i><span>${label}</span></div><div class="gallery-video-stage"><video muted playsinline preload="metadata" aria-label="${label}"></video><span class="gallery-error" hidden>Video unavailable</span></div><input class="media-range" type="range" min="0" step="0.01" value="0" aria-label="${label} everyday-scenes timeline"><div class="frame-foot"><span>00:00</span><span></span></div>`;
      $('.gallery-pair-grid',this.root).append(el);
      const c={id,label,el,video:$('video',el),range:$('input',el),clock:$('.frame-foot span',el),endClock:$('.frame-foot span:last-child',el),ready:false};this.cards.push(c);
      c.video.addEventListener('loadedmetadata',()=>{if(!Number.isFinite(c.video.duration)||c.video.duration<=0)return;c.ready=true;c.video.playbackRate=this.speed;c.video.currentTime=Math.min(this.t,c.video.duration);c.endClock.textContent=time(c.video.duration);if(this.playing)this.startVideo(c);});
      c.video.addEventListener('error',()=>{c.ready=false;$('.gallery-error',el).hidden=false;});
      c.range.addEventListener('input',()=>this.seek(+c.range.value));
    }
    this.playButton.addEventListener('click',()=>this.playing?this.pause(true):this.play(true));
    this.mainRange.addEventListener('input',()=>this.seek(+this.mainRange.value));
    $('.speed-select',this.root).addEventListener('change',e=>{this.speed=+e.target.value;this.cards.forEach(c=>c.video.playbackRate=this.speed);});
    this.tabs=$$('.gallery-tab',this.root);
    this.tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>this.select(i));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%this.tabs.length;else if(e.key==='ArrowLeft')next=(i+this.tabs.length-1)%this.tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=this.tabs.length-1;else return;e.preventDefault();this.select(next);this.tabs[next].focus();});});
    this.select(0);
  }
  select(index){
    this.cards.forEach(c=>{c.video.pause();c.ready=false;});this.t=0;this.holdStarted=0;
    const clip=this.config.clips[index];this.duration=clip.duration;this.mainRange.max=this.duration;this.speed=clip.speed||this.config.speed;
    $('.speed-select',this.root).value=String(this.speed);
    this.tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
    $('.gallery-panel',this.root).setAttribute('aria-labelledby',`${this.key}-tab-${index}`);
    for(const c of this.cards){const src=clip.videos[c.id];c.range.max=this.duration;c.endClock.textContent=time(this.duration);c.video.setAttribute('aria-label',`${clip.title} · ${c.label}`);$('.gallery-error',c.el).hidden=true;c.video.poster=src.replace(/\.mp4$/,'.webp');c.video.src=src;c.video.load();}
    const stamps=[0,Math.round(this.duration/2),Math.round(this.duration*10)/10];
    $('.timeline-stamps',this.root).innerHTML=stamps.map((t,i)=>`<button style="--at:${i*50}%" aria-label="Jump to ${t} seconds in ${esc(clip.title)}" data-time="${t}">${t} s</button>`).join('');
    $$('[data-time]',this.root).forEach(button=>button.addEventListener('click',()=>this.seek(+button.dataset.time)));
    this.updatePlay();this.render();
  }
  startVideo(c){if(c.ready){c.video.playbackRate=this.speed;c.video.play().catch(error=>{if(error.name!=='AbortError')this.pause(true);});}}
  updatePlay(){this.root.dataset.playback=this.playing?(this.holdStarted?'holding':'playing'):'paused';this.playButton.setAttribute('aria-label',`${this.playing?'Pause':'Play'} ${this.config.title}`);$('use',this.playButton).setAttribute('href',this.playing?'#i-pause':'#i-play');$('.play-text',this.playButton).textContent=this.playing?'Pause':'Play';}
  play(user=false){
    if(user)this.userPaused=false;if(this.playing)return;Object.values(players).forEach(p=>{if(p!==this)p.pause();});
    if(this.t>=this.duration-.02)this.seek(0);this.playing=true;this.updatePlay();this.cards.forEach(c=>this.startVideo(c));this.raf=requestAnimationFrame(now=>this.tick(now));
  }
  pause(user=false){if(user)this.userPaused=true;this.playing=false;this.holdStarted=0;cancelAnimationFrame(this.raf);this.cards.forEach(c=>c.video.pause());this.updatePlay();}
  seek(t){this.holdStarted=0;this.t=Math.max(0,Math.min(this.duration,t));this.cards.forEach(c=>{if(c.ready)c.video.currentTime=Math.min(this.t,c.video.duration);if(this.playing&&this.t<this.duration)this.startVideo(c);});this.updatePlay();this.render();}
  tick(now){
    if(!this.playing)return;
    if(this.holdStarted){if(now-this.holdStarted>=(C.loopPauseMs||3000)){this.holdStarted=0;this.t=0;this.cards.forEach(c=>{if(c.ready)c.video.currentTime=0;this.startVideo(c);});this.updatePlay();}}
    else {const leader=this.cards.find(c=>c.ready);if(leader&&!leader.video.seeking){this.t=leader.video.currentTime;if(leader.video.ended||this.t>=this.duration-.02){this.t=this.duration;this.cards.forEach(c=>c.video.pause());this.holdStarted=now;this.updatePlay();}else this.cards.forEach(c=>{if(c!==leader&&c.ready&&!c.video.seeking&&Math.abs(c.video.currentTime-this.t)>.2)c.video.currentTime=Math.min(this.t,c.video.duration);});}}
    this.render();if(this.playing)this.raf=requestAnimationFrame(t=>this.tick(t));
  }
  render(){this.mainRange.value=this.t;this.mainRange.style.setProperty('--progress',`${this.t/this.duration*100}%`);this.timeLabel.textContent=`${time(this.t)} / ${time(this.duration)}`;this.cards.forEach(c=>{c.range.value=this.t;c.clock.textContent=time(this.t);});}
}
const players={};Object.keys(C.experiments).forEach(key=>players[key]=new Experiment(key));
Object.keys(C.galleries||{}).forEach(key=>players[key]=new RolloutGallery(key));

function table(id,data){const el=$(id),ranks=data.headers.map((_,j)=>[...new Set(data.rows.map(r=>r[j+1]))].sort((a,b)=>(b-a)*(data.directions?.[j]||1)));const header='<thead><tr><th scope="col">Model</th>'+data.headers.map(h=>`<th scope="col">${h}${data.directions?'':' ↑'}</th>`).join('')+'</tr></thead>';const body='<tbody>'+data.rows.map(row=>`<tr class="${row[0]==='EtherWM'?'our-row':''}"><td>${esc(row[0])}${row[0]==='EtherWM'?' <span class="table-ours">(Ours)</span>':''}</td>${row.slice(1).map((v,j)=>`<td class="${v===ranks[j][0]?'best':v===ranks[j][1]?'second':''}"><span class="value">${v.toFixed(2)}</span></td>`).join('')}</tr>`).join('')+'</tbody>';el.insertAdjacentHTML('beforeend',header+body);}
table('#benchmark-table',C.benchmark);table('#ablation-table',C.ablation);table('#transfer-table',C.transferScores);table('#quality-table',C.transferQuality);
function animatedTable(tableId,replayId,showId){
  const table=$(tableId);let timers=[];
  const show=()=>{timers.forEach(clearTimeout);timers=[];table.dataset.stage='all';};
  const reveal=()=>{show();if(reduced)return;table.dataset.stage='hidden';timers=[setTimeout(()=>table.dataset.stage='best',60),setTimeout(()=>table.dataset.stage='second',360),setTimeout(()=>table.dataset.stage='all',690)];};
  if(replayId)$(replayId).addEventListener('click',reveal);if(showId)$(showId).addEventListener('click',show);
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){reveal();observer.disconnect();}},{threshold:.3});observer.observe(table);
}
animatedTable('#benchmark-table','#replay-table');
animatedTable('#ablation-table','#replay-ablation');
animatedTable('#transfer-table','#replay-transfer');
animatedTable('#quality-table','#replay-quality');

// Clipboard API plus local-file fallback; report success only after a successful copy.
let copyTimer;
$('#copy-citation').addEventListener('click',async()=>{
  const text=$('#citation-code').textContent,button=$('#copy-citation');let copied=false;
  try{await navigator.clipboard.writeText(text);copied=true;}catch{
    const field=document.createElement('textarea');field.value=text;field.setAttribute('readonly','');field.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(field);field.select();try{copied=document.execCommand('copy');}catch{}field.remove();button.focus();
  }
  clearTimeout(copyTimer);$('use',button).setAttribute('href',copied?'#i-check':'#i-copy');$('span',button).textContent=copied?'Copied':'Copy';$('#copy-status').textContent=copied?'Copied to clipboard.':'Select the citation and copy it manually.';copyTimer=setTimeout(()=>{$('use',button).setAttribute('href','#i-copy');$('span',button).textContent='Copy';$('#copy-status').textContent='';},2400);
});

// A deterministic scroll position replaces event-order-dependent section highlighting.
const header=$('.header'),navLinks=$$('nav a'),chapters=navLinks.map(a=>$(a.hash)),progress=$('.chapter-progress');let navFrame=0;
function updateNav(){
  navFrame=0;const threshold=header.offsetHeight+Math.min(150,innerHeight*.15);let active=-1;
  for(let i=0;i<chapters.length;i++)if(chapters[i].getBoundingClientRect().top<=threshold)active=i;
  if(scrollY+innerHeight>=document.documentElement.scrollHeight-3)active=chapters.length-1;
  navLinks.forEach((link,i)=>{const selected=i===active;link.classList.toggle('active',selected);if(selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  const completed=active+1;$('#chapter-progress-fill').style.width=`${completed/chapters.length*100}%`;progress.setAttribute('aria-valuenow',completed);progress.setAttribute('aria-valuetext',active<0?'Introduction':navLinks[active].textContent);
}
function queueNav(){if(!navFrame)navFrame=requestAnimationFrame(updateNav);}
window.addEventListener('scroll',queueNav,{passive:true});window.addEventListener('resize',queueNav);window.addEventListener('hashchange',queueNav);window.addEventListener('pageshow',queueNav);new ResizeObserver(queueNav).observe(document.body);document.addEventListener('load',queueNav,true);updateNav();

// Re-arm blocks only after they move below the viewport, so every downward visit reveals them again.
// The section boxes stay in normal flow: navigation and scroll position remain stable.
if(!reduced&&'IntersectionObserver' in window){
  const blocks=$$('.section').flatMap(section=>[...section.children]).filter(el=>!el.classList.contains('copy-status'));
  blocks.forEach(el=>{el.classList.add('scroll-reveal');if(el.getBoundingClientRect().top<innerHeight-32)el.classList.add('is-revealed');});
  const revealObserver=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(entry.isIntersecting)entry.target.classList.add('is-revealed');
      else if(entry.boundingClientRect.top>=innerHeight-32)entry.target.classList.remove('is-revealed');
    }
  },{threshold:0,rootMargin:'0px 0px -32px 0px'});
  blocks.forEach(el=>revealObserver.observe(el));
  document.addEventListener('focusin',e=>e.target.closest('.scroll-reveal')?.classList.add('is-revealed'));
}

// Autoplay the most visible comparison; preserve an explicit user pause.
function syncVisiblePlayback(){
  const visible=Object.values(players).filter(p=>p.visibility>=.15).sort((a,b)=>b.visibility-a.visibility),active=visible[0];
  Object.values(players).forEach(p=>{if(p!==active||document.hidden)p.pause();});
  if(active&&!document.hidden&&!active.userPaused)active.play();
}
const mediaObserver=new IntersectionObserver(entries=>{
  for(const e of entries)players[e.target.id.replace('player-','')].visibility=e.isIntersecting?e.intersectionRatio:0;
  syncVisiblePlayback();
},{threshold:[0,.15,.3,.5,.7,1]});Object.values(players).forEach(p=>mediaObserver.observe(p.root));
document.addEventListener('visibilitychange',()=>{updateLoop();syncVisiblePlayback();updateHero();if(document.hidden)teaser.pause();});
window.addEventListener('pagehide',()=>{stopHero();Object.values(players).forEach(p=>p.pause());});
})();
