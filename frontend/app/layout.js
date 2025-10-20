import './globals.css';

export const metadata = {
    title: 'Bible Learning App',
    description: 'Learn and memorize scripture',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
