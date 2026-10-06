from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

import os
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
    import tkinter as tk
    from tkinter import filedialog
    
    root = tk.Tk()
    root.withdraw()
    root.attributes('-topmost', True)
    
    paths = []
    if mode == "folder":
        path = filedialog.askdirectory(title="Chọn thư mục chứa tệp")
        if path:
            paths = [path]
    else:
        # mode == "files"
        selected = filedialog.askopenfilenames(
            title="Chọn một hoặc nhiều tệp",
            filetypes=[("All Files", "*.*")]
        )
        if selected:
            paths = list(selected)
            
    root.destroy()
    return {"paths": paths}

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
