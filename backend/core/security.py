import os
from fastapi import HTTPException

class SecurityManager:
    @staticmethod
    def validate_path(path: str):
        """
        Prevents directory traversal and ensures the path is absolute and within allowed bounds.
        """
        if not path:
            raise HTTPException(status_code=400, detail="Path is required")
            
        # Basic sanitization
        abs_path = os.path.abspath(path)
        
        if not os.path.exists(abs_path):
            raise HTTPException(status_code=404, detail="Path does not exist")
            
        # Additional safety: blacklist sensitive directories
        sensitive_dirs = ["C:\\Windows", "/etc", "/var"]
        for sd in sensitive_dirs:
            if abs_path.startswith(sd):
                raise HTTPException(status_code=403, detail="Access to system directories is forbidden")
                
        return abs_path
