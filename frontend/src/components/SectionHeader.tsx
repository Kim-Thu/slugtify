import { cn } from "@/utils/cn";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    highlight?: string;
    className?: string;
}

export const SectionHeader = ({
    title,
    subtitle,
    highlight,
    className
}: SectionHeaderProps) => {
    return (
        <div className={cn("text-center space-y-4", className)}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-tight">
                {title}{" "}
                {highlight && (
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                        {highlight}
                    </span>
                )}
            </h1>
            {subtitle && (
                <p className="text-gray-400 text-lg md:text-xl font-light max-w-2xl mx-auto">
                    {subtitle}
                </p>
            )}
        </div>
    );
};
