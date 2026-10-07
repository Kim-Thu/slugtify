"use client";

import { GlassCard } from "@/components/GlassCard";
import { PageWrapper } from "@/components/PageWrapper";
import { SectionHeader } from "@/components/SectionHeader";
import { useLanguage } from "@/hooks/useLanguage";
import { apiClient } from "@/utils/api";
import { cn } from "@/utils/cn";
import { formatSize } from "@/utils/format";
import { downloadBlob, pickFiles } from "@/utils/filePicker";
import { html } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";
import { Check, Copy, FileCode, Folder, Link, Settings, Zap } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

// Dynamic imports to prevent SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), { ssr: false });

interface HtmlFilePreview {
    path: string;
    filename: string;
    original_size: number;
    cleaned_size: number;
    preview: string;
    error?: string;
}

export default function HtmlCleanerPage() {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const [activeMode, setActiveMode] = useState<"file" | "paste">("file");
    const [paths, setPaths] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [relativePaths, setRelativePaths] = useState<string[]>([]);
    const [outputDir, setOutputDir] = useState("");
    const [files, setFiles] = useState<HtmlFilePreview[]>([]);
    const [pastedText, setPastedText] = useState("");
    const [cleanedText, setCleanedText] = useState("");
    const [loading, setLoading] = useState(false);

    // Initial mount check
    useEffect(() => {
        setMounted(true);
    }, []);

    // Watch for mode changes to reset state
    useEffect(() => {
        if (!mounted) return;
        setFiles([]);
        setCleanedText("");
    }, [activeMode, mounted]);

    const quillModules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean']
        ],
    }), []);

    const [options, setOptions] = useState({
        remove_scripts_styles: true,
        remove_comments: true,
        remove_attributes: false,
        remove_classes_ids: true,
        remove_inline_styles: true,
        remove_all_tags: false,
        remove_extra_whitespace: true,
        prettify: true,
        remove_spans: false,
        remove_empty_tags: true,
        remove_tags_with_nbsp: true,
        remove_successive_nbsp: true,
        remove_images: false,
        remove_links: false,
        remove_tables: false,
        replace_tables_with_divs: false,
        target_domain: "",
    });

    const toggleOption = (key: keyof typeof options) => {
        if (key === 'target_domain') return;
        setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handlePasteClean = async () => {
        if (!pastedText || pastedText === "<p><br></p>") {
            toast.error(t.html_cleaner.placeholder_paste);
            return;
        }

        const tId = toast.loading(t.common.loading);
        setLoading(true);

        try {
            const data = await apiClient.htmlCleanText(pastedText, options as any);
            if (data.cleaned) {
                setCleanedText(data.cleaned);
                toast.success(t.common.success, { id: tId });
            } else {
                toast.error(t.common.error, { id: tId });
            }
        } catch (err: any) {
            toast.error(err.message || t.common.error, { id: tId });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!cleanedText) return;
        navigator.clipboard.writeText(cleanedText);
        toast.success(t.common.copied);
    };

    const browse = async (target: "input" | "output") => {
        if (target === "output") {
            setOutputDir("cleaned-html.zip");
            toast.success(t.common.success);
            return;
        }

        const picked = await pickFiles({
            multiple: true,
            accept: ".html,.htm,text/html",
        });
        const htmlFiles = picked.files
            .map((file, index) => ({ file, path: picked.relativePaths[index] }))
            .filter(({ file }) => /\.html?$/i.test(file.name));

        if (htmlFiles.length === 0) {
            toast.error(t.html_cleaner.step_1_subtitle);
            return;
        }

        const nextFiles = htmlFiles.map(({ file }) => file);
        const nextPaths = htmlFiles.map(({ path }) => path);
        setSelectedFiles(nextFiles);
        setRelativePaths(nextPaths);
        setPaths(nextPaths);
        await analyze(nextFiles, nextPaths);
    };

    const analyze = async (sourceFiles?: File[], sourcePaths?: string[]) => {
        if (activeMode === "paste") {
            await handlePasteClean();
            return;
        }

        const fs = sourceFiles || selectedFiles;
        const rels = sourcePaths || relativePaths;
        if (fs.length === 0) return;

        const tId = toast.loading(t.common.loading);
        setLoading(true);
        try {
            const data = await apiClient.webHtmlAnalyze(fs, rels, options as any);
            setFiles(data.files);
            toast.success(t.common.success, { id: tId });
        } catch (err: any) {
            toast.error(err.message, { id: tId });
        } finally {
            setLoading(false);
        }
    };

    const executeClean = async () => {
        if (files.length === 0 || selectedFiles.length === 0) return;
        const tId = toast.loading(t.common.loading);
        setLoading(true);
        try {
            const blob = await apiClient.webHtmlExecute(selectedFiles, relativePaths, options as any);
            downloadBlob(blob, "cleaned-html.zip");
            toast.success(t.common.success, { id: tId });
            setPaths([]);
            setSelectedFiles([]);
            setRelativePaths([]);
            setFiles([]);
        } catch (err: any) {
            toast.error(err.message, { id: tId });
        } finally {
            setLoading(false);
        }
    };


    if (!mounted) return null;

    return (
        <PageWrapper maxWidth="max-w-[1600px]">
            <SectionHeader
                title={t.html_cleaner.title}
                highlight={t.html_cleaner.highlight}
                subtitle={t.html_cleaner.subtitle}
            />

            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Mode Selector Tabs */}
                <div className="flex justify-center p-1 bg-white/5 rounded-2xl w-fit mx-auto border border-white/5">
                    <button
                        onClick={() => setActiveMode("file")}
                        className={cn(
                            "px-10 py-3 rounded-xl text-sm font-bold transition-all",
                            activeMode === "file" ? "bg-blue-600 text-white shadow-xl" : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        {t.html_cleaner.file_mode}
                    </button>
                    <button
                        onClick={() => setActiveMode("paste")}
                        className={cn(
                            "px-10 py-3 rounded-xl text-sm font-bold transition-all",
                            activeMode === "paste" ? "bg-blue-600 text-white shadow-xl" : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        {t.html_cleaner.paste_mode}
                    </button>
                </div>

                {/* Section 1: Inputs */}
                {activeMode === "file" ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4">
                            <GlassCard hoverable onClick={() => browse("input")} className="border-dashed border-blue-500/20">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-500/20 p-3 rounded-xl scale-110">
                                        <FileCode className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white uppercase tracking-tight">{t.html_cleaner.step_1_source}</h3>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">{t.html_cleaner.step_1_subtitle}</p>
                                    </div>
                                </div>
                                {paths.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-blue-400 font-mono">
                                        • {t.html_cleaner.files_selected.replace("{count}", paths.length.toString())}
                                    </div>
                                )}
                            </GlassCard>

                            <GlassCard hoverable onClick={() => browse("output")} className="border-dashed border-emerald-500/20">
                                <div className="flex items-center gap-4">
                                    <div className="bg-emerald-500/20 p-3 rounded-xl scale-110">
                                        <Folder className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white uppercase tracking-tight">{t.html_cleaner.step_2_dest}</h3>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider text-nowrap truncate max-w-[200px]">
                                            {outputDir || "ZIP download"}
                                        </p>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* File Mode Preview - REPOSITIONED HERE */}
                        {files.length > 0 && (
                            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                                        <h2 className="text-xl font-bold text-white tracking-tight">
                                            {t.html_cleaner.preview_title.replace("{count}", files.length.toString())}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={executeClean}
                                        disabled={loading}
                                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600 hover:to-indigo-600 text-blue-400 hover:text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] border border-blue-500/30 transition-all active:scale-95 disabled:opacity-30"
                                    >
                                        {loading ? t.common.loading : t.html_cleaner.save_all}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {files.map((file, idx) => (
                                        <GlassCard key={idx} className="p-0 border-white/5 overflow-hidden group">
                                            <div className="flex justify-between items-center p-5 border-b border-white/5 bg-white/[0.02]">
                                                <div className="flex items-center gap-4 truncate">
                                                    <div className="bg-blue-500/10 p-2 rounded-lg">
                                                        <FileCode className="w-5 h-5 text-blue-400" />
                                                    </div>
                                                    <span className="font-mono text-sm text-gray-200 truncate">{file.filename}</span>
                                                </div>
                                                <div className="flex gap-6 text-xs font-mono shrink-0 pr-2">
                                                    <span className="text-gray-500">{t.html_cleaner.original_size}: {formatSize(file.original_size)}</span>
                                                    <span className="text-emerald-500 font-bold">{t.html_cleaner.new_size}: {formatSize(file.cleaned_size)}</span>
                                                </div>
                                            </div>

                                            <div className="h-[500px] overflow-hidden">
                                                <CodeMirror
                                                    value={file.preview}
                                                    height="500px"
                                                    theme={oneDark}
                                                    extensions={[html()]}
                                                    readOnly={true}
                                                    className="text-xs"
                                                />
                                            </div>
                                        </GlassCard>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-top-4 items-stretch">
                        <div className="space-y-4 flex flex-col">
                            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest ml-1">{t.html_cleaner.original_content}</h3>
                            <GlassCard className="p-0 border-white/5 overflow-hidden flex flex-col h-[600px]">
                                <div className="flex justify-between items-center p-5 border-b border-white/5 bg-white/[0.02]">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-500/10 p-2 rounded-lg">
                                            <FileCode className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <span className="font-mono text-sm text-gray-200 block">RichText_Input.doc</span>
                                    </div>
                                </div>
                                <div className="quill-dark flex-1 overflow-hidden bg-black/20">
                                    <ReactQuill
                                        theme="snow"
                                        value={pastedText}
                                        onChange={setPastedText}
                                        modules={quillModules}
                                        placeholder={t.html_cleaner.placeholder_paste}
                                        className="h-full flex flex-col"
                                    />
                                </div>
                            </GlassCard>
                        </div>

                        <div className="space-y-4 flex flex-col">
                            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest ml-1">{t.html_cleaner.clean_result}</h3>
                            <GlassCard className="p-0 border-white/5 overflow-hidden flex flex-col h-[600px]">
                                <div className="flex justify-between items-center p-5 border-b border-white/5 bg-white/[0.02]">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-emerald-500/10 p-2 rounded-lg">
                                            <Check className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <span className="font-mono text-sm text-gray-200 block">Cleaned_Result.html</span>
                                            {cleanedText && (
                                                <div className="flex gap-3 text-[10px] font-mono text-gray-500 mt-0.5">
                                                    <span>{t.html_cleaner.original_size}: {formatSize(pastedText.length)}</span>
                                                    <span className="text-emerald-500 font-bold">{t.html_cleaner.new_size}: {formatSize(cleanedText.length)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {cleanedText && (
                                        <button onClick={copyToClipboard} className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                                            <Copy className="w-3 h-3" /> {t.common.copy_result}
                                        </button>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden bg-black/40">
                                    <CodeMirror
                                        value={cleanedText}
                                        height="100%"
                                        theme={oneDark}
                                        extensions={[html()]}
                                        onChange={(value) => setCleanedText(value)}
                                        placeholder={t.html_cleaner.placeholder_result}
                                        className="text-sm h-full"
                                    />
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                )}

                {/* Section 2: Domain Configuration */}
                <GlassCard className="border-white/5 py-6 px-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex items-center gap-4 min-w-[240px]">
                            <div className="bg-blue-500/10 p-3 rounded-2xl">
                                <Link className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white tracking-tight">SEO Link Control</h3>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Tự động gắn Target / Rel</p>
                            </div>
                        </div>
                        <div className="flex-1 w-full relative group">
                            <input
                                type="text"
                                value={options.target_domain}
                                onChange={(e) => setOptions(prev => ({ ...prev, target_domain: e.target.value }))}
                                placeholder={t.html_cleaner.domain_placeholder}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                                <span className="text-[10px] font-bold text-blue-500/50 uppercase tracking-tighter">Your Domain</span>
                            </div>
                        </div>
                    </div>
                    <p className="mt-4 text-[11px] text-gray-500 leading-relaxed italic ml-1">
                        {t.html_cleaner.seo_note}
                    </p>
                </GlassCard>


                {/* Section 3: Cleaning Preferences */}
                <GlassCard className="border-white/5 shadow-2xl overflow-visible">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-white/5 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-500/10 p-2 rounded-lg">
                                <Settings className="w-5 h-5 text-amber-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight">{t.html_cleaner.config_title}</h3>
                        </div>
                        <button
                            onClick={() => analyze()}
                            disabled={loading || (activeMode === "paste" && !pastedText) || (activeMode === "file" && paths.length === 0)}
                            className="bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest px-6 py-2 rounded-xl border border-white/10 transition-all flex items-center gap-2 disabled:opacity-30"
                        >
                            <Zap className="w-3 h-3" /> {activeMode === "paste" ? t.common.clean_now : t.html_cleaner.update_preview}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { key: "remove_scripts_styles" },
                            { key: "remove_comments" },
                            { key: "remove_attributes" },
                            { key: "remove_classes_ids" },
                            { key: "remove_inline_styles" },
                            { key: "remove_all_tags" },
                            { key: "remove_extra_whitespace" },
                            { key: "remove_spans" },
                            { key: "remove_empty_tags" },
                            { key: "remove_successive_nbsp" },
                            { key: "remove_tags_with_nbsp" },
                            { key: "remove_links" },
                            { key: "remove_images" },
                            { key: "remove_tables" },
                            { key: "replace_tables_with_divs" },
                            { key: "prettify" },
                        ].map((opt) => (
                            <label
                                key={opt.key}
                                className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] transition-all cursor-pointer group border border-transparent hover:border-white/5"
                            >
                                <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{t.html_cleaner.options[opt.key as keyof typeof t.html_cleaner.options]}</span>
                                <div
                                    onClick={(e) => { e.preventDefault(); toggleOption(opt.key as any); }}
                                    className={cn(
                                        "w-8 h-4 rounded-full transition-all relative shrink-0",
                                        options[opt.key as keyof typeof options] ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-white/10"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all",
                                        options[opt.key as keyof typeof options] ? "left-4" : "left-0.5"
                                    )} />
                                </div>
                            </label>
                        ))}
                    </div>
                </GlassCard>

            </div>
        </PageWrapper>
    );
}

