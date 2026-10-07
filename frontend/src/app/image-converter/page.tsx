"use client";

import { GlassCard } from "@/components/GlassCard";
import { PageWrapper } from "@/components/PageWrapper";
import { SectionHeader } from "@/components/SectionHeader";
import { useLanguage } from "@/hooks/useLanguage";
import { apiClient } from "@/utils/api";
import { FileImage, FolderOpen, Images, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

type PreviewFile = {
  source: string;
  filename: string;
  output: string;
  output_filename: string;
  size: number;
  exists: boolean;
};

export default function ImageConverterPage() {
  const { language } = useLanguage();
  const vi = language === "vi";

  const [paths, setPaths] = useState<string[]>([]);
  const [outputDir, setOutputDir] = useState("");
  const [format, setFormat] = useState("webp");
  const [quality, setQuality] = useState(85);
  const [recursive, setRecursive] = useState(true);
  const [overwrite, setOverwrite] = useState(false);
  const [deleteSource, setDeleteSource] = useState(false);
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

  const chooseSource = async (mode: "folder" | "files") => {
    setMessage("");
    const result = await apiClient.browse(mode);
    if (result.paths?.length) {
      setPaths(result.paths);
      setFiles([]);
    }
  };

  const chooseOutput = async () => {
    const result = await apiClient.browse("folder");
    if (result.paths?.[0]) {
      setOutputDir(result.paths[0]);
      setFiles([]);
    }
  };

  const analyze = async () => {
    if (!paths.length) {
      setMessage(vi ? "Vui lòng chọn thư mục hoặc ảnh trước." : "Select a folder or images first.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const result = await apiClient.imageAnalyze(paths, format, outputDir || undefined, recursive);
      setFiles(result.files || []);
      if (!result.files?.length) {
        setMessage(vi ? "Không tìm thấy ảnh được hỗ trợ." : "No supported images found.");
      }
    } catch (error: any) {
      setMessage(error?.message || (vi ? "Không thể phân tích ảnh." : "Unable to analyze images."));
    } finally {
      setLoading(false);
    }
  };

  const convert = async () => {
    if (!paths.length) return;

    setLoading(true);
    setMessage("");
    try {
      const result = await apiClient.imageConvert(
        paths,
        format,
        outputDir || undefined,
        quality,
        recursive,
        overwrite,
        deleteSource
      );
      setMessage(
        vi
          ? `Đã chuyển ${result.success} ảnh. Đã xóa ảnh gốc: ${result.deleted || 0}. Bỏ qua ${result.skipped || 0}. Lỗi ${(result.errors?.length || 0) + (result.delete_errors?.length || 0)}.`
          : `Converted ${result.success} images. Deleted originals: ${result.deleted || 0}. Skipped ${result.skipped || 0}. Errors ${(result.errors?.length || 0) + (result.delete_errors?.length || 0)}.`
      );
      await analyze();
    } catch (error: any) {
      setMessage(error?.message || (vi ? "Chuyển đổi thất bại." : "Conversion failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper maxWidth="max-w-6xl">
      <SectionHeader
        title={vi ? "Image" : "Image"}
        highlight={vi ? "Converter" : "Converter"}
        subtitle={
          vi
            ? "Chọn nhiều ảnh hoặc cả thư mục, xem trước rồi đổi định dạng hàng loạt."
            : "Select multiple images or a folder, preview, then convert them in bulk."
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
            {vi ? "Có thể quét cả thư mục con" : "Can include subfolders"}
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">
              {vi ? "Nguồn" : "Source"}
            </label>
            <div className="glass p-2 rounded-xl flex gap-2 bg-white/5">
              <input
                readOnly
                value={paths.join("; ")}
                placeholder={vi ? "Chưa chọn ảnh" : "No images selected"}
                className="flex-1 bg-transparent px-3 py-2 outline-none text-xs font-mono truncate"
              />
              <button
                onClick={() => chooseSource("folder")}
                className="px-4 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold"
              >
                {vi ? "Chọn" : "Browse"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">
              {vi ? "Định dạng đích" : "Target format"}
            </label>
            <select
              value={format}
              onChange={(e) => {
                setFormat(e.target.value);
                setFiles([]);
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

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500">
            {vi ? "Thư mục đích" : "Output folder"}
          </label>
          <div className="glass p-2 rounded-xl flex gap-2 bg-white/5">
            <input
              readOnly
              value={outputDir}
              placeholder={
                vi
                  ? "Để trống: tự tạo thư mục converted-{format}"
                  : "Empty: auto-create converted-{format}"
              }
              className="flex-1 bg-transparent px-3 py-2 outline-none text-xs font-mono truncate"
            />
            <button
              onClick={chooseOutput}
              className="px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold"
            >
              {vi ? "Chọn đích" : "Browse"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-gray-300">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={recursive}
              onChange={(e) => {
                setRecursive(e.target.checked);
                setFiles([]);
              }}
            />
            {vi ? "Quét thư mục con" : "Include subfolders"}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={overwrite}
              onChange={(e) => setOverwrite(e.target.checked)}
            />
            {vi ? "Ghi đè nếu file đích đã tồn tại" : "Overwrite existing output"}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={deleteSource}
              onChange={(e) => setDeleteSource(e.target.checked)}
            />
            {vi ? "Xóa ảnh gốc sau khi chuyển đổi thành công" : "Delete source images after successful conversion"}
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={analyze}
            disabled={loading || !paths.length}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 font-bold flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {vi ? "Xem trước" : "Preview"}
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
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
            {message}
          </div>
        )}
      </GlassCard>

      {files.length > 0 && (
        <GlassCard className="p-0 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5 flex flex-wrap justify-between gap-3">
            <span className="text-sm text-gray-400">
              {vi ? "Ảnh tìm thấy" : "Images found"}: <strong className="text-white">{files.length}</strong>
              {" · "}
              {formatBytes(totalSize)}
            </span>
            <span className="text-sm text-gray-400">
              {vi ? "Trùng file đích" : "Existing outputs"}:{" "}
              <strong className={files.some((file) => file.exists) ? "text-amber-400" : "text-emerald-400"}>
                {files.filter((file) => file.exists).length}
              </strong>
            </span>
          </div>

          <div className="overflow-auto max-h-[520px]">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-black/90 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">{vi ? "Ảnh gốc" : "Source"}</th>
                  <th className="px-5 py-4">{vi ? "Kích thước" : "Size"}</th>
                  <th className="px-5 py-4">{vi ? "File mới" : "Output"}</th>
                  <th className="px-5 py-4">{vi ? "Trạng thái" : "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {files.map((file) => (
                  <tr key={file.source} className="hover:bg-white/5">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileImage className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="font-mono text-xs truncate max-w-[360px]" title={file.source}>
                          {file.filename}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">{formatBytes(file.size)}</td>
                    <td className="px-5 py-4 font-mono text-xs text-emerald-400">
                      {file.output_filename}
                    </td>
                    <td className="px-5 py-4 text-xs">
                      {file.exists ? (
                        <span className="text-amber-400">{vi ? "Đã tồn tại" : "Exists"}</span>
                      ) : (
                        <span className="text-gray-500">{vi ? "Sẵn sàng" : "Ready"}</span>
                      )}
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
