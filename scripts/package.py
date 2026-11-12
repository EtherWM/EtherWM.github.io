from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
destination = root.parent / 'EtherWM_supplementary_preview.zip'
with ZipFile(destination, 'w', ZIP_DEFLATED, compresslevel=9) as archive:
    for file in sorted(root.rglob('*')):
        relative = file.relative_to(root)
        if file.is_file() and not any(p in {'.git', '__pycache__', 'node_modules', '.preview'} for p in relative.parts) and file.suffix != '.zip':
            archive.write(file, Path(root.name) / relative)
print(f'{destination.name}: {destination.stat().st_size / 1_000_000:.2f} MB')
