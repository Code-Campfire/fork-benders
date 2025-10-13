import './globals.css';
import '../styles/mobile.css';

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
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
