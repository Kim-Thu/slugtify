"use client";

import { GlassCard } from "@/components/GlassCard";
import { PageWrapper } from "@/components/PageWrapper";
import { SectionHeader } from "@/components/SectionHeader";
import { useFileRename } from "@/hooks/useFileRename";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/utils/cn";
import { AlertCircle, ChevronRight, File, Folder, Hash } from "lucide-react";

export default function Home() {
    const { t } = useLanguage();
    const { paths, setPaths, outputPath, pattern, setPattern, files, loading, error, browse, analyze, executeRename } = useFileRename();

    const handleApply = async () => {
        const result = await executeRename();
        if (result?.success) {
            const msg = t.rename.status_success
                .replace("{success}", result.success.toString())
                .replace("{error}", (result.errors?.length || 0).toString());
            alert(msg);
        }
    };

    return (
        <PageWrapper maxWidth="max-w-5xl">
            <SectionHeader
                title={t.rename.title}
                highlight={t.rename.highlight}
                subtitle={t.rename.subtitle}
                className="mb-8"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard
                    hoverable
                    onClick={() => browse("input_folder")}
                    className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-blue-500/40"
                >
                    <div className="bg-blue-500/20 p-5 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <Folder className="w-10 h-10 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-center">{t.rename.select_folder}</h3>
                    <p className="text-gray-500 text-sm text-center">{t.rename.select_folder_sub}</p>
                </GlassCard>

                <GlassCard
                    hoverable
                    onClick={() => browse("input_files")}
                    className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-emerald-500/40"
                >
                    <div className="bg-emerald-500/20 p-5 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <File className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-center">{t.rename.select_files}</h3>
                    <p className="text-gray-500 text-sm text-center">{t.rename.select_files_sub}</p>
                </GlassCard>
            </div>

            <div className="space-y-4">
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <label className="text-sm font-bold text-blue-400 uppercase tracking-widest ml-1">
                            {t.rename.pattern_label}
                        </label>
                        <span className="text-[10px] text-gray-500 font-mono italic">{t.rename.pattern_hint}</span>
                    </div>
                    <div className="glass p-1.5 rounded-2xl flex gap-4 items-center bg-blue-500/10 border-blue-500/20 shadow-2xl shadow-blue-500/5">
                        <div className="pl-4">
                            <Hash className="w-6 h-6 text-blue-500/50" />
                        </div>
                        <input
                            type="text"
                            value={pattern}
                            onChange={(e) => {
                                setPattern(e.target.value);
                                analyze(paths, e.target.value);
                            }}
                            placeholder={t.rename.placeholder_pattern}
                            className="flex-1 bg-transparent py-4 outline-none font-mono text-xl text-white placeholder:text-gray-600"
                        />
                        <div className="pr-6 space-y-1 hidden sm:block border-l border-white/5 pl-6">
                            <div className="flex items-center gap-2">
                                <code className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-[10px]">{"{n}"}</code>
                                <span className="text-[10px] text-gray-500">Numbering (1, 2, 3...)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px]">{"{slug}"}</code>
                                <span className="text-[10px] text-gray-500">Original Cleaned Slug</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-2">{t.rename.source_path}</label>
                        <div className="glass p-2 rounded-2xl flex gap-2 bg-white/5">
                            <input
                                type="text"
                                value={paths.join("; ") || ""}
                                readOnly
                                placeholder={t.rename.error_no_selection}
                                className="flex-1 bg-transparent py-2 px-4 outline-none font-mono text-xs truncate"
                            />
                            <button onClick={() => browse("input_folder")} className="bg-white/10 hover:bg-white/20 px-4 rounded-xl transition-colors text-xs font-bold">
                                {t.rename.browse_folder}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-2">{t.rename.target_path}</label>
                        <div className="glass p-2 rounded-2xl flex gap-2 bg-white/5">
                            <input
                                type="text"
                                value={outputPath}
                                placeholder={t.html_cleaner.step_2_overwrite}
                                className="flex-1 bg-transparent py-2 px-4 outline-none font-mono text-xs"
                                readOnly
                            />
                            <button onClick={() => browse("output")} className="bg-blue-600 hover:bg-blue-500 px-6 rounded-xl transition-colors text-xs font-bold shadow-lg shadow-blue-500/20">
                                {t.rename.browse_target}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 animate-shake">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {files.length > 0 && (
                <GlassCard className="p-0 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Hash className="w-4 h-4" /> {t.rename.summary.replace("{count}", files.length.toString())}
                        </span>
                        <button
                            onClick={handleApply}
                            disabled={loading || files.every(f => f.original === f.slugified)}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-8 py-2 rounded-lg font-bold transition-all shadow-lg shadow-emerald-900/20"
                        >
                            {loading ? t.common.loading : t.rename.apply_changes}
                        </button>
                    </div>

                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-black/80 backdrop-blur-md z-10 text-xs uppercase text-gray-500 border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4">{t.rename.col_original}</th>
                                    <th className="px-6 py-4 w-10"></th>
                                    <th className="px-6 py-4">{t.rename.col_new}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {files.map((file, idx) => {
                                    const changed = file.original !== file.slugified;
                                    return (
                                        <tr key={idx} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                {file.is_directory ? <Folder className="w-4 h-4 text-amber-400" /> : <File className="w-4 h-4 text-blue-400" />}
                                                <span className="text-sm font-mono truncate max-w-xs">{file.original}</span>
                                            </td>
                                            <td className="px-2 py-4">
                                                <ChevronRight className={cn("w-4 h-4", changed ? "text-emerald-500" : "text-gray-800")} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn("text-sm font-mono truncate max-w-xs", changed ? "text-emerald-400 font-bold" : "text-gray-600")}>
                                                    {file.slugified}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            )}
        </PageWrapper>
    );
}
