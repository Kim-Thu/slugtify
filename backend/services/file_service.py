import os
from typing import List, Dict
from .naming_strategy import NamingStrategy

class FileSystemService:
    def __init__(self, strategy: NamingStrategy):
        self.strategy = strategy

    def scan_directory(self, path: str, pattern: str = "{slug}", start_index: int = 0) -> List[Dict]:
        if not os.path.isdir(path):
            raise ValueError("Path is not a valid directory")
            
        results = []
        try:
            entries = sorted(list(os.scandir(path)), key=lambda e: e.name)
            for i, entry in enumerate(entries):
                idx = start_index + i
                results.append({
                    "original": entry.name,
                    "slugified": self.strategy.transform(entry.name, entry.is_dir(), idx, pattern),
                    "is_directory": entry.is_dir(),
                    "base_dir": path
                })
        except Exception as e:
            raise e
        return results

    def bulk_rename(self, source_path: str, renames: List[Dict], target_path: str = None) -> Dict:
        import shutil
        success_count = 0
        errors = []
        
        # Determine if we are renaming in place
        in_place = target_path is None or os.path.abspath(source_path) == os.path.abspath(target_path)
        
        if not in_place and not os.path.exists(target_path):
            os.makedirs(target_path, exist_ok=True)

        for item in renames:
            # Use specific base_dir if provided, otherwise fallback to global source_path
            base = item.get('base_dir', source_path)
            old_full_path = os.path.join(base, item['original'])
            
            # Target base path
            dest_base = target_path if not in_place else base
            new_full_path = os.path.join(dest_base, item['slugified'])
            
            if old_full_path == new_full_path:
                continue
                
            try:
                if os.path.exists(new_full_path):
                    errors.append(f"Skipped {item['original']}: Target exists")
                    continue
                
                if in_place:
                    os.rename(old_full_path, new_full_path)
                else:
                    if os.path.isdir(old_full_path):
                        shutil.copytree(old_full_path, new_full_path)
                    else:
                        shutil.copy2(old_full_path, new_full_path)
                
                success_count += 1
            except Exception as e:
                errors.append(f"Error {item['original']}: {str(e)}")
                
        return {"success": success_count, "errors": errors}

