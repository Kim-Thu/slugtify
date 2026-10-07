"use client";

import { GlassCard } from "@/components/GlassCard";
import { PageWrapper } from "@/components/PageWrapper";
import { SectionHeader } from "@/components/SectionHeader";
import { useLanguage } from "@/hooks/useLanguage";
import { FileImage, FolderOpen, Images, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

type AnyFileHandle = any;
type AnyDirectoryHandle = any;

type SelectedImage = {
  file: File;
  handle: AnyFileHandle;
  parent?: AnyDirectoryHandle;
  relativePath: string;
};

type PreviewFile = {
  source: string;
  filename: string;
  output_filename: string;
  size: number;
};

const IMAGE_PATTERN = /\.(png|jpe?g|webp|bmp|tiff?)$/i;
const WRITABLE_FORMATS = ["webp", "jpg", "png"];

export default function ImageConverterPage() {
  const { language } = useLanguage();
  const vi = language === "vi";

  const [items, setItems] = useState<SelectedImage[]>([]);
  const [sourceDir, setSourceDir] = useState<AnyDirectoryHandle | null>(null);
  const [outputDir, setOutputDir] = useState<AnyDirectoryHandle | null>(null);
  const [format, setFormat] = useState("webp");
  const [quality, setQuality] = useState(85);
  const [recursive, setRecursive] = useState(true);
  const [overwrite, setOverwrite] = useState(false);
  const [deleteSource, setDeleteSource] = useState(false);
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const totalSize = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files]);

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  };

  const getExt = (target: string) => target === "jpg" ? ".jpg" : `.${target}`;

  const buildPreview = (nextItems: SelectedImage[], nextFormat = format) => {
    const ext = getExt(nextFormat);
    setFiles(nextItems.map((item) => ({
      source: item.relativePath,
      filename: item.file.name,
      output_filename: item.file.name.replace(/\.[^.]+$/, "") + ext,
      size: item.file.size,
    })));
  };

  const scanDirectory = async (
    dir: AnyDirectoryHandle,
    rootName: string,
    includeSubfolders: boolean,
    prefix = ""
  ): Promise<SelectedImage[]> => {
    const result: SelectedImage[] = [];

    for await (const [name, handle] of dir.entries()) {
      if (handle.kind === "file" && IMAGE_PATTERN.test(name)) {
        const file = await handle.getFile();
        result.push({
          file,
          handle,
          parent: dir,
          relativePath: prefix ? `${prefix}/${name}` : name,
        });
      } else if (handle.kind === "directory" && includeSubfolders) {
        const nestedPrefix = prefix ? `${prefix}/${name}` : name;
        result.push(...await scanDirectory(handle, rootName, true, nestedPrefix));
      }
    }

    return result;
  };

  const ensureSupportedBrowser = () => {
    const w = window as any;
    if (!w.showDirectoryPicker || !w.showOpenFilePicker) {
      throw new Error(
        vi
          ? "Trình duyệt này chưa hỗ trợ File System Access API. Hãy dùng Chrome hoặc Edge desktop."
          : "This browser does not support the File System Access API. Use desktop Chrome or Edge."
      );
    }
    return w;
  };

  const chooseFolder = async () => {
    setMessage("");
    try {
      const w = ensureSupportedBrowser();
      const dir = await w.showDirectoryPicker({ mode: "readwrite" });
      const selected = await scanDirectory(dir, dir.name, recursive);
      setSourceDir(dir);
      setItems(selected);
      buildPreview(selected);
      if (!selected.length) {
        setMessage(vi ? "Không tìm thấy ảnh được hỗ trợ." : "No supported images found.");
      }
    } catch (error: any) {
      if (error?.name !== "AbortError") setMessage(error?.message || String(error));
    }
  };

  const chooseFiles = async () => {
    setMessage("");
    try {
      const w = ensureSupportedBrowser();
      const handles: AnyFileHandle[] = await w.showOpenFilePicker({
        multiple: true,
        types: [{
          description: "Images",
          accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"],
          },
        }],
      });

      const selected: SelectedImage[] = [];
      for (const handle of handles) {
        const file = await handle.getFile();
        if (!IMAGE_PATTERN.test(file.name)) continue;
        selected.push({ file, handle, relativePath: file.name });
      }

      setSourceDir(null);
      setItems(selected);
      buildPreview(selected);
    } catch (error: any) {
      if (error?.name !== "AbortError") setMessage(error?.message || String(error));
    }
  };

  const chooseOutput = async () => {
    setMessage("");
    try {
      const w = ensureSupportedBrowser();
      const dir = await w.showDirectoryPicker({ mode: "readwrite" });
      setOutputDir(dir);
    } catch (error: any) {
      if (error?.name !== "AbortError") setMessage(error?.message || String(error));
    }
  };

  const refreshFolder = async (nextRecursive = recursive) => {
    if (!sourceDir) return;
    const selected = await scanDirectory(sourceDir, sourceDir.name, nextRecursive);
    setItems(selected);
    buildPreview(selected);
  };

  const canvasConvert = async (file: File, targetFormat: string, q: number): Promise<Blob> => {
    if (!WRITABLE_FORMATS.includes(targetFormat)) {
      throw new Error(
        vi
          ? `Trình duyệt không thể ghi trực tiếp định dạng ${targetFormat.toUpperCase()} mà không dùng thư viện bổ sung.`
          : `The browser cannot write ${targetFormat.toUpperCase()} directly without an additional codec.`
      );
    }

    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available.");

    if (targetFormat === "jpg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const mime =
      targetFormat === "jpg"
        ? "image/jpeg"
        : targetFormat === "png"
          ? "image/png"
          : "image/webp";

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("Image encoding failed.")),
        mime,
        Math.max(0.01, Math.min(1, q / 100))
      );
    });
  };

  const getOutputParent = async (item: SelectedImage): Promise<AnyDirectoryHandle> => {
    if (outputDir) {
      let current = outputDir;
      const parts = item.relativePath.split("/").slice(0, -1);
      for (const part of parts) {
        current = await current.getDirectoryHandle(part, { create: true });
      }
      return current;
    }

    if (item.parent) {
      return item.parent;
    }

    if (sourceDir) return sourceDir;

    if (!outputDir) {
      throw new Error(
        vi
          ? "Khi chọn từng file riêng lẻ, hãy chọn thư mục đích để trình duyệt có quyền ghi file."
          : "When selecting individual files, choose an output folder so the browser has write permission."
      );
    }

    return outputDir;
  };

  const convert = async () => {
    if (!items.length) return;

    setLoading(true);
    setMessage("");

    let success = 0;
    let skipped = 0;
    let deleted = 0;
    const errors: string[] = [];

    try {
      for (const item of items) {
        try {
          const blob = await canvasConvert(item.file, format, quality);
          const parent = await getOutputParent(item);
          const outputName = item.file.name.replace(/\.[^.]+$/, "") + getExt(format);

          if (!overwrite) {
            try {
              await parent.getFileHandle(outputName);
              skipped += 1;
              continue;
            } catch {
              // File does not exist; safe to create.
            }
          }

          const outHandle = await parent.getFileHandle(outputName, { create: true });
          const writable = await outHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          success += 1;

          if (deleteSource && outputName !== item.file.name) {
            try {
              if (item.parent) {
                await item.parent.removeEntry(item.file.name);
                deleted += 1;
              } else if (typeof item.handle?.remove === "function") {
                await item.handle.remove();
                deleted += 1;
              }
            } catch (deleteError: any) {
              errors.push(`${item.file.name}: ${deleteError?.message || deleteError}`);
            }
          }
        } catch (error: any) {
          errors.push(`${item.file.name}: ${error?.message || error}`);
        }
      }

      setMessage(
        vi
          ? `Đã chuyển ${success} ảnh. Đã xóa ảnh gốc: ${deleted}. Bỏ qua: ${skipped}. Lỗi: ${errors.length}.`
          : `Converted ${success} images. Deleted originals: ${deleted}. Skipped: ${skipped}. Errors: ${errors.length}.`
      );

      if (sourceDir) {
        await refreshFolder(recursive);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper maxWidth="max-w-6xl">
      <SectionHeader
        title="Image"
        highlight="Converter"
        subtitle={
          vi
            ? "Đọc và ghi ảnh trực tiếp trên máy bằng quyền của trình duyệt. Không upload file lên server."
            : "Read and write images directly on your computer using browser permissions. Files are not uploaded."
        }
        className="mb-8"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard
          hoverable
          onClick={chooseFolder}
          className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-violet-500/40"
        >
          <div className="bg-violet-500/20 p-5 rounded-full mb-4">
            <FolderOpen className="w-10 h-10 text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{vi ? "Chọn thư mục ảnh" : "Select image folder"}</h3>
          <p className="text-gray-500 text-sm text-center">{vi ? "Đọc/ghi trực tiếp trên máy" : "Direct local read/write"}</p>
        </GlassCard>

        <GlassCard
          hoverable
          onClick={chooseFiles}
          className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-cyan-500/40"
        >
          <div className="bg-cyan-500/20 p-5 rounded-full mb-4">
            <Images className="w-10 h-10 text-cyan-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{vi ? "Chọn nhiều ảnh" : "Select multiple images"}</h3>
          <p className="text-gray-500 text-sm text-center">PNG, JPG, JPEG, WEBP, BMP, TIFF</p>
        </GlassCard>
      </div>

      <GlassCard className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">{vi ? "Nguồn" : "Source"}</label>
            <div className="glass p-2 rounded-xl flex gap-2 bg-white/5">
              <input
                readOnly
                value={sourceDir?.name || (items.length ? `${items.length} file(s)` : "")}
                placeholder={vi ? "Chưa chọn ảnh" : "No images selected"}
                className="flex-1 bg-transparent px-3 py-2 outline-none text-xs font-mono truncate"
              />
              <button onClick={chooseFolder} className="px-4 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold">
                {vi ? "Chọn" : "Browse"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">{vi ? "Định dạng đích" : "Target format"}</label>
            <select
              value={format}
              onChange={(e) => {
                const next = e.target.value;
                setFormat(next);
                buildPreview(items, next);
              }}
              className="w-full glass bg-black/30 rounded-xl px-4 py-3 outline-none"
            >
              <option value="webp">WEBP</option>
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
              <option value="bmp" disabled>BMP (codec required)</option>
              <option value="tiff" disabled>TIFF (codec required)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">{vi ? "Chất lượng" : "Quality"}: {quality}</label>
            <input
              type="range"
              min="1"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full mt-4"
              disabled={!["jpg", "webp"].includes(format)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500">{vi ? "Thư mục đích" : "Output folder"}</label>
          <div className="glass p-2 rounded-xl flex gap-2 bg-white/5">
            <input
              readOnly
              value={outputDir?.name || ""}
              placeholder={vi ? "Để trống: ghi cạnh file gốc khi có quyền" : "Empty: write beside source when permitted"}
              className="flex-1 bg-transparent px-3 py-2 outline-none text-xs font-mono truncate"
            />
            <button onClick={chooseOutput} className="px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold">
              {vi ? "Chọn đích" : "Browse"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-gray-300">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={recursive}
              onChange={async (e) => {
                const next = e.target.checked;
                setRecursive(next);
                if (sourceDir) await refreshFolder(next);
              }}
            />
            {vi ? "Quét thư mục con" : "Include subfolders"}
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} />
            {vi ? "Ghi đè nếu file đích đã tồn tại" : "Overwrite existing output"}
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={deleteSource} onChange={(e) => setDeleteSource(e.target.checked)} />
            <span>
              {vi ? "Xóa ảnh gốc sau khi chuyển đổi thành công" : "Delete source images after successful conversion"}
              <span className="block text-[11px] text-amber-400/80">
                {vi ? "Chỉ xóa sau khi file mới đã ghi thành công." : "Only deletes after the new file is written successfully."}
              </span>
            </span>
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => sourceDir ? refreshFolder(recursive) : buildPreview(items)}
            disabled={loading || !items.length}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 font-bold flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {vi ? "Làm mới" : "Refresh"}
          </button>

          <button
            onClick={convert}
            disabled={loading || !files.length}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-bold"
          >
            {loading ? (vi ? "Đang xử lý..." : "Processing...") : (vi ? "Chuyển đổi tất cả" : "Convert all")}
          </button>
        </div>

        {message && (
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">{message}</div>
        )}
      </GlassCard>

      {files.length > 0 && (
        <GlassCard className="p-0 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5 flex flex-wrap justify-between gap-3">
            <span className="text-sm text-gray-400">
              {vi ? "Ảnh tìm thấy" : "Images found"}: <strong className="text-white">{files.length}</strong>
              {" · "}{formatBytes(totalSize)}
            </span>
          </div>

          <div className="overflow-auto max-h-[520px]">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-black/90 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">{vi ? "Ảnh gốc" : "Source"}</th>
                  <th className="px-5 py-4">{vi ? "Kích thước" : "Size"}</th>
                  <th className="px-5 py-4">{vi ? "File mới" : "Output"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {files.map((file) => (
                  <tr key={file.source} className="hover:bg-white/5">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileImage className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="font-mono text-xs truncate max-w-[420px]" title={file.source}>{file.source}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">{formatBytes(file.size)}</td>
                    <td className="px-5 py-4 font-mono text-xs text-emerald-400">{file.output_filename}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </PageWrapper>
  );
}
