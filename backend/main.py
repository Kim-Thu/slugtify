from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from fastapi.responses import StreamingResponse

import io
import json
import os
import zipfile
from pathlib import PurePosixPath

from PIL import Image, ImageOps
from services.file_service import FileSystemService
from services.naming_strategy import SlugNamingStrategy
from services.html_service import HtmlCleaner
from services.image_service import ImageConverter
from core.security import SecurityManager

app = FastAPI(title="SlugifyMaster API", version="2.0.0")

# Security: CORS Policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DI - Dependency Injection
def get_file_service():
    strategy = SlugNamingStrategy()
    return FileSystemService(strategy)

# Models
class BulkRenameRequest(BaseModel):
    path: str
    target_path: str = None
    renames: List[Dict[str, str]]

@app.get("/browse")
async def browse_directory(mode: str = "folder"):
    raise HTTPException(
        status_code=410,
        detail="Desktop file picker was removed. Use the browser file/folder picker and upload endpoints."
    )

@app.post("/analyze")
async def analyze_items(request: Dict[str, Any], service: FileSystemService = Depends(get_file_service)):
    # request: { "paths": ["..."], "pattern": "{slug}" }
    paths = request.get("paths", [])
    pattern = request.get("pattern", "{slug}")
    
    results = []
    current_index = 0
    
    # Sort paths to ensure consistent numbering
    sorted_paths = sorted(paths)
    
    for p in sorted_paths:
        try:
            safe_p = SecurityManager.validate_path(p)
            if os.path.isdir(safe_p):
                # Scan directory content
                dir_results = service.scan_directory(safe_p, pattern, start_index=current_index)
                results.extend(dir_results)
                current_index += len(dir_results)
            else:
                # Single file
                name = os.path.basename(safe_p)
                base_dir = os.path.dirname(safe_p)
                # Use the service's strategy to ensure consistent transform logic
                slugified = service.strategy.transform(name, False, current_index, pattern)
                results.append({
                    "original": name,
                    "slugified": slugified,
                    "is_directory": False,
                    "base_dir": base_dir
                })
                current_index += 1
        except Exception as e:
            print(f"Error analyzing path {p}: {str(e)}")
            continue
            
    return {"files": results}

@app.post("/rename")
async def rename_files(request: BulkRenameRequest, service: FileSystemService = Depends(get_file_service)):
    safe_path = SecurityManager.validate_path(request.path)
    safe_target = SecurityManager.validate_path(request.target_path) if request.target_path else None
    result = service.bulk_rename(safe_path, request.renames, safe_target)
    return result

class ImageConvertRequest(BaseModel):
    paths: List[str]
    target_format: str = "webp"
    output_dir: str = None
    quality: int = 85
    recursive: bool = True
    overwrite: bool = False
    delete_source: bool = False

@app.post("/image/analyze")
async def analyze_images(request: ImageConvertRequest):
    try:
        safe_paths = [SecurityManager.validate_path(p) for p in request.paths]
        safe_output = SecurityManager.validate_path(request.output_dir) if request.output_dir else None
        return ImageConverter.analyze(
            safe_paths,
            request.target_format,
            safe_output,
            request.recursive,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/image/convert")
async def convert_images(request: ImageConvertRequest):
    try:
        safe_paths = [SecurityManager.validate_path(p) for p in request.paths]
        safe_output = SecurityManager.validate_path(request.output_dir) if request.output_dir else None
        return ImageConverter.convert(
            safe_paths,
            request.target_format,
            safe_output,
            request.quality,
            request.recursive,
            request.overwrite,
            request.delete_source,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class HtmlCleanRequest(BaseModel):
    paths: List[str]
    options: Dict[str, Any]
    output_dir: str = None

@app.post("/html/analyze")
async def analyze_html(request: HtmlCleanRequest):
    results = []
    for p in request.paths:
        safe_p = SecurityManager.validate_path(p)
        if os.path.isfile(safe_p) and (p.endswith('.html') or p.endswith('.htm')):
            try:
                with open(safe_p, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                cleaned = HtmlCleaner.clean(content, request.options)
                results.append({
                    "path": p,
                    "filename": os.path.basename(p),
                    "original_size": len(content),
                    "cleaned_size": len(cleaned),
                    "preview": cleaned[:500] + "..." if len(cleaned) > 500 else cleaned
                })
            except Exception as e:
                results.append({"path": p, "error": str(e)})
    return {"files": results}

@app.post("/html/execute")
async def execute_html_clean(request: HtmlCleanRequest):
    success = 0
    errors = []
    
    for p in request.paths:
        safe_p = SecurityManager.validate_path(p)
        if os.path.isfile(safe_p):
            try:
                with open(safe_p, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                cleaned = HtmlCleaner.clean(content, request.options)
                
                target_p = safe_p
                if request.output_dir:
                    if not os.path.exists(request.output_dir):
                        os.makedirs(request.output_dir, exist_ok=True)
                    target_p = os.path.join(request.output_dir, os.path.basename(p))
                
                with open(target_p, 'w', encoding='utf-8') as f:
                    f.write(cleaned)
                success += 1
            except Exception as e:
                errors.append({"path": p, "error": str(e)})
                
    return {"success": success, "errors": errors}

class HtmlTextCleanRequest(BaseModel):
    text: str
    options: Dict[str, Any]

@app.post("/html/clean-text")
async def clean_html_text(request: HtmlTextCleanRequest):
    try:
        cleaned = HtmlCleaner.clean(request.text, request.options)
        return {
            "cleaned": cleaned,
            "original_size": len(request.text),
            "cleaned_size": len(cleaned)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Browser-native upload APIs.
# These endpoints make the app work the same way locally, in Docker, and on a remote server.

def _safe_relative_path(raw: str, fallback: str) -> PurePosixPath:
    candidate = PurePosixPath((raw or fallback).replace("\\", "/"))
    clean_parts = [part for part in candidate.parts if part not in ("", ".", "..", "/")]
    return PurePosixPath(*clean_parts) if clean_parts else PurePosixPath(fallback)


def _zip_response(buffer: io.BytesIO, filename: str) -> StreamingResponse:
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.post("/web/rename/analyze")
async def web_rename_analyze(
    files: List[UploadFile] = File(...),
    relative_paths: List[str] = Form([]),
    pattern: str = Form("{slug}"),
):
    strategy = SlugNamingStrategy()
    results = []
    for index, upload in enumerate(files):
        rel = _safe_relative_path(
            relative_paths[index] if index < len(relative_paths) else upload.filename or f"file-{index}",
            upload.filename or f"file-{index}",
        )
        original = rel.name
        results.append({
            "original": original,
            "slugified": strategy.transform(original, False, index, pattern),
            "is_directory": False,
            "base_dir": str(rel.parent) if str(rel.parent) != "." else "",
            "relative_path": str(rel),
        })
    return {"files": results}


@app.post("/web/rename/execute")
async def web_rename_execute(
    files: List[UploadFile] = File(...),
    relative_paths: List[str] = Form([]),
    renames: str = Form("[]"),
):
    rename_items = json.loads(renames)
    rename_map = {
        (item.get("base_dir", ""), item.get("original", "")): item.get("slugified", item.get("original", ""))
        for item in rename_items
    }
    output = io.BytesIO()
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as archive:
        for index, upload in enumerate(files):
            rel = _safe_relative_path(
                relative_paths[index] if index < len(relative_paths) else upload.filename or f"file-{index}",
                upload.filename or f"file-{index}",
            )
            parent = "" if str(rel.parent) == "." else str(rel.parent)
            new_name = rename_map.get((parent, rel.name), rel.name)
            target = PurePosixPath(parent) / new_name if parent else PurePosixPath(new_name)
            archive.writestr(str(target), await upload.read())
    return _zip_response(output, "renamed-files.zip")


@app.post("/web/html/analyze")
async def web_html_analyze(
    files: List[UploadFile] = File(...),
    relative_paths: List[str] = Form([]),
    options: str = Form("{}"),
):
    clean_options = json.loads(options)
    results = []
    for index, upload in enumerate(files):
        rel = _safe_relative_path(
            relative_paths[index] if index < len(relative_paths) else upload.filename or f"file-{index}.html",
            upload.filename or f"file-{index}.html",
        )
        if rel.suffix.lower() not in {".html", ".htm"}:
            continue
        try:
            content = (await upload.read()).decode("utf-8")
            cleaned = HtmlCleaner.clean(content, clean_options)
            results.append({
                "path": str(rel),
                "filename": rel.name,
                "original_size": len(content.encode("utf-8")),
                "cleaned_size": len(cleaned.encode("utf-8")),
                "preview": cleaned[:500] + "..." if len(cleaned) > 500 else cleaned,
            })
        except Exception as exc:
            results.append({"path": str(rel), "filename": rel.name, "error": str(exc)})
    return {"files": results}


@app.post("/web/html/execute")
async def web_html_execute(
    files: List[UploadFile] = File(...),
    relative_paths: List[str] = Form([]),
    options: str = Form("{}"),
):
    clean_options = json.loads(options)
    output = io.BytesIO()
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as archive:
        for index, upload in enumerate(files):
            rel = _safe_relative_path(
                relative_paths[index] if index < len(relative_paths) else upload.filename or f"file-{index}.html",
                upload.filename or f"file-{index}.html",
            )
            if rel.suffix.lower() not in {".html", ".htm"}:
                continue
            content = (await upload.read()).decode("utf-8")
            cleaned = HtmlCleaner.clean(content, clean_options)
            archive.writestr(str(rel), cleaned.encode("utf-8"))
    return _zip_response(output, "cleaned-html.zip")


@app.post("/web/image/convert")
async def web_image_convert(
    files: List[UploadFile] = File(...),
    relative_paths: List[str] = Form([]),
    target_format: str = Form("webp"),
    quality: int = Form(85),
):
    fmt = target_format.lower()
    if fmt not in {"png", "jpg", "webp", "bmp", "tiff"}:
        raise HTTPException(status_code=400, detail=f"Unsupported target format: {target_format}")

    quality = max(1, min(100, int(quality)))
    output = io.BytesIO()
    errors = []

    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as archive:
        for index, upload in enumerate(files):
            rel = _safe_relative_path(
                relative_paths[index] if index < len(relative_paths) else upload.filename or f"image-{index}",
                upload.filename or f"image-{index}",
            )
            if rel.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"}:
                continue

            try:
                raw = await upload.read()
                with Image.open(io.BytesIO(raw)) as image:
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

                    converted = io.BytesIO()
                    image.save(converted, format=pil_format, **save_kwargs)
                    converted.seek(0)

                    ext = ".jpg" if fmt == "jpg" else f".{fmt}"
                    target = rel.with_suffix(ext)
                    archive.writestr(str(target), converted.read())
            except Exception as exc:
                errors.append({"path": str(rel), "error": str(exc)})

        if errors:
            archive.writestr("_conversion-errors.json", json.dumps(errors, ensure_ascii=False, indent=2))

    return _zip_response(output, f"converted-{fmt}.zip")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
