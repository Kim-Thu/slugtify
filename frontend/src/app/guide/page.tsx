"use client";

import { GlassCard } from "@/components/GlassCard";
import { PageWrapper } from "@/components/PageWrapper";
import { SectionHeader } from "@/components/SectionHeader";
import { useLanguage } from "@/hooks/useLanguage";
import { Book, Layout, ShieldCheck, Sparkles, Zap } from "lucide-react";

export default function GuidePage() {
    const { t } = useLanguage();

    const icons = [
        <Book key="0" className="w-6 h-6 text-blue-400" />,
        <Layout key="1" className="w-6 h-6 text-emerald-400" />,
        <Zap key="2" className="w-6 h-6 text-amber-400" />,
        <ShieldCheck key="3" className="w-6 h-6 text-purple-400" />
    ];

    return (
        <PageWrapper maxWidth="max-w-[1200px]">
            <SectionHeader
                title={t.guide.title}
                highlight={t.guide.highlight}
                subtitle={t.guide.subtitle}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
                {t.guide.steps.map((step: any, idx: number) => (
                    <GlassCard key={idx} hoverable className="group p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                            {icons[idx]}
                        </div>
                        <div className="bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-500/10 transition-all duration-500">
                            {icons[idx]}
                        </div>
                        <h3 className="text-2xl font-black text-white mb-4 tracking-tight">
                            <span className="text-blue-500/50 mr-3">0{idx + 1}</span>
                            {step.title}
                        </h3>
                        <p className="text-gray-400 leading-relaxed font-light text-lg">
                            {step.description}
                        </p>
                    </GlassCard>
                ))}
            </div>

            <div className="mt-20">
                <GlassCard className="bg-gradient-to-br from-blue-600/10 via-transparent to-emerald-600/5 border-white/5 p-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="bg-blue-500/20 p-3 rounded-xl">
                            <Sparkles className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-3xl font-black text-white tracking-tight">
                            {t.guide.tips_title}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {t.guide.tips.map((tip: string, idx: number) => (
                            <div key={idx} className="space-y-4">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-blue-400 border border-white/5">
                                    {idx + 1}
                                </div>
                                <p className="text-gray-300 font-light leading-relaxed">
                                    {tip}
                                </p>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </PageWrapper>
    );
}
