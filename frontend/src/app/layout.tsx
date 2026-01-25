import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ScrollToTop } from "@/components/ScrollToTop";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "react-quill/dist/quill.snow.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Slugify Bulk Renamer",
    description: "Modern file renaming tool",
};

import { LanguageProvider } from "@/providers/LanguageProvider";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <LanguageProvider>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            className: 'glass-toast',
                            style: {
                                background: 'rgba(15, 23, 42, 0.8)',
                                color: '#fff',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                padding: '12px 20px',
                                fontSize: '14px',
                                fontWeight: '500',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#10b981',
                                    secondary: '#fff',
                                },
                                style: {
                                    border: '1px solid rgba(16, 185, 129, 0.2)',
                                }
                            },
                            error: {
                                iconTheme: {
                                    primary: '#ef4444',
                                    secondary: '#fff',
                                },
                                style: {
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                }
                            }
                        }}
                    />
                    <Header />
                    {children}
                    <Footer />
                    <ScrollToTop />
                </LanguageProvider>
            </body>
        </html>
    );
}
