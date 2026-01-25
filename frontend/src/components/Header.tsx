"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { Github, Zap } from "lucide-react";
import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const Header = () => {
    const { t } = useLanguage();
    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                    <div className="bg-blue-500 rounded-lg p-1.5 group-hover:rotate-12 transition-transform">
                        <Zap className="w-5 h-5 text-white fill-current" />
                    </div>
                    <span className="text-xl font-bold tracking-tighter text-white">Slugify<span className="text-blue-400">Master</span></span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    <Link href="/" className="hover:text-white transition-colors cursor-pointer">{t.header.rename}</Link>
                    <Link href="/html-cleaner" className="hover:text-white transition-colors cursor-pointer">{t.header.html_cleaner}</Link>
                    <Link href="/guide" className="hover:text-white transition-colors cursor-pointer">{t.header.guide}</Link>
                    <Link href="/docs" className="hover:text-white transition-colors cursor-pointer">{t.header.docs}</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <a href="https://github.com/Kim-Thu" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Github className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </header>
    );
};
