"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { Github, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const Header = () => {
    const { t, language } = useLanguage();
    const pathname = usePathname();
    const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

    useEffect(() => {
        setNavigatingTo(null);
    }, [pathname]);

    const navItems = [
        { href: "/", label: t.header.rename },
        { href: "/html-cleaner", label: t.header.html_cleaner },
        { href: "/image-converter", label: language === "vi" ? "Đổi định dạng ảnh" : "Image Converter" },
        { href: "/guide", label: t.header.guide },
        { href: "/docs", label: t.header.docs },
    ];

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

    const handleNavigate = (href: string) => {
        if (!isActive(href)) setNavigatingTo(href);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
            {navigatingTo && (
                <div className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden bg-blue-500/10">
                    <div className="h-full w-1/3 animate-[route-loading_0.9s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500" />
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link
                    href="/"
                    onClick={() => handleNavigate("/")}
                    className="flex items-center gap-2 group cursor-pointer"
                >
                    <div className="bg-blue-500 rounded-lg p-1.5 group-hover:rotate-12 transition-transform">
                        <Zap className="w-5 h-5 text-white fill-current" />
                    </div>
                    <span className="text-xl font-bold tracking-tighter text-white">
                        Slugify<span className="text-blue-400">Master</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        const pending = navigatingTo === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => handleNavigate(item.href)}
                                aria-current={active ? "page" : undefined}
                                className={
                                    "relative rounded-lg px-3 py-2 transition-all duration-200 " +
                                    (active
                                        ? "bg-blue-500/10 text-blue-300"
                                        : "text-gray-400 hover:bg-white/[0.05] hover:text-white")
                                }
                            >
                                <span className={pending ? "opacity-70" : ""}>{item.label}</span>
                                {active && (
                                    <span className="absolute inset-x-3 -bottom-[13px] h-[2px] rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.65)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <a
                        href="https://github.com/Kim-Thu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <Github className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </header>
    );
};
