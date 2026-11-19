from pathlib import Path
import argparse
import importlib.util
import shutil
import subprocess
import sys
import tempfile


ROOT = Path(__file__).resolve().parent.parent
SCENES = (
    ('limits_scene.py', 'LimitsApproach', 'limits-intro.mp4'),
    ('derivative_scene.py', 'DerivativeTangent', 'derivative-tangent.mp4'),
    ('integral_scene.py', 'IntegralRectangles', 'integral-sums.mp4'),
)


def valid_video(file):
    if not file.exists() or file.stat().st_size < 10000:
        return False
    with file.open('rb') as video:
        video.seek(4)
        return video.read(4) == b'ftyp'


def main():
    parser = argparse.ArgumentParser(description='Render Axion Manim lessons')
    parser.add_argument('--intro', action='store_true', help='Render only the Limits lesson video')
    args = parser.parse_args()
    scenes = SCENES[:1] if args.intro else SCENES
    if importlib.util.find_spec('manim') is None:
        print('Manim is not installed in this Python environment.')
        print('Install it using: python -m pip install manim')
        return 1

    destination = ROOT / 'public' / 'videos'
    destination.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix='axion-manim-') as folder:
        media = Path(folder)
        rendered = []
        for filename, scene, output in scenes:
            command = [
                sys.executable, '-m', 'manim',
                '-ql', '--disable_caching',
                '--media_dir', str(media),
                '-o', Path(output).stem,
                str(ROOT / 'manim' / filename), scene,
            ]
            print(f'\nRendering {scene} with Manim...', flush=True)
            result = subprocess.run(command, cwd=ROOT, check=False)
            if result.returncode:
                print(f'Manim failed to render {scene}; existing videos are unchanged.')
                return result.returncode

            matches = [item for item in media.rglob(output) if valid_video(item)]
            if len(matches) != 1:
                print(f'Could not verify exactly one rendered MP4 for {scene}.')
                return 1
            rendered.append((matches[0], destination / output))

        for source, target in rendered:
            shutil.copyfile(source, target)
            print(f'Saved Manim video: {target.relative_to(ROOT)}')

    print('\nManim videos rendered and updated successfully.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
