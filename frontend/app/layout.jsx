import './globals.css';
import '../styles/mobile.css';

import { DBProvider } from '../lib/DBProvider';

export const metadata = {
    title: 'Bible Learning App',
    description: 'Learn and memorize scripture',
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 5,
        userScalable: true,
        viewportFit: 'cover', // For iOS safe areas
    },
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

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <DBProvider>{children}</DBProvider>
            </body>
        </html>
    );
}
