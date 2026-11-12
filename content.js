/* All paths are relative so the supplementary works directly over file://.
 * Fill video paths after adding MP4/WebM files. Empty paths make no network request.
 * Set resource URLs only for a later public release. See README.md.
 */
window.ETHER_CONTENT = {
  heroPlaybackRate: 8,
  heroClips: [
    {id:'sink',title:'Long-horizon rollout',src:'assets/videos/sink-etherwm.mp4',poster:'assets/videos/sink-etherwm.webp',duration:109},
    {id:'kitchen',title:'Kitchen interaction',src:'assets/videos/kitchen-etherwm.mp4',poster:'assets/videos/kitchen-etherwm.webp',duration:65.8},
  ],
  teaserVideo: 'assets/videos/etherwm-teaser.mp4', loopPauseMs: 3000,
  resources: { Paper: '', Code: '', Checkpoints: '', Datasets: '' },
  videos: {
    long: {gt:'assets/videos/sink-gt.mp4',oscar:'assets/videos/sink-oscar.mp4',ours:'assets/videos/sink-etherwm.mp4'},
    droid: {gt:'',ctrl:'',oscar:'',mini:'',ours:''},
    transfer: {scene1:'assets/videos/fold-scene1-gt.mp4',scene2:'assets/videos/fold-scene2-gt.mp4',exchange:''},
    wipe: {source:'assets/videos/kitchen-gt.mp4',scene:'',oscar:'assets/videos/wipe-oscar.mp4',ctrl:'assets/videos/wipe-ctrl.mp4',mini:'assets/videos/wipe-mini.mp4',ours:'assets/videos/wipe-etherwm.mp4'},
    ablation: {gt:'assets/videos/ablation-gt.mp4',memory:'assets/videos/ablation-no-memory.mp4',motion:'assets/videos/ablation-no-motion.mp4',both:'assets/videos/ablation-no-motion-or-memory.mp4',ours:'assets/videos/ablation-etherwm.mp4'}
  },
  experiments: {
    long: {duration:110, timestamps:[0,60,110], title:'110-second comparison', models:[['gt','Ground truth'],['oscar','OSCAR-2B'],['ours','EtherWM']], charts:true, alignment:'progress'},
    droid: {duration:60, timestamps:[0,12,48,60], title:'DROID comparison', models:[['gt','Ground truth'],['ours','EtherWM'],['ctrl','Ctrl-World'],['oscar','OSCAR'],['mini','MiniWorld']], charts:true},
    transfer: {duration:70,timestamps:[0,40,70],title:'Clothes folding · action transfer',layout:'transfer',models:[['scene2','Action source · GT'],['scene1','Scene source · GT'],['exchange','EtherWM']],alignment:'progress'},
    wipe: {duration:60,timestamps:[0,24,60],title:'Table wiping · action transfer',alignment:'progress',layout:'transfer',models:[['source','Action source · GT'],['scene','Scene source · GT'],['ours','EtherWM'],['oscar','OSCAR'],['ctrl','Ctrl-World'],['mini','MiniWorld']]},
    ablation: {duration:32, timestamps:[0,8,16,24,32], title:'AgiBot component comparison', layout:'ablation-switch', variants:['both','memory','motion'], models:[['gt','Ground truth'],['ours','EtherWM'],['both','Without both'],['memory','Without memory'],['motion','Without Motion Tower']],alignment:'progress'}
  },
  // User-confirmed pair order: ground truth on the left, EtherWM on the right.
  galleries: {
    'extras-droid': {title:'Across everyday scenes', speed:1, clips:[
      {id:'kitchen',title:'Kitchen interaction',duration:65.8,speed:8,videos:{gt:'assets/videos/kitchen-gt.mp4',ours:'assets/videos/kitchen-etherwm.mp4'}},
      {id:'window',title:'Window-side manipulation',duration:10.5333333333,speed:1,videos:{gt:'assets/videos/window-gt.mp4',ours:'assets/videos/window-etherwm.mp4'}},
      {id:'cloth',title:'Cloth handling',duration:10.5333333333,speed:1,videos:{gt:'assets/videos/cloth-gt.mp4',ours:'assets/videos/cloth-etherwm.mp4'}},
      {id:'cup',title:'Cup interaction',duration:11.4,speed:1,videos:{gt:'assets/videos/cup-gt.mp4',ours:'assets/videos/cup-etherwm.mp4'}}
    ]}
  },
  transferScores: {
    headers:['Matched ↑','Transferred ↑','Drop ↓'],directions:[1,1,-1],
    rows:[['MiniWorld',62.32,43.65,18.67],['Ctrl-World',58.73,10.02,48.71],['OSCAR',59.66,17.53,42.13],['EtherWM',63.51,61.02,2.49]]
  },
  transferQuality: {
    headers:['Scene / object ↑','Robot structure ↑','Interaction ↑'],directions:[1,1,1],
    rows:[['Ctrl-World',7.75,7.85,6.29],['MiniWorld',7.46,7.85,6.08],['OSCAR',6.60,7.08,5.29],['EtherWM',8.31,9.32,7.31]]
  },
  benchmark: {
    headers:['Trajectory<br>accuracy','Action response<br>sensitivity','Instruction<br>following','Interaction<br>quality','Photometric<br>consistency','Depth<br>accuracy','Semantic<br>alignment'],
    rows:[
      ['Genie Envisioner',6.79,1.09,20.28,20.52,20.06,86.63,85.44],
      ['Cosmos-Predict 2.5 (action)',29.45,1.33,58.40,55.00,35.28,88.62,88.79],
      ['IRASim',36.39,5.26,66.04,56.56,35.22,93.12,88.49],
      ['Ctrl-World',47.66,2.10,72.72,62.12,17.29,93.00,89.12],
      ['BWM',64.36,3.42,82.48,73.76,28.71,97.56,90.59],
      ['EtherWM',67.38,12.35,84.62,76.83,57.21,97.19,89.54]
    ]
  },
  ablation: {
    headers:['PSNR ↑','PSNR<br>&lt; 30 s ↑','PSNR<br>≥ 30 s ↑','SSIM ↑','LPIPS ↓','Trajectory<br>accuracy ↑'],
    directions:[1,1,1,1,-1,1],
    rows:[['H3 + Action',18.21,20.56,15.37,0.52,0.31,45.02],['Without memory',19.85,21.79,17.95,0.69,0.16,74.89],['Without Motion Tower',20.51,22.33,18.76,0.73,0.19,50.21],['EtherWM',21.99,22.71,21.26,0.79,0.13,73.35]]
  }
};
