"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/utils/cn";

export const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center bg-white/5 p-1 rounded-full border border-white/10">
            <button
                onClick={() => setLanguage('vi')}
                className={cn(
                    "px-3 py-1 text-[10px] font-bold rounded-full transition-all uppercase tracking-tighter",
                    language === 'vi' ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                )}
            >
                VN
            </button>
            <button
                onClick={() => setLanguage('en')}
                className={cn(
                    "px-3 py-1 text-[10px] font-bold rounded-full transition-all uppercase tracking-tighter",
                    language === 'en' ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                )}
            >
                EN
            </button>
        </div>
    );
};
