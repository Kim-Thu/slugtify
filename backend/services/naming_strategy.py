from abc import ABC, abstractmethod
from slugify import slugify
import os

class NamingStrategy(ABC):
    @abstractmethod
    def transform(self, name: str, is_dir: bool, index: int, pattern: str = "{slug}") -> str:
        pass

class SlugNamingStrategy(NamingStrategy):
    def transform(self, name: str, is_dir: bool, index: int, pattern: str = "{slug}") -> str:
        base, ext = os.path.splitext(name)
        slug_value = slugify(base if not is_dir else name)
        
        # Replace tokens: {slug}, {n}
        new_name = pattern.replace("{slug}", slug_value).replace("{n}", str(index + 1))
        
        # If it's a file, ensure extension is preserved if wasn't in pattern
        if not is_dir and not pattern.endswith(ext.lower()):
            new_name = f"{new_name}{ext.lower()}"
            
        return new_name
