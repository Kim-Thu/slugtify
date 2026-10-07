"use client";

import { GlassCard } from "@/components/GlassCard";
import { PageWrapper } from "@/components/PageWrapper";
import { SectionHeader } from "@/components/SectionHeader";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Check,
  ChevronDown,
  CircleAlert,
  FileImage,
  FolderOpen,
  Images,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { useMemo, useState } from "react";

type AnyFileHandle = any;
type AnyDirectoryHandle = any;

type SelectedImage = {
  file: File;
  handle: AnyFileHandle;
  parent?: AnyDirectoryHandle;
  relativePath: string;
};

type QueueStatus = "waiting" | "processing" | "success" | "skipped" | "error";

type PreviewFile = {
  source: string;
  filename: string;
  output_filename: string;
  size: number;
  status: QueueStatus;
  progress: number;
  error?: string;
};

type StyledCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void | Promise<void>;
  label: React.ReactNode;
};

const IMAGE_PATTERN = /\.(png|jpe?g|webp|bmp|tiff?)$/i;
const WRITABLE_FORMATS = ["webp", "jpg", "png"];

function StyledCheckbox({ checked, onChange, label }: StyledCheckboxProps) {
  return (
    <label className="group flex cursor-pointer items-start gap-2.5 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        className={
          "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-all " +
          (checked
            ? "border-blue-500 bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
            : "border-white/20 bg-white/[0.05] group-hover:border-white/35 group-hover:bg-white/[0.08]")
        }
      >
        {checked && <Check className="h-3 w-3 stroke-[3] text-white" />}
      </span>
      <span className="text-sm leading-5 text-gray-300 group-hover:text-white">{label}</span>
    </label>
  );
}

export default function ImageConverterPage() {
  const { language } = useLanguage();
  const vi = language === "vi";

  const [items, setItems] = useState<SelectedImage[]>([]);
  const [sourceDir, setSourceDir] = useState<AnyDirectoryHandle | null>(null);
  const [outputDir, setOutputDir] = useState<AnyDirectoryHandle | null>(null);
  const [format, setFormat] = useState("webp");
  const [formatOpen, setFormatOpen] = useState(false);
  const [quality, setQuality] = useState(85);
  const [recursive, setRecursive] = useState(true);
  const [overwrite, setOverwrite] = useState(false);
  const [deleteSource, setDeleteSource] = useState(false);
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const totalSize = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files]);
  const completedCount = useMemo(
    () => files.filter((file) => ["success", "skipped", "error"].includes(file.status)).length,
    [files]
  );
  const successCount = useMemo(() => files.filter((file) => file.status === "success").length, [files]);
  const skippedCount = useMemo(() => files.filter((file) => file.status === "skipped").length, [files]);
  const errorCount = useMemo(() => files.filter((file) => file.status === "error").length, [files]);
  const overallProgress = useMemo(() => {
    if (!files.length) return 0;
    return Math.round(files.reduce((sum, file) => sum + file.progress, 0) / files.length);
  }, [files]);

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
      status: "waiting",
      progress: 0,
    })));
  };

  const updateQueueItem = (index: number, patch: Partial<PreviewFile>) => {
    setFiles((current) => current.map((file, i) => i === index ? { ...file, ...patch } : file));
  };

  const scanDirectory = async (
    dir: AnyDirectoryHandle,
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
        result.push(...await scanDirectory(handle, true, nestedPrefix));
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
      const selected = await scanDirectory(dir, recursive);
      setSourceDir(dir);
      setOutputDir(null);
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
    if (!sourceDir) {
      buildPreview(items);
      return;
    }
    const selected = await scanDirectory(sourceDir, nextRecursive);
    setItems(selected);
    buildPreview(selected);
  };

  const canvasConvert = async (file: File, targetFormat: string, q: number): Promise<Blob> => {
    if (!WRITABLE_FORMATS.includes(targetFormat)) {
      throw new Error(
        vi
          ? `Trình duyệt chưa có encoder ${targetFormat.toUpperCase()}.`
          : `The browser does not have a ${targetFormat.toUpperCase()} encoder.`
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

    if (item.parent) return item.parent;
    if (sourceDir) return sourceDir;

    throw new Error(
      vi
        ? "Khi chọn từng file riêng lẻ, hãy chọn thư mục đích để trình duyệt có quyền ghi file."
        : "When selecting individual files, choose an output folder so the browser has write permission."
    );
  };

  const convert = async () => {
    if (!items.length) return;

    setLoading(true);
    setMessage("");
    setFiles((current) => current.map((file) => ({ ...file, status: "waiting", progress: 0, error: undefined })));

    let success = 0;
    let skipped = 0;
    let deleted = 0;
    let errors = 0;

    try {
      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        updateQueueItem(index, { status: "processing", progress: 10 });

        try {
          const parent = await getOutputParent(item);
          const outputName = item.file.name.replace(/\.[^.]+$/, "") + getExt(format);

          if (!overwrite) {
            try {
              await parent.getFileHandle(outputName);
              skipped += 1;
              updateQueueItem(index, { status: "skipped", progress: 100 });
              continue;
            } catch {
              // Output does not exist.
            }
          }

          updateQueueItem(index, { progress: 35 });
          const blob = await canvasConvert(item.file, format, quality);

          updateQueueItem(index, { progress: 70 });
          const outHandle = await parent.getFileHandle(outputName, { create: true });
          const writable = await outHandle.createWritable();
          await writable.write(blob);
          await writable.close();

          updateQueueItem(index, { progress: 90 });

          if (deleteSource && outputName !== item.file.name) {
            if (item.parent) {
              await item.parent.removeEntry(item.file.name);
              deleted += 1;
            } else if (typeof item.handle?.remove === "function") {
              await item.handle.remove();
              deleted += 1;
            }
          }

          success += 1;
          updateQueueItem(index, { status: "success", progress: 100 });
        } catch (error: any) {
          errors += 1;
          updateQueueItem(index, {
            status: "error",
            progress: 100,
            error: error?.message || String(error),
          });
        }
      }

      setMessage(
        vi
          ? `Hoàn tất ${success}/${items.length} ảnh. Đã xóa ảnh gốc: ${deleted}. Bỏ qua: ${skipped}. Lỗi: ${errors}.`
          : `Completed ${success}/${items.length} images. Deleted originals: ${deleted}. Skipped: ${skipped}. Errors: ${errors}.`
      );
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = (status: QueueStatus) => {
    if (vi) {
      return {
        waiting: "Chờ",
        processing: "Đang chuyển",
        success: "Hoàn tất",
        skipped: "Bỏ qua",
        error: "Lỗi",
      }[status];
    }

    return {
      waiting: "Waiting",
      processing: "Processing",
      success: "Done",
      skipped: "Skipped",
      error: "Error",
    }[status];
  };

  const statusClass = (status: QueueStatus) => ({
    waiting: "border-white/10 bg-white/[0.04] text-gray-400",
    processing: "border-blue-500/20 bg-blue-500/10 text-blue-300",
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    skipped: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    error: "border-red-500/20 bg-red-500/10 text-red-300",
  }[status]);

  const formatOptions = [
    { value: "webp", label: "WEBP" },
    { value: "jpg", label: "JPG" },
    { value: "png", label: "PNG" },
    { value: "bmp", label: "BMP", disabled: true },
    { value: "tiff", label: "TIFF", disabled: true },
  ];

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
            <div className="glass h-[50px] rounded-xl flex items-center gap-2 bg-white/5 px-2">
              <input
                readOnly
                value={sourceDir?.name || (items.length ? `${items.length} file(s)` : "")}
                placeholder={vi ? "Chưa chọn ảnh" : "No images selected"}
                className="min-w-0 flex-1 bg-transparent px-3 text-xs font-mono outline-none"
              />
              <button onClick={chooseFolder} className="h-9 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors">
                {vi ? "Chọn" : "Browse"}
              </button>
            </div>
          </div>

          <div className="relative space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">{vi ? "Định dạng đích" : "Target format"}</label>
            <button
              type="button"
              onClick={() => setFormatOpen((open) => !open)}
              className="flex h-[50px] w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm font-medium text-white outline-none transition-colors hover:bg-white/[0.07]"
            >
              <span>{format.toUpperCase()}</span>
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${formatOpen ? "rotate-180" : ""}`} />
            </button>

            {formatOpen && (
              <div className="absolute left-0 right-0 top-[76px] z-30 overflow-hidden rounded-xl border border-white/10 bg-[#171a24] p-1.5 shadow-2xl shadow-black/50">
                {formatOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => {
                      if (option.disabled) return;
                      setFormat(option.value);
                      buildPreview(items, option.value);
                      setFormatOpen(false);
                    }}
                    className={
                      "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors " +
                      (option.disabled
                        ? "cursor-not-allowed text-gray-600"
                        : option.value === format
                          ? "bg-blue-500/15 text-blue-300"
                          : "text-gray-300 hover:bg-white/[0.07] hover:text-white")
                    }
                  >
                    <span>{option.label}{option.disabled ? " · codec required" : ""}</span>
                    {option.value === format && !option.disabled && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">{vi ? "Chất lượng" : "Quality"}: {quality}</label>
            <div className="flex h-[50px] items-center">
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-blue-500"
                disabled={!["jpg", "webp"].includes(format)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500">{vi ? "Thư mục đích" : "Output folder"}</label>
          <div className="glass h-[50px] rounded-xl flex items-center gap-2 bg-white/5 px-2">
            <input
              readOnly
              value={outputDir?.name || ""}
              placeholder={vi ? "Để trống: ghi cạnh file gốc khi có quyền" : "Empty: write beside source when permitted"}
              className="min-w-0 flex-1 bg-transparent px-3 text-xs font-mono outline-none"
            />
            <button onClick={chooseOutput} className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold transition-colors">
              {vi ? "Chọn đích" : "Browse"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-x-7 gap-y-4">
          <StyledCheckbox
            checked={recursive}
            onChange={async (next) => {
              setRecursive(next);
              if (sourceDir) await refreshFolder(next);
            }}
            label={vi ? "Quét thư mục con" : "Include subfolders"}
          />

          <StyledCheckbox
            checked={overwrite}
            onChange={setOverwrite}
            label={vi ? "Ghi đè nếu file đích đã tồn tại" : "Overwrite existing output"}
          />

          <StyledCheckbox
            checked={deleteSource}
            onChange={setDeleteSource}
            label={
              <span>
                {vi ? "Xóa ảnh gốc sau khi chuyển đổi thành công" : "Delete source images after successful conversion"}
                <span className="block text-[11px] text-amber-400/80">
                  {vi ? "Chỉ xóa sau khi file mới đã ghi thành công." : "Only deletes after the new file is written successfully."}
                </span>
              </span>
            }
          />
        </div>

        {files.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <div className="font-medium text-white">
                {loading
                  ? (vi ? `Đang xử lý ${completedCount}/${files.length} ảnh` : `Processing ${completedCount}/${files.length} images`)
                  : (vi ? `Tổng cộng ${files.length} ảnh cần chuyển đổi` : `${files.length} images queued`)}
              </div>
              <div className="text-xs text-gray-400">
                {successCount} {vi ? "hoàn tất" : "done"} · {skippedCount} {vi ? "bỏ qua" : "skipped"} · {errorCount} {vi ? "lỗi" : "errors"}
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full bg-blue-500 transition-[width] duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="mt-2 text-right text-[11px] font-mono text-gray-500">{overallProgress}%</div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => sourceDir ? refreshFolder(recursive) : buildPreview(items)}
            disabled={loading || !items.length}
            className="h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 font-bold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {vi ? "Làm mới" : "Refresh"}
          </button>

          <button
            onClick={convert}
            disabled={loading || !files.length}
            className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-bold transition-colors"
          >
            {loading ? (vi ? "Đang chuyển đổi..." : "Converting...") : (vi ? `Chuyển đổi ${files.length} ảnh` : `Convert ${files.length} images`)}
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
              {vi ? "Danh sách chuyển đổi" : "Conversion queue"}: <strong className="text-white">{files.length}</strong>
              {" · "}{formatBytes(totalSize)}
            </span>
            <span className="text-xs text-gray-500">
              {completedCount}/{files.length} {vi ? "đã xử lý" : "processed"}
            </span>
          </div>

          <div className="overflow-auto max-h-[560px]">
            <table className="w-full text-left">
              <thead className="sticky top-0 z-10 bg-[#0c0e14] text-[11px] uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4">{vi ? "Ảnh gốc" : "Source"}</th>
                  <th className="px-5 py-4">{vi ? "Kích thước" : "Size"}</th>
                  <th className="px-5 py-4">{vi ? "File mới" : "Output"}</th>
                  <th className="px-5 py-4 min-w-[220px]">{vi ? "Tiến độ" : "Progress"}</th>
                  <th className="px-5 py-4">{vi ? "Trạng thái" : "Status"}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {files.map((file, index) => (
                  <tr key={file.source} className="hover:bg-white/[0.035]">
                    <td className="px-5 py-4">
                      <div className="flex min-w-0 items-center gap-2">
                        <FileImage className="h-4 w-4 shrink-0 text-cyan-400" />
                        <div className="min-w-0">
                          <div className="max-w-[330px] truncate font-mono text-xs text-gray-200" title={file.source}>
                            {file.source}
                          </div>
                          {file.error && (
                            <div className="mt-1 flex max-w-[330px] items-center gap-1 text-[11px] text-red-400">
                              <CircleAlert className="h-3 w-3 shrink-0" />
                              <span className="truncate" title={file.error}>{file.error}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs text-gray-400">{formatBytes(file.size)}</td>

                    <td className="px-5 py-4 font-mono text-xs text-emerald-400">{file.output_filename}</td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                          <div
                            className={
                              "h-full rounded-full transition-[width] duration-300 " +
                              (file.status === "error"
                                ? "bg-red-500"
                                : file.status === "skipped"
                                  ? "bg-amber-500"
                                  : "bg-blue-500")
                            }
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <span className="w-9 text-right font-mono text-[11px] text-gray-500">{file.progress}%</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusClass(file.status)}`}>
                        {file.status === "processing" && <LoaderCircle className="h-3 w-3 animate-spin" />}
                        {file.status === "success" && <Check className="h-3 w-3" />}
                        {file.status === "error" && <CircleAlert className="h-3 w-3" />}
                        {statusLabel(file.status)}
                      </span>
                    </td>
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
