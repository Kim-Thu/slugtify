from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, Iterable, List

from PIL import Image, ImageOps

SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"}
SUPPORTED_FORMATS = {"png", "jpg", "webp", "bmp", "tiff"}


class ImageConverter:
    @staticmethod
    def collect(paths: Iterable[str], recursive: bool = True) -> List[Path]:
        found: List[Path] = []
        seen = set()

        for raw_path in paths:
            path = Path(raw_path).expanduser().resolve()
            candidates: Iterable[Path]

            if path.is_dir():
                candidates = path.rglob("*") if recursive else path.glob("*")
            elif path.is_file():
                candidates = [path]
            else:
                continue

            for item in candidates:
                if not item.is_file() or item.suffix.lower() not in SUPPORTED_EXTENSIONS:
                    continue
                key = str(item).lower()
                if key not in seen:
                    seen.add(key)
                    found.append(item)

        return sorted(found, key=lambda p: str(p).lower())

    @staticmethod
    def default_output_dir(paths: List[str], target_format: str) -> Path:
        first = Path(paths[0]).expanduser().resolve()
        base = first if first.is_dir() else first.parent
        return base / f"converted-{target_format}"

    @staticmethod
    def output_path(source: Path, input_roots: List[str], output_dir: Path, target_format: str, recursive: bool) -> Path:
        relative = Path(source.name)

        if recursive:
            for raw_root in input_roots:
                root = Path(raw_root).expanduser().resolve()
                if root.is_dir():
                    try:
                        relative = source.relative_to(root)
                        break
                    except ValueError:
                        pass

        extension = ".jpg" if target_format == "jpg" else f".{target_format}"
        return (output_dir / relative).with_suffix(extension)

    @staticmethod
    def analyze(paths: List[str], target_format: str, output_dir: str | None, recursive: bool) -> Dict[str, Any]:
        fmt = target_format.lower()
        if fmt not in SUPPORTED_FORMATS:
            raise ValueError(f"Unsupported target format: {target_format}")

        files = ImageConverter.collect(paths, recursive)
        target = Path(output_dir).expanduser().resolve() if output_dir else ImageConverter.default_output_dir(paths, fmt)

        preview = []
        total_bytes = 0
        conflicts = 0

        for source in files:
            dest = ImageConverter.output_path(source, paths, target, fmt, recursive)
            exists = dest.exists()
            conflicts += int(exists)
            total_bytes += source.stat().st_size
            preview.append({
                "source": str(source),
                "filename": source.name,
                "output": str(dest),
                "output_filename": dest.name,
                "size": source.stat().st_size,
                "exists": exists,
            })

        return {
            "files": preview,
            "count": len(preview),
            "total_bytes": total_bytes,
            "conflicts": conflicts,
            "output_dir": str(target),
            "supported_formats": sorted(SUPPORTED_FORMATS),
        }

    @staticmethod
    def convert(
        paths: List[str],
        target_format: str,
        output_dir: str | None,
        quality: int = 85,
        recursive: bool = True,
        overwrite: bool = False,
    ) -> Dict[str, Any]:
        fmt = target_format.lower()
        if fmt not in SUPPORTED_FORMATS:
            raise ValueError(f"Unsupported target format: {target_format}")

        quality = max(1, min(100, int(quality)))
        files = ImageConverter.collect(paths, recursive)
        target = Path(output_dir).expanduser().resolve() if output_dir else ImageConverter.default_output_dir(paths, fmt)
        target.mkdir(parents=True, exist_ok=True)

        converted = 0
        skipped = 0
        errors: List[Dict[str, str]] = []
        outputs: List[str] = []

        for source in files:
            dest = ImageConverter.output_path(source, paths, target, fmt, recursive)

            if dest.exists() and not overwrite:
                skipped += 1
                continue

            try:
                dest.parent.mkdir(parents=True, exist_ok=True)

                with Image.open(source) as image:
                    image = ImageOps.exif_transpose(image)

                    save_kwargs: Dict[str, Any] = {}
                    pil_format = fmt.upper()

                    if fmt == "jpg":
                        pil_format = "JPEG"
                        if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
                            rgba = image.convert("RGBA")
                            background = Image.new("RGB", rgba.size, "white")
                            background.paste(rgba, mask=rgba.getchannel("A"))
                            image = background
                        elif image.mode != "RGB":
                            image = image.convert("RGB")
                        save_kwargs = {"quality": quality, "optimize": True}
                    elif fmt == "webp":
                        if image.mode not in ("RGB", "RGBA"):
                            image = image.convert("RGBA" if "transparency" in image.info else "RGB")
                        save_kwargs = {"quality": quality, "method": 6}
                    elif fmt == "png":
                        if image.mode == "CMYK":
                            image = image.convert("RGB")
                        save_kwargs = {"optimize": True}
                    elif fmt == "bmp":
                        if image.mode not in ("RGB", "RGBA"):
                            image = image.convert("RGB")
                    elif fmt == "tiff":
                        save_kwargs = {"compression": "tiff_deflate"}

                    image.save(dest, format=pil_format, **save_kwargs)

                converted += 1
                outputs.append(str(dest))
            except Exception as exc:
                errors.append({"path": str(source), "error": str(exc)})

        return {
            "success": converted,
            "skipped": skipped,
            "errors": errors,
            "output_dir": str(target),
            "outputs": outputs,
        }
