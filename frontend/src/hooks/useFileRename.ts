import { apiClient } from "@/utils/api";
import { useState } from "react";

export interface FileEntry {
  original: string;
  slugified: string;
  is_directory: boolean;
  base_dir?: string;
}

export const useFileRename = () => {
  const [paths, setPaths] = useState<string[]>([]);
  const [outputPath, setOutputPath] = useState("");
  const [pattern, setPattern] = useState("{slug}");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const browse = async (target: "input_folder" | "input_files" | "output" = "input_folder") => {
    const mode = target === "input_files" ? "files" : "folder";
    const data = await apiClient.browse(mode);
    if (data.paths && data.paths.length > 0) {
      if (target === "output") {
        setOutputPath(data.paths[0]);
      } else {
        setPaths(data.paths);
        await analyze(data.paths, pattern);
      }
    }
  };

  const analyze = async (targetPaths?: string[], targetPattern?: string) => {
    const ps = targetPaths || paths;
    const pat = targetPattern || pattern;
    if (ps.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.analyze(ps, pat);
      setFiles(data.files);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const executeRename = async () => {
    if (files.length === 0) return;
    setLoading(true);
    try {
      const renames = files
        .filter(f => f.original !== f.slugified)
        .map(f => ({ 
          original: f.original, 
          slugified: f.slugified, 
          base_dir: f.base_dir 
        }));

      const result = await apiClient.rename(paths[0], renames, outputPath);
      
      // Success: Clear state
      setPaths([]);
      setFiles([]);
      return result;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { paths, setPaths, outputPath, setOutputPath, pattern, setPattern, files, loading, error, browse, analyze, executeRename };
};
