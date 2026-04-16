#!/usr/bin/env python3

import io
import json
import sys
from pathlib import Path


def emit(payload):
    sys.stdout.write(json.dumps(payload))
    sys.stdout.flush()


def main():
    if len(sys.argv) != 3:
        emit(
            {
                "success": False,
                "width": 0,
                "height": 0,
                "originalBytes": 0,
                "processedBytes": 0,
                "error": "Usage: remove_background.py <input_path> <output_path>",
            }
        )
        return 1

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])

    try:
        from PIL import Image
        from rembg import remove
    except Exception as error:  # pragma: no cover
        emit(
            {
                "success": False,
                "width": 0,
                "height": 0,
                "originalBytes": 0,
                "processedBytes": 0,
                "error": f"Missing Python dependency: {error}",
            }
        )
        return 1

    try:
        original_bytes = input_path.read_bytes()
        removed_bytes = remove(original_bytes)

        with Image.open(io.BytesIO(removed_bytes)) as image:
            rgba = image.convert("RGBA")
            width, height = rgba.size
            output_path.parent.mkdir(parents=True, exist_ok=True)
            rgba.save(output_path, format="PNG", optimize=True)

        processed_bytes = output_path.stat().st_size
        emit(
            {
                "success": True,
                "width": width,
                "height": height,
                "originalBytes": len(original_bytes),
                "processedBytes": processed_bytes,
            }
        )
        return 0
    except Exception as error:
        emit(
            {
                "success": False,
                "width": 0,
                "height": 0,
                "originalBytes": 0,
                "processedBytes": 0,
                "error": str(error),
            }
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
