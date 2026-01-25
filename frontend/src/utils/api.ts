const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export const apiClient = {
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
