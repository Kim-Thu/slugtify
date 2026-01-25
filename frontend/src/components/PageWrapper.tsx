import { clsx, type ClassValue } from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface PageWrapperProps {
    children: React.ReactNode;
    className?: string;
    maxWidth?: string;
}

export const PageWrapper = ({
    children,
    className,
    maxWidth = "max-w-4xl"
}: PageWrapperProps) => {
    return (
        <main className={cn(
            "flex-1 pt-32 pb-24 px-6 md:px-12 flex flex-col items-center animate-in fade-in duration-700 font-sans selection:bg-blue-500/30",
            className
        )}>
            <div className={cn("w-full space-y-9", maxWidth)}>
                {children}
            </div>
        </main>
    );
};
