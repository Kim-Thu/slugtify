import { cn } from "@/utils/cn";
import React from "react";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
}

export const GlassCard = ({
    children,
    className,
    onClick,
    hoverable = false
}: GlassCardProps) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "glass-card p-6",
                !hoverable && "hover:bg-white/5 hover:border-white/10 hover:shadow-none cursor-default",
                className
            )}
        >
            {children}
        </div>
    );
};
