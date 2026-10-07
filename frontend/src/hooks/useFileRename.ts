import { apiClient } from "@/utils/api";
import { downloadBlob, pickFiles } from "@/utils/filePicker";
import { useState } from "react";

export interface FileEntry {
  original: string;
  slugified: string;
  is_directory: boolean;
  base_dir?: string;
  relative_path?: string;
}

export const useFileRename = () => {
  const [paths, setPaths] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [relativePaths, setRelativePaths] = useState<string[]>([]);
  const [outputPath, setOutputPath] = useState("");
  const [pattern, setPattern] = useState("{slug}");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const browse = async (target: "input_folder" | "input_files" | "output" = "input_folder") => {
    if (target === "output") {
      setOutputPath("renamed-files.zip");
      return;
    }

    const picked = await pickFiles({
      directory: target === "input_folder",
      multiple: true,
    });

    if (!picked.files.length) return;

    setSelectedFiles(picked.files);
    setRelativePaths(picked.relativePaths);
    setPaths(picked.relativePaths);
    await analyze(picked.files, picked.relativePaths, pattern);
  };

  const analyze = async (
    sourceFiles?: File[] | string[],
    sourceRelativePaths?: string[] | string,
    targetPattern?: string
  ) => {
    const actualFiles = Array.isArray(sourceFiles) && sourceFiles.length > 0 && sourceFiles[0] instanceof File
      ? sourceFiles as File[]
      : selectedFiles;

    let rels = relativePaths;
    let pat = pattern;

    if (Array.isArray(sourceRelativePaths)) rels = sourceRelativePaths;
    if (typeof sourceRelativePaths === "string") pat = sourceRelativePaths;
    if (targetPattern) pat = targetPattern;

    if (actualFiles.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.webRenameAnalyze(actualFiles, rels, pat);
      setFiles(data.files);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const executeRename = async () => {
    if (files.length === 0 || selectedFiles.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const renames = files
        .filter(f => f.original !== f.slugified)
        .map(f => ({
          original: f.original,
          slugified: f.slugified,
          base_dir: f.base_dir || ""
        }));

      const blob = await apiClient.webRenameExecute(selectedFiles, relativePaths, renames);
      downloadBlob(blob, "renamed-files.zip");

      const result = { success: selectedFiles.length, errors: [] };
      setPaths([]);
      setSelectedFiles([]);
      setRelativePaths([]);
      setFiles([]);
      return result;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    paths,
    setPaths,
    outputPath,
    setOutputPath,
    pattern,
    setPattern,
    files,
    loading,
    error,
    browse,
    analyze,
    executeRename
  };
};
