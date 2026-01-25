"use client";

import { LanguageContext } from "@/providers/LanguageProvider";
import { useContext } from "react";

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
