EtherWM offline video assets

22 cropped single-view H.264 MP4 files from 13 supplied sources.
Native frame rates and frame counts retained; CRF 18; yuv420p; faststart.
No frame synthesis, interpolation, resizing, or audio tracks.
A WebP first-frame poster accompanies each file.
Source videos outside this supplementary folder are unchanged.
Exact crop coordinates and provenance: manifest.json

sink-*                       3.mp4: GT / EtherWM / OSCAR
fold-scene2-gt                4.mp4: left GT, folding action source
fold-scene1-gt                5.mp4: left GT, folding appearance source
kitchen-*                    6.mp4: left GT / right EtherWM
window-*                     0.mp4: left GT / right EtherWM
cloth-*                      1.mp4: left GT / right EtherWM
cup-*                        7.mp4: left GT / right EtherWM
wipe-etherwm / ctrl / mini    2.mp4: left / middle / right; Figure 7 match
wipe-oscar                   Generalization2_wipe.mp4: second column
ablation-gt / etherwm         ablation_ours.mp4: left / right
ablation-no-motion           ablation_no_motion_tower.mp4: right
ablation-no-motion-or-memory  ablation_no_motion_tower_and_memory.mp4: right
ablation-no-memory           ablation_no_memory.mp4: left Original inference

The user confirmed the last clip is Without memory after checking with the
source provider. Only the left Original inference pane is used; the right
postprocessed illustration is excluded. Confirmation retained in manifest.

Kitchen GT in the wiping case is the Scene 2 action source, not GT for the
counterfactual Scene 1 prediction. Scene 1 GT remains paper keyframes.
Folding transfer Ours likewise remains paper keyframes pending its video.
Dataset identity of the four extra everyday scenes is not yet confirmed.

Full teaser (separate from the cropped comparison clips above):
etherwm-teaser.mp4: exact copy of EtherWM_teaser_v3/EtherWM_v3_full_with_intro.mp4.
143.4 seconds; 1920x1080; 30 fps; H.264 with the original AAC stereo audio.
No re-encoding. Fast-start metadata retained. Overview defaults to muted, 1x.
etherwm-teaser.webp: poster extracted at 1 second.
