"use client";

import { GlassCard } from "@/components/GlassCard";
import { PageWrapper } from "@/components/PageWrapper";
import { SectionHeader } from "@/components/SectionHeader";
import { useLanguage } from "@/hooks/useLanguage";
import { Code2, Server, Shield, Terminal } from "lucide-react";

export default function DocsPage() {
    const { t } = useLanguage();

    const sections = [
        {
            title: t.docs.architecture.title,
            icon: <Server className="w-6 h-6 text-blue-400" />,
            content: t.docs.architecture.content
        },
        {
            title: t.docs.cleaning_logic.title,
            icon: <Code2 className="w-6 h-6 text-emerald-400" />,
            content: t.docs.cleaning_logic.content
        },
        {
            title: t.docs.security.title,
            icon: <Shield className="w-6 h-6 text-amber-400" />,
            content: t.docs.security.content
        }
    ];

    return (
        <PageWrapper maxWidth="max-w-[1200px]">
            <SectionHeader
                title={t.docs.title}
                highlight={t.docs.highlight}
                subtitle={t.docs.subtitle}
            />

            <div className="space-y-9 mt-16">
                {sections.map((section, idx) => (
                    <GlassCard key={idx} className="flex flex-col md:flex-row gap-8 items-start p-8">
                        <div className="bg-white/5 p-4 rounded-2xl flex-shrink-0">
                            {section.icon}
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-white tracking-tight">{section.title}</h3>
                            <p className="text-gray-400 leading-relaxed font-light text-lg border-l-2 border-blue-500/30 pl-6 italic">
                                {section.content}
                            </p>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <div className="mt-16 space-y-8">
                <h3 className="text-3xl font-black text-white flex items-center gap-4 ml-2">
                    <Terminal className="w-8 h-8 text-emerald-400" /> {t.docs.api_structure}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                        <GlassCard className="h-full bg-black/40 border-white/5 p-8 group-hover:border-emerald-500/30 transition-all">
                            <div className="flex items-center justify-between mb-6">
                                <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold tracking-widest uppercase">POST</span>
                                <code className="text-gray-500 text-xs">/analyze</code>
                            </div>
                            <p className="text-gray-300 mb-6 font-light leading-relaxed">
                                {t.docs.api_analyze}
                            </p>
                            <div className="bg-black/60 p-4 rounded-xl border border-white/5 font-mono text-xs text-blue-300/80">
                                {"{ \"paths\": string[], \"options\": {} }"}
                            </div>
                        </GlassCard>
                    </div>

                    <div className="group">
                        <GlassCard className="h-full bg-black/40 border-white/5 p-8 group-hover:border-blue-500/30 transition-all">
                            <div className="flex items-center justify-between mb-6">
                                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-xs font-bold tracking-widest uppercase">POST</span>
                                <code className="text-gray-500 text-xs">/execute</code>
                            </div>
                            <p className="text-gray-300 mb-6 font-light leading-relaxed">
                                {t.docs.api_execute}
                            </p>
                            <div className="bg-black/60 p-4 rounded-xl border border-white/5 font-mono text-xs text-blue-300/80">
                                {"{ \"path\": string, \"options\": {}, \"target\": string }"}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
