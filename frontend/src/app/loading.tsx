export default function Loading() {
    return (
        <main className="flex-1 pt-32 pb-24 px-6 md:px-12 flex flex-col items-center font-sans">
            <div className="w-full max-w-6xl space-y-9 animate-pulse">
                <div className="space-y-3 text-center">
                    <div className="mx-auto h-9 w-72 rounded-xl bg-white/[0.08]" />
                    <div className="mx-auto h-4 w-[420px] max-w-full rounded-lg bg-white/[0.05]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[0, 1].map((item) => (
                        <div
                            key={item}
                            className="h-44 rounded-3xl border border-white/10 bg-white/[0.035]"
                        >
                            <div className="flex h-full flex-col items-center justify-center gap-4">
                                <div className="h-14 w-14 rounded-full bg-white/[0.08]" />
                                <div className="h-5 w-40 rounded-lg bg-white/[0.07]" />
                                <div className="h-3 w-56 rounded bg-white/[0.04]" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-2 h-[50px] rounded-xl bg-white/[0.06]" />
                        <div className="h-[50px] rounded-xl bg-white/[0.06]" />
                        <div className="h-[50px] rounded-xl bg-white/[0.06]" />
                    </div>
                    <div className="h-[50px] rounded-xl bg-white/[0.06]" />
                    <div className="flex gap-4">
                        <div className="h-5 w-36 rounded bg-white/[0.05]" />
                        <div className="h-5 w-48 rounded bg-white/[0.05]" />
                        <div className="h-5 w-56 rounded bg-white/[0.05]" />
                    </div>
                    <div className="h-24 rounded-xl border border-white/10 bg-black/20" />
                </div>
            </div>
        </main>
    );
}
