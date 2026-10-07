const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export const apiClient = {

  async webRenameAnalyze(files: File[], relativePaths: string[], pattern: string = "{slug}") {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    relativePaths.forEach((path) => form.append("relative_paths", path));
    form.append("pattern", pattern);
    const res = await fetch(`${API_BASE}/web/rename/analyze`, { method: "POST", body: form });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async webRenameExecute(files: File[], relativePaths: string[], renames: any[]) {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    relativePaths.forEach((path) => form.append("relative_paths", path));
    form.append("renames", JSON.stringify(renames));
    const res = await fetch(`${API_BASE}/web/rename/execute`, { method: "POST", body: form });
    if (!res.ok) throw new Error(await res.text());
    return res.blob();
  },

  async webHtmlAnalyze(files: File[], relativePaths: string[], options: Record<string, any>) {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    relativePaths.forEach((path) => form.append("relative_paths", path));
    form.append("options", JSON.stringify(options));
    const res = await fetch(`${API_BASE}/web/html/analyze`, { method: "POST", body: form });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async webHtmlExecute(files: File[], relativePaths: string[], options: Record<string, any>) {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    relativePaths.forEach((path) => form.append("relative_paths", path));
    form.append("options", JSON.stringify(options));
    const res = await fetch(`${API_BASE}/web/html/execute`, { method: "POST", body: form });
    if (!res.ok) throw new Error(await res.text());
    return res.blob();
  },

  async webImageConvert(files: File[], relativePaths: string[], targetFormat: string, quality: number = 85) {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    relativePaths.forEach((path) => form.append("relative_paths", path));
    form.append("target_format", targetFormat);
    form.append("quality", quality.toString());
    const res = await fetch(`${API_BASE}/web/image/convert`, { method: "POST", body: form });
    if (!res.ok) throw new Error(await res.text());
    return res.blob();
  },

  async browse(mode: "folder" | "files" = "folder") {
    const res = await fetch(`${API_BASE}/browse?mode=${mode}`);
    return res.json();
  },

  async analyze(paths: string[], pattern: string = "{slug}") {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths, pattern }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async rename(path: string, renames: any[], targetPath?: string) {
    const res = await fetch(`${API_BASE}/rename`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, renames, target_path: targetPath }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async imageAnalyze(paths: string[], targetFormat: string, outputDir?: string, recursive: boolean = true) {
    const res = await fetch(`${API_BASE}/image/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paths,
        target_format: targetFormat,
        output_dir: outputDir || null,
        recursive,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async imageConvert(
    paths: string[],
    targetFormat: string,
    outputDir?: string,
    quality: number = 85,
    recursive: boolean = true,
    overwrite: boolean = false,
    deleteSource: boolean = false,
  ) {
    const res = await fetch(`${API_BASE}/image/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paths,
        target_format: targetFormat,
        output_dir: outputDir || null,
        quality,
        recursive,
        overwrite,
        delete_source: deleteSource,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async htmlAnalyze(paths: string[], options: Record<string, boolean>) {
    const res = await fetch(`${API_BASE}/html/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths, options }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async htmlExecute(paths: string[], options: Record<string, boolean>, outputDir?: string) {
    const res = await fetch(`${API_BASE}/html/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths, options, output_dir: outputDir }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async htmlCleanText(text: string, options: Record<string, boolean>) {
    const res = await fetch(`${API_BASE}/html/clean-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, options }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};
