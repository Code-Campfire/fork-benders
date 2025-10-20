import './globals.css';
import AuthProvider from '../components/auth/AuthProvider';

export const metadata = {
    title: 'Bible Learning App',
    description: 'Learn and memorize scripture',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
