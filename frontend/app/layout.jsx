import './globals.css';
import '../styles/mobile.css';

import OfflineBanner from '../components/OfflineBanner';
import AuthProvider from '../components/auth/AuthProvider';
import { DBProvider } from '../lib/DBProvider';

export const metadata = {
    title: 'Bible Learning App',
    description: 'Learn and memorize scripture',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Bible Study',
    },
    icons: {
        apple: '/icons/manifest-icon-192.maskable.png',
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover', // For iOS safe areas
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <DBProvider>
                        <OfflineBanner />
                        <div style={{ paddingTop: 'var(--banner-height, 0)' }}>
                            {children}
                        </div>
                    </DBProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
