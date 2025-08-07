// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: {
        default: 'OnePercent - Improve 1% Every Day',
        template: '%s | OnePercent',
    },
    description: 'Track your skills, set goals, and achieve consistent growth. Improve yourself by 1% every day.',
    keywords: ['skill tracking', 'personal growth', 'productivity', 'self improvement', 'goals'],
    authors: [{ name: 'OnePercent Team' }],
    creator: 'OnePercent',
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: '/',
        title: 'OnePercent - Improve 1% Every Day',
        description: 'Track your skills, set goals, and achieve consistent growth.',
        siteName: 'OnePercent',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'OnePercent - Improve 1% Every Day',
        description: 'Track your skills, set goals, and achieve consistent growth.',
        creator: '@onepercent',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-verification-code',
    },
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={cn(
            inter.className,
            "min-h-screen bg-white font-sans antialiased"
        )}>
        <AuthProvider>
                <div className="relative flex min-h-screen flex-col">
                    <Header />
                    <main className="flex-1">
                        {children}
                    </main>
                    <Footer />
                </div>
        </AuthProvider>
        </body>
        </html>
    );
}
