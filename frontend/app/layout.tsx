import type { Metadata } from 'next';
import React from 'react';
import './globals.css';

/* globals.css - Imports Tailwind CSS throughout your whole app -- add styling within any page without adding imports. */

export const metadata: Metadata = {
    title: 'Bible Learning App',
    description: 'Learn and memorize scripture',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
