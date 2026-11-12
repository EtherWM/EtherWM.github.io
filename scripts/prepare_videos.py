"""Prepare supplied comparisons without changing the source files.

Usage: python scripts/prepare_videos.py PATH_TO_SOURCE_FOLDER
Only assets/videos inside this page is written. No resampling or interpolation.
"""
from pathlib import Path
import argparse
import json
import subprocess
import imageio_ffmpeg

parser = argparse.ArgumentParser()
parser.add_argument('source', type=Path)
args = parser.parse_args()
dest = Path(__file__).resolve().parents[1] / 'assets' / 'videos'
dest.mkdir(exist_ok=True)
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
jobs = [
    ('3.mp4', 'sink-gt', 'crop=320:240:0:0'),
    ('3.mp4', 'sink-etherwm', 'crop=286:240:337:0:exact=1'),
    ('3.mp4', 'sink-oscar', 'crop=320:240:640:0'),
    ('4.mp4', 'fold-scene2-gt', 'crop=480:324:0:0'),
    ('5.mp4', 'fold-scene1-gt', 'crop=480:324:0:0'),
    ('0.mp4', 'window-gt', 'crop=640:480:0:0'),
    ('0.mp4', 'window-etherwm', 'crop=640:480:640:0'),
    ('1.mp4', 'cloth-gt', 'crop=640:480:0:0'),
    ('1.mp4', 'cloth-etherwm', 'crop=640:480:640:0'),
    ('6.mp4', 'kitchen-gt', 'crop=480:324:0:0'),
    ('6.mp4', 'kitchen-etherwm', 'crop=480:324:480:0'),
    ('7.mp4', 'cup-gt', 'crop=768:512:0:0'),
    ('7.mp4', 'cup-etherwm', 'crop=768:512:768:0'),
    # Figure 7 confirms EtherWM / Ctrl-World / MiniWorld in source 2.
    ('2.mp4', 'wipe-etherwm', 'crop=320:212:0:0'),
    ('2.mp4', 'wipe-ctrl', 'crop=320:212:320:0'),
    ('2.mp4', 'wipe-mini', 'crop=284:212:656:0'),
    # The new four-panel export adds OSCAR in its second column.
    ('Generalization2_wipe.mp4', 'wipe-oscar', 'crop=284:208:336:0'),
    ('ablation_ours.mp4', 'ablation-gt', 'crop=570:432:34:0'),
    ('ablation_ours.mp4', 'ablation-etherwm', 'crop=570:432:674:0'),
    ('ablation_no_motion_tower.mp4', 'ablation-no-motion', 'crop=570:432:674:0'),
    ('ablation_no_motion_tower_and_memory.mp4', 'ablation-no-motion-or-memory', 'crop=570:432:674:0'),
    # User confirmed the left Original inference pane is the Without memory result.
    ('ablation_no_memory.mp4', 'ablation-no-memory', 'crop=570:432:34:32'),
]

def run(options):
    subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', *options], check=True)

previous = {r['file']: r for r in json.loads((dest / 'manifest.json').read_text())} if (dest / 'manifest.json').exists() else {}
manifest = []
for source, name, crop in jobs:
    output = dest / (name + '.mp4')
    old = previous.get(output.name)
    if old and old['source'] == source and old['crop'] == crop and output.exists() and output.stat().st_mtime >= (args.source / source).stat().st_mtime and (dest / (name + '.webp')).exists():
        manifest.append(old)
        print(name, 'unchanged', flush=True)
        continue
    options = ['-i', str(args.source / source), '-map', '0:v:0', '-an', '-map_metadata', '-1']
    if crop:
        options += ['-vf', crop, '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p']
    else:
        options += ['-c:v', 'copy']
    run(options + ['-movflags', '+faststart', str(output)])
    run(['-i', str(output), '-frames:v', '1', '-c:v', 'libwebp', '-quality', '90', str(dest / (name + '.webp'))])
    reader = imageio_ffmpeg.read_frames(str(output), pix_fmt='rgb24')
    metadata = next(reader)
    count = sum(1 for _ in reader)
    manifest.append({'source': source, 'file': name + '.mp4', 'poster': name + '.webp',
                     'crop': crop, 'codec': metadata['codec'], 'size': metadata['size'],
                     'fps': metadata['fps'], 'frames': count,
                     'duration': count / metadata['fps'], 'bytes': output.stat().st_size,
                     'hasAudio': False})
    if name == 'ablation-no-memory':
        manifest[-1]['sourceLabel'] = 'Original inference'
        manifest[-1]['model'] = 'Without memory'
        manifest[-1]['identityConfirmedBy'] = 'User, following source-provider verification'
        manifest[-1]['postprocessed'] = False
    print(name, metadata['size'], count, 'frames', flush=True)
(dest / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
print('Prepared and fully decoded', len(manifest), 'page videos.')
