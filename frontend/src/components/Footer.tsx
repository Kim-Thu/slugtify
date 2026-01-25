"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { Heart, Zap } from "lucide-react";
import Link from "next/link";

export const Footer = () => {
    const { t } = useLanguage();
    return (
        <footer className="w-full glass border-t border-white/10 mt-24">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            <Zap className="w-6 h-6 text-blue-400 fill-current" />
                            <span className="text-2xl font-bold tracking-tighter text-white">Slugify<span className="text-blue-400">Master</span></span>
                        </div>
                        <p className="text-gray-400 max-w-sm leading-relaxed">
                            {t.footer.description}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">{t.footer.product}</h4>
                        <ul className="space-y-2 text-sm text-gray-400 font-light">
                            <li><Link href="/" className="hover:text-blue-400 transition-colors cursor-pointer">{t.header.rename}</Link></li>
                            <li><Link href="/html-cleaner" className="hover:text-blue-400 transition-colors cursor-pointer">{t.header.html_cleaner}</Link></li>
                            <li><Link href="/guide" className="hover:text-blue-400 transition-colors cursor-pointer">{t.header.guide}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">{t.footer.connect}</h4>
                        <ul className="space-y-2 text-sm text-gray-400 font-light">
                            <li><a href="https://github.com/Kim-Thu" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Github</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Twitter</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Discord</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 uppercase tracking-widest font-medium">
                    <p>© 2026 SlugifyMaster. {t.footer.rights}</p>
                    <p className="flex items-center gap-1.5">
                        {t.footer.made_with} <Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> by <span className="text-white">Kim Thu</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};
