"use client";

import { GlassCard } from "@/components/GlassCard";
import { PageWrapper } from "@/components/PageWrapper";
import { SectionHeader } from "@/components/SectionHeader";
import { useLanguage } from "@/hooks/useLanguage";
import { apiClient } from "@/utils/api";
import { downloadBlob, pickFiles } from "@/utils/filePicker";
import { FileImage, FolderOpen, Images } from "lucide-react";
import { useMemo, useState } from "react";

type PreviewFile = {
  source: string;
  filename: string;
  output_filename: string;
  size: number;
};

const IMAGE_PATTERN = /\.(png|jpe?g|webp|bmp|tiff?)$/i;

export default function ImageConverterPage() {
  const { language } = useLanguage();
  const vi = language === "vi";

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [relativePaths, setRelativePaths] = useState<string[]>([]);
  const [format, setFormat] = useState("webp");
  const [quality, setQuality] = useState(85);
  const [recursive, setRecursive] = useState(true);
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const totalSize = useMemo(
    () => files.reduce((sum, file) => sum + file.size, 0),
    [files]
  );

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  };

  const makePreview = (sourceFiles: File[], paths: string[], nextFormat = format, includeSubfolders = recursive) => {
    const ext = nextFormat === "jpg" ? ".jpg" : `.${nextFormat}`;
    const preview: PreviewFile[] = [];

    sourceFiles.forEach((file, index) => {
      const relative = paths[index] || file.name;
      const parts = relative.split("/").filter(Boolean);

      // webkitdirectory returns root/file for top-level files.
      if (!includeSubfolders && parts.length > 2) return;

      const outputName = file.name.replace(/\.[^.]+$/, "") + ext;
      preview.push({
        source: relative,
        filename: file.name,
        output_filename: outputName,
        size: file.size,
      });
    });

    setFiles(preview);
  };

  const chooseSource = async (mode: "folder" | "files") => {
    setMessage("");
    const picked = await pickFiles({
      directory: mode === "folder",
      multiple: true,
      accept: mode === "files" ? "image/png,image/jpeg,image/webp,image/bmp,image/tiff,.tif,.tiff" : undefined,
    });

    const accepted = picked.files
      .map((file, index) => ({ file, path: picked.relativePaths[index] }))
      .filter(({ file }) => IMAGE_PATTERN.test(file.name));

    if (!accepted.length) {
      if (picked.files.length) {
        setMessage(vi ? "Không tìm thấy ảnh được hỗ trợ." : "No supported images found.");
      }
      return;
    }

    const nextFiles = accepted.map(({ file }) => file);
    const nextPaths = accepted.map(({ path }) => path);
    setSelectedFiles(nextFiles);
    setRelativePaths(nextPaths);
    makePreview(nextFiles, nextPaths);
  };

  const convert = async () => {
    if (!selectedFiles.length) return;

    const active = selectedFiles
      .map((file, index) => ({ file, path: relativePaths[index] || file.name }))
      .filter(({ path }) => recursive || path.split("/").filter(Boolean).length <= 2);

    if (!active.length) return;

    setLoading(true);
    setMessage("");
    try {
      const blob = await apiClient.webImageConvert(
        active.map(({ file }) => file),
        active.map(({ path }) => path),
        format,
        quality
      );
      downloadBlob(blob, `converted-${format}.zip`);
      setMessage(
        vi
          ? `Đã xử lý ${active.length} ảnh. Kết quả được tải về dưới dạng converted-${format}.zip.`
          : `Processed ${active.length} images. The result was downloaded as converted-${format}.zip.`
      );
    } catch (error: any) {
      setMessage(error?.message || (vi ? "Chuyển đổi thất bại." : "Conversion failed."));
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
            ? "Chọn nhiều ảnh hoặc cả thư mục ngay trong trình duyệt, xem trước rồi đổi định dạng hàng loạt."
            : "Select multiple images or a folder in the browser, preview, then convert them in bulk."
        }
        className="mb-8"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard
          hoverable
          onClick={() => chooseSource("folder")}
          className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-violet-500/40"
        >
          <div className="bg-violet-500/20 p-5 rounded-full mb-4">
            <FolderOpen className="w-10 h-10 text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {vi ? "Chọn thư mục ảnh" : "Select image folder"}
          </h3>
          <p className="text-gray-500 text-sm text-center">
            {vi ? "Mở bằng file picker của trình duyệt, không phụ thuộc hệ điều hành server" : "Uses the browser picker, independent of the server OS"}
          </p>
        </GlassCard>

        <GlassCard
          hoverable
          onClick={() => chooseSource("files")}
          className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-cyan-500/40"
        >
          <div className="bg-cyan-500/20 p-5 rounded-full mb-4">
            <Images className="w-10 h-10 text-cyan-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {vi ? "Chọn nhiều ảnh" : "Select multiple images"}
          </h3>
          <p className="text-gray-500 text-sm text-center">
            PNG, JPG, JPEG, WEBP, BMP, TIFF
          </p>
        </GlassCard>
      </div>

      <GlassCard className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">
              {vi ? "Ảnh đã chọn" : "Selected images"}
            </label>
            <div className="glass px-4 py-3 rounded-xl bg-white/5 text-sm">
              {selectedFiles.length
                ? (vi ? `${selectedFiles.length} ảnh` : `${selectedFiles.length} images`)
                : (vi ? "Chưa chọn ảnh" : "No images selected")}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">
              {vi ? "Định dạng đích" : "Target format"}
            </label>
            <select
              value={format}
              onChange={(e) => {
                const next = e.target.value;
                setFormat(next);
                makePreview(selectedFiles, relativePaths, next, recursive);
              }}
              className="w-full glass bg-black/30 rounded-xl px-4 py-3 outline-none"
            >
              <option value="webp">WEBP</option>
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
              <option value="bmp">BMP</option>
              <option value="tiff">TIFF</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">
              {vi ? "Chất lượng" : "Quality"}: {quality}
            </label>
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

        <div className="flex flex-wrap gap-6 text-sm text-gray-300">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={recursive}
              onChange={(e) => {
                const next = e.target.checked;
                setRecursive(next);
                makePreview(selectedFiles, relativePaths, format, next);
              }}
            />
            {vi ? "Bao gồm thư mục con" : "Include subfolders"}
          </label>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-300/90">
          {vi
            ? "Chế độ web không được phép xóa ảnh gốc trên máy của bạn. Ảnh gốc được giữ nguyên và kết quả được tải về dưới dạng ZIP."
            : "Web mode cannot delete source files on your computer. Originals stay untouched and converted files are downloaded as a ZIP."}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => chooseSource("folder")}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 font-bold"
          >
            {vi ? "Chọn lại" : "Choose again"}
          </button>
          <button
            onClick={convert}
            disabled={loading || !files.length}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-bold"
          >
            {loading ? (vi ? "Đang xử lý..." : "Processing...") : (vi ? "Chuyển đổi & tải ZIP" : "Convert & download ZIP")}
          </button>
        </div>

        {message && (
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
            {message}
          </div>
        )}
      </GlassCard>

      {files.length > 0 && (
        <GlassCard className="p-0 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5 flex flex-wrap justify-between gap-3">
            <span className="text-sm text-gray-400">
              {vi ? "Ảnh sẽ xử lý" : "Images to process"}: <strong className="text-white">{files.length}</strong>
              {" · "}
              {formatBytes(totalSize)}
            </span>
            <span className="text-sm text-gray-500">
              {vi ? "Đầu ra" : "Output"}: converted-{format}.zip
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
                        <span className="font-mono text-xs truncate max-w-[420px]" title={file.source}>
                          {file.source}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">{formatBytes(file.size)}</td>
                    <td className="px-5 py-4 font-mono text-xs text-emerald-400">
                      {file.output_filename}
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
